'use client';

import { useEffect } from 'react';

type ModelContext = {
  registerTool?: (tool: {
    name: string;
    description: string;
    inputSchema: Record<string, unknown>;
    execute: () => Promise<Record<string, unknown>>;
  }) => void | Promise<void>;
};

export function WebMcp() {
  useEffect(() => {
    const modelContext = (navigator as Navigator & { modelContext?: ModelContext }).modelContext;
    if (!modelContext?.registerTool) return;
    void modelContext.registerTool({
      name: 'get_site_info',
      description: 'Retorna informações públicas e links principais do Achadinhos & Looks.',
      inputSchema: { type: 'object', properties: {}, additionalProperties: false },
      execute: async () => ({
        name: 'Achadinhos & Looks',
        description: 'Curadoria de achadinhos, looks, cupons e guias de compra.',
        links: ['/achadinhos', '/blog', '/cupons', '/campanha', '/sobre', '/contato', '/termos'],
      }),
    });
  }, []);
  return null;
}
