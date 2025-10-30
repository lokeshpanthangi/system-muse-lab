import { X, TrendingUp, CheckCircle, AlertTriangle } from "lucide-react";
import { Button } from "./ui/button";

interface ResultsModalProps {
  onClose: () => void;
  onRetry: () => void;
  onNextQuestion: () => void;
}

export const ResultsModal = ({ onClose, onRetry, onNextQuestion }: ResultsModalProps) => {
  const mockResults = {
    score: 78,
    breakdown: {
      scalability: { score: 20, max: 25 },
      reliability: { score: 19, max: 25 },
      performance: { score: 21, max: 25 },
      designQuality: { score: 18, max: 25 },
    },
    strengths: [
      "Excellent cache implementation reducing database load",
      "Good use of load balancing for high availability",
      "Clear component separation and responsibilities",
    ],
    improvements: [
      "Database sharding strategy needs more detail",
      "Missing backup and disaster recovery plan",
      "Could add more detail on monitoring and alerting",
    ],
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-success";
    if (score >= 60) return "text-warning";
    return "text-destructive";
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return "from-success/20 to-success/5";
    if (score >= 60) return "from-warning/20 to-warning/5";
    return "from-destructive/20 to-destructive/5";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-card rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Submission Results</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Score Display */}
          <div className={`bg-gradient-to-br ${getScoreBg(mockResults.score)} border border-border rounded-lg p-8 text-center`}>
            <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-card border-4 border-primary/20 mb-4">
              <div className="text-center">
                <div className={`text-4xl font-bold ${getScoreColor(mockResults.score)}`}>
                  {mockResults.score}
                </div>
                <div className="text-sm text-muted-foreground">out of 100</div>
              </div>
            </div>
            <h3 className="text-xl font-semibold mb-2">Great Job!</h3>
            <p className="text-muted-foreground">
              You've demonstrated a solid understanding of system design principles
            </p>
          </div>

          {/* Score Breakdown */}
          <div>
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Score Breakdown
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(mockResults.breakdown).map(([key, value]) => (
                <div key={key} className="bg-muted rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium capitalize">
                      {key.replace(/([A-Z])/g, " $1").trim()}
                    </span>
                    <span className="text-lg font-bold">
                      {value.score}/{value.max}
                    </span>
                  </div>
                  <div className="w-full bg-background rounded-full h-2">
                    <div
                      className="bg-primary rounded-full h-2 transition-all"
                      style={{ width: `${(value.score / value.max) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Detailed Feedback */}
          <div className="space-y-4">
            {/* Strengths */}
            <div>
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-success" />
                Key Strengths
              </h3>
              <ul className="space-y-2">
                {mockResults.strengths.map((strength, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm">
                    <CheckCircle className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{strength}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Improvements */}
            <div>
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-warning" />
                How Could This Be Better?
              </h3>
              <ul className="space-y-2">
                {mockResults.improvements.map((improvement, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm">
                    <AlertTriangle className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{improvement}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-card border-t border-border px-6 py-4 flex justify-between">
          <Button variant="outline" onClick={onRetry}>
            Retry Question
          </Button>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button onClick={onNextQuestion}>
              Next Question
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
