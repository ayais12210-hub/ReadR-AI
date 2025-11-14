import React, { useState } from 'react';
import { AspectRatio, LoadingState } from '../types';
import { SparklesIcon, BookOpenIcon } from './Icons';
import { getCharacterSuggestion, getArtStyleSuggestion, getStorySuggestion } from '../services/geminiService';


interface StorySetupProps {
  story: string;
  setStory: (story: string) => void;
  character: string;
  setCharacter: (character: string) => void;
  artStyle: string;
  setArtStyle: (artStyle: string) => void;
  aspectRatio: AspectRatio;
  setAspectRatio: (aspectRatio: AspectRatio) => void;
  onSubmit: () => void;
  loading: LoadingState;
  error: string | null;
}

export const StorySetup: React.FC<StorySetupProps> = ({
  story, setStory, character, setCharacter, artStyle, setArtStyle,
  aspectRatio, setAspectRatio, onSubmit, loading, error,
}) => {
  const [isSuggestingChar, setIsSuggestingChar] = useState(false);
  const [isSuggestingStyle, setIsSuggestingStyle] = useState(false);
  const [isSuggestingStory, setIsSuggestingStory] = useState(false);
  
  const handleSuggestCharacter = async () => {
    setIsSuggestingChar(true);
    try {
        const suggestion = await getCharacterSuggestion();
        setCharacter(suggestion);
    } catch (e) {
        console.error("Failed to get character suggestion", e);
    } finally {
        setIsSuggestingChar(false);
    }
  };

  const handleSuggestArtStyle = async () => {
      setIsSuggestingStyle(true);
      try {
          const suggestion = await getArtStyleSuggestion();
          setArtStyle(suggestion);
      } catch (e) {
          console.error("Failed to get art style suggestion", e);
      } finally {
          setIsSuggestingStyle(false);
      }
  };

  const handleSuggestStory = async () => {
    setIsSuggestingStory(true);
    try {
        const suggestion = await getStorySuggestion();
        setStory(suggestion);
    } catch (e) {
        console.error("Failed to get story suggestion", e);
    } finally {
        setIsSuggestingStory(false);
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <div className="text-center mb-8">
        <BookOpenIcon />
        <h1 className="text-4xl font-bold text-slate-100 mt-2">ReadR AI</h1>
        <p className="text-slate-300 mt-2">Create a magical, illustrated story with a voice.</p>
      </div>

      <div className="bg-black/60 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-slate-700">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label htmlFor="story" className="block text-sm font-semibold text-slate-300 mb-1">
              Your Story
            </label>
            <textarea
              id="story"
              rows={8}
              className="w-full p-3 bg-slate-900/70 border border-slate-700 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition text-slate-100 placeholder:text-slate-500"
              placeholder="Paste your story here, or let us suggest one for you..."
              value={story}
              onChange={(e) => setStory(e.target.value)}
            />
            <div className="flex justify-between items-center mt-1">
                <button
                    onClick={handleSuggestStory}
                    disabled={isSuggestingStory}
                    className="text-xs font-medium text-sky-400 hover:text-sky-300 flex items-center disabled:opacity-50 disabled:cursor-wait transition-colors"
                >
                    {isSuggestingStory ? (
                    <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Generating story idea...</span>
                    </>
                    ) : (
                    <>
                        <SparklesIcon className="w-4 h-4 mr-1" />
                        <span>Suggest a Story Idea</span>
                    </>
                    )}
                </button>
                {story && (
                  <button
                    onClick={() => setStory('')}
                    className="text-xs text-slate-400 hover:underline"
                  >
                    Clear
                  </button>
                )}
            </div>
          </div>

          <div>
            <label htmlFor="character" className="block text-sm font-semibold text-slate-300 mb-1">
              Character Bible
            </label>
            <div className="relative">
              <input
                id="character"
                type="text"
                className="w-full p-3 pr-12 bg-slate-900/70 border border-slate-700 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition text-slate-100"
                value={character}
                onChange={(e) => setCharacter(e.target.value)}
              />
              <button
                onClick={handleSuggestCharacter}
                disabled={isSuggestingChar}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-sky-400 hover:text-sky-300 disabled:opacity-50 disabled:cursor-wait transition-colors"
                aria-label="Suggest Character"
              >
                {isSuggestingChar ? (
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <SparklesIcon />
                )}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="artStyle" className="block text-sm font-semibold text-slate-300 mb-1">
              Art Style
            </label>
            <div className="relative">
              <input
                id="artStyle"
                type="text"
                className="w-full p-3 pr-12 bg-slate-900/70 border border-slate-700 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition text-slate-100"
                value={artStyle}
                onChange={(e) => setArtStyle(e.target.value)}
              />
              <button
                onClick={handleSuggestArtStyle}
                disabled={isSuggestingStyle}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-sky-400 hover:text-sky-300 disabled:opacity-50 disabled:cursor-wait transition-colors"
                aria-label="Suggest Art Style"
              >
                {isSuggestingStyle ? (
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <SparklesIcon />
                )}
              </button>
            </div>
          </div>
          
          <div className="md:col-span-2">
            <label htmlFor="aspectRatio" className="block text-sm font-semibold text-slate-300 mb-1">
              Illustration Aspect Ratio
            </label>
            <select
                id="aspectRatio"
                className="w-full p-3 bg-slate-900/70 border border-slate-700 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition text-slate-100"
                value={aspectRatio}
                onChange={(e) => setAspectRatio(e.target.value as AspectRatio)}
            >
                <option value={AspectRatio.LANDSCAPE}>Landscape (16:9)</option>
                <option value={AspectRatio.PORTRAIT}>Portrait (9:16)</option>
                <option value={AspectRatio.SQUARE}>Square (1:1)</option>
            </select>
          </div>
        </div>

        {error && (
            <div className="bg-red-900/50 border border-red-500 text-red-300 px-4 py-3 rounded-lg relative mt-6" role="alert">
                <strong className="font-bold">Oh no! </strong>
                <span className="block sm:inline">{error}</span>
            </div>
        )}

        <div className="mt-6">
          <button
            onClick={onSubmit}
            disabled={loading.active || !story || !character || !artStyle}
            className="w-full bg-sky-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-sky-700 disabled:bg-slate-500 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            {loading.active ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {loading.message}...
              </>
            ) : (
             <>
               <SparklesIcon /> Create My Story
             </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};