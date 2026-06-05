import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { X, Filter } from 'lucide-react';

const AVAILABLE_FILTERS = [
  'Asian', 'Continental', 'Italian', 'Pakistani', 'Indian',
  'Vegan', 'Vegetarian', 'Non-Veg', 'Desserts', 'Breakfast', 'Soup',
  'High-Protein', 'Keto', 'Kid-Friendly', 'Quick'
];

export default function FilterBar({ onFilterChange }) {
  const [selectedFilter, setSelectedFilter] = useState(null);

  const toggleFilter = (filter) => {
    const newFilter = selectedFilter === filter ? null : filter;
    setSelectedFilter(newFilter);
    onFilterChange(newFilter ? [newFilter] : []);
  };

  const clearFilters = () => {
    setSelectedFilter(null);
    onFilterChange([]);
  };

  return (
    <div className="mb-6 sm:mb-8 space-y-3 sm:space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Select Category (One at a time)</h3>
        </div>
        {selectedFilter && (
          <button
            onClick={clearFilters}
            className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
          >
            Clear Filter
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {AVAILABLE_FILTERS.map((filter) => {
          const isSelected = selectedFilter === filter;
          return (
            <button
              key={filter}
              onClick={() => toggleFilter(filter)}
              className={`px-4 py-2 rounded-full border-2 transition-all text-sm font-medium ${
                isSelected
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-emerald-500'
              }`}
            >
              {filter}
              {isSelected && <X className="w-3 h-3 ml-1 inline" />}
            </button>
          );
        })}
      </div>

      {selectedFilter && (
        <div className="bg-emerald-50 rounded-xl p-3">
          <p className="text-sm text-emerald-900">
            Showing recipes from: <span className="font-semibold">{selectedFilter}</span>
          </p>
        </div>
      )}
    </div>
  );
}