import React, { useMemo, useState, useLayoutEffect } from 'react';
import { CanvasObject, ShapeObject } from '../types';

interface TransformHandlesProps {
  object: CanvasObject;
  svgRef: React.RefObject<SVGSVGElement>;
  onTransformStart: (action: 'move' | 'resize' | 'rotate', e: React.MouseEvent, handle?: string) => void;
}

const TransformHandles: React.FC<TransformHandlesProps> = ({ object, svgRef, onTransformStart }) => {
    const [bbox, setBbox] = useState<DOMRect | null>(null);

    useLayoutEffect(() => {
        if (svgRef.current && object) {
            const element = svgRef.current.querySelector(`[data-id='${object.id}']`) as SVGGraphicsElement;
            if (element) {
                setBbox(element.getBBox());
            }
        }
    }, [object, svgRef]);

    const handles = useMemo(() => {
        if (!bbox) return { resize: [], rotate: null };

        const { x, y, width, height } = bbox;

        const handleSize = 8;
        const halfHandle = handleSize / 2;

        const canResize = object.type !== 'text' && object.rotation === 0;

        const resizeHandles = canResize ? [
            { id: 'top-left', x: x - halfHandle, y: y - halfHandle, cursor: 'nwse-resize' },
            { id: 'top-right', x: x + width - halfHandle, y: y - halfHandle, cursor: 'nesw-resize' },
            { id: 'bottom-left', x: x - halfHandle, y: y + height - halfHandle, cursor: 'nesw-resize' },
            { id: 'bottom-right', x: x + width - halfHandle, y: y + height - halfHandle, cursor: 'nwse-resize' },
            { id: 'top-center', x: x + width / 2 - halfHandle, y: y - halfHandle, cursor: 'ns-resize' },
            { id: 'bottom-center', x: x + width / 2 - halfHandle, y: y + height - halfHandle, cursor: 'ns-resize' },
            { id: 'left-center', x: x - halfHandle, y: y + height / 2 - halfHandle, cursor: 'ew-resize' },
            { id: 'right-center', x: x + width - halfHandle, y: y + height / 2 - halfHandle, cursor: 'ew-resize' },
        ] : [];
        
        const rotationHandle = {
            lineX1: x + width / 2,
            lineY1: y,
            lineX2: x + width / 2,
            lineY2: y - 20,
            cx: x + width / 2,
            cy: y - 20,
        };

        return { resize: resizeHandles, rotate: rotationHandle };

    }, [bbox, object.type, object.rotation]);

    if (!bbox) return null;

    const transform = `rotate(${object.rotation}, ${bbox.x + bbox.width / 2}, ${bbox.y + bbox.height / 2})`;

    return (
        <g transform={transform}>
            <rect
                x={bbox.x}
                y={bbox.y}
                width={bbox.width}
                height={bbox.height}
                fill="none"
                stroke="#EC4899"
                strokeWidth="1"
                strokeDasharray="3 3"
                vectorEffect="non-scaling-stroke"
                style={{ pointerEvents: 'none' }}
            />
            {handles.rotate && (
                <g>
                    <line
                        x1={handles.rotate.lineX1} y1={handles.rotate.lineY1}
                        x2={handles.rotate.lineX2} y2={handles.rotate.lineY2}
                        stroke="#EC4899" strokeWidth="1" vectorEffect="non-scaling-stroke"
                    />
                    <circle
                        cx={handles.rotate.cx}
                        cy={handles.rotate.cy}
                        r="5"
                        fill="white"
                        stroke="#EC4899"
                        strokeWidth="1"
                        vectorEffect="non-scaling-stroke"
                        cursor="alias"
                        onMouseDown={(e) => onTransformStart('rotate', e)}
                    />
                </g>
            )}
            {handles.resize.map(handle => (
                <rect
                    key={handle.id}
                    x={handle.x}
                    y={handle.y}
                    width="8"
                    height="8"
                    fill="white"
                    stroke="#EC4899"
                    strokeWidth="1"
                    vectorEffect="non-scaling-stroke"
                    style={{ cursor: handle.cursor }}
                    onMouseDown={(e) => onTransformStart('resize', e, handle.id)}
                />
            ))}
        </g>
    );
};

export default TransformHandles;