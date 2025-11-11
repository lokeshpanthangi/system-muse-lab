import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTheme } from "next-themes";
import { Excalidraw } from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css";
import { AIChat } from "../components/AIChat";
import { createSession, autosaveSession, checkSession, submitSession, getProblem, createSubmissionFromSession, getProblemSubmissions, streamChat } from "../lib/api";
import type { SessionResponse, SessionCheckResponse, SessionSubmitResponse, Problem } from "../types/api";

export default function Practice() {
  const navigate = useNavigate();
  const { id: problemId } = useParams<{ id: string }>();
  const { theme, systemTheme, setTheme } = useTheme();
  const [excalidrawAPI, setExcalidrawAPI] = useState<any>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(40); // Percentage width
  const [isResizing, setIsResizing] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackType, setFeedbackType] = useState<'check' | 'submit' | null>(null);
  const [feedbackContent, setFeedbackContent] = useState<any>(null);
  const [submitResult, setSubmitResult] = useState<SessionSubmitResponse | null>(null);
  const [activeTab, setActiveTab] = useState('question'); // 'question', 'ai-insights', 'solutions'
  
  // Session state
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionStartTime, setSessionStartTime] = useState<number>(Date.now());
  const [timeSpent, setTimeSpent] = useState<number>(0);
  const [isCheckingFeedback, setIsCheckingFeedback] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Submissions state
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  
  // Hash tracking for optimization
  const [lastSavedHash, setLastSavedHash] = useState<string>('');
  const [lastCheckHash, setLastCheckHash] = useState<string>('');
  const [lastCheckFeedback, setLastCheckFeedback] = useState<any>(null);
  
  // Problem state
  const [problem, setProblem] = useState<Problem | null>(null);
  const [isLoadingProblem, setIsLoadingProblem] = useState(true);
  
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

  // Update canvas background when theme changes
  useEffect(() => {
    if (excalidrawAPI) {
      const bgColor = excalidrawTheme === "dark" ? "#ffffff" : "#000000";
      excalidrawAPI.updateScene({
        appState: {
          viewBackgroundColor: bgColor
        }
      });
    }
  }, [excalidrawTheme, excalidrawAPI]);

  // Function to calculate hash of diagram data
  const calculateDiagramHash = (elements: any) => {
    const dataStr = JSON.stringify(elements);
    // Simple hash function (for production, consider using crypto-js or similar)
    let hash = 0;
    for (let i = 0; i < dataStr.length; i++) {
      const char = dataStr.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString(16);
  };

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
    if (!chatInput.trim() || !sessionId) return;

    const userMessage = {
      id: Date.now().toString(),
      type: 'user' as const,
      content: chatInput.trim(),
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setIsTyping(true);

    // Create AI message placeholder for streaming
    const aiMessageId = (Date.now() + 1).toString();
    const aiMessage = {
      id: aiMessageId,
      type: 'ai' as const,
      content: '',
      timestamp: new Date()
    };
    setChatMessages(prev => [...prev, aiMessage]);

    try {
      // Get current diagram data (only send elements)
      const diagramData = excalidrawAPI ? {
        elements: excalidrawAPI.getSceneElements()
      } : { elements: [] };

      // Call streaming endpoint
      const response = await streamChat(
        sessionId,
        userMessage.content,
        diagramData
      );

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      // Handle REAL streaming response (SSE)
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        let accumulatedContent = '';
        
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) break;
          
          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const content = line.slice(6); // Remove 'data: ' prefix
              if (content.trim() && !content.startsWith('ERROR:')) {
                accumulatedContent += content;
                
                // Update AI message with accumulated content (REAL STREAMING!)
                setChatMessages(prev => prev.map(msg => 
                  msg.id === aiMessageId 
                    ? { ...msg, content: accumulatedContent }
                    : msg
                ));
              }
            }
          }
        }
      }

      setIsTyping(false);
      
    } catch (error) {
      console.error('Error in chat:', error);
      
      // Add error message
      setChatMessages(prev => prev.map(msg => 
        msg.id === aiMessageId 
          ? { ...msg, content: 'Sorry, I encountered an error. Please try again.' }
          : msg
      ));
      
      setIsTyping(false);
    }
  };

  // Function to handle Enter key press in chat input
  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleGoBack = () => {
    // Navigate back to the main questions page
    window.history.back();
  };

  // Load problem data on component mount
  useEffect(() => {
    const loadProblem = async () => {
      if (!problemId) {
        console.error('No problem ID provided');
        navigate('/dashboard');
        return;
      }

      try {
        setIsLoadingProblem(true);
        const problemData = await getProblem(problemId);
        setProblem(problemData);
      } catch (error) {
        console.error('Failed to load problem:', error);
        // Navigate back if problem not found
        navigate('/dashboard');
      } finally {
        setIsLoadingProblem(false);
      }
    };

    loadProblem();
  }, [problemId, navigate]);

  // Initialize session on component mount
  useEffect(() => {
    const initializeSession = async () => {
      if (!problemId) return;

      try {
        const response = await createSession({ 
          problem_id: problemId,
          diagram_data: {} 
        });
        
        if (response.id) {
          setSessionId(response.id);
          setSessionStartTime(Date.now());
          console.log('Session created:', response.id);

          // Load previous session data if it exists (for retry)
          if (response.diagram_data && response.diagram_data.elements && excalidrawAPI) {
            console.log('Loading previous session data...');
            const currentAppState = excalidrawAPI.getAppState();
            excalidrawAPI.updateScene({
              elements: response.diagram_data.elements,
              appState: {
                ...currentAppState,
                ...(response.diagram_data.appState || {}),
                collaborators: currentAppState.collaborators || new Map(),
              }
            });
          }
        }
      } catch (error) {
        console.error('Failed to create session:', error);
      }
    };

    if (problemId && !isLoadingProblem) {
      initializeSession();
    }
  }, [problemId, isLoadingProblem, excalidrawAPI]);

  // Load submissions when Solutions tab is active
  useEffect(() => {
    const loadSubmissions = async () => {
      if (activeTab === 'solutions' && problemId && !loadingSubmissions) {
        setLoadingSubmissions(true);
        try {
          const subs = await getProblemSubmissions(problemId);
          setSubmissions(subs);
        } catch (error) {
          console.error('Failed to load submissions:', error);
        } finally {
          setLoadingSubmissions(false);
        }
      }
    };

    loadSubmissions();
  }, [activeTab, problemId]);

  // Auto-save session every 10 seconds
  useEffect(() => {
    if (!sessionId || !excalidrawAPI) return;

    const autoSaveInterval = setInterval(async () => {
      try {
        const elements = excalidrawAPI.getSceneElements();
        const appState = excalidrawAPI.getAppState();
        const currentTimeSpent = Math.floor((Date.now() - sessionStartTime) / 1000);

        // Calculate hash of current diagram
        const currentHash = calculateDiagramHash(elements);

        // Only save if diagram changed OR if it's the first save
        if (currentHash !== lastSavedHash || !lastSavedHash) {
          console.log('Auto-saving... Elements:', elements.length, 'Hash:', currentHash);
          
          await autosaveSession(sessionId, {
            diagram_data: {
              elements,
              appState
            },
            time_spent: currentTimeSpent
          });

          setLastSavedHash(currentHash);
          setTimeSpent(currentTimeSpent);
          console.log('✓ Auto-saved successfully at', new Date().toLocaleTimeString());
        } else {
          console.log('⊘ Skipped auto-save (no changes) at', new Date().toLocaleTimeString());
        }
      } catch (error) {
        console.error('✗ Auto-save failed:', error);
        // Don't throw, just log - auto-save should be non-blocking
      }
    }, 10000); // 10 seconds

    return () => clearInterval(autoSaveInterval);
  }, [sessionId, excalidrawAPI, sessionStartTime, lastSavedHash]);

  // Update Excalidraw theme when system theme changes
  useEffect(() => {
    if (excalidrawAPI) {
      const currentAppState = excalidrawAPI.getAppState();
      excalidrawAPI.updateScene({
        appState: {
          ...currentAppState,
          theme: excalidrawTheme,
          viewBackgroundColor: "#ffffff", // Always white background
        }
      });
    }
  }, [excalidrawTheme, excalidrawAPI]);

  const handleCheck = async () => {
    console.log('Check button clicked');
    
    if (!sessionId) {
      console.error('No active session');
      alert('No active session found. Please refresh the page.');
      return;
    }

    if (!excalidrawAPI) {
      console.error('Excalidraw API not ready');
      alert('Canvas not ready. Please wait a moment and try again.');
      return;
    }

    setIsCheckingFeedback(true);
    
    try {
      const elements = excalidrawAPI.getSceneElements();
      const appState = excalidrawAPI.getAppState();
      const currentTimeSpent = Math.floor((Date.now() - sessionStartTime) / 1000);

      console.log('Current elements count:', elements.length);

      // Calculate hash of current diagram
      const currentHash = calculateDiagramHash(elements);
      console.log('Current hash:', currentHash, 'Last check hash:', lastCheckHash);

      // Check if diagram hasn't changed since last check
      if (currentHash === lastCheckHash && lastCheckFeedback) {
        console.log('Using cached feedback (diagram unchanged)');
        
        // Show cached feedback
        setFeedbackContent({
          ...lastCheckFeedback,
          cached: true
        });
        setFeedbackType('check');
        setShowFeedback(true);
        setIsCheckingFeedback(false);
        return;
      }

      console.log('Saving current state...');
      // Diagram changed or first check - save and call API
      await autosaveSession(sessionId, {
        diagram_data: {
          elements,
          appState
        },
        time_spent: currentTimeSpent
      });

      console.log('Calling AI check API...');
      // Call AI check API
      const checkResponse: SessionCheckResponse = await checkSession(sessionId);
      console.log('AI check response received:', checkResponse);
      
      // The feedback is now a structured JSON object
      const feedback = {
        type: 'check',
        cached: checkResponse.cached,
        timestamp: checkResponse.timestamp,
        implemented: checkResponse.feedback.implemented || [],
        missing: checkResponse.feedback.missing || [],
        nextSteps: checkResponse.feedback.next_steps || []
      };

      // Save to cache
      setLastCheckHash(currentHash);
      setLastCheckFeedback(feedback);
      setLastSavedHash(currentHash);

      setFeedbackContent(feedback);
      setFeedbackType('check');
      setShowFeedback(true);
    } catch (error) {
      console.error('Check failed with error:', error);
      
      // Show error feedback
      setFeedbackContent({
        type: 'check',
        implemented: [],
        missing: [`Failed to get AI feedback: ${error instanceof Error ? error.message : 'Unknown error'}`],
        nextSteps: ['Check your internet connection', 'Make sure you have drawn something on the canvas', 'Check browser console for more details']
      });
      setFeedbackType('check');
      setShowFeedback(true);
    } finally {
      setIsCheckingFeedback(false);
    }
  };

  const handleSubmit = async () => {
    console.log('Submit button clicked');
    
    if (!sessionId) {
      console.error('No active session');
      alert('No active session found. Please refresh the page.');
      return;
    }

    if (!excalidrawAPI) {
      console.error('Excalidraw API not ready');
      alert('Canvas not ready. Please wait a moment and try again.');
      return;
    }

    const elements = excalidrawAPI.getSceneElements();
    
    if (!elements || elements.length === 0) {
      alert('Cannot submit empty diagram. Please draw your solution first.');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const appState = excalidrawAPI.getAppState();
      const currentTimeSpent = Math.floor((Date.now() - sessionStartTime) / 1000);

      console.log('Saving current state before submit...');
      // Save one final time before submitting
      await autosaveSession(sessionId, {
        diagram_data: {
          elements,
          appState
        },
        time_spent: currentTimeSpent
      });

      console.log('Calling submit API...');
      // Call submit API
      const submitResponse: SessionSubmitResponse = await submitSession(sessionId);
      console.log('Submit response received:', submitResponse);
      
      // Prepare feedback content
      const feedbackContent = {
        score: submitResponse.score,
        maxScore: submitResponse.max_score,
        strengths: submitResponse.feedback.implemented,
        weaknesses: submitResponse.feedback.missing,
        learningResources: [
          ...submitResponse.resources.videos.map(v => ({
            title: v.title,
            url: v.url,
            description: v.reason || v.channel || 'Video tutorial'
          })),
          ...submitResponse.resources.docs.map(d => ({
            title: d.title,
            url: d.url,
            description: d.reason || d.source || 'Documentation'
          }))
        ],
        questions: submitResponse.tips || []
      };
      
      console.log('Navigating to results with feedbackContent:', feedbackContent);
      
      // Navigate to Results page with the submission data
      navigate('/results', {
        state: {
          feedbackContent,
          submissionId: submitResponse.submission_id
        }
      });
    } catch (error) {
      console.error('Submit failed with error:', error);
      console.error('Error type:', typeof error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      
      let errorMessage = 'Unknown error occurred';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null) {
        errorMessage = JSON.stringify(error);
      }
      
      // Show error feedback
      alert(`Failed to submit solution: ${errorMessage}\n\nPlease check:\n1. Backend server is running\n2. OPENAI_API_KEY is configured in .env\n3. Browser console for detailed errors`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Function to load a submission's diagram onto canvas
  const loadSubmissionDiagram = (submission: any) => {
    if (!excalidrawAPI || !submission.diagram_data) {
      alert('Canvas not ready or no diagram data');
      return;
    }

    try {
      const currentElements = excalidrawAPI.getSceneElements();
      const currentAppState = excalidrawAPI.getAppState();
      
      // Get submission elements
      const submissionElements = submission.diagram_data.elements || [];
      
      // Paste the submission elements (don't overwrite, just add them)
      excalidrawAPI.updateScene({
        elements: [...currentElements, ...submissionElements],
        appState: currentAppState
      });
      
      console.log('Loaded submission diagram with', submissionElements.length, 'elements');
      alert(`Loaded submission with score ${submission.score}/${submission.max_score}. Elements pasted on canvas!`);
    } catch (error) {
      console.error('Failed to load submission diagram:', error);
      alert('Failed to load submission diagram');
    }
  };

  const handleCheck_OLD = () => {
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

  const handleSubmit_OLD = () => {
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

            {/* Theme Toggle Button */}
            <button
              onClick={() => {
                const newTheme = currentTheme === "dark" ? "light" : "dark";
                setTheme(newTheme);
              }}
              title={`Switch to ${currentTheme === "dark" ? "Light" : "Dark"} Mode`}
              style={{
                position: "absolute",
                top: "10px",
                right: "60px",
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
              {currentTheme === "dark" ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5"/>
                  <line x1="12" y1="1" x2="12" y2="3"/>
                  <line x1="12" y1="21" x2="12" y2="23"/>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                  <line x1="1" y1="12" x2="3" y2="12"/>
                  <line x1="21" y1="12" x2="23" y2="12"/>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                </svg>
              )}
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
                  {isLoadingProblem ? (
                    <div className="flex items-center justify-center h-64">
                      <div className="text-center">
                        <svg className="animate-spin h-8 w-8 mx-auto mb-4 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <p className="text-muted-foreground">Loading problem...</p>
                      </div>
                    </div>
                  ) : problem ? (
                    <>
                      {/* Header */}
                      <div style={{ marginBottom: "20px" }}>
                        <h1 className="text-2xl font-bold text-sidebar-foreground mb-2">
                          {problem.title}
                        </h1>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          problem.difficulty === 'easy' ? 'bg-success/20 text-success' :
                          problem.difficulty === 'medium' ? 'bg-warning/20 text-warning' :
                          'bg-destructive/20 text-destructive'
                        }`}>
                          {problem.difficulty.charAt(0).toUpperCase() + problem.difficulty.slice(1)}
                        </span>
                      </div>

                      {/* Description */}
                      <div style={{ marginBottom: "24px" }}>
                        <h3 className="text-base font-semibold text-sidebar-foreground mb-3">
                          Problem Description
                        </h3>
                        <p className="text-muted-foreground leading-relaxed text-sm">
                          {problem.description}
                        </p>
                      </div>

                      {/* Requirements */}
                      {problem.requirements && problem.requirements.length > 0 && (
                        <div style={{ marginBottom: "24px" }}>
                          <h3 className="text-base font-semibold text-sidebar-foreground mb-3">
                            Requirements
                          </h3>
                          <div className="bg-card border border-sidebar-border rounded-lg p-4">
                            {problem.requirements.map((req, index) => (
                              <div key={index} className="text-sm leading-relaxed mb-1 text-muted-foreground">
                                {req}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Constraints */}
                      {problem.constraints && problem.constraints.length > 0 && (
                        <div style={{ marginBottom: "24px" }}>
                          <h3 className="text-base font-semibold text-sidebar-foreground mb-3">
                            Constraints
                          </h3>
                          <div className="bg-card border border-sidebar-border rounded-lg p-4">
                            {problem.constraints.map((constraint, index) => (
                              <div key={index} className="text-muted-foreground text-sm leading-relaxed mb-1">
                                {constraint}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Hints */}
                      {problem.hints && problem.hints.length > 0 && (
                        <div style={{ marginBottom: "24px" }}>
                          <h3 className="text-base font-semibold text-sidebar-foreground mb-3">
                            Hints
                          </h3>
                          <div className="bg-card border border-sidebar-border rounded-lg p-4">
                            {problem.hints.map((hint, index) => (
                              <div key={index} className="text-muted-foreground text-sm leading-relaxed mb-1">
                                💡 {hint}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex items-center justify-center h-64">
                      <p className="text-muted-foreground">Problem not found</p>
                    </div>
                  )}
                </>
              )}

              {/* AI Insights Tab Content */}
              {activeTab === 'ai-insights' && (
                <AIChat
                  messages={chatMessages}
                  isTyping={isTyping}
                  chatInput={chatInput}
                  onChatInputChange={setChatInput}
                  onSendMessage={handleSendMessage}
                  onKeyPress={handleKeyPress}
                />
              )}

              {/* Solutions Tab Content */}
              {activeTab === 'solutions' && (
                <div className="space-y-6">
                  <div className="text-center py-8">
                    <div className="text-4xl mb-4">💡</div>
                    <h2 className="text-xl font-bold text-sidebar-foreground mb-2">Your Solutions</h2>
                    <p className="text-muted-foreground text-sm mb-6">
                      View and load your previous submissions
                    </p>
                  </div>

                  {loadingSubmissions ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Loading submissions...
                    </div>
                  ) : submissions.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="text-6xl mb-4">📝</div>
                      <p className="text-muted-foreground text-sm">
                        No submissions yet. Complete and submit a solution to see it here!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {submissions.map((submission, index) => (
                        <div 
                          key={submission.submission_id}
                          className="bg-card border border-sidebar-border rounded-lg p-4 hover:border-primary/50 transition-colors cursor-pointer"
                          onClick={() => loadSubmissionDiagram(submission)}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-base font-semibold text-sidebar-foreground flex items-center gap-2">
                              📊 Submission #{submissions.length - index}
                            </h3>
                            <div className="flex items-center gap-2">
                              <span className={`text-lg font-bold ${
                                submission.score >= 80 ? 'text-green-600' :
                                submission.score >= 60 ? 'text-yellow-600' :
                                'text-red-600'
                              }`}>
                                {submission.score}/{submission.max_score}
                              </span>
                            </div>
                          </div>
                          
                          <div className="text-xs text-muted-foreground mb-3">
                            Submitted: {new Date(submission.submitted_at).toLocaleString()}
                          </div>
                          
                          <div className="text-xs text-muted-foreground mb-2">
                            Time spent: {Math.floor(submission.time_spent / 60)}m {submission.time_spent % 60}s
                          </div>
                          
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              loadSubmissionDiagram(submission);
                            }}
                            className="w-full mt-3 px-3 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded text-sm font-medium transition-colors"
                          >
                            📋 Load This Diagram
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
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
              viewBackgroundColor: excalidrawTheme === "dark" ? "#ffffff" : "#000000",
              collaborators: new Map(),
            },
          }}
          onChange={(elements, appState, files) => {
            console.log("Elements:", elements, "AppState:", appState, "Files:", files);
          }}
          onPointerUpdate={(payload) => {
            console.log("Pointer update:", payload);
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
          disabled={isCheckingFeedback}
          title={isCheckingFeedback ? "Analyzing your design..." : "Check - Get instant AI feedback on your current design"}
          className={`p-3 bg-primary text-primary-foreground border-none rounded-xl cursor-pointer flex items-center justify-center transition-all duration-300 shadow-lg min-w-12 min-h-12 relative ${
            isCheckingFeedback ? 'opacity-70 cursor-not-allowed' : 'hover:bg-primary/90 hover:scale-105'
          }`}
        >
          {isCheckingFeedback ? (
            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <CheckIcon />
          )}
        </button>
        
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          title={isSubmitting ? "Submitting..." : "Submit - Get your final score and detailed feedback"}
          className={`p-3 bg-success text-success-foreground border-none rounded-xl cursor-pointer flex items-center justify-center transition-all duration-300 shadow-lg min-w-12 min-h-12 ${
            isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:bg-success/90 hover:scale-105'
          }`}
        >
          {isSubmitting ? (
            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <SubmitIcon />
          )}
        </button>
      </div>

      {/* Feedback Modal - Only for Check */}
      {showFeedback && feedbackContent && feedbackType === 'check' && (
        <div className="fixed inset-0 bg-black/50 z-[2000] flex items-center justify-center p-5">
          <div className="bg-card border border-border rounded-xl p-8 max-w-3xl w-full max-h-[85vh] overflow-y-auto shadow-2xl relative">
            {/* Close Button */}
            <button
              onClick={() => setShowFeedback(false)}
              className="absolute top-4 right-4 bg-transparent border-none cursor-pointer p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
            >
              <CloseIcon />
            </button>

            {feedbackType === 'check' ? (
              <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-3xl font-bold text-card-foreground">
                    AI Design Feedback
                  </h2>
                  {feedbackContent.cached && (
                    <span className="text-xs bg-blue-500/10 text-blue-500 px-3 py-1.5 rounded-full border border-blue-500/20 font-medium">
                      Cached Response
                    </span>
                  )}
                </div>
                
                {/* What's Implemented Section */}
                {feedbackContent.implemented && feedbackContent.implemented.length > 0 && (
                  <div className="bg-success/5 border border-success/20 rounded-lg p-5">
                    <h3 className="text-lg font-semibold text-success mb-4 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      What's Implemented
                    </h3>
                    <ul className="space-y-2.5">
                      {feedbackContent.implemented.map((point: string, index: number) => (
                        <li key={index} className="flex items-start gap-3 text-card-foreground text-sm">
                          <span className="w-1.5 h-1.5 rounded-full bg-success mt-2 flex-shrink-0" />
                          <span className="leading-relaxed">{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* What's Missing Section */}
                {feedbackContent.missing && feedbackContent.missing.length > 0 && (
                  <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-5">
                    <h3 className="text-lg font-semibold text-destructive mb-4 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      What's Missing
                    </h3>
                    <ul className="space-y-2.5">
                      {feedbackContent.missing.map((point: string, index: number) => (
                        <li key={index} className="flex items-start gap-3 text-card-foreground text-sm">
                          <span className="w-1.5 h-1.5 rounded-full bg-destructive mt-2 flex-shrink-0" />
                          <span className="leading-relaxed">{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Next Steps Section */}
                {feedbackContent.nextSteps && feedbackContent.nextSteps.length > 0 && (
                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-5">
                    <h3 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                        <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                      </svg>
                      Next Steps
                    </h3>
                    <ol className="space-y-2.5">
                      {feedbackContent.nextSteps.map((step: string, index: number) => (
                        <li key={index} className="flex items-start gap-3 text-card-foreground text-sm">
                          <span className="w-6 h-6 rounded-full bg-primary/10 text-primary font-semibold flex items-center justify-center text-xs flex-shrink-0">
                            {index + 1}
                          </span>
                          <span className="leading-relaxed pt-0.5">{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}