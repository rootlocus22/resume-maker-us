import { NextResponse } from 'next/server';
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

// Initialize Firebase Admin SDK
if (!getApps().length) {
  try {
    initializeApp({
      credential: cert({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    });
  } catch (error) {
    console.error("Firebase Admin initialization error:", error);
  }
}

const adminDb = getFirestore();
const adminStorage = getStorage();

// Helper function to upload to Firebase Storage
async function uploadToFirebaseStorage(buffer, fileName, mimeType) {
  try {
    const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
    if (!bucketName) {
      throw new Error('Storage bucket not configured');
    }
    
    const fileRef = adminStorage.bucket(bucketName).file(`resume-photos/${fileName}`);
    
    await fileRef.save(buffer, {
      metadata: {
        contentType: mimeType,
        cacheControl: 'public, max-age=31536000',
        customMetadata: {
          uploadedAt: new Date().toISOString(),
          purpose: 'resume-photo'
        }
      },
    });
    
    // Make the file publicly accessible
    await fileRef.makePublic();
    
    // Get the public URL
    const publicUrl = `https://storage.googleapis.com/${bucketName}/${fileRef.name}`;
    
    console.log('✅ Resume photo uploaded:', { fileName, url: publicUrl });
    return publicUrl;
    
  } catch (error) {
    console.error('❌ Resume photo upload failed:', error);
    throw new Error(`Storage upload failed: ${error.message}`);
  }
}

// Helper function to delete old photo from Firebase Storage
async function deleteOldPhoto(oldUrl) {
  if (!oldUrl || !oldUrl.includes('storage.googleapis.com') || !oldUrl.includes('resume-photos/')) {
    return;
  }
  
  try {
    const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
    if (!bucketName) return;
    
    const urlParts = oldUrl.split('/');
    const bucketIndex = urlParts.findIndex(part => part.includes('storage.googleapis.com')) + 1;
    const filePath = urlParts.slice(bucketIndex + 1).join('/');
    
    if (filePath.startsWith('resume-photos/')) {
      const fileRef = adminStorage.bucket(bucketName).file(filePath);
      await fileRef.delete();
      console.log('🗑️ Old resume photo deleted:', filePath);
    }
  } catch (error) {
    console.warn('⚠️ Failed to delete old photo:', error.message);
  }
}

// Generate unique filename for resume photo
function generateFileName(userId, resumeId, originalName) {
  const timestamp = Date.now();
  const extension = originalName.split('.').pop() || 'jpg';
  const sanitizedResumeId = resumeId ? resumeId.replace(/[^a-zA-Z0-9]/g, '_') : 'default';
  return `resume-${userId}-${sanitizedResumeId}-${timestamp}.${extension}`;
}

export async function POST(req) {
  try {
    console.log('📸 [RESUME PHOTO] Upload request received');
    
    const formData = await req.formData();
    const file = formData.get('file');
    const userId = formData.get('userId');
    const resumeId = formData.get('resumeId');

    // Validate inputs
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 });
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be less than 5MB' }, { status: 400 });
    }

    console.log('📸 [RESUME PHOTO] File validated:', { 
      type: file.type, 
      size: file.size,
      userId,
      resumeId 
    });

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename and upload
    const fileName = generateFileName(userId, resumeId, file.name);
    const imageUrl = await uploadToFirebaseStorage(buffer, fileName, file.type);

    // Update resume document in Firestore if resumeId is provided and valid
    if (resumeId && resumeId !== 'default') {
      try {
        const resumeRef = adminDb.collection('users').doc(userId).collection('resumes').doc(resumeId);
        const resumeDoc = await resumeRef.get();
        
        if (resumeDoc.exists) {
          const resumeData = resumeDoc.data();
          const oldPhotoUrl = resumeData.resumeData?.photo;
          
          // Update the photo in resumeData
          const updatedResumeData = {
            ...resumeData.resumeData,
            photo: imageUrl
          };
          
          await resumeRef.update({
            resumeData: updatedResumeData,
            updatedAt: new Date().toISOString()
          });
          
          // Delete old photo if it exists
          if (oldPhotoUrl && oldPhotoUrl !== imageUrl) {
            await deleteOldPhoto(oldPhotoUrl);
          }
          
          console.log('✅ [RESUME PHOTO] Resume document updated with photo URL');
        } else {
          console.warn('⚠️ [RESUME PHOTO] Resume document does not exist yet:', resumeId);
        }
      } catch (firestoreError) {
        console.warn('⚠️ [RESUME PHOTO] Failed to update resume document:', firestoreError.message);
        // Don't fail the upload if Firestore update fails
      }
    } else {
      console.log('ℹ️ [RESUME PHOTO] No valid resumeId provided (resumeId:', resumeId, ') - photo will be saved when resume is saved');
    }

    // Also store in a photo mapping collection for easy lookup
    try {
      await adminDb.collection('resumePhotoMappings').doc(`${userId}_${resumeId || 'default'}`).set({
        userId,
        resumeId: resumeId || null,
        photoUrl: imageUrl,
        uploadedAt: new Date().toISOString(),
        fileName
      }, { merge: true });
      
      console.log('✅ [RESUME PHOTO] Photo mapping created');
    } catch (mappingError) {
      console.warn('⚠️ [RESUME PHOTO] Failed to create photo mapping:', mappingError.message);
    }

    return NextResponse.json({
      success: true,
      url: imageUrl,
      message: 'Resume photo uploaded successfully'
    });

  } catch (error) {
    console.error('❌ [RESUME PHOTO] Upload failed:', error);
    
    return NextResponse.json({
      error: 'Failed to upload resume photo',
      details: error.message
    }, { status: 500 });
  }
}

// GET method to retrieve photo URL for a resume
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const resumeId = searchParams.get('resumeId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Try to get from photo mapping first
    const mappingDoc = await adminDb.collection('resumePhotoMappings')
      .doc(`${userId}_${resumeId || 'default'}`)
      .get();

    if (mappingDoc.exists) {
      const data = mappingDoc.data();
      return NextResponse.json({
        success: true,
        photoUrl: data.photoUrl,
        uploadedAt: data.uploadedAt
      });
    }

    // If not in mapping, try to get from resume document
    if (resumeId) {
      const resumeDoc = await adminDb.collection('users').doc(userId).collection('resumes').doc(resumeId).get();
      
      if (resumeDoc.exists) {
        const photoUrl = resumeDoc.data().resumeData?.photo;
        if (photoUrl) {
          return NextResponse.json({
            success: true,
            photoUrl
          });
        }
      }
    }

    return NextResponse.json({
      success: false,
      message: 'No photo found for this resume'
    }, { status: 404 });

  } catch (error) {
    console.error('❌ [RESUME PHOTO] GET failed:', error);
    return NextResponse.json({
      error: 'Failed to retrieve photo',
      details: error.message
    }, { status: 500 });
  }
}

