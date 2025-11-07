import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/button';
import { ArrowRight, BookOpen, Target, Trophy, Users, Star, CheckCircle, Code, Zap, Shield, Globe, Award, TrendingUp, Sun, Moon, Menu, Info, Mail, Home } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const Landing = () => {
  const navigate = useNavigate();
  // Scroll state to toggle navbar background
  const [isScrolled, setIsScrolled] = useState(false);
  const { isDark, toggleTheme } = useTheme();

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAuthenticated");
    if (isAuthenticated === "true") {
      navigate('/dashboard');
    }
  }, [navigate]);

  // Scroll listener to show navbar background only after scrolling
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      setIsScrolled(scrollTop > 10);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleGetStarted = () => {
    navigate('/auth');
  };

  const scrollToFeatures = () => {
    const featuresSection = document.getElementById('features');
    featuresSection?.scrollIntoView({ behavior: 'smooth' });
  };

  const features = [
    {
      icon: Code,
      title: "Interactive Coding",
      description: "Practice with real coding challenges and get instant feedback on your solutions."
    },
    {
      icon: Target,
      title: "Personalized Learning",
      description: "AI-powered recommendations tailored to your skill level and learning goals."
    },
    {
      icon: Trophy,
      title: "Track Progress",
      description: "Monitor your improvement with detailed analytics and achievement badges."
    }
  ];

  const additionalFeatures = [
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Optimized platform for quick loading and seamless user experience."
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Your data is protected with enterprise-grade security measures."
    },
    {
      icon: Globe,
      title: "Global Community",
      description: "Connect with learners worldwide and participate in coding competitions."
    }
  ];

  const benefits = [
    "Master programming fundamentals",
    "Build real-world projects",
    "Get industry-ready skills",
    "Join a supportive community",
    "Access expert mentorship",
    "Earn recognized certificates"
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Software Engineer at Google",
      content: "Practisr helped me land my dream job. The interactive challenges are incredibly well-designed.",
      rating: 5
    },
    {
      name: "Marcus Johnson",
      role: "Full Stack Developer",
      content: "The personalized learning path made all the difference in my coding journey.",
      rating: 5
    },
    {
      name: "Elena Rodriguez",
      role: "CS Student",
      content: "Best platform for learning to code. The community support is amazing!",
      rating: 5
    }
  ];

  return (
    <div className={`min-h-screen ${isDark ? 'bg-[#171717]' : 'bg-orange-50'}`}>
      {/* Navigation - Normal top navbar */}
      <motion.nav
        initial={{ opacity: 1 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        className={`sticky top-0 left-0 z-50 w-full transition-colors duration-300 ${
          isScrolled
            ? isDark 
              ? 'bg-[#212121]/95 backdrop-blur-sm border-b border-[#2a2a2a] shadow-sm'
              : 'bg-white/95 backdrop-blur-sm border-b border-black/10 shadow-sm'
            : 'bg-transparent border-b-0 shadow-none'
        }`}
      >
        <div className="px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Logo - Left */}
            <motion.div initial={{ opacity: 1 }} animate={{ opacity: 1 }} className="flex items-center space-x-3">
              <div className={`${isDark ? 'bg-[#212121]/50 border-[#2a2a2a]' : 'bg-white/30 border-white/40'} backdrop-blur-md rounded-lg flex items-center justify-center border shadow-lg w-10 h-10`}>
                <BookOpen className="text-orange-600 w-6 h-6" />
              </div>
              <span className={`font-bold text-xl ${isDark ? 'text-white' : 'text-gray-900'}`}>Practisr</span>
            </motion.div>

            {/* Center Navigation */}
            <motion.div initial={{ opacity: 1 }} animate={{ opacity: 1 }} className="hidden md:flex items-center space-x-6">
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className={`${isDark ? 'text-gray-300 hover:text-orange-400' : 'text-gray-700 hover:text-orange-600'} px-4 py-2 font-medium transition-all duration-300 text-sm`}
              >
                Home
              </button>
                
              <button
                onClick={scrollToFeatures}
                className={`${isDark ? 'text-gray-300 hover:text-orange-400' : 'text-gray-700 hover:text-orange-600'} px-4 py-2 font-medium transition-all duration-300 text-sm`}
              >
                Features
              </button>
                
              <button
                onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
                className={`${isDark ? 'text-gray-300 hover:text-orange-400' : 'text-gray-700 hover:text-orange-600'} px-4 py-2 font-medium transition-all duration-300 text-sm`}
              >
                About
              </button>
                
              <button
                onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                className={`${isDark ? 'text-gray-300 hover:text-orange-400' : 'text-gray-700 hover:text-orange-600'} px-4 py-2 font-medium transition-all duration-300 text-sm`}
              >
                Contact
              </button>
            </motion.div>

            {/* Right Side Buttons */}
            <motion.div 
              initial={{ opacity: 1 }}
              animate={{ opacity: 1 }}
              className="flex items-center space-x-3"
            >
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className={`${isDark ? 'text-orange-400 bg-[#212121]/50 hover:bg-[#2a2a2a]/50 border-[#2a2a2a]' : 'text-gray-700 bg-white/20 hover:bg-white/30 border-white/20 hover:border-white/30'} p-2 rounded-lg font-medium transition-all duration-300 border`}
                title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              
              {/* Mobile Menu Button */}
              <button className={`md:hidden ${isDark ? 'text-gray-300 bg-[#212121]/50 hover:bg-[#2a2a2a]/50 border-[#2a2a2a]' : 'text-gray-700 bg-white/20 hover:bg-white/30 border-white/20 hover:border-white/30'} p-2 rounded-lg transition-all duration-300 border`}>
                <Menu className="w-4 h-4" />
              </button>
              
              {/* Sign In Button */}
              <button
                onClick={() => navigate('/auth')}
                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-medium border border-orange-400 hover:border-orange-500 shadow-md hover:shadow-lg text-sm"
              >
                Sign In
              </button>
            </motion.div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="pt-28 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className={`text-5xl md:text-7xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-6 leading-tight`}>
              Master Coding with
              <span className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent"> AI-Powered</span>
              <br />Learning
            </h1>
            <p className={`text-xl ${isDark ? 'text-gray-300' : 'text-gray-600'} mb-8 max-w-3xl mx-auto leading-relaxed`}>
              Transform your programming skills with personalized challenges, real-time feedback, 
              and a supportive community of learners. Start your coding journey today.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                size="lg" 
                onClick={handleGetStarted}
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-8 py-4 rounded-lg text-lg font-medium group transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Start Learning
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => navigate('/auth')}
                className={`border-2 ${isDark ? 'border-orange-400 text-orange-400 hover:bg-gray-800 hover:border-orange-300' : 'border-orange-300 hover:border-orange-500 text-orange-600 hover:bg-orange-50'} px-8 py-4 rounded-lg text-lg font-medium transition-all duration-300`}
              >
                Learn More
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className={`text-4xl md:text-5xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-6`}>
              Why Choose <span className="text-orange-500">Practisr</span>?
            </h2>
            <p className={`text-xl ${isDark ? 'text-gray-300' : 'text-gray-600'} max-w-3xl mx-auto`}>
              Our platform combines cutting-edge AI technology with proven learning methodologies 
              to deliver an unparalleled coding education experience.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8 }}
                className={`${isDark ? 'bg-[#212121] border-[#2a2a2a] hover:bg-[#2a2a2a]' : 'bg-white border-orange-100'} p-8 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 group border`}
              >
                <div className={`w-12 h-12 ${isDark ? 'bg-[#171717] group-hover:bg-orange-500' : 'bg-orange-100 group-hover:bg-orange-500'} rounded-xl flex items-center justify-center mb-6 group-hover:text-white transition-all duration-300`}>
                  <feature.icon className={`w-6 h-6 ${isDark ? 'text-orange-400 group-hover:text-white' : 'text-orange-500 group-hover:text-white'} transition-colors duration-300`} />
                </div>
                <h3 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-3`}>{feature.title}</h3>
                <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} leading-relaxed`}>{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Features Section */}
      <section className={`py-20 px-4 sm:px-6 lg:px-8 ${isDark ? 'bg-[#171717]' : 'bg-orange-50'}`}>
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className={`text-4xl md:text-5xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-6`}>
              Advanced <span className="text-orange-500">Features</span>
            </h2>
            <p className={`text-xl ${isDark ? 'text-gray-300' : 'text-gray-600'} max-w-3xl mx-auto`}>
              Discover the powerful tools and features that make Practisr the ultimate coding learning platform.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {additionalFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8 }}
                className={`${isDark ? 'bg-[#171717] hover:bg-[#2a2a2a]' : 'bg-white'} p-8 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 group`}
              >
                <div className={`w-12 h-12 ${isDark ? 'bg-[#212121] group-hover:bg-orange-500' : 'bg-orange-100 group-hover:bg-orange-500'} rounded-xl flex items-center justify-center mb-6 group-hover:text-white transition-all duration-300`}>
                  <feature.icon className={`w-6 h-6 ${isDark ? 'text-orange-400 group-hover:text-white' : 'text-orange-500 group-hover:text-white'} transition-colors duration-300`} />
                </div>
                <h3 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-3`}>{feature.title}</h3>
                <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} leading-relaxed`}>{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="about" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className={`text-4xl md:text-5xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-6`}>
                What You'll <span className="text-orange-500">Achieve</span>
              </h2>
              <p className={`text-xl ${isDark ? 'text-gray-300' : 'text-gray-600'} mb-8`}>
                Join thousands of successful learners who have transformed their careers with Practisr.
              </p>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={benefit}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center space-x-3"
                  >
                    <CheckCircle className="w-6 h-6 text-orange-500 flex-shrink-0" />
                    <span className={`${isDark ? 'text-gray-300' : 'text-gray-700'} text-lg`}>{benefit}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-orange-500 to-orange-600 p-8 rounded-3xl text-white"
            >
              <h3 className="text-2xl font-bold mb-6">Success Stories</h3>
              <div className="space-y-6">
                <div className="bg-white/10 p-6 rounded-2xl backdrop-blur-sm">
                  <div className="flex items-center mb-3">
                    <Award className="w-6 h-6 mr-2" />
                    <span className="font-semibold">Career Growth</span>
                  </div>
                  <p className="text-orange-100">
                    "Landed my dream job at a top tech company after completing Practisr courses."
                  </p>
                </div>
                <div className="bg-white/10 p-6 rounded-2xl backdrop-blur-sm">
                  <div className="flex items-center mb-3">
                    <TrendingUp className="w-6 h-6 mr-2" />
                    <span className="font-semibold">Skill Development</span>
                  </div>
                  <p className="text-orange-100">
                    "Improved my coding skills by 300% in just 6 months of consistent practice."
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className={`py-20 px-4 sm:px-6 lg:px-8 ${isDark ? 'bg-[#171717]' : 'bg-orange-50'}`}>
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className={`text-4xl md:text-5xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-6`}>
              Trusted by <span className="text-orange-500">Thousands</span>
            </h2>
            <p className={`text-xl ${isDark ? 'text-gray-300' : 'text-gray-600'} max-w-3xl mx-auto`}>
              Join our growing community of successful developers and coding enthusiasts.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { number: "50K+", label: "Active Learners", icon: Users },
              { number: "1M+", label: "Challenges Completed", icon: Target },
              { number: "95%", label: "Success Rate", icon: Trophy },
              { number: "24/7", label: "Community Support", icon: Globe }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`${isDark ? 'bg-[#171717] hover:bg-[#2a2a2a]' : 'bg-white'} p-8 rounded-2xl text-center shadow-sm hover:shadow-lg transition-all duration-300`}
              >
                <div className={`w-12 h-12 ${isDark ? 'bg-[#212121]' : 'bg-orange-100'} rounded-xl flex items-center justify-center mx-auto mb-4`}>
                  <stat.icon className={`w-6 h-6 ${isDark ? 'text-orange-400' : 'text-orange-500'}`} />
                </div>
                <div className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>{stat.number}</div>
                <div className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className={`text-4xl md:text-5xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-6`}>
              What Our <span className="text-orange-500">Students</span> Say
            </h2>
            <p className={`text-xl ${isDark ? 'text-gray-300' : 'text-gray-600'} max-w-3xl mx-auto`}>
              Real stories from real people who have transformed their careers with Practisr.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`${isDark ? 'bg-[#212121] border-[#2a2a2a] hover:bg-[#2a2a2a]' : 'bg-white border-orange-100'} p-8 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border`}
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-orange-400 fill-current" />
                  ))}
                </div>
                <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} mb-6 italic`}>"{testimonial.content}"</p>
                <div>
                  <div className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{testimonial.name}</div>
                  <div className="text-orange-500 text-sm">{testimonial.role}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={`py-20 px-4 sm:px-6 lg:px-8 ${isDark ? 'bg-[#171717]' : 'bg-orange-500'}`}>
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Start Your Coding Journey?
            </h2>
            <p className="text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
              Join thousands of successful developers who started their journey with Practisr. 
              Begin learning today and transform your future.
            </p>
            <motion.button
              onClick={() => navigate('/auth')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white text-orange-600 px-8 py-4 rounded-xl font-medium hover:bg-orange-50 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Get Started Now
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className={`${isDark ? 'bg-[#171717]' : 'bg-gray-900'} text-white py-16 px-4 sm:px-6 lg:px-8`}>
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className={`w-8 h-8 ${isDark ? 'bg-[#212121]/50 border-[#2a2a2a]' : 'bg-white/10 border-white/20'} backdrop-blur-md rounded-lg flex items-center justify-center border`}>
                  <BookOpen className="w-5 h-5 text-orange-400" />
                </div>
                <span className="text-xl font-bold">Practisr</span>
              </div>
              <p className={`${isDark ? 'text-gray-400' : 'text-gray-400'} mb-6 max-w-md`}>
                Empowering the next generation of developers with AI-powered learning experiences 
                and personalized coding challenges.
              </p>
              <div className="flex space-x-4">
                <div className={`w-10 h-10 ${isDark ? 'bg-[#212121] hover:bg-orange-500' : 'bg-gray-800 hover:bg-orange-500'} rounded-lg flex items-center justify-center transition-colors cursor-pointer`}>
                  <Globe className="w-5 h-5" />
                </div>
                <div className={`w-10 h-10 ${isDark ? 'bg-[#212121] hover:bg-orange-500' : 'bg-gray-800 hover:bg-orange-500'} rounded-lg flex items-center justify-center transition-colors cursor-pointer`}>
                  <Users className="w-5 h-5" />
                </div>
                <div className={`w-10 h-10 ${isDark ? 'bg-[#212121] hover:bg-orange-500' : 'bg-gray-800 hover:bg-orange-500'} rounded-lg flex items-center justify-center transition-colors cursor-pointer`}>
                  <Code className="w-5 h-5" />
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4 text-orange-400">Platform</h3>
              <ul className={`space-y-2 ${isDark ? 'text-gray-400' : 'text-gray-400'}`}>
                <li><a href="#" className="hover:text-orange-400 transition-colors">Courses</a></li>
                <li><a href="#" className="hover:text-orange-400 transition-colors">Challenges</a></li>
                <li><a href="#" className="hover:text-orange-400 transition-colors">Community</a></li>
                <li><a href="#" className="hover:text-orange-400 transition-colors">Certificates</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4 text-orange-400">Support</h3>
              <ul className={`space-y-2 ${isDark ? 'text-gray-400' : 'text-gray-400'}`}>
                <li><a href="#" className="hover:text-orange-400 transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-orange-400 transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-orange-400 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-orange-400 transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          
          <div className={`border-t ${isDark ? 'border-[#2a2a2a]' : 'border-gray-800'} mt-12 pt-8 text-center ${isDark ? 'text-gray-400' : 'text-gray-400'}`}>
            <p>&copy; 2024 Practisr. All rights reserved. Built with ❤️ for developers.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;