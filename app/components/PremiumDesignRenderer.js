"use client";
import React, { memo, useRef, useEffect } from 'react';
import { parseRichText } from '../lib/richTextRenderer';
import { formatDateWithPreferences } from '../lib/resumeUtils';

// ========== SVG DECORATIVE ELEMENTS ==========

const DiagonalClip = ({ color, height = 60 }) => (
  <div style={{ position: 'absolute', bottom: -1, left: 0, right: 0, height: `${height}px`, overflow: 'hidden' }}>
    <svg viewBox="0 0 1200 60" preserveAspectRatio="none" style={{ width: '100%', height: '100%', display: 'block' }}>
      <polygon points="0,60 1200,0 1200,60" fill={color} />
    </svg>
  </div>
);

const WaveClip = ({ color, height = 50 }) => (
  <div style={{ position: 'absolute', bottom: -1, left: 0, right: 0, height: `${height}px`, overflow: 'hidden' }}>
    <svg viewBox="0 0 1200 50" preserveAspectRatio="none" style={{ width: '100%', height: '100%', display: 'block' }}>
      <path d="M0,25 C300,50 600,0 900,25 C1050,37.5 1150,50 1200,50 L1200,50 L0,50 Z" fill={color} />
    </svg>
  </div>
);

const CircleDecor = ({ color, opacity = 0.08, size = 200, top, right, left, bottom }) => (
  <div style={{ position: 'absolute', top, right, left, bottom, width: size, height: size, borderRadius: '50%', background: color, opacity, pointerEvents: 'none' }} />
);

const DotsPattern = ({ color = 'rgba(255,255,255,0.1)', rows = 4, cols = 6 }) => (
  <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'grid', gridTemplateColumns: `repeat(${cols}, 6px)`, gap: '6px', opacity: 0.4 }}>
    {Array.from({ length: rows * cols }).map((_, i) => (
      <div key={i} style={{ width: 4, height: 4, borderRadius: '50%', background: color }} />
    ))}
  </div>
);

// Circular progress for skills
const CircularSkill = ({ name, percent, color = '#3b82f6', size = 44, textColor = '#334155' }) => {
  const r = (size - 6) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (percent / 100) * circ;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="4" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="4"
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" />
      </svg>
      <span style={{ fontSize: '0.65em', color: textColor, textAlign: 'center', lineHeight: 1.2, maxWidth: size + 10 }}>{name}</span>
    </div>
  );
};

// Timeline dot + line
const TimelineDot = ({ color = '#3b82f6', isLast = false }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', width: '20px', flexShrink: 0 }}>
    <div style={{ width: 10, height: 10, borderRadius: '50%', background: color, border: `2px solid ${color}`, zIndex: 1, flexShrink: 0 }} />
    {!isLast && <div style={{ width: 2, flex: 1, background: `${color}30`, marginTop: 2 }} />}
  </div>
);

// Star rating
const StarRating = ({ level, maxStars = 5, color = '#f59e0b', size = 12 }) => (
  <div style={{ display: 'flex', gap: '2px' }}>
    {Array.from({ length: maxStars }).map((_, i) => (
      <svg key={i} width={size} height={size} viewBox="0 0 24 24" fill={i < level ? color : '#e5e7eb'}>
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ))}
  </div>
);

// ========== SHARED HELPERS ==========

function normalizeSkills(skills) {
  if (!Array.isArray(skills)) return [];
  return skills.map(skill => {
    if (typeof skill === 'string') return { name: skill.trim(), proficiency: null };
    if (typeof skill === 'object' && skill !== null) {
      return { name: (skill.name || skill.skill || '').trim(), proficiency: skill.proficiency || skill.level || null };
    }
    return { name: '', proficiency: null };
  }).filter(s => s.name && s.name.length > 0);
}

function normalizeCustomSections(cs) {
  if (!Array.isArray(cs)) return [];
  return cs.filter(s => s && (s.title || s.description || s.name));
}

function renderBullets(description, textColor = '#334155', fontSize = '0.8em') {
  if (!description) return null;
  let lines;
  if (Array.isArray(description)) {
    lines = description.map(l => String(l).trim()).filter(Boolean);
  } else {
    lines = String(description).split(/[\n\r]+|•\s*/).map(l => l.trim()).filter(Boolean);
  }
  if (lines.length === 0) return null;
  if (lines.length > 1) {
    return (
      <ul style={{ listStyleType: 'none', padding: 0, margin: '0.35em 0 0 0' }}>
        {lines.map((line, i) => (
          <li key={i} style={{ fontSize, lineHeight: '1.5', color: textColor, marginBottom: '3px', paddingLeft: '1em', position: 'relative' }}>
            <span style={{ position: 'absolute', left: 0, top: '0.5em', width: 4, height: 4, borderRadius: '50%', background: textColor, opacity: 0.4 }} />
            <span dangerouslySetInnerHTML={{ __html: parseRichText(line.replace(/^[-•*]\s*/, '')) }} />
          </li>
        ))}
      </ul>
    );
  }
  return <p style={{ margin: '0.3em 0 0 0', color: textColor, fontSize, lineHeight: '1.55' }} dangerouslySetInnerHTML={{ __html: parseRichText(lines[0]) }} />;
}

function fmtDate(date, preferences) {
  if (!date) return '';
  if (/present/i.test(date)) return 'Present';
  if (preferences?.dateFormat) {
    const result = formatDateWithPreferences(date, preferences);
    if (result) return result;
  }
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return date;
    return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  } catch { return date; }
}

function profToPercent(prof) {
  if (!prof) return 70;
  if (typeof prof === 'number') return Math.min(100, Math.max(0, prof));
  const m = { expert: 95, advanced: 85, intermediate: 65, beginner: 35, native: 100, fluent: 90, professional: 75, basic: 30, conversational: 50 };
  return m[String(prof).toLowerCase()] || 70;
}

function profToStars(prof) {
  return Math.ceil(profToPercent(prof) / 20);
}

// ========== CONTACT RENDERERS ==========

function ContactRow({ data, color = '#64748b', iconColor, separator = '|' }) {
  const items = [data.email, data.phone, data.address, data.linkedin, data.portfolio].filter(Boolean);
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3em', fontSize: '0.78em', color, alignItems: 'center' }}>
      {items.map((item, i) => (
        <React.Fragment key={i}>
          {i > 0 && <span style={{ opacity: 0.4, margin: '0 0.2em' }}>{separator}</span>}
          <span style={{ wordBreak: 'break-all' }}>{item}</span>
        </React.Fragment>
      ))}
    </div>
  );
}

