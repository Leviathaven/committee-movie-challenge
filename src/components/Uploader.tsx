/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, CheckCircle, AlertTriangle } from 'lucide-react';

interface UploaderProps {
  id: string;
  onImageSelected: (base64Data: string, fileName: string) => void;
  currentImage?: string;
  onClearImage?: () => void;
}

export default function Uploader({
  id,
  onImageSelected,
  currentImage,
  onClearImage,
}: UploaderProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorStatus('Please select an image file (PNG, JPG, WEBP, etc.)');
      return;
    }

    setErrorStatus(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Optimize and compress the image to safe, lightweight format to prevent localstorage quota errors!
        const canvas = document.createElement('canvas');
        const maxDim = 500; // max dimension 500px is perfect for app displays
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7); // 70% quality JPEG is lightweight & sharp
          onImageSelected(compressedBase64, file.name);
        } else {
          // Fallback to original
          if (e.target?.result && typeof e.target.result === 'string') {
            onImageSelected(e.target.result, file.name);
          }
        }
      };
      
      img.onerror = () => {
        setErrorStatus('Failed to load image file. It may be corrupted.');
      };

      if (e.target?.result && typeof e.target.result === 'string') {
        img.src = e.target.result;
      }
    };

    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        id={`${id}-file-input`}
        type="file"
        className="hidden"
        accept="image/*"
        onChange={handleChange}
      />

      {currentImage ? (
        <div className="space-y-3">
          <div className="relative border-4 border-black rounded-2xl overflow-hidden bg-white group aspect-[4/3] flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <img
              src={currentImage}
              alt="Uploaded topic preview"
              className="max-w-full max-h-full object-contain rounded-xl p-1"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200">
              <button
                type="button"
                onClick={onButtonClick}
                className="px-4 py-1.5 mr-2 bg-vibrant-cyan hover:bg-cyan-200 text-black border-2 border-black font-display font-black text-xs rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer transition-all"
                id={`${id}-change-btn`}
              >
                Change
              </button>
              {onClearImage && (
                <button
                  type="button"
                  onClick={onClearImage}
                  className="px-4 py-1.5 bg-vibrant-pink hover:bg-pink-400 text-white border-2 border-black font-display font-black text-xs rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer transition-all"
                  id={`${id}-remove-btn`}
                >
                  Remove
                </button>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-black font-extrabold bg-vibrant-lime bg-opacity-20 border border-black p-2 rounded-lg">
            <CheckCircle className="w-4 h-4 text-black" />
            <span>Compressed image attached successfully!</span>
          </div>
        </div>
      ) : (
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={onButtonClick}
          className={`flex flex-col items-center justify-center w-full aspect-[4/3] border-4 border-dashed rounded-3xl cursor-pointer p-6 text-center transition-all ${
            isDragActive
              ? 'border-black bg-vibrant-yellow scale-[1.01]'
              : 'border-black bg-white hover:bg-gray-50'
          }`}
          id={`${id}-dropzone`}
        >
          <div className="p-3 bg-vibrant-cyan rounded-2xl text-black mb-3 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] group-hover:scale-105 transition-transform">
            <Upload className="w-5 h-5 text-black" />
          </div>
          <p className="text-sm text-black font-display font-black mb-1">
            Drag & drop prompt image here
          </p>
          <p className="text-xs text-gray-700 font-bold">
            or <span className="text-vibrant-pink underline font-black">browse local files</span>
          </p>
          <div className="mt-3.5">
            <span className="text-[9px] font-mono font-black text-black uppercase bg-vibrant-gold border-2 border-black py-0.5 px-2 rounded-lg">
              Optimized automatically
            </span>
          </div>
        </div>
      )}

      {errorStatus && (
        <div className="mt-2.5 p-3.5 bg-red-400 border-2 border-black rounded-xl text-black font-extrabold text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{errorStatus}</span>
        </div>
      )}
    </div>
  );
}
