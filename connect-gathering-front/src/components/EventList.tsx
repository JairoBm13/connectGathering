import { useState } from "react";
import { Calendar } from "lucide-react";
import EventCard from "./EventCard";

function EventList({ events, user }) {
  const [showVoteEvent, setShowVoteEvent] = useState(false);


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
        <EventCard
          key={event.id}
          event={event}
          user={user}
        />
      ))}
    </div>
  );
}

export default EventList;
