"use client";
import { Lightbulb } from 'lucide-react';

export default function SEOProTips({ title, proTips }) {
    return (
        <section className="py-20 bg-gradient-to-br from-indigo-50 to-blue-50">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                        Expert Tips to Ace Your {title} Interview
                    </h2>
                </div>
                <div className="grid md:grid-cols-3 gap-8">
                    {proTips && proTips.length > 0 ? proTips.map((tip, index) => (
                        <div key={index} className="bg-white p-8 rounded-2xl shadow-sm border border-blue-100/50 hover:shadow-lg transition-all">
                            <Lightbulb className="text-yellow-500 mb-4" size={32} />
                            <h3 className="font-bold text-xl text-gray-900 mb-3">{tip.title}</h3>
                            <p className="text-gray-600">{tip.description}</p>
                        </div>
                    )) : (
                        <>
                            <div className="bg-white p-8 rounded-2xl shadow-sm border border-blue-100/50">
                                <Lightbulb className="text-yellow-500 mb-4" size={32} />
                                <h3 className="font-bold text-xl text-gray-900 mb-3">Tailor Your Keywords</h3>
                                <p className="text-gray-600">Analyze the job description for {title.toLowerCase()} roles and mirror the exact terminology used for skills and requirements.</p>
                            </div>
                            <div className="bg-white p-8 rounded-2xl shadow-sm border border-blue-100/50">
                                <Lightbulb className="text-yellow-500 mb-4" size={32} />
                                <h3 className="font-bold text-xl text-gray-900 mb-3">Show Continuous Learning</h3>
                                <p className="text-gray-600">The {title.toLowerCase()} field evolves fast. Highlight recent certifications, workshops, or self-study projects.</p>
                            </div>
                            <div className="bg-white p-8 rounded-2xl shadow-sm border border-blue-100/50">
                                <Lightbulb className="text-yellow-500 mb-4" size={32} />
                                <h3 className="font-bold text-xl text-gray-900 mb-3">Portfolio Matters</h3>
                                <p className="text-gray-600">If applicable, include a link to your portfolio or GitHub. Practical examples often outweigh theoretical knowledge for {title}s.</p>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </section>
    );
}
