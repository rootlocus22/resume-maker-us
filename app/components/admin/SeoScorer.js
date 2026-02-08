import React from 'react';
import { AlertTriangle, CheckCircle, XCircle, BarChart } from 'lucide-react';

export default function SeoScorer({ data, collection }) {
    if (!data) return null;

    // Normalize Data
    const title = data.title || data.h1_title || data.seo_title || "";
    const description = data.meta_description || data.descriptionTemplate || "";
    // Handle HTML content vs Text content
    const content = data.content_body || data.solutionDescription || "";
    const keywords = data.keywords || [];

    // Helper to strip HTML for word count
    const stripHtml = (html) => {
        if (!html) return "";
        return html.replace(/<[^>]*>?/gm, "") || "";
    };

    const textContent = stripHtml(content);
    const wordCount = textContent.split(/\s+/).length;

    // --- Scoring Logic ---
    let score = 0;
    const checks = [];

    // 1. Content Length (Maximize Thick Content)
    if (wordCount > 800) {
        score += 30;
        checks.push({ label: "Thick Content (>800 words)", status: "pass", value: `${wordCount} words` });
    } else if (wordCount > 400) {
        score += 15;
        checks.push({ label: "Decent Length (>400 words)", status: "warn", value: `${wordCount} words` });
    } else {
        checks.push({ label: "Thin Content (<400 words)", status: "fail", value: `${wordCount} words` });
    }

    // 2. Title Optimization
    if (title.length >= 40 && title.length <= 60) {
        score += 20;
        checks.push({ label: "Title Length (40-60 chars)", status: "pass", value: `${title.length} chars` });
    } else {
        checks.push({ label: "Title Length Optimization", status: "warn", value: `${title.length} chars (Target: 40-60)` });
        score += 5;
    }

    // 3. Description
    if (description.length >= 140 && description.length <= 165) {
        score += 20;
        checks.push({ label: "Meta Desc Length (140-165 chars)", status: "pass", value: `${description.length} chars` });
    } else if (description.length > 0) {
        checks.push({ label: "Meta Desc Length", status: "warn", value: `${description.length} chars (Goal: 140-160)` });
        score += 5;
    } else {
        checks.push({ label: "Missing Meta Description", status: "fail", value: "Empty" });
    }

    // 4. Keyword Checks (Simplified)
    if (keywords.length > 0) {
        score += 20;
        checks.push({ label: "Keywords Defined", status: "pass", value: `${keywords.length} keywords` });
    } else {
        checks.push({ label: "No Keywords Tagged", status: "fail", value: "0" });
    }

    // 5. Structure (H1 Check - Basic heuristic if content body has h1 tag or title field exists)
    if (title || (content && content.includes('<h1'))) {
        score += 10;
        checks.push({ label: "H1 Tag Present", status: "pass" });
    }

    // Cap Score
    score = Math.min(100, score);

    // Determines Color
    const getScoreColor = (s) => {
        if (s >= 80) return "text-green-600 border-green-200 bg-green-50";
        if (s >= 50) return "text-yellow-600 border-yellow-200 bg-yellow-50";
        return "text-red-600 border-red-200 bg-red-50";
    };

    return (
        <div className="space-y-4">
            {/* Main Score Card */}
            <div className={`p-6 rounded-2xl border flex items-center justify-between ${getScoreColor(score)}`}>
                <div>
                    <h3 className="text-lg font-bold">SEO Health Score</h3>
                    <p className="text-sm opacity-80">Based on content heuristics</p>
                </div>
                <div className="text-4xl font-black">
                    {score}/100
                </div>
            </div>

            {/* Checklist */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {checks.map((check, i) => (
                    <div key={i} className="flex items-center justify-between p-4 border-b border-gray-100 last:border-0">
                        <div className="flex items-center gap-3">
                            {check.status === 'pass' && <CheckCircle className="text-green-500" size={18} />}
                            {check.status === 'warn' && <AlertTriangle className="text-yellow-500" size={18} />}
                            {check.status === 'fail' && <XCircle className="text-red-500" size={18} />}
                            <span className="text-sm font-medium text-gray-700">{check.label}</span>
                        </div>
                        {check.value && (
                            <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded text-gray-600">
                                {check.value}
                            </span>
                        )}
                    </div>
                ))}
            </div>

            {/* Keywords List Preview */}
            {keywords.length > 0 && (
                <div className="bg-white p-4 rounded-xl border border-gray-200">
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                        <BarChart size={14} /> Targeted Keywords
                    </h4>
                    <div className="flex flex-wrap gap-2">
                        {keywords.map((k, i) => (
                            <span key={i} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded border border-blue-100">
                                {k}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
