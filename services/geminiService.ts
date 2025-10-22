import { GoogleGenAI, Modality } from "@google/genai";

function base64ToGenAIPart(base64: string, mimeType: string) {
    return {
        inlineData: {
            data: base64,
            mimeType
        }
    };
}

export async function editImage(apiKey: string, model: string, base64Image: string, mimeType: string, prompt: string): Promise<{newBase64: string, newMimeType: string}> {
    try {
        const ai = new GoogleGenAI({ apiKey });
        const imagePart = base64ToGenAIPart(base64Image, mimeType);

        const response = await ai.models.generateContent({
            model: model,
            contents: {
                parts: [
                    imagePart,
                    { text: prompt }
                ]
            },
            config: {
                responseModalities: [Modality.IMAGE],
            }
        });
        
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                return {
                    newBase64: part.inlineData.data,
                    newMimeType: part.inlineData.mimeType
                };
            }
        }

        throw new Error("La IA no devolvió una imagen editada.");

    } catch (error) {
        console.error("Error al editar la imagen:", error);
        throw new Error("No se pudo conectar con el servicio de IA para editar la imagen.");
    }
}