// lib/candidatesService.js
/**
 * Enhanced candidates service that provides persona-neutral terminology
 * Replaces the more education-specific studentsService
 */
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  startAfter,
  onSnapshot,
  serverTimestamp,
  increment
} from "firebase/firestore";
import { db } from "./firebase";

// CANDIDATES SERVICE (replaces studentsService with broader terminology)
export const candidatesService = {
  // Get all candidates for an institution
  async getCandidates(institutionId, options = {}) {
    try {
      const { limitCount = 50, lastDoc = null, searchTerm = "", course = "", year = "", status = "" } = options;
      
      let q = query(
        collection(db, "institutions", institutionId, "candidates"),
        orderBy("createdAt", "desc")
      );
      
      if (searchTerm) {
        q = query(q, where("searchTerms", "array-contains", searchTerm.toLowerCase()));
      }
      
      if (course) {
        q = query(q, where("course", "==", course));
      }
      
      if (year) {
        q = query(q, where("year", "==", year));
      }

      if (status) {
        q = query(q, where("status", "==", status));
      }
      
      q = query(q, limit(limitCount));
      
      if (lastDoc) {
        q = query(q, startAfter(lastDoc));
      }

      const snapshot = await getDocs(q);
      const candidates = [];
      
      snapshot.forEach((doc) => {
        candidates.push({
          id: doc.id,
          ...doc.data(),
          lastDoc: doc
        });
      });

      return {
        candidates,
        lastDoc: snapshot.docs[snapshot.docs.length - 1],
        hasMore: snapshot.docs.length === limitCount
      };
      
    } catch (error) {
      console.error("Error fetching candidates:", error);
      throw error;
    }
  },

  // Add a single candidate
  async addCandidate(institutionId, candidate) {
    try {
      // Prepare candidate data with search terms
      const candidateData = {
        ...candidate,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: candidate.status || "active",
        searchTerms: this.generateSearchTerms(candidate)
      };

      // Add candidate to subcollection
      const docRef = await addDoc(collection(db, "institutions", institutionId, "candidates"), candidateData);
      
      // Update institution stats
      await updateDoc(doc(db, "institutions", institutionId), {
        candidatesCount: increment(1),
        lastUpdated: serverTimestamp()
      });

      return { success: true, id: docRef.id };
    } catch (error) {
      console.error("Error adding candidate:", error);
      throw error;
    }
  },

  // Add multiple candidates (bulk import)
  async addCandidatesBulk(institutionId, candidatesData) {
    try {
      const batch = [];
      const candidates = candidatesData.map(candidateData => {
        return {
          ...candidateData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          status: candidateData.status || "active",
          searchTerms: this.generateSearchTerms(candidateData)
        };
      });

      // Add all candidates
      const promises = candidates.map(candidate => 
        addDoc(collection(db, "institutions", institutionId, "candidates"), candidate)
      );
      
      await Promise.all(promises);
      
      // Update institution stats
      await updateDoc(doc(db, "institutions", institutionId), {
        candidatesCount: increment(candidates.length),
        lastUpdated: serverTimestamp()
      });

      return { success: true, count: candidates.length };
    } catch (error) {
      console.error("Error bulk adding candidates:", error);
      throw error;
    }
  },

  // Update candidate
  async updateCandidate(institutionId, candidateId, updates) {
    try {
      const updateData = {
        ...updates,
        updatedAt: serverTimestamp(),
        searchTerms: updates.name || updates.email ? 
          this.generateSearchTerms({...updates}) : undefined
      };

      // Remove undefined fields
      Object.keys(updateData).forEach(key => 
        updateData[key] === undefined && delete updateData[key]
      );

      await updateDoc(
        doc(db, "institutions", institutionId, "candidates", candidateId), 
        updateData
      );

      return { success: true };
    } catch (error) {
      console.error("Error updating candidate:", error);
      throw error;
    }
  },

  // Delete candidate
  async deleteCandidate(institutionId, candidateId) {
    try {
      await deleteDoc(doc(db, "institutions", institutionId, "candidates", candidateId));
      
      // Update institution stats
      await updateDoc(doc(db, "institutions", institutionId), {
        candidatesCount: increment(-1),
        lastUpdated: serverTimestamp()
      });

      return { success: true };
    } catch (error) {
      console.error("Error deleting candidate:", error);
      throw error;
    }
  },

  // Get single candidate
  async getCandidate(institutionId, candidateId) {
    try {
      const docSnap = await getDoc(doc(db, "institutions", institutionId, "candidates", candidateId));
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        };
      } else {
        throw new Error("Candidate not found");
      }
    } catch (error) {
      console.error("Error fetching candidate:", error);
      throw error;
    }
  },

  // Subscribe to candidates changes (real-time)
  subscribeToCandidate(institutionId, candidateId, callback) {
    return onSnapshot(
      doc(db, "institutions", institutionId, "candidates", candidateId),
      (doc) => {
        if (doc.exists()) {
          callback({
            id: doc.id,
            ...doc.data()
          });
        }
      },
      (error) => {
        console.error("Error in candidate subscription:", error);
      }
    );
  },

  // Subscribe to candidates list changes
  subscribeToCandidates(institutionId, callback, options = {}) {
    const { limitCount = 50 } = options;
    
    let q = query(
      collection(db, "institutions", institutionId, "candidates"),
      orderBy("createdAt", "desc"),
      limit(limitCount)
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const candidates = [];
        snapshot.forEach((doc) => {
          candidates.push({
            id: doc.id,
            ...doc.data()
          });
        });
        callback(candidates);
      },
      (error) => {
        console.error("Error in candidates subscription:", error);
      }
    );
  },

  // Generate search terms for efficient searching
  generateSearchTerms(candidate) {
    const terms = [];
    
    if (candidate.name) {
      terms.push(...candidate.name.toLowerCase().split(' '));
    }
    
    if (candidate.email) {
      terms.push(candidate.email.toLowerCase());
    }
    
    if (candidate.phone) {
      terms.push(candidate.phone);
    }
    
    if (candidate.course) {
      terms.push(candidate.course.toLowerCase());
    }
    
    if (candidate.skills) {
      terms.push(...candidate.skills.map(skill => skill.toLowerCase()));
    }

    if (candidate.location) {
      terms.push(candidate.location.toLowerCase());
    }

    // Remove duplicates
    return [...new Set(terms)];
  },

  // Get candidates statistics
  async getCandidatesStats(institutionId) {
    try {
      const candidatesRef = collection(db, "institutions", institutionId, "candidates");
      
      // Get total count
      const totalSnapshot = await getDocs(candidatesRef);
      const totalCandidates = totalSnapshot.size;
      
      // Get active candidates
      const activeQuery = query(candidatesRef, where("status", "==", "active"));
      const activeSnapshot = await getDocs(activeQuery);
      const activeCandidates = activeSnapshot.size;
      
      // Get placed candidates (for educational institutions)
      const placedQuery = query(candidatesRef, where("status", "==", "placed"));
      const placedSnapshot = await getDocs(placedQuery);
      const placedCandidates = placedSnapshot.size;

      return {
        total: totalCandidates,
        active: activeCandidates,
        placed: placedCandidates,
        placementRate: totalCandidates > 0 ? (placedCandidates / totalCandidates) * 100 : 0
      };
    } catch (error) {
      console.error("Error fetching candidates stats:", error);
      throw error;
    }
  }
};

// Backward compatibility - alias studentsService to candidatesService
export const studentsService = candidatesService;
