"use client";
import { Zap, Users, Target } from 'lucide-react';

export default function SEOSkills({ title, skills }) {
    return (
        <section className="py-20 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                        Must-Have Skills for Your {title} Resume
                    </h2>
                    <p className="text-xl text-gray-600">
                        Our AI automatically suggests these high-impact skills based on 2026 hiring trends
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    {skills && skills.length > 0 ? skills.map((skill, index) => (
                        <div key={index} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md border border-gray-100">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-accent-50 rounded-lg text-accent">
                                    <Zap size={20} />
                                </div>
                                <h3 className="font-bold text-gray-900">{skill.name}</h3>
                            </div>
                            <p className="text-gray-600 text-sm">{skill.description}</p>
                        </div>
                    )) : (
                        <>
                            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md border border-gray-100">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-accent-50 rounded-lg text-accent">
                                        <Zap size={20} />
                                    </div>
                                    <h3 className="font-bold text-gray-900">Technical Proficiency</h3>
                                </div>
                                <p className="text-gray-600 text-sm">Vital technical skills and tools specific to {title.toLowerCase()} roles required by modern employers.</p>
                            </div>
                            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md border border-gray-100">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                                        <Users size={20} />
                                    </div>
                                    <h3 className="font-bold text-gray-900">Communication</h3>
                                </div>
                                <p className="text-gray-600 text-sm">Ability to articulate complex {title.toLowerCase()} concepts clearly to stakeholders and team members.</p>
                            </div>
                            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md border border-gray-100">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-green-50 rounded-lg text-green-600">
                                        <Target size={20} />
                                    </div>
                                    <h3 className="font-bold text-gray-900">Problem Solving</h3>
                                </div>
                                <p className="text-gray-600 text-sm">Strategic thinking and analytical approach to overcome challenges in {title.toLowerCase()} projects.</p>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </section>
    );
}
