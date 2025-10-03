import { GoogleGenAI, Modality, Type } from '@google/genai';
import type { NeonColor, Background, UploadedImage, AspectRatio, TextAlign } from '../constants';

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
        contents: {
            parts: [imagePart, { text: textPrompt }]
        },
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
  isNeonOn: boolean;
}

interface ImageNeonOptions {
  type: 'image';
  image: UploadedImage;
  colors: NeonColor[];
  background: Background;
  aspectRatio: AspectRatio['value'];
  isNeonOn: boolean;
}

interface DrawingNeonOptions {
  type: 'drawing';
  description: string;
  color: NeonColor;
  background: Background;
  aspectRatio: AspectRatio['value'];
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
  
  const onStateDescription = options.isNeonOn
    ? 'A luz de neon deve estar acesa, brilhando intensamente com um brilho vibrante e realista.'
    : `A luz de neon deve estar apagada. Os tubos devem ser visíveis com sua cor leitosa e fosca, sem emitir nenhuma luz ou brilho.`;

  const realismDescription = options.isNeonOn
    ? 'Foque no realismo, com um brilho sutil da luz e reflexos nas superfícies ao redor.'
    : 'A imagem deve ser fotorrealista, focando na textura dos materiais (silicone/PVC do neon, acrílico da base) sob iluminação ambiente neutra, sem o brilho do próprio letreiro.';


