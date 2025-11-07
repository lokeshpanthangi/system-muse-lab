import { Clock, Tag } from "lucide-react";
import { Link } from "react-router-dom";
import { DifficultyBadge } from "./DifficultyBadge";
import { StatusBadge } from "./StatusBadge";
import { Button } from "./ui/button";
import type { Problem, Submission } from "@/types/api";

interface QuestionCardProps {
  question: Problem;
  attempt?: Submission;
}

export const QuestionCard = ({ question, attempt }: QuestionCardProps) => {
  return (
    <div className="bg-card rounded-lg border border-border p-6 card-hover">
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-foreground line-clamp-2">
              {question.title}
            </h3>
          </div>
          <DifficultyBadge difficulty={question.difficulty} />
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2">{question.description}</p>

        <div className="flex flex-wrap gap-2">
          {question.categories.slice(0, 3).map((category) => (
            <span
              key={category}
              className="inline-flex items-center gap-1 px-2 py-1 bg-muted rounded text-xs text-muted-foreground"
            >
              <Tag className="w-3 h-3" />
              {category}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>{question.estimated_time}</span>
          </div>

          {attempt ? (
            <div className="flex items-center gap-3">
              <StatusBadge status={attempt.status} />
              <span className="text-sm font-medium">Score: {attempt.score}%</span>
              <div className="flex gap-2">
                <Link to={`/questions/${question.id}`}>
                  <Button variant="outline" size="sm">
                    Review
                  </Button>
                </Link>
                <Link to={`/practice/${question.id}`}>
                  <Button variant="outline" size="sm">
                    Retry
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <Link to={`/questions/${question.id}`}>
              <Button size="sm">
                Start Practice
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};
