// src/features/auth/LandingPage.jsx
// ─── Far Away — Production Landing Page with Advanced Animations ───
// Inspired by Coursera, Udemy, Duolingo - Professional edtech design

import { useState, useEffect, useRef } from 'react';
import { LogoMark } from '../../components/ui/Icons';

// Animation styles
const animationStyles = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes slideInLeft {
    from {
      opacity: 0;
      transform: translateX(-50px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes slideInRight {
    from {
      opacity: 0;
      transform: translateX(50px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes shimmer {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.8;
    }
  }

  @keyframes gradientShift {
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }

  @keyframes floatUp {
    0%, 100% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-10px);
    }
  }

  @keyframes pulse-glow {
    0%, 100% {
      box-shadow: 0 0 20px rgba(250, 82, 15, 0.3);
    }
    50% {
      box-shadow: 0 0 40px rgba(250, 82, 15, 0.5);
    }
  }

  @keyframes scale-bounce {
    0%, 100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.05);
    }
  }

  @keyframes blob {
    0%, 100% {
      transform: translate(0, 0) scale(1);
    }
    33% {
      transform: translate(30px, -50px) scale(1.1);
    }
    66% {
      transform: translate(-20px, 20px) scale(0.9);
    }
  }

  .animate-fade-in-up {
    animation: fadeInUp 0.6s ease-out forwards;
  }

  .animate-slide-in-left {
    animation: slideInLeft 0.6s ease-out forwards;
  }

  .animate-slide-in-right {
    animation: slideInRight 0.6s ease-out forwards;
  }

  .animate-shimmer {
    animation: shimmer 2s ease-in-out infinite;
  }

  .animate-gradient-shift {
    animation: gradientShift 3s ease infinite;
    background-size: 200% 200%;
  }

  .animate-float-up {
    animation: floatUp 3s ease-in-out infinite;
  }

  .animate-pulse-glow {
    animation: pulse-glow 2s ease-in-out infinite;
  }

  .animate-scale-bounce {
    animation: scale-bounce 2s ease-in-out infinite;
  }

  .animate-blob {
    animation: blob 7s infinite;
  }

  .hover-lift {
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .hover-lift:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  }
`;

function useInView(ref, options = {}) {
  const [isInView, setIsInView] = useState(false);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !hasAnimated.current) {
        setIsInView(true);
        hasAnimated.current = true;
      }
    }, {
      threshold: 0.1,
      ...options,
    });

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [options]);

  return isInView;
}

export default function LandingPage({ onGetStarted }) {
  const heroRef = useRef(null);
  const stepsRef = useRef(null);
  const featuresRef = useRef(null);
  const teacherRef = useRef(null);
  const ctaRef = useRef(null);

  const heroInView = useInView(heroRef);
  const stepsInView = useInView(stepsRef);
  const featuresInView = useInView(featuresRef);
  const teacherInView = useInView(teacherRef);
  const ctaInView = useInView(ctaRef);

  return (
    <>
      <style>{animationStyles}</style>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-blue-100 overflow-hidden relative">
        {/* Animated background blobs */}
        <div className="fixed top-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-200 to-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
        <div className="fixed top-0 right-0 w-96 h-96 bg-gradient-to-br from-indigo-200 to-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob" style={{ animationDelay: '2s' }}></div>
        <div className="fixed -bottom-8 left-20 w-96 h-96 bg-gradient-to-br from-orange-200 to-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob" style={{ animationDelay: '4s' }}></div>

        {/* Header */}
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-borderColor/50 shadow-sm transition-all duration-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3 group cursor-pointer">
              <div className="relative">
                <LogoMark size={32} />
                <div className="absolute inset-0 bg-accentIndigo rounded-full blur opacity-0 group-hover:opacity-20 transition-opacity"></div>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-accentIndigo to-indigo-600 bg-clip-text text-transparent">Far Away</span>
            </div>
            <button
              onClick={onGetStarted}
              className="px-4 py-2 rounded-lg font-semibold text-white bg-accentIndigo hover:shadow-lg transition-all duration-300 hover-lift relative overflow-hidden group"
            >
              <span className="relative z-10">Sign In</span>
              <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-accentIndigo opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="relative z-10 text-white">Sign In</span>
              </div>
            </button>
          </div>
        </header>

        {/* Hero Section */}
        <section ref={heroRef} className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center relative z-10">
          <h1 
            className={`text-5xl sm:text-6xl xl:text-7xl font-bold text-textPrimary leading-tight transition-all duration-700 ${
              heroInView ? 'animate-fade-in-up' : 'opacity-0 translate-y-8'
            }`}
          >
            Personalized Learning,{' '}
            <span className="bg-gradient-to-r from-accentIndigo via-indigo-600 to-accentIndigo bg-clip-text text-transparent animate-gradient-shift">
              Powered by AI
            </span>
          </h1>
          <p 
            className={`text-lg sm:text-xl text-textSecondary mt-6 max-w-2xl mx-auto leading-relaxed transition-all duration-700 ${
              heroInView ? 'animate-fade-in-up' : 'opacity-0 translate-y-8'
            }`}
            style={{ animationDelay: '0.1s' }}
          >
            Adapt to your pace. Compete with peers. Master skills faster with intelligent assessments and real-time insights.
          </p>
          <button
            onClick={onGetStarted}
            className="mt-10 px-8 py-4 rounded-xl font-semibold text-white bg-gradient-to-r from-accentIndigo to-indigo-600 hover:shadow-xl transition-all duration-300 hover-lift text-lg group relative overflow-hidden"
          >
            <span className="relative z-10">Get Started Free</span>
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-accentIndigo opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="relative z-10">Get Started Free</span>
            </div>
          </button>
        </section>

        {/* How It Works */}
        <section ref={stepsRef} className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
          <div 
            className={`text-center mb-16 transition-all duration-700 ${
              stepsInView ? 'animate-fade-in-up' : 'opacity-0 translate-y-8'
            }`}
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-textPrimary">How It Works</h2>
            <p className="text-textSecondary mt-4 text-lg">Three simple steps to start learning smarter</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { num: 1, title: 'Sign Up', desc: 'Create your account as a student or teacher in seconds.' },
              { num: 2, title: 'Take Assessments', desc: 'Solve adaptive quizzes tailored to your skill level.' },
              { num: 3, title: 'Get Smarter', desc: 'Receive personalized insights and level up through competitions.' }
            ].map((step, idx) => (
              <div 
                key={idx}
                className={`relative transition-all duration-700 ${
                  stepsInView ? 'animate-fade-in-up' : 'opacity-0 translate-y-8'
                }`}
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <div className="bg-white rounded-2xl p-8 border border-borderColor hover-lift group shadow-sm hover:shadow-xl">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br from-accentIndigo to-indigo-600 text-white font-bold text-2xl mb-4 group-hover:scale-110 transition-transform duration-300 animate-scale-bounce" style={{ animationDelay: `${idx * 0.2}s` }}>
                    {step.num}
                  </div>
                  <h3 className="text-2xl font-bold text-textPrimary mb-3">{step.title}</h3>
                  <p className="text-textSecondary">{step.desc}</p>
                </div>
                {idx < 2 && (
                  <div className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-10">
                    <div className="w-8 h-0.5 bg-gradient-to-r from-accentIndigo to-transparent animate-shimmer"></div>
                    <div className="w-3 h-3 rounded-full bg-accentIndigo"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Features Grid */}
        <section ref={featuresRef} className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
          <div 
            className={`text-center mb-16 transition-all duration-700 ${
              featuresInView ? 'animate-fade-in-up' : 'opacity-0 translate-y-8'
            }`}
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-textPrimary">Features That Help You Learn</h2>
            <p className="text-textSecondary mt-4 text-lg">Everything you need to master your skills</p>
          </div>

          <div className="space-y-6">
            {[
              {
                icon: '🎯',
                problem: 'Struggling with one-size-fits-all learning?',
                solution: 'AI-Powered Adaptive Assessments',
                description: 'Questions adjust to your skill level in real-time. The smarter you get, the harder they become. Learn at your pace with personalized challenge.',
                benefits: ['Real-time difficulty adjustment', 'Bayesian Knowledge Tracing', 'Smart question selection']
              },
              {
                icon: '🏆',
                problem: 'Learning feels lonely and lacks motivation?',
                solution: 'Live Competitions & Leaderboards',
                description: 'Compete with peers in real-time contests. Climb the global leaderboard, earn coins, and unlock achievements. Make learning social.',
                benefits: ['Live scoring updates', 'Team & individual modes', 'Real-time rankings']
              },
              {
                icon: '💡',
                problem: "Don't know what topics to focus on?",
                solution: 'AI-Powered Learning Insights',
                description: 'Get personalized recommendations on what to study next. Identify weak areas, misconceptions, and get study notes generated just for you.',
                benefits: ['Personalized recommendations', 'Misconception mapping', 'AI-generated study notes']
              },
              {
                icon: '🤝',
                problem: 'Lack peer mentorship and guidance?',
                solution: 'SkillSwap Peer Learning',
                description: 'Connect with other students to exchange skills. Find mentors, share knowledge, and learn from your peers\' experiences.',
                benefits: ['Peer matching algorithm', 'Skill recommendations', 'Mentorship tracking']
              },
              {
                icon: '💻',
                problem: 'Need to practice coding but lack feedback?',
                solution: 'AI Code Review & Practice',
                description: 'Write code in an online editor. Get instant feedback and AI-powered reviews that explain improvements and best practices.',
                benefits: ['Monaco Editor', 'AI code reviews', 'Real-time execution']
              },
              {
                icon: '🪙',
                problem: 'No motivation or reward system?',
                solution: 'Coins & Achievements',
                description: 'Earn coins for every assessment completed, competition won, or skill exchanged. Redeem coins for premium content and special features.',
                benefits: ['Earn coins', 'Daily bonuses', 'Achievement badges']
              }
            ].map((feature, idx) => (
              <FeatureCard
                key={idx}
                {...feature}
                inView={featuresInView}
                delay={idx * 0.1}
              />
            ))}
          </div>
        </section>

        {/* Teacher Section */}
        <section ref={teacherRef} className="bg-gradient-to-r from-blue-50 to-indigo-50 backdrop-blur-sm border-t border-borderColor/50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div 
                className={`transition-all duration-700 ${
                  teacherInView ? 'animate-slide-in-left' : 'opacity-0 -translate-x-8'
                }`}
              >
                <h2 className="text-4xl sm:text-5xl font-bold text-textPrimary mb-6">For Teachers</h2>
                <p className="text-lg text-textSecondary mb-8">
                  Create dynamic assessments, monitor student progress, and provide real-time feedback. Build engaging classes with built-in competition.
                </p>
                <ul className="space-y-4">
                  {['Create static or dynamic adaptive tests', 'View detailed class analytics and performance', 'Organize competitions and manage teams', 'Provide instant feedback on submissions'].map((item, idx) => (
                    <li 
                      key={idx}
                      className={`flex items-start gap-3 transition-all duration-500 ${
                        teacherInView ? 'translate-x-0 opacity-100' : '-translate-x-8 opacity-0'
                      }`}
                      style={{ transitionDelay: `${300 + idx * 100}ms` }}
                    >
                      <span className="text-2xl">✅</span>
                      <span className="text-textSecondary text-lg">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div 
                className={`bg-gradient-to-br from-blue-100 to-indigo-100 rounded-3xl p-12 text-center hover-lift transition-all duration-700 ${
                  teacherInView ? 'animate-slide-in-right' : 'opacity-0 translate-x-8'
                }`}
              >
                <div className="text-7xl mb-6 animate-float-up">👨‍🏫</div>
                <p className="text-textPrimary font-bold text-2xl">Empower Your Classroom</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section ref={ctaRef} className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center relative z-10">
          <div 
            className={`bg-gradient-to-r from-accentIndigo via-indigo-600 to-accentViolet rounded-3xl p-12 md:p-16 text-white hover-lift group transition-all duration-700 ${
              ctaInView ? 'animate-fade-in-up' : 'opacity-0 translate-y-8'
            } relative overflow-hidden animate-pulse-glow`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-accentIndigo via-indigo-600 to-accentViolet opacity-0 group-hover:opacity-20 animate-gradient-shift"></div>
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">Ready to Learn Smarter?</h2>
              <p className="text-lg md:text-xl mb-8 opacity-90">
                Join thousands of students mastering their skills with personalized AI-powered learning.
              </p>
              <button
                onClick={onGetStarted}
                className="px-8 py-4 rounded-xl font-semibold bg-white text-accentIndigo hover:bg-gray-100 transition-all duration-300 hover-lift text-lg relative overflow-hidden group/btn"
              >
                <span className="relative z-10">Get Started Free</span>
                <div className="absolute inset-0 bg-gradient-to-r from-gray-100 to-white opacity-0 group-hover/btn:opacity-100 transition-opacity"></div>
              </button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-borderColor/50 bg-white/50 backdrop-blur-sm relative z-10">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-textMuted text-sm">
            <p>© 2026 Far Away. Personalized learning for everyone.</p>
          </div>
        </footer>
      </div>
    </>
  );
}

// Enhanced Feature Card Component
function FeatureCard({ icon, problem, solution, description, benefits, inView, delay }) {
  return (
    <div 
      className={`bg-white border border-borderColor rounded-2xl overflow-hidden hover-lift transition-all duration-700 shadow-sm hover:shadow-2xl ${
        inView ? 'animate-fade-in-up' : 'opacity-0 translate-y-8'
      }`}
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="grid grid-cols-1 md:grid-cols-2">
        {/* Left: Problem */}
        <div className="p-8 border-b md:border-b-0 md:border-r border-borderColor bg-gradient-to-br from-bgPrimary to-bgSecondary group-hover:from-blue-50 group-hover:to-blue-100 transition-colors duration-300">
          <div className="text-5xl mb-4 animate-float-up">{icon}</div>
          <div className="mb-4">
            <p className="text-xs font-semibold text-textMuted uppercase tracking-wider mb-2 opacity-70">Problem</p>
            <h3 className="text-2xl font-bold text-textPrimary leading-snug">{problem}</h3>
          </div>
        </div>

        {/* Right: Solution */}
        <div className="p-8 flex flex-col justify-between group">
          <div>
            <p className="text-xs font-semibold text-accentIndigo uppercase tracking-wider mb-3 font-black">Solution</p>
            <h3 className="text-2xl font-bold text-textPrimary mb-4 group-hover:text-accentIndigo transition-colors duration-300">{solution}</h3>
            <p className="text-textSecondary mb-6 leading-relaxed">{description}</p>
          </div>

          {/* Benefits */}
          <div className="space-y-3">
            {benefits.map((benefit, idx) => (
              <div 
                key={idx} 
                className="flex items-center gap-3 text-sm text-textSecondary group-hover:text-textPrimary transition-colors duration-300"
                style={{
                  animation: inView ? `fadeInUp 0.6s ease-out ${delay + 0.15 + idx * 0.05}s forwards` : 'none',
                  opacity: inView ? 1 : 0
                }}
              >
                <div className="w-2 h-2 rounded-full bg-gradient-to-r from-accentIndigo to-indigo-600 flex-shrink-0 animate-shimmer"></div>
                <span className="font-medium">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
