// import { useState } from "react";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Button } from "./ui/button";
// import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
// import { CommunityGrid } from "./CommunityGrid";
// import { EventFeed } from "./EventFeed";
// import { CommunityDetail } from "./CommunityDetail";
// import { Search, Users, Calendar } from "lucide-react";

function Dashboard({ user, setUser }) {
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
    </div>
  );
}

export default Dashboard;
