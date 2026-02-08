"use client";

// Helper function to format bullet points properly
const safeFormatBullets = (text) => {
  try {
    if (!text) return '';

    // Ensure text is a string
    const safeText = typeof text === 'string' ? text : String(text);

    if (typeof safeText.split !== 'function') return '';

    const lines = safeText.split('\n');
    let html = '';
    let inList = false;

    lines.forEach((line) => {
      const trimmedLine = line.trim();

      // Check if line is a bullet point (starts with •, -, *, or number.)
      const isBullet = /^[•\-\*\u2022\u2023\u25E6\u2043\u2219]/.test(trimmedLine) || /^\d+\./.test(trimmedLine);

      if (isBullet) {
        // Remove bullet character and trim
        const content = trimmedLine.replace(/^[•\-\*\u2022\u2023\u25E6\u2043\u2219]\s*/, '').replace(/^\d+\.\s*/, '');

        if (!inList) {
          html += '<ul style="margin: 0; padding-left: 20px; list-style-type: disc;">';
          inList = true;
        }

        html += `<li style="margin-bottom: 2px;">${content}</li>`;
      } else if (trimmedLine) {
        // Regular text line
        if (inList) {
          html += '</ul>';
          inList = false;
        }
        html += `<div>${trimmedLine}</div>`;
      }
    });

    if (inList) {
      html += '</ul>';
    }

    return html || safeText;
  } catch (e) {
    console.warn('Error formatting bullets:', e);
    return text || '';
  }
};

