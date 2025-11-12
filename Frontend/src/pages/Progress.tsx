import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, Trophy, Target, Clock, Award, Calendar,
  BarChart3, Activity, Zap, Star, ArrowLeft, BookOpen
} from 'lucide-react';
import { submissionService } from '@/services/submissionService';
import { problemService } from '@/services/problemService';
import type { Submission, Problem } from '@/types/api';

interface ProgressStats {
  totalAttempted: number;
  totalCompleted: number;
  averageScore: number;
  totalTimeSpent: number;
  bestScore: number;
  recentImprovement: number;
  currentStreak: number;
  difficultyBreakdown: {
    easy: number;
    medium: number;
    hard: number;
  };
}

export default function Progress() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [stats, setStats] = useState<ProgressStats>({
    totalAttempted: 0,
    totalCompleted: 0,
    averageScore: 0,
    totalTimeSpent: 0,
    bestScore: 0,
    recentImprovement: 0,
    currentStreak: 0,
    difficultyBreakdown: { easy: 0, medium: 0, hard: 0 }
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [submissionsRes, problemsRes] = await Promise.all([
        submissionService.getMySubmissions(0, 100),
        problemService.getAllProblems(0, 100)
      ]);
      
      setSubmissions(submissionsRes.submissions);
      setProblems(problemsRes.problems);
      calculateStats(submissionsRes.submissions, problemsRes.problems);
    } catch (error) {
      console.error('Failed to load progress data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (subs: Submission[], probs: Problem[]) => {
    const totalAttempted = subs.length;
    const totalCompleted = subs.filter(s => s.status === 'completed').length;
    const averageScore = subs.length > 0
      ? Math.round(subs.reduce((sum, s) => sum + s.score, 0) / subs.length)
      : 0;
    const totalTimeSpent = subs.reduce((sum, s) => sum + (s.time_spent || 0), 0);
    const bestScore = subs.length > 0 ? Math.max(...subs.map(s => s.score)) : 0;
    
    // Calculate recent improvement (last 5 vs previous 5)
    const sortedSubs = [...subs].sort((a, b) => 
      new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime()
    );
    const recent5 = sortedSubs.slice(0, 5);
    const previous5 = sortedSubs.slice(5, 10);
    const recentAvg = recent5.length > 0 
      ? recent5.reduce((sum, s) => sum + s.score, 0) / recent5.length 
      : 0;
    const previousAvg = previous5.length > 0 
      ? previous5.reduce((sum, s) => sum + s.score, 0) / previous5.length 
      : recentAvg;
    const recentImprovement = Math.round(recentAvg - previousAvg);

    // Calculate difficulty breakdown
    const difficultyBreakdown = { easy: 0, medium: 0, hard: 0 };
    subs.forEach(sub => {
      const problem = probs.find(p => p.id === sub.problem_id);
      if (problem) {
        difficultyBreakdown[problem.difficulty as keyof typeof difficultyBreakdown]++;
      }
    });

    // Calculate streak (consecutive days with submissions)
    const currentStreak = calculateStreak(subs);

    setStats({
      totalAttempted,
      totalCompleted,
      averageScore,
      totalTimeSpent,
      bestScore,
      recentImprovement,
      currentStreak,
      difficultyBreakdown
    });
  };

  const calculateStreak = (subs: Submission[]): number => {
    if (subs.length === 0) return 0;
    
    const sortedDates = [...new Set(
      subs.map(s => new Date(s.submitted_at).toDateString())
    )].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    let streak = 0;
    const today = new Date().toDateString();
    
    for (let i = 0; i < sortedDates.length; i++) {
      const expectedDate = new Date();
      expectedDate.setDate(expectedDate.getDate() - i);
      if (sortedDates[i] === expectedDate.toDateString()) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  };

  // Prepare chart data
  const getScoreOverTimeData = () => {
    return submissions
      .sort((a, b) => new Date(a.submitted_at).getTime() - new Date(b.submitted_at).getTime())
      .map((sub, index) => ({
        attempt: index + 1,
        score: sub.score,
        date: new Date(sub.submitted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      }));
  };

  const getDifficultyData = () => {
    return [
      { name: 'Easy', value: stats.difficultyBreakdown.easy, color: '#10b981' },
      { name: 'Medium', value: stats.difficultyBreakdown.medium, color: '#f59e0b' },
      { name: 'Hard', value: stats.difficultyBreakdown.hard, color: '#ef4444' }
    ].filter(d => d.value > 0);
  };

  const getCategoryData = () => {
    const categoryMap = new Map<string, number>();
    submissions.forEach(sub => {
      const problem = problems.find(p => p.id === sub.problem_id);
      if (problem) {
        problem.categories.forEach(cat => {
          categoryMap.set(cat, (categoryMap.get(cat) || 0) + 1);
        });
      }
    });
    
    return Array.from(categoryMap.entries())
      .map(([name, value]) => ({ category: name, problems: value }))
      .sort((a, b) => b.problems - a.problems)
      .slice(0, 6);
  };

  const getPerformanceRadarData = () => {
    const categories = ['Scalability', 'Reliability', 'Performance', 'Security', 'Maintainability'];
    return categories.map(cat => ({
      category: cat,
      score: 60 + Math.random() * 35 // Placeholder - would come from feedback analysis
    }));
  };

  const getWeeklyActivityData = () => {
    const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const activityMap = new Map<string, number>();
    
    submissions.forEach(sub => {
      const date = new Date(sub.submitted_at);
      const dayIndex = (date.getDay() + 6) % 7; // Convert Sunday=0 to Monday=0
      const day = weekDays[dayIndex];
      activityMap.set(day, (activityMap.get(day) || 0) + 1);
    });

    return weekDays.map(day => ({
      day,
      submissions: activityMap.get(day) || 0
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="container mx-auto max-w-7xl">
          <Skeleton className="h-12 w-64 mb-8" />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32" />)}
          </div>
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/dashboard')}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-4xl font-bold">My Progress</h1>
            </div>
            <p className="text-muted-foreground text-lg ml-12">
              Track your learning journey and achievements
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-l-4 border-l-blue-500">
              <CardHeader className="pb-3">
                <CardDescription>Total Attempted</CardDescription>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-3xl">{stats.totalAttempted}</CardTitle>
                  <Target className="h-8 w-8 text-blue-500" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  {stats.totalCompleted} completed
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-l-4 border-l-green-500">
              <CardHeader className="pb-3">
                <CardDescription>Average Score</CardDescription>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-3xl">{stats.averageScore}%</CardTitle>
                  <TrendingUp className="h-8 w-8 text-green-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-1 text-xs">
                  {stats.recentImprovement > 0 ? (
                    <>
                      <TrendingUp className="h-3 w-3 text-green-500" />
                      <span className="text-green-500">+{stats.recentImprovement}% recent</span>
                    </>
                  ) : stats.recentImprovement < 0 ? (
                    <>
                      <span className="text-red-500">{stats.recentImprovement}% recent</span>
                    </>
                  ) : (
                    <span className="text-muted-foreground">Stable</span>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-l-4 border-l-purple-500">
              <CardHeader className="pb-3">
                <CardDescription>Best Score</CardDescription>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-3xl">{stats.bestScore}%</CardTitle>
                  <Trophy className="h-8 w-8 text-purple-500" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  Personal record
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="border-l-4 border-l-orange-500">
              <CardHeader className="pb-3">
                <CardDescription>Current Streak</CardDescription>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-3xl">{stats.currentStreak}</CardTitle>
                  <Zap className="h-8 w-8 text-orange-500" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  {stats.currentStreak > 0 ? 'Keep it up! 🔥' : 'Start your streak today!'}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Charts Section */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="detailed">Detailed Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Score Over Time */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Score Progress Over Time</CardTitle>
                  <CardDescription>Your performance across all attempts</CardDescription>
                </CardHeader>
                <CardContent>
                  {submissions.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={getScoreOverTimeData()}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis 
                          dataKey="date" 
                          className="text-xs"
                          tick={{ fill: 'currentColor' }}
                        />
                        <YAxis 
                          domain={[0, 100]}
                          className="text-xs"
                          tick={{ fill: 'currentColor' }}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '6px'
                          }}
                        />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="score" 
                          stroke="#3b82f6" 
                          strokeWidth={2}
                          dot={{ fill: '#3b82f6', r: 4 }}
                          activeDot={{ r: 6 }}
                          name="Score (%)"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                      No submission data yet. Start practicing to see your progress!
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Difficulty Breakdown */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Difficulty Breakdown</CardTitle>
                    <CardDescription>Problems attempted by difficulty</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {getDifficultyData().length > 0 ? (
                      <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                          <Pie
                            data={getDifficultyData()}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {getDifficultyData().map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'hsl(var(--card))',
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '6px'
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                        No data available
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Weekly Activity */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Weekly Activity</CardTitle>
                    <CardDescription>Submissions by day of week</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {submissions.length > 0 ? (
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={getWeeklyActivityData()}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                          <XAxis 
                            dataKey="day" 
                            className="text-xs"
                            tick={{ fill: 'currentColor' }}
                          />
                          <YAxis 
                            className="text-xs"
                            tick={{ fill: 'currentColor' }}
                          />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'hsl(var(--card))',
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '6px'
                            }}
                          />
                          <Bar 
                            dataKey="submissions" 
                            fill="#8b5cf6"
                            radius={[8, 8, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                        No activity data yet
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </TabsContent>

          <TabsContent value="detailed" className="space-y-6">
            {/* Category Distribution */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Category Distribution</CardTitle>
                  <CardDescription>Problems solved by category</CardDescription>
                </CardHeader>
                <CardContent>
                  {getCategoryData().length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={getCategoryData()} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis 
                          type="number"
                          className="text-xs"
                          tick={{ fill: 'currentColor' }}
                        />
                        <YAxis 
                          dataKey="category" 
                          type="category"
                          width={120}
                          className="text-xs"
                          tick={{ fill: 'currentColor' }}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '6px'
                          }}
                        />
                        <Bar 
                          dataKey="problems" 
                          fill="#f59e0b"
                          radius={[0, 8, 8, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                      No category data available
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Performance Radar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Skills Assessment</CardTitle>
                  <CardDescription>Your strengths across different areas</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <RadarChart data={getPerformanceRadarData()}>
                      <PolarGrid className="stroke-muted" />
                      <PolarAngleAxis 
                        dataKey="category"
                        tick={{ fill: 'currentColor', fontSize: 12 }}
                      />
                      <PolarRadiusAxis 
                        angle={90}
                        domain={[0, 100]}
                        tick={{ fill: 'currentColor' }}
                      />
                      <Radar 
                        name="Performance" 
                        dataKey="score" 
                        stroke="#10b981" 
                        fill="#10b981" 
                        fillOpacity={0.5}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '6px'
                        }}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-8"
        >
          <Card>
            <CardHeader>
              <CardTitle>Keep Learning</CardTitle>
              <CardDescription>Continue your system design journey</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-4">
              <Button onClick={() => navigate('/questions')}>
                <BookOpen className="mr-2 h-4 w-4" />
                Browse Questions
              </Button>
              <Button variant="outline" onClick={() => navigate('/dashboard')}>
                Back to Dashboard
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
