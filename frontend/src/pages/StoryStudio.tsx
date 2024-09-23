import React, { useState, useRef, useCallback, ChangeEvent, MouseEvent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoaderBlur } from './Loder';
import { toast,ToastContainer } from 'react-toastify';
import { apiUrl } from '../context/Context';

const StoryEditor = () => {

  const navigate = useNavigate();

  const [media, setMedia] = useState<string | null>(null);
  const [preview, setPreview] = useState<{url: string, type: string} | null>(null);
  const [textPosition, setTextPosition] = useState({ x: 50, y: 50 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showText, setShowText] = useState(false);
  const [textContent, setTextContent] = useState('');
  const [fontSize, setFontSize] = useState('16px');
  const [textColor, setTextColor] = useState('white');
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; show: boolean; move: boolean; resize: boolean }>({ x: 0, y: 0, show: false, move: false, resize: false });
  const [elementDimensions, setElementDimensions] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

  const textRef = useRef<HTMLParagraphElement>(null);

  // Handle file input change
  const handleMediaChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview({url: reader.result as string, type: file.type});
        setMedia(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  // Handle mouse down event for dragging text
  const handleTextMouseDown = (e: React.MouseEvent) => {
    if (contextMenu.move) {
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
      e.preventDefault();
    }
  };

  // Handle mouse move event for dragging text
  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging && dragStart) {
      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;
      setTextPosition(prev => ({
        x: prev.x + dx,
        y: prev.y + dy
      }));
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  // Handle mouse up event to stop dragging
  const handleMouseUp = () => {
    setIsDragging(false);
    setDragStart(null);
  };

  // Handle text content change
  const handleTextChange = (e: React.SyntheticEvent<HTMLParagraphElement, InputEvent>) => {
    setTextContent(e.currentTarget.textContent || '');
  };

  // Handle context menu display
  const handleTextContextMenu = (e: MouseEvent) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      show: true,
      move: contextMenu.move,
      resize: contextMenu.resize
    });
  };

  // Handle context menu options
  const handleContextMenuOption = (option: string) => {
    setContextMenu(prev => ({ ...prev, show: false }));
    switch (option) {
      case 'color':
        const color = prompt('Enter text color (e.g., #ff0000):', textColor);
        if (color) setTextColor(color);
        break;
      case 'font-size':
        const size = prompt('Enter font size (e.g., 20px):', fontSize);
        if (size) setFontSize(size);
        break;
      case 'move':
        setContextMenu(prev => ({ ...prev, move: !prev.move }));
        break;
      case 'resize':
        setContextMenu(prev => ({ ...prev, resize: !prev.resize }));
        break;
      default:
        break;
    }
  };

    // Handle story submission
    const handleSubmit = async (event: React.FormEvent) => {
      event.preventDefault();
      setIsUploading(true);
      if (media && preview) {
        try {
          const res = await fetch(`${apiUrl}/stories/add-story`, {
            method: 'POST',
            credentials: 'include',
            headers:{
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              media: media,
              textContent: textContent,
              textColor: textColor,
              fontSize: fontSize,
              textPosition: textPosition,
              elementDimensions: elementDimensions
            }),
          });
    
          const result = await res.json();
          console.log(result.data)
        if(res.status === 200){
          navigate(`/stories/${result.data.username}/${result.data._id}`);
          setIsUploading(false);
        }else{
          setIsUploading(false);
          toast.error(result.message)
        }
    
        } catch (error) {
          console.error("Error while uploading story:", error);
          setIsUploading(false)
        }
      }
    };
  // Measure the dimensions of the test element
  useEffect(() => {
    const measureElement = () => {
      if (textRef.current) {
        const { offsetWidth, offsetHeight } = textRef.current;
        setElementDimensions({ width: offsetWidth, height: offsetHeight });
      }
    };
    measureElement();
    return () => {
      
    }
  }, [textRef.current]);

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-lg mx-auto relative">
      <ToastContainer/>
      {isUploading && <LoaderBlur />}
      <h2 className="text-2xl font-semibold mb-4">Create a Story</h2>

      <input
        type="file"
        accept="image/*,video/*"
        onChange={handleMediaChange}
        className="mb-4"
      />
      {preview && (
        <div
          className="relative w-56 overflow-hidden sm:translate-x-1/2 bg-cyan-400"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        >
          {preview?.type.includes('image') && (
            <img
              src={preview.url}
              alt="Preview"
              className="w-56 h-96 object-cover object-center"
            />
          )}
          {preview?.type.includes('video') && (
            <video
              src={preview.url}
              controls
              className="w-56 h-96 object-cover"
            />
          )}

          {showText && (
            <div
              className="absolute"
              style={{
                top: `${textPosition.y}px`,
                left: `${textPosition.x}px`,
                fontSize: fontSize,
                color: textColor,
                cursor: contextMenu.move ? 'move' : 'default'
              }}
            >
              <p
                ref={textRef}
                contentEditable
                suppressContentEditableWarning
                onMouseDown={handleTextMouseDown}
                onInput={handleTextChange}
                onContextMenu={handleTextContextMenu}
                className={`bg-gradient-to-r from-blue-500 to-purple-500 outline-none border-none p-2 ${
                  contextMenu.resize ? 'resize' : ''
                }`}
                style={{
                  cursor: contextMenu.move ? 'move' : 'text',
                  padding: '10px',
                  borderRadius: '4px',
                  whiteSpace: 'pre-wrap',
                  overflow: 'auto',
                  scrollbarWidth: 'none',
                }}
              >
              </p>
            </div>
          )}

          <button
            onClick={() => setShowText(!showText)}
            className="absolute bottom-4 right-4 bg-blue-500 text-white p-2 rounded-full"
          >
            {showText ? 'Remove Text' : 'Add Text'}
          </button>

          {contextMenu.show && (
            <div
              className="absolute bg-white left-0 top-0 border border-gray-300 rounded-lg shadow-lg"
            >
              <ul className="py-2">
                <li
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => handleContextMenuOption('color')}
                >
                  Set Color
                </li>
                <li
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => handleContextMenuOption('font-size')}
                >
                  Set Font Size
                </li>
                <li
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => handleContextMenuOption('move')}
                >
                  {contextMenu.move ? 'Disable Move' : 'Enable Move'}
                </li>
                <li
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => handleContextMenuOption('resize')}
                >
                  {contextMenu.resize ? 'Disable Resize' : 'Enable Resize'}
                </li>
              </ul>
            </div>
          )}
        </div>
      )}

      <button
        type="button"
        onClick={handleSubmit}
        className="w-full px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-lg hover:bg-blue-700 transition-colors duration-300 mt-4"
      >
        Share Story
      </button>

      {/* <section className="bg-gray-100 mt-4 py-8">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-semibold text-gray-800 mb-6">You Shared</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sharedStories.map((story) => (
            <div key={story.id} className="bg-white p-4 rounded-lg shadow-lg">
              <img src={story.image} alt={story.title} className="w-full h-40 object-cover rounded-t-lg" />
              <div className="mt-4">
                <h3 className="text-xl font-bold text-gray-900">{story.title}</h3>
                <p className="text-gray-700 mt-2">{story.summary}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section> */}

    </div>
  );
};

export default StoryEditor;



// const sharedStories = [
//   // Example data
//   { id: 1, title: 'Story 1', summary: 'This is a summary of story 1', image: 'path/to/image1.jpg' },
//   { id: 2, title: 'Story 2', summary: 'This is a summary of story 2', image: 'path/to/image2.jpg' },
//   { id: 3, title: 'Story 3', summary: 'This is a summary of story 3', image: 'path/to/image3.jpg' },
//   { id: 3, title: 'Story 3', summary: 'This is a summary of story 3', image: 'path/to/image3.jpg' },
//   // Add more stories as needed
// ];