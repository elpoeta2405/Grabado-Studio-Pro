import React, { useState, useEffect } from 'react';

interface ApiModalProps {
  isOpen: boolean;
  currentApiKey: string | null;
  onSave: (apiKey: string) => void;
  onClose: () => void;
}

const ApiModal: React.FC<ApiModalProps> = ({ isOpen, currentApiKey, onSave, onClose }) => {
  const [apiKeyInput, setApiKeyInput] = useState('');

  useEffect(() => {
    if (isOpen) {
      setApiKeyInput(currentApiKey || '');
    }
  }, [isOpen, currentApiKey]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKeyInput.trim()) {
      onSave(apiKeyInput.trim());
    }
  };
  
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
      // Solo cierra si ya hay una clave guardada, forzando la primera configuración
      if (e.target === e.currentTarget && currentApiKey) {
          onClose();
      }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
      onClick={handleOverlayClick}
    >
      <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-xl font-semibold text-gray-100 mb-2">Configurar Clave de API de Gemini</h3>
        <p className="text-sm text-gray-400 mb-4">
            Para usar las funciones de IA, necesitas una clave de API. Puedes obtener una gratis en {' '}
            <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-brand-primary hover:underline">
                Google AI Studio
            </a>.
        </p>
        <form onSubmit={handleSubmit}>
          <label htmlFor="api-key-input" className="block text-sm font-medium text-gray-300 mb-2">Tu Clave de API</label>
          <input
            id="api-key-input"
            type="password"
            value={apiKeyInput}
            onChange={(e) => setApiKeyInput(e.target.value)}
            className="w-full bg-gray-900 border border-gray-600 rounded-md px-3 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-primary"
            placeholder="Pega tu clave aquí"
            autoFocus
          />
          <div className="mt-6 flex justify-end space-x-3">
             {currentApiKey && (
                <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-600 rounded-md text-white font-semibold hover:bg-gray-500 transition-colors">
                  Cancelar
                </button>
            )}
            <button type="submit" className="px-4 py-2 bg-brand-primary rounded-md text-white font-semibold hover:bg-indigo-500 transition-colors disabled:opacity-50" disabled={!apiKeyInput.trim()}>
              Guardar Clave
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApiModal;
