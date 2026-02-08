import { COUNTRIES, INTENTS } from './data';
import { adminDb as db } from '../firebase-admin';

// Helper to get random item from array
const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

export async function generateContent(countryCode, roleSlug, intentSlug) {
    const country = COUNTRIES[countryCode];
    const intent = INTENTS[intentSlug];

    if (!country || !intent) return null;

    // Fetch Role Data from Firestore
    let role = null;
    try {
        const docSnap = await db.collection('interview_roles').doc(roleSlug).get();
        if (docSnap.exists) {
            role = docSnap.data();
        } else {
            console.error(`Role not found: ${roleSlug}`);
            return null;
        }
    } catch (e) {
        console.error("Firestore fetch error:", e);
        return null;
    }

    // 1. Generate Metadata
    const title = intent.titleTemplate
        .replace('{ROLE}', role.title)
        .replace('{COUNTRY}', country.name);

    // CONTEXTUAL IMAGERY MAPPING
    const getContextualImage = (cat) => {
        const map = {
            "Tech": "/images/workflow-automation.jpg",
            "Data": "/images/business-analytics.jpg",
            "Business": "/images/client-management.jpg",
            "Marketing": "/images/client-management.jpg",
            "Sales": "/images/client-management.jpg",
            "Finance": "/images/financial-management.jpg",
            "Design": "/images/resume-editor.jpg", // Fallback for design
            "default": "/images/resume-writing-ai.jpg"
        };
        return map[cat] || map["default"];
    };
    const contextImage = getContextualImage(role.category);

    // 2. Interactive Hook
    const hookTitle = title;

    // VARIATION: Spin the subtitle to reduce duplicate content footprint
    const hookSubtitles = [
        `Stop guessing what ${country.name} employers want. Practice real ${role.title} questions with AI and get instant feedback.`,
        `Don't let your next ${role.title} interview in ${country.name} be a surprise. Simulate the experience now and improve your odds.`,
        `The ${country.name} job market is tough. Gain a competitive edge for ${role.title} roles by practicing with an AI hiring manager.`
    ];
    const hookSubtitle = getRandom(hookSubtitles);

    // 3. Deep Problem Analysis (Thick Content)
    const problemTitles = [
        `Why traditional ${role.title} prep fails in ${country.name}`,
        `The mistake most ${role.title} candidates make in ${country.name}`,
        `Why reading questions isn't enough for ${country.name} interviews`
    ];
    const problemTitle = getRandom(problemTitles);

    // Construct a dense problem description using Role + Country intersection
    let problemDescription = "";

    // Country specific intro
    if (country.code === "US") {
        problemDescription += `In the hyper-competitive US market, ${role.title} candidates are expected to sell themselves aggressively. Hiring managers demand specific, metric-driven answers using the STAR method. `;
    } else if (country.code === "UK") {
        problemDescription += `The UK job market for ${role.title}s is distinct. Recruiters probe heavily for competency and evidence-backed claims, rejecting 'salesy' fluff. `;
    } else if (country.code === "CA") {
        problemDescription += `In Canada, 'Canadian Experience' is a critical filter for ${role.title} roles. This isn't just about local work history—it's code for communication style, cultural fit, and teamwork. `;
    } else if (country.code === "AU") {
        problemDescription += `Australians value authenticity above all. For a ${role.title}, sounding too scripted or using too much corporate jargon ('waffle') is a fast way to get rejected. `;
    }

    // Role specific failure mode
    if (role.common_failures && role.common_failures.length > 0) {
        problemDescription += `However, most candidates fail because they make critical mistakes like **${role.common_failures[0]}** or **${role.common_failures[1]}**. `;
    }

    problemDescription += `Reading static blog posts or generic "Top 10 Questions" lists won't prepare you for the follow-up curveballs a real interviewer throws. You need to practice answering aloud.`;

    // 4. Solution & Tech Stack Context
    const solutionTitle = `The only AI Mock Interview tailored for ${role.title} roles`;
    let solutionDescription = `InterviewGyani simulates a real ${country.name} hiring manager for ${role.title} positions. `;

    if (role.tech_stack && role.tech_stack.length > 0) {
        solutionDescription += `It understands your stack—whether you talk about **${role.tech_stack.slice(0, 3).join(', ')}**, or system design concepts. `;
    }

    solutionDescription += `The AI asks follow-up questions, detects weak answers, and teaches you to speak the language of ${country.name} recruiters.`;

    // 5. Dynamic Features (Role Aware)
    const features = [
        {
            title: "Country-Specific Scoring",
            desc: `Your answers are scored against ${country.culture_context} standards, not generic rules.`
        },
        {
            title: `Deep-Dive ${role.category} Questions`,
            desc: role.keywords && role.keywords.length > 0
                ? `Get grilled on ${role.keywords.slice(0, 3).join(', ')} and more.`
                : `Technical and behavioral questions specifically for ${role.title}s.`
        },
        {
            title: "Live Feedback Loop",
            desc: "Get instant corrections on clarity, confidence, and structure."
        }
    ];

    // --- NEW: THICK CONTENT GENERATION (Strategy Guide) ---
    const strategyGuide = {
        title: `How to Ace the ${role.title} Interview in ${country.name}`,
        content: []
    };

    // Keyword Deep Dive
    if (role.keywords && role.keywords.length > 0) {
        strategyGuide.content.push({
            heading: `Mastering '${role.keywords[0]}'`,
            text: `One of the most critical topics for a ${role.title} is **${role.keywords[0]}**. In a ${country.name} interview, don't just define it. Explain how you've applied it in production. For example, discuss trade-offs you faced or specific challenges you overcame. The AI interviewer will act as a senior peer, drilling down into your understanding.`
        });
    }

    // Behavioral Context
    strategyGuide.content.push({
        heading: `Navigating the Culture Round (${country.culture_context})`,
        text: `${country.interview_style} When answering behavioral questions like "Tell me about a conflict", structure your answer to highlight your proactive communication and problem-solving skills without blaming others.`
    });

    // Technical/Specific Advice
    if (role.tech_stack && role.tech_stack.length > 0) {
        strategyGuide.content.push({
            heading: `Tech Stack Proficiency: ${role.tech_stack[0]}`,
            text: `Expect questions not just on syntax, but on the ecosystem. How does **${role.tech_stack[0]}** scale? What are common anti-patterns? ExpertResume's AI will detect if you are just reciting documentation or if you have hands-on experience.`
        });
    }


    // 6. Rich FAQ (Q&A Injection)
    let faq = [
        {
            q: `Is this relevant for ${role.title} jobs in ${country.name}?`,
            a: `Yes. Our AI model is specifically tuned for the ${country.name} job market. It knows that ${role.title} interviews here focus on ${country.culture_context} and expect mastery of topics like ${role.keywords ? role.keywords.slice(0, 2).join(' and ') : 'core skills'}.`
        },
        {
            q: "Can I use this for free?",
            a: "Yes, you can try one simulated interview session for free to see your score. Comprehensive practice plans start at $49/month."
        },
        {
            q: `Does it help with remote ${role.title} roles?`,
            a: "Absolutely. Remote interaction requires even higher verbal clarity. Our AI specifically analyzes your communication effectiveness."
        }
    ];

    // Inject a "Real Sample Question" into FAQ if available (Thick Content)
    if (role.sample_qa && role.sample_qa.length > 0) {
        const sample = role.sample_qa[0];
        faq.splice(1, 0, { // Insert at index 1
            q: `Example Question: "${sample.q}"`,
            a: `Here is how a top 1% candidate answers this: "${sample.a}" This answer works because it is specific and structure-driven.`
        });
    }

    return {
        metadata: {
            title: `${title} | InterviewGyani`,
            description: `Practice for your ${role.title} interview in ${country.name}. Master ${role.keywords ? role.keywords.slice(0, 3).join(', ') : 'key skills'} with AI-powered mock interviews.`
        },
        content: {
            title,
            hookTitle,
            hookSubtitle,
            problemTitle,
            problemDescription,
            solutionTitle,
            solutionDescription,
            features,
            strategyGuide, // New rich content section
            faq,
            pricing: {
                amount: country.price,
                currency: country.currency,
                display: `$${country.price}`,
                period: "month"
            },
            context: {
                country: country.name,
                role: role.title,
                culture: country.culture_context,
                keywords: role.keywords,
                image: contextImage
            }
        }
    };
}

