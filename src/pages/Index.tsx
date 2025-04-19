
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EventProvider } from "@/contexts/EventContext";
import { Camera, MessageCircle, BarChart, Users, Video, Calendar } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [roomId, setRoomId] = useState("");

  const handleCreateRoom = () => {
    if (!userName.trim()) return;
    navigate(`/event/host?name=${encodeURIComponent(userName)}`);
  };

  const handleJoinRoom = () => {
    if (!userName.trim() || !roomId.trim()) return;
    navigate(`/event/join?name=${encodeURIComponent(userName)}&room=${encodeURIComponent(roomId)}`);
  };

  return (
    <EventProvider>
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#ffc3a0] via-[#ffafbd] to-[#ee9ca7] animate-pulse-subtle">
        <header className="py-4 px-4 md:px-8 flex flex-col md:flex-row justify-between items-center bg-white/80 backdrop-blur-sm shadow-sm gap-4 md:gap-0 sticky top-0 z-50">
          <div className="flex items-center space-x-2">
            <Video className="h-6 w-6 text-pink-600" />
            <h1 className="text-xl font-bold text-gradient bg-gradient-to-r from-pink-500 to-purple-600">VirtualMeet</h1>
          </div>
          <nav className="flex flex-wrap gap-2 justify-center">
            <Button variant="ghost" className="w-full sm:w-auto text-pink-700 hover:text-purple-900">Features</Button>
            <Button className="w-full sm:w-auto bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700">Sign Up</Button>
          </nav>
        </header>

        <section className="flex-1 flex items-center justify-center p-4 md:p-8 mt-8">
          <div className="max-w-5xl mx-auto">
            <div className="space-y-8">
              <div className="text-center max-w-3xl mx-auto">
                <h1 className="text-4xl md:text-6xl font-bold text-black mb-6">
                  Virtual Events Made <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">Simple</span>
                </h1>
                <p className="text-lg text-black/90 mb-8 font-medium">
                  Host webinars, team meetings, and virtual events with real-time video, Q&A, polls, and more.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                {[
                  {
                    icon: <Video className="h-8 w-8 text-pink-600" />,
                    bg: "from-pink-200 to-pink-300",
                    title: "HD Video Meetings",
                    description: "Crystal-clear video and audio for an immersive experience"
                  },
                  {
                    icon: <Users className="h-8 w-8 text-purple-600" />,
                    bg: "from-purple-200 to-purple-300",
                    title: "Interactive Features",
                    description: "Live chat, Q&A sessions, polls, and breakout rooms"
                  },
                  {
                    icon: <Calendar className="h-8 w-8 text-teal-600" />,
                    bg: "from-teal-200 to-teal-300",
                    title: "Recording & Analytics",
                    description: "Record sessions and get insights on audience engagement"
                  }
                ].map((feature, index) => (
                  <div
                    key={index}
                    className={`bg-gradient-to-br ${feature.bg} p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 hover:scale-105`}
                  >
                    <div className="flex flex-col items-center text-center space-y-4">
                      <div className="p-3 bg-white/30 rounded-full">
                        {feature.icon}
                      </div>
                      <h3 className="text-xl font-semibold text-gray-800">{feature.title}</h3>
                      <p className="text-gray-700">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-3 justify-center mb-8">
                {[
                  { icon: <Camera className="h-4 w-4 text-pink-500" />, text: "WebRTC Video" },
                  { icon: <MessageCircle className="h-4 w-4 text-purple-500" />, text: "Live Q&A" },
                  { icon: <BarChart className="h-4 w-4 text-teal-500" />, text: "Real-time Polls" },
                  { icon: <Users className="h-4 w-4 text-blue-500" />, text: "Breakout Rooms" }
                ].map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-1 bg-white/60 backdrop-blur-sm rounded-full px-4 py-2 shadow-md border border-white/20 hover:bg-white/80 transition-all"
                  >
                    {item.icon}
                    <span className="text-sm text-gray-800">{item.text}</span>
                  </div>
                ))}
              </div>

              <Card className="w-full max-w-md mx-auto mt-8 bg-gradient-to-br from-white/80 to-white/60 backdrop-blur-sm border-pink-100 shadow-2xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl text-gradient bg-gradient-to-r from-pink-600 to-purple-800">Start Now</CardTitle>
                  <CardDescription>Host or join a virtual event</CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="join" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-4 bg-pink-100">
                      <TabsTrigger value="join" className="data-[state=active]:bg-pink-300">Join Event</TabsTrigger>
                      <TabsTrigger value="host" className="data-[state=active]:bg-purple-300">Host Event</TabsTrigger>
                    </TabsList>

                    <TabsContent value="join" className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="join-name">Your Name</Label>
                        <Input
                          id="join-name"
                          placeholder="Enter your name"
                          value={userName}
                          onChange={(e) => setUserName(e.target.value)}
                          className="focus:ring-pink-300"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="room-id">Room ID</Label>
                        <Input
                          id="room-id"
                          placeholder="Enter room ID"
                          value={roomId}
                          onChange={(e) => setRoomId(e.target.value)}
                          className="focus:ring-purple-300"
                        />
                      </div>
                      <Button
                        onClick={handleJoinRoom}
                        disabled={!userName.trim() || !roomId.trim()}
                        className="w-full bg-gradient-to-r from-pink-700 to-purple-700 hover:from-pink-600 hover:to-purple-700"
                      >
                        Join Event
                      </Button>
                    </TabsContent>

                    <TabsContent value="host" className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="host-name">Your Name</Label>
                        <Input
                          id="host-name"
                          placeholder="Enter your name"
                          value={userName}
                          onChange={(e) => setUserName(e.target.value)}
                          className="focus:ring-pink-300"
                        />
                      </div>
                      <Button
                        onClick={handleCreateRoom}
                        disabled={!userName.trim()}
                        className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
                      >
                        Create Event
                      </Button>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <footer className="py-6 px-8 bg-white/80 backdrop-blur-sm border-t text-center text-sm text-black-800">
          <p> 2025 VirtualMeet. All rights reserved.</p>
        </footer>
      </div>
    </EventProvider>
  );
};

export default Index;

