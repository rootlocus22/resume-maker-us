import { notFound } from "next/navigation";
import Link from "next/link";
import {
  FileText,
  BarChart3,
  Mic,
  Mail,
  Target,
  ChevronRight,
  BookOpen,
  Lightbulb,
  ArrowRight,
} from "lucide-react";
import helpGuidesData from "../../data/help_guides_data.json";

const iconMap = { FileText, BarChart3, Mic, Mail, Target };

export async function generateStaticParams() {
  return helpGuidesData.map((guide) => ({ slug: guide.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const guide = helpGuidesData.find((g) => g.slug === slug);
  if (!guide) return { title: "Help | ExpertResume" };
  return {
    title: `${guide.title} | ExpertResume Help`,
    description: guide.description,
    alternates: { canonical: `https://expertresume.us/help/${guide.slug}` },
    openGraph: {
      title: guide.title,
      description: guide.description,
      url: `https://expertresume.us/help/${guide.slug}`,
    },
  };
}

export default async function HelpGuidePage({ params }) {
  const { slug } = await params;
  const guide = helpGuidesData.find((g) => g.slug === slug);
  if (!guide) notFound();

  const Icon = iconMap[guide.icon] || FileText;

  const faqSchema = guide.faqs?.length
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: guide.faqs.map((faq) => ({
          "@type": "Question",
          name: faq.q,
          acceptedAnswer: { "@type": "Answer", text: faq.a },
        })),
      }
    : null;

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: guide.title,
    description: guide.description,
    step: guide.steps.map((s) => ({
      "@type": "HowToStep",
      name: s.title,
      text: s.body,
      position: s.step,
    })),
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: "https://expertresume.us" },
              { "@type": "ListItem", position: 2, name: "Help", item: "https://expertresume.us/help" },
              { "@type": "ListItem", position: 3, name: guide.title, item: `https://expertresume.us/help/${guide.slug}` },
            ],
          }),
        }}
      />

      <header className="bg-white border-b border-slate-200 py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <nav className="flex items-center gap-2 text-sm text-slate-500 mb-4">
            <Link href="/" className="hover:text-slate-700">Home</Link>
            <ChevronRight className="w-4 h-4" />
            <Link href="/help" className="hover:text-slate-700">Help</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-slate-900 font-medium">{guide.title}</span>
          </nav>
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-[#0B1F3B]/5 flex items-center justify-center text-[#0B1F3B] flex-shrink-0">
              <Icon className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
                {guide.title}
              </h1>
              <p className="text-slate-600 mt-1">{guide.description}</p>
              <Link
                href={guide.productUrl}
                className="inline-flex items-center gap-1 mt-3 text-[#0B1F3B] font-medium hover:underline"
              >
                Open {guide.product}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-10">
        <ol className="space-y-8">
          {guide.steps.map((s) => (
            <li key={s.step} className="relative pl-10">
              <span className="absolute left-0 top-0 w-8 h-8 rounded-full bg-[#0B1F3B] text-white flex items-center justify-center text-sm font-bold">
                {s.step}
              </span>
              <h2 className="text-lg font-bold text-slate-900 mb-2">{s.title}</h2>
              <div className="text-slate-700 leading-relaxed space-y-2">
                {s.body.split(/\n/).map((para, i) => (
                  <p key={i}>
                    {para.split(/(\*\*[^*]+\*\*)/g).map((part, j) =>
                      part.startsWith("**") && part.endsWith("**") ? (
                        <strong key={j}>{part.slice(2, -2)}</strong>
                      ) : (
                        part
                      )
                    )}
                  </p>
                ))}
              </div>
              {s.tip && (
                <div className="mt-3 flex gap-2 p-3 rounded-lg bg-amber-50 border border-amber-100">
                  <Lightbulb className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-slate-700">
                    <span className="font-medium text-amber-800">Tip:</span> {s.tip}
                  </p>
                </div>
              )}
            </li>
          ))}
        </ol>

        {guide.faqs?.length > 0 && (
          <section className="mt-14 pt-10 border-t border-slate-200">
            <h2 className="text-xl font-bold text-slate-900 mb-4">
              Frequently asked questions
            </h2>
            <ul className="space-y-4">
              {guide.faqs.map((faq, i) => (
                <li key={i} className="bg-white rounded-lg border border-slate-200 p-4">
                  <h3 className="font-semibold text-slate-900">{faq.q}</h3>
                  <p className="text-slate-600 mt-1 text-sm">{faq.a}</p>
                </li>
              ))}
            </ul>
          </section>
        )}

        <div className="mt-12 flex flex-wrap gap-4">
          <Link
            href={guide.productUrl}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0B1F3B] text-white font-medium hover:bg-[#071429]"
          >
            Open {guide.product}
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/help"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-50"
          >
            All guides
          </Link>
        </div>
      </main>
    </div>
  );
}
