// EnglishGyani Job-Specific Contextual Sidebar Widget
// Shows industry-specific communication requirements on pSEO pages

"use client";

import React from 'react';
import Link from 'next/link';
import { Globe, TrendingUp, ArrowRight, Users } from 'lucide-react';

const jobCommunicationData = {
    // Tech roles - client communication focus
    'java-developer': {
        stat: '80% of Java roles in India require talking to US/UK clients',
        skill: 'Client Communication',
        example: 'Can you explain your "Spring Boot" logic in professional English?',
    },
    'python-developer': {
        stat: '75% of Python roles involve cross-timezone collaboration',
        skill: 'Cross-Cultural Communication',
        example: 'Can you present your ML pipeline to international stakeholders?',
    },
    'software-engineer': {
        stat: '70% of software engineers work with remote teams',
        skill: 'Remote Communication',
        example: 'Can you lead a standup with clarity and confidence?',
    },
    'data-analyst': {
        stat: '85% of data roles require presenting insights to non-technical teams',
        skill: 'Data Storytelling',
        example: 'Can you explain complex analytics in simple English?',
    },
    'full-stack-developer': {
        stat: '68% of full-stack roles require client-facing demos',
        skill: 'Technical Presentation',
        example: 'Can you demo your application to international clients?',
    },
    // Default for other roles
    'default': {
        stat: '65% of professionals need English for career growth',
        skill: 'Professional Communication',
        example: 'Can you speak confidently in interviews and meetings?',
    }
};

export default function EnglishGyaniJobContextWidget({ jobSlug = 'default', jobTitle = 'Professional' }) {
    const data = jobCommunicationData[jobSlug] || jobCommunicationData['default'];

    return (
        <div className="sticky top-4 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl shadow-sm">
            <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-bold text-gray-900">
                    Top Skill for {jobTitle}s
                </h3>
            </div>

            <div className="mb-4">
                <div className="flex items-start gap-2 mb-3">
                    <Globe className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
                    <p className="text-lg font-semibold text-gray-900">
                        {data.skill}
                    </p>
                </div>

                <div className="bg-white p-4 rounded-lg border border-blue-200 mb-4">
                    <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-4 h-4 text-blue-600" />
                        <p className="text-sm font-semibold text-gray-900">Market Reality</p>
                    </div>
                    <p className="text-sm text-gray-700">
                        {data.stat}
                    </p>
                </div>

                <p className="text-sm text-gray-600 italic mb-4">
                    "{data.example}"
                </p>
            </div>

            <Link
                href={`https://www.englishgyani.com/?source=expertresume&medium=career_skills&campaign=client_communication&role=${jobSlug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center px-5 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all duration-300 shadow-md hover:shadow-lg"
            >
                <span className="flex items-center justify-center gap-2">
                    Try a Mock Client Call
                    <ArrowRight className="w-4 h-4" />
                </span>
            </Link>

            <p className="text-xs text-gray-500 text-center mt-3">
                100% Free • No Credit Card Required
            </p>
        </div>
    );
}
