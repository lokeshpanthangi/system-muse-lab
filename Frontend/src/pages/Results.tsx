import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const Results: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const feedbackContent = location.state?.feedbackContent;

  if (!feedbackContent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center p-10 bg-card border border-border rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold text-card-foreground mb-4">
            No Results Found
          </h2>
          <p className="text-muted-foreground mb-6">
            Please submit your design from the practice page to see results.
          </p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-primary text-primary-foreground border-none rounded-lg cursor-pointer text-base font-semibold hover:bg-primary/90 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-5">
      <div className="max-w-4xl mx-auto bg-card border border-border rounded-xl p-8 shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 border-b-2 border-border pb-4">
          <h1 className="text-3xl font-bold text-card-foreground">
            🎯 Final Submission Results
          </h1>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-muted text-muted-foreground border-none rounded-lg cursor-pointer text-sm font-semibold hover:bg-muted/80 transition-colors"
          >
            ← Back to Practice
          </button>
        </div>
        
        {/* Score Section */}
        <div className="bg-primary/10 border-2 border-primary rounded-2xl p-6 mb-8 text-center">
          <div className="text-5xl font-bold text-primary mb-2">
            {feedbackContent.score}/{feedbackContent.maxScore}
          </div>
          <div className="text-lg text-muted-foreground font-semibold">
            Your Final Score
          </div>
          <div className={`mt-4 px-4 py-2 rounded-full inline-block text-sm font-semibold ${
            feedbackContent.score >= 80 
              ? "bg-success text-success-foreground" 
              : feedbackContent.score >= 60 
                ? "bg-warning text-warning-foreground" 
                : "bg-destructive text-destructive-foreground"
          }`}>
            {feedbackContent.score >= 80 ? "Excellent!" : feedbackContent.score >= 60 ? "Good Job!" : "Keep Learning!"}
          </div>
        </div>

        {/* Strengths Section */}
        {feedbackContent.strengths.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-success mb-4 flex items-center gap-2">
              💪 Strengths
            </h2>
            <div className="bg-success/10 border border-success/20 rounded-xl p-5">
              {feedbackContent.strengths.map((strength: string, index: number) => (
                <div key={index} className="text-card-foreground mb-3 text-base leading-relaxed flex items-start gap-2">
                  <span className="text-success font-bold">✓</span>
                  {strength}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Areas for Improvement Section */}
        {feedbackContent.weaknesses.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-destructive mb-4 flex items-center gap-2">
              📈 Areas for Improvement
            </h2>
            <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-5">
              {feedbackContent.weaknesses.map((weakness: string, index: number) => (
                <div key={index} className="text-card-foreground mb-3 text-base leading-relaxed flex items-start gap-2">
                  <span className="text-destructive font-bold">→</span>
                  {weakness}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Learning Resources Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-accent mb-4 flex items-center gap-2">
            📚 Learning Resources
          </h2>
          <div className="bg-accent/10 border border-accent/20 rounded-xl p-5">
            {feedbackContent.learningResources.map((resource: any, index: number) => (
              <div key={index} className="mb-4 p-4 bg-card border border-border rounded-lg shadow-sm">
                <a 
                  href={resource.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary no-underline font-bold text-base block mb-2 hover:underline transition-all"
                >
                  {resource.title} →
                </a>
                <div className="text-muted-foreground text-sm leading-relaxed">
                  {resource.description}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Reflection Questions Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-warning mb-4 flex items-center gap-2">
            🤔 Reflection Questions
          </h2>
          <div className="bg-warning/10 border border-warning/20 rounded-xl p-5">
            <p className="text-warning text-sm mb-4 italic">
              Take some time to think about these questions to deepen your understanding:
            </p>
            {feedbackContent.questions.map((question: string, index: number) => (
              <div key={index} className="text-card-foreground mb-4 text-base leading-relaxed p-3 bg-card border border-border rounded-lg">
                <span className="font-bold text-warning">
                  {index + 1}.
                </span>{" "}
                {question}
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center pt-6 border-t-2 border-border">
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-primary text-primary-foreground border-none rounded-lg cursor-pointer text-base font-semibold transition-colors hover:bg-primary/90"
          >
            Try Another Problem
          </button>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-success text-success-foreground border-none rounded-lg cursor-pointer text-base font-semibold transition-colors hover:bg-success/90"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default Results;