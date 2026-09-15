import React from 'react';
import { X, Check, Crown, Zap, Sparkles } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../i18n/translations';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
  language: Language;
}

export const PricingModal: React.FC<PricingModalProps> = ({
  isOpen,
  onClose,
  onUpgrade,
  language
}) => {
  if (!isOpen) return null;

  const t = translations[language];
  const isBn = language === 'bn';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-2xl rounded-3xl bg-neutral-900 border border-neutral-800 p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Title */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold">
            <Crown className="h-3.5 w-3.5" />
            <span>{t.pricing.title}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-neutral-100">
            {isBn ? 'আপনার পছন্দের প্ল্যান বেছে নিন' : 'Choose Your Creative Plan'}
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 max-w-md mx-auto">
            {isBn ? 'সুপারফাস্ট AI ক্রিয়েশন ও প্রিমিয়াম ক্রিয়েটিভ সুবিধার বিবরণ' : 'High-speed AI creation and premium creative benefits'}
          </p>
        </div>

        {/* 2 Tier Plans: Free Plan vs Pro Plan as specified in Section 16 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Free Plan */}
          <div className="rounded-2xl bg-neutral-950 border border-neutral-800 p-5 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider block">
                {t.pricing.freePlan}
              </span>
              <div className="text-2xl font-extrabold text-neutral-100">
                ৳০ <span className="text-xs font-normal text-neutral-500">/ {isBn ? 'চিরতরে ফ্রি' : 'Forever Free'}</span>
              </div>
              <ul className="space-y-2 pt-2 text-xs text-neutral-300">
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <span>{t.pricing.freeCredits}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <span>{t.pricing.freeQuality}</span>
                </li>
                <li className="flex items-center gap-2 text-neutral-400">
                  <Check className="h-3.5 w-3.5 text-neutral-500 shrink-0" />
                  <span>{t.pricing.freeWatermark}</span>
                </li>
              </ul>
            </div>
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-750 text-neutral-300 text-xs font-semibold transition"
            >
              {isBn ? 'বর্তমান প্ল্যান' : 'Current Plan'}
            </button>
          </div>

          {/* Pro Plan */}
          <div className="relative rounded-2xl bg-gradient-to-b from-amber-950/30 to-neutral-950 border-2 border-amber-500/50 p-5 space-y-4 flex flex-col justify-between shadow-xl">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                  {t.pricing.proPlan}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold">
                  {isBn ? 'জনপ্রিয়' : 'POPULAR'}
                </span>
              </div>

              <div className="text-2xl font-extrabold text-neutral-100">
                ৳৪৯০ <span className="text-xs font-normal text-neutral-400">/ {isBn ? 'মাস' : 'month'}</span>
              </div>

              <ul className="space-y-2 pt-2 text-xs text-neutral-200">
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                  <span>{t.pricing.proCredits}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                  <span>{t.pricing.proSpeed}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                  <span>{t.pricing.proQuality}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                  <span>{t.pricing.proNoWatermark}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                  <span>{t.pricing.proPriority}</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => {
                onUpgrade();
                onClose();
              }}
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold transition flex items-center justify-center gap-2 shadow-md shadow-amber-500/20 active:scale-95"
            >
              <Zap className="h-3.5 w-3.5" />
              <span>{t.pricing.upgradeBtn}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
