
import { io, Socket } from 'socket.io-client';

// Socket.io client setup
let socket: Socket;

export const initSocket = (): Socket => {
  if (!socket) {
    // Connect to a demo socket server (in production this would be your actual server)
    socket = io('https://virtual-event-demo-socket.herokuapp.com', {
      transports: ['websocket'],
      autoConnect: true
    });
    
    // Log connection status
    socket.on('connect', () => {
      console.log('Socket connected!', socket.id);
    });
    
    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });
    
    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      // For demo purposes, simulate working sockets when the demo server is not available
      setupDummySocketForDemo();
    });
  }
  
  return socket;
};

// For demo purposes only - simulates socket functionality
const setupDummySocketForDemo = () => {
  // Override emit to simulate server responses
  socket.emit = (eventName: string, ...args: any[]) => {
    console.log(`Demo socket emitting: ${eventName}`, args);
    
    // Simulate response for different events
    setTimeout(() => {
      switch(eventName) {
        case 'join-room':
          socket.onAny((event) => {
            if (event === 'user-joined') {
              const roomId = args[0];
              const user = args[1];
              console.log(`Demo: User ${user.name} joined room ${roomId}`);
            }
          });
          break;
        
        case 'send-message':
          socket.onAny((event) => {
            if (event === 'new-message') {
              const message = args[0];
              console.log(`Demo: New message received: ${message.content}`);
            }
          });
          break;
        
        case 'start-poll':
          socket.onAny((event) => {
            if (event === 'poll-started') {
              const poll = args[0];
              console.log(`Demo: Poll started: ${poll.question}`);
            }
          });
          break;
      }
    }, 500);
    
    return socket; // Return socket for chaining
  };
};

export const getSocket = (): Socket => {
  if (!socket) {
    return initSocket();
  }
  return socket;
};

export default { initSocket, getSocket };
