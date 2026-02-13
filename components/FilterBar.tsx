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
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchTerm,
  onSearchChange,
  sortMethod,
  onSortChange,
  collections,
  selectedCollectionFilter,
  onCollectionFilterChange,
}) => {
  return (
    <div className="bg-gray-800 p-4 border-b border-gray-700 sticky top-0 z-20 shadow-md">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        
        {/* Search */}
        <div className="relative w-full md:w-1/3">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search artefacts..."
            className="w-full bg-gray-700 text-white rounded px-4 py-2 border border-gray-600 focus:outline-none focus:border-blue-500"
          />
          <svg className="w-5 h-5 absolute right-3 top-2.5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Sort & Filter Group */}
        <div className="flex gap-4 w-full md:w-auto">
          {/* Sort */}
          <select
            value={sortMethod}
            onChange={(e) => onSortChange(e.target.value as SortMethod)}
            className="bg-gray-700 text-white rounded px-3 py-2 border border-gray-600 focus:outline-none focus:border-blue-500 w-1/2 md:w-auto"
          >
            <option value="name">Sort by Name</option>
            <option value="level">Sort by Level</option>
            <option value="remaining">Sort by Remaining</option>
          </select>

          {/* Collection Filter */}
          <select
            value={selectedCollectionFilter || ''}
            onChange={(e) => onCollectionFilterChange(e.target.value || null)}
            className="bg-gray-700 text-white rounded px-3 py-2 border border-gray-600 focus:outline-none focus:border-blue-500 w-1/2 md:w-auto max-w-[200px]"
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
