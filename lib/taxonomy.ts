// Classificação em árvore: macro (department) > micro (subcategory).
// Produtos e artigos usam os mesmos nomes. A coluna `category` atual é mantida para rollback.

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
      { name: 'Bebidas' },
      { name: 'Outros suplementos' },
    ],
  },
  {
    name: 'Equipamentos',
    subcategories: [
      { name: 'Musculação' },
      { name: 'Cardio' },
      { name: 'Kit Fitness' },
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

// Categoria atual -> [macro, micro]. Usado pela migração de preenchimento.
// Musculação é dividida em Cardio pelo nome do produto (ver a migração).
export const LEGACY_MAP: Record<string, [string, string]> = {
  'Calça': ['Moda Fitness', 'Calça comum'],
  'Calça Legging': ['Moda Fitness', 'Calça legging'],
  'Top': ['Moda Fitness', 'Top'],
  'Camiseta': ['Moda Fitness', 'Camiseta'],
  'Blusa': ['Moda Fitness', 'Blusa'],
  'Cardigan': ['Moda Fitness', 'Agasalhos'],
  'Colete': ['Moda Fitness', 'Agasalhos'],
  'Moletom': ['Moda Fitness', 'Moletom'],
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
  'Eletrônicos': ['Suplementos', 'Pré-treino'],
  'Super Coffee': ['Suplementos', 'Super Coffee'],
  'Bebidas': ['Suplementos', 'Bebidas'],
  'Pasta de Amendoim': ['Suplementos', 'Outros suplementos'],
  'Psyllium': ['Suplementos', 'Outros suplementos'],
  'Musculação': ['Equipamentos', 'Musculação'],
  'Kit Fitness': ['Equipamentos', 'Kit Fitness'],
  'Step': ['Equipamentos', 'Acessórios de equipamento'],
  'Colchonete': ['Equipamentos', 'Acessórios de equipamento'],
  'Silicone para esteira': ['Equipamentos', 'Acessórios de equipamento'],
  'Coqueteleira': ['Acessórios', 'Coqueteleiras'],
  'Chapéu': ['Acessórios', 'Chapéus'],
};
