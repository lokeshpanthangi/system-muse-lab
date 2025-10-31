import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "next-themes";
import { Excalidraw } from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css";

export default function Practice() {
  const navigate = useNavigate();
  const { theme, systemTheme } = useTheme();
  const [excalidrawAPI, setExcalidrawAPI] = useState<any>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(40); // Percentage width
  const [isResizing, setIsResizing] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackType, setFeedbackType] = useState<'check' | 'submit' | null>(null);
  const [feedbackContent, setFeedbackContent] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('question'); // 'question', 'ai-insights', 'solutions'
  
  // State for AI chatbot
  const [chatMessages, setChatMessages] = useState<Array<{id: string, type: 'user' | 'ai', content: string, timestamp: Date}>>([{
    id: '1',
    type: 'ai',
    content: 'Hello! I\'m your AI assistant. I can help you with system design questions and provide insights based on your current diagram. What would you like to know?',
    timestamp: new Date()
  }]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Determine the current theme for Excalidraw
  const currentTheme = theme === "system" ? systemTheme : theme;
  const excalidrawTheme = currentTheme === "dark" ? "dark" : "light";

  // Function to analyze current Excalidraw canvas
  const analyzeCanvas = () => {
    if (!excalidrawAPI) return null;
    
    const elements = excalidrawAPI.getSceneElements();
    const analysis = {
      totalElements: elements.length,
      rectangles: elements.filter(el => el.type === 'rectangle').length,
      ellipses: elements.filter(el => el.type === 'ellipse').length,
      arrows: elements.filter(el => el.type === 'arrow').length,
      text: elements.filter(el => el.type === 'text').length,
      diamonds: elements.filter(el => el.type === 'diamond').length,
      lines: elements.filter(el => el.type === 'line').length,
      hasComponents: elements.some(el => ['rectangle', 'ellipse', 'diamond'].includes(el.type)),
      hasConnections: elements.some(el => ['arrow', 'line'].includes(el.type)),
      hasLabels: elements.some(el => el.type === 'text'),
    };
    
    return analysis;
  };

  // Function to generate AI response based on canvas context
  const generateAIResponse = (userMessage: string, canvasAnalysis: any) => {
    const responses = {
      greeting: [
        "Hello! I can see your system design diagram. How can I help you improve it?",
        "Hi there! I'm analyzing your current design. What specific aspect would you like to discuss?",
      ],
      canvas_empty: [
        "I notice your canvas is empty. Would you like me to suggest some components to start with for this system design problem?",
        "Let's start building your system! I can help you identify the key components needed for this design.",
      ],
      has_components: [
        `Great! I can see you have ${canvasAnalysis.rectangles} rectangles, ${canvasAnalysis.ellipses} circles, and ${canvasAnalysis.arrows} arrows in your design. What would you like to focus on next?`,
        `Nice work! Your diagram has ${canvasAnalysis.totalElements} elements. Let me know if you'd like suggestions for improving the architecture.`,
      ],
      needs_connections: [
        "I see you have components but they're not connected yet. Would you like help with showing the data flow between them?",
        "Your components look good! Now let's think about how they communicate with each other.",
      ],
      scalability: [
        "For scalability, consider adding load balancers, caching layers, and database replicas to your design.",
        "To handle high traffic, you might want to add horizontal scaling components like multiple app servers.",
      ],
      database: [
        "For the database layer, consider whether you need SQL or NoSQL, and think about read replicas for better performance.",
        "Database design is crucial. Would you like to discuss partitioning, indexing, or caching strategies?",
      ],
      default: [
        "That's a great question! Based on your current diagram, I'd suggest focusing on the core components first.",
        "Let me help you with that. What specific part of the system design are you struggling with?",
      ]
    };

    const lowerMessage = userMessage.toLowerCase();
    
    if (canvasAnalysis.totalElements === 0) {
      return responses.canvas_empty[Math.floor(Math.random() * responses.canvas_empty.length)];
    } else if (canvasAnalysis.hasComponents && !canvasAnalysis.hasConnections) {
      return responses.needs_connections[Math.floor(Math.random() * responses.needs_connections.length)];
    } else if (lowerMessage.includes('scale') || lowerMessage.includes('performance')) {
      return responses.scalability[Math.floor(Math.random() * responses.scalability.length)];
    } else if (lowerMessage.includes('database') || lowerMessage.includes('data')) {
      return responses.database[Math.floor(Math.random() * responses.database.length)];
    } else if (canvasAnalysis.hasComponents) {
      return responses.has_components[Math.floor(Math.random() * responses.has_components.length)];
    } else {
      return responses.default[Math.floor(Math.random() * responses.default.length)];
    }
  };

  // Function to handle sending chat messages
  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      type: 'user' as const,
      content: chatInput.trim(),
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setIsTyping(true);

    // Simulate AI thinking time
    setTimeout(() => {
      const canvasAnalysis = analyzeCanvas();
      const aiResponse = generateAIResponse(userMessage.content, canvasAnalysis);
      
      const aiMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai' as const,
        content: aiResponse,
        timestamp: new Date()
      };

      setChatMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1000 + Math.random() * 2000); // Random delay between 1-3 seconds
  };

  // Function to handle Enter key press in chat input
  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const systemDesignQuestion = {
    title: "Design a URL Shortener (like bit.ly)",
    difficulty: "Medium",
    description: `Design a URL shortening service like bit.ly, TinyURL, or goo.gl. The service should be able to shorten long URLs and redirect users to the original URL when they access the shortened link.`,
    
    requirements: [
      "Functional Requirements:",
      "• URL shortening: Given a long URL, return a much shorter URL",
      "• URL redirecting: Given a short URL, redirect to the original URL",
      "• Custom aliases: Users can pick a custom short link for their URL",
      "• Analytics: Track number of clicks on short URLs",
      "",
      "Non-Functional Requirements:",
      "• The system should be highly available",
      "• URL redirection should happen in real-time with minimal latency",
      "• Shortened links should not be guessable (not predictable)",
      "• The system should handle 100M URLs per day"
    ],
    
    examples: [
      {
        title: "Example 1: Basic URL Shortening",
        input: "https://www.example.com/very/long/url/with/many/parameters?param1=value1&param2=value2",
        output: "https://short.ly/abc123",
        explanation: "The long URL is shortened to a 6-character identifier"
      },
      {
        title: "Example 2: Custom Alias",
        input: "https://www.github.com/user/repository",
        customAlias: "my-repo",
        output: "https://short.ly/my-repo",
        explanation: "User provides a custom alias for their shortened URL"
      }
    ],
    
    constraints: [
      "• 100:1 read/write ratio",
      "• 100M URLs shortened per day",
      "• 10B redirections per day",
      "• URL length can be up to 2048 characters",
      "• Shortened URL should be as short as possible"
    ],
    
    hints: [
      "Think about the database schema for storing URL mappings",
      "Consider how to generate unique short URLs",
      "Think about caching strategies for popular URLs",
      "Consider how to handle custom aliases and conflicts",
      "Think about analytics and tracking requirements"
    ]
  };

  const handleGoBack = () => {
    // Navigate back to the main questions page
    window.history.back();
  };

  const handleCheck = () => {
    if (!excalidrawAPI) return;
    
    const elements = excalidrawAPI.getSceneElements();
    
    // Analyze the current implementation
    const feedback = {
      type: 'check',
      analysis: {
        elementsCount: elements.length,
        hasComponents: elements.some(el => el.type === 'rectangle' || el.type === 'ellipse'),
        hasConnections: elements.some(el => el.type === 'arrow' || el.type === 'line'),
        hasText: elements.some(el => el.type === 'text'),
      },
      goodPoints: [],
      missing: [],
      nextSteps: []
    };

    // Evaluate what's good
    if (feedback.analysis.hasComponents) {
      feedback.goodPoints.push("✅ You've started adding system components");
    }
    if (feedback.analysis.hasConnections) {
      feedback.goodPoints.push("✅ Good job connecting components with arrows/lines");
    }
    if (feedback.analysis.hasText) {
      feedback.goodPoints.push("✅ You're labeling components - great for clarity");
    }
    if (elements.length > 5) {
      feedback.goodPoints.push("✅ You have a good number of components in your design");
    }

    // Identify what's missing
    if (!feedback.analysis.hasComponents) {
      feedback.missing.push("❌ Add system components (databases, servers, load balancers)");
    }
    if (!feedback.analysis.hasConnections) {
      feedback.missing.push("❌ Show data flow between components with arrows");
    }
    if (!feedback.analysis.hasText) {
      feedback.missing.push("❌ Label your components for better understanding");
    }
    if (elements.length < 3) {
      feedback.missing.push("❌ Add more components - URL shortener needs multiple services");
    }

    // Suggest next steps
    feedback.nextSteps = [
      "🔄 Add a load balancer for high availability",
      "🔄 Include a caching layer (Redis) for popular URLs", 
      "🔄 Show database sharding for scalability",
      "🔄 Add analytics service for tracking clicks",
      "🔄 Include CDN for global distribution"
    ];

    setFeedbackContent(feedback);
    setFeedbackType('check');
    setShowFeedback(true);
  };

  const handleSubmit = () => {
    if (!excalidrawAPI) return;
    
    const elements = excalidrawAPI.getSceneElements();
    
    // Calculate score based on implementation
    let score = 0;
    const maxScore = 100;
    
    const analysis = {
      hasLoadBalancer: elements.some(el => el.type === 'text' && el.text?.toLowerCase().includes('load balancer')),
      hasDatabase: elements.some(el => el.type === 'text' && el.text?.toLowerCase().includes('database')),
      hasCache: elements.some(el => el.type === 'text' && el.text?.toLowerCase().includes('cache')),
      hasAPI: elements.some(el => el.type === 'text' && el.text?.toLowerCase().includes('api')),
      hasConnections: elements.some(el => el.type === 'arrow' || el.type === 'line'),
      componentCount: elements.filter(el => el.type === 'rectangle' || el.type === 'ellipse').length
    };

    // Scoring logic
    if (analysis.hasLoadBalancer) score += 20;
    if (analysis.hasDatabase) score += 25;
    if (analysis.hasCache) score += 20;
    if (analysis.hasAPI) score += 15;
    if (analysis.hasConnections) score += 10;
    if (analysis.componentCount >= 5) score += 10;

    const feedback = {
      type: 'submit',
      score: Math.min(score, maxScore),
      maxScore,
      analysis,
      strengths: [],
      weaknesses: [],
      learningResources: [
        {
          title: "System Design Interview - URL Shortener",
          url: "https://www.youtube.com/watch?v=JQDHz72OA3c",
          description: "Comprehensive guide to designing URL shortener"
        },
        {
          title: "Database Sharding Explained", 
          url: "https://www.youtube.com/watch?v=5faMjKuB9bc",
          description: "Learn about scaling databases"
        },
        {
          title: "Load Balancing Concepts",
          url: "https://www.youtube.com/watch?v=K0Ta65OqQkY", 
          description: "Understanding load balancers in system design"
        },
        {
          title: "Caching Strategies",
          url: "https://www.youtube.com/watch?v=U3RkDLtS7uY",
          description: "Different caching patterns and when to use them"
        }
      ],
      questions: [
        "How would you handle 10 billion requests per day?",
        "What happens if your database goes down?", 
        "How do you prevent duplicate short URLs?",
        "How would you implement analytics tracking?",
        "What's your strategy for handling hot URLs?"
      ]
    };

    // Identify strengths
    if (analysis.hasLoadBalancer) feedback.strengths.push("✅ Included load balancer for high availability");
    if (analysis.hasDatabase) feedback.strengths.push("✅ Proper database design consideration");
    if (analysis.hasCache) feedback.strengths.push("✅ Caching layer for performance");
    if (analysis.hasAPI) feedback.strengths.push("✅ API layer separation");
    if (analysis.componentCount >= 5) feedback.strengths.push("✅ Good component breakdown");

    // Identify weaknesses
    if (!analysis.hasLoadBalancer) feedback.weaknesses.push("❌ Missing load balancer - critical for availability");
    if (!analysis.hasDatabase) feedback.weaknesses.push("❌ No clear database design shown");
    if (!analysis.hasCache) feedback.weaknesses.push("❌ Missing caching layer - important for performance");
    if (!analysis.hasConnections) feedback.weaknesses.push("❌ No data flow shown between components");
    if (analysis.componentCount < 3) feedback.weaknesses.push("❌ Too few components for a complete system");

    // Navigate to Results page with feedback data
    navigate('/results', { state: { feedbackContent: feedback } });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsResizing(true);
    e.preventDefault();
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizing) return;
    const newWidth = (e.clientX / window.innerWidth) * 100;
    if (newWidth >= 20 && newWidth <= 70) {
      setSidebarWidth(newWidth);
    }
  };

  const handleMouseUp = () => {
    setIsResizing(false);
  };

  React.useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isResizing]);

  // Icon components
  const BackIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M19 12H5M12 19l-7-7 7-7"/>
    </svg>
  );

  const SidebarIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
      <line x1="9" y1="9" x2="21" y2="9"/>
      <line x1="9" y1="15" x2="21" y2="15"/>
    </svg>
  );

  const ClearIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="3,6 5,6 21,6"/>
      <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"/>
      <line x1="10" y1="11" x2="10" y2="17"/>
      <line x1="14" y1="11" x2="14" y2="17"/>
    </svg>
  );

  const ExportIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="7,10 12,15 17,10"/>
      <line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
  );

  const CheckIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="20,6 9,17 4,12"/>
    </svg>
  );

  const SubmitIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
      <polyline points="22,4 12,14.01 9,11.01"/>
    </svg>
  );

  const CloseIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  );

  return (
    <div style={{ height: "100vh", width: "100vw", display: "flex" }}>
      {/* Back Button - Only show when sidebar is open */}
      {!sidebarCollapsed && (
        <div style={{
          position: "absolute",
          top: "10px",
          left: "10px",
          zIndex: 1000
        }}>
          <button
            onClick={handleGoBack}
            title="Back to Questions"
            style={{
              padding: "10px",
              backgroundColor: "transparent",
              color: "#6b7280",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s ease",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#f3f4f6";
              e.currentTarget.style.color = "#374151";
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.boxShadow = "0 4px 6px rgba(0,0,0,0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = "#6b7280";
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)";
            }}
          >
            <BackIcon />
          </button>
        </div>
      )}

      {/* Sidebar Toggle - Always visible when sidebar is collapsed */}
       {sidebarCollapsed && (
         <div style={{
           position: "absolute",
           top: "15px",
           left: "63px", // Moved further right to prevent overlap with Excalidraw
           zIndex: 1000,
           transition: "left 0.3s cubic-bezier(0.4, 0, 0.2, 1)" // Smooth transition animation
         }}>
           <button
             onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
             title="Show Sidebar"
             style={{
               padding: "10px",
               backgroundColor: "transparent",
               color: "#6b7280",
               border: "1px solid #e5e7eb",
               borderRadius: "8px",
               cursor: "pointer",
               display: "flex",
               alignItems: "center",
               justifyContent: "center",
               transition: "all 0.2s ease",
               boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
             }}
             onMouseEnter={(e) => {
               e.currentTarget.style.backgroundColor = "#f3f4f6";
               e.currentTarget.style.color = "#374151";
               e.currentTarget.style.transform = "translateY(-1px)";
               e.currentTarget.style.boxShadow = "0 4px 6px rgba(0,0,0,0.1)";
             }}
             onMouseLeave={(e) => {
               e.currentTarget.style.backgroundColor = "transparent";
               e.currentTarget.style.color = "#6b7280";
               e.currentTarget.style.transform = "translateY(0)";
               e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)";
             }}
           >
             <SidebarIcon />
           </button>
         </div>
       )}

      {/* Left Sidebar - Question Panel */}
      <div style={{ 
        width: sidebarCollapsed ? "0%" : `${sidebarWidth}%`, 
        overflowY: "hidden",
        padding: sidebarCollapsed ? "0" : "20px",
        paddingTop: sidebarCollapsed ? "0" : "60px", // Space for navigation buttons
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        opacity: sidebarCollapsed ? 0 : 1,
        position: "relative"
      }} className="bg-sidebar-background border-r border-sidebar-border">
        {!sidebarCollapsed && (
          <>
            {/* Sidebar Toggle Button - Right end of sidebar */}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              title="Hide Sidebar"
              style={{
                position: "absolute",
                top: "10px",
                right: "10px",
                zIndex: 1001,
                padding: "10px",
                backgroundColor: "transparent",
                color: "#6b7280",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s ease",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#f3f4f6";
                e.currentTarget.style.color = "#374151";
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.boxShadow = "0 4px 6px rgba(0,0,0,0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.color = "#6b7280";
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)";
              }}
            >
              <SidebarIcon />
            </button>

            {/* Tab Navigation */}
            <div className="flex border-b border-sidebar-border mb-4">
              <button
                onClick={() => setActiveTab('question')}
                className={`flex-1 py-3 px-4 text-sm font-medium transition-all duration-200 ${
                  activeTab === 'question'
                    ? 'text-primary border-b-2 border-primary bg-primary/5'
                    : 'text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent'
                }`}
              >
                Question
              </button>
              <button
                onClick={() => setActiveTab('ai-insights')}
                className={`flex-1 py-3 px-4 text-sm font-medium transition-all duration-200 ${
                  activeTab === 'ai-insights'
                    ? 'text-primary border-b-2 border-primary bg-primary/5'
                    : 'text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent'
                }`}
              >
                AI Insights
              </button>
              <button
                onClick={() => setActiveTab('solutions')}
                className={`flex-1 py-3 px-4 text-sm font-medium transition-all duration-200 ${
                  activeTab === 'solutions'
                    ? 'text-primary border-b-2 border-primary bg-primary/5'
                    : 'text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent'
                }`}
              >
                Solutions
              </button>
            </div>

            <div 
              style={{ 
                maxWidth: "100%", 
                height: "calc(100vh - 140px)", // Adjusted for tab navigation
                overflowY: "scroll",
                scrollbarWidth: "none", // Firefox
                msOverflowStyle: "none", // IE and Edge
                paddingRight: "10px"
              }}
              onWheel={(e) => {
                // Enable mouse wheel scrolling
                e.currentTarget.scrollTop += e.deltaY;
              }}
            >
              <style>
                {`
                  /* Hide scrollbar for Chrome, Safari and Opera */
                  div::-webkit-scrollbar {
                    display: none;
                  }
                `}
              </style>
              
              {/* Question Tab Content */}
              {activeTab === 'question' && (
                <>
                  {/* Header */}
                  <div style={{ marginBottom: "20px" }}>
                    <h1 className="text-2xl font-bold text-sidebar-foreground mb-2">
                      {systemDesignQuestion.title}
                    </h1>
                    <span className="bg-warning text-warning-foreground px-3 py-1 rounded-full text-xs font-semibold">
                      {systemDesignQuestion.difficulty}
                    </span>
                  </div>

                  {/* Description */}
                  <div style={{ marginBottom: "24px" }}>
                    <h3 className="text-base font-semibold text-sidebar-foreground mb-3">
                      Problem Description
                    </h3>
                    <p className="text-muted-foreground leading-relaxed text-sm">
                      {systemDesignQuestion.description}
                    </p>
                  </div>

                  {/* Requirements */}
                  <div style={{ marginBottom: "24px" }}>
                    <h3 className="text-base font-semibold text-sidebar-foreground mb-3">
                      Requirements
                    </h3>
                    <div className="bg-card border border-sidebar-border rounded-lg p-4">
                      {systemDesignQuestion.requirements.map((req, index) => (
                        <div key={index} className={`text-sm leading-relaxed mb-1 ${
                          req.startsWith("•") ? "text-muted-foreground" : "text-card-foreground"
                        } ${req.endsWith(":") ? "font-semibold" : "font-normal"} ${
                          req === "" ? "mb-2" : ""
                        }`}>
                          {req}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Constraints */}
                  <div style={{ marginBottom: "24px" }}>
                    <h3 className="text-base font-semibold text-sidebar-foreground mb-3">
                      Constraints
                    </h3>
                    <div className="bg-card border border-sidebar-border rounded-lg p-4">
                      {systemDesignQuestion.constraints.map((constraint, index) => (
                        <div key={index} className="text-muted-foreground text-sm leading-relaxed mb-1">
                          {constraint}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* AI Insights Tab Content */}
              {activeTab === 'ai-insights' && (
                <div className="flex flex-col h-full">
                  {/* Chat Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {chatMessages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                            message.type === 'user'
                              ? 'bg-primary text-primary-foreground ml-4'
                              : 'bg-card border border-sidebar-border mr-4'
                          }`}
                        >
                          <p className="leading-relaxed">{message.content}</p>
                          <p className={`text-xs mt-1 opacity-70 ${
                            message.type === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                          }`}>
                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    ))}
                    
                    {/* Typing Indicator */}
                    {isTyping && (
                      <div className="flex justify-start">
                        <div className="bg-card border border-sidebar-border rounded-lg px-3 py-2 mr-4">
                          <div className="flex items-center gap-1">
                            <div className="flex gap-1">
                              <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                              <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                              <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                            </div>
                            <span className="text-xs text-muted-foreground ml-2">AI is thinking...</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Chat Input */}
                  <div className="p-4 border-t border-sidebar-border bg-card/30">
                    <div className="flex gap-2">
                      <textarea
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Ask about your system design..."
                        className="flex-1 min-h-[40px] max-h-[120px] px-3 py-2 text-sm bg-background border border-sidebar-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        disabled={isTyping}
                        rows={1}
                        style={{ 
                          scrollbarWidth: 'thin',
                          scrollbarColor: 'hsl(var(--muted-foreground)) transparent'
                        }}
                      />
                      <button
                        onClick={handleSendMessage}
                        disabled={!chatInput.trim() || isTyping}
                        className="px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                      >
                        Send
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      💡 I can analyze your current diagram and provide contextual advice
                    </p>
                  </div>
                </div>
              )}

              {/* Solutions Tab Content */}
              {activeTab === 'solutions' && (
                <div className="space-y-6">
                  <div className="text-center py-8">
                    <div className="text-4xl mb-4">💡</div>
                    <h2 className="text-xl font-bold text-sidebar-foreground mb-2">Solutions</h2>
                    <p className="text-muted-foreground text-sm mb-6">
                      Explore different approaches and reference implementations
                    </p>
                  </div>

                  {/* Solution Approaches */}
                  <div className="space-y-4">
                    <div className="bg-card border border-sidebar-border rounded-lg p-4">
                      <h3 className="text-base font-semibold text-sidebar-foreground mb-3 flex items-center gap-2">
                        🎯 Approach 1: Basic Architecture
                      </h3>
                      <div className="text-sm text-muted-foreground leading-relaxed mb-3">
                        A simple, straightforward solution focusing on core functionality.
                      </div>
                      <div className="space-y-2">
                        <div className="text-xs font-medium text-success">✓ Pros:</div>
                        <div className="text-xs text-muted-foreground ml-4">
                          • Easy to implement and understand<br/>
                          • Lower complexity and maintenance
                        </div>
                        <div className="text-xs font-medium text-destructive mt-2">✗ Cons:</div>
                        <div className="text-xs text-muted-foreground ml-4">
                          • Limited scalability<br/>
                          • May not handle high traffic
                        </div>
                      </div>
                    </div>

                    <div className="bg-card border border-sidebar-border rounded-lg p-4">
                      <h3 className="text-base font-semibold text-sidebar-foreground mb-3 flex items-center gap-2">
                        🚀 Approach 2: Scalable Architecture
                      </h3>
                      <div className="text-sm text-muted-foreground leading-relaxed mb-3">
                        A more sophisticated solution with caching, load balancing, and microservices.
                      </div>
                      <div className="space-y-2">
                        <div className="text-xs font-medium text-success">✓ Pros:</div>
                        <div className="text-xs text-muted-foreground ml-4">
                          • Highly scalable and performant<br/>
                          • Fault tolerant and resilient
                        </div>
                        <div className="text-xs font-medium text-destructive mt-2">✗ Cons:</div>
                        <div className="text-xs text-muted-foreground ml-4">
                          • Higher complexity<br/>
                          • More infrastructure overhead
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Reference Links */}
                  <div className="bg-accent/10 border border-accent/20 rounded-lg p-4">
                    <h3 className="text-base font-semibold text-accent mb-3 flex items-center gap-2">
                      📚 Reference Materials
                    </h3>
                    <div className="space-y-2">
                      <a href="#" className="block text-sm text-primary hover:underline">
                        → System Design Primer
                      </a>
                      <a href="#" className="block text-sm text-primary hover:underline">
                        → High Scalability Blog
                      </a>
                      <a href="#" className="block text-sm text-primary hover:underline">
                        → AWS Architecture Center
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Resize Handle */}
            <div
              onMouseDown={handleMouseDown}
              style={{
                position: "absolute",
                right: "-2px",
                top: "0",
                bottom: "0",
                width: "4px",
                cursor: "col-resize",
                backgroundColor: isResizing ? "#3b82f6" : "transparent",
                transition: "background-color 0.2s ease",
                zIndex: 10
              }}
              onMouseEnter={(e) => {
                if (!isResizing) {
                  e.currentTarget.style.backgroundColor = "#e5e7eb";
                }
              }}
              onMouseLeave={(e) => {
                if (!isResizing) {
                  e.currentTarget.style.backgroundColor = "transparent";
                }
              }}
            />
          </>
        )}
      </div>

      {/* Right Side - Excalidraw Canvas */}
      <div style={{ 
        width: sidebarCollapsed ? "100%" : `${100 - sidebarWidth}%`,
        height: "100vh",
        transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        position: "relative" 
      }} className="bg-background">
        <Excalidraw
          excalidrawAPI={(api) => setExcalidrawAPI(api)}
          theme={excalidrawTheme}
          initialData={{
            elements: [],
            appState: {
              viewBackgroundColor: excalidrawTheme === "dark" ? "#1e1e1e" : "#ffffff",
            },
          }}
          onChange={(elements, appState, files) => {
            console.log("Elements:", elements, "AppState:", appState, "Files:", files);
          }}
          onPointerUpdate={(payload) => {
            console.log("Pointer update:", payload);
          }}
          onCollabButtonClick={() => {
            console.log("Collab button clicked");
          }}
          onLinkOpen={(element, event) => {
            console.log("Link opened:", element, event);
          }}
          langCode="en"
          renderTopRightUI={() => (
            <div style={{ display: "flex", gap: "8px", padding: "8px" }}>
              <button
                onClick={() => {
                  if (excalidrawAPI) {
                    excalidrawAPI.resetScene();
                  }
                }}
                className="bg-transparent border-none cursor-pointer p-2 rounded flex items-center justify-center transition-all duration-200 hover:bg-muted hover:scale-110"
                title="Clear Canvas"
              >
                <ClearIcon />
              </button>
              <button
                onClick={() => {
                  if (excalidrawAPI) {
                    const elements = excalidrawAPI.getSceneElements();
                    console.log("Current elements:", elements);
                  }
                }}
                className="bg-transparent border-none cursor-pointer p-2 rounded flex items-center justify-center transition-all duration-200 hover:bg-muted hover:scale-110"
                title="Export Design"
              >
                <ExportIcon />
              </button>
            </div>
          )}
        />
      </div>

      {/* Check and Submit Buttons - Right Side */}
      <div style={{
        position: "absolute",
        top: "50%",
        right: "20px",
        transform: "translateY(-50%)",
        zIndex: 1000,
        display: "flex",
        flexDirection: "column",
        gap: "12px"
      }}>
        <button
          onClick={handleCheck}
          title="Check - Get instant feedback on your current design"
          className="p-3 bg-primary text-primary-foreground border-none rounded-xl cursor-pointer flex items-center justify-center transition-all duration-300 shadow-lg hover:bg-primary/90 hover:scale-105 min-w-12 min-h-12"
        >
          <CheckIcon />
        </button>
        
        <button
          onClick={handleSubmit}
          title="Submit - Get your final score and detailed feedback"
          className="p-3 bg-success text-success-foreground border-none rounded-xl cursor-pointer flex items-center justify-center transition-all duration-300 shadow-lg hover:bg-success/90 hover:scale-105 min-w-12 min-h-12"
        >
          <SubmitIcon />
        </button>
      </div>

      {/* Feedback Modal - Only for Check */}
      {showFeedback && feedbackContent && feedbackType === 'check' && (
        <div className="fixed inset-0 bg-black/50 z-[2000] flex items-center justify-center p-5">
          <div className="bg-card border border-border rounded-xl p-6 max-w-2xl max-h-[80vh] overflow-y-auto shadow-2xl relative">
            {/* Close Button */}
            <button
              onClick={() => setShowFeedback(false)}
              className="absolute top-4 right-4 bg-transparent border-none cursor-pointer p-1 rounded text-muted-foreground hover:bg-muted"
            >
              <CloseIcon />
            </button>

            {feedbackType === 'check' ? (
              <div>
                <h2 className="text-2xl font-bold text-card-foreground mb-5">
                  📋 Implementation Check
                </h2>
                
                {feedbackContent.goodPoints.length > 0 && (
                  <div className="mb-5">
                    <h3 className="text-lg font-semibold text-success mb-3">
                      What's Good:
                    </h3>
                    {feedbackContent.goodPoints.map((point: string, index: number) => (
                      <div key={index} className="text-card-foreground mb-2 text-sm">
                        {point}
                      </div>
                    ))}
                  </div>
                )}

                {feedbackContent.missing.length > 0 && (
                  <div className="mb-5">
                    <h3 className="text-lg font-semibold text-destructive mb-3">
                      What's Missing:
                    </h3>
                    {feedbackContent.missing.map((point: string, index: number) => (
                      <div key={index} className="text-card-foreground mb-2 text-sm">
                        {point}
                      </div>
                    ))}
                  </div>
                )}

                <div>
                  <h3 className="text-lg font-semibold text-primary mb-3">
                    Next Steps:
                  </h3>
                  {feedbackContent.nextSteps.map((step: string, index: number) => (
                    <div key={index} className="text-card-foreground mb-2 text-sm">
                      {step}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}