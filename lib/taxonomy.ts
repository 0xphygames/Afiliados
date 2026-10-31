// Classificação em árvore: macro (departamento) > micro (subcategoria).
// Produtos e artigos usam os mesmos nomes. A coluna `category` atual continua existindo
// durante a migração; `department` e `subcategory` passam a ser a fonte da classificação.

export interface Subcategory {
  name: string;
}

export interface Department {
  name: string;
  subcategories: Subcategory[];
}

export const TAXONOMY: Department[] = [
  {
    name: 'Moda Fitness',
    subcategories: [
      { name: 'Calça comum' },
      { name: 'Calça legging' },
      { name: 'Top' },
      { name: 'Camisetas e Blusas' },
      { name: 'Agasalhos' },
      { name: 'Macacão' },
      { name: 'Conjunto' },
      { name: 'Moletom' },
      { name: 'Short' },
    ],
  },
  {
    name: 'Suplementos',
    subcategories: [
      { name: 'Whey Protein' },
      { name: 'Barra de Proteína' },
      { name: 'Hipercalórico' },
      { name: 'Vitaminas' },
      { name: 'Creatina' },
      { name: 'Colágeno' },
      { name: 'Aminoácidos' },
      { name: 'Pré-treino' },
      { name: 'Super Coffee' },
      { name: 'Bebidas proteicas' },
      { name: 'Outros' },
    ],
  },
  {
    name: 'Equipamentos',
    subcategories: [
      { name: 'Musculação' },
      { name: 'Cardio' },
      { name: 'Kits' },
      { name: 'Step' },
      { name: 'Colchonete' },
      { name: 'Acessórios de equipamento' },
    ],
  },
  {
    name: 'Acessórios',
    subcategories: [
      { name: 'Coqueteleiras' },
      { name: 'Chapéus' },
      { name: 'Eletrônicos' },
    ],
  },
];

export function departmentNames(): string[] {
  return TAXONOMY.map((d) => d.name);
}

export function subcategoriesOf(department: string): string[] {
  return TAXONOMY.find((d) => d.name === department)?.subcategories.map((s) => s.name) ?? [];
}

// Legacy category -> (department, subcategory). Used by the backfill SQL and to check coverage.
export const LEGACY_MAP: Record<string, [string, string]> = {
  'Calça': ['Moda Fitness', 'Calça comum'],
  'Calça Legging': ['Moda Fitness', 'Calça legging'],
  'Top': ['Moda Fitness', 'Top'],
  'Camiseta': ['Moda Fitness', 'Camisetas e Blusas'],
  'Blusa': ['Moda Fitness', 'Camisetas e Blusas'],
  'Cardigan': ['Moda Fitness', 'Agasalhos'],
  'Colete': ['Moda Fitness', 'Agasalhos'],
  'Moletom': ['Moda Fitness', 'Agasalhos'],
  'Macacão': ['Moda Fitness', 'Macacão'],
  'Conjunto': ['Moda Fitness', 'Conjunto'],
  'Short': ['Moda Fitness', 'Short'],
  'Whey Protein': ['Suplementos', 'Whey Protein'],
  'Barra de Proteína': ['Suplementos', 'Barra de Proteína'],
  'Hipercalórico': ['Suplementos', 'Hipercalórico'],
  'Vitaminas': ['Suplementos', 'Vitaminas'],
  'Creatina': ['Suplementos', 'Creatina'],
  'Colágeno': ['Suplementos', 'Colágeno'],
  'Aminoácidos': ['Suplementos', 'Aminoácidos'],
  'Pré-treino': ['Suplementos', 'Pré-treino'],
  'Super Coffee': ['Suplementos', 'Super Coffee'],
  'Bebidas': ['Suplementos', 'Bebidas proteicas'],
  'Eletrônicos': ['Acessórios', 'Eletrônicos'],
  'Pasta de Amendoim': ['Suplementos', 'Outros'],
  'Psyllium': ['Suplementos', 'Outros'],
  'Musculação': ['Equipamentos', 'Musculação'],
  'Kit Fitness': ['Equipamentos', 'Kits'],
  'Step': ['Equipamentos', 'Acessórios de equipamento'],
  'Colchonete': ['Equipamentos', 'Acessórios de equipamento'],
  'Silicone para esteira': ['Equipamentos', 'Acessórios de equipamento'],
  'Coqueteleira': ['Acessórios', 'Coqueteleiras'],
  'Chapéu': ['Acessórios', 'Chapéus'],
};
