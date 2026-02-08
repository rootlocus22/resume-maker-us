"use client";

import { useState } from 'react';
import { Trash2, Plus, AlertCircle } from 'lucide-react';

// Character limits for one-pager
const CHAR_LIMITS = {
  name: 50,
  jobTitle: 60,
  email: 50,
  phone: 20,
  location: 80,
  linkedin: 100,
  portfolio: 100,
  summary: 400,
  skills: 300,
  experienceTitle: 60,
  experienceCompany: 60,
  experienceDescription: 200,
  educationDegree: 80,
  educationInstitution: 80,
  educationDescription: 150,
  certificationName: 80,
  certificationOrganization: 60,
  projectName: 60,
  projectDescription: 150
};

export default function OnePagerResumeForm({ data, onChange }) {
  const [activeSection, setActiveSection] = useState('personal');

  const CharCounter = ({ current, max, label }) => {
    const percentage = (current / max) * 100;
    const isWarning = percentage > 80;
    const isError = current > max;

    return (
      <div className="flex items-center justify-between text-xs mt-1">
        <span className={`${isError ? 'text-red-600' : isWarning ? 'text-orange-600' : 'text-gray-500'}`}>
          {current}/{max} characters
        </span>
        {isError && (
          <span className="flex items-center text-red-600">
            <AlertCircle size={12} className="mr-1" />
            Too long
          </span>
        )}
      </div>
    );
  };

  const handlePersonalChange = (field, value) => {
    onChange({
      ...data,
      personal: {
        ...data.personal,
        [field]: value
      }
    });
  };

  const handleSummaryChange = (value) => {
    onChange({ ...data, summary: value });
  };

  const handleSkillsChange = (value) => {
    const skills = value.split(',').map(s => s.trim()).filter(s => s);
    onChange({ ...data, skills });
  };

  const handleExperienceChange = (index, field, value) => {
    const newExperience = [...(data.experience || [])];
    newExperience[index] = { ...newExperience[index], [field]: value };
    onChange({ ...data, experience: newExperience });
  };

  const addExperience = () => {
    if ((data.experience || []).length >= 4) {
      alert('Maximum 4 experiences allowed for one-page resume');
      return;
    }
    onChange({
      ...data,
      experience: [
        ...(data.experience || []),
        {
          title: '',
          company: '',
          location: '',
          startDate: '',
          endDate: '',
          description: ''
        }
      ]
    });
  };

  const removeExperience = (index) => {
    const newExperience = [...(data.experience || [])];
    newExperience.splice(index, 1);
    onChange({ ...data, experience: newExperience });
  };

  const handleEducationChange = (index, field, value) => {
    const newEducation = [...(data.education || [])];
    newEducation[index] = { ...newEducation[index], [field]: value };
    onChange({ ...data, education: newEducation });
  };

  const addEducation = () => {
    if ((data.education || []).length >= 2) {
      alert('Maximum 2 education entries allowed for one-page resume');
      return;
    }
    onChange({
      ...data,
      education: [
        ...(data.education || []),
        {
          degree: '',
          institution: '',
          location: '',
          graduationDate: '',
          gpa: '',
          description: ''
        }
      ]
    });
  };

  const removeEducation = (index) => {
    const newEducation = [...(data.education || [])];
    newEducation.splice(index, 1);
    onChange({ ...data, education: newEducation });
  };

  const handleProjectChange = (index, field, value) => {
    const newProjects = [...(data.projects || [])];
    newProjects[index] = { ...newProjects[index], [field]: value };
    onChange({ ...data, projects: newProjects });
  };

  const addProject = () => {
    if ((data.projects || []).length >= 3) {
      alert('Maximum 3 projects allowed for one-page resume');
      return;
    }
    onChange({
      ...data,
      projects: [
        ...(data.projects || []),
        {
          name: '',
          technologies: '',
          description: '',
          link: ''
        }
      ]
    });
  };

  const removeProject = (index) => {
    const newProjects = [...(data.projects || [])];
    newProjects.splice(index, 1);
    onChange({ ...data, projects: newProjects });
  };

  const handleCertificationChange = (index, field, value) => {
    const newCertifications = [...(data.certifications || [])];
    newCertifications[index] = { ...newCertifications[index], [field]: value };
    onChange({ ...data, certifications: newCertifications });
  };

  const addCertification = () => {
    if ((data.certifications || []).length >= 3) {
      alert('Maximum 3 certifications allowed for one-page resume');
      return;
    }
    onChange({
      ...data,
      certifications: [
        ...(data.certifications || []),
        {
          name: '',
          organization: '',
          date: '',
          link: ''
        }
      ]
    });
  };

  const removeCertification = (index) => {
    const newCertifications = [...(data.certifications || [])];
    newCertifications.splice(index, 1);
    onChange({ ...data, certifications: newCertifications });
  };

  const sections = [
    { id: 'personal', label: 'Personal Info' },
    { id: 'summary', label: 'Summary' },
    { id: 'experience', label: 'Experience' },
    { id: 'education', label: 'Education' },
    { id: 'skills', label: 'Skills' },
    { id: 'projects', label: 'Projects' },
    { id: 'certifications', label: 'Certifications' }
  ];

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Section Tabs */}
      <div className="border-b bg-gray-50 px-4 py-2 overflow-x-auto">
        <div className="flex space-x-2">
          {sections.map(section => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                activeSection === section.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {section.label}
            </button>
          ))}
        </div>
      </div>

      {/* Form Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Personal Info */}
        {activeSection === 'personal' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Personal Information</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                value={data.personal?.name || ''}
                onChange={(e) => handlePersonalChange('name', e.target.value)}
                maxLength={CHAR_LIMITS.name}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="John Doe"
              />
              <CharCounter current={data.personal?.name?.length || 0} max={CHAR_LIMITS.name} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Job Title / Professional Headline *
              </label>
              <input
                type="text"
                value={data.personal?.jobTitle || ''}
                onChange={(e) => handlePersonalChange('jobTitle', e.target.value)}
                maxLength={CHAR_LIMITS.jobTitle}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Senior Software Engineer"
              />
              <CharCounter current={data.personal?.jobTitle?.length || 0} max={CHAR_LIMITS.jobTitle} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  value={data.personal?.email || ''}
                  onChange={(e) => handlePersonalChange('email', e.target.value)}
                  maxLength={CHAR_LIMITS.email}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="john@example.com"
                />
                <CharCounter current={data.personal?.email?.length || 0} max={CHAR_LIMITS.email} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone *
                </label>
                <input
                  type="tel"
                  value={data.personal?.phone || ''}
                  onChange={(e) => handlePersonalChange('phone', e.target.value)}
                  maxLength={CHAR_LIMITS.phone}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="+1234567890"
                />
                <CharCounter current={data.personal?.phone?.length || 0} max={CHAR_LIMITS.phone} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <input
                type="text"
                value={data.personal?.location || ''}
                onChange={(e) => handlePersonalChange('location', e.target.value)}
                maxLength={CHAR_LIMITS.location}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="San Francisco, CA"
              />
              <CharCounter current={data.personal?.location?.length || 0} max={CHAR_LIMITS.location} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  LinkedIn
                </label>
                <input
                  type="url"
                  value={data.personal?.linkedin || ''}
                  onChange={(e) => handlePersonalChange('linkedin', e.target.value)}
                  maxLength={CHAR_LIMITS.linkedin}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="linkedin.com/in/johndoe"
                />
                <CharCounter current={data.personal?.linkedin?.length || 0} max={CHAR_LIMITS.linkedin} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Portfolio / Website
                </label>
                <input
                  type="url"
                  value={data.personal?.portfolio || ''}
                  onChange={(e) => handlePersonalChange('portfolio', e.target.value)}
                  maxLength={CHAR_LIMITS.portfolio}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="johndoe.com"
                />
                <CharCounter current={data.personal?.portfolio?.length || 0} max={CHAR_LIMITS.portfolio} />
              </div>
            </div>
          </div>
        )}

        {/* Summary */}
        {activeSection === 'summary' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Professional Summary</h2>
            <p className="text-sm text-gray-600 mb-4">
              Write a concise summary highlighting your key achievements and skills. Keep it brief and impactful.
            </p>
            
            <div>
              <textarea
                value={data.summary || ''}
                onChange={(e) => handleSummaryChange(e.target.value)}
                maxLength={CHAR_LIMITS.summary}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Example: Results-driven Software Engineer with 5+ years of experience building scalable web applications. Proven track record of reducing costs by 30% and improving system performance by 40%."
              />
              <CharCounter current={data.summary?.length || 0} max={CHAR_LIMITS.summary} />
            </div>
          </div>
        )}

        {/* Experience */}
        {activeSection === 'experience' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Work Experience</h2>
              <button
                onClick={addExperience}
                disabled={(data.experience || []).length >= 4}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                <Plus size={16} className="mr-2" />
                Add Experience
              </button>
            </div>
            
            <p className="text-sm text-gray-600">
              Maximum 4 positions. Focus on recent and relevant roles only. ({(data.experience || []).length}/4 used)
            </p>

            {(data.experience || []).map((exp, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Position {index + 1}</span>
                  <button
                    onClick={() => removeExperience(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Job Title *
                    </label>
                    <input
                      type="text"
                      value={exp.title || ''}
                      onChange={(e) => handleExperienceChange(index, 'title', e.target.value)}
                      maxLength={CHAR_LIMITS.experienceTitle}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Senior Software Engineer"
                    />
                    <CharCounter current={exp.title?.length || 0} max={CHAR_LIMITS.experienceTitle} />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Company *
                    </label>
                    <input
                      type="text"
                      value={exp.company || ''}
                      onChange={(e) => handleExperienceChange(index, 'company', e.target.value)}
                      maxLength={CHAR_LIMITS.experienceCompany}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Tech Company Inc."
                    />
                    <CharCounter current={exp.company?.length || 0} max={CHAR_LIMITS.experienceCompany} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Location
                    </label>
                    <input
                      type="text"
                      value={exp.location || ''}
                      onChange={(e) => handleExperienceChange(index, 'location', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="New York, NY"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date *
                    </label>
                    <input
                      type="text"
                      value={exp.startDate || ''}
                      onChange={(e) => handleExperienceChange(index, 'startDate', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="01/2020"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Date
                    </label>
                    <input
                      type="text"
                      value={exp.endDate || ''}
                      onChange={(e) => handleExperienceChange(index, 'endDate', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Present"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description * (2-3 key achievements)
                  </label>
                  <textarea
                    value={exp.description || ''}
                    onChange={(e) => handleExperienceChange(index, 'description', e.target.value)}
                    maxLength={CHAR_LIMITS.experienceDescription}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="• Led team of 5 developers, increased productivity by 40%&#10;• Built scalable API serving 1M+ requests/day&#10;• Reduced infrastructure costs by $50K/year"
                  />
                  <CharCounter current={exp.description?.length || 0} max={CHAR_LIMITS.experienceDescription} />
                </div>
              </div>
            ))}

            {(data.experience || []).length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No experience added yet. Click "Add Experience" to start.
              </div>
            )}
          </div>
        )}

        {/* Education */}
        {activeSection === 'education' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Education</h2>
              <button
                onClick={addEducation}
                disabled={(data.education || []).length >= 2}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                <Plus size={16} className="mr-2" />
                Add Education
              </button>
            </div>
            
            <p className="text-sm text-gray-600">
              Maximum 2 entries. Include your highest and most relevant degrees only. ({(data.education || []).length}/2 used)
            </p>

            {(data.education || []).map((edu, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Education {index + 1}</span>
                  <button
                    onClick={() => removeEducation(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Degree *
                  </label>
                  <input
                    type="text"
                    value={edu.degree || ''}
                    onChange={(e) => handleEducationChange(index, 'degree', e.target.value)}
                    maxLength={CHAR_LIMITS.educationDegree}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Bachelor of Science in Computer Science"
                  />
                  <CharCounter current={edu.degree?.length || 0} max={CHAR_LIMITS.educationDegree} />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Institution *
                  </label>
                  <input
                    type="text"
                    value={edu.institution || ''}
                    onChange={(e) => handleEducationChange(index, 'institution', e.target.value)}
                    maxLength={CHAR_LIMITS.educationInstitution}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Stanford University"
                  />
                  <CharCounter current={edu.institution?.length || 0} max={CHAR_LIMITS.educationInstitution} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Location
                    </label>
                    <input
                      type="text"
                      value={edu.location || ''}
                      onChange={(e) => handleEducationChange(index, 'location', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Stanford, CA"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Graduation Date *
                    </label>
                    <input
                      type="text"
                      value={edu.graduationDate || ''}
                      onChange={(e) => handleEducationChange(index, 'graduationDate', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="05/2020"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      GPA (optional)
                    </label>
                    <input
                      type="text"
                      value={edu.gpa || ''}
                      onChange={(e) => handleEducationChange(index, 'gpa', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="3.8/4.0"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Additional Info (Honors, relevant coursework)
                  </label>
                  <textarea
                    value={edu.description || ''}
                    onChange={(e) => handleEducationChange(index, 'description', e.target.value)}
                    maxLength={CHAR_LIMITS.educationDescription}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Dean's List, Relevant coursework: AI, Machine Learning"
                  />
                  <CharCounter current={edu.description?.length || 0} max={CHAR_LIMITS.educationDescription} />
                </div>
              </div>
            ))}

            {(data.education || []).length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No education added yet. Click "Add Education" to start.
              </div>
            )}
          </div>
        )}

        {/* Skills */}
        {activeSection === 'skills' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Skills</h2>
            <p className="text-sm text-gray-600 mb-4">
              List your top 15-20 skills, separated by commas. Focus on relevant technical and soft skills.
            </p>
            
            <div>
              <textarea
                value={(data.skills || []).join(', ')}
                onChange={(e) => handleSkillsChange(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="JavaScript, React, Node.js, Python, AWS, Docker, Git, Agile, Team Leadership, Problem Solving"
              />
              <CharCounter current={(data.skills || []).join(', ').length} max={CHAR_LIMITS.skills} />
              <p className="text-xs text-gray-500 mt-2">
                {(data.skills || []).length} skills added
              </p>
            </div>
          </div>
        )}

        {/* Projects */}
        {activeSection === 'projects' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Projects</h2>
              <button
                onClick={addProject}
                disabled={(data.projects || []).length >= 3}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                <Plus size={16} className="mr-2" />
                Add Project
              </button>
            </div>
            
            <p className="text-sm text-gray-600">
              Maximum 3 projects. Highlight your most impressive and relevant work. ({(data.projects || []).length}/3 used)
            </p>

            {(data.projects || []).map((project, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Project {index + 1}</span>
                  <button
                    onClick={() => removeProject(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Project Name *
                    </label>
                    <input
                      type="text"
                      value={project.name || ''}
                      onChange={(e) => handleProjectChange(index, 'name', e.target.value)}
                      maxLength={CHAR_LIMITS.projectName}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="E-commerce Platform"
                    />
                    <CharCounter current={project.name?.length || 0} max={CHAR_LIMITS.projectName} />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Technologies Used
                    </label>
                    <input
                      type="text"
                      value={project.technologies || ''}
                      onChange={(e) => handleProjectChange(index, 'technologies', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="React, Node.js, MongoDB"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <textarea
                    value={project.description || ''}
                    onChange={(e) => handleProjectChange(index, 'description', e.target.value)}
                    maxLength={CHAR_LIMITS.projectDescription}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Built full-stack e-commerce platform handling 10K+ daily users. Implemented payment gateway, inventory management, and real-time analytics."
                  />
                  <CharCounter current={project.description?.length || 0} max={CHAR_LIMITS.projectDescription} />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Project Link (optional)
                  </label>
                  <input
                    type="url"
                    value={project.link || ''}
                    onChange={(e) => handleProjectChange(index, 'link', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://github.com/username/project"
                  />
                </div>
              </div>
            ))}

            {(data.projects || []).length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No projects added yet. Click "Add Project" to start.
              </div>
            )}
          </div>
        )}

        {/* Certifications */}
        {activeSection === 'certifications' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Certifications</h2>
              <button
                onClick={addCertification}
                disabled={(data.certifications || []).length >= 3}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                <Plus size={16} className="mr-2" />
                Add Certification
              </button>
            </div>
            
            <p className="text-sm text-gray-600">
              Maximum 3 certifications. Include only industry-recognized and relevant certifications. ({(data.certifications || []).length}/3 used)
            </p>

            {(data.certifications || []).map((cert, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Certification {index + 1}</span>
                  <button
                    onClick={() => removeCertification(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Certification Name *
                    </label>
                    <input
                      type="text"
                      value={cert.name || ''}
                      onChange={(e) => handleCertificationChange(index, 'name', e.target.value)}
                      maxLength={CHAR_LIMITS.certificationName}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="AWS Certified Solutions Architect"
                    />
                    <CharCounter current={cert.name?.length || 0} max={CHAR_LIMITS.certificationName} />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Issuing Organization *
                    </label>
                    <input
                      type="text"
                      value={cert.organization || ''}
                      onChange={(e) => handleCertificationChange(index, 'organization', e.target.value)}
                      maxLength={CHAR_LIMITS.certificationOrganization}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Amazon Web Services"
                    />
                    <CharCounter current={cert.organization?.length || 0} max={CHAR_LIMITS.certificationOrganization} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Issue Date *
                    </label>
                    <input
                      type="text"
                      value={cert.date || ''}
                      onChange={(e) => handleCertificationChange(index, 'date', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="06/2023"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Credential Link (optional)
                    </label>
                    <input
                      type="url"
                      value={cert.link || ''}
                      onChange={(e) => handleCertificationChange(index, 'link', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://credentials.com/verify/123"
                    />
                  </div>
                </div>
              </div>
            ))}

            {(data.certifications || []).length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No certifications added yet. Click "Add Certification" to start.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
