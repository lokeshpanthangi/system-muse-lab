import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AppSidebar } from "@/components/AppSidebar";
import { StatCard } from "@/components/StatCard";
import { QuestionCard } from "@/components/QuestionCard";
import { Target, TrendingUp, Award } from "lucide-react";
import { mockUser, mockQuestions, getAttemptsByUserId, getAttemptByQuestionId } from "@/data/mockData";

export default function Dashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAuthenticated");
    if (isAuthenticated !== "true") {
      navigate("/auth");
    }
  }, [navigate]);

  const userAttempts = getAttemptsByUserId(mockUser.id);
  const availableQuestions = mockQuestions.filter(
    (q) => !getAttemptByQuestionId(q.id, mockUser.id)
  );
  const attemptedQuestions = mockQuestions.filter((q) =>
    getAttemptByQuestionId(q.id, mockUser.id)
  );

  return (
    <div className="flex min-h-screen w-full">
      <AppSidebar />
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-4xl font-bold mb-2">Welcome back, {mockUser.name}! 👋</h1>
            <p className="text-muted-foreground">
              Track your progress and continue learning system design
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              title="Questions Attempted"
              value={mockUser.stats.totalAttempts}
              icon={Target}
              trend={{ value: 12, isPositive: true }}
            />
            <StatCard
              title="Average Score"
              value={`${mockUser.stats.averageScore}%`}
              icon={TrendingUp}
              trend={{ value: 5, isPositive: true }}
            />
            <StatCard
              title="Completion Rate"
              value={`${mockUser.stats.completionRate}%`}
              icon={Award}
              trend={{ value: 8, isPositive: true }}
            />
          </div>

          {/* Available Questions */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold">Available Questions</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Start practicing with these system design challenges
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {availableQuestions.map((question) => (
                <QuestionCard key={question.id} question={question} />
              ))}
            </div>
          </section>

          {/* Attempted Questions */}
          {attemptedQuestions.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold">My Attempted Questions</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Review your past submissions and improve your scores
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {attemptedQuestions.map((question) => {
                  const attempt = getAttemptByQuestionId(question.id, mockUser.id);
                  return (
                    <QuestionCard key={question.id} question={question} attempt={attempt} />
                  );
                })}
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
