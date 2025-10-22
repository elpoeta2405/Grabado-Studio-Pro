import React from 'react';
import { ImportIcon, SettingsIcon } from './icons/EditorIcons';

interface LeftSidebarProps {
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onToggleRightSidebar: () => void;
}

const LeftSidebar: React.FC<LeftSidebarProps> = ({ onFileChange, onToggleRightSidebar }) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const buttonClasses = "w-full flex flex-col items-center justify-center p-3 rounded-lg text-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed md:w-full";
  const importButtonClasses = `${buttonClasses} bg-gradient-to-br from-brand-primary to-brand-secondary hover:opacity-90`;
  const settingsButtonClasses = `${buttonClasses} bg-gray-700 hover:bg-gray-600`;

  return (
    <aside className="fixed bottom-0 left-0 right-0 z-20 bg-gray-900 p-1 flex flex-row justify-around border-t border-gray-700 
                     md:relative md:w-24 md:flex-col md:space-y-4 md:space-x-0 md:p-2 md:justify-start md:border-t-0 md:border-r">
      <input
        type="file"
        ref={fileInputRef}
        onChange={onFileChange}
        className="hidden"
        accept="image/png, image/jpeg, image/svg+xml, image/gif, image/bmp"
      />
      <button
        onClick={handleImportClick}
        title="Importar Imagen"
        className={importButtonClasses}
      >
        <ImportIcon />
        <span className="text-xs mt-1">Importar</span>
      </button>
      
      <div className="w-full border-t border-gray-700 my-2 hidden md:block"></div>
      
      <button
        onClick={onToggleRightSidebar}
        title="Ajustes de Edición"
        className={settingsButtonClasses}
      >
        <SettingsIcon />
        <span className="text-xs mt-1">Ajustes</span>
      </button>
    </aside>
  );
};

export default LeftSidebar;