
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEventContext, Message } from '@/contexts/EventContext';
import { MessageSquare, Send, ThumbsUp } from 'lucide-react';
import { cn } from '@/lib/utils';

export function QAComponent() {
  const { questions, sendMessage, currentUser } = useEventContext();
  const [newQuestion, setNewQuestion] = useState("");
  const [likedQuestions, setLikedQuestions] = useState<Record<string, boolean>>({});
  
  const handleSendQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim()) return;
    
    sendMessage(newQuestion, true);
    setNewQuestion("");
  };
  
  const handleLikeQuestion = (questionId: string) => {
    setLikedQuestions(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  };
  
  return (
    <Card className="w-full h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-brand-purple-dark">
          <MessageSquare className="h-5 w-5" />
          Q&A
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto mb-4 space-y-3">
          {questions.length === 0 ? (
            <div className="text-center p-4 text-gray-500">
              No questions yet. Be the first to ask!
            </div>
          ) : (
            questions.map(question => (
              <QuestionItem 
                key={question.id} 
                question={question}
                isLiked={!!likedQuestions[question.id]}
                onLike={() => handleLikeQuestion(question.id)}
              />
            ))
          )}
        </div>
        
        {/* Question input */}
        {currentUser && !currentUser.isHost && (
          <form onSubmit={handleSendQuestion} className="mt-auto">
            <div className="flex items-center gap-2">
              <Input
                placeholder="Ask a question..."
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" disabled={!newQuestion.trim()} size="icon">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}

interface QuestionItemProps {
  question: Message;
  isLiked: boolean;
  onLike: () => void;
}

function QuestionItem({ question, isLiked, onLike }: QuestionItemProps) {
  const { currentUser } = useEventContext();
  const isOwnQuestion = currentUser?.id === question.userId;
  
  return (
    <div className={cn(
      "p-3 rounded-lg",
      isOwnQuestion ? "bg-brand-purple/10 border-l-2 border-brand-purple" : "bg-gray-50"
    )}>
      <div className="flex justify-between items-start mb-1">
        <span className="font-medium text-sm">
          {isOwnQuestion ? 'You' : question.userName}
        </span>
        <span className="text-xs text-gray-500">
          {new Date(question.timestamp).toLocaleTimeString()}
        </span>
      </div>
      <p className="text-sm mb-2">{question.content}</p>
      
      {/* Like button */}
      {!isOwnQuestion && (
        <Button 
          variant="ghost" 
          size="sm"
          onClick={onLike}
          className={cn(
            "text-xs h-7 px-2",
            isLiked ? "text-brand-teal" : "text-gray-500"
          )}
        >
          <ThumbsUp className="h-3 w-3 mr-1" />
          {isLiked ? 'Liked' : 'Like'}
        </Button>
      )}
    </div>
  );
}
