"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { db } from "../../lib/firebase";
import { doc, getDoc, updateDoc, increment } from "firebase/firestore";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import { 
  User, 
  MapPin, 
  Mail, 
  Phone, 
  Globe, 
  Linkedin, 
  Github, 
  Twitter, 
  ExternalLink,
  Building,
  Calendar,
  ArrowLeft,
  Share2,
  Copy,
  Eye
} from "lucide-react";
import Link from "next/link";

export default function PublicProfilePage() {
  const { id } = useParams();
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);
  const [profileOwner, setProfileOwner] = useState(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (id) {
      loadPublicProfile();
    }
  }, [id, user]);

  const loadPublicProfile = async () => {
    try {
      setLoading(true);
      
      // Fetch user profile data
      const userDoc = await getDoc(doc(db, "users", id));
      
      if (!userDoc.exists()) {
        setNotFound(true);
        return;
      }
      
      const userData = userDoc.data();
      
      // Check if profile is public
      if (!userData.isPublic && (!user || user.uid !== id)) {
        setNotFound(true);
        return;
      }
      
      // Set profile data
      const profile = {
        name: userData.name || userData.displayName || "Anonymous User",
        email: userData.email || "",
        phone: userData.phone || "",
        location: userData.location || "",
        bio: userData.bio || "",
        jobTitle: userData.jobTitle || "",
        company: userData.company || "",
        website: userData.website || "",
        linkedin: userData.linkedin || "",
        github: userData.github || "",
        twitter: userData.twitter || "",
        profilePicture: userData.profilePicture || "",
        isPublic: userData.isPublic !== false,
        skills: userData.skills || [],
        experience: userData.experience || [],
        education: userData.education || [],
        achievements: userData.achievements || [],
        createdAt: userData.createdAt,
        updatedAt: userData.updatedAt
      };
      
      setProfileData(profile);
      setProfileOwner(userData);
      setIsOwnProfile(user && user.uid === id);
      
      // Increment profile views if not own profile
      if (user && user.uid !== id) {
        try {
          await updateDoc(doc(db, "users", id), {
            profileViews: increment(1),
            lastViewedAt: new Date().toISOString()
          });
        } catch (error) {
          console.error("Error updating profile views:", error);
        }
      }
      
    } catch (error) {
      console.error("Error loading public profile:", error);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  const copyProfileLink = () => {
    const profileLink = `${window.location.origin}/profile/${id}`;
    navigator.clipboard.writeText(profileLink);
    toast.success("Profile link copied to clipboard!");
  };

  const shareProfile = async () => {
    const profileLink = `${window.location.origin}/profile/${id}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profileData.name}'s Professional Profile`,
          text: `Check out ${profileData.name}'s professional profile on ExpertResume`,
          url: profileLink,
        });
      } catch (error) {
        copyProfileLink();
      }
    } else {
      copyProfileLink();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (notFound || !profileData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <User size={32} className="text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Profile Not Found</h2>
          <p className="text-gray-600 mb-6">
            This profile doesn't exist or has been set to private.
          </p>
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft size={16} />
            Back
          </button>
        </div>

        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="relative h-32 bg-gradient-to-r from-blue-600 to-blue-500">
            <div className="absolute top-4 right-4 flex gap-2">
              <button
                onClick={shareProfile}
                className="flex items-center gap-2 px-3 py-1.5 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-colors"
              >
                <Share2 size={16} />
                Share
              </button>
              {isOwnProfile && (
                <Link
                  href="/edit-profile"
                  className="flex items-center gap-2 px-3 py-1.5 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-colors"
                >
                  Edit Profile
                </Link>
              )}
            </div>
          </div>
          
          <div className="relative px-6 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-end sm:gap-6 -mt-16">
              {/* Profile Picture */}
              <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gray-200">
                {profileData.profilePicture ? (
                  <img
                    src={profileData.profilePicture}
                    alt={profileData.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-600 to-blue-500 text-white text-3xl font-bold">
                    {profileData.name ? profileData.name.charAt(0).toUpperCase() : <User size={48} />}
                  </div>
                )}
              </div>
              
              {/* Profile Info */}
              <div className="flex-1 mt-4 sm:mt-0">
                <h1 className="text-3xl font-bold text-gray-900">{profileData.name}</h1>
                {profileData.jobTitle && (
                  <p className="text-xl text-gray-600 mt-1">{profileData.jobTitle}</p>
                )}
                {profileData.company && (
                  <p className="text-gray-600 mt-1 flex items-center gap-2">
                    <Building size={16} />
                    {profileData.company}
                  </p>
                )}
                {profileData.location && (
                  <p className="text-gray-600 mt-1 flex items-center gap-2">
                    <MapPin size={16} />
                    {profileData.location}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bio Section */}
        {profileData.bio && (
          <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">About</h2>
            <p className="text-gray-600 leading-relaxed">{profileData.bio}</p>
          </div>
        )}

        {/* Contact Information */}
        <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {profileData.email && (
              <div className="flex items-center gap-3 text-gray-600">
                <Mail size={18} className="text-blue-600" />
                <a href={`mailto:${profileData.email}`} className="hover:text-blue-600 transition-colors">
                  {profileData.email}
                </a>
              </div>
            )}
            {profileData.phone && (
              <div className="flex items-center gap-3 text-gray-600">
                <Phone size={18} className="text-blue-600" />
                <a href={`tel:${profileData.phone}`} className="hover:text-blue-600 transition-colors">
                  {profileData.phone}
                </a>
              </div>
            )}
            {profileData.website && (
              <div className="flex items-center gap-3 text-gray-600">
                <Globe size={18} className="text-blue-600" />
                <a 
                  href={profileData.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-blue-600 transition-colors flex items-center gap-1"
                >
                  Website <ExternalLink size={14} />
                </a>
              </div>
            )}
            {profileData.linkedin && (
              <div className="flex items-center gap-3 text-gray-600">
                <Linkedin size={18} className="text-blue-600" />
                <a 
                  href={profileData.linkedin} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-blue-600 transition-colors flex items-center gap-1"
                >
                  LinkedIn <ExternalLink size={14} />
                </a>
              </div>
            )}
            {profileData.github && (
              <div className="flex items-center gap-3 text-gray-600">
                <Github size={18} className="text-blue-600" />
                <a 
                  href={profileData.github} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-blue-600 transition-colors flex items-center gap-1"
                >
                  GitHub <ExternalLink size={14} />
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Skills Section */}
        {profileData.skills && profileData.skills.length > 0 && (
          <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Skills</h2>
            <div className="flex flex-wrap gap-2">
              {profileData.skills.map((skill, index) => (
                <span 
                  key={index}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                >
                  {typeof skill === 'string' ? skill : skill.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Public Profile Notice */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Eye size={20} className="text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900">Public Profile</h3>
              <p className="text-blue-800 text-sm mt-1">
                This is a public profile that can be viewed by anyone with the link.
                {isOwnProfile && " You can edit your profile to update your information."}
              </p>
              {!isOwnProfile && (
                <button
                  onClick={copyProfileLink}
                  className="mt-2 flex items-center gap-2 text-blue-700 hover:text-blue-800 text-sm font-medium"
                >
                  <Copy size={14} />
                  Copy Profile Link
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
