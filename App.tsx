import React, { useState, useCallback, useReducer, useEffect, useRef } from 'react';
import Header from './components/Header';
import LeftSidebar from './components/LeftSidebar';
import RightSidebar from './RightSidebar'; // Assuming this is the correct path
import Canvas from './components/Canvas';
import ZoomControls from './components/ZoomControls';
import ApiModal from './components/ApiModal';
import ContextualToolbar from './components/ContextualToolbar';
import { EngravingSettings, ImageState, Material, CanvasObject, Tool, DitheringMode } from './types';
import { DEFAULT_SETTINGS, MATERIAL_PRESETS } from './constants';
import { editImage } from './components/services/geminiService';
import { applyLocalDithering } from './components/services/imageProcessor';

type HistoryState = {
    image: ImageState | null;
    objects: CanvasObject[];
};

type HistoryAction =
  | { type: 'PUSH'; payload: HistoryState }
  | { type: 'UPDATE_PRESENT'; payload: Partial<HistoryState> }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'CLEAR' };

function historyReducer(state: { past: HistoryState[]; present: HistoryState; future: HistoryState[] }, action: HistoryAction) {
  const { past, present, future } = state;

  switch (action.type) {
    case 'PUSH':
      // Evita duplicados en el historial
      if (JSON.stringify(present) === JSON.stringify(action.payload)) {
          return state;
      }
      return {
        past: [...past, present],
        present: action.payload,
        future: [],
      };
    case 'UPDATE_PRESENT':
        return {
            ...state,
            present: { ...state.present, ...action.payload },
        };
    case 'UNDO':
      if (past.length === 0) return state;
      const previous = past[past.length - 1];
      const newPast = past.slice(0, past.length - 1);
      return {
        past: newPast,
        present: previous,
        future: [present, ...future],
      };
    case 'REDO':
      if (future.length === 0) return state;
      const next = future[0];
      const newFuture = future.slice(1);
      return {
        past: [present, ...past],
        present: next,
        future: newFuture,
      };
    case 'CLEAR':
        return { past: [], present: { image: null, objects: [] }, future: [] };
    default:
      return state;
  }
}