// 6 One-Pager Templates optimized for single page
export const OnePagerTemplates = {
  // Template 1: Classic Professional - Clean single column
  classic: (data) => {
    const personal = data.personal || {};
    const summary = data.summary || '';
    const experience = data.experience || [];
    const education = data.education || [];
    const skills = data.skills || [];
    const projects = data.projects || [];
    const certifications = data.certifications || [];
    const languages = data.languages || [];
    const awards = data.awards || [];

    return `
      <div style="font-family: 'Arial', sans-serif; max-width: 800px; margin: 0 auto; padding: 30px 40px; font-size: 9pt; line-height: 1.3;">
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 15px; border-bottom: 2px solid #2563eb; padding-bottom: 10px;">
          <h1 style="margin: 0; font-size: 20pt; color: #1e293b; font-weight: 700;">${personal.name || 'Your Name'}</h1>
          <p style="margin: 3px 0; font-size: 11pt; color: #475569; font-weight: 500;">${personal.jobTitle || 'Professional Title'}</p>
          <div style="font-size: 8pt; color: #64748b; margin-top: 5px;">
            ${personal.email ? `<span style="margin: 0 8px;">${personal.email}</span>` : ''}
            ${personal.phone ? `<span style="margin: 0 8px;">|</span><span style="margin: 0 8px;">${personal.phone}</span>` : ''}
            ${personal.location ? `<span style="margin: 0 8px;">|</span><span style="margin: 0 8px;">${personal.location}</span>` : ''}
          </div>
          ${personal.linkedin || personal.portfolio ? `
            <div style="font-size: 8pt; color: #3b82f6; margin-top: 3px;">
              ${personal.linkedin ? `<span style="margin: 0 8px;">${personal.linkedin}</span>` : ''}
              ${personal.portfolio ? `<span style="margin: 0 8px;">|</span><span style="margin: 0 8px;">${personal.portfolio}</span>` : ''}
            </div>
          ` : ''}
        </div>

        ${summary ? `
          <!-- Summary -->
          <div style="margin-bottom: 12px;">
            <h2 style="font-size: 11pt; color: #1e293b; margin: 0 0 5px 0; font-weight: 700; border-bottom: 1px solid #e2e8f0; padding-bottom: 3px;">PROFESSIONAL SUMMARY</h2>
            <p style="margin: 0; color: #334155; text-align: justify;">${summary}</p>
          </div>
        ` : ''}

        ${experience.length > 0 ? `
          <!-- Experience -->
          <div style="margin-bottom: 12px;">
            <h2 style="font-size: 11pt; color: #1e293b; margin: 0 0 5px 0; font-weight: 700; border-bottom: 1px solid #e2e8f0; padding-bottom: 3px;">WORK EXPERIENCE</h2>
            ${experience.map(exp => `
              <div style="margin-bottom: 8px;">
                <div style="display: flex; justify-content: space-between; align-items: baseline;">
                  <strong style="font-size: 10pt; color: #1e293b;">${exp.title || ''}</strong>
                  <span style="font-size: 8pt; color: #64748b;">${exp.startDate || ''} - ${exp.endDate || ''}</span>
                </div>
                <div style="color: #475569; font-size: 9pt; font-style: italic; margin-bottom: 3px;">${exp.company || ''}${exp.location ? ` | ${exp.location}` : ''}</div>
                <p style="margin: 0; color: #334155;">${safeFormatBullets(exp.description)}</p>
              </div>
            `).join('')}
          </div>
        ` : ''}

        ${education.length > 0 ? `
          <!-- Education -->
          <div style="margin-bottom: 12px;">
            <h2 style="font-size: 11pt; color: #1e293b; margin: 0 0 5px 0; font-weight: 700; border-bottom: 1px solid #e2e8f0; padding-bottom: 3px;">EDUCATION</h2>
            ${education.map(edu => `
              <div style="margin-bottom: 6px;">
                <div style="display: flex; justify-content: space-between; align-items: baseline;">
                  <strong style="font-size: 10pt; color: #1e293b;">${edu.degree || ''}</strong>
                  <span style="font-size: 8pt; color: #64748b;">${edu.graduationDate || ''}</span>
                </div>
                <div style="color: #475569; font-size: 9pt;">${edu.institution || ''}${edu.location ? ` | ${edu.location}` : ''}${edu.gpa ? ` | GPA: ${edu.gpa}` : ''}</div>
                ${edu.description ? `<p style="margin: 2px 0 0 0; color: #334155; font-size: 8pt;">${edu.description}</p>` : ''}
              </div>
            `).join('')}
          </div>
        ` : ''}

        ${skills.length > 0 ? `
          <!-- Skills -->
          <div style="margin-bottom: 12px;">
            <h2 style="font-size: 11pt; color: #1e293b; margin: 0 0 5px 0; font-weight: 700; border-bottom: 1px solid #e2e8f0; padding-bottom: 3px;">SKILLS</h2>
            <p style="margin: 0; color: #334155;">${skills.join(' • ')}</p>
          </div>
        ` : ''}

        ${projects.length > 0 ? `
          <!-- Projects -->
          <div style="margin-bottom: 12px;">
            <h2 style="font-size: 11pt; color: #1e293b; margin: 0 0 5px 0; font-weight: 700; border-bottom: 1px solid #e2e8f0; padding-bottom: 3px;">PROJECTS</h2>
            ${projects.map(proj => `
              <div style="margin-bottom: 6px;">
                <strong style="font-size: 10pt; color: #1e293b;">${proj.name || ''}</strong>${proj.technologies ? ` <span style="font-size: 8pt; color: #64748b;">(${proj.technologies})</span>` : ''}
                <p style="margin: 2px 0 0 0; color: #334155;">${safeFormatBullets(proj.description)}</p>
                ${proj.link ? `<a href="${proj.link}" style="font-size: 8pt; color: #3b82f6; text-decoration: none;">${proj.link}</a>` : ''}
              </div>
            `).join('')}
          </div>
        ` : ''}

        ${certifications.length > 0 ? `
          <!-- Certifications -->
          <div style="margin-bottom: 12px;">
            <h2 style="font-size: 11pt; color: #1e293b; margin: 0 0 5px 0; font-weight: 700; border-bottom: 1px solid #e2e8f0; padding-bottom: 3px;">CERTIFICATIONS</h2>
            ${certifications.map(cert => `
              <div style="margin-bottom: 4px;">
                <strong style="font-size: 9pt; color: #1e293b;">${cert.name || ''}</strong> - <span style="color: #475569; font-size: 9pt;">${cert.issuer || ''}</span> <span style="font-size: 8pt; color: #64748b;">(${cert.date || ''})</span>
              </div>
            `).join('')}
          </div>
        ` : ''}

        ${languages.length > 0 ? `
          <!-- Languages -->
          <div style="margin-bottom: 12px;">
            <h2 style="font-size: 11pt; color: #1e293b; margin: 0 0 5px 0; font-weight: 700; border-bottom: 1px solid #e2e8f0; padding-bottom: 3px;">LANGUAGES</h2>
            <p style="margin: 0; color: #334155;">
              ${languages.map(lang => `${lang.language || ''} (${lang.proficiency || ''})`).join(' • ')}
            </p>
          </div>
        ` : ''}

        ${awards.length > 0 ? `
          <!-- Awards -->
          <div>
            <h2 style="font-size: 11pt; color: #1e293b; margin: 0 0 5px 0; font-weight: 700; border-bottom: 1px solid #e2e8f0; padding-bottom: 3px;">AWARDS & HONORS</h2>
            ${awards.map(award => `
              <div style="margin-bottom: 6px;">
                <strong style="font-size: 10pt; color: #1e293b;">${award.title || ''}</strong>
                <div style="color: #475569; font-size: 9pt;">${award.issuer || ''}${award.date ? ` | ${award.date}` : ''}</div>
                ${award.description ? `<p style="margin: 2px 0 0 0; color: #334155; font-size: 8pt;">${award.description}</p>` : ''}
              </div>
            `).join('')}
          </div>
        ` : ''}
      </div>
    `;
  },

  // Template 2: Modern Two-Column - Sidebar layout
  modern: (data) => {
    const personal = data.personal || {};
    const summary = data.summary || '';
    const experience = data.experience || [];
    const education = data.education || [];
    const skills = data.skills || [];
    const projects = data.projects || [];
    const certifications = data.certifications || [];
    const languages = data.languages || [];
    const awards = data.awards || [];

    return `
      <div style="font-family: 'Arial', sans-serif; display: flex; max-width: 800px; margin: 0 auto; font-size: 9pt; line-height: 1.2;">
        <!-- Left Sidebar -->
        <div style="width: 35%; background: #1e293b; color: #ffffff; padding: 25px 20px;">
          <div style="margin-bottom: 20px;">
            <h1 style="margin: 0 0 3px 0; font-size: 18pt; font-weight: 700;">${personal.name || 'Your Name'}</h1>
            <p style="margin: 0; font-size: 10pt; color: #94a3b8;">${personal.jobTitle || 'Professional Title'}</p>
          </div>

          <!-- Contact -->
          <div style="margin-bottom: 15px;">
            <h3 style="font-size: 10pt; margin: 0 0 5px 0; color: #60a5fa; font-weight: 700; border-bottom: 1px solid #475569; padding-bottom: 2px;">CONTACT</h3>
            <div style="font-size: 8pt; line-height: 1.4;">
              ${personal.email ? `<div style="margin-bottom: 3px; word-break: break-all;">${personal.email}</div>` : ''}
              ${personal.phone ? `<div style="margin-bottom: 3px;">${personal.phone}</div>` : ''}
              ${personal.location ? `<div style="margin-bottom: 3px;">${personal.location}</div>` : ''}
              ${personal.linkedin ? `<div style="margin-bottom: 3px; word-break: break-all; color: #93c5fd;">${personal.linkedin}</div>` : ''}
              ${personal.portfolio ? `<div style="word-break: break-all; color: #93c5fd;">${personal.portfolio}</div>` : ''}
            </div>
          </div>

          ${skills.length > 0 ? `
            <!-- Skills -->
            <div style="margin-bottom: 15px;">
              <h3 style="font-size: 10pt; margin: 0 0 5px 0; color: #60a5fa; font-weight: 700; border-bottom: 1px solid #475569; padding-bottom: 2px;">SKILLS</h3>
              <div style="font-size: 8pt; line-height: 1.5;">
                ${skills.map(skill => `<div style="margin-bottom: 2px;">• ${skill}</div>`).join('')}
              </div>
            </div>
          ` : ''}

          ${education.length > 0 ? `
            <!-- Education -->
            <div style="margin-bottom: 15px;">
              <h3 style="font-size: 10pt; margin: 0 0 5px 0; color: #60a5fa; font-weight: 700; border-bottom: 1px solid #475569; padding-bottom: 2px;">EDUCATION</h3>
              ${education.map(edu => `
                <div style="margin-bottom: 8px; font-size: 8pt;">
                  <div style="font-weight: 600; margin-bottom: 2px;">${edu.degree || ''}</div>
                  <div style="color: #cbd5e1; margin-bottom: 1px;">${edu.institution || ''}</div>
                  <div style="color: #94a3b8; font-size: 7pt;">${edu.graduationDate || ''}${edu.gpa ? ` | ${edu.gpa}` : ''}</div>
                  ${edu.description ? `<div style="color: #cbd5e1; margin-top: 2px; font-size: 7pt;">${edu.description}</div>` : ''}
                </div>
              `).join('')}
            </div>
          ` : ''}

          ${certifications.length > 0 ? `
            <!-- Certifications -->
            <div style="margin-bottom: 15px;">
              <h3 style="font-size: 10pt; margin: 0 0 5px 0; color: #60a5fa; font-weight: 700; border-bottom: 1px solid #475569; padding-bottom: 2px;">CERTIFICATIONS</h3>
              ${certifications.map(cert => `
                <div style="margin-bottom: 6px; font-size: 8pt;">
                  <div style="font-weight: 600; margin-bottom: 1px;">${cert.name || ''}</div>
                  <div style="color: #cbd5e1; font-size: 7pt;">${cert.issuer || ''}</div>
                  <div style="color: #94a3b8; font-size: 7pt;">${cert.date || ''}</div>
                </div>
              `).join('')}
            </div>
          ` : ''}

          ${languages.length > 0 ? `
            <!-- Languages -->
            <div style="margin-bottom: 15px;">
              <h3 style="font-size: 10pt; margin: 0 0 5px 0; color: #60a5fa; font-weight: 700; border-bottom: 1px solid #475569; padding-bottom: 2px;">LANGUAGES</h3>
              ${languages.map(lang => `
                <div style="margin-bottom: 4px; font-size: 8pt;">
                  <div style="font-weight: 600; color: #f1f5f9;">${lang.language || ''}</div>
                  <div style="color: #cbd5e1; font-size: 7pt;">${lang.proficiency || ''}</div>
                </div>
              `).join('')}
            </div>
          ` : ''}

          ${awards.length > 0 ? `
            <!-- Awards -->
            <div>
              <h3 style="font-size: 10pt; margin: 0 0 5px 0; color: #60a5fa; font-weight: 700; border-bottom: 1px solid #475569; padding-bottom: 2px;">AWARDS</h3>
              ${awards.map(award => `
                <div style="margin-bottom: 6px; font-size: 8pt;">
                  <div style="font-weight: 600; margin-bottom: 1px;">${award.title || ''}</div>
                  <div style="color: #cbd5e1; font-size: 7pt;">${award.issuer || ''}${award.date ? ` | ${award.date}` : ''}</div>
                </div>
              `).join('')}
            </div>
          ` : ''}
        </div>

        <!-- Right Content -->
        <div style="width: 65%; padding: 25px 20px;">
          ${summary ? `
            <!-- Summary -->
            <div style="margin-bottom: 15px;">
              <h2 style="font-size: 11pt; color: #1e293b; margin: 0 0 5px 0; font-weight: 700; border-bottom: 2px solid #3b82f6; padding-bottom: 3px;">PROFILE</h2>
              <p style="margin: 0; color: #334155; text-align: justify;">${summary}</p>
            </div>
          ` : ''}

          ${experience.length > 0 ? `
            <!-- Experience -->
            <div style="margin-bottom: 15px;">
              <h2 style="font-size: 11pt; color: #1e293b; margin: 0 0 5px 0; font-weight: 700; border-bottom: 2px solid #3b82f6; padding-bottom: 3px;">EXPERIENCE</h2>
              ${experience.map(exp => `
                <div style="margin-bottom: 10px;">
                  <div style="display: flex; justify-content: space-between; align-items: baseline;">
                    <strong style="font-size: 10pt; color: #1e293b;">${exp.title || ''}</strong>
                    <span style="font-size: 8pt; color: #64748b;">${exp.startDate || ''} - ${exp.endDate || ''}</span>
                  </div>
                  <div style="color: #3b82f6; font-size: 9pt; font-weight: 600; margin-bottom: 3px;">${exp.company || ''}${exp.location ? ` | ${exp.location}` : ''}</div>
                  <p style="margin: 0; color: #334155;  font-size: 8.5pt;">${safeFormatBullets(exp.description)}</p>
                </div>
              `).join('')}
            </div>
          ` : ''}

          ${projects.length > 0 ? `
            <!-- Projects -->
            <div>
              <h2 style="font-size: 11pt; color: #1e293b; margin: 0 0 5px 0; font-weight: 700; border-bottom: 2px solid #3b82f6; padding-bottom: 3px;">PROJECTS</h2>
              ${projects.map(proj => `
                <div style="margin-bottom: 8px;">
                  <strong style="font-size: 9pt; color: #1e293b;">${proj.name || ''}</strong>${proj.technologies ? ` <span style="font-size: 7pt; color: #64748b;">(${proj.technologies})</span>` : ''}
                  <p style="margin: 2px 0 0 0; color: #334155; font-size: 8pt;">${safeFormatBullets(proj.description)}</p>
                </div>
              `).join('')}
            </div>
          ` : ''}
        </div>
      </div>
    `;
  },

  // Template 3: Compact Minimal - Maximum space utilization
  compact: (data) => {
    const personal = data.personal || {};
    const summary = data.summary || '';
    const experience = data.experience || [];
    const education = data.education || [];
    const skills = data.skills || [];
    const projects = data.projects || [];
    const certifications = data.certifications || [];
    const languages = data.languages || [];
    const awards = data.awards || [];

    return `
      <div style="font-family: 'Helvetica', sans-serif; max-width: 800px; margin: 0 auto; padding: 20px 30px; font-size: 8.5pt; line-height: 1.15;">
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 10px;">
          <h1 style="margin: 0; font-size: 18pt; color: #000; font-weight: 700; letter-spacing: 1px;">${personal.name || 'YOUR NAME'}</h1>
          <div style="font-size: 7.5pt; color: #333; margin-top: 3px;">
            ${[personal.email, personal.phone, personal.location, personal.linkedin, personal.portfolio].filter(Boolean).join(' | ')}
          </div>
        </div>

        ${summary ? `<div style="margin-bottom: 8px;"><strong style="font-size: 9pt;">SUMMARY:</strong> <span style="color: #333;">${summary}</span></div>` : ''}

        ${experience.length > 0 ? `
          <div style="margin-bottom: 8px;">
            <div style="font-weight: 700; font-size: 9pt; margin-bottom: 4px; border-bottom: 1px solid #000;">EXPERIENCE</div>
            ${experience.map(exp => `
              <div style="margin-bottom: 6px;">
                <div style="display: flex; justify-content: space-between;">
                  <span><strong>${exp.title || ''}</strong> | ${exp.company || ''}</span>
                  <span style="font-size: 7.5pt;">${exp.startDate || ''} - ${exp.endDate || ''}</span>
                </div>
                <div style="color: #333; margin-top: 1px; ">${safeFormatBullets(exp.description)}</div>
              </div>
            `).join('')}
          </div>
        ` : ''}

        ${education.length > 0 ? `
          <div style="margin-bottom: 8px;">
            <div style="font-weight: 700; font-size: 9pt; margin-bottom: 4px; border-bottom: 1px solid #000;">EDUCATION</div>
            ${education.map(edu => `
              <div style="margin-bottom: 4px;">
                <div style="display: flex; justify-content: space-between;">
                  <span><strong>${edu.degree || ''}</strong> | ${edu.institution || ''}</span>
                  <span style="font-size: 7.5pt;">${edu.graduationDate || ''}${edu.gpa ? ` | ${edu.gpa}` : ''}</span>
                </div>
                ${edu.description ? `<div style="color: #333; font-size: 7.5pt; margin-top: 1px;">${edu.description}</div>` : ''}
              </div>
            `).join('')}
          </div>
        ` : ''}

        <div style="display: grid; grid-template-columns: ${projects.length > 0 ? '1fr 1fr' : '1fr'}; gap: 10px;">
          ${skills.length > 0 ? `
            <div>
              <div style="font-weight: 700; font-size: 9pt; margin-bottom: 3px; border-bottom: 1px solid #000;">SKILLS</div>
              <div style="color: #333; font-size: 7.5pt;">${skills.join(', ')}</div>
            </div>
          ` : ''}

          ${projects.length > 0 ? `
            <div>
              <div style="font-weight: 700; font-size: 9pt; margin-bottom: 3px; border-bottom: 1px solid #000;">PROJECTS</div>
              ${projects.map(proj => `
                <div style="margin-bottom: 4px;">
                  <strong style="font-size: 8pt;">${proj.name || ''}</strong>
                  <div style="color: #333; font-size: 7.5pt; margin-top: 1px;">${safeFormatBullets(proj.description)}</div>
                </div>
              `).join('')}
            </div>
          ` : ''}
        </div>

        ${certifications.length > 0 ? `
          <div style="margin-top: 8px;">
            <div style="font-weight: 700; font-size: 9pt; margin-bottom: 3px; border-bottom: 1px solid #000;">CERTIFICATIONS</div>
            <div style="font-size: 7.5pt; color: #333;">
              ${certifications.map(cert => `${cert.name || ''} - ${cert.issuer || ''} (${cert.date || ''})`).join(' | ')}
            </div>
          </div>
        ` : ''}

        ${languages.length > 0 ? `
          <div style="margin-top: 8px;">
            <div style="font-weight: 700; font-size: 9pt; margin-bottom: 3px; border-bottom: 1px solid #000;">LANGUAGES</div>
            <div style="font-size: 7.5pt; color: #333;">
              ${languages.map(lang => `${lang.language || ''} (${lang.proficiency || ''})`).join(' • ')}
            </div>
          </div>
        ` : ''}

        ${awards.length > 0 ? `
          <div style="margin-top: 8px;">
            <div style="font-weight: 700; font-size: 9pt; margin-bottom: 3px; border-bottom: 1px solid #000;">AWARDS</div>
            ${awards.map(award => `
              <div style="margin-top: 3px; font-size: 7.5pt;">
                <strong>${award.title || ''}</strong> - ${award.issuer || ''}${award.date ? ` (${award.date})` : ''}
              </div>
            `).join('')}
          </div>
        ` : ''}
      </div>
    `;
  },

  // Template 4: Executive - Professional with accent color
  executive: (data) => {
    const personal = data.personal || {};
    const summary = data.summary || '';
    const experience = data.experience || [];
    const education = data.education || [];
    const skills = data.skills || [];
    const projects = data.projects || [];
    const certifications = data.certifications || [];
    const languages = data.languages || [];
    const awards = data.awards || [];

    return `
      <div style="font-family: 'Georgia', serif; max-width: 800px; margin: 0 auto; padding: 25px 35px; font-size: 9pt; line-height: 1.25;">
        <!-- Header with accent bar -->
        <div style="border-left: 5px solid #1e40af; padding-left: 15px; margin-bottom: 15px;">
          <h1 style="margin: 0; font-size: 22pt; color: #1e293b; font-weight: 700;">${personal.name || 'Your Name'}</h1>
          <p style="margin: 3px 0 0 0; font-size: 11pt; color: #64748b; font-style: italic;">${personal.jobTitle || 'Professional Title'}</p>
        </div>

        <!-- Contact Bar -->
        <div style="background: #f8fafc; padding: 8px 15px; margin-bottom: 15px; border-left: 3px solid #1e40af; font-size: 8pt; color: #475569;">
          ${[personal.email, personal.phone, personal.location].filter(Boolean).join(' • ')}
          ${personal.linkedin || personal.portfolio ? `<br/>${[personal.linkedin, personal.portfolio].filter(Boolean).join(' • ')}` : ''}
        </div>

        ${summary ? `
          <div style="margin-bottom: 12px;">
            <h2 style="font-size: 11pt; color: #1e40af; margin: 0 0 5px 0; font-weight: 700; letter-spacing: 0.5px;">EXECUTIVE SUMMARY</h2>
            <p style="margin: 0; color: #334155; text-align: justify; font-size: 9pt;">${summary}</p>
          </div>
        ` : ''}

        ${experience.length > 0 ? `
          <div style="margin-bottom: 12px;">
            <h2 style="font-size: 11pt; color: #1e40af; margin: 0 0 5px 0; font-weight: 700; letter-spacing: 0.5px;">PROFESSIONAL EXPERIENCE</h2>
            ${experience.map(exp => `
              <div style="margin-bottom: 10px;">
                <div style="display: flex; justify-content: space-between; align-items: baseline;">
                  <div>
                    <strong style="font-size: 10pt; color: #1e293b;">${exp.title || ''}</strong>
                    <span style="color: #64748b; font-size: 9pt; font-style: italic;"> at ${exp.company || ''}</span>
                  </div>
                  <span style="font-size: 8pt; color: #64748b;">${exp.startDate || ''} - ${exp.endDate || ''}</span>
                </div>
                ${exp.location ? `<div style="color: #64748b; font-size: 8pt; margin-bottom: 3px;">${exp.location}</div>` : ''}
                <p style="margin: 0; color: #334155; ">${safeFormatBullets(exp.description)}</p>
              </div>
            `).join('')}
          </div>
        ` : ''}

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 12px;">
          ${education.length > 0 ? `
            <div>
              <h2 style="font-size: 11pt; color: #1e40af; margin: 0 0 5px 0; font-weight: 700; letter-spacing: 0.5px;">EDUCATION</h2>
              ${education.map(edu => `
                <div style="margin-bottom: 6px;">
                  <strong style="font-size: 9pt; color: #1e293b;">${edu.degree || ''}</strong>
                  <div style="color: #475569; font-size: 8pt;">${edu.institution || ''}</div>
                  <div style="color: #64748b; font-size: 7.5pt;">${edu.graduationDate || ''}${edu.gpa ? ` | ${edu.gpa}` : ''}</div>
                  ${edu.description ? `<div style="color: #334155; font-size: 7.5pt; margin-top: 2px;">${edu.description}</div>` : ''}
                </div>
              `).join('')}
            </div>
          ` : ''}

          ${skills.length > 0 ? `
            <div>
              <h2 style="font-size: 11pt; color: #1e40af; margin: 0 0 5px 0; font-weight: 700; letter-spacing: 0.5px;">CORE COMPETENCIES</h2>
              <div style="color: #334155; font-size: 8pt; line-height: 1.4;">
                ${skills.map(skill => `• ${skill}`).join('<br/>')}
              </div>
            </div>
          ` : ''}
        </div>

        ${projects.length > 0 ? `
          <div style="margin-bottom: 12px;">
            <h2 style="font-size: 11pt; color: #1e40af; margin: 0 0 5px 0; font-weight: 700; letter-spacing: 0.5px;">KEY PROJECTS</h2>
            ${projects.map(proj => `
              <div style="margin-bottom: 6px;">
                <strong style="font-size: 9pt; color: #1e293b;">${proj.name || ''}</strong>${proj.technologies ? ` <span style="font-size: 7.5pt; color: #64748b;">[${proj.technologies}]</span>` : ''}
                <p style="margin: 2px 0 0 0; color: #334155; font-size: 8pt;">${safeFormatBullets(proj.description)}</p>
              </div>
            `).join('')}
          </div>
        ` : ''}

        ${certifications.length > 0 ? `
          <div style="margin-bottom: 12px;">
            <h2 style="font-size: 11pt; color: #1e40af; margin: 0 0 5px 0; font-weight: 700; letter-spacing: 0.5px;">CERTIFICATIONS</h2>
            ${certifications.map(cert => `
              <div style="margin-bottom: 3px; font-size: 8pt;">
                <strong style="color: #1e293b;">${cert.name || ''}</strong> - ${cert.issuer || ''} <span style="color: #64748b;">(${cert.date || ''})</span>
              </div>
            `).join('')}
          </div>
        ` : ''}

        ${languages.length > 0 ? `
          <div style="margin-bottom: 12px;">
            <h2 style="font-size: 11pt; color: #1e40af; margin: 0 0 5px 0; font-weight: 700; letter-spacing: 0.5px;">LANGUAGES</h2>
            <div style="color: #334155; font-size: 8pt; line-height: 1.4;">
              ${languages.map(lang => `• ${lang.language || ''} - ${lang.proficiency || ''}`).join('<br/>')}
            </div>
          </div>
        ` : ''}

        ${awards.length > 0 ? `
          <div>
            <h2 style="font-size: 11pt; color: #1e40af; margin: 0 0 5px 0; font-weight: 700; letter-spacing: 0.5px;">AWARDS & HONORS</h2>
            ${awards.map(award => `
              <div style="margin-bottom: 6px; font-size: 8pt;">
                <strong style="color: #1e293b;">${award.title || ''}</strong>
                <div style="color: #64748b; font-size: 7.5pt;">${award.issuer || ''}${award.date ? ` | ${award.date}` : ''}</div>
                ${award.description ? `<div style="color: #334155; margin-top: 2px; font-size: 7.5pt;">${award.description}</div>` : ''}
              </div>
            `).join('')}
          </div>
        ` : ''}
      </div>
    `;
  },

  // Template 5: Tech-focused - Modern tech style
  tech: (data) => {
    const personal = data.personal || {};
    const summary = data.summary || '';
    const experience = data.experience || [];
    const education = data.education || [];
    const skills = data.skills || [];
    const projects = data.projects || [];
    const certifications = data.certifications || [];
    const languages = data.languages || [];
    const awards = data.awards || [];

    return `
      <div style="font-family: 'Courier New', monospace; max-width: 800px; margin: 0 auto; padding: 25px 35px; font-size: 8.5pt; line-height: 1.2; background: #fafafa;">
        <!-- Header -->
        <div style="background: #000; color: #0f0; padding: 12px 15px; margin: -25px -35px 15px -35px; font-family: monospace;">
          <div style="font-size: 20pt; font-weight: 700; margin-bottom: 3px;">$ whoami</div>
          <div style="font-size: 12pt; color: #0f0;">> ${personal.name || 'Your Name'}</div>
          <div style="font-size: 10pt; color: #0f0; opacity: 0.8;">$ {personal.jobTitle || 'Professional Title'}</div>
          <div style="font-size: 8pt; color: #0f0; opacity: 0.7; margin-top: 3px;">
            ${[personal.email, personal.phone, personal.linkedin].filter(Boolean).join(' | ')}
          </div>
        </div>

        ${summary ? `
          <div style="margin-bottom: 12px; border: 1px solid #ddd; padding: 10px; background: #fff;">
            <div style="font-weight: 700; font-size: 9pt; margin-bottom: 4px; color: #0f0; background: #000; padding: 3px 6px; display: inline-block;">README.md</div>
            <p style="margin: 5px 0 0 0; color: #333;">${summary}</p>
          </div>
        ` : ''}

        ${experience.length > 0 ? `
          <div style="margin-bottom: 12px;">
            <div style="font-weight: 700; font-size: 9pt; margin-bottom: 6px; color: #0f0; background: #000; padding: 3px 6px; display: inline-block;">$ ls -la experience/</div>
            ${experience.map((exp, idx) => `
              <div style="margin-bottom: 8px; border-left: 3px solid #0f0; padding-left: 10px; background: #fff; padding: 8px 10px;">
                <div style="display: flex; justify-content: space-between;">
                  <span><strong style="color: #000;">[${idx + 1}] ${exp.title || ''}</strong> @ ${exp.company || ''}</span>
                  <span style="font-size: 7.5pt; color: #666;">{${exp.startDate || ''} - ${exp.endDate || ''}}</span>
                </div>
                <div style="color: #333; margin-top: 3px;  font-size: 8pt;">${safeFormatBullets(exp.description)}</div>
              </div>
            `).join('')}
          </div>
        ` : ''}

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          ${skills.length > 0 ? `
            <div>
              <div style="font-weight: 700; font-size: 9pt; margin-bottom: 6px; color: #0f0; background: #000; padding: 3px 6px; display: inline-block;">$ cat skills.json</div>
              <div style="background: #fff; padding: 8px; border: 1px solid #ddd;">
                <div style="font-family: monospace; font-size: 7.5pt; color: #333;">
                  {<br/>
                  ${skills.map((skill, idx) => `&nbsp;&nbsp;"skill_${idx + 1}": "${skill}"${idx < skills.length - 1 ? ',' : ''}`).join('<br/>')}
                  <br/>}
                </div>
              </div>
            </div>
          ` : ''}

          ${education.length > 0 ? `
            <div>
              <div style="font-weight: 700; font-size: 9pt; margin-bottom: 6px; color: #0f0; background: #000; padding: 3px 6px; display: inline-block;">$ cat education.txt</div>
              <div style="background: #fff; padding: 8px; border: 1px solid #ddd;">
                ${education.map(edu => `
                  <div style="margin-bottom: 6px; font-size: 8pt;">
                    <div style="font-weight: 600; color: #000;">${edu.degree || ''}</div>
                    <div style="color: #666;">${edu.institution || ''}</div>
                    <div style="color: #999; font-size: 7pt;">${edu.graduationDate || ''}${edu.gpa ? ` | ${edu.gpa}` : ''}</div>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}
        </div>

        ${projects.length > 0 ? `
          <div style="margin-top: 12px;">
            <div style="font-weight: 700; font-size: 9pt; margin-bottom: 6px; color: #0f0; background: #000; padding: 3px 6px; display: inline-block;">$ git log --projects</div>
            ${projects.map(proj => `
              <div style="margin-bottom: 6px; background: #fff; padding: 6px; border-left: 3px solid #0f0;">
                <div style="font-weight: 600; font-size: 8.5pt; color: #000;">commit: ${proj.name || ''}</div>
                ${proj.technologies ? `<div style="color: #666; font-size: 7.5pt;">branch: ${proj.technologies}</div>` : ''}
                <div style="color: #333; font-size: 7.5pt; margin-top: 2px;">${safeFormatBullets(proj.description)}</div>
              </div>
            `).join('')}
          </div>
        ` : ''}

        ${certifications.length > 0 ? `
          <div style="margin-top: 12px;">
            <div style="font-weight: 700; font-size: 9pt; margin-bottom: 6px; color: #0f0; background: #000; padding: 3px 6px; display: inline-block;">$ certifications --list</div>
            <div style="background: #fff; padding: 6px; border: 1px solid #ddd; font-size: 7.5pt;">
              ${certifications.map(cert => `<div style="margin-bottom: 2px;">✓ ${cert.name || ''} | ${cert.issuer || ''} | ${cert.date || ''}</div>`).join('')}
            </div>
          </div>
        ` : ''}

        ${languages.length > 0 ? `
          <div style="margin-top: 12px;">
            <div style="font-weight: 700; font-size: 9pt; margin-bottom: 6px; color: #0f0; background: #000; padding: 3px 6px; display: inline-block;">$ languages --verbose</div>
            <div style="background: #fff; padding: 6px; border: 1px solid #ddd; font-size: 7.5pt;">
              ${languages.map(lang => `<div style="margin-bottom: 2px;">📣 ${lang.language || ''}: ${lang.proficiency || ''}</div>`).join('')}
            </div>
          </div>
        ` : ''}

        ${awards.length > 0 ? `
          <div style="margin-top: 12px;">
            <div style="font-weight: 700; font-size: 9pt; margin-bottom: 6px; color: #0f0; background: #000; padding: 3px 6px; display: inline-block;">$ awards --show-all</div>
            ${awards.map(award => `
              <div style="margin-bottom: 6px; background: #fff; padding: 6px; border-left: 3px solid #0f0;">
                <div style="font-weight: 600; font-size: 8.5pt; color: #000;">🏆 ${award.title || ''}</div>
                <div style="color: #666; font-size: 7.5pt;">${award.issuer || ''}${award.date ? ` | ${award.date}` : ''}</div>
                ${award.description ? `<div style="color: #333; font-size: 7.5pt; margin-top: 2px;">${award.description}</div>` : ''}
              </div>
            `).join('')}
          </div>
        ` : ''}
      </div>
    `;
  },

  // Template 6: Creative - Visual and modern
  creative: (data) => {
    const personal = data.personal || {};
    const summary = data.summary || '';
    const experience = data.experience || [];
    const education = data.education || [];
    const skills = data.skills || [];
    const projects = data.projects || [];
    const certifications = data.certifications || [];
    const languages = data.languages || [];
    const awards = data.awards || [];

    return `
      <div style="font-family: 'Trebuchet MS', sans-serif; max-width: 800px; margin: 0 auto; padding: 0; font-size: 9pt; line-height: 1.25;">
        <!-- Header with gradient -->
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #fff; padding: 25px 35px; margin-bottom: 20px;">
          <h1 style="margin: 0; font-size: 24pt; font-weight: 700; letter-spacing: 1px;">${personal.name || 'YOUR NAME'}</h1>
          <p style="margin: 5px 0 0 0; font-size: 12pt; opacity: 0.95; font-weight: 500;">${personal.jobTitle || 'Professional Title'}</p>
          <div style="margin-top: 10px; font-size: 8pt; opacity: 0.9;">
            <div>${personal.email || ''} • ${personal.phone || ''}</div>
            <div>${personal.location || ''}</div>
            ${personal.linkedin || personal.portfolio ? `<div>${[personal.linkedin, personal.portfolio].filter(Boolean).join(' • ')}</div>` : ''}
          </div>
        </div>

        <div style="padding: 0 35px 25px 35px;">
          ${summary ? `
            <div style="background: linear-gradient(to right, #f8fafc, #ffffff); padding: 12px; margin-bottom: 15px; border-left: 4px solid #667eea; border-radius: 4px;">
              <div style="font-weight: 700; font-size: 10pt; color: #667eea; margin-bottom: 4px;">👋 ABOUT ME</div>
              <p style="margin: 0; color: #334155;">${summary}</p>
            </div>
          ` : ''}

          ${experience.length > 0 ? `
            <div style="margin-bottom: 15px;">
              <div style="font-weight: 700; font-size: 11pt; color: #667eea; margin-bottom: 8px; border-bottom: 2px solid #667eea; padding-bottom: 3px;">💼 EXPERIENCE</div>
              ${experience.map(exp => `
                <div style="margin-bottom: 10px; padding-left: 15px; border-left: 3px solid #e0e7ff;">
                  <div style="display: flex; justify-content: space-between; align-items: baseline;">
                    <strong style="font-size: 10pt; color: #1e293b;">${exp.title || ''}</strong>
                    <span style="font-size: 7.5pt; color: #64748b; background: #f1f5f9; padding: 2px 6px; border-radius: 3px;">${exp.startDate || ''} - ${exp.endDate || ''}</span>
                  </div>
                  <div style="color: #667eea; font-size: 9pt; font-weight: 600; margin-bottom: 3px;">${exp.company || ''}${exp.location ? ` | ${exp.location}` : ''}</div>
                  <p style="margin: 0; color: #475569;  font-size: 8.5pt;">${safeFormatBullets(exp.description)}</p>
                </div>
              `).join('')}
            </div>
          ` : ''}

          <div style="display: grid; grid-template-columns: 1.2fr 0.8fr; gap: 15px; margin-bottom: 15px;">
            ${skills.length > 0 ? `
              <div>
                <div style="font-weight: 700; font-size: 11pt; color: #667eea; margin-bottom: 6px; border-bottom: 2px solid #667eea; padding-bottom: 3px;">🎯 SKILLS</div>
                <div style="display: flex; flex-wrap: wrap; gap: 4px;">
                  ${skills.map(skill => `<span style="background: #f1f5f9; color: #667eea; padding: 3px 8px; border-radius: 12px; font-size: 7.5pt; font-weight: 600; border: 1px solid #e0e7ff;">${skill}</span>`).join('')}
                </div>
              </div>
            ` : ''}

            ${education.length > 0 ? `
              <div>
                <div style="font-weight: 700; font-size: 11pt; color: #667eea; margin-bottom: 6px; border-bottom: 2px solid #667eea; padding-bottom: 3px;">🎓 EDUCATION</div>
                ${education.map(edu => `
                  <div style="margin-bottom: 6px;">
                    <div style="font-weight: 600; font-size: 8.5pt; color: #1e293b;">${edu.degree || ''}</div>
                    <div style="color: #64748b; font-size: 8pt;">${edu.institution || ''}</div>
                    <div style="color: #94a3b8; font-size: 7pt;">${edu.graduationDate || ''}${edu.gpa ? ` | ${edu.gpa}` : ''}</div>
                  </div>
                `).join('')}
              </div>
            ` : ''}
          </div>

          ${projects.length > 0 ? `
            <div style="margin-bottom: 15px;">
              <div style="font-weight: 700; font-size: 11pt; color: #667eea; margin-bottom: 6px; border-bottom: 2px solid #667eea; padding-bottom: 3px;">🚀 PROJECTS</div>
              ${projects.map(proj => `
                <div style="margin-bottom: 8px; background: #f8fafc; padding: 8px; border-radius: 4px; border-left: 3px solid #667eea;">
                  <strong style="font-size: 9pt; color: #1e293b;">${proj.name || ''}</strong>${proj.technologies ? ` <span style="font-size: 7pt; color: #64748b; background: #fff; padding: 2px 4px; border-radius: 3px;">${proj.technologies}</span>` : ''}
                  <p style="margin: 3px 0 0 0; color: #475569; font-size: 8pt;">${safeFormatBullets(proj.description)}</p>
                </div>
              `).join('')}
            </div>
          ` : ''}

          ${certifications.length > 0 ? `
            <div style="margin-bottom: 15px;">
              <div style="font-weight: 700; font-size: 11pt; color: #667eea; margin-bottom: 6px; border-bottom: 2px solid #667eea; padding-bottom: 3px;">📜 CERTIFICATIONS</div>
              ${certifications.map(cert => `
                <div style="margin-bottom: 4px; font-size: 8pt;">
                  <span style="background: #f1f5f9; color: #667eea; padding: 2px 6px; border-radius: 3px; font-weight: 600;">${cert.name || ''}</span>
                  <span style="color: #64748b;"> | ${cert.issuer || ''} | ${cert.date || ''}</span>
                </div>
              `).join('')}
            </div>
          ` : ''}

          ${languages.length > 0 ? `
            <div style="margin-bottom: 15px;">
              <div style="font-weight: 700; font-size: 11pt; color: #667eea; margin-bottom: 6px; border-bottom: 2px solid #667eea; padding-bottom: 3px;">🌍 LANGUAGES</div>
              <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                ${languages.map(lang => `
                  <div style="background: #f1f5f9; color: #667eea; padding: 4px 8px; border-radius: 4px; font-size: 8pt; font-weight: 600;">
                    ${lang.language || ''} <span style="color: #64748b; font-weight: normal;">• ${lang.proficiency || ''}</span>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}

          ${awards.length > 0 ? `
            <div>
              <div style="font-weight: 700; font-size: 11pt; color: #667eea; margin-bottom: 6px; border-bottom: 2px solid #667eea; padding-bottom: 3px;">🏆 AWARDS & HONORS</div>
              ${awards.map(award => `
                <div style="margin-bottom: 8px; background: #f8fafc; padding: 8px; border-radius: 4px; border-left: 3px solid #fbbf24;">
                  <strong style="font-size: 9pt; color: #1e293b;">${award.title || ''}</strong>
                  <div style="color: #64748b; font-size: 7.5pt; margin-top: 2px;">${award.issuer || ''}${award.date ? ` | ${award.date}` : ''}</div>
                  ${award.description ? `<div style="color: #475569; font-size: 7.5pt; margin-top: 2px;">${award.description}</div>` : ''}
                </div>
              `).join('')}
            </div>
          ` : ''}
        </div>
      </div>
    `;
  },

  // Template 7: Timeline - Horizontal timeline with year markers
  timeline: (data) => {
    const personal = data.personal || {};
    const summary = data.summary || '';
    const experience = data.experience || [];
    const education = data.education || [];
    const skills = data.skills || [];
    const projects = data.projects || [];
    const certifications = data.certifications || [];
    const languages = data.languages || [];

    return `
      <div style="font-family: 'Georgia', serif; max-width: 800px; margin: 0 auto; padding: 25px 35px; font-size: 8.5pt; line-height: 1.35; background: linear-gradient(to bottom, #f8fafc 0%, #ffffff 100%);">
        <!-- Elegant Header with Timeline Accent -->
        <div style="text-align: center; margin-bottom: 18px; position: relative;">
          <div style="position: absolute; top: 50%; left: 0; right: 0; height: 1px; background: linear-gradient(to right, transparent, #cbd5e1, transparent);"></div>
          <div style="position: relative; background: #ffffff; display: inline-block; padding: 0 20px;">
            <h1 style="margin: 0; font-size: 22pt; color: #0f172a; font-weight: 300; letter-spacing: 1px;">${personal.name || 'Your Name'}</h1>
            <p style="margin: 4px 0; font-size: 10pt; color: #64748b; font-weight: 400; letter-spacing: 0.5px;">${personal.jobTitle || 'Professional Title'}</p>
          </div>
        </div>

        <!-- Contact Bar -->
        <div style="text-align: center; font-size: 7.5pt; color: #64748b; margin-bottom: 15px; border-top: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0; padding: 6px 0;">
          ${personal.email ? `<span style="margin: 0 10px;">${personal.email}</span>` : ''}
          ${personal.phone ? `<span style="margin: 0 10px;">•</span><span style="margin: 0 10px;">${personal.phone}</span>` : ''}
          ${personal.location ? `<span style="margin: 0 10px;">•</span><span style="margin: 0 10px;">${personal.location}</span>` : ''}
          ${personal.linkedin ? `<span style="margin: 0 10px;">•</span><span style="margin: 0 10px;">${personal.linkedin}</span>` : ''}
        </div>

        ${summary ? `
          <div style="margin-bottom: 15px; text-align: center; padding: 0 30px;">
            <p style="margin: 0; color: #475569; font-style: italic; line-height: 1.5;">${summary}</p>
          </div>
        ` : ''}

        ${experience.length > 0 ? `
          <!-- Timeline Experience -->
          <div style="margin-bottom: 15px;">
            <h2 style="font-size: 10pt; color: #0f172a; margin: 0 0 10px 0; font-weight: 600; text-transform: uppercase; letter-spacing: 1.5px; text-align: center;">Professional Journey</h2>
            <div style="position: relative; padding-left: 40px;">
              <div style="position: absolute; left: 15px; top: 0; bottom: 0; width: 2px; background: linear-gradient(to bottom, #3b82f6, #93c5fd);"></div>
              ${experience.map((exp, idx) => `
                <div style="margin-bottom: 12px; position: relative;">
                  <div style="position: absolute; left: -28px; top: 3px; width: 10px; height: 10px; background: #3b82f6; border: 2px solid #ffffff; border-radius: 50%; box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);"></div>
                  <div style="background: #ffffff; padding: 10px; border-radius: 6px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
                    <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 3px;">
                      <strong style="font-size: 9.5pt; color: #0f172a;">${exp.title || ''}</strong>
                      <span style="font-size: 7pt; color: #94a3b8; background: #f1f5f9; padding: 2px 8px; border-radius: 10px;">${exp.startDate || ''} - ${exp.endDate || ''}</span>
                    </div>
                    <div style="color: #3b82f6; font-size: 8.5pt; margin-bottom: 4px; font-weight: 500;">${exp.company || ''}</div>
                    <p style="margin: 0; color: #64748b; font-size: 8pt; line-height: 1.4;">${safeFormatBullets(exp.description)}</p>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <!-- Two Column Grid for Other Sections -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
          ${education.length > 0 ? `
            <div>
              <h2 style="font-size: 9pt; color: #0f172a; margin: 0 0 8px 0; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; border-bottom: 2px solid #3b82f6; padding-bottom: 4px;">Education</h2>
              ${education.map(edu => `
                <div style="margin-bottom: 8px; padding: 8px; background: #f8fafc; border-radius: 4px;">
                  <strong style="font-size: 8.5pt; color: #0f172a;">${edu.degree || ''}</strong>
                  <div style="color: #64748b; font-size: 7.5pt; margin-top: 2px;">${edu.institution || ''}</div>
                  <div style="color: #94a3b8; font-size: 7pt;">${edu.graduationDate || ''}</div>
                </div>
              `).join('')}
            </div>
          ` : ''}

          ${skills.length > 0 ? `
            <div>
              <h2 style="font-size: 9pt; color: #0f172a; margin: 0 0 8px 0; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; border-bottom: 2px solid #3b82f6; padding-bottom: 4px;">Skills</h2>
              <div style="display: flex; flex-wrap: wrap; gap: 4px;">
                ${skills.map(skill => `
                  <span style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: #ffffff; padding: 4px 10px; border-radius: 12px; font-size: 7pt; font-weight: 500;">${skill}</span>
                `).join('')}
              </div>
            </div>
          ` : ''}
        </div>

        ${projects.length > 0 ? `
          <div style="margin-top: 15px;">
            <h2 style="font-size: 9pt; color: #0f172a; margin: 0 0 8px 0; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; border-bottom: 2px solid #3b82f6; padding-bottom: 4px;">Projects</h2>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
              ${projects.map(proj => `
                <div style="padding: 8px; background: #f8fafc; border-left: 3px solid #3b82f6; border-radius: 4px;">
                  <strong style="font-size: 8pt; color: #0f172a;">${proj.name || ''}</strong>
                  <p style="margin: 3px 0 0 0; color: #64748b; font-size: 7pt; line-height: 1.3;">${safeFormatBullets(proj.description)}</p>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        ${(certifications.length > 0 || languages.length > 0) ? `
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 15px;">
            ${certifications.length > 0 ? `
              <div>
                <h2 style="font-size: 8pt; color: #0f172a; margin: 0 0 6px 0; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Certifications</h2>
                ${certifications.map(cert => `
                  <div style="margin-bottom: 4px; font-size: 7pt;">
                    <strong style="color: #0f172a;">${cert.name || ''}</strong> - <span style="color: #64748b;">${cert.issuer || ''}</span>
                  </div>
                `).join('')}
              </div>
            ` : ''}
            ${languages.length > 0 ? `
              <div>
                <h2 style="font-size: 8pt; color: #0f172a; margin: 0 0 6px 0; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Languages</h2>
                <div style="font-size: 7pt; color: #64748b;">
                  ${languages.map(lang => `${lang.language} (${lang.proficiency})`).join(' • ')}
                </div>
              </div>
            ` : ''}
          </div>
        ` : ''}
      </div>
    `;
  },

  // Template 8: Grid - Card-based box layout
  grid: (data) => {
    const personal = data.personal || {};
    const summary = data.summary || '';
    const experience = data.experience || [];
    const education = data.education || [];
    const skills = data.skills || [];
    const projects = data.projects || [];
    const certifications = data.certifications || [];

    return `
      <div style="font-family: 'Helvetica Neue', sans-serif; max-width: 800px; margin: 0 auto; padding: 25px; font-size: 8.5pt; line-height: 1.3; background: #f1f5f9;">
        <!-- Bold Header Card -->
        <div style="background: linear-gradient(135deg, #1e293b 0%, #334155 100%); color: #ffffff; padding: 20px; border-radius: 12px; margin-bottom: 15px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
          <h1 style="margin: 0; font-size: 20pt; font-weight: 700;">${personal.name || 'Your Name'}</h1>
          <p style="margin: 4px 0 8px 0; font-size: 11pt; font-weight: 400; opacity: 0.9;">${personal.jobTitle || 'Professional Title'}</p>
          <div style="display: flex; gap: 15px; font-size: 7.5pt; opacity: 0.8; flex-wrap: wrap;">
            ${personal.email ? `<span>📧 ${personal.email}</span>` : ''}
            ${personal.phone ? `<span>📱 ${personal.phone}</span>` : ''}
            ${personal.location ? `<span>📍 ${personal.location}</span>` : ''}
          </div>
        </div>

        ${summary ? `
          <div style="background: #ffffff; padding: 12px; border-radius: 8px; margin-bottom: 15px; border-left: 4px solid #3b82f6; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
            <h2 style="font-size: 9pt; color: #1e293b; margin: 0 0 6px 0; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Profile</h2>
            <p style="margin: 0; color: #475569; line-height: 1.5;">${summary}</p>
          </div>
        ` : ''}

        ${experience.length > 0 ? `
          <div style="margin-bottom: 15px;">
            <h2 style="font-size: 10pt; color: #1e293b; margin: 0 0 10px 0; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">Experience</h2>
            <div style="display: grid; gap: 10px;">
              ${experience.map(exp => `
                <div style="background: #ffffff; padding: 12px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); border-top: 3px solid #10b981;">
                  <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 6px;">
                    <div style="flex: 1;">
                      <strong style="font-size: 9.5pt; color: #1e293b; display: block;">${exp.title || ''}</strong>
                      <span style="color: #10b981; font-size: 8.5pt; font-weight: 600;">${exp.company || ''}</span>
                    </div>
                    <span style="background: #f1f5f9; color: #64748b; padding: 3px 8px; border-radius: 6px; font-size: 7pt; white-space: nowrap; margin-left: 10px;">${exp.startDate || ''} - ${exp.endDate || ''}</span>
                  </div>
                  <p style="margin: 0; color: #64748b; font-size: 8pt; line-height: 1.4;">${safeFormatBullets(exp.description)}</p>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
          ${education.length > 0 ? `
            <div>
              <h2 style="font-size: 9pt; color: #1e293b; margin: 0 0 8px 0; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Education</h2>
              ${education.map(edu => `
                <div style="background: #ffffff; padding: 10px; border-radius: 8px; margin-bottom: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); border-left: 3px solid #f59e0b;">
                  <strong style="font-size: 8.5pt; color: #1e293b; display: block;">${edu.degree || ''}</strong>
                  <div style="color: #64748b; font-size: 7.5pt; margin-top: 3px;">${edu.institution || ''}</div>
                  <div style="color: #94a3b8; font-size: 7pt;">${edu.graduationDate || ''}</div>
                </div>
              `).join('')}
            </div>
          ` : ''}

          ${skills.length > 0 ? `
            <div>
              <h2 style="font-size: 9pt; color: #1e293b; margin: 0 0 8px 0; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Skills</h2>
              <div style="background: #ffffff; padding: 10px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                <div style="display: flex; flex-wrap: wrap; gap: 5px;">
                  ${skills.map(skill => `
                    <span style="background: #ede9fe; color: #7c3aed; padding: 4px 10px; border-radius: 6px; font-size: 7pt; font-weight: 600;">${skill}</span>
                  `).join('')}
                </div>
              </div>
            </div>
          ` : ''}
        </div>

        ${projects.length > 0 ? `
          <div>
            <h2 style="font-size: 9pt; color: #1e293b; margin: 0 0 8px 0; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Projects</h2>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
              ${projects.map(proj => `
                <div style="background: #ffffff; padding: 10px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); border-top: 2px solid #06b6d4;">
                  <strong style="font-size: 8pt; color: #1e293b; display: block; margin-bottom: 4px;">${proj.name || ''}</strong>
                  <p style="margin: 0; color: #64748b; font-size: 7pt; line-height: 1.3;">${safeFormatBullets(proj.description)}</p>
                  ${proj.technologies ? `<div style="margin-top: 4px; font-size: 6.5pt; color: #06b6d4;">${proj.technologies}</div>` : ''}
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        ${certifications.length > 0 ? `
          <div style="margin-top: 15px;">
            <h2 style="font-size: 9pt; color: #1e293b; margin: 0 0 8px 0; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Certifications</h2>
            <div style="background: #ffffff; padding: 10px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
              ${certifications.map(cert => `
                <div style="margin-bottom: 4px; font-size: 7.5pt;">
                  <strong style="color: #1e293b;">${cert.name || ''}</strong> - <span style="color: #64748b;">${cert.issuer || ''}</span> <span style="color: #94a3b8;">(${cert.date || ''})</span>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    `;
  },

  // Template 9: Elegant - Minimalist serif with white space
  elegant: (data) => {
    const personal = data.personal || {};
    const summary = data.summary || '';
    const experience = data.experience || [];
    const education = data.education || [];
    const skills = data.skills || [];
    const projects = data.projects || [];
    const languages = data.languages || [];

    return `
      <div style="font-family: 'Palatino', 'Book Antiqua', serif; max-width: 750px; margin: 0 auto; padding: 40px 50px; font-size: 9pt; line-height: 1.5; color: #1a1a1a;">
        <!-- Minimalist Header -->
        <div style="text-align: center; margin-bottom: 35px; border-bottom: 1px solid #d4d4d4; padding-bottom: 25px;">
          <h1 style="margin: 0 0 8px 0; font-size: 26pt; color: #000000; font-weight: 300; letter-spacing: 3px; text-transform: uppercase;">${personal.name || 'Your Name'}</h1>
          <p style="margin: 0 0 12px 0; font-size: 10pt; color: #666666; font-weight: 400; letter-spacing: 2px;">${personal.jobTitle || 'Professional Title'}</p>
          <div style="font-size: 8pt; color: #999999; letter-spacing: 0.5px;">
            ${personal.email ? `${personal.email}` : ''}
            ${personal.phone ? ` ${personal.email ? '·' : ''} ${personal.phone}` : ''}
            ${personal.location ? ` ${(personal.email || personal.phone) ? '·' : ''} ${personal.location}` : ''}
          </div>
        </div>

        ${summary ? `
          <div style="margin-bottom: 30px; text-align: center; padding: 0 40px;">
            <p style="margin: 0; color: #4a4a4a; font-size: 9.5pt; line-height: 1.7; font-style: italic;">"${summary}"</p>
          </div>
        ` : ''}

        ${experience.length > 0 ? `
          <div style="margin-bottom: 30px;">
            <h2 style="font-size: 11pt; color: #000000; margin: 0 0 15px 0; font-weight: 400; letter-spacing: 2px; text-transform: uppercase; text-align: center; border-bottom: 1px solid #d4d4d4; padding-bottom: 8px;">Experience</h2>
            ${experience.map(exp => `
              <div style="margin-bottom: 20px; padding-bottom: 20px; border-bottom: 1px dotted #e5e5e5;">
                <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 6px;">
                  <strong style="font-size: 10pt; color: #000000; font-weight: 600;">${exp.title || ''}</strong>
                  <span style="font-size: 8pt; color: #999999; font-style: italic;">${exp.startDate || ''} – ${exp.endDate || ''}</span>
                </div>
                <div style="color: #666666; font-size: 9pt; margin-bottom: 8px; font-weight: 500;">${exp.company || ''}</div>
                <p style="margin: 0; color: #4a4a4a; text-align: justify; line-height: 1.6;">${safeFormatBullets(exp.description)}</p>
              </div>
            `).join('')}
          </div>
        ` : ''}

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px;">
          ${education.length > 0 ? `
            <div>
              <h2 style="font-size: 10pt; color: #000000; margin: 0 0 12px 0; font-weight: 400; letter-spacing: 1.5px; text-transform: uppercase; border-bottom: 1px solid #d4d4d4; padding-bottom: 6px;">Education</h2>
              ${education.map(edu => `
                <div style="margin-bottom: 12px;">
                  <strong style="font-size: 9pt; color: #000000;">${edu.degree || ''}</strong>
                  <div style="color: #666666; font-size: 8.5pt; margin-top: 3px;">${edu.institution || ''}</div>
                  <div style="color: #999999; font-size: 8pt; font-style: italic;">${edu.graduationDate || ''}</div>
                </div>
              `).join('')}
            </div>
          ` : ''}

          ${skills.length > 0 ? `
            <div>
              <h2 style="font-size: 10pt; color: #000000; margin: 0 0 12px 0; font-weight: 400; letter-spacing: 1.5px; text-transform: uppercase; border-bottom: 1px solid #d4d4d4; padding-bottom: 6px;">Skills</h2>
              <p style="margin: 0; color: #4a4a4a; line-height: 1.7;">${skills.join(' · ')}</p>
            </div>
          ` : ''}
        </div>

        ${projects.length > 0 ? `
          <div style="margin-bottom: 30px;">
            <h2 style="font-size: 10pt; color: #000000; margin: 0 0 12px 0; font-weight: 400; letter-spacing: 1.5px; text-transform: uppercase; border-bottom: 1px solid #d4d4d4; padding-bottom: 6px;">Selected Projects</h2>
            ${projects.map(proj => `
              <div style="margin-bottom: 12px;">
                <strong style="font-size: 9pt; color: #000000;">${proj.name || ''}</strong>
                <p style="margin: 3px 0 0 0; color: #4a4a4a; font-size: 8.5pt; line-height: 1.5;">${safeFormatBullets(proj.description)}</p>
              </div>
            `).join('')}
          </div>
        ` : ''}

        ${languages.length > 0 ? `
          <div style="text-align: center; padding-top: 20px; border-top: 1px solid #d4d4d4;">
            <h2 style="font-size: 9pt; color: #000000; margin: 0 0 8px 0; font-weight: 400; letter-spacing: 1.5px; text-transform: uppercase;">Languages</h2>
            <p style="margin: 0; color: #666666; font-size: 8pt;">
              ${languages.map(lang => `${lang.language} (${lang.proficiency})`).join(' · ')}
            </p>
          </div>
        ` : ''}
      </div>
    `;
  },

  // Template 10: Bold - Large typography with asymmetric layout
  bold: (data) => {
    const personal = data.personal || {};
    const summary = data.summary || '';
    const experience = data.experience || {};
    const education = data.education || [];
    const skills = data.skills || [];
    const projects = data.projects || [];
    const certifications = data.certifications || [];

    return `
      <div style="font-family: 'Impact', 'Arial Black', sans-serif; max-width: 800px; margin: 0 auto; padding: 20px 30px; font-size: 8.5pt; line-height: 1.3;">
        <!-- Bold Asymmetric Header -->
        <div style="background: linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%); color: #ffffff; padding: 25px 30px; margin: -20px -30px 20px -30px; clip-path: polygon(0 0, 100% 0, 100% 85%, 0 100%);">
          <h1 style="margin: 0; font-size: 28pt; font-weight: 900; letter-spacing: -1px; text-transform: uppercase;">${personal.name || 'Your Name'}</h1>
          <p style="margin: 6px 0 0 0; font-size: 14pt; font-weight: 400; opacity: 0.95; font-family: 'Arial', sans-serif;">${personal.jobTitle || 'Professional Title'}</p>
          <div style="margin-top: 12px; font-size: 8pt; font-family: 'Arial', sans-serif; opacity: 0.85;">
            ${personal.email ? `${personal.email}` : ''}
            ${personal.phone ? ` | ${personal.phone}` : ''}
            ${personal.location ? ` | ${personal.location}` : ''}
          </div>
        </div>

        ${summary ? `
          <div style="background: #eff6ff; border-left: 5px solid #1e40af; padding: 12px 15px; margin-bottom: 15px; font-family: 'Arial', sans-serif;">
            <p style="margin: 0; color: #1f2937; font-size: 9pt; line-height: 1.5; font-weight: 400;">${summary}</p>
          </div>
        ` : ''}

        ${experience.length > 0 ? `
          <div style="margin-bottom: 15px;">
            <h2 style="font-size: 14pt; color: #1e40af; margin: 0 0 12px 0; font-weight: 900; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 4px solid #1e40af; padding-bottom: 4px; display: inline-block;">Work Experience</h2>
            ${experience.map(exp => `
              <div style="margin-bottom: 12px; padding-left: 15px; border-left: 3px solid #dbeafe; font-family: 'Arial', sans-serif;">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 4px;">
                  <div>
                    <strong style="font-size: 10pt; color: #1f2937; display: block; font-weight: 700; font-family: 'Impact', sans-serif; letter-spacing: 0.5px;">${exp.title || ''}</strong>
                    <span style="color: #1e40af; font-size: 9pt; font-weight: 600;">${exp.company || ''}</span>
                  </div>
                  <span style="background: #1f2937; color: #ffffff; padding: 3px 10px; border-radius: 3px; font-size: 7pt; white-space: nowrap; margin-left: 15px;">${exp.startDate || ''} - ${exp.endDate || ''}</span>
                </div>
                <p style="margin: 0; color: #4b5563; font-size: 8pt; line-height: 1.4;">${safeFormatBullets(exp.description)}</p>
              </div>
            `).join('')}
          </div>
        ` : ''}

        <div style="display: grid; grid-template-columns: 2fr 3fr; gap: 20px; margin-bottom: 15px;">
          <div>
            ${education.length > 0 ? `
              <div style="margin-bottom: 15px;">
                <h2 style="font-size: 11pt; color: #1e40af; margin: 0 0 8px 0; font-weight: 900; text-transform: uppercase; letter-spacing: 0.5px;">Education</h2>
                ${education.map(edu => `
                  <div style="margin-bottom: 10px; font-family: 'Arial', sans-serif; background: #f9fafb; padding: 8px; border-radius: 4px;">
                    <strong style="font-size: 8.5pt; color: #1f2937; display: block;">${edu.degree || ''}</strong>
                    <div style="color: #6b7280; font-size: 7.5pt; margin-top: 2px;">${edu.institution || ''}</div>
                    <div style="color: #9ca3af; font-size: 7pt;">${edu.graduationDate || ''}</div>
                  </div>
                `).join('')}
              </div>
            ` : ''}

            ${certifications.length > 0 ? `
              <div>
                <h2 style="font-size: 10pt; color: #1e40af; margin: 0 0 8px 0; font-weight: 900; text-transform: uppercase; letter-spacing: 0.5px;">Certifications</h2>
                ${certifications.map(cert => `
                  <div style="margin-bottom: 6px; font-family: 'Arial', sans-serif; font-size: 7.5pt;">
                    <strong style="color: #1f2937;">${cert.name || ''}</strong>
                    <div style="color: #6b7280; font-size: 7pt;">${cert.issuer || ''}</div>
                  </div>
                `).join('')}
              </div>
            ` : ''}
          </div>

          <div>
            ${skills.length > 0 ? `
              <div style="margin-bottom: 15px;">
                <h2 style="font-size: 11pt; color: #1e40af; margin: 0 0 8px 0; font-weight: 900; text-transform: uppercase; letter-spacing: 0.5px;">Skills</h2>
                <div style="display: flex; flex-wrap: wrap; gap: 6px; font-family: 'Arial', sans-serif;">
                  ${skills.map(skill => `
                    <span style="background: #1f2937; color: #ffffff; padding: 6px 12px; border-radius: 3px; font-size: 7.5pt; font-weight: 700;">${skill}</span>
                  `).join('')}
                </div>
              </div>
            ` : ''}

            ${projects.length > 0 ? `
              <div>
                <h2 style="font-size: 11pt; color: #1e40af; margin: 0 0 8px 0; font-weight: 900; text-transform: uppercase; letter-spacing: 0.5px;">Projects</h2>
                ${projects.map(proj => `
                  <div style="margin-bottom: 8px; padding: 8px; background: #eff6ff; border-left: 3px solid #1e40af; border-radius: 3px; font-family: 'Arial', sans-serif;">
                    <strong style="font-size: 8pt; color: #1f2937; display: block; margin-bottom: 3px;">${proj.name || ''}</strong>
                    <p style="margin: 0; color: #4b5563; font-size: 7pt; line-height: 1.3;">${safeFormatBullets(proj.description)}</p>
                  </div>
                `).join('')}
              </div>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  },

  // Template 11: Magazine - Multi-column editorial style
  magazine: (data) => {
    const personal = data.personal || {};
    const summary = data.summary || '';
    const experience = data.experience || [];
    const education = data.education || [];
    const skills = data.skills || [];
    const projects = data.projects || [];
    const certifications = data.certifications || [];
    const languages = data.languages || [];

    return `
      <div style="font-family: 'Times New Roman', 'Times', serif; max-width: 800px; margin: 0 auto; padding: 25px 35px; font-size: 8.5pt; line-height: 1.4; background: #ffffff;">
        <!-- Magazine Masthead -->
        <div style="text-align: center; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 3px double #2c3e50;">
          <div style="font-size: 8pt; color: #95a5a6; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 8px;">Professional Profile</div>
          <h1 style="margin: 0; font-size: 24pt; color: #2c3e50; font-weight: 700; letter-spacing: -0.5px;">${personal.name || 'Your Name'}</h1>
          <div style="height: 2px; width: 80px; background: #0891b2; margin: 8px auto;"></div>
          <p style="margin: 6px 0 0 0; font-size: 10pt; color: #7f8c8d; font-style: italic;">${personal.jobTitle || 'Professional Title'}</p>
          <div style="margin-top: 10px; font-size: 7.5pt; color: #95a5a6;">
            ${personal.email ? `${personal.email}` : ''}
            ${personal.phone ? ` · ${personal.phone}` : ''}
            ${personal.location ? ` · ${personal.location}` : ''}
          </div>
        </div>

        ${summary ? `
          <div style="margin-bottom: 18px; column-count: 2; column-gap: 20px; text-align: justify; border-left: 3px solid #0891b2; padding-left: 15px;">
            <p style="margin: 0; color: #34495e; line-height: 1.6; font-size: 9pt; font-style: italic; text-indent: 15px;">${summary}</p>
          </div>
        ` : ''}

        ${experience.length > 0 ? `
          <div style="margin-bottom: 18px;">
            <h2 style="font-size: 12pt; color: #2c3e50; margin: 0 0 10px 0; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; border-bottom: 2px solid #2c3e50; padding-bottom: 4px;">Professional Experience</h2>
            <div style="column-count: 1;">
              ${experience.map((exp, idx) => `
                <div style="margin-bottom: 12px; break-inside: avoid; page-break-inside: avoid;">
                  <div style="background: #ecf0f1; padding: 10px; border-radius: 4px;">
                    <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 4px;">
                      <strong style="font-size: 10pt; color: #2c3e50;">${exp.title || ''}</strong>
                      <span style="font-size: 7pt; color: #7f8c8d; background: #bdc3c7; padding: 2px 8px; border-radius: 10px;">${exp.startDate || ''} - ${exp.endDate || ''}</span>
                    </div>
                    <div style="color: #0891b2; font-size: 9pt; font-weight: 600; margin-bottom: 4px;">${exp.company || ''}</div>
                    <p style="margin: 0; color: #34495e; font-size: 8pt; line-height: 1.5; text-align: justify;">${safeFormatBullets(exp.description)}</p>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <!-- Three Column Layout for Other Sections -->
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; margin-bottom: 15px;">
          ${education.length > 0 ? `
            <div>
              <h2 style="font-size: 9pt; color: #2c3e50; margin: 0 0 8px 0; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #0891b2; padding-bottom: 3px;">Education</h2>
              ${education.map(edu => `
                <div style="margin-bottom: 8px; padding: 6px; background: #f8f9fa; border-radius: 3px;">
                  <strong style="font-size: 8pt; color: #2c3e50; display: block;">${edu.degree || ''}</strong>
                  <div style="color: #7f8c8d; font-size: 7pt; margin-top: 2px;">${edu.institution || ''}</div>
                  <div style="color: #95a5a6; font-size: 6.5pt;">${edu.graduationDate || ''}</div>
                </div>
              `).join('')}
            </div>
          ` : ''}

          ${skills.length > 0 ? `
            <div>
              <h2 style="font-size: 9pt; color: #2c3e50; margin: 0 0 8px 0; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #0891b2; padding-bottom: 3px;">Expertise</h2>
              <div style="background: #f8f9fa; padding: 8px; border-radius: 3px;">
                ${skills.map(skill => `
                  <div style="margin-bottom: 3px; padding: 3px 0; border-bottom: 1px dotted #bdc3c7;">
                    <span style="font-size: 7.5pt; color: #34495e;">▪ ${skill}</span>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}

          ${(certifications.length > 0 || languages.length > 0) ? `
            <div>
              ${certifications.length > 0 ? `
                <div style="margin-bottom: 12px;">
                  <h2 style="font-size: 9pt; color: #2c3e50; margin: 0 0 8px 0; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #0891b2; padding-bottom: 3px;">Certifications</h2>
                  ${certifications.map(cert => `
                    <div style="margin-bottom: 6px; padding: 4px; background: #f8f9fa; border-radius: 3px; font-size: 7pt;">
                      <strong style="color: #2c3e50;">${cert.name || ''}</strong>
                      <div style="color: #7f8c8d; font-size: 6.5pt;">${cert.issuer || ''}</div>
                    </div>
                  `).join('')}
                </div>
              ` : ''}
              ${languages.length > 0 ? `
                <div>
                  <h2 style="font-size: 9pt; color: #2c3e50; margin: 0 0 8px 0; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #0891b2; padding-bottom: 3px;">Languages</h2>
                  <div style="background: #f8f9fa; padding: 6px; border-radius: 3px; font-size: 7pt; color: #34495e;">
                    ${languages.map(lang => `${lang.language} (${lang.proficiency})`).join(' · ')}
                  </div>
                </div>
              ` : ''}
            </div>
          ` : ''}
        </div>

        ${projects.length > 0 ? `
          <div>
            <h2 style="font-size: 10pt; color: #2c3e50; margin: 0 0 10px 0; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #2c3e50; padding-bottom: 4px;">Featured Projects</h2>
            <div style="column-count: 2; column-gap: 15px;">
              ${projects.map(proj => `
                <div style="margin-bottom: 10px; break-inside: avoid; page-break-inside: avoid;">
                  <div style="background: #ecf0f1; padding: 8px; border-left: 3px solid #0891b2; border-radius: 3px;">
                    <strong style="font-size: 8pt; color: #2c3e50; display: block; margin-bottom: 3px;">${proj.name || ''}</strong>
                    <p style="margin: 0; color: #34495e; font-size: 7pt; line-height: 1.4;">${safeFormatBullets(proj.description)}</p>
                    ${proj.technologies ? `<div style="margin-top: 3px; font-size: 6.5pt; color: #0891b2;">${proj.technologies}</div>` : ''}
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <!-- Footer Line -->
        <div style="margin-top: 20px; text-align: center; padding-top: 10px; border-top: 3px double #2c3e50;">
          <div style="font-size: 7pt; color: #95a5a6; letter-spacing: 1px;">— PROFESSIONAL RÉSUMÉ —</div>
        </div>
      </div>
    `;
  },

  // Template: Enhancv Modern - Tech-focused, dark sidebar
  modern_tech: (data) => {
    const personal = data.personal || {};
    const summary = data.summary || '';
    const experience = data.experience || [];
    const education = data.education || [];
    const skills = data.skills || [];
    const projects = data.projects || [];
    const certifications = data.certifications || [];

    return `
      <div style="font-family: 'Roboto', 'Lato', sans-serif; max-width: 800px; margin: 0 auto; display: flex; min-height: 1000px;">
        <!-- Sidebar -->
        <div style="width: 32%; background-color: #1e293b; color: #f8fafc; padding: 30px 20px; box-sizing: border-box;">
          <div style="text-align: center; margin-bottom: 30px;">
             <div style="width: 80px; height: 80px; background: #334155; border-radius: 50%; margin: 0 auto 15px; display: flex; align-items: center; justify-content: center; font-size: 24pt; font-weight: bold; color: #94a3b8;">
                ${personal.name ? personal.name.charAt(0) : 'U'}
             </div>
             <h2 style="margin: 0; font-size: 16pt; font-weight: 700; color: #fff;">${personal.name || 'Your Name'}</h2>
             <p style="margin: 5px 0 0; font-size: 10pt; color: #94a3b8;">${personal.jobTitle || 'Job Title'}</p>
          </div>

          <div style="margin-bottom: 25px;">
            <h3 style="font-size: 10pt; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #475569; padding-bottom: 5px; margin-bottom: 10px; color: #cbd5e1;">Contact</h3>
            <div style="font-size: 9pt; line-height: 1.6;">
              ${personal.email ? `<div style="margin-bottom: 5px;">📧 ${personal.email}</div>` : ''}
              ${personal.phone ? `<div style="margin-bottom: 5px;">📱 ${personal.phone}</div>` : ''}
              ${personal.location ? `<div style="margin-bottom: 5px;">📍 ${personal.location}</div>` : ''}
              ${personal.linkedin ? `<div style="margin-bottom: 5px;">🔗 ${personal.linkedin}</div>` : ''}
              ${personal.portfolio ? `<div style="margin-bottom: 5px;">🌐 ${personal.portfolio}</div>` : ''}
            </div>
          </div>

          ${skills.length > 0 ? `
            <div style="margin-bottom: 25px;">
              <h3 style="font-size: 10pt; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #475569; padding-bottom: 5px; margin-bottom: 10px; color: #cbd5e1;">Skills</h3>
              <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                ${skills.map(skill => `
                  <span style="background: #334155; padding: 4px 8px; border-radius: 4px; font-size: 8pt; color: #e2e8f0;">${skill}</span>
                `).join('')}
              </div>
            </div>
          ` : ''}
        </div>

        <!-- Main Content -->
        <div style="width: 68%; padding: 30px 40px; box-sizing: border-box; background-color: #fff;">
          ${summary ? `
            <div style="margin-bottom: 25px;">
              <h3 style="font-size: 12pt; color: #0f172a; font-weight: 700; margin-bottom: 10px; display: flex; align-items: center;">
                <span style="background: #e2e8f0; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 10px; font-size: 10pt;">👤</span>
                Profile
              </h3>
              <p style="font-size: 9.5pt; line-height: 1.6; color: #334155;">${summary}</p>
            </div>
          ` : ''}

          ${experience.length > 0 ? `
            <div style="margin-bottom: 25px;">
              <h3 style="font-size: 12pt; color: #0f172a; font-weight: 700; margin-bottom: 15px; display: flex; align-items: center;">
                <span style="background: #e2e8f0; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 10px; font-size: 10pt;">💼</span>
                Experience
              </h3>
              <div style="border-left: 2px solid #e2e8f0; padding-left: 20px; margin-left: 11px;">
                ${experience.map(exp => `
                  <div style="margin-bottom: 20px; position: relative;">
                    <div style="position: absolute; left: -26px; top: 5px; width: 10px; height: 10px; background: #3b82f6; border-radius: 50%; border: 2px solid #fff;"></div>
                    <h4 style="margin: 0; font-size: 11pt; color: #1e293b;">${exp.title}</h4>
                    <div style="font-size: 9pt; color: #3b82f6; font-weight: 500; margin-bottom: 5px;">${exp.company}</div>
                    <div style="font-size: 8pt; color: #64748b; margin-bottom: 8px;">${exp.startDate} - ${exp.endDate}</div>
                    <p style="font-size: 9pt; line-height: 1.5; color: #475569; margin: 0;">${safeFormatBullets(exp.description)}</p>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}

          ${education.length > 0 ? `
            <div style="margin-bottom: 25px;">
              <h3 style="font-size: 12pt; color: #0f172a; font-weight: 700; margin-bottom: 15px; display: flex; align-items: center;">
                <span style="background: #e2e8f0; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 10px; font-size: 10pt;">🎓</span>
                Education
              </h3>
              ${education.map(edu => `
                <div style="margin-bottom: 15px;">
                  <h4 style="margin: 0; font-size: 11pt; color: #1e293b;">${edu.degree}</h4>
                  <div style="font-size: 9pt; color: #475569;">${edu.school}, ${edu.year}</div>
                </div>
              `).join('')}
            </div>
          ` : ''}
        </div>
      </div>
    `;
  },

  // Template: Canva Creative - Bold, artistic
  creative_bold: (data) => {
    const personal = data.personal || {};
    const summary = data.summary || '';
    const experience = data.experience || [];
    const education = data.education || [];
    const skills = data.skills || [];
    const projects = data.projects || [];

    return `
      <div style="font-family: 'Open Sans', sans-serif; max-width: 800px; margin: 0 auto; background: #fff;">
        <!-- Header -->
        <div style="background: #fdf2f8; padding: 40px; text-align: center; border-bottom: 5px solid #db2777;">
          <h1 style="font-family: 'Playfair Display', serif; font-size: 32pt; margin: 0; color: #831843; letter-spacing: -1px;">${personal.name || 'Your Name'}</h1>
          <p style="font-size: 12pt; color: #be185d; text-transform: uppercase; letter-spacing: 2px; margin-top: 10px;">${personal.jobTitle || 'Creative Professional'}</p>
          
          <div style="margin-top: 20px; display: flex; justify-content: center; gap: 20px; font-size: 9pt; color: #9d174d;">
            ${personal.email ? `<span>${personal.email}</span>` : ''}
            ${personal.phone ? `<span>•</span><span>${personal.phone}</span>` : ''}
            ${personal.location ? `<span>•</span><span>${personal.location}</span>` : ''}
          </div>
        </div>

        <div style="padding: 40px; display: grid; grid-template-columns: 2fr 1fr; gap: 40px;">
          <!-- Left Column -->
          <div>
            ${summary ? `
              <div style="margin-bottom: 30px;">
                <h3 style="font-family: 'Playfair Display', serif; font-size: 16pt; color: #831843; border-bottom: 2px solid #fce7f3; padding-bottom: 5px; margin-bottom: 15px;">About Me</h3>
                <p style="font-size: 10pt; line-height: 1.6; color: #374151;">${summary}</p>
              </div>
            ` : ''}

            ${experience.length > 0 ? `
              <div style="margin-bottom: 30px;">
                <h3 style="font-family: 'Playfair Display', serif; font-size: 16pt; color: #831843; border-bottom: 2px solid #fce7f3; padding-bottom: 5px; margin-bottom: 15px;">Experience</h3>
                ${experience.map(exp => `
                  <div style="margin-bottom: 20px;">
                    <h4 style="margin: 0; font-size: 12pt; color: #1f2937; font-weight: 700;">${exp.title}</h4>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                      <span style="font-size: 10pt; color: #db2777; font-style: italic;">${exp.company}</span>
                      <span style="font-size: 9pt; color: #6b7280;">${exp.startDate} - ${exp.endDate}</span>
                    </div>
                    <p style="font-size: 9.5pt; line-height: 1.5; color: #4b5563; margin: 0;">${safeFormatBullets(exp.description)}</p>
                  </div>
                `).join('')}
              </div>
            ` : ''}
          </div>

          <!-- Right Column -->
          <div>
            ${skills.length > 0 ? `
              <div style="margin-bottom: 30px; background: #fff1f2; padding: 20px; border-radius: 8px;">
                <h3 style="font-family: 'Playfair Display', serif; font-size: 14pt; color: #831843; margin-top: 0; margin-bottom: 15px;">Expertise</h3>
                <div style="display: flex; flex-direction: column; gap: 8px;">
                  ${skills.map(skill => `
                    <div style="display: flex; align-items: center;">
                      <div style="width: 6px; height: 6px; background: #db2777; border-radius: 50%; margin-right: 10px;"></div>
                      <span style="font-size: 9.5pt; color: #374151;">${skill}</span>
                    </div>
                  `).join('')}
                </div>
              </div>
            ` : ''}

            ${education.length > 0 ? `
              <div style="margin-bottom: 30px;">
                <h3 style="font-family: 'Playfair Display', serif; font-size: 14pt; color: #831843; border-bottom: 2px solid #fce7f3; padding-bottom: 5px; margin-bottom: 15px;">Education</h3>
                ${education.map(edu => `
                  <div style="margin-bottom: 15px;">
                    <div style="font-weight: 700; font-size: 10pt; color: #1f2937;">${edu.degree}</div>
                    <div style="font-size: 9pt; color: #db2777;">${edu.school}</div>
                    <div style="font-size: 8pt; color: #6b7280;">${edu.year}</div>
                  </div>
                `).join('')}
              </div>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  },

  // Template: Professional Serif - Clean serif, elegant
  professional_serif: (data) => {
    const personal = data.personal || {};
    const summary = data.summary || '';
    const experience = data.experience || [];
    const education = data.education || [];
    const skills = data.skills || [];

    return `
      <div style="font-family: 'Merriweather', 'Georgia', serif; max-width: 800px; margin: 0 auto; padding: 40px 50px; color: #333;">
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="font-size: 28pt; margin: 0 0 10px; color: #111; font-weight: 400; letter-spacing: 0.5px;">${personal.name || 'Your Name'}</h1>
          <p style="font-family: 'Arial', sans-serif; font-size: 10pt; color: #666; text-transform: uppercase; letter-spacing: 2px; margin: 0;">${personal.jobTitle || 'Professional Title'}</p>
          
          <div style="margin-top: 15px; font-family: 'Arial', sans-serif; font-size: 9pt; color: #555; display: flex; justify-content: center; gap: 15px;">
            ${personal.email ? `<span>${personal.email}</span>` : ''}
            ${personal.phone ? `<span>${personal.phone}</span>` : ''}
            ${personal.location ? `<span>${personal.location}</span>` : ''}
          </div>
          ${personal.linkedin ? `<div style="margin-top: 5px; font-family: 'Arial', sans-serif; font-size: 9pt; color: #0077b5;">${personal.linkedin}</div>` : ''}
        </div>

        <div style="display: flex; gap: 40px;">
          <!-- Main Column -->
          <div style="flex: 2;">
            ${summary ? `
              <div style="margin-bottom: 30px;">
                <h3 style="font-family: 'Arial', sans-serif; font-size: 10pt; font-weight: 700; color: #111; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #ddd; padding-bottom: 5px; margin-bottom: 15px;">Profile</h3>
                <p style="font-size: 10pt; line-height: 1.6; color: #444;">${summary}</p>
              </div>
            ` : ''}

            ${experience.length > 0 ? `
              <div style="margin-bottom: 30px;">
                <h3 style="font-family: 'Arial', sans-serif; font-size: 10pt; font-weight: 700; color: #111; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #ddd; padding-bottom: 5px; margin-bottom: 15px;">Employment History</h3>
                ${experience.map(exp => `
                  <div style="margin-bottom: 20px;">
                    <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 5px;">
                      <h4 style="margin: 0; font-size: 12pt; font-weight: 700; color: #222;">${exp.title}</h4>
                      <span style="font-family: 'Arial', sans-serif; font-size: 9pt; color: #666;">${exp.startDate} – ${exp.endDate}</span>
                    </div>
                    <div style="font-style: italic; font-size: 10pt; color: #555; margin-bottom: 8px;">${exp.company}</div>
                    <p style="font-size: 10pt; line-height: 1.5; color: #444; margin: 0;">${safeFormatBullets(exp.description)}</p>
                  </div>
                `).join('')}
              </div>
            ` : ''}
          </div>

          <!-- Side Column -->
          <div style="flex: 1;">
            ${skills.length > 0 ? `
              <div style="margin-bottom: 30px;">
                <h3 style="font-family: 'Arial', sans-serif; font-size: 10pt; font-weight: 700; color: #111; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #ddd; padding-bottom: 5px; margin-bottom: 15px;">Skills</h3>
                <ul style="list-style: none; padding: 0; margin: 0;">
                  ${skills.map(skill => `
                    <li style="margin-bottom: 8px; font-size: 10pt; color: #444;">${skill}</li>
                  `).join('')}
                </ul>
              </div>
            ` : ''}

            ${education.length > 0 ? `
              <div style="margin-bottom: 30px;">
                <h3 style="font-family: 'Arial', sans-serif; font-size: 10pt; font-weight: 700; color: #111; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #ddd; padding-bottom: 5px; margin-bottom: 15px;">Education</h3>
                ${education.map(edu => `
                  <div style="margin-bottom: 15px;">
                    <div style="font-weight: 700; font-size: 10pt; color: #222;">${edu.degree}</div>
                    <div style="font-size: 10pt; color: #555;">${edu.school}</div>
                    <div style="font-family: 'Arial', sans-serif; font-size: 9pt; color: #666; margin-top: 2px;">${edu.year}</div>
                  </div>
                `).join('')}
              </div>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  },

  // Template: Graceful Elegance - Tech Executive (Pixel-Perfect Replica)
  graceful_elegance: (data) => {
    const personal = data.personal || {};
    const summary = data.summary || '';
    const experience = data.experience || [];
    const education = data.education || [];
    const skills = data.skills || [];
    const projects = data.projects || [];
    const certifications = data.certifications || [];
    const languages = data.languages || [];

    return `
      <div style="font-family: 'Roboto', 'Arial', sans-serif; max-width: 800px; margin: 0 auto; padding: 40px; background: #fff; color: #333; line-height: 1.4;">
        <!-- Header -->
        <div style="margin-bottom: 30px;">
          <h1 style="font-size: 36pt; font-weight: 900; text-transform: uppercase; margin: 0 0 5px; color: #000; letter-spacing: -0.5px; line-height: 1;">${personal.name || 'Your Name'}</h1>
          <div style="font-size: 12pt; color: #2563eb; font-weight: 700; margin-bottom: 8px;">
            ${personal.jobTitle || 'Professional Title'}
          </div>
          <div style="font-size: 9pt; color: #444; font-weight: 500; display: flex; flex-wrap: wrap; gap: 15px; align-items: center;">
            ${personal.email ? `<span>@ ${personal.email}</span>` : ''}
            ${personal.linkedin ? `<span>🔗 LinkedIn</span>` : ''}
            ${personal.location ? `<span>📍 ${personal.location}</span>` : ''}
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 58% 38%; gap: 4%;">
          <!-- Left Column -->
          <div>
            ${summary ? `
              <div style="margin-bottom: 30px;">
                <h3 style="font-size: 11pt; font-weight: 800; text-transform: uppercase; color: #000; margin: 0 0 10px; border-bottom: 3px solid #000; padding-bottom: 5px;">Summary</h3>
                <p style="font-size: 9.5pt; color: #333; line-height: 1.5;">${summary}</p>
              </div>
            ` : ''}

            ${experience.length > 0 ? `
              <div style="margin-bottom: 30px;">
                <h3 style="font-size: 11pt; font-weight: 800; text-transform: uppercase; color: #000; margin: 0 0 15px; border-bottom: 3px solid #000; padding-bottom: 5px;">Experience</h3>
                ${experience.map(exp => `
                  <div style="margin-bottom: 20px; break-inside: avoid; page-break-inside: avoid;">
                    <h4 style="font-size: 11pt; font-weight: 700; color: #000; margin: 0 0 2px;">${exp.title || ''}</h4>
                    <div style="font-size: 10pt; color: #2563eb; font-weight: 700; margin-bottom: 2px;">${exp.company || ''}</div>
                    <div style="font-size: 8.5pt; color: #666; margin-bottom: 6px; font-weight: 500;">
                      <span>📅 ${exp.startDate || ''} - ${exp.endDate || ''}</span>
                      ${exp.location ? ` <span style="margin-left: 10px;">📍 ${exp.location}</span>` : ''}
                    </div>
                    <p style="font-size: 9.5pt; color: #333; line-height: 1.5; ">${safeFormatBullets(exp.description)}</p>
                  </div>
                `).join('')}
              </div>
            ` : ''}
          </div>

          <!-- Right Column -->
          <div>
            ${projects.length > 0 ? `
              <div style="margin-bottom: 30px;">
                <h3 style="font-size: 11pt; font-weight: 800; text-transform: uppercase; color: #000; margin: 0 0 15px; border-bottom: 3px solid #000; padding-bottom: 5px;">Key Achievements</h3>
                ${projects.map(proj => `
                  <div style="margin-bottom: 15px; break-inside: avoid;">
                    <h4 style="font-size: 10pt; font-weight: 700; color: #000; margin: 0 0 2px;">${proj.name || ''}</h4>
                    <p style="font-size: 9pt; color: #333; line-height: 1.4; margin: 0;">${safeFormatBullets(proj.description)}</p>
                  </div>
                `).join('')}
              </div>
            ` : ''}

            ${skills.length > 0 ? `
              <div style="margin-bottom: 30px;">
                <h3 style="font-size: 11pt; font-weight: 800; text-transform: uppercase; color: #000; margin: 0 0 15px; border-bottom: 3px solid #000; padding-bottom: 5px;">Skills</h3>
                <div style="font-size: 9.5pt; color: #333; line-height: 1.5;">
                  ${skills.join(', ')}
                </div>
              </div>
            ` : ''}

            ${education.length > 0 ? `
              <div style="margin-bottom: 30px;">
                <h3 style="font-size: 11pt; font-weight: 800; text-transform: uppercase; color: #000; margin: 0 0 15px; border-bottom: 3px solid #000; padding-bottom: 5px;">Education</h3>
                ${education.map(edu => `
                  <div style="margin-bottom: 15px;">
                    <div style="font-weight: 700; font-size: 10pt; color: #000;">${edu.degree || ''}</div>
                    <div style="font-size: 9.5pt; color: #2563eb; font-weight: 600; margin: 2px 0;">${edu.school || edu.institution || ''}</div>
                    <div style="font-size: 8.5pt; color: #666;">📅 ${edu.year || edu.graduationDate || ''}</div>
                  </div>
                `).join('')}
              </div>
            ` : ''}

            ${certifications.length > 0 ? `
              <div style="margin-bottom: 30px;">
                <h3 style="font-size: 11pt; font-weight: 800; text-transform: uppercase; color: #000; margin: 0 0 15px; border-bottom: 3px solid #000; padding-bottom: 5px;">Training / Courses</h3>
                ${certifications.map(cert => `
                  <div style="margin-bottom: 12px;">
                    <div style="font-weight: 700; font-size: 9.5pt; color: #2563eb;">${cert.name || ''}</div>
                    <div style="font-size: 9pt; color: #333; margin-top: 2px;">${cert.issuer || ''}</div>
                  </div>
                `).join('')}
              </div>
            ` : ''}

            ${languages.length > 0 ? `
              <div style="margin-bottom: 30px;">
                <h3 style="font-size: 11pt; font-weight: 800; text-transform: uppercase; color: #000; margin: 0 0 15px; border-bottom: 3px solid #000; padding-bottom: 5px;">Languages</h3>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                  ${languages.map(lang => `
                    <div>
                      <div style="font-size: 9.5pt; font-weight: 700; color: #000; margin-bottom: 2px;">${lang.language || ''}</div>
                      <div style="font-size: 8.5pt; color: #666; margin-bottom: 4px;">${lang.proficiency || ''}</div>
                      <div style="display: flex; gap: 3px;">
                        ${[1, 2, 3, 4, 5].map(i => {
      const level = (lang.proficiency || '').toLowerCase().includes('native') ? 5 :
        (lang.proficiency || '').toLowerCase().includes('fluent') ? 4 :
          (lang.proficiency || '').toLowerCase().includes('advanced') ? 3 :
            (lang.proficiency || '').toLowerCase().includes('intermediate') ? 2 : 1;
      return `<div style="height: 6px; width: 6px; border-radius: 50%; background: ${i <= level ? '#2563eb' : '#e5e7eb'};"></div>`;
    }).join('')}
                      </div>
                    </div>
                  `).join('')}
                </div>
              </div>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  }
};
