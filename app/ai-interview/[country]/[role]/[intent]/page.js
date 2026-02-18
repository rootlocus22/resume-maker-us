import React from 'react';
import { notFound } from 'next/navigation';
import { generateContent } from '../../../../lib/ai-interview/contentGen';
import { getCanonicalUrl } from '../../../../lib/canonical';
import InterviewSEOContent from '../../../../components/ai-interview/InterviewSEOContent';
import { COUNTRIES, ROLES, INTENTS } from '../../../../lib/ai-interview/data';
// Note: getExpandedRoles is used in sitemap.js for full URL coverage

// Revalidate every 24 hours for ISR
export const revalidate = 86400;

// 0. Generate Static Params - Pre-render base role combos at build time
//    Expanded variants (430 roles) are discovered via sitemap and rendered on-demand via ISR
export async function generateStaticParams() {
    const countries = Object.keys(COUNTRIES);
    const intents = Object.keys(INTENTS);
    // Use base ROLES (22) for build-time generation to keep builds fast
    // The full 430 expanded roles are in the sitemap for Google to discover and trigger ISR
    const params = [];

    for (const country of countries) {
        for (const role of ROLES) {
            for (const intent of intents) {
                params.push({
                    country,
                    role: role.slug,
                    intent,
                });
            }
        }
    }

    return params;
}

// 1. Generate Metadata Dynamically
export async function generateMetadata({ params }) {
    const { country, role, intent } = await params;
    const data = await generateContent(country, role, intent);

    if (!data) return {};

    const canonical = await getCanonicalUrl(`/ai-interview/${country}/${role}/${intent}`);
    return {
        title: data.metadata.title,
        description: data.metadata.description,
        alternates: {
            canonical,
            languages: {
                'en-US': `https://www.expertresume.us/ai-interview/us/${role}/${intent}`,
                'en-GB': `https://www.expertresume.us/ai-interview/uk/${role}/${intent}`,
                'en-CA': `https://www.expertresume.us/ai-interview/ca/${role}/${intent}`,
                'en-AU': `https://www.expertresume.us/ai-interview/au/${role}/${intent}`,
                'x-default': `https://www.expertresume.us/ai-interview/us/${role}/${intent}`,
            }
        },
        openGraph: {
            title: data.metadata.title,
            description: data.metadata.description,
            url: canonical,
            type: 'website',
        }
    };
}

// ... existing code ...

// 3. The Page Component
export default async function InterviewLandingPage({ params }) {
    const { country, role, intent } = await params;
    const data = await generateContent(country, role, intent);

    if (!data) {
        notFound();
    }

    // Pass enriched content to the presentation component
    return (
        <>
            <InterviewSEOContent
                content={data.content}
                // We can pass specific overrides here if needed
                isProgrammatic={true}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "FAQPage",
                        "mainEntity": data.content.faq.map(item => ({
                            "@type": "Question",
                            "name": item.q,
                            "acceptedAnswer": {
                                "@type": "Answer",
                                "text": item.a
                            }
                        }))
                    })
                }}
            />
        </>
    );
}
