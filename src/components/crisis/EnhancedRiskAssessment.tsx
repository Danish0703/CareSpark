import { useState, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Send, Bot, User, Loader2, AlertTriangle, Heart } from "lucide-react";

interface Message {
  id: string;
  content: string;
  sender: "user" | "bot";
  timestamp: Date;
}

interface RiskFactors {
  suicidalIdeation: number;
  depression: number;
  anxiety: number;
  isolation: number;
  substanceUse: number;
  selfHarm: number;
  hopelessness: number;
  trauma: number;
  [key: string]: number;
}

interface EnhancedRiskAssessmentProps {
  onAssessmentComplete: (riskLevel: "low" | "medium" | "high", assessmentData: any) => void;
}

export const EnhancedRiskAssessment = ({ onAssessmentComplete }: EnhancedRiskAssessmentProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Hello! I'm here to provide you with support and help assess how you're feeling. This conversation is completely confidential and designed to help us understand how best to support you. Please feel free to share what's on your mind.",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationCount, setConversationCount] = useState(0);
  const [allUserInputs, setAllUserInputs] = useState<string[]>([]);
  const [riskFactors, setRiskFactors] = useState<RiskFactors>({
    suicidalIdeation: 0,
    depression: 0,
    anxiety: 0,
    isolation: 0,
    substanceUse: 0,
    selfHarm: 0,
    hopelessness: 0,
    trauma: 0,
  });
  const [overallRiskScore, setOverallRiskScore] = useState(0);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Enhanced risk keywords with weights
  const riskPatterns = {
    suicidalIdeation: {
      critical: ["suicide", "kill myself", "end my life", "want to die", "better off dead", "no point living"],
      high: ["not worth living", "wish I was dead", "end it all", "don't want to be here"],
      medium: ["life is meaningless", "what's the point", "tired of living"],
      weight: 10
    },
    selfHarm: {
      critical: ["cut myself", "hurt myself", "self harm", "cutting", "burning myself"],
      high: ["harm myself", "pain helps", "deserve pain", "punish myself"],
      medium: ["feel numb", "need to feel something"],
      weight: 8
    },
    hopelessness: {
      critical: ["no hope", "nothing will change", "pointless", "no future"],
      high: ["hopeless", "helpless", "trapped", "no way out", "stuck"],
      medium: ["discouraged", "defeated", "lost", "empty"],
      weight: 7
    },
    depression: {
      critical: ["severely depressed", "can't function", "completely overwhelmed"],
      high: ["depressed", "sad all the time", "crying constantly", "can't stop crying"],
      medium: ["sad", "down", "blue", "upset", "unhappy", "melancholy"],
      weight: 6
    },
    isolation: {
      critical: ["completely alone", "nobody cares", "no one would miss me"],
      high: ["isolated", "lonely", "no friends", "no support", "abandoned"],
      medium: ["alone", "disconnected", "withdrawn", "antisocial"],
      weight: 5
    },
    anxiety: {
      critical: ["panic attacks", "can't breathe", "constant fear", "terrified"],
      high: ["anxious", "worried sick", "panic", "scared", "overwhelmed"],
      medium: ["nervous", "stressed", "worried", "tense", "uneasy"],
      weight: 4
    },
    substanceUse: {
      critical: ["overdose", "drinking heavily", "using drugs daily", "can't stop using"],
      high: ["drinking too much", "using drugs", "addicted", "need substances"],
      medium: ["drinking", "smoking", "using", "substances help"],
      weight: 6
    },
    trauma: {
      critical: ["traumatized", "ptsd", "flashbacks", "nightmares constantly"],
      high: ["trauma", "abuse", "attacked", "violated", "haunted"],
      medium: ["bad memories", "hurt before", "past events", "triggers"],
      weight: 7
    }
  };

  const supportiveResponses = {
    initial: [
      "Thank you for sharing that with me. It sounds like you're going through something difficult. Can you tell me more about how long you've been feeling this way?",
      "I appreciate you opening up. That takes courage. What's been the most challenging part of what you're experiencing?",
      "I hear you, and I want you to know that your feelings are completely valid. Help me understand what's been weighing on you most heavily."
    ],
    followUp: [
      "That sounds really overwhelming. Have you noticed any specific triggers or patterns to when you feel this way?",
      "I can sense how much pain you're in. Are there times during the day when things feel a bit easier, or is it constant?",
      "You've been carrying a lot. Have you been able to talk to anyone else about these feelings?"
    ],
    deeper: [
      "It takes strength to keep going when you're feeling like this. What's helped you get through difficult moments before?",
      "I'm concerned about you and want to make sure you're safe. Have you had thoughts about hurting yourself?",
      "You mentioned feeling [specific feeling]. Can you help me understand what that looks like in your daily life?"
    ],
    crisis: [
      "I'm very concerned about what you've shared. Your safety is the most important thing right now. I want to make sure you get the immediate support you need.",
      "Thank you for trusting me with something so serious. Right now, let's focus on keeping you safe and getting you connected with people who can help.",
    ]
  };

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const analyzeRiskFactors = (userInputs: string[]): RiskFactors => {
    const fullText = userInputs.join(" ").toLowerCase();
    const newRiskFactors = { ...riskFactors };
    
    Object.entries(riskPatterns).forEach(([factor, patterns]) => {
      let score = 0;
      
      patterns.critical.forEach(keyword => {
        if (fullText.includes(keyword)) score += 3;
      });
      
      patterns.high.forEach(keyword => {
        if (fullText.includes(keyword)) score += 2;
      });
      
      patterns.medium.forEach(keyword => {
        if (fullText.includes(keyword)) score += 1;
      });
      
      newRiskFactors[factor as keyof RiskFactors] = Math.min(score, 10);
    });
    
    return newRiskFactors;
  };

  const calculateOverallRisk = (factors: RiskFactors): { score: number; level: "low" | "medium" | "high" } => {
    let weightedScore = 0;
    let maxPossibleScore = 0;
    
    Object.entries(riskPatterns).forEach(([factor, pattern]) => {
      const factorScore = factors[factor as keyof RiskFactors];
      weightedScore += factorScore * pattern.weight;
      maxPossibleScore += 10 * pattern.weight;
    });
    
    const normalizedScore = (weightedScore / maxPossibleScore) * 100;
    
    let level: "low" | "medium" | "high" = "low";
    if (normalizedScore >= 60) level = "high";
    else if (normalizedScore >= 30) level = "medium";
    
    return { score: normalizedScore, level };
  };

  const generateBotResponse = (userInput: string, conversationCount: number, riskLevel: string): string => {
    const input = userInput.toLowerCase();
    
    // Check for immediate crisis indicators
    const hasCriticalRisk = Object.values(riskPatterns).some(pattern =>
      pattern.critical.some(keyword => input.includes(keyword))
    );
    
    if (hasCriticalRisk) {
      return supportiveResponses.crisis[Math.floor(Math.random() * supportiveResponses.crisis.length)];
    }
    
    // Progressive conversation based on risk level and conversation count
    if (conversationCount === 0) {
      return supportiveResponses.initial[Math.floor(Math.random() * supportiveResponses.initial.length)];
    } else if (conversationCount < 3) {
      return supportiveResponses.followUp[Math.floor(Math.random() * supportiveResponses.followUp.length)];
    } else {
      if (riskLevel === "high" || riskLevel === "medium") {
        return supportiveResponses.deeper[Math.floor(Math.random() * supportiveResponses.deeper.length)];
      }
      return supportiveResponses.followUp[Math.floor(Math.random() * supportiveResponses.followUp.length)];
    }
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
      // Analyze risk factors
      const newRiskFactors = analyzeRiskFactors(newUserInputs);
      setRiskFactors(newRiskFactors);
      
      const { score, level } = calculateOverallRisk(newRiskFactors);
      setOverallRiskScore(score);

      // If critical risk detected, immediately trigger crisis mode
      if (level === "high" || score >= 70) {
        const botResponse = supportiveResponses.crisis[0];
        
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
            assessment_data: JSON.parse(JSON.stringify({ 
              conversation: newUserInputs,
              riskFactors: newRiskFactors,
              riskScore: score
            })),
            risk_level: "high",
            assessment_score: Math.round(score),
            chatbot_conversation: JSON.parse(JSON.stringify(messages.concat(userMessage, botMessage))),
          });
        }

        setTimeout(() => {
          onAssessmentComplete("high", { 
            conversation: newUserInputs, 
            riskFactors: newRiskFactors,
            riskScore: score 
          });
        }, 2000);
        
        setIsLoading(false);
        return;
      }

      // Continue normal conversation
      await new Promise(resolve => setTimeout(resolve, 1500));

      const botResponse = generateBotResponse(inputValue, conversationCount, level);
      setConversationCount(prev => prev + 1);

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: botResponse,
        sender: "bot",
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botMessage]);

      // After sufficient exchanges, complete assessment
      if (conversationCount >= 5) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from("risk_assessments").insert({
            user_id: user.id,
            assessment_data: JSON.parse(JSON.stringify({ 
              conversation: newUserInputs,
              riskFactors: newRiskFactors,
              riskScore: score
            })),
            risk_level: level === "medium" ? "medium" : "low",
            assessment_score: Math.round(score),
            chatbot_conversation: JSON.parse(JSON.stringify(messages.concat(userMessage, botMessage))),
          });
        }

        setTimeout(() => {
          onAssessmentComplete(level === "medium" ? "medium" : "low", { 
            conversation: newUserInputs, 
            riskFactors: newRiskFactors,
            riskScore: score 
          });
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

  const getRiskColor = (score: number) => {
    if (score >= 60) return "text-crisis";
    if (score >= 30) return "text-warning";
    return "text-wellness";
  };

  const getRiskLevel = () => {
    if (overallRiskScore >= 60) return "HIGH";
    if (overallRiskScore >= 30) return "MEDIUM";
    return "LOW";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-light to-wellness-light p-4">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat Interface */}
        <div className="lg:col-span-2">
          <Card className="h-[80vh] flex flex-col shadow-card">
            <CardHeader className="flex-shrink-0">
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-6 w-6 text-primary" />
                Enhanced Mental Wellness Assessment
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
                          <span className="text-sm">Analyzing your response...</span>
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
                    placeholder="Share how you're feeling..."
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

        {/* Risk Analysis Panel */}
        <div className="space-y-4">
          {/* Overall Risk Score */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <AlertTriangle className="h-4 w-4" />
                Risk Assessment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className={`text-2xl font-bold ${getRiskColor(overallRiskScore)}`}>
                  {getRiskLevel()}
                </div>
                <div className="text-sm text-muted-foreground">
                  Score: {Math.round(overallRiskScore)}/100
                </div>
                <Progress 
                  value={overallRiskScore} 
                  className="mt-2"
                />
              </div>
              <Badge 
                variant={overallRiskScore >= 60 ? "destructive" : overallRiskScore >= 30 ? "default" : "secondary"}
                className="w-full justify-center"
              >
                {conversationCount < 3 ? "Assessment in Progress" : "Assessment Complete"}
              </Badge>
            </CardContent>
          </Card>

          {/* Risk Factors Breakdown */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Heart className="h-4 w-4" />
                Risk Factors
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(riskFactors).map(([factor, score]) => (
                <div key={factor} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="capitalize">{factor.replace(/([A-Z])/g, ' $1').trim()}</span>
                    <span>{score}/10</span>
                  </div>
                  <Progress value={score * 10} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Conversation Progress */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-sm">Assessment Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Messages exchanged</span>
                  <span>{conversationCount}/6</span>
                </div>
                <Progress value={(conversationCount / 6) * 100} />
                <p className="text-xs text-muted-foreground">
                  Complete assessment to receive personalized recommendations
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};