import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Users, MapPin, Calendar } from 'lucide-react';

function Communities({ communities, onCommunitySelect, userInterests }) {
  if (communities.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="space-y-4">
          <Users className="h-12 w-12 text-muted-foreground mx-auto" />
          <div>
            <h3>No communities found</h3>
            <p className="text-muted-foreground">
              Try adjusting your interests or location to find relevant communities
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {communities.map((community) => (
        <Card key={community.id} className="p-6 hover:shadow-lg transition-shadow">
          <div className="space-y-4">
            <div>
              <h3>{community.name}</h3>
              <p className="text-muted-foreground">
                {community.description}
              </p>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {community.memberCount} members
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {community.location}
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {community.interests.map((interest) => (
                <Badge
                  key={interest}
                  variant={userInterests.includes(interest) ? "default" : "secondary"}
                >
                  {interest}
                </Badge>
              ))}
            </div>
            
            {community.events.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4" />
                  <span>Upcoming Events</span>
                </div>
                <div className="space-y-1">
                  {community.events.slice(0, 2).map((event) => (
                    <div key={event.id} className="text-sm p-2 bg-muted rounded">
                      <div className="font-medium">{event.title}</div>
                      <div className="text-muted-foreground">
                        {event.date} • {event.votes} interested
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <Button 
              onClick={() => onCommunitySelect(community)}
              className="w-full"
            >
              View Community
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}

export default Communities