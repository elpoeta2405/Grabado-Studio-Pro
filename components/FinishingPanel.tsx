import React, { useState } from 'react';
import { EngravingSettings, Material, DitheringMode, ImageState } from '../types';
import { MATERIAL_PRESETS } from '../constants';

interface FinishingPanelProps {
  settings: EngravingSettings;
  imageState: ImageState;
  onMaterialChange: (material: Material) => void;
  onSettingsChange: <K extends keyof EngravingSettings>(key: K, value: EngravingSettings[K]) => void;
  onAIOperation: (prompt: string, loadingText: string) => void;
  isMirrored: boolean;
  setIsMirrored: (isMirrored: boolean) => void;
  resetImage: () => void;
  aiModel: string;
  onAiModelChange: (model: string) => void;
  onFinalizeHistory: () => void;
  onInteractionStart: () => void;
}

const Slider: React.FC<{
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  onFinalChange?: () => void;
  onInteractionStart?: () => void;
  unit?: string;
}> = ({ label, value, min, max, step, onChange, onFinalChange, onInteractionStart, unit }) => (
  <div className="space-y-1">
    <label className="flex justify-between text-sm font-medium text-gray-300">
      <span>{label}</span>
      <span>{value}{unit}</span>
    </label>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      onMouseDown={onInteractionStart}
      onTouchStart={onInteractionStart}
      onMouseUp={onFinalChange}
      onTouchEnd={onFinalChange}
      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
    />
  </div>
);

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="border-t border-gray-700 pt-4 mt-4 first:border-t-0 first:mt-0 first:pt-0">
        <h4 className="text-md font-semibold mb-3 text-gray-100">{title}</h4>
        <div className="space-y-4">{children}</div>
    </div>
);