function ContactColumn({ data, color = '#e2e8f0', iconColor = 'rgba(255,255,255,0.6)' }) {
  const items = [
    { icon: 'M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z', val: data.email },
    { icon: 'M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z', val: data.phone },
    { icon: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z', val: data.address },
    { icon: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z', val: data.linkedin },
    { icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z', val: data.portfolio },
  ].filter(i => i.val);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55em' }}>
      {items.map(({ icon, val }, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5em', fontSize: '0.75em', color }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill={iconColor} style={{ flexShrink: 0, marginTop: 2 }}><path d={icon} /></svg>
          <span style={{ wordBreak: 'break-all', lineHeight: 1.35 }}>{val}</span>
        </div>
      ))}
    </div>
  );
}

// ========== SECTION TITLE STYLES ==========

function STitle({ title, style: variant = 'default', color = '#1e293b', accent = '#3b82f6' }) {
  if (variant === 'gradient-underline') {
    return (
      <div style={{ marginBottom: '0.7em' }}>
        <h3 style={{ fontSize: '0.85em', fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>{title}</h3>
        <div style={{ height: 3, background: `linear-gradient(90deg, ${accent}, ${accent}40)`, marginTop: 4, width: '3em', borderRadius: 2 }} />
      </div>
    );
  }
  if (variant === 'border-left') {
    return (
      <h3 style={{ fontSize: '0.85em', fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 0.6em', borderLeft: `3px solid ${accent}`, paddingLeft: '0.6em' }}>{title}</h3>
    );
  }
  if (variant === 'ribbon') {
    return (
      <div style={{ background: accent, color: '#fff', padding: '0.3em 1.2em', margin: '0 -1.2em 0.7em', display: 'inline-block', fontSize: '0.8em', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{title}</div>
    );
  }
  if (variant === 'center-line') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6em', marginBottom: '0.7em' }}>
        <div style={{ flex: 1, height: 1, background: accent + '40' }} />
        <h3 style={{ fontSize: '0.8em', fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.12em', margin: 0, whiteSpace: 'nowrap' }}>{title}</h3>
        <div style={{ flex: 1, height: 1, background: accent + '40' }} />
      </div>
    );
  }
  if (variant === 'bold-caps') {
    return <h3 style={{ fontSize: '1em', fontWeight: 800, color, textTransform: 'uppercase', letterSpacing: '0.15em', margin: '0 0 0.7em', borderBottom: `2px solid ${accent}`, paddingBottom: '0.3em' }}>{title}</h3>;
  }
  if (variant === 'dot-accent') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5em', marginBottom: '0.6em' }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: accent, flexShrink: 0 }} />
        <h3 style={{ fontSize: '0.85em', fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>{title}</h3>
      </div>
    );
  }
  // default
  return <h3 style={{ fontSize: '0.85em', fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 0.6em' }}>{title}</h3>;
}

// ========== SECTION RENDERERS ==========

function Summary({ data, textColor, titleColor, accent, titleStyle }) {
  if (!data?.summary) return null;
  return (
    <div>
      <STitle title="Professional Summary" color={titleColor} accent={accent} style={titleStyle} />
      <p style={{ fontSize: '0.82em', lineHeight: 1.6, color: textColor, margin: 0 }} dangerouslySetInnerHTML={{ __html: parseRichText(data.summary) }} />
    </div>
  );
}

function Experience({ data, textColor, dateColor, titleColor, accent, titleStyle, showTimeline = false, preferences }) {
  if (!data?.experience?.length) return null;
  return (
    <div>
      <STitle title="Experience" color={titleColor} accent={accent} style={titleStyle} />
      {data.experience.map((exp, i) => {
        const isLast = i === data.experience.length - 1;
        const content = (
          <div style={{ flex: 1, marginBottom: isLast ? 0 : '0.85em' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: '0.3em' }}>
              <h4 style={{ fontSize: '0.88em', fontWeight: 700, color: textColor, margin: 0 }}>{exp.jobTitle || exp.position || exp.title}</h4>
              <span style={{ fontSize: '0.72em', color: dateColor, whiteSpace: 'nowrap', fontWeight: 500 }}>{fmtDate(exp.startDate, preferences)} — {fmtDate(exp.endDate, preferences)}</span>
            </div>
            <div style={{ fontSize: '0.78em', color: accent, fontWeight: 600, marginTop: 2 }}>{exp.company}{exp.location ? ` · ${exp.location}` : ''}</div>
            {renderBullets(exp.description, textColor, '0.78em')}
          </div>
        );
        if (showTimeline) {
          return <div key={i} style={{ display: 'flex', gap: '0.6em' }}><TimelineDot color={accent} isLast={isLast} />{content}</div>;
        }
        return <div key={i}>{content}</div>;
      })}
    </div>
  );
}

function Education({ data, textColor, dateColor, titleColor, accent, titleStyle, preferences }) {
  if (!data?.education?.length) return null;
  return (
    <div>
      <STitle title="Education" color={titleColor} accent={accent} style={titleStyle} />
      {data.education.map((edu, i) => (
        <div key={i} style={{ marginBottom: i < data.education.length - 1 ? '0.6em' : 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap' }}>
            <h4 style={{ fontSize: '0.85em', fontWeight: 700, color: textColor, margin: 0 }}>{edu.degree}{edu.field ? ` in ${edu.field}` : ''}</h4>
            <span style={{ fontSize: '0.72em', color: dateColor, whiteSpace: 'nowrap' }}>{fmtDate(edu.startDate, preferences)} — {fmtDate(edu.endDate, preferences)}</span>
          </div>
          <div style={{ fontSize: '0.78em', color: dateColor, marginTop: 2 }}>{edu.institution}</div>
          {edu.gpa && preferences?.education?.showGPA !== false && <div style={{ fontSize: '0.72em', color: dateColor, marginTop: 2 }}>GPA: {edu.gpa}</div>}
        </div>
      ))}
    </div>
  );
}

function Skills({ data, textColor, titleColor, accent, titleStyle, variant = 'tags' }) {
  const skills = normalizeSkills(data?.skills);
  if (!skills.length) return null;

  if (variant === 'circular') {
    return (
      <div>
        <STitle title="Skills" color={titleColor} accent={accent} style={titleStyle} />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6em', justifyContent: 'center' }}>
          {skills.slice(0, 12).map((s, i) => (
            <CircularSkill key={i} name={s.name} percent={profToPercent(s.proficiency)} color={accent} size={46} textColor={textColor} />
          ))}
        </div>
      </div>
    );
  }

  if (variant === 'stars') {
    return (
      <div>
        <STitle title="Skills" color={titleColor} accent={accent} style={titleStyle} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4em' }}>
          {skills.map((s, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.78em', color: textColor }}>{s.name}</span>
              <StarRating level={profToStars(s.proficiency)} color={accent} size={10} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (variant === 'gradient-bars') {
    return (
      <div>
        <STitle title="Skills" color={titleColor} accent={accent} style={titleStyle} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45em' }}>
          {skills.map((s, i) => (
            <div key={i}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76em', color: textColor, marginBottom: 2 }}>
                <span style={{ fontWeight: 500 }}>{s.name}</span>
              </div>
              <div style={{ height: 5, background: 'rgba(0,0,0,0.06)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${profToPercent(s.proficiency)}%`, background: `linear-gradient(90deg, ${accent}, ${accent}90)`, borderRadius: 3 }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (variant === 'dots') {
    return (
      <div>
        <STitle title="Skills" color={titleColor} accent={accent} style={titleStyle} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35em' }}>
          {skills.map((s, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78em', color: textColor }}>
              <span>{s.name}</span>
              <div style={{ display: 'flex', gap: 3 }}>
                {[1, 2, 3, 4, 5].map(lv => (
                  <div key={lv} style={{ width: 7, height: 7, borderRadius: '50%', background: lv <= profToStars(s.proficiency) ? accent : 'rgba(0,0,0,0.1)' }} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (variant === 'pills') {
    return (
      <div>
        <STitle title="Skills" color={titleColor} accent={accent} style={titleStyle} />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3em' }}>
          {skills.map((s, i) => (
            <span key={i} style={{ fontSize: '0.73em', padding: '0.2em 0.6em', borderRadius: '100px', background: `${accent}15`, color: accent, fontWeight: 500, border: `1px solid ${accent}25` }}>{s.name}</span>
          ))}
        </div>
      </div>
    );
  }

  // default tags
  return (
    <div>
      <STitle title="Skills" color={titleColor} accent={accent} style={titleStyle} />
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3em' }}>
        {skills.map((s, i) => (
          <span key={i} style={{ fontSize: '0.73em', padding: '0.2em 0.55em', borderRadius: 3, background: `${accent}12`, color: textColor, border: `1px solid ${accent}20` }}>{s.name}</span>
        ))}
      </div>
    </div>
  );
}

function Certifications({ data, textColor, dateColor, titleColor, accent, titleStyle, preferences }) {
  if (!data?.certifications?.length) return null;
  return (
    <div>
      <STitle title="Certifications" color={titleColor} accent={accent} style={titleStyle} />
      {data.certifications.map((c, i) => (
        <div key={i} style={{ marginBottom: '0.35em', fontSize: '0.78em' }}>
          <span style={{ fontWeight: 600, color: textColor }}>{c.name}</span>
          {c.issuer && <span style={{ color: dateColor }}> — {c.issuer}</span>}
          {c.date && <span style={{ color: dateColor, fontSize: '0.92em' }}> ({fmtDate(c.date, preferences)})</span>}
        </div>
      ))}
    </div>
  );
}

function Languages({ data, textColor, titleColor, accent, titleStyle, variant = 'inline' }) {
  if (!data?.languages?.length) return null;
  if (variant === 'bars') {
    return (
      <div>
        <STitle title="Languages" color={titleColor} accent={accent} style={titleStyle} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35em' }}>
          {data.languages.map((l, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78em', color: textColor }}>
              <span style={{ fontWeight: 500 }}>{l.language}</span>
              <span style={{ fontSize: '0.9em', color: accent, opacity: 0.8 }}>{l.proficiency}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return (
    <div>
      <STitle title="Languages" color={titleColor} accent={accent} style={titleStyle} />
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3em 0.8em', fontSize: '0.78em' }}>
        {data.languages.map((l, i) => (
          <span key={i} style={{ color: textColor }}><strong>{l.language}</strong>{l.proficiency ? ` (${l.proficiency})` : ''}</span>
        ))}
      </div>
    </div>
  );
}

function Projects({ data, textColor, dateColor, titleColor, accent, titleStyle, preferences }) {
  const projects = normalizeCustomSections(data?.customSections)?.filter(s => s.type === 'project') || [];
  if (!projects.length) return null;
  return (
    <div>
      <STitle title="Projects" color={titleColor} accent={accent} style={titleStyle} />
      {projects.map((p, i) => (
        <div key={i} style={{ marginBottom: '0.5em' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <h4 style={{ fontSize: '0.83em', fontWeight: 700, color: textColor, margin: 0 }}>{p.title}</h4>
            {p.date && <span style={{ fontSize: '0.72em', color: dateColor }}>{fmtDate(p.date, preferences)}</span>}
          </div>
          {renderBullets(p.description, textColor, '0.78em')}
        </div>
      ))}
    </div>
  );
}

function Achievements({ data, textColor, titleColor, accent, titleStyle }) {
  const achievements = normalizeCustomSections(data?.customSections)?.filter(s => s.type === 'achievements' || s.type === 'award') || [];
  if (!achievements.length) return null;
  return (
    <div>
      <STitle title="Achievements" color={titleColor} accent={accent} style={titleStyle} />
      {achievements.map((a, i) => (
        <div key={i} style={{ marginBottom: '0.3em', fontSize: '0.78em', color: textColor, display: 'flex', gap: '0.4em', alignItems: 'flex-start' }}>
          <span style={{ color: accent, fontSize: '1.1em', lineHeight: 1, flexShrink: 0 }}>★</span>
          <span><strong>{a.title}</strong>{a.description ? ` — ${a.description}` : ''}</span>
        </div>
      ))}
    </div>
  );
}

// Generic section dispatcher
function Sections({ list, data, props }) {
  return list.map(s => {
    switch (s) {
      case 'summary': return <Summary key={s} data={data} {...props} />;
      case 'experience': return <Experience key={s} data={data} {...props} />;
      case 'education': return <Education key={s} data={data} {...props} />;
      case 'skills': return <Skills key={s} data={data} {...props} />;
      case 'certifications': return <Certifications key={s} data={data} {...props} />;
      case 'languages': return <Languages key={s} data={data} {...props} />;
      case 'projects': return <Projects key={s} data={data} {...props} />;
      case 'achievements': return <Achievements key={s} data={data} {...props} />;
      default: return null;
    }
  }).filter(Boolean);
}

// ========== 20 LAYOUT RENDERERS ==========

// 1. CASCADE — Diagonal header, initials badge, 2-column, gradient underline titles
function CascadeLayout({ data, template: t, preferences }) {
  const c = t.styles.colors;
  const initials = (data.name || '').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  return (
    <div style={{ fontFamily: t.styles.fontFamily, fontSize: t.styles.fontSize, lineHeight: t.styles.lineHeight, background: c.background, color: c.text }}>
      <div style={{ position: 'relative', background: c.headerBackground, color: c.headerText, padding: '1.5rem 2rem 2.5em' }}>
        <DotsPattern />
        <CircleDecor color="#ffffff" opacity={0.06} size={120} top="-30px" right="-20px" />
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: '1.2em' }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3em', fontWeight: 800, flexShrink: 0, backdropFilter: 'blur(4px)' }}>{initials}</div>
          <div>
            <h1 style={{ fontSize: '1.6em', fontWeight: 800, margin: 0, letterSpacing: '0.01em' }}>{data.name}</h1>
            {data.jobTitle && <div style={{ fontSize: '0.88em', opacity: 0.9, marginTop: 3, fontWeight: 400, letterSpacing: '0.03em' }}>{data.jobTitle}</div>}
            <div style={{ marginTop: '0.5em' }}><ContactRow data={data} color="rgba(255,255,255,0.85)" separator="·" /></div>
          </div>
        </div>
        <DiagonalClip color={c.background} />
      </div>
      <div style={{ display: 'flex', marginTop: '-0.5em' }}>
        <div style={{ width: t.layout.sidebarWidth, background: c.sidebarBackground, padding: '1.2em', display: 'flex', flexDirection: 'column', gap: '1em', borderRight: `1px solid ${c.divider}` }}>
          <Sections list={t.layout.sidebarSections.filter(s => s !== 'personal')} data={data} props={{ preferences, textColor: c.sidebarText || c.text, dateColor: c.secondary, titleColor: c.sectionTitle, accent: c.accent, titleStyle: 'gradient-underline', variant: 'dots' }} />
        </div>
        <div style={{ flex: 1, padding: '1.2rem 1.5em', display: 'flex', flexDirection: 'column', gap: '1.1em' }}>
          <Sections list={t.layout.mainSections} data={data} props={{ preferences, textColor: c.text, dateColor: c.secondary, titleColor: c.sectionTitle, accent: c.accent, titleStyle: 'gradient-underline', showTimeline: true }} />
        </div>
      </div>
    </div>
  );
}

// 2. ICONIC — Full-width icon sections, strong borders
function IconicLayout({ data, template: t, preferences }) {
  const c = t.styles.colors;
  return (
    <div style={{ fontFamily: t.styles.fontFamily, fontSize: t.styles.fontSize, lineHeight: t.styles.lineHeight, background: c.background, color: c.text }}>
      <div style={{ background: c.headerBackground, color: c.headerText, padding: '1.8rem 2.2em', position: 'relative' }}>
        <CircleDecor color={c.iconColor || '#6366f1'} opacity={0.08} size={180} top="-60px" right="-40px" />
        <h1 style={{ fontSize: '1.8em', fontWeight: 800, margin: 0, position: 'relative', zIndex: 1 }}>{data.name}</h1>
        {data.jobTitle && <div style={{ fontSize: '0.9em', opacity: 0.8, marginTop: 4, letterSpacing: '0.06em', textTransform: 'uppercase', position: 'relative', zIndex: 1 }}>{data.jobTitle}</div>}
        <div style={{ marginTop: '0.7em', position: 'relative', zIndex: 1 }}><ContactRow data={data} color="rgba(255,255,255,0.8)" separator="|" /></div>
        <WaveClip color={c.background} />
      </div>
      <div style={{ padding: '1rem 2.2rem 1.5em', display: 'flex', flexDirection: 'column', gap: '1.1em' }}>
        <Sections list={t.layout.mainSections} data={data} props={{ preferences, textColor: c.text, dateColor: c.secondary, titleColor: c.sectionTitle, accent: c.iconColor || c.accent, titleStyle: 'border-left', showTimeline: true }} />
      </div>
    </div>
  );
}

// 3. PRIMO — Serif elegance, centered, gold accent, no icons
function PrimoLayout({ data, template: t, preferences }) {
  const c = t.styles.colors;
  return (
    <div style={{ fontFamily: t.styles.fontFamily, fontSize: t.styles.fontSize, lineHeight: t.styles.lineHeight, background: c.background, color: c.text }}>
      <div style={{ padding: '2.2rem 2.5rem 1.2em', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.2em', fontWeight: 600, margin: 0, color: c.headerText, letterSpacing: '0.06em' }}>{data.name}</h1>
        {data.jobTitle && <div style={{ fontSize: '0.95em', color: c.accent, marginTop: '0.35em', fontStyle: 'italic', letterSpacing: '0.04em' }}>{data.jobTitle}</div>}
        <div style={{ width: 60, height: 3, background: c.accent, margin: '0.8rem auto', borderRadius: 2 }} />
        <ContactRow data={data} color={c.secondary} separator="·" />
      </div>
      <div style={{ height: 1, background: `linear-gradient(90deg, transparent, ${c.accent}60, transparent)`, margin: '0 2.5em' }} />
      <div style={{ padding: '1.5rem 2.5em', display: 'flex', flexDirection: 'column', gap: '1.2em' }}>
        <Sections list={t.layout.mainSections} data={data} props={{ preferences, textColor: c.text, dateColor: c.secondary, titleColor: c.sectionTitle, accent: c.accent, titleStyle: 'center-line' }} />
      </div>
    </div>
  );
}

// 4. SPLIT — 40/60 dark/light, photo + contact in sidebar
function SplitLayout({ data, template: t, preferences }) {
  const c = t.styles.colors;
  return (
    <div style={{ fontFamily: t.styles.fontFamily, fontSize: t.styles.fontSize, lineHeight: t.styles.lineHeight, display: 'flex' }}>
      <div style={{ width: t.layout.sidebarWidth, background: c.sidebarBackground, color: c.sidebarText, padding: '1.8rem 1.3em', display: 'flex', flexDirection: 'column', gap: '1em', position: 'relative', overflow: 'hidden' }}>
        <CircleDecor color={c.accent} opacity={0.08} size={160} top="-40px" left="-50px" />
        <DotsPattern color={`${c.accent}20`} rows={3} cols={4} />
        {data.photo && (
          <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
            <img src={data.photo} alt="" style={{ width: 95, height: 95, borderRadius: '50%', objectFit: 'cover', border: `3px solid ${c.accent}`, boxShadow: `0 4px 15px ${c.accent}30` }} />
          </div>
        )}
        <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <h1 style={{ fontSize: '1.25em', fontWeight: 800, margin: 0, color: '#ffffff' }}>{data.name}</h1>
          {data.jobTitle && <div style={{ fontSize: '0.82em', color: c.accent, marginTop: 3 }}>{data.jobTitle}</div>}
        </div>
        <div style={{ position: 'relative', zIndex: 1 }}><ContactColumn data={data} color={c.sidebarText} iconColor={c.accent} /></div>
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: '1em' }}>
          <Sections list={t.layout.sidebarSections.filter(s => s !== 'personal' && s !== 'summary')} data={data} props={{ preferences, textColor: c.sidebarText, dateColor: 'rgba(255,255,255,0.55)', titleColor: '#ffffff', accent: c.accent, titleStyle: 'gradient-underline', variant: 'gradient-bars' }} />
        </div>
      </div>
      <div style={{ flex: 1, background: c.background, padding: '1.5em', display: 'flex', flexDirection: 'column', gap: '1.1em' }}>
        <Sections list={t.layout.mainSections} data={data} props={{ preferences, textColor: c.text, dateColor: c.secondary, titleColor: c.sectionTitle, accent: c.accent, titleStyle: 'border-left', showTimeline: true }} />
      </div>
    </div>
  );
}

// 5. BERLIN — Bold red top bar, compact, RIGHT sidebar
function BerlinLayout({ data, template: t, preferences }) {
  const c = t.styles.colors;
  return (
    <div style={{ fontFamily: t.styles.fontFamily, fontSize: t.styles.fontSize, lineHeight: t.styles.lineHeight, background: c.background, color: c.text }}>
      <div style={{ background: c.headerBackground, color: c.headerText, padding: '1rem 1.5em', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5em' }}>
        <div>
          <h1 style={{ fontSize: '1.4em', fontWeight: 800, margin: 0, letterSpacing: '-0.01em' }}>{data.name}</h1>
          {data.jobTitle && <div style={{ fontSize: '0.82em', opacity: 0.9, marginTop: 2 }}>{data.jobTitle}</div>}
        </div>
        <ContactRow data={data} color="rgba(255,255,255,0.85)" separator="|" />
      </div>
      <div style={{ display: 'flex' }}>
        <div style={{ flex: 1, padding: '1rem 1.25em', display: 'flex', flexDirection: 'column', gap: '0.9em' }}>
          <Sections list={t.layout.mainSections} data={data} props={{ preferences, textColor: c.text, dateColor: c.secondary, titleColor: c.sectionTitle, accent: c.accent, titleStyle: 'dot-accent', showTimeline: false }} />
        </div>
        <div style={{ width: t.layout.sidebarWidth, background: c.sidebarBackground, padding: '1em', display: 'flex', flexDirection: 'column', gap: '0.9em', borderLeft: `3px solid ${c.accent}` }}>
          <Sections list={t.layout.sidebarSections} data={data} props={{ preferences, textColor: c.sidebarText || c.text, dateColor: c.secondary, titleColor: c.sectionTitle, accent: c.accent, titleStyle: 'dot-accent', variant: 'dots' }} />
        </div>
      </div>
    </div>
  );
}

// 6. STOCKHOLM — Scandinavian ultra-minimal
function StockholmLayout({ data, template: t, preferences }) {
  const c = t.styles.colors;
  return (
    <div style={{ fontFamily: t.styles.fontFamily, fontSize: t.styles.fontSize, lineHeight: t.styles.lineHeight, background: c.background, color: c.text, padding: '2.5em' }}>
      <div style={{ textAlign: 'center', marginBottom: '1.5em' }}>
        <h1 style={{ fontSize: '2em', fontWeight: 300, margin: 0, color: c.headerText, letterSpacing: '0.2em', textTransform: 'uppercase' }}>{data.name}</h1>
        {data.jobTitle && <div style={{ fontSize: '0.82em', color: c.secondary, marginTop: '0.5em', letterSpacing: '0.12em', textTransform: 'uppercase' }}>{data.jobTitle}</div>}
        <div style={{ width: 40, height: 1, background: c.accent, margin: '1rem auto' }} />
        <ContactRow data={data} color={c.secondary} separator="·" />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.4em' }}>
        <Sections list={t.layout.mainSections} data={data} props={{ preferences, textColor: c.text, dateColor: c.secondary, titleColor: c.sectionTitle, accent: c.accent, titleStyle: 'center-line', variant: 'pills' }} />
      </div>
    </div>
  );
}

// 7. TOKYO — Dark mode, monospace, terminal-inspired
function TokyoLayout({ data, template: t, preferences }) {
  const c = t.styles.colors;
  return (
    <div style={{ fontFamily: t.styles.fontFamily, fontSize: t.styles.fontSize, lineHeight: t.styles.lineHeight, background: c.background, color: c.text, display: 'flex' }}>
      <div style={{ width: t.layout.sidebarWidth, background: c.sidebarBackground, padding: '1.5em', display: 'flex', flexDirection: 'column', gap: '1em', borderRight: `1px solid ${c.divider}` }}>
        <div>
          <div style={{ color: c.accent, fontSize: '0.65em', opacity: 0.6, fontFamily: 'monospace' }}>{'> whoami'}</div>
          <h1 style={{ fontSize: '1.15em', fontWeight: 700, margin: '0.25rem 0 0', color: c.headerText }}>{data.name}</h1>
          {data.jobTitle && <div style={{ fontSize: '0.78em', color: c.accent, marginTop: 2, opacity: 0.9 }}>{data.jobTitle}</div>}
        </div>
        <div style={{ height: 1, background: c.divider }} />
        <div><div style={{ color: c.accent, fontSize: '0.65em', opacity: 0.6, fontFamily: 'monospace', marginBottom: 6 }}>{'> contact --info'}</div><ContactColumn data={data} color={c.sidebarText} iconColor={c.accent} /></div>
        <div style={{ height: 1, background: c.divider }} />
        <Sections list={t.layout.sidebarSections.filter(s => s !== 'personal')} data={data} props={{ preferences, textColor: c.sidebarText, dateColor: 'rgba(255,255,255,0.4)', titleColor: c.sectionTitle, accent: c.accent, titleStyle: 'default', variant: 'gradient-bars' }} />
      </div>
      <div style={{ flex: 1, padding: '1.5em', display: 'flex', flexDirection: 'column', gap: '1.1em' }}>
        <Sections list={t.layout.mainSections} data={data} props={{ preferences, textColor: c.text, dateColor: 'rgba(255,255,255,0.4)', titleColor: c.sectionTitle, accent: c.accent, titleStyle: 'default', showTimeline: true }} />
      </div>
    </div>
  );
}

// 8. MILAN — Editorial serif, asymmetric, dramatic
function MilanLayout({ data, template: t, preferences }) {
  const c = t.styles.colors;
  return (
    <div style={{ fontFamily: t.styles.fontFamily, fontSize: t.styles.fontSize, lineHeight: t.styles.lineHeight, background: c.background, color: c.text }}>
      <div style={{ padding: '2rem 2rem 1.2em', display: 'flex', alignItems: 'flex-end', gap: '1.5em', borderBottom: `1px solid ${c.divider}` }}>
        {data.photo && <img src={data.photo} alt="" style={{ width: 80, height: 100, objectFit: 'cover', filter: 'grayscale(30%)', boxShadow: '4px 4px 0 ' + c.accent }} />}
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: '2.5em', fontWeight: 700, margin: 0, color: c.headerText, lineHeight: 1, letterSpacing: '-0.02em' }}>{data.name}</h1>
          {data.jobTitle && <div style={{ fontSize: '1em', color: c.accent, marginTop: '0.35em', fontStyle: 'italic' }}>{data.jobTitle}</div>}
          <div style={{ marginTop: '0.5em' }}><ContactRow data={data} color={c.secondary} separator="/" /></div>
        </div>
      </div>
      <div style={{ padding: '1.5rem 2em', display: 'flex', flexDirection: 'column', gap: '1.3em' }}>
        <Sections list={t.layout.mainSections} data={data} props={{ preferences, textColor: c.text, dateColor: c.secondary, titleColor: c.sectionTitle, accent: c.accent, titleStyle: 'bold-caps', variant: 'pills' }} />
      </div>
    </div>
  );
}

// 9. DUBAI — Luxurious, gold accents, dark sidebar
function DubaiLayout({ data, template: t, preferences }) {
  const c = t.styles.colors;
  return (
    <div style={{ fontFamily: t.styles.fontFamily, fontSize: t.styles.fontSize, lineHeight: t.styles.lineHeight, display: 'flex' }}>
      <div style={{ width: t.layout.sidebarWidth, background: c.sidebarBackground, color: c.sidebarText, padding: '1.5em', display: 'flex', flexDirection: 'column', gap: '1em', position: 'relative', overflow: 'hidden' }}>
        <CircleDecor color={c.accent} opacity={0.06} size={140} bottom="-40px" right="-30px" />
        {data.photo && (
          <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
            <div style={{ width: 90, height: 90, borderRadius: '50%', margin: '0 auto', border: `2px solid ${c.accent}`, padding: 3, boxShadow: `0 4px 20px ${c.accent}20` }}>
              <img src={data.photo} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
            </div>
          </div>
        )}
        <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <h1 style={{ fontSize: '1.15em', fontWeight: 600, margin: 0, color: c.accent, letterSpacing: '0.05em' }}>{data.name}</h1>
          {data.jobTitle && <div style={{ fontSize: '0.78em', color: c.sidebarText, marginTop: 3, opacity: 0.75 }}>{data.jobTitle}</div>}
        </div>
        <div style={{ width: 30, height: 1, background: c.accent, margin: '0 auto', opacity: 0.5 }} />
        <ContactColumn data={data} color={c.sidebarText} iconColor={c.accent} />
        <Sections list={t.layout.sidebarSections.filter(s => s !== 'personal')} data={data} props={{ preferences, textColor: c.sidebarText, dateColor: 'rgba(255,255,255,0.5)', titleColor: c.accent, accent: c.accent, titleStyle: 'gradient-underline', variant: 'stars' }} />
      </div>
      <div style={{ flex: 1, background: c.background, padding: '1.5em', display: 'flex', flexDirection: 'column', gap: '1.1em' }}>
        <Sections list={t.layout.mainSections} data={data} props={{ preferences, textColor: c.text, dateColor: c.secondary, titleColor: c.sectionTitle, accent: c.accent, titleStyle: 'gradient-underline', showTimeline: true }} />
      </div>
    </div>
  );
}

// 10. SYDNEY — Gradient header, rounded, colorful
function SydneyLayout({ data, template: t, preferences }) {
  const c = t.styles.colors;
  return (
    <div style={{ fontFamily: t.styles.fontFamily, fontSize: t.styles.fontSize, lineHeight: t.styles.lineHeight, background: c.background, color: c.text }}>
      <div style={{ background: c.headerBackground, color: '#ffffff', padding: '1.6rem 2rem 2.5em', position: 'relative', overflow: 'hidden' }}>
        <CircleDecor color="#ffffff" opacity={0.08} size={150} top="-40px" right="10%" />
        <CircleDecor color="#ffffff" opacity={0.05} size={80} bottom="10px" left="5%" />
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: '1.2em' }}>
          {data.photo && <img src={data.photo} alt="" style={{ width: 72, height: 72, borderRadius: 14, objectFit: 'cover', border: '3px solid rgba(255,255,255,0.3)', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }} />}
          <div>
            <h1 style={{ fontSize: '1.5em', fontWeight: 800, margin: 0 }}>{data.name}</h1>
            {data.jobTitle && <div style={{ fontSize: '0.88em', opacity: 0.9, marginTop: 2 }}>{data.jobTitle}</div>}
            <div style={{ marginTop: '0.5em' }}><ContactRow data={data} color="rgba(255,255,255,0.85)" separator="·" /></div>
          </div>
        </div>
        <WaveClip color={c.background} height={40} />
      </div>
      <div style={{ padding: '0.5rem 2rem 1.5em', display: 'flex', flexDirection: 'column', gap: '1.1em' }}>
        <Sections list={t.layout.mainSections} data={data} props={{ preferences, textColor: c.text, dateColor: c.secondary, titleColor: c.sectionTitle, accent: c.accent, titleStyle: 'gradient-underline', variant: 'pills', showTimeline: false }} />
      </div>
    </div>
  );
}

// 11. TORONTO — Blue sidebar with photo, clean professional
function TorontoLayout({ data, template: t, preferences }) {
  const c = t.styles.colors;
  return (
    <div style={{ fontFamily: t.styles.fontFamily, fontSize: t.styles.fontSize, lineHeight: t.styles.lineHeight, display: 'flex' }}>
      <div style={{ width: t.layout.sidebarWidth, background: c.sidebarBackground, color: c.sidebarText, padding: '1.5rem 1.2em', display: 'flex', flexDirection: 'column', gap: '0.9em', position: 'relative', overflow: 'hidden' }}>
        <CircleDecor color="#ffffff" opacity={0.06} size={100} bottom="-30px" left="-30px" />
        {data.photo && (
          <div style={{ textAlign: 'center' }}>
            <img src={data.photo} alt="" style={{ width: 82, height: 82, borderRadius: '50%', objectFit: 'cover', border: '3px solid rgba(255,255,255,0.25)', boxShadow: '0 3px 12px rgba(0,0,0,0.2)' }} />
          </div>
        )}
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '1.15em', fontWeight: 800, margin: 0, wordBreak: 'break-word' }}>{data.name}</h1>
          {data.jobTitle && <div style={{ fontSize: '0.78em', marginTop: 3, opacity: 0.85 }}>{data.jobTitle}</div>}
        </div>
        <div style={{ height: 1, background: 'rgba(255,255,255,0.15)' }} />
        <ContactColumn data={data} color={c.sidebarText} iconColor="rgba(255,255,255,0.6)" />
        <div style={{ height: 1, background: 'rgba(255,255,255,0.15)' }} />
        <Sections list={t.layout.sidebarSections.filter(s => s !== 'personal')} data={data} props={{ preferences, textColor: c.sidebarText, dateColor: 'rgba(255,255,255,0.55)', titleColor: '#ffffff', accent: 'rgba(255,255,255,0.5)', titleStyle: 'gradient-underline', variant: 'dots' }} />
      </div>
      <div style={{ flex: 1, background: c.background, padding: '1.5em', display: 'flex', flexDirection: 'column', gap: '1.1em' }}>
        <Sections list={t.layout.mainSections} data={data} props={{ preferences, textColor: c.text, dateColor: c.secondary, titleColor: c.sectionTitle, accent: c.accent, titleStyle: 'border-left', showTimeline: true }} />
      </div>
    </div>
  );
}

// 12. ATHENS — Classical serif, double-line borders, warm paper
function AthensLayout({ data, template: t, preferences }) {
  const c = t.styles.colors;
  return (
    <div style={{ fontFamily: t.styles.fontFamily, fontSize: t.styles.fontSize, lineHeight: t.styles.lineHeight, background: c.background, color: c.text, padding: '2.5em', border: `1px solid ${c.divider}` }}>
      <div style={{ textAlign: 'center', marginBottom: '1em' }}>
        <div style={{ height: 2, background: c.divider, marginBottom: 6 }} />
        <div style={{ height: 1, background: c.divider, marginBottom: '0.8em' }} />
        <h1 style={{ fontSize: '2em', fontWeight: 400, margin: 0, color: c.headerText, letterSpacing: '0.15em', textTransform: 'uppercase' }}>{data.name}</h1>
        {data.jobTitle && <div style={{ fontSize: '0.9em', color: c.secondary, marginTop: '0.3em', fontStyle: 'italic', letterSpacing: '0.05em' }}>{data.jobTitle}</div>}
        <div style={{ marginTop: '0.5em' }}><ContactRow data={data} color={c.secondary} separator="•" /></div>
        <div style={{ height: 1, background: c.divider, marginTop: '0.8em' }} />
        <div style={{ height: 2, background: c.divider, marginTop: 6 }} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2em' }}>
        <Sections list={t.layout.mainSections} data={data} props={{ preferences, textColor: c.text, dateColor: c.secondary, titleColor: c.sectionTitle, accent: c.divider, titleStyle: 'center-line', variant: 'tags' }} />
      </div>
    </div>
  );
}

// 13. VIBES — Gradient header, card sections, progress bars
function VibesLayout({ data, template: t, preferences }) {
  const c = t.styles.colors;
  return (
    <div style={{ fontFamily: t.styles.fontFamily, fontSize: t.styles.fontSize, lineHeight: t.styles.lineHeight, background: c.background, color: c.text }}>
      <div style={{ background: c.headerBackground, color: '#ffffff', padding: '1.5rem 2rem 2.5em', position: 'relative', overflow: 'hidden' }}>
        <CircleDecor color="#ffffff" opacity={0.1} size={100} top="-20px" right="5%" />
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: '1em' }}>
          {data.photo && <img src={data.photo} alt="" style={{ width: 68, height: 68, borderRadius: '50%', objectFit: 'cover', border: '3px solid rgba(255,255,255,0.35)' }} />}
          <div>
            <h1 style={{ fontSize: '1.5em', fontWeight: 800, margin: 0 }}>{data.name}</h1>
            {data.jobTitle && <div style={{ fontSize: '0.88em', opacity: 0.9, marginTop: 2 }}>{data.jobTitle}</div>}
            <div style={{ marginTop: '0.5em' }}><ContactRow data={data} color="rgba(255,255,255,0.85)" separator="·" /></div>
          </div>
        </div>
        <DiagonalClip color={c.background} height={35} />
      </div>
      <div style={{ padding: '0.5rem 1.5rem 1.5em', display: 'flex', flexDirection: 'column', gap: '0.8em' }}>
        {t.layout.mainSections.map(section => {
          const props = { preferences, textColor: c.text, dateColor: c.secondary, titleColor: c.sectionTitle, accent: c.accent, titleStyle: 'gradient-underline', variant: section === 'skills' ? 'gradient-bars' : 'tags' };
          let content;
          switch (section) {
            case 'summary': content = <Summary data={data} {...props} />; break;
            case 'experience': content = <Experience data={data} {...props} showTimeline={true} />; break;
            case 'education': content = <Education data={data} {...props} />; break;
            case 'skills': content = <Skills data={data} {...props} />; break;
            case 'certifications': content = <Certifications data={data} {...props} />; break;
            case 'languages': content = <Languages data={data} {...props} />; break;
            case 'projects': content = <Projects data={data} {...props} />; break;
            case 'achievements': content = <Achievements data={data} {...props} />; break;
            default: content = null;
          }
          if (!content) return null;
          return <div key={section} style={{ background: c.cardBackground || '#fff', padding: '1rem 1.2em', borderRadius: 8, border: `1px solid ${c.divider}`, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>{content}</div>;
        })}
      </div>
    </div>
  );
}

// 14. NANICA — Ultra-minimal, oversized bold name
function NanicaLayout({ data, template: t, preferences }) {
  const c = t.styles.colors;
  return (
    <div style={{ fontFamily: t.styles.fontFamily, fontSize: t.styles.fontSize, lineHeight: t.styles.lineHeight, background: c.background, color: c.text, padding: '2.5em' }}>
      <div style={{ marginBottom: '2em' }}>
        <h1 style={{ fontSize: '3em', fontWeight: 700, margin: 0, color: c.headerText, lineHeight: 0.95, letterSpacing: '-0.03em' }}>{data.name}</h1>
        {data.jobTitle && <div style={{ fontSize: '1em', color: c.secondary, marginTop: '0.6em', fontWeight: 400 }}>{data.jobTitle}</div>}
        <div style={{ height: 3, background: c.sectionTitle, width: '3em', margin: '1rem 0', borderRadius: 2 }} />
        <ContactRow data={data} color={c.secondary} separator="·" />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5em' }}>
        <Sections list={t.layout.mainSections} data={data} props={{ preferences, textColor: c.text, dateColor: c.secondary, titleColor: c.sectionTitle, accent: c.accent, titleStyle: 'bold-caps', variant: 'pills' }} />
      </div>
    </div>
  );
}

// 15. CARDS — Floating card sections on grey background
function CardsLayout({ data, template: t, preferences }) {
  const c = t.styles.colors;
  return (
    <div style={{ fontFamily: t.styles.fontFamily, fontSize: t.styles.fontSize, lineHeight: t.styles.lineHeight, background: c.background, color: c.text }}>
      <div style={{ background: c.headerBackground, color: '#ffffff', padding: '1.5rem 2em', textAlign: 'center', position: 'relative' }}>
        <CircleDecor color="#ffffff" opacity={0.07} size={100} top="-30px" left="10%" />
        <h1 style={{ fontSize: '1.5em', fontWeight: 800, margin: 0, position: 'relative', zIndex: 1 }}>{data.name}</h1>
        {data.jobTitle && <div style={{ fontSize: '0.88em', opacity: 0.9, marginTop: 2, position: 'relative', zIndex: 1 }}>{data.jobTitle}</div>}
        <div style={{ marginTop: '0.5em', position: 'relative', zIndex: 1 }}><ContactRow data={data} color="rgba(255,255,255,0.85)" separator="·" /></div>
      </div>
      <div style={{ padding: '1rem 1.5em', display: 'flex', flexDirection: 'column', gap: '0.7em' }}>
        {t.layout.mainSections.map(section => {
          const props = { preferences, textColor: c.text, dateColor: c.secondary, titleColor: c.sectionTitle, accent: c.accent, titleStyle: 'dot-accent' };
          let content;
          switch (section) {
            case 'summary': content = <Summary data={data} {...props} />; break;
            case 'experience': content = <Experience data={data} {...props} showTimeline={true} />; break;
            case 'education': content = <Education data={data} {...props} />; break;
            case 'skills': content = <Skills data={data} {...props} />; break;
            case 'certifications': content = <Certifications data={data} {...props} />; break;
            case 'languages': content = <Languages data={data} {...props} />; break;
            case 'projects': content = <Projects data={data} {...props} />; break;
            case 'achievements': content = <Achievements data={data} {...props} />; break;
            default: content = null;
          }
          if (!content) return null;
          return <div key={section} style={{ background: c.cardBackground || '#fff', padding: '1rem 1.2em', borderRadius: 6, boxShadow: c.cardShadow || '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)' }}>{content}</div>;
        })}
      </div>
    </div>
  );
}

// 16. RIBBON — Colored ribbon section headers
function RibbonLayout({ data, template: t, preferences }) {
  const c = t.styles.colors;
  return (
    <div style={{ fontFamily: t.styles.fontFamily, fontSize: t.styles.fontSize, lineHeight: t.styles.lineHeight, background: c.background, color: c.text }}>
      <div style={{ background: c.headerBackground, color: '#ffffff', padding: '1.5rem 2em', position: 'relative' }}>
        <DotsPattern rows={3} cols={5} />
        <h1 style={{ fontSize: '1.5em', fontWeight: 800, margin: 0, position: 'relative', zIndex: 1 }}>{data.name}</h1>
        {data.jobTitle && <div style={{ fontSize: '0.88em', opacity: 0.9, marginTop: 2, position: 'relative', zIndex: 1 }}>{data.jobTitle}</div>}
        <div style={{ marginTop: '0.5em', position: 'relative', zIndex: 1 }}><ContactRow data={data} color="rgba(255,255,255,0.85)" separator="·" /></div>
      </div>
      <div style={{ padding: '1.2rem 1.2em', display: 'flex', flexDirection: 'column', gap: '0.8em' }}>
        <Sections list={t.layout.mainSections} data={data} props={{ preferences, textColor: c.text, dateColor: c.secondary, titleColor: '#ffffff', accent: c.ribbonBackground || c.accent, titleStyle: 'ribbon', showTimeline: false }} />
      </div>
    </div>
  );
}

// 17. ACCENT LINE — Thin colored bar on left edge
function AccentLineLayout({ data, template: t, preferences }) {
  const c = t.styles.colors;
  return (
    <div style={{ fontFamily: t.styles.fontFamily, fontSize: t.styles.fontSize, lineHeight: t.styles.lineHeight, background: c.background, color: c.text, display: 'flex' }}>
      <div style={{ width: 5, background: `linear-gradient(180deg, ${c.accentLine || c.accent}, ${c.accentLine || c.accent}60)`, flexShrink: 0 }} />
      <div style={{ flex: 1, padding: '2em' }}>
        <div style={{ marginBottom: '1.2em', paddingBottom: '1em', borderBottom: `1px solid ${c.divider}` }}>
          <h1 style={{ fontSize: '1.7em', fontWeight: 700, margin: 0, color: c.headerText, letterSpacing: '-0.01em' }}>{data.name}</h1>
          {data.jobTitle && <div style={{ fontSize: '0.88em', color: c.accentLine || c.accent, marginTop: 3, fontWeight: 500 }}>{data.jobTitle}</div>}
          <div style={{ marginTop: '0.5em' }}><ContactRow data={data} color={c.secondary} separator="·" /></div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1em' }}>
          <Sections list={t.layout.mainSections} data={data} props={{ preferences, textColor: c.text, dateColor: c.secondary, titleColor: c.sectionTitle, accent: c.accentLine || c.accent, titleStyle: 'border-left', showTimeline: true, variant: 'tags' }} />
        </div>
      </div>
    </div>
  );
}

// 18. DUOTONE — Colored header, right sidebar
function DuotoneLayout({ data, template: t, preferences }) {
  const c = t.styles.colors;
  return (
    <div style={{ fontFamily: t.styles.fontFamily, fontSize: t.styles.fontSize, lineHeight: t.styles.lineHeight, background: c.background, color: c.text }}>
      <div style={{ background: c.headerBackground || c.topBackground, color: '#ffffff', padding: '1.5rem 2em', display: 'flex', alignItems: 'center', gap: '1em', position: 'relative', overflow: 'hidden' }}>
        <CircleDecor color="#ffffff" opacity={0.07} size={120} top="-30px" right="-20px" />
        {data.photo && <img src={data.photo} alt="" style={{ width: 65, height: 65, borderRadius: '50%', objectFit: 'cover', border: '3px solid rgba(255,255,255,0.25)', position: 'relative', zIndex: 1 }} />}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h1 style={{ fontSize: '1.5em', fontWeight: 800, margin: 0 }}>{data.name}</h1>
          {data.jobTitle && <div style={{ fontSize: '0.88em', opacity: 0.9, marginTop: 2 }}>{data.jobTitle}</div>}
          <div style={{ marginTop: '0.5em' }}><ContactRow data={data} color="rgba(255,255,255,0.8)" separator="·" /></div>
        </div>
      </div>
      <div style={{ display: 'flex' }}>
        <div style={{ flex: 1, padding: '1.2rem 1.5em', display: 'flex', flexDirection: 'column', gap: '1.1em' }}>
          <Sections list={t.layout.mainSections} data={data} props={{ preferences, textColor: c.text, dateColor: c.secondary, titleColor: c.sectionTitle, accent: c.accent, titleStyle: 'gradient-underline', showTimeline: true }} />
        </div>
        <div style={{ width: t.layout.sidebarWidth, background: c.sidebarBackground, padding: '1.2em', display: 'flex', flexDirection: 'column', gap: '0.9em', borderLeft: `1px solid ${c.divider}` }}>
          <Sections list={t.layout.sidebarSections} data={data} props={{ preferences, textColor: c.sidebarText || c.text, dateColor: c.secondary, titleColor: c.sectionTitle, accent: c.accent, titleStyle: 'gradient-underline', variant: 'circular' }} />
        </div>
      </div>
    </div>
  );
}

// 19. METRO — Flat design, tile headers, compact
function MetroLayout({ data, template: t, preferences }) {
  const c = t.styles.colors;
  return (
    <div style={{ fontFamily: t.styles.fontFamily, fontSize: t.styles.fontSize, lineHeight: t.styles.lineHeight, background: c.background, color: c.text }}>
      <div style={{ background: c.headerBackground, color: '#ffffff', padding: '1rem 1.5em', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.35em', fontWeight: 700, margin: 0, letterSpacing: '0.01em' }}>{data.name}</h1>
          {data.jobTitle && <div style={{ fontSize: '0.82em', opacity: 0.9 }}>{data.jobTitle}</div>}
        </div>
      </div>
      <div style={{ padding: '0.5rem 1.25rem 0.3em', borderBottom: `1px solid ${c.divider}` }}>
        <ContactRow data={data} color={c.text} separator="|" />
      </div>
      <div style={{ display: 'flex' }}>
        <div style={{ width: t.layout.sidebarWidth, background: c.sidebarBackground, padding: '0.8em', display: 'flex', flexDirection: 'column', gap: '0.7em' }}>
          <Sections list={t.layout.sidebarSections} data={data} props={{ preferences, textColor: c.sidebarText || c.text, dateColor: c.secondary, titleColor: c.sectionTitle, accent: c.accent, titleStyle: 'dot-accent', variant: 'dots' }} />
        </div>
        <div style={{ flex: 1, padding: '0.8rem 1.25em', display: 'flex', flexDirection: 'column', gap: '0.9em' }}>
          <Sections list={t.layout.mainSections} data={data} props={{ preferences, textColor: c.text, dateColor: c.secondary, titleColor: c.sectionTitle, accent: c.accent, titleStyle: 'dot-accent', showTimeline: false }} />
        </div>
      </div>
    </div>
  );
}

// 20. INFOGRAPHIC — Data viz sidebar, circular skills, timeline
function InfographicLayout({ data, template: t, preferences }) {
  const c = t.styles.colors;
  return (
    <div style={{ fontFamily: t.styles.fontFamily, fontSize: t.styles.fontSize, lineHeight: t.styles.lineHeight, display: 'flex', background: c.background }}>
      <div style={{ width: t.layout.sidebarWidth, background: c.sidebarBackground, padding: '1.5em', display: 'flex', flexDirection: 'column', gap: '1em' }}>
        {data.photo && (
          <div style={{ textAlign: 'center' }}>
            <img src={data.photo} alt="" style={{ width: 90, height: 90, borderRadius: '50%', objectFit: 'cover', border: `3px solid ${c.accent}`, boxShadow: `0 3px 10px ${c.accent}20` }} />
          </div>
        )}
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '1.15em', fontWeight: 800, margin: 0, color: c.sectionTitle }}>{data.name}</h1>
          {data.jobTitle && <div style={{ fontSize: '0.8em', color: c.accent, marginTop: 3, fontWeight: 500 }}>{data.jobTitle}</div>}
        </div>
        <div style={{ height: 2, background: `linear-gradient(90deg, ${c.accent}60, transparent)` }} />
        <ContactColumn data={data} color={c.text} iconColor={c.accent} />
        <Sections list={t.layout.sidebarSections.filter(s => s !== 'personal')} data={data} props={{ preferences, textColor: c.text, dateColor: c.secondary, titleColor: c.sectionTitle, accent: c.accent, titleStyle: 'gradient-underline', variant: 'circular' }} />
      </div>
      <div style={{ flex: 1, padding: '1.5em', display: 'flex', flexDirection: 'column', gap: '1.1em' }}>
        <Sections list={t.layout.mainSections} data={data} props={{ preferences, textColor: c.text, dateColor: c.secondary, titleColor: c.sectionTitle, accent: c.accent, titleStyle: 'border-left', showTimeline: true }} />
      </div>
    </div>
  );
}

// ========== MAIN RENDERER ==========

const layoutMap = {
  'cascade': CascadeLayout,
  'iconic': IconicLayout,
  'primo': PrimoLayout,
  'split': SplitLayout,
  'berlin': BerlinLayout,
  'stockholm': StockholmLayout,
  'tokyo': TokyoLayout,
  'milan': MilanLayout,
  'dubai': DubaiLayout,
  'sydney': SydneyLayout,
  'toronto': TorontoLayout,
  'athens': AthensLayout,
  'vibes': VibesLayout,
  'nanica': NanicaLayout,
  'cards': CardsLayout,
  'ribbon': RibbonLayout,
  'accent-line': AccentLineLayout,
  'duotone': DuotoneLayout,
  'metro': MetroLayout,
  'infographic': InfographicLayout,
};

const PremiumDesignRenderer = memo(({ data: rawData, template: rawTemplate, isCompact = false, preferences = {}, customColors = {} }) => {
  if (!rawData || !rawTemplate) return null;

  // ─── Apply visibility preferences ───
  const vis = preferences?.visibility || {};
  const filteredData = {
    ...rawData,
    summary: vis.summary === false ? '' : rawData.summary,
    experience: vis.experience === false ? [] : rawData.experience,
    education: vis.education === false ? [] : rawData.education,
    skills: vis.skills === false ? [] : rawData.skills,
    certifications: vis.certifications === false ? [] : rawData.certifications,
    languages: vis.languages === false ? [] : rawData.languages,
    customSections: vis.customSections === false ? [] : rawData.customSections,
    photo: vis.photo === false ? '' : rawData.photo,
  };

  // ─── Build effective template with font + color overrides ───
  const baseStyles = { ...rawTemplate.styles };

  // Font family
  const fontPref = preferences?.typography?.fontPair?.fontFamily;
  if (fontPref) baseStyles.fontFamily = fontPref;

  // Font size
  const fontSizePref = preferences?.typography?.fontSize;
  if (fontSizePref === 'small') baseStyles.fontSize = '9pt';
  else if (fontSizePref === 'large') baseStyles.fontSize = '11.5pt';

  // Line height
  const lineHeightPref = preferences?.typography?.lineHeight;
  if (lineHeightPref === 'compact') baseStyles.lineHeight = '1.25';
  else if (lineHeightPref === 'relaxed') baseStyles.lineHeight = '1.6';

  // Merge custom colors
  if (Object.keys(customColors).length > 0) {
    const baseColors = { ...baseStyles.colors };
    if (customColors.primary) {
      baseColors.headerBackground = customColors.primary;
      baseColors.sidebarBackground = customColors.primary;
    }
    if (customColors.accent) baseColors.accent = customColors.accent;
    if (customColors.text) baseColors.text = customColors.text;
    if (customColors.background) baseColors.background = customColors.background;
    baseStyles.colors = baseColors;
  }

  const effectiveTemplate = { ...rawTemplate, styles: baseStyles };

  const layoutType = effectiveTemplate.layout?.layoutType || 'cascade';
  const LayoutComponent = layoutMap[layoutType] || CascadeLayout;

  return (
    <div
      className="premium-design-resume"
      style={{
        width: '100%',
        maxWidth: '210mm',
        minHeight: '297mm',
        margin: '0 auto',
        boxShadow: isCompact ? 'none' : '0 2px 20px rgba(0,0,0,0.08)',
        transform: isCompact ? 'scale(0.65)' : 'none',
        transformOrigin: 'top left',
        printColorAdjust: 'exact',
        WebkitPrintColorAdjust: 'exact',
      }}
    >
      <LayoutComponent data={filteredData} template={effectiveTemplate} preferences={preferences} />
    </div>
  );
});

PremiumDesignRenderer.displayName = 'PremiumDesignRenderer';

export default PremiumDesignRenderer;
