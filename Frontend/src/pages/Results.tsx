import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Trophy, 
  Target, 
  TrendingUp, 
  BookOpen, 
  ArrowLeft, 
  Home, 
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Lightbulb,
  ExternalLink,
  Star,
  Award,
  BarChart3
} from "lucide-react";
import { useSidebar } from "@/contexts/SidebarContext";
import { cn } from "@/lib/utils";

interface FeedbackContent {
  score: number;
  maxScore: number;
  strengths: string[];
  weaknesses: string[];
  learningResources: Array<{
    title: string;
    url: string;
    description: string;
  }>;
  questions: string[];
}

export default function Results() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isCollapsed } = useSidebar();
  const [isLoading, setIsLoading] = useState(true);
  
  const feedbackContent: FeedbackContent | null = location.state?.feedbackContent;

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, [navigate]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 80) return "default";
    if (score >= 60) return "secondary";
    return "destructive";
  };

  const getPerformanceMessage = (score: number) => {
    if (score >= 90) return "Outstanding Performance! 🌟";
    if (score >= 80) return "Excellent Work! 🎉";
    if (score >= 70) return "Great Job! 👏";
    if (score >= 60) return "Good Effort! 👍";
    return "Keep Learning! 📚";
  };

  const getPerformanceIcon = (score: number) => {
    if (score >= 80) return <Trophy className="w-8 h-8 text-yellow-500" />;
    if (score >= 60) return <Award className="w-8 h-8 text-orange-500" />;
    return <Target className="w-8 h-8 text-gray-500" />;
  };

  // Animated Tick Mark Component
  const AnimatedTickMark = ({ score }: { score: number }) => {
    const [isVisible, setIsVisible] = useState(false);
    
    useEffect(() => {
      const timer = setTimeout(() => setIsVisible(true), 300);
      return () => clearTimeout(timer);
    }, []);

    if (score < 60) return null;

    return (
      <div className="relative">
        <div className={`transition-all duration-700 ease-out ${
          isVisible ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
        }`}>
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center relative overflow-hidden">
            {/* Animated background pulse */}
            <div className={`absolute inset-0 bg-green-400 rounded-full transition-all duration-1000 ${
              isVisible ? 'scale-150 opacity-0' : 'scale-100 opacity-100'
            }`} />
            
            {/* Tick mark */}
            <svg 
              className="w-8 h-8 text-white z-10" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={3} 
                d="M5 13l4 4L19 7"
                className={`transition-all duration-500 delay-300 ${
                  isVisible ? 'stroke-dasharray-0' : 'stroke-dasharray-100'
                }`}
                style={{
                  strokeDasharray: isVisible ? '0' : '100',
                  strokeDashoffset: isVisible ? '0' : '100'
                }}
              />
            </svg>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <main className={cn(
          "flex-1 transition-all duration-300 p-4 md:p-8",
          isCollapsed ? "md:ml-16" : "md:ml-64",
          "ml-0"
        )}>
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-muted rounded w-1/3"></div>
              <div className="h-32 bg-muted rounded"></div>
              <div className="h-48 bg-muted rounded"></div>
              <div className="h-48 bg-muted rounded"></div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!feedbackContent) {
    return (
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <main className={cn(
          "flex-1 transition-all duration-300 p-4 md:p-8",
          isCollapsed ? "md:ml-16" : "md:ml-64",
          "ml-0"
        )}>
          <div className="max-w-4xl mx-auto">
            <Card className="text-center py-16">
              <CardContent className="space-y-6">
                <div className="w-24 h-24 mx-auto bg-muted rounded-full flex items-center justify-center">
                  <BarChart3 className="w-12 h-12 text-muted-foreground" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold">No Results Found</h2>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Please complete a practice session to see your results and feedback.
                  </p>
                </div>
                <div className="flex gap-3 justify-center">
                  <Button onClick={() => navigate(-1)} variant="outline">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Go Back
                  </Button>
                  <Button onClick={() => navigate("/dashboard")}>
                    <Home className="w-4 h-4 mr-2" />
                    Dashboard
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  const scorePercentage = Math.round((feedbackContent.score / feedbackContent.maxScore) * 100);

  return (
    <div className="flex min-h-screen w-full bg-background">
      <AppSidebar />
      <main className={cn(
        "flex-1 transition-all duration-300 p-4 md:p-8",
        isCollapsed ? "md:ml-16" : "md:ml-64",
        "ml-0"
      )}>
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold">Practice Results</h1>
              <p className="text-muted-foreground">
                Review your performance and areas for improvement
              </p>
            </div>
            <Button onClick={() => navigate(-1)} variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Practice
            </Button>
          </div>

          {/* Score and Areas for Improvement - Side by Side */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Score Overview - Reduced Size */}
            <div className="lg:col-span-1">
              <Card className="relative overflow-hidden h-full">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
                <CardHeader className="text-center pb-4">
                  <div className="flex items-center justify-center mb-4">
                    <AnimatedTickMark score={scorePercentage} />
                  </div>
                  <CardTitle className="text-3xl font-bold mb-2">
                    <span className={getScoreColor(scorePercentage)}>
                      {feedbackContent.score}
                    </span>
                    <span className="text-muted-foreground text-xl">/{feedbackContent.maxScore}</span>
                  </CardTitle>
                  <div className="space-y-2">
                    <Badge variant={getScoreBadgeVariant(scorePercentage)} className="text-sm px-3 py-1">
                      {scorePercentage}%
                    </Badge>
                    <p className="text-base font-medium text-muted-foreground">
                      {getPerformanceMessage(scorePercentage)}
                    </p>
                  </div>
                </CardHeader>
              </Card>
            </div>

            {/* Areas for Improvement */}
            <div className="lg:col-span-2">
              {feedbackContent.weaknesses.length > 0 && (
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-orange-600">
                      <TrendingUp className="w-5 h-5" />
                      Areas for Improvement
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {feedbackContent.weaknesses.map((weakness, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                        <AlertCircle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm leading-relaxed">{weakness}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Strengths - Below Score */}
          {feedbackContent.strengths.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="w-5 h-5" />
                  What You're Good At
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid gap-3 md:grid-cols-2">
                  {feedbackContent.strengths.map((strength, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                      <Star className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm leading-relaxed">{strength}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Learning Resources */}
          {feedbackContent.learningResources.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Recommended Learning Resources
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {feedbackContent.learningResources.map((resource, index) => (
                  <div key={index} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-2 flex-1">
                        <h4 className="font-semibold text-primary">{resource.title}</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {resource.description}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="flex-shrink-0"
                      >
                        <a
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Reflection Questions */}
          {feedbackContent.questions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5" />
                  Reflection Questions
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-2">
                  Take time to reflect on these questions to deepen your understanding
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {feedbackContent.questions.map((question, index) => (
                  <div key={index} className="p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Badge variant="outline" className="flex-shrink-0 mt-0.5">
                        {index + 1}
                      </Badge>
                      <p className="text-sm leading-relaxed">{question}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button onClick={() => navigate(-1)} variant="outline" className="flex-1 sm:flex-none">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Another Problem
                </Button>
                <Button onClick={() => navigate("/dashboard")} className="flex-1 sm:flex-none">
                  <Home className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}