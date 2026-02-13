import React from 'react';
import { Materials } from '../types';

interface MaterialShoppingListProps {
  materials: Materials;
  isOpen: boolean;
  onClose: () => void;
}

export const MaterialShoppingList: React.FC<MaterialShoppingListProps> = ({
  materials,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const sortedMaterials = Object.entries(materials).sort((a, b) => a[0].localeCompare(b[0]));
  const totalCount = Object.values(materials).reduce((acc, curr) => acc + curr, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-700 bg-gray-900 rounded-t-lg">
          <div>
              <h2 className="text-xl font-bold text-white">Restoration Materials</h2>
              <p className="text-sm text-gray-400">Required for current Banked artefacts</p>
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {sortedMaterials.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No artefacts banked, or banked artefacts require no materials.
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="text-xs text-gray-400 uppercase bg-gray-700/50 sticky top-0">
                <tr>
                  <th className="px-4 py-2 rounded-tl-md">Material</th>
                  <th className="px-4 py-2 text-right rounded-tr-md">Qty</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {sortedMaterials.map(([name, qty]) => (
                  <tr key={name} className="hover:bg-gray-700/30">
                    <td className="px-4 py-3 font-medium text-gray-200">{name}</td>
                    <td className="px-4 py-3 text-right font-mono text-blue-300">{qty}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-700/50 font-bold sticky bottom-0">
                  <tr>
                      <td className="px-4 py-3 text-gray-200">Total Materials</td>
                      <td className="px-4 py-3 text-right text-blue-300 font-mono">{totalCount}</td>
                  </tr>
              </tfoot>
            </table>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700 bg-gray-900 rounded-b-lg flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded shadow transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
