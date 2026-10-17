// Migra imagens Base64 da tabela `products` para o bucket do Supabase Storage.
//
// Uso (PowerShell ou bash, a partir da raiz do projeto):
//   node scripts/migrate-product-images.mjs            -> dry-run (nada é gravado no banco)
//   node scripts/migrate-product-images.mjs --execute  -> faz upload e atualiza as linhas
//
// Variáveis necessárias (no ambiente, não em arquivo versionado):
//   SUPABASE_URL (ou NEXT_PUBLIC_SUPABASE_URL)
//   SUPABASE_SERVICE_ROLE_KEY
//   SUPABASE_STORAGE_BUCKET (opcional, padrão: images)
//
// Sempre gera um backup JSON da tabela antes de qualquer escrita.

import { createClient } from '@supabase/supabase-js';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const EXECUTE = process.argv.includes('--execute');
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET = process.env.SUPABASE_STORAGE_BUCKET || 'images';
const PAGE = 20;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Defina SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const outDir = join(process.cwd(), 'backups');
mkdirSync(outDir, { recursive: true });

// 1) Lê todas as linhas (paginado, com id como desempate).
async function fetchAll() {
  const rows = [];
  let from = 0;
  for (;;) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })
      .order('id', { ascending: true })
      .range(from, from + PAGE - 1);
    if (error) throw error;
    rows.push(...(data ?? []));
    if (!data || data.length < PAGE) break;
    from += data.length;
  }
  return rows;
}

const rows = await fetchAll();
const backupPath = join(outDir, `products-backup-${stamp}.json`);
writeFileSync(backupPath, JSON.stringify(rows, null, 2));
console.log(`Backup: ${rows.length} linhas -> ${backupPath}`);

// 2) Identifica fontes Base64 (data:image/...;base64,...).
const DATA_URL = /^data:(image\/[a-z0-9.+-]+);base64,(.*)$/is;
const extFor = (mime) =>
  ({ 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif' })[mime] || 'bin';

const sourcesOf = (row) => {
  const list = Array.isArray(row.images) ? row.images : [];
  return [...new Set([row.image_url, ...list].filter((v) => typeof v === 'string' && v.startsWith('data:')))];
};

let totalSources = 0;
let totalBytes = 0;
let rowsWithBase64 = 0;
for (const row of rows) {
  const srcs = sourcesOf(row);
  if (srcs.length) rowsWithBase64++;
  totalSources += srcs.length;
  for (const s of srcs) totalBytes += Math.floor((s.length * 3) / 4);
}
console.log(`Linhas com Base64: ${rowsWithBase64} | imagens: ${totalSources} | ~${(totalBytes / 1024 / 1024).toFixed(1)} MB`);

if (!EXECUTE) {
  console.log('DRY-RUN: nada gravado. Rode com --execute depois de aprovar o relatório.');
  process.exit(0);
}

// 3) Execução: upload + atualização de cada linha.
const publicUrlFor = (path) => supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
const report = { migrated: 0, failed: [], bytesBefore: totalBytes, startedAt: stamp };

for (const row of rows) {
  const srcs = sourcesOf(row);
  if (!srcs.length) continue;
  const map = new Map();
  let i = 0;
  try {
    for (const src of srcs) {
      const m = DATA_URL.exec(src);
      if (!m) throw new Error('formato data: inválido');
      const [, mime, b64] = m;
      const path = `products/${row.id}-${i++}.${extFor(mime)}`;
      const { error } = await supabase.storage
        .from(BUCKET)
        .upload(path, Buffer.from(b64, 'base64'), { contentType: mime, upsert: true, cacheControl: '31536000' });
      if (error) throw error;
      map.set(src, publicUrlFor(path));
    }
    const newImages = (Array.isArray(row.images) ? row.images : []).map((v) => map.get(v) ?? v);
    const newCover = map.get(row.image_url) ?? row.image_url;
    const { error } = await supabase
      .from('products')
      .update({ image_url: newCover, images: newImages })
      .eq('id', row.id);
    if (error) throw error;
    report.migrated++;
  } catch (err) {
    report.failed.push({ id: row.id, error: String(err?.message ?? err) });
  }
}

const reportPath = join(outDir, `migration-report-${stamp}.json`);
writeFileSync(reportPath, JSON.stringify(report, null, 2));
console.log(`Migradas: ${report.migrated} | falhas: ${report.failed.length} | relatório: ${reportPath}`);
