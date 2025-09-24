import { useState, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Send, Bot, User, Loader2 } from "lucide-react";

interface Message {
  id: string;
  content: string;
  sender: "user" | "bot";
  timestamp: Date;
}

interface ChatBotProps {
  onAssessmentComplete: (riskLevel: "low" | "high", assessmentData: any) => void;
}

export const ChatBot = ({ onAssessmentComplete }: ChatBotProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Hi there! I'm here to listen and provide support. Feel free to share whatever's on your mind - I'm here to help and understand how you're feeling.",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationCount, setConversationCount] = useState(0);
  const [allUserInputs, setAllUserInputs] = useState<string[]>([]);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const riskKeywords = [
    "suicide", "kill myself", "end it all", "no point", "hopeless", 
    "worthless", "hate myself", "want to die", "harm myself", "cut myself",
    "self harm", "hurt myself", "not worth", "better off dead", "give up",
    "can't go on", "empty inside", "nothing matters", "alone forever"
  ];

  const supportiveResponses = [
    "I hear you, and I want you to know that your feelings are valid. Can you tell me more about what's been going through your mind?",
    "Thank you for sharing that with me. It sounds like you're going through a difficult time. What's been the most challenging part?",
    "I appreciate you opening up. Sometimes talking about our feelings can be the first step. How long have you been feeling this way?",
    "That sounds really tough. You're brave for reaching out and sharing this. What kind of support feels most helpful to you right now?",
    "I can sense that you're struggling, and I want you to know that you're not alone in this. What's been on your mind lately?",
    "It takes courage to express these feelings. I'm here to listen without judgment. Is there anything specific that triggered these feelings recently?"
  ];

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const analyzeRisk = (userInputs: string[]): "low" | "high" => {
    const fullText = userInputs.join(" ").toLowerCase();
    
    // Check for immediate high-risk keywords
    const hasRiskKeywords = riskKeywords.some(keyword => fullText.includes(keyword));
    
    if (hasRiskKeywords) {
      return "high";
    }

    // Check for concerning patterns
    let riskScore = 0;
    
    // Negative indicators
    const negativePatterns = [
      "can't sleep", "not sleeping", "insomnia", "nightmares",
      "not eating", "lost appetite", "can't eat", "weight loss",
      "panic", "anxiety", "depressed", "sad", "crying",
      "isolated", "alone", "no friends", "nobody cares",
      "tired", "exhausted", "drained", "overwhelmed",
      "stressed", "pressure", "breaking down", "falling apart"
    ];
    
    negativePatterns.forEach(pattern => {
      if (fullText.includes(pattern)) riskScore += 1;
    });

    // Positive indicators (reduce risk score)
    const positivePatterns = [
      "support", "family", "friends", "help", "better",
      "improving", "hope", "future", "goals", "therapy"
    ];
    
    positivePatterns.forEach(pattern => {
      if (fullText.includes(pattern)) riskScore -= 0.5;
    });

    return riskScore >= 3 ? "high" : "low";
  };

  const generateBotResponse = (userInput: string, conversationCount: number): string => {
    const input = userInput.toLowerCase();
    
    // Check for immediate crisis indicators
    const hasCrisisWords = riskKeywords.some(keyword => input.includes(keyword));
    if (hasCrisisWords) {
      return "I'm really concerned about what you've shared. Your safety is the most important thing right now. Please know that you're not alone and help is available. Let me connect you with immediate crisis support resources.";
    }

    // Empathetic responses based on conversation flow
    if (conversationCount === 0) {
      if (input.includes("good") || input.includes("fine") || input.includes("okay")) {
        return "I'm glad to hear you're doing okay. Sometimes we might feel fine on the surface but have other things on our mind. Is there anything that's been weighing on you lately?";
      } else if (input.includes("bad") || input.includes("terrible") || input.includes("awful") || input.includes("not good")) {
        return "I'm sorry you're having a difficult time. It takes courage to admit when we're struggling. Would you like to share what's been making things feel so challenging?";
      } else if (input.includes("stressed") || input.includes("anxious") || input.includes("worried")) {
        return "Stress and anxiety can be really overwhelming. You're not alone in feeling this way. What's been the main source of stress for you recently?";
      }
    }

    // Use supportive responses for ongoing conversation
    const randomIndex = Math.floor(Math.random() * supportiveResponses.length);
    return supportiveResponses[randomIndex];
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const newUserInputs = [...allUserInputs, inputValue];
    setAllUserInputs(newUserInputs);
    setInputValue("");
    setIsLoading(true);

    try {
      // Analyze risk after each message
      const riskLevel = analyzeRisk(newUserInputs);
      
      // If high risk detected, immediately trigger crisis mode
      if (riskLevel === "high") {
        const botResponse = "I'm really concerned about what you've shared. Your safety is the most important thing right now. Please know that you're not alone and help is available. Let me connect you with immediate crisis support resources.";
        
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: botResponse,
          sender: "bot",
          timestamp: new Date(),
        };

        setMessages(prev => [...prev, botMessage]);

        // Save assessment and trigger crisis mode immediately
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from("risk_assessments").insert({
            user_id: user.id,
            assessment_data: { conversation: newUserInputs },
            risk_level: "high",
            assessment_score: 5,
            chatbot_conversation: JSON.parse(JSON.stringify(messages.concat(userMessage, botMessage))),
          });
        }

        setTimeout(() => {
          onAssessmentComplete("high", { conversation: newUserInputs });
        }, 2000);
        
        setIsLoading(false);
        return;
      }

      // Continue normal conversation
      await new Promise(resolve => setTimeout(resolve, 1500));

      const botResponse = generateBotResponse(inputValue, conversationCount);
      setConversationCount(prev => prev + 1);

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: botResponse,
        sender: "bot",
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botMessage]);

      // After several exchanges, complete assessment if no high risk
      if (conversationCount >= 4) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from("risk_assessments").insert({
            user_id: user.id,
            assessment_data: { conversation: newUserInputs },
            risk_level: "low",
            assessment_score: 2,
            chatbot_conversation: JSON.parse(JSON.stringify(messages.concat(userMessage, botMessage))),
          });
        }

        setTimeout(() => {
          onAssessmentComplete("low", { conversation: newUserInputs });
        }, 3000);
      }

    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-light to-wellness-light p-4">
      <div className="max-w-4xl mx-auto">
        <Card className="h-[80vh] flex flex-col shadow-card">
          <CardHeader className="flex-shrink-0">
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-6 w-6 text-primary" />
              Mental Wellness Assessment
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col p-0">
            <ScrollArea className="flex-1 p-6" ref={scrollAreaRef}>
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex items-start gap-3 ${
                      message.sender === "user" ? "flex-row-reverse" : ""
                    }`}
                  >
                    <div className={`p-2 rounded-full ${
                      message.sender === "user" 
                        ? "bg-primary text-primary-foreground" 
                        : "bg-wellness text-wellness-foreground"
                    }`}>
                      {message.sender === "user" ? (
                        <User className="h-4 w-4" />
                      ) : (
                        <Bot className="h-4 w-4" />
                      )}
                    </div>
                    <div className={`max-w-[70%] p-4 rounded-lg ${
                      message.sender === "user"
                        ? "bg-primary text-primary-foreground ml-auto"
                        : "bg-muted"
                    }`}>
                      <p className="text-sm leading-relaxed">{message.content}</p>
                      <p className="text-xs opacity-70 mt-2">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-full bg-wellness text-wellness-foreground">
                      <Bot className="h-4 w-4" />
                    </div>
                    <div className="bg-muted p-4 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm">Thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
            <div className="p-6 border-t bg-card">
              <div className="flex gap-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your response..."
                  className="flex-1"
                  disabled={isLoading}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isLoading}
                  variant="wellness"
                  size="icon"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};