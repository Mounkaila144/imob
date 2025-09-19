import imageCompression from 'browser-image-compression';

export interface CompressionOptions {
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
  useWebWorker?: boolean;
  quality?: number;
}

const defaultOptions: CompressionOptions = {
  maxSizeMB: 1, // Limite à 1MB
  maxWidthOrHeight: 1920, // Résolution maximale
  useWebWorker: true, // Utilise un web worker pour ne pas bloquer l'UI
  quality: 0.8, // Qualité de 80%
};

export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<File> {
  try {
    const compressionOptions = { ...defaultOptions, ...options };

    // Vérifier si le fichier est une image
    if (!file.type.startsWith('image/')) {
      throw new Error('Le fichier doit être une image');
    }

    // Si l'image fait déjà moins de la taille maximale, la retourner telle quelle
    const maxSizeBytes = (compressionOptions.maxSizeMB || 1) * 1024 * 1024;
    if (file.size <= maxSizeBytes) {
      return file;
    }

    const compressedFile = await imageCompression(file, compressionOptions);

    // Préserver le nom et l'extension du fichier original
    const compressedFileWithOriginalName = new File(
      [compressedFile],
      file.name,
      {
        type: compressedFile.type,
        lastModified: Date.now(),
      }
    );

    return compressedFileWithOriginalName;
  } catch (error) {
    console.error('Erreur lors de la compression de l\'image:', error);
    throw new Error('Impossible de compresser l\'image');
  }
}

export async function compressMultipleImages(
  files: File[],
  options: CompressionOptions = {}
): Promise<File[]> {
  try {
    const compressionPromises = files.map(file => compressImage(file, options));
    return await Promise.all(compressionPromises);
  } catch (error) {
    console.error('Erreur lors de la compression des images:', error);
    throw new Error('Impossible de compresser une ou plusieurs images');
  }
}

export function getImageInfo(file: File): {
  name: string;
  size: number;
  sizeFormatted: string;
  type: string;
} {
  const sizeInMB = file.size / (1024 * 1024);
  const sizeFormatted = sizeInMB < 1
    ? `${(sizeInMB * 1024).toFixed(0)} KB`
    : `${sizeInMB.toFixed(2)} MB`;

  return {
    name: file.name,
    size: file.size,
    sizeFormatted,
    type: file.type,
  };
}