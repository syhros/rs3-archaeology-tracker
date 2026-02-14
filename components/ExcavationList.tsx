import React from 'react';
import { Artefact, UserArtefactCounts } from '../types';

interface ExcavationItem {
  artefact: Artefact;
  count: number;
}

interface ExcavationGroup {
  siteName: string;
  items: ExcavationItem[];
}

interface ExcavationListProps {
  groups: ExcavationGroup[];
  isOpen: boolean;
  onClose: () => void;
  artefactCounts: UserArtefactCounts;
  onCountChange: (name: string, type: 'damaged' | 'repaired', val: number) => void;
}

export const ExcavationList: React.FC<ExcavationListProps> = ({
  groups,
  isOpen,
  onClose,
  artefactCounts,
  onCountChange,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-5xl flex flex-col max-h-[90vh] border border-gray-700">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-700 bg-gray-900 rounded-t-lg">
          <div>
              <h2 className="text-xl font-bold text-white">Excavation List</h2>
              <p className="text-sm text-gray-400">Artefacts required to complete remaining collections</p>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white p-2 rounded hover:bg-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
          {groups.length === 0 ? (
            <div className="text-center text-gray-500 py-12">
              No additional artefacts needed! All collections are complete or you have enough banked.
            </div>
          ) : (
            <div className="space-y-6">
                {groups.map((group) => (
                    <div key={group.siteName} className="bg-gray-900/50 rounded-lg border border-gray-700 overflow-hidden">
                        <div className="bg-gray-800/80 px-4 py-2 border-b border-gray-700 flex justify-between items-center sticky top-0 z-10">
                            <h3 className="font-bold text-blue-400">
                                <a 
                                    href={`https://runescape.wiki/w/${group.siteName.replace(/ /g, '_')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:underline flex items-center gap-2"
                                >
                                    {group.siteName}
                                    <svg className="w-3 h-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                </a>
                            </h3>
                            <span className="text-xs text-gray-500 font-mono">
                                Lvl {Math.min(...group.items.map(i => i.artefact.level))} - {Math.max(...group.items.map(i => i.artefact.level))}
                            </span>
                        </div>
                        
                        <div className="divide-y divide-gray-800">
                            {group.items.map(({ artefact, count }) => {
                                const currentCounts = artefactCounts[artefact.name] || { damaged: 0, repaired: 0 };
                                return (
                                <div key={artefact.name} className="flex flex-col md:flex-row items-start md:items-center p-3 gap-4 hover:bg-gray-800/30 transition-colors">
                                    {/* Image & Basic Info */}
                                    <div className="flex items-center gap-4 flex-1 w-full md:w-auto">
                                        <div className="w-10 h-10 flex-shrink-0 bg-gray-800 rounded border border-gray-700 flex items-center justify-center p-1">
                                            <img 
                                                src={`/img/${artefact.img_src}`} 
                                                alt={artefact.name} 
                                                className="max-w-full max-h-full object-contain"
                                            />
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-baseline gap-2">
                                                <span className="font-bold text-gray-200 truncate">{artefact.name}</span>
                                                <span className="text-xs text-gray-500 font-mono">Lvl {artefact.level}</span>
                                            </div>
                                            <div className="text-xs text-gray-500 truncate hidden sm:block">
                                                {artefact.xp} XP &bull; {artefact.individual_chronotes} Chronotes
                                            </div>
                                        </div>
                                    </div>

                                    {/* Controls */}
                                    <div className="flex items-center gap-4 w-full md:w-auto justify-end">
                                        
                                        {/* Inputs */}
                                        <div className="flex gap-2">
                                            <div className="flex flex-col w-16">
                                                <label className="text-[9px] text-gray-500 uppercase tracking-wide mb-0.5 text-center">Dmg</label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={currentCounts.damaged || 0}
                                                    onChange={(e) => onCountChange(artefact.name, 'damaged', parseInt(e.target.value) || 0)}
                                                    className="w-full bg-gray-800 border border-gray-600 rounded px-1 py-1 text-center text-white text-sm focus:border-blue-500 focus:outline-none"
                                                    onClick={(e) => (e.target as HTMLInputElement).select()}
                                                />
                                            </div>
                                            <div className="flex flex-col w-16">
                                                <label className="text-[9px] text-gray-500 uppercase tracking-wide mb-0.5 text-center">Rep</label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={currentCounts.repaired || 0}
                                                    onChange={(e) => onCountChange(artefact.name, 'repaired', parseInt(e.target.value) || 0)}
                                                    className="w-full bg-gray-800 border border-gray-600 rounded px-1 py-1 text-center text-white text-sm focus:border-blue-500 focus:outline-none"
                                                    onClick={(e) => (e.target as HTMLInputElement).select()}
                                                />
                                            </div>
                                        </div>

                                        {/* Needed Count */}
                                        <div className="flex flex-col items-center justify-center min-w-[3.5rem] bg-gray-800/80 rounded px-2 py-1 border border-gray-700 ml-2">
                                            <span className="text-[9px] text-gray-500 uppercase tracking-wide">Need</span>
                                            <span className="text-lg font-bold text-yellow-500 leading-none">{count}</span>
                                        </div>
                                    </div>
                                </div>
                            )})}
                        </div>
                    </div>
                ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700 bg-gray-900 rounded-b-lg flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium shadow transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};