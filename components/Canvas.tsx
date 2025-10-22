import React from 'react';
// FIX: Import CanvasObject, TextObject, ShapeObject, and Tool types to be used in props and rendering.
import { ImageState, CanvasObject, TextObject, ShapeObject, Tool } from '../types';

interface CanvasProps {
  imageState: ImageState;
  isMirrored: boolean;
  zoomLevel: number;
  isInverse: boolean;
  // FIX: Add missing props to align with what App.tsx passes.
  objects: CanvasObject[];
  activeTool: Tool;
  selectedObjectId: string | null;
  setSelectedObjectId: (id: string | null) => void;
  setObjects: (objects: CanvasObject[]) => void;
}

const Canvas = ({
  imageState, isMirrored, zoomLevel, isInverse, objects, setSelectedObjectId
}: CanvasProps) => {
  const { url: imageUrl } = imageState;

  // FIX: Added function to render different canvas object types.
  const renderObject = (obj: CanvasObject) => {
    const objectProps = {
        key: obj.id,
        onClick: (e: React.MouseEvent) => {
          e.stopPropagation();
          setSelectedObjectId(obj.id);
        },
        transform: `rotate(${obj.rotation} ${obj.x} ${obj.y})`,
        cursor: 'pointer'
    };

    switch (obj.type) {
        case 'text': {
            const text = obj as TextObject;
            // Adjustments for centering text based on x, y coordinates
            return <text {...objectProps} x={text.x} y={text.y} fontSize={text.fontSize} fill={text.fill} textAnchor="middle" dominantBaseline="middle">{text.content}</text>;
        }
        case 'rectangle': {
            const shape = obj as ShapeObject;
            // Adjustments for centering shape based on x, y coordinates
            return <rect {...objectProps} x={shape.x - shape.width/2} y={shape.y - shape.height/2} width={shape.width} height={shape.height} fill={shape.fill} stroke={shape.stroke} />;
        }
        case 'ellipse': {
            const shape = obj as ShapeObject;
            return <ellipse {...objectProps} cx={shape.x} cy={shape.y} rx={shape.width / 2} ry={shape.height / 2} fill={shape.fill} stroke={shape.stroke} />;
        }
        default:
            return null;
    }
  };

  return (
    <div className="w-full h-full bg-gray-700 rounded-lg flex items-center justify-center overflow-auto border-2 border-dashed border-gray-600">
      {imageUrl ? (
        <div style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center' }}>
            <svg
                id="canvas-svg"
                width="100%" height="100%"
                viewBox="0 0 1024 1024" preserveAspectRatio="xMidYMid meet"
                style={{ backgroundColor: '#fff' }}
                onClick={() => setSelectedObjectId(null)}
            >
                <image 
                    href={imageUrl} x="0" y="0" width="1024" height="1024" 
                    style={{
                        transform: isMirrored ? 'scaleX(-1) translate(-1024px, 0)' : '',
                        filter: isInverse ? 'invert(1)' : 'none',
                    }}
                />
                {/* FIX: Render canvas objects */}
                {objects.map(renderObject)}
            </svg>
        </div>
      ) : (
        <div className="text-center text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="mt-2">Importa una imagen para comenzar</p>
          <p className="text-sm text-gray-500">PNG, JPG, SVG, etc.</p>
        </div>
      )}
    </div>
  );
};

export default Canvas;