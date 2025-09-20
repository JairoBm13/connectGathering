import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { MapPin, Calendar, Clock } from 'lucide-react';

function EventMap({ events }) {
  // This is a simplified map visualization
  // In a real app, you'd integrate with Google Maps, Mapbox, etc.
  
  const confirmedEvents = events.filter(e => e.status === 'confirmed');
  const votingEvents = events.filter(e => e.status === 'voting');

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="p-6 h-96">
            <div className="flex items-center justify-center h-full bg-muted rounded-lg">
              <div className="text-center space-y-2">
                <MapPin className="h-12 w-12 text-muted-foreground mx-auto" />
                <div>
                  <h3>Interactive Map</h3>
                  <p className="text-muted-foreground text-sm">
                    Map integration would show event locations here
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
        
        <div className="space-y-4">
          <div>
            <h3>Events on Map</h3>
            <p className="text-muted-foreground text-sm">
              Locations of upcoming community events
            </p>
          </div>
          
          <div className="space-y-3">
            {confirmedEvents.map((event) => (
              <Card key={event.id} className="p-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium">{event.title}</h4>
                    <Badge variant="default" className="text-xs">
                      Confirmed
                    </Badge>
                  </div>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {event.location}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {event.date}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {event.time}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
            
            {votingEvents.map((event) => (
              <Card key={event.id} className="p-4 border-dashed">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium">{event.title}</h4>
                    <Badge variant="outline" className="text-xs">
                      Location TBD
                    </Badge>
                  </div>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {event.location} (proposed)
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {event.date}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
            
            {events.length === 0 && (
              <div className="text-center py-8">
                <MapPin className="h-8 w-8 text-muted-foreground mx-auto" />
                <p className="text-sm text-muted-foreground mt-2">
                  No events to display on map
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default EventMap