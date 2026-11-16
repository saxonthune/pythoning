import { StateEffect, StateField, EditorState, RangeSet } from '@codemirror/state';
import { Decoration, EditorView, GutterMarker, gutterLineClass } from '@codemirror/view';

export interface CodeBlock { kind: 'fixed' | 'editable'; text: string; solution?: string }
export interface CodeRegion extends CodeBlock { from: number; to: number }
export const loadRegions = StateEffect.define<CodeRegion[]>();
export function roundDocument(blocks: CodeBlock[], solved = false) {
  let doc = '';
  const regions = blocks.map(block => {
    if (doc.length) doc += '\n';
    const text = block.kind === 'editable' ? (solved ? block.solution! : block.text) : block.text;
    const from = doc.length;
    doc += text;
    return {...block, from, to: doc.length};
  });
  return {doc, regions};
}
export const codeRegions = StateField.define<CodeRegion[]>({
  create: () => [],
  update(regions, tr) {
    for (const effect of tr.effects) if (effect.is(loadRegions)) return effect.value;
    return regions.map(region => ({...region,
      from: tr.changes.mapPos(region.from, region.kind === 'editable' ? -1 : 1),
      to: tr.changes.mapPos(region.to, region.kind === 'editable' ? 1 : -1),
    }));
  },
  provide: field => EditorView.decorations.from(field, regions => {
    const lines = [];
    for (const region of regions) if (region.kind === 'fixed') {
      let pos = region.from;
      for (const line of region.text.split('\n')) {
        lines.push(Decoration.line({class: 'cm-fixed-code'}).range(pos));
        pos += line.length + 1;
      }
    }
    return Decoration.set(lines, true);
  }),
});
class FixedLine extends GutterMarker { elementClass = 'cm-fixed-code-gutter'; }
const fixedLine = new FixedLine();
const fixedGutters = gutterLineClass.compute([codeRegions], state => {
  const marks = [];
  for (const region of state.field(codeRegions)) if (region.kind === 'fixed') {
    let pos = region.from;
    for (const line of region.text.split('\n')) {
      marks.push(fixedLine.range(pos));
      pos += line.length + 1;
    }
  }
  return RangeSet.of(marks, true);
});
export const protectedCode = [codeRegions, fixedGutters, EditorState.transactionFilter.of(tr => {
  // Only the application can replace the complete round document.
  if (tr.effects.some(effect => effect.is(loadRegions)) || !tr.docChanged) return tr;
  const editable = tr.startState.field(codeRegions).filter(region => region.kind === 'editable');
  let allowed = true;
  tr.changes.iterChangedRanges((from, to) => {
    if (!editable.some(region => from >= region.from && to <= region.to)) allowed = false;
  });
  // Separating newlines are outside editable ranges. Each region therefore
  // always retains a line, even when its complete contents are deleted.
  return allowed ? tr : [];
})];
