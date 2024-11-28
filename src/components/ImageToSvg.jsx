import  { useState, useRef } from 'react';
import {loadFromCanvas} from 'potrace-wasm';

const ImageToSvgConverter = () => {
  const [originalImage, setOriginalImage] = useState(null);
  const [svgImage, setSvgImage] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Read the uploaded image
    const reader = new FileReader();
    reader.onload = async (e) => {
      const img = new Image();
      img.onload = async () => {
        setOriginalImage(e.target.result);

        // Convert image to SVG using potrace
        try {
          // Initialize potrace
          let imgCanvas = document.createElement("canvas")
          imgCanvas.width = img.width;
          imgCanvas.height = img.height;
          let ctx = imgCanvas.getContext("2d");
          ctx.drawImage(img, 0, 0);

          // Convert image to SVG
          const svg = await loadFromCanvas(imgCanvas);
          setSvgImage(svg);
        } catch (error) {
          console.error('Conversion error:', error);
          alert('Failed to convert image to SVG');
        }
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleDownload = () => {
    if (!svgImage) return;

    // Create a Blob from the SVG string
    const blob = new Blob([svgImage], { type: 'image/svg+xml' });
    
    // Create a download link
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'converted-image.svg';
    link.click();
  };

  const handleClear = () => {
    setOriginalImage(null);
    setSvgImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-2xl font-bold mb-6 text-center">Image to SVG Converter</h1>
      
      <div className="mb-4">
        <input 
          type="file" 
          ref={fileInputRef}
          accept="image/*" 
          onChange={handleFileUpload} 
          className="w-full p-2 border rounded"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Original Image Preview */}
        <div className="border p-4 rounded">
          <h2 className="text-lg font-semibold mb-4">Original Image</h2>
          {originalImage ? (
            <img 
              src={originalImage} 
              alt="Original" 
              className="max-w-full max-h-80 mx-auto object-contain"
            />
          ) : (
            <p className="text-center text-gray-500">No image uploaded</p>
          )}
        </div>

        {/* SVG Preview */}
        <div className="border p-4 rounded">
          <h2 className="text-lg font-semibold mb-4">Converted SVG</h2>
          {svgImage ? (
            <div className='flex justify-center items-center'>
              <div 
                dangerouslySetInnerHTML={{ __html: svgImage }} 
                className="max-w-full max-h-80 mx-auto"
              />
            </div>
          ) : (
            <p className="text-center text-gray-500">No SVG generated</p>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4 mt-6">
        <button 
          onClick={handleDownload}
          disabled={!svgImage}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300"
        >
          Download SVG
        </button>
        <button 
          onClick={handleClear}
          className="px-4 py-2 ml-4 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Clear
        </button>
      </div>
    </div>
  );
};

export default ImageToSvgConverter;