import React from 'react';
import { SortMethod } from '../types';

interface FilterBarProps {
  searchTerm: string;
  onSearchChange: (val: string) => void;
  sortMethod: SortMethod;
  onSortChange: (val: SortMethod) => void;
  totalXP: number;
  totalChronotes: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchTerm,
  onSearchChange,
  sortMethod,
  onSortChange,
  totalXP,
  totalChronotes,
}) => {
  return (
    <div className="bg-gray-800 px-3 py-2 md:p-3 border-b border-gray-700 sticky top-0 z-20 shadow-md">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-3">

        {/* Top Row: Search (Full Width on Mobile) */}
        <div className="relative flex-1 md:flex-initial md:min-w-[160px] md:max-w-[240px]">
            <input
                type="text"
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search artefacts..."
                className="w-full h-8 md:h-9 bg-gray-700 text-white text-sm rounded px-3 border border-gray-600 focus:outline-none focus:border-blue-500 pl-8"
            />
            <svg className="w-4 h-4 absolute left-2.5 top-2 md:top-2.5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
        </div>

        {/* Bottom Row: Stats & Sort */}
        <div className="flex items-center gap-2 md:gap-3 justify-between">
            {/* Compact Totals */}
            <div className="flex items-center gap-2 bg-gray-900/50 border border-gray-700 rounded px-2 md:px-3 h-8 md:h-9 text-xs md:text-sm">
                <div className="flex items-center gap-1" title={`Total XP: ${totalXP.toLocaleString()}`}>
                    <img
                        src="/img/XP_tracker_icon.png"
                        alt="XP"
                        className="w-4 h-4 md:w-5 md:h-5 object-contain"
                    />
                    <span className="font-mono font-bold text-gray-100 hidden sm:inline">
                        {totalXP >= 1000000
                            ? `${(totalXP / 1000000).toFixed(1)}M`
                            : totalXP >= 1000
                                ? `${(totalXP / 1000).toFixed(0)}k`
                                : totalXP.toFixed(0)}
                    </span>
                </div>
                <div className="w-px h-3 bg-gray-600 hidden sm:block"></div>
                <div className="flex items-center gap-1" title={`Total Chronotes: ${totalChronotes.toLocaleString()}`}>
                    <img
                        src="/img/100px-Chronotes_10000_detail.png"
                        alt="Chronotes"
                        className="w-4 h-4 md:w-5 md:h-5 object-contain"
                    />
                    <span className="font-mono font-bold text-gray-100 hidden sm:inline">
                        {totalChronotes >= 1000000
                            ? `${(totalChronotes / 1000000).toFixed(1)}M`
                            : totalChronotes >= 1000
                                ? `${(totalChronotes / 1000).toFixed(0)}k`
                                : totalChronotes.toLocaleString()}
                    </span>
                </div>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center bg-gray-700 rounded border border-gray-600 h-8 md:h-9 px-2 relative hover:border-gray-500 transition-colors">
                <span className="hidden md:inline text-xs text-gray-400 font-medium mr-1">Sort</span>
                <select
                  value={sortMethod}
                  onChange={(e) => onSortChange(e.target.value as SortMethod)}
                  className="bg-transparent text-white text-xs md:text-sm font-semibold focus:outline-none appearance-none pr-3 md:pr-4 cursor-pointer min-w-[70px] md:min-w-[80px]"
                >
                  <option value="level">Level</option>
                  <option value="name">Name</option>
                  <option value="remaining">Remaining</option>
                </select>
                <div className="pointer-events-none absolute right-1.5 md:right-2 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};
