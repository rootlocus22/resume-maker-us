"use client";
import { useState } from "react";
import { Document, Page, Text, View, StyleSheet, PDFViewer } from "@react-pdf/renderer";
import { allTemplates as templates } from "../lib/allTemplates";
import { event } from "../lib/gtag";

const iconMap = {
  Bookmark: "🔖",
  Briefcase: "💼",
  GraduationCap: "🎓",
  Award: "🏆",
  Wrench: "🔧",
  Languages: "🌐",
  Eye: "👁️",
};

// PDF-specific styles
const styles = StyleSheet.create({
  page: {
    padding: 30, // ~10mm margins
    backgroundColor: "#ffffff",
    fontFamily: "Helvetica", // Default fallback; overridden by templateConfig.fontFamily
    fontSize: 12,
    color: "#333333",
  },
  header: {
    marginBottom: 20,
    textAlign: "center",
  },
  headerName: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  headerDetails: {
    fontSize: 10,
    color: "#666666",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 10,
  },
  section: {
    marginBottom: 16,
    borderLeftWidth: 4,
    paddingLeft: 12,
    breakInside: "avoid",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionContent: {
    fontSize: 11,
    lineHeight: 1.5,
  },
  experienceItem: {
    marginBottom: 12,
    breakInside: "avoid",
  },
  experienceTitle: {
    fontSize: 13,
    fontWeight: "bold",
  },
  experienceCompany: {
    fontSize: 11,
    color: "#666666",
  },
  experienceDetails: {
    fontSize: 10,
    color: "#666666",
  },
  twoColumn: {
    flexDirection: "row",
    gap: 20,
  },
  sidebar: {
    width: "35%",
  },
  main: {
    width: "65%",
  },
});

const ResumePDF = ({ data, template = "default", customColors = {} }) => {
  const templateConfig = templates[template];
  const { layout } = templateConfig;
  const mergedColors = { ...templateConfig.styles.colors, ...customColors };

  const renderSections = () => {
    return layout.sectionsOrder.map((section) => {
      if (!data[section]?.length && section !== "summary") return null;

      const sectionStyle = {
        borderLeftColor: mergedColors.accent,
      };

      switch (section) {
        case "summary":
          return (
            <View key={section} style={[styles.section, sectionStyle]} wrap={false}>
              <View style={styles.sectionTitle}>
                {layout.showIcons && <Text style={styles.icon}>{iconMap.Bookmark}</Text>}
                <Text style={{ color: mergedColors.primary }}>Summary</Text>
              </View>
              <Text style={styles.sectionContent}>
                {data.summary || "Your professional summary goes here."}
              </Text>
            </View>
          );

        case "experience":
          return (
            <View key={section} style={[styles.section, sectionStyle]} wrap={false}>
              <View style={styles.sectionTitle}>
                {layout.showIcons && <Text style={styles.icon}>{iconMap.Briefcase}</Text>}
                <Text style={{ color: mergedColors.primary }}>Professional Experience</Text>
              </View>
              {data.experience.map((exp, index) => (
                <View key={index} style={styles.experienceItem}>
                  <Text style={[styles.experienceTitle, { color: mergedColors.primary }]}>
                    {exp.jobTitle || "Job Title"}
                  </Text>
                  <Text style={[styles.experienceCompany, { color: mergedColors.secondary }]}>
                    {exp.company || "Company Name"}
                  </Text>
                  <Text style={[styles.experienceDetails, { color: mergedColors.secondary }]}>
                    {exp.startDate || "Start"} - {exp.endDate || "Present"} | {exp.location || "Location"}
                  </Text>
                  <Text style={styles.sectionContent}>
                    {exp.description || "Description of responsibilities and achievements."}
                  </Text>
                </View>
              ))}
            </View>
          );

        case "education":
          return (
            <View key={section} style={[styles.section, sectionStyle]} wrap={false}>
              <View style={styles.sectionTitle}>
                {layout.showIcons && <Text style={styles.icon}>{iconMap.GraduationCap}</Text>}
                <Text style={{ color: mergedColors.primary }}>Education</Text>
              </View>
              {data.education.map((edu, index) => (
                <View key={index} style={{ marginBottom: 8 }}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
                    <Text style={[styles.experienceTitle, { color: mergedColors.primary, flex: 1 }]}>
                      {edu.institution || "Institution Name"}
                    </Text>
                    <Text style={[styles.experienceDetails, { color: mergedColors.secondary, textAlign: "right" }]}>
                      {edu.startDate || "Start"} - {edu.endDate || "Present"}
                    </Text>
                  </View>
                  <Text style={styles.sectionContent}>
                    {edu.degree || "Degree"} in {edu.field || "Field of Study"}
                  </Text>
                  {edu.gpa && <Text style={styles.sectionContent}>GPA: {edu.gpa}</Text>}
                </View>
              ))}
            </View>
          );

        case "skills":
          return (
            <View key={section} style={[styles.section, sectionStyle]} wrap={false}>
              <View style={styles.sectionTitle}>
                {layout.showIcons && <Text style={styles.icon}>{iconMap.Wrench}</Text>}
                <Text style={{ color: mergedColors.primary }}>Skills</Text>
              </View>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
                {data.skills.map((skill, index) => (
                  <Text key={index} style={styles.sectionContent}>
                    {skill.name || "Skill"} ({skill.proficiency || "Proficiency"})
                  </Text>
                ))}
              </View>
            </View>
          );

        case "certifications":
          return (
            <View key={section} style={[styles.section, sectionStyle]} wrap={false}>
              <View style={styles.sectionTitle}>
                {layout.showIcons && <Text style={styles.icon}>{iconMap.Award}</Text>}
                <Text style={{ color: mergedColors.primary }}>Certifications</Text>
              </View>
              {data.certifications.map((cert, index) => (
                <View key={index} style={{ marginBottom: 8 }}>
                  <Text style={[styles.experienceTitle, { color: mergedColors.primary }]}>
                    {cert.name || "Certification Name"}
                  </Text>
                  <Text style={[styles.experienceDetails, { color: mergedColors.secondary }]}>
                    {cert.issuer || ''}{cert.issuer && cert.date ? ' • ' : ''}{cert.date || ''}
                  </Text>
                </View>
              ))}
            </View>
          );

        case "languages":
          return (
            <View key={section} style={[styles.section, sectionStyle]} wrap={false}>
              <View style={styles.sectionTitle}>
                {layout.showIcons && <Text style={styles.icon}>{iconMap.Languages}</Text>}
                <Text style={{ color: mergedColors.primary }}>Languages</Text>
              </View>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
                {data.languages.map((lang, index) => (
                  <Text key={index} style={styles.sectionContent}>
                    {lang.language || "Language"} ({lang.proficiency || "Proficiency"})
                  </Text>
                ))}
              </View>
            </View>
          );

        default:
          return null;
      }
    });
  };

  const renderLayout = () => {
    const sections = renderSections();
    if (layout.columns === 1) {
      return sections;
    }

    if (layout.columns === 2) {
      const splitIndex = layout.columnSplitAfter || Math.ceil(sections.length / 2);
      return (
        <View style={styles.twoColumn}>
          <View style={styles.sidebar}>{sections.slice(0, splitIndex)}</View>
          <View style={styles.main}>{sections.slice(splitIndex)}</View>
        </View>
      );
    }
  };

  return (
    <Document>
      <Page size="A4" style={[styles.page, { fontFamily: templateConfig.styles.fontFamily }]}>
        <View style={[styles.header, { textAlign: layout.headerAlignment }]}>
          <Text style={[styles.headerName, { color: mergedColors.primary }]}>
            {data.name || "Your Name"}
          </Text>
          <View style={styles.headerDetails}>
            <Text>{data.email || "email@example.com"}</Text>
            <Text>{data.phone || "+1 (555) 123-4567"}</Text>
            <Text>{data.address || "123 Street, City, Country"}</Text>
          </View>
          <View style={styles.headerDetails}>
            {data.linkedin && (
              <Text>LinkedIn: {data.linkedin}</Text>
            )}
            {data.portfolio && (
              <Text>Portfolio: {data.portfolio}</Text>
            )}
          </View>
        </View>
        {renderLayout()}
      </Page>
    </Document>
  );
};