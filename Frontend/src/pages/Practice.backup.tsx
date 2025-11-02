import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { getQuestionById } from "@/data/mockData";
import { Save, Send, Eye, ChevronLeft, ChevronRight, Clock, Trash2, Download, Shapes, GitBranch } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { FeedbackModal } from "@/components/FeedbackModal";
import { ResultsModal } from "@/components/ResultsModal";
import ExcalidrawCanvas, { ExcalidrawCanvasRef } from "@/components/ExcalidrawCanvas";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
  const excalidrawRef = useRef<ExcalidrawCanvasRef>(null);
  const [notes, setNotes] = useState("");
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [aiMessages, setAiMessages] = useState<{ role: "ai" | "user"; text: string }[]>([
    { role: "ai", text: "I'm here to help! Feel free to ask about scalability, database choices, or any other aspect of your design." }
  ]);
  const [aiInput, setAiInput] = useState("");
  const autosaveTimerRef = useRef<NodeJS.Timeout | null>(null);

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

  // Load saved draft
  useEffect(() => {
    if (!id) return;
    
    const savedDraft = localStorage.getItem(`draft-${id}`);
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        if (draft.diagramData && excalidrawRef.current) {
          excalidrawRef.current.updateScene(draft.diagramData);
        }
        if (draft.notes) setNotes(draft.notes);
        if (draft.timeSpent) setElapsedTime(draft.timeSpent);
        toast({
          title: "Draft Loaded",
          description: "Your previous work has been restored.",
        });
      } catch (e) {
        console.error("Failed to load draft:", e);
      }
    }
  }, [id, toast]);

  // Autosave functionality
  useEffect(() => {
    if (!id || !excalidrawRef.current) return;

    autosaveTimerRef.current = setInterval(() => {
      if (excalidrawRef.current) {
        const elements = excalidrawRef.current.getSceneElements();
        const appState = excalidrawRef.current.getAppState();
        
        const draft = {
          diagramData: { elements, appState },
          notes,
          timeSpent: elapsedTime,
          lastSaved: new Date().toISOString(),
        };
        
        localStorage.setItem(`draft-${id}`, JSON.stringify(draft));
      }
    }, 30000); // Every 30 seconds

    return () => {
      if (autosaveTimerRef.current) {
        clearInterval(autosaveTimerRef.current);
      }
    };
  }, [id, notes, elapsedTime]);

  if (!question) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Question not found</h1>
          <Button onClick={() => navigate("/dashboard")} className="mt-4">
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
    if (!excalidrawRef.current || !id) return;
    
    const elements = excalidrawRef.current.getSceneElements();
    const appState = excalidrawRef.current.getAppState();
    
    const draft = {
      diagramData: { elements, appState },
      notes,
      timeSpent: elapsedTime,
      lastSaved: new Date().toISOString(),
    };
    
    localStorage.setItem(`draft-${id}`, JSON.stringify(draft));
    
    toast({
      title: "Draft Saved",
      description: "Your progress has been saved successfully.",
    });
  };

  const handleClearCanvas = () => {
    if (excalidrawRef.current) {
      excalidrawRef.current.resetScene();
      setShowClearDialog(false);
      toast({
        title: "Canvas Cleared",
        description: "Your canvas has been reset.",
      });
    }
  };

  const handleExportImage = () => {
    if (excalidrawRef.current) {
      const elements = excalidrawRef.current.getSceneElements();
      if (elements.length === 0) {
        toast({
          title: "Nothing to Export",
          description: "Your canvas is empty.",
          variant: "destructive",
        });
        return;
      }
      
      excalidrawRef.current.exportToBlob({ mimeType: "image/png" }).then((blob: Blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${question?.title || "diagram"}-${Date.now()}.png`;
        a.click();
        URL.revokeObjectURL(url);
        
        toast({
          title: "Image Downloaded",
          description: "Your diagram has been saved as PNG.",
        });
      });
    }
  };

  const handleSendAiMessage = () => {
    if (!aiInput.trim()) return;
    
    const userMessage = aiInput.trim();
    setAiMessages([...aiMessages, { role: "user", text: userMessage }]);
    setAiInput("");
    
    // Mock AI response
    setTimeout(() => {
      const responses = [
        "That's a great question! For scalability, consider using a distributed cache like Redis to handle high read loads.",
        "Good thinking! You might want to add a load balancer to distribute traffic across multiple application servers.",
        "Have you thought about database sharding? It can help with horizontal scaling as your data grows.",
        "Consider using a message queue like RabbitMQ or Kafka for asynchronous processing of heavy tasks.",
        "Don't forget about monitoring and observability! Tools like Prometheus and Grafana can help track system health.",
      ];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      setAiMessages(prev => [...prev, { role: "ai", text: randomResponse }]);
    }, 1000);
  };

  const handleCheckDesign = () => {
    setShowFeedback(true);
  };

  const handleSubmit = () => {
    setShowResults(true);
  };

  const handleAddSystemTemplate = () => {
    if (excalidrawRef.current) {
      excalidrawRef.current.addSystemDiagramElements();
      toast({
        title: "Template Added",
        description: "System architecture template has been added to your canvas.",
      });
    }
  };

  const handleAddFlowchartTemplate = () => {
    if (excalidrawRef.current) {
      excalidrawRef.current.addFlowchartElements();
      toast({
        title: "Template Added",
        description: "Flowchart template has been added to your canvas.",
      });
    }
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
          {/* Enhanced Canvas Action Buttons */}
          <div className="absolute top-4 right-4 z-10 flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddSystemTemplate}
              className="gap-2 bg-card shadow-sm"
              title="Add System Architecture Template"
            >
              <Shapes className="w-4 h-4" />
              System
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddFlowchartTemplate}
              className="gap-2 bg-card shadow-sm"
              title="Add Flowchart Template"
            >
              <GitBranch className="w-4 h-4" />
              Flow
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportImage}
              className="gap-2 bg-card shadow-sm"
              title="Export as PNG"
            >
              <Download className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowClearDialog(true)}
              className="gap-2 bg-card shadow-sm"
              title="Clear Canvas"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="absolute inset-0">
            <ExcalidrawCanvas
              ref={excalidrawRef}
              onSceneUpdate={(elements, appState) => {
                // Optional: Handle real-time scene updates
              }}
            />
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
                <div className="flex flex-col h-full">
                  <div className="flex-1 space-y-3 mb-4 overflow-y-auto">
                    {aiMessages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`rounded-lg p-3 text-sm ${
                          msg.role === "ai"
                            ? "bg-primary/10"
                            : "bg-muted ml-4"
                        }`}
                      >
                        <p className="font-medium mb-1">{msg.role === "ai" ? "AI:" : "You:"}</p>
                        <p className="text-muted-foreground">{msg.text}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={aiInput}
                      onChange={(e) => setAiInput(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleSendAiMessage()}
                      placeholder="Ask a question..."
                      className="flex-1 px-3 py-2 bg-muted rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <Button
                      size="sm"
                      onClick={handleSendAiMessage}
                      disabled={!aiInput.trim()}
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <textarea
                  className="w-full h-full p-3 bg-muted rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Take notes here..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
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
          onNextQuestion={() => navigate("/dashboard")}
        />
      )}
      
      {/* Clear Canvas Confirmation Dialog */}
      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear Canvas?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove all elements from your canvas. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleClearCanvas} className="bg-red-500 hover:bg-red-600">
              Clear Canvas
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
