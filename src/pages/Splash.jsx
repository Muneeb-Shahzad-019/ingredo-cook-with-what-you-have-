import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { ChefHat, Sparkles } from 'lucide-react';

export default function Splash() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate(createPageUrl('AccountSelection'));
    }, 2500);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-orange-50 flex items-center justify-center">
      <div className="text-center space-y-8 animate-fade-in">
        {/* Logo Animation */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-orange-400 blur-3xl opacity-30 animate-pulse" />
          <div className="relative bg-white p-8 rounded-3xl shadow-2xl border border-emerald-100">
            <ChefHat className="w-24 h-24 text-emerald-600 mx-auto animate-bounce" strokeWidth={1.5} />
          </div>
        </div>

        {/* App Name */}
        <div className="space-y-2">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-emerald-600 to-orange-500 bg-clip-text text-transparent">
            Ingredo
          </h1>
          <p className="text-xl text-gray-600 font-light flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5 text-orange-500" />
            Cook With What You Have
            <Sparkles className="w-5 h-5 text-emerald-500" />
          </p>
        </div>

        {/* Loading Indicator */}
        <div className="flex gap-2 justify-center">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
      `}</style>
    </div>
  );
}