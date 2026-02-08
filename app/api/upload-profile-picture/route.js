import { NextResponse } from 'next/server';
import { adminDb, adminStorage } from '../../lib/firebase';

// Helper function to upload to Firebase Storage
async function uploadToFirebaseStorage(buffer, fileName, mimeType) {
  try {
    // Get the storage bucket explicitly
    const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
    if (!bucketName) {
      throw new Error('Storage bucket name not configured. Please set NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET environment variable.');
    }
    
    console.log('[FIREBASE_STORAGE] Using bucket:', bucketName);
    
    // Create a reference to the file in Firebase Storage
    const fileRef = adminStorage.bucket(bucketName).file(`profile-pictures/${fileName}`);
    console.log('[FIREBASE_STORAGE] File reference created:', fileRef.name);
    
    // Upload the buffer to Firebase Storage
    await fileRef.save(buffer, {
      metadata: {
        contentType: mimeType,
        cacheControl: 'public, max-age=31536000', // 1 year cache
        customMetadata: {
          uploadedAt: new Date().toISOString(),
          purpose: 'profile-picture'
        }
      },
    });
    
    // Make the file publicly accessible
    await fileRef.makePublic();
    
    // Get the public URL
    const publicUrl = `https://storage.googleapis.com/${bucketName}/${fileRef.name}`;
    
    console.log('[FIREBASE_STORAGE] Upload successful', { fileName, url: publicUrl });
    return publicUrl;
    
  } catch (error) {
    console.error('[FIREBASE_STORAGE] Upload failed:', error);
    
    // Provide more specific error messages
    if (error.code === 'storage/unauthorized') {
      throw new Error('Storage access denied. Please check Firebase permissions.');
    } else if (error.code === 'storage/canceled') {
      throw new Error('Upload was canceled.');
    } else if (error.code === 'storage/unknown') {
      throw new Error('Unknown storage error occurred.');
    } else {
      throw new Error(`Storage upload failed: ${error.message}`);
    }
  }
}

// Helper function to delete old profile picture from Firebase Storage
async function deleteOldProfilePicture(oldUrl) {
  if (!oldUrl || !oldUrl.includes('storage.googleapis.com')) {
    return; // Not a Firebase Storage URL or no URL to delete
  }
  
  try {
    // Get the storage bucket explicitly
    const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
    if (!bucketName) {
      console.warn('[FIREBASE_STORAGE] Bucket name not configured, skipping deletion');
      return;
    }
    
    // Extract file path from URL
    const urlParts = oldUrl.split('/');
    const bucketIndex = urlParts.findIndex(part => part.includes('storage.googleapis.com')) + 1;
    const filePath = urlParts.slice(bucketIndex + 1).join('/');
    
    if (filePath.startsWith('profile-pictures/')) {
      const fileRef = adminStorage.bucket(bucketName).file(filePath);
      await fileRef.delete();
      console.log('[FIREBASE_STORAGE] Old profile picture deleted', { filePath });
    }
  } catch (error) {
    // Don't fail the upload if old file deletion fails
    console.warn('[FIREBASE_STORAGE] Failed to delete old profile picture:', error.message);
  }
}

// Helper function to generate a unique filename
function generateFileName(userId, originalName) {
  const timestamp = Date.now();
  const extension = originalName.split('.').pop() || 'jpg';
  return `profile-${userId}-${timestamp}.${extension}`;
}

