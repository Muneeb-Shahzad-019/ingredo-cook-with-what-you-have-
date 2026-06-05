import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ChefHat, Clock, Sparkles, RefreshCw } from 'lucide-react';
import FilterBar from '../components/home/FilterBar';

export default function RecipeResults() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const ingredientsParam = urlParams.get('ingredients');
  const filterParam = urlParams.get('filter');
  const includeSpices = urlParams.get('spices') === 'true';
  const dietaryParam = urlParams.get('dietary');
  const cuisineParam = urlParams.get('cuisine');
  const maxTimeParam = urlParams.get('maxTime');

  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [activeFilters, setActiveFilters] = useState(filterParam ? [filterParam] : []);
  const [generatingAI, setGeneratingAI] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);

      if (ingredientsParam) {
        // Search by ingredients using AI
        await generateRecipesWithAI();
      } else if (filterParam) {
        // Search by filter
        await searchByFilter(filterParam);
      }
    } catch (error) {
      console.error('Error loading recipes:', error);
      setLoading(false);
    }
  };

  const generateRecipesWithAI = async () => {
    setGeneratingAI(true);
    setLoading(true);

    try {
      const ingredients = ingredientsParam.split(',');
      const userCountry = user?.country || 'Global';

      const dietaryRestrictions = dietaryParam ? dietaryParam.split(',') : [];
      const cuisineFilter = cuisineParam || '';

      const prompt = `You are a professional chef assistant. Generate 6 diverse recipes that can be made ONLY using these ingredients: ${ingredients.join(', ')}. ${includeSpices ? 'Assume common spices (salt, pepper, oil) are available.' : 'Do NOT assume any spices are available unless listed.'}

      User is from: ${userCountry}. Prioritize recipes popular in this region, but also include international options.

      ${dietaryRestrictions.length > 0 ? `IMPORTANT: All recipes MUST meet these dietary restrictions: ${dietaryRestrictions.join(', ')}` : ''}
      ${cuisineFilter ? `IMPORTANT: All recipes MUST be ${cuisineFilter} cuisine.` : ''}
      ${maxTimeParam ? `IMPORTANT: Cooking time must be ${maxTimeParam} minutes or less.` : ''}

      For each recipe, provide:
      1. Recipe name
      2. Cuisine type ${cuisineFilter ? `(must be ${cuisineFilter})` : ''}
      3. Ingredients list (only from provided ingredients)
      4. Step-by-step instructions (clear and simple)
      5. Cooking time in minutes ${maxTimeParam ? `(maximum ${maxTimeParam} minutes)` : ''}
      6. Difficulty level (beginner/intermediate/advanced)
      7. Categories (select from: Asian, Continental, Italian, Pakistani, Indian, Vegan, Vegetarian, Non-Veg, Desserts, Breakfast, Soup, High-Protein, Keto, Kid-Friendly, Quick)
      8. Dietary restrictions that apply (from: Gluten-Free, Dairy-Free, Nut-Free, Egg-Free, Soy-Free, Low-Carb, Sugar-Free)
      9. A short appetizing description (1-2 sentences) of what the dish looks and tastes like.

      Return as JSON array.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            recipes: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  cuisine: { type: "string" },
                  ingredients: { type: "array", items: { type: "string" } },
                  instructions: { type: "string" },
                  cook_time: { type: "number" },
                  difficulty: { type: "string" },
                  categories: { type: "array", items: { type: "string" } },
                  dietary_restrictions: { type: "array", items: { type: "string" } },
                  country: { type: "string" },
                  image_url: { type: "string" },
                  description: { type: "string" }
                }
              }
            }
          }
        }
      });

      const aiRecipes = response.recipes || [];
      
      // Curated real Unsplash food photo IDs that are confirmed to work
      const FOOD_PHOTO_IDS = [
        'photo-1546069901-ba9599a7e63c', 'photo-1565299624946-b28f40a0ae38',
        'photo-1567620905732-2d1ec7ab7445', 'photo-1540189549336-e6e99c3679fe',
        'photo-1565958011703-44f9829ba187', 'photo-1482049016688-2d3e1b311543',
        'photo-1484723091739-30a097e8f929', 'photo-1473093295043-cdd812d0e601',
        'photo-1529042410759-befb1204b468', 'photo-1504674900247-0877df9cc836',
        'photo-1512621776951-a57141f2eefd', 'photo-1563379091339-03246963d31e',
      ];

      // Save AI recipes to database with reliable Unsplash food images
      const savedRecipes = await Promise.all(
        aiRecipes.map((recipe, index) => {
          const photoId = FOOD_PHOTO_IDS[index % FOOD_PHOTO_IDS.length];
          const imageUrl = `https://images.unsplash.com/${photoId}?w=800&h=600&fit=crop&auto=format`;
          return base44.entities.Recipe.create({
            ...recipe,
            source: 'ai',
            image_url: imageUrl
          });
        })
      );

      setRecipes(savedRecipes);
    } catch (error) {
      console.error('Error generating recipes:', error);
    } finally {
      setLoading(false);
      setGeneratingAI(false);
    }
  };

  const searchByFilter = async (filter) => {
    setLoading(true);
    try {
      const allRecipes = await base44.entities.Recipe.list('-created_date', 50);
      const filtered = allRecipes.filter(recipe =>
        recipe.categories?.includes(filter)
      );
      setRecipes(filtered);
    } catch (error) {
      console.error('Error searching recipes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filters) => {
    setActiveFilters(filters);
    if (filters.length > 0) {
      const allRecipes = recipes;
      const filtered = allRecipes.filter(recipe =>
        filters.some(filter => recipe.categories?.includes(filter))
      );
      setRecipes(filtered);
    }
  };

  const handleRegenerate = () => {
    generateRecipesWithAI();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-orange-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-3">
            <Button
              variant="ghost"
              onClick={() => navigate(createPageUrl('Home'))}
              className="gap-2 flex-shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back</span>
            </Button>
            {ingredientsParam && (
              <Button
                onClick={handleRegenerate}
                disabled={generatingAI}
                className="bg-gradient-to-r from-emerald-600 to-orange-600 hover:from-emerald-700 hover:to-orange-700 text-sm sm:text-base"
              >
                <RefreshCw className={`w-4 h-4 mr-1 sm:mr-2 ${generatingAI ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Regenerate Recipes</span>
                <span className="sm:hidden">Regenerate</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Search Info */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
            {ingredientsParam ? 'AI Generated Recipes' : `${filterParam} Recipes`}
          </h1>
          {ingredientsParam && (
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-gray-600">Using ingredients:</span>
              {ingredientsParam.split(',').map((ing, i) => (
                <Badge key={i} className="bg-emerald-100 text-emerald-800 border border-emerald-300">
                  {ing}
                </Badge>
              ))}
              {includeSpices && (
                <Badge className="bg-orange-100 text-orange-800 border border-orange-300">
                  + Common Spices
                </Badge>
              )}
              {dietaryParam && dietaryParam.split(',').map((dietary, i) => (
                <Badge key={i} className="bg-purple-100 text-purple-800 border border-purple-300">
                  {dietary}
                </Badge>
              ))}
              {cuisineParam && (
                <Badge className="bg-blue-100 text-blue-800 border border-blue-300">
                  {cuisineParam} Cuisine
                </Badge>
              )}
              {maxTimeParam && (
                <Badge className="bg-pink-100 text-pink-800 border border-pink-300">
                  ≤ {maxTimeParam} min
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Filters */}
        <FilterBar onFilterChange={handleFilterChange} />

        {/* Loading State */}
        {loading && (
          <div className="text-center py-20">
            <div className="inline-flex items-center gap-3 bg-white px-8 py-4 rounded-2xl shadow-lg">
              <Sparkles className="w-6 h-6 text-emerald-600 animate-pulse" />
              <p className="text-lg font-medium text-gray-700">
                {generatingAI ? 'AI is cooking up something delicious...' : 'Loading recipes...'}
              </p>
            </div>
          </div>
        )}

        {/* Recipe Grid */}
        {!loading && recipes.length === 0 && (
          <div className="text-center py-20">
            <ChefHat className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No recipes found</h3>
            <p className="text-gray-600 mb-6">Try different ingredients or filters</p>
            <Button
              onClick={() => navigate(createPageUrl('Home'))}
              className="bg-gradient-to-r from-emerald-600 to-orange-600 hover:from-emerald-700 hover:to-orange-700"
            >
              Go Back
            </Button>
          </div>
        )}

        {!loading && recipes.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {recipes.map((recipe) => (
              <div
                key={recipe.id}
                onClick={() => navigate(createPageUrl('RecipeDetail') + `?id=${recipe.id}`)}
                className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all cursor-pointer hover:scale-105 group"
              >
                {recipe.image_url ? (
                  <img
                    src={recipe.image_url}
                    alt={recipe.name}
                    className="w-full h-48 sm:h-56 object-cover group-hover:scale-110 transition-transform"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-48 sm:h-56 bg-gradient-to-br from-emerald-400 to-orange-400 flex items-center justify-center">
                    <ChefHat className="w-20 h-20 text-white opacity-50" />
                  </div>
                )}
                <div className="p-4 sm:p-6">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-lg sm:text-xl text-gray-900 leading-snug">{recipe.name}</h3>
                    {recipe.source === 'ai' && (
                      <Badge className="bg-purple-100 text-purple-800 text-xs flex-shrink-0 ml-2">AI</Badge>
                    )}
                  </div>

                  {recipe.description && (
                    <p className="text-sm text-gray-500 italic mb-2 line-clamp-2">{recipe.description}</p>
                  )}
                  
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
                    <div className="flex flex-wrap gap-1.5">
                      {recipe.categories.slice(0, 3).map((cat, i) => (
                        <Badge
                          key={i}
                          variant="secondary"
                          className="text-xs bg-emerald-50 text-emerald-700"
                        >
                          {cat}
                        </Badge>
                      ))}
                      {recipe.categories.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{recipe.categories.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}