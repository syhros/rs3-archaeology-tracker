import React, { useState, useMemo } from 'react';
import { Collection, CheckedCollections } from '../types';

interface CollectionSidebarProps {
  collections: Collection[];
  checkedCollections: CheckedCollections;
  onCheckChange: (name: string, checked: boolean) => void;
}

type ViewMode = 'az' | 'collector';

// Helper to generate image path from collector name
const getCollectorImage = (collectorName: string) => {
  // Take the first part of the name (e.g., "Soran" from "Soran, Emissary of Zaros")
  // Replace spaces with underscores
  const baseName = collectorName.split(',')[0].trim().replace(/ /g, '_');
  return `/img/${baseName}_chathead.png`;
};

export const CollectionSidebar: React.FC<CollectionSidebarProps> = ({
  collections,
  checkedCollections,
  onCheckChange,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('az');
  const [expandedCollectors, setExpandedCollectors] = useState<Record<string, boolean>>({});

  // Toggle accordion section
  const toggleCollector = (collectorName: string) => {
    setExpandedCollectors(prev => ({
      ...prev,
      [collectorName]: !prev[collectorName]
    }));
  };

  // Data Preparation
  const sortedCollectionsAZ = useMemo(() => {
    return [...collections].sort((a, b) => a.name.localeCompare(b.name));
  }, [collections]);

  const collectionsByCollector = useMemo(() => {
    const groups: Record<string, Collection[]> = {};
    collections.forEach(col => {
      if (!groups[col.collector]) groups[col.collector] = [];
      groups[col.collector].push(col);
    });
    return groups;
  }, [collections]);

  const sortedCollectorNames = useMemo(() => {
    return Object.keys(collectionsByCollector).sort();
  }, [collectionsByCollector]);

  return (
    <div className="h-full flex flex-col bg-gray-800 border-r border-gray-700 w-full md:w-80">
      
      {/* Header */}
      <div className="p-4 border-b border-gray-700 bg-gray-900 shrink-0">
        <h2 className="text-xl font-bold text-white mb-2">Collections</h2>
        
        {/* View Toggle */}
        <div className="flex bg-gray-800 p-1 rounded-lg border border-gray-700">
          <button
            onClick={() => setViewMode('az')}
            className={`flex-1 py-1 text-xs font-semibold rounded-md transition-colors ${
              viewMode === 'az' 
                ? 'bg-blue-600 text-white shadow-sm' 
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            A-Z
          </button>
          <button
            onClick={() => setViewMode('collector')}
            className={`flex-1 py-1 text-xs font-semibold rounded-md transition-colors ${
              viewMode === 'collector' 
                ? 'bg-blue-600 text-white shadow-sm' 
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            By Collector
          </button>
        </div>
        
        <p className="text-[10px] text-gray-500 mt-2">
          {viewMode === 'az' 
            ? "Showing all collections alphabetically." 
            : "Grouped by NPC collector."}
        </p>
      </div>

      {/* List Content */}
      <div className="flex-1 overflow-y-auto p-0 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
        
        {/* A-Z VIEW */}
        {viewMode === 'az' && (
          <div className="p-2 space-y-1">
            {sortedCollectionsAZ.map((col) => (
              <label
                key={col.name}
                className="flex items-start gap-3 p-2 rounded hover:bg-gray-700/50 cursor-pointer transition-colors group"
              >
                <div className="pt-0.5">
                    <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-500 text-blue-600 focus:ring-offset-gray-800 focus:ring-blue-500 bg-gray-700"
                    checked={!!checkedCollections[col.name]}
                    onChange={(e) => onCheckChange(col.name, e.target.checked)}
                    />
                </div>
                <div className="text-sm select-none">
                    <div className={`font-medium leading-tight transition-colors ${checkedCollections[col.name] ? 'text-green-400 line-through decoration-green-600/50' : 'text-gray-200 group-hover:text-white'}`}>
                        {col.name}
                    </div>
                    <div className="text-gray-500 text-xs mt-0.5">{col.collector}</div>
                </div>
              </label>
            ))}
          </div>
        )}

        {/* COLLECTOR VIEW */}
        {viewMode === 'collector' && (
          <div className="divide-y divide-gray-700/50">
            {sortedCollectorNames.map((collectorName) => {
              const isOpen = !!expandedCollectors[collectorName];
              const items = collectionsByCollector[collectorName];
              const completedCount = items.filter(i => checkedCollections[i.name]).length;
              const isFullyCompleted = completedCount === items.length;

              return (
                <div key={collectorName} className="bg-gray-800/30">
                  {/* Collector Header */}
                  <button
                    onClick={() => toggleCollector(collectorName)}
                    className="w-full flex items-center p-3 hover:bg-gray-700/50 transition-colors text-left"
                  >
                    {/* Collector Image */}
                    <div className="relative mr-3 shrink-0">
                        <img 
                            src={getCollectorImage(collectorName)} 
                            alt={collectorName}
                            className="w-10 h-10 object-contain drop-shadow-md" 
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                        {isFullyCompleted && (
                            <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-0.5 border border-gray-900">
                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                            </div>
                        )}
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className={`font-bold text-sm truncate ${isFullyCompleted ? 'text-green-400' : 'text-gray-200'}`}>
                            {collectorName}
                        </div>
                        <div className="text-[10px] text-gray-500 mt-0.5">
                            {completedCount} / {items.length} completed
                        </div>
                    </div>

                    {/* Arrow Icon */}
                    <svg 
                        className={`w-5 h-5 text-gray-500 transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Accordion Body */}
                  {isOpen && (
                    <div className="bg-gray-900/50 px-2 py-1 border-t border-gray-700/50 shadow-inner">
                        {items.map((col) => (
                            <label
                                key={col.name}
                                className="flex items-center gap-3 p-2 rounded hover:bg-gray-700/30 cursor-pointer transition-colors group ml-2 border-l border-gray-700 pl-4"
                            >
                                <input
                                    type="checkbox"
                                    className="w-3.5 h-3.5 rounded border-gray-500 text-blue-600 focus:ring-offset-gray-900 focus:ring-blue-500 bg-gray-800"
                                    checked={!!checkedCollections[col.name]}
                                    onChange={(e) => onCheckChange(col.name, e.target.checked)}
                                />
                                <span className={`text-xs font-medium transition-colors ${
                                    checkedCollections[col.name] 
                                        ? 'text-green-400 line-through decoration-green-600/50' 
                                        : 'text-gray-300 group-hover:text-white'
                                }`}>
                                    {col.name}
                                </span>
                            </label>
                        ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
};
