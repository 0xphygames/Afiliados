import { supabase } from './supabase';
import { TAXONOMY } from './taxonomy';

// Árvore de classificação guardada no banco (tabela taxonomy_nodes).
// Macro e micro são linhas da mesma tabela; a micro aponta para a macro pelo parent_id.

export interface TaxNode {
  id: string;
  kind: 'macro' | 'micro';
  name: string;
  parentId: string | null;
  position: number;
}

export interface TaxMacro {
  node: TaxNode;
  micros: TaxNode[];
}

// Usado se o banco não responder: a mesma árvore que está no código
function fallbackTree(): TaxMacro[] {
  return TAXONOMY.map((d, i) => ({
    node: { id: `local-m-${i}`, kind: 'macro', name: d.name, parentId: null, position: i + 1 },
    micros: d.subcategories.map((s, j) => ({
      id: `local-mi-${i}-${j}`,
      kind: 'micro' as const,
      name: s.name,
      parentId: `local-m-${i}`,
      position: j + 1,
    })),
  }));
}

function toTree(rows: TaxNode[]): TaxMacro[] {
  const byPosition = (a: TaxNode, b: TaxNode) => a.position - b.position || a.name.localeCompare(b.name, 'pt-BR');
  return rows
    .filter((r) => r.kind === 'macro')
    .sort(byPosition)
    .map((m) => ({ node: m, micros: rows.filter((r) => r.kind === 'micro' && r.parentId === m.id).sort(byPosition) }));
}

export function subscribeTaxonomy(
  onSuccess: (tree: TaxMacro[]) => void,
  onError?: (err: Error) => void,
): () => void {
  void supabase
    .from('taxonomy_nodes')
    .select('*')
    .then(({ data, error }) => {
      if (error || !data || data.length === 0) {
        onSuccess(fallbackTree());
        if (error) onError?.(error as unknown as Error);
        return;
      }
      const rows: TaxNode[] = data.map((r) => ({
        id: r.id,
        kind: r.kind,
        name: r.name,
        parentId: r.parent_id || null,
        position: r.position ?? 0,
      }));
      onSuccess(toTree(rows));
    });
  return () => undefined;
}

// How many products use a name in the macro or micro column
async function countUsage(node: TaxNode): Promise<number> {
  const column = node.kind === 'macro' ? 'department' : 'subcategory';
  const { count, error } = await supabase
    .from('products')
    .select('id', { count: 'exact', head: true })
    .eq(column, node.name);
  if (error) throw error;
  return count ?? 0;
}

export async function addMacro(name: string, position: number): Promise<void> {
  const { error } = await supabase.from('taxonomy_nodes').insert({
    id: `m-${Date.now()}`,
    kind: 'macro',
    name: name.trim(),
    parent_id: null,
    position,
  });
  if (error) throw error;
}

export async function addMicro(parentId: string, name: string, position: number): Promise<void> {
  const { error } = await supabase.from('taxonomy_nodes').insert({
    id: `mi-${Date.now()}`,
    kind: 'micro',
    name: name.trim(),
    parent_id: parentId,
    position,
  });
  if (error) throw error;
}

// Renaming also updates every product that uses the old name, so nothing is left unclassified
export async function renameNode(node: TaxNode, newName: string): Promise<void> {
  const name = newName.trim();
  if (!name || name === node.name) return;
  const column = node.kind === 'macro' ? 'department' : 'subcategory';
  const { error: productsError } = await supabase.from('products').update({ [column]: name }).eq(column, node.name);
  if (productsError) throw productsError;
  const { error } = await supabase.from('taxonomy_nodes').update({ name }).eq('id', node.id);
  if (error) throw error;
}

// Deleting is blocked while products still use the name, so no product loses its classification
export async function deleteNode(node: TaxNode, siblingsCount: number): Promise<void> {
  if (node.kind === 'macro' && siblingsCount > 0) {
    throw new Error('Essa macro ainda tem micros. Remova ou mova as micros antes.');
  }
  const used = await countUsage(node);
  if (used > 0) {
    throw new Error(`${used} produto(s) usam "${node.name}". Troque a classificação deles antes de excluir.`);
  }
  const { error } = await supabase.from('taxonomy_nodes').delete().eq('id', node.id);
  if (error) throw error;
}
