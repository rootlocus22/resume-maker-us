"use client";

import { useState, useEffect } from 'react';
import { OnePagerTemplates } from './OnePagerTemplates';

export default function OnePagerPreview({ data, template = 'classic', customColors, language, country }) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const generateHTML = () => {
    const templateFunc = OnePagerTemplates[template];
    if (!templateFunc) {
      return '<div style="padding: 20px; text-align: center; color: #666;">Template not found</div>';
    }

    // Helper to extract string value from potential object
    const getString = (val) => {
      if (!val) return '';
      if (typeof val === 'string') return val;
      if (typeof val === 'number') return String(val);
      if (Array.isArray(val)) return val.map(getString).join(', '); // Handle nested arrays
      if (typeof val === 'object') {
        // Comprehensive check for possible keys
        return val.value || val.name || val.label || val.content || val.title || val.skill || val.item || '';
      }
      return String(val);
    };

    // Normalize Data to prevent [object Object]
    const normalizedData = {
      ...data,
      personal: {
        name: getString(data.personal?.name || data.name),
        jobTitle: getString(data.personal?.jobTitle || data.jobTitle || data.title),
        email: getString(data.personal?.email || data.email),
        phone: getString(data.personal?.phone || data.phone),
        location: getString(data.personal?.location || data.address || data.location),
        linkedin: getString(data.personal?.linkedin || data.linkedin),
        portfolio: getString(data.personal?.portfolio || data.portfolio || data.website),
      },
      summary: getString(data.summary || data.personal?.summary),
      experience: (Array.isArray(data.experience) ? data.experience : []).map(exp => ({
        ...exp,
        title: getString(exp.title || exp.jobTitle || exp.position),
        company: getString(exp.company || exp.employer),
        startDate: getString(exp.startDate),
        endDate: getString(exp.endDate),
        location: getString(exp.location),
        description: getString(exp.description)
      })),
      education: (Array.isArray(data.education) ? data.education : []).map(edu => ({
        ...edu,
        degree: getString(edu.degree),
        institution: getString(edu.institution || edu.school),
        graduationDate: getString(edu.graduationDate || edu.date),
        location: getString(edu.location),
        description: getString(edu.description)
      })),
      // Robust skills normalization
      skills: (Array.isArray(data.skills) ? data.skills : []).map(skill => {
        const str = getString(skill);
        return str === '[object Object]' ? '' : str;
      }).filter(s => s && s.trim() !== ''),

      projects: (Array.isArray(data.projects) ? data.projects : []).map(proj => ({
        ...proj,
        name: getString(proj.name || proj.title),
        description: getString(proj.description),
        technologies: getString(proj.technologies || proj.tech),
        link: getString(proj.link || proj.url)
      })),
      certifications: (Array.isArray(data.certifications) ? data.certifications : []).map(cert => ({
        ...cert,
        name: getString(cert.name || cert.title),
        organization: getString(cert.organization || cert.issuer),
        date: getString(cert.date)
      })),
      languages: (Array.isArray(data.languages) ? data.languages : []).map(lang => ({
        language: getString(lang.language || lang.name),
        proficiency: getString(lang.proficiency || lang.level)
      }))
    };

    return templateFunc(normalizedData);
  };

  return (
    <div className="h-full bg-gray-100 overflow-auto">
      <div className={`min-h-full flex items-start ${isMobile ? 'justify-start p-0' : 'justify-center p-4'}`}>
        <div
          className="relative"
          style={{
            width: isMobile ? '100%' : '8.5in',
            minHeight: isMobile ? 'auto' : '11in'
          }}
        >
          <div
            className="bg-white"
            style={{
              width: '100%',
              minHeight: isMobile ? 'auto' : '11in',
              overflow: 'visible',
              boxShadow: isMobile ? 'none' : '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
            }}
            dangerouslySetInnerHTML={{ __html: generateHTML() }}
          />

          {/* UI-only Watermark overlay (does not affect PDF generation) */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 flex items-center justify-center"
            style={{
              opacity: isMobile ? 0.38 : 0.26,
              mixBlendMode: 'multiply',
            }}
          >
            <div
              className="select-none"
              style={{
                transform: 'rotate(-24deg)',
                fontWeight: 800,
                fontSize: isMobile ? '56px' : '96px',
                letterSpacing: '6px',
                color: isMobile ? 'rgba(17,24,39,0.42)' : 'rgba(30,58,138,0.36)',
                WebkitTextStroke: '2px rgba(255,255,255,0.22)',
                textShadow: '0 2px 4px rgba(0,0,0,0.2)',
                textTransform: 'uppercase',
                userSelect: 'none'
              }}
            >
              ExpertResume
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
