import React, { useState, useMemo } from 'react';
import { Collection, CheckedCollections, Artefact } from '../types';

interface CollectionSidebarProps {
  collections: Collection[];
  checkedCollections: CheckedCollections;
  onCheckChange: (name: string, checked: boolean) => void;
  artefacts: Artefact[];
  hideCompleted: boolean;
  onHideCompletedChange: (val: boolean) => void;
}

type ViewMode = 'az' | 'collector' | 'other';

const getCollectorImage = (collectorName: string) => {
  if (collectorName === 'Other Uses') return null; // Or a specific icon for Other Uses
  const baseName = collectorName.split(',')[0].trim().replace(/ /g, '_');
  return `/img/${baseName}_chathead.png`;
};

const cleanCollectionName = (name: string) => {
  return name.replace(/\s*\(.*?\)\s*$/, '');
};

export const CollectionSidebar: React.FC<CollectionSidebarProps> = ({
  collections,
  checkedCollections,
  onCheckChange,
  artefacts,
  hideCompleted,
  onHideCompletedChange,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('collector');
  const [expandedCollectors, setExpandedCollectors] = useState<Record<string, boolean>>({});

  const toggleCollector = (collectorName: string) => {
    setExpandedCollectors(prev => ({
      ...prev,
      [collectorName]: !prev[collectorName]
    }));
  };

  // Helper to get max level for a collection
  const getCollectionMaxLevel = (col: Collection) => {
    let max = 0;
    col.items.forEach(itemName => {
      const art = artefacts.find(a => a.name === itemName);
      if (art && art.level > max) max = art.level;
    });
    return max;
  };

  const filteredCollections = useMemo(() => {
    return collections.filter(col => {
      if (hideCompleted && checkedCollections[col.name]) return false;
      return true;
    });
  }, [collections, hideCompleted, checkedCollections]);

  const sortedCollectionsAZ = useMemo(() => {
    // Only show "normal" collections or both? Typically A-Z shows regular collections
    return [...filteredCollections]
      .filter(c => c.collector !== 'Other Uses')
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [filteredCollections]);

  const otherUsesCollections = useMemo(() => {
    return [...filteredCollections]
      .filter(c => c.collector === 'Other Uses')
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [filteredCollections]);

  const collectionsByCollector = useMemo(() => {
    const groups: Record<string, Collection[]> = {};
    filteredCollections.forEach(col => {
      if (col.collector === 'Other Uses') return; // Exclude from 'collector' view if we have separate tab
      if (!groups[col.collector]) groups[col.collector] = [];
      groups[col.collector].push(col);
    });
    return groups;
  }, [filteredCollections]);

  const sortedCollectorNames = useMemo(() => {
    return Object.keys(collectionsByCollector).sort((a, b) => a.localeCompare(b));
  }, [collectionsByCollector]);

  return (
    <div className="h-full flex flex-col bg-gray-800 border-r border-gray-700 w-full md:w-80">
      
      <div className="p-4 border-b border-gray-700 bg-gray-900 shrink-0">
        <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-bold text-white">Collections</h2>
        </div>
        
        <label className="flex items-center gap-2 mb-3 cursor-pointer select-none">
            <div className="relative">
                <input 
                    type="checkbox" 
                    className="sr-only peer"
                    checked={hideCompleted}
                    onChange={(e) => onHideCompletedChange(e.target.checked)}
                />
                <div className="w-9 h-5 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
            </div>
            <span className="text-sm text-gray-300">Hide Completed</span>
        </label>

        <div className="flex bg-gray-800 p-1 rounded-lg border border-gray-700">
          <button
            onClick={() => setViewMode('az')}
            className={`flex-1 py-1 text-[10px] font-semibold rounded-md transition-colors ${
              viewMode === 'az' 
                ? 'bg-blue-600 text-white shadow-sm' 
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            A-Z
          </button>
          <button
            onClick={() => setViewMode('collector')}
            className={`flex-1 py-1 text-[10px] font-semibold rounded-md transition-colors ${
              viewMode === 'collector' 
                ? 'bg-blue-600 text-white shadow-sm' 
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            Collector
          </button>
          <button
            onClick={() => setViewMode('other')}
            className={`flex-1 py-1 text-[10px] font-semibold rounded-md transition-colors ${
              viewMode === 'other' 
                ? 'bg-blue-600 text-white shadow-sm' 
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            Other Uses
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-0 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
        
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
                <div className="text-sm select-none w-full">
                    <div className="flex justify-between items-start w-full">
                        <div className={`font-medium leading-tight transition-colors ${checkedCollections[col.name] ? 'text-green-400 line-through decoration-green-600/50' : 'text-gray-200 group-hover:text-white'}`}>
                            {col.name}
                        </div>
                        <span className="text-[10px] text-gray-500 font-mono bg-gray-900/50 px-1 rounded ml-1 whitespace-nowrap">
                            Lvl {getCollectionMaxLevel(col)}
                        </span>
                    </div>
                    <div className="text-gray-500 text-xs mt-0.5">{col.collector}</div>
                </div>
              </label>
            ))}
            {sortedCollectionsAZ.length === 0 && (
                <div className="text-center py-4 text-gray-500 text-sm">
                    No collections found.
                </div>
            )}
          </div>
        )}

        {viewMode === 'collector' && (
          <div className="divide-y divide-gray-700/50">
            {sortedCollectorNames.map((collectorName) => {
              const isOpen = !!expandedCollectors[collectorName];
              const items = collectionsByCollector[collectorName];
              
              const completedCount = items.filter(i => checkedCollections[i.name]).length;
              const isFullyCompleted = items.length > 0 && completedCount === items.length;
              const collectorImg = getCollectorImage(collectorName);

              return (
                <div key={collectorName} className="bg-gray-800/30">
                  <button
                    onClick={() => toggleCollector(collectorName)}
                    className="w-full flex items-center p-3 hover:bg-gray-700/50 transition-colors text-left"
                  >
                    <div className="relative mr-3 shrink-0 w-10 h-10 flex items-center justify-center">
                        {collectorImg ? (
                            <img 
                                src={collectorImg} 
                                alt={collectorName}
                                className="w-full h-full object-contain drop-shadow-md"
                            />
                        ) : (
                            <span className="text-gray-500 text-xl font-bold">?</span>
                        )}
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
                        <div className="text-[10px] text-gray-400 mt-0.5 font-medium">
                            <span className={completedCount === items.length ? "text-green-400" : "text-gray-300"}>{completedCount}</span> / {items.length} completed
                        </div>
                    </div>

                    <svg 
                        className={`w-5 h-5 text-gray-500 transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {isOpen && (
                    <div className="bg-gray-900/50 px-2 py-1 border-t border-gray-700/50 shadow-inner">
                        {items.map((col) => (
                            <label
                                key={col.name}
                                className="flex items-center gap-3 p-2 rounded hover:bg-gray-700/30 cursor-pointer transition-colors group ml-2 border-l border-gray-700 pl-4"
                            >
                                <input
                                    type="checkbox"
                                    className="w-3.5 h-3.5 rounded border-gray-500 text-blue-600 focus:ring-offset-gray-900 focus:ring-blue-500 bg-gray-800 shrink-0"
                                    checked={!!checkedCollections[col.name]}
                                    onChange={(e) => onCheckChange(col.name, e.target.checked)}
                                />
                                <div className="flex flex-1 justify-between items-center overflow-hidden">
                                    <span className={`text-xs font-medium transition-colors truncate mr-2 ${
                                        checkedCollections[col.name] 
                                            ? 'text-green-400 line-through decoration-green-600/50' 
                                            : 'text-gray-300 group-hover:text-white'
                                    }`}>
                                        {cleanCollectionName(col.name)}
                                    </span>
                                    <span className="text-[10px] text-gray-500 font-mono bg-gray-800 px-1 rounded whitespace-nowrap">
                                        Lvl {getCollectionMaxLevel(col)}
                                    </span>
                                </div>
                            </label>
                        ))}
                    </div>
                  )}
                </div>
              );
            })}
            {sortedCollectorNames.length === 0 && (
                <div className="text-center py-4 text-gray-500 text-sm">
                    No collectors match the criteria.
                </div>
            )}
          </div>
        )}

        {viewMode === 'other' && (
            <div className="p-2 space-y-1">
                {otherUsesCollections.map((col) => (
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
                        <div className="text-sm select-none w-full">
                            <div className="flex justify-between items-start w-full">
                                <div className={`font-medium leading-tight transition-colors ${checkedCollections[col.name] ? 'text-green-400 line-through decoration-green-600/50' : 'text-gray-200 group-hover:text-white'}`}>
                                    {col.name}
                                </div>
                                <span className="text-[10px] text-gray-500 font-mono bg-gray-900/50 px-1 rounded ml-1 whitespace-nowrap">
                                    Lvl {getCollectionMaxLevel(col)}
                                </span>
                            </div>
                            <div className="text-gray-500 text-xs mt-0.5">
                                {col.items.length} items
                            </div>
                        </div>
                    </label>
                ))}
                {otherUsesCollections.length === 0 && (
                    <div className="text-center py-4 text-gray-500 text-sm">
                        No other uses found.
                    </div>
                )}
            </div>
        )}

      </div>
    </div>
  );
};