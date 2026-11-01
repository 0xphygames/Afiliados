// Layouts for product blocks inside blog articles. The id is stored as the last field of [[produto|...]].
export const ARTICLE_PRODUCT_LAYOUTS = [
  { id: 'unico', label: 'Cartão de produto único' },
  { id: 'lista-varios', label: 'Lista de vários produtos' },
  { id: 'tabela', label: 'Tabela de comparação' },
  { id: 'lista-descricao', label: 'Lista com descrição' },
  { id: 'lista-simples', label: 'Lista simplificada' },
  { id: 'horizontal', label: 'Cards horizontais' },
] as const;

export type ArticleProductLayout = (typeof ARTICLE_PRODUCT_LAYOUTS)[number]['id'];

export const DEFAULT_ARTICLE_PRODUCT_LAYOUT: ArticleProductLayout = 'lista-varios';
