import React from 'react';

const Loader: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center space-y-4 p-4 text-center">
            <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-pink-500"></div>
            <p className="text-white text-lg font-semibold tracking-wider">Gerando Sua Obra-Prima Neon...</p>
            <p className="text-gray-400 text-sm">Isso pode levar um momento, especialmente para designs complexos.</p>
        </div>
    );
}

export default Loader;