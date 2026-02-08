// src/components/AdPlaceholder.tsx
import React, { useEffect, useRef } from "react";
import { useAppStore } from "../store";

interface Props {
  width?: string;
  height?: string;
  className?: string;
  /**
   * type="banner"  ->  728x90 banner (highperformanceformat.com)
   * type="native"  ->  native ad (effectivegatecpm.com)
   */
  type?: "banner" | "native";
}

export const AdPlaceholder: React.FC<Props> = ({
  width = "w-full",
  height = "h-[250px]",
  className = "",
  type = "banner",
}) => {
  const currentUser = useAppStore().currentUser;
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Admin ko ads mat dikhana
  if (currentUser?.role === "admin") {
    return null;
  }

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Purana content hatao
    el.innerHTML =
      '<div style="font-size:10px;color:#64748b;text-align:center;">Ad</div>';

    // ====== BANNER (728x90) ======
    if (type === "banner") {
      // atOptions global variable set karo
      (window as any).atOptions = {
        key: "8f39a43c77438addb306579dbc223d00",
        format: "iframe",
        height: 90,
        width: 728,
        params: {},
      };

      // external script jise tumhe diya gaya hai
      const s = document.createElement("script");
      s.src =
        "https://www.highperformanceformat.com/8f39a43c77438addb306579dbc223d00/invoke.js";
      s.type = "text/javascript";
      s.async = true;

      // is container ke andar script inject karte hain
      el.appendChild(s);
    }

    // ====== NATIVE (effectivegatecpm) ======
    if (type === "native") {
      // pehle native container div banao (id same jo snippet me hai)
      const nativeContainer = document.createElement("div");
      nativeContainer.id = "container-8d182d0c70e82916a36628542ef0b3a2";
      el.appendChild(nativeContainer); 

      // phir external async script attach karo
      const s = document.createElement("script");
      s.src =
        "https://pl28676190.effectivegatecpm.com/8d182d0c70e82916a36628542ef0b3a2/invoke.js";
      s.async = true;
      s.setAttribute("data-cfasync", "false");
      s.type = "text/javascript";

      el.appendChild(s);
    }

    // CLEANUP: component unmount ho to ad area clear
    return () => {
      el.innerHTML = "";
    };
  }, [type]);

  return (
    <div
      ref={containerRef}
      className={
        width +
        " " +
        height +
        " " +
        className +
        " bg-slate-100 dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-600 flex flex-col items-center justify-center rounded-xl text-slate-600 dark:text-slate-300 text-center text-xs p-3 relative"
      }
      title="Adsterra Ad Slot"
    >
      {/* chhota label */}
      <span className="absolute top-1 left-1 px-1 text-[10px] bg-black/50 text-white rounded">
        Ad
      </span>
    </div>
  );
};

export default AdPlaceholder;
