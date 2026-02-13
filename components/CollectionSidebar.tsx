import React from 'react';
import { Collection, CheckedCollections } from '../types';

interface CollectionSidebarProps {
  collections: Collection[];
  checkedCollections: CheckedCollections;
  onCheckChange: (name: string, checked: boolean) => void;
}

export const CollectionSidebar: React.FC<CollectionSidebarProps> = ({
  collections,
  checkedCollections,
  onCheckChange,
}) => {
  // Sort collections alphabetically
  const sortedCollections = [...collections].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="h-full flex flex-col bg-gray-800 border-r border-gray-700 w-full md:w-80">
      <div className="p-4 border-b border-gray-700 bg-gray-900">
        <h2 className="text-xl font-bold text-white">Collections</h2>
        <p className="text-xs text-gray-400 mt-1">Check completed collections to update "Donated" counts.</p>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {sortedCollections.map((col) => (
          <label
            key={col.name}
            className="flex items-start gap-3 p-2 rounded hover:bg-gray-700 cursor-pointer transition-colors"
          >
            <input
              type="checkbox"
              className="mt-1 w-4 h-4 rounded border-gray-500 text-blue-600 focus:ring-blue-500 bg-gray-900"
              checked={!!checkedCollections[col.name]}
              onChange={(e) => onCheckChange(col.name, e.target.checked)}
            />
            <div className="text-sm">
                <div className="text-gray-200 font-medium leading-tight">{col.name}</div>
                <div className="text-gray-500 text-xs mt-0.5">{col.collector}</div>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
};
