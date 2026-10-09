import { Product, Article, Coupon } from './types';

/**
 * Normalizes text for accent-insensitive and case-insensitive comparison
 * e.g. "Retrô" -> "retro", "Musculação" -> "musculacao"
 */
export function normalizeSearchText(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/**
 * Common Portuguese stop words that shouldn't disqualify matches or skew weighting
 */
const STOP_WORDS = new Set(['de', 'do', 'da', 'dos', 'das', 'em', 'no', 'na', 'nos', 'nas', 'e', 'ou', 'com', 'para', 'pra', 'por', 'um', 'uma']);

/**
 * Extracts meaningful tokens from a query string
 */
export function extractQueryTokens(query: string): { tokens: string[]; rawTokens: string[] } {
  const normalized = normalizeSearchText(query);
  const rawTokens = normalized.split(/[^a-z0-9]+/i).filter(Boolean);
  const tokens = rawTokens.filter((t) => !STOP_WORDS.has(t) || rawTokens.length === 1);
  return {
    tokens: tokens.length > 0 ? tokens : rawTokens,
    rawTokens,
  };
}

/**
 * Scores a product based on query relevance
 */
export function scoreProduct(product: Product, query: string): number {
  if (!query.trim()) return 0;

  const cleanQ = normalizeSearchText(query);
  const { tokens } = extractQueryTokens(query);
  if (tokens.length === 0) return 0;

  const titleNorm = normalizeSearchText(product.title);
  const categoryNorm = normalizeSearchText(product.category);
  const platformNorm = normalizeSearchText(product.platform);
  const badgeNorm = normalizeSearchText(product.badge || '');
  const tipNorm = normalizeSearchText(product.tamiresTip || '');
  const keywordsNorm = (product.bottomFunnelKeywords || []).map((k) => normalizeSearchText(k));

  const titleWords = titleNorm.split(/[^a-z0-9]+/i).filter(Boolean);

  let score = 0;

  // 1. Exact match on full title
  if (titleNorm === cleanQ) {
    score += 8000;
  }

  // 2. Title starts with clean query (e.g. "Mini Game..." starts with "mini")
  if (titleNorm.startsWith(cleanQ)) {
    score += 5000;
  }

  // 3. Title contains full query as an exact substring / whole phrase
  if (titleNorm.includes(cleanQ)) {
    score += 3000;
    // Extra boost if preceded by word boundary
    const phraseRegex = new RegExp(`(^|\\s)${cleanQ}(\\s|$)`, 'i');
    if (phraseRegex.test(titleNorm)) {
      score += 1500;
    }
  }

  // 4. Token-by-token matching against title words
  let matchedTitleTokens = 0;
  let exactWordMatches = 0;

  for (const token of tokens) {
    let tokenMatched = false;

    // Exact word match in title (e.g. "mini" equals "mini")
    if (titleWords.includes(token)) {
      score += 1800;
      exactWordMatches++;
      tokenMatched = true;
    } else {
      // Word starts with token (e.g. "minigame" starts with "mini")
      const startsWithMatch = titleWords.some((w) => w.startsWith(token));
      if (startsWithMatch) {
        score += 800;
        tokenMatched = true;
      } else {
        // Substring inside a longer word (e.g. "minimalistas" contains "mini") - MUCH lower score!
        const substringMatch = titleWords.some((w) => w.includes(token));
        if (substringMatch) {
          score += 80; // tiny score, prevents non-relevant matches from ranking high
          tokenMatched = true;
        }
      }
    }

    if (tokenMatched) {
      matchedTitleTokens++;
    }
  }

  // Big bonus if ALL query tokens matched in the title
  if (matchedTitleTokens === tokens.length && tokens.length > 0) {
    score += 2500;
  }

  // Bonus for position of match in title: earlier matches in the title are much more relevant
  const firstTokenIndex = titleNorm.indexOf(tokens[0]);
  if (firstTokenIndex === 0) {
    score += 1000;
  } else if (firstTokenIndex > 0 && firstTokenIndex < 15) {
    score += 500;
  }

  // 5. Bottom funnel keywords match
  for (const kw of keywordsNorm) {
    if (kw === cleanQ) {
      score += 3000;
    } else if (kw.includes(cleanQ)) {
      score += 1500;
    } else {
      for (const token of tokens) {
        if (kw === token) score += 800;
        else if (kw.includes(token)) score += 300;
      }
    }
  }

  // 6. Category match
  if (categoryNorm === cleanQ) {
    score += 1000;
  } else if (categoryNorm.includes(cleanQ)) {
    score += 500;
  } else {
    for (const token of tokens) {
      if (categoryNorm.includes(token)) score += 200;
    }
  }

  // 7. Platform match
  if (platformNorm === cleanQ) {
    score += 400;
  }

  // 8. Badge match
  if (badgeNorm.includes(cleanQ)) {
    score += 400;
  }

  // 9. Tamires tip / description match (lowest priority, secondary details)
  for (const token of tokens) {
    if (tipNorm.includes(token)) {
      score += 60;
    }
  }

  // Tie-breaker: slight boost for higher rating and recency
  if (score > 0) {
    if (product.rating) {
      score += product.rating * 5;
    }
    const createdTime = new Date(product.createdAt).getTime();
    if (!isNaN(createdTime)) {
      score += (createdTime / 1e13); // tiny decimal tie-breaker
    }
  }

  return score;
}

/**
 * Scores an article based on query relevance
 */
export function scoreArticle(article: Article, query: string): number {
  if (!query.trim()) return 0;

  const cleanQ = normalizeSearchText(query);
  const { tokens } = extractQueryTokens(query);
  if (tokens.length === 0) return 0;

  const titleNorm = normalizeSearchText(article.title);
  const categoryNorm = normalizeSearchText(article.category);
  const summaryNorm = normalizeSearchText(article.summary || '');
  const contentNorm = normalizeSearchText(article.content || '');

  const titleWords = titleNorm.split(/[^a-z0-9]+/i).filter(Boolean);

  let score = 0;

  // Title full match
  if (titleNorm === cleanQ) score += 8000;
  if (titleNorm.startsWith(cleanQ)) score += 4000;
  if (titleNorm.includes(cleanQ)) score += 2500;

  let matchedTitleTokens = 0;
  for (const token of tokens) {
    if (titleWords.includes(token)) {
      score += 1500;
      matchedTitleTokens++;
    } else if (titleWords.some((w) => w.startsWith(token))) {
      score += 700;
      matchedTitleTokens++;
    } else if (titleWords.some((w) => w.includes(token))) {
      score += 60;
      matchedTitleTokens++;
    }
  }

  if (matchedTitleTokens === tokens.length && tokens.length > 0) {
    score += 2000;
  }

  if (categoryNorm.includes(cleanQ)) score += 600;
  if (summaryNorm.includes(cleanQ)) score += 400;
  else {
    for (const token of tokens) {
      if (summaryNorm.includes(token)) score += 100;
    }
  }

  for (const token of tokens) {
    if (contentNorm.includes(token)) score += 40;
  }

  return score;
}

/**
 * Scores a coupon based on query relevance
 */
export function scoreCoupon(coupon: Coupon, query: string): number {
  if (!query.trim()) return 0;

  const cleanQ = normalizeSearchText(query);
  const { tokens } = extractQueryTokens(query);
  if (tokens.length === 0) return 0;

  const codeNorm = normalizeSearchText(coupon.code);
  const titleNorm = normalizeSearchText(coupon.title);
  const descNorm = normalizeSearchText(coupon.description || '');
  const platformNorm = normalizeSearchText(coupon.platform);

  let score = 0;

  if (codeNorm === cleanQ) score += 10000;
  if (codeNorm.includes(cleanQ)) score += 4000;

  if (titleNorm.startsWith(cleanQ)) score += 4000;
  if (titleNorm.includes(cleanQ)) score += 2500;

  for (const token of tokens) {
    if (codeNorm.includes(token)) score += 1500;
    if (titleNorm.includes(token)) score += 800;
    if (descNorm.includes(token)) score += 100;
    if (platformNorm.includes(token)) score += 300;
  }

  return score;
}

/**
 * Ranks an array of products by relevance to a query
 */
export function rankProducts(products: Product[], query: string): Product[] {
  if (!query.trim()) return products;

  const scored = products
    .map((product) => ({
      product,
      score: scoreProduct(product, query),
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.map((item) => item.product);
}

/**
 * Ranks an array of articles by relevance to a query
 */
export function rankArticles(articles: Article[], query: string): Article[] {
  if (!query.trim()) return articles;

  const scored = articles
    .map((article) => ({
      article,
      score: scoreArticle(article, query),
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.map((item) => item.article);
}

/**
 * Ranks an array of coupons by relevance to a query
 */
export function rankCoupons(coupons: Coupon[], query: string): Coupon[] {
  if (!query.trim()) return coupons;

  const scored = coupons
    .map((coupon) => ({
      coupon,
      score: scoreCoupon(coupon, query),
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.map((item) => item.coupon);
}
