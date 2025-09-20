import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { MapPin } from "lucide-react";

function Onboarding({ onComplete }) {
  const [availableInterests, setAvailableInterests] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:8080/interests");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const jsonData = await response.json();
        setAvailableInterests(jsonData);
      } catch (error) {
        console.log(error);
      }
    };
    fetchData();
  }, []);

  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [interests, setInterests] = useState([]);

  const toggleInterest = (interest) => {
    setInterests((prev) =>
      prev.includes(interest.id)
        ? prev.filter((i) => i.id !== interest.id)
        : [...prev, interest]
    );
  };

  const handleComplete = async () => {
    try {
      const response = await fetch("http://localhost:8080/communities", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(interests),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const jsonData = await response.json();
      console.log(jsonData);
      // Optionally update state here if needed
    } catch (error) {
      console.log(error);
    }
    const userData = {
      name,
      location,
      "interests": interests.map(toMap => toMap.name),
      id: Date.now().toString(),
      joinedCommunities: [],
    };

    try {
      const response = await fetch("http://localhost:8080/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const jsonData = await response.json();
      console.log(jsonData);
      // Optionally update state here if needed
    } catch (error) {
      console.log(error);
    }

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
                {availableInterests.map((interest) => (
                  <Badge
                    key={interest.id}
                    variant={
                      interests.includes(interest.id) ? "default" : "outline"
                    }
                    className="cursor-pointer justify-center py-2"
                    onClick={() => toggleInterest(interest)}
                  >
                    {interest.name}
                  </Badge>
                ))}
              </div>

              {interests.length > 0 && (
                <div className="space-y-2">
                  <Label>Selected Interests:</Label>
                  <div className="flex flex-wrap gap-2">
                    {interests.map((interest) => (
                      <Badge key={interest.id} variant="secondary">
                        {interest.name}
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
