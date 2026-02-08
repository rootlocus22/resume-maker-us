import Link from "next/link";
import Image from "next/image";

export const dynamicParams = true;
import { notFound } from "next/navigation";
import { templates, getTemplatesByCategory } from "../../lib/templates";
import { ArrowRight, CheckCircle, Zap, Star, Layout, Shield, Clock, Download, Share2, Eye } from "lucide-react";

// Generate static params for all templates
export async function generateStaticParams() {
    return Object.keys(templates).slice(0, 20).map((slug) => ({
        slug: slug,
    }));
}

// Generate unique metadata for each template
export async function generateMetadata({ params }) {
    const { slug } = await params;
    const template = templates[slug];

    if (!template) {
        return {
            title: "Template Not Found",
        };
    }

    return {
        title: `${template.name} Resume Template - free Download | ExpertResume`,
        description: `Create a professional resume with the ${template.name} template. Perfect for ${template.category} roles. ATS-optimized, fully customizable, and free to use.`,
        alternates: {
            canonical: `https://expertresume.us/resume-templates/${slug}`,
        },
        openGraph: {
            title: `${template.name} Resume Template`,
            description: `Create a professional resume with the ${template.name} template.`,
            images: [
                {
                    url: template.previewImage,
                    width: 800,
                    height: 600,
                    alt: `${template.name} Preview`,
                },
            ],
        },
    };
}

