'use client'
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { doc, getDoc, setDoc, collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";
import { db } from "../lib/firebase";
import toast, { Toaster } from "react-hot-toast";
import {
  User, Briefcase, BookOpen, LinkIcon, GraduationCap, Settings,
  Star, Award, Folder, Globe, Heart, FileText, MapPin, Link, X,
  Share2, ChevronDown, ChevronUp, Edit3, CheckCircle2, Mail, Phone,
  Download, Calendar, ExternalLink
} from "lucide-react";

// Social media icons
const LinkedInIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M19 0h-14c-2.76 0-5 2.24-5 5v14c0 2.76 2.24 5 5 5h14c2.76 0 5-2.24 5-5v-14c0-2.76-2.24-5-5-5zm-11 19h-3v-9h3v9zm-1.5-10.28c-.97 0-1.75-.79-1.75-1.75s.78-1.75 1.75-1.75 1.75.79 1.75 1.75-.78 1.75-1.75 1.75zm15.5 10.28h-3v-4.5c0-1.08-.02-2.47-1.5-2.47-1.5 0-1.73 1.17-1.73 2.39v4.58h-3v-9h2.89v1.23h.04c.4-.75 1.38-1.54 2.84-1.54 3.04 0 3.6 2 3.6 4.59v4.72z" />
  </svg>
);

const GitHubIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.098.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
  </svg>
);

const TwitterIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const FacebookIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const WhatsAppIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);


