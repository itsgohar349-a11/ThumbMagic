import React, { useState, useCallback, useRef } from 'react';
import { generateThumbnails } from './services/geminiService';
import type { GeneratedImage } from './services/geminiService';
import Loader from './components/Loader';
import ImageCard from './components/ImageCard';

const UploadIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
  </svg>
);

const App: React.FC = () => {
  const [uploadedImage1, setUploadedImage1] = useState<{ file: File; dataUrl: string; } | null>(null);
  const [uploadedImage2, setUploadedImage2] = useState<{ file: File; dataUrl: string; } | null>(null);
  const [headlineText, setHeadlineText] = useState<string>('');
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef1 = useRef<HTMLInputElement>(null);
  const fileInputRef2 = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>, imageSlot: 1 | 2) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageData = { file, dataUrl: reader.result as string };
        if (imageSlot === 1) {
          setUploadedImage1(imageData);
        } else {
          setUploadedImage2(imageData);
        }
        setGeneratedImages([]);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateClick = useCallback(async () => {
    if (!uploadedImage1) {
      setError('Please upload at least one image.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setGeneratedImages([]);

    try {
      const results = await generateThumbnails(uploadedImage1.file, uploadedImage2?.file ?? null, headlineText);
      setGeneratedImages(results);
    } catch (err) {
      console.error(err);
      setError('Failed to generate images. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [uploadedImage1, uploadedImage2, headlineText]);

  return (
    <div className="min-h-screen bg-gray-900 font-sans text-gray-200">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
            AI Thumbnail Generator
          </h1>
          <p className="mt-2 text-lg text-gray-400">Turn one or two images into a stunning, clickable thumbnail.</p>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <aside className="lg:col-span-4 p-6 bg-gray-800/50 rounded-2xl border border-gray-700 shadow-lg">
            <h2 className="text-2xl font-bold mb-6 text-white">1. Configure Your Thumbnail</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Upload Image 1</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, 1)}
                  ref={fileInputRef1}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef1.current?.click()}
                  className="w-full text-center py-4 px-4 border-2 border-dashed border-gray-600 rounded-lg hover:bg-gray-700 hover:border-purple-500 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <UploadIcon />
                  <span className="mt-2 block text-sm text-gray-400">{uploadedImage1 ? uploadedImage1.file.name : 'Click to upload'}</span>
                </button>
              </div>

               <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Upload Image 2 (Optional - for merging)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, 2)}
                  ref={fileInputRef2}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef2.current?.click()}
                  className="w-full text-center py-4 px-4 border-2 border-dashed border-gray-600 rounded-lg hover:bg-gray-700 hover:border-purple-500 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <UploadIcon />
                  <span className="mt-2 block text-sm text-gray-400">{uploadedImage2 ? uploadedImage2.file.name : 'Click to upload'}</span>
                </button>
              </div>

              <div>
                <label htmlFor="headline" className="block text-sm font-medium text-gray-400 mb-2">Add Headline Text (Optional)</label>
                <textarea
                  id="headline"
                  value={headlineText}
                  onChange={(e) => setHeadlineText(e.target.value)}
                  placeholder="e.g., My Epic Adventure! ✨"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                  rows={3}
                />
                 <p className="text-xs text-gray-500 mt-1">If left empty, AI will suggest a headline.</p>
              </div>

              <button
                onClick={handleGenerateClick}
                disabled={!uploadedImage1 || isLoading}
                className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-lg shadow-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 disabled:transform-none"
              >
                {isLoading ? 'Generating Magic...' : '✨ Generate Thumbnails'}
              </button>
            </div>
          </aside>

          <section className="lg:col-span-8 p-6 bg-gray-800/50 rounded-2xl border border-gray-700 shadow-lg min-h-[500px] flex items-center justify-center">
            {isLoading ? (
              <Loader />
            ) : error ? (
              <div className="text-center text-red-400">
                <p className="text-xl font-semibold">An Error Occurred</p>
                <p>{error}</p>
              </div>
            ) : generatedImages.length > 0 ? (
              <div className="w-full">
                 <h2 className="text-2xl font-bold mb-4 text-white">2. Download Your Results</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {generatedImages.map((image) => (
                    <ImageCard key={image.style} style={image.style} imageUrl={image.imageUrl} />
                  ))}
                </div>
              </div>
            ) : (
               <div className="text-center text-gray-500 flex flex-col items-center justify-center gap-4">
                {uploadedImage1 ? (
                  <div className="flex flex-wrap items-center justify-center gap-4">
                    <img src={uploadedImage1.dataUrl} alt="Uploaded preview 1" className="max-h-[250px] max-w-[50%] rounded-lg shadow-md object-contain" />
                    {uploadedImage2 && <img src={uploadedImage2.dataUrl} alt="Uploaded preview 2" className="max-h-[250px] max-w-[50%] rounded-lg shadow-md object-contain" />}
                  </div>
                ) : (
                  <div>
                    <p className="text-lg">Your generated thumbnails will appear here.</p>
                    <p className="text-sm">Start by uploading an image.</p>
                  </div>
                )}
                 {uploadedImage1 && <p className="mt-4 text-sm">Your uploaded image(s) are shown above. Ready to generate?</p>}
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
};

export default App;