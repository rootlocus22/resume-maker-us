"use client";
import { useRouter } from "next/navigation";
import { Zap, Crown } from "lucide-react";
import toast from "react-hot-toast";

export default function OnePagerButton({ data }) {
  const router = useRouter();

  const handleOnePagerClick = () => {
    // Check if resume has meaningful data (not just default John Doe)
    const hasRealData = data?.name && 
                        data.name.toLowerCase() !== 'john doe' &&
                        data.name.trim() !== '';
    
    if (hasRealData) {
      // Convert resume data to one-pager format
      const onePagerData = {
        personal: {
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          location: data.location || '',
          linkedin: data.linkedin || '',
          github: data.github || '',
          portfolio: data.portfolio || '',
          jobTitle: data.title || data.jobTitle || ''
        },
        summary: data.summary || data.objective || '',
        experience: (data.experience || []).map(exp => {
          // Clean description from any JSON artifacts and convert markdown to HTML
          let description = exp.description || exp.responsibilities || '';
          
          if (typeof description === 'object') {
            description = JSON.stringify(description);
          }
          
          if (typeof description === 'string') {
            // Remove JSON markdown artifacts
            description = description
              .replace(/```json\n?/g, '')
              .replace(/```\n?/g, '')
              .trim();
            
            // Check if description is a JSON array format like ["item1","item2","item3"]
            if (description.startsWith('[') && description.endsWith(']')) {
              try {
                const items = JSON.parse(description);
                if (Array.isArray(items)) {
                  // Convert array items to bullet points
                  description = items
                    .map(item => {
                      // Apply markdown formatting to each item
                      let formatted = item
                        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                        .replace(/__(.+?)__/g, '<strong>$1</strong>')
                        .replace(/\*(.+?)\*/g, '<em>$1</em>')
                        .replace(/_(.+?)_/g, '<em>$1</em>')
                        .replace(/`([^`]+)`/g, '$1');
                      return `• ${formatted}`;
                    })
                    .join('\n');
                }
              } catch (e) {
                // If JSON parsing fails, continue with regular markdown processing
                console.log('Failed to parse JSON array in experience description:', e);
              }
            }
            
            // If not JSON array or parsing failed, apply regular markdown formatting
            if (!description.includes('•')) {
              // Convert markdown formatting to HTML
              // Bold text: **text** or __text__ -> <strong>text</strong>
              description = description.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
              description = description.replace(/__(.+?)__/g, '<strong>$1</strong>');
              
              // Italic text: *text* or _text_ -> <em>$1</em>
              description = description.replace(/\*(.+?)\*/g, '<em>$1</em>');
              description = description.replace(/_(.+?)_/g, '<em>$1</em>');
              
              // Bullet points with square brackets: [text] -> • text
              description = description.replace(/^\[([^\]]+)\]/gm, '• $1');
              description = description.replace(/^[-*]\s+/gm, '• ');
              
              // Inline code: `code` -> remove backticks for cleaner look
              description = description.replace(/`([^`]+)`/g, '$1');
            }
          }
          
          return {
            title: exp.title || exp.position || '',
            company: exp.company || '',
            location: exp.location || '',
            startDate: exp.startDate || '',
            endDate: exp.endDate || exp.current ? 'Present' : '',
            description: description
          };
        }),
        education: (data.education || []).map(edu => ({
          degree: edu.degree || '',
          school: edu.school || edu.institution || '',
          location: edu.location || '',
          graduationDate: edu.graduationDate || edu.endDate || '',
          description: edu.description || edu.details || ''
        })),
        skills: (data.skills || []).map(skill => {
          // Handle both string and object formats
          if (typeof skill === 'string') return skill;
          if (typeof skill === 'object' && skill.name) return skill.name;
          return String(skill);
        }).filter(Boolean),
        projects: (data.projects || []).map(proj => ({
          name: proj.name || proj.title || '',
          technologies: proj.technologies || proj.tech || '',
          description: proj.description || '',
          link: proj.link || proj.url || ''
        })),
        certifications: (data.certifications || []).map(cert => ({
          name: cert.name || cert.title || '',
          issuer: cert.issuer || cert.organization || '',
          date: cert.date || cert.year || '',
          description: cert.description || ''
        })),
        languages: (data.languages || []).map(lang => ({
          language: lang.language || lang.name || '',
          proficiency: lang.proficiency || 'Professional'
        })),
        awards: (data.customSections || [])
          .filter(section => section.type === 'award')
          .map(award => ({
            title: award.title || '',
            issuer: award.description || '',
            date: award.date || '',
            description: award.description || ''
          }))
      };
      
      // Store in localStorage for one-pager editor to pick up
      localStorage.setItem('onePagerData', JSON.stringify(onePagerData));
      
      // Show success message
      toast.success('✨ Transferring your resume to One-Pager builder...');
      
      // Navigate to one-pager editor
      router.push('/one-pager-builder/editor');
    } else {
      // No meaningful data, just navigate to builder
      router.push('/one-pager-builder');
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleOnePagerClick}
        className={`
          relative flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md font-semibold text-xs transition-all duration-200
          bg-white border border-blue-200 text-blue-700 hover:bg-blue-50 hover:shadow-sm
        `}
        title="Create one-page resume"
      >
        <Zap size={14} />
        <Crown size={12} />
        <span className="hidden lg:inline">
          One-Pager
        </span>
        <span className="lg:hidden">
          1-Page
        </span>
      </button>
      
      {/* Premium badge */}
      <div className="absolute -top-1 -right-1 bg-yellow-400 text-yellow-900 text-xs px-1.5 py-0.5 rounded-full font-bold">
        PRO
      </div>
    </div>
  );
} 