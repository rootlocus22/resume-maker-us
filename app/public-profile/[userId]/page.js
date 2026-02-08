'use client';
// add public page
import React, { useEffect, useState, use } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { User, Briefcase, BookOpen, Star, Award, Folder, Globe, Heart, FileText, MapPin, Link as LinkIcon, Mail, Phone, Download } from 'lucide-react';

const isItemEffectivelyEmpty = (item, significantFields) => {
  if (!item || typeof item !== 'object') return true;
  if (!Array.isArray(significantFields)) return false;
  return significantFields.every(field => {
    const value = item[field];
    if (Array.isArray(value)) return value.length === 0;
    return !value;
  });
};

const ArraySection = ({ title, items, icon, renderItem, itemSignificantFields, className = '' }) => {
  const validItems = items ? items.filter(item => !isItemEffectivelyEmpty(item, itemSignificantFields)) : [];
  if (validItems.length === 0) return null;

  return (
    <div className={`mt-8 ${className}`}>
      <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
        {icon && React.cloneElement(icon, { className: 'mr-3 text-blue-600', size: 20 })}
        {title}
      </h3>
      <div className="space-y-6">
        {validItems.map((item, index) => (
          <div key={index} className="pl-8 relative before:absolute before:left-4 before:top-0 before:h-full before:w-px before:bg-gray-200 before:content-[''] first:before:h-[calc(100%-24px)] first:before:top-6 last:before:h-6">
            <div className="relative before:absolute before:-left-8 before:top-2 before:h-3 before:w-3 before:rounded-full before:border-4 before:border-blue-500 before:content-['']">
              {renderItem(item)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const SkillPill = ({ skill, level }) => {
  const getLevelColor = () => {
    switch(level) {
      case 'Expert': return 'bg-blue-600';
      case 'Advanced': return 'bg-blue-500';
      case 'Intermediate': return 'bg-blue-400';
      case 'Beginner': return 'bg-blue-300';
      default: return 'bg-gray-300';
    }
  };

  return (
    <div className="flex flex-col">
      <span className="text-sm font-medium text-gray-700 mb-1">{skill}</span>
      {level && (
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className={`${getLevelColor()} h-2 rounded-full`} style={{
            width: level === 'Expert' ? '100%' : 
                  level === 'Advanced' ? '75%' : 
                  level === 'Intermediate' ? '50%' : '25%'
          }}></div>
        </div>
      )}
    </div>
  );
};

const ensureAbsoluteUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('mailto:') || url.startsWith('tel:')) {
    return url;
  }
  return `https://${url}`;
};

export default function PublicProfilePage({ params: paramsPromise }) {
  const params = use(paramsPromise);
  const { userId } = params;
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [imgError, setImgError] = useState(false);

  // Tab data checks
  const {
    about,
    experiences,
    educations,
    skills,
    certifications,
    projects,
  } = profileData || {};

  const hasAbout = about && about.trim() !== '';
  const hasExperience = experiences && experiences.some(exp => !isItemEffectivelyEmpty(exp, ['title', 'company']));
  const hasEducation = educations && educations.some(edu => !isItemEffectivelyEmpty(edu, ['school', 'degree']));
  const hasSkills = skills && skills.length > 0;
  const hasCertifications = certifications && certifications.some(cert => !isItemEffectivelyEmpty(cert, ['name', 'issuer']));
  const hasProjects = projects && projects.some(proj => !isItemEffectivelyEmpty(proj, ['title']));

  const tabs = [
    { id: 'overview', label: 'Overview', show: hasAbout },
    { id: 'experience', label: 'Experience', show: hasExperience },
    { id: 'education', label: 'Education', show: hasEducation },
    { id: 'skills', label: 'Skills', show: hasSkills },
    { id: 'certifications', label: 'Certifications', show: hasCertifications },
    { id: 'projects', label: 'Projects', show: hasProjects },
  ].filter(tab => tab.show);

  useEffect(() => {
    if (userId) {
      const fetchProfileData = async () => {
        setLoading(true);
        setError(null);
        try {
          const profileDocRef = doc(db, `users/${userId}/profile`, 'userProfile');
          const profileDocSnap = await getDoc(profileDocRef);

          if (profileDocSnap.exists()) {
            const data = profileDocSnap.data();
            // Check if profile is public
            if (data.allowMatching || data.isPublic) {
              setProfileData(data);
            } else {
              setError('This profile is private.');
            }
          } else {
            setError('Profile not found.');
          }
        } catch (err) {
          console.error('Error fetching public profile:', err);
          setError('Failed to load profile data.');
        } finally {
          setLoading(false);
        }
      };
      fetchProfileData();
    }
  }, [userId]);

  useEffect(() => {
    if (tabs.length > 0 && !tabs.find(tab => tab.id === activeTab)) {
      setActiveTab(tabs[0].id);
    }
  }, [tabs, activeTab]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mb-4" />
          <p className="text-gray-600">Building your professional profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md text-center">
          <div className="text-red-500 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Profile Unavailable</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md text-center">
          <div className="text-gray-400 mb-4">
            <User size={48} className="mx-auto" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">No Profile Data</h2>
          <p className="text-gray-600">This profile hasn't been set up yet.</p>
        </div>
      </div>
    );
  }

  const {
    firstName,
    lastName,
    photo,
    headline,
    about: aboutMe,
    location,
    website,
    linkedin,
    github,
    email,
    phone,
    experiences: userExperiences,
    educations: userEducations,
    skills: userSkills,
    certifications: userCertifications,
    projects: userProjects,
    languages,
    volunteer,
    publications,
    phoneVerified,
  } = profileData;

  const validSkills = userSkills ? userSkills.filter(skill => skill && skill.name && skill.name.trim() !== '') : [];

  // Always show all tabs if there is at least one non-overview tab
  const filteredTabs = tabs.filter(tab => tab.id !== 'overview');
  const showTabs = filteredTabs.length > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-900 py-16 px-4 sm:px-6 lg:px-8 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:mr-8 mb-6 md:mb-0 relative">
              {photo && typeof photo === 'string' && photo.trim() !== '' && !imgError ? (
                <img
                  src={photo}
                  alt={`${firstName} ${lastName}`}
                  className="w-32 h-32 rounded-full border-4 border-white object-cover shadow-xl"
                  onError={() => setImgError(true)}
                />
              ) : (
                <div className="w-32 h-32 rounded-full border-4 border-white bg-blue-600 flex items-center justify-center shadow-xl">
                  <span className="text-white text-4xl font-bold">
                    {`${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase()}
                  </span>
                </div>
              )}
              {phoneVerified && (
                <div className="absolute bottom-2 right-2 bg-blue-500 rounded-full px-2 py-1 flex items-center text-xs text-white font-semibold shadow">
                  <svg className="w-4 h-4 mr-1 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  Verified
                </div>
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-4xl font-bold mb-2">{firstName} {lastName}</h1>
              <p className="text-xl text-blue-100 mb-4">{headline}</p>
              {location && (
                <p className="flex items-center text-blue-100">
                  <MapPin size={18} className="mr-2" /> {location}
                </p>
              )}
            </div>
            <div className="mt-6 md:mt-0">
              <a
                href="/signup"
                className="flex items-center bg-yellow-400 text-blue-900 px-6 py-3 rounded-lg font-bold hover:bg-yellow-300 transition-colors shadow-md border-2 border-yellow-500"
                style={{ textDecoration: 'none' }}
              >
                <Star size={18} className="mr-2" />
                Unlock AI-Powered Resume Builder & Premium Features
              </a>
              <p className="mt-2 text-sm text-white font-medium text-center">
                Join ExpertResume to access our AI-powered resume builder, ATS optimization tools, and get noticed by top employers!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-xl shadow-md overflow-hidden sticky top-8">
              {/* Contact Card */}
              {(email || phone || website) && (
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                  <ul className="space-y-3">
                    {email && (
                      <li className="flex items-center">
                        <Mail size={18} className="text-gray-500 mr-3" />
                        <a href={`mailto:${email}`} className="text-blue-600 hover:underline">{email}</a>
                      </li>
                    )}
                    {phone && (
                      <li className="flex items-center">
                        <Phone size={18} className="text-gray-500 mr-3" />
                        <a href={`tel:${phone}`} className="text-blue-600 hover:underline">{phone}</a>
                      </li>
                    )}
                    {website && (
                      <li className="flex items-center">
                        <LinkIcon size={18} className="text-gray-500 mr-3" />
                        <a href={ensureAbsoluteUrl(website)} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">
                          {website.replace(/^https?:\/\//, '')}
                        </a>
                      </li>
                    )}
                  </ul>
                </div>
              )}

              {/* Skills Card */}
              {(userSkills && Array.isArray(userSkills) && userSkills.length > 0) && (
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {userSkills.slice(0, 12).map((skill, index) => (
                      <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                        {typeof skill === 'string' ? skill : skill.name}
                      </span>
                    ))}
                  </div>
                  {userSkills.length > 12 && (
                    <button className="mt-4 text-blue-600 text-sm font-medium hover:underline" onClick={() => setActiveTab('skills')}>
                      + {userSkills.length - 12} more skills
                    </button>
                  )}
                </div>
              )}

              {/* Languages Card */}
              {languages && Array.isArray(languages) && languages.length > 0 && languages.some(lang => lang.language && lang.proficiency) && (
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Languages</h3>
                  <ul className="space-y-2">
                    {languages.filter(lang => lang.language && lang.proficiency).map((lang, index) => (
                      <li key={index} className="flex justify-between items-center">
                        <span className="text-gray-700">{lang.language}</span>
                        <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {lang.proficiency}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Social Links */}
            {(linkedin || github) && (
              <div className="mt-6 bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Connect</h3>
                <div className="flex space-x-4">
                  {linkedin && (
                    <a href={ensureAbsoluteUrl(linkedin)} target="_blank" rel="noopener noreferrer" className="bg-blue-100 p-3 rounded-lg hover:bg-blue-200 transition-colors">
                      <svg className="w-5 h-5 text-blue-700" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                    </a>
                  )}
                  {github && (
                    <a href={ensureAbsoluteUrl(github)} target="_blank" rel="noopener noreferrer" className="bg-gray-100 p-3 rounded-lg hover:bg-gray-200 transition-colors">
                      <svg className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 24 24">
                        <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.098.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd"/>
                      </svg>
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Main Content Area */}
          <div className="lg:w-2/3">
            {/* Always show tabs if there is any */}
            {showTabs && (
              <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
                <nav className="flex overflow-x-auto">
                  {tabs.map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-6 py-4 font-medium text-sm whitespace-nowrap ${activeTab === tab.id ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>
            )}
            <div className="bg-white rounded-xl shadow-md overflow-hidden p-8">
              {/* Overview shows ALL sections */}
              {activeTab === 'overview' && (
                <>
                  {hasAbout && (
                    <div className="mb-10">
                      <h2 className="text-2xl font-bold text-gray-900 mb-4">About</h2>
                      <p className="text-gray-700 leading-relaxed whitespace-pre-line">{aboutMe}</p>
                    </div>
                  )}
                  {hasExperience && (
                    <ArraySection
                      title="Professional Experience"
                      items={userExperiences}
                      icon={<Briefcase size={20} />}
                      itemSignificantFields={['title', 'company']}
                      renderItem={(exp) => (
                        <div className="pb-6">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="text-xl font-bold text-gray-900">{exp.title}</h4>
                              <p className="text-lg text-blue-600">{exp.company}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-500">
                                {exp.startDate} - {exp.currentlyWorking ? 'Present' : exp.endDate || 'Present'}
                              </p>
                              {exp.location && (
                                <p className="text-sm text-gray-500">{exp.location}</p>
                              )}
                            </div>
                          </div>
                          {exp.description && (
                            <div className="mt-3 text-gray-700 whitespace-pre-line">
                              {exp.description}
                            </div>
                          )}
                          {exp.skills && exp.skills.length > 0 && (
                            <div className="mt-3">
                              <div className="flex flex-wrap gap-2">
                                {exp.skills.map((skill, index) => (
                                  <span key={index} className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-xs">
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    />
                  )}
                  {hasEducation && (
                    <ArraySection
                      title="Education"
                      items={userEducations}
                      icon={<BookOpen size={20} />}
                      itemSignificantFields={['school', 'degree']}
                      renderItem={(edu) => (
                        <div className="pb-6">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="text-xl font-bold text-gray-900">{edu.school}</h4>
                              <p className="text-lg text-blue-600">{edu.degree} {edu.fieldOfStudy && `in ${edu.fieldOfStudy}`}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-500">
                                {edu.startDate} - {edu.endDate || 'Present'}
                              </p>
                              {edu.grade && (
                                <p className="text-sm text-gray-500">Grade: {edu.grade}</p>
                              )}
                            </div>
                          </div>
                          {edu.description && (
                            <div className="mt-3 text-gray-700 whitespace-pre-line">
                              {edu.description}
                            </div>
                          )}
                        </div>
                      )}
                    />
                  )}
                  {hasSkills && Array.isArray(userSkills) && userSkills.length > 0 && (
                    <div className="mb-10">
                      <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                        <Star size={20} className="mr-3 text-blue-600" /> Skills
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {userSkills.map((skill, index) => (
                          <span key={index} className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
                            {typeof skill === 'string' ? skill : skill.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {hasCertifications && (
                    <ArraySection
                      title="Certifications"
                      items={userCertifications}
                      icon={<Award size={20} />}
                      itemSignificantFields={['name', 'issuer']}
                      renderItem={(cert) => (
                        <div className="pb-6">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="text-xl font-bold text-gray-900">{cert.name}</h4>
                              <p className="text-lg text-blue-600">{cert.issuer}</p>
                            </div>
                            {cert.date && (
                              <p className="text-sm text-gray-500">{cert.date}</p>
                            )}
                          </div>
                          {cert.credentialId && (
                            <p className="text-sm text-gray-500 mt-1">Credential ID: {cert.credentialId}</p>
                          )}
                          {cert.credentialUrl && (
                            <a 
                              href={ensureAbsoluteUrl(cert.credentialUrl)} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-block mt-2 text-blue-600 hover:underline"
                            >
                              View Credential
                            </a>
                          )}
                        </div>
                      )}
                    />
                  )}
                  {hasProjects && (
                    <ArraySection
                      title="Projects"
                      items={userProjects}
                      icon={<Folder size={20} />}
                      itemSignificantFields={['title']}
                      renderItem={(proj) => (
                        <div className="pb-6">
                          <div className="flex justify-between items-start">
                            <h4 className="text-xl font-bold text-gray-900">{proj.title}</h4>
                            {proj.date && (
                              <p className="text-sm text-gray-500">{proj.date}</p>
                            )}
                          </div>
                          {proj.url && (
                            <a 
                              href={ensureAbsoluteUrl(proj.url)} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-block mt-1 text-blue-600 hover:underline text-sm"
                            >
                              {proj.url.replace(/^https?:\/\//, '')}
                            </a>
                          )}
                          {proj.description && (
                            <div className="mt-2 text-gray-700 whitespace-pre-line">
                              {proj.description}
                            </div>
                          )}
                          {proj.skills && proj.skills.length > 0 && (
                            <div className="mt-3">
                              <div className="flex flex-wrap gap-2">
                                {proj.skills.map((skill, index) => (
                                  <span key={index} className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-xs">
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    />
                  )}
                </>
              )}
              
              {/* Individual tab content */}
              {activeTab === 'experience' && hasExperience && (
                <ArraySection
                  title="Professional Experience"
                  items={userExperiences}
                  icon={<Briefcase size={20} />}
                  itemSignificantFields={['title', 'company']}
                  renderItem={(exp) => (
                    <div className="pb-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-xl font-bold text-gray-900">{exp.title}</h4>
                          <p className="text-lg text-blue-600">{exp.company}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">
                            {exp.startDate} - {exp.currentlyWorking ? 'Present' : exp.endDate || 'Present'}
                          </p>
                          {exp.location && (
                            <p className="text-sm text-gray-500">{exp.location}</p>
                          )}
                        </div>
                      </div>
                      {exp.description && (
                        <div className="mt-3 text-gray-700 whitespace-pre-line">
                          {exp.description}
                        </div>
                      )}
                      {exp.skills && exp.skills.length > 0 && (
                        <div className="mt-3">
                          <div className="flex flex-wrap gap-2">
                            {exp.skills.map((skill, index) => (
                              <span key={index} className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-xs">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                />
              )}

              {activeTab === 'education' && hasEducation && (
                <ArraySection
                  title="Education"
                  items={userEducations}
                  icon={<BookOpen size={20} />}
                  itemSignificantFields={['school', 'degree']}
                  renderItem={(edu) => (
                    <div className="pb-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-xl font-bold text-gray-900">{edu.school}</h4>
                          <p className="text-lg text-blue-600">{edu.degree} {edu.fieldOfStudy && `in ${edu.fieldOfStudy}`}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">
                            {edu.startDate} - {edu.endDate || 'Present'}
                          </p>
                          {edu.grade && (
                            <p className="text-sm text-gray-500">Grade: {edu.grade}</p>
                          )}
                        </div>
                      </div>
                      {edu.description && (
                        <div className="mt-3 text-gray-700 whitespace-pre-line">
                          {edu.description}
                        </div>
                      )}
                    </div>
                  )}
                />
              )}

              {activeTab === 'skills' && hasSkills && (
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                    <Star size={20} className="mr-3 text-blue-600" />
                    Skills
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {userSkills.map((skill, index) => (
                      <span key={index} className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full font-medium">
                        {typeof skill === 'string' ? skill : skill.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'certifications' && hasCertifications && (
                <ArraySection
                  title="Certifications"
                  items={userCertifications}
                  icon={<Award size={20} />}
                  itemSignificantFields={['name', 'issuer']}
                  renderItem={(cert) => (
                    <div className="pb-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-xl font-bold text-gray-900">{cert.name}</h4>
                          <p className="text-lg text-blue-600">{cert.issuer}</p>
                        </div>
                        {cert.date && (
                          <p className="text-sm text-gray-500">{cert.date}</p>
                        )}
                      </div>
                      {cert.credentialId && (
                        <p className="text-sm text-gray-500 mt-1">Credential ID: {cert.credentialId}</p>
                      )}
                      {cert.credentialUrl && (
                        <a 
                          href={ensureAbsoluteUrl(cert.credentialUrl)} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-block mt-2 text-blue-600 hover:underline"
                        >
                          View Credential
                        </a>
                      )}
                    </div>
                  )}
                />
              )}

              {activeTab === 'projects' && hasProjects && (
                <ArraySection
                  title="Projects"
                  items={userProjects}
                  icon={<Folder size={20} />}
                  itemSignificantFields={['title']}
                  renderItem={(proj) => (
                    <div className="pb-6">
                      <div className="flex justify-between items-start">
                        <h4 className="text-xl font-bold text-gray-900">{proj.title}</h4>
                        {proj.date && (
                          <p className="text-sm text-gray-500">{proj.date}</p>
                        )}
                      </div>
                      {proj.url && (
                        <a 
                          href={ensureAbsoluteUrl(proj.url)} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-block mt-1 text-blue-600 hover:underline text-sm"
                        >
                          {proj.url.replace(/^https?:\/\//, '')}
                        </a>
                      )}
                      {proj.description && (
                        <div className="mt-2 text-gray-700 whitespace-pre-line">
                          {proj.description}
                        </div>
                      )}
                      {proj.skills && proj.skills.length > 0 && (
                        <div className="mt-3">
                          <div className="flex flex-wrap gap-2">
                            {proj.skills.map((skill, index) => (
                              <span key={index} className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-xs">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
