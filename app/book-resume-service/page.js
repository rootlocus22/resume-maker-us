"use client";
import { useState } from "react";
import {
  CheckCircle2, Shield, Clock, ArrowRight, Star, FileText,
  Award, BadgeCheck, CreditCard, Lock, X, ChevronDown,
  Mail, Briefcase, Users, Zap
} from "lucide-react";
import Link from "next/link";

export default function BookResumeServicePage() {
  const [openFaq, setOpenFaq] = useState(null);

  const handleEmailClick = (service = '') => {
    const subject = encodeURIComponent(service ? `Inquiry: ${service}` : 'Resume Service Inquiry');
    const body = encodeURIComponent(`Hi,\n\nI'm interested in your professional resume writing service${service ? ` (${service})` : ''}.\n\nPlease let me know the next steps.\n\nThank you`);
    window.open(`mailto:support@expertresume.us?subject=${subject}&body=${body}`, '_blank');
  };

  const servicePackages = [
    {
      name: "Career Starter",
      price: "$49",
      originalPrice: "$99",
      audience: "Entry-level & recent graduates",
      turnaround: "3 business days",
      features: [
        "ATS-optimized resume formatting",
        "Skills-based structure for early career",
        "Modern, clean design template",
        "Entry-level keyword optimization",
        "1 round of revisions",
        "PDF & DOCX delivery"
      ],
      bonuses: ["Cover letter template", "Job search tips guide"],
    },
    {
      name: "Professional",
      price: "$99",
      originalPrice: "$199",
      audience: "Mid-career professionals (3-10 years)",
      turnaround: "2 business days",
      popular: true,
      features: [
        "ATS-optimized resume with achievement focus",
        "Industry keyword optimization",
        "Quantified accomplishments rewriting",
        "LinkedIn profile optimization",
        "Professional cover letter",
        "2 rounds of revisions",
        "PDF, DOCX & TXT delivery"
      ],
      bonuses: ["LinkedIn optimization", "Cover letter", "Interview prep guide"],
    },
    {
      name: "Executive",
      price: "$249",
      originalPrice: "$499",
      audience: "Directors, VPs & C-suite executives",
      turnaround: "2 business days",
      premium: true,
      features: [
        "Executive positioning & personal branding",
        "Achievement quantification (ROI-focused)",
        "LinkedIn executive profile transformation",
        "Strategic narrative for leadership roles",
        "Board-ready resume format",
        "1-on-1 strategy consultation call",
        "Unlimited revisions",
        "Priority 48-hour delivery option"
      ],
      bonuses: ["LinkedIn executive optimization", "Personal branding guide", "Salary negotiation playbook", "Executive interview prep"],
    }
  ];

  const testimonials = [
    {
      name: "Michael Chen",
      role: "Software Engineering Manager",
      company: "Previously at Oracle",
      text: "Went from getting zero callbacks to landing 4 interviews in two weeks. The ATS optimization made all the difference.",
      result: "Landed a role at a FAANG company",
      rating: 5
    },
    {
      name: "Sarah Mitchell",
      role: "Marketing Director",
      company: "Consumer Goods Industry",
      text: "The executive resume completely repositioned my career narrative. Worth every penny for senior professionals.",
      result: "$35K salary increase",
      rating: 5
    },
    {
      name: "David Rodriguez",
      role: "Financial Analyst",
      company: "Banking Sector",
      text: "Clean, professional, and perfectly formatted for ATS. Got through to final rounds at 3 top firms.",
      result: "Multiple offers within 30 days",
      rating: 5
    },
    {
      name: "Jennifer Park",
      role: "Product Manager",
      company: "Tech Startup",
      text: "The team understood exactly what tech recruiters look for. My resume finally tells my story properly.",
      result: "2x more recruiter outreach",
      rating: 5
    }
  ];

  const faqs = [
    {
      q: "How does the process work?",
      a: "It's simple: (1) You place your order and share your current resume and target roles via email. (2) Our writer creates your ATS-optimized resume and sends a draft for your review. (3) You provide feedback, we make revisions, and deliver the final files in PDF, DOCX, and TXT formats."
    },
    {
      q: "How long does it take?",
      a: "Career Starter resumes are delivered in 3 business days. Professional resumes in 2 business days. Executive resumes in 2 business days with a 48-hour rush option available. You'll receive progress updates via email throughout."
    },
    {
      q: "What if I'm not satisfied?",
      a: "All packages include revision rounds to ensure you're happy with the result. If you're still not satisfied after revisions, we offer a full refund within 14 days of delivery. Your satisfaction is guaranteed."
    },
    {
      q: "What makes your resumes ATS-friendly?",
      a: "We format resumes specifically for applicant tracking systems used by companies like Google, Amazon, JPMorgan, and thousands of others. This includes proper section headings, clean formatting (no tables or graphics that confuse ATS), optimized file structure, and industry-specific keywords that match how recruiters search."
    },
    {
      q: "Do you write for specific industries?",
      a: "Yes. Our writers specialize in tech, finance, healthcare, consulting, marketing, engineering, and more. When you place your order, you'll specify your industry and target roles so we can match you with the right writer."
    },
    {
      q: "What information do I need to provide?",
      a: "Share your current resume (any format), target job titles or roles, and any specific requirements or preferences. The more context you provide about your career goals, the better we can tailor your resume."
    },
    {
      q: "Is my payment secure?",
      a: "All payments are processed through Stripe with 256-bit SSL encryption. We accept Visa, Mastercard, American Express, Discover, Apple Pay, and Google Pay. We never store your card details."
    },
    {
      q: "Can you help with LinkedIn too?",
      a: "Yes. Our Professional and Executive packages include LinkedIn profile optimization. We'll align your LinkedIn headline, summary, and experience sections with your new resume to create a consistent professional brand."
    }
  ];

  return (
    <div className="min-h-screen bg-white">

      {/* Hero */}
      <section className="pt-8 pb-6 sm:pt-14 sm:pb-10 border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-8 transition-colors">
            <ArrowRight className="w-3.5 h-3.5 rotate-180" />
            Back to Home
          </Link>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight mb-4 leading-tight">
            Professional resume writing
            <span className="block text-accent mt-1">by career experts</span>
          </h1>

          <p className="text-base sm:text-lg text-gray-500 max-w-2xl mx-auto mb-6 leading-relaxed">
            Let our specialists craft an ATS-optimized resume tailored to your industry. 
            Trusted by professionals landing roles at Fortune 500 companies.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-gray-400 mb-8">
            <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> 2-3 day delivery</span>
            <span className="flex items-center gap-1.5"><Shield className="w-4 h-4" /> Satisfaction guaranteed</span>
            <span className="flex items-center gap-1.5"><Lock className="w-4 h-4" /> Secure payment</span>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">5,000+</p>
              <p className="text-xs text-gray-500">Resumes delivered</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">4.8/5</p>
              <p className="text-xs text-gray-500">Client rating</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">3x</p>
              <p className="text-xs text-gray-500">More interviews</p>
            </div>
          </div>
        </div>
      </section>

      {/* Before / After */}
      <section className="py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-2">See the difference</h2>
          <p className="text-sm text-gray-500 text-center mb-10">Real results from our resume optimization</p>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-red-50/50 border border-red-200/60 rounded-xl p-6">
              <h3 className="font-semibold text-red-700 mb-4 flex items-center gap-2 text-sm">
                <X className="w-4 h-4" />
                Before: Typical resume
              </h3>
              <ul className="space-y-2.5 text-sm text-gray-600">
                {["3+ pages, cluttered layout", "45% ATS compatibility score", "0-1 interview calls per month", "Missing industry keywords", "Generic bullet points"].map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <X className="w-3.5 h-3.5 text-red-400 mt-0.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-green-50/50 border border-green-200/60 rounded-xl p-6">
              <h3 className="font-semibold text-green-700 mb-4 flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4" />
                After: Our optimized resume
              </h3>
              <ul className="space-y-2.5 text-sm text-gray-600">
                {["1-2 pages, clean & professional", "92%+ ATS compatibility score", "3-5 interview calls per month", "Industry keywords optimized", "Quantified achievements that stand out"].map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-500 mt-0.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Service Packages */}
      <section className="py-12 sm:py-16 bg-gray-50/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-2">Choose your package</h2>
          <p className="text-sm text-gray-500 text-center mb-10">Select based on your experience level and career goals</p>

          <div className="grid gap-6 lg:grid-cols-3">
            {servicePackages.map((pkg) => (
              <div
                key={pkg.name}
                className={`relative bg-white rounded-2xl p-6 flex flex-col h-full ${
                  pkg.popular
                    ? 'border-2 border-accent shadow-lg shadow-teal-100/50'
                    : pkg.premium
                      ? 'border-2 border-gray-900 shadow-lg'
                      : 'border border-gray-200'
                }`}
              >
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-accent text-white text-xs font-bold px-3 py-1 rounded-full">MOST POPULAR</span>
                  </div>
                )}
                {pkg.premium && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-gray-900 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1"><Award className="w-3 h-3" /> EXECUTIVE</span>
                  </div>
                )}

                <div className="mt-2 mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{pkg.name}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{pkg.audience}</p>
                </div>

                <div className="mb-5">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-gray-900">{pkg.price}</span>
                    <span className="text-sm text-gray-400 line-through">{pkg.originalPrice}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">One-time payment &middot; {pkg.turnaround} delivery</p>
                </div>

                <ul className="space-y-2.5 mb-6 flex-grow">
                  {pkg.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-gray-600">
                      <CheckCircle2 className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {pkg.bonuses.length > 0 && (
                  <div className="mb-5 p-3 bg-teal-50/50 rounded-lg border border-teal-100">
                    <p className="text-[10px] font-bold text-teal-700 uppercase tracking-wider mb-1.5">Free bonuses included</p>
                    <div className="flex flex-wrap gap-1.5">
                      {pkg.bonuses.map((bonus, i) => (
                        <span key={i} className="text-[11px] bg-white text-teal-700 px-2 py-0.5 rounded border border-teal-200">
                          {bonus}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={() => handleEmailClick(pkg.name)}
                  className={`w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
                    pkg.popular
                      ? 'bg-accent text-white hover:bg-[#00b3a3] shadow-md shadow-teal-200/40'
                      : pkg.premium
                        ? 'bg-gray-900 text-white hover:bg-gray-800'
                        : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-gray-400'
                  }`}
                >
                  <Mail className="w-4 h-4" />
                  Get Started
                </button>
              </div>
            ))}
          </div>

          <p className="text-center text-xs text-gray-400 mt-6">
            All packages are one-time payments. Satisfaction guaranteed or your money back.
          </p>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-2">How it works</h2>
          <p className="text-sm text-gray-500 text-center mb-10">Simple 3-step process to get your professional resume</p>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "1", title: "Share your details", desc: "Send your current resume, target roles, and career goals via email. We'll match you with the right writer." },
              { step: "2", title: "We write & review", desc: "Our specialist creates your ATS-optimized resume and sends a draft for your feedback within 2-3 days." },
              { step: "3", title: "Final delivery", desc: "After revisions, you receive your polished resume in PDF, DOCX, and TXT formats ready to apply." }
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-12 h-12 bg-accent text-white rounded-xl flex items-center justify-center font-bold text-lg mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-12 sm:py-16 bg-gray-50/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-2">What our clients say</h2>
          <p className="text-sm text-gray-500 text-center mb-10">Real results from professionals across the US</p>

          <div className="grid sm:grid-cols-2 gap-5">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-center gap-0.5 mb-3">
                  {[...Array(t.rating)].map((_, j) => (
                    <Star key={j} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-gray-700 mb-4 leading-relaxed">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{t.name}</p>
                    <p className="text-xs text-gray-500">{t.role} &middot; {t.company}</p>
                  </div>
                  <span className="text-xs font-medium bg-teal-50 text-teal-700 px-2 py-1 rounded">{t.result}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-10">Why professionals choose us</h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: <Zap className="w-5 h-5" />, title: "ATS-optimized", desc: "Formatted for Greenhouse, Lever, Workday and all major applicant tracking systems." },
              { icon: <BadgeCheck className="w-5 h-5" />, title: "Expert writers", desc: "Certified resume writers with experience across tech, finance, healthcare, and more." },
              { icon: <Clock className="w-5 h-5" />, title: "Fast turnaround", desc: "Professional resumes delivered in 2-3 business days. Rush options available." },
              { icon: <Shield className="w-5 h-5" />, title: "Satisfaction guarantee", desc: "Not happy? We'll revise until you are, or provide a full refund." },
              { icon: <CreditCard className="w-5 h-5" />, title: "Secure payment", desc: "Stripe-powered checkout. Visa, Mastercard, Amex, Apple Pay, Google Pay accepted." },
              { icon: <Users className="w-5 h-5" />, title: "US market focused", desc: "Optimized for the US job market, US resume standards, and US employer expectations." },
            ].map((item, i) => (
              <div key={i} className="p-5 rounded-xl border border-gray-100 bg-white">
                <div className="w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center text-accent mb-3">
                  {item.icon}
                </div>
                <h4 className="text-sm font-semibold text-gray-900 mb-1">{item.title}</h4>
                <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className="py-12 sm:py-16 bg-gray-50/50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-10">How we compare</h2>

          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-5 py-4 text-sm font-semibold text-gray-900">Feature</th>
                  <th className="text-center px-4 py-4 text-sm font-semibold text-gray-400">Freelancer</th>
                  <th className="text-center px-4 py-4 text-sm font-semibold text-gray-400">Agency</th>
                  <th className="text-center px-4 py-4 text-sm font-semibold text-accent">ExpertResume</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: "Price", freelancer: "$150-300", agency: "$400-800", us: "$49-249" },
                  { feature: "ATS optimization", freelancer: false, agency: true, us: true },
                  { feature: "Industry expertise", freelancer: "Varies", agency: true, us: true },
                  { feature: "Turnaround", freelancer: "5-7 days", agency: "7-14 days", us: "2-3 days" },
                  { feature: "Revisions", freelancer: "1", agency: "2", us: "2+ (unlimited for Exec)" },
                  { feature: "LinkedIn included", freelancer: false, agency: "Extra $$$", us: true },
                  { feature: "Cover letter", freelancer: "Extra $$$", agency: "Extra $$$", us: true },
                ].map((row, i) => (
                  <tr key={i} className={i % 2 === 0 ? "" : "bg-gray-50/50"}>
                    <td className="px-5 py-3 text-gray-700 font-medium">{row.feature}</td>
                    <td className="px-4 py-3 text-center text-gray-500">
                      {typeof row.freelancer === 'boolean' ? (row.freelancer ? <CheckCircle2 className="w-4 h-4 text-gray-400 mx-auto" /> : <span className="text-gray-300">--</span>) : <span className="text-xs">{row.freelancer}</span>}
                    </td>
                    <td className="px-4 py-3 text-center text-gray-500">
                      {typeof row.agency === 'boolean' ? (row.agency ? <CheckCircle2 className="w-4 h-4 text-gray-400 mx-auto" /> : <span className="text-gray-300">--</span>) : <span className="text-xs">{row.agency}</span>}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {typeof row.us === 'boolean' ? (row.us ? <CheckCircle2 className="w-4 h-4 text-accent mx-auto" /> : <span className="text-gray-300">--</span>) : <span className="text-xs font-bold text-accent">{row.us}</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-12 sm:py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-2">Frequently asked questions</h2>
          <p className="text-sm text-gray-500 text-center mb-10">Everything you need to know about our resume service</p>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <button
                  className="flex justify-between items-center w-full text-left px-5 py-4 hover:bg-gray-50/50 transition-colors"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <h3 className="text-sm font-semibold text-gray-900 pr-4">{faq.q}</h3>
                  <ChevronDown className={`w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200 ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4">
                    <p className="text-sm text-gray-600 leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-12 sm:py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 sm:p-12 text-center text-white">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">Ready for a professional resume?</h2>
            <p className="text-gray-300 text-sm sm:text-base mb-8 max-w-md mx-auto">
              Join thousands of professionals who landed their dream jobs with our expertly crafted resumes.
            </p>
            <button
              onClick={() => handleEmailClick()}
              className="bg-accent text-white px-8 py-3.5 rounded-xl font-semibold text-sm hover:bg-[#00b3a3] transition-colors shadow-lg shadow-teal-900/20 inline-flex items-center gap-2"
            >
              <Mail className="w-4 h-4" /> Get Started Today
            </button>
            <p className="text-xs text-gray-400 mt-5">
              support@expertresume.us &middot; Secure payment via Stripe &middot; Satisfaction guaranteed
            </p>
          </div>
        </div>
      </section>

      {/* Internal Links */}
      <section className="py-10 border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Explore our free tools</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { href: "/resume-builder", title: "AI Resume Builder", desc: "Build for free" },
              { href: "/ats-score-checker", title: "ATS Score Checker", desc: "Check your score" },
              { href: "/templates", title: "Resume Templates", desc: "50+ templates" },
              { href: "/pricing", title: "Pricing", desc: "View all plans" },
            ].map((link) => (
              <Link key={link.href} href={link.href} className="p-3 bg-gray-50 rounded-lg border border-gray-100 hover:border-gray-300 transition-colors group">
                <span className="block text-sm font-medium text-gray-900 group-hover:text-accent">{link.title}</span>
                <span className="text-xs text-gray-500">{link.desc}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "BreadcrumbList",
                "itemListElement": [
                  { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://expertresume.us" },
                  { "@type": "ListItem", "position": 2, "name": "Resume Service", "item": "https://expertresume.us/book-resume-service" }
                ]
              },
              {
                "@type": "ProfessionalService",
                "name": "ExpertResume - Professional Resume Writing Service",
                "description": "Professional resume writing service with ATS optimization. Trusted by 5,000+ professionals across the US.",
                "url": "https://expertresume.us/book-resume-service",
                "priceRange": "$49-$249",
                "address": { "@type": "PostalAddress", "addressCountry": "US" },
                "aggregateRating": { "@type": "AggregateRating", "ratingValue": "4.8", "reviewCount": "500", "bestRating": "5" },
                "offers": servicePackages.map(pkg => ({
                  "@type": "Offer",
                  "name": pkg.name,
                  "description": pkg.audience,
                  "price": pkg.price.replace('$', ''),
                  "priceCurrency": "USD",
                  "availability": "https://schema.org/InStock"
                }))
              }
            ]
          })
        }}
      />
    </div>
  );
}
