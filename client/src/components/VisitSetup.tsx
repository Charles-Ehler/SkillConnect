import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface VisitSetupProps {
  userName: string;
  restaurants: string[];
  onUserNameChange: (name: string) => void;
  onRestaurantsChange: (restaurants: string[]) => void;
  onGenerateVisits: () => void;
}

export function VisitSetup({ 
  userName, 
  restaurants, 
  onUserNameChange, 
  onRestaurantsChange,
  onGenerateVisits 
}: VisitSetupProps) {
  const [gardenSize, setGardenSize] = useState<number>(restaurants.length);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    // Update restaurants array when garden size changes
    if (gardenSize !== restaurants.length) {
      const newRestaurants = Array(gardenSize).fill('').map((_, i) => restaurants[i] || '');
      onRestaurantsChange(newRestaurants);
    }
  }, [gardenSize, restaurants, onRestaurantsChange]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!userName.trim()) {
      newErrors.userName = 'Name is required';
    }
    
    if (gardenSize < 1 || gardenSize > 20) {
      newErrors.gardenSize = 'Valid number required (1-20)';
    }
    
    restaurants.forEach((restaurant, index) => {
      if (!restaurant.trim()) {
        newErrors[`restaurant${index}`] = 'Restaurant name is required';
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleGardenSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const size = parseInt(e.target.value) || 0;
    setGardenSize(size);
  };

  const handleRestaurantChange = (index: number, value: string) => {
    const newRestaurants = [...restaurants];
    newRestaurants[index] = value;
    onRestaurantsChange(newRestaurants);
  };

  const handleGenerateVisits = () => {
    if (validateForm()) {
      onGenerateVisits();
    }
  };

  const isFormValid = userName.trim() && gardenSize >= 1 && gardenSize <= 20 && 
                     restaurants.every(r => r.trim());

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-cava-primary">Visit Setup</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="userName" className="text-sm font-bold text-gray-700">
            Your Name *
          </Label>
          <Input
            id="userName"
            value={userName}
            onChange={(e) => onUserNameChange(e.target.value)}
            placeholder="Enter your name"
            className="mt-1"
          />
          {errors.userName && (
            <Alert variant="destructive" className="mt-1">
              <AlertDescription className="text-cava-error text-sm">
                {errors.userName}
              </AlertDescription>
            </Alert>
          )}
        </div>

        <div>
          <Label htmlFor="gardenSize" className="text-sm font-bold text-gray-700">
            Number of restaurants in your garden *
          </Label>
          <Input
            id="gardenSize"
            type="number"
            min="1"
            max="20"
            value={gardenSize}
            onChange={handleGardenSizeChange}
            placeholder="Enter number (1-20)"
            className="mt-1"
          />
          {errors.gardenSize && (
            <Alert variant="destructive" className="mt-1">
              <AlertDescription className="text-cava-error text-sm">
                {errors.gardenSize}
              </AlertDescription>
            </Alert>
          )}
        </div>

        {gardenSize > 0 && gardenSize <= 20 && (
          <div className="space-y-2">
            {Array.from({ length: gardenSize }, (_, i) => (
              <div key={i}>
                <Label className="text-sm font-bold text-gray-700">
                  Restaurant {i + 1} Name *
                </Label>
                <Input
                  value={restaurants[i] || ''}
                  onChange={(e) => handleRestaurantChange(i, e.target.value)}
                  placeholder="Enter restaurant name"
                  className="mt-1"
                />
                {errors[`restaurant${i}`] && (
                  <Alert variant="destructive" className="mt-1">
                    <AlertDescription className="text-cava-error text-sm">
                      {errors[`restaurant${i}`]}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            ))}
          </div>
        )}

        <Button
          onClick={handleGenerateVisits}
          disabled={!isFormValid}
          className={`w-full cava-yellow text-black font-bold py-3 px-4 rounded-lg transition-all ${
            isFormValid ? 'hover:bg-yellow-300' : 'opacity-50 cursor-not-allowed'
          }`}
        >
          Generate Visits
        </Button>
      </CardContent>
    </Card>
  );
}
