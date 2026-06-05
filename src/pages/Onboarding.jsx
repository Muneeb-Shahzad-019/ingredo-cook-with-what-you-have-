import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChefHat, MapPin, Award } from 'lucide-react';

const COUNTRIES = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan",
  "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", 
  "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cambodia", "Cameroon", 
  "Canada", "Cape Verde", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo", "Costa Rica", 
  "Croatia", "Cuba", "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", 
  "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Gambia", 
  "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Honduras", 
  "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Jamaica", "Japan", "Jordan", 
  "Kazakhstan", "Kenya", "Kiribati", "North Korea", "South Korea", "Kosovo", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", 
  "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", "Malawi", "Malaysia", 
  "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", 
  "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", 
  "Nicaragua", "Niger", "Nigeria", "North Macedonia", "Norway", "Oman", "Pakistan", "Palau", "Palestine", "Panama", 
  "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia", "Rwanda", 
  "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", 
  "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", 
  "Somalia", "South Africa", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", 
  "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", 
  "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", 
  "Uzbekistan", "Vanuatu", "Vatican City", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"
];

export default function Onboarding() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const accountType = urlParams.get('type') || 'fresher';

  const [formData, setFormData] = useState({
    account_type: accountType,
    full_name: '',
    country: ''
  });
  const [loading, setLoading] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(true);

  useEffect(() => {
    // Detect country from location
    const detectCountry = async () => {
      try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        setFormData(prev => ({ ...prev, country: data.country_name || '' }));
      } catch (error) {
        console.error('Could not detect location');
      } finally {
        setDetectingLocation(false);
      }
    };
    detectCountry();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await base44.auth.updateMe(formData);
      navigate(createPageUrl('Home'));
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const isPro = accountType === 'professional';

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-orange-50 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 mb-4">
            {isPro ? (
              <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-3 rounded-2xl">
                <Award className="w-8 h-8 text-white" />
              </div>
            ) : (
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-3 rounded-2xl">
                <ChefHat className="w-8 h-8 text-white" />
              </div>
            )}
            <h1 className="text-4xl font-bold text-gray-900">Complete Your Profile</h1>
          </div>
          <p className="text-gray-600">Cook With What You Have</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-8 shadow-xl space-y-6">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="full_name" className="text-base font-medium">
              Please enter your name to personalize your cooking experience
            </Label>
            <Input
              id="full_name"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              placeholder="Enter your full name"
              className="h-12 text-base rounded-xl"
              required
            />
          </div>

          {/* Country Dropdown */}
          <div className="space-y-2">
            <Label htmlFor="country" className="flex items-center gap-2 text-base font-medium">
              <MapPin className="w-4 h-4 text-emerald-600" />
              Select Your Country
            </Label>
            <Select 
              value={formData.country} 
              onValueChange={(value) => setFormData({ ...formData, country: value })}
              disabled={detectingLocation}
            >
              <SelectTrigger className="h-12 text-base rounded-xl">
                <SelectValue placeholder={detectingLocation ? "Detecting your location..." : "Choose your country"} />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {COUNTRIES.map((country) => (
                  <SelectItem key={country} value={country}>
                    {country}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-gray-500">We'll suggest local recipes based on your location</p>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={loading || detectingLocation}
            className={`w-full py-6 text-lg rounded-2xl ${
              isPro
                ? 'bg-emerald-600 hover:bg-emerald-700'
                : 'bg-orange-600 hover:bg-orange-700'
            }`}
          >
            {loading ? 'Setting up...' : 'Start Cooking! 🍳'}
          </Button>
        </form>
      </div>
    </div>
  );
}