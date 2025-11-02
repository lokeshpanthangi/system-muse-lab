import { useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { AppSidebar } from "@/components/AppSidebar";
import { DifficultyBadge } from "@/components/DifficultyBadge";
import { Button } from "@/components/ui/button";
import { Clock, Tag, CheckCircle, Lightbulb, BookOpen, ChevronLeft } from "lucide-react";
import { getQuestionById } from "@/data/mockData";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useState } from "react";
import { useSidebar } from "@/contexts/SidebarContext";

export default function QuestionDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isCollapsed } = useSidebar();
  const question = getQuestionById(id || "");

  const [hintsOpen, setHintsOpen] = useState(false);
  const [constraintsOpen, setConstraintsOpen] = useState(false);

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAuthenticated");
    if (isAuthenticated !== "true") {
      navigate("/auth");
    }
  }, [navigate]);

  if (!question) {
    return (
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <main className={`flex-1 transition-all duration-300 p-4 md:p-8 ${
          isCollapsed ? 'md:ml-16' : 'md:ml-64'
        } ml-0`}>
          <div className="text-center">
            <h1 className="text-2xl font-bold">Question not found</h1>
            <Link to="/dashboard">
              <Button className="mt-4">Back to Dashboard</Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full">
      <AppSidebar />
      <main className={`flex-1 transition-all duration-300 ${
        isCollapsed ? 'md:ml-16' : 'md:ml-64'
      } ml-0`}>
        <div className="max-w-4xl mx-auto p-8 space-y-8">
          {/* Back button */}
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-smooth"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>

          {/* Header */}
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <h1 className="text-4xl font-bold mb-3">{question.title}</h1>
                <div className="flex flex-wrap items-center gap-3">
                  <DifficultyBadge difficulty={question.difficulty} />
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>{question.estimatedTime}</span>
                  </div>
                  {question.categories.map((category) => (
                    <span
                      key={category}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-muted rounded text-xs text-muted-foreground"
                    >
                      <Tag className="w-3 h-3" />
                      {category}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Problem Description</h2>
            <p className="text-muted-foreground leading-relaxed">{question.description}</p>
          </div>

          {/* Requirements */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-primary" />
              Key Requirements
            </h2>
            <ul className="space-y-2">
              {question.requirements.map((req, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-medium flex items-center justify-center mt-0.5">
                    {index + 1}
                  </span>
                  <span className="text-muted-foreground">{req}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Constraints */}
          <Collapsible open={constraintsOpen} onOpenChange={setConstraintsOpen}>
            <div className="bg-card border border-border rounded-lg p-6">
              <CollapsibleTrigger className="w-full">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 cursor-pointer hover:text-primary transition-smooth">
                  <BookOpen className="w-5 h-5" />
                  Constraints & Assumptions
                  <span className="ml-auto text-sm text-muted-foreground">
                    {constraintsOpen ? "Hide" : "Show"}
                  </span>
                </h2>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <ul className="space-y-2">
                  {question.constraints.map((constraint, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="text-primary">•</span>
                      <span className="text-muted-foreground">{constraint}</span>
                    </li>
                  ))}
                </ul>
              </CollapsibleContent>
            </div>
          </Collapsible>

          {/* Expected Components */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Expected System Components</h2>
            <div className="flex flex-wrap gap-2">
              {question.expectedComponents.map((component) => (
                <span
                  key={component}
                  className="px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-sm font-medium"
                >
                  {component}
                </span>
              ))}
            </div>
          </div>

          {/* Hints */}
          <Collapsible open={hintsOpen} onOpenChange={setHintsOpen}>
            <div className="bg-warning-light border border-warning/20 rounded-lg p-6">
              <CollapsibleTrigger className="w-full">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 cursor-pointer hover:text-warning transition-smooth">
                  <Lightbulb className="w-5 h-5 text-warning" />
                  Helpful Hints
                  <span className="ml-auto text-sm text-muted-foreground">
                    {hintsOpen ? "Hide" : "Show"}
                  </span>
                </h2>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <ul className="space-y-2">
                  {question.hints.map((hint, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Lightbulb className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{hint}</span>
                    </li>
                  ))}
                </ul>
              </CollapsibleContent>
            </div>
          </Collapsible>

          <div className="flex justify-center pt-4">
            <Link to={`/practice/${question.id}`}>
              <Button size="lg" className="px-8">
                Start Practice Session
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
