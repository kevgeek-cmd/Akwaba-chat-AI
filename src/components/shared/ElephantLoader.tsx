"use client";

import React, { useState, useEffect } from "react";

export function ElephantLoader() {
  const [progress, setProgress] = useState(5);

  useEffect(() => {
    // Simuler une progression fluide de 5% à 95% pendant la réflexion IA
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev < 30) return prev + Math.floor(Math.random() * 8 + 4);
        if (prev < 70) return prev + Math.floor(Math.random() * 5 + 2);
        if (prev < 92) return prev + Math.floor(Math.random() * 3 + 1);
        return prev;
      });
    }, 300);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-2 text-center animate-fade-in w-full max-w-xs mx-auto">
      {/* Container CSS 3D Scene */}
      <div className="relative w-50 h-37.5 flex items-center justify-center scale-90 sm:scale-100">
        {/* Ombres de sol */}
        <div className="elephant-shadow" />

        {/* 3D Elephant Container */}
        <div className="elephant-3d">
          <div className="elephant-body" />
          <div className="elephant-head">
            <div className="elephant-ear" />
            <div className="elephant-eye" />
            <div className="elephant-trunk" />
            <div className="elephant-tusk" />
          </div>
          <div className="elephant-tail" />

          {/* 4 Pattes animées */}
          <div className="elephant-leg elephant-leg1" />
          <div className="elephant-leg elephant-leg2" />
          <div className="elephant-leg elephant-leg3" />
          <div className="elephant-leg elephant-leg4" />
        </div>
      </div>

      {/* Texte Akwaba & Pourcentage */}
      <div className="mt-1 flex flex-col items-center gap-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
            Akwaba IA réfléchit<span className="dots-anim" />
          </span>
          <span className="text-xs font-extrabold text-akwaba-green font-mono">
            {progress}%
          </span>
        </div>
        <span className="text-[11px] text-slate-400">
          Génération et analyse en cours 🐘
        </span>
      </div>

      {/* Barre de Progression Fluide */}
      <div className="w-full max-w-50 h-1.5 mt-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200/50 dark:border-slate-700/50 shadow-inner">
        <div
          className="h-full bg-linear-to-r from-emerald-500 via-akwaba-green to-teal-400 transition-all duration-300 ease-out rounded-full shadow-sm"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Styles CSS 3D Isolés et Optimisés */}
      <style jsx>{`
        .elephant-shadow {
          position: absolute;
          width: 140px;
          height: 20px;
          left: 30px;
          bottom: 15px;
          border-radius: 50%;
          background: rgba(0, 0, 0, 0.15);
          filter: blur(6px);
          animation: shadowMove 0.8s ease-in-out infinite alternate;
        }

        .elephant-3d {
          position: absolute;
          width: 140px;
          height: 110px;
          left: 30px;
          top: 20px;
          transform-style: preserve-3d;
          animation: elephantBounce 0.8s ease-in-out infinite;
        }

        .elephant-body {
          position: absolute;
          width: 105px;
          height: 70px;
          left: 40px;
          top: 30px;
          border-radius: 50%;
          background: radial-gradient(circle at 30% 25%, #057A55 0%, #046C4E 35%, #03543F 70%, #013125 100%);
          box-shadow: inset -10px -12px 15px rgba(0,0,0,0.3), inset 10px 8px 15px rgba(255,255,255,0.25), 8px 12px 12px rgba(0,0,0,0.15);
          transform: rotateY(-8deg);
        }

        .elephant-head {
          position: absolute;
          width: 68px;
          height: 68px;
          left: 5px;
          top: 25px;
          border-radius: 50%;
          background: radial-gradient(circle at 30% 25%, #0E9F6E 0%, #057A55 35%, #046C4E 70%, #024734 100%);
          box-shadow: inset -8px -10px 12px rgba(0,0,0,0.3), inset 8px 7px 12px rgba(255,255,255,0.25), 6px 9px 10px rgba(0,0,0,0.15);
          transform: translateZ(15px);
        }

        .elephant-ear {
          position: absolute;
          width: 42px;
          height: 56px;
          left: -8px;
          top: 8px;
          border-radius: 55% 45% 50% 50%;
          background: radial-gradient(circle at 40% 35%, #057A55, #03543F 60%, #013125);
          box-shadow: inset -5px -5px 8px rgba(0,0,0,0.3);
          transform-origin: 90% 50%;
          animation: earMove 1.2s ease-in-out infinite alternate;
        }

        .elephant-eye {
          position: absolute;
          width: 9px;
          height: 9px;
          left: 40px;
          top: 23px;
          border-radius: 50%;
          background: #111;
          box-shadow: inset 2px 2px 2px white;
          z-index: 5;
        }

        .elephant-trunk {
          position: absolute;
          width: 52px;
          height: 17px;
          left: -18px;
          top: 50px;
          border-radius: 20px;
          background: linear-gradient(to bottom, #0E9F6E, #057A55 55%, #03543F);
          box-shadow: inset 0 4px 5px rgba(255,255,255,0.3), inset 0 -4px 5px rgba(0,0,0,0.25);
          transform-origin: 100% 50%;
          transform: rotate(-12deg);
          animation: trunkMove 1s ease-in-out infinite alternate;
        }

        .elephant-trunk::after {
          content: "";
          position: absolute;
          width: 17px;
          height: 17px;
          right: -6px;
          top: 0;
          border-radius: 50%;
          background: #03543F;
          box-shadow: inset 3px 3px 4px rgba(255,255,255,0.2);
        }

        .elephant-tusk {
          position: absolute;
          width: 20px;
          height: 28px;
          left: 5px;
          top: 52px;
          border: 4px solid #F39C12;
          border-top: none;
          border-left-color: transparent;
          border-radius: 0 0 80% 20%;
          transform: rotate(25deg);
        }

        .elephant-leg {
          position: absolute;
          width: 18px;
          height: 52px;
          top: 78px;
          border-radius: 10px;
          background: linear-gradient(90deg, #03543F, #0E9F6E 45%, #046C4E);
          transform-origin: 50% 5%;
          box-shadow: inset 4px 0 5px rgba(255,255,255,0.2), inset -4px 0 5px rgba(0,0,0,0.3);
        }

        .elephant-leg::after {
          content: "";
          position: absolute;
          width: 22px;
          height: 10px;
          left: -2px;
          bottom: -2px;
          border-radius: 50%;
          background: #013125;
        }

        .elephant-leg1 {
          left: 44px;
          animation: walk1 0.8s ease-in-out infinite alternate;
        }
        .elephant-leg2 {
          left: 66px;
          animation: walk2 0.8s ease-in-out infinite alternate;
        }
        .elephant-leg3 {
          left: 104px;
          animation: walk2 0.8s ease-in-out infinite alternate;
        }
        .elephant-leg4 {
          left: 126px;
          animation: walk1 0.8s ease-in-out infinite alternate;
        }

        .elephant-tail {
          position: absolute;
          width: 28px;
          height: 32px;
          right: -3px;
          top: 45px;
          border-right: 6px solid #03543F;
          border-bottom: 6px solid #03543F;
          border-radius: 0 0 20px 0;
          transform-origin: top left;
          animation: tailMove 0.8s ease-in-out infinite alternate;
        }

        .dots-anim::after {
          content: "";
          animation: dotsKey 1.4s steps(4, end) infinite;
        }

        @keyframes elephantBounce {
          0%, 100% { transform: translateY(0) rotateX(0deg) rotateZ(0deg); }
          50% { transform: translateY(-5px) rotateX(2deg) rotateZ(-1deg); }
        }

        @keyframes walk1 {
          0% { transform: rotate(14deg); }
          100% { transform: rotate(-14deg); }
        }

        @keyframes walk2 {
          0% { transform: rotate(-14deg); }
          100% { transform: rotate(14deg); }
        }

        @keyframes trunkMove {
          0% { transform: rotate(-12deg); }
          100% { transform: rotate(8deg); }
        }

        @keyframes earMove {
          0% { transform: rotate(-5deg); }
          100% { transform: rotate(8deg); }
        }

        @keyframes tailMove {
          0% { transform: rotate(-8deg); }
          100% { transform: rotate(12deg); }
        }

        @keyframes shadowMove {
          0% { transform: scaleX(0.9); opacity: 0.45; }
          100% { transform: scaleX(1); opacity: 0.2; }
        }

        @keyframes dotsKey {
          0% { content: ""; }
          25% { content: "."; }
          50% { content: ".."; }
          75%, 100% { content: "..."; }
        }
      `}</style>
    </div>
  );
}