  if (options.type === 'text' || options.type === 'drawing') {
    model = 'imagen-4.0-generate-001';
    let prompt: string;
    
    if (options.type === 'text') {
      prompt = `Crie uma imagem fotorrealista de um letreiro de neon.
        - O letreiro deve exibir o texto exato, respeitando as quebras de linha: "${options.text}".
        - Se houver várias linhas de texto, o alinhamento entre elas deve ser ${options.textAlign}.
        - O estilo do texto deve ser especificamente: ${options.font}.
        - **MATERIAL:** O letreiro deve ser feito de um moderno material de LED neon flexível (silicone/PVC borrachudo) com exatamente 7mm de espessura, criando uma luz difusa e uniforme. **NÃO USE o estilo de tubo de vidro tradicional.**
        - A cor da luz de neon (quando acesa) deve ser um vibrante ${options.color.name} (${options.color.hex}).
        - ${onStateDescription}
        - O letreiro de neon deve ser montado sobre uma base de acrílico transparente. A base deve ser cortada para seguir precisely o contorno do texto, não um retângulo, e ser quase invisível, exceto por reflexos sutis da luz.
        - O fundo deve ser ${options.background.description}.
        - A imagem deve ter uma estética futurista e de alta qualidade.
        - O ângulo da câmera deve ser ligeiramente descentralizado para dar uma sensação dinâmica.
        - ${realismDescription}
        - **REGRA ESTRITA:** A imagem final NÃO DEVE conter NENHUM outro texto, letra, número ou caractere além do texto exato especificado acima.
      `;
    } else { // Drawing type
      prompt = `Crie uma imagem fotorrealista de um letreiro de neon.
        - O letreiro de neon NÃO deve ser um texto, mas sim um DESENHO de um(a) "${options.description}".
        - O estilo do desenho deve ser minimalista e de contorno, como um ícone ou um desenho de linha.
        - **MATERIAL:** O letreiro deve ser feito de um moderno material de LED neon flexível (silicone/PVC borrachudo) com exatamente 7mm de espessura, criando uma luz difusa e uniforme. **NÃO USE o estilo de tubo de vidro tradicional.**
        - A cor da luz de neon (quando acesa) deve ser um vibrante ${options.color.name} (${options.color.hex}).
        - ${onStateDescription}
        - O letreiro de neon deve ser montado sobre uma base de acrílico transparente. A base deve ser cortada para seguir precisely o contorno do desenho, não um retângulo, e ser quase invisível, exceto por reflexos sutis da luz.
        - O fundo deve ser ${options.background.description}.
        - A imagem deve ter uma estética futurista e de alta qualidade.
        - O ângulo da câmera deve ser ligeiramente descentralizado para dar uma sensação dinâmica.
        - ${realismDescription}
        - **REGRA ESTRITA:** A imagem NÃO DEVE conter NENHUM texto, letra, número ou palavra. O letreiro deve ser exclusivamente um desenho.
      `;
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
    model = 'gemini-2.5-flash-image-preview';
    const imagePart = fileToGenerativePart(options.image.base64, options.image.mimeType);
    
    const onOffState = options.isNeonOn
      ? 'A luz do letreiro de neon está acesa, emitindo um brilho vibrante e realista.'
      : 'A luz do letreiro de neon está apagada. O material de silicone/PVC do neon deve ser visível em sua cor fosca, sem emitir luz ou brilho.';
    
    let textPrompt: string;
    let errorContext: string;

    if (options.type === 'vectorize') {
        errorContext = "Vetorização de Imagem";
        textPrompt = `
**TAREFA PRINCIPAL:** Transformar a imagem fornecida em uma arte de linha vetorial. A saída deve ser APENAS as linhas de contorno do design.

**REGRAS ABSOLUTAS (NÃO PODE FALHAR):**
1.  **SEM PREENCHIMENTO:** É proibido preencher qualquer área. A imagem final deve ser composta exclusivamente por linhas, com o interior das formas totalmente branco.
2.  **UMA ÚNICA LINHA (CONTORNO):** Para cada forma na imagem, gere apenas a sua linha de contorno. Não crie silhuetas ou formas sólidas. Se a imagem for um círculo preenchido, a saída deve ser somente a linha da circunferência.
3.  **ESPESSURA UNIFORME:** TODAS as linhas, sem exceção, devem ter exatamente a mesma espessura. Não pode haver variação de espessura em nenhuma parte do desenho.

**TRATAMENTO DE TEXTO (REGRA ESPECIAL):**
*   Se a imagem contiver múltiplos elementos de texto de tamanhos diferentes, identifique o texto principal (o maior e mais proeminente).
*   Para qualquer texto secundário (menor que o principal), ele deve ser representado como uma única linha de texto simplificada.
*   Esta linha de texto simplificada deve ser centralizada horizontalmente em relação à sua posição original.

**INSTRUÇÕES ADICIONAIS:**
*   O resultado deve ser linhas pretas sobre um fundo perfeitamente branco.
*   Remova qualquer cor, sombra, brilho ou textura da imagem original.
*   Mantenha as proporções originais do desenho.
*   A saída deve ser apenas a imagem. Não inclua texto explicativo.
        `;
    } else { // 'image' type
        errorContext = "Edição de Imagem";
        const colorPrompt = options.colors.length > 1
          ? `O letreiro deve incorporar criativamente as seguintes cores: ${options.colors.map(c => `${c.name} (${c.hex})`).join(', ')}.`
          : `A cor do letreiro deve ser ${options.colors[0].name} (${options.colors[0].hex}).`;
        
        textPrompt = `
**OBJETIVO:** Transformar a silhueta de um objeto da imagem fornecida em um letreiro de neon fotorrealista e colocá-lo em um novo fundo.

**PROCESSO:**
1.  **EXTRAIR CONTORNO:** Analise a imagem de entrada e extraia o **contorno externo** da forma principal. Imagine que você está traçando a borda mais externa da silhueta do objeto. **NÃO GERE UMA LINHA CENTRAL OU UM ESQUELETO DA FORMA.** O resultado deve ser a linha que define a borda externa completa. Ignore todos os detalhes internos, cores, texturas, preenchimentos e o fundo da imagem original.
2.  **CRIAR LETREIRO NEON:** Use o contorno extraído para construir um letreiro de neon com as seguintes propriedades:
    *   **Material:** LED neon flexível de silicone/PVC fosco, com 7mm de espessura.
    *   **Cor (quando aceso):** ${colorPrompt}
    *   **Base:** Acrílico transparente cortado para seguir perfeitamente o formato do contorno.
    *   ${onOffState}
3.  **COMPOR CENA:** Coloque o letreiro de neon gerado sobre este fundo: "${options.background.description}".

**ESPECIFICAÇÕES DE SAÍDA:**
*   **Formato:** Apenas uma imagem. Sem texto, sem explicações.
*   **Conteúdo:** A imagem final deve conter apenas o letreiro de neon na base de acrílico sobre o novo fundo especificado.
*   **Estilo:** Fotorrealista e de alta qualidade.

**REGRAS ESTRITAS (NÃO FAZER):**
*   NÃO inclua nenhuma cor, textura ou preenchimento da imagem original no letreiro de neon.
*   NÃO reproduza o fundo da imagem original.
*   NÃO responda com texto. A única saída deve ser a imagem gerada.
*   **NÃO adicione nenhum texto, letra ou número à imagem final.** O resultado deve ser puramente visual, baseado no contorno da imagem original.
        `;
    }
    
    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: [imagePart, { text: textPrompt }],
      },
      config: {
        responseModalities: [Modality.IMAGE, Modality.TEXT],
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