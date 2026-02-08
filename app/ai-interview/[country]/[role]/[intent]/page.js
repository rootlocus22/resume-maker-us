import React from 'react';
import { notFound } from 'next/navigation';
import { generateContent } from '../../../../lib/ai-interview/contentGen';
import InterviewSEOContent from '../../../../components/ai-interview/InterviewSEOContent';
import { COUNTRIES, ROLES, INTENTS } from '../../../../lib/ai-interview/data';

// 1. Generate Metadata Dynamically
export async function generateMetadata({ params }) {
    const { country, role, intent } = await params;
    const data = await generateContent(country, role, intent);

    if (!data) return {};

    return {
        title: data.metadata.title,
        description: data.metadata.description,
        alternates: {
            canonical: `https://expertresume.us/ai-interview/${country}/${role}/${intent}`
        },
        openGraph: {
            title: data.metadata.title,
            description: data.metadata.description,
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
