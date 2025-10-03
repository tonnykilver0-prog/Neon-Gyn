import React, { useState, useCallback } from 'react';
import type { UploadedImage } from '../constants';
import { UploadIcon } from '../constants';

interface ImageUploaderProps {
  onImageUpload: (image: UploadedImage) => void;
  uploadedImage: UploadedImage | null;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload, uploadedImage }) => {
    const [isDragging, setIsDragging] = useState(false);

    const handleFileChange = useCallback((files: FileList | null) => {
        if (files && files[0]) {
            const file = files[0];
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const base64 = (e.target?.result as string).split(',')[1];
                    onImageUpload({
                        base64,
                        mimeType: file.type,
                        name: file.name
                    });
                };
                reader.readAsDataURL(file);
            } else {
                alert("Por favor, selecione um arquivo de imagem.");
            }
        }
    }, [onImageUpload]);

    const onDragOver = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const onDragLeave = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);
    
    const onDrop = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        setIsDragging(false);
        handleFileChange(e.dataTransfer.files);
    }, [handleFileChange]);

    return (
        <div>
            <label 
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer transition-colors
                ${isDragging ? 'border-pink-500 bg-gray-800' : 'border-gray-600 bg-gray-900 hover:bg-gray-800'}`}
            >
                {uploadedImage ? (
                    <div className="relative w-full h-full">
                        <img 
                            src={`data:${uploadedImage.mimeType};base64,${uploadedImage.base64}`} 
                            alt="Preview" 
                            className="object-contain w-full h-full p-2 rounded-lg" 
                        />
                         <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-lg">
                            <span className="text-white text-center p-2">Clique ou arraste para substituir</span>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <UploadIcon />
                        <p className="mb-2 text-sm text-gray-400"><span className="font-semibold text-pink-500">Clique para enviar</span> ou arraste e solte</p>
                        <p className="text-xs text-gray-500">SVG, PNG, JPG ou GIF</p>
                    </div>
                )}
                <input 
                    type="file" 
                    id="file-upload" 
                    className="hidden" 
                    accept="image/*"
                    onChange={(e) => handleFileChange(e.target.files)}
                />
            </label>
            {uploadedImage && <p className="text-xs text-gray-400 mt-2 truncate" title={uploadedImage.name}>Arquivo: {uploadedImage.name}</p>}
        </div>
    );
};

export default ImageUploader;