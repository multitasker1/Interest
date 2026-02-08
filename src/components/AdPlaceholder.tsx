import React from 'react';
import { useAppStore } from '../store';

interface Props {
  width?: string;
  height?: string;
  className?: string;
}

export const AdPlaceholder: React.FC<Props> = ({ width = "w-full", height = "h-[250px]", className = "" }) => {
  const { currentUser } = useAppStore();
  
  if (currentUser?.role === 'admin') {
    return null; // Admins don't see ads
  }

  return (
    <div 
      className={width + " " + height + " " + className + " bg-slate-100 dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 p-4"}
      title="Paste Adsterra JS Code Here"
    >
      <span className="text-xs uppercase font-bold tracking-wider mb-1">Adsterra Ad Slot</span>
      <span className="text-[10px] text-center">Replace this container with Adsterra banner or native ads code.</span>
    </div>
  );
};