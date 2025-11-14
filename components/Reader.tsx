
import React, { useState, useRef, useEffect } from 'react';
import { StoryPage } from '../types';
import { PlayIcon, PauseIcon, ChevronLeftIcon, ChevronRightIcon } from './Icons';

interface ReaderProps {
  pages: StoryPage[];
  currentPageIndex: number;
  onNext: () => void;
  onPrev: () => void;
  onReset: () => void;
}

const PagePlaceholder: React.FC<{ status: 'generating' | 'error' | 'pending' }> = ({ status }) => (
  <div className="w-full h-full bg-slate-800/50 rounded-lg flex flex-col items-center justify-center animate-pulse">
    <svg className="w-16 h-16 text-slate-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" />
    </svg>
    <p className="mt-4 text-slate-400 font-medium">
      {status === 'generating' && 'Illustrating this page...'}
      {status === 'error' && 'Could not create illustration.'}
      {status === 'pending' && 'Waiting to be illustrated...'}
    </p>
  </div>
);

export const Reader: React.FC<ReaderProps> = ({ pages, currentPageIndex, onNext, onPrev, onReset }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const currentPage = pages[currentPageIndex];

  useEffect(() => {
    if (audioRef.current && currentPage?.audioUrl) {
      audioRef.current.src = currentPage.audioUrl;
      if (isPlaying) {
        audioRef.current.play().catch(e => console.error("Audio play failed:", e));
      }
    }
  }, [currentPage?.audioUrl, isPlaying]);
  
  // Auto-play when page is ready and user has already clicked play once
  useEffect(() => {
    if (currentPage?.status === 'ready' && isPlaying) {
        if (audioRef.current) {
            audioRef.current.play().catch(e => console.error("Auto-play failed:", e));
        }
    }
  }, [currentPage?.status, isPlaying, currentPageIndex])


  const togglePlayPause = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(e => console.error("Audio play failed:", e));
      setIsPlaying(true);
    }
  };

  const handleNext = () => {
    setIsPlaying(false);
    if(audioRef.current) audioRef.current.pause();
    onNext();
  }

  const handlePrev = () => {
    setIsPlaying(false);
    if(audioRef.current) audioRef.current.pause();
    onPrev();
  }

  if (!currentPage) {
    return <div>Story finished!</div>;
  }
  
  return (
    <div className="w-full max-w-5xl mx-auto p-4 flex flex-col h-screen">
       <header className="flex-shrink-0 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-100">Your Illustrated Story</h1>
        <button 
          onClick={onReset}
          className="bg-slate-800 text-slate-200 px-4 py-2 rounded-lg font-semibold hover:bg-slate-700 transition-colors"
        >
          New Story
        </button>
      </header>
      <main className="flex-grow flex flex-col md:flex-row gap-6 min-h-0">
        <div className="md:w-1/2 flex-shrink-0 flex items-center justify-center aspect-square md:aspect-auto">
          {currentPage.status === 'ready' && currentPage.illustrationUrl ? (
            <img 
              src={currentPage.illustrationUrl} 
              alt={currentPage.altText}
              className="w-full h-full object-contain rounded-xl shadow-lg border-4 border-slate-800" 
            />
          ) : (
            <PagePlaceholder status={currentPage.status}/>
          )}
        </div>
        <div className="md:w-1/2 flex flex-col bg-black/60 backdrop-blur-md p-6 rounded-xl shadow-lg border border-slate-700">
          <div className="flex-grow overflow-y-auto">
            <p className="text-xl md:text-2xl leading-relaxed text-slate-200 font-serif">
              {currentPage.pageText}
            </p>
          </div>
          <div className="flex-shrink-0 mt-6 pt-6 border-t border-slate-700">
            <div className="flex items-center justify-center gap-6">
              <button
                onClick={handlePrev}
                disabled={currentPageIndex === 0}
                className="p-3 rounded-full bg-slate-800 text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors"
                aria-label="Previous Page"
              >
                <ChevronLeftIcon />
              </button>
              <button
                onClick={togglePlayPause}
                disabled={currentPage.status !== 'ready'}
                className="p-4 rounded-full bg-sky-600 text-white disabled:bg-slate-500 hover:bg-sky-700 transition-colors"
                aria-label={isPlaying ? "Pause Narration" : "Play Narration"}
              >
                {isPlaying ? <PauseIcon /> : <PlayIcon />}
              </button>
              <button
                onClick={handleNext}
                disabled={currentPageIndex >= pages.length - 1}
                className="p-3 rounded-full bg-slate-800 text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors"
                aria-label="Next Page"
              >
                <ChevronRightIcon />
              </button>
            </div>
            <div className="text-center text-sm text-slate-400 mt-4">
              Page {currentPageIndex + 1} of {pages.length}
            </div>
          </div>
        </div>
      </main>
      <audio ref={audioRef} onEnded={() => setIsPlaying(false)} className="hidden" />
    </div>
  );
};
