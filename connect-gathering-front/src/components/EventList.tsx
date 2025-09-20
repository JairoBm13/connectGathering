import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Heart, MapPin, Calendar, Clock, User } from 'lucide-react';

function EventList({ events, onVote, user }) {
  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="h-12 w-12 text-muted-foreground mx-auto" />
        <div className="mt-4">
          <h3>No events yet</h3>
          <p className="text-muted-foreground">
            Be the first to propose an event for this community
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {events.map((event) => (
        <Card key={event.id} className="p-6">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h3>{event.title}</h3>
                  <Badge variant={event.status === 'confirmed' ? 'default' : 'outline'}>
                    {event.status === 'confirmed' ? 'Confirmed' : 'Voting'}
                  </Badge>
                </div>
                <p className="text-muted-foreground">
                  {event.description}
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{event.date}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{event.time}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{event.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>by {event.proposedBy}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onVote(event.id)}
                  className="flex items-center gap-2"
                >
                  <Heart className="h-4 w-4" />
                  {event.votes} interested
                </Button>
                
                {event.status === 'voting' && (
                  <div className="text-sm text-muted-foreground">
                    Help decide the final details by voting!
                  </div>
                )}
              </div>
              
              {event.status === 'confirmed' && (
                <Button>
                  Join Event
                </Button>
              )}
            </div>
            
            {event.status === 'voting' && (
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <div className="space-y-2">
                  <div className="text-sm font-medium">Community Input Needed:</div>
                  <div className="text-sm text-muted-foreground">
                    This event is still being planned. Vote to show interest and help finalize the location and time!
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}

export default EventList