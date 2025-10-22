
import React from 'react';
import { UndoIcon, RedoIcon, ExportIcon, SettingsIcon } from './icons/EditorIcons';

interface HeaderProps {
  onUndo: () => void;
  onRedo: () => void;
  onExport: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const Header = ({ onUndo, onRedo, onExport, canUndo, canRedo }: HeaderProps) => {
  const buttonClass = "flex items-center px-3 py-1.5 text-sm text-gray-300 bg-gray-700 rounded-md hover:bg-gray-600 transition-colors disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed";

  return (
    <header className="flex items-center justify-between p-2 bg-gray-800 border-b border-gray-700 shadow-md z-30">
      <div className="flex items-center">
        <div className="w-8 h-8 bg-gradient-to-tr from-brand-primary to-brand-secondary rounded-md mr-3 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L16.732 3.732z" />
            </svg>
        </div>
        <h1 className="text-xl font-bold text-gray-100">
            GrabadoStudio <span className="hidden sm:inline">Pro</span>
        </h1>
      </div>
      <div className="flex items-center space-x-2">
        <button onClick={onUndo} disabled={!canUndo} className={buttonClass} title="Deshacer (Ctrl+Z)">
          <UndoIcon />
          <span className="ml-2 hidden md:inline">Deshacer</span>
        </button>
        <button onClick={onRedo} disabled={!canRedo} className={buttonClass} title="Rehacer (Ctrl+Y)">
          <RedoIcon />
          <span className="ml-2 hidden md:inline">Rehacer</span>
        </button>
        <button onClick={onExport} className={buttonClass} title="Exportar Imagen">
          <ExportIcon />
          <span className="ml-2 hidden md:inline">Exportar</span>
        </button>
      </div>
    </header>
  );
};

export default Header;