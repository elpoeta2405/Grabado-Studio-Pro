import React from 'react';
import { ZoomInIcon, ZoomOutIcon } from './icons/EditorIcons';

interface ZoomControlsProps {
  zoomLevel: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
}

const ZoomControls: React.FC<ZoomControlsProps> = ({ zoomLevel, onZoomIn, onZoomOut, onResetZoom }) => {
  const buttonClass = "w-10 h-10 flex items-center justify-center text-gray-300 bg-gray-800 hover:bg-gray-700 transition-colors disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed";
  
  return (
    <div className="absolute bottom-4 right-4 flex items-center bg-gray-800 border border-gray-600 rounded-md shadow-lg overflow-hidden z-10">
      <button onClick={onZoomOut} className={buttonClass} title="Alejar">
        <ZoomOutIcon />
      </button>
      <button onClick={onResetZoom} className="px-4 h-10 text-sm font-semibold text-gray-300 hover:bg-gray-700 transition-colors" title="Restaurar Zoom">
        {Math.round(zoomLevel * 100)}%
      </button>
      <button onClick={onZoomIn} className={buttonClass} title="Acercar">
        <ZoomInIcon />
      </button>
    </div>
  );
};

export default ZoomControls;
