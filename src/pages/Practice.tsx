import { useState, useEffect, Suspense, lazy } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { getQuestionById } from "@/data/mockData";
import { Save, Send, Eye, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { FeedbackModal } from "@/components/FeedbackModal";
import { ResultsModal } from "@/components/ResultsModal";

// Dynamically import Excalidraw
const Excalidraw = lazy(() =>
  import("@excalidraw/excalidraw").then((mod) => ({ default: mod.Excalidraw }))
);

export default function Practice() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const question = getQuestionById(id || "");

  const [leftPanelOpen, setLeftPanelOpen] = useState(true);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<"ai" | "notes">("ai");
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [excalidrawAPI, setExcalidrawAPI] = useState<any>(null);

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAuthenticated");
    if (isAuthenticated !== "true") {
      navigate("/auth");
    }
  }, [navigate]);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (!question) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Question not found</h1>
          <Button onClick={() => navigate("/")} className="mt-4">
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSaveDraft = () => {
    toast({
      title: "Draft Saved",
      description: "Your progress has been saved successfully.",
    });
  };

  const handleCheckDesign = () => {
    setShowFeedback(true);
  };

  const handleSubmit = () => {
    setShowResults(true);
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Top Bar */}
      <div className="h-14 border-b border-border flex items-center justify-between px-4 bg-card">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </Button>
          <div className="h-6 w-px bg-border" />
          <h1 className="text-sm font-semibold truncate max-w-md">{question.title}</h1>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span className="font-mono">{formatTime(elapsedTime)}</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Question Details */}
        {leftPanelOpen && (
          <div className="w-80 border-r border-border overflow-y-auto bg-card p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Question Details</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLeftPanelOpen(false)}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-3">
              <div>
                <h3 className="text-sm font-medium mb-2">Key Requirements:</h3>
                <ul className="space-y-1 text-xs text-muted-foreground">
                  {question.requirements.slice(0, 3).map((req, i) => (
                    <li key={i} className="flex gap-2">
                      <span>•</span>
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-medium mb-2">Expected Components:</h3>
                <div className="flex flex-wrap gap-1">
                  {question.expectedComponents.slice(0, 4).map((comp) => (
                    <span key={comp} className="text-xs px-2 py-1 bg-muted rounded">
                      {comp}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {!leftPanelOpen && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute left-2 top-20 z-10"
            onClick={() => setLeftPanelOpen(true)}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        )}

        {/* Center Panel - Excalidraw Canvas */}
        <div className="flex-1 relative bg-muted/30">
          <div className="absolute inset-0">
            <Suspense
              fallback={
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading canvas...</p>
                  </div>
                </div>
              }
            >
              <Excalidraw
                excalidrawAPI={(api: any) => setExcalidrawAPI(api)}
                theme="light"
              />
            </Suspense>
          </div>
        </div>

        {/* Right Panel - AI Assistant & Notes */}
        {rightPanelOpen && (
          <div className="w-80 border-l border-border bg-card flex flex-col">
            <div className="flex border-b border-border">
              <button
                className={`flex-1 py-3 text-sm font-medium transition-smooth ${
                  activeTab === "ai"
                    ? "text-primary border-b-2 border-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => setActiveTab("ai")}
              >
                AI Assistant
              </button>
              <button
                className={`flex-1 py-3 text-sm font-medium transition-smooth ${
                  activeTab === "notes"
                    ? "text-primary border-b-2 border-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => setActiveTab("notes")}
              >
                My Notes
              </button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setRightPanelOpen(false)}
                className="my-2 mr-2"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {activeTab === "ai" ? (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Ask me anything about this design problem. I can help with hints,
                    clarifications, or answer questions!
                  </p>
                  <div className="space-y-2">
                    <div className="bg-primary/10 rounded-lg p-3 text-sm">
                      <p className="font-medium mb-1">AI:</p>
                      <p className="text-muted-foreground">
                        I'm here to help! Feel free to ask about scalability, database
                        choices, or any other aspect of your design.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <textarea
                  className="w-full h-full p-3 bg-muted rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Take notes here..."
                />
              )}
            </div>
          </div>
        )}

        {!rightPanelOpen && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-2 top-20 z-10"
            onClick={() => setRightPanelOpen(true)}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Bottom Action Bar */}
      <div className="h-16 border-t border-border flex items-center justify-between px-6 bg-card">
        <Button
          variant="outline"
          onClick={handleSaveDraft}
          className="gap-2"
        >
          <Save className="w-4 h-4" />
          Save Draft
        </Button>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={handleCheckDesign}
            className="gap-2"
          >
            <Eye className="w-4 h-4" />
            Check Design
          </Button>
          <Button
            onClick={handleSubmit}
            variant="success"
            className="gap-2"
          >
            <Send className="w-4 h-4" />
            Submit Final
          </Button>
        </div>
      </div>

      {/* Modals */}
      {showFeedback && (
        <FeedbackModal onClose={() => setShowFeedback(false)} />
      )}
      {showResults && (
        <ResultsModal
          onClose={() => setShowResults(false)}
          onRetry={() => {
            setShowResults(false);
            setElapsedTime(0);
          }}
          onNextQuestion={() => navigate("/")}
        />
      )}
    </div>
  );
}
