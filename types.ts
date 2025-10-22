export type DitheringMode = 'Umbral' | 'Difusión de Error' | 'Patrón Ordenado' | 'Semitono' | 'Pop Art (Puntos)' | 'Grabado Grunge' | 'Grabado Lineal' | 'Dibujo a Lápiz';

export type Material = 'Madera' | 'Acrílico' | 'Cuero' | 'Metal Anodizado' | 'Vidrio' | 'Personalizado';

export interface EngravingSettings {
  dithering: DitheringMode;
  resolution: number;
  halftoneBrightness: number;
  halftoneContrast: number;
  halftoneDotSize: number; // For Semitono
  popArtDotSpacing: number; // For Pop Art
  lineEngravingSpacing: number; // For Grabado Lineal
  grungeIntensity: number; // For Grabado Grunge
  pencilSketchBlur: number; // For Dibujo a Lápiz
  isInverse: boolean;
  material: Material;
  // New granular controls
  thresholdValue: number; // For Umbral
  errorDiffusionPaletteLevels: number; // For Difusión de Error
  orderedDitherMatrixSize: number; // For Patrón Ordenado (e.g., 2, 4, 8)
  pencilSketchStrokeWeight: number; // For Dibujo a Lápiz
}

export interface ImageState {
    url: string | null;
    isVector: boolean;
    originalUrl: string | null;
}

// FIX: Add missing 'Tool' type definition.
export type Tool = 'select' | 'text' | 'rectangle' | 'ellipse';

// FIX: Add definitions for canvas object types that were missing.
export interface BaseObject {
    id: string;
    type: string;
    x: number;
    y: number;
    rotation: number;
}

export interface TextObject extends BaseObject {
    type: 'text';
    content: string;
    fontSize: number;
    fill: string;
}

export interface ShapeObject extends BaseObject {
    type: 'rectangle' | 'ellipse';
    width: number;
    height: number;
    fill: string;
    stroke: string;
}

export type CanvasObject = TextObject | ShapeObject;