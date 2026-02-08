import { format } from 'date-fns';

export const formatResumeDate = (dateStr, preferences) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const { dateFormat } = preferences;
  return format(date, dateFormat.format);
};

export const getSkillsLayoutClass = (displayStyle) => {
  switch (displayStyle) {
    case 'grid':
      return 'grid grid-cols-2 gap-2';
    case 'tags':
      return 'flex flex-wrap gap-2';
    default:
      return 'space-y-1';
  }
};

export const formatProficiency = (proficiency, scaleType) => {
  switch (scaleType) {
    case '1-5':
      return `${proficiency}/5`;
    case 'beginner-expert':
      const levels = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
      const index = Math.floor((proficiency / 5) * (levels.length - 1));
      return levels[index];
    case 'percentage':
      return `${Math.round((proficiency / 5) * 100)}%`;
    default:
      return proficiency;
  }
};

export const groupSkillsByCategory = (skills) => {
  return skills.reduce((acc, skill) => {
    const category = skill.category || 'Other';
    acc[category] = acc[category] || [];
    acc[category].push(skill);
    return acc;
  }, {});
};
