
import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { VideoContainer } from '@/components/ui/video-container';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useEventContext } from '@/contexts/EventContext';
import { PollDisplay, CreatePollForm } from '@/components/event/PollComponent';
import { QAComponent } from '@/components/event/QAComponent';
import { BreakoutRoomComponent } from '@/components/event/BreakoutRooms';
import { Camera, Mic, MicOff, MonitorStop, PhoneOff, Users, Video, VideoOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { v4 as uuidv4 } from 'uuid';

const EventRoom = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const userName = queryParams.get('name');
  const roomId = queryParams.get('room');
  const isHost = location.pathname.includes('/host');
  
  const { 
    joinRoom, 
    createRoom, 
    leaveRoom, 
    participants, 
    currentUser, 
    activePoll,
    isRecording,
    toggleRecording
  } = useEventContext();
  
  // Local media state
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  
  // Refs for cleanup
  const localStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  
  // Initialize room and media on component mount
  useEffect(() => {
    // Check if user has a name, if not redirect to homepage
    if (!userName) {
      navigate('/');
      return;
    }
    
    // Initialize media
    initializeMedia();
    
    // Initialize room
    const userId = uuidv4();
    const user = {
      id: userId,
      name: userName,
      isHost
    };
    
    if (isHost) {
      const newRoomId = createRoom(user);
      console.log(`Created room: ${newRoomId}`);
    } else if (roomId) {
      joinRoom(roomId, user);
      console.log(`Joined room: ${roomId}`);
    } else {
      navigate('/');
    }
    
    // Cleanup on component unmount
    return () => {
      cleanupMedia();
      leaveRoom();
    };
  }, []);
  
  // Initialize user media (camera and microphone)
  const initializeMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      localStreamRef.current = stream;
      setLocalStream(stream);
      
      // Initialize mute state
      const audioTracks = stream.getAudioTracks();
      if (audioTracks.length > 0) {
        setIsMuted(!audioTracks[0].enabled);
      }
      
      // Initialize video state
      const videoTracks = stream.getVideoTracks();
      if (videoTracks.length > 0) {
        setIsVideoOff(!videoTracks[0].enabled);
      }
      
    } catch (error) {
      console.error('Error accessing media devices:', error);
      alert('Could not access camera or microphone. Please check your permissions.');
    }
  };
  
  // Clean up media streams when component unmounts
  const cleanupMedia = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
    
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(track => track.stop());
      screenStreamRef.current = null;
    }
  };
  
  // Toggle microphone mute
  const toggleMute = () => {
    if (!localStream) return;
    
    const audioTracks = localStream.getAudioTracks();
    if (audioTracks.length === 0) return;
    
    const isCurrentlyMuted = !audioTracks[0].enabled;
    audioTracks[0].enabled = isCurrentlyMuted;
    setIsMuted(!isCurrentlyMuted);
  };
  
  // Toggle camera on/off
  const toggleVideo = () => {
    if (!localStream) return;
    
    const videoTracks = localStream.getVideoTracks();
    if (videoTracks.length === 0) return;
    
    const isCurrentlyOff = !videoTracks[0].enabled;
    videoTracks[0].enabled = isCurrentlyOff;
    setIsVideoOff(!isCurrentlyOff);
  };
  
  // Toggle screen sharing
  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      // Stop screen sharing
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach(track => track.stop());
      }
      setScreenStream(null);
      screenStreamRef.current = null;
      setIsScreenSharing(false);
      return;
    }
    
    try {
      // Start screen sharing
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true
      });
      
      // Add handler for when user stops sharing via browser UI
      stream.getVideoTracks()[0].onended = () => {
        setScreenStream(null);
        screenStreamRef.current = null;
        setIsScreenSharing(false);
      };
      
      setScreenStream(stream);
      screenStreamRef.current = stream;
      setIsScreenSharing(true);
    } catch (error) {
      console.error('Error sharing screen:', error);
      alert('Could not share screen. Please check your permissions.');
    }
  };
  
  // Leave the meeting
  const handleLeave = () => {
    leaveRoom();
    cleanupMedia();
    navigate('/');
  };
  
  // Render participants grid
  const renderParticipants = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 p-3">
        {/* Local video */}
        <VideoContainer 
          stream={localStream} 
          isLocal={true}
          isMuted={isMuted}
          isVideoOff={isVideoOff}
          participant={currentUser || undefined}
        />
        
        {/* Screen share if active */}
        {isScreenSharing && screenStream && (
          <VideoContainer 
            stream={screenStream}
            size="lg"
            className="md:col-span-2 lg:col-span-3"
            participant={{ 
              id: "screen", 
              name: `${currentUser?.name || 'Your'} Screen`, 
              isHost: false 
            }}
          />
        )}
        
        {/* Remote participants */}
        {participants
          .filter(p => p.id !== currentUser?.id)
          .map(participant => (
            <VideoContainer 
              key={participant.id}
              participant={participant}
              // In a real app, we would get real streams for each participant
              // This is just for demonstration
              isVideoOff={participant.id === 'demo1' ? false : true}
              isMuted={participant.id === 'demo2' ? true : false}
            />
          ))
        }
      </div>
    );
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-white to-brand-gray-light/30">
      {/* Header with room info */}
      <header className="bg-white shadow-sm p-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-full bg-brand-purple text-white flex items-center justify-center">
            <Video className="h-4 w-4" />
          </div>
          <div>
            <h1 className="font-semibold">VirtualMeet</h1>
            <div className="text-xs text-gray-500 flex items-center gap-2">
              <span>Room: {roomId || 'New Room'}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {participants.length}
              </span>
              {isRecording && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                    Recording
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
        
        {/* Host controls */}
        {currentUser?.isHost && (
          <div className="flex items-center gap-2">
            <Button
              variant={isRecording ? "destructive" : "outline"}
              size="sm"
              onClick={toggleRecording}
              className="flex items-center gap-1"
            >
              <Camera className="h-4 w-4" />
              {isRecording ? 'Stop Recording' : 'Start Recording'}
            </Button>
          </div>
        )}
      </header>
      
      {/* Main content area */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Videos container - takes 2/3 of width on larger screens */}
        <div className="flex-1 overflow-auto">
          {renderParticipants()}
        </div>
        
        {/* Sidebar - takes 1/3 of width on larger screens */}
        <div className="w-full md:w-80 lg:w-96 bg-white border-l">
          <Tabs defaultValue="polls" className="h-full flex flex-col">
            <TabsList className="grid grid-cols-3 mb-0 rounded-none border-b">
              <TabsTrigger value="polls">Polls</TabsTrigger>
              <TabsTrigger value="qa">Q&A</TabsTrigger>
              <TabsTrigger value="rooms">Rooms</TabsTrigger>
            </TabsList>
            
            <TabsContent value="polls" className="flex-1 overflow-auto p-4">
              {currentUser?.isHost && (
                <CreatePollForm />
              )}
              
              {activePoll && (
                <div className="my-4">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Active Poll</h3>
                  <PollDisplay poll={activePoll} />
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="qa" className="flex-1 p-4 h-full">
              <QAComponent />
            </TabsContent>
            
            <TabsContent value="rooms" className="flex-1 p-4 h-full">
              <BreakoutRoomComponent />
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      {/* Bottom controls */}
      <footer className="bg-white border-t py-4">
        <div className="container mx-auto flex justify-center items-center space-x-4">
          <Button
            variant={isMuted ? "destructive" : "secondary"}
            size="icon"
            onClick={toggleMute}
          >
            {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </Button>
          
          <Button
            variant={isVideoOff ? "destructive" : "secondary"}
            size="icon"
            onClick={toggleVideo}
          >
            {isVideoOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
          </Button>
          
          <Button
            variant={isScreenSharing ? "destructive" : "secondary"}
            size="icon"
            onClick={toggleScreenShare}
          >
            <MonitorStop className="h-5 w-5" />
          </Button>
          
          <Button variant="destructive" onClick={handleLeave}>
            <PhoneOff className="h-5 w-5 mr-2" />
            Leave
          </Button>
        </div>
      </footer>
    </div>
  );
};

export default EventRoom;
