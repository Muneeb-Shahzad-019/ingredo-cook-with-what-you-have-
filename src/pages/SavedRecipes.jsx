import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ChefHat, Bookmark, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function SavedRecipes() {
  const navigate = useNavigate();
  const [savedRecipes, setSavedRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadSavedRecipes();
  }, []);

  const loadSavedRecipes = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);

      const saved = await base44.entities.SavedRecipe.filter({ user_email: userData.email });
      const allRecipes = await base44.entities.Recipe.list();
      
      const recipesWithDetails = saved.map(sr => {
        const recipe = allRecipes.find(r => r.id === sr.recipe_id);
        return { ...recipe, savedId: sr.id, notes: sr.notes };
      }).filter(r => r.id);

      setSavedRecipes(recipesWithDetails);
    } catch (error) {
      console.error('Error loading saved recipes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnsave = async (savedId) => {
    try {
      await base44.entities.SavedRecipe.delete(savedId);
      setSavedRecipes(savedRecipes.filter(r => r.savedId !== savedId));
    } catch (error) {
      console.error('Error removing recipe:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-orange-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <Button
            variant="ghost"
            onClick={() => navigate(createPageUrl('Home'))}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back</span>
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="bg-gradient-to-br from-emerald-500 to-orange-500 p-3 rounded-2xl">
              <Bookmark className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900">Saved Recipes</h1>
          </div>
          <p className="text-gray-600 text-lg">Your personal collection of favorite recipes</p>
        </div>

        {loading && (
          <div className="text-center py-20">
            <p className="text-gray-600">Loading saved recipes...</p>
          </div>
        )}

        {!loading && savedRecipes.length === 0 && (
          <div className="text-center py-20">
            <Bookmark className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No saved recipes yet</h3>
            <p className="text-gray-600 mb-6">Start saving recipes you love!</p>
            <Button
              onClick={() => navigate(createPageUrl('Home'))}
              className="bg-gradient-to-r from-emerald-600 to-orange-600 hover:from-emerald-700 hover:to-orange-700"
            >
              Discover Recipes
            </Button>
          </div>
        )}

        {!loading && savedRecipes.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {savedRecipes.map((recipe) => (
              <div
                key={recipe.id}
                className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all group"
              >
                <div
                  onClick={() => navigate(createPageUrl('RecipeDetail') + `?id=${recipe.id}`)}
                  className="cursor-pointer"
                >
                  {recipe.image_url ? (
                    <img
                      src={recipe.image_url}
                      alt={recipe.name}
                      className="w-full h-48 sm:h-56 object-cover group-hover:scale-110 transition-transform"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-56 bg-gradient-to-br from-emerald-400 to-orange-400 flex items-center justify-center">
                      <ChefHat className="w-20 h-20 text-white opacity-50" />
                    </div>
                  )}
                  <div className="p-6">
                    <h3 className="font-bold text-xl text-gray-900 mb-2">{recipe.name}</h3>
                    <p className="text-sm text-gray-600 mb-3">{recipe.cuisine}</p>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                      {recipe.cook_time && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {recipe.cook_time} min
                        </span>
                      )}
                      {recipe.difficulty && (
                        <span className="capitalize">{recipe.difficulty}</span>
                      )}
                    </div>

                    {recipe.categories && recipe.categories.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {recipe.categories.slice(0, 3).map((cat, i) => (
                          <Badge
                            key={i}
                            variant="secondary"
                            className="text-xs bg-emerald-50 text-emerald-700"
                          >
                            {cat}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {recipe.notes && (
                      <p className="text-sm text-gray-600 italic mb-4">"{recipe.notes}"</p>
                    )}
                  </div>
                </div>

                <div className="px-6 pb-6">
                  <Button
                    onClick={() => handleUnsave(recipe.savedId)}
                    variant="outline"
                    className="w-full text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200"
                  >
                    Remove from Saved
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}