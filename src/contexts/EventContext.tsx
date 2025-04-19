
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getSocket } from "@/lib/socket";
import { v4 as uuidv4 } from "uuid";

// Define types
export interface User {
  id: string;
  name: string;
  isHost: boolean;
  avatar?: string;
}

export interface Message {
  id: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: number;
  isQuestion?: boolean;
}

export interface PollOption {
  id: string;
  text: string;
  votes: number;
}

export interface Poll {
  id: string;
  question: string;
  options: PollOption[];
  isActive: boolean;
  createdAt: number;
}

export interface BreakoutRoom {
  id: string;
  name: string;
  participants: User[];
  hostId?: string;
}

interface EventContextType {
  // User related
  currentUser: User | null;
  setCurrentUser: (user: User) => void;
  participants: User[];
  
  // Room related
  roomId: string | null;
  joinRoom: (roomId: string, user: User) => void;
  createRoom: (user: User) => string;
  leaveRoom: () => void;
  
  // Messages and Q&A
  messages: Message[];
  sendMessage: (content: string, isQuestion?: boolean) => void;
  questions: Message[];
  
  // Polls
  polls: Poll[];
  activePoll: Poll | null;
  createPoll: (question: string, options: string[]) => void;
  votePoll: (pollId: string, optionId: string) => void;
  endPoll: (pollId: string) => void;
  
  // Breakout rooms
  breakoutRooms: BreakoutRoom[];
  createBreakoutRoom: (name: string) => void;
  joinBreakoutRoom: (roomId: string) => void;
  leaveBreakoutRoom: () => void;
  currentBreakoutRoom: BreakoutRoom | null;
  
  // Recording
  isRecording: boolean;
  toggleRecording: () => void;
  
  // Status
  isConnected: boolean;
}

// Create the context
const EventContext = createContext<EventContextType | undefined>(undefined);

