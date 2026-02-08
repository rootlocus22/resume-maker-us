"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
	X,
	HelpCircle,
	Play,
	BookOpen,
	MessageCircle,
	Video,
	Zap,
	Target,
	FileText,
	Palette,
	Bot,
	Eye,
	Save,
	LayoutDashboard,
	FileUp,
	Sparkles,
	ExternalLink,
	Mail,
	Phone,
	Clock
} from "lucide-react";
import GuidedTour from "./GuidedTour";

const helpSections = [
	{
		id: "tour",
		title: "Interactive Tour",
		description: "Take a guided tour to discover all features",
		icon: <Play className="w-5 h-5" />,
		color: "purple"
	},
	{
		id: "features",
		title: "Feature Guide",
		description: "Learn about each feature in detail",
		icon: <BookOpen className="w-5 h-5" />,
		color: "blue"
	},
	{
		id: "tips",
		title: "Pro Tips",
		description: "Best practices for resume building",
		icon: <Zap className="w-5 h-5" />,
		color: "yellow"
	},
	{
		id: "support",
		title: "Get Support",
		description: "Contact us for help and feedback",
		icon: <MessageCircle className="w-5 h-5" />,
		color: "green"
	}
];

const features = [
	{
		icon: <Target className="w-6 h-6 text-[#0B1F3B]" />,
		title: "ATS Score Checker",
		description: "Real-time ATS optimization score that updates as you edit your resume."
	},
	{
		icon: <LayoutDashboard className="w-6 h-6 text-teal-600" />,
		title: "Professional Templates",
		description: "Choose from 20+ ATS-optimized templates designed by professionals."
	},
	{
		icon: <FileUp className="w-6 h-6 text-emerald-600" />,
		title: "Smart Import",
		description: "Upload your existing resume and our AI will extract all information automatically."
	},
	{
		icon: <Bot className="w-6 h-6 text-[#0B1F3B]" />,
		title: "AI Enhancement",
		description: "Let AI analyze and improve your resume content for better impact."
	},
	{
		icon: <Eye className="w-6 h-6 text-[#0B1F3B]" />,
		title: "Live Preview",
		description: "See your changes instantly with real-time preview as you type."
	},
	{
		icon: <Palette className="w-6 h-6 text-orange-600" />,
		title: "Color Customization",
		description: "Personalize your resume with custom colors and styling options."
	},
	{
		icon: <FileText className="w-6 h-6 text-[#0B1F3B]" />,
		title: "Version Management",
		description: "Create multiple resume versions and switch between them easily."
	},
	{
		icon: <Save className="w-6 h-6 text-[#0B1F3B]" />,
		title: "Cloud Save & PDF",
		description: "Save to cloud and download professional PDFs instantly."
	}
];

const proTips = [
	{
		icon: "🎯",
		title: "Optimize for ATS",
		tip: "Keep your ATS score above 80% for better chances of passing automated screening."
	},
	{
		icon: "📝",
		title: "Use Action Verbs",
		tip: "Start bullet points with strong action verbs like 'Led', 'Developed', 'Implemented'."
	},
	{
		icon: "📊",
		title: "Quantify Achievements",
		tip: "Include numbers and percentages to show measurable impact of your work."
	},
	{
		icon: "🎨",
		title: "Keep It Clean",
		tip: "Use consistent formatting, proper spacing, and professional colors."
	},
	{
		icon: "📱",
		title: "Mobile-Friendly",
		tip: "Ensure your resume looks good on all devices - many recruiters use mobile."
	},
	{
		icon: "🔄",
		title: "Regular Updates",
		tip: "Keep your resume updated with latest skills and achievements."
	}
];

