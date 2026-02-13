import React, { useState } from 'react';
import { Artefact, CheckedCollections } from '../types';

interface ArtefactCardProps {
  artefact: Artefact;
  bankedCount: number;
  donatedCount: number;
  checkedCollections: CheckedCollections;
  onBankedChange: (name: string, val: number) => void;
}

// Helper to clean collection name (remove parenthesized collector name)
const cleanCollectionName = (name: string) => {
  return name.replace(/\s*\(.*?\)\s*$/, '');
};

export const ArtefactCard: React.FC<ArtefactCardProps> = ({
  artefact,
  bankedCount,
  donatedCount,
  checkedCollections,
  onBankedChange,
}) => {
  const [imgError, setImgError] = useState(false);
  
  // Logic: Donated count comes from app based on collections checked
  const remaining = Math.max(0, artefact.total_needed - (bankedCount + donatedCount));
  const isComplete = remaining === 0;

  const imgSrc = `/img/${artefact.img_src}`;

  // Combine collections and other uses for display
  const allUses = [
    ...(artefact.collections || []).map(name => ({ type: 'collection', name })),
    ...(artefact.other_uses || []).map(name => ({ type: 'other', name }))
  ];

  return (
    <div
      className={`
        w-full min-w-[220px] max-w-[280px]
        border rounded-lg shadow-lg overflow-hidden flex flex-col transition-colors duration-300
        ${isComplete ? 'bg-green-900 border-green-700' : 'bg-gray-800 border-gray-700 hover:border-blue-500'}
      `}
    >
      {/* Header Section: Image, Name, Stats */}
      <div className="flex gap-3 p-3 items-start">
        {/* Left: Small Image 40x40 with padding */}
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

        {/* Right: Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-sm text-white truncate leading-tight" title={artefact.name}>
            {artefact.name}
          </h3>
          <div className="text-[10px] text-gray-400 mt-0.5 truncate leading-tight font-mono">
            Level: {artefact.level} <span className="text-gray-600">|</span> XP: {artefact.xp} <span className="text-gray-600">|</span> Chronotes: {artefact.individual_chronotes}
          </div>
        </div>
      </div>

      {/* Grid: Total / Banked / Remaining */}
      <div className={`p-2 border-t border-b ${isComplete ? 'border-green-800 bg-green-950/30' : 'border-gray-700 bg-gray-900/30'}`}>
        <div className="grid grid-cols-3 gap-2 items-center text-center">
            
            {/* Total */}
            <div className="flex flex-col">
                <span className="text-[10px] text-gray-500 uppercase tracking-wide">Total</span>
                <span className="font-bold text-sm text-white">{artefact.total_needed}</span>
            </div>

            {/* Banked Input */}
            <div className="flex flex-col">
                <label htmlFor={`banked-${artefact.name}`} className="text-[10px] text-gray-500 uppercase tracking-wide mb-0.5">Banked</label>
                <input
                    id={`banked-${artefact.name}`}
                    type="number"
                    min="0"
                    value={bankedCount}
                    onChange={(e) => onBankedChange(artefact.name, parseInt(e.target.value) || 0)}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-1 py-0.5 text-center text-white text-sm focus:border-blue-500 focus:outline-none"
                    onClick={(e) => (e.target as HTMLInputElement).select()}
                />
            </div>

            {/* Remaining */}
            <div className="flex flex-col">
                <span className="text-[10px] text-gray-500 uppercase tracking-wide">Remaining</span>
                <span className={`font-bold text-sm ${isComplete ? 'text-green-400' : 'text-red-400'}`}>
                    {remaining}
                </span>
            </div>

        </div>
      </div>

      {/* Footer: Collections List */}
      <div className="p-2 bg-gray-900/20 flex-1">
        <ul className="space-y-1">
            {allUses.length === 0 && <li className="text-[10px] text-gray-600 italic">No collections</li>}
            {allUses.map((use, idx) => {
                const isChecked = use.type === 'collection' && checkedCollections[use.name];
                // Clean the name only for display
                const displayName = use.type === 'collection' ? cleanCollectionName(use.name) : use.name;
                
                return (
                    <li key={`${use.name}-${idx}`} className={`text-[10px] flex items-start gap-1.5 ${isChecked ? 'text-green-400 line-through decoration-green-600/50' : 'text-gray-400'}`}>
                        <span className={`mt-0.5 w-1 h-1 rounded-full flex-shrink-0 ${isChecked ? 'bg-green-500' : 'bg-gray-600'}`}></span>
                        <span className="leading-tight truncate" title={displayName}>{displayName}</span>
                    </li>
                );
            })}
        </ul>
      </div>
    </div>
  );
};
