import React, { useState, useEffect, useMemo } from 'react';
import { ARTEFACTS_JSON, COLLECTIONS_JSON } from './constants';
import { Artefact, Collection, UserArtefactCounts, CheckedCollections, SortMethod, Materials } from './types';
import { ArtefactCard } from './components/ArtefactCard';
import { CollectionSidebar } from './components/CollectionSidebar';
import { FilterBar } from './components/FilterBar';
import { MaterialShoppingList } from './components/MaterialShoppingList';

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
    const relevantCollections = artefactCollectionsMap[artefactName] || [];
    return relevantCollections.reduce((acc, colName) => {
      return acc + (checkedCollections[colName] ? 1 : 0);
    }, 0);
  };

  const bankedTotals = useMemo(() => {
    let xp = 0;
    let chronotes = 0;
    
    artefactsArray.forEach(art => {
      const counts = artefactCounts[art.name];
      const damagedCount = counts?.damaged || 0;
      
      if (damagedCount > 0) {
        xp += damagedCount * art.xp;
        chronotes += damagedCount * art.individual_chronotes;
      }
    });

    return { xp, chronotes };
  }, [artefactCounts]);

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
           <div className="p-4 flex items-center justify-between">
             <div className="flex items-center gap-3">
               <button 
                 onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                 className="md:hidden p-2 rounded hover:bg-gray-700 text-gray-300"
               >
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                 </svg>
               </button>
               <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent truncate">
                 Archaeology Tracker
               </h1>
             </div>
             
             <button
                onClick={() => setIsShoppingListOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm font-semibold shadow-lg transition-transform active:scale-95"
             >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <span className="hidden sm:inline">Material List</span>
             </button>
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
          {/* Use auto-fill with minmax to handle responsive grid without overlaps */}
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
        </main>

      </div>

      <MaterialShoppingList
        materials={shoppingListMaterials}
        bankedMaterials={bankedMaterials}
        onMaterialBankedChange={handleMaterialBankedChange}
        isOpen={isShoppingListOpen}
        onClose={() => setIsShoppingListOpen(false)}
      />

    </div>
  );
}

export default App;
