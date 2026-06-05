import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Search, Filter } from 'lucide-react';

const DIETARY_RESTRICTIONS = [
  'Gluten-Free', 'Dairy-Free', 'Nut-Free', 'Egg-Free', 'Soy-Free', 'Low-Carb', 'Sugar-Free'
];

const CUISINES = [
  'Italian', 'Asian', 'Indian', 'Pakistani', 'Continental', 'Mexican', 
  'Mediterranean', 'Middle Eastern', 'Japanese', 'Thai', 'Chinese'
];

export default function AdvancedSearch({ isOpen, onClose, onSearch }) {
  const [searchParams, setSearchParams] = useState({
    ingredients: [],
    currentIngredient: '',
    dietaryRestrictions: [],
    cuisine: '',
    maxCookTime: ''
  });

  const addIngredient = () => {
    if (searchParams.currentIngredient.trim()) {
      setSearchParams({
        ...searchParams,
        ingredients: [...searchParams.ingredients, searchParams.currentIngredient.trim()],
        currentIngredient: ''
      });
    }
  };

  const removeIngredient = (index) => {
    setSearchParams({
      ...searchParams,
      ingredients: searchParams.ingredients.filter((_, i) => i !== index)
    });
  };

  const toggleDietaryRestriction = (restriction) => {
    setSearchParams({
      ...searchParams,
      dietaryRestrictions: searchParams.dietaryRestrictions.includes(restriction)
        ? searchParams.dietaryRestrictions.filter(r => r !== restriction)
        : [...searchParams.dietaryRestrictions, restriction]
    });
  };

  const handleSearch = () => {
    onSearch(searchParams);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-w-3xl w-full max-h-[92vh] sm:max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-5 sm:px-8 py-4 sm:py-6 flex items-center justify-between rounded-t-3xl">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="bg-gradient-to-br from-emerald-500 to-orange-500 p-2 rounded-xl">
              <Search className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <h2 className="text-lg sm:text-2xl font-bold text-gray-900">Advanced Recipe Search</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-5 sm:p-8 space-y-5 sm:space-y-6">
          {/* Ingredients */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Ingredients</Label>
            <div className="flex gap-2">
              <Input
                value={searchParams.currentIngredient}
                onChange={(e) => setSearchParams({ ...searchParams, currentIngredient: e.target.value })}
                onKeyPress={(e) => e.key === 'Enter' && addIngredient()}
                placeholder="Type ingredient and press Enter"
                className="h-11 rounded-xl"
              />
              <Button onClick={addIngredient} className="bg-emerald-600 hover:bg-emerald-700">
                Add
              </Button>
            </div>
            {searchParams.ingredients.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {searchParams.ingredients.map((ingredient, index) => (
                  <Badge key={index} className="bg-emerald-100 text-emerald-800 px-3 py-1.5 text-sm">
                    {ingredient}
                    <button onClick={() => removeIngredient(index)} className="ml-2">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Dietary Restrictions */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Dietary Restrictions</Label>
            <div className="flex flex-wrap gap-2">
              {DIETARY_RESTRICTIONS.map((restriction) => {
                const isSelected = searchParams.dietaryRestrictions.includes(restriction);
                return (
                  <button
                    key={restriction}
                    onClick={() => toggleDietaryRestriction(restriction)}
                    className={`px-4 py-2 rounded-full border-2 transition-all text-sm font-medium ${
                      isSelected
                        ? 'bg-orange-600 text-white border-orange-600'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-orange-500'
                    }`}
                  >
                    {restriction}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cuisine Type */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Cuisine Type</Label>
            <Select value={searchParams.cuisine} onValueChange={(value) => setSearchParams({ ...searchParams, cuisine: value })}>
              <SelectTrigger className="h-11 rounded-xl">
                <SelectValue placeholder="Any cuisine" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any cuisine</SelectItem>
                {CUISINES.map((cuisine) => (
                  <SelectItem key={cuisine} value={cuisine}>
                    {cuisine}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Max Cooking Time */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Maximum Cooking Time (minutes)</Label>
            <Input
              type="number"
              value={searchParams.maxCookTime}
              onChange={(e) => setSearchParams({ ...searchParams, maxCookTime: e.target.value })}
              placeholder="e.g., 30"
              className="h-11 rounded-xl"
            />
          </div>
        </div>

        <div className="sticky bottom-0 bg-gray-50 px-5 sm:px-8 py-4 sm:py-6 rounded-b-3xl border-t">
          <Button
            onClick={handleSearch}
            disabled={searchParams.ingredients.length === 0}
            className="w-full bg-gradient-to-r from-emerald-600 to-orange-600 hover:from-emerald-700 hover:to-orange-700 py-6 text-lg rounded-2xl"
          >
            <Search className="w-5 h-5 mr-2" />
            Search Recipes
          </Button>
        </div>
      </div>
    </div>
  );
}