import React, { useRef, useState } from 'react';
import { getDownloadURL, uploadBytesResumable, ref } from 'firebase/storage';
import { storage } from '@/lib/firebase';

interface ImageUploaderProps {
  /**
   * Callback invoked with the public download URL after successful upload.
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
    const fileRef = ref(storage, `products/${Date.now()}_${file.name}`);
    const uploadTask = uploadBytesResumable(fileRef, file);
    setUploading(true);
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        // Optional: you could expose progress here
      },
      (error) => {
        console.error('Upload error:', error);
        setUploading(false);
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        setPreview(downloadURL);
        setUploading(false);
        onUpload(downloadURL);
      }
    );
  };

  return (
    <div className="flex flex-col gap-2">
      {preview && (
        <img src={preview} alt="preview" className="w-32 h-32 object-cover rounded" />
      )}
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="px-3 py-1.5 bg-stone-900 text-white rounded hover:bg-stone-800 disabled:opacity-50"
        disabled={uploading}
      >
        {uploading ? 'Enviando...' : preview ? 'Alterar foto' : 'Selecionar foto'}
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