export default function HelpModal({ isOpen, onClose }) {
	const [activeSection, setActiveSection] = useState("tour");
	const [showTour, setShowTour] = useState(false);

	const handleStartTour = () => {
		setShowTour(true);
		onClose();
	};

	const handleCloseTour = () => {
		setShowTour(false);
	};

	const handleCompleteTour = () => {
		setShowTour(false);
		// You can add analytics or other completion logic here
	};

	if (!isOpen && !showTour) return null;

	return (
		<>
			<AnimatePresence>
				{showTour && (
					<GuidedTour
						isOpen={showTour}
						onClose={handleCloseTour}
						onComplete={handleCompleteTour}
					/>
				)}
			</AnimatePresence>

			<AnimatePresence>
				{isOpen && (
					<div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							className="fixed inset-0 bg-black/50 backdrop-blur-sm"
							onClick={onClose}
						/>
						
						<motion.div
							initial={{ opacity: 0, scale: 0.95, y: 20 }}
							animate={{ opacity: 1, scale: 1, y: 0 }}
							exit={{ opacity: 0, scale: 0.95, y: 20 }}
							className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
						>
							{/* Header */}
							<div className="bg-gradient-to-r from-[#0B1F3B] to-[#0B1F3B] px-6 py-4 text-white">
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-3">
										<div className="p-2 bg-white/20 rounded-lg">
											<HelpCircle className="w-6 h-6" />
										</div>
										<div>
											<h2 className="text-xl font-bold">Help & Support</h2>
											<p className="text-sm opacity-90">Learn how to make the most of Resume Builder</p>
											<p className="text-sm mt-1 font-semibold text-yellow-200 select-all">Contact: <a href="mailto:support@expertresume.us" className="underline hover:text-white">support@expertresume.us</a></p>
										</div>
									</div>
									<button
										onClick={onClose}
										className="p-2 hover:bg-white/20 rounded-lg transition-colors"
									>
										<X className="w-6 h-6" />
									</button>
								</div>

								{/* Section Tabs */}
								<div className="flex gap-2 mt-4 overflow-x-auto">
									{helpSections.map((section) => (
										<button
											key={section.id}
											onClick={() => setActiveSection(section.id)}
											className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
												activeSection === section.id
													? 'bg-white/20 text-white'
													: 'text-white/70 hover:text-white hover:bg-white/10'
											}`}
										>
											{section.icon}
											{section.title}
										</button>
									))}
								</div>
							</div>

							{/* Content */}
							<div className="p-6 max-h-[60vh] overflow-y-auto">
								{activeSection === "tour" && (
									<div className="text-center">
										<div className="w-20 h-20 bg-gradient-to-r from-slate-100 to-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
											<Sparkles className="w-10 h-10 text-[#0B1F3B]" />
										</div>
										<h3 className="text-2xl font-bold text-gray-800 mb-4">
											Ready to Explore? 🚀
										</h3>
										<p className="text-gray-600 mb-8 max-w-md mx-auto">
											Take an interactive tour to discover all the powerful features that will help you create an amazing resume.
										</p>
										
										<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
											<div className="bg-slate-50 p-4 rounded-xl">
												<Target className="w-8 h-8 text-[#0B1F3B] mx-auto mb-2" />
												<p className="text-sm font-medium text-gray-800">ATS Score</p>
											</div>
											<div className="bg-slate-50 p-4 rounded-xl">
												<Bot className="w-8 h-8 text-[#0B1F3B] mx-auto mb-2" />
												<p className="text-sm font-medium text-gray-800">AI Boost</p>
											</div>
											<div className="bg-slate-50 p-4 rounded-xl">
												<Eye className="w-8 h-8 text-[#0B1F3B] mx-auto mb-2" />
												<p className="text-sm font-medium text-gray-800">Live Preview</p>
											</div>
											<div className="bg-orange-50 p-4 rounded-xl">
												<Palette className="w-8 h-8 text-orange-600 mx-auto mb-2" />
												<p className="text-sm font-medium text-gray-800">Customization</p>
											</div>
										</div>

										<button
											onClick={handleStartTour}
											className="bg-gradient-to-r from-[#0B1F3B] to-[#0B1F3B] text-white py-3 px-8 rounded-xl font-semibold hover:from-[#071429] hover:to-[#071429] transition-all duration-200 flex items-center justify-center gap-2 mx-auto"
										>
											<Play className="w-5 h-5" />
											Start Interactive Tour
										</button>
									</div>
								)}

								{activeSection === "features" && (
									<div>
										<h3 className="text-xl font-bold text-gray-800 mb-6">Feature Overview</h3>
										<div className="grid gap-4">
											{features.map((feature, index) => (
												<div key={index} className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
													<div className="flex-shrink-0">
														{feature.icon}
													</div>
													<div>
														<h4 className="font-semibold text-gray-800 mb-2">{feature.title}</h4>
														<p className="text-gray-600 text-sm">{feature.description}</p>
													</div>
												</div>
											))}
										</div>
									</div>
								)}

								{activeSection === "tips" && (
									<div>
										<h3 className="text-xl font-bold text-gray-800 mb-6">Pro Tips for Success</h3>
										<div className="grid gap-4">
											{proTips.map((tip, index) => (
												<div key={index} className="flex items-start gap-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200">
													<div className="text-2xl">{tip.icon}</div>
													<div>
														<h4 className="font-semibold text-gray-800 mb-2">{tip.title}</h4>
														<p className="text-gray-600 text-sm">{tip.tip}</p>
													</div>
												</div>
											))}
										</div>
									</div>
								)}

								{activeSection === "support" && (
									<div>
										<h3 className="text-xl font-bold text-gray-800 mb-6">Get Help & Support</h3>
										
										<div className="grid md:grid-cols-2 gap-6">
											<div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
												<div className="flex items-center gap-3 mb-4">
													<Mail className="w-6 h-6 text-[#0B1F3B]" />
													<h4 className="font-semibold text-gray-800">Email Support</h4>
												</div>
												<p className="text-gray-600 text-sm mb-4">
													Get help with any questions or issues you're facing.
												</p>
												<a
													href="mailto:support@expertresume.us"
													className="inline-flex items-center gap-2 bg-gradient-to-r from-[#0B1F3B] to-[#00C4B3] text-white px-4 py-2 rounded-lg font-medium hover:from-[#071429] hover:to-[#008C81] transition-all duration-200 shadow-lg hover:shadow-xl"
												>
													<Mail size={16} />
													support@expertresume.us
												</a>
											</div>

											<div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
												<div className="flex items-center gap-3 mb-4">
													<MessageCircle className="w-6 h-6 text-[#0B1F3B]" />
													<h4 className="font-semibold text-gray-800">Live Chat</h4>
												</div>
												<p className="text-gray-600 text-sm mb-4">
													Chat with our support team in real-time via WhatsApp.
												</p>
												<a
													href="https://wa.me/918431256903"
													target="_blank"
													rel="noopener noreferrer"
													className="inline-flex items-center gap-2 text-[#0B1F3B] hover:text-[#071429] font-medium text-sm"
												>
													Start Chat
													<ExternalLink className="w-4 h-4" />
												</a>
											</div>

											<div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
												<div className="flex items-center gap-3 mb-4">
													<Video className="w-6 h-6 text-[#0B1F3B]" />
													<h4 className="font-semibold text-gray-800">Video Tutorials</h4>
												</div>
												<p className="text-gray-600 text-sm mb-4">
													Watch step-by-step video guides for each feature.
												</p>
												<a
													href="https://www.vendaxsystemlabs.com/wp-content/uploads/2025/04/Free-Resume-Builder-_-ATS-Friendly-Resume-Maker-CV-Generator-1.mp4"
													target="_blank"
													rel="noopener noreferrer"
													className="inline-flex items-center gap-2 text-[#0B1F3B] hover:text-[#071429] font-medium text-sm"
												>
													Watch Videos
													<ExternalLink className="w-4 h-4" />
												</a>
											</div>

											<div className="bg-orange-50 p-6 rounded-xl border border-orange-200">
												<div className="flex items-center gap-3 mb-4">
													<Clock className="w-6 h-6 text-orange-600" />
													<h4 className="font-semibold text-gray-800">Response Time</h4>
												</div>
												<p className="text-gray-600 text-sm mb-2">
													<strong>Email:</strong> Within 24 hours
												</p>
												<p className="text-gray-600 text-sm">
													<strong>Live Chat:</strong> Instant response
												</p>
											</div>
										</div>
									</div>
								)}
							</div>

							{/* Footer */}
							<div className="bg-gray-50 px-6 py-4 border-t">
								<div className="flex items-center justify-between text-sm text-gray-600">
									<p>Need more help? We're here to assist you!</p>
									<div className="flex items-center gap-4">
										<a
											href="mailto:support@expertresume.us"
											className="text-[#0B1F3B] hover:text-[#071429] font-medium"
										>
											Contact Support
										</a>
										<button
											onClick={onClose}
											className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-lg font-medium transition-colors"
										>
											Close
										</button>
									</div>
								</div>
							</div>
						</motion.div>
					</div>
				)}
			</AnimatePresence>
		</>
	);
}
