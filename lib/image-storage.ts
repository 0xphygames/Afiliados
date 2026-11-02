import { supabase, SUPABASE_STORAGE_BUCKET } from './supabase';

async function compressToBlob(file: File, maxDimension: number, quality: number): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const context = canvas.getContext('2d');
  if (!context) throw new Error('O navegador não conseguiu processar a imagem.');
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('Não foi possível compactar a imagem.'))), 'image/jpeg', quality);
  });
}

export async function uploadImageFile(file: File, folder: string, maxDimension = 1200, quality = 0.82) {
  if (!file.type.startsWith('image/')) throw new Error('Selecione um arquivo de imagem.');
  const blob = await compressToBlob(file, maxDimension, quality);
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_').replace(/\.[^.]+$/, '') || 'imagem';
  const path = `${folder}/${Date.now()}-${safeName}.jpg`;
  const { error } = await supabase.storage.from(SUPABASE_STORAGE_BUCKET).upload(path, blob, {
    contentType: 'image/jpeg',
    cacheControl: '31536000',
    upsert: false,
  });
  if (error) throw new Error(`Falha ao salvar imagem no Storage: ${error.message}`);
  return supabase.storage.from(SUPABASE_STORAGE_BUCKET).getPublicUrl(path).data.publicUrl;
}

export function rejectDataImageUrl(value: string): string {
  if (/^data:image\//i.test(value.trim())) {
    throw new Error('Imagens Base64 não são aceitas. Envie a imagem pelo botão Upload para salvá-la no Storage.');
  }
  return value;
}
