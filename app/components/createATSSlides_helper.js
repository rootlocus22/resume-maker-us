
// Helper for creating ATS slides from passed templates
function createATSSlides(atsTemplates, isMobile = false) {
    if (!atsTemplates) return [];

    return Object.entries(atsTemplates)
        .sort(([keyA, tempA], [keyB, tempB]) => {
            // Sort by ATS score if available, otherwise default order
            const scoreA = tempA.atsScore || 0;
            const scoreB = tempB.atsScore || 0;
            return scoreB - scoreA;
        })
        .map(([key, template]) => ({
            key: key,
            template: key,
            label: template.name,
            description: template.description || "ATS-Optimized Template",
            category: "ATS-Optimized",
            colorName: "Professional",
            colors: template.styles?.colors || {
                primary: "#000000",
                accent: "#2563eb",
                secondary: "#666666",
                text: "#1f2937",
                background: "#ffffff",
            },
            personality: "Professional",
            font: FONT_STYLES[0], // Standard font
            skillsStyle: SKILLS_STYLES[0], // List style preferred for ATS
            phase: "ats-templates",
            atsScore: template.atsScore,
            atsFeatures: template.atsFeatures
        }));
}
