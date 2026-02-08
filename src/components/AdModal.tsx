import { useState, useEffect } from 'react';
import { X, ExternalLink } from 'lucide-react';

interface AdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void; // Trigger download after ad
}

export const AdModal = ({ isOpen, onClose, onComplete }: AdModalProps) => {
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (!isOpen) {
      setCountdown(5); // Reset
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSkip = () => {
    if (countdown === 0) {
      onComplete(); // Fire download event
      onClose(); // Close modal
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden relative border border-slate-200 dark:border-slate-800">
        
        {/* Ad Header */}
        <div className="flex justify-between items-center p-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sponsored Content</span>
          <button 
            onClick={onClose}
            className="text-slate-500 hover:text-slate-900 dark:hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Ad Content area */}
        <div className="p-8 flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-800 text-center min-h-[300px]">
          <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">Discover Something New</h2>
          <p className="text-slate-600 dark:text-slate-300 mb-6 max-w-md">
            While your download is being prepared, check out this special offer from our sponsor!
          </p>
          
          {/* Adsterra Placeholder */}
          <div className="w-full h-[90px] bg-slate-200 dark:bg-slate-700 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded flex items-center justify-center text-slate-500">
             Adsterra 728x90 Banner
          </div>
          
          <button className="mt-6 flex items-center gap-2 text-red-600 font-semibold hover:underline">
            Visit Sponsor <ExternalLink size={16} />
          </button>
        </div>

        {/* Footer actions */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 flex justify-end items-center border-t border-slate-200 dark:border-slate-800">
          <button 
            onClick={handleSkip}
            disabled={countdown > 0}
            className={`px-6 py-2 rounded-full font-bold transition-all ${
              countdown > 0 
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed dark:bg-slate-700 dark:text-slate-400' 
                : 'bg-red-600 text-white hover:bg-red-700 shadow-md'
            }`}
          >
            {countdown > 0 ? `Skip Ad in ${countdown}s` : 'Skip Ad & Download'}
          </button>
        </div>
        
      </div>
    </div>
  );
};