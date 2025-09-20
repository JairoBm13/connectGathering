import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { MapPin } from "lucide-react";

import axios from "axios";

const POPULAR_INTERESTS = [
  "Photography",
  "Hiking",
  "Coffee",
  "Tech",
  "Art",
  "Music",
  "Food",
  "Gaming",
  "Fitness",
  "Books",
  "Travel",
  "Cooking",
  "Dancing",
  "Sports",
  "Movies",
  "Pets",
];

function Onboarding({ onComplete }) {
  const [availableInterests, setAvailableInterests] = useState([]);

  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       const response = await axios.get(
  //         "https://cd1bd1f2761e.ngrok-free.app/interests",
  //         {
  //           headers: {
  //             "ngrok-skip-browser-warning": "69420"
  //           },
  //         }

  //       );
  //       console.log(response);
  //       // Replace with your API endpoint
  //       // if (!response.ok) {
  //       //   throw new Error(`HTTP error! status: ${response.status}`);
  //       // }
  //       // const jsonData = await response.json();
  //       // console.log(jsonData);
  //       // console.log(jsonData)
  //       // setAvailableInterests(jsonData);
  //     } catch (error) {
  //       console.log(error);
  //     }
  //   };
  //   fetchData();
  // }, []);

  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [interests, setInterests] = useState([]);

  const toggleInterest = (interest) => {
    setInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  const handleComplete = () => {
    const userData = {
      name,
      location,
      interests,
      id: Date.now().toString(),
      joinedCommunities: [],
    };
    onComplete(userData);
  };
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl p-8">
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h1>Welcome! Let's get you started</h1>
              <p className="text-muted-foreground">
                Tell us your location to find local communities
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="location">What is your name?</Label>
                <div className="relative">
                  <Input
                    id="name"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Your Location</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="location"
                    placeholder="Enter your city, state or address"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <Button
                onClick={() => setStep(2)}
                disabled={!location.trim()}
                className="w-full"
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h1>What are you interested in?</h1>
              <p className="text-muted-foreground">
                Select your interests to find relevant communities
              </p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {POPULAR_INTERESTS.map((interest) => (
                  <Badge
                    key={interest}
                    variant={
                      interests.includes(interest) ? "default" : "outline"
                    }
                    className="cursor-pointer justify-center py-2"
                    onClick={() => toggleInterest(interest)}
                  >
                    {interest}
                  </Badge>
                ))}
              </div>

              {interests.length > 0 && (
                <div className="space-y-2">
                  <Label>Selected Interests:</Label>
                  <div className="flex flex-wrap gap-2">
                    {interests.map((interest) => (
                      <Badge key={interest} variant="secondary">
                        {interest}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button
                  onClick={handleComplete}
                  disabled={interests.length === 0}
                  className="flex-1"
                >
                  Get Started
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

export default Onboarding;
