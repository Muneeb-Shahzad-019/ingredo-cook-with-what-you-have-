import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { X, Search, Plus, Sparkles } from 'lucide-react';

export default function IngredientSelector({ isOpen, onClose, onSearch }) {
  const [ingredients, setIngredients] = useState([]);
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [customIngredient, setCustomIngredient] = useState('');
  const [includeCommonSpices, setIncludeCommonSpices] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadIngredients();
    }
  }, [isOpen]);

  const loadIngredients = async () => {
    try {
      const data = await base44.entities.Ingredient.list();
      setIngredients(data);
    } catch (error) {
      console.error('Error loading ingredients:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredIngredients = ingredients.filter(ing =>
    ing.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleIngredient = (ingredient) => {
    setSelectedIngredients(prev =>
      prev.some(i => i.id === ingredient.id)
        ? prev.filter(i => i.id !== ingredient.id)
        : [...prev, ingredient]
    );
  };

  const addCustomIngredient = () => {
    if (customIngredient.trim()) {
      const custom = {
        id: 'custom-' + Date.now(),
        name: customIngredient.trim(),
        category: 'other'
      };
      setSelectedIngredients(prev => [...prev, custom]);
      setCustomIngredient('');
    }
  };

  const handleSearch = () => {
    onSearch(selectedIngredients, includeCommonSpices);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-3xl w-full max-h-[92vh] sm:max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-500 to-orange-500 p-4 sm:p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl sm:text-2xl font-bold">Select Your Ingredients</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <p className="text-white/90">Tell us what you have in your kitchen</p>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto max-h-[calc(92vh-180px)] sm:max-h-[calc(90vh-200px)]">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search ingredients..."
              className="pl-12 h-12 rounded-xl text-base"
            />
          </div>

          {/* Selected Ingredients */}
          {selectedIngredients.length > 0 && (
            <div className="bg-emerald-50 rounded-2xl p-4">
              <p className="text-sm font-semibold text-emerald-900 mb-3">
                Selected ({selectedIngredients.length})
              </p>
              <div className="flex flex-wrap gap-2">
                {selectedIngredients.map((ing) => (
                  <Badge
                    key={ing.id}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white pl-3 pr-2 py-2 text-sm"
                  >
                    {ing.name}
                    <button
                      onClick={() => toggleIngredient(ing)}
                      className="ml-2 hover:bg-white/20 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Common Spices Option */}
          <div className="flex items-center gap-3 bg-orange-50 rounded-2xl p-4">
            <Checkbox
              id="common-spices"
              checked={includeCommonSpices}
              onCheckedChange={setIncludeCommonSpices}
            />
            <label htmlFor="common-spices" className="text-sm font-medium cursor-pointer flex-1">
              I have common spices (salt, pepper, oil, etc.)
            </label>
          </div>

          {/* Add Custom Ingredient */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700">Add Custom Ingredient</Label>
            <div className="flex gap-2">
              <Input
                value={customIngredient}
                onChange={(e) => setCustomIngredient(e.target.value)}
                placeholder="Enter ingredient name..."
                className="h-11 rounded-xl"
                onKeyPress={(e) => e.key === 'Enter' && addCustomIngredient()}
              />
              <Button
                onClick={addCustomIngredient}
                className="bg-orange-600 hover:bg-orange-700 rounded-xl px-6"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Ingredient List */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700">
              {searchQuery ? 'Search Results' : 'Common Ingredients'}
            </Label>
            {loading ? (
              <div className="text-center py-8 text-gray-500">Loading ingredients...</div>
            ) : filteredIngredients.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No ingredients found. Try adding a custom ingredient!
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {filteredIngredients.slice(0, 30).map((ingredient) => {
                  const isSelected = selectedIngredients.some(i => i.id === ingredient.id);
                  return (
                    <button
                      key={ingredient.id}
                      onClick={() => toggleIngredient(ingredient)}
                      className={`px-4 py-2.5 rounded-xl border-2 transition-all text-sm font-medium ${
                        isSelected
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-emerald-500'
                      }`}
                    >
                      {ingredient.name}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 border-t bg-gray-50">
          <Button
            onClick={handleSearch}
            disabled={selectedIngredients.length === 0}
            className="w-full bg-gradient-to-r from-emerald-600 to-orange-600 hover:from-emerald-700 hover:to-orange-700 text-white py-6 text-lg rounded-2xl"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Find Recipes ({selectedIngredients.length} ingredients)
          </Button>
        </div>
      </div>
    </div>
  );
}