import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppSidebar } from "@/components/AppSidebar";
import { QuestionCard } from "@/components/QuestionCard";
import { SkeletonCard } from "@/components/SkeletonCard";
import { EmptyState } from "@/components/EmptyState";
import { 
  Filter, 
  Search, 
  ChevronDown,
  Target,
  TrendingUp,
  CheckCircle,
  Star
} from "lucide-react";
import { useSidebar } from "@/contexts/SidebarContext";
import { problemService } from "@/services/problemService";
import { submissionService } from "@/services/submissionService";
import { authService } from "@/services/authService";
import type { Problem, Submission, User } from "@/types/api";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const navigate = useNavigate();
  const { isCollapsed } = useSidebar();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(true);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [user, setUser] = useState<User | null>(null);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Fetch user
      const storedUser = authService.getStoredUser();
      if (storedUser) {
        setUser(storedUser);
      }

      // Fetch all problems
      const problemsResponse = await problemService.getAllProblems(0, 100);
      setProblems(problemsResponse.problems);

      // Fetch user submissions
      try {
        const submissionsResponse = await submissionService.getMySubmissions(0, 100);
        setSubmissions(submissionsResponse.submissions);
      } catch (error) {
        console.error('Error fetching submissions:', error);
        setSubmissions([]);
      }
    } catch (error: any) {
      console.error('Error loading data:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getAttemptByProblemId = (problemId: string): Submission | undefined => {
    return submissions.find(sub => sub.problem_id === problemId);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const getDynamicSlogan = () => {
    const slogans = [
      "Master system design, one question at a time",
      "Build scalable solutions with confidence",
      "Design systems that scale to millions",
      "Think big, architect bigger",
      "From concepts to production-ready systems",
      "Scale your knowledge, scale your systems",
      "Design with purpose, build with precision",
      "Every great system starts with a great design"
    ];
    
    const today = new Date().toDateString();
    const seed = today + (user?.id || '');
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      const char = seed.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    const index = Math.abs(hash) % slogans.length;
    return slogans[index];
  };

  const getRecommendedQuestions = (): Problem[] => {
    const averageScore = submissions.length > 0
      ? submissions.reduce((sum, sub) => sum + sub.score, 0) / submissions.length
      : 0;

    const attemptedProblemIds = new Set(submissions.map(sub => sub.problem_id));
    const availableProblems = problems.filter(p => !attemptedProblemIds.has(p.id));

    let recommended: Problem[] = [];

    if (averageScore < 60) {
      recommended = availableProblems.filter(q => q.difficulty === "easy").slice(0, 3);
    } else if (averageScore < 80) {
      const easy = availableProblems.filter(q => q.difficulty === "easy").slice(0, 1);
      const medium = availableProblems.filter(q => q.difficulty === "medium").slice(0, 2);
      recommended = [...easy, ...medium];
    } else {
      const medium = availableProblems.filter(q => q.difficulty === "medium").slice(0, 1);
      const hard = availableProblems.filter(q => q.difficulty === "hard").slice(0, 2);
      recommended = [...medium, ...hard];
    }

    if (recommended.length < 3) {
      const remaining = availableProblems.filter(q => !recommended.includes(q)).slice(0, 3 - recommended.length);
      recommended = [...recommended, ...remaining];
    }

    return recommended.slice(0, 3);
  };

  const getFilteredQuestions = (): Problem[] => {
    let filtered = problems;

    if (searchTerm) {
      filtered = filtered.filter(q => 
        q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.categories.some(cat => cat.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedDifficulty !== "all") {
      filtered = filtered.filter(q => q.difficulty === selectedDifficulty.toLowerCase());
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter(q => q.categories.includes(selectedCategory));
    }

    if (selectedStatus !== "all") {
      const attemptedProblemIds = new Set(submissions.map(sub => sub.problem_id));
      if (selectedStatus === "attempted") {
        filtered = filtered.filter(q => attemptedProblemIds.has(q.id));
      } else if (selectedStatus === "not-attempted") {
        filtered = filtered.filter(q => !attemptedProblemIds.has(q.id));
      }
    }

    return filtered;
  };

  const filteredQuestions = getFilteredQuestions();
  const recommendedQuestions = getRecommendedQuestions();
  const categories = [...new Set(problems.flatMap(q => q.categories))];
  const completionRate = problems.length > 0 
    ? Math.round((submissions.length / problems.length) * 100) 
    : 0;
  const averageScore = submissions.length > 0
    ? Math.round(submissions.reduce((sum, sub) => sum + sub.score, 0) / submissions.length)
    : 0;

  return (
    <div className="flex min-h-screen w-full bg-background">
      <AppSidebar />
      <main className={`flex-1 transition-all duration-300 p-4 md:p-8 ${
        isCollapsed ? 'md:ml-16' : 'md:ml-64'
      } ml-0`}>
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* Header Section */}
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-foreground">
              {getGreeting()}, {user?.first_name || 'there'}! 👋
            </h1>
            <p className="text-lg text-muted-foreground italic">
              "{getDynamicSlogan()}"
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center">
                  <Target className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Questions Attempted</p>
                  <p className="text-2xl font-bold text-foreground">{submissions.length}</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">Keep practicing!</p>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Average Score</p>
                  <p className="text-2xl font-bold text-foreground">{averageScore}%</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">Great progress!</p>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Completion Rate</p>
                  <p className="text-2xl font-bold text-foreground">{completionRate}%</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">You're doing amazing!</p>
            </div>
          </div>



           {/* Recommended Questions Section */}
           {recommendedQuestions.length > 0 && (
             <section className="space-y-4">
               <div className="flex items-center space-x-2">
                 <Star className="w-5 h-5 text-yellow-500" />
                 <h2 className="text-2xl font-semibold text-foreground">Recommended for You</h2>
               </div>
               
               {isLoading ? (
                 <div className="space-y-4">
                   {[...Array(3)].map((_, i) => (
                     <div key={i} className="w-full">
                       <SkeletonCard />
                     </div>
                   ))}
                 </div>
               ) : (
                 <div className="space-y-4">
                   {recommendedQuestions.map((question) => (
                     <div key={question.id} className="w-full group">
                       <div className="relative">
                         <div className="absolute -top-2 -right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                           <div className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full font-medium flex items-center space-x-1 shadow-lg">
                             <Star className="w-3 h-3" />
                             <span>Recommended</span>
                           </div>
                         </div>
                         <div className="transform transition-transform duration-200 hover:scale-[1.01]">
                           <QuestionCard
                             question={question}
                             attempt={getAttemptByProblemId(question.id)}
                           />
                         </div>
                       </div>
                     </div>
                   ))}
                 </div>
               )}
             </section>
           )}

           {/* All Questions Section */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">All Questions</h2>

              {/* Search and Filter Section - Only for All Questions */}
              <div className="flex items-center space-x-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search questions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center space-x-2 px-4 py-2 bg-background border border-border hover:bg-muted/50 rounded-lg transition-colors"
                >
                  <Filter className="w-4 h-4" />
                  <span>Filter</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {/* Filter Options - Only for All Questions */}
              {showFilters && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg border border-border">
                  {/* Difficulty Filter */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Difficulty</label>
                    <select
                      value={selectedDifficulty}
                      onChange={(e) => setSelectedDifficulty(e.target.value)}
                      className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="all">All Difficulties</option>
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>

                  {/* Category Filter */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Category</label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="all">All Categories</option>
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>

                  {/* Status Filter */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Status</label>
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="all">All Questions</option>
                      <option value="attempted">Attempted</option>
                      <option value="not-attempted">Not Attempted</option>
                    </select>
                  </div>
                </div>
              )}

            {/* Questions List - Single Column */}
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="w-full">
                    <SkeletonCard />
                  </div>
                ))}
              </div>
            ) : filteredQuestions.length > 0 ? (
              <div className="space-y-4">
                {filteredQuestions.map((question) => (
                  <div key={question.id} className="w-full">
                    <QuestionCard
                      question={question}
                      attempt={getAttemptByProblemId(question.id)}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-16">
                <EmptyState
                  icon={Search}
                  title="No questions found"
                  description="Try adjusting your search terms or filters to find more questions."
                />
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
