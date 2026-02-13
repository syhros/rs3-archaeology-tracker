import React, { useState } from 'react';
import { Artefact, CheckedCollections } from '../types';

interface ArtefactCardProps {
  artefact: Artefact;
  damagedCount: number;
  repairedCount: number;
  donatedCount: number;
  checkedCollections: CheckedCollections;
  onCountChange: (name: string, type: 'damaged' | 'repaired', val: number) => void;
}

const cleanCollectionName = (name: string) => {
  return name.replace(/\s*\(.*?\)\s*$/, '');
};

export const ArtefactCard: React.FC<ArtefactCardProps> = ({
  artefact,
  damagedCount,
  repairedCount,
  donatedCount,
  checkedCollections,
  onCountChange,
}) => {
  const [imgError, setImgError] = useState(false);
  
  const remaining = Math.max(0, artefact.total_needed - (damagedCount + repairedCount + donatedCount));
  
  let cardStyleClass = 'bg-gray-800 border-gray-700 hover:border-blue-500';
  let leftTextColorClass = 'text-red-400';
  let bottomSectionClass = 'border-gray-700 bg-gray-900/30';

  if (remaining === 0) {
      if (damagedCount > 0) {
          // Yellow: Left is 0, but user still has damaged ones to process
          cardStyleClass = 'bg-yellow-900/40 border-yellow-600 hover:border-yellow-400';
          leftTextColorClass = 'text-yellow-400';
          bottomSectionClass = 'border-yellow-700 bg-yellow-950/30';
      } else {
          // Green: Left is 0 and no damaged ones pending
          cardStyleClass = 'bg-green-900 border-green-700';
          leftTextColorClass = 'text-green-400';
          bottomSectionClass = 'border-green-800 bg-green-950/30';
      }
  }

  const imgSrc = `/img/${artefact.img_src}`;

  // Split collections and other uses
  const collections = artefact.collections || [];
  const otherUses = artefact.other_uses || [];

  // Dig Site Info
  const primaryDigSite = artefact.dig_sites && artefact.dig_sites.length > 0 ? artefact.dig_sites[0] : null;

  return (
    <div
      className={`
        w-full min-w-[220px] max-w-[280px]
        border rounded-lg shadow-lg overflow-hidden flex flex-col transition-colors duration-300
        ${cardStyleClass}
      `}
    >
      {/* Header Section: Image, Name, Stats */}
      <div className="flex gap-3 p-3 items-start">
        <div className="flex-shrink-0 w-[40px] h-[40px] p-1 flex items-center justify-center bg-gray-900 rounded border border-gray-700 overflow-hidden">
           {imgError ? (
             <span className="text-[8px] text-red-400">?</span>
           ) : (
             <img 
               src={imgSrc} 
               alt={artefact.name} 
               className="w-full h-full object-contain" 
               onError={() => setImgError(true)}
             />
           )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
              <h3 className="font-bold text-sm text-white truncate leading-tight mr-1" title={artefact.name}>
                {artefact.name}
              </h3>
              <span className="text-[10px] text-gray-500 font-mono bg-gray-900/50 px-1 rounded whitespace-nowrap shrink-0">
                Lvl {artefact.level}
              </span>
          </div>
          
          {primaryDigSite && (
            <div className="text-[10px] text-blue-400 mt-0.5 truncate leading-tight">
               <a 
                 href={`https://runescape.wiki/w/${primaryDigSite.replace(/ /g, '_')}`}
                 target="_blank"
                 rel="noopener noreferrer"
                 className="hover:underline"
                 title={`Wiki: ${primaryDigSite}`}
               >
                 {primaryDigSite}
               </a>
            </div>
          )}

          <div className="text-[10px] text-gray-400 mt-0.5 truncate leading-tight font-mono">
            XP: {artefact.xp} <span className="text-gray-600">|</span> Chronotes: {artefact.individual_chronotes}
          </div>
        </div>
      </div>

      {/* Grid: Total / Damaged / Repaired / Left */}
      <div className={`p-2 border-t border-b ${bottomSectionClass}`}>
        <div className="grid grid-cols-4 gap-1 items-center text-center">
            
            <div className="flex flex-col">
                <span className="text-[9px] text-gray-500 uppercase tracking-wide">Total</span>
                <span className="font-bold text-sm text-white">{artefact.total_needed}</span>
            </div>

            <div className="flex flex-col">
                <label htmlFor={`damaged-${artefact.name}`} className="text-[9px] text-gray-500 uppercase tracking-wide mb-0.5">Dmg</label>
                <input
                    id={`damaged-${artefact.name}`}
                    type="number"
                    min="0"
                    value={damagedCount}
                    onChange={(e) => onCountChange(artefact.name, 'damaged', parseInt(e.target.value) || 0)}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-1 py-0.5 text-center text-white text-sm focus:border-blue-500 focus:outline-none"
                    onClick={(e) => (e.target as HTMLInputElement).select()}
                />
            </div>

            <div className="flex flex-col">
                <label htmlFor={`repaired-${artefact.name}`} className="text-[9px] text-gray-500 uppercase tracking-wide mb-0.5">Rep</label>
                <input
                    id={`repaired-${artefact.name}`}
                    type="number"
                    min="0"
                    value={repairedCount}
                    onChange={(e) => onCountChange(artefact.name, 'repaired', parseInt(e.target.value) || 0)}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-1 py-0.5 text-center text-white text-sm focus:border-blue-500 focus:outline-none"
                    onClick={(e) => (e.target as HTMLInputElement).select()}
                />
            </div>

            <div className="flex flex-col">
                <span className="text-[9px] text-gray-500 uppercase tracking-wide">Left</span>
                <span className={`font-bold text-sm ${leftTextColorClass}`}>
                    {remaining}
                </span>
            </div>

        </div>
      </div>

      {/* Footer: Split Collections (Left) vs Other Uses (Right) */}
      <div className="p-2 bg-gray-900/20 flex-1 grid grid-cols-2 gap-3">
        {/* Left: Collections */}
        <div className="text-left">
            <ul className="space-y-1">
                {collections.length === 0 && <li className="text-[10px] text-gray-600 italic">-</li>}
                {collections.map((name, idx) => {
                    const isChecked = checkedCollections[name];
                    const displayName = cleanCollectionName(name);
                    return (
                        <li key={`col-${name}-${idx}`} className={`text-[10px] leading-tight truncate ${isChecked ? 'text-green-400 line-through decoration-green-600/50' : 'text-gray-400'}`} title={displayName}>
                            {displayName}
                        </li>
                    );
                })}
            </ul>
        </div>

        {/* Right: Other Uses */}
        <div className="text-right border-l border-gray-700/50 pl-2">
            <ul className="space-y-1">
                {otherUses.length === 0 && <li className="text-[10px] text-gray-600 italic">-</li>}
                {otherUses.map((name, idx) => {
                    const isChecked = checkedCollections[name];
                    return (
                        <li key={`use-${name}-${idx}`} className={`text-[10px] leading-tight truncate ${isChecked ? 'text-green-400 line-through decoration-green-600/50' : 'text-gray-400'}`} title={name}>
                            {name}
                        </li>
                    );
                })}
            </ul>
        </div>
      </div>
    </div>
  );
};
