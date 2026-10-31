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
    name: 'Vestuário e Moda',
    subcategories: [
      { name: 'Calça comum' },
      { name: 'Calça legging' },
      { name: 'Top' },
      { name: 'Camiseta' },
      { name: 'Blusa' },
      { name: 'Agasalhos' },
      { name: 'Macacão' },
      { name: 'Conjunto' },
      { name: 'Moletom' },
      { name: 'Short' },
    ],
  },
  {
    name: 'Suplementos e Nutrição',
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
      { name: 'Bebidas' },
      { name: 'Outros suplementos' },
    ],
  },
  {
    name: 'Fitness e Treino',
    subcategories: [
      { name: 'Musculação' },
      { name: 'Cardio' },
      { name: 'Kit Fitness' },
      { name: 'Step' },
      { name: 'Colchonete' },
      { name: 'Acessórios de equipamento' },
      { name: 'Coqueteleiras' },
    ],
  },
  {
    name: 'Casa, Beleza e Utilidades',
    subcategories: [
      { name: 'Casa e decoração' },
      { name: 'Beleza e skincare' },
      { name: 'Eletrônicos' },
      { name: 'Acessórios' },
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
  'Calça': ['Vestuário e Moda', 'Calça comum'],
  'Calça Legging': ['Vestuário e Moda', 'Calça legging'],
  'Top': ['Vestuário e Moda', 'Top'],
  'Camiseta': ['Vestuário e Moda', 'Camiseta'],
  'Blusa': ['Vestuário e Moda', 'Blusa'],
  'Cardigan': ['Vestuário e Moda', 'Agasalhos'],
  'Colete': ['Vestuário e Moda', 'Agasalhos'],
  'Moletom': ['Vestuário e Moda', 'Moletom'],
  'Macacão': ['Vestuário e Moda', 'Macacão'],
  'Conjunto': ['Vestuário e Moda', 'Conjunto'],
  'Short': ['Vestuário e Moda', 'Short'],
  'Whey Protein': ['Suplementos e Nutrição', 'Whey Protein'],
  'Barra de Proteína': ['Suplementos e Nutrição', 'Barra de Proteína'],
  'Hipercalórico': ['Suplementos e Nutrição', 'Hipercalórico'],
  'Vitaminas': ['Suplementos e Nutrição', 'Vitaminas'],
  'Creatina': ['Suplementos e Nutrição', 'Creatina'],
  'Colágeno': ['Suplementos e Nutrição', 'Colágeno'],
  'Aminoácidos': ['Suplementos e Nutrição', 'Aminoácidos'],
  'Pré-treino': ['Suplementos e Nutrição', 'Pré-treino'],
  'Super Coffee': ['Suplementos e Nutrição', 'Super Coffee'],
  'Bebidas': ['Suplementos e Nutrição', 'Bebidas'],
  'Eletrônicos': ['Suplementos e Nutrição', 'Pré-treino'],
  'Pasta de Amendoim': ['Suplementos e Nutrição', 'Outros suplementos'],
  'Psyllium': ['Suplementos e Nutrição', 'Outros suplementos'],
  'Musculação': ['Fitness e Treino', 'Musculação'],
  'Kit Fitness': ['Fitness e Treino', 'Kit Fitness'],
  'Step': ['Fitness e Treino', 'Step'],
  'Colchonete': ['Fitness e Treino', 'Colchonete'],
  'Silicone para esteira': ['Fitness e Treino', 'Acessórios de equipamento'],
  'Coqueteleira': ['Fitness e Treino', 'Coqueteleiras'],
  'Chapéu': ['Casa, Beleza e Utilidades', 'Acessórios'],
};
