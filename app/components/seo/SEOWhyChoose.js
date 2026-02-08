"use client";
import { CheckCircle } from 'lucide-react';

export default function SEOWhyChoose({ title, features }) {
    if (!features || features.length === 0) return null;

    return (
        <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                        Why {title} Professionals Use Our Builder
                    </h2>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                        Join thousands of {title.toLowerCase()} experts who have successfully landed jobs at top companies using our specialized ATS-friendly templates.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="group bg-white p-8 rounded-2xl border border-gray-100 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
                        >
                            <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <CheckCircle className="text-blue-600" size={28} />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-3">Key Feature</h3>
                            <p className="text-gray-600 leading-relaxed">{feature}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
