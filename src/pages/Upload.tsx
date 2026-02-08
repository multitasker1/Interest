import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store';
import { Upload as UploadIcon, X } from 'lucide-react';
import { CATEGORIES } from '../data/mockData';

export const Upload = () => {
  const navigate = useNavigate();
  const { addPins, currentUser } = useAppStore();
  
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState<{file: File, url: string, type: 'image' | 'video'}[]>([]);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [customCategory, setCustomCategory] = useState('');

  if (!currentUser) {
    return (
      <div className="flex flex-col h-[calc(100vh-64px)] items-center justify-center p-4">
        <h2 className="text-2xl font-semibold mb-4 text-slate-900 dark:text-white">Please log in to upload</h2>
        <button onClick={() => navigate('/')} className="px-6 py-2 bg-red-600 text-white rounded-full">Go Home</button>
      </div>
    );
  }

  const handleFiles = async (selectedFiles: FileList | File[]) => {
    const newFiles: {file: File, url: string, type: 'image' | 'video'}[] = [];
    
    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      if (file.type.startsWith('image/')) {
        newFiles.push({ file, url: URL.createObjectURL(file), type: 'image' });
      } else if (file.type.startsWith('video/')) {
        // Check video duration (max 5 minutes)
        try {
          const valid = await new Promise<boolean>((resolve) => {
            const video = document.createElement('video');
            video.preload = 'metadata';
            video.onloadedmetadata = () => {
              URL.revokeObjectURL(video.src);
              resolve(video.duration <= 300); // 300 seconds = 5 mins
            };
            video.onerror = () => resolve(false);
            video.src = URL.createObjectURL(file);
          });
          
          if (valid) {
            newFiles.push({ file, url: URL.createObjectURL(file), type: 'video' });
          } else {
            alert(`Video "${file.name}" exceeds 5 minutes duration limit and was skipped.`);
          }
        } catch (e) {
          console.error("Video processing error", e);
        }
      }
    }
    
    if (newFiles.length > 0) {
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const onDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleUpload = () => {
    if (files.length === 0) return alert("Please select at least one file first");
    
    const finalCategory = category === "Add Custom Category" ? customCategory : category;
    if (category === "Add Custom Category" && !customCategory.trim()) {
      return alert("Please enter a custom category name!");
    }

    const newPins = files.map((f, idx) => ({
      id: "upload_" + Date.now() + "_" + idx,
      title: files.length > 1 ? `${title || "Untitled"} ${idx + 1}` : (title || "Untitled"),
      description: description || "",
      imageUrl: f.url,
      type: f.type,
      width: 800, // mock width
      height: 1000, // mock height
      authorId: currentUser.id,
      tags: [finalCategory, ...tags.split(',').map(t => t.trim()).filter(Boolean)],
      likes: 0,
      comments: [],
      createdAt: new Date().toISOString(),
      nsfw: false,
      hidden: false
    }));

    addPins(newPins);
    alert(`Successfully uploaded ${files.length} file(s)!`);
    navigate('/profile/' + currentUser.id);
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 md:p-10 flex flex-col md:flex-row gap-10">
        
        {/* Left: Image Uploader */}
        <div className="md:w-1/2">
          {files.length === 0 ? (
            <div 
              className={`h-[400px] w-full rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-6 text-center transition-colors cursor-pointer
                ${dragActive ? "border-red-500 bg-red-50 dark:bg-red-900/20" : "border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700"}`}
              onDragEnter={onDrag}
              onDragLeave={onDrag}
              onDragOver={onDrag}
              onDrop={onDrop}
              onClick={() => document.getElementById('file-upload')?.click()}
            >
              <div className="w-16 h-16 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center mb-4">
                 <UploadIcon size={24} className="text-slate-500 dark:text-slate-300" />
              </div>
              <p className="font-semibold text-slate-900 dark:text-white mb-2">Choose files (Images/Videos) or drag here</p>
              <p className="text-sm text-slate-500 mb-6">Max video duration 5 mins. Upload 100+ items at once.</p>
              
            </div>
          ) : (
            <div className="h-[400px] w-full flex flex-col gap-2">
              <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-2xl overflow-y-auto p-4 grid grid-cols-3 gap-2 border border-slate-200 dark:border-slate-700">
                {files.map((f, i) => (
                  <div key={i} className="relative aspect-square bg-slate-200 dark:bg-slate-900 rounded-lg overflow-hidden">
                    {f.type === 'video' ? (
                      <video src={f.url} autoPlay loop muted playsInline className="w-full h-full object-cover" />
                    ) : (
                      <img src={f.url} className="w-full h-full object-cover" />
                    )}
                    <button 
                      onClick={() => setFiles(prev => prev.filter((_, idx) => idx !== i))}
                      className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 hover:bg-black transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
              <button onClick={() => document.getElementById('file-upload')?.click()} className="py-3 font-semibold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                + Add More Files
              </button>
            </div>
          )}

          {/* Hidden File Input placed outside conditionals so it's always accessible */}
          <input 
            id="file-upload" 
            type="file" 
            multiple
            className="hidden" 
            accept="image/*,video/mp4,video/webm,video/ogg"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                handleFiles(e.target.files);
                // Reset value so same file can be selected again
                e.target.value = "";
              }
            }}
          />
        </div>

        {/* Right: Form Info */}
        <div className="md:w-1/2 flex flex-col gap-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Title</label>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Add a title"
              className="w-full bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-slate-300 dark:focus:ring-slate-600 text-lg font-semibold"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Description</label>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell everyone what your Pin is about"
              className="w-full bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-slate-300 dark:focus:ring-slate-600 min-h-[100px] resize-y"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-slate-300 dark:focus:ring-slate-600 mb-4 appearance-none"
            >
              {[...CATEGORIES, "Add Custom Category"].map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            
            {category === "Add Custom Category" && (
              <input 
                type="text"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                placeholder="Type your custom category..."
                className="w-full bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-slate-300 dark:focus:ring-slate-600 mb-4 border-2 border-red-500/50"
              />
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Tags (comma separated)</label>
            <input 
              type="text" 
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g. nature, photography, summer"
              className="w-full bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-slate-300 dark:focus:ring-slate-600"
            />
          </div>

          <div className="flex-grow flex items-end justify-end mt-4">
            <button 
              onClick={handleUpload}
              disabled={files.length === 0}
              className={`px-8 py-3 rounded-full font-bold text-lg transition-all ${
                files.length > 0 
                  ? "bg-red-600 hover:bg-red-700 text-white shadow-md" 
                  : "bg-slate-200 text-slate-400 dark:bg-slate-800 cursor-not-allowed"
              }`}
            >
              Publish ({files.length})
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};