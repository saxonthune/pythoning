let cancel: (() => void) | undefined;
export function stopRound() { cancel?.(); }
const names = ['pyodide.js','pyodide.asm.js','pyodide.asm.wasm','python_stdlib.zip','pyodide-lock.json'];
let assets: Promise<Record<string, ArrayBuffer>> | undefined;
function loadAssets() {
  return assets ??= Promise.all([...names.map(async n => {
    const r = await fetch(`/runtime/${n}`); if (!r.ok) throw Error('Runtime unavailable'); return [n, await r.arrayBuffer()] as const;
  }), fetch('/microgame-checker.py').then(async r => ['checker', await r.arrayBuffer()] as const)]).then(Object.fromEntries).catch(e => {assets = undefined; throw e;});
}
export async function runMicrogame(spec: unknown, source: string): Promise<string> {
  if (source.length > 20000) throw Error('Answer is too long.');
  stopRound();
  return new Promise((resolve, reject) => {
    const frame = document.createElement('iframe'); frame.hidden = true; frame.sandbox.add('allow-scripts');
    const channel = new MessageChannel(); let timer: ReturnType<typeof setTimeout>;
    function finish(error?: string, output?: string) { clearTimeout(timer); frame.remove(); channel.port1.close(); cancel = undefined; error ? reject(Error(error)) : resolve(output || ''); }
    cancel = () => finish('Execution stopped.');
    timer = setTimeout(() => finish('Execution timed out. Try a smaller operation.'), 30000);
    const workerSource = `self.onmessage = async ({data}) => {
      try {
        const files = data.assets;
        const text = n => new TextDecoder().decode(files[n]);
        self.fetch = async input => {
          const name = String(input).split('/').pop();
          if (!Object.hasOwn(files, name)) throw Error('Network access blocked.');
          return new Response(files[name], {headers: {'Content-Type': name.endsWith('.wasm') ? 'application/wasm' : 'application/octet-stream'}});
        };
        const originalImport = self.importScripts.bind(self);
        self.importScripts = (...urls) => { for (const url of urls) {const name = String(url).split('/').pop(); if (!['pyodide.js','pyodide.asm.js'].includes(name)) throw Error('Import blocked.'); originalImport(URL.createObjectURL(new Blob([files[name]], {type:'text/javascript'})));} };
        importScripts('pyodide.js');
        const py = await loadPyodide({indexURL:'https://runtime.invalid/', jsglobals: {}});
        let output = ''; py.setStdout({batched: s => {output = (output + s + '\\n').slice(0,16000);}}); py.setStderr({batched: s => {output = (output + s + '\\n').slice(0,16000);}});
        py.globals.set('source', data.source); py.globals.set('spec_json', JSON.stringify(data.spec));
        py.runPython(text('checker'));
        py.runPython('import json\\nspec = json.loads(spec_json)\\nns = {"__name__": "__main__"}\\nexec(compile(source, "<answer>", "exec"), ns)\\ncheck_round(spec, ns, source)');
        self.postMessage({output});
      } catch(e) {self.postMessage({error: String(e)});}
    };`;
    frame.srcdoc = `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline' blob: 'wasm-unsafe-eval'; worker-src blob:; connect-src 'none'"><script>onmessage = e => {if(e.source !== parent || !e.ports[0]) return; const port=e.ports[0]; const w=new Worker(URL.createObjectURL(new Blob([e.data.worker],{type:'text/javascript'})));w.onmessage=x=>{port.postMessage(x.data);w.terminate()};w.onerror=()=>port.postMessage({error:'Runner failed'});w.postMessage(e.data.payload)}<\/script>`;
    channel.port1.onmessage = e => { const v=e.data; if (v && typeof v.error === 'string') finish(v.error.slice(0,16000)); else if(v && typeof v.output === 'string') finish(undefined,v.output.slice(0,16000)); else finish('Invalid runner response.'); };
    frame.onload = async () => { try {const loaded = await loadAssets(); if(frame.isConnected) frame.contentWindow!.postMessage({worker:workerSource,payload:{assets:loaded,spec,source}}, '*', [channel.port2]);} catch(e) {finish(String(e));} };
    document.body.append(frame);
  });
}
