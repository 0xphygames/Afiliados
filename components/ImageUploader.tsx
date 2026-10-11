'use client';

import React, { useRef, useState } from 'react';
import Image from 'next/image';
import { getDownloadURL, uploadBytesResumable, ref } from 'firebase/storage';
import { storage } from '@/lib/firebase';
import { optimizeImageFile } from '@/lib/image-compress';

interface ImageUploaderProps {
  /**
   * Callback invoked with the public download URL or compressed base64 data URL after upload.
   */
  onUpload: (url: string) => void;
  /**
   * Optional initial image URL (e.g., existing product image).
   */
  initialUrl?: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onUpload, initialUrl }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string>(initialUrl || '');
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    try {
      // 1. Optimize image in browser first to prevent oversized uploads
      const optimizedDataUrl = await optimizeImageFile(file, 1200, 0.85);

      // 2. Try Firebase storage if available, fallback to compressed data URL
      try {
        const fileRef = ref(storage, `products/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`);
        const uploadTask = uploadBytesResumable(fileRef, file);

        uploadTask.on(
          'state_changed',
          undefined,
          (storageError) => {
            console.warn('Firebase Storage indisponível, usando fallback otimizado:', storageError);
            setPreview(optimizedDataUrl);
            setUploading(false);
            onUpload(optimizedDataUrl);
          },
          async () => {
            try {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              setPreview(downloadURL);
              setUploading(false);
              onUpload(downloadURL);
            } catch (err) {
              setPreview(optimizedDataUrl);
              setUploading(false);
              onUpload(optimizedDataUrl);
            }
          }
        );
      } catch (storageInitErr) {
        setPreview(optimizedDataUrl);
        setUploading(false);
        onUpload(optimizedDataUrl);
      }
    } catch (compressErr) {
      console.error('Erro ao processar imagem:', compressErr);
      const r = new FileReader();
      r.onloadend = () => {
        const result = r.result as string;
        setPreview(result);
        setUploading(false);
        onUpload(result);
      };
      r.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {preview && (
        <div className="relative w-36 h-36 rounded-xl overflow-hidden border border-stone-200 bg-stone-50 flex items-center justify-center">
          <Image
            src={preview}
            alt="preview"
            fill
            className="object-contain p-2"
            unoptimized
            referrerPolicy="no-referrer"
          />
        </div>
      )}
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="px-3 py-1.5 bg-stone-900 text-white text-xs font-bold rounded-lg hover:bg-stone-800 disabled:opacity-50 transition-colors"
        disabled={uploading}
      >
        {uploading ? 'Processando imagem...' : preview ? 'Alterar foto' : 'Selecionar foto'}
      </button>
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileSelect}
      />
    </div>
  );
};
