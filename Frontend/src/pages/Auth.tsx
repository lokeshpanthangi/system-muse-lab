import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Code, Users, Shield, Zap, BookOpen, Trophy, ArrowLeft, Moon, Sun } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const Auth: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (isSignUp) {
      if (!formData.firstName) {
        newErrors.firstName = 'First name is required';
      }
      if (!formData.lastName) {
        newErrors.lastName = 'Last name is required';
      }
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setIsLoading(true);
      // Simulate API call
      setTimeout(() => {
        console.log('Form submitted:', formData);
        navigate('/dashboard');
        setIsLoading(false);
      }, 1500);
    }
  };

  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength(formData.password);
  const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];

  const features = [
    {
      icon: Code,
      title: "AI-Powered Coding",
      description: "Practice with intelligent challenges that adapt to your skill level"
    },
    {
      icon: Users,
      title: "Global Community",
      description: "Connect with developers worldwide and learn together"
    },
    {
      icon: Shield,
      title: "Secure Platform",
      description: "Your data and progress are protected with enterprise-grade security"
    },
    {
      icon: Zap,
      title: "Instant Feedback",
      description: "Get real-time code analysis and improvement suggestions"
    },
    {
      icon: BookOpen,
      title: "Structured Learning",
      description: "Follow curated learning paths designed by industry experts"
    },
    {
      icon: Trophy,
      title: "Track Progress",
      description: "Monitor your growth with detailed analytics and achievements"
    }
  ];

  return (
    <div className={`min-h-screen flex ${isDark ? 'bg-[#171717]' : 'bg-gray-50'}`}>
      {/* Back Button and Theme Toggle */}
      <div className="absolute top-4 left-4 z-20">
        <button
          onClick={() => navigate('/')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
            isDark 
              ? 'bg-[#212121] text-white hover:bg-[#2a2a2a]' 
              : 'bg-white text-gray-700 hover:bg-gray-100'
          } shadow-md`}
        >
          <ArrowLeft size={20} />
          <span>Back to Home</span>
        </button>
      </div>

      <div className="absolute top-4 right-4 z-20">
        <button
          onClick={toggleTheme}
          className={`p-3 rounded-lg transition-all duration-200 ${
            isDark 
              ? 'bg-[#212121] text-orange-400 hover:bg-[#2a2a2a]' 
              : 'bg-white text-gray-700 hover:bg-gray-100'
          } shadow-md`}
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>

      {/* Left Half - No Animations */}
      <div className={`w-1/2 ${isDark ? 'bg-[#171717]' : 'bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700'} relative overflow-hidden`}>
        <div className="relative z-10 flex flex-col justify-center h-full p-12">
          <div className="max-w-lg">
            {/* Logo and Brand */}
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <div className={`w-12 h-12 ${isDark ? 'bg-orange-500/20' : 'bg-white/20'} rounded-xl flex items-center justify-center mr-4 backdrop-blur-sm border ${isDark ? 'border-orange-500/30' : 'border-white/30'}`}>
                  <Code className={`w-6 h-6 ${isDark ? 'text-orange-400' : 'text-white'}`} />
                </div>
                <div>
                  <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-white'}`}>System Muse Lab</h1>
                  <p className={`text-sm ${isDark ? 'text-orange-300' : 'text-orange-100'}`}>Code. Learn. Excel.</p>
                </div>
              </div>
            </div>

            {/* Dynamic Content based on Sign In/Up */}
            <div className="mb-8 transition-all duration-500 ease-in-out">
              {!isSignUp ? (
                <div>
                  <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-white'} mb-4`}>Welcome Back!</h2>
                  <p className={`text-lg mb-6 ${isDark ? 'text-orange-300' : 'text-orange-100'}`}>
                    Continue your coding journey and unlock new challenges that will push your skills to the next level.
                  </p>
                </div>
              ) : (
                <div>
                  <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-white'} mb-4`}>Start Your Journey</h2>
                  <p className={`text-lg mb-6 ${isDark ? 'text-orange-300' : 'text-orange-100'}`}>
                    Join thousands of developers who are mastering their craft with our AI-powered platform.
                  </p>
                </div>
              )}
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              {features.slice(0, 4).map((feature, index) => (
                <div 
                  key={feature.title}
                  className={`${isDark ? 'bg-[#212121] border-orange-500/20 hover:bg-[#2a2a2a]' : 'bg-white/10 border-white/20 hover:bg-white/20'} backdrop-blur-sm rounded-lg p-4 border transition-all duration-300`}
                >
                  <feature.icon className={`w-6 h-6 ${isDark ? 'text-orange-400' : 'text-white'} mb-2`} />
                  <h3 className={`${isDark ? 'text-white' : 'text-white'} font-semibold text-sm mb-1`}>{feature.title}</h3>
                  <p className={`${isDark ? 'text-orange-300' : 'text-orange-100'} text-xs`}>{feature.description}</p>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="flex space-x-6 text-center">
              <div>
                <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-white'}`}>10K+</div>
                <div className={`text-sm ${isDark ? 'text-orange-300' : 'text-orange-200'}`}>Active Users</div>
              </div>
              <div>
                <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-white'}`}>500+</div>
                <div className={`text-sm ${isDark ? 'text-orange-300' : 'text-orange-200'}`}>Challenges</div>
              </div>
              <div>
                <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-white'}`}>95%</div>
                <div className={`text-sm ${isDark ? 'text-orange-300' : 'text-orange-200'}`}>Success Rate</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Half - Enhanced Form */}
      <div className={`w-1/2 flex items-center justify-center p-12 ${isDark ? 'bg-[#171717]' : 'bg-white'}`}>
        <div className="w-full max-w-md">
          {/* Form Header */}
          <div className="text-center mb-8 animate-fade-in">
            <h2 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
              {isSignUp ? 'Create Account' : 'Sign In'}
            </h2>
            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
              {isSignUp ? 'Join our community of developers' : 'Welcome back! Please sign in to continue'}
            </p>
          </div>

          {/* Form Container with Border and Shadow */}
          <div className={`${isDark ? 'bg-[#212121] border-[#2a2a2a]' : 'bg-white border-gray-200'} rounded-2xl border shadow-xl p-8 animate-slide-up`}>
            <form onSubmit={handleSubmit} className="space-y-6">
              {isSignUp && (
                <div className="grid grid-cols-2 gap-4 animate-fade-in">
                  <div>
                    <input
                      type="text"
                      name="firstName"
                      placeholder="First Name"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg ${isDark ? 'bg-[#171717] border-[#2a2a2a] text-white placeholder-gray-400 focus:ring-orange-500' : 'border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-orange-500'} focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200`}
                    />
                    {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
                  </div>
                  <div>
                    <input
                       type="text"
                       name="lastName"
                       placeholder="Last Name"
                       value={formData.lastName}
                       onChange={handleInputChange}
                       className={`w-full px-4 py-3 border rounded-lg ${isDark ? 'bg-[#171717] border-[#2a2a2a] text-white placeholder-gray-400 focus:ring-orange-500' : 'border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-orange-500'} focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200`}
                     />
                    {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
                  </div>
                </div>
              )}

              <div className="animate-fade-in" style={{animationDelay: '0.1s'}}>
                <input
                   type="email"
                   name="email"
                   placeholder="Email Address"
                   value={formData.email}
                   onChange={handleInputChange}
                   className={`w-full px-4 py-3 border rounded-lg ${isDark ? 'bg-[#171717] border-[#2a2a2a] text-white placeholder-gray-400 focus:ring-orange-500' : 'border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-orange-500'} focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200`}
                 />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>

              <div className="relative animate-fade-in" style={{animationDelay: '0.2s'}}>
                <input
                   type={showPassword ? 'text' : 'password'}
                   name="password"
                   placeholder="Password"
                   value={formData.password}
                   onChange={handleInputChange}
                   className={`w-full px-4 py-3 pr-12 border rounded-lg ${isDark ? 'bg-[#171717] border-[#2a2a2a] text-white placeholder-gray-400 focus:ring-orange-500' : 'border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-orange-500'} focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200`}
                 />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'} transition-colors duration-200`}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
              </div>

              {isSignUp && (
                <>
                  <div className="relative animate-fade-in" style={{animationDelay: '0.3s'}}>
                    <input
                     type={showConfirmPassword ? 'text' : 'password'}
                     name="confirmPassword"
                     placeholder="Confirm Password"
                     value={formData.confirmPassword}
                     onChange={handleInputChange}
                     className={`w-full px-4 py-3 pr-12 border rounded-lg ${isDark ? 'bg-[#171717] border-[#2a2a2a] text-white placeholder-gray-400 focus:ring-orange-500' : 'border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-orange-500'} focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200`}
                   />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'} transition-colors duration-200`}
                    >
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                    {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
                  </div>

                  {formData.password && (
                    <div className="space-y-2 animate-fade-in" style={{animationDelay: '0.4s'}}>
                      <div className="flex space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className={`h-2 flex-1 rounded-full transition-all duration-300 ${
                              i < passwordStrength ? strengthColors[passwordStrength - 1] : 'bg-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Password strength: {strengthLabels[passwordStrength - 1] || 'Very Weak'}
                      </p>
                    </div>
                  )}
                </>
              )}

              {!isSignUp && (
                <div className="flex items-center justify-between animate-fade-in" style={{animationDelay: '0.3s'}}>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="mr-2 h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-300 rounded"
                    />
                    <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Remember me</span>
                  </label>
                  <button type="button" className="text-sm text-orange-500 hover:text-orange-600 transition-colors duration-200">
                    Forgot password?
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 px-4 rounded-lg hover:from-orange-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed animate-fade-in"
                style={{animationDelay: '0.5s'}}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Processing...
                  </div>
                ) : (
                  isSignUp ? 'Create Account' : 'Sign In'
                )}
              </button>
            </form>

            <div className="mt-6 text-center animate-fade-in" style={{animationDelay: '0.6s'}}>
              <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                <button
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-orange-500 hover:text-orange-600 font-medium transition-colors duration-200"
                >
                  {isSignUp ? 'Sign In' : 'Sign Up'}
                </button>
              </p>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="mt-8 text-center animate-fade-in" style={{animationDelay: '0.7s'}}>
            <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'} mb-2`}>Trusted by developers at</p>
            <div className={`flex justify-center space-x-4 ${isDark ? 'text-gray-400' : 'text-gray-400'}`}>
              <span className="text-sm font-semibold">Google</span>
              <span className="text-sm font-semibold">Microsoft</span>
              <span className="text-sm font-semibold">Meta</span>
              <span className="text-sm font-semibold">Netflix</span>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slide-in {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }
        
        .animate-slide-in {
          animation: slide-in 0.6s ease-out forwards;
        }
        
        .animate-slide-up {
          animation: slide-up 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default Auth;
