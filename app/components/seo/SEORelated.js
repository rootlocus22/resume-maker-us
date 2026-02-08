"use client";
import Link from 'next/link';

export default function SEORelated({ title, related }) {
    if (!related || related.length === 0) return null;

    return (
        <section className="py-16 bg-gray-50 border-t border-gray-100">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-8 text-center">
                    Explore Related {title} Roles
                </h3>
                <div className="flex flex-wrap justify-center gap-4">
                    {related.map((slug, index) => (
                        <Link
                            key={index}
                            href={`/resume-builder-${slug}`}
                            className="px-5 py-2.5 bg-white rounded-full border border-gray-200 text-gray-600 hover:border-blue-500 hover:text-blue-600 hover:shadow-md transition-all text-sm font-medium"
                        >
                            {slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
