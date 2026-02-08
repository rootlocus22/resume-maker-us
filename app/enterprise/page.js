'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Building2, Users, GraduationCap, Briefcase, Check, ArrowRight,
  Phone, Mail, MessageCircle, TrendingUp, Shield, Clock, Zap,
  BarChart, Award, Target, ChevronDown, ChevronUp, Star
} from 'lucide-react';

export default function EnterprisePage() {
  const [formData, setFormData] = useState({
    organizationType: '',
    organizationName: '',
    contactName: '',
    email: '',
    phone: '',
    numberOfUsers: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState('');
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/enterprise-contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setSubmitStatus('success');
        setFormData({
          organizationType: '',
          organizationName: '',
          contactName: '',
          email: '',
          phone: '',
          numberOfUsers: '',
          message: ''
        });
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const whatsappNumber = '918431256903';

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - US SaaS theme (Deep Navy) */}
      <section className="relative bg-[#0F172A] text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10"></div>
        <div className="container mx-auto px-4 py-24 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 mb-8 backdrop-blur-sm">
              <span className="flex h-2 w-2 rounded-full bg-[#0D9488] animate-pulse"></span>
              <span className="text-sm font-medium text-white/90">Trusted by 500+ Organizations</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight tracking-tight">
              Scale Hiring with <span className="text-[#60A5FA]">AI-Powered Resumes</span>
            </h1>
            <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto leading-relaxed">
              The complete resume solution for recruiters, staffing agencies, and HR teams. Create thousands of ATS-optimized resumes in minutes, not weeks.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="#contact"
                className="px-8 py-4 bg-[#2563EB] text-white rounded-xl hover:bg-[#1d4ed8] transition text-lg font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 duration-200"
              >
                Schedule Free Demo
              </a>
              <a
                href="#pricing"
                className="px-8 py-4 bg-white/10 border border-white/30 text-white rounded-xl hover:bg-white/20 transition text-lg font-semibold backdrop-blur-sm"
              >
                View Pricing
              </a>
            </div>

            {/* Trust Badges - US companies */}
            <div className="mt-16 pt-8 border-t border-white/20">
              <p className="text-sm text-white/70 mb-6 uppercase tracking-wider font-semibold">Trusted by Leading Organizations</p>
              <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-70">
                <div className="text-xl font-bold text-white">Fortune 500</div>
                <div className="text-xl font-bold text-white">Staffing Agencies</div>
                <div className="text-xl font-bold text-white">Universities</div>
                <div className="text-xl font-bold text-white">Career Centers</div>
                <div className="text-xl font-bold text-white">HR Teams</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-[#F8FAFC] border-b border-[#E5E7EB]">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-[#E5E7EB]">
            <div>
              <div className="text-4xl font-bold text-[#2563EB] mb-1">50K+</div>
              <div className="text-sm text-[#475569] font-medium uppercase tracking-wide">Resumes Created</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-[#2563EB] mb-1">500+</div>
              <div className="text-sm text-[#475569] font-medium uppercase tracking-wide">Partner Orgs</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-[#2563EB] mb-1">90%</div>
              <div className="text-sm text-[#475569] font-medium uppercase tracking-wide">ATS Pass Rate</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-[#2563EB] mb-1">24h</div>
              <div className="text-sm text-[#475569] font-medium uppercase tracking-wide">Onboarding Time</div>
            </div>
          </div>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Why ExpertResume Enterprise?</h2>
            <p className="text-xl text-gray-600">We solve the biggest challenges in bulk resume creation and management.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition duration-300 group">
              <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-600 transition duration-300">
                <Clock className="w-7 h-7 text-blue-600 group-hover:text-white transition duration-300" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Save 95% Time</h3>
              <p className="text-gray-600 leading-relaxed">
                Stop manual formatting. Bulk create professional, standardized resumes for hundreds of students or candidates instantly.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition duration-300 group">
              <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-green-600 transition duration-300">
                <TrendingUp className="w-7 h-7 text-green-600 group-hover:text-white transition duration-300" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Boost Placements</h3>
              <p className="text-gray-600 leading-relaxed">
                Our ATS-optimized templates ensure resumes get past automated filters, increasing interview shortlists by up to 3x.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition duration-300 group">
              <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-purple-600 transition duration-300">
                <Shield className="w-7 h-7 text-purple-600 group-hover:text-white transition duration-300" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Total Control</h3>
              <p className="text-gray-600 leading-relaxed">
                Admin dashboard to track progress, download in bulk, and manage student data with enterprise-grade security.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Detailed Features */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          {/* Feature 1 */}
          <div className="flex flex-col md:flex-row items-center gap-12 max-w-6xl mx-auto mb-24">
            <div className="md:w-1/2">
              <div className="bg-white p-2 rounded-2xl shadow-xl transform -rotate-2">
                <div className="relative h-64 w-full rounded-xl overflow-hidden shadow-md">
                  <Image
                    src="/images/admin-dashboard.png"
                    alt="Admin Dashboard Preview"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
            <div className="md:w-1/2">
              <div className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold mb-4">Admin Control</div>
              <h3 className="text-3xl font-bold mb-4 text-gray-900">Centralized Management Dashboard</h3>
              <p className="text-lg text-gray-600 mb-6">
                Monitor resume completion status, review drafts, and export resumes in bulk (PDF/Word). Give feedback directly through the platform.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Real-time progress tracking</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Bulk export functionality</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Role-based access control</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="flex flex-col md:flex-row-reverse items-center gap-12 max-w-6xl mx-auto">
            <div className="md:w-1/2">
              <div className="bg-white p-2 rounded-2xl shadow-xl transform rotate-2">
                <div className="relative h-64 w-full rounded-xl overflow-hidden shadow-md">
                  <Image
                    src="/images/premium-templates.png"
                    alt="Premium Templates Preview"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
            <div className="md:w-1/2">
              <div className="inline-block bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-semibold mb-4">Quality Assurance</div>
              <h3 className="text-3xl font-bold mb-4 text-gray-900">Standardized Professional Quality</h3>
              <p className="text-lg text-gray-600 mb-6">
                Ensure every student represents your institution perfectly. Our templates are designed by HR experts to highlight skills and achievements effectively.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">25+ Premium ATS templates</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">AI content suggestions</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Automatic formatting & layout</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Transparent Enterprise Pricing</h2>
            <p className="text-xl text-gray-600">Choose the plan that fits your organization's needs.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {/* Colleges */}
            <div className="bg-white border border-gray-200 rounded-2xl p-8 hover:border-blue-500 transition duration-300 relative">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-blue-100 text-blue-700 px-4 py-1 rounded-full text-sm font-bold">
                For Colleges
              </div>
              <h3 className="text-2xl font-bold mb-2 text-gray-900">Academic Plan</h3>
              <div className="flex items-baseline mb-6">
                <span className="text-4xl font-bold text-gray-900">₹50-100</span>
                <span className="text-gray-500 ml-2">/student</span>
              </div>
              <p className="text-gray-600 mb-8 text-sm">Perfect for universities and colleges looking to standardize student resumes.</p>

              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700 text-sm">All professional templates</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700 text-sm">Bulk PDF + Word export</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700 text-sm">Admin dashboard access</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700 text-sm">LinkedIn profile optimization</span>
                </li>
              </ul>
              <a href="#contact" className="block w-full py-3 px-6 bg-gray-50 text-blue-600 font-bold text-center rounded-xl hover:bg-blue-50 transition border border-blue-200">
                Get Custom Quote
              </a>
            </div>

            {/* Placement Agencies */}
            <div className="bg-white border-2 border-blue-600 rounded-2xl p-8 shadow-xl relative transform md:-translate-y-4">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-bold shadow-md">
                Most Popular
              </div>
              <h3 className="text-2xl font-bold mb-2 text-gray-900">Agency Plan</h3>
              <div className="flex items-baseline mb-6">
                <span className="text-4xl font-bold text-gray-900">₹25K-50K</span>
                <span className="text-gray-500 ml-2">/month</span>
              </div>
              <p className="text-gray-600 mb-8 text-sm">For placement agencies requiring high-volume resume processing.</p>

              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <span className="text-gray-700 text-sm font-medium">Unlimited resume creation</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <span className="text-gray-700 text-sm">White-label options available</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <span className="text-gray-700 text-sm">Advanced ATS checker</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <span className="text-gray-700 text-sm">Dedicated account manager</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <span className="text-gray-700 text-sm">Priority support</span>
                </li>
              </ul>
              <a href="#contact" className="block w-full py-4 px-6 bg-blue-600 text-white font-bold text-center rounded-xl hover:bg-blue-700 transition shadow-lg">
                Start Free Trial
              </a>
            </div>

            {/* HR Consultancies */}
            <div className="bg-white border border-gray-200 rounded-2xl p-8 hover:border-purple-500 transition duration-300 relative">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-purple-100 text-purple-700 px-4 py-1 rounded-full text-sm font-bold">
                For HR Firms
              </div>
              <h3 className="text-2xl font-bold mb-2 text-gray-900">Partner Plan</h3>
              <div className="flex items-baseline mb-6">
                <span className="text-4xl font-bold text-gray-900">Custom</span>
                <span className="text-gray-500 ml-2">pricing</span>
              </div>
              <p className="text-gray-600 mb-8 text-sm">White-label solution for HR consultancies to offer branded resume services.</p>

              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700 text-sm">Full White-label (Your Brand)</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700 text-sm">Custom domain support</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700 text-sm">API access integration</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700 text-sm">Revenue sharing options</span>
                </li>
              </ul>
              <a href="#contact" className="block w-full py-3 px-6 bg-gray-50 text-purple-600 font-bold text-center rounded-xl hover:bg-purple-50 transition border border-purple-200">
                Contact Sales
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 bg-gray-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-5"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col lg:flex-row gap-16 max-w-7xl mx-auto">
            <div className="lg:w-1/2">
              <h2 className="text-4xl font-bold mb-6">Ready to Transform Your Placement Process?</h2>
              <p className="text-gray-400 text-lg mb-10">
                Join 500+ institutions already using ExpertResume. Schedule a demo today and see how we can help you scale.
              </p>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Call or WhatsApp</h3>
                    <p className="text-gray-400 mb-2">Instant response for urgent queries</p>
                    <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 font-medium">
                      +91 84312 56903
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Email Us</h3>
                    <p className="text-gray-400 mb-2">For detailed proposals and quotes</p>
                    <a href="mailto:support@vendaxsystemlabs.com" className="text-blue-400 hover:text-blue-300 font-medium">
                      support@vendaxsystemlabs.com
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:w-1/2">
              <div className="bg-white text-gray-900 rounded-2xl p-8 shadow-2xl">
                <h3 className="text-2xl font-bold mb-6">Request a Demo</h3>
                {submitStatus === 'success' && (
                  <div className="bg-green-50 text-green-700 p-4 rounded-lg mb-6 flex items-center gap-2">
                    <Check className="w-5 h-5" />
                    <span>Thank you! We will contact you within 24 hours.</span>
                  </div>
                )}
                {submitStatus === 'error' && (
                  <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">
                    Something went wrong. Please try WhatsApp contact.
                  </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-700">Name *</label>
                      <input
                        type="text"
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                        placeholder="John Doe"
                        value={formData.contactName}
                        onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-700">Phone *</label>
                      <input
                        type="tel"
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                        placeholder="+91..."
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">Email *</label>
                    <input
                      type="email"
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                      placeholder="john@university.edu"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">Organization Name *</label>
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                      placeholder="University / Company Name"
                      value={formData.organizationName}
                      onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-700">Type</label>
                      <select
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                        value={formData.organizationType}
                        onChange={(e) => setFormData({ ...formData, organizationType: e.target.value })}
                      >
                        <option value="">Select...</option>
                        <option value="college">College</option>
                        <option value="agency">Agency</option>
                        <option value="hr">HR Firm</option>
                        <option value="corporate">Corporate</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-700">Users</label>
                      <input
                        type="text"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                        placeholder="e.g. 500"
                        value={formData.numberOfUsers}
                        onChange={(e) => setFormData({ ...formData, numberOfUsers: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">Message</label>
                    <textarea
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                      placeholder="Tell us about your requirements..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    ></textarea>
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Sending...' : 'Request Free Demo'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-gray-600">Everything you need to know about our enterprise solutions.</p>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {[
              {
                q: "What is the minimum number of students required?",
                a: "For the Academic Plan, we typically require a minimum of 100 students. However, we can create custom packages for smaller batches as well."
              },
              {
                q: "Can we customize the resume templates with our college logo?",
                a: "Yes! Enterprise and Partner plans include custom branding options where you can add your institution's logo and colors to the templates."
              },
              {
                q: "How long does onboarding take?",
                a: "We can set up your organization account within 24 hours. We also provide a dedicated training session for your admin team."
              },
              {
                q: "Do you offer API access?",
                a: "Yes, our Partner Plan includes API access, allowing you to integrate our resume builder directly into your existing student portal or HR system."
              }
            ].map((faq, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <button
                  className="w-full px-6 py-4 text-left flex justify-between items-center font-semibold text-gray-900 focus:outline-none"
                  onClick={() => toggleFaq(index)}
                >
                  {faq.q}
                  {openFaq === index ? <ChevronUp className="w-5 h-5 text-blue-600" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-4 text-gray-600 border-t border-gray-100 pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
