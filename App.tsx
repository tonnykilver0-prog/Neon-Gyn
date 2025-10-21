import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Loader from './components/Loader';
import ImageUploader from './components/ImageUploader';
import {
  GenerationType,
  NEON_FONTS_DATA,
  NEON_COLORS,
  BACKGROUNDS,
  ACRYLIC_BASES,
  ASPECT_RATIOS,
  TEXT_ALIGNMENTS,
  TextIcon,
  ImageIcon,
  DrawingIcon,
  VectorIcon,
  DownloadIcon,
} from './constants';
import type {
  NeonColor,
  Background,
  AcrylicBase,
  AspectRatio,
  UploadedImage,
  TextAlign,
} from './constants';
import { generateNeonSign, extractImageColors } from './services/geminiService';
import type { GenerationResult, GenerationOptions } from './services/geminiService';

const App: React.FC = () => {
  const [generationType, setGenerationType] = useState<GenerationType>('text');

  // State for text generation
  const [text, setText] = useState<string>('Neon Vibes');
  const [font, setFont] = useState<(typeof NEON_FONTS_DATA)[number]>(NEON_FONTS_DATA[0]);
  const [textAlign, setTextAlign] = useState<TextAlign>(TEXT_ALIGNMENTS[1]); // Default Center

  // State for drawing generation
  const [drawingDescription, setDrawingDescription] = useState<string>('Um gato astronauta');
  
  // Shared state for all generation types
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>(
    ASPECT_RATIOS[0]
  );
  const [color, setColor] = useState<NeonColor>(NEON_COLORS[0]);
  const [background, setBackground] = useState<Background>(BACKGROUNDS[0]);
  const [acrylicBase, setAcrylicBase] = useState<AcrylicBase>(ACRYLIC_BASES[0]);
  const [isNeonOn, setIsNeonOn] = useState(true);
  
  // State for image generation
  const [uploadedImage, setUploadedImage] = useState<UploadedImage | null>(
    null
  );
  const [extractedColors, setExtractedColors] = useState<NeonColor[]>([]);
  const [selectedColors, setSelectedColors] = useState<NeonColor[]>([]);
  const [isExtractingColors, setIsExtractingColors] = useState<boolean>(false);


  // Application flow state
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);

  const hexToNeonColor = (hex: string): NeonColor => ({
    name: hex,
    hex: hex,
    tailwind: '', // Use inline style for dynamic colors
    shadow: `shadow-[${hex}]/50`,
  });

  useEffect(() => {
    if (generationType === 'image') {
        if (uploadedImage) {
            const extract = async () => {
                setIsExtractingColors(true);
                setError(null);
                try {
                    const colorsHex = await extractImageColors(uploadedImage);
                    const neonColors = colorsHex.map(hexToNeonColor);
                    setExtractedColors(neonColors);

                    if (neonColors.length > 0) {
                        setSelectedColors([neonColors[0]]); // Auto-select the first extracted color
                    } else if (selectedColors.length === 0) {
                        // If no colors extracted and nothing is selected, select first default
                        setSelectedColors([NEON_COLORS[0]]);
                    }
                } catch (err) {
                    console.error(err);
                    setError("Erro ao extrair cores. Usando paleta padrão.");
                    setExtractedColors([]); // Clear extracted colors on error
                } finally {
                    setIsExtractingColors(false);
                }
            };
            extract();
        } else {
            // Image type is selected, but no image uploaded yet
            setExtractedColors([]);
            setSelectedColors([NEON_COLORS[0]]); // Default to first color from standard palette
        }
    } else {
        // Not image generation type
        setExtractedColors([]);
        setSelectedColors([]);
    }
  }, [generationType, uploadedImage]);


  const handleColorToggle = (toggledColor: NeonColor) => {
    setSelectedColors(prev => {
        const isSelected = prev.some(c => c.hex === toggledColor.hex);
        if (isSelected) {
            // Prevent deselecting the last remaining color
            if (prev.length === 1) return prev;
            return prev.filter(c => c.hex !== toggledColor.hex);
        } else {
            return [...prev, toggledColor];
        }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResultImage(null);

    try {
      let options: GenerationOptions;
      if (generationType === 'text') {
        if (!text.trim()) {
          setError('Por favor, insira um texto para o letreiro neon.');
          setLoading(false);
          return;
        }
        options = {
          type: 'text',
          text,
          font: font.promptDescription,
          color,
          background,
          aspectRatio: aspectRatio.value,
          textAlign: textAlign.promptValue,
          acrylicBase,
          isNeonOn,
        };
      } else if (generationType === 'image') {
        if (!uploadedImage) {
          setError('Por favor, envie uma imagem para transformar em neon.');
          setLoading(false);
          return;
        }
        if (selectedColors.length === 0) {
          setError('Por favor, selecione ao menos uma cor para o letreiro.');
          setLoading(false);
          return;
        }
        options = {
          type: 'image',
          image: uploadedImage,
          colors: selectedColors,
          background,
          aspectRatio: '1:1', 
          acrylicBase,
          isNeonOn,
        };
      } else if (generationType === 'vectorize') {
        if (!uploadedImage) {
          setError('Por favor, envie uma imagem para vetorizar.');
          setLoading(false);
          return;
        }
        options = {
          type: 'vectorize',
          image: uploadedImage,
          color, 
          background,
          aspectRatio: '1:1', 
          isNeonOn, // Not used, but required
        };
      } else { // drawing generation
        if (!drawingDescription.trim()) {
          setError('Por favor, descreva o desenho para o letreiro neon.');
          setLoading(false);
          return;
        }
        options = {
          type: 'drawing',
          description: drawingDescription,
          color,
          background,
          aspectRatio: aspectRatio.value,
          acrylicBase,
          isNeonOn,
        };
      }
      const result = await generateNeonSign(options);
      setResultImage(`data:${result.mimeType};base64,${result.base64}`);
    } catch (err) {
      let displayError = 'Ocorreu um erro desconhecido ao gerar a imagem.';
      if (err instanceof Error) {
        const message = err.message || '';
        if (message.includes('Responsible AI practices') || message.includes('SAFETY')) {
            displayError = 'A geração da imagem foi bloqueada pela política de segurança. Tente ajustar o texto ou a descrição.';
        } else {
            try {
                const match = message.match(/"message":\s*"(.*?)"/);
                if (match && match[1]) {
                    displayError = `Falha na geração: ${match[1]}`;
                } else {
                    displayError = `Falha na geração: ${message}`;
                }
            } catch (e) {
                displayError = `Falha na geração: ${message}`;
            }
        }
      }
      setError(displayError);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!resultImage) return;

    const mimeTypeMatch = resultImage.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/);
    const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : 'image/jpeg';
    const extension = mimeType.split('/')[1] || 'jpeg';

    const link = document.createElement('a');
    link.href = resultImage;
    link.download = `creator-neon.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderTextOptions = () => (
    <>
      <div className="space-y-2">
        <label
          htmlFor="text-input"
          className="block text-sm font-medium text-gray-300"
        >
          Texto do Letreiro
        </label>
        <textarea
          id="text-input"
          rows={3}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Digite seu texto aqui&#10;Use 'Enter' para uma nova linha"
          className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-white focus:ring-pink-500 focus:border-pink-500 resize-y"
        />
      </div>
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-300">
          Alinhamento do Texto
        </label>
        <div className="grid grid-cols-3 gap-2">
          {TEXT_ALIGNMENTS.map((align) => {
            const Icon = align.icon;
            return (
              <button
                key={align.value}
                type="button"
                onClick={() => setTextAlign(align)}
                title={align.name}
                aria-label={`Alinhar texto ${align.name}`}
                className={`flex items-center justify-center p-2 rounded-md transition-colors border-2 ${
                  textAlign.value === align.value
                    ? 'bg-gray-700 border-pink-500'
                    : 'bg-gray-800 border-gray-600 hover:border-pink-500'
                }`}
              >
                <Icon className="w-6 h-6 text-white" />
              </button>
            );
          })}
        </div>
      </div>
      <div className="space-y-2">
        <label
          htmlFor="font-select"
          className="block text-sm font-medium text-gray-300"
        >
          Fonte
        </label>
        <select
          id="font-select"
          value={font.name}
          onChange={(e) => {
            const selectedFont = NEON_FONTS_DATA.find(f => f.name === e.target.value);
            if (selectedFont) {
              setFont(selectedFont);
            }
          }}
          className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-white focus:ring-pink-500 focus:border-pink-500"
        >
          {NEON_FONTS_DATA.map((f) => (
            <option
              key={f.name}
              value={f.name}
              style={{ fontFamily: f.family, fontSize: '1.5rem' }}
            >
              {f.name}
            </option>
          ))}
        </select>
      </div>
    </>
  );

  const renderImageOptions = () => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-300">
        Sua Imagem
      </label>
      <ImageUploader
        onImageUpload={setUploadedImage}
        uploadedImage={uploadedImage}
      />
    </div>
  );

  const renderDrawingOptions = () => (
    <div className="space-y-2">
      <label
        htmlFor="drawing-input"
        className="block text-sm font-medium text-gray-300"
      >
        Descrição do Desenho
      </label>
      <textarea
        id="drawing-input"
        rows={3}
        value={drawingDescription}
        onChange={(e) => setDrawingDescription(e.target.value)}
        placeholder="Descreva o que você quer desenhar com neon..."
        className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-white focus:ring-pink-500 focus:border-pink-500 resize-y"
      />
    </div>
  );
  
  const renderAspectRatioOptions = () => (
     <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-300">
          Proporção da Imagem
        </label>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          {ASPECT_RATIOS.map((ar) => {
            const Icon = ar.icon;
            return (
              <button
                key={ar.value}
                type="button"
                onClick={() => setAspectRatio(ar)}
                title={ar.name}
                aria-label={`Selecionar proporção ${ar.name}`}
                className={`flex items-center justify-center w-12 h-12 rounded-md transition-colors border-2 ${
                  aspectRatio.value === ar.value
                    ? 'bg-gray-700 border-pink-500'
                    : 'bg-gray-800 border-gray-600 hover:border-pink-500'
                }`}
              >
                <Icon className="w-auto h-6 text-white" />
              </button>
            );
          })}
        </div>
      </div>
  );

  const renderMainOptions = () => {
    switch (generationType) {
      case 'text':
        return renderTextOptions();
      case 'image':
      case 'vectorize':
        return renderImageOptions();
      case 'drawing':
        return renderDrawingOptions();
      default:
        return null;
    }
  }

  return (
    <div
      className="min-h-screen bg-gray-900 text-white font-sans bg-cover bg-center"
      style={{ backgroundImage: "url('/dark-bg.jpg')" }}
    >
      <div className="min-h-screen bg-black bg-opacity-60 backdrop-blur-sm">
        <Header />
        <main className="container mx-auto p-4 md:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-gray-800 bg-opacity-50 p-6 rounded-lg shadow-2xl border border-gray-700">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex border-b border-gray-700">
                  <button
                    type="button"
                    onClick={() => setGenerationType('text')}
                    className={`flex items-center justify-center gap-2 flex-1 py-3 px-2 text-sm font-medium transition-colors ${
                      generationType === 'text'
                        ? 'border-b-2 border-pink-500 text-white'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <TextIcon className="w-5 h-5" />
                    Texto
                  </button>
                  <button
                    type="button"
                    onClick={() => setGenerationType('image')}
                    className={`flex items-center justify-center gap-2 flex-1 py-3 px-2 text-sm font-medium transition-colors ${
                      generationType === 'image'
                        ? 'border-b-2 border-pink-500 text-white'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <ImageIcon className="w-5 h-5" />
                    Imagem
                  </button>
                  <button
                    type="button"
                    onClick={() => setGenerationType('drawing')}
                    className={`flex items-center justify-center gap-2 flex-1 py-3 px-2 text-sm font-medium transition-colors ${
                      generationType === 'drawing'
                        ? 'border-b-2 border-pink-500 text-white'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <DrawingIcon className="w-5 h-5" />
                    Desenho
                  </button>
                  <button
                    type="button"
                    onClick={() => setGenerationType('vectorize')}
                    className={`flex items-center justify-center gap-2 flex-1 py-3 px-2 text-sm font-medium transition-colors ${
                      generationType === 'vectorize'
                        ? 'border-b-2 border-pink-500 text-white'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <VectorIcon className="w-5 h-5" />
                    Vetorizar
                  </button>
                </div>

                {renderMainOptions()}
                
                {(generationType !== 'image' && generationType !== 'vectorize') && renderAspectRatioOptions()}

                {generationType !== 'vectorize' && (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">
                      {generationType === 'image' ? 'Cores (selecione uma ou mais)' : 'Cor do Neon'}
                    </label>

                    {generationType === 'image' && isExtractingColors && (
                      <div className="flex items-center justify-center h-10">
                        <div className="w-6 h-6 border-2 border-dashed rounded-full animate-spin border-pink-500"></div>
                        <p className="ml-3 text-gray-400">Analisando cores da imagem...</p>
                      </div>
                    )}

                    {generationType === 'image' && !isExtractingColors && !uploadedImage && (
                       <p className="text-center text-sm text-gray-400 py-2">Envie uma imagem para cores sugeridas, ou escolha da paleta abaixo.</p>
                    )}

                    {generationType !== 'image' && (
                      <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
                        {NEON_COLORS.map((c) => {
                          const isSelected = color.hex === c.hex;
                          return (
                            <button
                              key={c.name + c.hex}
                              type="button"
                              onClick={() => setColor(c)}
                              title={c.name}
                              aria-label={`Selecionar cor ${c.name}`}
                              className={`w-10 h-10 rounded-full transition-all transform hover:scale-110 focus:outline-none ${c.tailwind} ${
                                isSelected
                                  ? `ring-2 ring-offset-2 ring-offset-gray-800 ring-white ${c.shadow}`
                                  : 'ring-1 ring-gray-600'
                              }`}
                              style={!c.tailwind ? { backgroundColor: c.hex } : {}}
                            />
                          );
                        })}
                      </div>
                    )}
                    
                    {generationType === 'image' && (
                      <div className='space-y-4'>
                        {extractedColors.length > 0 && !isExtractingColors && (
                            <div className="pt-2">
                              <p className="text-center text-sm font-medium text-gray-400 mb-3">Cores da Imagem</p>
                              <div className="flex flex-wrap items-center justify-center gap-4">
                                {extractedColors.map((c) => {
                                  const isSelected = selectedColors.some(sc => sc.hex === c.hex);
                                  return (
                                    <button
                                      key={`extracted-${c.hex}`}
                                      type="button"
                                      onClick={() => handleColorToggle(c)}
                                      title={c.name}
                                      aria-label={`Selecionar cor ${c.name}`}
                                      className={`w-10 h-10 rounded-full transition-all transform hover:scale-110 focus:outline-none ${
                                        isSelected ? 'ring-2 ring-offset-2 ring-offset-gray-800 ring-white' : 'ring-1 ring-gray-600'
                                      }`}
                                      style={{
                                        backgroundColor: c.hex,
                                        boxShadow: isSelected ? `0 0 15px ${c.hex}` : 'none',
                                      }}
                                    />
                                  );
                                })}
                              </div>
                            </div>
                        )}
                        <div className={extractedColors.length > 0 ? "pt-4 border-t border-gray-700" : "pt-2"}>
                            <p className="text-center text-sm font-medium text-gray-400 mb-3">Paleta Padrão</p>
                            <div className="flex flex-wrap items-center justify-center gap-4">
                            {NEON_COLORS.map((c) => {
                              const isSelected = selectedColors.some(sc => sc.hex === c.hex);
                              return (
                                <button
                                  key={`default-${c.hex}`}
                                  type="button"
                                  onClick={() => handleColorToggle(c)}
                                  title={c.name}
                                  aria-label={`Selecionar cor ${c.name}`}
                                  className={`w-10 h-10 rounded-full transition-all transform hover:scale-110 focus:outline-none ${c.tailwind} ${
                                    isSelected
                                      ? `ring-2 ring-offset-2 ring-offset-gray-800 ring-white ${c.shadow}`
                                      : 'ring-1 ring-gray-600'
                                  }`}
                                  style={!c.tailwind ? { backgroundColor: c.hex } : {}}
                                />
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                {generationType !== 'vectorize' && (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">
                      Fundo
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {BACKGROUNDS.map((bg) => (
                        <button
                          key={bg.name}
                          type="button"
                          onClick={() => setBackground(bg)}
                          className={`relative rounded-md border-2 overflow-hidden transition-all h-20 ${
                            background.name === bg.name
                              ? 'border-white'
                              : 'border-transparent hover:border-gray-400'
                          }`}
                        >
                          <img
                            src={bg.url}
                            alt={bg.name}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-end p-1">
                            <span className="text-xs text-white font-semibold">
                              {bg.name}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {generationType !== 'vectorize' && (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">
                      Tipo de Fundo Acrílico
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {ACRYLIC_BASES.map((base) => (
                        <button
                          key={base.name}
                          type="button"
                          onClick={() => setAcrylicBase(base)}
                          className={`p-3 rounded-md border-2 transition-colors ${
                            acrylicBase.name === base.name
                              ? 'bg-gray-700 border-pink-500 text-white'
                              : 'bg-gray-800 border-gray-600 hover:border-pink-500 text-gray-300'
                          }`}
                        >
                          {base.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {generationType !== 'vectorize' && (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">
                      Estado do Letreiro
                    </label>
                    <div className="flex items-center justify-center p-2 bg-gray-900 rounded-lg">
                      <span className="font-audiowide text-lg text-gray-400 tracking-widest mr-4">STATE</span>
                      <button
                        type="button"
                        onClick={() => setIsNeonOn(!isNeonOn)}
                        className="relative inline-flex items-center h-8 rounded-full w-28 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-pink-500 bg-black/50"
                      >
                        <span className="sr-only">Ligar ou desligar o letreiro</span>
                        <span
                          className={`absolute left-1 top-1 w-12 h-6 rounded-full bg-gray-700 transition-transform duration-300 ease-in-out ${
                            isNeonOn ? 'transform translate-x-14' : ''
                          }`}
                        />
                        <span
                          aria-hidden="true"
                          className={`absolute left-0 w-1/2 h-full flex items-center justify-center font-audiowide text-sm transition-colors ${
                            !isNeonOn ? 'text-pink-500' : 'text-gray-500'
                          }`}
                        >
                          OFF
                        </span>
                        <span
                          aria-hidden="true"
                          className={`absolute right-0 w-1/2 h-full flex items-center justify-center font-audiowide text-sm transition-colors ${
                            isNeonOn ? 'text-pink-500' : 'text-gray-500'
                          }`}
                        >
                          ON
                        </span>
                      </button>
                    </div>
                  </div>
                )}


                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-pink-600 hover:bg-pink-700 disabled:bg-pink-800 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg shadow-lg transition-transform transform hover:scale-105"
                >
                  {loading ? 'Gerando...' : 'Criar Letreiro Neon'}
                </button>
              </form>
            </div>

            <div className="bg-gray-800 bg-opacity-50 p-6 rounded-lg shadow-2xl border border-gray-700 flex items-center justify-center min-h-[400px] lg:min-h-0">
              {loading && <Loader />}
              {error && <p className="text-red-400 text-center">{error}</p>}
              {!loading && !error && resultImage && (
                <div className="relative w-full h-full flex flex-col items-center justify-center">
                   <img
                    src={resultImage}
                    alt="Generated neon sign"
                    className="rounded-lg shadow-2xl w-full max-h-[75vh] object-contain"
                  />
                  <button
                    onClick={handleDownload}
                    className="absolute top-2 right-2 bg-pink-600 hover:bg-pink-700 text-white font-bold p-2 rounded-full shadow-lg transition-transform transform hover:scale-110"
                    aria-label="Baixar Imagem"
                  >
                    <DownloadIcon className="w-6 h-6" />
                  </button>
                </div>
              )}
              {!loading && !error && !resultImage && (
                <div className="text-center text-gray-400">
                  <p className="text-lg">Sua arte neon aparecerá aqui.</p>
                  <p className="text-sm">
                    Configure as opções e clique em "Criar".
                  </p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;