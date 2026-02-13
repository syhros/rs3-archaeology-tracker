import React, { useState } from 'react';
import { Artefact } from '../types';

interface ArtefactCardProps {
  artefact: Artefact;
  bankedCount: number;
  donatedCount: number;
  onBankedChange: (name: string, val: number) => void;
}

export const ArtefactCard: React.FC<ArtefactCardProps> = ({
  artefact,
  bankedCount,
  donatedCount,
  onBankedChange,
}) => {
  const [imgError, setImgError] = useState(false);
  const [debugUrl, setDebugUrl] = useState(''); // Store full resolved URL for debugging

  const remaining = Math.max(0, artefact.total_needed - (bankedCount + donatedCount));
  const isComplete = remaining === 0;

  // STRICT LOCAL PATH:
  // Browser will look for: [Current URL]/img/[Filename]
  const imgSrc = `img/${artefact.img_src}`;

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.currentTarget;
    // Capture the absolute URL the browser tried to fetch
    setDebugUrl(target.src); 
    setImgError(true);
    console.error(`[Image Load Error] Relative: ${imgSrc} | Absolute: ${target.src}`);
  };

  return (
    <div
      className={`
        border rounded-lg shadow-lg overflow-hidden flex flex-col transition-colors duration-300
        ${isComplete ? 'bg-green-900 border-green-700' : 'bg-gray-800 border-gray-700 hover:border-blue-500'}
      `}
    >
      <div className="flex p-4 gap-4 flex-1">
        {/* Left: Image */}
        <div className="flex-shrink-0">
           {imgError ? (
             <div 
               className="w-20 h-20 rounded bg-gray-900 flex flex-col items-center justify-center text-xs text-red-400 border border-red-900 p-1 overflow-hidden cursor-help"
               title={`Failed to load image.\n\nRelative path: ${imgSrc}\n\nAbsolute path (what browser tried): ${debugUrl}\n\nMake sure the file exists exactly at this location.`}
             >
               <span className="font-bold mb-1 uppercase tracking-wider text-[10px]">Error</span>
               <span className="text-[8px] break-all leading-tight text-center text-gray-500 font-mono">
                 {imgSrc}
               </span>
             </div>
           ) : (
             <img 
               src={imgSrc} 
               alt={artefact.name} 
               className="w-20 h-20 rounded bg-gray-900/50 object-contain p-1" 
               onError={handleImageError}
             />
           )}
        </div>

        {/* Right/Center: Details */}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-lg text-white truncate" title={artefact.name}>{artefact.name}</h3>
          <p className="text-gray-400 text-sm italic mb-2 truncate" title={artefact.dig_sites.join(', ')}>{artefact.dig_sites.join(', ')}</p>
          
          <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-sm text-gray-300">
            <div className="flex justify-between">
              <span>Level:</span>
              <span className="font-mono text-white">{artefact.level}</span>
            </div>
            <div className="flex justify-between">
              <span>XP:</span>
              <span className="font-mono text-white">{artefact.xp}</span>
            </div>
            <div className="col-span-2 flex justify-between">
              <span>Chronotes:</span>
              <span className="font-mono text-white">{artefact.individual_chronotes}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className={`p-4 border-t ${isComplete ? 'border-green-800 bg-green-950/50' : 'border-gray-700 bg-gray-900/50'}`}>
        <div className="grid grid-cols-3 gap-2 items-center text-center">
            
            {/* Total Needed */}
            <div className="flex flex-col">
                <span className="text-xs text-gray-400 uppercase tracking-wide">Total</span>
                <span className="font-bold text-lg text-white">{artefact.total_needed}</span>
            </div>

            {/* Banked Input */}
            <div className="flex flex-col">
                <label htmlFor={`banked-${artefact.name}`} className="text-xs text-gray-400 uppercase tracking-wide mb-1">Banked</label>
                <input
                    id={`banked-${artefact.name}`}
                    type="number"
                    min="0"
                    value={bankedCount}
                    onChange={(e) => onBankedChange(artefact.name, parseInt(e.target.value) || 0)}
                    className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-center text-white focus:border-blue-500 focus:outline-none"
                    onClick={(e) => (e.target as HTMLInputElement).select()}
                />
            </div>

            {/* Remaining */}
            <div className="flex flex-col">
                <span className="text-xs text-gray-400 uppercase tracking-wide">Remaining</span>
                <span className={`font-bold text-lg ${isComplete ? 'text-green-400' : 'text-red-400'}`}>
                    {remaining}
                </span>
            </div>

        </div>
        {/* Helper text for donation calculation debug */}
        <div className="text-[10px] text-gray-500 text-center mt-2">
            Donated: {donatedCount} (from collections)
        </div>
      </div>
    </div>
  );
};
