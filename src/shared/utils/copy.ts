export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('copy failed:', err);
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      const result = document.execCommand('copy');
      document.body.removeChild(textarea);
      return result;
    } catch (fallbackErr) {
      console.error('fallback copy failed:', fallbackErr);
      return false;
    }
  }
};

export const copyAllExamples = (patterns: { title: string; examples: { en: string; zh: string }[] }[]): string => {
  let result = '';
  patterns.forEach((pattern, index) => {
    result += `${pattern.title}\n`;
    pattern.examples.forEach((ex) => {
      result += `${ex.en}\n${ex.zh}\n\n`;
    });
    if (index < patterns.length - 1) {
      result += '---\n\n';
    }
  });
  return result.trim();
};