export async function POST(req) {
  try {
    console.log('[POST] /api/upload-profile-picture - Request received');
    
    // Debug: Check environment variables
    console.log('[DEBUG] Environment check:', {
      hasStorageBucket: !!process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      hasAdminStorage: !!adminStorage
    });
    
    // Parse form data
    const formData = await req.formData();
    const file = formData.get('file');
    const userId = formData.get('userId');

    // Validate inputs
    if (!file) {
      console.error('[POST] /api/upload-profile-picture - No file provided');
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!userId) {
      console.error('[POST] /api/upload-profile-picture - No userId provided');
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      console.error('[POST] /api/upload-profile-picture - Invalid file type', { type: file.type });
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 });
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      console.error('[POST] /api/upload-profile-picture - File too large', { size: file.size });
      return NextResponse.json({ error: 'File size must be less than 5MB' }, { status: 400 });
    }

    console.log('[POST] /api/upload-profile-picture - File validation passed', { 
      type: file.type, 
      size: file.size,
      userId 
    });

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename and upload to Firebase Storage
    const fileName = generateFileName(userId, file.name);
    console.log('[POST] /api/upload-profile-picture - Uploading to Firebase Storage', { fileName });
    
    const imageUrl = await uploadToFirebaseStorage(buffer, fileName, file.type);
    console.log('[POST] /api/upload-profile-picture - Upload successful');

    // Update user profile in Firestore
    try {
      console.log('[POST] /api/upload-profile-picture - Updating Firestore profile');
      
      // Get current user data to check for old profile picture
      const userDoc = await adminDb.collection('users').doc(userId).get();
      const currentData = userDoc.exists ? userDoc.data() : {};
      const oldProfilePicture = currentData.profilePicture;
      
      // Update main user document
      await adminDb.collection('users').doc(userId).update({
        profilePicture: imageUrl,
        updatedAt: new Date().toISOString()
      });
      
      // Delete old profile picture if it exists
      if (oldProfilePicture && oldProfilePicture !== imageUrl) {
        await deleteOldProfilePicture(oldProfilePicture);
      }

      // Also update the profile sub-document if it exists
      try {
        const profileRef = adminDb.collection('users').doc(userId).collection('profile').doc('userProfile');
        const profileDoc = await profileRef.get();
        
        if (profileDoc.exists) {
          await profileRef.update({
            profilePicture: imageUrl,
            photo: imageUrl, // For backward compatibility
            updatedAt: new Date().toISOString()
          });
          console.log('[POST] /api/upload-profile-picture - Profile sub-document updated');
        } else {
          console.log('[POST] /api/upload-profile-picture - Profile sub-document does not exist, skipping');
        }
      } catch (profileError) {
        console.warn('[POST] /api/upload-profile-picture - Profile sub-document update failed', profileError.message);
        // Don't fail the whole request if profile sub-document update fails
      }

      console.log('[POST] /api/upload-profile-picture - Firestore update successful');
      
      return NextResponse.json({
        success: true,
        url: imageUrl,
        message: 'Profile picture uploaded successfully'
      });

    } catch (firestoreError) {
      console.error('[POST] /api/upload-profile-picture - Firestore update failed', firestoreError);
      
      // Even if Firestore update fails, we still have the uploaded image
      return NextResponse.json({
        success: true,
        url: imageUrl,
        message: 'Profile picture uploaded successfully',
        warning: 'Database update may have failed'
      });
    }

  } catch (error) {
    console.error('[POST] /api/upload-profile-picture - Unexpected error', error);
    
    return NextResponse.json({
      error: 'Failed to upload profile picture',
      details: error.message
    }, { status: 500 });
  }
}

// GET method for API documentation
export async function GET() {
  return NextResponse.json({
    message: 'Profile Picture Upload API',
    version: '2.0',
    method: 'POST',
    storage: 'Firebase Storage',
    parameters: {
      file: 'File (image) - Required',
      userId: 'string - Required'
    },
    features: [
      'Image validation (type and size)',
      'Firebase Storage upload',
      'Public URL generation',
      'Firestore profile update',
      'Automatic file naming',
      'Error handling and logging'
    ],
    limits: {
      maxSize: '5MB',
      supportedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/bmp']
    },
    storage_path: 'profile-pictures/',
    url_format: 'https://storage.googleapis.com/[bucket]/profile-pictures/profile-[userId]-[timestamp].[ext]'
  });
}
