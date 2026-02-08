// Rich text rendering utilities for converting markdown-like syntax to HTML

export const parseRichText = (text) => {
  if (!text || typeof text !== 'string') return text;
  
  let html = text;
  
  // Convert bold text: **text** -> <strong>text</strong>
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // Convert italic text: *text* -> <em>text</em>  
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  
  // Convert line breaks to <br> tags
  html = html.replace(/\n/g, '<br>');
  
  return html;
};

export const parseRichTextForPDF = (text) => {
  if (!text || typeof text !== 'string') return text;
  
  let html = text;
  
  // Convert bold text: **text** -> <strong>text</strong>
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // Convert italic text: *text* -> <em>text</em>
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  
  // Convert line breaks to <br> tags
  html = html.replace(/\n/g, '<br>');
  
  return html;
};


// Extract plain text from rich text (remove formatting)
export const extractPlainText = (text) => {
  if (!text || typeof text !== 'string') return text;
  
  let plain = text;
  
  // Remove bold markers
  plain = plain.replace(/\*\*(.*?)\*\*/g, '$1');
  
  // Remove italic markers
  plain = plain.replace(/\*(.*?)\*/g, '$1');
  
  // Remove bullet points
  plain = plain.replace(/^[•\-\*]\s*/gm, '');
  
  // Remove numbering
  plain = plain.replace(/^\d+\.\s*/gm, '');
  
  return plain;
};

// Convert array of strings to rich text HTML
export const parseArrayToRichText = (array) => {
  if (!Array.isArray(array)) return '';
  
  return array.map(item => {
    if (typeof item === 'string') {
      return parseRichText(item);
    }
    return item;
  }).join('<br>');
};
