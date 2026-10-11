'use client';

import React from 'react';
import { ExternalLink, Sparkles } from 'lucide-react';

interface BlogContentRendererProps {
  content: string;
  className?: string;
}

/**
 * Parses inline formatting:
 * - Markdown links: [Texto do Link](https://...)
 * - Bare URLs: https://... or http://...
 * - Bold text: **texto em destaque**
 */
function parseInlineFormattedText(text: string): React.ReactNode[] {
  if (!text) return [];

  // Match: [link text](url) OR bare url OR **bold**
  const regex = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)|(https?:\/\/[^\s]+)|(\*\*[^*]+\*\*)/g;
  const nodes: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    // Add text before match
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }

    if (match[1] && match[2]) {
      // Markdown link [text](url)
      const linkText = match[1];
      const linkUrl = match[2];
      nodes.push(
        <a
          key={`md-link-${match.index}`}
          href={linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-1 font-semibold text-amber-800 hover:text-amber-950 underline decoration-amber-400 hover:decoration-amber-700 decoration-2 underline-offset-2 transition-colors bg-amber-50/80 hover:bg-amber-100/90 px-1.5 py-0.5 rounded-md"
        >
          <span>{linkText}</span>
          <ExternalLink className="w-3 h-3 text-amber-700 inline-block shrink-0" aria-hidden="true" />
        </a>
      );
    } else if (match[3]) {
      // Bare URL
      const rawUrl = match[3];
      // Clean trailing punctuation if accidentally caught
      const cleanUrl = rawUrl.replace(/[.,;!?)]+$/, '');
      const trailingPunct = rawUrl.slice(cleanUrl.length);

      nodes.push(
        <a
          key={`bare-link-${match.index}`}
          href={cleanUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-1 font-semibold text-amber-800 hover:text-amber-950 underline decoration-amber-400 hover:decoration-amber-700 decoration-2 underline-offset-2 transition-colors bg-amber-50/80 hover:bg-amber-100/90 px-1.5 py-0.5 rounded-md break-all"
        >
          <span>{cleanUrl}</span>
          <ExternalLink className="w-3 h-3 text-amber-700 inline-block shrink-0" aria-hidden="true" />
        </a>
      );
      if (trailingPunct) {
        nodes.push(trailingPunct);
      }
    } else if (match[4]) {
      // Bold text **bold**
      const boldText = match[4].slice(2, -2);
      nodes.push(
        <strong key={`bold-${match.index}`} className="font-bold text-stone-950">
          {boldText}
        </strong>
      );
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
}

export function BlogContentRenderer({ content, className = '' }: BlogContentRendererProps) {
  if (!content) return null;

  // Split content into blocks by double newlines or single newlines
  const lines = content.split('\n');
  const renderedElements: React.ReactNode[] = [];

  let inList = false;
  let currentListItems: React.ReactNode[] = [];

  const flushList = () => {
    if (inList && currentListItems.length > 0) {
      renderedElements.push(
        <ul key={`list-${renderedElements.length}`} className="list-disc list-inside space-y-1.5 my-3 pl-2 text-stone-800">
          {currentListItems}
        </ul>
      );
      currentListItems = [];
      inList = false;
    }
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    // Empty line
    if (!trimmed) {
      flushList();
      return;
    }

    // Heading 2 (## Title)
    if (trimmed.startsWith('## ')) {
      flushList();
      renderedElements.push(
        <h2
          key={`h2-${index}`}
          className="font-serif text-xl sm:text-2xl font-bold text-stone-900 mt-6 mb-2 pt-2 border-b border-stone-100 pb-1"
        >
          {parseInlineFormattedText(trimmed.slice(3))}
        </h2>
      );
      return;
    }

    // Heading 3 (### Subtitle)
    if (trimmed.startsWith('### ')) {
      flushList();
      renderedElements.push(
        <h3
          key={`h3-${index}`}
          className="font-serif text-lg font-bold text-stone-900 mt-4 mb-2"
        >
          {parseInlineFormattedText(trimmed.slice(4))}
        </h3>
      );
      return;
    }

    // Blockquote or Curator Tip (> Dica)
    if (trimmed.startsWith('> ')) {
      flushList();
      renderedElements.push(
        <div
          key={`quote-${index}`}
          className="p-4 my-4 bg-amber-50/70 border-l-4 border-amber-500 rounded-r-2xl text-stone-900 text-sm italic shadow-2xs"
        >
          <div className="flex items-start gap-2 not-italic font-sans">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900 block not-italic">
                Dica da Curadoria
              </span>
              <p className="text-stone-800 leading-relaxed font-normal not-italic">
                {parseInlineFormattedText(trimmed.slice(2))}
              </p>
            </div>
          </div>
        </div>
      );
      return;
    }

    // Bullet list item (- Item, * Item, • Item)
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ') || trimmed.startsWith('• ')) {
      inList = true;
      const bulletContent = trimmed.slice(2);
      currentListItems.push(
        <li key={`li-${index}`} className="leading-relaxed">
          {parseInlineFormattedText(bulletContent)}
        </li>
      );
      return;
    }

    // Standard paragraph
    flushList();
    renderedElements.push(
      <p key={`p-${index}`} className="leading-relaxed text-stone-800 my-2">
        {parseInlineFormattedText(trimmed)}
      </p>
    );
  });

  flushList();

  return (
    <div className={`space-y-2 text-stone-800 font-sans leading-relaxed ${className}`}>
      {renderedElements}
    </div>
  );
}
