
import React from 'react';

const iconProps = {
  className: "w-6 h-6",
  viewBox: "0 0 24 24",
  fill: "currentColor",
  xmlns: "http://www.w3.org/2000/svg",
};

export const PlayIcon = () => (
  <svg {...iconProps}>
    <path d="M8 5v14l11-7z" />
  </svg>
);

export const PauseIcon = () => (
  <svg {...iconProps}>
    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
  </svg>
);

export const ChevronLeftIcon = () => (
  <svg {...iconProps}>
    <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
  </svg>
);

export const ChevronRightIcon = () => (
  <svg {...iconProps}>
    <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
  </svg>
);

export const BookOpenIcon = () => (
    <svg className="w-12 h-12 mx-auto text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
);

export const SparklesIcon = ({ className }: { className?: string }) => (
    <svg className={className || "w-5 h-5 inline-block mr-2"} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1.5a.5.5 0 001 0V3a1 1 0 112 0v1.5a.5.5 0 001 0V3a1 1 0 112 0v1.5a.5.5 0 001 0V3a1 1 0 112 0v5a1 1 0 01-1 1h-1.5a.5.5 0 000 1H17a1 1 0 110 2h-1.5a.5.5 0 000 1H17a1 1 0 110 2h-5a1 1 0 01-1-1v-1.5a.5.5 0 00-1 0V17a1 1 0 11-2 0v-1.5a.5.5 0 00-1 0V17a1 1 0 11-2 0v-5a1 1 0 011-1h1.5a.5.5 0 000-1H3a1 1 0 110-2h1.5a.5.5 0 000-1H3a1 1 0 110-2h5a1 1 0 011 1v1.5a.5.5 0 001 0V3a1 1 0 011-1z" clipRule="evenodd" />
    </svg>
);
