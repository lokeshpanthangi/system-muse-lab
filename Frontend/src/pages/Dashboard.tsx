import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppSidebar } from "@/components/AppSidebar";
import { QuestionCard } from "@/components/QuestionCard";
import { SkeletonCard } from "@/components/SkeletonCard";
import { EmptyState } from "@/components/EmptyState";
import { 
  Star, 
  Filter, 
  Search, 
  BookOpen,
  ChevronDown,
  Sparkles
} from "lucide-react";
import { mockUser, mockQuestions, getAttemptsByUserId, getAttemptByQuestionId } from "@/data/mockData";

export default function Dashboard() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

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
    
    // Use a combination of date and user ID to ensure consistency per day but variety over time
    const today = new Date().toDateString();
    const seed = today + mockUser.id;
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      const char = seed.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    const index = Math.abs(hash) % slogans.length;
    return slogans[index];
  };

  // Get recommended questions based on user's progress and preferences
  const getRecommendedQuestions = () => {
    const userLevel = mockUser.stats.averageScore;
    let recommended = [];

    if (userLevel < 60) {
      // Beginner - recommend easy questions
      recommended = mockQuestions.filter(q => q.difficulty === "Easy" && !getAttemptByQuestionId(q.id, mockUser.id)).slice(0, 4);
    } else if (userLevel < 80) {
      // Intermediate - mix of easy and medium
      const easy = mockQuestions.filter(q => q.difficulty === "Easy" && !getAttemptByQuestionId(q.id, mockUser.id)).slice(0, 2);
      const medium = mockQuestions.filter(q => q.difficulty === "Medium" && !getAttemptByQuestionId(q.id, mockUser.id)).slice(0, 2);
      recommended = [...easy, ...medium];
    } else {
      // Advanced - medium and hard questions
      const medium = mockQuestions.filter(q => q.difficulty === "Medium" && !getAttemptByQuestionId(q.id, mockUser.id)).slice(0, 2);
      const hard = mockQuestions.filter(q => q.difficulty === "Hard" && !getAttemptByQuestionId(q.id, mockUser.id)).slice(0, 2);
      recommended = [...medium, ...hard];
    }

    // If not enough questions, fill with any available questions
    if (recommended.length < 4) {
      const remaining = availableQuestions.filter(q => !recommended.includes(q)).slice(0, 4 - recommended.length);
      recommended = [...recommended, ...remaining];
    }

    return recommended.slice(0, 4);
  };

  // Filter questions based on search and filters
  const getFilteredQuestions = () => {
    let filtered = mockQuestions;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(q => 
        q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply difficulty filter
    if (selectedDifficulty !== "all") {
      filtered = filtered.filter(q => q.difficulty === selectedDifficulty);
    }

    // Apply category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter(q => q.category === selectedCategory);
    }

    // Apply status filter
    if (selectedStatus !== "all") {
      if (selectedStatus === "attempted") {
        filtered = filtered.filter(q => getAttemptByQuestionId(q.id, mockUser.id));
      } else if (selectedStatus === "not-attempted") {
        filtered = filtered.filter(q => !getAttemptByQuestionId(q.id, mockUser.id));
      }
    }

    return filtered;
  };

  const recommendedQuestions = getRecommendedQuestions();
  const filteredQuestions = getFilteredQuestions();
  const categories = [...new Set(mockQuestions.map(q => q.category))];

  return (
    <div className="flex min-h-screen w-full bg-background">
      <AppSidebar />
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-4xl mx-auto space-y-12">
          
          {/* User Greeting Section */}
          <div className="text-center space-y-4 py-12">
            <h1 className="text-4xl font-bold text-foreground">
              {getGreeting()}, {mockUser.name}! 👋
            </h1>
            
            <p className="text-xl text-muted-foreground italic">
              "{getDynamicSlogan()}"
            </p>
          </div>

          {/* Recommended Questions Section */}
          <section className="space-y-8">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center space-x-3">
                <Sparkles className="w-8 h-8 text-yellow-500" />
                <h2 className="text-4xl font-bold text-foreground">Recommended for You</h2>
              </div>
              <p className="text-lg text-muted-foreground">
                Personalized questions based on your skill level and learning progress
              </p>
            </div>

            {isLoading ? (
              <div className="space-y-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="w-full">
                    <SkeletonCard />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-6">
                {recommendedQuestions.map((question) => (
                  <div key={question.id} className="relative w-full">
                    <div className="absolute -top-3 -right-3 z-10">
                      <div className="bg-yellow-500 text-white text-sm px-4 py-2 rounded-full font-medium flex items-center space-x-2 shadow-lg">
                        <Star className="w-4 h-4" />
                        <span>Recommended</span>
                      </div>
                    </div>
                    <div className="w-full">
                      <QuestionCard
                        question={question}
                        isAttempted={!!getAttemptByQuestionId(question.id, mockUser.id)}
                        attempt={getAttemptByQuestionId(question.id, mockUser.id)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* All Questions Section */}
          <section className="space-y-8">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center space-x-3">
                <BookOpen className="w-8 h-8 text-blue-500" />
                <h2 className="text-4xl font-bold text-foreground">All Questions</h2>
              </div>
              <div className="flex items-center justify-center space-x-4">
                <span className="bg-muted text-muted-foreground text-lg px-4 py-2 rounded-full">
                  {filteredQuestions.length} questions available
                </span>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center space-x-2 px-6 py-3 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg transition-colors text-lg"
                >
                  <Filter className="w-5 h-5" />
                  <span>Filters</span>
                  <ChevronDown className={`w-5 h-5 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                </button>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="space-y-6">
              {/* Search Bar */}
              <div className="relative max-w-2xl mx-auto">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search questions by title or category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-14 pr-6 py-4 text-lg bg-muted/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              {/* Filter Options */}
              {showFilters && (
                <div className="max-w-4xl mx-auto">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-8 bg-muted/30 rounded-xl border border-border">
                    {/* Difficulty Filter */}
                    <div>
                      <label className="block text-lg font-medium text-foreground mb-3">Difficulty</label>
                      <select
                        value={selectedDifficulty}
                        onChange={(e) => setSelectedDifficulty(e.target.value)}
                        className="w-full px-4 py-3 text-lg bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="all">All Difficulties</option>
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                      </select>
                    </div>

                    {/* Category Filter */}
                    <div>
                      <label className="block text-lg font-medium text-foreground mb-3">Category</label>
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full px-4 py-3 text-lg bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="all">All Categories</option>
                        {categories.map(category => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    </div>

                    {/* Status Filter */}
                    <div>
                      <label className="block text-lg font-medium text-foreground mb-3">Status</label>
                      <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="w-full px-4 py-3 text-lg bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="all">All Questions</option>
                        <option value="attempted">Attempted</option>
                        <option value="not-attempted">Not Attempted</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Questions List - Single Column */}
            {isLoading ? (
              <div className="space-y-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="w-full">
                    <SkeletonCard />
                  </div>
                ))}
              </div>
            ) : filteredQuestions.length > 0 ? (
              <div className="space-y-6">
                {filteredQuestions.map((question) => (
                  <div key={question.id} className="w-full">
                    <QuestionCard
                      question={question}
                      isAttempted={!!getAttemptByQuestionId(question.id, mockUser.id)}
                      attempt={getAttemptByQuestionId(question.id, mockUser.id)}
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
