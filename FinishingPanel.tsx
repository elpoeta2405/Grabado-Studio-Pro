import React, { useState } from 'react';
import { EngravingSettings, Material, DitheringMode, ImageState } from '../types';
import { MATERIAL_PRESETS } from '../constants';
import { applyLocalDithering } from '../services/imageProcessor';

interface FinishingPanelProps {
  settings: EngravingSettings;
  imageState: ImageState;
  onMaterialChange: (material: Material) => void;
  onSettingsChange: <K extends keyof EngravingSettings>(key: K, value: EngravingSettings[K]) => void;
  onAIOperation: (prompt: string, loadingText: string) => void;
  onLocalImageUpdate: (newImageUrl: string) => void;
  isMirrored: boolean;
  setIsMirrored: (isMirrored: boolean) => void;
  resetImage: () => void;
  setLoading: (isLoading: boolean) => void;
  setLoadingMessage: (message: string) => void;
}

const Slider: React.FC<{
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  unit?: string;
}> = ({ label, value, min, max, step, onChange, unit }) => (
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
      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
    />
  </div>
);

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="border-t border-gray-700 pt-4 mt-4">
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
    onLocalImageUpdate, 
    isMirrored, 
    setIsMirrored, 
    resetImage,
    setLoading,
    setLoadingMessage
}) => {
  const [aiPrompt, setAiPrompt] = useState('');
  const hasImage = !!imageState.url;
  const originalUrl = imageState.originalUrl;

  const handleDither = async () => {
    if (!originalUrl) {
      alert("No hay una imagen original para aplicar el efecto.");
      return;
    }
    
    setLoading(true);
    setLoadingMessage(`Aplicando trama ${settings.dithering}...`);
    
    try {
        // Usa un timeout para permitir que la UI se actualice y muestre el loader
        await new Promise(resolve => setTimeout(resolve, 50)); 
        const newImageUrl = await applyLocalDithering(originalUrl, settings);
        onLocalImageUpdate(newImageUrl);
    } catch (error) {
        console.error("Error aplicando el efecto de trama local:", error);
        alert("Ocurrió un error al aplicar el efecto de trama.");
    } finally {
        setLoading(false);
    }
  }

  const handleAIPromptSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!aiPrompt.trim()) return;
      onAIOperation(aiPrompt, 'Aplicando edición generativa...');
      setAiPrompt('');
  };

  return (
    <div className="p-4 text-sm">
      <Section title="Edición Generativa con IA">
        <p className="text-xs text-gray-400 mb-2">Describe un cambio, ej., "añade una luna en el cielo" o "elimina el texto".</p>
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
            <span className="font-medium text-gray-300">Espejo para Grabado Inverso</span>
            <button onClick={() => setIsMirrored(!isMirrored)} className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${isMirrored ? 'bg-brand-primary' : 'bg-gray-600'}`}>
                <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${isMirrored ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
        </div>
      </Section>

      <Section title="Acabado y Trama">
        <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Modo de Trama</label>
            <div className="flex">
                <select
                    value={settings.dithering}
                    onChange={(e) => onSettingsChange('dithering', e.target.value as DitheringMode)}
                    className="flex-grow bg-gray-800 border border-gray-600 rounded-l-md px-3 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-primary"
                >
                    <option value="Umbral">Umbral (Blanco y Negro)</option>
                    <option value="Difusión de Error">Difusión de Error (Periódico)</option>
                    <option value="Patrón Ordenado">Patrón Ordenado (Geométrico)</option>
                    <option value="Semitono">Semitono (Puntos variables)</option>
                </select>
                <button onClick={handleDither} className="px-3 bg-brand-secondary text-white font-semibold rounded-r-md hover:opacity-90 disabled:bg-gray-600 disabled:cursor-not-allowed" disabled={!hasImage}>Aplicar</button>
            </div>
        </div>
        {settings.dithering === 'Semitono' && (
            <div className="p-3 bg-gray-800 rounded-md space-y-4">
                 <h5 className="text-sm font-semibold text-center text-gray-200">Ajustes de Semitono</h5>
                 <Slider label="Brillo" value={settings.halftoneBrightness} min={-100} max={100} step={1} onChange={(v) => onSettingsChange('halftoneBrightness', v)}/>
                 <Slider label="Contraste" value={settings.halftoneContrast} min={-100} max={100} step={1} onChange={(v) => onSettingsChange('halftoneContrast', v)}/>
                 <Slider label="Tamaño de punto" value={settings.halftoneDotSize} min={2} max={20} step={1} onChange={(v) => onSettingsChange('halftoneDotSize', v)} unit="px"/>
            </div>
        )}
        <Slider label="Resolución" value={settings.resolution} min={100} max={1000} step={1} onChange={(v) => onSettingsChange('resolution', v)} unit=" DPI"/>
      </Section>
    </div>
  );
};

export default FinishingPanel;