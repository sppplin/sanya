import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronDown, 
  Volume2, 
  VolumeX,
} from 'lucide-react';

interface VideoSectionProps {
  src: string;
  id: string;
  showScrollIndicator?: boolean;
  nextSectionId?: string;
}

const VideoSection: React.FC<VideoSectionProps> = ({ 
  src, 
  id, 
  showScrollIndicator = false, 
  nextSectionId 
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (videoRef.current) {
          if (entry.isIntersecting) {
            videoRef.current.play().catch((err) => console.log("Auto-play blocked:", err));
          } else {
            videoRef.current.pause();
          }
        }
      },
      { threshold: 0.5 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  const handleScrollDown = () => {
    if (nextSectionId) {
      document.getElementById(nextSectionId)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div 
      ref={containerRef}
      id={id}
      className="h-screen h-[100dvh] w-full snap-start relative flex items-center justify-center overflow-hidden bg-black"
    >
      <video
        ref={videoRef}
        src={src}
        loop
        muted
        playsInline
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover"
      />
      {/* Elegant Floating Scroll Indicator */}
      {showScrollIndicator && nextSectionId && (
        <motion.div 
          onClick={handleScrollDown}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: [0.7, 1, 0.7], y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 cursor-pointer z-20 text-white select-none text-center hover:scale-105 transition-transform duration-300 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]"
        >
          <span className="font-sans text-[10px] sm:text-xs tracking-[0.3em] uppercase font-black text-white">
            Scroll Down
          </span>
          <ChevronDown className="w-5 h-5 text-white stroke-[2.5]" />
        </motion.div>
      )}
    </div>
  );
};

export default function App() {
  const [step, setStep] = useState<'envelope' | 'video1' | 'content'>('envelope');
  const [isPlaying, setIsPlaying] = useState(false);
  const video1Ref = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Eagerly prefetch, buffer, and cache all media elements on app startup to guarantee ultra-fast, lag-free playback
  useEffect(() => {
    const resources = [
      "https://1l37nwyltkjspogd.public.blob.vercel-storage.com/3%20-%20Trim.mp4",
      "https://1l37nwyltkjspogd.public.blob.vercel-storage.com/2.mp4",
      "https://1l37nwyltkjspogd.public.blob.vercel-storage.com/3.mp4",
      "https://1l37nwyltkjspogd.public.blob.vercel-storage.com/4.mp4",
      "https://1l37nwyltkjspogd.public.blob.vercel-storage.com/3%20%281%29.mp3"
    ];
    
    resources.forEach(url => {
      if (url.endsWith('.mp3')) {
        const audio = new Audio();
        audio.src = url;
        audio.preload = 'auto';
      } else {
        const video = document.createElement('video');
        video.src = url;
        video.preload = 'auto';
        video.muted = true;
        video.playsInline = true;
        video.load(); // Forces eager loading and caching in browser
      }
    });
  }, []);

  useEffect(() => {
    // Lock scrolling on envelope and video1 screens, allow it only for content
    if (step === 'content') {
      document.body.style.overflow = 'auto';
    } else {
      document.body.style.overflow = 'hidden';
    }
  }, [step]);

  const handleOpenGate = () => {
    setStep('video1');
    if (audioRef.current) {
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(err => console.error("Audio autoplay prevented:", err));
    }
  };

  const handleVideo1End = () => {
    setStep('content');
  };

  const toggleMusic = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(err => console.error("Audio play failed:", err));
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="relative min-h-screen min-h-[100dvh] w-full bg-black overflow-x-hidden text-white font-sans">
      {/* Background Ambient Audio */}
      <audio 
        ref={audioRef}
        src="https://1l37nwyltkjspogd.public.blob.vercel-storage.com/3%20%281%29.mp3"
        loop
      />

      {/* Music Toggle Button */}
      <AnimatePresence>
        {step !== 'envelope' && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={toggleMusic}
            className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50 p-2.5 bg-black/45 backdrop-blur-md rounded-full shadow-xl border border-white/20 text-wedding-gold hover:bg-black/60 hover:scale-105 transition-all duration-300"
            aria-label={isPlaying ? "Mute Music" : "Play Music"}
          >
            {isPlaying ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </motion.button>
        )}
      </AnimatePresence>

      {/* --- STEP 1: COVER / GATE PAGE --- */}
      <AnimatePresence>
        {step === 'envelope' && (
          <motion.div
            key="envelope"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: "easeInOut" }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-end p-8 overflow-hidden bg-black"
          >
            {/* Gate Image */}
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: "url('https://1l37nwyltkjspogd.public.blob.vercel-storage.com/Ritvik_page-0001.jpg.jpeg')" }}
            />

            {/* Floating plain white click prompt at the bottom */}
            <div className="relative z-10 text-center mb-16">
              <button 
                onClick={handleOpenGate}
                className="text-white font-serif text-sm md:text-base tracking-[0.35em] uppercase font-semibold hover:text-stone-300 transition-colors duration-300 cursor-pointer py-4 px-8 focus:outline-none"
              >
                Tap to Open
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- STEP 2: VIDEO 1 (GATE OPENING) --- */}
      <AnimatePresence>
        {step === 'video1' && (
          <motion.div
            key="video1-transition"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: "easeInOut" }}
            className="fixed inset-0 z-[90] bg-black flex items-center justify-center overflow-hidden"
          >
            <video 
              ref={video1Ref}
              src="https://1l37nwyltkjspogd.public.blob.vercel-storage.com/3%20-%20Trim.mp4"
              autoPlay
              onEnded={handleVideo1End}
              muted={true}
              playsInline
              preload="auto"
              className="w-full h-full object-cover"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- STEP 3: MAIN SCROLLABLE VIDEO PAGES --- */}
      <main className={`relative w-full h-screen h-[100dvh] transition-opacity duration-[1000ms] ease-in-out ${step === 'content' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="h-full w-full overflow-y-auto snap-y snap-mandatory scroll-smooth bg-black">
          {/* Section 1: Video 2 */}
          <VideoSection 
            id="sec-1"
            src="https://1l37nwyltkjspogd.public.blob.vercel-storage.com/2.mp4"
            showScrollIndicator={true}
            nextSectionId="sec-2"
          />

          {/* Section 2: Video 3 */}
          <VideoSection 
            id="sec-2"
            src="https://1l37nwyltkjspogd.public.blob.vercel-storage.com/3.mp4"
            showScrollIndicator={true}
            nextSectionId="sec-3"
          />

          {/* Section 3: Video 4 */}
          <VideoSection 
            id="sec-3"
            src="https://1l37nwyltkjspogd.public.blob.vercel-storage.com/4.mp4"
            showScrollIndicator={false}
          />
        </div>
      </main>
    </div>
  );
}
