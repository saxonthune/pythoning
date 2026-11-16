import test from 'node:test';
import assert from 'node:assert/strict';
import { EditorState } from '@codemirror/state';
import { history, undo, redo } from '@codemirror/commands';
import { protectedCode, codeRegions, loadRegions, roundDocument } from '../src/lib/protected-code.ts';

function setup() {
  const initial = roundDocument([
    {kind: 'fixed', text: 'x = 1'},
    {kind: 'editable', text: '\n\n', solution: 'y = x + 1'},
    {kind: 'fixed', text: 'print(y)'},
    {kind: 'editable', text: '\n\n', solution: 'z = y + 1'},
    {kind: 'fixed', text: 'print(z)'},
  ]);
  return EditorState.create({doc: initial.doc, extensions: [protectedCode, history()]}).update({effects: loadRegions.of(initial.regions)}).state;
}

test('alternating regions preserve fixed code and at least one editable line', () => {
  let state = setup();
  const initial = state.doc.toString();
  for (const changes of [{from: 0, to: 1, insert: 'X'}, {from: 0, to: state.doc.length, insert: ''}]) {
    state = state.update({changes}).state;
    assert.equal(state.doc.toString(), initial);
  }
  for (let i of [1, 3]) {
    const region = state.field(codeRegions)[i];
    state = state.update({changes: {from: region.from, to: region.to, insert: ''}}).state;
    assert.equal(state.field(codeRegions)[i].from, state.field(codeRegions)[i].to);
    const before = state.doc.toString();
    const pos = state.field(codeRegions)[i].from;
    state = state.update({changes: {from: pos - 1, to: pos, insert: ''}}).state;
    assert.equal(state.doc.toString(), before);
  }
  assert.equal(state.doc.toString(), 'x = 1\n\nprint(y)\n\nprint(z)');
});

test('multiline editing, multiple changes, and undo retain region boundaries', () => {
  let state = setup();
  const before = state.doc.toString();
  const changes = state.field(codeRegions).filter(r => r.kind === 'editable').map(r => ({from: r.from, to: r.to, insert: r.solution}));
  state = state.update({changes}).state;
  assert.equal(state.doc.toString(), 'x = 1\ny = x + 1\nprint(y)\nz = y + 1\nprint(z)');
  assert.ok(undo({state, dispatch: tr => { state = tr.state; }}));
  assert.equal(state.doc.toString(), before);
  for (const r of state.field(codeRegions).filter(r => r.kind === 'fixed')) assert.equal(state.doc.sliceString(r.from, r.to), r.text);
});


test('an emptied input supports paste, undo, and redo without moving fixed boundaries', () => {
  let state = setup();
  let region = state.field(codeRegions)[1];
  state = state.update({changes: {from: region.from, to: region.to, insert: ''}}).state;
  region = state.field(codeRegions)[1];
  const minimum = state.doc.toString();
  state = state.update({changes: {from: region.from, insert: 'y = 2\n# next line'}, userEvent: 'input.paste'}).state;
  const pasted = state.doc.toString();
  assert.ok(undo({state, dispatch: tr => {state = tr.state;}}));
  assert.equal(state.doc.toString(), minimum);
  assert.ok(redo({state, dispatch: tr => {state = tr.state;}}));
  assert.equal(state.doc.toString(), pasted);
  for (const fixed of state.field(codeRegions).filter(r => r.kind === 'fixed')) assert.equal(state.doc.sliceString(fixed.from, fixed.to), fixed.text);
});
