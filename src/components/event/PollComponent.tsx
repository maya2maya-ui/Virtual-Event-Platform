
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEventContext, Poll, PollOption } from '@/contexts/EventContext';
import { BarChart, CheckCircle2, PieChart, Plus, Trash2, X } from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import { cn } from '@/lib/utils';

export function CreatePollForm() {
  const { createPoll, currentUser } = useEventContext();
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState<string[]>(["", ""]);
  const [error, setError] = useState("");
  
  const addOption = () => {
    if (options.length >= 6) {
      setError("Maximum 6 options allowed");
      return;
    }
    setOptions([...options, ""]);
  };
  
  const removeOption = (index: number) => {
    if (options.length <= 2) {
      setError("Minimum 2 options required");
      return;
    }
    const newOptions = [...options];
    newOptions.splice(index, 1);
    setOptions(newOptions);
    setError("");
  };
  
  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate inputs
    if (!question.trim()) {
      setError("Question is required");
      return;
    }
    
    const validOptions = options.filter(opt => opt.trim() !== "");
    if (validOptions.length < 2) {
      setError("At least 2 options are required");
      return;
    }
    
    // Create the poll
    createPoll(question, validOptions);
    
    // Reset form
    setQuestion("");
    setOptions(["", ""]);
    setError("");
  };
  
  if (!currentUser?.isHost) {
    return null;
  }
  
  return (
    <Card className="w-full animate-fade-in">
      <CardHeader>
        <CardTitle className="text-xl text-brand-purple-dark">Create a Poll</CardTitle>
        <CardDescription>Create an interactive poll for participants</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="question">Question</Label>
            <Input
              id="question"
              placeholder="Enter your question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
          </div>
          
          <div className="space-y-3">
            <Label>Options</Label>
            {options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Input
                  placeholder={`Option ${index + 1}`}
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                />
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon"
                  onClick={() => removeOption(index)}
                  disabled={options.length <= 2}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addOption}
              disabled={options.length >= 6}
              className="flex items-center gap-1"
            >
              <Plus className="h-4 w-4" /> Add Option
            </Button>
          </div>
          
          {error && <p className="text-destructive text-sm">{error}</p>}
        </form>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button type="button" variant="ghost" onClick={() => setOptions(["", ""])}>
          Reset
        </Button>
        <Button onClick={handleSubmit} className="bg-brand-teal hover:bg-brand-teal/90">
          Create Poll
        </Button>
      </CardFooter>
    </Card>
  );
}

interface PollDisplayProps {
  poll: Poll;
  showResults?: boolean;
  onDismiss?: () => void;
}

export function PollDisplay({ poll, showResults = false, onDismiss }: PollDisplayProps) {
  const { currentUser, votePoll, endPoll } = useEventContext();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [displayType, setDisplayType] = useState<'list' | 'bar'>('list');
  
  const totalVotes = poll.options.reduce((sum, option) => sum + option.votes, 0);
  
  const handleVote = () => {
    if (!selectedOption || hasVoted) return;
    
    votePoll(poll.id, selectedOption);
    setHasVoted(true);
  };
  
  const handleEndPoll = () => {
    endPoll(poll.id);
    if (onDismiss) onDismiss();
  };
  
  return (
    <Card className="w-full animate-fade-in">
      <CardHeader className="flex flex-col gap-1">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg text-brand-purple-dark">Poll</CardTitle>
          {onDismiss && (
            <Button variant="ghost" size="icon" onClick={onDismiss} className="h-6 w-6">
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <CardDescription className="text-base font-medium">{poll.question}</CardDescription>
        {currentUser?.isHost && (
          <div className="flex justify-end space-x-2 mt-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setDisplayType(displayType === 'list' ? 'bar' : 'list')} 
              className="flex items-center gap-1 text-xs"
            >
              {displayType === 'list' ? (
                <><BarChart className="h-3 w-3" /> Bar</>
              ) : (
                <><PieChart className="h-3 w-3" /> List</>
              )}
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {!showResults && !hasVoted ? (
          <div className="space-y-2">
            {poll.options.map((option) => (
              <div 
                key={option.id} 
                className={cn(
                  "p-3 rounded-md border transition-colors",
                  selectedOption === option.id 
                    ? "border-brand-purple bg-brand-purple/10" 
                    : "border-gray-200 hover:border-brand-purple/50 cursor-pointer"
                )}
                onClick={() => setSelectedOption(option.id)}
              >
                <div className="flex items-center justify-between">
                  <span>{option.text}</span>
                  {selectedOption === option.id && (
                    <CheckCircle2 className="h-5 w-5 text-brand-purple" />
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {poll.options.map((option) => (
              <div key={option.id} className="space-y-1">
                <div className="flex justify-between items-center">
                  <span>{option.text}</span>
                  <span className="text-sm font-medium">
                    {totalVotes > 0 
                      ? `${Math.round((option.votes / totalVotes) * 100)}%` 
                      : '0%'}
                    <span className="text-gray-500 text-xs ml-1">
                      ({option.votes} {option.votes === 1 ? 'vote' : 'votes'})
                    </span>
                  </span>
                </div>
                {displayType === 'bar' ? (
                  <Progress 
                    value={totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0} 
                    className="h-2"
                  />
                ) : (
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div 
                      className="bg-brand-purple h-2 rounded-full"
                      style={{ width: `${totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0}%` }}
                    />
                  </div>
                )}
              </div>
            ))}
            <div className="mt-2 text-sm text-gray-500 text-center">
              Total votes: {totalVotes}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        {currentUser?.isHost && poll.isActive ? (
          <Button 
            variant="outline" 
            onClick={handleEndPoll}
            className="text-destructive border-destructive hover:bg-destructive/10"
          >
            End Poll
          </Button>
        ) : (
          <div></div>
        )}
        
        {!hasVoted && !showResults && (
          <Button 
            onClick={handleVote}
            disabled={!selectedOption}
            className="bg-brand-teal hover:bg-brand-teal/90"
          >
            Submit Vote
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

export function PollsList() {
  const { polls, activePoll } = useEventContext();
  const [showResults, setShowResults] = useState(false);
  
  return (
    <div className="space-y-4">
      {polls.length === 0 ? (
        <div className="text-center p-4 text-gray-500">
          No polls created yet
        </div>
      ) : (
        <>
          {/* Active poll first */}
          {activePoll && (
            <PollDisplay poll={activePoll} showResults={showResults} />
          )}
          
          {/* Completed polls */}
          <div className="space-y-4 mt-4">
            <h3 className="text-sm font-medium text-gray-500">Past Polls</h3>
            {polls
              .filter(poll => !poll.isActive)
              .sort((a, b) => b.createdAt - a.createdAt)
              .map(poll => (
                <PollDisplay key={poll.id} poll={poll} showResults={true} />
              ))
            }
          </div>
        </>
      )}
    </div>
  );
}
