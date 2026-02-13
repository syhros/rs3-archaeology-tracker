import React, { useState, useEffect, useMemo } from 'react';
import { ARTEFACTS_JSON, COLLECTIONS_JSON } from './constants';
import { Artefact, Collection, UserArtefactCounts, CheckedCollections, SortMethod, Materials } from './types';
import { ArtefactCard } from './components/ArtefactCard';
import { CollectionSidebar } from './components/CollectionSidebar';
import { FilterBar } from './components/FilterBar';
import { MaterialShoppingList } from './components/MaterialShoppingList';
import { ExcavationList } from './components/ExcavationList';
import { CollectionView, CollectionStatus } from './components/CollectionView';

// --- Data Transformation ---
const artefactsArray: Artefact[] = Object.entries(ARTEFACTS_JSON).map(([key, value]) => ({
  name: key,
  ...value,
}));

const initialCollectionsArray: Collection[] = Object.entries(COLLECTIONS_JSON).map(([key, value]) => ({
  name: key,
  ...value,
}));

// --- Process "Other Uses" into Collections ---
const otherUsesMap: Record<string, string[]> = {};
artefactsArray.forEach(art => {
  if (art.other_uses) {
    art.other_uses.forEach(use => {
      if (!otherUsesMap[use]) otherUsesMap[use] = [];
      otherUsesMap[use].push(art.name);
    });
  }
});

const otherUsesCollections: Collection[] = Object.entries(otherUsesMap).map(([use, items]) => ({
  name: use,
  collector: 'Other Uses',
  items: items,
}));

// Merge standard collections with Other Uses
const allCollectionsArray = [...initialCollectionsArray, ...otherUsesCollections];

// --- Precompute Collection Map ---
// Maps each artefact name to a list of collections (including other uses) it belongs to.
const artefactCollectionsMap: Record<string, string[]> = {};
artefactsArray.forEach(art => {
  artefactCollectionsMap[art.name] = [];
});
allCollectionsArray.forEach(col => {
  col.items.forEach(itemName => {
    if (artefactCollectionsMap[itemName]) {
      artefactCollectionsMap[itemName].push(col.name);
    }
  });
});

type AppView = 'artefacts' | 'collections';

