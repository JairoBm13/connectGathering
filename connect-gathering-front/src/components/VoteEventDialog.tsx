// import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";

function VoteEventDialog({ open, onOpenChange, onVoteEvent, event }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    onVoteEvent(event);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Vote for this Event</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                console.log("no");
                onOpenChange(false);
              }}
              className="flex-1"
            >
              No
            </Button>
            <Button
              type="submit"
              className="flex-1"
              onClick={() => {
                console.log("no");
                onOpenChange(true);
              }}
            >
              Yes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default VoteEventDialog;
