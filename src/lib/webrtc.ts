
import SimplePeer from 'simple-peer';
import { getSocket } from './socket';

// Type for our peer connections
interface PeerConnection {
  peerId: string;
  peer: SimplePeer.Instance;
  stream?: MediaStream;
}

// Map to store all active peer connections
const peerConnections = new Map<string, PeerConnection>();

// Initialize WebRTC for a room
export const initializeWebRTC = async (roomId: string, localStream: MediaStream): Promise<void> => {
  const socket = getSocket();
  
  // Join the room
  socket.emit('join-webrtc-room', {
    roomId,
    userId: socket.id
  });
  
  // Listen for new users joining
  socket.on('user-joined-webrtc', (data: { userId: string, initiator: boolean }) => {
    console.log('User joined WebRTC room:', data.userId);
    createPeerConnection(data.userId, data.initiator, localStream, roomId);
  });
  
  // Handle receiving signals from other peers
  socket.on('webrtc-signal', (data: { from: string, signal: SimplePeer.SignalData }) => {
    const peerConnection = peerConnections.get(data.from);
    if (peerConnection) {
      peerConnection.peer.signal(data.signal);
    }
  });
  
  // Handle user disconnections
  socket.on('user-disconnected', (userId: string) => {
    removePeerConnection(userId);
  });
};

// Create a peer connection with another user
const createPeerConnection = (
  peerId: string, 
  initiator: boolean, 
  stream: MediaStream,
  roomId: string
): PeerConnection => {
  const socket = getSocket();
  
  // Create a new peer connection
  const peer = new SimplePeer({
    initiator,
    stream,
    trickle: true
  });
  
  // Handle signaling
  peer.on('signal', (signal) => {
    socket.emit('webrtc-signal', {
      signal,
      to: peerId,
      from: socket.id,
      roomId
    });
  });
  
  // Handle receiving a remote stream
  peer.on('stream', (remoteStream) => {
    // Update the peer connection with the remote stream
    const peerConnection = peerConnections.get(peerId);
    if (peerConnection) {
      peerConnection.stream = remoteStream;
      
      // Dispatch an event that can be listened to by React components
      window.dispatchEvent(new CustomEvent('webrtc-stream-received', {
        detail: { peerId, stream: remoteStream }
      }));
    }
  });
  
  // Handle errors
  peer.on('error', (err) => {
    console.error('WebRTC peer error:', err);
    removePeerConnection(peerId);
  });
  
  // Store the peer connection
  const peerConnection: PeerConnection = { peerId, peer };
  peerConnections.set(peerId, peerConnection);
  
  return peerConnection;
};

// Remove a peer connection
const removePeerConnection = (peerId: string): void => {
  const peerConnection = peerConnections.get(peerId);
  if (peerConnection) {
    peerConnection.peer.destroy();
    peerConnections.delete(peerId);
    
    // Dispatch an event that can be listened to by React components
    window.dispatchEvent(new CustomEvent('webrtc-peer-disconnected', {
      detail: { peerId }
    }));
  }
};

// Get a list of all active peer connections
export const getPeerConnections = (): Map<string, PeerConnection> => {
  return peerConnections;
};

// Get a specific peer connection
export const getPeerConnection = (peerId: string): PeerConnection | undefined => {
  return peerConnections.get(peerId);
};

// Create a new room
export const createRoom = async (): Promise<string> => {
  // In a real app, this would create a room on the server
  // For demo purposes, we generate a random room ID
  return `room-${Math.random().toString(36).substring(2, 9)}`;
};

// Join an existing room
export const joinRoom = async (roomId: string, localStream: MediaStream): Promise<void> => {
  return initializeWebRTC(roomId, localStream);
};

// Leave a room
export const leaveRoom = (roomId: string): void => {
  const socket = getSocket();
  socket.emit('leave-room', { roomId });
  
  // Close all peer connections
  peerConnections.forEach((connection) => {
    connection.peer.destroy();
  });
  peerConnections.clear();
};

export default {
  initializeWebRTC,
  getPeerConnections,
  getPeerConnection,
  createRoom,
  joinRoom,
  leaveRoom
};
