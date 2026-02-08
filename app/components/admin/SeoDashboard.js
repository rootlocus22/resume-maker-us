'use client';

import React, { useState, useEffect } from 'react';
import { RefreshCw, Edit, ExternalLink, Save, X, Eye, Code, BarChart2, ArrowRight } from 'lucide-react';
import SeoScorer from './SeoScorer';

const COLLECTIONS = [
    { id: 'interview_roles', label: 'Interview Gyani Roles', icon: '🎤' },
    { id: 'job_seo_pages', label: 'Job Search SEO', icon: '💼' },
    { id: 'global_roles', label: 'Global Resume Roles', icon: '🌍' }
];

// --- Mock Generators ---
const generateMockInterviewContent = (role) => {
    if (!role || !role.title) return null;
    const country = "United States"; // Default context
    return {
        hookTitle: `Top 50 ${role.title} Interview Questions in ${country}`,
        hookSubtitle: `Stop guessing what ${country} employers want. Practice real ${role.title} questions with AI and get instant feedback.`,
        problemTitle: `Why traditional ${role.title} prep fails in ${country}`,
        problemDescription: `In the hyper-competitive ${country} market, ${role.title} candidates are expected to sell themselves aggressively. Hiring managers demand specific, metric-driven answers using the STAR method. Generic answers will get you rejected.`,
        solutionTitle: `The first AI designed for ${role.title} Interviews`,
        solutionDescription: `ExpertResume's Interview Copilot doesn't just give you a list of questions. It simulates a real ${country} interview panel, listens to your voice answers, and grades your confidence, content, and structure in real-time.`,
        features: [
            { title: "STAR Method Coaching", desc: "Learn to structure answers perfectly." },
            { title: "Voice Analysis", desc: "Get feedback on tone and pace." },
            { title: "Role Specifics", desc: `Deep database of ${role.title} technical qs.` }
        ]
    };
};

