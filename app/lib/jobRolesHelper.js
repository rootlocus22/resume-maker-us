// Helper functions for job roles programmatic SEO

import jobRolesData from '../data/job_roles.json';
import nonItRolesData from '../data/non_it_roles.json';
import companyRolesData from '../data/company_roles.json';
import collegeRolesData from '../data/college_roles.json';
import cityRolesData from '../data/city_roles.json';
import generatedRolesData from '../data/generated_roles_light.json'; // Light version for linking

// Combine all role data for searching and linking
const allRoles = [...jobRolesData, ...nonItRolesData, ...companyRolesData, ...collegeRolesData, ...cityRolesData, ...generatedRolesData];

/**
 * Get related job roles based on current slug
 * Returns 5 similar roles for internal linking
 */
export function getRelatedRoles(currentSlug) {
  const currentRole = allRoles.find(role => role.slug === currentSlug);
  if (!currentRole) return [];

  // Define categories for better matching
  const categories = {
    'backend': ['java-developer-resume-india', 'python-developer-resume-india', 'nodejs-developer-resume-india', 'php-developer-resume-india', 'dotnet-developer-resume-india'],
    'frontend': ['react-developer-resume-india', 'frontend-developer-resume-india', 'angular-developer-resume-india', 'vuejs-developer-resume-india', 'ui-developer-resume-india'],
    'fullstack': ['mern-stack-developer-resume-india', 'fullstack-developer-resume-india', 'mean-stack-developer-resume-india'],
    'mobile': ['android-developer-resume-india', 'ios-developer-resume-india', 'react-native-developer-resume-india', 'flutter-developer-resume-india'],
    'data': ['data-analyst-resume-india', 'data-scientist-resume-india', 'business-analyst-resume-india', 'data-engineer-resume-india'],
    'devops': ['devops-engineer-resume-india', 'aws-cloud-engineer-resume-india', 'azure-cloud-engineer-resume-india', 'kubernetes-engineer-resume-india'],
    'qa': ['qa-automation-tester-resume-india', 'manual-tester-resume-india', 'sdet-resume-india'],
    'design': ['ui-ux-designer-resume-india', 'graphic-designer-resume-india', 'product-designer-resume-india'],
    'fresher': ['btech-cs-fresher-resume', 'mba-fresher-resume', 'bcom-graduate-resume', 'mechanical-engineering-fresher-resume', 'civil-engineer-fresher-resume'],
    'finance': ['chartered-accountant-fresher-resume', 'investment-banker-resume-india', 'financial-analyst-resume-india', 'accountant-resume-india'],
    'marketing': ['digital-marketing-manager-resume-india', 'seo-specialist-resume-india', 'content-writer-resume-india', 'social-media-manager-resume-india'],
    'sales': ['sales-manager-resume-india', 'business-development-executive-resume-india', 'account-manager-resume-india'],
    'operations': ['operations-manager-resume-india', 'project-manager-resume-india', 'supply-chain-manager-resume-india'],
    'hr': ['hr-manager-resume-india', 'recruiter-resume-india', 'hr-executive-resume-india'],
    'bpo': ['bpo-executive-resume-india', 'customer-service-executive-resume-india', 'call-center-executive-resume-india', 'resume-format-for-data-entry-operator', 'resume-format-for-receptionist'],
    'banking': ['resume-format-for-bank-po', 'chartered-accountant-fresher-resume', 'investment-banker-resume-india'],
    'media': ['resume-format-for-journalist', 'content-writer-resume-india', 'social-media-manager-resume-india'],
    'retail': ['resume-format-for-store-manager', 'sales-manager-resume-india'],
    'aviation': ['resume-format-for-cabin-crew']
  };

  // Find which category the current role belongs to
  let matchingCategory = null;
  for (const [category, slugs] of Object.entries(categories)) {
    if (slugs.includes(currentSlug)) {
      matchingCategory = category;
      break;
    }
  }

  // If no category match, try keyword-based matching
  if (!matchingCategory) {
    const title = currentRole.job_title.toLowerCase();
    if (title.includes('java') || title.includes('python') || title.includes('backend')) {
      matchingCategory = 'backend';
    } else if (title.includes('react') || title.includes('frontend') || title.includes('ui')) {
      matchingCategory = 'frontend';
    } else if (title.includes('data') || title.includes('analyst')) {
      matchingCategory = 'data';
    } else if (title.includes('fresher') || title.includes('intern')) {
      matchingCategory = 'fresher';
    }
  }

  // Get related roles from same category
  let relatedSlugs = [];
  if (matchingCategory && categories[matchingCategory]) {
    relatedSlugs = categories[matchingCategory]
      .filter(slug => slug !== currentSlug)
      .slice(0, 5);
  }

  // If we don't have enough, add similar experience level roles
  if (relatedSlugs.length < 5) {
    const sameLevelRoles = allRoles
      .filter(role =>
        role.slug !== currentSlug &&
        role.experience_level === currentRole.experience_level
      )
      .map(role => role.slug)
      .slice(0, 5 - relatedSlugs.length);

    relatedSlugs = [...relatedSlugs, ...sameLevelRoles];
  }

  // Convert slugs to full role objects
  const relatedRoles = relatedSlugs
    .map(slug => allRoles.find(role => role.slug === slug))
    .filter(role => role !== undefined)
    .slice(0, 5);

  return relatedRoles;
}

/**
 * Get all roles by category
 */
export function getRolesByCategory(category) {
  return jobRolesData.filter(role => {
    const title = role.job_title.toLowerCase();
    const slug = role.slug.toLowerCase();

    switch (category) {
      case 'tech':
        return title.includes('developer') || title.includes('engineer') ||
          title.includes('programmer') || title.includes('architect') ||
          slug.includes('developer') || slug.includes('engineer');
      case 'fresher':
        return role.experience_level.toLowerCase().includes('fresher') ||
          role.experience_level.toLowerCase().includes('entry') ||
          slug.includes('fresher') || slug.includes('intern');
      case 'non-tech':
        return !title.includes('developer') && !title.includes('engineer') &&
          !title.includes('programmer') && !title.includes('architect');
      default:
        return true;
    }
  });
}

/**
 * Get role by slug
 */
export function getRoleBySlug(slug) {
  return jobRolesData.find(role => role.slug === slug);
}

/**
 * Get all job titles for autocomplete/search
 */
export function getAllJobTitles() {
  return jobRolesData.map(role => ({
    title: role.job_title,
    slug: role.slug,
    experience_level: role.experience_level
  }));
}

