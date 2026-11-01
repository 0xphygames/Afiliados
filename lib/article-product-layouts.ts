// Product blocks inside blog articles: one objective (how many products) and one style (how they look).
// The pair is stored as the last field of [[produto|...]], for example "lista-horizontal".
export const ARTICLE_PRODUCT_OBJECTIVES = [
  { id: 'unico', label: 'Cartão de produto único' },
  { id: 'lista', label: 'Lista de vários produtos' },
  { id: 'tabela', label: 'Tabela de comparação' },
] as const;

export const ARTICLE_PRODUCT_STYLES = [
  { id: 'descricao', label: 'Com descrição' },
  { id: 'simplificada', label: 'Lista simplificada' },
  { id: 'horizontal', label: 'Cards horizontais' },
] as const;

export type ArticleProductObjective = (typeof ARTICLE_PRODUCT_OBJECTIVES)[number]['id'];
export type ArticleProductStyle = (typeof ARTICLE_PRODUCT_STYLES)[number]['id'];

export const articleProductLayoutId = (objective: ArticleProductObjective, style: ArticleProductStyle) =>
  `${objective}-${style}`;

// Layout values written before the objective and style split
const LEGACY_LAYOUTS: Record<string, string> = {
  unico: 'unico-descricao',
  'lista-varios': 'lista-horizontal',
  tabela: 'tabela-descricao',
  'lista-descricao': 'lista-descricao',
  'lista-simples': 'lista-simplificada',
  horizontal: 'lista-horizontal',
};

// Product lines written without any layout kept the grid of cards
export const LEGACY_ARTICLE_PRODUCT_LAYOUT = 'lista-horizontal';

export function parseArticleProductLayout(value: string): { objective: ArticleProductObjective; style: ArticleProductStyle } {
  const [objective = '', style = ''] = (LEGACY_LAYOUTS[value] ?? value).split('-');
  return {
    objective: ARTICLE_PRODUCT_OBJECTIVES.some((o) => o.id === objective) ? (objective as ArticleProductObjective) : 'lista',
    style: ARTICLE_PRODUCT_STYLES.some((s) => s.id === style) ? (style as ArticleProductStyle) : 'descricao',
  };
}

// Fields of one product line, as typed or picked in the editor
export interface ArticleProductFields {
  name: string;
  price: string;
  originalPrice: string;
  rating: string;
  url: string;
  image: string;
  badge: string;
  position: string;
  forWho: string;
  highlights: string;
}
