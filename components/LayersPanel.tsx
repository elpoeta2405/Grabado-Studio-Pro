
import React, { useState } from 'react';

interface Layer {
    name: string;
    color: string;
}

const initialLayers: Layer[] = [
    { name: 'Capa de Corte', color: '#F87171' }, // red
    { name: 'Capa de Grabado', color: '#60A5FA' }, // blue
    { name: 'Capa de Marcado', color: '#34D399' }, // green
];

const LayersPanel: React.FC = () => {
    const [layers, setLayers] = useState<Layer[]>(initialLayers);

    const getRandomColor = () => {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    };

    const handleAddLayer = () => {
        const name = prompt("Introduce el nombre de la nueva capa:", `Capa ${layers.length + 1}`);
        if (name) {
            setLayers(prev => [...prev, { name, color: getRandomColor() }]);
        }
    };

    const handleRemoveLayer = (indexToRemove: number) => {
        setLayers(prev => prev.filter((_, index) => index !== indexToRemove));
    };

  return (
    <div className="p-4 text-gray-300">
      <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-100">Capas</h3>
          <button onClick={handleAddLayer} className="px-2 py-1 text-xs bg-brand-primary rounded-md hover:bg-indigo-500 transition-colors">+ Añadir</button>
      </div>
      <div className="space-y-2">
        {layers.map((layer, index) => (
          <div key={index} className="flex items-center justify-between p-2 bg-gray-800 rounded-md group">
            <div className="flex items-center">
              <div
                className="w-4 h-4 rounded-sm mr-3 border border-gray-600"
                style={{ backgroundColor: layer.color }}
              ></div>
              <span>{layer.name}</span>
            </div>
            <div className="flex items-center space-x-2">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.022 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                </svg>
                 <button onClick={() => handleRemoveLayer(index)} className="text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
          </div>
        ))}
      </div>
       <div className="mt-4 text-sm text-center text-gray-500">
        La funcionalidad de las capas es conceptual. Asigna colores a los trazados vectoriales para controlar diferentes operaciones del láser.
      </div>
    </div>
  );
};

export default LayersPanel;