export default async function TemplateLandingPage({ params }) {
    const { slug } = await params;

    let template = templates[slug];

    if (!template) {
        notFound();
    }

    // Special Override for 'freshers' slug if it's meant to show 'bold'
    if (slug === 'freshers') {
        template = {
            ...template,
            name: "Fresher Excellence",
            // Keep original if it's already defined or override if necessary
        };
    }

    // Construct builder URL
    const getBuilderUrl = () => {
        if (template.category === 'One-Pager') {
            return `/one-pager-builder/editor?template=${template.templateId || slug}`;
        }
        if (template.category === 'Job-Specific') {
            return `/job-specific-resume-builder?template=${slug}`;
        }
        return `/resume-builder?template=${slug}`;
    };

    // Get related templates from the same category
    const relatedTemplates = getTemplatesByCategory(template.category)
        .filter(([id]) => id !== slug)
        .slice(0, 4);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header / Breadcrumb */}
            <div className="bg-white border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <nav className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                        <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
                        <ChevronRightIcon />
                        <Link href="/resume-templates" className="hover:text-blue-600 transition-colors">Templates</Link>
                        <ChevronRightIcon />
                        <span className="font-medium text-gray-900">{template.name}</span>
                    </nav>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

                    {/* Sticky Preview Image */}
                    <div className="lg:sticky lg:top-24">
                        <div className="bg-white rounded-[2rem] shadow-2xl border border-gray-100 p-2 relative overflow-hidden group">
                            <div className="absolute inset-0 bg-blue-600 opacity-0 group-hover:opacity-5 transition-opacity pointer-events-none"></div>
                            <div className="relative aspect-[1/1.414] w-full overflow-hidden rounded-[1.8rem]">
                                <Image
                                    src={template.previewImage}
                                    alt={`${template.name} Preview`}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                                    priority
                                />
                            </div>
                        </div>
                        <div className="flex justify-center gap-8 mt-8 text-gray-400">
                            <div className="flex flex-col items-center gap-1">
                                <Eye size={20} />
                                <span className="text-xs">4.8k views</span>
                            </div>
                            <div className="flex flex-col items-center gap-1">
                                <Download size={20} />
                                <span className="text-xs">1.2k used</span>
                            </div>
                            <div className="flex flex-col items-center gap-1">
                                <Share2 size={20} />
                                <span className="text-xs">Share</span>
                            </div>
                        </div>
                    </div>

                    {/* Content Section */}
                    <div>
                        <div className="flex items-center gap-3 mb-6">
                            <span className="px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-xs font-bold uppercase tracking-wider">
                                {template.category}
                            </span>
                            {template.premium && (
                                <span className="px-4 py-1.5 bg-amber-50 text-amber-600 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                                    <Star className="w-3 h-3 fill-current" /> Premium
                                </span>
                            )}
                        </div>

                        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
                            Build Your Career with <span className="text-blue-600">{template.name}</span>
                        </h1>

                        <p className="text-xl text-gray-600 mb-10 leading-relaxed">
                            Take the next step in your professional journey with a resume that speaks for itself. The <strong>{template.name}</strong> is more than just a template—it's your gateway to better opportunities.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 mb-12">
                            <Link
                                href={getBuilderUrl()}
                                className="inline-flex items-center justify-center gap-3 px-10 py-5 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all shadow-xl hover:shadow-blue-200 transform hover:-translate-y-1 active:scale-95"
                            >
                                <Zap className="w-5 h-5 fill-current" />
                                Build My Resume Free
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                        </div>

                        {/* Features Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
                            <FeatureItem
                                icon={<Shield className="text-green-500" />}
                                title="ATS Optimized"
                                description="Scored 95+ against standard applicant tracking systems."
                            />
                            <FeatureItem
                                icon={<Clock className="text-purple-500" />}
                                title="5-Minute Setup"
                                description="Our AI handles the heavy lifting of writing and formatting."
                            />
                            <FeatureItem
                                icon={<CheckCircle className="text-blue-500" />}
                                title="Expert Layout"
                                description="Designed by senior recruiters with 15+ years of experience."
                            />
                            <FeatureItem
                                icon={<Layout className="text-pink-500" />}
                                title="Fully Customizable"
                                description="Change colors, fonts, and sections with simple controls."
                            />
                        </div>

                        {/* SEO Text */}
                        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm mb-12">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Why users love the {template.name}</h3>
                            <p className="text-gray-600 leading-relaxed mb-4">
                                This template is specifically engineered for <strong>{template.category}</strong> professionals who need to balance visual impact with information density. Whether you're applying for leadership roles or your first internship, the structure guides the reader's eyes to your key achievements first.
                            </p>
                            <p className="text-gray-600 leading-relaxed">
                                Join over 50,000 users who have used ExpertResume to land interviews at top companies like Google, Amazon, and Microsoft.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Related Templates Section */}
                {relatedTemplates.length > 0 && (
                    <div className="mt-24">
                        <div className="flex items-center justify-between mb-10">
                            <div>
                                <h2 className="text-3xl font-bold text-gray-900">Similar Templates</h2>
                                <p className="text-gray-500">More {template.category} designs you might like</p>
                            </div>
                            <Link href="/resume-templates" className="text-blue-600 font-bold hover:underline flex items-center gap-2">
                                View All <ArrowRight size={18} />
                            </Link>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {relatedTemplates.map(([id, t]) => (
                                <Link key={id} href={`/resume-templates/${id}`} className="group">
                                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden transition-all group-hover:shadow-xl group-hover:-translate-y-1">
                                        <div className="aspect-[3/4] p-1">
                                            <div className="relative w-full h-full rounded-xl overflow-hidden bg-gray-50">
                                                <Image
                                                    src={t.previewImage}
                                                    alt={t.name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                        </div>
                                        <div className="p-4">
                                            <h4 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors truncate">{t.name}</h4>
                                            <p className="text-sm text-gray-500">{t.category}</p>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function FeatureItem({ icon, title, description }) {
    return (
        <div className="flex gap-4 p-4 rounded-2xl border border-gray-100 bg-white hover:border-blue-100 hover:shadow-md transition-all">
            <div className="mt-1">{icon}</div>
            <div>
                <h4 className="font-bold text-gray-900 mb-1">{title}</h4>
                <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
            </div>
        </div>
    );
}

function ChevronRightIcon() {
    return (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
    );
}

