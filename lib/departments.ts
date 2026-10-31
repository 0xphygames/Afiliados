// Departments (setores) used everywhere: product form, article form, Achadinhos and blog sidebars.
// One list keeps the admin and the public site in the same classification.
export const DEPARTMENTS: string[] = [
  'Vestuário',
  'Suplementos',
  'Musculação',
  'Natal',
  'Dia das Crianças',
  'Guloseimas',
  'Casa & Decoração',
  'Beleza & Skincare',
  'Macacão',
  'Calça',
  'Calça Legging',
  'Top',
  'Camiseta',
  'Blusa',
  'Conjunto',
  'Moletom',
  'Cardigan',
  'Colete',
  'Short',
  'Chapéu',
  'Whey Protein',
  'Creatina',
  'Colágeno',
  'Vitaminas',
  'Pré-treino',
  'Aminoácidos',
  'Barra de Proteína',
  'Coqueteleira',
  'Bebidas',
  'Pasta de Amendoim',
  'Hipercalórico',
  'Psyllium',
  'Kit Fitness',
  'Step',
  'Colchonete',
  'Silicone para esteira',
  'Eletrônicos',
];

// Options for a select: the fixed departments, plus any extra name in use (so nothing is lost on edit)
export function departmentOptions(extra: string[] = [], current = ''): string[] {
  const names = [...DEPARTMENTS, ...extra];
  if (current && !names.includes(current)) names.push(current);
  return Array.from(new Set(names.filter(Boolean))).sort((a, b) => a.localeCompare(b, 'pt-BR'));
}
