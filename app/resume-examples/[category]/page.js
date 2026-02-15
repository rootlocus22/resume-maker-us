import Link from "next/link";
import { notFound } from "next/navigation";
import { getCategoryBySlug, getExamplesByCategory, resumeCategories } from "../../lib/resumeExamples";
import { BASE_URL, BRAND_NAME } from "../../lib/appConfig";
import { getCanonicalUrl } from "../../lib/canonical";
import { FileText, ArrowRight, ArrowLeft, CheckCircle, Zap } from "lucide-react";

export async function generateStaticParams() {
  return Object.keys(resumeCategories).map((category) => ({
    category,
  }));
}

export async function generateMetadata({ params }) {
  const { category } = await params;
  const categoryData = getCategoryBySlug(category);
  if (!categoryData) return { title: "Category Not Found" };

  const examples = getExamplesByCategory(category);
  const canonical = await getCanonicalUrl(`/resume-examples/${category}`);
  return {
    title: `${categoryData.name} Resume Examples (${examples.length}+ Free Samples) | ${BRAND_NAME}`,
    description: `${categoryData.description} Browse ${examples.length}+ free ${categoryData.name.toLowerCase()} resume examples with expert writing tips and ATS-optimized templates.`,
    alternates: { canonical },
    openGraph: {
      title: `${categoryData.name} Resume Examples | ${BRAND_NAME}`,
      description: `${examples.length}+ free ${categoryData.name.toLowerCase()} resume examples with expert writing guides.`,
      url: canonical,
    },
  };
}

export default async function CategoryPage({ params }) {
  const { category } = await params;
  const categoryData = getCategoryBySlug(category);
  if (!categoryData) notFound();

  const examples = getExamplesByCategory(category);

  return (
    <>
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-accent">Home</Link>
            <span>/</span>
            <Link href="/resume-examples" className="hover:text-accent">Resume Examples</Link>
            <span>/</span>
            <span className="text-primary font-medium">{categoryData.name}</span>
          </nav>
        </div>
      </div>

      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-50 via-white to-accent-50 pt-12 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/resume-examples" className="inline-flex items-center gap-1 text-sm text-accent hover:underline mb-4">
            <ArrowLeft size={14} /> All Resume Examples
          </Link>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary mb-4">
            {categoryData.name} <span className="text-accent">Resume Examples</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mb-6">
            {categoryData.description} Browse {examples.length}+ free examples with expert writing guides, 
            key skills, and ATS-optimized templates.
          </p>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1"><CheckCircle size={16} className="text-accent" /> ATS-Optimized</span>
            <span className="flex items-center gap-1"><FileText size={16} className="text-primary-400" /> {examples.length} Examples</span>
          </div>
        </div>
      </section>

      {/* Examples Grid */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {examples.map((example) => (
              <Link
                key={example.slug}
                href={`/resume-examples/${category}/${example.slug}`}
                className="group bg-white border border-gray-200 rounded-xl p-6 hover:border-accent-300 hover:shadow-xl transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-accent-50 rounded-xl flex items-center justify-center">
                    <FileText size={24} className="text-accent" />
                  </div>
                  <ArrowRight size={18} className="text-gray-300 group-hover:text-accent transition-colors mt-2" />
                </div>
                <h2 className="text-lg font-semibold text-primary group-hover:text-accent transition-colors mb-2">
                  {example.title} Resume Example
                </h2>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {example.summary.text.substring(0, 120)}...
                </p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {example.skills.slice(0, 4).map((skill) => (
                    <span key={skill} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md">
                      {skill}
                    </span>
                  ))}
                  {example.skills.length > 4 && (
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-md">
                      +{example.skills.length - 4} more
                    </span>
                  )}
                </div>
                {example.salaryRange && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-accent-600 font-medium">
                      ${(example.salaryRange.min / 1000).toFixed(0)}K - ${(example.salaryRange.max / 1000).toFixed(0)}K
                    </span>
                    <span className="text-accent font-medium group-hover:underline">
                      View Example →
                    </span>
                  </div>
                )}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 bg-gradient-to-r from-primary to-primary-400">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-white mb-3">
            Ready to Build Your {categoryData.name} Resume?
          </h2>
          <p className="text-primary-100 mb-6">
            Use our AI resume builder to create an ATS-optimized resume tailored to your target role.
          </p>
          <Link
            href="/resume-builder"
            className="inline-flex items-center gap-2 bg-accent text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-accent-600 transition-all shadow-lg"
          >
            <Zap size={20} />
            Build Your Resume Free
          </Link>
        </div>
      </section>
    </>
  );
}
