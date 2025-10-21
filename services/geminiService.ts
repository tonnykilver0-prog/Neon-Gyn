import { GoogleGenAI, Modality, Type } from '@google/genai';
import type { NeonColor, Background, UploadedImage, AspectRatio, TextAlign, AcrylicBase } from '../constants';

const GOOGLE_API_KEY = process.env.API_KEY;
if (!GOOGLE_API_KEY) {
  throw new Error("Chave da API Gemini não encontrada. Por favor, defina a variável de ambiente API_KEY.");
}
const ai = new GoogleGenAI({ apiKey: GOOGLE_API_KEY });

export const extractImageColors = async (image: UploadedImage): Promise<string[]> => {
    const model = 'gemini-2.5-flash';
    const imagePart = fileToGenerativePart(image.base64, image.mimeType);
    const textPrompt = `Analise a imagem fornecida e extraia as 5 cores mais dominantes, excluindo o branco puro, o preto puro e os tons de cinza muito próximos do preto ou branco. Retorne as cores como um array JSON de strings hexadecimais (por exemplo, ["#FF5733", "#33FF57"]). Apenas o array JSON deve ser retornado.`;

    const response = await ai.models.generateContent({
        model,
        contents: { parts: [imagePart, { text: textPrompt }] },
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    colors: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.STRING
                        }
                    }
                },
                required: ["colors"],
            }
        }
    });

    try {
        const jsonString = response.text.trim();
        const json = JSON.parse(jsonString);
        if (json.colors && Array.isArray(json.colors)) {
            return json.colors.filter(color => typeof color === 'string' && /^#[0-9A-F]{6}$/i.test(color));
        }
        return [];
    } catch (e) {
        console.error("Falha ao analisar a resposta JSON de extração de cores:", e);
        console.error("Resposta recebida:", response.text);
        return [];
    }
};

interface TextNeonOptions {
  type: 'text';
  text: string;
  font: string;
  color: NeonColor;
  background: Background;
  aspectRatio: AspectRatio['value'];
  textAlign: TextAlign['promptValue'];
  acrylicBase: AcrylicBase;
  isNeonOn: boolean;
}

interface ImageNeonOptions {
  type: 'image';
  image: UploadedImage;
  colors: NeonColor[];
  background: Background;
  aspectRatio: AspectRatio['value'];
  acrylicBase: AcrylicBase;
  isNeonOn: boolean;
}

interface DrawingNeonOptions {
  type: 'drawing';
  description: string;
  color: NeonColor;
  background: Background;
  aspectRatio: AspectRatio['value'];
  acrylicBase: AcrylicBase;
  isNeonOn: boolean;
}

interface VectorizeNeonOptions {
  type: 'vectorize';
  image: UploadedImage;
  color: NeonColor;
  background: Background;
  aspectRatio: AspectRatio['value'];
  isNeonOn: boolean;
}


export type GenerationOptions = TextNeonOptions | ImageNeonOptions | DrawingNeonOptions | VectorizeNeonOptions;

export interface GenerationResult {
  base64: string;
  mimeType: string;
}

const fileToGenerativePart = (base64: string, mimeType: string) => {
  return {
    inlineData: {
      data: base64,
      mimeType,
    },
  };
};

