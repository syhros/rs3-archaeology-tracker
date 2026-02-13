import React from 'react';
import { Materials } from '../types';

interface MaterialShoppingListProps {
  materials: Materials; // Required amounts
  bankedMaterials: Record<string, number>;
  onMaterialBankedChange: (name: string, val: number) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const MaterialShoppingList: React.FC<MaterialShoppingListProps> = ({
  materials,
  bankedMaterials,
  onMaterialBankedChange,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const sortedMaterials = Object.entries(materials).sort((a, b) => a[0].localeCompare(b[0]));
  
  // Calculate Totals
  const totalNeeded = Object.values(materials).reduce((acc, curr) => acc + curr, 0);
  const totalBanked = sortedMaterials.reduce((acc, [name]) => acc + (bankedMaterials[name] || 0), 0);
  const totalRemaining = sortedMaterials.reduce((acc, [name, needed]) => {
      const banked = bankedMaterials[name] || 0;
      return acc + Math.max(0, needed - banked);
  }, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-3xl flex flex-col max-h-[90vh] border border-gray-700">
        
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
        <div className="flex-1 overflow-y-auto p-0">
          {sortedMaterials.length === 0 ? (
            <div className="text-center text-gray-500 py-12">
              No artefacts banked, or banked artefacts require no materials.
            </div>
          ) : (
            <table className="w-full text-left text-sm border-collapse">
              <thead className="text-xs text-gray-400 uppercase bg-gray-900/90 sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="px-4 py-3 font-semibold tracking-wider">Material</th>
                  <th className="px-4 py-3 text-center w-24 font-semibold tracking-wider">Needed</th>
                  <th className="px-4 py-3 text-center w-32 font-semibold tracking-wider">Banked</th>
                  <th className="px-4 py-3 text-center w-24 font-semibold tracking-wider">Remaining</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700 bg-gray-800">
                {sortedMaterials.map(([name, needed]) => {
                  const banked = bankedMaterials[name] || 0;
                  const remaining = Math.max(0, needed - banked);
                  const isComplete = remaining === 0;

                  return (
                    <tr key={name} className="hover:bg-gray-700/50 transition-colors">
                      <td className="px-4 py-2 font-medium text-gray-200">{name}</td>
                      
                      <td className="px-4 py-2 text-center font-mono text-gray-300">
                        {needed}
                      </td>
                      
                      <td className="px-4 py-2 text-center">
                        <input 
                            type="number" 
                            min="0"
                            value={banked}
                            onChange={(e) => onMaterialBankedChange(name, parseInt(e.target.value) || 0)}
                            className="w-full bg-gray-900 border border-gray-600 rounded px-2 py-1 text-center text-white focus:border-blue-500 focus:outline-none text-sm font-mono"
                            onClick={(e) => (e.target as HTMLInputElement).select()}
                        />
                      </td>
                      
                      <td className={`px-4 py-2 text-center font-mono font-bold ${isComplete ? 'text-green-500' : 'text-red-400'}`}>
                        {isComplete ? (
                            <span className="flex items-center justify-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                0
                            </span>
                        ) : remaining}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-gray-900 font-bold sticky bottom-0 z-10 border-t-2 border-gray-700 text-gray-200">
                  <tr>
                      <td className="px-4 py-3">TOTALS</td>
                      <td className="px-4 py-3 text-center font-mono text-blue-300">{totalNeeded}</td>
                      <td className="px-4 py-3 text-center font-mono text-gray-400">{totalBanked}</td>
                      <td className="px-4 py-3 text-center font-mono text-red-400">{totalRemaining}</td>
                  </tr>
              </tfoot>
            </table>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700 bg-gray-900 rounded-b-lg flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium shadow transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
