import Link from "next/link";
import { BASE_URL, BRAND_NAME } from "../lib/appConfig";
import { getCanonicalUrl } from "../lib/canonical";
import { FileText, ArrowRight, CheckCircle, Zap, Shield, Award, Users, TrendingUp, Package, Truck, HardHat } from "lucide-react";

export async function generateMetadata() {
    const canonical = await getCanonicalUrl("/manufacturing-resumes");
    return {
        title: `Manufacturing & Warehouse Resume Examples | ${BRAND_NAME} US`,
        description: "Build a high-impact manufacturing or warehouse resume. Expert examples for Forklift Operators, CDL Drivers, and Warehouse Associates with ATS-optimized templates.",
        alternates: { canonical },
    };
}

export default async function ManufacturingResumesPage() {
    const clusters = [
        {
            title: "Forklift Operator",
            description: "Safety-focused resumes for reach truck, sit-down, and stand-up operators.",
            slug: "forklift-operator",
            category: "manufacturing",
            icon: HardHat,
            skills: ["OSHA Certified", "RF Scanners", "Reach Truck"]
        },
        {
            title: "Truck Driver (CDL)",
            description: "Professional CDL Class A/B resumes with clean MVR and OTR mileage.",
            slug: "truck-driver-cdl",
            category: "transportation",
            icon: Truck,
            skills: ["CDL Class A", "Hazmat", "Clean MVR"]
        },
        {
            title: "Warehouse Associate",
            description: "Results-driven resumes for pickers, packers, and shipping clerks.",
            slug: "warehouse-worker",
            category: "manufacturing",
            icon: Package,
            skills: ["WMS Systems", "Order Picking", "Inventory"]
        },
        {
            title: "Delivery Driver",
            description: "Reliable resume examples for local and regional delivery routes.",
            slug: "delivery-driver",
            category: "transportation",
            icon: Truck,
            skills: ["On-time Delivery", "Route Optimization", "Customer Service"]
        }
    ];

    return (
        <div className="bg-white min-h-screen">
            {/* Hero Section */}
            <section className="bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900 text-white pt-20 pb-24 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-accent rounded-full blur-3xl -mr-48 -mt-48 animate-pulse"></div>
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent rounded-full blur-3xl -ml-48 -mb-48 animate-pulse" style={{ animationDelay: '2s' }}></div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                    <div className="max-w-3xl">
                        <div className="inline-flex items-center bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-2 rounded-full mb-6 text-sm font-medium animate-fade-in">
                            <Shield className="mr-2 text-accent" size={16} />
                            <span>Job-Ready in 15 Minutes — Expert Certified</span>
                        </div>
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight">
                            Manufacturing & <span className="text-accent underline decoration-accent/30 decoration-8 underline-offset-8">Warehouse</span> Resumes
                        </h1>
                        <p className="text-xl text-primary-100 mb-8 leading-relaxed">
                            Get hired at top logistics and production hubs. Our resumes are built for US standards, passing Workday, Greenhouse, and specialized logistics ATS filters.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link
                                href="/resume-builder"
                                className="inline-flex items-center justify-center gap-2 bg-accent text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-accent-600 transition-all shadow-xl hover:shadow-accent/40 transform hover:-translate-y-0.5 active:scale-95"
                            >
                                <Zap size={20} />
                                Build My Resume Now
                            </Link>
                            <div className="flex items-center gap-2 text-primary-200 text-sm italic">
                                <CheckCircle size={18} className="text-accent" />
                                14-Day Interview Promise
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Cluster Grid */}
            <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-12 text-center">
                    <h2 className="text-3xl font-bold text-primary mb-4">Choose Your Career Track</h2>
                    <p className="text-gray-600">Select a specialized template to get started with expert-written bullet points.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {clusters.map((item) => (
                        <Link
                            key={item.slug}
                            href={`/resume-examples/${item.category}/${item.slug}`}
                            className="group bg-white border border-gray-200 rounded-2xl p-6 hover:border-accent hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                        >
                            <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-accent-50 transition-colors">
                                <item.icon size={28} className="text-primary group-hover:text-accent transition-colors" />
                            </div>
                            <h3 className="text-xl font-bold text-primary mb-2 flex items-center justify-between">
                                {item.title}
                                <ArrowRight size={18} className="text-gray-300 group-hover:text-accent translate-x-[-4px] group-hover:translate-x-0 transition-all" />
                            </h3>
                            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                                {item.description}
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {item.skills.map(skill => (
                                    <span key={skill} className="text-[10px] uppercase font-bold tracking-wider bg-gray-100 text-gray-600 px-2 py-1 rounded-md group-hover:bg-accent/10 group-hover:text-accent transition-colors">
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Why Different Section */}
            <section className="bg-gray-50 py-20 px-4">
                <div className="max-w-5xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-3xl font-bold text-primary mb-6">Why Our Manufacturing Resumes Work</h2>
                            <ul className="space-y-6">
                                {[
                                    { title: "Safety Record Emphasis", desc: "Special blocks to highlight clean safety records and OSHA compliance.", icon: Shield },
                                    { title: "Equipment Mastery", desc: "Keywords for specific forklifts, pallet jacks, and heavy machinery.", icon: HardHat },
                                    { title: "WMS Knowledge", desc: "Expert placement of RF scanner and inventory management software skills.", icon: Package },
                                    { title: "ATS Optimization", desc: "Built to pass the specific filters used by Amazon, UPS, and large distributors.", icon: Zap }
                                ].map((feature, i) => (
                                    <li key={i} className="flex gap-4">
                                        <div className="flex-shrink-0 w-10 h-10 bg-white shadow-sm border border-gray-100 rounded-lg flex items-center justify-center">
                                            <feature.icon size={20} className="text-accent" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-primary">{feature.title}</h4>
                                            <p className="text-sm text-gray-600">{feature.desc}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="bg-white p-8 rounded-3xl shadow-2xl border border-gray-100">
                            <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-100">
                                <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-accent/20">
                                    98%
                                </div>
                                <div>
                                    <h4 className="font-bold text-primary">Hire Rate</h4>
                                    <p className="text-sm text-gray-500">For Manufacturing Users</p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between text-sm font-medium">
                                    <span className="text-gray-600">Interview Promise</span>
                                    <span className="text-accent">14 Days</span>
                                </div>
                                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div className="w-full h-full bg-accent animate-progress"></div>
                                </div>
                                <p className="text-xs text-gray-400 mt-4 leading-relaxed italic">
                                    "I used the Forklift Operator template and got an interview at a major warehouse in 3 days. The safety record section was exactly what they were looking for."
                                </p>
                                <p className="text-xs font-bold text-primary">— Mike R., Warehouse Supervisor</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Trust Signal / Bottom CTA */}
            <section className="py-24 bg-primary text-white text-center px-4 relative overflow-hidden">
                <div className="max-w-4xl mx-auto relative z-10">
                    <Award className="mx-auto mb-6 text-accent" size={48} />
                    <h2 className="text-3xl sm:text-4xl font-bold mb-6">Join 10,000+ Blue-Collar Professionals</h2>
                    <p className="text-xl text-primary-200 mb-10">
                        Don't let a generic resume hold you back. Build an expert manufacturing resume today and get the pay you deserve.
                    </p>
                    <Link
                        href="/resume-builder"
                        className="inline-flex items-center justify-center gap-2 bg-accent text-white px-10 py-5 rounded-2xl font-bold text-xl hover:bg-accent-600 transition-all shadow-2xl hover:shadow-accent/40 transform hover:-translate-y-1 active:scale-95"
                    >
                        Start Free Resume Now
                    </Link>
                    <p className="mt-6 text-sm text-primary-400">
                        Full access to manufacturing-specific bullet points. No credit card required.
                    </p>
                </div>
            </section>
        </div>
    );
}
