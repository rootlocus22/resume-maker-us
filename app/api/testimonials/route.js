import { NextResponse } from 'next/server';
import { adminDb } from '../../lib/firebase';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit')) || 200;
    
    // Fetch feedback data
    const feedbackSnapshot = await adminDb
      .collection('feedback')
      .orderBy('timestamp', 'desc')
      .limit(limit)
      .get();
    
    console.log(`📊 Total feedback documents fetched: ${feedbackSnapshot.docs.length}`);
    
    const testimonialsWithProfiles = await Promise.all(
      feedbackSnapshot.docs.map(async (feedbackDoc) => {
        const feedbackData = feedbackDoc.data();
        
        // Skip if no userId or rating is less than 3
        if (!feedbackData.userId || feedbackData.rating < 3) {
          console.log(`⚠️ Skipping feedback: userId=${feedbackData.userId}, rating=${feedbackData.rating}`);
          return null;
        }
        
        try {
          // Fetch user profile using admin SDK
          const userDoc = await adminDb.collection('users').doc(feedbackData.userId).get();
          let userProfile = null;
          
          if (userDoc.exists) {
            const userData = userDoc.data();
            
            // Fetch user's first resume for professional info
            const resumesSnapshot = await adminDb
              .collection('users')
              .doc(feedbackData.userId)
              .collection('resumes')
              .limit(1)
              .get();
            
            let resumeData = null;
            if (!resumesSnapshot.empty) {
              resumeData = resumesSnapshot.docs[0].data();
            }
            
            userProfile = {
              name: userData.name || feedbackData.name || 'Anonymous User',
              email: userData.email,
              resumeData: resumeData?.resumeData || null,
              template: resumeData?.template || 'classic',
              country: resumeData?.country || 'in'
            };
          }
          
          return {
            id: feedbackDoc.id,
            comment: feedbackData.comment,
            name: feedbackData.name,
            rating: feedbackData.rating,
            timestamp: feedbackData.timestamp,
            userId: feedbackData.userId,
            userProfile,
            fallbackIndex: Math.floor(Math.random() * 8) // For varied fallback messages
          };
        } catch (error) {
          console.error('Error fetching user profile:', error);
          return {
            id: feedbackDoc.id,
            comment: feedbackData.comment,
            name: feedbackData.name,
            rating: feedbackData.rating,
            timestamp: feedbackData.timestamp,
            userId: feedbackData.userId,
            userProfile: {
              name: feedbackData.name || 'Anonymous User',
              email: null,
              resumeData: null
            },
            fallbackIndex: Math.floor(Math.random() * 8) // For varied fallback messages
          };
        }
      })
    );
    
    // Filter out null values
    const validTestimonials = testimonialsWithProfiles.filter(testimonial => testimonial !== null);
    
    // Remove duplicates by userId, keeping the most recent one
    const uniqueTestimonials = validTestimonials.reduce((acc, current) => {
      const existing = acc.find(item => item.userId === current.userId);
      if (!existing) {
        acc.push(current);
      } else if (current.timestamp > existing.timestamp) {
        // Replace with more recent testimonial
        const index = acc.findIndex(item => item.userId === current.userId);
        acc[index] = current;
      }
      return acc;
    }, []);
    
    console.log(`📊 Testimonials processing: ${feedbackSnapshot.docs.length} total fetched → ${validTestimonials.length} valid → ${uniqueTestimonials.length} unique after deduplication`);
    
    // Sort by rating (highest first), then by timestamp (most recent first)
    const sortedTestimonials = uniqueTestimonials.sort((a, b) => {
      if (b.rating !== a.rating) {
        return b.rating - a.rating;
      }
      return b.timestamp - a.timestamp;
    });
    
    return NextResponse.json({
      success: true,
      testimonials: sortedTestimonials,
      count: sortedTestimonials.length
    });
    
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch testimonials',
        testimonials: [],
        count: 0
      },
      { status: 500 }
    );
  }
} 