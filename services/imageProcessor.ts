import { EngravingSettings } from '../types';

function loadImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.onload = () => resolve(img);
        img.onerror = (err) => reject(err);
        img.src = url;
    });
}

function applyBrightnessContrast(data: Uint8ClampedArray, brightness: number, contrast: number) {
    const contrastFactor = (259 * (contrast + 255)) / (255 * (259 - contrast));
    for (let i = 0; i < data.length; i += 4) {
        // Apply brightness
        let r = data[i] + brightness;
        let g = data[i + 1] + brightness;
        let b = data[i + 2] + brightness;

        // Apply contrast
        r = contrastFactor * (r - 128) + 128;
        g = contrastFactor * (g - 128) + 128;
        b = contrastFactor * (b - 128) + 128;

        // Clamp values
        data[i] = Math.max(0, Math.min(255, r));
        data[i + 1] = Math.max(0, Math.min(255, g));
        data[i + 2] = Math.max(0, Math.min(255, b));
    }
}

export async function applyLocalDithering(imageUrl: string, settings: EngravingSettings): Promise<string> {
    const img = await loadImage(imageUrl);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) throw new Error("Could not get canvas context");

    const dpi = settings.resolution;
    const scaleFactor = dpi / 96; // 96 is a common base DPI for screens
    
    canvas.width = Math.floor(img.width * scaleFactor);
    canvas.height = Math.floor(img.height * scaleFactor);

    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const { data, width, height } = imageData;
    
    // First, apply brightness/contrast
    applyBrightnessContrast(data, settings.halftoneBrightness, settings.halftoneContrast);
    
    // Then, convert to grayscale
    const grayData = new Float32Array(width * height);
    for (let i = 0; i < data.length; i += 4) {
        const avg = (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114);
        const pixelIndex = i / 4;
        grayData[pixelIndex] = avg;
    }

    // Invert colors if needed
    if (settings.isInverse) {
        for (let i = 0; i < grayData.length; i++) {
            grayData[i] = 255 - grayData[i];
        }
    }


    // Apply dithering algorithm
    switch (settings.dithering) {
        case 'Umbral':
             for (let i = 0; i < grayData.length; i++) {
                const value = grayData[i] < settings.thresholdValue ? 0 : 255;
                const dataIndex = i * 4;
                data[dataIndex] = data[dataIndex + 1] = data[dataIndex + 2] = value;
                data[dataIndex + 3] = 255;
            }
            break;
        case 'Difusión de Error': // Floyd-Steinberg
            const levels = settings.errorDiffusionPaletteLevels;
            const step = 255 / (levels - 1);

            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    const i = y * width + x;
                    const oldPixel = grayData[i];
                    const newPixel = Math.round(oldPixel / step) * step;
                    const quantError = oldPixel - newPixel;

                    grayData[i] = newPixel;

                    if (x + 1 < width) grayData[i + 1] += quantError * 7 / 16;
                    if (x - 1 > 0 && y + 1 < height) grayData[i - 1 + width] += quantError * 3 / 16;
                    if (y + 1 < height) grayData[i + width] += quantError * 5 / 16;
                    if (x + 1 < width && y + 1 < height) grayData[i + 1 + width] += quantError * 1 / 16;
                }
            }
             for (let i = 0; i < grayData.length; i++) {
                const value = grayData[i];
                const dataIndex = i * 4;
                data[dataIndex] = data[dataIndex + 1] = data[dataIndex + 2] = value;
                data[dataIndex + 3] = 255;
            }
            break;
        
        case 'Semitono':
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, width, height);
            ctx.fillStyle = 'black';
            const size = settings.halftoneDotSize;
            for (let y = 0; y < height; y += size) {
                for (let x = 0; x < width; x += size) {
                    let total = 0;
                    let count = 0;
                    for (let j = 0; j < size && y + j < height; j++) {
                        for (let i = 0; i < size && x + i < width; i++) {
                            total += grayData[(y + j) * width + (x + i)];
                            count++;
                        }
                    }
                    const avg = total / count;
                    const radius = (1 - avg / 255) * (size / 2) * 1.414; // 1.414 allows dot to fill square
                    ctx.beginPath();
                    ctx.arc(x + size / 2, y + size / 2, radius, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
            return canvas.toDataURL();

        case 'Pop Art (Puntos)':
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, width, height);
            ctx.fillStyle = 'black';
            const dotSpacing = settings.popArtDotSpacing;
            const posterizeLevels = [64, 128, 192];

            for (let y = 0; y < height; y += dotSpacing) {
                for (let x = 0; x < width; x += dotSpacing) {
                    let total = 0;
                    let count = 0;
                    for (let j = 0; j < dotSpacing && y + j < height; j++) {
                        for (let i = 0; i < dotSpacing && x + i < width; i++) {
                            total += grayData[(y + j) * width + (x + i)];
                            count++;
                        }
                    }
                    const avg = total / count;
                    
                    let radius = 0;
                    if (avg < posterizeLevels[0]) {
                        radius = dotSpacing * 0.45;
                    } else if (avg < posterizeLevels[1]) {
                        radius = dotSpacing * 0.35;
                    } else if (avg < posterizeLevels[2]) {
                        radius = dotSpacing * 0.20;
                    }

                    if (radius > 0) {
                        ctx.beginPath();
                        ctx.arc(x + dotSpacing / 2, y + dotSpacing / 2, radius, 0, Math.PI * 2);
                        ctx.fill();
                    }
                }
            }
            return canvas.toDataURL();

        case 'Grabado Grunge':
            const grungeIntensity = settings.grungeIntensity;
            const threshold = 128;
            for (let i = 0; i < grayData.length; i++) {
                const noise = (Math.random() - 0.5) * grungeIntensity * 6;
                const value = (grayData[i] + noise) < threshold ? 0 : 255;
                const dataIndex = i * 4;
                data[dataIndex] = data[dataIndex + 1] = data[dataIndex + 2] = value;
                data[dataIndex + 3] = 255;
            }
            break;

        case 'Grabado Lineal':
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, width, height);
            ctx.fillStyle = 'black';
            const lineSpacing = settings.lineEngravingSpacing;
            for (let y = 0; y < height; y += lineSpacing) {
                for (let x = 0; x < width; x++) {
                    let localTotal = 0;
                    let localCount = 0;
                    for (let j = 0; j < lineSpacing && (y + j) < height; j++) {
                        localTotal += grayData[(y + j) * width + x];
                        localCount++;
                    }
                    const localAvg = localCount > 0 ? localTotal / localCount : 0;
                    const lineThickness = Math.round((1 - localAvg / 255) * lineSpacing);

                    if (lineThickness > 0) {
                        const lineY = y + Math.floor((lineSpacing - lineThickness) / 2);
                        ctx.fillRect(x, lineY, 1, lineThickness);
                    }
                }
            }
            return canvas.toDataURL();

        case 'Dibujo a Lápiz':
            const invertedCanvas = document.createElement('canvas');
            invertedCanvas.width = width;
            invertedCanvas.height = height;
            const invertCtx = invertedCanvas.getContext('2d', { willReadFrequently: true });
            if (!invertCtx) return canvas.toDataURL();

            const invertedImageData = invertCtx.createImageData(width, height);
            for (let i = 0; i < grayData.length; i++) {
                const invertedValue = 255 - grayData[i];
                invertedImageData.data[i * 4] = invertedValue;
                invertedImageData.data[i * 4 + 1] = invertedValue;
                invertedImageData.data[i * 4 + 2] = invertedValue;
                invertedImageData.data[i * 4 + 3] = 255;
            }
            invertCtx.putImageData(invertedImageData, 0, 0);

            const blurAmount = settings.pencilSketchBlur / 2;
            invertCtx.filter = `blur(${blurAmount}px)`;
            invertCtx.drawImage(invertedCanvas, 0, 0);
            invertCtx.filter = 'none';

            const blurredInvertedData = invertCtx.getImageData(0, 0, width, height).data;

            for (let i = 0; i < grayData.length; i++) {
                const bottom = grayData[i];
                const top = blurredInvertedData[i * 4];
                const blendValue = bottom === 255 ? 255 : Math.min(255, (bottom * 255) / (255 - top));
                
                let finalValue = 255 - Math.pow(255 - blendValue, settings.pencilSketchStrokeWeight);
                finalValue = Math.max(0, Math.min(255, finalValue));

                const dataIndex = i * 4;
                data[dataIndex] = finalValue;
                data[dataIndex + 1] = finalValue;
                data[dataIndex + 2] = finalValue;
                data[dataIndex + 3] = 255;
            }
            break;

        case 'Patrón Ordenado': // Bayer
            const bayerMatrices: { [key: number]: number[][] } = {
                2: [ [0, 2], [3, 1] ],
                4: [ [0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5] ],
                8: [ [0,32,8,40,2,34,10,42], [48,16,56,24,50,18,58,26], [12,44,4,36,14,46,6,38], [60,28,52,20,62,30,54,22], [3,35,11,43,1,33,9,41], [51,19,59,27,49,17,57,25], [15,47,7,39,13,45,5,37], [63,31,55,23,61,29,53,21] ]
            };
            const matrixSize = settings.orderedDitherMatrixSize;
            const bayerMatrix = bayerMatrices[matrixSize] || bayerMatrices[4];
            const divisor = matrixSize * matrixSize;
            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    const i = y * width + x;
                    const threshold = (bayerMatrix[y % matrixSize][x % matrixSize] / divisor) * 255;
                    const value = grayData[i] < threshold ? 0 : 255;
                    const dataIndex = i * 4;
                    data[dataIndex] = data[dataIndex + 1] = data[dataIndex + 2] = value;
                    data[dataIndex + 3] = 255;
                }
            }
            break;
    }

    ctx.putImageData(imageData, 0, 0);
    return canvas.toDataURL();
}