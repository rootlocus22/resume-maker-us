"use client";
import Link from 'next/link';

export default function SEOHowTo({ title }) {
    return (
        <section className="py-20 bg-white">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                        How to Write a {title} Resume (2026 Guide)
                    </h2>
                    <p className="text-xl text-gray-600">
                        Follow this step-by-step workflow to create a resume that passes the 6-second recruiter scan
                    </p>
                </div>

                <div className="space-y-12">
                    <div className="flex gap-6">
                        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-accent-50 text-accent flex items-center justify-center font-bold text-xl">1</div>
                        <div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">Choose the Right Format</h3>
                            <p className="text-gray-600 leading-relaxed mb-4">
                                For most {title.toLowerCase()} roles, the <strong>Reverse-Chronological</strong> format is the gold standard. It highlights your most recent experience first, which is exactly what recruiters want to see.
                            </p>
                            <div className="bg-accent-50 p-4 rounded-lg border border-accent/10">
                                <p className="text-sm text-primary font-medium">💡 Pro Tip: Use our "Modern" or "Professional" templates for the best ATS parsing rates.</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-6">
                        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-xl">2</div>
                        <div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">Write a Compelling Professional Summary</h3>
                            <p className="text-gray-600 leading-relaxed">
                                Start with a 2-3 sentence hook. Mention your years of experience as a {title}, your biggest achievement, and key skills.
                            </p>
                            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 mt-2 font-mono text-sm text-gray-700">
                                "Results-driven {title} with 5+ years of experience in [Key Area]. Proven track record of improving [Metric] by [X]%..."
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-6">
                        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-bold text-xl">3</div>
                        <div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">Quantify Your Achievements</h3>
                            <p className="text-gray-600 leading-relaxed">
                                Don't just list duties. Use numbers. Instead of "Managed a team," say "Led a team of 10 {title.toLowerCase()}s to achieve 20% YOY growth."
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mt-12 text-center">
                    <Link
                        href="/resume-builder"
                        className="inline-block bg-gray-900 text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-gray-800 transition-all shadow-xl hover:shadow-2xl"
                    >
                        Build My {title} Resume Now
                    </Link>
                </div>
            </div>
        </section>
    );
}
