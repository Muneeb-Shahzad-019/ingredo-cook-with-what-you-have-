import React from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Clock, Users, ChefHat, Award, Sparkles } from 'lucide-react';

export default function RecipeCard({ recipe }) {
  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'beginner': return 'bg-green-100 text-green-700';
      case 'intermediate': return 'bg-yellow-100 text-yellow-700';
      case 'advanced': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <Link to={`/RecipeDetail?id=${recipe.id}`}>
      <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all border-2 border-transparent hover:border-emerald-500 group">
        {/* Image */}
        <div className="relative h-48 bg-gradient-to-br from-emerald-100 to-orange-100 overflow-hidden">
          {recipe.image_url ? (
            <img
              src={recipe.image_url}
              alt={recipe.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ChefHat className="w-16 h-16 text-gray-300" />
            </div>
          )}
          
          {/* Source Badge */}
          {recipe.source === 'ai' && (
            <Badge className="absolute top-3 right-3 bg-purple-600 text-white">
              <Sparkles className="w-3 h-3 mr-1" />
              AI
            </Badge>
          )}
          
          {recipe.source === 'user' && recipe.created_by && (
            <Badge className="absolute top-3 right-3 bg-emerald-600 text-white">
              <Award className="w-3 h-3 mr-1" />
              Community
            </Badge>
          )}
        </div>

        {/* Content */}
        <div className="p-5 space-y-3">
          <h3 className="text-xl font-bold text-gray-900 line-clamp-2 group-hover:text-emerald-600 transition-colors">
            {recipe.name}
          </h3>

          {recipe.cuisine && (
            <p className="text-sm text-gray-600">
              {recipe.cuisine} • {recipe.country || 'International'}
            </p>
          )}

          {/* Categories */}
          {recipe.categories && recipe.categories.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {recipe.categories.slice(0, 3).map((cat, idx) => (
                <Badge
                  key={idx}
                  variant="secondary"
                  className="text-xs bg-gray-100 text-gray-700"
                >
                  {cat}
                </Badge>
              ))}
            </div>
          )}

          {/* Meta Info */}
          <div className="flex items-center gap-4 text-sm text-gray-600 pt-2 border-t">
            {recipe.cook_time && (
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                <span>{recipe.cook_time}m</span>
              </div>
            )}
            {recipe.servings && (
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4" />
                <span>{recipe.servings}</span>
              </div>
            )}
            {recipe.difficulty && (
              <Badge className={`${getDifficultyColor(recipe.difficulty)} text-xs`}>
                {recipe.difficulty}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}