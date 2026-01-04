import React, { useRef } from 'react';
import { Camera } from 'lucide-react';

interface CameraCaptureProps {
  onCapture: (file: File) => void;
  disabled?: boolean;
  onActivate?: () => boolean;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, disabled, onActivate }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    if (onActivate) {
      const shouldProceed = onActivate();
      if (!shouldProceed) return;
    }
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onCapture(e.target.files[0]);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <>
      <input
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
        disabled={disabled}
      />
      <button
        onClick={handleClick}
        disabled={disabled}
        className="fixed bottom-6 right-6 z-40 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-full p-4 shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        aria-label="Add Business Card"
      >
        <Camera size={24} />
      </button>
    </>
  );
};