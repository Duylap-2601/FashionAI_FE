import React, { useState } from 'react';
import { ArrowLeft, Sparkles } from 'lucide-react';

export function OnboardingModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [step, setStep] = useState(1);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-brand-navy/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-[540px] bg-white rounded-2xl shadow-xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Step Indicator */}
        <div className="flex justify-center gap-1.5 pt-6 pb-2">
          <div className={`w-2 h-2 rounded-full transition-colors ${step === 1 ? 'bg-[#5D1C34]' : 'bg-neutral-200'}`} />
          <div className={`w-2 h-2 rounded-full transition-colors ${step === 2 ? 'bg-[#5D1C34]' : 'bg-neutral-200'}`} />
        </div>

        <div className="p-8 pt-4">
          {step === 1 && (
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-[#5D1C34]/10 rounded-full flex items-center justify-center mb-6 text-[#5D1C34]">
                <Sparkles className="w-8 h-8" />
              </div>
              <h2 className="text-[24px] font-semibold text-brand-navy mb-3 tracking-tight">Chào mừng đến StAle.! 👋</h2>
              <p className="text-body-md text-neutral-600 mb-8 max-w-[400px]">
                Thêm số đo cơ thể để AI try-on cho kết quả chính xác hơn với dáng người bạn.
              </p>

              <div className="w-full flex flex-col gap-3">
                <button 
                  onClick={() => setStep(2)}
                  className="w-full h-[48px] bg-gradient-to-r from-[#5D1C34] to-[#A67D44] text-white text-body-md font-semibold rounded-xl hover:opacity-90 transition-opacity shadow-sm flex items-center justify-center gap-2"
                >
                  Thêm số đo ngay
                </button>
                <button 
                  onClick={onClose}
                  className="w-full h-[48px] text-neutral-500 hover:text-brand-navy text-body-md font-medium transition-colors"
                >
                  Bỏ qua, tôi sẽ thêm sau
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col">
              <h2 className="text-[24px] font-semibold text-brand-navy mb-6 tracking-tight text-center">Số đo của bạn</h2>
              
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div>
                  <label className="block text-label-sm font-medium text-neutral-700 mb-1.5">Chiều cao (cm)</label>
                  <input type="number" className="w-full h-11 px-3.5 bg-neutral-50 border border-neutral-200 rounded-xl text-body-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5D1C34]/20 focus:border-[#5D1C34] transition-all" placeholder="165" />
                  <span className="text-[11px] text-neutral-400 mt-1 block">(100–250)</span>
                </div>
                <div>
                  <label className="block text-label-sm font-medium text-neutral-700 mb-1.5">Cân nặng (kg)</label>
                  <input type="number" className="w-full h-11 px-3.5 bg-neutral-50 border border-neutral-200 rounded-xl text-body-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5D1C34]/20 focus:border-[#5D1C34] transition-all" placeholder="50" />
                  <span className="text-[11px] text-neutral-400 mt-1 block">(30–150)</span>
                </div>
                <div>
                  <label className="block text-label-sm font-medium text-neutral-700 mb-1.5">Vòng ngực (cm)</label>
                  <input type="number" className="w-full h-11 px-3.5 bg-neutral-50 border border-neutral-200 rounded-xl text-body-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5D1C34]/20 focus:border-[#5D1C34] transition-all" placeholder="85" />
                  <span className="text-[11px] text-neutral-400 mt-1 block">(50–150)</span>
                </div>
                <div>
                  <label className="block text-label-sm font-medium text-neutral-700 mb-1.5">Vòng eo (cm)</label>
                  <input type="number" className="w-full h-11 px-3.5 bg-neutral-50 border border-neutral-200 rounded-xl text-body-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5D1C34]/20 focus:border-[#5D1C34] transition-all" placeholder="65" />
                  <span className="text-[11px] text-neutral-400 mt-1 block">(40–120)</span>
                </div>
                <div>
                  <label className="block text-label-sm font-medium text-neutral-700 mb-1.5">Vòng hông (cm)</label>
                  <input type="number" className="w-full h-11 px-3.5 bg-neutral-50 border border-neutral-200 rounded-xl text-body-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5D1C34]/20 focus:border-[#5D1C34] transition-all" placeholder="90" />
                  <span className="text-[11px] text-neutral-400 mt-1 block">(50–150)</span>
                </div>
                <div>
                  <label className="block text-label-sm font-medium text-neutral-700 mb-1.5">Rộng vai (cm)</label>
                  <input type="number" className="w-full h-11 px-3.5 bg-neutral-50 border border-neutral-200 rounded-xl text-body-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5D1C34]/20 focus:border-[#5D1C34] transition-all" placeholder="38" />
                  <span className="text-[11px] text-neutral-400 mt-1 block">(30–60)</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => setStep(1)}
                  className="h-[48px] px-6 border border-neutral-200 text-neutral-600 rounded-xl hover:bg-neutral-50 transition-colors flex items-center justify-center shrink-0"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <button 
                  onClick={onClose}
                  className="flex-1 h-[48px] bg-gradient-to-r from-[#5D1C34] to-[#A67D44] text-white text-body-md font-semibold rounded-xl hover:opacity-90 transition-opacity shadow-sm flex items-center justify-center gap-2"
                >
                  Lưu & bắt đầu thử đồ ✦
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
