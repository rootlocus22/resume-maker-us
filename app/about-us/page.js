import Link from "next/link";
import { 
  Award, 
  Users, 
  Target, 
  Rocket, 
  Star, 
  Globe, 
  CheckCircle,
  Lightbulb,
  Heart,
  Zap,
  ArrowRight,
  Play,
  Pause,
  SkipForward,
  Volume2,
  VolumeX,
  Settings,
  HelpCircle,
  Info,
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  Send,
  PhoneCall,
  Video,
  CalendarDays,
  Clock,
  DollarSign,
  CreditCard,
  Shield,
} from "lucide-react";

export const metadata = {
  title: "About Us - ExpertResume | AI Resume Builder for US Jobs",
  description:
    "ExpertResume helps US job seekers create professional, ATS-friendly resumes with modern templates. Download your resume as a PDF instantly. Trusted by professionals applying to top US companies.",
  keywords: [
    "free resume builder",
    "professional resume maker",
    "ATS-friendly resume creator",
    "online CV generator",
    "modern resume templates",
    "download resume PDF",
    "resume writing tool",
    "job application assistant",
  ],
  robots: "index, follow",
  alternates: {
    canonical: "https://expertresume.us/about-us",
  },
};

export default function AboutPage() {
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "ExpertResume",
    "url": "https://expertresume.us",
    "logo": "https://expertresume.us/ExpertResume.png",
    "description": "AI-powered resume builder for the US job market with ATS-optimized templates",
    "sameAs": [
      "https://www.facebook.com/expertresume",
      "https://twitter.com/expertresume",
      "https://www.linkedin.com/company/expertresume",
    ],
  };

  const features = [
    {
      title: "AI-Powered Resume Builder",
      description: "Our smart algorithms suggest impactful content tailored to your industry",
      icon: "🤖",
      color: "from-[#0B1F3B] to-[#00C4B3]"
    },
    {
      title: "ATS Optimization",
      description: "Resumes designed to pass through Applicant Tracking Systems",
      icon: "🔍",
      color: "from-green-500 to-green-600"
    },
    {
      title: "1-Click PDF Export",
      description: "Download print-ready resumes without watermarks",
      icon: "📥",
      color: "from-[#0B1F3B] to-[#00C4B3]"
    },
    {
      title: "Real-Time Preview",
      description: "See changes instantly as you build your resume",
      icon: "👀",
      color: "from-orange-500 to-orange-600"
    },
  ];


  const stats = [
    { number: "100,000+", label: "Job Seekers Helped" },
    { number: "95%", label: "ATS Success Rate" },
    { number: "100+", label: "Professional Templates" },
    { number: "24/7", label: "AI Support" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F8FAFC] to-white">
      {/* Schema Markup */}
      <script 
        type="application/ld+json" 
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }} 
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Header */}
        <div className="text-center py-12 sm:py-16 lg:py-20">
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 bg-[#00C4B3]/10 text-[#0F172A] px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Star size={16} />
              <span>India's First AI-Powered Resume Builder</span>
            </div>
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold bg-gradient-to-r from-[#0B1F3B] via-[#0B1F3B] to-[#00C4B3] bg-clip-text text-transparent mb-6 leading-tight">
            About ExpertResume
          </h1>
          
          <p className="text-base sm:text-lg md:text-xl lg:text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Revolutionizing resume building with <span className="font-semibold text-[#00C4B3]">AI-powered tools</span> that help 
            job seekers land more interviews. Born from a vision to democratize career success.
          </p>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-16">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl p-4 sm:p-6 text-center shadow-lg border border-[#E5E7EB]">
              <div className="text-xl sm:text-2xl md:text-3xl lg:text-3xl font-bold text-[#00C4B3] mb-2">
                {stat.number}
              </div>
              <div className="text-xs sm:text-sm md:text-base text-gray-600 font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Mission Section */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-16">
          <div className="p-6 sm:p-8 lg:p-12">
            <div className="lg:flex lg:items-center lg:space-x-12">
              <div className="lg:w-1/2 mb-8 lg:mb-0">
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#0B1F3B] to-[#00C4B3] text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
                  <Target size={16} />
                  <span>Our Mission</span>
                </div>
                
                <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-3xl font-bold text-gray-900 mb-6 leading-tight">
                  Democratizing Career Success
                </h2>
                
                <p className="text-sm sm:text-base md:text-lg lg:text-lg text-gray-600 mb-6 leading-relaxed">
                  We believe every job seeker deserves access to professional resume tools - 
                  regardless of budget. That's why we built India's leading freemium 
                  AI-powered resume builder with a generous free tier.
                </p>
                
                <p className="text-sm sm:text-base md:text-lg lg:text-lg text-gray-600 mb-6 leading-relaxed">
                  Since 2023, we've helped <span className="font-bold text-[#00C4B3]">thousands of professionals</span> create 
                  resumes that actually get noticed by employers and pass through ATS systems.
                </p>

                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle size={16} className="text-green-500" />
                    <span>Free to start</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle size={16} className="text-green-500" />
                    <span>ATS optimized</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle size={16} className="text-green-500" />
                    <span>AI powered</span>
                  </div>
                </div>
              </div>
              
              <div className="lg:w-1/2">
                <div className="bg-gradient-to-br from-[#0B1F3B]/5 to-[#00C4B3]/10 rounded-xl p-6 sm:p-8">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-[#0B1F3B] to-[#00C4B3] rounded-full mb-4">
                      <Rocket size={32} className="text-white" />
                    </div>
                                         <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">Our Vision</h3>
                     <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                       To become the go-to platform for career development in India, 
                       helping millions of professionals achieve their career goals 
                       through intelligent, accessible tools.
                     </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>


        {/* Story Section */}
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 lg:p-12 mb-16">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Lightbulb size={16} />
              <span>Our Story</span>
            </div>
            
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-3xl font-bold text-gray-900 mb-6">
              How It All Began
            </h2>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="space-y-6 text-sm sm:text-base md:text-lg lg:text-lg text-gray-700 leading-relaxed">
              <p>
                ExpertResume was born in 2023 when we identified a critical gap in the market.
              </p>
              
              <p>
                We noticed that <span className="font-semibold text-red-600">75% of resumes were being rejected by ATS systems</span> before 
                human eyes ever saw them, leaving countless qualified candidates behind.
              </p>
              
              <p>
                This inspired us to assemble a team of <span className="font-semibold text-[#00C4B3]">HR professionals, AI experts, and designers</span> 
                to create a solution that would revolutionize how people build their resumes.
              </p>
            </div>

            <div className="mt-8 bg-gradient-to-r from-[#0B1F3B]/5 to-[#00C4B3]/5 rounded-xl p-6 sm:p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">What We Set Out to Achieve</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-[#00C4B3]/10 rounded-full mb-3">
                    <Users size={24} className="text-[#00C4B3]" />
                  </div>
                  <p className="text-sm font-medium text-gray-700">Make professional resume building accessible to everyone</p>
                </div>
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-3">
                    <Target size={24} className="text-green-600" />
                  </div>
                  <p className="text-sm font-medium text-gray-700">Automatically optimize content for ATS systems</p>
                </div>
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-[#0B1F3B]/5 rounded-full mb-3">
                    <Award size={24} className="text-[#0B1F3B]" />
                  </div>
                  <p className="text-sm font-medium text-gray-700">Provide industry-specific templates that actually work</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-[#0B1F3B]/5 text-[#0B1F3B] px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Zap size={16} />
              <span>Why Job Seekers Love Us</span>
            </div>
            
                         <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-3xl font-bold text-gray-900 mb-6">
               Powerful Features That Drive Results
             </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="bg-white p-6 sm:p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-[#E5E7EB] hover:border-[#00C4B3]/20 group"
              >
                <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${feature.color} rounded-full mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <span className="text-2xl">{feature.icon}</span>
                </div>
                <h3 className="text-base sm:text-lg md:text-xl lg:text-xl font-semibold text-gray-800 mb-3">{feature.title}</h3>
                <p className="text-gray-600 text-xs sm:text-sm md:text-base lg:text-base leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Values Section */}
        <div className="bg-gradient-to-br from-[#F8FAFC] to-[#0B1F3B]/5 rounded-2xl p-6 sm:p-8 lg:p-12 mb-16">
          <div className="text-center mb-12">
                         <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-3xl font-bold text-gray-900 mb-6">
               Our Core Values
             </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-[#00C4B3]/10 rounded-full mb-6">
                <Heart size={32} className="text-[#00C4B3]" />
              </div>
                              <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3">Empathy First</h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  We understand the challenges job seekers face and design our tools with their needs in mind.
                </p>
              </div>
              
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
                  <Target size={32} className="text-green-600" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3">Results-Driven</h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  Every feature we build is designed to help users get more interviews and land better jobs.
                </p>
              </div>
              
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-[#0B1F3B]/5 rounded-full mb-6">
                  <Globe size={32} className="text-[#0B1F3B]" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3">Accessibility</h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  We believe professional tools should be accessible to everyone, regardless of their background.
                </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center py-12 sm:py-16">
          <div className="bg-gradient-to-r from-[#0B1F3B] to-[#00C4B3] rounded-2xl p-8 sm:p-12 text-white">
                         <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-3xl font-bold mb-6">
               Ready to Build Your Winning Resume?
             </h2>
             
             <p className="text-sm sm:text-base md:text-lg lg:text-lg text-white/80 mb-8 max-w-3xl mx-auto leading-relaxed">
               Join thousands of professionals who have already transformed their careers with ExpertResume. 
               Create your professional, ATS-friendly resume in minutes - no signup required!
             </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-[#0B1F3B] font-semibold rounded-full hover:bg-[#0B1F3B]/5 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <span>Build My Resume Now</span>
                <ArrowRight size={20} />
              </Link>
              
              <Link
                href="/templates"
                className="inline-flex items-center gap-2 px-8 py-4 bg-transparent text-white font-semibold rounded-full border-2 border-white hover:bg-white hover:text-[#0B1F3B] transition-all duration-300"
              >
                <span>Browse Templates</span>
                <ArrowRight size={20} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}