const performSingleGeneration = async (options: GenerationOptions): Promise<GenerationResult> => {
  let model: string;

  if (options.type === 'text' || options.type === 'drawing') {
    model = 'imagen-4.0-generate-001';
    let prompt: string;
    
    const onOffState = options.isNeonOn ? 'aceso, com um brilho vibrante e realista' : 'apagado, mostrando os tubos de silicone/pvc de cor leitosa';

    if (options.type === 'text') {
      const textContent = options.text;
      prompt = `Um letreiro de neon fotorrealista com o texto abaixo. O texto deve ser renderizado exatamente como está, respeitando as quebras de linha.
---
${textContent}
---
Estilo da fonte: ${options.font}.
Alinhamento do texto: ${options.textAlign}.
Cor do neon: ${options.color.name} (${options.color.hex}).
O letreiro é feito de LED neon flexível moderno, montado em uma base de acrílico ${options.acrylicBase.description} cortada no formato do texto.
O neon está ${onOffState}.
O fundo da cena é: ${options.background.description}.
A imagem deve ser de alta qualidade, limpa e com estética profissional.`;
    } else { // Drawing type
      prompt = `Um letreiro de neon fotorrealista de um desenho de contorno minimalista de "${options.description}", sem nenhum texto.
Cor do neon: ${options.color.name} (${options.color.hex}).
O material é LED neon flexível moderno, montado em uma base de acrílico ${options.acrylicBase.description} cortada no formato do desenho.
O neon está ${onOffState}.
O fundo da cena é: ${options.background.description}.
A imagem deve ser de alta qualidade, com estética futurista e limpa.`;
    }

    const response = await ai.models.generateImages({
      model,
      prompt,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/jpeg',
        aspectRatio: options.aspectRatio,
      },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
      return { 
        base64: response.generatedImages[0].image.imageBytes,
        mimeType: 'image/jpeg'
      };
    } else {
      throw new Error('A geração da imagem falhou, nenhuma imagem foi retornada.');
    }
  } else {
    // Handles 'image' and 'vectorize' types
    model = 'gemini-2.5-flash-image';
    const imagePart = fileToGenerativePart(options.image.base64, options.image.mimeType);
    
    const onOffState = options.isNeonOn
      ? 'aceso, emitindo um brilho vibrante e realista'
      : 'apagado, com o material de silicone/PVC do neon visível em sua cor fosca';
    
    let textPrompt: string;
    let errorContext: string;

    if (options.type === 'vectorize') {
        errorContext = "Vetorização de Imagem";
        textPrompt = `Transforme a imagem fornecida em uma arte de linha de contorno simples. O resultado deve ter apenas linhas de contorno pretas com espessura uniforme sobre um fundo branco puro. Remova todas as cores, sombras, texturas e preenchimentos da imagem original, mantendo as proporções. A saída deve ser apenas a imagem da arte de linha.`;
    } else { // 'image' type
        errorContext = "Edição de Imagem";
        const colorPrompt = options.colors.length > 1
          ? `O letreiro deve incorporar criativamente as seguintes cores: ${options.colors.map(c => `${c.name} (${c.hex})`).join(', ')}.`
          : `A cor do letreiro deve ser ${options.colors[0].name} (${options.colors[0].hex}).`;
        
        textPrompt = `Use a imagem fornecida como um gabarito/molde exato. Sua tarefa é transformar a arte na imagem (que pode incluir texto, desenhos ou ambos) em um letreiro de neon fotorrealista.

**Instruções Críticas:**
1.  **Rastreamento Preciso:** O letreiro de neon deve ser criado traçando CUIDADOSAMENTE e APENAS o contorno de TODOS os elementos presentes na imagem. Siga todas as linhas, curvas e formas com alta fidelidade.
2.  **Apenas Contorno:** NÃO preencha nenhuma forma ou área. Apenas o contorno deve ser transformado em um tubo de neon brilhante.
3.  **Espessura Uniforme:** O tubo de neon deve ter uma espessura única e uniforme em todo o design.

**Especificações do Design:**
-   **Cores do Neon:** ${colorPrompt}
-   **Base:** O letreiro é montado em uma base de acrílico ${options.acrylicBase.description} que é precisamente cortada para seguir o contorno do design.
-   **Estado do Neon:** ${onOffState}.
-   **Fundo:** O fundo da cena é: "${options.background.description}". O fundo original da imagem de entrada deve ser completamente removido e substituído.
-   **Qualidade Final:** O resultado deve ser uma imagem de alta qualidade, limpa, nítida e fotorrealista.`;
    }
    
    const response = await ai.models.generateContent({
      model,
      contents: { parts: [imagePart, { text: textPrompt }] },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    const imagePartData = response?.candidates?.[0]?.content?.parts?.find(
      (part) => part.inlineData
    )?.inlineData;

    if (imagePartData) {
      return {
        base64: imagePartData.data,
        mimeType: imagePartData.mimeType,
      };
    }

    console.error(`Resposta da API Gemini (${errorContext}) sem imagem:`, JSON.stringify(response, null, 2));
    throw new Error(`A ${errorContext === 'Edição de Imagem' ? 'edição' : 'vetorização'} da imagem falhou. A resposta do modelo não continha uma imagem.`);
  }
};

export const generateNeonSign = async (options: GenerationOptions): Promise<GenerationResult> => {
    const result = await performSingleGeneration(options);

    if (!result) {
        throw new Error("Falha ao gerar o letreiro neon.");
    }

    return result;
};