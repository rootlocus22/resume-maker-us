"use client";
import { useState, useEffect } from "react";
import { useExtension } from "../context/ExtensionContext";
import { useAuth } from "../../context/AuthContext";
import {
    Lightbulb,
    Send,
    Copy,
    Loader2,
    ArrowLeft,
    MessageSquare
} from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function StandOutPage() {
    const { currentJob } = useExtension();
    const { user } = useAuth();
    const router = useRouter();

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function generateTips() {
            if (!user) {
                setLoading(false);
                return;
            }

            let jd = currentJob;
            if (!jd) {
                try {
                    jd = JSON.parse(localStorage.getItem('extension_job_context'));
                } catch (e) { }
            }

            if (!jd) {
                setLoading(false);
                return;
            }

            try {
                // Dummy resume data implies we just want tips based on the JD mostly
                // But passing some empty resume data satisfies the API requirement
                const res = await fetch('/api/extension/analyze', {
                    method: 'POST',
                    body: JSON.stringify({
                        jd: jd,
                        resumeData: { skills: [] }, // Minimal data sufficient for tips
                        type: 'stand-out'
                    })
                });

                if (!res.ok) throw new Error("Failed to generate tips");

                const result = await res.json();
                setData(result); // { tips: [], coldEmail: {} }

            } catch (err) {
                console.error(err);
                toast.error("Failed to generate tips.");
            } finally {
                setLoading(false);
            }
        }

        generateTips();
    }, [user, currentJob]);

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        toast.success("Copied to clipboard!");
    };

    if (!user) {
        return (
            <div className="p-8 text-center bg-gray-50 min-h-screen flex flex-col items-center justify-center">
                <p className="text-gray-600 mb-4">Please log in to unlock AI career coaching.</p>
                <button onClick={() => window.open('/login', '_blank')} className="bg-blue-600 text-white px-6 py-2 rounded-full font-bold shadow-md hover:bg-blue-700 transition-colors">
                    Login
                </button>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center bg-gray-50">
                <div className="relative mb-6">
                    <div className="absolute inset-0 bg-blue-100 rounded-full animate-ping opacity-75"></div>
                    <Lightbulb className="w-12 h-12 text-blue-600 relative z-10" />
                </div>
                <h3 className="text-lg font-bold text-gray-800">Generating Strategy...</h3>
                <p className="text-sm text-gray-500 mt-2 max-w-xs">
                    Our AI is analyzing the role to find the best angle for you.
                </p>
            </div>
        );
    }

    if (!data) return <div className="p-6 text-center">Failed to load. Please try again.</div>;

    return (
        <div className="bg-gray-50 min-h-screen pb-10">
            <div className="bg-gradient-to-r from-violet-600 to-indigo-600 p-6 text-white pb-12">
                <h1 className="text-xl font-bold flex items-center gap-2">
                    <Lightbulb className="text-yellow-300" />
                    Stand Out Strategy
                </h1>
                <p className="text-indigo-100 text-sm mt-1">
                    Top 1% tactics to get noticed for this role.
                </p>
            </div>

            <div className="px-4 -mt-8 space-y-6">
                {/* tips */}
                <div className="space-y-3">
                    {data.tips.map((tip, idx) => (
                        <div key={idx} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                            <h3 className="font-bold text-gray-800 text-sm mb-1 flex items-start gap-2">
                                <span className="bg-violet-100 text-violet-700 w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5">{idx + 1}</span>
                                {tip.title}
                            </h3>
                            <p className="text-gray-600 text-xs leading-relaxed ml-7">
                                {tip.description}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Cold Email */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                    <div className="bg-gray-900 px-4 py-3 flex items-center justify-between">
                        <h3 className="text-white font-bold text-sm flex items-center gap-2">
                            <Send size={14} className="text-green-400" />
                            Cold Email Draft
                        </h3>
                        <button
                            onClick={() => copyToClipboard(`Subject: ${data.coldEmail.subject}\n\n${data.coldEmail.body}`)}
                            className="text-gray-400 hover:text-white transition-colors"
                            title="Copy Email"
                        >
                            <Copy size={16} />
                        </button>
                    </div>
                    <div className="p-4 space-y-3">
                        <div className="border-b border-gray-100 pb-2">
                            <span className="text-gray-400 text-xs uppercase tracking-wider font-semibold">Subject:</span>
                            <p className="text-gray-800 font-medium text-sm mt-1">{data.coldEmail.subject}</p>
                        </div>
                        <div>
                            <span className="text-gray-400 text-xs uppercase tracking-wider font-semibold">Body:</span>
                            <div className="text-gray-600 text-sm mt-2 whitespace-pre-wrap leading-relaxed font-mono bg-gray-50 p-3 rounded-lg">
                                {data.coldEmail.body}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