// Helper functions from public profile
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
        {icon && React.cloneElement(icon, { className: 'mr-3 text-primary', size: 20 })}
        {title}
      </h3>
      <div className="space-y-6">
        {validItems.map((item, index) => (
          <div key={index} className="pl-8 relative before:absolute before:left-4 before:top-0 before:h-full before:w-px before:bg-gray-200 before:content-[''] first:before:h-[calc(100%-24px)] first:before:top-6 last:before:h-6">
            <div className="relative before:absolute before:-left-8 before:top-2 before:h-3 before:w-3 before:rounded-full before:border-4 before:border-primary before:content-['']">
              {renderItem(item)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Skill tag colors and proficiency mapping
const getSkillColor = (index, proficiency) => {
  const colors = [
    'bg-slate-100 text-primary border-slate-200',
    'bg-slate-100 text-primary border-slate-200',
    'bg-slate-100 text-primary border-slate-200',
    'bg-slate-100 text-primary border-slate-200',
    'bg-slate-100 text-accent-800 border-slate-200',
    'bg-orange-100 text-orange-800 border-orange-200',
    'bg-accent-100 text-accent-800 border-accent-200',
    'bg-red-100 text-red-800 border-red-200',
  ];

  // Use proficiency to determine intensity if available
  if (proficiency) {
    const baseColor = colors[index % colors.length];
    if (proficiency === 'Expert') {
      return baseColor.replace('100', '200').replace('800', '900');
    } else if (proficiency === 'Advanced') {
      return baseColor;
    } else if (proficiency === 'Intermediate') {
      return baseColor.replace('100', '50').replace('800', '700');
    } else {
      return baseColor.replace('100', '50').replace('800', '600');
    }
  }

  return colors[index % colors.length];
};

const getProficiencyIcon = (proficiency) => {
  switch (proficiency) {
    case 'Expert':
      return <Star size={12} className="ml-1" fill="currentColor" />;
    case 'Advanced':
      return <Star size={12} className="ml-1" fill="currentColor" />;
    case 'Intermediate':
      return <Star size={12} className="ml-1" />;
    default:
      return null;
  }
};

const renderSkillTags = (skills) => {
  if (!skills || skills.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {skills.map((skill, index) => {
        const skillName = typeof skill === 'string' ? skill : skill.name;
        const proficiency = typeof skill === 'object' ? skill.level : null;
        const colorClass = getSkillColor(index, proficiency);

        return (
          <span
            key={index}
            className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium border transition-all hover:shadow-sm ${colorClass}`}
          >
            {skillName}
            {proficiency && (
              <>
                {getProficiencyIcon(proficiency)}
                <span className="ml-1 text-xs opacity-75">({proficiency})</span>
              </>
            )}
          </span>
        );
      })}
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

// Enhanced social sharing functions
const shareToLinkedIn = (profileData, profileUrl) => {
  const text = `Check out ${profileData.firstName} ${profileData.lastName}'s professional profile`;
  const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(profileUrl)}&title=${encodeURIComponent(text)}`;
  window.open(url, '_blank', 'width=600,height=600');
};

const shareToTwitter = (profileData, profileUrl) => {
  const text = `Check out ${profileData.firstName} ${profileData.lastName}'s professional profile`;
  const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(profileUrl)}`;
  window.open(url, '_blank', 'width=600,height=400');
};

const shareToFacebook = (profileData, profileUrl) => {
  const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(profileUrl)}`;
  window.open(url, '_blank', 'width=600,height=600');
};

const shareToWhatsApp = (profileData, profileUrl) => {
  const text = `Check out ${profileData.firstName} ${profileData.lastName}'s professional profile: ${profileUrl}`;
  const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank');
};

const copyProfileLink = async (profileUrl) => {
  try {
    await navigator.clipboard.writeText(profileUrl);
    toast.success("Profile link copied to clipboard!");
    return true;
  } catch (err) {
    console.error('Failed to copy: ', err);
    toast.error("Failed to copy link");
    return false;
  }
};

export default function ProfileReadOnly() {
  const { user } = useAuth();
  const router = useRouter();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [imgError, setImgError] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [publicProfileUrl, setPublicProfileUrl] = useState("");

  // Load profile data
  useEffect(() => {
    const loadProfileData = async () => {
      if (!user?.uid) return;

      try {
        const profileRef = doc(db, `users/${user?.uid}/profile`, 'userProfile');
        const profileSnapshot = await getDoc(profileRef);

        if (profileSnapshot.exists()) {
          const data = profileSnapshot.data();
          setProfileData(data);
          setPublicProfileUrl(`${window.location.origin}/public-profile/${user.uid}`);
        } else {
          // Try to get latest resume data if no profile exists
          const resumesRef = collection(db, "resumes");
          const resumeQuery = query(
            resumesRef,
            where("userId", "==", user.uid),
            orderBy("lastModified", "desc"),
            limit(1)
          );
          const resumeSnapshot = await getDocs(resumeQuery);

          if (!resumeSnapshot.empty) {
            const resumeData = resumeSnapshot.docs[0].data();
            setProfileData(resumeData);
            setPublicProfileUrl(`${window.location.origin}/public-profile/${user.uid}`);

            // Auto-save resume data to profile if profile doesn't exist
            try {
              await setDoc(profileRef, {
                ...resumeData,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              });
              console.log("✅ Profile auto-saved from resume data");
              toast.success("Profile automatically created from your resume!", {
                duration: 3000,
                icon: '🎉',
              });
            } catch (saveError) {
              console.error("Error auto-saving profile:", saveError);
              // Don't show error toast to user - profile still displays correctly
            }
          }
        }
      } catch (error) {
        console.error("Error loading profile:", error);
        setError("Failed to load profile data");
        toast.error("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };

    loadProfileData();
  }, [user]);

  // Tab configuration
  const {
    about,
    experiences,
    educations,
    skills,
    certifications,
    projects,
    publications,
    volunteer,
    languages,
  } = profileData || {};

  const hasAbout = about && about.trim() !== '';
  const hasExperience = experiences && experiences.some(exp => !isItemEffectivelyEmpty(exp, ['title', 'company']));
  const hasEducation = educations && educations.some(edu => !isItemEffectivelyEmpty(edu, ['school', 'degree']));
  const hasSkills = skills && skills.length > 0;
  const hasCertifications = certifications && certifications.some(cert => !isItemEffectivelyEmpty(cert, ['name', 'issuer']));
  const hasProjects = projects && projects.some(proj => !isItemEffectivelyEmpty(proj, ['title']));
  const hasPublications = publications && publications.some(pub => !isItemEffectivelyEmpty(pub, ['title']));
  const hasVolunteer = volunteer && volunteer.some(vol => !isItemEffectivelyEmpty(vol, ['organization', 'role']));
  const hasLanguages = languages && languages.some(lang => lang.language && lang.proficiency);

  const tabs = [
    { id: 'overview', label: 'Overview', show: true },
    { id: 'experience', label: 'Experience', show: hasExperience },
    { id: 'education', label: 'Education', show: hasEducation },
    { id: 'skills', label: 'Skills', show: hasSkills },
    { id: 'certifications', label: 'Certifications', show: hasCertifications },
    { id: 'projects', label: 'Projects', show: hasProjects },
    { id: 'publications', label: 'Publications', show: hasPublications },
    { id: 'volunteer', label: 'Volunteer', show: hasVolunteer },
  ].filter(tab => tab.show);

  const showTabs = tabs.length > 1;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mb-4" />
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-lg text-center">
          <div className="text-accent-600 mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Let's Get Your Profile Started! 🚀</h2>
          <p className="text-gray-600 mb-6">
            Welcome to ExpertResume! To create your professional profile, follow these simple steps:
          </p>

          <div className="text-left mb-8 space-y-4">
            <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
              <div className="bg-slate-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</div>
              <div>
                <h3 className="font-semibold text-gray-800">Upload Your Resume</h3>
                <p className="text-sm text-gray-600">Start by uploading your existing resume to our platform</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
              <div className="bg-slate-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</div>
              <div>
                <h3 className="font-semibold text-gray-800">Enhance & Save</h3>
                <p className="text-sm text-gray-600">Use our AI tools to optimize your resume and save it</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
              <div className="bg-slate-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">3</div>
              <div>
                <h3 className="font-semibold text-gray-800">Create Public Profile</h3>
                <p className="text-sm text-gray-600">Build your professional profile to get discovered by recruiters</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => router.push('/upload-resume')}
              className="flex-1 bg-gradient-to-r from-primary to-primary text-white px-6 py-3 rounded-lg hover:from-gray-900 hover:to-gray-900 transition-all font-semibold flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Start with Resume Upload
            </button>

            <button
              onClick={() => router.push('/edit-profile')}
              className="flex-1 border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-all font-semibold flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Create Profile Manually
            </button>
          </div>

          <p className="text-xs text-gray-500 mt-4">
            💡 Tip: Starting with resume upload is faster and pre-fills your profile information!
          </p>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-lg text-center">
          <div className="text-accent-600 mb-6">
            <User size={64} className="mx-auto" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Ready to Build Your Professional Profile? 🌟</h2>
          <p className="text-gray-600 mb-6">
            Create a standout profile that showcases your skills and gets you discovered by top recruiters!
          </p>

          <div className="text-left mb-8 space-y-3">
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
              <div className="bg-slate-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">✓</div>
              <span className="text-sm text-gray-700">Professional profile page with custom URL</span>
            </div>

            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
              <div className="bg-slate-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">✓</div>
              <span className="text-sm text-gray-700">Get discovered by recruiters and hiring managers</span>
            </div>

            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
              <div className="bg-slate-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">✓</div>
              <span className="text-sm text-gray-700">Share your achievements on social media</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => router.push('/upload-resume')}
              className="flex-1 bg-gradient-to-r from-primary to-primary text-white px-6 py-3 rounded-lg hover:from-gray-900 hover:to-gray-900 transition-all font-semibold flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Quick Start: Upload Resume
            </button>

            <button
              onClick={() => router.push('/edit-profile')}
              className="flex-1 border-2 border-primary text-primary px-6 py-3 rounded-lg hover:bg-slate-50 transition-all font-semibold flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Create Profile
            </button>
          </div>

          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>💡 Pro Tip:</strong> Upload your resume first to auto-populate your profile and save time!
            </p>
          </div>
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
    emailVerified,
    phoneVerified,
  } = profileData;

  const userExperiences = experiences || [];
  const userEducations = educations || [];
  const userSkills = skills || [];
  const userCertifications = certifications || [];
  const userProjects = projects || [];
  const userPublications = publications || [];
  const userVolunteer = volunteer || [];
  const userLanguages = languages || [];

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Social Share Modal - Mobile Responsive (Exact copy from EditableProfileForm) */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-primary to-primary bg-clip-text text-transparent">
                  Share Profile
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  🌟 Show off your professional profile
                </p>
              </div>
              <button
                onClick={() => setShowShareModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-slate-100 to-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Share2 className="text-primary" size={24} />
              </div>
              <p className="text-sm text-gray-500 mb-4 text-center">Copy your profile link to share</p>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  readOnly
                  value={publicProfileUrl}
                  className="flex-1 border-2 border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 bg-gray-50 focus:outline-none font-mono"
                />
                <button
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      navigator.clipboard.writeText(publicProfileUrl);
                      toast.success("Profile link copied to clipboard!");
                    }
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-primary to-primary text-white rounded-xl hover:from-gray-900 hover:to-gray-900 transition-all duration-200 shadow-lg hover:shadow-xl font-medium flex items-center justify-center gap-2 hover:scale-105 active:scale-95"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy
                </button>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-sm text-gray-500 mb-4 text-center">Share on social platforms</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {/* LinkedIn */}
                <a
                  href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(publicProfileUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center justify-center p-4 rounded-xl bg-gradient-to-br from-accent-50 to-accent-100 hover:from-accent-100 hover:to-accent-200 transition-all duration-200 group hover:scale-105 active:scale-95"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#0A66C2" className="group-hover:scale-110 transition-transform">
                    <path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z" />
                  </svg>
                  <span className="mt-2 text-xs font-medium text-primary">LinkedIn</span>
                </a>

                {/* Twitter/X */}
                <a
                  href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(publicProfileUrl)}&text=${encodeURIComponent("Check out my professional profile!")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center justify-center p-4 rounded-xl bg-gradient-to-br from-sky-50 to-sky-100 hover:from-sky-100 hover:to-sky-200 transition-all duration-200 group hover:scale-105 active:scale-95"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#1DA1F2" className="group-hover:scale-110 transition-transform">
                    <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z" />
                  </svg>
                  <span className="mt-2 text-xs font-medium text-sky-700">Twitter</span>
                </a>

                {/* Facebook */}
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(publicProfileUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center justify-center p-4 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 hover:from-slate-100 hover:to-slate-200 transition-all duration-200 group hover:scale-105 active:scale-95"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#1877F2" className="group-hover:scale-110 transition-transform">
                    <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5A10.978 10.978 0 0112 6c1.54 0 3.04.31 4.43.87.14.06.27.13.4.2l.07.04 1.48-1.48-.07-.04A11.978 11.978 0 0012 4c-6.627 0-12 5.373-12 12 0 6.627 5.373 12 12 12a11.978 11.978 0 007.94-3.06l-.07-.04-1.48 1.48.07.04A11.978 11.978 0 0024 12z" />
                  </svg>
                  <span className="mt-2 text-xs font-medium text-primary">Facebook</span>
                </a>

                {/* WhatsApp */}
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(`Check out my professional profile: ${publicProfileUrl}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center justify-center p-4 rounded-xl bg-gradient-to-br from-accent-50 to-accent-100 hover:from-accent-100 hover:to-accent-200 transition-all duration-200 group hover:scale-105 active:scale-95"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#25D366" className="group-hover:scale-110 transition-transform">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  <span className="mt-2 text-xs font-medium text-primary">WhatsApp</span>
                </a>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <button
                onClick={() => setShowShareModal(false)}
                className="w-full px-4 py-3 text-gray-600 hover:text-gray-800 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-1/3 space-y-6">
            {/* Profile Card */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="relative h-32 bg-gradient-to-r from-primary to-accent">
                <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2">
                  <div className="relative w-32 h-32 rounded-full border-4 border-white bg-white overflow-hidden shadow-lg">
                    {photo && !imgError ? (
                      <img
                        src={photo}
                        alt="Profile"
                        className="w-full h-full object-cover"
                        onError={() => setImgError(true)}
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
                        <User size={48} />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-20 pb-6 px-6 text-center">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {firstName} {lastName}
                </h1>
                {headline && (
                  <p className="text-gray-600 mb-3">{headline}</p>
                )}
                {location && (
                  <p className="text-gray-500 text-sm flex items-center justify-center mb-4">
                    <MapPin size={14} className="mr-1" />
                    {location}
                  </p>
                )}

                {/* Verification badges */}
                {(emailVerified || phoneVerified) && (
                  <div className="flex justify-center space-x-2 mb-4">
                    {emailVerified && (
                      <span className="inline-flex items-center bg-slate-100 text-primary px-2 py-1 rounded-full text-xs font-medium">
                        <CheckCircle2 size={12} className="mr-1" />Email Verified
                      </span>
                    )}
                    {phoneVerified && (
                      <span className="inline-flex items-center bg-slate-100 text-primary px-2 py-1 rounded-full text-xs font-medium">
                        <CheckCircle2 size={12} className="mr-1" />Phone Verified
                      </span>
                    )}
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => router.push('/edit-profile')}
                    className="flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-gray-900 transition-colors"
                  >
                    <Edit3 size={16} className="mr-2" />
                    Edit Profile
                  </button>
                  <button
                    onClick={() => setShowShareModal(true)}
                    className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Share2 size={16} className="mr-2" />
                    Share
                  </button>
                </div>
              </div>

              {/* Contact Info */}
              {(email || phone || website) && (
                <div className="p-6 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact</h3>
                  <ul className="space-y-3">
                    {email && (
                      <li>
                        <a href={`mailto:${email}`} className="flex items-center text-gray-600 hover:text-primary transition-colors">
                          <Mail size={16} className="mr-3 text-gray-400" />
                          {email}
                        </a>
                      </li>
                    )}
                    {phone && (
                      <li>
                        <a href={`tel:${phone}`} className="flex items-center text-gray-600 hover:text-primary transition-colors">
                          <Phone size={16} className="mr-3 text-gray-400" />
                          {phone}
                        </a>
                      </li>
                    )}
                    {website && (
                      <li>
                        <a href={ensureAbsoluteUrl(website)} target="_blank" rel="noopener noreferrer" className="flex items-center text-gray-600 hover:text-primary transition-colors">
                          <Globe size={16} className="mr-3 text-gray-400" />
                          Website
                          <ExternalLink size={14} className="ml-1" />
                        </a>
                      </li>
                    )}
                  </ul>
                </div>
              )}

              {/* Skills Preview */}
              {hasSkills && (
                <div className="p-6 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {userSkills.slice(0, 8).map((skill, index) => {
                      const skillName = typeof skill === 'string' ? skill : skill.name;
                      const proficiency = typeof skill === 'object' ? skill.level : null;
                      const colorClass = getSkillColor(index, proficiency);

                      return (
                        <span
                          key={index}
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${colorClass}`}
                        >
                          {skillName}
                          {proficiency && getProficiencyIcon(proficiency)}
                        </span>
                      );
                    })}
                  </div>
                  {userSkills.length > 8 && (
                    <button className="mt-3 text-primary text-sm font-medium hover:underline" onClick={() => setActiveTab('skills')}>
                      + {userSkills.length - 8} more skills
                    </button>
                  )}
                </div>
              )}

              {/* Languages */}
              {hasLanguages && (
                <div className="p-6 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Languages</h3>
                  <ul className="space-y-2">
                    {userLanguages.filter(lang => lang.language && lang.proficiency).map((lang, index) => (
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
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Connect</h3>
                <div className="flex space-x-4">
                  {linkedin && (
                    <a href={ensureAbsoluteUrl(linkedin)} target="_blank" rel="noopener noreferrer" className="bg-slate-100 p-3 rounded-lg hover:bg-slate-200 transition-colors">
                      <LinkedInIcon className="w-5 h-5 text-primary" />
                    </a>
                  )}
                  {github && (
                    <a href={ensureAbsoluteUrl(github)} target="_blank" rel="noopener noreferrer" className="bg-gray-100 p-3 rounded-lg hover:bg-gray-200 transition-colors">
                      <GitHubIcon className="w-5 h-5 text-gray-700" />
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Main Content Area */}
          <div className="lg:w-2/3">
            {/* Tabs */}
            {showTabs && (
              <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
                <nav className="flex overflow-x-auto">
                  {tabs.map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-6 py-4 font-medium text-sm whitespace-nowrap ${activeTab === tab.id
                          ? 'text-primary border-b-2 border-primary'
                          : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>
            )}

            {/* Content */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden p-8">
              {/* Overview Tab */}
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
                          <div className="flex flex-col md:flex-row md:justify-between md:items-start">
                            <div className="flex-1">
                              <h4 className="text-xl font-bold text-gray-900">{exp.title}</h4>
                              <p className="text-lg text-primary">{exp.company}</p>
                              {exp.location && (
                                <p className="text-gray-500 text-sm">{exp.location}</p>
                              )}
                              {exp.employmentType && (
                                <p className="text-gray-500 text-sm">{exp.employmentType}</p>
                              )}
                            </div>
                            <div className="text-right mt-2 md:mt-0">
                              <p className="text-sm text-gray-500">
                                {exp.startDate} - {exp.currentlyWorking ? 'Present' : exp.endDate || 'Present'}
                              </p>
                            </div>
                          </div>
                          {exp.description && (
                            <div className="mt-3 text-gray-700 whitespace-pre-line">
                              {exp.description}
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
                      icon={<GraduationCap size={20} />}
                      itemSignificantFields={['school', 'degree']}
                      renderItem={(edu) => (
                        <div className="pb-6">
                          <div className="flex flex-col md:flex-row md:justify-between md:items-start">
                            <div className="flex-1">
                              <h4 className="text-xl font-bold text-gray-900">{edu.school}</h4>
                              <p className="text-lg text-primary">{edu.degree}</p>
                              {edu.fieldOfStudy && (
                                <p className="text-gray-600">{edu.fieldOfStudy}</p>
                              )}
                            </div>
                            <div className="text-right mt-2 md:mt-0">
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

                  {hasSkills && (
                    <div className="mb-10">
                      <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                        <Star size={20} className="mr-3 text-primary" /> Skills
                      </h3>
                      {renderSkillTags(userSkills)}
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
                              <p className="text-lg text-primary">{cert.issuer}</p>
                            </div>
                            {cert.date && (
                              <p className="text-sm text-gray-500">{cert.date}</p>
                            )}
                          </div>
                          {cert.credentialId && (
                            <p className="text-sm text-gray-500 mt-2">
                              Credential ID: {cert.credentialId}
                            </p>
                          )}
                          {cert.url && (
                            <a
                              href={ensureAbsoluteUrl(cert.url)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center text-primary hover:text-gray-900 text-sm mt-2"
                            >
                              View Credential <ExternalLink size={14} className="ml-1" />
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
                      renderItem={(project) => (
                        <div className="pb-6">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="text-xl font-bold text-gray-900">{project.title}</h4>
                              {project.company && (
                                <p className="text-lg text-primary">{project.company}</p>
                              )}
                            </div>
                            {(project.startDate || project.endDate) && (
                              <p className="text-sm text-gray-500">
                                {project.startDate} - {project.endDate || 'Present'}
                              </p>
                            )}
                          </div>
                          {project.description && (
                            <div className="mt-3 text-gray-700 whitespace-pre-line">
                              {project.description}
                            </div>
                          )}
                          {project.url && (
                            <a
                              href={ensureAbsoluteUrl(project.url)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center text-primary hover:text-gray-900 text-sm mt-2"
                            >
                              View Project <ExternalLink size={14} className="ml-1" />
                            </a>
                          )}
                        </div>
                      )}
                    />
                  )}
                </>
              )}

              {/* Individual Tab Content */}
              {activeTab === 'experience' && hasExperience && (
                <ArraySection
                  title="Professional Experience"
                  items={userExperiences}
                  icon={<Briefcase size={20} />}
                  itemSignificantFields={['title', 'company']}
                  renderItem={(exp) => (
                    <div className="pb-6">
                      <div className="flex flex-col md:flex-row md:justify-between md:items-start">
                        <div className="flex-1">
                          <h4 className="text-xl font-bold text-gray-900">{exp.title}</h4>
                          <p className="text-lg text-primary">{exp.company}</p>
                          {exp.location && (
                            <p className="text-gray-500 text-sm">{exp.location}</p>
                          )}
                          {exp.employmentType && (
                            <p className="text-gray-500 text-sm">{exp.employmentType}</p>
                          )}
                        </div>
                        <div className="text-right mt-2 md:mt-0">
                          <p className="text-sm text-gray-500">
                            {exp.startDate} - {exp.currentlyWorking ? 'Present' : exp.endDate || 'Present'}
                          </p>
                        </div>
                      </div>
                      {exp.description && (
                        <div className="mt-3 text-gray-700 whitespace-pre-line">
                          {exp.description}
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
                  icon={<GraduationCap size={20} />}
                  itemSignificantFields={['school', 'degree']}
                  renderItem={(edu) => (
                    <div className="pb-6">
                      <div className="flex flex-col md:flex-row md:justify-between md:items-start">
                        <div className="flex-1">
                          <h4 className="text-xl font-bold text-gray-900">{edu.school}</h4>
                          <p className="text-lg text-primary">{edu.degree}</p>
                          {edu.fieldOfStudy && (
                            <p className="text-gray-600">{edu.fieldOfStudy}</p>
                          )}
                        </div>
                        <div className="text-right mt-2 md:mt-0">
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
                  <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                    <Star size={20} className="mr-3 text-primary" /> Skills & Expertise
                  </h3>
                  <div className="space-y-6">
                    {/* Categorized skills or single list */}
                    <div>
                      {renderSkillTags(userSkills)}
                    </div>

                    {/* Skills with proficiency levels */}
                    {userSkills.some(skill => typeof skill === 'object' && skill.level) && (
                      <div className="mt-8">
                        <h4 className="text-lg font-semibold text-gray-800 mb-4">Proficiency Levels</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {userSkills.filter(skill => typeof skill === 'object' && skill.level).map((skill, index) => {
                            const colorClass = getSkillColor(index, skill.level);
                            return (
                              <div key={index} className="bg-gray-50 p-4 rounded-lg border">
                                <div className="flex items-center justify-between mb-2">
                                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${colorClass}`}>
                                    {skill.name}
                                    {getProficiencyIcon(skill.level)}
                                  </span>
                                  <span className="text-sm text-gray-600">{skill.level}</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div
                                    className={`h-2 rounded-full transition-all duration-300 ${skill.level === 'Expert' ? 'bg-slate-500 w-full' :
                                        skill.level === 'Advanced' ? 'bg-slate-500 w-3/4' :
                                          skill.level === 'Intermediate' ? 'bg-yellow-500 w-1/2' : 'bg-gray-400 w-1/4'
                                      }`}
                                  ></div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
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
                          <p className="text-lg text-primary">{cert.issuer}</p>
                        </div>
                        {cert.date && (
                          <p className="text-sm text-gray-500">{cert.date}</p>
                        )}
                      </div>
                      {cert.credentialId && (
                        <p className="text-sm text-gray-500 mt-2">
                          Credential ID: {cert.credentialId}
                        </p>
                      )}
                      {cert.url && (
                        <a
                          href={ensureAbsoluteUrl(cert.url)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-primary hover:text-gray-900 text-sm mt-2"
                        >
                          View Credential <ExternalLink size={14} className="ml-1" />
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
                  renderItem={(project) => (
                    <div className="pb-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-xl font-bold text-gray-900">{project.title}</h4>
                          {project.company && (
                            <p className="text-lg text-primary">{project.company}</p>
                          )}
                        </div>
                        {(project.startDate || project.endDate) && (
                          <p className="text-sm text-gray-500">
                            {project.startDate} - {project.endDate || 'Present'}
                          </p>
                        )}
                      </div>
                      {project.description && (
                        <div className="mt-3 text-gray-700 whitespace-pre-line">
                          {project.description}
                        </div>
                      )}
                      {project.url && (
                        <a
                          href={ensureAbsoluteUrl(project.url)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-primary hover:text-gray-900 text-sm mt-2"
                        >
                          View Project <ExternalLink size={14} className="ml-1" />
                        </a>
                      )}
                    </div>
                  )}
                />
              )}

              {activeTab === 'publications' && hasPublications && (
                <ArraySection
                  title="Publications"
                  items={userPublications}
                  icon={<FileText size={20} />}
                  itemSignificantFields={['title']}
                  renderItem={(pub) => (
                    <div className="pb-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-xl font-bold text-gray-900">{pub.title}</h4>
                          {pub.publisher && (
                            <p className="text-lg text-primary">{pub.publisher}</p>
                          )}
                        </div>
                        {pub.date && (
                          <p className="text-sm text-gray-500">{pub.date}</p>
                        )}
                      </div>
                      {pub.description && (
                        <div className="mt-3 text-gray-700 whitespace-pre-line">
                          {pub.description}
                        </div>
                      )}
                      {pub.url && (
                        <a
                          href={ensureAbsoluteUrl(pub.url)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-primary hover:text-gray-900 text-sm mt-2"
                        >
                          View Publication <ExternalLink size={14} className="ml-1" />
                        </a>
                      )}
                    </div>
                  )}
                />
              )}

              {activeTab === 'volunteer' && hasVolunteer && (
                <ArraySection
                  title="Volunteer Experience"
                  items={userVolunteer}
                  icon={<Heart size={20} />}
                  itemSignificantFields={['organization', 'role']}
                  renderItem={(vol) => (
                    <div className="pb-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-xl font-bold text-gray-900">{vol.role}</h4>
                          <p className="text-lg text-primary">{vol.organization}</p>
                        </div>
                        {(vol.startDate || vol.endDate) && (
                          <p className="text-sm text-gray-500">
                            {vol.startDate} - {vol.endDate || 'Present'}
                          </p>
                        )}
                      </div>
                      {vol.description && (
                        <div className="mt-3 text-gray-700 whitespace-pre-line">
                          {vol.description}
                        </div>
                      )}
                    </div>
                  )}
                />
              )}

              {/* Empty state for tabs with no content */}
              {!hasAbout && !hasExperience && !hasEducation && !hasSkills && !hasCertifications && !hasProjects && !hasPublications && !hasVolunteer && (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <User size={48} className="mx-auto" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No content yet</h3>
                  <p className="text-gray-500 mb-4">Start building your profile by adding your information.</p>
                  <button
                    onClick={() => router.push('/edit-profile')}
                    className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-gray-900 transition-colors"
                  >
                    Edit Profile
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
