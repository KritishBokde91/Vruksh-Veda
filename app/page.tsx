'use client';

import { useState, useEffect, useRef } from 'react';
import { Leaf, ArrowRight, Sparkles, BookOpen, Heart, ChevronDown, Scan, TreeDeciduous } from 'lucide-react';

export default function Home() {
  const [scrollY, setScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const heroRef = useRef(null);

  useEffect(() => {
    setIsVisible(true);

    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    interface MousePosition {
      x: number;
      y: number;
    }

    const handleMouseMove = (e: MouseEvent): void => {
      setMousePosition({
        x: (e.clientX - window.innerWidth / 2) / 50,
        y: (e.clientY - window.innerHeight / 2) / 50,
      });
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const parallaxOffset = scrollY * 0.5;

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* FULL PAGE BACKGROUND IMAGE WITH OPACITY */}
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: "url('/src/bg.jpg')",
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed', // Parallax effect
          opacity: 0.80,
          transform: `translateY(${parallaxOffset * 0.3}px)`, // Subtle parallax
        }}
      />

      {/* Optional: Dark overlay to improve text readability */}
      <div className="fixed inset-0 z-0 bg-gradient-to-br from-emerald-900/10 via-teal-900/5 to-green-900/10 pointer-events-none" />

      <style>
        {`
        /* ... your existing keyframes ... */

        /* Enhance glassmorphism over background */
        // .glass-morphism {
        //   background: rgba(255, 255, 255, 0.85);
        //   backdrop-filter: blur(12px);
        //   -webkit-backdrop-filter: blur(12px);
        //   border: 1px solid rgba(255, 255, 255, 0.4);
        //   box-shadow: 0 8px 32px rgba(0, 0, 0, 0.05);
        // }

        /* Optional: Add subtle texture overlay */
        .bg-texture::before {
          content: '';
          position: absolute;
          inset: 0;
          background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="4" height="4" viewBox="0 0 4 4"><path fill="%23f0fdf4" fill-opacity="0.05" d="M1 3h1v1H1V3zm2-2h1v1H3V1z"></path></svg>');
          pointer-events: none;
          z-index: 1;
        }

        .bg-noise::before {
          content: '';
          position: fixed;
          inset: 0;
          background: url('https://www.transparenttextures.com/patterns/cream-dust.png');
          opacity: 0.03;
          pointer-events: none;
          z-index: 1;
        }
      `}
      </style>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-morphism border-b border-emerald-100 backdrop-blur-xl">
        {/* ... nav content ... */}
      </nav>

      <div
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center overflow-hidden bg-transparent"
      >
        {/* Your existing gradient blobs */}
        <div
          // className="absolute inset-0 bg-linear-to-br from-emerald-50 via-teal-50 to-green-50"
          // style={{
          //   transform: `translateY(${parallaxOffset}px)`,
          //   mixBlendMode: 'soft-light',
          //   opacity: 0.7,
          // }}
        >
          {/* Keep your animated blobs */}
          <div className="absolute top-20 right-20 w-96 h-96 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-float" />
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-float" style={{ animationDelay: '2s' }} />
          <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-float" style={{ animationDelay: '4s' }} />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className={`mb-8 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
            <h1 className="text-5xl sm:text-6xl lg:text-8xl font-bold mb-6 leading-tight">
              <span className="block text-gray-900">Know Your Roots -</span>
              <span className="block gradient-text mt-2">preserve Ayurveda</span>
            </h1>
          </div>

          <div className={`mb-12 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.2s' }}>
            <p className="text-lg sm:text-xl lg:text-2xl text-gray-700 max-w-4xl mx-auto leading-relaxed font-light">
              Explore the wisdom of nature through Ayurvedic trees, shlokas, and healing knowledge
            </p>
          </div>
        </div>
      </div>

      {/* Optional: Add subtle texture overlay on hero */}
      <div className="relative bg-texture -z-10" />
    </div>
  );
}