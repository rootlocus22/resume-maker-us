import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebase";
import { USER_ROLES } from "./teamManagement";

/**
 * Check if a user has admin access (not team member)
 * @param {string} userId - The user ID to check
 * @returns {Promise<boolean>} - True if user is admin, false if team member
 */
export async function isAdminUser(userId) {
  try {
    if (!userId) return false;
    
    const userDoc = await getDoc(doc(db, "users", userId));
    if (!userDoc.exists()) return false;
    
    const userData = userDoc.data();
    const role = userData.professionalProfile?.role || userData.role;
    
    return role === USER_ROLES.ADMIN;
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
}

/**
 * Check if a user is a team member
 * @param {string} userId - The user ID to check
 * @returns {Promise<boolean>} - True if user is team member, false if admin
 */
export async function isTeamMember(userId) {
  try {
    if (!userId) return false;
    
    const userDoc = await getDoc(doc(db, "users", userId));
    if (!userDoc.exists()) return false;
    
    const userData = userDoc.data();
    const role = userData.professionalProfile?.role || userData.role;
    
    return role === USER_ROLES.TEAM_MEMBER;
  } catch (error) {
    console.error("Error checking team member status:", error);
    return false;
  }
}

/**
 * Get user role
 * @param {string} userId - The user ID to check
 * @returns {Promise<string|null>} - User role or null if not found
 */
export async function getUserRole(userId) {
  try {
    if (!userId) return null;
    
    const userDoc = await getDoc(doc(db, "users", userId));
    if (!userDoc.exists()) return null;
    
    const userData = userDoc.data();
    return userData.professionalProfile?.role || userData.role || null;
  } catch (error) {
    console.error("Error getting user role:", error);
    return null;
  }
}

/**
 * Check if a route should be blocked for team members
 * @param {string} pathname - The current pathname
 * @returns {boolean} - True if route should be blocked for team members
 */
export function isAdminOnlyRoute(pathname) {
  const adminOnlyRoutes = [
    '/enterprise/checkout',
    '/enterprise/account',
    '/enterprise#pricing'
  ];
  
  return adminOnlyRoutes.some(route => {
    if (route.includes('#')) {
      // Handle hash routes
      const [path, hash] = route.split('#');
      return pathname === path && window.location.hash === `#${hash}`;
    }
    return pathname === route;
  });
}
