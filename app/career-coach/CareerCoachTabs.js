import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  Calendar, CheckCircle, Clock, Award, Code, Briefcase,
  Link2, MessageSquare, ChevronDown, ChevronRight, Lock,
  Star, TrendingUp, Target, Brain, Users, ArrowRight,
  BookOpen, ExternalLink, Play, Zap, Trophy, GraduationCap, Crown, Rocket
} from 'lucide-react';
import { formatPrice } from '../lib/globalPricing';
import { getOriginalPrice, getDiscountedPrice, isDiscountEnabled } from '../lib/planConfig';

// Roadmap Tab Component
export function RoadmapTab({ careerPlan, isPremium, isFree, expandedMonths, toggleMonth }) {
  const router = useRouter();
  const { monthlyRoadmap } = careerPlan;
  // Show 50% for free users (3 out of 6 months)
  const totalMonths = monthlyRoadmap.length;
  const freeMonthsCount = Math.ceil(totalMonths / 2);
  const visibleMonths = isFree ? monthlyRoadmap.slice(0, freeMonthsCount) : monthlyRoadmap;

  // Get pricing from config
  const currency = 'INR';
  const discountEnabled = isDiscountEnabled();
  const monthlyPrice = discountEnabled
    ? getDiscountedPrice('monthly', currency)
    : getOriginalPrice('monthly', currency);
  const formattedMonthlyPrice = formatPrice(monthlyPrice, currency);

  return (
    <div className="space-y-4">
      {visibleMonths.map((month, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white rounded-2xl shadow-lg overflow-hidden"
        >
          <button
            onClick={() => toggleMonth(index)}
            className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-primary to-accent rounded-xl p-3">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <h3 className="text-xl font-bold text-gray-900">{month.month}</h3>
                <p className="text-gray-600">{month.focus}</p>
              </div>
            </div>
            {expandedMonths[index] ? (
              <ChevronDown className="w-6 h-6 text-gray-400" />
            ) : (
              <ChevronRight className="w-6 h-6 text-gray-400" />
            )}
          </button>

          {expandedMonths[index] && (
            <div className="px-6 pb-6">
              {/* Goals */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Target className="w-5 h-5 text-accent" />
                  Monthly Goals
                </h4>
                <div className="space-y-2">
                  {month.goals.map((goal, gIndex) => (
                    <div key={gIndex} className="flex items-start gap-3 p-3 bg-accent-50 rounded-lg">
                      <Star className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                      <p className="text-gray-700">{goal}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Activities */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Action Items
                </h4>
                <div className="space-y-2">
                  {month.activities.map((activity, aIndex) => (
                    <div key={aIndex} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <input
                        type="checkbox"
                        checked={activity.completed}
                        readOnly
                        className="mt-1 w-5 h-5 text-accent rounded border-gray-300 focus:ring-accent"
                      />
                      <div className="flex-1">
                        <p className="text-gray-900 font-medium">{activity.activity}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-600 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {activity.time}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${activity.priority === 'High' ? 'bg-red-100 text-red-700' :
                            activity.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-green-100 text-green-700'
                            }`}>
                            {activity.priority}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Milestones */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-600" />
                  Milestones
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {month.milestones.map((milestone, mIndex) => (
                    <div key={mIndex} className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      <Trophy className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                      <p className="text-sm text-gray-700">{milestone}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Metrics */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Success Metrics</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">{month.metrics.skillsImproved.length}</p>
                    <p className="text-xs text-gray-600">Skills</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-accent">{month.metrics.certificationsCompleted}</p>
                    <p className="text-xs text-gray-600">Certs</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{month.metrics.projectsBuilt}</p>
                    <p className="text-xs text-gray-600">Projects</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-orange-600">{month.metrics.connectionsGrown}</p>
                    <p className="text-xs text-gray-600">Connections</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      ))}

      {isFree && monthlyRoadmap.length > freeMonthsCount && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-accent-50 rounded-xl sm:rounded-2xl shadow-lg p-6 sm:p-8 text-center border-2 border-accent/20"
        >
          <div className="bg-white rounded-full w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 sm:w-10 sm:h-10 text-accent" />
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
            Unlock Remaining {monthlyRoadmap.length - freeMonthsCount} Months
          </h3>
          <p className="text-sm sm:text-base text-gray-600 mb-4 px-4">
            Get the complete {monthlyRoadmap.length}-month roadmap with detailed action plans, milestones, and resources
          </p>
          <button
            onClick={() => router.push('/checkout?billingCycle=monthly')}
            className="bg-gradient-to-r from-primary to-accent text-white px-6 py-3 rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300 font-semibold text-sm sm:text-base inline-flex items-center gap-2"
          >
            <Crown className="w-5 h-5" />
            Upgrade to Monthly Plan ({formattedMonthlyPrice})
          </button>
        </motion.div>
      )}
    </div>
  );
}

// Skills & Certifications Tab
export function SkillsTab({ careerPlan, isPremium, isFree }) {
  const router = useRouter();
  const { skillDevelopment, certifications } = careerPlan;
  // Show 50% of each for free users
  const freeSkillsCount = Math.ceil(skillDevelopment.length / 2);
  const freeCertsCount = Math.ceil(certifications.length / 2);
  const visibleSkills = isFree ? skillDevelopment.slice(0, freeSkillsCount) : skillDevelopment;
  const visibleCerts = isFree ? certifications.slice(0, freeCertsCount) : certifications;

  // Get pricing from config
  const currency = 'INR';
  const discountEnabled = isDiscountEnabled();
  const monthlyPrice = discountEnabled
    ? getDiscountedPrice('monthly', currency)
    : getOriginalPrice('monthly', currency);
  const formattedMonthlyPrice = formatPrice(monthlyPrice, currency);

  return (
    <div className="space-y-6">
      {/* Certifications */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6"
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Award className="w-6 h-6 text-yellow-600" />
          Recommended Certifications
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {visibleCerts.map((cert, index) => (
            <div key={index} className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-5 border border-yellow-200">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-bold text-gray-900 text-lg">{cert.name}</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${cert.priority === 'High' ? 'bg-red-100 text-red-700' :
                  cert.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                  {cert.priority}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-3">{cert.provider}</p>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="bg-white rounded-lg p-2">
                  <p className="text-xs text-gray-600">Duration</p>
                  <p className="font-semibold text-sm">{cert.duration}</p>
                </div>
                <div className="bg-white rounded-lg p-2">
                  <p className="text-xs text-gray-600">Cost</p>
                  <p className="font-semibold text-sm">{cert.cost}</p>
                </div>
              </div>
              <p className="text-sm text-gray-700 mb-2">{cert.reasoning}</p>
              <div className="bg-green-100 rounded-lg p-3 mb-3">
                <p className="text-xs font-semibold text-green-700 mb-1">Expected Outcome</p>
                <p className="text-xs text-gray-700">{cert.expectedOutcome}</p>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>{cert.timeline}</span>
              </div>
            </div>
          ))}
        </div>
        {isFree && certifications.length > 2 && (
          <div className="mt-4 bg-gray-50 rounded-xl p-4 text-center border-2 border-dashed border-gray-300">
            <Lock className="w-6 h-6 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600">+{certifications.length - 2} more certifications</p>
          </div>
        )}
      </motion.div>

      {/* Skill Development */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6"
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Code className="w-6 h-6 text-accent" />
          Skill Development Roadmap
        </h2>
        <div className="space-y-4">
          {visibleSkills.map((skill, index) => (
            <div key={index} className="bg-primary-50 rounded-xl p-5 border border-primary/20">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-gray-900 text-lg mb-1">{skill.skill}</h3>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="px-2 py-1 bg-gray-200 rounded-full">{skill.currentLevel}</span>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                    <span className="px-2 py-1 bg-accent text-white rounded-full font-semibold">{skill.targetLevel}</span>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${skill.priority === 'High' ? 'bg-red-100 text-red-700' :
                  skill.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                  {skill.priority}
                </span>
              </div>

              {/* Learning Path */}
              <div className="mb-3">
                <p className="text-xs font-semibold text-gray-600 mb-2">Learning Path</p>
                <div className="space-y-2">
                  {skill.learningPath.map((step, sIndex) => (
                    <div key={sIndex} className="flex items-start gap-2">
                      <div className="bg-accent rounded-full w-6 h-6 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {sIndex + 1}
                      </div>
                      <p className="text-sm text-gray-700">{step}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Resources */}
              <div className="mb-3">
                <p className="text-xs font-semibold text-gray-600 mb-2">Resources</p>
                <div className="flex flex-wrap gap-2">
                  {skill.resources.map((resource, rIndex) => (
                    <span key={rIndex} className="text-xs bg-white px-3 py-1 rounded-full text-gray-700 border border-gray-300">
                      <BookOpen className="w-3 h-3 inline mr-1" />
                      {resource}
                    </span>
                  ))}
                </div>
              </div>

              {/* Practice Projects */}
              <div className="mb-3">
                <p className="text-xs font-semibold text-gray-600 mb-2">Practice Projects</p>
                <ul className="space-y-1">
                  {skill.practiceProjects.map((project, pIndex) => (
                    <li key={pIndex} className="text-sm text-gray-700 flex items-start gap-2">
                      <Play className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                      {project}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex items-center gap-2 text-xs text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>{skill.timeline}</span>
              </div>
            </div>
          ))}
        </div>
        {isFree && skillDevelopment.length > freeSkillsCount && (
          <div className="mt-4 bg-gray-50 rounded-xl p-4 text-center border-2 border-dashed border-gray-300">
            <Lock className="w-6 h-6 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600">+{skillDevelopment.length - freeSkillsCount} more skills</p>
          </div>
        )}
      </motion.div>

      {/* Interview Simulation  Promotion Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gradient-to-br from-primary-900 to-primary rounded-xl sm:rounded-2xl shadow-2xl p-6 sm:p-8 text-white relative overflow-hidden"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 50%, white 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }}></div>
        </div>

        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="w-6 h-6 sm:w-7 sm:h-7" />
                <h3 className="text-xl sm:text-2xl font-bold">Practice with AI Interview</h3>
              </div>
              <p className="text-white/70 text-sm sm:text-base mb-4">
                Master all the topics mentioned above with ExpertResume AI AI Interview. Get real-time feedback and expert guidance!
              </p>
            </div>
            <Zap className="w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0 ml-4" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <Brain className="w-5 h-5 mb-1" />
              <p className="text-xs sm:text-sm font-semibold">AI-Powered</p>
              <p className="text-xs text-white/50">Smart questions</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <Target className="w-5 h-5 mb-1" />
              <p className="text-xs sm:text-sm font-semibold">Real-time Feedback</p>
              <p className="text-xs text-white/50">Improve instantly</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <Trophy className="w-5 h-5 mb-1" />
              <p className="text-xs sm:text-sm font-semibold">Track Progress</p>
              <p className="text-xs text-white/50">See your growth</p>
            </div>
          </div>

          <button
            onClick={() => router.push('/ai-interview')}
            className="bg-white text-primary px-6 py-3 rounded-xl hover:bg-primary-50 transition-all duration-300 font-bold text-sm sm:text-base inline-flex items-center gap-2 shadow-lg hover:shadow-xl hover:scale-105"
          >
            <Rocket className="w-5 h-5" />
            Start Practicing Now
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// Companies Tab
export function CompaniesTab({ careerPlan, isPremium, isFree }) {
  const router = useRouter();
  const { companyTargets } = careerPlan;
  const visibleCompanies = isFree ? companyTargets.slice(0, 2) : companyTargets;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-lg p-6"
    >
      <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <Briefcase className="w-6 h-6 text-purple-600" />
        Target Companies
      </h2>
      <div className="space-y-6">
        {visibleCompanies.map((company, index) => (
          <div key={index} className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-accent/20">
            <h3 className="text-xl font-bold text-gray-900 mb-3">{company.companyType}</h3>

            {/* Examples */}
            <div className="mb-4">
              <p className="text-sm font-semibold text-gray-600 mb-2">Top Companies</p>
              <div className="flex flex-wrap gap-2">
                {company.examples.map((example, eIndex) => (
                  <span key={eIndex} className="bg-white px-4 py-2 rounded-lg text-sm font-medium text-gray-900 border border-accent/20">
                    {example}
                  </span>
                ))}
              </div>
            </div>

            {/* Why Good Fit */}
            <div className="mb-4 bg-accent-50 rounded-lg p-4">
              <p className="text-sm font-semibold text-green-700 mb-2">Why You're a Good Fit</p>
              <p className="text-sm text-gray-700">{company.whyGoodFit}</p>
            </div>

            {/* Preparation Needed */}
            <div className="mb-4">
              <p className="text-sm font-semibold text-gray-600 mb-2">Preparation Needed</p>
              <ul className="space-y-2">
                {company.preparationNeeded.map((prep, pIndex) => (
                  <li key={pIndex} className="flex items-start gap-2 text-sm text-gray-700">
                    <CheckCircle className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                    {prep}
                  </li>
                ))}
              </ul>
            </div>

            {/* Application Strategy */}
            <div className="bg-accent-50 rounded-lg p-4">
              <p className="text-sm font-semibold text-accent-700 mb-2">Application Strategy</p>
              <p className="text-sm text-gray-700">{company.applicationStrategy}</p>
            </div>
          </div>
        ))}
      </div>
      {isFree && companyTargets.length > 2 && (
        <div className="mt-4 bg-gray-50 rounded-xl p-4 text-center border-2 border-dashed border-gray-300">
          <Lock className="w-6 h-6 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600">+{companyTargets.length - 2} more company types</p>
        </div>
      )}
    </motion.div>
  );
}

// LinkedIn Tab
export function LinkedInTab({ careerPlan, isPremium, isFree }) {
  const router = useRouter();
  const { linkedInOptimization } = careerPlan;

  // Get pricing from config
  const currency = 'INR';
  const discountEnabled = isDiscountEnabled();
  const monthlyPrice = discountEnabled
    ? getDiscountedPrice('monthly', currency)
    : getOriginalPrice('monthly', currency);
  const formattedMonthlyPrice = formatPrice(monthlyPrice, currency);

  return (
    <div className="space-y-6">
      {/* Headline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6"
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Link2 className="w-6 h-6 text-accent" />
          LinkedIn Optimization
        </h2>

        {/* Headline */}
        <div className="mb-6">
          <h3 className="font-semibold text-gray-900 mb-3">Headline</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-600 mb-2">Current (Inferred)</p>
              <p className="text-sm text-gray-700">{linkedInOptimization.headline.current}</p>
            </div>
            <div className="bg-primary-50 rounded-xl p-4 border-2 border-primary/20">
              <p className="text-xs text-accent-700 font-semibold mb-2">Suggested ⭐</p>
              <p className="text-sm font-medium text-gray-900">{linkedInOptimization.headline.suggested}</p>
            </div>
          </div>
          <div className="mt-3 bg-yellow-50 rounded-lg p-3">
            <p className="text-sm text-gray-700">{linkedInOptimization.headline.reasoning}</p>
          </div>
        </div>

        {/* Summary */}
        <div className="mb-6">
          <h3 className="font-semibold text-gray-900 mb-3">Profile Summary</h3>
          <div className="bg-primary-50 rounded-lg sm:rounded-xl p-4 sm:p-5 border border-accent/20">
            <p className="text-sm font-semibold text-primary mb-2">Recommended Tone: {linkedInOptimization.summary.tone}</p>
            <div className="mb-4">
              <p className="text-xs text-gray-600 mb-2">Key Points to Include</p>
              <ul className="space-y-2">
                {linkedInOptimization.summary.keyPoints.map((point, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                    <Star className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                    {point}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white rounded-lg p-3">
              <p className="text-xs font-semibold text-gray-600 mb-1">Call to Action</p>
              <p className="text-sm text-gray-700">{linkedInOptimization.summary.callToAction}</p>
            </div>
          </div>
        </div>

        {/* Skills */}
        <div className={`mb-6 ${isFree ? 'blur-sm pointer-events-none' : ''}`}>
          <h3 className="font-semibold text-gray-900 mb-3">Skills Optimization</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-accent-50 rounded-xl p-4">
              <p className="text-sm font-semibold text-green-700 mb-2">Top Skills</p>
              <div className="flex flex-wrap gap-2">
                {linkedInOptimization.skills.topSkillsToHighlight.map((skill, index) => (
                  <span key={index} className="text-xs bg-accent text-white px-2 py-1 rounded-full">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            <div className="bg-accent-50 rounded-xl p-4">
              <p className="text-sm font-semibold text-accent-700 mb-2">Add These</p>
              <div className="flex flex-wrap gap-2">
                {linkedInOptimization.skills.skillsToAdd.map((skill, index) => (
                  <span key={index} className="text-xs bg-accent text-white px-2 py-1 rounded-full">
                    + {skill}
                  </span>
                ))}
              </div>
            </div>
            <div className="bg-red-50 rounded-xl p-4">
              <p className="text-sm font-semibold text-red-700 mb-2">Consider Removing</p>
              <div className="flex flex-wrap gap-2">
                {linkedInOptimization.skills.skillsToRemove.map((skill, index) => (
                  <span key={index} className="text-xs bg-red-600 text-white px-2 py-1 rounded-full">
                    - {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {isFree && (
          <div className="relative -mt-20">
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <div className="text-center p-4">
                <Lock className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
                <p className="text-sm font-semibold text-gray-900 mb-2">Unlock Full LinkedIn Guide</p>
                <button
                  onClick={() => router.push('/checkout?billingCycle=monthly')}
                  className="mt-2 sm:mt-3 bg-gradient-to-r from-primary to-accent text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all duration-300 font-semibold text-xs sm:text-sm"
                >
                  Upgrade to {formattedMonthlyPrice} Plan
                </button>
              </div>
            </div>
          </div>
        )}

        {!isFree && (
          <>
            {/* Content Strategy */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Content Strategy</h3>
              <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-xl p-5 border border-orange-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Post Frequency</p>
                    <p className="text-sm font-medium text-gray-900">{linkedInOptimization.content.postFrequency}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Engagement Strategy</p>
                    <p className="text-sm font-medium text-gray-900">{linkedInOptimization.content.engagementStrategy}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-2">Content Themes</p>
                  <div className="flex flex-wrap gap-2">
                    {linkedInOptimization.content.contentThemes.map((theme, index) => (
                      <span key={index} className="text-xs bg-orange-600 text-white px-3 py-1 rounded-full">
                        {theme}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Networking */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Networking Strategy</h3>
              <div className="bg-accent-50 rounded-xl p-5 border border-accent/20">
                <div className="mb-4">
                  <p className="text-sm font-semibold text-accent-700 mb-2">Target Connections</p>
                  <div className="flex flex-wrap gap-2">
                    {linkedInOptimization.networking.targetConnections.map((connection, index) => (
                      <span key={index} className="text-xs bg-accent text-white px-3 py-1 rounded-full">
                        <Users className="w-3 h-3 inline mr-1" />
                        {connection}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="mb-4">
                  <p className="text-sm font-semibold text-accent-700 mb-2">Outreach Strategy</p>
                  <p className="text-sm text-gray-700">{linkedInOptimization.networking.outreachStrategy}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-accent-700 mb-2">Community Involvement</p>
                  <ul className="space-y-2">
                    {linkedInOptimization.networking.communityInvolvement.map((activity, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                        <CheckCircle className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                        {activity}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}

// Interviews Tab
export function InterviewsTab({ careerPlan, isPremium, isFree }) {
  const router = useRouter();
  const { interviewPreparation } = careerPlan;
  // Show 50% of each for free users
  const freeTechnicalCount = Math.ceil(interviewPreparation.technicalTopics.length / 2);
  const freeBehavioralCount = Math.ceil(interviewPreparation.behavioralTopics.length / 2);
  const visibleTechnical = isFree ? interviewPreparation.technicalTopics.slice(0, freeTechnicalCount) : interviewPreparation.technicalTopics;
  const visibleBehavioral = isFree ? interviewPreparation.behavioralTopics.slice(0, freeBehavioralCount) : interviewPreparation.behavioralTopics;

  // Get pricing from config
  const currency = 'INR';
  const discountEnabled = isDiscountEnabled();
  const monthlyPrice = discountEnabled
    ? getDiscountedPrice('monthly', currency)
    : getOriginalPrice('monthly', currency);
  const formattedMonthlyPrice = formatPrice(monthlyPrice, currency);

  return (
    <div className="space-y-6">
      {/* Technical Topics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6"
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Brain className="w-6 h-6 text-accent" />
          Technical Interview Prep
        </h2>
        <div className="space-y-4">
          {visibleTechnical.map((topic, index) => (
            <div key={index} className="bg-primary-50 rounded-xl p-5 border border-primary/20">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-bold text-gray-900 text-lg">{topic.topic}</h3>
                <div className="flex gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${topic.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
                    topic.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                    {topic.difficulty}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${topic.priority === 'High' ? 'bg-red-100 text-red-700' :
                    topic.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                    {topic.priority}
                  </span>
                </div>
              </div>

              <div className="mb-3">
                <p className="text-xs font-semibold text-gray-600 mb-2">Subtopics</p>
                <div className="flex flex-wrap gap-2">
                  {topic.subtopics.map((subtopic, sIndex) => (
                    <span key={sIndex} className="text-xs bg-white px-3 py-1 rounded-full text-gray-700 border border-gray-300">
                      {subtopic}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mb-3">
                <p className="text-xs font-semibold text-gray-600 mb-2">Study Resources</p>
                <ul className="space-y-1">
                  {topic.studyResources.map((resource, rIndex) => (
                    <li key={rIndex} className="text-sm text-gray-700 flex items-start gap-2">
                      <BookOpen className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                      {resource}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-yellow-50 rounded-lg p-3">
                <p className="text-xs font-semibold text-yellow-700 mb-2">Practice Questions ({topic.practiceQuestions.length})</p>
                <ul className="space-y-1">
                  {topic.practiceQuestions.slice(0, 2).map((question, qIndex) => (
                    <li key={qIndex} className="text-xs text-gray-700">• {question}</li>
                  ))}
                  {topic.practiceQuestions.length > 2 && (
                    <li className="text-xs text-gray-600 italic">+{topic.practiceQuestions.length - 2} more questions...</li>
                  )}
                </ul>
              </div>

              <div className="mt-3 flex items-center gap-2 text-xs text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>{topic.timeline}</span>
              </div>
            </div>
          ))}
        </div>
        {isFree && interviewPreparation.technicalTopics.length > 2 && (
          <div className="mt-4 bg-gray-50 rounded-xl p-4 text-center border-2 border-dashed border-gray-300">
            <Lock className="w-6 h-6 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600">+{interviewPreparation.technicalTopics.length - 2} more topics</p>
          </div>
        )}
      </motion.div>

      {/* Behavioral Topics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6"
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-purple-600" />
          Behavioral Interview Prep
        </h2>
        <div className="space-y-4">
          {visibleBehavioral.map((topic, index) => (
            <div key={index} className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-5 border border-accent/20">
              <h3 className="font-bold text-gray-900 text-lg mb-3">{topic.category}</h3>

              <div className="mb-3">
                <p className="text-xs font-semibold text-gray-600 mb-2">Situations to Prepare</p>
                <ul className="space-y-1">
                  {topic.situations.map((situation, sIndex) => (
                    <li key={sIndex} className="text-sm text-gray-700 flex items-start gap-2">
                      <Star className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                      {situation}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white rounded-lg p-4 mb-3">
                <p className="text-xs font-semibold text-primary mb-2">STAR Method Example</p>
                <div className="space-y-2">
                  <div>
                    <span className="text-xs font-semibold text-gray-600">Situation:</span>
                    <p className="text-xs text-gray-700">{topic.starMethod.situation}</p>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-gray-600">Task:</span>
                    <p className="text-xs text-gray-700">{topic.starMethod.task}</p>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-gray-600">Action:</span>
                    <p className="text-xs text-gray-700">{topic.starMethod.action}</p>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-gray-600">Result:</span>
                    <p className="text-xs text-gray-700">{topic.starMethod.result}</p>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 rounded-lg p-3">
                <p className="text-xs font-semibold text-yellow-700 mb-2">Practice Questions</p>
                <ul className="space-y-1">
                  {topic.practiceQuestions.map((question, qIndex) => (
                    <li key={qIndex} className="text-xs text-gray-700">• {question}</li>
                  ))}
                </ul>
              </div>

              <div className="mt-3 flex items-center gap-2 text-xs text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>{topic.timeline}</span>
              </div>
            </div>
          ))}
        </div>
        {isFree && interviewPreparation.behavioralTopics.length > 2 && (
          <div className="mt-4 bg-gray-50 rounded-xl p-4 text-center border-2 border-dashed border-gray-300">
            <Lock className="w-6 h-6 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600">+{interviewPreparation.behavioralTopics.length - 2} more categories</p>
          </div>
        )}
      </motion.div>

      {/* System Design & Mock Interviews */}
      {!isFree && (
        <>
          {interviewPreparation.systemDesign && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Target className="w-6 h-6 text-green-600" />
                System Design
              </h2>
              <div className="bg-accent-50 rounded-xl p-5 border border-accent/20">
                <p className="text-sm text-gray-700 mb-4">{interviewPreparation.systemDesign.relevance}</p>
                <div className="mb-4">
                  <p className="text-sm font-semibold text-green-700 mb-2">Topics to Cover</p>
                  <div className="flex flex-wrap gap-2">
                    {interviewPreparation.systemDesign.topics.map((topic, index) => (
                      <span key={index} className="text-xs bg-accent text-white px-3 py-1 rounded-full">
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="mb-4">
                  <p className="text-sm font-semibold text-green-700 mb-2">Resources</p>
                  <ul className="space-y-1">
                    {interviewPreparation.systemDesign.resources.map((resource, index) => (
                      <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                        <ExternalLink className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                        {resource}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>{interviewPreparation.systemDesign.timeline}</span>
                </div>
              </div>
            </motion.div>
          )}

          {interviewPreparation.mockInterviews && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <GraduationCap className="w-6 h-6 text-orange-600" />
                Mock Interview Strategy
              </h2>
              <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-5 border border-orange-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Frequency</p>
                    <p className="text-sm font-medium text-gray-900">{interviewPreparation.mockInterviews.frequency}</p>
                  </div>
                </div>
                <div className="mb-4">
                  <p className="text-sm font-semibold text-orange-700 mb-2">Recommended Platforms</p>
                  <div className="flex flex-wrap gap-2">
                    {interviewPreparation.mockInterviews.platforms.map((platform, index) => (
                      <span key={index} className="text-xs bg-orange-600 text-white px-3 py-1 rounded-full">
                        {platform}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-orange-700 mb-2">Focus Areas</p>
                  <ul className="space-y-2">
                    {interviewPreparation.mockInterviews.focus.map((area, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                        <Zap className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                        {area}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          )}
        </>
      )}

      {isFree && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-accent-50 rounded-xl sm:rounded-2xl shadow-lg p-6 sm:p-8 text-center border-2 border-accent/20"
        >
          <div className="bg-white rounded-full w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 sm:w-10 sm:h-10 text-accent" />
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
            Unlock Complete Interview Prep
          </h3>
          <p className="text-sm sm:text-base text-gray-600 mb-4 px-4">
            Get full access to all topics, system design guidance, and mock interview strategies
          </p>
          <button
            onClick={() => router.push('/checkout?billingCycle=monthly')}
            className="bg-gradient-to-r from-primary to-accent text-white px-6 py-3 rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300 font-semibold text-sm sm:text-base inline-flex items-center gap-2"
          >
            <Crown className="w-5 h-5" />
            Upgrade to Monthly Plan ({formattedMonthlyPrice})
          </button>
        </motion.div>
      )}

      {/* Interview Simulation  Promotion Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gradient-to-br from-primary-900 to-primary rounded-xl sm:rounded-2xl shadow-2xl p-6 sm:p-8 text-white relative overflow-hidden"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 50%, white 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }}></div>
        </div>

        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="w-6 h-6 sm:w-7 sm:h-7" />
                <h3 className="text-xl sm:text-2xl font-bold">Ready for Your Interview?</h3>
              </div>
              <p className="text-white/70 text-sm sm:text-base mb-4">
                Practice with ExpertResume AI Interview! Get personalized mock interviews covering all topics from your career plan with real-time AI feedback.
              </p>
            </div>
            <Trophy className="w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0 ml-4" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <Brain className="w-5 h-5 mb-1" />
              <p className="text-xs sm:text-sm font-semibold">Technical & Behavioral</p>
              <p className="text-xs text-white/50">Complete coverage</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <Zap className="w-5 h-5 mb-1" />
              <p className="text-xs sm:text-sm font-semibold">Instant Feedback</p>
              <p className="text-xs text-white/50">Improve in real-time</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <GraduationCap className="w-5 h-5 mb-1" />
              <p className="text-xs sm:text-sm font-semibold">Expert Analysis</p>
              <p className="text-xs text-white/50">AI-powered insights</p>
            </div>
          </div>

          <button
            onClick={() => router.push('/interview-trainer')}
            className="bg-white text-primary px-6 py-3 rounded-xl hover:bg-primary-50 transition-all duration-300 font-bold text-sm sm:text-base inline-flex items-center gap-2 shadow-lg hover:shadow-xl hover:scale-105"
          >
            <Rocket className="w-5 h-5" />
            Launch AI Interview
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}

