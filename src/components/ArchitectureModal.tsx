import React, { useState } from 'react';
import { X, Layers, Cpu, Database, Server, Terminal, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import { ARCHITECTURE_GUIDE } from '../data/prompts';

interface ArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPrompt?: (prompt: string) => void;
}

export const ArchitectureModal: React.FC<ArchitectureModalProps> = ({
  isOpen,
  onClose,
  onSelectPrompt,
}) => {
  const [activeTab, setActiveTab] = useState<'path1' | 'path2'>('path1');

  if (!isOpen) return null;

  return (
    <div
      id="architecture-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="architecture-modal-container"
        className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-6 text-stone-900 dark:text-stone-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-stone-900 dark:text-stone-100">
                {ARCHITECTURE_GUIDE.titleBn}
              </h2>
              <p className="text-xs text-stone-700 dark:text-stone-300">
                {ARCHITECTURE_GUIDE.subtitleBn}
              </p>
            </div>
          </div>
          <button
            id="close-architecture-modal-btn"
            onClick={onClose}
            className="p-2 text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-stone-200 dark:border-stone-800 px-6 pt-3 bg-stone-50/50 dark:bg-stone-900/40 gap-3">
          <button
            id="tab-path1-btn"
            onClick={() => setActiveTab('path1')}
            className={`pb-3 px-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'path1'
                ? 'border-emerald-600 text-emerald-700 dark:border-emerald-400 dark:text-emerald-300'
                : 'border-transparent text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            পথ ১: বিদ্যমান LLM দিয়ে অ্যাপ (বাস্তবসম্মত)
          </button>
          <button
            id="tab-path2-btn"
            onClick={() => setActiveTab('path2')}
            className={`pb-3 px-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'path2'
                ? 'border-indigo-600 text-indigo-700 dark:border-indigo-400 dark:text-indigo-300'
                : 'border-transparent text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100'
            }`}
          >
            <Cpu className="w-4 h-4" />
            পথ ২: নিজস্ব LLM ট্রেইনিং (রিসার্চ)
          </button>
        </div>

        {/* Body content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {activeTab === 'path1' ? (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-semibold text-emerald-900 dark:text-emerald-200">
                    কেন সফটওয়্যার ইঞ্জিনিয়ারদের জন্য এটি সেরা?
                  </p>
                  <p className="text-emerald-800/90 dark:text-emerald-300/90 text-xs mt-1 leading-relaxed">
                    হাজার কোটি টাকা বা GPU ক্লাস্টার ছাড়াই বর্তমান শক্তিশালী LLM (Gemini, Claude, GPT) এর API ব্যবহার করে কয়েক সপ্তাহেই ফুল-ফাংশনাল AI প্রোডাক্ট বা স্টার্টআপ লঞ্চ করা সম্ভব।
                  </p>
                </div>
              </div>

              {/* Visual Flow */}
              <div className="p-4 rounded-xl bg-stone-100 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700/60">
                <p className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-3">
                  আর্কিটেকচারাল ডাটা ফ্লো
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-center text-xs">
                  <div className="p-2.5 rounded-lg bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
                    <span className="font-semibold block text-stone-800 dark:text-stone-200">Frontend (UI)</span>
                    <span className="text-[11px] text-stone-500">React / Next.js</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
                    <span className="font-semibold block text-stone-800 dark:text-stone-200">Backend API</span>
                    <span className="text-[11px] text-stone-500">Express / FastAPI</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
                    <span className="font-semibold block text-stone-800 dark:text-stone-200">RAG / Grounding</span>
                    <span className="text-[11px] text-stone-500">Google Search / Vector DB</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
                    <span className="font-semibold block text-stone-800 dark:text-stone-200">LLM Brain</span>
                    <span className="text-[11px] text-stone-500">Gemini / Claude API</span>
                  </div>
                </div>
              </div>

              {/* Detailed steps */}
              <div className="space-y-3">
                {ARCHITECTURE_GUIDE.path1.steps.map((step, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-800/40 hover:border-emerald-300 dark:hover:border-emerald-800 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs flex items-center justify-center font-bold">
                          {idx + 1}
                        </span>
                        {step.title}
                      </h4>
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-stone-100 dark:bg-stone-700 text-stone-700 dark:text-stone-300">
                        {step.tech}
                      </span>
                    </div>
                    <p className="text-xs text-stone-600 dark:text-stone-300 mt-2 leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/50 flex items-start gap-3">
                <Cpu className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-semibold text-indigo-900 dark:text-indigo-200">
                    কারা এই পথ বেছে নিবে?
                  </p>
                  <p className="text-indigo-800/90 dark:text-indigo-300/90 text-xs mt-1 leading-relaxed">
                    AI গবেষক, ডেটা সায়েন্টিস্ট বা যারা মডেলের অভ্যন্তরীণ মেকানিজম (Weight, Attention Matrix, Loss Optimization) নিয়ে হাতে-কলমে শিখতে চান।
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {ARCHITECTURE_GUIDE.path2.steps.map((step, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-800/40 hover:border-indigo-300 dark:hover:border-indigo-800 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-xs flex items-center justify-center font-bold">
                          {idx + 1}
                        </span>
                        {step.title}
                      </h4>
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-stone-100 dark:bg-stone-700 text-stone-700 dark:text-stone-300">
                        {step.tech}
                      </span>
                    </div>
                    <p className="text-xs text-stone-600 dark:text-stone-300 mt-2 leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/80">
          <p className="text-xs text-stone-700 dark:text-stone-300">
            এই অ্যাপটি পথ ১-এর একটি বাস্তব ও কর্মক্ষম উদাহরণ (React + Express + Gemini + Google Search)।
          </p>
          {onSelectPrompt && (
            <button
              id="ask-assistant-about-arch-btn"
              onClick={() => {
                onSelectPrompt('তুমি কীভাবে তৈরি হয়েছ এবং একজন ডেভেলপার হিসেবে আমি কীভাবে তোমার মতো একটি ফুল-স্ট্যাক AI অ্যাসিস্ট্যান্ট প্রজেক্ট স্ক্র্যাচ থেকে শুরু করতে পারি? স্টেপ-বাই-স্টেপ গাইড দাও।');
                onClose();
              }}
              className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-white dark:text-stone-900 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <span>বিস্তারিত গাইড জিজ্ঞাসা করো</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
