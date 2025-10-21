import React from 'react';

// Types
export type GenerationType = 'text' | 'image' | 'drawing' | 'vectorize';

export const NEON_FONTS_DATA = [
  {
    name: 'Escrita Cursiva',
    family: "'Great Vibes', cursive",
    promptDescription: 'uma fonte de escrita cursiva fluida e elegante, com linhas finas e conectadas, como caligrafia manual.'
  },
  {
    name: 'Letras em Bloco Negrito',
    family: "'Oswald', sans-serif",
    promptDescription: 'uma fonte de bloco sans-serif em negrito, condensada e alta, com um visual forte, moderno e impactante.'
  },
  {
    name: 'Caligrafia Elegante',
    family: "'Tangerine', cursive",
    promptDescription: 'uma fonte caligráfica muito fina, elegante e formal, com floreios e um toque clássico e luxuoso.'
  },
  {
    name: 'Moderna Sem Serifa',
    family: "'Montserrat', sans-serif",
    promptDescription: 'uma fonte sans-serif geométrica, limpa e altamente legível, com um visual moderno e minimalista.'
  },
  {
    name: 'Estilo Vintage',
    family: "'Bebas Neue', sans-serif",
    promptDescription: 'uma fonte sans-serif condensada e exclusivamente em maiúsculas, com um estilo industrial e vintage, como as de cartazes antigos.'
  },
  {
    name: 'Tecnologia Futurista',
    family: "'Audiowide', sans-serif",
    promptDescription: 'uma fonte larga e geométrica com um toque de tecnologia e ficção científica, com cantos suavemente arredondados e um visual arrojado.'
  },
  {
    name: 'Neon Absolute Sans',
    family: "'Poppins', sans-serif",
    promptDescription: 'uma fonte sans-serif geométrica com cantos perfeitamente arredondados, resultando em um visual limpo, moderno e amigável para neon.'
  },
  {
    name: 'Resneo',
    family: "'Russo One', sans-serif",
    promptDescription: 'uma fonte sans-serif em negrito, com um design robusto e ligeiramente inclinado para a frente, transmitindo uma sensação de energia, esporte e força.'
  },
  {
    name: 'Monoton',
    family: "'Monoton', sans-serif",
    promptDescription: 'uma fonte de exibição metálica com linhas múltiplas e paralelas que imitam o estilo Art Déco dos letreiros de neon clássicos dos anos 30.'
  },
  {
    name: 'Lobster',
    family: "'Lobster', cursive",
    promptDescription: 'uma fonte de script em negrito, divertida e conectada, com um estilo casual, legível e retrô, muito popular em design gráfico.'
  },
  {
    name: 'Pacifico',
    family: "'Pacifico', cursive",
    promptDescription: 'uma fonte de script suave, arredondada e pincelada, inspirada na cultura do surf dos anos 50, com um toque divertido e amigável.'
  },
  {
    name: 'Righteous',
    family: "'Righteous', sans-serif",
    promptDescription: 'uma fonte de exibição inspirada na Art Déco, com formas geométricas e um toque retrô, mas com alta legibilidade e um estilo limpo.'
  },
  {
    name: 'Black Ops One',
    family: "'Black Ops One', sans-serif",
    promptDescription: 'uma fonte stencil militar, muito grossa e robusta, com cortes marcantes nas letras, criando um visual poderoso e impactante.'
  },
  {
    name: 'Gamer Pixel',
    family: "'Press Start 2P', cursive",
    promptDescription: 'uma fonte de pixel art no estilo 8-bit, como a de videogames clássicos, criando um visual retrô e gamer.'
  },
  {
    name: 'Urbano Vertical',
    family: "'Bungee', cursive",
    promptDescription: 'uma fonte de exibição em negrito e exclusivamente em maiúsculas, projetada para sinalização vertical, com um visual urbano e industrial forte.'
  }
] as const;


export const NEON_FONTS = NEON_FONTS_DATA.map(f => f.name);
export type NeonFont = (typeof NEON_FONTS_DATA)[number]['name'];

// FIX: Define NeonColor as an interface to allow for dynamically created colors
// from the image analysis, which won't have the literal types of the predefined constants.
export interface NeonColor {
  name: string;
  hex: string;
  tailwind: string;
  shadow: string;
}

// FIX: Type NEON_COLORS as a mutable array of NeonColor to resolve type conflicts
// with React state, which expects a mutable array.
export const NEON_COLORS: NeonColor[] = [
  { name: 'Rosa Shock', hex: '#FF10F0', tailwind: 'bg-[#FF10F0]', shadow: 'shadow-[#FF10F0]/50' },
  { name: 'Azul Ciano', hex: '#00FFFF', tailwind: 'bg-[#00FFFF]', shadow: 'shadow-[#00FFFF]/50' },
  { name: 'Verde Elétrico', hex: '#39FF14', tailwind: 'bg-[#39FF14]', shadow: 'shadow-[#39FF14]/50' },
  { name: 'Branco Puro', hex: '#FFFFFF', tailwind: 'bg-white', shadow: 'shadow-white/50' },
  { name: 'Laranja Pôr do Sol', hex: '#FFA500', tailwind: 'bg-orange-500', shadow: 'shadow-orange-500/50' },
  { name: 'Roxo Cósmico', hex: '#9D00FF', tailwind: 'bg-[#9D00FF]', shadow: 'shadow-[#9D00FF]/50' },
  { name: 'Vermelho Paixão', hex: '#FF0000', tailwind: 'bg-[#FF0000]', shadow: 'shadow-[#FF0000]/50' },
  { name: 'Branco Quente', hex: '#FDF4D4', tailwind: 'bg-[#FDF4D4]', shadow: 'shadow-[#FDF4D4]/50' },
];

