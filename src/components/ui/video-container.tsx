
import React, { useRef, useEffect, useState } from 'react';
import { cn } from "@/lib/utils";
import { MicOff, VideoOff, Volume2, VolumeX } from "lucide-react";
import { Badge } from '@/components/ui/badge';
import { User } from '@/contexts/EventContext';

interface VideoContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  stream?: MediaStream | null;
  isLocal?: boolean;
  isSpeaking?: boolean;
  isMuted?: boolean;
  isVideoOff?: boolean;
  participant?: User;
  size?: 'sm' | 'md' | 'lg';
}

export function VideoContainer({
  className,
  stream,
  isLocal = false,
  isSpeaking = false,
  isMuted = false,
  isVideoOff = false,
  participant,
  size = 'md',
  ...props
}: VideoContainerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [volume, setVolume] = useState(50);
  const [isAudioMuted, setIsAudioMuted] = useState(isMuted);
  
  // Size classes
  const sizeClasses = {
    sm: "h-32 w-40",
    md: "h-48 w-64",
    lg: "h-96 w-full max-w-2xl"
  };
  
  useEffect(() => {
    const videoElement = videoRef.current;
    if (videoElement && stream) {
      videoElement.srcObject = stream;
      
      videoElement.onloadedmetadata = () => {
        videoElement.play().catch(err => {
          console.error("Error playing video:", err);
        });
      };
      
      // If this is the local video, mute it to prevent feedback
      if (isLocal) {
        videoElement.muted = true;
      } else {
        videoElement.muted = isAudioMuted;
        videoElement.volume = volume / 100;
      }
    }
    
    return () => {
      if (videoElement && videoElement.srcObject) {
        const tracks = (videoElement.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
        videoElement.srcObject = null;
      }
    };
  }, [stream, isLocal, isAudioMuted, volume]);
  
  // Handle volume change
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseInt(e.target.value);
    setVolume(newVolume);
    
    if (videoRef.current && !isLocal) {
      videoRef.current.volume = newVolume / 100;
    }
  };
  
  // Toggle audio mute
  const toggleMute = () => {
    setIsAudioMuted(!isAudioMuted);
    
    if (videoRef.current && !isLocal) {
      videoRef.current.muted = !isAudioMuted;
    }
  };
  
  // Get initials for avatar
  const getInitials = (name: string = "User") => {
    return name.split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div 
      className={cn(
        "relative rounded-lg overflow-hidden bg-brand-gray-dark border",
        isSpeaking ? "border-brand-teal animate-pulse-subtle" : "border-transparent",
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {/* Video or placeholder */}
      {stream && !isVideoOff ? (
        <video 
          ref={videoRef}
          className="h-full w-full object-cover"
          autoPlay
          playsInline
        />
      ) : (
        <div className="h-full w-full flex items-center justify-center bg-brand-purple-dark">
          <div className="h-16 w-16 rounded-full bg-brand-purple flex items-center justify-center text-white text-xl font-semibold">
            {participant ? getInitials(participant.name) : "Me"}
          </div>
        </div>
      )}
      
      {/* Status indicators */}
      <div className="absolute top-2 right-2 flex items-center space-x-1">
        {isLocal && (
          <Badge variant="outline" className="bg-brand-gray-dark/70 text-white text-xs">
            You
          </Badge>
        )}
        {isSpeaking && (
          <Badge className="bg-brand-teal animate-pulse-subtle text-xs">
            Speaking
          </Badge>
        )}
      </div>
      
      {/* Audio/Video status indicators */}
      <div className="absolute bottom-2 left-2 flex items-center space-x-1">
        {isMuted && (
          <div className="bg-destructive/90 rounded-full p-1">
            <MicOff className="h-3 w-3 text-white" />
          </div>
        )}
        {isVideoOff && (
          <div className="bg-destructive/90 rounded-full p-1">
            <VideoOff className="h-3 w-3 text-white" />
          </div>
        )}
      </div>
      
      {/* Name display */}
      <div className="absolute bottom-2 right-2">
        <Badge variant="outline" className="bg-gray-900/70 text-white text-xs">
          {participant?.name || (isLocal ? "You" : "User")}
        </Badge>
      </div>
      
      {/* Volume control */}
      {!isLocal && (
        <div className="absolute bottom-8 left-2 flex items-center space-x-1 p-1 rounded bg-black/50 opacity-0 hover:opacity-100 transition-opacity">
          <button onClick={toggleMute} className="text-white">
            {isAudioMuted ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
          </button>
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={handleVolumeChange}
            className="w-16 h-1"
          />
        </div>
      )}
    </div>
  );
}
