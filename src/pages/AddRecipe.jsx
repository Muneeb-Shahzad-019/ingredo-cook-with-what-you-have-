import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Upload, Plus, X, Award } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

const CATEGORIES = [
  'Halal', 'Asian', 'Continental', 'Italian', 'Pakistani', 'Indian',
  'Vegan', 'Vegetarian', 'Non-Veg', 'Desserts', 'Breakfast', 'Soup',
  'High-Protein', 'Keto', 'Kid-Friendly', 'Quick'
];

export default function AddRecipe() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    cuisine: '',
    ingredients: [''],
    instructions: '',
    cook_time: '',
    prep_time: '',
    servings: '',
    difficulty: 'beginner',
    categories: [],
    country: '',
    image_url: '',
    video_url: '',
    nutrition: { calories: '', protein: '', carbs: '', fat: '' }
  });

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);
      setFormData(prev => ({ ...prev, country: userData.country || '' }));
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData({ ...formData, image_url: file_url });
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setUploadingImage(false);
    }
  };

  const addIngredient = () => {
    setFormData({ ...formData, ingredients: [...formData.ingredients, ''] });
  };

  const updateIngredient = (index, value) => {
    const newIngredients = [...formData.ingredients];
    newIngredients[index] = value;
    setFormData({ ...formData, ingredients: newIngredients });
  };

  const removeIngredient = (index) => {
    setFormData({
      ...formData,
      ingredients: formData.ingredients.filter((_, i) => i !== index)
    });
  };

  const toggleCategory = (category) => {
    const newCategories = formData.categories.includes(category)
      ? formData.categories.filter(c => c !== category)
      : [...formData.categories, category];
    setFormData({ ...formData, categories: newCategories });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const recipeData = {
        ...formData,
        ingredients: formData.ingredients.filter(i => i.trim() !== ''),
        cook_time: formData.cook_time ? parseInt(formData.cook_time) : null,
        prep_time: formData.prep_time ? parseInt(formData.prep_time) : null,
        servings: formData.servings ? parseInt(formData.servings) : null,
        source: 'user',
        nutrition: {
          calories: formData.nutrition.calories ? parseInt(formData.nutrition.calories) : null,
          protein: formData.nutrition.protein || null,
          carbs: formData.nutrition.carbs || null,
          fat: formData.nutrition.fat || null
        }
      };

      const newRecipe = await base44.entities.Recipe.create(recipeData);
      navigate(createPageUrl('RecipeDetail') + `?id=${newRecipe.id}`);
    } catch (error) {
      console.error('Error creating recipe:', error);
    } finally {
      setLoading(false);
    }
  };

  const isPro = user?.account_type === 'professional';

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-orange-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate(createPageUrl('Home'))}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back</span>
            </Button>
            {isPro && (
              <div className="flex items-center gap-2 bg-emerald-50 px-3 sm:px-4 py-2 rounded-full">
                <Award className="w-4 h-4 text-emerald-600" />
                <span className="text-xs sm:text-sm font-medium text-emerald-900">Professional Recipe</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="text-center mb-8 sm:mb-10">
          <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-2">Share Your Recipe</h1>
          <p className="text-gray-600">Help others cook amazing meals</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-xl space-y-6 sm:space-y-8">
          {/* Basic Info */}
          <div className="space-y-6">
            <div>
              <Label htmlFor="name" className="text-base font-semibold">Recipe Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Spicy Chicken Curry"
                className="mt-2 h-12 text-base rounded-xl"
                required
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="cuisine" className="text-base font-semibold">Cuisine Type *</Label>
                <Input
                  id="cuisine"
                  value={formData.cuisine}
                  onChange={(e) => setFormData({ ...formData, cuisine: e.target.value })}
                  placeholder="e.g., Italian, Indian, Asian"
                  className="mt-2 h-12 rounded-xl"
                  required
                />
              </div>
              <div>
                <Label htmlFor="country" className="text-base font-semibold">Country</Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  placeholder="Country of origin"
                  className="mt-2 h-12 rounded-xl"
                />
              </div>
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <Label className="text-base font-semibold">Recipe Image</Label>
            <div className="mt-2">
              {formData.image_url ? (
                <div className="relative">
                  <img src={formData.image_url} alt="Recipe" className="w-full h-64 object-cover rounded-2xl" />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-4 right-4"
                    onClick={() => setFormData({ ...formData, image_url: '' })}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer hover:border-emerald-500 transition-colors">
                  <Upload className="w-12 h-12 text-gray-400 mb-2" />
                  <span className="text-gray-600">{uploadingImage ? 'Uploading...' : 'Click to upload image'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={uploadingImage}
                  />
                </label>
              )}
            </div>
          </div>

          {/* Ingredients */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <Label className="text-base font-semibold">Ingredients *</Label>
              <Button type="button" onClick={addIngredient} size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                <Plus className="w-4 h-4 mr-1" />
                Add
              </Button>
            </div>
            <div className="space-y-2">
              {formData.ingredients.map((ingredient, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={ingredient}
                    onChange={(e) => updateIngredient(index, e.target.value)}
                    placeholder="e.g., 2 cups rice"
                    className="h-11 rounded-xl"
                  />
                  {formData.ingredients.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeIngredient(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Instructions */}
          <div>
            <Label htmlFor="instructions" className="text-base font-semibold">Instructions *</Label>
            <Textarea
              id="instructions"
              value={formData.instructions}
              onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
              placeholder="Step-by-step cooking instructions..."
              className="mt-2 min-h-48 rounded-xl"
              required
            />
          </div>

          {/* Time & Difficulty */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <div>
              <Label htmlFor="prep_time" className="text-sm font-semibold">Prep Time (min)</Label>
              <Input
                id="prep_time"
                type="number"
                value={formData.prep_time}
                onChange={(e) => setFormData({ ...formData, prep_time: e.target.value })}
                className="mt-2 h-11 rounded-xl"
              />
            </div>
            <div>
              <Label htmlFor="cook_time" className="text-sm font-semibold">Cook Time (min)</Label>
              <Input
                id="cook_time"
                type="number"
                value={formData.cook_time}
                onChange={(e) => setFormData({ ...formData, cook_time: e.target.value })}
                className="mt-2 h-11 rounded-xl"
              />
            </div>
            <div>
              <Label htmlFor="servings" className="text-sm font-semibold">Servings</Label>
              <Input
                id="servings"
                type="number"
                value={formData.servings}
                onChange={(e) => setFormData({ ...formData, servings: e.target.value })}
                className="mt-2 h-11 rounded-xl"
              />
            </div>
            <div>
              <Label htmlFor="difficulty" className="text-sm font-semibold">Difficulty</Label>
              <Select value={formData.difficulty} onValueChange={(value) => setFormData({ ...formData, difficulty: value })}>
                <SelectTrigger className="mt-2 h-11 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Categories */}
          <div>
            <Label className="text-base font-semibold mb-3 block">Categories</Label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((category) => {
                const isSelected = formData.categories.includes(category);
                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => toggleCategory(category)}
                    className={`px-4 py-2 rounded-full border-2 transition-all text-sm font-medium ${
                      isSelected
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-emerald-500'
                    }`}
                  >
                    {category}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Pro Features */}
          {isPro && (
            <div className="border-t pt-8 space-y-6">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Award className="w-5 h-5 text-emerald-600" />
                Professional Details
              </h3>

              <div>
                <Label htmlFor="video_url" className="text-base font-semibold">Video Tutorial URL</Label>
                <Input
                  id="video_url"
                  value={formData.video_url}
                  onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                  placeholder="https://youtube.com/..."
                  className="mt-2 h-11 rounded-xl"
                />
              </div>

              <div>
                <Label className="text-base font-semibold mb-3 block">Nutrition Information</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                  <div>
                    <Label htmlFor="calories" className="text-sm">Calories</Label>
                    <Input
                      id="calories"
                      type="number"
                      value={formData.nutrition.calories}
                      onChange={(e) => setFormData({
                        ...formData,
                        nutrition: { ...formData.nutrition, calories: e.target.value }
                      })}
                      placeholder="250"
                      className="mt-1 h-10 rounded-xl"
                    />
                  </div>
                  <div>
                    <Label htmlFor="protein" className="text-sm">Protein</Label>
                    <Input
                      id="protein"
                      value={formData.nutrition.protein}
                      onChange={(e) => setFormData({
                        ...formData,
                        nutrition: { ...formData.nutrition, protein: e.target.value }
                      })}
                      placeholder="20g"
                      className="mt-1 h-10 rounded-xl"
                    />
                  </div>
                  <div>
                    <Label htmlFor="carbs" className="text-sm">Carbs</Label>
                    <Input
                      id="carbs"
                      value={formData.nutrition.carbs}
                      onChange={(e) => setFormData({
                        ...formData,
                        nutrition: { ...formData.nutrition, carbs: e.target.value }
                      })}
                      placeholder="30g"
                      className="mt-1 h-10 rounded-xl"
                    />
                  </div>
                  <div>
                    <Label htmlFor="fat" className="text-sm">Fat</Label>
                    <Input
                      id="fat"
                      value={formData.nutrition.fat}
                      onChange={(e) => setFormData({
                        ...formData,
                        nutrition: { ...formData.nutrition, fat: e.target.value }
                      })}
                      placeholder="10g"
                      className="mt-1 h-10 rounded-xl"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Submit */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-emerald-600 to-orange-600 hover:from-emerald-700 hover:to-orange-700 py-6 text-lg rounded-2xl"
          >
            {loading ? 'Publishing...' : 'Publish Recipe'}
          </Button>
        </form>
      </div>
    </div>
  );
}