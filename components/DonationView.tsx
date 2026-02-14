import React from 'react';
import { Collection, Artefact } from '../types';

export interface RepeatableCollectionStatus {
  collection: Collection;
  maxLevel: number;
  itemsStatus: {
    name: string;
    artefact: Artefact;
    banked: number;
  }[];
  setsAvailable: number;
  completionPercentage: number;
}

interface DonationViewProps {
  repeatableStatus: RepeatableCollectionStatus[];
  onDonate: (collection: Collection) => void;
}

const getCollectorImage = (collectorName: string) => {
  if (collectorName === 'Other Uses') return null;
  const baseName = collectorName.split(',')[0].trim().replace(/ /g, '_');
  return `/img/${baseName}_chathead.png`;
};

const cleanCollectionName = (name: string) => {
  return name.replace(/\s*\(.*?\)\s*$/, '');
};

const RepeatableCollectionCard: React.FC<{ statusData: RepeatableCollectionStatus, onDonate: (collection: Collection) => void }> = ({ statusData, onDonate }) => {
    const { collection, itemsStatus, setsAvailable, completionPercentage } = statusData;
    const collectorImg = getCollectorImage(collection.collector);
    const displayName = cleanCollectionName(collection.name);
    
    // Sort items: those with 0 banked should ideally be highlighted or sorted, but keeping standard order (level) is usually better for visual consistency.
    
    return (
        <div 
            className={`
              w-full border rounded-lg shadow-lg overflow-hidden flex flex-col transition-all duration-300 relative
              ${setsAvailable > 0 
                ? 'bg-purple-900/30 border-purple-600 shadow-purple-900/20' 
                : 'bg-gray-800 border-gray-700'
              }
            `}
          >
            {/* Header */}
            <div className={`p-3 border-b flex items-start gap-3 ${setsAvailable > 0 ? 'bg-purple-900/40 border-purple-700' : 'bg-gray-900/50 border-gray-700'}`}>
                {/* Collector Image */}
                <div className="w-10 h-10 flex-shrink-0 bg-gray-800/80 rounded-full border border-gray-700 flex items-center justify-center overflow-hidden shadow-sm">
                    {collectorImg ? (
                        <img src={collectorImg} alt={collection.collector} className="w-full h-full object-contain" />
                    ) : (
                        <span className="text-xs text-gray-500 font-bold">?</span>
                    )}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                        <h3 className="font-bold text-sm text-gray-100 truncate leading-tight" title={displayName}>
                            {displayName}
                        </h3>
                        {setsAvailable > 0 && (
                            <span className="bg-purple-600 text-white text-[10px] px-1.5 py-0.5 rounded font-bold ml-2 shrink-0">
                                {setsAvailable} Ready
                            </span>
                        )}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5 truncate">{collection.collector}</p>
                    
                    <div className="flex flex-wrap gap-2 mt-1">
                        {collection.collection_bonus_chronotes && (
                            <div className="flex items-center gap-1">
                                <img src="/img/100px-Chronotes_10000_detail.png" className="w-3 h-3 object-contain" alt="Chronotes" />
                                <span className="text-[10px] font-mono text-gray-300">
                                    +{collection.collection_bonus_chronotes.toLocaleString()}
                                </span>
                            </div>
                        )}
                        {collection.recurring_reward && (
                            <div className="flex items-center gap-1">
                                <svg className="w-3 h-3 text-yellow-500" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"/></svg>
                                <span className="text-[10px] text-yellow-400 font-medium truncate max-w-[120px]" title={collection.recurring_reward}>
                                    {collection.recurring_reward}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Artefact Grid */}
            <div className="p-2 flex flex-col gap-1.5 bg-gray-900/20 flex-1">
                {itemsStatus.map(({ name, artefact, banked }) => {
                    const hasItem = banked > 0;
                    
                    let statusClass = "border-gray-700 bg-gray-800 opacity-60"; // Missing
                    if (hasItem) statusClass = "border-purple-500/50 bg-purple-900/10";

                    return (
                        <div 
                            key={name} 
                            className={`flex items-center gap-2 p-1.5 rounded border text-xs transition-colors ${statusClass}`}
                        >
                            <div className="w-7 h-7 flex-shrink-0 bg-gray-900/80 rounded border border-gray-700/50 flex items-center justify-center p-0.5 relative">
                                <img src={`/img/${artefact.img_src}`} alt={name} className={`max-w-full max-h-full object-contain ${hasItem ? '' : 'grayscale opacity-50'}`} />
                                <div className={`absolute -bottom-1 -right-1 text-[9px] font-bold px-1 rounded border ${hasItem ? 'bg-green-600 text-white border-green-500' : 'bg-red-900 text-red-200 border-red-700'}`}>
                                    {banked}
                                </div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-baseline">
                                    <span className={`font-medium truncate ${!hasItem ? 'text-gray-500' : 'text-gray-200'}`}>
                                        {name}
                                    </span>
                                    <span className="text-[9px] text-gray-600 font-mono ml-1">Lvl {artefact.level}</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Action Footer */}
            {setsAvailable > 0 && (
                <button 
                    onClick={() => onDonate(collection)}
                    className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 text-xs uppercase tracking-wide transition-colors flex items-center justify-center gap-2 border-t border-purple-500"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" /></svg>
                    Donate Set
                </button>
            )}
          </div>
    );
};

export const DonationView: React.FC<DonationViewProps> = ({
  repeatableStatus,
  onDonate,
}) => {
  if (repeatableStatus.length === 0) {
    return (
        <div className="col-span-full text-center py-20 text-gray-500">
            <p className="text-xl">No completed collections.</p>
            <p className="text-sm mt-2">Finish collections first to see them here for repeating.</p>
        </div>
    );
  }

  return (
    <div className="space-y-6 mx-auto max-w-[1800px]">
        <section>
            <div className="flex items-center justify-between mb-6 px-2 border-b border-gray-700 pb-2">
                <h2 className="text-2xl font-bold text-gray-200">Repeatable Collections</h2>
                <div className="text-xs text-gray-400">
                    Showing {repeatableStatus.length} collections
                </div>
            </div>
            
            <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-6 justify-items-center">
                {repeatableStatus.map((status) => (
                    <RepeatableCollectionCard 
                        key={status.collection.name} 
                        statusData={status} 
                        onDonate={onDonate} 
                    />
                ))}
            </div>
        </section>
    </div>
  );
};
