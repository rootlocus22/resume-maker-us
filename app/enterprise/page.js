'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Building2, Users, GraduationCap, Briefcase, Check, ArrowRight,
  Phone, Mail, MessageCircle, TrendingUp, Shield, Clock, Zap,
  BarChart, Award, Target, ChevronDown, ChevronUp, Star, Rocket,
  CheckCircle, Globe, ShieldCheck, ZapOff, Sparkles
} from 'lucide-react';
import { ENTERPRISE_CONFIG } from '../lib/planConfig';

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
    <div className="min-h-screen bg-primary-900 text-white selection:bg-accent-500/30">
      {/* Hero Section - Mirroring Brand Hero Style */}
      <section className="relative pt-32 pb-20 overflow-hidden bg-gradient-to-br from-primary-800 via-primary-900 to-primary-700">
        {/* Background Effects matching Hero.js */}
        <div className="absolute inset-0 overflow-hidden opacity-20">
          <div className="absolute top-8 left-8 w-32 h-32 bg-accent-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-8 right-8 w-40 h-40 bg-accent-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.03]" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 mb-8 backdrop-blur-md">
              <Sparkles className="text-accent-400" size={16} />
              <span className="text-sm font-medium text-blue-50">Trusted by 500+ US Organizations</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-[1.1] tracking-tight text-white">
              Scale Your Talent Pipeline with <span className="text-accent-400">AI Excellence</span>
            </h1>

            <p className="text-lg md:text-xl text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed">
              Empower your recruiters, staffing agencies, and universities with the world's most advanced AI resume platform. Standardize quality at scale.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="#contact"
                className="group relative bg-accent-500 hover:bg-accent-600 text-white px-8 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 shadow-xl shadow-accent-900/20 transition-all duration-300 transform hover:-translate-y-1 active:scale-95 overflow-hidden"
              >
                Schedule Free Demo
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="#pricing"
                className="px-8 py-4 bg-white/5 border border-white/10 text-white rounded-xl hover:bg-white/10 transition text-lg font-semibold backdrop-blur-sm hover:border-white/20"
              >
                View Plans
              </Link>
            </div>

            {/* Logo Cloud - Refined */}
            <div className="mt-20 pt-10 border-t border-white/10">
              <p className="text-[10px] md:text-xs text-slate-400 uppercase tracking-[0.2em] font-bold mb-8 opacity-60">Powering the Future of Workforce Management</p>
              <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-40 grayscale hover:opacity-100 transition-opacity duration-500">
                <span className="text-lg font-black tracking-tighter">TECHSTARTS</span>
                <span className="text-lg font-black tracking-tighter">UNIVOCITY</span>
                <span className="text-lg font-black tracking-tighter">GLOBALSTAFF</span>
                <span className="text-lg font-black tracking-tighter">TALENTFLOW</span>
                <span className="text-lg font-black tracking-tighter">CAREERHUB</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section - Navy Glass Cards */}
      <section className="py-12 bg-primary-800/50 border-y border-white/5 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { label: 'Resumes Created', value: '50K+', icon: Building2 },
              { label: 'Partner Orgs', value: '500+', icon: Globe },
              { label: 'ATS Pass Rate', value: '98%', icon: ShieldCheck },
              { label: 'Savings/User', value: '85%', icon: Zap }
            ].map((stat, i) => (
              <div key={i} className="flex flex-col items-center text-center p-4">
                <div className="text-3xl md:text-4xl font-bold text-accent-400 mb-1 tabular-nums">{stat.value}</div>
                <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Value Proposition - Modern Grid */}
      <section className="py-24 relative bg-primary-900">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Built for High-Growth Teams</h2>
            <p className="text-lg text-slate-400">Streamlining the transition from candidate to employee with precision and speed.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="group bg-primary-800/40 backdrop-blur-md p-8 rounded-3xl border border-white/5 hover:border-accent-500/50 hover:bg-primary-800/60 transition-all duration-500">
              <div className="w-14 h-14 bg-accent-500/10 rounded-2xl flex items-center justify-center mb-8 border border-accent-500/20 group-hover:bg-accent-500 group-hover:scale-110 transition-all duration-300">
                <Clock className="w-7 h-7 text-accent-400 group-hover:text-white" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-white">Save 95% Time</h3>
              <p className="text-slate-400 leading-relaxed">
                Standardize quality across thousands of users instantly. Our AI handles the formatting so you can focus on the hiring.
              </p>
            </div>

            <div className="group bg-primary-800/40 backdrop-blur-md p-8 rounded-3xl border border-white/5 hover:border-accent-500/50 hover:bg-primary-800/60 transition-all duration-500">
              <div className="w-14 h-14 bg-accent-500/10 rounded-2xl flex items-center justify-center mb-8 border border-accent-500/20 group-hover:bg-accent-500 group-hover:scale-110 transition-all duration-300">
                <TrendingUp className="w-7 h-7 text-accent-400 group-hover:text-white" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-white">3x Boost in Placement</h3>
              <p className="text-slate-400 leading-relaxed">
                ATS-optimized resumes that actually cross the finish line. Increase your shortlist rates significantly with ExpertResume.
              </p>
            </div>

            <div className="group bg-primary-800/40 backdrop-blur-md p-8 rounded-3xl border border-white/5 hover:border-accent-500/50 hover:bg-primary-800/60 transition-all duration-500">
              <div className="w-14 h-14 bg-accent-500/10 rounded-2xl flex items-center justify-center mb-8 border border-accent-500/20 group-hover:bg-accent-500 group-hover:scale-110 transition-all duration-300">
                <Shield className="w-7 h-7 text-accent-400 group-hover:text-white" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-white">Total Governance</h3>
              <p className="text-slate-400 leading-relaxed">
                Full administrative control. Manage user access, monitor progress, and export data with SOC2 compliant security.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section - Teal Accents */}
      <section id="pricing" className="py-24 bg-primary-800/20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Designed for Your Scale</h2>
            <p className="text-lg text-slate-400">Simple, transparent pricing tailored for the US market.</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto items-stretch">
            {/* Academic Plan */}
            <div className="relative group bg-primary-800/50 border border-white/10 rounded-[2.5rem] p-10 hover:bg-primary-800/70 hover:border-accent-500/30 transition-all duration-500 flex flex-col">
              <div className="mb-8">
                <span className="inline-block px-4 py-1 rounded-full bg-accent-500/10 text-accent-400 text-xs font-bold uppercase tracking-wider border border-accent-500/20 mb-4">
                  Education & Universities
                </span>
                <h3 className="text-2xl font-bold text-white mb-2">{ENTERPRISE_CONFIG.academic.name}</h3>
                <div className="flex items-baseline gap-1 mt-4">
                  <span className="text-4xl font-bold text-white tracking-tight">{ENTERPRISE_CONFIG.academic.priceText}</span>
                  <span className="text-slate-500 text-sm">{ENTERPRISE_CONFIG.academic.unit}</span>
                </div>
              </div>
              <p className="text-slate-400 mb-8 text-sm leading-relaxed">{ENTERPRISE_CONFIG.academic.description}</p>
              <ul className="space-y-4 mb-10 flex-grow">
                {ENTERPRISE_CONFIG.academic.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-4">
                    <CheckCircle className="w-5 h-5 text-accent-500 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-300 text-sm">{f}</span>
                  </li>
                ))}
              </ul>
              <Link href="#contact" className="w-full py-4 text-center bg-white/5 border border-white/10 rounded-2xl font-bold hover:bg-white/10 hover:border-white/20 transition-all group/btn">
                Contact Education Team <ArrowRight size={16} className="inline-block ml-1 group-hover/btn:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Agency Plan - Brand Teal Highlight */}
            <div className="relative group bg-gradient-to-b from-primary-700 to-primary-800 border-2 border-accent-500/50 rounded-[2.5rem] p-10 shadow-2xl shadow-accent-500/10 flex flex-col scale-105 z-10">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-accent-500 text-white px-6 py-1.5 rounded-full text-xs font-black uppercase tracking-[0.2em] shadow-xl">
                Most Professional
              </div>
              <div className="mb-8">
                <span className="inline-block px-4 py-1 rounded-full bg-accent-500/20 text-accent-300 text-xs font-bold uppercase tracking-wider border border-accent-500/30 mb-4">
                  Staffing & Placement
                </span>
                <h3 className="text-3xl font-bold text-white mb-2">{ENTERPRISE_CONFIG.agency.name}</h3>
                <div className="flex items-baseline gap-1 mt-4">
                  <span className="text-5xl font-black text-white tracking-tighter">{ENTERPRISE_CONFIG.agency.priceText}</span>
                  <span className="text-accent-300/60 text-sm font-medium">{ENTERPRISE_CONFIG.agency.unit}</span>
                </div>
              </div>
              <p className="text-accent-100/60 mb-8 text-sm leading-relaxed font-medium">{ENTERPRISE_CONFIG.agency.description}</p>
              <ul className="space-y-4 mb-10 flex-grow">
                {ENTERPRISE_CONFIG.agency.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-4">
                    <CheckCircle className="w-5 h-5 text-accent-400 flex-shrink-0 mt-0.5" />
                    <span className="text-accent-50 text-sm font-medium">{f}</span>
                  </li>
                ))}
              </ul>
              <Link href="#contact" className="w-full py-4 text-center bg-accent-500 text-white rounded-2xl font-bold hover:bg-accent-400 transition-all shadow-lg shadow-accent-500/30 group/btn">
                Start Pro Growth <ArrowRight size={16} className="inline-block ml-1 group-hover/btn:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Partner Plan */}
            <div className="relative group bg-primary-800/50 border border-white/10 rounded-[2.5rem] p-10 hover:bg-primary-800/70 hover:border-accent-500/30 transition-all duration-500 flex flex-col">
              <div className="mb-8">
                <span className="inline-block px-4 py-1 rounded-full bg-accent-500/10 text-accent-400 text-xs font-bold uppercase tracking-wider border border-accent-500/20 mb-4">
                  Strategic Partners
                </span>
                <h3 className="text-2xl font-bold text-white mb-2">{ENTERPRISE_CONFIG.partner.name}</h3>
                <div className="flex items-baseline gap-1 mt-4">
                  <span className="text-4xl font-bold text-white tracking-tight">{ENTERPRISE_CONFIG.partner.priceText}</span>
                  <span className="text-slate-500 text-sm">per {ENTERPRISE_CONFIG.partner.unit}</span>
                </div>
              </div>
              <p className="text-slate-400 mb-8 text-sm leading-relaxed">{ENTERPRISE_CONFIG.partner.description}</p>
              <ul className="space-y-4 mb-10 flex-grow">
                {ENTERPRISE_CONFIG.partner.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-4">
                    <CheckCircle className="w-5 h-5 text-accent-500 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-300 text-sm">{f}</span>
                  </li>
                ))}
              </ul>
              <Link href="#contact" className="w-full py-4 text-center bg-white/10 border border-white/10 rounded-2xl font-bold hover:bg-white/20 transition-all group/btn">
                Contact Strategic Sales <ArrowRight size={16} className="inline-block ml-1 group-hover/btn:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section - Sleek Navy form with Teal highlights */}
      <section id="contact" className="py-24 relative overflow-hidden bg-primary-900">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-16">
            <div className="lg:w-1/2">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">Ready to Elevate Your Organization?</h2>
              <p className="text-xl text-slate-400 mb-12">
                Join hundreds of US departments, agencies, and schools already using ExpertResume. Our team is ready to build your custom environment.
              </p>

              <div className="space-y-8">
                <div className="flex items-start gap-6">
                  <div className="w-12 h-12 bg-accent-500/10 rounded-xl flex items-center justify-center border border-accent-500/20">
                    <Mail className="text-accent-400" size={24} />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white mb-1">Direct Coordination</h4>
                    <p className="text-slate-400">enterprise@expertresume.us</p>
                  </div>
                </div>
                <div className="flex items-start gap-6">
                  <div className="w-12 h-12 bg-accent-500/10 rounded-xl flex items-center justify-center border border-accent-500/20">
                    <Phone className="text-accent-400" size={24} />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white mb-1">Fast Support</h4>
                    <p className="text-slate-400">+1 (800) RESUME-HQ</p>
                  </div>
                </div>
              </div>

              {/* Trust Badge Strip */}
              <div className="mt-16 pt-16 border-t border-white/10 flex flex-wrap gap-8 items-center opacity-50 grayscale">
                <div className="flex items-center gap-2"><Shield size={20} /> <span className="text-xs font-bold uppercase tracking-widest">SOC2 TYPE II</span></div>
                <div className="flex items-center gap-2"><Globe size={20} /> <span className="text-xs font-bold uppercase tracking-widest">GDPR COMPLIANT</span></div>
              </div>
            </div>

            <div className="lg:w-1/2">
              <div className="bg-primary-800/80 backdrop-blur-xl p-8 md:p-12 rounded-[2.5rem] border border-white/10 shadow-2xl">
                {submitStatus === 'success' ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-accent-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle className="text-accent-400" size={40} />
                    </div>
                    <h3 className="text-2xl font-bold mb-4">Message Sent Successfully</h3>
                    <p className="text-slate-400">Our Enterprise team will contact you within 24 hours.</p>
                    <button
                      onClick={() => setSubmitStatus('')}
                      className="mt-8 text-accent-400 font-bold hover:text-accent-300 transition-colors"
                    >
                      Send another inquiry
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Organization Type</label>
                        <select
                          required
                          className="w-full bg-primary-900 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-accent-500/50 transition-colors appearance-none"
                          value={formData.organizationType}
                          onChange={(e) => setFormData({ ...formData, organizationType: e.target.value })}
                        >
                          <option value="">Select type</option>
                          <option value="university">University / College</option>
                          <option value="agency">Staffing Agency</option>
                          <option value="corporate">Corporate / HR</option>
                          <option value="government">Government Org</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Organization Name</label>
                        <input
                          required
                          type="text"
                          placeholder="Company Inc."
                          className="w-full bg-primary-900 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-accent-500/50 transition-colors"
                          value={formData.organizationName}
                          onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Contact Name</label>
                        <input
                          required
                          type="text"
                          placeholder="John Doe"
                          className="w-full bg-primary-900 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-accent-500/50 transition-colors"
                          value={formData.contactName}
                          onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Work Email</label>
                        <input
                          required
                          type="email"
                          placeholder="john@organization.com"
                          className="w-full bg-primary-900 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-accent-500/50 transition-colors"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">How can we help?</label>
                      <textarea
                        required
                        rows={4}
                        placeholder="Tell us about your organization's needs..."
                        className="w-full bg-primary-900 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-accent-500/50 transition-colors resize-none"
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-accent-500 hover:bg-accent-600 text-white font-black uppercase tracking-widest py-4 rounded-xl shadow-lg shadow-accent-500/20 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
                    >
                      {isSubmitting ? 'Processing...' : 'Request Partnership'}
                      {!isSubmitting && <Rocket size={20} />}
                    </button>
                    {submitStatus === 'error' && (
                      <p className="text-red-400 text-sm text-center">Something went wrong. Please try again or email us directly.</p>
                    )}
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Branding */}
      <footer className="py-12 border-t border-white/5 bg-primary-900 flex justify-center items-center gap-4 opacity-30">
        <span className="text-sm font-bold tracking-widest uppercase">ExpertResume Enterprise</span>
        <div className="w-1 h-1 rounded-full bg-white"></div>
        <span className="text-xs">© 2026 Vendax Systems LLC</span>
      </footer>
    </div>
  );
}