function App() {
  // --- State ---
  const [artefactCounts, setArtefactCounts] = useState<UserArtefactCounts>(() => {
    const saved = localStorage.getItem('rs3-arch-counts-v2');
    return saved ? JSON.parse(saved) : {};
  });

  const [checkedCollections, setCheckedCollections] = useState<CheckedCollections>(() => {
    const saved = localStorage.getItem('rs3-arch-checked');
    return saved ? JSON.parse(saved) : {};
  });

  const [bankedMaterials, setBankedMaterials] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('rs3-arch-mat-banked');
    return saved ? JSON.parse(saved) : {};
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [sortMethod, setSortMethod] = useState<SortMethod>('level');
  const [selectedCollectionFilter, setSelectedCollectionFilter] = useState<string | null>(null);
  const [hideCompleted, setHideCompleted] = useState(false);
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isShoppingListOpen, setIsShoppingListOpen] = useState(false);
  const [isExcavationListOpen, setIsExcavationListOpen] = useState(false);
  
  const [currentView, setCurrentView] = useState<AppView>('artefacts');

  // --- Effects ---
  useEffect(() => {
    localStorage.setItem('rs3-arch-counts-v2', JSON.stringify(artefactCounts));
  }, [artefactCounts]);

  useEffect(() => {
    localStorage.setItem('rs3-arch-checked', JSON.stringify(checkedCollections));
  }, [checkedCollections]);

  useEffect(() => {
    localStorage.setItem('rs3-arch-mat-banked', JSON.stringify(bankedMaterials));
  }, [bankedMaterials]);

  // --- Handlers ---
  const handleCountChange = (name: string, type: 'damaged' | 'repaired', val: number) => {
    setArtefactCounts(prev => ({
      ...prev,
      [name]: {
        ...prev[name],
        [type]: val
      }
    }));
  };

  const handleCheckChange = (name: string, checked: boolean) => {
    setCheckedCollections(prev => ({ ...prev, [name]: checked }));
  };

  const handleMaterialBankedChange = (matName: string, val: number) => {
    setBankedMaterials(prev => ({ ...prev, [matName]: val }));
  };

  // --- Calculations ---
  
  const getDonatedCount = (artefactName: string): number => {
    const artefact = ARTEFACTS_JSON[artefactName];
    if (!artefact) return 0;

    let count = 0;
    
    // Standard Collections: Always 1
    const collectionNames = artefact.collections || [];
    collectionNames.forEach(name => {
        if (checkedCollections[name]) {
            count += 1;
        }
    });

    // Other Uses: Weighted based on remainder
    const otherUseNames = artefact.other_uses || [];
    if (otherUseNames.length > 0) {
        const totalNeeded = artefact.total_needed;
        const standardCount = collectionNames.length;
        
        // The remaining amount after standard collections is what's reserved for other uses
        const remainingForOther = Math.max(0, totalNeeded - standardCount);
        
        // Distribute remainder evenly among other uses
        // Usually there is only 1 other use, so it takes the full remainder.
        // If there are multiple, we split it.
        const perOtherUseRequirement = remainingForOther / otherUseNames.length;

        otherUseNames.forEach(name => {
            if (checkedCollections[name]) {
                count += perOtherUseRequirement;
            }
        });
    }

    return count;
  };

  // --- Complex Allocation Logic ---
  // Calculates which collections can be fulfilled by the current banked artefacts,
  // prioritizing collections with the lowest max-level artefact requirement.
  const { collectionStatuses, bonusChronotesTotal } = useMemo(() => {
    // 1. Filter incomplete collections
    const incompleteCollections = allCollectionsArray.filter(col => !checkedCollections[col.name]);

    // 2. Helper to get collection max level
    const getMaxLvl = (col: Collection) => {
        let max = 0;
        col.items.forEach(i => {
            const l = ARTEFACTS_JSON[i]?.level || 0;
            if (l > max) max = l;
        });
        return max;
    };

    // 3. Sort collections by max level (ascending) -> This is the allocation priority
    incompleteCollections.sort((a, b) => getMaxLvl(a) - getMaxLvl(b));

    // 4. Create a mutable clone of artefact counts to track allocation
    const availableCounts: Record<string, { repaired: number; damaged: number }> = {};
    artefactsArray.forEach(art => {
        const counts = artefactCounts[art.name] || { repaired: 0, damaged: 0 };
        availableCounts[art.name] = {
            repaired: counts.repaired || 0,
            damaged: counts.damaged || 0
        };
    });

    const resultStatuses: CollectionStatus[] = [];
    let totalBonus = 0;

    // 5. Iterate and allocate
    for (const col of incompleteCollections) {
        // Sort items in this collection by level
        const sortedItems = [...col.items].sort((a, b) => (ARTEFACTS_JSON[a]?.level || 0) - (ARTEFACTS_JSON[b]?.level || 0));
        
        const itemsStatus = [];
        let collectionReady = true;

        for (const itemName of sortedItems) {
            const counts = availableCounts[itemName];
            const artefact = ARTEFACTS_JSON[itemName];
            
            let status: 'ready' | 'damaged' | 'missing' = 'missing';

            if (counts.repaired > 0) {
                status = 'ready';
                counts.repaired--;
            } else if (counts.damaged > 0) {
                status = 'damaged';
                counts.damaged--;
                collectionReady = false; // Need to repair
            } else {
                status = 'missing';
                collectionReady = false;
            }

            itemsStatus.push({
                name: itemName,
                artefact,
                status
            });
        }

        if (collectionReady) {
            totalBonus += (col.collection_bonus_chronotes || 0);
        }

        resultStatuses.push({
            collection: col,
            maxLevel: getMaxLvl(col),
            itemsStatus,
            isReady: collectionReady
        });
    }

    return { collectionStatuses: resultStatuses, bonusChronotesTotal: totalBonus };

  }, [artefactCounts, checkedCollections]);


  const bankedTotals = useMemo(() => {
    let xp = 0;
    let chronotes = 0;
    
    artefactsArray.forEach(art => {
      const counts = artefactCounts[art.name];
      const damagedCount = counts?.damaged || 0;
      const repairedCount = counts?.repaired || 0;
      
      if (damagedCount > 0) {
        xp += damagedCount * art.xp;
      }
      
      if (damagedCount > 0 || repairedCount > 0) {
          chronotes += (damagedCount + repairedCount) * art.individual_chronotes;
      }
    });

    // Add the calculated bonus for fully ready collections
    chronotes += bonusChronotesTotal;

    return { xp, chronotes };
  }, [artefactCounts, bonusChronotesTotal]);

  const processedArtefacts = useMemo(() => {
    let result = artefactsArray.filter(art => {
      const matchesSearch = art.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Determine if artefact is in selected collection filter
      // Now including 'Other Uses' as they are in allCollectionsArray
      const matchesCollection = selectedCollectionFilter 
        ? (artefactCollectionsMap[art.name] && artefactCollectionsMap[art.name].includes(selectedCollectionFilter)) 
        : true;

      // Hide Completed Filter
      let matchesHideCompleted = true;
      if (hideCompleted) {
          const myCollections = artefactCollectionsMap[art.name] || [];
          if (myCollections.length > 0) {
              // If ALL of its collections are checked, hide it.
              const allCompleted = myCollections.every(colName => checkedCollections[colName]);
              if (allCompleted) matchesHideCompleted = false;
          }
      }

      return matchesSearch && matchesCollection && matchesHideCompleted;
    });

    return result.sort((a, b) => {
      if (sortMethod === 'name') {
        return a.name.localeCompare(b.name);
      } else if (sortMethod === 'level') {
        return a.level - b.level;
      } else if (sortMethod === 'remaining') {
        const countsA = artefactCounts[a.name];
        const donatedA = getDonatedCount(a.name);
        const remainingA = Math.max(0, a.total_needed - ((countsA?.damaged || 0) + (countsA?.repaired || 0) + donatedA));

        const countsB = artefactCounts[b.name];
        const donatedB = getDonatedCount(b.name);
        const remainingB = Math.max(0, b.total_needed - ((countsB?.damaged || 0) + (countsB?.repaired || 0) + donatedB));
        
        if (remainingB !== remainingA) return remainingB - remainingA;
        return a.name.localeCompare(b.name);
      }
      return 0;
    });
  }, [searchTerm, sortMethod, selectedCollectionFilter, hideCompleted, artefactCounts, checkedCollections]);

  const shoppingListMaterials = useMemo(() => {
    const totals: Materials = {};
    artefactsArray.forEach(art => {
      const counts = artefactCounts[art.name];
      const damagedCount = counts?.damaged || 0;
      
      if (damagedCount > 0 && art.materials) {
        Object.entries(art.materials).forEach(([matName, matQty]) => {
          totals[matName] = (totals[matName] || 0) + (matQty * damagedCount);
        });
      }
    });
    return totals;
  }, [artefactCounts]);

  // --- Excavation List Logic ---
  const excavationData = useMemo(() => {
    const grouped: Record<string, { artefact: Artefact, count: number }[]> = {};
    
    artefactsArray.forEach(art => {
        const counts = artefactCounts[art.name];
        const donated = getDonatedCount(art.name);
        
        const totalHave = (counts?.damaged || 0) + (counts?.repaired || 0) + donated;
        const remaining = Math.max(0, art.total_needed - totalHave);
        
        // If remaining is 0.5, we effectively need 1 artefact to cover it.
        const neededCount = Math.ceil(remaining);

        if (neededCount > 0) {
            const digSite = art.dig_sites[0] || 'Unknown';
            if (!grouped[digSite]) {
                grouped[digSite] = [];
            }
            grouped[digSite].push({ artefact: art, count: neededCount });
        }
    });

    // Sort artefacts within groups by level
    Object.values(grouped).forEach(list => {
        list.sort((a, b) => a.artefact.level - b.artefact.level);
    });

    // Sort groups by min level of artefacts in them
    const sortedSites = Object.keys(grouped).sort((a, b) => {
        const minLevelA = Math.min(...grouped[a].map(i => i.artefact.level));
        const minLevelB = Math.min(...grouped[b].map(i => i.artefact.level));
        return minLevelA - minLevelB;
    });

    return sortedSites.map(site => ({
        siteName: site,
        items: grouped[site]
    }));
  }, [artefactCounts, checkedCollections]);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-900 text-gray-100">
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar (Collections) */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-40 w-80 transform transition-transform duration-300 ease-in-out bg-gray-800
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 border-r border-gray-700
      `}>
        <CollectionSidebar 
          collections={allCollectionsArray}
          checkedCollections={checkedCollections}
          onCheckChange={handleCheckChange}
          artefacts={artefactsArray}
          hideCompleted={hideCompleted}
          onHideCompletedChange={setHideCompleted}
        />
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        
        <header className="bg-gray-800 border-b border-gray-700">
           <div className="p-4 flex items-center justify-between gap-4">
             <div className="flex items-center gap-3">
               <button 
                 onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                 className="md:hidden p-2 rounded hover:bg-gray-700 text-gray-300"
               >
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                 </svg>
               </button>
               <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent truncate hidden md:block">
                 Archaeology Tracker
               </h1>
             </div>
             
             {/* View Toggle */}
             <div className="flex bg-gray-700 p-1 rounded-lg border border-gray-600">
                <button
                    onClick={() => setCurrentView('artefacts')}
                    className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${
                        currentView === 'artefacts' 
                            ? 'bg-blue-600 text-white shadow-sm' 
                            : 'text-gray-300 hover:text-white hover:bg-gray-600'
                    }`}
                >
                    Artefacts
                </button>
                <button
                    onClick={() => setCurrentView('collections')}
                    className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${
                        currentView === 'collections' 
                            ? 'bg-blue-600 text-white shadow-sm' 
                            : 'text-gray-300 hover:text-white hover:bg-gray-600'
                    }`}
                >
                    Collections
                </button>
             </div>

             <div className="flex gap-2">
                <button
                    onClick={() => setIsExcavationListOpen(true)}
                    className="flex items-center gap-2 px-3 py-2 bg-yellow-700 hover:bg-yellow-600 rounded text-sm font-semibold shadow-lg transition-transform active:scale-95"
                    title="Excavation List"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                    <span className="hidden lg:inline">Excavation</span>
                </button>

                <button
                    onClick={() => setIsShoppingListOpen(true)}
                    className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm font-semibold shadow-lg transition-transform active:scale-95"
                    title="Material List"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <span className="hidden lg:inline">Materials</span>
                </button>
             </div>
           </div>
           
           <FilterBar
             searchTerm={searchTerm}
             onSearchChange={setSearchTerm}
             sortMethod={sortMethod}
             onSortChange={setSortMethod}
             collections={allCollectionsArray}
             selectedCollectionFilter={selectedCollectionFilter}
             onCollectionFilterChange={setSelectedCollectionFilter}
             totalXP={bankedTotals.xp}
             totalChronotes={bankedTotals.chronotes}
           />
        </header>

        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-900 scroll-smooth">
          {currentView === 'artefacts' ? (
              // ARTEFACTS VIEW
              <div className="grid grid-cols-[repeat(auto-fill,minmax(270px,1fr))] gap-6 justify-items-center mx-auto max-w-[1800px]">
                {processedArtefacts.map((artefact) => {
                  const counts = artefactCounts[artefact.name] || { damaged: 0, repaired: 0 };
                  return (
                    <ArtefactCard
                      key={artefact.name}
                      artefact={artefact}
                      damagedCount={counts.damaged || 0}
                      repairedCount={counts.repaired || 0}
                      donatedCount={getDonatedCount(artefact.name)}
                      checkedCollections={checkedCollections}
                      onCountChange={handleCountChange}
                    />
                  );
                })}
                
                {processedArtefacts.length === 0 && (
                    <div className="col-span-full text-center py-20 text-gray-500">
                        <p className="text-xl">No artefacts found.</p>
                        <p className="text-sm mt-2">Try adjusting your search or filters.</p>
                    </div>
                )}
              </div>
          ) : (
              // COLLECTIONS VIEW
              <CollectionView 
                collectionsStatus={collectionStatuses}
                onCheckChange={handleCheckChange}
              />
          )}
        </main>

      </div>

      <MaterialShoppingList
        materials={shoppingListMaterials}
        bankedMaterials={bankedMaterials}
        onMaterialBankedChange={handleMaterialBankedChange}
        isOpen={isShoppingListOpen}
        onClose={() => setIsShoppingListOpen(false)}
      />

      <ExcavationList
        groups={excavationData}
        isOpen={isExcavationListOpen}
        onClose={() => setIsExcavationListOpen(false)}
        artefactCounts={artefactCounts}
        onCountChange={handleCountChange}
      />

    </div>
  );
}

export default App;
