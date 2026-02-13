import React, { useState, useEffect, useMemo } from 'react';
import { ARTEFACTS_JSON, COLLECTIONS_JSON } from './constants';
import { Artefact, Collection, BankedCounts, CheckedCollections, SortMethod, Materials } from './types';
import { ArtefactCard } from './components/ArtefactCard';
import { CollectionSidebar } from './components/CollectionSidebar';
import { FilterBar } from './components/FilterBar';
import { MaterialShoppingList } from './components/MaterialShoppingList';

// --- Data Transformation ---
const artefactsArray: Artefact[] = Object.entries(ARTEFACTS_JSON).map(([key, value]) => ({
  name: key,
  ...value,
}));

const collectionsArray: Collection[] = Object.entries(COLLECTIONS_JSON).map(([key, value]) => ({
  name: key,
  ...value,
}));

// --- Precompute Collection Map ---
// Maps each artefact name to a list of collections it belongs to.
// This optimizes the "Donated" calculation.
const artefactCollectionsMap: Record<string, string[]> = {};
artefactsArray.forEach(art => {
  artefactCollectionsMap[art.name] = [];
});
collectionsArray.forEach(col => {
  col.items.forEach(itemName => {
    if (artefactCollectionsMap[itemName]) {
      artefactCollectionsMap[itemName].push(col.name);
    }
  });
});


function App() {
  // --- State ---
  // LocalStorage initialization with lazy state
  const [bankedCounts, setBankedCounts] = useState<BankedCounts>(() => {
    const saved = localStorage.getItem('rs3-arch-banked');
    return saved ? JSON.parse(saved) : {};
  });

  const [checkedCollections, setCheckedCollections] = useState<CheckedCollections>(() => {
    const saved = localStorage.getItem('rs3-arch-checked');
    return saved ? JSON.parse(saved) : {};
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [sortMethod, setSortMethod] = useState<SortMethod>('level');
  const [selectedCollectionFilter, setSelectedCollectionFilter] = useState<string | null>(null);
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile sidebar toggle
  const [isShoppingListOpen, setIsShoppingListOpen] = useState(false);

  // --- Effects ---
  useEffect(() => {
    localStorage.setItem('rs3-arch-banked', JSON.stringify(bankedCounts));
  }, [bankedCounts]);

  useEffect(() => {
    localStorage.setItem('rs3-arch-checked', JSON.stringify(checkedCollections));
  }, [checkedCollections]);

  // --- Handlers ---
  const handleBankedChange = (name: string, val: number) => {
    setBankedCounts(prev => ({ ...prev, [name]: val }));
  };

  const handleCheckChange = (name: string, checked: boolean) => {
    setCheckedCollections(prev => ({ ...prev, [name]: checked }));
  };

  // --- Calculations ---
  
  // Calculate donated count per artefact based on checked collections
  const getDonatedCount = (artefactName: string): number => {
    const relevantCollections = artefactCollectionsMap[artefactName] || [];
    return relevantCollections.reduce((acc, colName) => {
      return acc + (checkedCollections[colName] ? 1 : 0);
    }, 0);
  };

  // Filter & Sort Artefacts
  const processedArtefacts = useMemo(() => {
    let result = artefactsArray.filter(art => {
      const matchesSearch = art.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCollection = selectedCollectionFilter 
        ? (art.collections && art.collections.includes(selectedCollectionFilter)) // Use art.collections from JSON or derived map? JSON has it.
        : true;
      return matchesSearch && matchesCollection;
    });

    return result.sort((a, b) => {
      if (sortMethod === 'name') {
        return a.name.localeCompare(b.name);
      } else if (sortMethod === 'level') {
        return a.level - b.level;
      } else if (sortMethod === 'remaining') {
        const remainingA = Math.max(0, a.total_needed - ((bankedCounts[a.name] || 0) + getDonatedCount(a.name)));
        const remainingB = Math.max(0, b.total_needed - ((bankedCounts[b.name] || 0) + getDonatedCount(b.name)));
        // Sort descending by remaining (show needed first), then name
        if (remainingB !== remainingA) return remainingB - remainingA;
        return a.name.localeCompare(b.name);
      }
      return 0;
    });
  }, [searchTerm, sortMethod, selectedCollectionFilter, bankedCounts, checkedCollections]);

  // Calculate Shopping List
  // Sums materials for all artefacts currently in "Banked" status.
  const shoppingListMaterials = useMemo(() => {
    const totals: Materials = {};
    artefactsArray.forEach(art => {
      const count = bankedCounts[art.name] || 0;
      if (count > 0 && art.materials) {
        Object.entries(art.materials).forEach(([matName, matQty]) => {
          totals[matName] = (totals[matName] || 0) + (matQty * count);
        });
      }
    });
    return totals;
  }, [bankedCounts]);

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
          collections={collectionsArray}
          checkedCollections={checkedCollections}
          onCheckChange={handleCheckChange}
        />
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Header / Top Bar */}
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
             collections={collectionsArray}
             selectedCollectionFilter={selectedCollectionFilter}
             onCollectionFilterChange={setSelectedCollectionFilter}
           />
        </header>

        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-900 scroll-smooth">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            {processedArtefacts.map((artefact) => (
              <ArtefactCard
                key={artefact.name}
                artefact={artefact}
                bankedCount={bankedCounts[artefact.name] || 0}
                donatedCount={getDonatedCount(artefact.name)}
                onBankedChange={handleBankedChange}
              />
            ))}
            
            {processedArtefacts.length === 0 && (
                <div className="col-span-full text-center py-20 text-gray-500">
                    <p className="text-xl">No artefacts found.</p>
                    <p className="text-sm mt-2">Try adjusting your search or filters.</p>
                </div>
            )}
          </div>
        </main>

      </div>

      {/* Shopping List Modal */}
      <MaterialShoppingList
        materials={shoppingListMaterials}
        isOpen={isShoppingListOpen}
        onClose={() => setIsShoppingListOpen(false)}
      />

    </div>
  );
}

export default App;
