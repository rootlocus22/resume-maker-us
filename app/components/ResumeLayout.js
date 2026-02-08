// components/ResumeLayouts.tsx
export const TemplateRenderer = ({ data, template }) => {
    const LayoutComponent = {
      default: ClassicLayout,
      modern: ModernLayout,
      executive: ExecutiveLayout,
      creative: CreativeLayout,
      technical: TechnicalLayout
    }[template];
  
    return <LayoutComponent data={data} />;
  };