const App: React.FC = () => {
    const [settings, setSettings] = useState<EngravingSettings>(DEFAULT_SETTINGS);
    const [isLoading, setLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [isMirrored, setIsMirrored] = useState(false);
    const [zoomLevel, setZoomLevel] = useState(1);
    const [apiKey, setApiKey] = useState<string | null>(null);
    const [isApiModalOpen, setApiModalOpen] = useState(false);
    const [aiModel, setAiModel] = useState('gemini-2.5-flash-image');
    const [aiError, setAiError] = useState<string | null>(null);

    const [activeTool, setActiveTool] = useState<Tool>('select');
    const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);
    const [isRightSidebarVisible, setRightSidebarVisible] = useState(false);

    const isInitialMount = useRef(true);


    useEffect(() => {
        const storedApiKey = localStorage.getItem('GEMINI_API_KEY');
        if (storedApiKey) {
            setApiKey(storedApiKey);
        } else {
            setApiModalOpen(true);
        }
    }, []);

    const [history, dispatch] = useReducer(historyReducer, {
        past: [],
        present: { image: null, objects: [] },
        future: [],
    });

    const { present: currentCanvasState } = history;
    const { image: imageState, objects } = currentCanvasState;
    const canUndo = history.past.length > 0;
    const canRedo = history.future.length > 0;

    const pushState = (newState: Partial<HistoryState>) => {
        dispatch({ type: 'PUSH', payload: { ...currentCanvasState, ...newState } });
    };

    const handleUndo = useCallback(() => dispatch({ type: 'UNDO' }), []);
    const handleRedo = useCallback(() => dispatch({ type: 'REDO' }), []);
    
    const updateObjects = (newObjects: CanvasObject[]) => {
      pushState({ objects: newObjects });
    };

    const updateImagePreview = (newImageState: Partial<ImageState>) => {
        if (imageState) {
            dispatch({ type: 'UPDATE_PRESENT', payload: { image: { ...imageState, ...newImageState } } });
        }
    };
    
    const finalizeHistory = useCallback(() => {
        dispatch({ type: 'PUSH', payload: currentCanvasState });
    }, [currentCanvasState]);
    
    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }

        if (!imageState?.originalUrl) {
            return;
        }

        const ditherModes: DitheringMode[] = ['Umbral', 'Difusión de Error', 'Patrón Ordenado', 'Semitono', 'Pop Art (Puntos)', 'Grabado Grunge', 'Grabado Lineal', 'Dibujo a Lápiz'];
        if (!ditherModes.includes(settings.dithering)) {
            return;
        }

        const handler = setTimeout(async () => {
            try {
                const newImageUrl = await applyLocalDithering(imageState.originalUrl, settings);
                updateImagePreview({ url: newImageUrl });
            } catch (error) {
                console.error("Error applying dither preview:", error);
                setAiError("Ocurrió un error al aplicar el efecto de trama.");
            }
        }, 300);

        return () => clearTimeout(handler);

    }, [settings, imageState?.originalUrl]);


    const handleSaveApiKey = (newApiKey: string) => {
        setApiKey(newApiKey);
        localStorage.setItem('GEMINI_API_KEY', newApiKey);
        setApiModalOpen(false);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (event) => {
                const url = event.target?.result as string;
                const newImageState: ImageState = {
                    url,
                    isVector: file.type === 'image/svg+xml',
                    originalUrl: url,
                };
                dispatch({ type: 'CLEAR' });
                // Reset settings to default for new image to avoid applying old effects
                setSettings(DEFAULT_SETTINGS);
                isInitialMount.current = true; // Prevent effect from running on first render of new image
                setAiError(null);
                pushState({ image: newImageState, objects: [] });
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleAIOperation = async (prompt: string, loadingText: string) => {
        if (!imageState?.url || !apiKey) {
            if (!apiKey) setApiModalOpen(true);
            return;
        }
        setAiError(null);
        setLoading(true);
        setLoadingMessage(loadingText);
        try {
            const [header, base64Data] = imageState.url.split(',');
            const mimeType = header.match(/:(.*?);/)?.[1] || 'image/png';
            const { newBase64, newMimeType } = await editImage(apiKey, aiModel, base64Data, mimeType, prompt);
            const newUrl = `data:${newMimeType};base64,${newBase64}`;
            pushState({ image: { ...imageState, url: newUrl, originalUrl: newUrl } });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Ocurrió un error desconocido.";
            setAiError(errorMessage);
            // Check for keywords indicating an API key or permission issue
            if (/api key|permission|credential|denied/i.test(errorMessage)) {
                setApiModalOpen(true); // Re-open the modal
            }
        } finally {
            setLoading(false);
        }
    };

    const resetImage = () => {
        if (imageState && imageState.originalUrl) {
            pushState({ image: { ...imageState, url: imageState.originalUrl } });
            setAiError(null);
        }
    };
    
    const handleSettingsChange = <K extends keyof EngravingSettings>(key: K, value: EngravingSettings[K]) => {
        setSettings(prev => ({ ...prev, [key]: value }));
        setAiError(null);
    };

    const handleMaterialChange = (material: Material) => {
        const preset = MATERIAL_PRESETS[material];
        setSettings(prev => ({ ...prev, ...preset, material }));
        setAiError(null);
        finalizeHistory();
    };

    const handleExport = () => {
        if (!imageState?.url) return;
        const link = document.createElement('a');
        link.href = imageState.url;
        link.download = `grabado-${Date.now()}.${imageState.isVector ? 'svg' : 'png'}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const selectedObject = objects.find(obj => obj.id === selectedObjectId);

    return (
        <div className="flex flex-col h-screen bg-gray-800 text-white font-sans overflow-hidden">
            <ApiModal 
                isOpen={isApiModalOpen} 
                currentApiKey={apiKey}
                onSave={handleSaveApiKey} 
                onClose={() => setApiModalOpen(false)} 
            />
            <Header 
                onUndo={handleUndo} 
                onRedo={handleRedo} 
                onExport={handleExport} 
                canUndo={canUndo} 
                canRedo={canRedo}
            />
            <div className="flex flex-1 overflow-hidden">
                <LeftSidebar 
                    onFileChange={handleFileChange}
                    onToggleRightSidebar={() => setRightSidebarVisible(prev => !prev)}
                />
                <main className="flex-1 flex flex-col p-4 bg-gray-800 relative pb-20 md:pb-4">
                    {selectedObject && (
                        <ContextualToolbar 
                            object={selectedObject}
                            onUpdate={(id, updates) => {
                                const newObjects = objects.map(o => o.id === id ? { ...o, ...updates } : o);
                                // FIX: Add type assertion to resolve complex discriminated union type error.
                                updateObjects(newObjects as CanvasObject[]);
                            }}
                            onFinalUpdate={() => {
                                // This could be used to push to history only on final change
                            }}
                        />
                    )}
                    {aiError && (
                        <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-red-800 bg-opacity-90 border border-red-600 rounded-lg shadow-xl p-3 max-w-xl w-full z-20 text-white text-sm">
                            <div className="flex items-start space-x-3">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-300 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                <div className="flex-1">
                                    <p className="font-bold">Error de IA:</p>
                                    <p className="break-words">{aiError}</p>
                                </div>
                                <button onClick={() => setAiError(null)} className="p-1 rounded-full hover:bg-red-700">
                                     <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    )}
                    <Canvas 
                        imageState={imageState || { url: null, isVector: false, originalUrl: null }}
                        objects={objects}
                        isMirrored={isMirrored}
                        zoomLevel={zoomLevel}
                        isInverse={settings.isInverse}
                        activeTool={activeTool}
                        selectedObjectId={selectedObjectId}
                        setSelectedObjectId={setSelectedObjectId}
                        setObjects={updateObjects}
                    />
                    <ZoomControls
                        zoomLevel={zoomLevel}
                        onZoomIn={() => setZoomLevel(z => Math.min(z + 0.1, 3))}
                        onZoomOut={() => setZoomLevel(z => Math.max(z - 0.1, 0.1))}
                        onResetZoom={() => setZoomLevel(1)}
                    />
                     {isLoading && (
                        <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center z-30">
                            <div className="text-center">
                                <svg className="animate-spin h-8 w-8 text-white mx-auto mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <p className="text-lg font-semibold">{loadingMessage}</p>
                            </div>
                        </div>
                    )}
                </main>
                <RightSidebar 
                    settings={settings}
                    imageState={imageState || { url: null, isVector: false, originalUrl: null }}
                    onMaterialChange={handleMaterialChange}
                    onSettingsChange={handleSettingsChange}
                    onAIOperation={handleAIOperation}
                    isMirrored={isMirrored}
                    setIsMirrored={(value) => { setIsMirrored(value); finalizeHistory(); }}
                    resetImage={resetImage}
                    isVisible={isRightSidebarVisible}
                    onClose={() => setRightSidebarVisible(false)}
                    aiModel={aiModel}
                    onAiModelChange={setAiModel}
                    onOpenApiModal={() => setApiModalOpen(true)}
                    onFinalizeHistory={finalizeHistory}
                />
            </div>
        </div>
    );
};

export default App;