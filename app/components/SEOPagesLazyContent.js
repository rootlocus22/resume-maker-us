"use client";
import Link from 'next/link';
import { Rocket } from 'lucide-react';
import SEOWhyChoose from './seo/SEOWhyChoose';
import SEOSkills from './seo/SEOSkills';
import SEOHowTo from './seo/SEOHowTo';
import SEOProTips from './seo/SEOProTips';
import SEOFAQ from './seo/SEOFAQ';
import SEORelated from './seo/SEORelated';

export default function SEOPagesLazyContent({ pageData }) {
    const {
        title,
        features,
        faqs,
        related,
        skills,
        proTips,
    } = pageData;

    return (
        <>
            <SEOWhyChoose title={title} features={features} />

            <SEOSkills title={title} skills={skills} />

            <SEOHowTo title={title} />

            <SEOProTips title={title} proTips={proTips} />

            <SEOFAQ title={title} faqs={faqs} />

            {/* Final Call to Action - Keep inline as it is simple */}
            <section className="py-24 bg-gray-900 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-blue-900/20 to-transparent"></div>
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                    <h2 className="text-4xl sm:text-5xl font-bold mb-8 leading-tight">
                        Ready to Land Your Dream {title} Job?
                    </h2>
                    <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
                        Stop struggling with formatting. Create a perfect resume in minutes that passes ATS scans and impresses hiring managers.
                    </p>

                    <div className="flex flex-col sm:flex-row justify-center gap-6">
                        <Link
                            href="/resume-builder"
                            className="bg-blue-600 text-white px-10 py-5 rounded-xl font-bold text-lg hover:bg-blue-500 transition-all duration-300 shadow-xl hover:shadow-blue-500/25 flex items-center justify-center gap-3 transform hover:-translate-y-1"
                        >
                            <Rocket size={24} />
                            <span>Build My Resume for Free</span>
                        </Link>
                    </div>

                    <p className="mt-8 text-sm text-gray-400">
                        Join 100,000+ satisfied users • No credit card required
                    </p>
                </div>
            </section>

            <SEORelated title={title} related={related} />
        </>
    );
}
