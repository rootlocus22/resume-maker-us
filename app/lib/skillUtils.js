/**
 * Utility functions for safe skill rendering across all templates
 */

/**
 * Safely extracts skill name from various skill data formats
 * @param {string|object} skill - The skill data (string or object with name/skill property)
 * @returns {string} - The skill name or empty string if invalid
 */
export const getSkillName = (skill) => {
  if (typeof skill === 'string') {
    return skill.trim();
  }
  
  if (typeof skill === 'object' && skill !== null) {
    const name = skill.name || skill.skill || '';
    return typeof name === 'string' ? name.trim() : '';
  }
  
  return '';
};

/**
 * Safely extracts skill proficiency from various skill data formats
 * @param {string|object} skill - The skill data (string or object with proficiency/level property)
 * @returns {string|null} - The skill proficiency or null if not available
 */
export const getSkillProficiency = (skill) => {
  if (typeof skill === 'object' && skill !== null) {
    return skill.proficiency || skill.level || null;
  }
  
  return null;
};

/**
 * Normalizes skills data to ensure consistent structure
 * @param {Array} skills - Array of skills (strings or objects)
 * @returns {Array} - Array of normalized skill objects
 */
export const normalizeSkills = (skills) => {
  if (!Array.isArray(skills)) return [];
  
  return skills
    .map(skill => ({
      name: getSkillName(skill),
      proficiency: getSkillProficiency(skill)
    }))
    .filter(skill => skill.name && skill.name.length > 0);
};

/**
 * Safely renders skill name with fallback handling
 * @param {string|object} skill - The skill data
 * @param {string} fallback - Fallback text if skill name is invalid (default: 'Skill')
 * @returns {string} - Safe skill name for rendering
 */
export const renderSkillName = (skill, fallback = 'Skill') => {
  const name = getSkillName(skill);
  return name || fallback;
};

/**
 * Safely renders skill with proficiency if available
 * @param {string|object} skill - The skill data
 * @param {boolean} showProficiency - Whether to show proficiency
 * @param {string} fallback - Fallback text if skill name is invalid
 * @returns {string} - Safe skill text for rendering
 */
export const renderSkillWithProficiency = (skill, showProficiency = false, fallback = 'Skill') => {
  const name = renderSkillName(skill, fallback);
  const proficiency = showProficiency ? getSkillProficiency(skill) : null;
  
  if (proficiency) {
    return `${name} (${proficiency})`;
  }
  
  return name;
};
