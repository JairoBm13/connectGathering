import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Button } from "./ui/button";
// import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { CommunityGrid } from "./CommunityGrid";
import EventFeed from "./EventFeed";
import CommunityDetail from "./CommunityDetail";
import { Users, Calendar } from "lucide-react";
import Communities from "./Communities";

// Mock data
const MOCK_COMMUNITIES = [
  {
    id: "1",
    name: "San Francisco Photography",
    description: "Capturing the beauty of SF through our lenses",
    interests: ["Photography", "Art"],
    memberCount: 234,
    location: "San Francisco, CA",
    events: [
      {
        id: "1",
        title: "Golden Gate Bridge Photo Walk",
        description: "Early morning photography session at the Golden Gate",
        date: "2024-10-15",
        time: "6:30 AM",
        location: "Golden Gate Bridge",
        votes: 12,
        proposedBy: "Alex Chen",
        status: "voting",
      },
    ],
  },
  {
    id: "2",
    name: "Bay Area Hikers",
    description: "Exploring trails and nature around the Bay Area",
    interests: ["Hiking", "Fitness"],
    memberCount: 456,
    location: "Bay Area, CA",
    events: [
      {
        id: "2",
        title: "Mount Tam Weekend Hike",
        description: "Challenging hike with beautiful views",
        date: "2024-10-20",
        time: "8:00 AM",
        location: "Mount Tamalpais",
        votes: 28,
        proposedBy: "Sarah Johnson",
        status: "confirmed",
      },
    ],
  },
];

const MOCK_FEED_EVENTS = [
  {
    id: "3",
    title: "Coffee Cupping Session",
    description: "Learn about different coffee origins and flavors",
    community: "SF Coffee Lovers",
    interests: ["Art", "Food"],
    date: "2024-10-18",
    votes: 15,
    location: "Mission District, SF",
  },
  {
    id: "4",
    title: "Indie Game Dev Meetup",
    description: "Show off your latest projects and get feedback",
    community: "Bay Area Game Devs",
    interests: ["Gaming", "Tech"],
    date: "2024-10-25",
    votes: 22,
    location: "SOMA, SF",
  },
];

function Dashboard({ user, setUser }) {
  const [selectedCommunity, setSelectedCommunity] = useState(null);

  if (selectedCommunity) {
    return (
      <CommunityDetail
        community={selectedCommunity}
        user={user}
        onBack={() => setSelectedCommunity(null)}
      />
    );
  }

  const addInterest = (interest) => {
    if (!user.interests.includes(interest)) {
      setUser((prev) => ({
        ...prev,
        interests: [...prev.interests, interest],
      }));
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1>Welcome, {user.name}</h1>
              <h2>Community Events</h2>
              <p className="text-muted-foreground">
                {user.location} • {user.interests.length} interests
              </p>
            </div>
            {/* <Button variant="outline" size="icon">
              <Settings className="h-4 w-4" />
            </Button> */}
          </div>
          <div className="flex gap-2">
            {user.interests.slice(0, 3).map((interest) => (
              <Badge key={interest} variant="secondary">
                {interest}
              </Badge>
            ))}
            {user.interests.length > 3 && (
              <Badge variant="outline">+{user.interests.length - 3}</Badge>
            )}
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <Tabs defaultValue="communities" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger
              value="communities"
              className="flex items-center gap-2"
            >
              <Users className="h-4 w-4" />
              My Communities
            </TabsTrigger>
            <TabsTrigger value="feed" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Discover Events
            </TabsTrigger>
          </TabsList>

          <TabsContent value="communities">
            <Communities
              communities={MOCK_COMMUNITIES.filter((community) =>
                community.interests.some((interest) =>
                  user.interests.includes(interest)
                )
              )}
              onCommunitySelect={setSelectedCommunity}
              userInterests={user.interests}
            />
          </TabsContent>

          <TabsContent value="feed">
            <EventFeed
              events={MOCK_FEED_EVENTS}
              userInterests={user.interests}
              onAddInterest={addInterest}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default Dashboard;
