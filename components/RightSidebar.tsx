import React from 'react';
import { EngravingSettings, Material, ImageState } from '../types';
import FinishingPanel from './FinishingPanel';
import { ConfigIcon } from './icons/EditorIcons';

// FIX: Update props to align with FinishingPanel and fix missing 'onFinalizeHistory' error.
interface RightSidebarProps {
  settings: EngravingSettings;
  imageState: ImageState;
  onMaterialChange: (material: Material) => void;
  onSettingsChange: <K extends keyof EngravingSettings>(key: K, value: EngravingSettings[K]) => void;
  onAIOperation: (prompt: string, loadingText: string) => void;
  isMirrored: boolean;
  setIsMirrored: (isMirrored: boolean) => void;
  resetImage: () => void;
  onOpenApiModal: () => void;
  aiModel: string;
  onAiModelChange: (model: string) => void;
  onFinalizeHistory: () => void;
}

const RightSidebar = (props: RightSidebarProps) => {
  // FIX: Destructure props to only pass relevant ones to FinishingPanel.
  const { onOpenApiModal, ...finishingPanelProps } = props;
  return (
    <aside className="w-80 bg-gray-900 border-l border-gray-700 flex flex-col">
      <div className="flex border-b border-gray-700 relative p-3 items-center justify-between">
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
  );
};

export default RightSidebar;