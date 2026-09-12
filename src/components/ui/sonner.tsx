"use client";

import { AlertCircle, AlertTriangle, CheckCircle2, Loader2, Sparkles } from "lucide-react";
import React from "react";
import { Toaster as Sonner, ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group font-sans"
      position="top-right"
      closeButton
      icons={{
        success: <CheckCircle2 className="w-5 h-5 text-[#2D7A4F] shrink-0" />,
        error: <AlertCircle className="w-5 h-5 text-[#B91C1C] shrink-0" />,
        warning: <AlertTriangle className="w-5 h-5 text-[#B45309] shrink-0" />,
        info: <Sparkles className="w-5 h-5 text-[#5D1C34] shrink-0" />,
        loading: <Loader2 className="w-5 h-5 text-[#5D1C34] animate-spin shrink-0" />,
      }}
      toastOptions={{
        classNames: {
          toast:
            "group toast font-sans rounded-2xl p-4 shadow-xl border backdrop-blur-md transition-all duration-200 flex items-start gap-3 select-none",
          title: "text-[13px] font-bold text-[#1A1917] leading-snug tracking-tight",
          description: "text-[12px] text-[#8B8880] mt-0.5 leading-relaxed",
          actionButton:
            "bg-[#5D1C34] hover:bg-[#7A2445] text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-colors shadow-sm",
          cancelButton:
            "bg-[#F0EEE9] hover:bg-[#E5DFD5] text-[#1A1917] text-xs font-medium px-3 py-1.5 rounded-xl transition-colors",
          closeButton:
            "bg-white/90 hover:bg-[#F0EEE9] text-[#8B8880] hover:text-[#1A1917] border border-[#E5DFD5]/50 rounded-full w-6 h-6 flex items-center justify-center transition-all shadow-xs",
          success:
            "!bg-white !border-[#A3D9B1] !text-[#1A1917] shadow-[0_8px_20px_rgba(45,122,79,0.08)]",
          error:
            "!bg-[#FDF9F9] !border-[#F5C2C2] !text-[#1A1917] shadow-[0_8px_20px_rgba(185,28,28,0.08)]",
          warning:
            "!bg-[#FEFAF3] !border-[#F8DCAB] !text-[#1A1917] shadow-[0_8px_20px_rgba(180,83,9,0.08)]",
          info:
            "!bg-white !border-[#E5DFD5] !text-[#1A1917] shadow-[0_8px_20px_rgba(93,28,52,0.08)]",
          default:
            "!bg-white !border-[#E5DFD5] !text-[#1A1917] shadow-[0_8px_20px_rgba(17,16,15,0.06)]",
        },
      }}
      style={
        {
          "--normal-bg": "#FFFFFF",
          "--normal-text": "#1A1917",
          "--normal-border": "#E5DFD5",
          "--success-bg": "#FFFFFF",
          "--success-text": "#1A1917",
          "--success-border": "#A3D9B1",
          "--error-bg": "#FDF9F9",
          "--error-text": "#1A1917",
          "--error-border": "#F5C2C2",
          "--warning-bg": "#FEFAF3",
          "--warning-text": "#1A1917",
          "--warning-border": "#F8DCAB",
          "--info-bg": "#FFFFFF",
          "--info-text": "#1A1917",
          "--info-border": "#E5DFD5",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
