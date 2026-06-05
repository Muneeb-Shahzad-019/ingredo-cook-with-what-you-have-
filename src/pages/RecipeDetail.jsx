import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Clock, ChefHat, Users, Bookmark, Heart, ExternalLink } from 'lucide-react';
import AskChefAI from '../components/recipe/AskChefAI';

export default function RecipeDetail() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const recipeId = urlParams.get('id');

  const [recipe, setRecipe] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadRecipe();
  }, [recipeId]);

  const loadRecipe = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);

      const recipes = await base44.entities.Recipe.list();
      const foundRecipe = recipes.find(r => r.id === recipeId);
      setRecipe(foundRecipe);

      // Increment view count for trending
      if (foundRecipe) {
        await base44.entities.Recipe.update(recipeId, {
          views_count: (foundRecipe.views_count || 0) + 1
        });
      }

      // Check if saved
      const savedRecipes = await base44.entities.SavedRecipe.filter({ user_email: userData.email });
      setIsSaved(savedRecipes.some(sr => sr.recipe_id === recipeId));
    } catch (error) {
      console.error('Error loading recipe:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      if (isSaved) {
        const savedRecipes = await base44.entities.SavedRecipe.filter({
          user_email: user.email,
          recipe_id: recipeId
        });
        if (savedRecipes[0]) {
          await base44.entities.SavedRecipe.delete(savedRecipes[0].id);
        }
        setIsSaved(false);
      } else {
        await base44.entities.SavedRecipe.create({
          user_email: user.email,
          recipe_id: recipeId
        });
        setIsSaved(true);
      }
    } catch (error) {
      console.error('Error saving recipe:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-orange-50 flex items-center justify-center">
        <p className="text-lg text-gray-600">Loading recipe...</p>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Recipe not found</h2>
          <Button onClick={() => navigate(createPageUrl('Home'))}>Go Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-orange-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-3">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="gap-2 flex-shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back</span>
            </Button>
            <Button
              onClick={handleSave}
              variant={isSaved ? "default" : "outline"}
              className={`${isSaved ? "bg-emerald-600 hover:bg-emerald-700" : ""} text-sm sm:text-base`}
            >
              <Bookmark className={`w-4 h-4 mr-1 sm:mr-2 ${isSaved ? 'fill-current' : ''}`} />
              {isSaved ? 'Saved' : 'Save Recipe'}
            </Button>
          </div>
        </div>
      </div>

      {/* Recipe Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Hero Image */}
        {recipe.image_url ? (
          <img
            src={recipe.image_url}
            alt={recipe.name}
            className="w-full h-56 sm:h-72 md:h-96 object-cover rounded-2xl sm:rounded-3xl shadow-2xl mb-6 sm:mb-8"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-56 sm:h-72 md:h-96 bg-gradient-to-br from-emerald-400 to-orange-400 rounded-2xl sm:rounded-3xl flex items-center justify-center mb-6 sm:mb-8">
            <ChefHat className="w-20 sm:w-32 h-20 sm:h-32 text-white opacity-50" />
          </div>
        )}

        {/* Recipe Header */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-xl mb-5 sm:mb-6">
          <div className="flex items-start justify-between mb-4 gap-3">
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">{recipe.name}</h1>
              <p className="text-base sm:text-xl text-gray-600">{recipe.cuisine}</p>
            </div>
            {recipe.source === 'ai' && (
              <Badge className="bg-purple-100 text-purple-800">AI Generated</Badge>
            )}
          </div>

          {/* Meta Info */}
          <div className="flex flex-wrap gap-6 mb-6">
            {recipe.cook_time && (
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-emerald-600" />
                <span className="text-gray-700">{recipe.cook_time} minutes</span>
              </div>
            )}
            {recipe.servings && (
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-orange-600" />
                <span className="text-gray-700">{recipe.servings} servings</span>
              </div>
            )}
            {recipe.difficulty && (
              <div className="flex items-center gap-2">
                <ChefHat className="w-5 h-5 text-emerald-600" />
                <span className="text-gray-700 capitalize">{recipe.difficulty}</span>
              </div>
            )}
          </div>

          {/* Categories */}
          {recipe.categories && recipe.categories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {recipe.categories.map((cat, i) => (
                <Badge
                  key={i}
                  className="bg-emerald-100 text-emerald-800 border border-emerald-300 px-3 py-1"
                >
                  {cat}
                </Badge>
              ))}
            </div>
          )}

          {/* Dietary Restrictions */}
          {recipe.dietary_restrictions && recipe.dietary_restrictions.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {recipe.dietary_restrictions.map((restriction, i) => (
                <Badge
                  key={i}
                  className="bg-purple-100 text-purple-800 border border-purple-300 px-3 py-1"
                >
                  ✓ {restriction}
                </Badge>
              ))}
            </div>
          )}

          {/* Video Link */}
          {recipe.video_url && (
            <a
              href={recipe.video_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-4 text-emerald-600 hover:text-emerald-700 font-medium"
            >
              <ExternalLink className="w-4 h-4" />
              Watch Video Tutorial
            </a>
          )}
        </div>

        {/* Ingredients */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-xl mb-5 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
              <span className="text-emerald-600">🥘</span>
            </div>
            Ingredients
          </h2>
          <ul className="space-y-3">
            {recipe.ingredients?.map((ingredient, i) => (
              <li key={i} className="flex items-start gap-3 text-gray-700">
                <div className="w-2 h-2 bg-emerald-600 rounded-full mt-2 flex-shrink-0" />
                <span className="text-lg">{ingredient}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Instructions */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-xl mb-5 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
              <span className="text-orange-600">👨‍🍳</span>
            </div>
            Instructions
          </h2>
          <div className="prose prose-lg max-w-none">
            <div className="text-gray-700 whitespace-pre-line leading-relaxed">
              {recipe.instructions}
            </div>
          </div>
        </div>

        {/* Nutrition Info */}
        {recipe.nutrition && (
          <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-xl">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Nutrition Information</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              {recipe.nutrition.calories && (
                <div className="bg-emerald-50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-emerald-600">{recipe.nutrition.calories}</p>
                  <p className="text-sm text-gray-600">Calories</p>
                </div>
              )}
              {recipe.nutrition.protein && (
                <div className="bg-orange-50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-orange-600">{recipe.nutrition.protein}</p>
                  <p className="text-sm text-gray-600">Protein</p>
                </div>
              )}
              {recipe.nutrition.carbs && (
                <div className="bg-emerald-50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-emerald-600">{recipe.nutrition.carbs}</p>
                  <p className="text-sm text-gray-600">Carbs</p>
                </div>
              )}
              {recipe.nutrition.fat && (
                <div className="bg-orange-50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-orange-600">{recipe.nutrition.fat}</p>
                  <p className="text-sm text-gray-600">Fat</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    {/* Ask Chef AI */}
    <AskChefAI recipe={recipe} user={user} />
    </div>
    );
    }