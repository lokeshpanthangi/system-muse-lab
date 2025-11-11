import { X, CheckCircle, AlertTriangle, XCircle, Lightbulb } from "lucide-react";
import { Button } from "./ui/button";

interface FeedbackData {
  summary?: string;
  strengths?: string[];
  improvements?: string[];
  missing?: string[];
  tips?: string[];
}

interface FeedbackModalProps {
  onClose: () => void;
  feedback: FeedbackData;
}

export const FeedbackModal = ({ onClose, feedback }: FeedbackModalProps) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-card rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold">AI Design Analysis</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Overall Assessment */}
          {feedback.summary && (
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-2">Overall Assessment</h3>
              <p className="text-muted-foreground">{feedback.summary}</p>
            </div>
          )}

          {/* Strengths */}
          {feedback.strengths && feedback.strengths.length > 0 && (
            <div>
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-success" />
                Strengths
              </h3>
              <ul className="space-y-2">
                {feedback.strengths.map((strength, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{strength}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Areas for Improvement */}
          {feedback.improvements && feedback.improvements.length > 0 && (
            <div>
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-warning" />
                Areas for Improvement
              </h3>
              <ul className="space-y-2">
                {feedback.improvements.map((improvement, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{improvement}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Missing Components */}
          {feedback.missing && feedback.missing.length > 0 && (
            <div>
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <XCircle className="w-5 h-5 text-destructive" />
                Missing Components
              </h3>
              <ul className="space-y-2">
                {feedback.missing.map((missing, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{missing}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Best Practice Tips */}
          {feedback.tips && feedback.tips.length > 0 && (
            <div className="bg-warning-light border border-warning/20 rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-warning" />
                Best Practice Tips
              </h3>
              <ul className="space-y-2">
                {feedback.tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Lightbulb className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-card border-t border-border px-6 py-4 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={onClose}>
            Continue Editing
          </Button>
        </div>
      </div>
    </div>
  );
};
