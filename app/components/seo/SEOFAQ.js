"use client";

export default function SEOFAQ({ title, faqs }) {
    if (!faqs || faqs.length === 0) return null;

    return (
        <section className="py-20 bg-white">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                        Frequently Asked Questions
                    </h2>
                    <p className="text-gray-600">Common questions from candidates applying for {title.toLowerCase()} positions</p>
                </div>
                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <div
                            key={index}
                            className="border border-gray-200 rounded-xl p-6 hover:border-accent-400 transition-colors bg-gray-50/50"
                        >
                            <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-start">
                                <span className="bg-accent-50 text-accent rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 flex-shrink-0 mt-0.5">?</span>
                                {faq.q}
                            </h3>
                            <p className="text-gray-600 pl-9 leading-relaxed">{faq.a}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
