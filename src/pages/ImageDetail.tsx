import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Share, Heart } from 'lucide-react';
import { useAppStore } from '../store';
import { AdPlaceholder } from '../components/AdPlaceholder';
import { AdModal } from '../components/AdModal';
import { useSeo } from '../hooks/useSeo';

export const ImageDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { pins, savedPinIds, toggleSavePin, currentUser, followedUsers, toggleFollowUser, toggleLikePin } = useAppStore();
  
  const [isAdOpen, setIsAdOpen] = useState(false);
  const [adAction, setAdAction] = useState<"download" | "save" | null>(null);
  const pin = pins.find(p => p.id === id);
  const isSaved = savedPinIds.includes(pin?.id || "");
  const isFollowing = followedUsers.includes(pin?.authorId || "");

  useSeo({
    title: pin ? pin.title : "Image Details",
    description: pin ? pin.description : "View detailed HD images and ideas on Intrest.",
    keywords: pin?.tags.join(", "),
    image: pin?.imageUrl
  });

  if (!pin) {
    return (
      <div className="flex h-[calc(100vh-64px)] items-center justify-center">
        <h2 className="text-2xl font-semibold">Pin not found</h2>
      </div>
    );
  }

  // Find some related pins based on tags
  const relatedPins = pins.filter(p => 
    p.id !== pin.id && p.tags.some(tag => pin.tags.includes(tag))
  ).slice(0, 8);

  const performActualDownload = async () => {
    const filename = `Interest_HD_${pin.title.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'download'}.${pin.type === 'video' ? 'mp4' : 'jpg'}`;
    const { forceDownload } = await import('../utils/downloadMedia');
    const success = await forceDownload(pin.imageUrl, filename);
    if (success) {
      alert(`Successfully saved to your Device Gallery/Files!`);
    } else {
      alert("Download failed. Please try again or check browser permissions.");
    }
  };

  const handleAdComplete = () => {
    if (adAction === "download") {
      performActualDownload();
    } else if (adAction === "save") {
      toggleSavePin(pin.id);
      alert("Pin saved successfully!");
    }
    setAdAction(null);
  };


  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 animate-in fade-in duration-300">
      
      {/* Back button */}
      <button 
        onClick={() => navigate(-1)} 
        className="mb-6 flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
      >
        <ArrowLeft size={20} /> Back
      </button>

      {/* Main Content Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-xl border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row min-h-[600px]">
        
        {/* Left: Image Container */}
        <div className="md:w-1/2 bg-slate-100 dark:bg-slate-800 flex items-center justify-center p-4 relative group">
          {pin.type === 'video' ? (
            <video 
              src={pin.imageUrl} 
              controls
              autoPlay
              className="w-full h-auto max-h-[80vh] object-contain rounded-2xl shadow-lg" 
            />
          ) : (
            <img 
              src={pin.imageUrl} 
              alt={pin.title}
              className="w-full h-auto max-h-[80vh] object-contain rounded-2xl shadow-lg" 
            />
          )}
          {/* Ad Slot over image in full screen / overlay if wanted, but placing below is better for policy */}
        </div>

        {/* Right: Info & Actions */}
        <div className="md:w-1/2 p-6 md:p-10 flex flex-col h-full overflow-y-auto max-h-[80vh]">
          
          <div className="flex justify-between items-center mb-8">
            <div className="flex gap-2 sm:gap-4 flex-wrap">
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(window.location.origin + window.location.pathname + "#/image/" + pin.id);
                  alert("Link copied!");
                }}
                className="p-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium"
              >
                <Share size={20} /> <span className="hidden sm:inline">Share</span>
              </button>
              
              <button 
                onClick={() => {
                  if (currentUser?.role === 'admin') {
                    performActualDownload();
                  } else {
                    setAdAction("download");
                    setIsAdOpen(true);
                  }
                }}
                className="p-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium"
              >
                <Download size={20} /> <span className="hidden sm:inline">Download</span>
              </button>
              
              <button 
                onClick={() => {
                  if (!currentUser) return alert("Please login");
                  toggleLikePin(pin.id);
                }}
                className="p-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors flex items-center gap-2 text-red-500 font-medium"
              >
                <Heart size={20} className="fill-current" /> <span className="hidden sm:inline">{pin.likes}</span>
              </button>
            </div>
            <button
              onClick={() => {
                if (!currentUser) return alert("Please login");
                if (currentUser.role === 'admin') {
                  toggleSavePin(pin.id);
                  alert("Pin saved successfully!");
                } else {
                  setAdAction("save");
                  setIsAdOpen(true);
                }
              }}
              className={"px-6 py-3 rounded-full font-bold text-lg transition-colors ml-2 " + (isSaved ? "bg-black text-white hover:bg-slate-900 dark:bg-slate-800 dark:hover:bg-slate-700" : "bg-red-600 text-white hover:bg-red-700")}
            >
              {isSaved ? "Saved" : "Save"}
            </button>
          </div>

          <div className="flex-grow">
             {/* Adsterra Detail view ad */}
            <div className="mb-6">
              <AdPlaceholder height="h-[90px]" />
            </div>

            <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight">
              {pin.title}
            </h1>
            
            <p className="text-lg text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
              {pin.description}
            </p>

            {/* Author Info */}
            <div className="flex items-center justify-between mb-8 border-y border-slate-100 dark:border-slate-800 py-6">
               <div className="flex items-center gap-4 cursor-pointer" onClick={() => navigate("/profile/" + pin.authorId)}>
                 <div className="w-12 h-12 rounded-full bg-slate-200 overflow-hidden">
                   <img src={"https://i.pravatar.cc/150?u=" + pin.authorId} alt="Author" className="w-full h-full object-cover" />
                 </div>
                 <div>
                   <h3 className="font-semibold text-slate-900 dark:text-white">{pin.authorId}</h3>
                   <p className="text-sm text-slate-500">{isFollowing ? 'Following' : 'Creator'}</p>
                 </div>
               </div>
               {currentUser?.id !== pin.authorId && (
                 <button 
                   onClick={() => toggleFollowUser(pin.authorId)}
                   className={"px-5 py-2 rounded-full font-semibold transition-colors " + (isFollowing ? "bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900" : "bg-slate-200 dark:bg-slate-700 dark:text-white hover:bg-slate-300 dark:hover:bg-slate-600")}
                 >
                   {isFollowing ? 'Following' : 'Follow'}
                 </button>
               )}
            </div>

            {/* Comments Section */}
            <div>
              <h3 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white">Comments</h3>
              {pin.comments.map(c => (
                <div key={c.id} className="flex gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden shrink-0">
                    <img src={"https://i.pravatar.cc/150?u=" + c.userId} alt="" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold dark:text-white">User {c.userId}</p>
                    <p className="text-slate-600 dark:text-slate-300">{c.text}</p>
                  </div>
                </div>
              ))}
              <div className="mt-6 flex gap-3 items-center sticky bottom-0 bg-white dark:bg-slate-900 py-4">
                <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden shrink-0">
                  <img src={currentUser?.avatar || "https://i.pravatar.cc/150"} alt="" />
                </div>
                <input 
                  type="text" 
                  placeholder="Add a comment..."
                  className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-full px-5 py-3 focus:outline-none focus:ring-2 focus:ring-slate-300 dark:focus:ring-slate-600 dark:text-white"
                />
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Related Pins */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold mb-8 text-center text-slate-900 dark:text-white">More to explore</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
           {relatedPins.map(rp => (
             <div 
               key={rp.id} 
               onClick={() => navigate("/image/" + rp.id)}
               className="cursor-pointer group relative rounded-2xl overflow-hidden aspect-auto"
             >
               {rp.type === 'video' ? (
                 <video src={rp.imageUrl} autoPlay loop muted playsInline className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" style={{aspectRatio: rp.width/rp.height}} />
               ) : (
                 <img src={rp.imageUrl} alt={rp.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" style={{aspectRatio: rp.width/rp.height}} />
               )}
               <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
             </div>
           ))}
        </div>
      </div>
      
      {/* Download Ad Modal */}
      <AdModal 
        isOpen={isAdOpen} 
        onClose={() => setIsAdOpen(false)} 
        onComplete={handleAdComplete} 
      />
    </div>
  );
};