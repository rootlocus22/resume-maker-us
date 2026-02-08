import { NextResponse } from 'next/server';
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// Initialize Firebase Admin SDK
if (!getApps().length) {
  try {
    initializeApp({
      credential: cert({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  } catch (error) {
    console.error("Firebase Admin initialization error:", error);
  }
}

const adminDb = getFirestore();

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json({ error: 'Resume ID is required' }, { status: 400 });
    }

    // Get the hosted resume metadata from Firestore
    const hostedRef = adminDb.collection('hostedResumes').doc(id);
    const hostedSnap = await hostedRef.get();

    if (!hostedSnap.exists) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
    }

    const hostedData = hostedSnap.data();
    
    // Check if the resume is active (not expired)
    const now = new Date();
    const expiresAt = hostedData.expiresAt;
    
    console.log('🔍 Hosted Resume Fetch:', {
      hostedId: id,
      sourceResumeId: hostedData.sourceResumeId,
      sourceUserId: hostedData.sourceUserId,
      useDynamicData: hostedData.useDynamicData
    });
    
    // Convert Firestore timestamp to Date if needed
    let expirationDate;
    let isExpired = false;
    if (expiresAt) {
      if (expiresAt.toDate && typeof expiresAt.toDate === 'function') {
        expirationDate = expiresAt.toDate();
      } else if (expiresAt instanceof Date) {
        expirationDate = expiresAt;
      } else {
        expirationDate = new Date(expiresAt);
      }
      
      if (expirationDate && now > expirationDate) {
        isExpired = true;
      }
    }

    // Try to fetch latest data from source resume if available
    let resumeData = null;
    let dataSource = 'snapshot'; // 'snapshot' or 'live'
    
    if (hostedData.useDynamicData && hostedData.sourceResumeId && hostedData.sourceUserId) {
      try {
        // Fetch the latest resume data from the source
        const sourceResumeRef = adminDb
          .collection('users')
          .doc(hostedData.sourceUserId)
          .collection('resumes')
          .doc(hostedData.sourceResumeId);
        
        const sourceResumeSnap = await sourceResumeRef.get();
        
        if (sourceResumeSnap.exists) {
          const sourceData = sourceResumeSnap.data();
          
          // Merge source resume data with hosted metadata (template, colors, etc.)
          resumeData = {
            ...sourceData,
            template: hostedData.template || sourceData.template || 'modern_professional',
            customColors: hostedData.customColors || {},
            language: hostedData.language || 'en',
            country: hostedData.country || 'in',
            preferences: hostedData.preferences || {},
            name: hostedData.resumeName || sourceData.resumeName || 'Resume'
          };
          
          dataSource = 'live';
          console.log('✅ Fetched live data from source resume:', hostedData.sourceResumeId);
        } else {
          console.log('⚠️ Source resume not found, falling back to snapshot');
        }
      } catch (sourceError) {
        console.error('Error fetching source resume, using snapshot:', sourceError);
      }
    }
    
    // Fallback to snapshot if source not available
    if (!resumeData) {
      // Support multiple data formats:
      // 1. New format: snapshotData object
      // 2. Medium format: data object
      // 3. Old format: data stored directly on document
      if (hostedData.snapshotData) {
        resumeData = hostedData.snapshotData;
      } else if (hostedData.data) {
        resumeData = hostedData.data;
      } else {
        // Old format: extract resume data from document root
        // Exclude metadata fields and use the rest as resume data
        const { 
          sourceResumeId, sourceUserId, template, customColors, 
          language, country, preferences, resumeName, downloadEnabled, 
          createdAt, expiresAt, originalUserId, isActive, useDynamicData,
          ...directResumeData 
        } = hostedData;
        
        // If we have actual resume fields (name, summary, etc.), use them
        if (Object.keys(directResumeData).length > 0) {
          resumeData = {
            ...directResumeData,
            template: hostedData.template || directResumeData.template || 'modern_professional',
            customColors: hostedData.customColors || {},
            language: hostedData.language || 'en',
            country: hostedData.country || 'in',
            preferences: hostedData.preferences || {}
          };
        } else {
          resumeData = {};
        }
      }
      dataSource = 'snapshot';
    }

    // Fix for nested resumeData issue: If resumeData has a nested resumeData field, flatten it
    if (resumeData && resumeData.resumeData && typeof resumeData.resumeData === 'object') {
      console.log('⚠️ Detected nested resumeData, flattening...');
      resumeData = resumeData.resumeData;
    }
    
    // Remove any metadata fields that shouldn't be in the resume data
    if (resumeData && resumeData.resumeName) {
      delete resumeData.resumeName;
    }
    
    // IMPORTANT: Merge template settings from hosted metadata into resumeData
    // This ensures the template chosen during export is respected
    if (resumeData) {
      resumeData = {
        ...resumeData,
        template: hostedData.template || resumeData.template || 'modern_professional',
        customColors: hostedData.customColors || resumeData.customColors || {},
        language: hostedData.language || resumeData.language || 'en',
        country: hostedData.country || resumeData.country || 'in',
        preferences: hostedData.preferences || resumeData.preferences || {}
      };
    }

    // Ensure photo field is properly extracted from nested structures
    if (resumeData) {
      // Check for photo in nested personal/profile objects
      if (!resumeData.photo) {
        if (resumeData.personal?.photo) {
          resumeData.photo = resumeData.personal.photo;
        } else if (resumeData.profile?.photo) {
          resumeData.photo = resumeData.profile.photo;
        }
      }
    }

    console.log('📦 Returning resume data:', {
      hostedId: id,
      dataSource,
      hasData: !!resumeData,
      dataKeys: resumeData ? Object.keys(resumeData).slice(0, 10) : [],
      hasName: !!(resumeData && resumeData.name),
      hasSummary: !!(resumeData && resumeData.summary),
      hasExperiences: !!(resumeData && resumeData.experiences),
      hasPhoto: !!(resumeData && resumeData.photo),
      photoType: resumeData?.photo ? (resumeData.photo.startsWith('http') ? 'URL' : resumeData.photo.startsWith('data:') ? 'base64' : 'other') : 'none',
      template: resumeData?.template
    });

    return NextResponse.json({
      resumeData: resumeData,
      downloadEnabled: hostedData.downloadEnabled || false,
      editEnabled: hostedData.editEnabled || false,
      createdAt: hostedData.createdAt,
      expiresAt: expirationDate ? expirationDate.toISOString() : hostedData.expiresAt,
      dataSource, // 'live' or 'snapshot'
      paymentAmount: hostedData.paymentAmount ?? 0,
      paymentCurrency: hostedData.paymentCurrency || 'INR',
      paymentStatus: hostedData.paymentStatus || (hostedData.downloadEnabled ? 'paid' : 'pending'),
      isExpired,
      locked: hostedData.locked || false
    });

  } catch (error) {
    console.error('Error fetching hosted resume:', error);
    return NextResponse.json(
      { error: 'Failed to fetch resume data' },
      { status: 500 }
    );
  }
}
