import ast
import inspect
from dataclasses import is_dataclass

def check_round(spec, ns, source):
    if spec['type'] == 'classes':
        cls = ns.get(spec['name'])
        assert isinstance(cls, type), 'Define the requested class.'
        assert is_dataclass(cls) == (spec['mode'] == 'dataclass'), 'Use the requested class style.'
        assert isinstance(ns.get('pet'), cls), 'Create an instance named pet.'
        obj = cls()
        types = {'str': str, 'int': int, 'float': float, 'bool': bool}
        custom = {}
        for field in spec['fields']:
            name, kind, default = field
            assert getattr(obj, name, None) == default, 'Check the default for ' + name
            assert getattr(ns['pet'], name, None) == default, 'Use defaults for pet.'
            param = inspect.signature(cls).parameters.get(name)
            assert cls.__annotations__.get(name) == types[kind] or (param and param.annotation == types[kind]), 'Annotate ' + name
            custom[name] = 'rex' if kind == 'str' else False if kind == 'bool' else 12
        other = cls(**custom)
        assert all(getattr(other, k) == v for k,v in custom.items()), 'Allow custom constructor values.'
    elif spec['type'] == 'comprehensions':
        assert any(isinstance(n, ast.ListComp) for n in ast.walk(ast.parse(source))), 'Use a list comprehension.'
        values = spec['values']
        expected = [n for n in values if n > spec['threshold']] if spec['mode'] == 'filter' else [n*n for n in values]
        assert ns.get('result') == expected, 'Check result and its order.'

    elif spec['type'] == 'values':
        check_values(spec, ns)
    else:
        raise AssertionError('Unknown checker.')


def normalized(value):
    from datetime import date, datetime
    from collections import deque
    from argparse import Namespace
    if isinstance(value, Namespace):
        return normalized(vars(value))
    if isinstance(value, (date, datetime)):
        return value.isoformat()
    if isinstance(value, dict):
        return {str(k): normalized(v) for k, v in value.items()}
    if isinstance(value, (set, frozenset)):
        return sorted(normalized(v) for v in value)
    if isinstance(value, (list, tuple, deque)):
        return [normalized(v) for v in value]
    return value


def equal(actual, expected):
    import json
    return json.dumps(normalized(actual), sort_keys=True) == json.dumps(expected, sort_keys=True)


def check_values(spec, ns):
    for name, expected in spec['expected'].items():
        assert name in ns, 'Define ' + name + '.'
        assert equal(ns[name], expected), 'Check ' + name + ' and its value.'
    for case in spec.get('calls', []):
        fn = ns.get(case['name'])
        assert callable(fn), 'Define ' + case['name'] + '.'
        from datetime import date
        args = list(case['args'])
        for index in case.get('dateArgs', []):
            args[index] = date.fromisoformat(args[index])
        assert equal(fn(*args), case['expected']), 'Check ' + case['name'] + ' with other inputs.'
    for case in spec.get('raises', []):
        fn = ns.get(case['name'])
        assert callable(fn), 'Define ' + case['name'] + '.'
        try:
            fn(*case['args'])
        except ValueError:
            pass
        else:
            raise AssertionError('Raise ValueError for invalid input.')
    if 'resultFrom' in spec:
        call = spec['resultFrom']
        expected = ns[call['name']](*(ns[arg] for arg in call['args']))
        assert 'result' in ns and equal(ns['result'], normalized(expected)), 'Assign the function result to result.'
    if 'jsonExpected' in spec:
        import json
        assert isinstance(ns.get('result'), str), 'Assign JSON text to result.'
        assert equal(json.loads(ns['result']), spec['jsonExpected']), 'Check the encoded JSON data.'
