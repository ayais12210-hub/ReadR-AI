
import React, { useState, useEffect, useCallback } from 'react';
import { StorySetup } from './components/StorySetup';
import { Reader } from './components/Reader';
import * as geminiService from './services/geminiService';
import { decode, decodeAudioData } from './utils';
import { StoryPage, AspectRatio, LoadingState } from './types';
import LetterGlitch from './components/LetterGlitch';

const App: React.FC = () => {
  const [view, setView] = useState<'setup' | 'reader'>('setup');
  
  // Setup State
  const [story, setStory] = useState<string>('');
  const [character, setCharacter] = useState<string>('Mina the mouse, 7 years old, with soft grey fur and large curious ears. She always wears a bright yellow raincoat and little red boots. She is brave, curious, and loves exploring.');
  const [artStyle, setArtStyle] = useState<string>('Soft watercolour storybook illustration with pastel edges and a gentle paper grain texture.');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>(AspectRatio.LANDSCAPE);

  // Reader State
  const [pages, setPages] = useState<StoryPage[]>([]);
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(0);
  
  // Global State
  const [loading, setLoading] = useState<LoadingState>({ active: false, message: '' });
  const [error, setError] = useState<string | null>(null);

  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  
  useEffect(() => {
      // Create AudioContext after a user interaction (implicitly happens on button click)
      if(!audioContext) {
          setAudioContext(new (window.AudioContext || (window as any).webkitAudioContext)());
      }
  }, []);

  const resetState = () => {
    setView('setup');
    setStory('');
    setPages([]);
    setCurrentPageIndex(0);
    setError(null);
    setLoading({ active: false, message: '' });
  };

  const handleCreateStory = async () => {
    setError(null);
    setLoading({ active: true, message: 'Paginating your story' });

    try {
      const pageData = await geminiService.paginateStory(story);
      if (!pageData || pageData.length === 0) {
        throw new Error("The story couldn't be paginated. Try a different one.");
      }
      const initialPages: StoryPage[] = pageData.map((pd, index) => ({
        ...pd,
        id: `page-${index}`,
        status: 'pending',
      }));
      setPages(initialPages);
      setCurrentPageIndex(0);
      setView('reader');
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      console.error(e);
      setError(errorMessage);
    } finally {
      setLoading({ active: false, message: '' });
    }
  };
  
  const generatePageAssets = useCallback(async (index: number) => {
    if (index < 0 || index >= pages.length || pages[index].status !== 'pending') {
      return;
    }

    setPages(prev => prev.map((p, i) => i === index ? { ...p, status: 'generating' } : p));
    
    try {
      // Generate Illustration
      const illustrationPrompt = await geminiService.createIllustrationPrompt(pages[index], character, artStyle);
      const imageBytes = await geminiService.generateIllustration(illustrationPrompt, aspectRatio);
      const imageUrl = `data:image/png;base64,${imageBytes}`;
      
      // Generate Audio
      const audioBytes = await geminiService.generateAudio(pages[index].pageText);
      
      let audioUrl = '';
      if (audioContext) {
        const decodedBytes = decode(audioBytes);
        // FIX: Pass sampleRate (24000) and numChannels (1) to decodeAudioData.
        const audioBuffer = await decodeAudioData(decodedBytes, audioContext, 24000, 1);
        
        const wavBlob = bufferToWave(audioBuffer, audioBuffer.length);
        audioUrl = URL.createObjectURL(wavBlob);
      } else {
         // Fallback for when audio context is not ready
        audioUrl = `data:audio/webm;base64,${audioBytes}`;
      }

      setPages(prev => prev.map((p, i) => i === index ? { 
          ...p, 
          status: 'ready', 
          illustrationUrl: imageUrl,
          audioUrl: audioUrl,
          altText: illustrationPrompt 
      } : p));

    } catch (e) {
      console.error(`Failed to generate assets for page ${index}:`, e);
      setPages(prev => prev.map((p, i) => i === index ? { ...p, status: 'error' } : p));
    }
  }, [pages, character, artStyle, aspectRatio, audioContext]);
  
  useEffect(() => {
    if (view === 'reader' && pages.length > 0) {
        generatePageAssets(currentPageIndex); // Generate for current page
        generatePageAssets(currentPageIndex + 1); // Pre-fetch next page
    }
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, currentPageIndex, pages.length]); // generatePageAssets is memoized

  const handleNextPage = () => {
    if (currentPageIndex < pages.length - 1) {
      setCurrentPageIndex(prev => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex(prev => prev - 1);
    }
  };
  
  // Helper to convert AudioBuffer to a WAV blob, as it's more universally supported
  function bufferToWave(abuffer: AudioBuffer, len: number) {
    let numOfChan = abuffer.numberOfChannels,
        length = len * numOfChan * 2 + 44,
        buffer = new ArrayBuffer(length),
        view = new DataView(buffer),
        channels = [], i, sample,
        offset = 0,
        pos = 0;

    setUint32(0x46464952); // "RIFF"
    setUint32(length - 8); // file length - 8
    setUint32(0x45564157); // "WAVE"

    setUint32(0x20746d66); // "fmt " chunk
    setUint32(16); // length = 16
    setUint16(1); // PCM (uncompressed)
    setUint16(numOfChan);
    setUint32(abuffer.sampleRate);
    setUint32(abuffer.sampleRate * 2 * numOfChan); // avg. bytes/sec
    setUint16(numOfChan * 2); // block-align
    setUint16(16); // 16-bit

    setUint32(0x61746164); // "data" - chunk
    setUint32(length - pos - 4); // chunk length

    for (i = 0; i < abuffer.numberOfChannels; i++)
        channels.push(abuffer.getChannelData(i));

    while (pos < length) {
        for (i = 0; i < numOfChan; i++) {
            sample = Math.max(-1, Math.min(1, channels[i][offset]));
            sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0;
            view.setInt16(pos, sample, true);
            pos += 2;
        }
        offset++;
    }

    return new Blob([buffer], { type: "audio/wav" });

    function setUint16(data: number) {
        view.setUint16(pos, data, true);
        pos += 2;
    }

    function setUint32(data: number) {
        view.setUint32(pos, data, true);
        pos += 4;
    }
  }


  return (
    <div className="min-h-screen bg-black">
      <div className="absolute inset-0 z-0 opacity-40">
        <LetterGlitch
            glitchColors={['#2b4539', '#61dca3', '#61b3dc']}
            glitchSpeed={80}
            outerVignette={true}
            smooth={true}
            characters="ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
        />
      </div>
      <div className="relative z-10">
        {view === 'setup' ? (
          <StorySetup
            story={story}
            setStory={setStory}
            character={character}
            setCharacter={setCharacter}
            artStyle={artStyle}
            setArtStyle={setArtStyle}
            aspectRatio={aspectRatio}
            setAspectRatio={setAspectRatio}
            onSubmit={handleCreateStory}
            loading={loading}
            error={error}
          />
        ) : (
          <Reader
            pages={pages}
            currentPageIndex={currentPageIndex}
            onNext={handleNextPage}
            onPrev={handlePrevPage}
            onReset={resetState}
          />
        )}
      </div>
    </div>
  );
};

export default App;
