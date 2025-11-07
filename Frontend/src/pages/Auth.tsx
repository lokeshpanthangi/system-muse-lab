import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Code, Target, Trophy, Zap, Mail, Lock, ArrowLeft } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();
  const { isDark } = useTheme();

  const handleAuth = () => {
    navigate('/dashboard');
  };

  const features = [
    { icon: Code, title: 'Practice Real Coding', description: 'Master coding with hands-on challenges' },
    { icon: Target, title: 'Personalized Learning', description: 'AI-powered path tailored to your goals' },
    { icon: Trophy, title: 'Track Your Progress', description: 'Monitor growth with detailed analytics' },
    { icon: Zap, title: 'Instant Feedback', description: 'Get real-time code analysis' }
  ];

  return (
    <div className={`min-h-screen flex ${isDark ? 'bg-[#0a0a0a]' : 'bg-white'}`}>
      <Button variant="ghost" onClick={() => navigate('/')} className="absolute top-6 left-6 z-10">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <div className={`hidden lg:flex lg:w-1/2 ${isDark ? 'bg-gradient-to-br from-orange-900/20 via-[#0a0a0a] to-[#0a0a0a]' : 'bg-gradient-to-br from-orange-50 via-orange-100/50 to-white'} relative overflow-hidden`}>
        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20 w-full">
          <div className="mb-12">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center mr-4">
                <Code className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>System Muse Lab</h1>
                <p className="text-orange-500 font-medium">Code. Learn. Excel.</p>
              </div>
            </div>
          </div>
          <div className="mb-12">
            <h2 className={`text-4xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {isSignUp ? 'Start Your Coding Journey' : 'Welcome Back, Coder'}
            </h2>
            <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {isSignUp ? 'Join thousands of developers mastering their craft with AI-powered learning.' : 'Continue your path to coding excellence with personalized challenges.'}
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6">
            {features.map((feature) => (
              <div key={feature.title} className={`flex items-start space-x-4 p-6 rounded-xl border transition-all ${isDark ? 'bg-[#171717]/50 border-[#2a2a2a] hover:bg-[#171717]' : 'bg-white/60 border-orange-200/50 hover:bg-white'}`}>
                <div className="w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-6 h-6 text-orange-500" />
                </div>
                <div>
                  <h3 className={`font-semibold text-lg mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{feature.title}</h3>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={`w-full lg:w-1/2 flex items-center justify-center px-8 ${isDark ? 'bg-[#0a0a0a]' : 'bg-white'}`}>
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-500 rounded-xl mb-4">
              <Code className="w-8 h-8 text-white" />
            </div>
            <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>System Muse Lab</h1>
          </div>
          <div className="mb-8">
            <h2 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{isSignUp ? 'Sign up' : 'Sign in'}</h2>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{isSignUp ? 'Welcome! Please sign up to continue' : 'Welcome back! Please sign in to continue'}</p>
          </div>
          <Button variant="outline" className={`w-full mb-6 h-12 ${isDark ? 'border-[#2a2a2a] hover:bg-[#171717]' : 'border-gray-300 hover:bg-gray-50'}`} onClick={handleAuth}>
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google
          </Button>
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className={`w-full border-t ${isDark ? 'border-[#2a2a2a]' : 'border-gray-300'}`}></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className={`px-4 ${isDark ? 'bg-[#0a0a0a] text-gray-400' : 'bg-white text-gray-600'}`}>or sign in with email</span>
            </div>
          </div>
          <div className="space-y-4">
            {isSignUp && (
              <div className="grid grid-cols-2 gap-4">
                <Input type="text" placeholder="First name" className={isDark ? 'bg-[#171717] border-[#2a2a2a] h-12' : 'h-12'} />
                <Input type="text" placeholder="Last name" className={isDark ? 'bg-[#171717] border-[#2a2a2a] h-12' : 'h-12'} />
              </div>
            )}
            <div className="relative">
              <Mail className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
              <Input type="email" placeholder="Email id" className={`pl-10 h-12 ${isDark ? 'bg-[#171717] border-[#2a2a2a]' : ''}`} />
            </div>
            <div className="relative">
              <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
              <Input type="password" placeholder="Password" className={`pl-10 h-12 ${isDark ? 'bg-[#171717] border-[#2a2a2a]' : ''}`} />
            </div>
            {!isSignUp && (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox id="remember" checked={rememberMe} onCheckedChange={(checked) => setRememberMe(checked as boolean)} />
                  <label htmlFor="remember" className={`text-sm cursor-pointer ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Remember me</label>
                </div>
                <button className="text-sm text-orange-500 hover:text-orange-600">Forgot password?</button>
              </div>
            )}
            <Button onClick={handleAuth} className="w-full h-12 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 text-white text-base font-medium">
              {isSignUp ? 'Sign up' : 'Login'}
            </Button>
          </div>
          <div className="mt-6 text-center">
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {isSignUp ? "Already have an account?" : "Don't have an account?"}{' '}
              <button onClick={() => setIsSignUp(!isSignUp)} className="text-orange-500 hover:text-orange-600 font-medium">{isSignUp ? 'Sign in' : 'Sign up'}</button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
