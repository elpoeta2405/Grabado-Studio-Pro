import { EngravingSettings, Material } from './types';

export const DEFAULT_SETTINGS: EngravingSettings = {
  dithering: 'Difusión de Error',
  resolution: 300,
  halftoneBrightness: 0,
  halftoneContrast: 0,
  halftoneDotSize: 5,
  popArtDotSpacing: 8,
  lineEngravingSpacing: 4,
  grungeIntensity: 10,
  pencilSketchBlur: 8,
  isInverse: false,
  material: 'Personalizado',
  // New granular controls defaults
  thresholdValue: 128,
  errorDiffusionPaletteLevels: 2,
  orderedDitherMatrixSize: 4,
  pencilSketchStrokeWeight: 1.5,
  grayscaleLevels: 256,
  sepiaTone: 0,
};

// FIX: Add and export MATERIAL_PRESETS to be used in the UI
export const MATERIAL_PRESETS: Record<Material, Partial<EngravingSettings>> = {
    'Madera': { resolution: 300, dithering: 'Difusión de Error' },
    'Acrílico': { resolution: 600, dithering: 'Umbral' },
    'Cuero': { resolution: 250, dithering: 'Difusión de Error' },
    'Metal Anodizado': { resolution: 1000, dithering: 'Umbral' },
    'Vidrio': { resolution: 500, dithering: 'Difusión de Error', isInverse: true },
    'Personalizado': {},
};