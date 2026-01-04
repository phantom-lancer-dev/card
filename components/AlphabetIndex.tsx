import React from 'react';

interface AlphabetIndexProps {
  letters: string[];
  onSelect: (letter: string) => void;
}

export const AlphabetIndex: React.FC<AlphabetIndexProps> = ({ letters, onSelect }) => {
  return (
    <div className="fixed right-1 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-1 py-3 bg-white/50 dark:bg-zinc-900/50 backdrop-blur rounded-full px-1">
      {letters.map((letter) => (
        <button
          key={letter}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(letter);
          }}
          className="text-[10px] font-bold text-zinc-400 hover:text-zinc-900 dark:hover:text-white w-5 h-5 flex items-center justify-center rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
        >
          {letter}
        </button>
      ))}
    </div>
  );
};