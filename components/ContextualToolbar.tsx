import React, { useState, useEffect, useCallback } from 'react';
import { CanvasObject, TextObject, ShapeObject } from '../types';

interface ContextualToolbarProps {
  object: CanvasObject;
  onUpdate: (id: string, updates: Partial<CanvasObject>) => void;
  onFinalUpdate: () => void;
}

const DebouncedInput: React.FC<{ value: string, onChange: (value: string) => void, onFinalChange: () => void, className?: string, placeholder?: string }> = 
({ value, onChange, onFinalChange, ...props }) => {
    const [internalValue, setInternalValue] = useState(value);

    useEffect(() => {
        setInternalValue(value);
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInternalValue(e.target.value);
        onChange(e.target.value);
    };

    const handleBlur = () => {
        onFinalChange();
    };
    
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            onFinalChange();
            (e.target as HTMLInputElement).blur();
        }
    };

    return <input type="text" value={internalValue} onChange={handleChange} onBlur={handleBlur} onKeyDown={handleKeyDown} {...props} />;
}


const ContextualToolbar: React.FC<ContextualToolbarProps> = ({ object, onUpdate, onFinalUpdate }) => {
  const handleUpdate = useCallback((updates: Partial<CanvasObject>) => {
    onUpdate(object.id, updates);
  }, [object.id, onUpdate]);

  const renderTextControls = (obj: TextObject) => (
    <>
      <DebouncedInput
        value={obj.content}
        onChange={value => handleUpdate({ content: value })}
        onFinalChange={onFinalUpdate}
        className="bg-gray-900 border border-gray-600 rounded-md px-2 py-1 text-sm w-40"
        placeholder="Tu texto aquí..."
      />
      <input
        type="number"
        value={obj.fontSize}
        onChange={e => handleUpdate({ fontSize: parseInt(e.target.value, 10) || 0 })}
        onBlur={onFinalUpdate}
        className="bg-gray-900 border border-gray-600 rounded-md px-2 py-1 text-sm w-20"
        title="Tamaño de fuente"
      />
      <input
        type="color"
        value={obj.fill}
        onChange={e => handleUpdate({ fill: e.target.value })}
        onBlur={onFinalUpdate}
        className="w-8 h-8 p-1 bg-gray-900 border border-gray-600 rounded-md cursor-pointer"
        title="Color de texto"
      />
    </>
  );

  const renderShapeControls = (obj: ShapeObject) => (
    <>
      <div className="flex items-center space-x-2">
        <label className="text-xs">Relleno:</label>
        <input
          type="color"
          value={obj.fill}
          onChange={e => handleUpdate({ fill: e.target.value })}
          onBlur={onFinalUpdate}
          className="w-8 h-8 p-1 bg-gray-900 border border-gray-600 rounded-md cursor-pointer"
          title="Color de relleno"
        />
      </div>
      <div className="flex items-center space-x-2">
        <label className="text-xs">Borde:</label>
        <input
          type="color"
          value={obj.stroke}
          onChange={e => handleUpdate({ stroke: e.target.value })}
          onBlur={onFinalUpdate}
          className="w-8 h-8 p-1 bg-gray-900 border border-gray-600 rounded-md cursor-pointer"
          title="Color de borde"
        />
      </div>
    </>
  );

  return (
    <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-gray-800 bg-opacity-90 border border-gray-600 rounded-lg shadow-xl p-2 flex items-center space-x-4 z-20 text-gray-100">
      {object.type === 'text' && renderTextControls(object as TextObject)}
      {(object.type === 'rectangle' || object.type === 'ellipse') && renderShapeControls(object as ShapeObject)}
    </div>
  );
};

export default ContextualToolbar;
