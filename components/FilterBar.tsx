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
    <div className="bg-gray-800 p-2 border-b border-gray-700 sticky top-0 z-20 shadow-md">
      <div className="flex flex-wrap gap-3 items-center justify-between">
        
        {/* Left: Search & Compact Stats */}
        <div className="flex flex-wrap items-center gap-3 flex-1">
            
            {/* Slimmer Search */}
            <div className="relative min-w-[150px] max-w-[220px] flex-grow md:flex-grow-0">
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="Search..."
                    className="w-full h-9 bg-gray-700 text-white text-sm rounded px-3 border border-gray-600 focus:outline-none focus:border-blue-500 pl-8"
                />
                <svg className="w-4 h-4 absolute left-2.5 top-2.5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            </div>

            {/* Compact Totals (Icons Only) */}
            <div className="flex items-center gap-3 bg-gray-900/50 border border-gray-700 rounded px-3 h-9">
                <div className="flex items-center gap-1.5" title={`Total XP: ${totalXP.toLocaleString()}`}>
                    <img 
                        src="/img/XP_tracker_icon.png" 
                        alt="XP" 
                        className="w-5 h-5 object-contain"
                    />
                    <span className="font-mono font-bold text-gray-100 text-sm">
                        {totalXP >= 1000000 
                            ? `${(totalXP / 1000000).toFixed(2)}M` 
                            : totalXP >= 1000 
                                ? `${(totalXP / 1000).toFixed(1)}k` 
                                : totalXP.toFixed(0)}
                    </span>
                </div>
                <div className="w-px h-4 bg-gray-600"></div>
                <div className="flex items-center gap-1.5" title={`Total Chronotes: ${totalChronotes.toLocaleString()}`}>
                    <img 
                        src="/img/100px-Chronotes_10000_detail.png" 
                        alt="Chronotes" 
                        className="w-5 h-5 object-contain"
                    />
                    <span className="font-mono font-bold text-gray-100 text-sm">
                        {totalChronotes >= 1000000 
                            ? `${(totalChronotes / 1000000).toFixed(2)}M` 
                            : totalChronotes >= 1000 
                                ? `${(totalChronotes / 1000).toFixed(1)}k` 
                                : totalChronotes.toLocaleString()}
                    </span>
                </div>
            </div>

        </div>

        {/* Right: Sort Dropdown */}
        <div className="flex items-center gap-2">

          {/* Sort Dropdown Group */}
          <div className="flex items-center bg-gray-700 rounded border border-gray-600 h-9 px-2 relative group hover:border-gray-500 transition-colors">
            <span className="text-xs text-gray-400 font-medium mr-2 whitespace-nowrap">Sort by</span>
            <select
              value={sortMethod}
              onChange={(e) => onSortChange(e.target.value as SortMethod)}
              className="bg-transparent text-white text-sm font-semibold focus:outline-none appearance-none pr-4 cursor-pointer min-w-[80px]"
            >
              <option value="level">Level</option>
              <option value="name">Name</option>
              <option value="remaining">Remaining</option>
            </select>
            {/* Custom Arrow */}
            <div className="pointer-events-none absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
