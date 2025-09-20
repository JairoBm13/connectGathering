import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Heart, MapPin, Calendar, Clock, User } from "lucide-react";
import VoteEventDialog from "./VoteEventDialog";
import { useState } from "react";

function EventCard({ event, user }) {
  const [showVoteEvent, setShowVoteEvent] = useState(false);
  const [thisEvent, setEvent] = useState(event);
  const onVote = (data) => {
    // data.votes = data.votes + 1;
    setEvent(data);
    setShowVoteEvent(false);
    console.log("vote dones")
  };

  const handleVoteEvent = (eventId) => {
    console.log("handle")
  };
  return (
    <Card key={event.id} className="p-6">
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h3>{event.title}</h3>
              <Badge
                variant={event.status === "confirmed" ? "default" : "outline"}
              >
                {event.status === "confirmed" ? "Confirmed" : "Voting"}
              </Badge>
            </div>
            <p className="text-muted-foreground">{event.description}</p>
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
              onClick={() => handleVoteEvent(event.id)}
              className="flex items-center gap-2"
            >
              <VoteEventDialog
                open={showVoteEvent}
                onOpenChange={setShowVoteEvent}
                onVoteEvent={onVote}
                event={event}
              />
              <Heart className="h-4 w-4" />
              {event.votes} vote
            </Button>
            {event.status === "voting" && (
              <div className="text-sm text-muted-foreground">
                Help decide the final details by voting!
              </div>
            )}
          </div>

          {event.status === "confirmed" && <Button>Join Event</Button>}
        </div>

        {event.status === "voting" && (
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <div className="space-y-2">
              <div className="text-sm font-medium">Community Input Needed:</div>
              <div className="text-sm text-muted-foreground">
                This event is still being planned. Vote to show interest and
                help finalize the location and time!
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

export default EventCard;
