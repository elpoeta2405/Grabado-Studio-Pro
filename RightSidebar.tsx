

import React from 'react';
import { EngravingSettings, Material, ImageState } from './types';
import FinishingPanel from './components/FinishingPanel';
import { ConfigIcon } from './components/icons/EditorIcons';

interface RightSidebarProps {
  settings: EngravingSettings;
  imageState: ImageState;
  onMaterialChange: (material: Material) => void;
  onSettingsChange: <K extends keyof EngravingSettings>(key: K, value: EngravingSettings[K]) => void;
  onAIOperation: (prompt: string, loadingText: string) => void;
  isMirrored: boolean;
  setIsMirrored: (isMirrored: boolean) => void;
  resetImage: () => void;
  isVisible: boolean;
  onClose: () => void;
  aiModel: string;
  onAiModelChange: (model: string) => void;
  onOpenApiModal: () => void;
  onFinalizeHistory: () => void;
}

const RightSidebar: React.FC<RightSidebarProps> = (props) => {
  const { isVisible, onClose, onOpenApiModal, ...finishingPanelProps } = props;

  return (
    <>
      {/* Overlay for mobile view */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-30 transition-opacity md:hidden ${
          isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />
      
      <aside className={`fixed top-0 right-0 h-full w-80 bg-gray-900 border-l border-gray-700 flex flex-col z-40
                       transform transition-transform duration-300 ease-in-out
                       ${isVisible ? 'translate-x-0' : 'translate-x-full'}
                       md:relative md:translate-x-0`}>
        <div className="flex border-b border-gray-700 p-3 items-center justify-between">
         <h3 className="text-lg font-semibold text-gray-100">Edición y Acabado</h3>
            <button 
                onClick={onOpenApiModal}
                className="p-1 text-gray-400 hover:text-white transition-colors"
                title="Configurar API Key"
            >
                <ConfigIcon />
            </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <FinishingPanel {...finishingPanelProps} />
        </div>
      </aside>
    </>
  );
};

export default RightSidebar;