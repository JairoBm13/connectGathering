import { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import EventMap  from './EventMap';
import EventList  from './EventList';
import CreateEventDialog from './CreateEventDialog';
import CommunityChat  from './CommunityChat';
import { ArrowLeft, Users, MapPin, Plus, Calendar, Map, MessageCircle } from 'lucide-react';

function CommunityDetail({ community, user, onBack }) {
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [events, setEvents] = useState(community.events);

  const handleCreateEvent = (newEvent) => {
    const event = {
      ...newEvent,
      id: Date.now().toString(),
      proposedBy: 'You',
      votes: 1,
      status: 'voting'
    };
    setEvents(prev => [...prev, event]);
    setShowCreateEvent(false);
  };

  const handleVote = (eventId) => {
    setEvents(prev => prev.map(event => 
      event.id === eventId 
        ? { ...event, votes: event.votes + 1 }
        : event
    ));
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex-1">
              <h1>{community.name}</h1>
              <p className="text-muted-foreground">
                {community.description}
              </p>
            </div>
            <Button onClick={() => setShowCreateEvent(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Propose Event
            </Button>
          </div>
          
          <div className="mt-4 flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{community.memberCount} members</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{community.location}</span>
            </div>
            <div className="flex gap-2">
              {community.interests.map((interest) => (
                <Badge key={interest} variant="secondary">
                  {interest}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <Tabs defaultValue="events" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="events" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Events
            </TabsTrigger>
            <TabsTrigger value="map" className="flex items-center gap-2">
              <Map className="h-4 w-4" />
              Event Map
            </TabsTrigger>
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Chat
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="events">
            <EventList 
              events={events}
              onVote={handleVote}
              user={user}
            />
          </TabsContent>
          
          <TabsContent value="map">
            <EventMap events={events} />
          </TabsContent>
          
          <TabsContent value="chat">
            <CommunityChat 
              community={community}
              user={user}
            />
          </TabsContent>
        </Tabs>
      </div>

      <CreateEventDialog
        open={showCreateEvent}
        onOpenChange={setShowCreateEvent}
        onCreateEvent={handleCreateEvent}
      />
    </div>
  );
}

export default CommunityDetail