import React from 'react';
import { Lock, Plus, Trash2, X } from 'lucide-react';

export default function ResumeEditForm({ editedResumeData, updateField }) {
    if (!editedResumeData) return null;

    const normalizeSkill = (skill) => {
        if (typeof skill === 'string') return skill;
        if (skill && typeof skill === 'object') {
            return skill.name || skill.skill || skill.label || String(skill);
        }
        return String(skill || '');
    };

    const skillsArray = Array.isArray(editedResumeData.skills)
        ? editedResumeData.skills.map(normalizeSkill).filter(Boolean)
        : [];

    return (
        <div className="space-y-6">
            {/* Personal Info - Locked */}
            <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                    Personal Information
                    <span className="ml-auto text-xs text-gray-500 flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        Locked
                    </span>
                </h3>
                <div className="space-y-3">
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Full Name</label>
                        <input
                            type="text"
                            value={editedResumeData.name || ''}
                            disabled
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-gray-100 text-gray-600 cursor-not-allowed"
                            placeholder="Your name"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Job Title</label>
                        <input
                            type="text"
                            value={editedResumeData.jobTitle || ''}
                            onChange={(e) => updateField('jobTitle', e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Your job title"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            value={editedResumeData.email || ''}
                            disabled
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-gray-100 text-gray-600 cursor-not-allowed"
                            placeholder="your@email.com"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Phone</label>
                        <input
                            type="tel"
                            value={editedResumeData.phone || ''}
                            disabled
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-gray-100 text-gray-600 cursor-not-allowed"
                            placeholder="+91 XXXXX XXXXX"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Address</label>
                        <input
                            type="text"
                            value={editedResumeData.address || ''}
                            disabled
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-gray-100 text-gray-600 cursor-not-allowed"
                            placeholder="Your address"
                        />
                    </div>
                </div>
            </div>

            {/* Summary */}
            <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                    Professional Summary
                </h3>
                <textarea
                    value={editedResumeData.summary || ''}
                    onChange={(e) => updateField('summary', e.target.value)}
                    rows={4}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Write your professional summary..."
                />
            </div>

            {/* Experience */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                        <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                        Work Experience
                    </h3>
                    <button
                        onClick={() => {
                            const newExp = {
                                jobTitle: '',
                                company: '',
                                startDate: '',
                                endDate: '',
                                description: '',
                                location: ''
                            };
                            updateField('experience', [...(editedResumeData.experience || []), newExp]);
                        }}
                        className="text-blue-600 hover:text-blue-700 text-xs font-medium flex items-center gap-1"
                    >
                        <Plus className="w-3 h-3" />
                        Add
                    </button>
                </div>
                <div className="space-y-3">
                    {(editedResumeData.experience || []).map((exp, idx) => (
                        <div key={idx} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                            <div className="flex items-start justify-between mb-2">
                                <span className="text-xs font-medium text-gray-600">#{idx + 1}</span>
                                <button
                                    onClick={() => {
                                        const newExp = [...(editedResumeData.experience || [])];
                                        newExp.splice(idx, 1);
                                        updateField('experience', newExp);
                                    }}
                                    className="text-red-600 hover:text-red-700"
                                >
                                    <Trash2 className="w-3 h-3" />
                                </button>
                            </div>
                            <div className="space-y-2">
                                <input
                                    type="text"
                                    value={exp.jobTitle || ''}
                                    onChange={(e) => {
                                        const newExp = [...(editedResumeData.experience || [])];
                                        newExp[idx] = { ...exp, jobTitle: e.target.value };
                                        updateField('experience', newExp);
                                    }}
                                    className="w-full border border-gray-300 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Job Title"
                                />
                                <input
                                    type="text"
                                    value={exp.company || ''}
                                    onChange={(e) => {
                                        const newExp = [...(editedResumeData.experience || [])];
                                        newExp[idx] = { ...exp, company: e.target.value };
                                        updateField('experience', newExp);
                                    }}
                                    className="w-full border border-gray-300 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Company"
                                />
                                <div className="grid grid-cols-2 gap-2">
                                    <input
                                        type="text"
                                        value={exp.startDate || ''}
                                        onChange={(e) => {
                                            const newExp = [...(editedResumeData.experience || [])];
                                            newExp[idx] = { ...exp, startDate: e.target.value };
                                            updateField('experience', newExp);
                                        }}
                                        className="w-full border border-gray-300 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Start"
                                    />
                                    <input
                                        type="text"
                                        value={exp.endDate || ''}
                                        onChange={(e) => {
                                            const newExp = [...(editedResumeData.experience || [])];
                                            newExp[idx] = { ...exp, endDate: e.target.value };
                                            updateField('experience', newExp);
                                        }}
                                        className="w-full border border-gray-300 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="End"
                                    />
                                </div>
                                <textarea
                                    value={exp.description || ''}
                                    onChange={(e) => {
                                        const newExp = [...(editedResumeData.experience || [])];
                                        newExp[idx] = { ...exp, description: e.target.value };
                                        updateField('experience', newExp);
                                    }}
                                    rows={2}
                                    className="w-full border border-gray-300 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Description"
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Education */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                        <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                        Education
                    </h3>
                    <button
                        onClick={() => {
                            const newEdu = {
                                degree: '',
                                school: '',
                                graduationDate: '',
                                description: ''
                            };
                            updateField('education', [...(editedResumeData.education || []), newEdu]);
                        }}
                        className="text-blue-600 hover:text-blue-700 text-xs font-medium flex items-center gap-1"
                    >
                        <Plus className="w-3 h-3" />
                        Add
                    </button>
                </div>
                <div className="space-y-3">
                    {(editedResumeData.education || []).map((edu, idx) => (
                        <div key={idx} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                            <div className="flex items-start justify-between mb-2">
                                <span className="text-xs font-medium text-gray-600">#{idx + 1}</span>
                                <button
                                    onClick={() => {
                                        const newEdu = [...(editedResumeData.education || [])];
                                        newEdu.splice(idx, 1);
                                        updateField('education', newEdu);
                                    }}
                                    className="text-red-600 hover:text-red-700"
                                >
                                    <Trash2 className="w-3 h-3" />
                                </button>
                            </div>
                            <div className="space-y-2">
                                <input
                                    type="text"
                                    value={edu.degree || ''}
                                    onChange={(e) => {
                                        const newEdu = [...(editedResumeData.education || [])];
                                        newEdu[idx] = { ...edu, degree: e.target.value };
                                        updateField('education', newEdu);
                                    }}
                                    className="w-full border border-gray-300 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Degree"
                                />
                                <input
                                    type="text"
                                    value={edu.school || ''}
                                    onChange={(e) => {
                                        const newEdu = [...(editedResumeData.education || [])];
                                        newEdu[idx] = { ...edu, school: e.target.value };
                                        updateField('education', newEdu);
                                    }}
                                    className="w-full border border-gray-300 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="School/University"
                                />
                                <input
                                    type="text"
                                    value={edu.graduationDate || ''}
                                    onChange={(e) => {
                                        const newEdu = [...(editedResumeData.education || [])];
                                        newEdu[idx] = { ...edu, graduationDate: e.target.value };
                                        updateField('education', newEdu);
                                    }}
                                    className="w-full border border-gray-300 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Graduation Year"
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Skills */}
            <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                    Skills
                </h3>
                <div className="space-y-2">
                    <div className="flex flex-wrap gap-2">
                        {skillsArray.map((skill, index) => (
                            <div
                                key={index}
                                className="group flex items-center gap-1.5 bg-blue-50 border border-blue-200 rounded-md px-2 py-1.5 hover:bg-blue-100 transition-colors"
                            >
                                <input
                                    type="text"
                                    value={skill}
                                    onChange={(e) => {
                                        const newSkills = [...skillsArray];
                                        newSkills[index] = e.target.value;
                                        updateField('skills', newSkills);
                                    }}
                                    className="bg-transparent border-none outline-none text-xs text-gray-900 flex-1 min-w-[60px]"
                                    placeholder="Skill"
                                />
                                <button
                                    onClick={() => {
                                        const newSkills = skillsArray.filter((_, i) => i !== index);
                                        updateField('skills', newSkills);
                                    }}
                                    className="text-red-500 hover:text-red-700 transition-colors opacity-0 group-hover:opacity-100"
                                    title="Remove"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => {
                                const newSkills = [...skillsArray, ''];
                                updateField('skills', newSkills);
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-xs font-medium"
                        >
                            <Plus size={14} />
                            Add
                        </button>
                        <input
                            type="text"
                            placeholder="Paste skills (comma-separated)"
                            onBlur={(e) => {
                                const value = e.target.value.trim();
                                if (value) {
                                    const newSkills = value.split(',').map(s => s.trim()).filter(Boolean);
                                    const combined = [...skillsArray, ...newSkills];
                                    const unique = [...new Set(combined)];
                                    updateField('skills', unique);
                                    e.target.value = '';
                                }
                            }}
                            className="flex-1 border border-gray-300 rounded-md px-2 py-1.5 text-xs focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                </div>
            </div>

            {/* Additional Info */}
            <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                    Additional
                </h3>
                <div className="space-y-2">
                    <input
                        type="url"
                        value={editedResumeData.linkedin || ''}
                        onChange={(e) => updateField('linkedin', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="LinkedIn URL"
                    />
                    <input
                        type="url"
                        value={editedResumeData.portfolio || ''}
                        onChange={(e) => updateField('portfolio', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Portfolio/Website URL"
                    />
                </div>
            </div>
        </div>
    );
}
