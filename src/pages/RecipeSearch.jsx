import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Clock, Users, ChefHat, Sparkles, Loader2 } from 'lucide-react';
import RecipeCard from '../components/recipes/RecipeCard';

export default function RecipeSearch() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  const urlParams = new URLSearchParams(window.location.search);
  const ingredientsParam = urlParams.get('ingredients');
  const filterParam = urlParams.get('filter');
  const countryParam = urlParams.get('country');
  const includeSpices = urlParams.get('spices') === 'true';

  useEffect(() => {
    loadUser();
    if (ingredientsParam) {
      searchRecipesByIngredients();
    } else if (filterParam) {
      searchByFilter();
    } else if (countryParam) {
      searchByCountry();
    }
  }, []);

  const loadUser = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  const searchRecipesByIngredients = async () => {
    setLoading(true);
    try {
      const ingredients = ingredientsParam.split(',');
      
      // First, check database for matching recipes
      const dbRecipes = await base44.entities.Recipe.list();
      const matchingRecipes = dbRecipes.filter(recipe => {
        const recipeIngredients = recipe.ingredients?.map(i => i.toLowerCase()) || [];
        return ingredients.every(ing => 
          recipeIngredients.some(ri => ri.includes(ing.toLowerCase()))
        );
      });

      // Generate AI recipes
      const aiRecipes = await generateAIRecipes(ingredients, user?.country);
      
      setRecipes([...matchingRecipes, ...aiRecipes]);
    } catch (error) {
      console.error('Error searching recipes:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateAIRecipes = async (ingredients, userCountry) => {
    try {
      const prompt = `Generate 3-5 recipes that use ONLY these ingredients: ${ingredients.join(', ')}.
${includeSpices ? 'You can also use common spices like salt, pepper, oil, etc.' : 'Do not use any spices except those listed.'}
${userCountry ? `Prioritize recipes from ${userCountry} or commonly cooked in that region.` : ''}

For each recipe, provide:
- Recipe name
- Cuisine type
- List of ingredients (only from the provided list)
- Step-by-step instructions
- Cooking time in minutes
- Difficulty level (beginner/intermediate/advanced)
- Number of servings
- Is it Halal? (true/false)

Return as a JSON array of recipe objects.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
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
                  servings: { type: "number" },
                  halal: { type: "boolean" },
                  categories: { type: "array", items: { type: "string" } }
                }
              }
            }
          }
        }
      });

      return response.recipes?.map(recipe => ({
        ...recipe,
        source: 'ai',
        country: userCountry || 'International',
        id: 'ai-' + Date.now() + Math.random()
      })) || [];
    } catch (error) {
      console.error('Error generating AI recipes:', error);
      return [];
    }
  };

  const searchByFilter = async () => {
    setLoading(true);
    try {
      const allRecipes = await base44.entities.Recipe.list();
      const filtered = allRecipes.filter(recipe =>
        recipe.categories?.includes(filterParam)
      );
      setRecipes(filtered);
    } catch (error) {
      console.error('Error filtering recipes:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchByCountry = async () => {
    setLoading(true);
    try {
      const allRecipes = await base44.entities.Recipe.list();
      const filtered = allRecipes.filter(recipe => recipe.country === countryParam);
      setRecipes(filtered);
    } catch (error) {
      console.error('Error searching by country:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50/50 via-white to-orange-50/50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4">
            <Link to="/Home">
              <Button variant="outline" className="rounded-xl">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Recipe Results</h1>
              {ingredientsParam && (
                <p className="text-gray-600 mt-1">
                  Using: {ingredientsParam.split(',').join(', ')}
                </p>
              )}
              {filterParam && (
                <p className="text-gray-600 mt-1">Category: {filterParam}</p>
              )}
              {countryParam && (
                <p className="text-gray-600 mt-1">Country: {countryParam}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-emerald-600 animate-spin mb-4" />
            <p className="text-xl text-gray-600">Finding perfect recipes for you...</p>
            <p className="text-sm text-gray-500 mt-2">Using AI to search the internet</p>
          </div>
        ) : recipes.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ChefHat className="w-10 h-10 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No recipes found</h2>
            <p className="text-gray-600 mb-6">Try different ingredients or filters</p>
            <Link to="/Home">
              <Button className="bg-emerald-600 hover:bg-emerald-700 rounded-xl">
                Back to Home
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-8">
              <p className="text-gray-600">
                Found <span className="font-bold text-gray-900">{recipes.length}</span> recipes
              </p>
              {recipes.some(r => r.source === 'ai') && (
                <Badge className="bg-purple-100 text-purple-700 border-purple-200">
                  <Sparkles className="w-3 h-3 mr-1" />
                  AI Generated
                </Badge>
              )}
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recipes.map((recipe) => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}