
import InterviewSEOContent from '../../components/ai-interview/InterviewSEOContent';

export const metadata = {
    title: "Instant Interview Feedback Tool (AI Scored) – ExpertResume",
    description: "Get immediate, brutal, and constructive feedback on your interview answers. Our AI scores your clarity, confidence, and keyword usage instantly. Free to try.",
    keywords: ["interview feedback tool", "rate my interview answer", "interview scoring ai", "interview answer analyzer", "free interview coaching"],
    openGraph: {
        title: "AI Interview Feedback & Scoring",
        description: "Don't just practice. Get scored. Find out exactly why recruiters might be rejecting your answers.",
    }
};

export default function InterviewFeedbackPage() {
    const content = {
        title: "AI Interview Scoring & Feedback",
        hookTitle: "You Think Your Answer Was Good. But Was it 'Hireable'?",
        hookSubtitle: "There is a difference between a correct answer and a winning answer. Our AI analyzes your response pattern, keywords, and tone to tell you the difference.",
        problemTitle: "The Feedback Void",
        problemDescription: "When you get rejected, recruiters sends a generic 'we moved forward with another candidate' email. You never learn WHAT went wrong. Was it your tone? Your lack of examples? You stay in the dark.",
        solutionTitle: "Instant, Actionable Intelligence",
        solutionDescription: "With AI Interview Pro, feedback is instant. After every answer, the AI breaks it down: 'Good use of metrics, but you sounded passive.' It gives you a score and a concrete way to improve immediately.",
        faq: [
            {
                q: "How does the scoring work?",
                a: "We analyze multiple dimensions: Relevance (did you answer the question?), Structure (did you ramble?), and Impact (did you use data/examples?)."
            },
            {
                q: "Does it detect 'filler words'?",
                a: "Yes. The transcript analysis highlights if you are hesitating too much or using weak language that undermines your confidence."
            },
            {
                q: "Can I save my report?",
                a: "Yes! After your session, you get a full 'Readiness Report' PDF that summarizes your strengths and weaknesses to work on."
            }
        ]
    };

    return <InterviewSEOContent content={content} />;
}
