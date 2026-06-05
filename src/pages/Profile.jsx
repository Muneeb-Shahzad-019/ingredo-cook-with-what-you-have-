import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Award, ChefHat, MapPin, LogOut, Edit2, Save } from 'lucide-react';

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [userRecipes, setUserRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    country: '',
    bio: '',
    social_links: { instagram: '', youtube: '', website: '' }
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);
      setFormData({
        country: userData.country || '',
        bio: userData.bio || '',
        social_links: userData.social_links || { instagram: '', youtube: '', website: '' }
      });

      const recipes = await base44.entities.Recipe.filter({ created_by: userData.email });
      setUserRecipes(recipes);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await base44.auth.updateMe(formData);
      setUser({ ...user, ...formData });
      setEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await base44.auth.logout();
  };

  const isPro = user?.account_type === 'professional';

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-orange-50 flex items-center justify-center">
        <p className="text-lg text-gray-600">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-orange-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate(createPageUrl('Home'))}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back</span>
            </Button>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="text-red-600 hover:bg-red-50 hover:text-red-700 text-sm sm:text-base"
            >
              <LogOut className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Logout</span>
              <span className="sm:hidden">Exit</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-xl mb-5 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-6 gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className={`${isPro ? 'bg-gradient-to-br from-emerald-500 to-emerald-600' : 'bg-gradient-to-br from-orange-500 to-orange-600'} p-4 sm:p-6 rounded-2xl flex-shrink-0`}>
                {isPro ? (
                  <Award className="w-8 h-8 sm:w-12 sm:h-12 text-white" />
                ) : (
                  <ChefHat className="w-8 h-8 sm:w-12 sm:h-12 text-white" />
                )}
              </div>
              <div className="min-w-0">
                <h1 className="text-xl sm:text-3xl font-bold text-gray-900 truncate">{user?.full_name}</h1>
                <p className="text-sm sm:text-base text-gray-600 truncate">{user?.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  {isPro && (
                    <Badge className="bg-emerald-600 text-white">PRO Chef</Badge>
                  )}
                  {!isPro && (
                    <Badge className="bg-orange-600 text-white">Beginner</Badge>
                  )}
                  {user?.country && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {user.country}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {!editing && (
              <Button onClick={() => setEditing(true)} variant="outline" className="self-start sm:self-auto">
                <Edit2 className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            )}
          </div>

          {/* Profile Form */}
          {editing ? (
            <div className="space-y-6 border-t pt-6">
              <div>
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="mt-2 h-11 rounded-xl"
                />
              </div>

              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="mt-2 min-h-24 rounded-xl"
                  placeholder="Tell us about yourself..."
                />
              </div>

              {isPro && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900">Social Links</h3>
                  <div>
                    <Label htmlFor="instagram" className="text-sm">Instagram</Label>
                    <Input
                      id="instagram"
                      value={formData.social_links.instagram}
                      onChange={(e) => setFormData({
                        ...formData,
                        social_links: { ...formData.social_links, instagram: e.target.value }
                      })}
                      className="mt-1 h-10 rounded-xl"
                      placeholder="@username"
                    />
                  </div>
                  <div>
                    <Label htmlFor="youtube" className="text-sm">YouTube</Label>
                    <Input
                      id="youtube"
                      value={formData.social_links.youtube}
                      onChange={(e) => setFormData({
                        ...formData,
                        social_links: { ...formData.social_links, youtube: e.target.value }
                      })}
                      className="mt-1 h-10 rounded-xl"
                      placeholder="Channel URL"
                    />
                  </div>
                  <div>
                    <Label htmlFor="website" className="text-sm">Website</Label>
                    <Input
                      id="website"
                      value={formData.social_links.website}
                      onChange={(e) => setFormData({
                        ...formData,
                        social_links: { ...formData.social_links, website: e.target.value }
                      })}
                      className="mt-1 h-10 rounded-xl"
                      placeholder="https://yourwebsite.com"
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button
                  onClick={() => setEditing(false)}
                  variant="outline"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="border-t pt-6 space-y-4">
              {user?.bio && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-600 mb-1">About</h3>
                  <p className="text-gray-700">{user.bio}</p>
                </div>
              )}

              {isPro && user?.social_links && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-600 mb-2">Social Media</h3>
                  <div className="flex gap-3">
                    {user.social_links.instagram && (
                      <a
                        href={`https://instagram.com/${user.social_links.instagram.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-600 hover:text-emerald-700"
                      >
                        Instagram
                      </a>
                    )}
                    {user.social_links.youtube && (
                      <a
                        href={user.social_links.youtube}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-600 hover:text-emerald-700"
                      >
                        YouTube
                      </a>
                    )}
                    {user.social_links.website && (
                      <a
                        href={user.social_links.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-600 hover:text-emerald-700"
                      >
                        Website
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* User Recipes */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-xl">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">My Recipes ({userRecipes.length})</h2>
          
          {userRecipes.length === 0 ? (
            <div className="text-center py-12">
              <ChefHat className="w-16 h-16 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600 mb-4">You haven't added any recipes yet</p>
              <Button
                onClick={() => navigate(createPageUrl('AddRecipe'))}
                className="bg-gradient-to-r from-emerald-600 to-orange-600 hover:from-emerald-700 hover:to-orange-700"
              >
                Add Your First Recipe
              </Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {userRecipes.map((recipe) => (
                <div
                  key={recipe.id}
                  onClick={() => navigate(createPageUrl('RecipeDetail') + `?id=${recipe.id}`)}
                  className="bg-gray-50 rounded-2xl p-4 cursor-pointer hover:bg-emerald-50 transition-colors"
                >
                  <h3 className="font-bold text-lg text-gray-900 mb-1">{recipe.name}</h3>
                  <p className="text-sm text-gray-600">{recipe.cuisine}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}