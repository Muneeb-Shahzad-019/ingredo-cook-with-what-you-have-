import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { ChefHat, Plus, Bookmark, User, Settings, Sparkles, MapPin, Award, Filter } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import IngredientSelector from '../components/home/IngredientSelector';
import FilterBar from '../components/home/FilterBar';
import AdvancedSearch from '../components/home/AdvancedSearch';

const POPULAR_FILTERS = [
  { name: 'Asian', icon: '🍜' },
  { name: 'Continental', icon: '🍝' },
  { name: 'Italian', icon: '🍕' },
  { name: 'Indian', icon: '🍛' },
  { name: 'Vegan', icon: '🥗' },
  { name: 'Desserts', icon: '🍰' },
  { name: 'Quick', icon: '⚡' },
  { name: 'Breakfast', icon: '🍳' }
];

export default function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showIngredientSelector, setShowIngredientSelector] = useState(false);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [recentRecipes, setRecentRecipes] = useState([]);
  const [trendingRecipes, setTrendingRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);

      const recipes = await base44.entities.Recipe.list('-created_date', 6);
      setRecentRecipes(recipes);

      // Get trending recipes (by views/likes)
      const allRecipes = await base44.entities.Recipe.list('-views_count', 6);
      setTrendingRecipes(allRecipes);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleIngredientSearch = (ingredients, includeCommonSpices) => {
    const ingredientNames = ingredients.map(i => i.name).join(',');
    navigate(createPageUrl('RecipeResults') + `?ingredients=${encodeURIComponent(ingredientNames)}&spices=${includeCommonSpices}`);
  };

  const handleAdvancedSearch = (searchParams) => {
    const params = new URLSearchParams();
    if (searchParams.ingredients.length > 0) {
      params.append('ingredients', searchParams.ingredients.join(','));
    }
    if (searchParams.dietaryRestrictions.length > 0) {
      params.append('dietary', searchParams.dietaryRestrictions.join(','));
    }
    if (searchParams.cuisine && searchParams.cuisine !== 'any') {
      params.append('cuisine', searchParams.cuisine);
    }
    if (searchParams.maxCookTime) {
      params.append('maxTime', searchParams.maxCookTime);
    }
    navigate(createPageUrl('RecipeResults') + `?${params.toString()}`);
  };

  const handleFilterClick = (filter) => {
    navigate(createPageUrl('RecipeResults') + `?filter=${filter.name}`);
  };

  const isPro = user?.account_type === 'professional';

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-orange-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="bg-gradient-to-br from-emerald-500 to-orange-500 p-1.5 sm:p-2 rounded-xl">
                <ChefHat className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-emerald-600 to-orange-500 bg-clip-text text-transparent">
                  Ingredo
                </h1>
                {user && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-600">
                    <MapPin className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate max-w-[80px] sm:max-w-none">{user.country || 'Global'}</span>
                    {isPro && (
                      <Badge className="bg-emerald-600 text-white text-xs px-1.5 py-0.5 hidden sm:inline-flex">
                        PRO
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1 sm:gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(createPageUrl('AddRecipe'))}
                className="rounded-xl hover:bg-emerald-50 w-9 h-9 sm:w-10 sm:h-10"
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(createPageUrl('SavedRecipes'))}
                className="rounded-xl hover:bg-orange-50 w-9 h-9 sm:w-10 sm:h-10"
              >
                <Bookmark className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(createPageUrl('Profile'))}
                className="rounded-xl hover:bg-emerald-50 w-9 h-9 sm:w-10 sm:h-10"
              >
                <User className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Hero Section */}
        <div className="text-center mb-10 sm:mb-16 space-y-4 sm:space-y-6">
          <div className="inline-flex items-center gap-2 bg-white px-4 sm:px-6 py-2 sm:py-3 rounded-full shadow-sm border border-emerald-100">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
            <span className="text-sm sm:text-base text-gray-700 font-medium">Welcome, {user?.full_name || 'Chef'}!</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight px-2">
            What ingredients do you
            <br />
            <span className="bg-gradient-to-r from-emerald-600 to-orange-500 bg-clip-text text-transparent">
              have today?
            </span>
          </h2>

          <p className="text-base sm:text-xl text-gray-600 max-w-2xl mx-auto px-4">
            Tell us what's in your kitchen, and we'll find the perfect recipes for you
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
            <Button
              onClick={() => setShowIngredientSelector(true)}
              className="bg-gradient-to-r from-emerald-600 to-orange-600 hover:from-emerald-700 hover:to-orange-700 text-white px-8 sm:px-12 py-6 sm:py-8 text-lg sm:text-xl rounded-3xl shadow-xl hover:shadow-2xl transition-all hover:scale-105 w-full sm:w-auto"
            >
              <ChefHat className="w-5 h-5 sm:w-7 sm:h-7 mr-2 sm:mr-3" />
              Quick Search
            </Button>
            <Button
              onClick={() => setShowAdvancedSearch(true)}
              variant="outline"
              className="border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50 px-8 sm:px-12 py-6 sm:py-8 text-lg sm:text-xl rounded-3xl shadow-xl hover:shadow-2xl transition-all hover:scale-105 w-full sm:w-auto"
            >
              <Filter className="w-5 h-5 sm:w-7 sm:h-7 mr-2 sm:mr-3" />
              Advanced Search
            </Button>
          </div>
        </div>

        {/* Popular Filters */}
        <div className="mb-10 sm:mb-16">
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Popular Categories</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {POPULAR_FILTERS.map((filter) => (
              <button
                key={filter.name}
                onClick={() => handleFilterClick(filter)}
                className="bg-white hover:bg-gradient-to-br hover:from-emerald-50 hover:to-orange-50 border-2 border-gray-200 hover:border-emerald-400 rounded-2xl p-4 sm:p-6 transition-all hover:scale-105 hover:shadow-lg group"
              >
                <div className="text-3xl sm:text-4xl mb-2 sm:mb-3 group-hover:scale-110 transition-transform">{filter.icon}</div>
                <p className="font-semibold text-sm sm:text-base text-gray-900">{filter.name}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Trending Recipes */}
        {trendingRecipes.length > 0 && (
          <div className="mb-10 sm:mb-16">
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900">🔥 Trending Recipes</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {trendingRecipes.map((recipe) => (
                <div
                  key={recipe.id}
                  onClick={() => navigate(createPageUrl('RecipeDetail') + `?id=${recipe.id}`)}
                  className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all cursor-pointer hover:scale-105 group relative"
                >
                  <div className="absolute top-3 right-3 bg-orange-500 text-white px-2 sm:px-3 py-1 rounded-full text-xs font-semibold z-10">
                    🔥 Trending
                  </div>
                  {recipe.image_url ? (
                    <img
                      src={recipe.image_url}
                      alt={recipe.name}
                      className="w-full h-44 sm:h-48 object-cover group-hover:scale-110 transition-transform"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-44 sm:h-48 bg-gradient-to-br from-emerald-400 to-orange-400 flex items-center justify-center">
                      <ChefHat className="w-16 h-16 text-white opacity-50" />
                    </div>
                  )}
                  <div className="p-4 sm:p-5">
                    <h4 className="font-bold text-base sm:text-lg text-gray-900 mb-2 line-clamp-2">{recipe.name}</h4>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      {recipe.cook_time && <span>⏱️ {recipe.cook_time} min</span>}
                      {recipe.difficulty && <span>• {recipe.difficulty}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Recipes */}
        {recentRecipes.length > 0 && (
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Recently Added</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {recentRecipes.map((recipe) => (
                <div
                  key={recipe.id}
                  onClick={() => navigate(createPageUrl('RecipeDetail') + `?id=${recipe.id}`)}
                  className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all cursor-pointer hover:scale-105 group"
                >
                  {recipe.image_url ? (
                    <img
                      src={recipe.image_url}
                      alt={recipe.name}
                      className="w-full h-44 sm:h-48 object-cover group-hover:scale-110 transition-transform"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-44 sm:h-48 bg-gradient-to-br from-emerald-400 to-orange-400 flex items-center justify-center">
                      <ChefHat className="w-16 h-16 text-white opacity-50" />
                    </div>
                  )}
                  <div className="p-4 sm:p-5">
                    <h4 className="font-bold text-base sm:text-lg text-gray-900 mb-2 line-clamp-2">{recipe.name}</h4>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      {recipe.cook_time && <span>⏱️ {recipe.cook_time} min</span>}
                      {recipe.difficulty && <span>• {recipe.difficulty}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Ingredient Selector Modal */}
      <IngredientSelector
        isOpen={showIngredientSelector}
        onClose={() => setShowIngredientSelector(false)}
        onSearch={handleIngredientSearch}
      />

      {/* Advanced Search Modal */}
      <AdvancedSearch
        isOpen={showAdvancedSearch}
        onClose={() => setShowAdvancedSearch(false)}
        onSearch={handleAdvancedSearch}
      />
    </div>
  );
}