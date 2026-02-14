import React, { useState, useMemo } from 'react';
import { Artefact, UserArtefactCounts, ExcavationSortMethod } from '../types';
import { NumberInput } from './NumberInput';

interface ExcavationItem {
  artefact: Artefact;
  count: number;
}

interface ExcavationGroup {
  label: string;
  items: ExcavationItem[];
}

interface ExcavationListProps {
  groups: ExcavationGroup[];
  isOpen: boolean;
  onClose: () => void;
  artefactCounts: UserArtefactCounts;
  onCountChange: (name: string, type: 'damaged' | 'repaired', val: number) => void;
}

export const ExcavationList: React.FC<ExcavationListProps> = ({
  groups,
  isOpen,
  onClose,
  artefactCounts,
  onCountChange,
}) => {
  const [sortMethod, setSortMethod] = useState<ExcavationSortMethod>('level');
  const [localCounts, setLocalCounts] = useState<UserArtefactCounts>({});

  const allItems = useMemo(() => {
    return groups.flatMap(g => g.items);
  }, [groups]);

  const handleLocalCountChange = (name: string, type: 'damaged' | 'repaired', val: number) => {
    setLocalCounts(prev => ({
      ...prev,
      [name]: {
        ...(prev[name] || { damaged: 0, repaired: 0 }),
        [type]: Math.max(0, val),
      },
    }));
    onCountChange(name, type, val);
  };

  const groupedItems = useMemo(() => {
    if (allItems.length === 0) return [];

    const itemsWithLocalCounts = allItems.map(({ artefact, count }) => {
      const local = localCounts[artefact.name];
      const current = local || artefactCounts[artefact.name] || { damaged: 0, repaired: 0 };
      const total = current.damaged + current.repaired;
      const remaining = Math.max(0, count - total);
      const isCompleted = remaining === 0;
      return { artefact, count, current, total, remaining, isCompleted };
    });

    const grouped = new Map<string, typeof itemsWithLocalCounts>();

    itemsWithLocalCounts.forEach(item => {
      let groupKey = '';
      switch (sortMethod) {
        case 'excavation_hotspot':
          groupKey = item.artefact.excavation_hotspot?.[0] || 'Unknown';
          break;
        case 'excavation_site':
          groupKey = item.artefact.excavation_site?.[0] || 'Unknown';
          break;
        case 'dig_site':
          groupKey = item.artefact.dig_site?.[0] || 'Unknown';
          break;
        case 'level':
          groupKey = `Level ${item.artefact.level}`;
          break;
      }

      if (!grouped.has(groupKey)) {
        grouped.set(groupKey, []);
      }
      grouped.get(groupKey)!.push(item);
    });

    const sortedGroups: ExcavationGroup[] = [];
    const groupArray = Array.from(grouped.entries());

    if (sortMethod === 'level') {
      groupArray.sort((a, b) => {
        const levelA = parseInt(a[0].replace('Level ', ''));
        const levelB = parseInt(b[0].replace('Level ', ''));
        return levelA - levelB;
      });
    } else {
      groupArray.sort((a, b) => a[0].localeCompare(b[0]));
    }

    groupArray.forEach(([label, items]) => {
      items.sort((a, b) => {
        if (a.remaining !== b.remaining) return b.remaining - a.remaining;
        return a.artefact.name.localeCompare(b.artefact.name);
      });
      sortedGroups.push({ label, items });
    });

    return sortedGroups;
  }, [allItems, sortMethod, localCounts, artefactCounts]);

  if (!isOpen) return null;

  const completedCount = allItems.filter(({ count }) => {
    const local = localCounts[count.toString()];
    const current = local || artefactCounts[count.toString()] || { damaged: 0, repaired: 0 };
    return (current.damaged + current.repaired) >= count;
  }).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-5xl flex flex-col max-h-[90vh] border border-gray-700">

        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-700 bg-gray-900 rounded-t-lg">
          <div>
            <h2 className="text-xl font-bold text-white">Excavation Planning</h2>
            <p className="text-sm text-gray-400">Track artefacts as you excavate</p>
            <p className="text-xs text-blue-400 mt-1">{completedCount} / {allItems.length} items completed</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-2 rounded hover:bg-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Sort Controls */}
        <div className="px-4 py-3 border-b border-gray-700 bg-gray-800/50 flex items-center gap-3">
          <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">Group by:</span>
          <div className="flex gap-2">
            {[
              { value: 'level' as ExcavationSortMethod, label: 'Level' },
              { value: 'dig_site' as ExcavationSortMethod, label: 'Dig Site' },
              { value: 'excavation_site' as ExcavationSortMethod, label: 'Location' },
              { value: 'excavation_hotspot' as ExcavationSortMethod, label: 'Hotspot' },
            ].map(option => (
              <button
                key={option.value}
                onClick={() => setSortMethod(option.value)}
                className={`px-3 py-1.5 text-xs rounded font-medium transition-colors ${
                  sortMethod === option.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
          {groupedItems.length === 0 ? (
            <div className="text-center text-gray-500 py-12">
              No additional artefacts needed! All collections are complete or you have enough banked.
            </div>
          ) : (
            <div className="space-y-6">
              {groupedItems.map((group) => (
                <div key={group.label} className="bg-gray-900/50 rounded-lg border border-gray-700 overflow-hidden">
                  <div className="bg-gray-800/80 px-4 py-2 border-b border-gray-700 sticky top-0 z-10">
                    <h3 className="font-bold text-blue-400">
                      {group.label}
                    </h3>
                  </div>

                  <div className="divide-y divide-gray-800">
                    {group.items.map(({ artefact, count, current, total, remaining, isCompleted }) => (
                      <div
                        key={artefact.name}
                        className={`flex flex-col md:flex-row items-start md:items-center p-3 gap-4 transition-all ${
                          isCompleted
                            ? 'bg-green-900/20 border-l-2 border-l-green-500'
                            : 'hover:bg-gray-800/30'
                        }`}
                      >
                        {/* Image & Basic Info */}
                        <div className="flex items-center gap-4 flex-1 w-full md:w-auto">
                          <div className="w-10 h-10 flex-shrink-0 bg-gray-800 rounded border border-gray-700 flex items-center justify-center p-1">
                            <img
                              src={`/img/${artefact.img_src}`}
                              alt={artefact.name}
                              className="max-w-full max-h-full object-contain"
                            />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-baseline gap-2">
                              <span className={`font-bold truncate ${isCompleted ? 'text-green-400' : 'text-gray-200'}`}>
                                {artefact.name}
                              </span>
                              <span className="text-xs text-gray-500 font-mono">Lvl {artefact.level}</span>
                            </div>
                            <div className="text-xs text-gray-500 truncate hidden sm:block">
                              {artefact.xp} XP &bull; {artefact.individual_chronotes} Chronotes
                            </div>
                          </div>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center gap-4 w-full md:w-auto justify-end flex-wrap">
                          {/* Damaged Input */}
                          <div className="flex flex-col">
                            <label className="text-[9px] text-gray-500 uppercase tracking-wide mb-0.5">Damaged</label>
                            <NumberInput
                              value={current.damaged}
                              onChange={(val) => handleLocalCountChange(artefact.name, 'damaged', val)}
                              min={0}
                              max={count}
                              className="w-14"
                              showButtons={false}
                            />
                          </div>

                          {/* Repaired Input */}
                          <div className="flex flex-col">
                            <label className="text-[9px] text-gray-500 uppercase tracking-wide mb-0.5">Repaired</label>
                            <NumberInput
                              value={current.repaired}
                              onChange={(val) => handleLocalCountChange(artefact.name, 'repaired', val)}
                              min={0}
                              max={count}
                              className="w-14"
                              showButtons={false}
                            />
                          </div>

                          {/* Status Badge */}
                          <div className={`flex flex-col items-center justify-center min-w-[3.5rem] rounded px-3 py-2 border transition-colors ${
                            isCompleted
                              ? 'bg-green-900/50 border-green-600 text-green-400'
                              : 'bg-yellow-900/30 border-yellow-700 text-yellow-400'
                          }`}>
                            <span className="text-[9px] text-gray-400 uppercase tracking-wide">Need</span>
                            <span className={`text-xl font-bold leading-none ${isCompleted ? 'text-green-400' : 'text-yellow-400'}`}>
                              {Math.max(0, remaining)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700 bg-gray-900 rounded-b-lg flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded font-medium transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
