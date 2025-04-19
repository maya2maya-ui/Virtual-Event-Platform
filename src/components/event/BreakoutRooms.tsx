
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEventContext, BreakoutRoom } from '@/contexts/EventContext';
import { ArrowRight, Plus, Users } from 'lucide-react';

export function BreakoutRoomComponent() {
  const { 
    breakoutRooms, 
    createBreakoutRoom, 
    joinBreakoutRoom,
    leaveBreakoutRoom,
    currentBreakoutRoom,
    currentUser 
  } = useEventContext();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newRoomName, setNewRoomName] = useState("");
  
  const handleCreateRoom = () => {
    if (!newRoomName.trim()) return;
    createBreakoutRoom(newRoomName);
    setNewRoomName("");
    setIsDialogOpen(false);
  };
  
  return (
    <div className="space-y-4">
      {/* Current breakout room if joined */}
      {currentBreakoutRoom && (
        <Card className="border-brand-teal">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Users className="h-5 w-5 mr-2 text-brand-teal" />
              {currentBreakoutRoom.name}
            </CardTitle>
            <CardDescription>
              {currentBreakoutRoom.participants.length} participant{currentBreakoutRoom.participants.length !== 1 && 's'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm mb-2">Currently in this breakout room:</p>
            <div className="flex flex-wrap gap-2">
              {currentBreakoutRoom.participants.map(participant => (
                <div 
                  key={participant.id}
                  className="px-2 py-1 bg-brand-gray-light rounded-full text-xs flex items-center"
                >
                  <span className="w-2 h-2 rounded-full bg-green-500 mr-1"></span>
                  {participant.name}
                  {participant.id === currentBreakoutRoom.hostId && (
                    <span className="ml-1 text-brand-purple">(Host)</span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              variant="outline" 
              onClick={leaveBreakoutRoom}
              className="w-full"
            >
              Return to Main Room
            </Button>
          </CardFooter>
        </Card>
      )}
      
      {/* List of available breakout rooms */}
      {!currentBreakoutRoom && (
        <>
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Breakout Rooms</h3>
            {currentUser?.isHost && (
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
                onClick={() => setIsDialogOpen(true)}
              >
                <Plus className="h-4 w-4" />
                New Room
              </Button>
            )}
          </div>
          
          {breakoutRooms.length === 0 ? (
            <div className="text-center p-6 text-gray-500">
              {currentUser?.isHost 
                ? "Create breakout rooms for group discussions"
                : "No breakout rooms available yet"
              }
            </div>
          ) : (
            <div className="space-y-3">
              {breakoutRooms.map(room => (
                <BreakoutRoomCard
                  key={room.id}
                  room={room}
                  onJoin={() => joinBreakoutRoom(room.id)}
                />
              ))}
            </div>
          )}
        </>
      )}
      
      {/* Dialog for creating a new breakout room */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Breakout Room</DialogTitle>
            <DialogDescription>
              Create a new breakout room for small group discussions.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="room-name">Room Name</Label>
              <Input
                id="room-name"
                placeholder="Enter room name"
                value={newRoomName}
                onChange={(e) => setNewRoomName(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateRoom} disabled={!newRoomName.trim()}>
              Create Room
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface BreakoutRoomCardProps {
  room: BreakoutRoom;
  onJoin: () => void;
}

function BreakoutRoomCard({ room, onJoin }: BreakoutRoomCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-md">{room.name}</CardTitle>
        <CardDescription>
          {room.participants.length} participant{room.participants.length !== 1 && 's'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {room.participants.slice(0, 3).map(participant => (
            <div 
              key={participant.id}
              className="px-2 py-1 bg-brand-gray-light rounded-full text-xs"
            >
              {participant.name}
            </div>
          ))}
          {room.participants.length > 3 && (
            <div className="px-2 py-1 bg-brand-gray-light rounded-full text-xs">
              +{room.participants.length - 3} more
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={onJoin}
          variant="outline" 
          size="sm"
          className="w-full flex items-center justify-center gap-1"
        >
          Join Room
          <ArrowRight className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
