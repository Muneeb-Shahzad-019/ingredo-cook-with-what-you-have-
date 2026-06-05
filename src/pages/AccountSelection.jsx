import React from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Button } from '@/components/ui/button';
import { ChefHat, Utensils, Award, Heart } from 'lucide-react';

export default function AccountSelection() {
  const navigate = useNavigate();

  const handleSelection = (type) => {
    navigate(createPageUrl('Onboarding') + `?type=${type}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-orange-50 flex items-center justify-center p-6">
      <div className="max-w-5xl w-full">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 mb-4">
            <ChefHat className="w-10 h-10 text-emerald-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-orange-500 bg-clip-text text-transparent">
              Ingredo
            </h1>
          </div>
          <p className="text-xl text-gray-600 font-light">Cook With What You Have</p>
        </div>

        {/* Account Type Cards */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Professional Chef */}
          <div
            onClick={() => handleSelection('professional')}
            className="group bg-white rounded-3xl p-10 shadow-xl border-2 border-transparent hover:border-emerald-500 transition-all cursor-pointer hover:scale-105 hover:shadow-2xl"
          >
            <div className="text-center space-y-6">
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-emerald-500 blur-2xl opacity-20 group-hover:opacity-30 transition-opacity" />
                <div className="relative bg-gradient-to-br from-emerald-500 to-emerald-600 p-6 rounded-2xl">
                  <Award className="w-16 h-16 text-white" strokeWidth={1.5} />
                </div>
              </div>

              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Professional Chef</h2>
                <p className="text-gray-600 text-lg">Share your expertise with the world</p>
              </div>

              <div className="space-y-3 text-left">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 bg-emerald-600 rounded-full" />
                  </div>
                  <p className="text-gray-700">Upload and verify your recipes</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 bg-emerald-600 rounded-full" />
                  </div>
                  <p className="text-gray-700">Get PRO badge on your profile</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 bg-emerald-600 rounded-full" />
                  </div>
                  <p className="text-gray-700">Link your social media & portfolio</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 bg-emerald-600 rounded-full" />
                  </div>
                  <p className="text-gray-700">Advanced recipe features</p>
                </div>
              </div>

              <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-6 text-lg rounded-2xl">
                Continue as Professional
              </Button>
            </div>
          </div>

          {/* Fresher / Beginner */}
          <div
            onClick={() => handleSelection('fresher')}
            className="group bg-white rounded-3xl p-10 shadow-xl border-2 border-transparent hover:border-orange-500 transition-all cursor-pointer hover:scale-105 hover:shadow-2xl"
          >
            <div className="text-center space-y-6">
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-orange-500 blur-2xl opacity-20 group-hover:opacity-30 transition-opacity" />
                <div className="relative bg-gradient-to-br from-orange-500 to-orange-600 p-6 rounded-2xl">
                  <Heart className="w-16 h-16 text-white" strokeWidth={1.5} />
                </div>
              </div>

              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Fresher / Beginner</h2>
                <p className="text-gray-600 text-lg">Start your cooking adventure</p>
              </div>

              <div className="space-y-3 text-left">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 bg-orange-600 rounded-full" />
                  </div>
                  <p className="text-gray-700">Discover recipes with your ingredients</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 bg-orange-600 rounded-full" />
                  </div>
                  <p className="text-gray-700">Save your favorite recipes</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 bg-orange-600 rounded-full" />
                  </div>
                  <p className="text-gray-700">Share your homemade creations</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 bg-orange-600 rounded-full" />
                  </div>
                  <p className="text-gray-700">Learn from the community</p>
                </div>
              </div>

              <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white py-6 text-lg rounded-2xl">
                Continue as Beginner
              </Button>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <p className="text-center text-gray-500 mt-8">
          You can always upgrade your account later
        </p>
      </div>
    </div>
  );
}