const FinishingPanel: React.FC<FinishingPanelProps> = ({ 
    settings,
    imageState,
    onMaterialChange, 
    onSettingsChange, 
    onAIOperation,
    isMirrored, 
    setIsMirrored, 
    resetImage,
    aiModel,
    onAiModelChange,
    onFinalizeHistory,
    onInteractionStart
}) => {
  const [aiPrompt, setAiPrompt] = useState('');
  const hasImage = !!imageState.url;

  const handleAIPromptSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!aiPrompt.trim()) return;
      onAIOperation(aiPrompt, 'Aplicando edición generativa...');
      setAiPrompt('');
  };
  
  const DITHERING_MODES: DitheringMode[] = ['Umbral', 'Difusión de Error', 'Patrón Ordenado', 'Semitono', 'Pop Art (Puntos)', 'Grabado Grunge', 'Grabado Lineal', 'Dibujo a Lápiz'];
  const showDitherSettings = DITHERING_MODES.includes(settings.dithering);


  return (
    <div className="p-4 text-sm">
      <Section title="Edición Generativa con IA">
        <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Modelo de IA (para edición)</label>
            <select
                value={aiModel}
                onChange={(e) => onAiModelChange(e.target.value)}
                className="w-full bg-gray-800 border border-gray-600 rounded-md px-3 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-primary mb-3"
                disabled={!hasImage}
            >
                <option value="gemini-2.5-flash-image">Gemini 2.5 Flash Image</option>
                <option value="gemini-pro">Gemini Pro</option>
            </select>
        </div>
        <p className="text-xs text-gray-400 mb-2">Describe un cambio, ej., "añade una luna en el cielo".</p>
        <form onSubmit={handleAIPromptSubmit} className="flex space-x-2">
            <input 
                type="text" 
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="Escribe tu edición aquí..."
                className="flex-1 bg-gray-800 border border-gray-600 rounded-md px-3 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-primary"
                disabled={!hasImage}
            />
            <button type="submit" className="px-4 py-2 bg-brand-primary rounded-md text-white font-semibold hover:bg-indigo-500 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed" disabled={!hasImage}>
                Aplicar
            </button>
        </form>
         <button onClick={resetImage} className="w-full mt-2 text-center py-2 text-sm text-gray-300 bg-gray-700 rounded-md hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed" disabled={!hasImage}>
            Quitar Efectos de Acabado
        </button>
      </Section>

      <Section title="Preparación de Imagen">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Material de Referencia</label>
          <select
            value={settings.material}
            onChange={(e) => onMaterialChange(e.target.value as Material)}
            className="w-full bg-gray-800 border border-gray-600 rounded-md px-3 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-primary"
          >
            {Object.keys(MATERIAL_PRESETS).map((mat) => <option key={mat} value={mat}>{mat}</option>)}
          </select>
        </div>
        <div className="flex justify-between items-center">
            <span className="font-medium text-gray-300">Espejo (Invertir Horizontal)</span>
            <button onClick={() => setIsMirrored(!isMirrored)} className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${isMirrored ? 'bg-brand-primary' : 'bg-gray-600'}`}>
                <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${isMirrored ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
        </div>
        <div className="flex justify-between items-center">
            <span className="font-medium text-gray-300">Inverso (Negativo)</span>
            <button onClick={() => { onSettingsChange('isInverse', !settings.isInverse); onFinalizeHistory(); }} className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${settings.isInverse ? 'bg-brand-primary' : 'bg-gray-600'}`}>
                <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${settings.isInverse ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
        </div>
      </Section>

      <Section title="Acabado y Trama (Vista Previa en Vivo)">
        <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Modo de Trama</label>
            <select
                value={settings.dithering}
                onChange={(e) => {
                    onFinalizeHistory();
                    onSettingsChange('dithering', e.target.value as DitheringMode);
                }}
                className="w-full bg-gray-800 border border-gray-600 rounded-md px-3 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-primary"
            >
                {DITHERING_MODES.map(mode => <option key={mode} value={mode}>{mode}</option>)}
            </select>
        </div>
        {showDitherSettings && (
            <div className="p-3 bg-gray-800 rounded-md space-y-4">
                 <h5 className="text-sm font-semibold text-center text-gray-200">Ajustes de {settings.dithering}</h5>
                 
                 <Slider label="Brillo" value={settings.halftoneBrightness} min={-100} max={100} step={1} onChange={(v) => onSettingsChange('halftoneBrightness', v)} onFinalChange={onFinalizeHistory} onInteractionStart={onInteractionStart} />
                 <Slider label="Contraste" value={settings.halftoneContrast} min={-100} max={100} step={1} onChange={(v) => onSettingsChange('halftoneContrast', v)} onFinalChange={onFinalizeHistory} onInteractionStart={onInteractionStart} />

                 { settings.dithering === 'Umbral' && <Slider label="Umbral" value={settings.thresholdValue} min={0} max={255} step={1} onChange={(v) => onSettingsChange('thresholdValue', v)} onFinalChange={onFinalizeHistory} onInteractionStart={onInteractionStart} /> }
                 { settings.dithering === 'Difusión de Error' && <Slider label="Niveles de Paleta" value={settings.errorDiffusionPaletteLevels} min={2} max={16} step={1} onChange={(v) => onSettingsChange('errorDiffusionPaletteLevels', v)} onFinalChange={onFinalizeHistory} onInteractionStart={onInteractionStart} /> }
                 { settings.dithering === 'Patrón Ordenado' && 
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Tamaño de Matriz</label>
                        <select
                            value={settings.orderedDitherMatrixSize}
                            onChange={(e) => {
                                onFinalizeHistory();
                                onSettingsChange('orderedDitherMatrixSize', parseInt(e.target.value));
                            }}
                            className="w-full bg-gray-900 border border-gray-600 rounded-md px-3 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-primary"
                        >
                            <option value={2}>2x2</option>
                            <option value={4}>4x4</option>
                            <option value={8}>8x8</option>
                        </select>
                    </div>
                 }
                 { settings.dithering === 'Semitono' && <Slider label="Tamaño de punto" value={settings.halftoneDotSize} min={2} max={20} step={1} onChange={(v) => onSettingsChange('halftoneDotSize', v)} unit="px" onFinalChange={onFinalizeHistory} onInteractionStart={onInteractionStart} /> }
                 { settings.dithering === 'Pop Art (Puntos)' && <Slider label="Espaciado de punto" value={settings.popArtDotSpacing} min={2} max={20} step={1} onChange={(v) => onSettingsChange('popArtDotSpacing', v)} unit="px" onFinalChange={onFinalizeHistory} onInteractionStart={onInteractionStart} /> }
                 { settings.dithering === 'Grabado Lineal' && <Slider label="Espaciado de línea" value={settings.lineEngravingSpacing} min={1} max={10} step={1} onChange={(v) => onSettingsChange('lineEngravingSpacing', v)} unit="px" onFinalChange={onFinalizeHistory} onInteractionStart={onInteractionStart} /> }
                 { settings.dithering === 'Grabado Grunge' && <Slider label="Intensidad" value={settings.grungeIntensity} min={1} max={20} step={1} onChange={(v) => onSettingsChange('grungeIntensity', v)} onFinalChange={onFinalizeHistory} onInteractionStart={onInteractionStart} /> }
                 { settings.dithering === 'Dibujo a Lápiz' && <>
                    <Slider label="Desenfoque" value={settings.pencilSketchBlur} min={2} max={20} step={1} onChange={(v) => onSettingsChange('pencilSketchBlur', v)} unit="px" onFinalChange={onFinalizeHistory} onInteractionStart={onInteractionStart} />
                    <Slider label="Grosor de Trazo" value={settings.pencilSketchStrokeWeight} min={0.5} max={3} step={0.1} onChange={(v) => onSettingsChange('pencilSketchStrokeWeight', v)} onFinalChange={onFinalizeHistory} onInteractionStart={onInteractionStart} />
                 </>}
            </div>
        )}
        <Slider label="Resolución" value={settings.resolution} min={100} max={1000} step={1} onChange={(v) => onSettingsChange('resolution', v)} unit=" DPI" onFinalChange={onFinalizeHistory} onInteractionStart={onInteractionStart} />
      </Section>
    </div>
  );
};

export default FinishingPanel;