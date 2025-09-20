import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Calendar, MapPin, Heart, Plus } from 'lucide-react';

function EventFeed({ events, userInterests, onAddInterest }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2>Discover Events from Other Communities</h2>
          <p className="text-muted-foreground">
            Find interesting events and expand your interests
          </p>
        </div>
      </div>
      
      <div className="space-y-4">
        {events.map((event) => (
          <Card key={event.id} className="p-6">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div>
                    <h3>{event.title}</h3>
                    <p className="text-muted-foreground">
                      {event.description}
                    </p>
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    From <span className="font-medium">{event.community}</span>
                  </div>
                </div>
                
                <Button variant="outline" size="icon">
                  <Heart className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {event.date}
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {event.location}
                </div>
                <div className="flex items-center gap-1">
                  <Heart className="h-4 w-4" />
                  {event.votes} interested
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-2">
                  {event.interests.map((interest) => (
                    <div key={interest} className="flex items-center gap-1">
                      <Badge
                        variant={userInterests.includes(interest) ? "default" : "outline"}
                      >
                        {interest}
                      </Badge>
                      {!userInterests.includes(interest) && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onAddInterest(interest)}
                          className="h-6 w-6 p-0"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                
                <Button variant="outline">
                  Show Interest
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
      
      {events.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 text-muted-foreground mx-auto" />
          <div className="mt-4">
            <h3>No events found</h3>
            <p className="text-muted-foreground">
              Check back later for new events from other communities
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default EventFeed