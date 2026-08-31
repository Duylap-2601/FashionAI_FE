"use client";

import React from "react";
import { Toaster as Sonner, ToasterProps } from "sonner";
import { CheckCircle2, AlertCircle, AlertTriangle, Sparkles, Loader2 } from "lucide-react";

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
          title: "text-[13px] font-bold text-[#11100F] leading-snug tracking-tight",
          description: "text-[12px] text-[#7A6E65] mt-0.5 leading-relaxed",
          actionButton:
            "bg-[#5D1C34] hover:bg-[#38140C] text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-colors shadow-sm",
          cancelButton:
            "bg-[#F0EAE1] hover:bg-[#E5DFD5] text-[#11100F] text-xs font-medium px-3 py-1.5 rounded-xl transition-colors",
          closeButton:
            "bg-white/90 hover:bg-[#F0EAE1] text-[#7A6E65] hover:text-[#11100F] border border-[#CDBCAB]/50 rounded-full w-6 h-6 flex items-center justify-center transition-all shadow-xs",
          success:
            "!bg-[#FDFAF7] !border-[#A3D9B1] !text-[#11100F] shadow-[0_8px_20px_rgba(45,122,79,0.08)]",
          error:
            "!bg-[#FDF9F9] !border-[#F5C2C2] !text-[#11100F] shadow-[0_8px_20px_rgba(185,28,28,0.08)]",
          warning:
            "!bg-[#FEFAF3] !border-[#F8DCAB] !text-[#11100F] shadow-[0_8px_20px_rgba(180,83,9,0.08)]",
          info:
            "!bg-[#FDFAF7] !border-[#CDBCAB] !text-[#11100F] shadow-[0_8px_20px_rgba(93,28,52,0.08)]",
          default:
            "!bg-[#FDFAF7] !border-[#CDBCAB] !text-[#11100F] shadow-[0_8px_20px_rgba(17,16,15,0.06)]",
        },
      }}
      style={
        {
          "--normal-bg": "#FDFAF7",
          "--normal-text": "#11100F",
          "--normal-border": "#CDBCAB",
          "--success-bg": "#FDFAF7",
          "--success-text": "#11100F",
          "--success-border": "#A3D9B1",
          "--error-bg": "#FDF9F9",
          "--error-text": "#11100F",
          "--error-border": "#F5C2C2",
          "--warning-bg": "#FEFAF3",
          "--warning-text": "#11100F",
          "--warning-border": "#F8DCAB",
          "--info-bg": "#FDFAF7",
          "--info-text": "#11100F",
          "--info-border": "#CDBCAB",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
