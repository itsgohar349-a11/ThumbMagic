
import React from 'react';

const Loader: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="relative w-24 h-24">
        <div className="absolute inset-0 border-4 border-purple-400 rounded-full animate-spin border-t-transparent"></div>
        <div className="absolute inset-2 border-4 border-pink-400 rounded-full animate-spin animation-delay-[-0.1s] border-t-transparent"></div>
         <div className="absolute inset-4 border-4 border-blue-400 rounded-full animate-spin animation-delay-[-0.2s] border-t-transparent"></div>
      </div>
      <p className="text-lg font-semibold text-gray-300 animate-pulse">AI is creating your masterpieces...</p>
       <style>{`
        .animation-delay-[-0.1s] { animation-delay: -0.1s; }
        .animation-delay-[-0.2s] { animation-delay: -0.2s; }
      `}</style>
    </div>
  );
};

export default Loader;