// Provider component
export const EventProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // User related state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [participants, setParticipants] = useState<User[]>([]);
  
  // Room related state
  const [roomId, setRoomId] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  
  // Messages and Q&A state
  const [messages, setMessages] = useState<Message[]>([]);
  const [questions, setQuestions] = useState<Message[]>([]);
  
  // Polls state
  const [polls, setPolls] = useState<Poll[]>([]);
  const [activePoll, setActivePoll] = useState<Poll | null>(null);
  
  // Breakout rooms state
  const [breakoutRooms, setBreakoutRooms] = useState<BreakoutRoom[]>([]);
  const [currentBreakoutRoom, setCurrentBreakoutRoom] = useState<BreakoutRoom | null>(null);
  
  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  
  // Initialize socket connection and handlers
  useEffect(() => {
    const socket = getSocket();
    
    // Connection status
    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));
    
    // Participant events
    socket.on('participants-updated', (updatedParticipants: User[]) => {
      setParticipants(updatedParticipants);
    });
    
    // Message events
    socket.on('new-message', (message: Message) => {
      setMessages(prev => [...prev, message]);
      if (message.isQuestion) {
        setQuestions(prev => [...prev, message]);
      }
    });
    
    // Poll events
    socket.on('poll-created', (poll: Poll) => {
      setPolls(prev => [...prev, poll]);
      setActivePoll(poll);
    });
    
    socket.on('poll-updated', (updatedPoll: Poll) => {
      setPolls(prev => prev.map(p => p.id === updatedPoll.id ? updatedPoll : p));
      if (activePoll?.id === updatedPoll.id) {
        setActivePoll(updatedPoll);
      }
    });
    
    socket.on('poll-ended', (pollId: string) => {
      setPolls(prev => prev.map(p => 
        p.id === pollId ? { ...p, isActive: false } : p
      ));
      if (activePoll?.id === pollId) {
        setActivePoll(null);
      }
    });
    
    // Breakout room events
    socket.on('breakout-room-created', (room: BreakoutRoom) => {
      setBreakoutRooms(prev => [...prev, room]);
    });
    
    socket.on('breakout-room-updated', (updatedRoom: BreakoutRoom) => {
      setBreakoutRooms(prev => prev.map(r => 
        r.id === updatedRoom.id ? updatedRoom : r
      ));
      
      // Update current room if needed
      if (currentBreakoutRoom?.id === updatedRoom.id) {
        setCurrentBreakoutRoom(updatedRoom);
      }
    });
    
    socket.on('breakout-room-deleted', (roomId: string) => {
      setBreakoutRooms(prev => prev.filter(r => r.id !== roomId));
      
      // Leave current room if deleted
      if (currentBreakoutRoom?.id === roomId) {
        setCurrentBreakoutRoom(null);
      }
    });
    
    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('participants-updated');
      socket.off('new-message');
      socket.off('poll-created');
      socket.off('poll-updated');
      socket.off('poll-ended');
      socket.off('breakout-room-created');
      socket.off('breakout-room-updated');
      socket.off('breakout-room-deleted');
    };
  }, [activePoll, currentBreakoutRoom]);
  
  // Join a room
  const joinRoom = (roomId: string, user: User) => {
    const socket = getSocket();
    setRoomId(roomId);
    setCurrentUser(user);
    
    socket.emit('join-room', { roomId, user });
    
    // Add self to participants
    setParticipants(prev => [...prev, user]);
    
    // For demo purposes, add some fake participants
    if (user.isHost) {
      const demoParticipants = [
        { id: 'demo1', name: 'Sarah Johnson', isHost: false, avatar: 'https://i.pravatar.cc/150?img=1' },
        { id: 'demo2', name: 'Michael Chen', isHost: false, avatar: 'https://i.pravatar.cc/150?img=2' },
        { id: 'demo3', name: 'Aisha Patel', isHost: false, avatar: 'https://i.pravatar.cc/150?img=3' }
      ];
      setParticipants(prev => [...prev, ...demoParticipants]);
    }
  };
  
  // Create a new room
  const createRoom = (user: User): string => {
    const newRoomId = uuidv4().substring(0, 8);
    joinRoom(newRoomId, { ...user, isHost: true });
    return newRoomId;
  };
  
  // Leave a room
  const leaveRoom = () => {
    if (roomId && currentUser) {
      const socket = getSocket();
      socket.emit('leave-room', { roomId, userId: currentUser.id });
      setRoomId(null);
      setCurrentUser(null);
      setParticipants([]);
      setMessages([]);
      setPolls([]);
      setBreakoutRooms([]);
      setCurrentBreakoutRoom(null);
      setIsRecording(false);
    }
  };
  
  // Send a message
  const sendMessage = (content: string, isQuestion = false) => {
    if (!currentUser || !roomId) return;
    
    const message: Message = {
      id: uuidv4(),
      userId: currentUser.id,
      userName: currentUser.name,
      content,
      timestamp: Date.now(),
      isQuestion
    };
    
    const socket = getSocket();
    socket.emit('send-message', { roomId, message });
    
    // Add to local state immediately for UI responsiveness
    setMessages(prev => [...prev, message]);
    if (isQuestion) {
      setQuestions(prev => [...prev, message]);
    }
  };
  
  // Create a poll
  const createPoll = (question: string, options: string[]) => {
    if (!currentUser || !roomId || !currentUser.isHost) return;
    
    const poll: Poll = {
      id: uuidv4(),
      question,
      options: options.map(text => ({ id: uuidv4(), text, votes: 0 })),
      isActive: true,
      createdAt: Date.now()
    };
    
    const socket = getSocket();
    socket.emit('create-poll', { roomId, poll });
    
    // Add to local state immediately
    setPolls(prev => [...prev, poll]);
    setActivePoll(poll);
  };
  
  // Vote in a poll
  const votePoll = (pollId: string, optionId: string) => {
    if (!currentUser || !roomId) return;
    
    const socket = getSocket();
    socket.emit('vote-poll', { roomId, pollId, optionId, userId: currentUser.id });
    
    // Update local state immediately for UI responsiveness
    setPolls(prev => prev.map(poll => {
      if (poll.id === pollId) {
        return {
          ...poll,
          options: poll.options.map(option => {
            if (option.id === optionId) {
              return { ...option, votes: option.votes + 1 };
            }
            return option;
          })
        };
      }
      return poll;
    }));
    
    // Update active poll if needed
    if (activePoll?.id === pollId) {
      setActivePoll(prev => {
        if (!prev) return null;
        return {
          ...prev,
          options: prev.options.map(option => {
            if (option.id === optionId) {
              return { ...option, votes: option.votes + 1 };
            }
            return option;
          })
        };
      });
    }
  };
  
  // End a poll
  const endPoll = (pollId: string) => {
    if (!currentUser || !roomId || !currentUser.isHost) return;
    
    const socket = getSocket();
    socket.emit('end-poll', { roomId, pollId });
    
    // Update local state immediately
    setPolls(prev => prev.map(p => 
      p.id === pollId ? { ...p, isActive: false } : p
    ));
    
    if (activePoll?.id === pollId) {
      setActivePoll(null);
    }
  };
  
  // Create a breakout room
  const createBreakoutRoom = (name: string) => {
    if (!currentUser || !roomId || !currentUser.isHost) return;
    
    const newRoom: BreakoutRoom = {
      id: uuidv4(),
      name,
      participants: [],
      hostId: currentUser.id
    };
    
    const socket = getSocket();
    socket.emit('create-breakout-room', { roomId, breakoutRoom: newRoom });
    
    // Add to local state immediately
    setBreakoutRooms(prev => [...prev, newRoom]);
  };
  
  // Join a breakout room
  const joinBreakoutRoom = (roomId: string) => {
    if (!currentUser || !roomId) return;
    
    const room = breakoutRooms.find(r => r.id === roomId);
    if (!room) return;
    
    const socket = getSocket();
    socket.emit('join-breakout-room', { 
      mainRoomId: roomId, 
      breakoutRoomId: room.id, 
      userId: currentUser.id 
    });
    
    // Update local state immediately for UI responsiveness
    const updatedRoom = {
      ...room,
      participants: [...room.participants, currentUser]
    };
    
    setBreakoutRooms(prev => prev.map(r => 
      r.id === room.id ? updatedRoom : r
    ));
    
    setCurrentBreakoutRoom(updatedRoom);
  };
  
  // Leave a breakout room
  const leaveBreakoutRoom = () => {
    if (!currentUser || !roomId || !currentBreakoutRoom) return;
    
    const socket = getSocket();
    socket.emit('leave-breakout-room', {
      mainRoomId: roomId,
      breakoutRoomId: currentBreakoutRoom.id,
      userId: currentUser.id
    });
    
    // Update local state immediately
    const updatedRoom = {
      ...currentBreakoutRoom,
      participants: currentBreakoutRoom.participants.filter(p => p.id !== currentUser.id)
    };
    
    setBreakoutRooms(prev => prev.map(r => 
      r.id === currentBreakoutRoom.id ? updatedRoom : r
    ));
    
    setCurrentBreakoutRoom(null);
  };
  
  // Toggle recording
  const toggleRecording = () => {
    if (!currentUser?.isHost || !roomId) return;
    
    const newRecordingState = !isRecording;
    setIsRecording(newRecordingState);
    
    const socket = getSocket();
    socket.emit('toggle-recording', { 
      roomId, 
      isRecording: newRecordingState 
    });
    
    // In a real app, this would start/stop recording via WebRTC
    console.log(`Recording ${newRecordingState ? 'started' : 'stopped'}`);
  };
  
  // Context value
  const value: EventContextType = {
    // User related
    currentUser,
    setCurrentUser,
    participants,
    
    // Room related
    roomId,
    joinRoom,
    createRoom,
    leaveRoom,
    
    // Messages and Q&A
    messages,
    sendMessage,
    questions,
    
    // Polls
    polls,
    activePoll,
    createPoll,
    votePoll,
    endPoll,
    
    // Breakout rooms
    breakoutRooms,
    createBreakoutRoom,
    joinBreakoutRoom,
    leaveBreakoutRoom,
    currentBreakoutRoom,
    
    // Recording
    isRecording,
    toggleRecording,
    
    // Status
    isConnected
  };
  
  return <EventContext.Provider value={value}>{children}</EventContext.Provider>;
};

// Custom hook to use the Event context
export const useEventContext = () => {
  const context = useContext(EventContext);
  if (context === undefined) {
    throw new Error("useEventContext must be used within an EventProvider");
  }
  return context;
};
