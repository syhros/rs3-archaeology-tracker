import React from 'react';
import { Collection, Artefact } from '../types';

export interface CollectionStatus {
  collection: Collection;
  maxLevel: number;
  itemsStatus: {
    name: string;
    artefact: Artefact;
    status: 'ready' | 'damaged' | 'missing'; // ready = has repaired, damaged = has damaged, missing = neither
  }[];
  isReady: boolean;
}

interface CollectionViewProps {
  collectionsStatus: CollectionStatus[];
  onCollectionComplete: (collection: Collection) => void;
}

const getCollectorImage = (collectorName: string) => {
  if (collectorName === 'Other Uses') return null;
  const baseName = collectorName.split(',')[0].trim().replace(/ /g, '_');
  return `/img/${baseName}_chathead.png`;
};

const cleanCollectionName = (name: string) => {
  return name.replace(/\s*\(.*?\)\s*$/, '');
};

const CollectionCard: React.FC<{ statusData: CollectionStatus, onCollectionComplete: (collection: Collection) => void }> = ({ statusData, onCollectionComplete }) => {
    const { collection, itemsStatus, isReady } = statusData;
    const collectorImg = getCollectorImage(collection.collector);
    const displayName = cleanCollectionName(collection.name);

    return (
        <div 
            className={`
              w-full border rounded-lg shadow-lg overflow-hidden flex flex-col transition-all duration-300 relative
              ${isReady 
                ? 'bg-green-900/30 border-green-600 shadow-green-900/20' 
                : 'bg-gray-800 border-gray-700 hover:border-gray-600'
              }
            `}
          >
            {/* Header */}
            <div className={`p-3 border-b flex items-start gap-3 ${isReady ? 'bg-green-900/40 border-green-700' : 'bg-gray-900/50 border-gray-700'}`}>
                {/* Collector Image */}
                <div className="w-10 h-10 flex-shrink-0 bg-gray-800/80 rounded-full border border-gray-700 flex items-center justify-center overflow-hidden shadow-sm">
                    {collectorImg ? (
                        <img src={collectorImg} alt={collection.collector} className="w-full h-full object-contain" />
                    ) : (
                        <span className="text-xs text-gray-500 font-bold">?</span>
                    )}
                </div>

                <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm text-gray-100 truncate leading-tight" title={displayName}>
                        {displayName}
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5 truncate">{collection.collector}</p>
                    {collection.collection_bonus_chronotes && (
                        <div className="mt-1 flex items-center gap-1">
                            <img src="/img/100px-Chronotes_10000_detail.png" className="w-3 h-3 object-contain" alt="Chronotes" />
                            <span className="text-[10px] font-mono text-blue-300 font-bold">
                                +{collection.collection_bonus_chronotes.toLocaleString()} Bonus
                            </span>
                        </div>
                    )}
                </div>

                {isReady && (
                    <button 
                        onClick={() => onCollectionComplete(collection)}
                        className="bg-green-600 hover:bg-green-500 text-white p-1.5 rounded-full shadow-lg transition-transform active:scale-95 flex-shrink-0"
                        title="Mark Complete & Remove Items"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                    </button>
                )}
            </div>

            {/* Artefact Grid */}
            <div className="p-2 flex flex-col gap-1.5 bg-gray-900/20 flex-1">
                {itemsStatus.map(({ name, artefact, status }) => {
                    let statusClass = "border-gray-700 bg-gray-800 opacity-60"; // Missing
                    if (status === 'ready') statusClass = "border-green-500 bg-green-900/20 shadow-[0_0_8px_rgba(34,197,94,0.15)]";
                    if (status === 'damaged') statusClass = "border-yellow-600 bg-yellow-900/10";

                    return (
                        <div 
                            key={name} 
                            className={`flex items-center gap-2 p-1.5 rounded border text-xs transition-colors ${statusClass}`}
                        >
                            <div className="w-7 h-7 flex-shrink-0 bg-gray-900/80 rounded border border-gray-700/50 flex items-center justify-center p-0.5">
                                <img src={`/img/${artefact.img_src}`} alt={name} className="max-w-full max-h-full object-contain" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-baseline">
                                    <span className={`font-medium truncate ${status === 'missing' ? 'text-gray-500' : 'text-gray-200'}`}>
                                        {name}
                                    </span>
                                    <span className="text-[9px] text-gray-600 font-mono ml-1">Lvl {artefact.level}</span>
                                </div>
                            </div>
                            
                            {status === 'ready' && (
                                <svg className="w-3.5 h-3.5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                            )}
                            {status === 'damaged' && (
                                <svg className="w-3.5 h-3.5 text-yellow-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                            )}
                        </div>
                    );
                })}
            </div>
          </div>
    );
};

export const CollectionView: React.FC<CollectionViewProps> = ({
  collectionsStatus,
  onCollectionComplete,
}) => {
  if (collectionsStatus.length === 0) {
    return (
        <div className="col-span-full text-center py-20 text-gray-500">
            <p className="text-xl">All collections completed!</p>
        </div>
    );
  }

  const standardCollections = collectionsStatus.filter(s => s.collection.collector !== 'Other Uses');
  const otherUsesCollections = collectionsStatus.filter(s => s.collection.collector === 'Other Uses');

  return (
    <div className="space-y-12 mx-auto max-w-[1800px]">
        {/* Standard Collections */}
        {standardCollections.length > 0 && (
            <section>
                <h2 className="text-2xl font-bold text-gray-200 mb-6 border-b border-gray-700 pb-2 px-2">Collections</h2>
                <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-6 justify-items-center">
                    {standardCollections.map((status) => (
                        <CollectionCard 
                            key={status.collection.name} 
                            statusData={status} 
                            onCollectionComplete={onCollectionComplete} 
                        />
                    ))}
                </div>
            </section>
        )}

        {/* Other Uses */}
        {otherUsesCollections.length > 0 && (
            <section>
                <h2 className="text-2xl font-bold text-gray-200 mb-6 border-b border-gray-700 pb-2 px-2">Other Uses</h2>
                <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-6 justify-items-center">
                    {otherUsesCollections.map((status) => (
                        <CollectionCard 
                            key={status.collection.name} 
                            statusData={status} 
                            onCollectionComplete={onCollectionComplete} 
                        />
                    ))}
                </div>
            </section>
        )}
    </div>
  );
};