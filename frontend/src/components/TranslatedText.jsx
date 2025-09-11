import React, { useEffect, useState } from 'react';

const TranslatedText = ({ text, language = 'en', className = '' }) => {
  const [translatedText, setTranslatedText] = useState(text);

  useEffect(() => {
    if (language === 'en') {
      setTranslatedText(text);
      return;
    }

    const translateText = async () => {
      try {
        const response = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${language}&dt=t&q=${encodeURIComponent(text)}`);
        const data = await response.json();
        if (data && data[0] && data[0][0] && data[0][0][0]) {
          setTranslatedText(data[0][0][0]);
        }
      } catch (error) {
        setTranslatedText(text);
      }
    };

    translateText();
  }, [text, language]);

  return <span className={className}>{translatedText}</span>;
};

export default TranslatedText;