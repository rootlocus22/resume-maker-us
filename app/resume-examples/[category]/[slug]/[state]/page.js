import Link from "next/link";
import { notFound } from "next/navigation";
import { getExampleBySlug, getCategoryBySlug } from "../../../../lib/resumeExamples";
import { BRAND_NAME } from "../../../../lib/appConfig";
import { getCanonicalUrl } from "../../../../lib/canonical";
import { FileText, ArrowLeft, CheckCircle, Zap, MapPin, Briefcase, Award } from "lucide-react";
import statesData from "../../../../data/us_states.json";

export async function generateStaticParams() {
    const blueCollarSlugs = ["forklift-operator", "truck-driver-cdl", "warehouse-worker", "delivery-driver"];
    // For build speed, we only pre-render the blue-collar cluster across all states
    // Others will be rendered on-demand via ISR
    const params = [];
    for (const slug of blueCollarSlugs) {
        const example = getExampleBySlug(slug);
        if (!example) continue;
        for (const state of statesData) {
            params.push({
                category: example.category,
                slug: slug,
                state: state.slug
            });
        }
    }
    return params;
}

export async function generateMetadata({ params }) {
    const { category, slug, state: stateSlug } = await params;
    const example = getExampleBySlug(slug);
    const state = statesData.find(s => s.slug === stateSlug);

    if (!example || !state) return { title: "Page Not Found" };

    const canonical = await getCanonicalUrl(`/resume-examples/${category}/${slug}/${stateSlug}`);

    return {
        title: `${example.title} Resume Example (${state.name}) | ${BRAND_NAME} US`,
        description: `Best ${example.title} resume example for ${state.name} with expert tips. Licensed for ${state.name} standards, OSHA/CDL requirements, and localized salary data.`,
        alternates: { canonical },
    };
}

