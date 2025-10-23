
import React from 'react';

interface ImageCardProps {
  style: string;
  imageUrl: string;
}

const DownloadIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
);


const ImageCard: React.FC<ImageCardProps> = ({ style, imageUrl }) => {
  const downloadImage = () => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `thumbnail_${style.toLowerCase().replace(' ', '_')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="group relative overflow-hidden rounded-lg shadow-xl aspect-video bg-gray-700">
      <img src={imageUrl} alt={`Generated thumbnail in ${style} style`} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
      <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col justify-between p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <h3 className="text-lg font-bold text-white drop-shadow-md">{style}</h3>
        <button
          onClick={downloadImage}
          className="self-end bg-white/20 backdrop-blur-sm text-white p-2 rounded-full hover:bg-white/30 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-400"
          aria-label={`Download ${style} image`}
        >
          <DownloadIcon />
        </button>
      </div>
       <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent group-hover:opacity-0 transition-opacity duration-300">
          <h3 className="text-md font-semibold text-white text-center drop-shadow-lg">{style}</h3>
      </div>
    </div>
  );
};

export default ImageCard;