const PreviewInterviewRole = ({ data }) => {
    const content = generateMockInterviewContent(data);
    if (!content) return <div className="text-red-500">Invalid Role Data</div>;

    return (
        <div className="bg-slate-50 border rounded-xl overflow-hidden shadow-sm">
            {/* Mock Hero */}
            <div className="bg-white p-8 text-center border-b border-gray-100">
                <div className="inline-flex items-center gap-2 bg-red-50 text-red-600 px-4 py-1 rounded-full mb-6 border border-red-100 text-xs font-bold uppercase tracking-widest">
                    Don't Fail Your Next Interview
                </div>
                <h1 className="text-3xl font-extrabold text-slate-900 mb-4 leading-tight">
                    {content.hookTitle}
                </h1>
                <p className="text-lg text-slate-600 mb-8 font-light">
                    {content.hookSubtitle}
                </p>
                <div className="flex justify-center gap-4">
                    <button className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                        Start Mock Interview
                    </button>
                    <button className="bg-white text-slate-700 border px-6 py-2 rounded-lg font-medium hover:bg-gray-50">
                        View Questions
                    </button>
                </div>
            </div>

            {/* Mock Content */}
            <div className="p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{content.problemTitle}</h3>
                <p className="text-gray-600 mb-8 leading-relaxed">
                    {content.problemDescription}
                </p>

                <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                    <h3 className="text-xl font-bold text-blue-900 mb-2">{content.solutionTitle}</h3>
                    <p className="text-blue-800 mb-4">{content.solutionDescription}</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {content.features.map((f, i) => (
                            <div key={i} className="bg-white p-4 rounded-lg border border-blue-100 shadow-sm">
                                <div className="font-bold text-gray-900 text-sm mb-1">{f.title}</div>
                                <div className="text-xs text-gray-500">{f.desc}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="p-4 bg-gray-100 text-center text-xs text-gray-500 border-t">
                * Preview Mode: Simulates US/Interview-Prep Context
            </div>
        </div>
    );
};

export default function SeoDashboard() {
    const [activeCollection, setActiveCollection] = useState('interview_roles');
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(false);

    // Pagination State
    const [lastDocId, setLastDocId] = useState(null);
    const [hasMore, setHasMore] = useState(false);

    // Editor State
    const [selectedDoc, setSelectedDoc] = useState(null);
    const [editData, setEditData] = useState('');
    const [activeTab, setActiveTab] = useState('editor'); // editor | preview | analysis

    // Fetch Data
    const fetchDocuments = async (reset = false) => {
        setLoading(true);
        try {
            let url = `/api/admin/pseo?collection=${activeCollection}&limit=50`;
            if (!reset && lastDocId) {
                url += `&lastDocId=${lastDocId}`;
            }

            const res = await fetch(url);
            const data = await res.json();

            if (data.success) {
                if (reset) {
                    setDocuments(data.documents);
                } else {
                    setDocuments(prev => [...prev, ...data.documents]);
                }
                setHasMore(data.hasMore);
                setLastDocId(data.lastDocId);
            } else {
                alert('Failed to fetch data: ' + data.error);
            }
        } catch (e) {
            console.error(e);
            alert('Network error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Reset pagination on collection change
        setLastDocId(null);
        fetchDocuments(true);
    }, [activeCollection]);

    // Handle Edit Click
    const handleEdit = (doc) => {
        setSelectedDoc(doc);
        // Pretty print JSON
        setEditData(JSON.stringify(doc, null, 2));
    };

    // Handle Save
    const handleSave = async () => {
        try {
            const parsedData = JSON.parse(editData);
            // Remove generated fields if present to avoid overwriting (optional, but good practice)
            delete parsedData._id;

            const res = await fetch('/api/admin/pseo', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    collection: activeCollection,
                    docId: selectedDoc.id,
                    data: parsedData
                })
            });

            const result = await res.json();
            if (result.success) {
                alert('Saved successfully!');
                setSelectedDoc(null);
                // Don't full refresh to keep position, just update local?
                // For now simple refresh of list might be safest but loses pagination
                // Maybe update local documents state
                const newDocs = documents.map(d => d.id === selectedDoc.id ? { ...d, ...result.data } : d);
                // setDocuments(newDocs); // Optimistic update if API returned data, but it didn't return full doc
                fetchDocuments(true); // reset for safety
            } else {
                alert('Save failed: ' + result.error);
            }
        } catch (e) {
            alert('Invalid JSON: ' + e.message);
        }
    };

    return (
        <div className="flex h-screen overflow-hidden">
            {/* Sidebar */}
            <div className="w-64 bg-white border-r border-gray-200 flex-shrink-0 flex flex-col">
                <div className="p-6 border-b border-gray-100">
                    <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                        pSEO Command
                    </h1>
                    <p className="text-xs text-gray-500 mt-1">Unified Content Admin</p>
                </div>
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {COLLECTIONS.map(col => (
                        <button
                            key={col.id}
                            onClick={() => setActiveCollection(col.id)}
                            className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${activeCollection === col.id
                                    ? 'bg-blue-50 text-blue-700'
                                    : 'text-gray-700 hover:bg-gray-100'
                                }`}
                        >
                            <span>{col.icon}</span>
                            {col.label}
                        </button>
                    ))}
                </nav>
                <div className="p-4 border-t border-gray-100">
                    <div className="text-xs text-gray-400">v1.0.0 • ExpertResume</div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 bg-gray-50">
                {/* Header */}
                <div className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">
                            {COLLECTIONS.find(c => c.id === activeCollection)?.label}
                        </h2>
                        <span className="text-sm text-gray-500">{documents.length} Documents Loaded</span>
                    </div>
                    <button
                        onClick={() => fetchDocuments(true)}
                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                        title="Refresh Data"
                    >
                        <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
                    </button>
                </div>

                {/* Data Table */}
                <div className="flex-1 overflow-auto p-8">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Document ID (Slug)</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title / Preview</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Updated</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {loading ? (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                                            Loading objects...
                                        </td>
                                    </tr>
                                ) : documents.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                                            No documents found in this collection.
                                        </td>
                                    </tr>
                                ) : (
                                    documents.map((doc) => (
                                        <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 font-mono">
                                                {doc.id}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600 max-w-md truncate">
                                                {doc._previewTitle || "Untitled Document"}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {doc._updatedAt ? new Date(doc._updatedAt).toLocaleDateString() : '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button
                                                    onClick={() => handleEdit(doc)}
                                                    className="text-blue-600 hover:text-blue-900 mx-2 flex items-center gap-1 inline-flex"
                                                >
                                                    <Edit size={16} /> Edit
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Load More */}
                    {hasMore && (
                        <div className="mt-6 flex justify-center">
                            <button
                                onClick={() => fetchDocuments(false)}
                                disabled={loading}
                                className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-300 shadow-sm rounded-lg text-gray-700 font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                            >
                                {loading ? 'Loading...' : 'Load More Results'}
                                {!loading && <ArrowRight size={16} />}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Edit Drawer (Slide-over) */}
            {selectedDoc && (
                <div className="absolute inset-0 z-50 flex justify-end bg-black bg-opacity-25" onClick={(e) => {
                    if (e.target === e.currentTarget) setSelectedDoc(null);
                }}>
                    <div className="w-full max-w-2xl bg-white shadow-2xl h-full flex flex-col transform transition-transform">
                        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between bg-gray-50">
                            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                <Code size={20} /> Edit Document
                            </h3>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleSave}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                                >
                                    <Save size={16} /> Save Changes
                                </button>
                                <button
                                    onClick={() => setSelectedDoc(null)}
                                    className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-200"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="flex border-b border-gray-200 bg-gray-50">
                            {[
                                { id: 'editor', label: 'Code Editor', icon: <Code size={16} /> },
                                { id: 'preview', label: 'Live Preview', icon: <Eye size={16} /> },
                                { id: 'analysis', label: 'SEO Analysis', icon: <BarChart2 size={16} /> }
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 border-b-2 ${activeTab === tab.id
                                            ? 'border-blue-600 text-blue-600 bg-white'
                                            : 'border-transparent text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    {tab.icon} {tab.label}
                                </button>
                            ))}
                        </div>

                        <div className="flex-1 overflow-y-auto bg-gray-50">
                            {activeTab === 'editor' && (
                                <textarea
                                    className="w-full h-full p-6 font-mono text-sm text-gray-800 bg-white resize-none focus:outline-none"
                                    value={editData}
                                    onChange={(e) => setEditData(e.target.value)}
                                    spellCheck={false}
                                />
                            )}

                            {activeTab === 'preview' && (
                                <div className="p-6">
                                    {/* 1. Job Pages (HTML) */}
                                    {activeCollection === 'job_seo_pages' && editData.includes('content_body') && (
                                        <div className="bg-white p-4 shadow-sm rounded border">
                                            <div
                                                className="prose max-w-none"
                                                dangerouslySetInnerHTML={{
                                                    // Extract content_body from JSON for preview
                                                    __html: JSON.parse(editData).content_body || 'No Content'
                                                }}
                                            />
                                        </div>
                                    )}

                                    {/* 2. Interview Roles (Mock Render) */}
                                    {activeCollection === 'interview_roles' && (
                                        <PreviewInterviewRole
                                            data={(() => { try { return JSON.parse(editData) } catch (e) { return {} } })()}
                                        />
                                    )}

                                    {/* 3. Fallback */}
                                    {activeCollection !== 'job_seo_pages' && activeCollection !== 'interview_roles' && (
                                        <div className="bg-white p-8 border rounded shadow-sm text-center">
                                            <p className="text-gray-500">
                                                Full visual preview for <strong>{activeCollection}</strong> requires custom component rendering.
                                                <br />Use the Analysis tab for content checks.
                                            </p>
                                            {/* Placeholder text preview */}
                                            <div className="mt-4 p-4 bg-gray-100 rounded text-left font-mono text-xs overflow-auto max-h-64 opacity-75">
                                                {(() => {
                                                    try {
                                                        const d = JSON.parse(editData);
                                                        return d.descriptionTemplate || d.meta_description || d.content_body?.substring(0, 200) + '...';
                                                    } catch (e) { return 'Invalid JSON' }
                                                })()}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'analysis' && (
                                <div className="p-6">
                                    <SeoScorer
                                        data={(() => { try { return JSON.parse(editData) } catch (e) { return null } })()}
                                        collection={activeCollection}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