export default async function StateTargetedExamplePage({ params }) {
    const { category, slug, state: stateSlug } = await params;
    const example = getExampleBySlug(slug);
    const categoryData = getCategoryBySlug(category);
    const state = statesData.find(s => s.slug === stateSlug);

    if (!example || !state) notFound();

    return (
        <div className="bg-slate-50 min-h-screen pb-20">
            {/* Breadcrumb */}
            <div className="bg-white border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                    <nav className="flex items-center gap-2 text-sm text-gray-500">
                        <Link href="/" className="hover:text-accent">Home</Link>
                        <span>/</span>
                        <Link href="/resume-examples" className="hover:text-accent">Resume Examples</Link>
                        <span>/</span>
                        <Link href={`/resume-examples/${category}`} className="hover:text-accent uppercase font-bold text-[10px] tracking-wider">{categoryData.name}</Link>
                        <span>/</span>
                        <span className="text-primary font-medium">{example.title} ({state.name})</span>
                    </nav>
                </div>
            </div>

            {/* Hero Section - Localized */}
            <section className="bg-white border-b border-gray-200 pt-12 pb-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent-50 text-accent-700 rounded-full text-xs font-bold mb-4">
                                <MapPin size={14} />
                                Localized for {state.name}, USA
                            </div>
                            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary mb-4">
                                {example.title} <span className="text-accent">Resume Example</span> for {state.name}
                            </h1>
                            <p className="text-lg text-gray-600 max-w-3xl">
                                Expert-written resume guide for {example.title} positions in {state.name}. Optimized for local industrial hubs and compliant with {state.name} labor standards.
                            </p>
                        </div>
                        <Link
                            href="/resume-builder"
                            className="bg-accent text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-accent-600 transition-all shadow-lg hover:shadow-xl flex items-center gap-2 whitespace-nowrap"
                        >
                            <Zap size={20} />
                            Build My Resume
                        </Link>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                            <div className="text-xs text-gray-400 mb-1">State focus</div>
                            <div className="font-bold text-primary">{state.focus}</div>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                            <div className="text-xs text-gray-400 mb-1">Market Demand</div>
                            <div className="font-bold text-accent">High in {state.name}</div>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                            <div className="text-xs text-gray-400 mb-1">Format</div>
                            <div className="font-bold text-primary">ATS-Friendly</div>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                            <div className="text-xs text-gray-400 mb-1">Interview Rate</div>
                            <div className="font-bold text-primary">90%+ Success</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Content Area */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 grid lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2 space-y-10">
                    {/* Resume Snapshot */}
                    <section className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm relative">
                        <div className="absolute top-8 right-8 text-[10px] font-bold text-gray-300 uppercase tracking-widest border border-gray-100 px-2 py-1 rounded">Sample</div>
                        <h2 className="text-2xl font-bold text-primary mb-8 border-b border-gray-100 pb-4 flex items-center gap-3">
                            <FileText className="text-accent" />
                            Resume Summary for {state.name}
                        </h2>
                        <div className="space-y-6">
                            <div className="bg-slate-50 p-6 rounded-xl border-l-4 border-accent italic text-gray-700">
                                {example.summary.text}
                            </div>
                            <div>
                                <h3 className="font-bold text-primary mb-3">Key Experience Points</h3>
                                <ul className="space-y-4">
                                    {example.bulletPoints.map((point, i) => (
                                        <li key={i} className="flex gap-3">
                                            <CheckCircle className="text-accent shrink-0 mt-1" size={18} />
                                            <span className="text-gray-600">{point}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* Localized Advice */}
                    <section className="bg-primary text-white rounded-2xl p-8 shadow-xl">
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                            <Briefcase className="text-accent" />
                            Employment Outlook in {state.name}
                        </h2>
                        <p className="text-primary-100 mb-8 leading-relaxed">
                            Positions for {example.title}s are currently prioritized in {state.name} due to the expansion of regional hubs and logistics networks. Employers in the <strong>{state.focus}</strong> sectors are looking for safety-certified professionals who can handle high-volume operations.
                        </p>
                        <div className="grid sm:grid-cols-2 gap-6">
                            <div className="bg-white/10 p-4 rounded-lg border border-white/20">
                                <h4 className="font-bold text-accent mb-2">Certification Requirement</h4>
                                <p className="text-sm">Ensure your {state.name} specific licensing or national OSHA certifications are prominent.</p>
                            </div>
                            <div className="bg-white/10 p-4 rounded-lg border border-white/20">
                                <h4 className="font-bold text-accent mb-2">Local Networking</h4>
                                <p className="text-sm">Focus on the industrial zones in major {state.name} metropolitan areas.</p>
                            </div>
                        </div>
                    </section>

                    {/* FAQS for state */}
                    <section>
                        <h2 className="text-2xl font-bold text-primary mb-8">FAQs for {example.title}s in {state.name}</h2>
                        <div className="space-y-4">
                            {example.faq.map((f, i) => (
                                <div key={i} className="bg-white p-6 rounded-xl border border-gray-200">
                                    <h4 className="font-bold text-primary mb-2 line-clamp-2">{f.q}</h4>
                                    <p className="text-sm text-gray-600 italic">{f.a}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                {/* Sidebar */}
                <div className="space-y-8">
                    <div className="bg-white rounded-2xl p-6 border border-gray-200 sticky top-24">
                        <h3 className="font-bold text-primary mb-4 flex items-center gap-2">
                            <Award className="text-accent" />
                            Ready to Apply?
                        </h3>
                        <p className="text-sm text-gray-600 mb-6">
                            Companies in {state.name} use advanced ATS systems. Our templates are tested to pass 99% of them in the manufacturing and transport industries.
                        </p>
                        <Link
                            href="/resume-builder"
                            className="w-full bg-accent text-white py-3 rounded-xl font-bold hover:bg-accent-600 transition-all flex items-center justify-center gap-2"
                        >
                            <Zap size={18} />
                            Create My {state.name} Resume
                        </Link>
                        <p className="text-[10px] text-gray-400 mt-4 text-center">
                            Join 10,000+ hired in {state.name} this year.
                        </p>
                    </div>

                    <div className="bg-accent/5 rounded-2xl p-6 border border-accent/10">
                        <h4 className="font-bold text-primary mb-3">Target Skills</h4>
                        <div className="flex flex-wrap gap-2">
                            {example.skills.slice(0, 10).map(skill => (
                                <span key={skill} className="text-[10px] font-bold bg-white text-gray-500 px-2 py-1 rounded-md border border-gray-100">
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
