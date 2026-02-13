import React from 'react';
import { SortMethod, Collection } from '../types';

interface FilterBarProps {
  searchTerm: string;
  onSearchChange: (val: string) => void;
  sortMethod: SortMethod;
  onSortChange: (val: SortMethod) => void;
  collections: Collection[];
  selectedCollectionFilter: string | null;
  onCollectionFilterChange: (val: string | null) => void;
  totalXP: number;
  totalChronotes: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchTerm,
  onSearchChange,
  sortMethod,
  onSortChange,
  collections,
  selectedCollectionFilter,
  onCollectionFilterChange,
  totalXP,
  totalChronotes,
}) => {
  return (
    <div className="bg-gray-800 p-4 border-b border-gray-700 sticky top-0 z-20 shadow-md">
      <div className="flex flex-col xl:flex-row gap-4 items-center justify-between">
        
        {/* Search & Totals Group */}
        <div className="flex flex-col md:flex-row gap-4 w-full xl:w-2/3 items-center">
            
            {/* Search */}
            <div className="relative w-full md:w-1/2">
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="Search artefacts..."
                    className="w-full h-12 bg-gray-700 text-white rounded px-4 border border-gray-600 focus:outline-none focus:border-blue-500 pl-10"
                />
                <svg className="w-5 h-5 absolute left-3 top-3.5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            </div>

            {/* Totals Display */}
            <div className="flex gap-4 items-center bg-gray-900/50 border border-gray-700 rounded-lg px-4 h-12 shadow-sm overflow-hidden flex-shrink-0">
                <div className="flex items-center gap-2" title="Total XP from banked artefacts">
                    <img 
                        src="/img/XP_tracker_icon.png" 
                        alt="XP" 
                        className="w-[30px] h-[30px] object-contain flex-shrink-0"
                    />
                    <span className="font-mono font-bold text-gray-100 text-sm md:text-base whitespace-nowrap">
                        {totalXP.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })} XP
                    </span>
                </div>
                <div className="w-px h-6 bg-gray-700"></div>
                <div className="flex items-center gap-2" title="Total Chronotes from banked artefacts">
                    <img 
                        src="/img/100px-Chronotes_10000_detail.png" 
                        alt="Chronotes" 
                        className="w-[30px] h-[30px] object-contain flex-shrink-0"
                    />
                    <span className="font-mono font-bold text-gray-100 text-sm md:text-base whitespace-nowrap">
                        {totalChronotes.toLocaleString()} Chronotes
                    </span>
                </div>
            </div>

        </div>

        {/* Sort & Filter Group */}
        <div className="flex gap-4 w-full xl:w-auto justify-end">
          {/* Sort */}
          <select
            value={sortMethod}
            onChange={(e) => onSortChange(e.target.value as SortMethod)}
            className="bg-gray-700 text-white rounded px-3 h-12 border border-gray-600 focus:outline-none focus:border-blue-500 w-1/2 md:w-auto"
          >
            <option value="name">Sort by Name</option>
            <option value="level">Sort by Level</option>
            <option value="remaining">Sort by Remaining</option>
          </select>

          {/* Collection Filter */}
          <select
            value={selectedCollectionFilter || ''}
            onChange={(e) => onCollectionFilterChange(e.target.value || null)}
            className="bg-gray-700 text-white rounded px-3 h-12 border border-gray-600 focus:outline-none focus:border-blue-500 w-1/2 md:w-auto max-w-[200px]"
          >
            <option value="">All Collections</option>
            {collections.map((c) => (
              <option key={c.name} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

      </div>
    </div>
  );
};
