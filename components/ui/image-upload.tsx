'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Upload, Star, StarOff, GripVertical } from 'lucide-react';
import { toast } from 'sonner';

interface Photo {
  id: number;
  url: string;
  is_cover: boolean;
  sort_order: number;
}

interface ImageUploadProps {
  listingId?: number;
  photos: Photo[];
  onPhotosChange: (photos: Photo[]) => void;
  onUpload?: (files: File[]) => Promise<Photo[]>;
  onDelete?: (photoId: number) => Promise<void>;
  onSetCover?: (photoId: number) => Promise<void>;
  maxPhotos?: number;
  disabled?: boolean;
}

export function ImageUpload({
  listingId,
  photos,
  onPhotosChange,
  onUpload,
  onDelete,
  onSetCover,
  maxPhotos = 10,
  disabled = false,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [deletingIds, setDeletingIds] = useState<Set<number>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    // Vérifier la limite
    if (photos.length + files.length > maxPhotos) {
      toast.error(`Vous ne pouvez pas ajouter plus de ${maxPhotos} photos`);
      return;
    }

    // Vérifier les types de fichiers
    const validFiles = files.filter(file => {
      const isValidType = file.type.startsWith('image/');
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB

      if (!isValidType) {
        toast.error(`${file.name} n'est pas une image valide`);
        return false;
      }

      if (!isValidSize) {
        toast.error(`${file.name} est trop volumineux (max 5MB)`);
        return false;
      }

      return true;
    });

    if (validFiles.length === 0) return;

    try {
      setUploading(true);

      if (onUpload && listingId) {
        // Upload vers le serveur
        const uploadedPhotos = await onUpload(validFiles);
        onPhotosChange([...photos, ...uploadedPhotos]);
      } else {
        // Mode preview (création)
        const previewPhotos: Photo[] = validFiles.map((file, index) => ({
          id: Date.now() + index, // ID temporaire
          url: URL.createObjectURL(file),
          is_cover: photos.length === 0 && index === 0,
          sort_order: photos.length + index,
        }));
        onPhotosChange([...photos, ...previewPhotos]);
      }

      toast.success(`${validFiles.length} photo(s) ajoutée(s)`);
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de l\'upload');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDelete = async (photo: Photo) => {
    try {
      setDeletingIds(prev => new Set(prev).add(photo.id));

      if (onDelete && listingId) {
        // Supprimer du serveur
        await onDelete(photo.id);
      }

      // Supprimer de la liste locale
      const updatedPhotos = photos.filter(p => p.id !== photo.id);

      // Si c'était la photo de couverture, définir la première comme nouvelle couverture
      if (photo.is_cover && updatedPhotos.length > 0) {
        updatedPhotos[0].is_cover = true;
      }

      onPhotosChange(updatedPhotos);
      toast.success('Photo supprimée');

      // Libérer l'URL objet si c'est un preview
      if (photo.url.startsWith('blob:')) {
        URL.revokeObjectURL(photo.url);
      }
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la suppression');
    } finally {
      setDeletingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(photo.id);
        return newSet;
      });
    }
  };

  const handleSetCover = async (photo: Photo) => {
    try {
      if (onSetCover && listingId) {
        // Mettre à jour sur le serveur
        await onSetCover(photo.id);
      }

      // Mettre à jour localement
      const updatedPhotos = photos.map(p => ({
        ...p,
        is_cover: p.id === photo.id,
      }));
      onPhotosChange(updatedPhotos);
      toast.success('Photo de couverture définie');
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la mise à jour');
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Photos de la propriété</h3>
          <p className="text-sm text-gray-500">
            {photos.length} / {maxPhotos} photos
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || uploading || photos.length >= maxPhotos}
        >
          <Upload className="h-4 w-4 mr-2" />
          {uploading ? 'Upload...' : 'Ajouter des photos'}
        </Button>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Photos Grid */}
      {photos.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos
            .sort((a, b) => a.sort_order - b.sort_order)
            .map((photo) => (
              <Card key={photo.id} className="relative overflow-hidden">
                <CardContent className="p-0">
                  <div className="relative aspect-square">
                    <img
                      src={photo.url}
                      alt="Photo de la propriété"
                      className="w-full h-full object-cover"
                    />

                    {/* Overlay avec contrôles */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center opacity-0 hover:opacity-100">
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleSetCover(photo)}
                          disabled={photo.is_cover}
                        >
                          {photo.is_cover ? (
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          ) : (
                            <StarOff className="h-4 w-4" />
                          )}
                        </Button>

                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(photo)}
                          disabled={deletingIds.has(photo.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Badge couverture */}
                    {photo.is_cover && (
                      <Badge className="absolute top-2 left-2 bg-yellow-500">
                        Couverture
                      </Badge>
                    )}

                    {/* Indicateur de chargement pour suppression */}
                    {deletingIds.has(photo.id) && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      ) : (
        <Card className="border-dashed border-2 border-gray-300">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Upload className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500 text-center mb-4">
              Aucune photo ajoutée
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled || uploading}
            >
              Ajouter la première photo
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <div className="text-xs text-gray-500 space-y-1">
        <p>• Formats acceptés : JPEG, PNG, WebP</p>
        <p>• Taille maximale : 5MB par image</p>
        <p>• Maximum {maxPhotos} photos par propriété</p>
        <p>• La première photo sera utilisée comme couverture</p>
      </div>
    </div>
  );
}