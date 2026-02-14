import React, { useState } from 'react';
import { Artefact, CheckedCollections } from '../types';
import { NumberInput } from './NumberInput';

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
  const hasAnyCount = damagedCount > 0 || repairedCount > 0 || donatedCount > 0;

  let cardStyleClass = 'bg-gray-800 border-gray-700 hover:border-blue-500';
  let leftTextColorClass = 'text-red-400';
  let labelColorClass = 'text-gray-500';
  let bottomSectionClass = 'border-gray-700 bg-gray-900/30';

  if (remaining === 0) {
      if (damagedCount > 0) {
          // Yellow: Left is 0, but user still has damaged ones to process
          cardStyleClass = 'bg-yellow-900/40 border-yellow-600 hover:border-yellow-400';
          leftTextColorClass = 'text-yellow-400';
          labelColorClass = 'text-yellow-300 font-semibold';
          bottomSectionClass = 'border-yellow-700 bg-yellow-950/30';
      } else if (hasAnyCount) {
          // Green: Left is 0 and no damaged ones pending (only if something was entered)
          cardStyleClass = 'bg-green-900 border-green-700';
          leftTextColorClass = 'text-green-400';
          labelColorClass = 'text-green-300 font-semibold';
          bottomSectionClass = 'border-green-800 bg-green-950/30';
      }
  }

  const imgSrc = `/img/${artefact.img_src}`;

  // Split collections and other uses
  const collections = artefact.collections || [];
  const otherUses = artefact.other_uses || [];

  // Dig Site Info
  const primaryDigSite = artefact.dig_sites && artefact.dig_sites.length > 0 ? artefact.dig_sites[0] : null;

  const [showCollections, setShowCollections] = useState(false);

  const handleRepairClick = () => {
    if (damagedCount > 0) {
        onCountChange(artefact.name, 'damaged', damagedCount - 1);
        onCountChange(artefact.name, 'repaired', repairedCount + 1);
    }
  };

  const handleRepairAll = () => {
    if (damagedCount > 0) {
        onCountChange(artefact.name, 'repaired', repairedCount + damagedCount);
        onCountChange(artefact.name, 'damaged', 0);
    }
  };

  const hasRelevantInfo = collections.length > 0 || otherUses.length > 0;

  return (
    <div
      className={`
        w-full min-w-[240px] max-w-[300px] sm:max-w-[280px]
        border rounded-lg shadow-lg overflow-hidden flex flex-col transition-colors duration-300
        ${cardStyleClass}
      `}
    >
      {/* Header Section: Image, Name, Stats */}
      <div className="flex gap-2 sm:gap-3 p-2.5 sm:p-3 items-start">
        <div className="flex-shrink-0 w-[44px] h-[44px] sm:w-[40px] sm:h-[40px] p-1 flex items-center justify-center bg-gray-900 rounded border border-gray-700 overflow-hidden">
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
          <div className="flex justify-between items-start gap-1">
              <h3 className="font-bold text-xs sm:text-sm text-white truncate leading-snug mr-1" title={artefact.name}>
                {artefact.name}
              </h3>
              <span className="text-[9px] sm:text-[10px] text-gray-500 font-mono bg-gray-900/50 px-1.5 py-0.5 rounded whitespace-nowrap shrink-0">
                Lvl {artefact.level}
              </span>
          </div>

          {primaryDigSite && (
            <div className="text-[9px] sm:text-[10px] text-blue-400 mt-0.5 truncate leading-tight">
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

          <div className="text-[10px] sm:text-[11px] text-gray-400 mt-0.5 truncate leading-tight font-mono">
            <span className="text-gray-300">{artefact.xp} XP</span> <span className="text-gray-600">·</span> <span className="text-gray-300">{artefact.individual_chronotes}</span> <span className="text-gray-600">CN</span>
          </div>
        </div>
      </div>

      {/* Grid: Total / Damaged / Arrow / Repaired / Left */}
      <div className={`px-2.5 py-2 sm:p-2 border-t border-b ${bottomSectionClass}`}>
        <div className="grid grid-cols-[auto_1fr_auto_1fr_auto] gap-1.5 sm:gap-2 items-center text-center">

            {/* Total */}
            <div className="flex flex-col">
                <span className={`text-[8px] sm:text-[9px] tracking-wider font-medium ${labelColorClass}`}>Total</span>
                <span className="font-bold text-xs sm:text-sm text-white">{artefact.total_needed}</span>
            </div>

            {/* Damaged */}
            <NumberInput
              value={damagedCount}
              onChange={(val) => onCountChange(artefact.name, 'damaged', val)}
              label="Damaged"
              max={999}
              showButtons={true}
              labelClassName={labelColorClass}
            />

            {/* Repair Buttons */}
            <div className="flex flex-col items-center justify-center gap-0.5">
                <button
                    onClick={handleRepairClick}
                    disabled={damagedCount <= 0}
                    className={`
                        p-1 rounded transition-colors
                        ${damagedCount > 0
                            ? 'text-blue-400 hover:bg-blue-900/50 cursor-pointer'
                            : 'text-gray-600 cursor-default'
                        }
                    `}
                    title="Repair 1"
                >
                    <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                </button>
                {damagedCount > 1 && (
                    <button
                        onClick={handleRepairAll}
                        className="text-blue-400 hover:bg-blue-900/50 p-0.5 rounded transition-colors text-[7px] sm:text-[8px] font-bold"
                        title={`Repair All (${damagedCount})`}
                    >
                        ALL
                    </button>
                )}
            </div>

            {/* Repaired */}
            <NumberInput
              value={repairedCount}
              onChange={(val) => onCountChange(artefact.name, 'repaired', val)}
              label="Restored"
              max={999}
              showButtons={true}
              labelClassName={labelColorClass}
            />

            {/* Left */}
            <div className="flex flex-col">
                <span className={`text-[8px] sm:text-[9px] tracking-wider font-medium ${labelColorClass}`}>Left</span>
                <span className={`font-bold text-xs sm:text-sm ${leftTextColorClass}`}>
                    {remaining}
                </span>
            </div>

        </div>
      </div>

      {/* Footer: Progressive Disclosure for Collections */}
      {hasRelevantInfo && (
        <div className="bg-gray-900/20">
          <button
            onClick={() => setShowCollections(!showCollections)}
            className="w-full px-2.5 sm:px-2 py-1.5 flex items-center justify-between hover:bg-gray-900/40 transition-colors border-t border-gray-700/50"
          >
            <span className="text-[9px] sm:text-[10px] text-gray-500 uppercase tracking-wider font-medium">
              Collections {collections.length > 0 && `(${collections.filter(c => !checkedCollections[c]).length}/${collections.length})`}
            </span>
            <svg
              className={`w-3 h-3 text-gray-500 transition-transform flex-shrink-0`}
              style={{transform: showCollections ? 'rotate(180deg)' : 'rotate(0deg)'}}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showCollections && (
            <div className="p-2 sm:p-2.5 grid grid-cols-2 gap-2 sm:gap-3 border-t border-gray-700/30">
              {/* Left: Collections */}
              <div className="text-left">
                <div className="text-[8px] sm:text-[9px] text-gray-600 uppercase tracking-wider font-medium mb-1">Collections</div>
                <ul className="space-y-0.5">
                  {collections.length === 0 && <li className="text-[9px] text-gray-600 italic">None</li>}
                  {collections.map((name, idx) => {
                    const isChecked = checkedCollections[name];
                    const displayName = cleanCollectionName(name);
                    return (
                      <li key={`col-${name}-${idx}`} className={`text-[9px] leading-tight truncate ${isChecked ? 'text-green-400 line-through decoration-green-600/50' : 'text-gray-400'}`} title={displayName}>
                        {displayName}
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* Right: Other Uses */}
              <div className="text-left border-l border-gray-700/50 pl-2">
                <div className="text-[8px] sm:text-[9px] text-gray-600 uppercase tracking-wider font-medium mb-1">Other Uses</div>
                <ul className="space-y-0.5">
                  {otherUses.length === 0 && <li className="text-[9px] text-gray-600 italic">None</li>}
                  {otherUses.map((name, idx) => {
                    const isChecked = checkedCollections[name];
                    return (
                      <li key={`use-${name}-${idx}`} className={`text-[9px] leading-tight truncate ${isChecked ? 'text-green-400 line-through decoration-green-600/50' : 'text-gray-400'}`} title={name}>
                        {name}
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