export const BACKGROUNDS = [
  { name: 'Parede de Tijolos', url: 'https://picsum.photos/seed/brickwall/1024/768', description: 'uma parede de tijolos escuros aparentes' },
  { name: 'Cidade à Noite', url: 'https://picsum.photos/seed/nightcity/1024/768', description: 'uma rua noturna de cidade desfocada com luzes bokeh' },
  { name: 'Concreto Escuro', url: 'https://picsum.photos/seed/concrete/1024/768', description: 'uma parede de concreto escuro limpa com textura sutil' },
  { name: 'Fundo Minimalista', url: 'https://picsum.photos/seed/darkstudio/1024/768', description: 'um fundo de estúdio escuro e liso' },
  { name: 'Plantas Exuberantes', url: 'https://picsum.photos/seed/plants/1024/768', description: 'um jardim vertical fotorrealista com uma densa mistura de plantas tropicais, como samambaias, monsteras e filodendros. A iluminação deve ser sutil, criando sombras profundas entre as folhas para dar uma sensação de profundidade e realismo. Algumas folhas podem ter um brilho úmido, como se tivessem sido borrifadas com água.' },
  { name: 'Vitrine de Loja', url: 'https://picsum.photos/seed/shopwindow/1024/768', description: 'o letreiro visto através de uma vitrine de loja à noite, com reflexos sutis da rua' },
] as const;
export type Background = (typeof BACKGROUNDS)[number];

export const ACRYLIC_BASES = [
    { name: 'Transparente', description: 'uma base de acrílico perfeitamente transparente e cristalina, quase invisível' },
    { name: 'Preta', description: 'uma base de acrílico preto sólido e brilhante, que cria um contraste forte com o neon' },
] as const;
export type AcrylicBase = (typeof ACRYLIC_BASES)[number];

// Aspect Ratio Icons
const LandscapeIcon: React.FC<{className?: string}> = ({className}) => (
    <svg viewBox="0 0 16 9" className={className} fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <rect width="16" height="9" rx="1"/>
    </svg>
);
const PortraitIcon: React.FC<{className?: string}> = ({className}) => (
    <svg viewBox="0 0 9 16" className={className} fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <rect width="9" height="16" rx="1"/>
    </svg>
);
const SquareIcon: React.FC<{className?: string}> = ({className}) => (
    <svg viewBox="0 0 16 16" className={className} fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <rect width="16" height="16" rx="1"/>
    </svg>
);
const WideIcon: React.FC<{className?: string}> = ({className}) => (
    <svg viewBox="0 0 4 3" className={className} fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <rect width="4" height="3" rx="0.5"/>
    </svg>
);
const TallIcon: React.FC<{className?: string}> = ({className}) => (
    <svg viewBox="0 0 3 4" className={className} fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <rect width="3" height="4" rx="0.5"/>
    </svg>
);

export const ASPECT_RATIOS = [
  { name: 'Paisagem (16:9)', value: '16:9', icon: LandscapeIcon },
  { name: 'Retrato (9:16)', value: '9:16', icon: PortraitIcon },
  { name: 'Quadrado (1:1)', value: '1:1', icon: SquareIcon },
  { name: 'Largo (4:3)', value: '4:3', icon: WideIcon },
  { name: 'Alto (3:4)', value: '3:4', icon: TallIcon },
] as const;
export type AspectRatio = (typeof ASPECT_RATIOS)[number];

// Text Alignment Icons
const AlignLeftIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="currentColor" viewBox="0 0 24 24">
        <path d="M3 4h18v2H3V4zm0 5h12v2H3V9zm0 5h18v2H3v-2zm0 5h12v2H3v-2z"/>
    </svg>
);
const AlignCenterIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="currentColor" viewBox="0 0 24 24">
        <path d="M3 4h18v2H3V4zm3 5h12v2H6V9zm-3 5h18v2H3v-2zm3 5h12v2H6v-2z"/>
    </svg>
);
const AlignRightIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="currentColor" viewBox="0 0 24 24">
        <path d="M3 4h18v2H3V4zm6 5h12v2H9V9zm-6 5h18v2H3v-2zm6 5h12v2H9v-2z"/>
    </svg>
);

export const TEXT_ALIGNMENTS = [
    { name: 'Esquerda', value: 'left', promptValue: 'à esquerda', icon: AlignLeftIcon },
    { name: 'Centro', value: 'center', promptValue: 'centralizado', icon: AlignCenterIcon },
    { name: 'Direita', value: 'right', promptValue: 'à direita', icon: AlignRightIcon },
] as const;
export type TextAlign = (typeof TEXT_ALIGNMENTS)[number];

export interface UploadedImage {
  base64: string;
  mimeType: string;
  name: string;
}

// SVG Icon Components
export const TextIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-6 w-6"} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
);
  
export const ImageIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-6 w-6"} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);

export const DrawingIcon: React.FC<{className?: string}> = ({className}) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-6 w-6"} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" />
  </svg>
);

export const VectorIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-6 w-6"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 4.5v-3h-3v3h3zM19.5 4.5v-3h-3v3h3zM19.5 19.5v3h-3v-3h3zM4.5 19.5v3h-3v-3h3z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M1.5 12h3m15 0h3M12 1.5v3m0 15v3" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 4.5C4.5 4.5 9 13.5 12 13.5s7.5-9 7.5-9" />
    </svg>
);

export const UploadIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-8 w-8 text-gray-500"} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
    </svg>
);

export const DownloadIcon: React.FC<{className?: string}> = ({className}) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-6 w-6"} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
);