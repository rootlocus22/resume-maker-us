"use client";
import React, { useState, useEffect, useRef } from "react";
import EditProfileSkeleton from '../components/EditProfileSkeleton';
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { doc, getDoc, setDoc, collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../lib/firebase";
import toast, { Toaster } from "react-hot-toast";
import {
  User, Briefcase, BookOpen, Phone, PlusCircle, Star, Award, Folder, Globe, Heart,
  Edit3, CheckCircle2, MapPin, Link, X, Search, Send, MessageCircle, ThumbsUp,
  Share2, MoreHorizontal, ChevronDown, ChevronUp, ChevronRight, Users, FileText, Upload,
  Eye, Settings, Save, Camera, Trash2, Mail, Calendar
} from "lucide-react";

const EditableProfileForm = () => {
  const { user } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef(null);

  // Auth protection is now handled by AuthProtection wrapper in page.js
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);



  // Form State
  const [formData, setFormData] = useState({
    // Personal Information
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    profilePicture: "",
    photo: "", // Add photo field for compatibility
    headline: "",
    about: "",
    location: "",
    website: "",
    linkedin: "",
    github: "",
    twitter: "",

    // Professional Experience
    experiences: [{
      title: "",
      company: "",
      location: "",
      startDate: "",
      endDate: "",
      current: false,
      description: ""
    }],

    // Education
    educations: [{
      degree: "",
      school: "",
      location: "",
      startDate: "",
      endDate: "",
      gpa: "",
      description: ""
    }],

    // Skills
    skills: [],

    // Certifications
    certifications: [{
      name: "",
      issuer: "",
      issueDate: "",
      expiryDate: "",
      credentialId: "",
      credentialUrl: ""
    }],

    // Projects
    projects: [{
      title: "",
      description: "",
      technologies: [],
      startDate: "",
      endDate: "",
      projectUrl: "",
      githubUrl: ""
    }],

    // Languages
    languages: [{
      language: "",
      proficiency: "Beginner"
    }],

    // Volunteer Work
    volunteer: [{
      organization: "",
      role: "",
      startDate: "",
      endDate: "",
      description: ""
    }],

    // Publications
    publications: [{
      title: "",
      publisher: "",
      publishDate: "",
      url: "",
      description: ""
    }],

    // Settings
    phoneVerified: false,
    emailVerified: false,
    allowMatching: true,
    publicProfile: true
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState("personal");
  const [profilePictureFile, setProfilePictureFile] = useState(null);
  const [uploadingProfilePicture, setUploadingProfilePicture] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [otpType, setOTPType] = useState("");
  const [otp, setOTP] = useState("");
  const [showShareModal, setShowShareModal] = useState(false);
  // Resume import states
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  // Track unsaved changes
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [savedFormData, setSavedFormData] = useState(null);
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);
  const [pendingPreviewAction, setPendingPreviewAction] = useState(null);

  // Sections for navigation
  const sections = [
    { id: "personal", label: "Personal Info", icon: User },
    { id: "experience", label: "Experience", icon: Briefcase },
    { id: "education", label: "Education", icon: BookOpen },
    { id: "skills", label: "Skills", icon: Star },
    { id: "certifications", label: "Certifications", icon: Award },
    { id: "projects", label: "Projects", icon: Folder },
    { id: "languages", label: "Languages", icon: Globe },
    { id: "volunteer", label: "Volunteer", icon: Heart },
    { id: "publications", label: "Publications", icon: FileText }
  ];

  // Load existing profile data
  useEffect(() => {
    if (user) {
      loadProfileData();
    }
  }, [user]);

  // Track unsaved changes
  useEffect(() => {
    if (savedFormData && formData) {
      const hasChanges = JSON.stringify(formData) !== JSON.stringify(savedFormData);
      setHasUnsavedChanges(hasChanges);
    }
  }, [formData, savedFormData]);

  // Cleanup preview URLs on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (formData.profilePicture && formData.profilePicture.startsWith('blob:')) {
        URL.revokeObjectURL(formData.profilePicture);
      }
    };
  }, []);

  const loadProfileData = async () => {
    try {
      setLoading(true);

      // First, check if there's existing profile data
      const profileDocRef = doc(db, `users/${user.uid}/profile`, 'userProfile');
      const profileDocSnap = await getDoc(profileDocRef);

      if (profileDocSnap.exists()) {
        const data = profileDocSnap.data();
        setFormData(prev => ({
          ...prev,
          ...data,
          email: user.email || data.email || "",
          // Ensure photo compatibility - use photo field if available, otherwise profilePicture
          photo: data.photo || data.profilePicture || "",
          profilePicture: data.profilePicture || data.photo || "",
          // Ensure arrays have at least one empty item for adding new entries
          experiences: data.experiences?.length > 0 ? data.experiences : [prev.experiences[0]],
          educations: data.educations?.length > 0 ? data.educations : [prev.educations[0]],
          certifications: data.certifications?.length > 0 ? data.certifications : [prev.certifications[0]],
          projects: data.projects?.length > 0 ? data.projects : [prev.projects[0]],
          languages: data.languages?.length > 0 ? data.languages : [prev.languages[0]],
          volunteer: data.volunteer?.length > 0 ? data.volunteer : [prev.volunteer[0]],
          publications: data.publications?.length > 0 ? data.publications : [prev.publications[0]]
        }));
        // Set saved data for change tracking
        setSavedFormData({
          ...data,
          email: user.email || data.email || "",
          photo: data.photo || data.profilePicture || "",
          profilePicture: data.profilePicture || data.photo || "",
        });
        console.log("Profile data loaded from profile collection");
      } else {
        // If no profile data exists, try to auto-populate from resume data
        await loadFromResumeData();
      }
    } catch (error) {
      console.error("Error loading profile:", error);
      toast.error("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  // Load and map data from user's resume collection
  const loadFromResumeData = async () => {
    try {
      console.log("Checking for existing resume data...");

      // Query the user's resumes collection to get the latest resume
      const resumesRef = collection(db, `users/${user.uid}/resumes`);
      const resumesQuery = query(resumesRef, orderBy('updatedAt', 'desc'), limit(1));
      const resumeSnapshot = await getDocs(resumesQuery);

      if (!resumeSnapshot.empty) {
        const latestResumeDoc = resumeSnapshot.docs[0];
        const resumeData = latestResumeDoc.data();

        console.log("Found resume data:", resumeData);

        if (resumeData.resumeData) {
          // Map resume data to profile form
          const mappedData = mapResumeDataToProfile(resumeData.resumeData);
          console.log("Mapped data before setting:", mappedData);
          setFormData(prev => {
            const newData = {
              ...prev,
              ...mappedData
            };
            console.log("Final form data:", newData);
            // Set saved data for change tracking
            setSavedFormData({ ...newData });
            return newData;
          });
          console.log("Profile auto-populated from resume data");
          toast.success("Profile auto-populated from your latest resume!");
        } else {
          // Set initial saved data even if empty
          setSavedFormData({ ...formData });
        }
      } else {
        console.log("No resume data found - user will need to set up profile manually");
      }
    } catch (error) {
      console.error("Error loading resume data:", error);
      // Don't show error toast here as this is optional functionality
    }
  };

  // Map resume data structure to profile form structure
  const mapResumeDataToProfile = (resumeData) => {
    const mapped = {};

    console.log('Mapping resume data to profile:', resumeData);

    // Personal Information
    if (resumeData.name) {
      const nameParts = resumeData.name.trim().split(' ');
      mapped.firstName = nameParts[0] || "";
      mapped.lastName = nameParts.slice(1).join(' ') || "";
    }

    // Map direct fields
    if (resumeData.email) mapped.email = resumeData.email;
    if (resumeData.phone) mapped.phone = resumeData.phone;
    if (resumeData.address) mapped.location = resumeData.address;
    if (resumeData.linkedin) mapped.linkedin = resumeData.linkedin;
    if (resumeData.portfolio) mapped.website = resumeData.portfolio;
    if (resumeData.jobTitle) mapped.headline = resumeData.jobTitle;
    if (resumeData.summary) mapped.about = resumeData.summary;
    if (resumeData.photo) mapped.profilePicture = resumeData.photo;

    // Experience mapping
    if (resumeData.experience && Array.isArray(resumeData.experience)) {
      mapped.experiences = resumeData.experience.map(exp => ({
        title: exp.jobTitle || exp.title || "",
        company: exp.company || "",
        location: exp.location || "",
        startDate: formatDate(exp.startDate),
        endDate: exp.endDate && exp.endDate !== "Present" ? formatDate(exp.endDate) : "",
        current: !exp.endDate || exp.endDate === "Present" || exp.endDate === "",
        description: exp.description || ""
      }));
    }

    // Education mapping - handle both API response and Firebase data formats
    if (resumeData.education && Array.isArray(resumeData.education)) {
      console.log('Processing education:', resumeData.education);
      mapped.educations = resumeData.education.map(edu => {
        // Handle both Firebase format and API response format
        let degree = edu.degree || "";
        let school = edu.institution || edu.school || "";
        let location = edu.location || "";
        let startDate = formatDate(edu.startDate);
        let endDate = formatDate(edu.endDate);
        let gpa = edu.gpa || "";
        let description = edu.field || edu.description || "";

        // If degree contains field info, extract it
        if (edu.field && degree && !degree.includes(edu.field)) {
          degree = `${degree} in ${edu.field}`;
        }

        return {
          degree,
          school,
          location,
          startDate,
          endDate,
          gpa,
          description
        };
      });
      console.log('Mapped educations:', mapped.educations);
    }

    // Skills mapping - handle both object and string formats from both sources
    if (resumeData.skills && Array.isArray(resumeData.skills)) {
      console.log('Processing skills:', resumeData.skills);
      mapped.skills = resumeData.skills.map(skill => {
        // Handle object format: { name: "React", proficiency: "Advanced" }
        if (typeof skill === 'object' && skill !== null) {
          return skill.name || skill.skill || String(skill);
        }
        // Handle string format: "React"
        else if (typeof skill === 'string') {
          return skill;
        }
        // Fallback for any other format
        return String(skill);
      }).filter(skill => skill && skill.trim() !== ''); // Filter out empty/null values
      console.log('Mapped skills:', mapped.skills);
    }

    // Certifications mapping
    if (resumeData.certifications && Array.isArray(resumeData.certifications)) {
      mapped.certifications = resumeData.certifications.map(cert => ({
        name: cert.name || cert.title || "",
        issuer: cert.issuer || cert.organization || "",
        issueDate: formatDate(cert.date || cert.issueDate),
        expiryDate: formatDate(cert.expiryDate),
        credentialId: cert.credentialId || "",
        credentialUrl: cert.url || cert.credentialUrl || ""
      }));
    }

    // Languages mapping
    if (resumeData.languages && Array.isArray(resumeData.languages)) {
      mapped.languages = resumeData.languages.map(lang => ({
        language: typeof lang === 'object' ? (lang.name || lang.language) : lang,
        proficiency: typeof lang === 'object' ? (lang.proficiency || "Intermediate") : "Intermediate"
      }));
    }

    // Custom sections (if any projects or volunteer work is embedded)
    if (resumeData.customSections && Array.isArray(resumeData.customSections)) {
      resumeData.customSections.forEach(section => {
        if (section.type === 'project' || section.type === 'projects') {
          // Handle projects from custom sections
          if (!mapped.projects) mapped.projects = [];
          mapped.projects.push({
            title: section.title || section.name || "",
            description: section.description || "",
            technologies: section.technologies || [],
            startDate: formatDate(section.startDate),
            endDate: formatDate(section.endDate),
            projectUrl: section.url || "",
            githubUrl: section.github || ""
          });
        }
      });
    }

    console.log('Mapped resume data result:', mapped);
    return mapped;
  };

  // Helper function to format dates consistently
  const formatDate = (dateStr) => {
    if (!dateStr) return "";

    // Handle various date formats from resume data
    if (typeof dateStr === 'string') {
      // Normalize the string
      const normalized = dateStr.trim();

      // Handle "Present" case
      if (normalized.toLowerCase() === 'present') {
        return "";
      }

      // If it's already in YYYY-MM format, return as is
      if (/^\d{4}-\d{2}$/.test(normalized)) {
        return normalized;
      }

      // Handle "Jan 2021" format
      if (/^[A-Za-z]{3}\s\d{4}$/.test(normalized)) {
        const [month, year] = normalized.split(' ');
        const monthMap = {
          'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04',
          'May': '05', 'Jun': '06', 'Jul': '07', 'Aug': '08',
          'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
        };
        return `${year}-${monthMap[month] || '01'}`;
      }

      // Handle "January 2021" format
      if (/^[A-Za-z]+\s\d{4}$/.test(normalized)) {
        const [month, year] = normalized.split(' ');
        const monthMap = {
          'January': '01', 'February': '02', 'March': '03', 'April': '04',
          'May': '05', 'June': '06', 'July': '07', 'August': '08',
          'September': '09', 'October': '10', 'November': '11', 'December': '12',
          'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04',
          'Jun': '06', 'Jul': '07', 'Aug': '08', 'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
        };
        return `${year}-${monthMap[month] || '01'}`;
      }

      // Handle "01/2021" or "1/2021" format
      if (/^\d{1,2}\/\d{4}$/.test(normalized)) {
        const [month, year] = normalized.split('/');
        return `${year}-${month.padStart(2, '0')}`;
      }

      // Handle "2021/01" format
      if (/^\d{4}\/\d{1,2}$/.test(normalized)) {
        const [year, month] = normalized.split('/');
        return `${year}-${month.padStart(2, '0')}`;
      }

      // Handle "2021-1" format (year-month without padding)
      if (/^\d{4}-\d{1}$/.test(normalized)) {
        const [year, month] = normalized.split('-');
        return `${year}-${month.padStart(2, '0')}`;
      }

      // Handle "2021" format (year only)
      if (/^\d{4}$/.test(normalized)) {
        return `${normalized}-01`;
      }

      // Handle ISO date format "2021-05-15" - extract year and month
      if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
        return normalized.substring(0, 7); // Return YYYY-MM
      }

      // Try to parse as Date and extract year-month
      const date = new Date(normalized);
      if (!isNaN(date.getTime())) {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        return `${year}-${month}`;
      }
    }

    return "";
  };

  // Handle input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle array field changes
  const handleArrayFieldChange = (section, index, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: prev[section].map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  // Add new array item
  const addArrayItem = (section) => {
    const newItem = getEmptyArrayItem(section);
    setFormData(prev => ({
      ...prev,
      [section]: [...prev[section], newItem]
    }));
  };

  // Remove array item
  const removeArrayItem = (section, index) => {
    if (formData[section].length > 1) {
      setFormData(prev => ({
        ...prev,
        [section]: prev[section].filter((_, i) => i !== index)
      }));
    }
  };

  // Get empty array item structure
  const getEmptyArrayItem = (section) => {
    const templates = {
      experiences: { title: "", company: "", location: "", startDate: "", endDate: "", current: false, description: "" },
      educations: { degree: "", school: "", location: "", startDate: "", endDate: "", gpa: "", description: "" },
      certifications: { name: "", issuer: "", issueDate: "", expiryDate: "", credentialId: "", credentialUrl: "" },
      projects: { title: "", description: "", technologies: [], startDate: "", endDate: "", projectUrl: "", githubUrl: "" },
      languages: { language: "", proficiency: "Beginner" },
      volunteer: { organization: "", role: "", startDate: "", endDate: "", description: "" },
      publications: { title: "", publisher: "", publishDate: "", url: "", description: "" }
    };
    return templates[section] || {};
  };

  // Handle profile picture upload
  const handleProfilePictureUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }

      // Check file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }

      setProfilePictureFile(file);

      // Create local preview URL and show immediately
      const previewUrl = URL.createObjectURL(file);
      handleInputChange("profilePicture", previewUrl);
      handleInputChange("photo", previewUrl);

      // Show the image immediately with loading indicator
      setUploadingProfilePicture(true);

      // Show subtle loading toast (less intrusive)
      const loadingToastId = toast.loading("Saving to cloud...", {
        duration: 0 // Don't auto-dismiss
      });

      try {
        // Create FormData to send to our API
        const formData = new FormData();
        formData.append('file', file);
        formData.append('userId', user.uid);

        // Upload using our API endpoint that also updates the profile
        const response = await fetch('/api/upload-profile-picture', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          let errorMessage = 'Upload failed';
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorMessage;
          } catch (jsonError) {
            // If response is not JSON, use status text
            errorMessage = `Upload failed: ${response.status} ${response.statusText}`;
          }
          throw new Error(errorMessage);
        }

        let result;
        try {
          result = await response.json();
        } catch (jsonError) {
          throw new Error('Invalid response from server. Please try again.');
        }

        // Clean up the preview URL since we now have the permanent URL
        if (formData.profilePicture && formData.profilePicture.startsWith('blob:')) {
          URL.revokeObjectURL(formData.profilePicture);
        }

        // Update with permanent Firebase Storage URL
        handleInputChange("profilePicture", result.url);
        handleInputChange("photo", result.url);

        // Dismiss loading toast and show subtle success
        toast.dismiss(loadingToastId);
        toast.success("Saved to cloud!", { duration: 2000 });
      } catch (error) {
        console.error("Error uploading profile picture:", error);

        // Revert to previous image if upload failed
        const previousPicture = formData.profilePicture;
        if (previousPicture && previousPicture.startsWith('blob:')) {
          URL.revokeObjectURL(previousPicture);
          handleInputChange("profilePicture", "");
          handleInputChange("photo", "");
        }

        // Dismiss loading toast and show error
        toast.dismiss(loadingToastId);
        toast.error(`Failed to save: ${error.message}`);
      } finally {
        setUploadingProfilePicture(false);
      }
    }
  };

  // Handle skills input
  const handleSkillsChange = (value) => {
    const skillsArray = value.split(",").map(skill => skill.trim()).filter(skill => skill);
    handleInputChange("skills", skillsArray);
  };

  // Handle project technologies input
  const handleTechnologiesChange = (index, value) => {
    const techArray = value.split(",").map(tech => tech.trim()).filter(tech => tech);
    handleArrayFieldChange("projects", index, "technologies", techArray);
  };

  // Resume import functionality
  const handleResumeImport = async () => {
    if (!importFile) {
      toast.error("Please select a resume file");
      return;
    }

    try {
      setIsImporting(true);
      setImportProgress(10);

      const formData = new FormData();
      formData.append("file", importFile);
      formData.append("userId", user.uid);

      setImportProgress(30);

      const response = await fetch("/api/gemini-parse-resume", {
        method: "POST",
        body: formData,
      });

      setImportProgress(60);

      if (!response.ok) {
        throw new Error("Failed to parse resume");
      }

      const parsedData = await response.json();
      setImportProgress(80);

      // Map parsed data to form structure
      const mappedData = mapParsedDataToForm(parsedData);

      // Update form data
      setFormData(prev => ({
        ...prev,
        ...mappedData
      }));

      setImportProgress(100);
      toast.success("Resume imported successfully!");
      setShowImportModal(false);
      setImportFile(null);

    } catch (error) {
      console.error("Error importing resume:", error);
      toast.error("Failed to import resume. Please try again.");
    } finally {
      setIsImporting(false);
      setImportProgress(0);
    }
  };

  // Map parsed resume data to form structure
  const mapParsedDataToForm = (parsedData) => {
    const mapped = {};

    console.log('Mapping parsed data:', parsedData);

    // Handle the top-level fields from the API response
    if (parsedData.name) {
      // Split name into first and last name
      const nameParts = parsedData.name.trim().split(' ');
      mapped.firstName = nameParts[0] || "";
      mapped.lastName = nameParts.slice(1).join(' ') || "";
    }

    // Map direct fields
    if (parsedData.email) mapped.email = parsedData.email;
    if (parsedData.phone) mapped.phone = parsedData.phone;
    if (parsedData.address) mapped.location = parsedData.address;
    if (parsedData.linkedin) mapped.linkedin = parsedData.linkedin;
    if (parsedData.portfolio) mapped.website = parsedData.portfolio;
    if (parsedData.jobTitle) mapped.headline = parsedData.jobTitle;
    if (parsedData.summary) mapped.about = parsedData.summary;

    // Handle legacy personalInfo structure (fallback)
    if (parsedData.personalInfo) {
      mapped.firstName = mapped.firstName || parsedData.personalInfo.firstName || "";
      mapped.lastName = mapped.lastName || parsedData.personalInfo.lastName || "";
      mapped.email = mapped.email || parsedData.personalInfo.email || "";
      mapped.phone = mapped.phone || parsedData.personalInfo.phone || "";
      mapped.location = mapped.location || parsedData.personalInfo.location || "";
      mapped.linkedin = mapped.linkedin || parsedData.personalInfo.linkedin || "";
      mapped.github = mapped.github || parsedData.personalInfo.github || "";
      mapped.website = mapped.website || parsedData.personalInfo.website || "";
    }

    // Experience mapping
    if (parsedData.experience && Array.isArray(parsedData.experience)) {
      mapped.experiences = parsedData.experience.map(exp => ({
        title: exp.jobTitle || exp.title || exp.position || "",
        company: exp.company || "",
        location: exp.location || "",
        startDate: exp.startDate || "",
        endDate: exp.endDate === "Present" ? "" : (exp.endDate || ""),
        current: exp.endDate === "Present" || exp.current || false,
        description: exp.description || ""
      }));
    }

    // Education mapping - handle both formats
    if (parsedData.education && Array.isArray(parsedData.education)) {
      mapped.educations = parsedData.education.map(edu => {
        let degree = edu.degree || "";
        let school = edu.institution || edu.school || "";
        let location = edu.location || "";
        let startDate = edu.startDate || "";
        let endDate = edu.endDate || "";
        let gpa = edu.gpa || "";
        let description = edu.description || edu.field || "";

        // If degree contains field info, extract it properly
        if (edu.field && degree && !degree.includes(edu.field)) {
          degree = `${degree} in ${edu.field}`;
        }

        return {
          degree,
          school,
          location,
          startDate,
          endDate,
          gpa,
          description
        };
      });
    }

    // Skills mapping - handle both array of objects and array of strings
    if (parsedData.skills && Array.isArray(parsedData.skills)) {
      mapped.skills = parsedData.skills.map(skill => {
        // Handle object format: { name: "React", proficiency: "Advanced" }
        if (typeof skill === 'object' && skill !== null) {
          return skill.name || skill.skill || String(skill);
        }
        // Handle string format: "React"
        else if (typeof skill === 'string') {
          return skill;
        }
        // Fallback
        return String(skill);
      }).filter(skill => skill && skill.trim() !== ''); // Filter out empty values
    }

    // Certifications mapping
    if (parsedData.certifications && Array.isArray(parsedData.certifications)) {
      mapped.certifications = parsedData.certifications.map(cert => ({
        name: cert.name || cert.title || "",
        issuer: cert.issuer || cert.organization || "",
        issueDate: cert.date || cert.issueDate || "",
        expiryDate: cert.expiryDate || "",
        credentialId: cert.credentialId || "",
        credentialUrl: cert.url || cert.credentialUrl || ""
      }));
    }

    // Projects mapping (if available)
    if (parsedData.projects && Array.isArray(parsedData.projects)) {
      mapped.projects = parsedData.projects.map(proj => ({
        title: proj.title || proj.name || "",
        description: proj.description || "",
        technologies: Array.isArray(proj.technologies) ? proj.technologies :
          Array.isArray(proj.skills) ? proj.skills : [],
        startDate: proj.startDate || "",
        endDate: proj.endDate || "",
        projectUrl: proj.url || proj.link || proj.projectUrl || "",
        githubUrl: proj.github || proj.githubUrl || ""
      }));
    }

    // Languages mapping
    if (parsedData.languages && Array.isArray(parsedData.languages)) {
      mapped.languages = parsedData.languages.map(lang => ({
        language: lang.language || lang.name || lang,
        proficiency: lang.proficiency || lang.level || "Intermediate"
      }));
    }

    // Volunteer work mapping (if available)
    if (parsedData.volunteer && Array.isArray(parsedData.volunteer)) {
      mapped.volunteer = parsedData.volunteer.map(vol => ({
        organization: vol.organization || "",
        role: vol.role || vol.position || "",
        startDate: formatDate(vol.startDate),
        endDate: formatDate(vol.endDate),
        description: vol.description || ""
      }));
    }

    // Publications mapping (if available)
    if (parsedData.publications && Array.isArray(parsedData.publications)) {
      mapped.publications = parsedData.publications.map(pub => ({
        title: pub.title || "",
        publisher: pub.publisher || pub.journal || "",
        publishDate: pub.date || pub.publishDate || "",
        url: pub.url || "",
        description: pub.description || ""
      }));
    }

    // Handle custom sections (awards, etc.) - could be mapped to additional fields
    if (parsedData.customSections && Array.isArray(parsedData.customSections)) {
      // For now, we could add awards to the about section or create a separate handling
      const awards = parsedData.customSections.find(section => section.type === 'award');
      if (awards && awards.description) {
        // Append awards to about section if it exists
        if (mapped.about) {
          mapped.about += '\n\nAwards & Achievements:\n' + awards.description;
        } else {
          mapped.about = 'Awards & Achievements:\n' + awards.description;
        }
      }
    }

    console.log('Mapped data result:', mapped);
    return mapped;
  };

  // Save profile data
  const saveProfile = async (silent = false) => {
    try {
      setSaving(true);

      // Validate required fields
      if (!formData.firstName || !formData.lastName) {
        if (!silent) {
          toast.error("First name and last name are required");
          setActiveSection("personal");
        }
        return false;
      }

      const profileDocRef = doc(db, `users/${user.uid}/profile`, 'userProfile');
      await setDoc(profileDocRef, {
        ...formData,
        updatedAt: new Date().toISOString()
      });

      // Update saved data for change tracking
      setSavedFormData({ ...formData });
      setHasUnsavedChanges(false);

      if (!silent) {
        toast.success("Profile saved successfully!");
      }
      return true;
    } catch (error) {
      console.error("Error saving profile:", error);
      if (!silent) {
        toast.error("Failed to save profile");
      }
      return false;
    } finally {
      setSaving(false);
    }
  };

  // Handle preview with auto-save
  const handlePreview = async () => {
    if (hasUnsavedChanges) {
      // Try to auto-save silently
      const saved = await saveProfile(true);
      if (saved) {
        toast.success("Changes saved automatically!", { duration: 2000 });
        router.push(`/profile/`);
      } else {
        // If save failed, show warning
        setPendingPreviewAction(() => () => router.push(`/profile/`));
        setShowUnsavedWarning(true);
      }
    } else {
      router.push(`/profile/`);
    }
  };

  // Handle OTP verification
  const sendOTP = async (type) => {
    setOTPType(type);
    setShowOTPModal(true);

    try {
      const response = await fetch("/api/send-verification-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          value: type === "phone" ? formData.phone : formData.email,
          purpose: "profile_verification"
        })
      });

      if (response.ok) {
        toast.success(`Verification code sent to your ${type}`);
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || `Failed to send verification code to ${type}`);
      }
    } catch (error) {
      console.error("Error sending verification code:", error);
      toast.error("Failed to send verification code");
    }
  };

  const verifyOTP = async () => {
    try {
      const response = await fetch("/api/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: otpType,
          value: otpType === "phone" ? formData.phone : formData.email,
          code: otp
        })
      });

      if (response.ok) {
        const result = await response.json();
        handleInputChange(
          otpType === "phone" ? "phoneVerified" : "emailVerified",
          true
        );
        toast.success(`${otpType === "phone" ? "Phone" : "Email"} verified successfully!`);
        setShowOTPModal(false);
        setOTP("");
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Invalid verification code");
      }
    } catch (error) {
      console.error("Error verifying code:", error);
      toast.error("Failed to verify code");
    }
  };

  if (!isMounted) {
    return <EditProfileSkeleton />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#0B1F3B] border-t-transparent" />
          <p className="text-gray-600 text-sm">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <style jsx>{`
        input[type="month"] {
          max-width: 100%;
          min-width: 0;
        }
        @media (max-width: 640px) {
          input[type="month"] {
            font-size: 14px;
            padding: 8px 12px;
          }
        }
      `}</style>


      {/* Mobile-First Header */}
      <div className="bg-white/90 backdrop-blur-lg shadow-lg border-b border-[#0B1F3B]/10">
        <div className=" mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-4 sm:py-6 gap-4">
            <div className="text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-[#0B1F3B] to-[#132D54] bg-clip-text text-transparent">
                Edit Profile
              </h1>
              <p className="text-gray-600 text-sm sm:text-base mt-1">Create your professional presence</p>
            </div>

            {/* Mobile Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
              <button
                onClick={() => setShowImportModal(true)}
                className="flex items-center justify-center gap-2 px-4 py-2.5 text-[#0B1F3B] hover:text-[#132D54] border-2 border-[#0B1F3B]/20 rounded-xl hover:bg-[#0B1F3B]/5 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] font-medium"
              >
                <Upload size={18} />
                <span className="hidden sm:inline">Import Resume</span>
                <span className="sm:hidden">Import</span>
              </button>
              <button
                onClick={handlePreview}
                className={`flex items-center justify-center gap-2 px-4 py-2.5 text-gray-600 hover:text-gray-900 border-2 rounded-xl hover:bg-gray-50 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] font-medium ${hasUnsavedChanges ? 'border-yellow-300 bg-yellow-50' : 'border-gray-200'
                  }`}
                title={hasUnsavedChanges ? "Unsaved changes will be saved automatically" : ""}
              >
                <Eye size={18} />
                <span className="hidden sm:inline">Preview</span>
                <span className="sm:hidden">View</span>
                {hasUnsavedChanges && (
                  <span className="ml-1 w-2 h-2 bg-yellow-500 rounded-full animate-pulse" title="Unsaved changes"></span>
                )}
              </button>
              <button
                onClick={saveProfile}
                disabled={saving}
                className="flex items-center justify-center gap-2 px-6 py-2.5 bg-[#0B1F3B] text-white rounded-xl hover:bg-[#132D54] transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl font-medium"
              >
                <Save size={18} />
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-8">
          {/* Mobile Tab Navigation */}
          <div className="lg:hidden">
            <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-lg border border-[#0B1F3B]/10 p-3 mb-6">
              <div className="flex overflow-x-auto scrollbar-hide gap-1">
                {sections.map(section => {
                  const Icon = section.icon;
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-xl whitespace-nowrap transition-all duration-200 ${activeSection === section.id
                        ? "bg-[#0B1F3B] text-white shadow-lg"
                        : "text-gray-600 hover:bg-[#0B1F3B]/5 hover:text-[#0B1F3B]"
                        }`}
                    >
                      <Icon size={16} />
                      <span className="hidden xs:inline">{section.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Desktop Sidebar Navigation */}
          <div className="hidden lg:block w-80 flex-shrink-0">
            <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-lg border border-[#0B1F3B]/10 p-6 sticky top-8">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Profile Sections</h3>
                <div className="h-1 w-12 bg-gradient-to-r from-[#0B1F3B] to-[#00C4B3] rounded-full"></div>
              </div>
              <nav className="space-y-2">
                {sections.map(section => {
                  const Icon = section.icon;
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left rounded-xl transition-all duration-200 group ${activeSection === section.id
                        ? "bg-gradient-to-r from-[#0B1F3B] to-[#132D54] text-white shadow-lg transform scale-[1.02]"
                        : "text-gray-600 hover:bg-[#0B1F3B]/5 hover:text-[#0B1F3B] hover:translate-x-1"
                        }`}
                    >
                      <Icon size={20} className={`${activeSection === section.id ? 'text-white' : 'text-[#0B1F3B]/70 group-hover:text-[#0B1F3B]'}`} />
                      <span className="font-medium">{section.label}</span>
                      {activeSection === section.id && (
                        <ChevronRight size={16} className="ml-auto text-white" />
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-lg border border-[#0B1F3B]/10 p-4 sm:p-6 lg:p-8">
              {/* Personal Information Section */}
              {activeSection === "personal" && (
                <div className="space-y-6 sm:space-y-8">
                  <div className="border-b border-[#0B1F3B]/10 pb-4 sm:pb-6">
                    <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-[#0B1F3B] to-[#132D54] bg-clip-text text-transparent mb-2">
                      Personal Information
                    </h2>
                    <p className="text-gray-600 text-sm sm:text-base mt-1">Let's start with the basics about you</p>
                  </div>

                  {/* Profile Picture */}
                  <div className="flex flex-col sm:flex-row items-center gap-6 p-4 sm:p-6 bg-gradient-to-r from-[#0B1F3B]/5 to-[#00C4B3]/5 rounded-2xl border border-[#0B1F3B]/10">
                    <div className="relative group">
                      <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden bg-gradient-to-br from-[#0B1F3B]/20 to-[#00C4B3]/20 border-4 border-white shadow-xl group-hover:shadow-2xl transition-all duration-300 relative">
                        {formData.profilePicture ? (
                          <img
                            src={formData.profilePicture}
                            alt="Profile"
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#0B1F3B]/10 to-[#00C4B3]/10">
                            <User size={32} className="text-[#0B1F3B]" />
                          </div>
                        )}

                        {/* Upload Loading Overlay - Subtle since image is already showing */}
                        {uploadingProfilePicture && (
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent flex items-end justify-center pb-2 z-10">
                            <div className="flex items-center gap-1 bg-black/60 px-2 py-1 rounded-full">
                              <div className="animate-spin rounded-full h-3 w-3 border border-white border-t-transparent"></div>
                              <span className="text-white text-xs font-medium">Saving...</span>
                            </div>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => !uploadingProfilePicture && fileInputRef.current?.click()}
                        disabled={uploadingProfilePicture}
                        className={`absolute -bottom-2 -right-2 p-2.5 rounded-full transition-all duration-200 shadow-lg ${uploadingProfilePicture
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-[#0B1F3B] text-white hover:bg-[#132D54] hover:shadow-xl hover:scale-110 active:scale-95'
                          }`}
                      >
                        <Camera size={18} />
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleProfilePictureUpload}
                        className="hidden"
                      />
                    </div>
                    <div className="text-center sm:text-left">
                      <h3 className="font-semibold text-gray-900 text-lg mb-1">Profile Picture</h3>
                      <p className="text-sm text-gray-600 mb-3">Upload a professional photo to make a great first impression</p>

                      {uploadingProfilePicture && (
                        <div className="bg-[#0B1F3B]/5 border border-[#0B1F3B]/15 rounded-lg p-3 mb-3">
                          <div className="flex items-center gap-3">
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-[#0B1F3B] border-t-transparent"></div>
                            <div className="flex-1">
                              <p className="text-[#0B1F3B] font-medium text-sm">Saving to cloud storage...</p>
                              <p className="text-[#0B1F3B] text-xs">Your image is already visible, we're just saving it securely</p>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <button
                          onClick={() => !uploadingProfilePicture && fileInputRef.current?.click()}
                          disabled={uploadingProfilePicture}
                          className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border-2 transition-all duration-200 ${uploadingProfilePicture
                            ? 'text-gray-400 bg-gray-50 border-gray-200 cursor-not-allowed'
                            : 'text-[#0B1F3B] hover:text-[#132D54] bg-white border-[#0B1F3B]/15 hover:border-[#0B1F3B]/30 hover:scale-105 active:scale-95'
                            }`}
                        >
                          <Upload size={16} />
                          {uploadingProfilePicture ? 'Uploading...' : 'Choose File'}
                        </button>

                        {/* Test button to preview loading state */}
                        {process.env.NODE_ENV === 'development' && (
                          <button
                            onClick={() => setUploadingProfilePicture(!uploadingProfilePicture)}
                            className="px-3 py-2 text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition-all duration-200"
                          >
                            {uploadingProfilePicture ? 'Stop Test' : 'Test Loader'}
                          </button>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-2">Max 5MB • JPG, PNG, GIF</p>
                    </div>
                  </div>

                  {/* Name Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        First Name *
                      </label>
                      <input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange("firstName", e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#00C4B3] focus:border-[#00C4B3] transition-all duration-200 bg-white/50 backdrop-blur-sm hover:bg-white focus:bg-white"
                        placeholder="Enter your first name"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange("lastName", e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#00C4B3] focus:border-[#00C4B3] transition-all duration-200 bg-white/50 backdrop-blur-sm hover:bg-white focus:bg-white"
                        placeholder="Enter your last name"
                        required
                      />
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="space-y-4 sm:space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Mail className="text-[#0B1F3B]" size={20} />
                      Contact Information
                    </h3>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                          Email Address
                        </label>
                        <div className="flex flex-col sm:flex-row">
                          <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleInputChange("email", e.target.value)}
                            className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl sm:rounded-r-none focus:ring-2 focus:ring-[#00C4B3] focus:border-[#00C4B3] transition-all duration-200 bg-white/50 backdrop-blur-sm hover:bg-white focus:bg-white"
                            placeholder="your.email@example.com"
                            disabled={user?.email}
                          />
                          <button
                            onClick={() => sendOTP("email")}
                            disabled={formData.emailVerified || !formData.email}
                            className={`px-4 py-3 rounded-xl sm:rounded-l-none border-2 sm:border-l-0 border-gray-200 text-sm font-semibold transition-all duration-200 mt-2 sm:mt-0 ${formData.emailVerified
                              ? "bg-gradient-to-r from-[#0B1F3B] to-[#00C4B3] text-white shadow-lg"
                              : "bg-white/70 text-gray-700 hover:bg-[#0B1F3B]/5 hover:text-[#0B1F3B] hover:border-[#0B1F3B]/20"
                              }`}
                          >
                            {formData.emailVerified ? (
                              <>
                                <CheckCircle2 size={16} className="inline mr-1" />
                                Verified
                              </>
                            ) : (
                              "Verify"
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                          Phone Number
                        </label>
                        <div className="flex flex-col sm:flex-row">
                          <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => handleInputChange("phone", e.target.value)}
                            className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl sm:rounded-r-none focus:ring-2 focus:ring-[#00C4B3] focus:border-[#00C4B3] transition-all duration-200 bg-white/50 backdrop-blur-sm hover:bg-white focus:bg-white"
                            placeholder="+1 (555) 000-0000"
                          />
                          <button
                            onClick={() => sendOTP("phone")}
                            disabled={formData.phoneVerified || !formData.phone}
                            className={`px-4 py-3 rounded-xl sm:rounded-l-none border-2 sm:border-l-0 border-gray-200 text-sm font-semibold transition-all duration-200 mt-2 sm:mt-0 ${formData.phoneVerified
                              ? "bg-gradient-to-r from-[#0B1F3B] to-[#00C4B3] text-white shadow-lg"
                              : "bg-white/70 text-gray-700 hover:bg-[#0B1F3B]/5 hover:text-[#0B1F3B] hover:border-[#0B1F3B]/20"
                              }`}
                          >
                            {formData.phoneVerified ? (
                              <>
                                <CheckCircle2 size={16} className="inline mr-1" />
                                Verified
                              </>
                            ) : (
                              "Verify"
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Professional Headline */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                      <Briefcase className="text-[#0B1F3B]" size={18} />
                      Professional Headline
                    </label>
                    <input
                      type="text"
                      value={formData.headline}
                      onChange={(e) => handleInputChange("headline", e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#00C4B3] focus:border-[#00C4B3] transition-all duration-200 bg-white/50 backdrop-blur-sm hover:bg-white focus:bg-white"
                      placeholder="e.g. Senior Software Engineer passionate about AI and Machine Learning"
                    />
                  </div>

                  {/* About */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                      <User className="text-[#0B1F3B]" size={18} />
                      About Me
                    </label>
                    <textarea
                      value={formData.about}
                      onChange={(e) => handleInputChange("about", e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#00C4B3] focus:border-[#00C4B3] transition-all duration-200 bg-white/50 backdrop-blur-sm hover:bg-white focus:bg-white resize-none"
                      placeholder="Share your story, passion, and what drives you professionally..."
                    />
                    <p className="text-xs text-gray-500">Tell potential employers what makes you unique</p>
                  </div>

                  {/* Location */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                      <MapPin className="text-[#0B1F3B]" size={18} />
                      Location
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => handleInputChange("location", e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#00C4B3] focus:border-[#00C4B3] transition-all duration-200 bg-white/50 backdrop-blur-sm hover:bg-white focus:bg-white"
                      placeholder="San Francisco, CA"
                    />
                  </div>

                  {/* Social Links */}
                  <div className="space-y-4 sm:space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Link className="text-[#0B1F3B]" size={20} />
                      Social Links
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                          <Globe className="text-[#0B1F3B]/70" size={16} />
                          Website
                        </label>
                        <input
                          type="url"
                          value={formData.website}
                          onChange={(e) => handleInputChange("website", e.target.value)}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#00C4B3] focus:border-[#00C4B3] transition-all duration-200 bg-white/50 backdrop-blur-sm hover:bg-white focus:bg-white"
                          placeholder="https://yourwebsite.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                          <svg className="w-4 h-4 text-[#0B1F3B]" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z" />
                          </svg>
                          LinkedIn
                        </label>
                        <input
                          type="url"
                          value={formData.linkedin}
                          onChange={(e) => handleInputChange("linkedin", e.target.value)}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#00C4B3] focus:border-[#00C4B3] transition-all duration-200 bg-white/50 backdrop-blur-sm hover:bg-white focus:bg-white"
                          placeholder="https://linkedin.com/in/username"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                          <svg className="w-4 h-4 text-gray-900" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                          </svg>
                          GitHub
                        </label>
                        <input
                          type="url"
                          value={formData.github}
                          onChange={(e) => handleInputChange("github", e.target.value)}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#00C4B3] focus:border-[#00C4B3] transition-all duration-200 bg-white/50 backdrop-blur-sm hover:bg-white focus:bg-white"
                          placeholder="https://github.com/username"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                          <svg className="w-4 h-4 text-[#0B1F3B]/60" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z" />
                          </svg>
                          Twitter
                        </label>
                        <input
                          type="url"
                          value={formData.twitter}
                          onChange={(e) => handleInputChange("twitter", e.target.value)}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#00C4B3] focus:border-[#00C4B3] transition-all duration-200 bg-white/50 backdrop-blur-sm hover:bg-white focus:bg-white"
                          placeholder="https://twitter.com/username"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Profile Settings */}
                  <div className="space-y-4 sm:space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Settings className="text-[#0B1F3B]" size={20} />
                      Profile Settings
                    </h3>
                    <div className="space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 sm:p-6 border-2 border-gray-200 rounded-2xl bg-white/50 backdrop-blur-sm hover:bg-white transition-all duration-200">
                        <div className="mb-3 sm:mb-0">
                          <h4 className="font-semibold text-gray-900 mb-1">Public Profile</h4>
                          <p className="text-sm text-gray-600">Allow others to discover and view your profile</p>
                        </div>
                        <div className="flex items-center">
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.publicProfile}
                              onChange={(e) => handleInputChange("publicProfile", e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#00C4B3]/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0B1F3B]"></div>
                            <span className="ml-3 text-sm font-medium text-gray-900">
                              {formData.publicProfile ? 'Enabled' : 'Disabled'}
                            </span>
                          </label>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 sm:p-6 border-2 border-gray-200 rounded-2xl bg-white/50 backdrop-blur-sm hover:bg-white transition-all duration-200">
                        <div className="mb-3 sm:mb-0">
                          <h4 className="font-semibold text-gray-900 mb-1">Job Matching</h4>
                          <p className="text-sm text-gray-600">Allow recruiters to find you for relevant positions</p>
                        </div>
                        <div className="flex items-center">
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.allowMatching}
                              onChange={(e) => handleInputChange("allowMatching", e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#00C4B3]/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0B1F3B]"></div>
                            <span className="ml-3 text-sm font-medium text-gray-900">
                              {formData.allowMatching ? 'Enabled' : 'Disabled'}
                            </span>
                          </label>
                        </div>
                      </div>

                      {formData.publicProfile && (
                        <div className="p-4 sm:p-6 bg-gradient-to-r from-[#0B1F3B]/5 to-[#00C4B3]/5 border-2 border-[#0B1F3B]/15 rounded-2xl animate-in slide-in-from-top duration-300">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                              <h4 className="font-semibold text-[#0B1F3B] mb-1 flex items-center gap-2">
                                <Share2 size={18} />
                                Share Your Profile
                              </h4>
                              <p className="text-sm text-[#0B1F3B]/80">Let others discover your professional profile</p>
                            </div>
                            <button
                              onClick={() => setShowShareModal(true)}
                              className="flex items-center justify-center gap-2 px-6 py-3 bg-[#0B1F3B] text-white rounded-xl hover:bg-[#132D54] transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 font-medium"
                            >
                              <Share2 size={18} />
                              Share Profile
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Experience Section */}
              {activeSection === "experience" && (
                <div className="space-y-6">
                  <div className="border-b pb-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">Work Experience</h2>
                        <p className="text-gray-600">Add your professional experience</p>
                      </div>
                      <button
                        onClick={() => addArrayItem("experiences")}
                        className="flex items-center gap-2 px-4 py-2 bg-[#0B1F3B] text-white rounded-lg hover:bg-[#132D54] transition-colors"
                      >
                        <PlusCircle size={16} />
                        Add Experience
                      </button>
                    </div>
                  </div>

                  {formData.experiences.map((experience, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-6 space-y-4">
                      <div className="flex justify-between items-start">
                        <h3 className="text-lg font-medium text-gray-900">
                          Experience {index + 1}
                        </h3>
                        {formData.experiences.length > 1 && (
                          <button
                            onClick={() => removeArrayItem("experiences", index)}
                            className="text-red-600 hover:text-red-700 p-1"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Job Title
                          </label>
                          <input
                            type="text"
                            value={experience.title}
                            onChange={(e) => handleArrayFieldChange("experiences", index, "title", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00C4B3] focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Company
                          </label>
                          <input
                            type="text"
                            value={experience.company}
                            onChange={(e) => handleArrayFieldChange("experiences", index, "company", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00C4B3] focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Location
                          </label>
                          <input
                            type="text"
                            value={experience.location}
                            onChange={(e) => handleArrayFieldChange("experiences", index, "location", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00C4B3] focus:border-transparent"
                          />
                        </div>
                      </div>

                      {/* Date fields in responsive grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Start Date
                          </label>
                          <input
                            type="month"
                            value={experience.startDate}
                            onChange={(e) => handleArrayFieldChange("experiences", index, "startDate", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00C4B3] focus:border-transparent text-sm min-w-0"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            End Date
                          </label>
                          <input
                            type="month"
                            value={experience.endDate}
                            onChange={(e) => handleArrayFieldChange("experiences", index, "endDate", e.target.value)}
                            disabled={experience.current}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00C4B3] focus:border-transparent disabled:bg-gray-100 text-sm min-w-0"
                          />
                        </div>
                      </div>

                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id={`current-${index}`}
                          checked={experience.current}
                          onChange={(e) => {
                            handleArrayFieldChange("experiences", index, "current", e.target.checked);
                            if (e.target.checked) {
                              handleArrayFieldChange("experiences", index, "endDate", "");
                            }
                          }}
                          className="h-4 w-4 text-[#0B1F3B] focus:ring-[#00C4B3] border-gray-300 rounded"
                        />
                        <label htmlFor={`current-${index}`} className="ml-2 block text-sm text-gray-900">
                          I currently work here
                        </label>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Description
                        </label>
                        <textarea
                          value={experience.description}
                          onChange={(e) => handleArrayFieldChange("experiences", index, "description", e.target.value)}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00C4B3] focus:border-transparent"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Education Section */}
              {activeSection === "education" && (
                <div className="space-y-6">
                  <div className="border-b pb-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">Education</h2>
                        <p className="text-gray-600">Add your educational background</p>
                      </div>
                      <button
                        onClick={() => addArrayItem("educations")}
                        className="flex items-center gap-2 px-4 py-2 bg-[#0B1F3B] text-white rounded-lg hover:bg-[#132D54] transition-colors"
                      >
                        <PlusCircle size={16} />
                        Add Education
                      </button>
                    </div>
                  </div>

                  {formData.educations.map((education, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-6 space-y-4">
                      <div className="flex justify-between items-start">
                        <h3 className="text-lg font-medium text-gray-900">
                          Education {index + 1}
                        </h3>
                        {formData.educations.length > 1 && (
                          <button
                            onClick={() => removeArrayItem("educations", index)}
                            className="text-red-600 hover:text-red-700 p-1"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Degree
                          </label>
                          <input
                            type="text"
                            value={education.degree}
                            onChange={(e) => handleArrayFieldChange("educations", index, "degree", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00C4B3] focus:border-transparent"
                            placeholder="e.g. Bachelor of Science"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            School/Institution
                          </label>
                          <input
                            type="text"
                            value={education.school}
                            onChange={(e) => handleArrayFieldChange("educations", index, "school", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00C4B3] focus:border-transparent"
                            placeholder="University/School name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Location
                          </label>
                          <input
                            type="text"
                            value={education.location}
                            onChange={(e) => handleArrayFieldChange("educations", index, "location", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00C4B3] focus:border-transparent"
                            placeholder="City, State"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            GPA (Optional)
                          </label>
                          <input
                            type="text"
                            value={education.gpa}
                            onChange={(e) => handleArrayFieldChange("educations", index, "gpa", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00C4B3] focus:border-transparent"
                            placeholder="3.8/4.0"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Start Date
                          </label>
                          <input
                            type="month"
                            value={education.startDate}
                            onChange={(e) => handleArrayFieldChange("educations", index, "startDate", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00C4B3] focus:border-transparent text-sm min-w-0"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            End Date
                          </label>
                          <input
                            type="month"
                            value={education.endDate}
                            onChange={(e) => handleArrayFieldChange("educations", index, "endDate", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00C4B3] focus:border-transparent text-sm min-w-0"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Field of Study / Description
                        </label>
                        <textarea
                          value={education.description}
                          onChange={(e) => handleArrayFieldChange("educations", index, "description", e.target.value)}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00C4B3] focus:border-transparent"
                          placeholder="Field of study, relevant coursework, achievements..."
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Skills Section */}
              {activeSection === "skills" && (
                <div className="space-y-6">
                  <div className="border-b pb-4">
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Skills</h2>
                    <p className="text-gray-600">Add your technical and soft skills</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Skills (comma-separated)
                      </label>
                      <textarea
                        value={formData.skills?.join(", ") || ""}
                        onChange={(e) => handleSkillsChange(e.target.value)}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00C4B3] focus:border-transparent"
                        placeholder="React, JavaScript, Python, Project Management, Leadership..."
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Separate each skill with a comma. Include both technical and soft skills.
                      </p>
                    </div>

                    {formData.skills && formData.skills.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-3">Your Skills:</p>
                        <div className="flex flex-wrap gap-2">
                          {formData.skills.map((skill, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center gap-1 px-3 py-1 bg-[#0B1F3B]/10 text-[#0B1F3B] text-sm rounded-full border border-[#0B1F3B]/15"
                            >
                              {skill}
                              <button
                                onClick={() => {
                                  const newSkills = formData.skills.filter((_, i) => i !== index);
                                  handleInputChange("skills", newSkills);
                                }}
                                className="ml-1 text-[#0B1F3B] hover:text-[#0B1F3B]"
                              >
                                <X size={12} />
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Certifications Section */}
              {activeSection === "certifications" && (
                <div className="space-y-6">
                  <div className="border-b pb-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">Certifications</h2>
                        <p className="text-gray-600">Add your professional certifications</p>
                      </div>
                      <button
                        onClick={() => addArrayItem("certifications")}
                        className="flex items-center gap-2 px-4 py-2 bg-[#0B1F3B] text-white rounded-lg hover:bg-[#132D54] transition-colors"
                      >
                        <PlusCircle size={16} />
                        Add Certification
                      </button>
                    </div>
                  </div>

                  {formData.certifications.map((certification, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-6 space-y-4">
                      <div className="flex justify-between items-start">
                        <h3 className="text-lg font-medium text-gray-900">
                          Certification {index + 1}
                        </h3>
                        {formData.certifications.length > 1 && (
                          <button
                            onClick={() => removeArrayItem("certifications", index)}
                            className="text-red-600 hover:text-red-700 p-1"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Certification Name
                          </label>
                          <input
                            type="text"
                            value={certification.name}
                            onChange={(e) => handleArrayFieldChange("certifications", index, "name", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00C4B3] focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Issuing Organization
                          </label>
                          <input
                            type="text"
                            value={certification.issuer}
                            onChange={(e) => handleArrayFieldChange("certifications", index, "issuer", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00C4B3] focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Issue Date
                          </label>
                          <input
                            type="month"
                            value={certification.issueDate}
                            onChange={(e) => handleArrayFieldChange("certifications", index, "issueDate", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00C4B3] focus:border-transparent text-sm min-w-0"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Expiry Date (Optional)
                          </label>
                          <input
                            type="month"
                            value={certification.expiryDate}
                            onChange={(e) => handleArrayFieldChange("certifications", index, "expiryDate", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00C4B3] focus:border-transparent text-sm min-w-0"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Credential ID (Optional)
                          </label>
                          <input
                            type="text"
                            value={certification.credentialId}
                            onChange={(e) => handleArrayFieldChange("certifications", index, "credentialId", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00C4B3] focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Credential URL (Optional)
                          </label>
                          <input
                            type="url"
                            value={certification.credentialUrl}
                            onChange={(e) => handleArrayFieldChange("certifications", index, "credentialUrl", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00C4B3] focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Projects Section */}
              {activeSection === "projects" && (
                <div className="space-y-6">
                  <div className="border-b pb-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">Projects</h2>
                        <p className="text-gray-600">Showcase your work and projects</p>
                      </div>
                      <button
                        onClick={() => addArrayItem("projects")}
                        className="flex items-center gap-2 px-4 py-2 bg-[#0B1F3B] text-white rounded-lg hover:bg-[#132D54] transition-colors"
                      >
                        <PlusCircle size={16} />
                        Add Project
                      </button>
                    </div>
                  </div>

                  {formData.projects.map((project, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-6 space-y-4">
                      <div className="flex justify-between items-start">
                        <h3 className="text-lg font-medium text-gray-900">
                          Project {index + 1}
                        </h3>
                        {formData.projects.length > 1 && (
                          <button
                            onClick={() => removeArrayItem("projects", index)}
                            className="text-red-600 hover:text-red-700 p-1"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Project Title
                          </label>
                          <input
                            type="text"
                            value={project.title}
                            onChange={(e) => handleArrayFieldChange("projects", index, "title", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00C4B3] focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Start Date
                          </label>
                          <input
                            type="month"
                            value={project.startDate}
                            onChange={(e) => handleArrayFieldChange("projects", index, "startDate", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00C4B3] focus:border-transparent text-sm min-w-0"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            End Date
                          </label>
                          <input
                            type="month"
                            value={project.endDate}
                            onChange={(e) => handleArrayFieldChange("projects", index, "endDate", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00C4B3] focus:border-transparent text-sm min-w-0"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Project URL (Optional)
                          </label>
                          <input
                            type="url"
                            value={project.projectUrl}
                            onChange={(e) => handleArrayFieldChange("projects", index, "projectUrl", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00C4B3] focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            GitHub URL (Optional)
                          </label>
                          <input
                            type="url"
                            value={project.githubUrl}
                            onChange={(e) => handleArrayFieldChange("projects", index, "githubUrl", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00C4B3] focus:border-transparent"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Technologies Used (comma-separated)
                        </label>
                        <input
                          type="text"
                          value={project.technologies?.join(", ") || ""}
                          onChange={(e) => handleTechnologiesChange(index, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00C4B3] focus:border-transparent"
                          placeholder="React, Node.js, MongoDB, AWS..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Project Description
                        </label>
                        <textarea
                          value={project.description}
                          onChange={(e) => handleArrayFieldChange("projects", index, "description", e.target.value)}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00C4B3] focus:border-transparent"
                          placeholder="Describe the project, your role, and achievements..."
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Languages Section */}
              {activeSection === "languages" && (
                <div className="space-y-6">
                  <div className="border-b pb-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">Languages</h2>
                        <p className="text-gray-600">Add languages you speak</p>
                      </div>
                      <button
                        onClick={() => addArrayItem("languages")}
                        className="flex items-center gap-2 px-4 py-2 bg-[#0B1F3B] text-white rounded-lg hover:bg-[#132D54] transition-colors"
                      >
                        <PlusCircle size={16} />
                        Add Language
                      </button>
                    </div>
                  </div>

                  {formData.languages.map((language, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-6 space-y-4">
                      <div className="flex justify-between items-start">
                        <h3 className="text-lg font-medium text-gray-900">
                          Language {index + 1}
                        </h3>
                        {formData.languages.length > 1 && (
                          <button
                            onClick={() => removeArrayItem("languages", index)}
                            className="text-red-600 hover:text-red-700 p-1"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Language
                          </label>
                          <input
                            type="text"
                            value={language.language}
                            onChange={(e) => handleArrayFieldChange("languages", index, "language", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00C4B3] focus:border-transparent"
                            placeholder="e.g. English, Spanish, French"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Proficiency Level
                          </label>
                          <select
                            value={language.proficiency}
                            onChange={(e) => handleArrayFieldChange("languages", index, "proficiency", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00C4B3] focus:border-transparent"
                          >
                            <option value="Beginner">Beginner</option>
                            <option value="Elementary">Elementary</option>
                            <option value="Intermediate">Intermediate</option>
                            <option value="Advanced">Advanced</option>
                            <option value="Native">Native</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Volunteer Work Section */}
              {activeSection === "volunteer" && (
                <div className="space-y-6">
                  <div className="border-b pb-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">Volunteer Experience</h2>
                        <p className="text-gray-600">Add your volunteer work and community involvement</p>
                      </div>
                      <button
                        onClick={() => addArrayItem("volunteer")}
                        className="flex items-center gap-2 px-4 py-2 bg-[#0B1F3B] text-white rounded-lg hover:bg-[#132D54] transition-colors"
                      >
                        <PlusCircle size={16} />
                        Add Volunteer Work
                      </button>
                    </div>
                  </div>

                  {formData.volunteer.map((vol, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-6 space-y-4">
                      <div className="flex justify-between items-start">
                        <h3 className="text-lg font-medium text-gray-900">
                          Volunteer Experience {index + 1}
                        </h3>
                        {formData.volunteer.length > 1 && (
                          <button
                            onClick={() => removeArrayItem("volunteer", index)}
                            className="text-red-600 hover:text-red-700 p-1"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Organization
                          </label>
                          <input
                            type="text"
                            value={vol.organization}
                            onChange={(e) => handleArrayFieldChange("volunteer", index, "organization", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00C4B3] focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Role/Position
                          </label>
                          <input
                            type="text"
                            value={vol.role}
                            onChange={(e) => handleArrayFieldChange("volunteer", index, "role", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00C4B3] focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Start Date
                          </label>
                          <input
                            type="month"
                            value={vol.startDate}
                            onChange={(e) => handleArrayFieldChange("volunteer", index, "startDate", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00C4B3] focus:border-transparent text-sm min-w-0"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            End Date
                          </label>
                          <input
                            type="month"
                            value={vol.endDate}
                            onChange={(e) => handleArrayFieldChange("volunteer", index, "endDate", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00C4B3] focus:border-transparent text-sm min-w-0"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Description
                        </label>
                        <textarea
                          value={vol.description}
                          onChange={(e) => handleArrayFieldChange("volunteer", index, "description", e.target.value)}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00C4B3] focus:border-transparent"
                          placeholder="Describe your volunteer work and impact..."
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Publications Section */}
              {activeSection === "publications" && (
                <div className="space-y-6">
                  <div className="border-b pb-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">Publications</h2>
                        <p className="text-gray-600">Add your published works, papers, and articles</p>
                      </div>
                      <button
                        onClick={() => addArrayItem("publications")}
                        className="flex items-center gap-2 px-4 py-2 bg-[#0B1F3B] text-white rounded-lg hover:bg-[#132D54] transition-colors"
                      >
                        <PlusCircle size={16} />
                        Add Publication
                      </button>
                    </div>
                  </div>

                  {formData.publications.map((publication, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-6 space-y-4">
                      <div className="flex justify-between items-start">
                        <h3 className="text-lg font-medium text-gray-900">
                          Publication {index + 1}
                        </h3>
                        {formData.publications.length > 1 && (
                          <button
                            onClick={() => removeArrayItem("publications", index)}
                            className="text-red-600 hover:text-red-700 p-1"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Title
                          </label>
                          <input
                            type="text"
                            value={publication.title}
                            onChange={(e) => handleArrayFieldChange("publications", index, "title", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00C4B3] focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Publisher/Journal
                          </label>
                          <input
                            type="text"
                            value={publication.publisher}
                            onChange={(e) => handleArrayFieldChange("publications", index, "publisher", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00C4B3] focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Publish Date
                          </label>
                          <input
                            type="month"
                            value={publication.publishDate}
                            onChange={(e) => handleArrayFieldChange("publications", index, "publishDate", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00C4B3] focus:border-transparent text-sm min-w-0"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            URL (Optional)
                          </label>
                          <input
                            type="url"
                            value={publication.url}
                            onChange={(e) => handleArrayFieldChange("publications", index, "url", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00C4B3] focus:border-transparent"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Description
                        </label>
                        <textarea
                          value={publication.description}
                          onChange={(e) => handleArrayFieldChange("publications", index, "description", e.target.value)}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00C4B3] focus:border-transparent"
                          placeholder="Brief description of the publication..."
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>
          </div>
        </div>
      </div>

      {/* OTP Modal - Mobile Responsive */}
      {showOTPModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-[#0B1F3B] to-[#132D54] bg-clip-text text-transparent">
                  Verify {otpType === "phone" ? "Phone" : "Email"}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {otpType === "phone" ? "📱" : "📧"} Secure verification
                </p>
              </div>
              <button
                onClick={() => setShowOTPModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mb-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-[#0B1F3B]/10 to-[#00C4B3]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                {otpType === "phone" ?
                  <Phone className="text-[#0B1F3B]" size={24} /> :
                  <Mail className="text-[#0B1F3B]" size={24} />
                }
              </div>
              <p className="text-sm text-gray-600 mb-4">
                We've sent a 6-digit verification code to your {otpType === "phone" ? "phone number" : "email address"}
              </p>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOTP(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength={6}
                className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#00C4B3] focus:border-[#00C4B3] text-center text-2xl tracking-[0.5em] font-bold bg-gray-50 transition-all duration-200"
                placeholder="000000"
                autoFocus
              />
              <p className="text-xs text-gray-500 mt-2">
                Enter the 6-digit code • Code expires in 10 minutes
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setShowOTPModal(false)}
                className="flex-1 px-4 py-3 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={verifyOTP}
                disabled={otp.length !== 6}
                className="flex-1 px-4 py-3 bg-[#0B1F3B] text-white rounded-xl hover:bg-[#132D54] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg hover:shadow-xl"
              >
                {otp.length === 6 ? "Verify Code" : `${6 - otp.length} digits left`}
              </button>
            </div>

            {/* Resend option */}
            <div className="mt-4 text-center">
              <button
                onClick={() => sendOTP(otpType)}
                className="text-sm text-[#0B1F3B] hover:text-[#0B1F3B]/80 font-medium"
              >
                Didn't receive the code? Resend
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Resume Import Modal - Mobile Responsive */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-[#0B1F3B] to-[#132D54] bg-clip-text text-transparent">
                  Import Resume
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  🚀 Skip the manual work
                </p>
              </div>
              <button
                onClick={() => setShowImportModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-[#0B1F3B]/10 to-[#00C4B3]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Upload className="text-[#0B1F3B]" size={24} />
              </div>
              <p className="text-sm text-gray-600 mb-4 text-center">
                Upload your resume and we'll automatically extract your experience, education, and skills using AI.
              </p>

              <div className="relative">
                <input
                  type="file"
                  accept=".pdf, .docx"
                  onChange={(e) => setImportFile(e.target.files[0])}
                  className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00C4B3] focus:border-[#00C4B3] transition-all duration-200 bg-gray-50 hover:bg-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-[#0B1F3B]/5 file:text-[#0B1F3B] hover:file:bg-[#0B1F3B]/10"
                />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  {!importFile && (
                    <div className="text-center">
                      <FileText className="mx-auto text-gray-400 mb-2" size={24} />
                      <p className="text-sm text-gray-500">Choose PDF or DOCX file</p>
                    </div>
                  )}
                </div>
              </div>

              {importFile && (
                <div className="mt-3 p-3 bg-[#0B1F3B]/5 rounded-lg border border-[#0B1F3B]/15">
                  <div className="flex items-center gap-2">
                    <FileText className="text-[#0B1F3B]" size={16} />
                    <span className="text-sm font-medium text-[#0B1F3B]/80">{importFile.name}</span>
                    <button
                      onClick={() => setImportFile(null)}
                      className="ml-auto text-[#0B1F3B]/50 hover:text-[#0B1F3B]"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {isImporting && (
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Processing...</span>
                  <span className="text-sm text-gray-500">{importProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-[#0B1F3B] h-2 rounded-full transition-all duration-300"
                    style={{ width: `${importProgress}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  {importProgress < 30 ? "Uploading file..." :
                    importProgress < 60 ? "Analyzing content..." :
                      importProgress < 80 ? "Extracting information..." :
                        "Almost done..."}
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setShowImportModal(false)}
                className="flex-1 px-4 py-3 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium"
                disabled={isImporting}
              >
                Cancel
              </button>
              <button
                onClick={handleResumeImport}
                disabled={isImporting || !importFile}
                className="flex-1 px-4 py-3 bg-[#0B1F3B] text-white rounded-xl hover:bg-[#132D54] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg hover:shadow-xl"
              >
                {isImporting ? "Processing..." : "Import Resume"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Social Share Modal - Mobile Responsive */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-[#0B1F3B] to-[#132D54] bg-clip-text text-transparent">
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
              <div className="w-16 h-16 bg-gradient-to-r from-[#0B1F3B]/10 to-[#00C4B3]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Share2 className="text-[#0B1F3B]" size={24} />
              </div>
              <p className="text-sm text-gray-500 mb-4 text-center">Copy your profile link to share</p>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  readOnly
                  value={`${typeof window !== 'undefined' ? window.location.origin : ''}/public-profile/${user?.uid}`}
                  className="flex-1 border-2 border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 bg-gray-50 focus:outline-none font-mono"
                />
                <button
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      navigator.clipboard.writeText(`${window.location.origin}/public-profile/${user?.uid}`);
                      toast.success("Profile link copied to clipboard!");
                    }
                  }}
                  className="px-6 py-3 bg-[#0B1F3B] text-white rounded-xl hover:bg-[#132D54] transition-all duration-200 shadow-lg hover:shadow-xl font-medium flex items-center justify-center gap-2 hover:scale-105 active:scale-95"
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
                  href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(`${typeof window !== 'undefined' ? window.location.origin : ''}/public-profile/${user?.uid}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center justify-center p-4 rounded-xl bg-gradient-to-br from-[#0B1F3B]/5 to-[#0B1F3B]/10 hover:from-[#0B1F3B]/10 hover:to-[#0B1F3B]/20 transition-all duration-200 group hover:scale-105 active:scale-95"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#0A66C2" className="group-hover:scale-110 transition-transform">
                    <path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z" />
                  </svg>
                  <span className="mt-2 text-xs font-medium text-[#0B1F3B]/80">LinkedIn</span>
                </a>

                {/* Twitter/X */}
                <a
                  href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(`${typeof window !== 'undefined' ? window.location.origin : ''}/public-profile/${user?.uid}`)}&text=${encodeURIComponent("Check out my professional profile!")}`}
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
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`${typeof window !== 'undefined' ? window.location.origin : ''}/public-profile/${user?.uid}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center justify-center p-4 rounded-xl bg-gradient-to-br from-[#0B1F3B]/5 to-[#0B1F3B]/10 hover:from-[#0B1F3B]/10 hover:to-[#0B1F3B]/20 transition-all duration-200 group hover:scale-105 active:scale-95"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#1877F2" className="group-hover:scale-110 transition-transform">
                    <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5A10.978 10.978 0 0112 6c1.54 0 3.04.31 4.43.87.14.06.27.13.4.2l.07.04 1.48-1.48-.07-.04A11.978 11.978 0 0012 4c-6.627 0-12 5.373-12 12 0 6.627 5.373 12 12 12a11.978 11.978 0 007.94-3.06l-.07-.04-1.48 1.48.07.04A11.978 11.978 0 0024 12z" />
                  </svg>
                  <span className="mt-2 text-xs font-medium text-[#0B1F3B]/80">Facebook</span>
                </a>

                {/* WhatsApp */}
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(`Check out my professional profile: ${typeof window !== 'undefined' ? window.location.origin : ''}/public-profile/${user?.uid}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center justify-center p-4 rounded-xl bg-gradient-to-br from-[#00C4B3]/5 to-[#00C4B3]/10 hover:from-[#00C4B3]/10 hover:to-[#00C4B3]/20 transition-all duration-200 group hover:scale-105 active:scale-95"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#25D366" className="group-hover:scale-110 transition-transform">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  <span className="mt-2 text-xs font-medium text-[#0B1F3B]/80">WhatsApp</span>
                </a>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4 space-y-3">
              <a
                href={`/public-profile/${user?.uid}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full px-4 py-3 bg-[#0B1F3B] text-white rounded-xl hover:bg-[#132D54] transition-all duration-200 shadow-lg hover:shadow-xl font-medium flex items-center justify-center gap-2 hover:scale-105 active:scale-95"
              >
                <Eye size={18} />
                View Demo Profile
              </a>
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

      {/* Unsaved Changes Warning Modal */}
      {showUnsavedWarning && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-start gap-4 mb-6">
              <div className="flex-shrink-0 w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <Save className="text-yellow-600" size={24} />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Unsaved Changes
                </h3>
                <p className="text-gray-600">
                  You have unsaved changes. Would you like to save them before previewing your profile?
                </p>
              </div>
              <button
                onClick={() => {
                  setShowUnsavedWarning(false);
                  setPendingPreviewAction(null);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={async () => {
                  const saved = await saveProfile(false);
                  if (saved) {
                    setShowUnsavedWarning(false);
                    if (pendingPreviewAction) {
                      pendingPreviewAction();
                      setPendingPreviewAction(null);
                    }
                  }
                }}
                disabled={saving}
                className="flex-1 px-4 py-3 bg-[#0B1F3B] text-white rounded-xl hover:bg-[#132D54] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg hover:shadow-xl"
              >
                {saving ? "Saving..." : "Save & Preview"}
              </button>
              <button
                onClick={() => {
                  setShowUnsavedWarning(false);
                  if (pendingPreviewAction) {
                    pendingPreviewAction();
                    setPendingPreviewAction(null);
                  }
                }}
                className="flex-1 px-4 py-3 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium"
              >
                Preview Without Saving
              </button>
              <button
                onClick={() => {
                  setShowUnsavedWarning(false);
                  setPendingPreviewAction(null);
                }}
                className="flex-1 px-4 py-3 text-gray-600 hover:text-gray-800 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditableProfileForm;
