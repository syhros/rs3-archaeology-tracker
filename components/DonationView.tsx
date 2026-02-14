import React, { useMemo } from 'react';
import { Artefact } from '../types';

interface DonationViewProps {
  artefacts: Artefact[];
  donationCounts: Record<string, number>;
  onDonationCountChange: (name: string, val: number) => void;
}

export const DonationView: React.FC<DonationViewProps> = ({
  artefacts,
  donationCounts,
  onDonationCountChange,
}) => {
  
  // Calculate total value of banked items in this view
  const totalDonationValue = useMemo(() => {
    return artefacts.reduce((acc, art) => {
      const count = donationCounts[art.name] || 0;
      const donationValue = Math.floor(art.individual_chronotes * 0.4);
      return acc + (count * donationValue);
    }, 0);
  }, [artefacts, donationCounts]);

  return (
    <div className="space-y-6 mx-auto max-w-[1800px]">
        
        {/* Summary Header */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 flex flex-col sm:flex-row items-center justify-between gap-4 sticky top-0 z-10 shadow-lg">
            <div>
                <h2 className="text-xl font-bold text-gray-200">Donatable Artefacts</h2>
                <p className="text-sm text-gray-400">
                    Artefacts where all collections and uses are completed.
                    <br className="hidden sm:block"/>
                    Value is calculated at <span className="text-yellow-500 font-bold">40%</span> (Museum Donation).
                </p>
            </div>
            <div className="flex items-center gap-3 bg-gray-900 px-6 py-3 rounded-lg border border-gray-700">
                <div className="text-right">
                    <div className="text-xs text-gray-500 uppercase font-bold tracking-wider">Total Value</div>
                    <div className="flex items-center gap-2">
                        <img src="/img/100px-Chronotes_10000_detail.png" alt="Chronotes" className="w-6 h-6 object-contain" />
                        <span className="text-2xl font-mono font-bold text-white">
                            {totalDonationValue.toLocaleString()}
                        </span>
                    </div>
                </div>
            </div>
        </div>

        {artefacts.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
                <p className="text-xl">No donatable artefacts found.</p>
                <p className="text-sm mt-2">Complete collections to see items here.</p>
            </div>
        ) : (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
                {artefacts.map(art => {
                    const count = donationCounts[art.name] || 0;
                    const unitValue = Math.floor(art.individual_chronotes * 0.4);
                    const totalValue = count * unitValue;

                    return (
                        <div key={art.name} className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden flex flex-row h-28 shadow-sm hover:border-blue-500 transition-colors">
                            {/* Image Section */}
                            <div className="w-24 bg-gray-900 flex items-center justify-center p-2 border-r border-gray-700 relative">
                                <img 
                                    src={`/img/${art.img_src}`} 
                                    alt={art.name} 
                                    className="max-w-full max-h-full object-contain"
                                />
                                <div className="absolute bottom-1 right-1 text-[10px] text-gray-500 font-mono">
                                    Lvl {art.level}
                                </div>
                            </div>

                            {/* Info & Input Section */}
                            <div className="flex-1 flex flex-col p-3 justify-between">
                                <div>
                                    <h3 className="font-bold text-sm text-gray-200 leading-tight truncate" title={art.name}>
                                        {art.name}
                                    </h3>
                                    <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                        <img src="/img/100px-Chronotes_10000_detail.png" className="w-3 h-3" alt="C" /> 
                                        {unitValue} <span className="opacity-50">/ each</span>
                                    </div>
                                </div>

                                <div className="flex items-end justify-between gap-2">
                                    <div className="flex flex-col w-16">
                                        <label className="text-[9px] uppercase text-gray-500 font-bold mb-0.5">Have</label>
                                        <input 
                                            type="number" 
                                            min="0"
                                            value={count}
                                            onChange={(e) => onDonationCountChange(art.name, parseInt(e.target.value) || 0)}
                                            className="bg-gray-900 border border-gray-600 rounded px-2 py-1 text-center text-white text-sm focus:border-blue-500 focus:outline-none w-full"
                                            onClick={(e) => (e.target as HTMLInputElement).select()}
                                        />
                                    </div>
                                    
                                    <div className="flex flex-col items-end">
                                        <span className="text-[9px] uppercase text-gray-500 font-bold mb-0.5">Total</span>
                                        <span className={`font-mono font-bold text-sm ${totalValue > 0 ? 'text-green-400' : 'text-gray-600'}`}>
                                            {totalValue.toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        )}
    </div>
  );
};
