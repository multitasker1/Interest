import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Download, Share2, Bookmark } from 'lucide-react';
import { Pin } from '../data/mockData';
import { useAppStore } from '../store';
import { cn } from '../utils/cn';
import { AdModal } from './AdModal';

export const PinCard = ({ pin }: { pin: Pin }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isAdOpen, setIsAdOpen] = useState(false);
  const navigate = useNavigate();
  const { savedPinIds, toggleSavePin, currentUser } = useAppStore();
  
  const isSaved = savedPinIds.includes(pin.id);

  const [adAction, setAdAction] = useState<"download" | "save" | null>(null);

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser) return alert("Please login first");
    if (currentUser.role === 'admin') {
      toggleSavePin(pin.id);
      return alert("Pin saved successfully!");
    }
    setAdAction("save");
    setIsAdOpen(true);
  };

  const handleDownloadTrigger = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentUser?.role === 'admin') {
      return performActualDownload();
    }
    setAdAction("download");
    setIsAdOpen(true);
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

  const performActualDownload = async () => {
    const filename = `Interest_HD_${pin.title.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'download'}.${pin.type === 'video' ? 'mp4' : 'jpg'}`;
    const { forceDownload } = await import('../utils/downloadMedia');
    const success = await forceDownload(pin.imageUrl, filename);
    if (success) {
      alert(`Successfully saved to your Device Gallery/Files!`);
    } else {
      alert("Download failed. Please try again.");
    }
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(window.location.origin + window.location.pathname + "#/image/" + pin.id);
    alert("Link copied for " + pin.title);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mb-4 break-inside-avoid relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => navigate("/image/" + pin.id)}
    >
      <div className="relative rounded-2xl overflow-hidden cursor-zoom-in group-hover:shadow-xl transition-shadow duration-300 bg-slate-200 dark:bg-slate-800">
        {pin.type === 'video' ? (
          <video
            src={pin.imageUrl}
            loop
            muted
            autoPlay
            playsInline
            className="w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            style={{ 
              aspectRatio: pin.width / pin.height, 
              display: "block" 
            }}
          />
        ) : (
          <img
            src={pin.imageUrl}
            alt={pin.title}
            loading="lazy"
            className="w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            style={{ 
              aspectRatio: pin.width / pin.height, 
              display: "block" 
            }}
          />
        )}

        {/* Hover Overlay */}
        <div 
          className={cn(
            "absolute inset-0 bg-black/40 transition-opacity duration-300 flex flex-col justify-between p-4",
            isHovered ? "opacity-100" : "opacity-0"
          )}
        >
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              className={cn(
                "px-4 py-2 rounded-full font-bold text-sm transition-all shadow-md",
                isSaved 
                  ? "bg-black text-white hover:bg-slate-900" 
                  : "bg-red-600 text-white hover:bg-red-700"
              )}
            >
              {isSaved ? "Saved" : "Save"}
            </button>
          </div>

          <div className="flex justify-between items-end gap-2">
            <div className="flex-1 min-w-0">
              <span className="text-white text-sm font-medium truncate block drop-shadow-md">
                {pin.title}
              </span>
              <div className="flex gap-2 text-white/90 text-xs mt-1 drop-shadow-md">
                <span className="flex items-center gap-1">
                  <Heart size={12} className="fill-current" /> {pin.likes}
                </span>
                <span className="flex items-center gap-1">
                  <Bookmark size={12} className="fill-current" /> {pin.tags[0]}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <button 
                onClick={handleShare}
                className="w-8 h-8 rounded-full bg-white/90 hover:bg-white flex items-center justify-center text-slate-900 transition-colors shadow-sm"
              >
                <Share2 size={16} />
              </button>
              <button 
                onClick={handleDownloadTrigger}
                className="w-8 h-8 rounded-full bg-white/90 hover:bg-white flex items-center justify-center text-slate-900 transition-colors shadow-sm"
              >
                <Download size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Download Ad Modal */}
      <AdModal 
        isOpen={isAdOpen} 
        onClose={() => setIsAdOpen(false)} 
        onComplete={handleAdComplete} 
      />
    </motion.div>
  );
};