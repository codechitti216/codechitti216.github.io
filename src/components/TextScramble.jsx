import { useState, useEffect, useRef } from 'react';

const CHARS = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲンΑΒΓΔΕΖΗΘΙΚΛΜΞΟΠΡΣΤΥΦΧΨΩабвгдежзийклмнопрстуфхцчшщэюя0123456789@#$%&';

export default function TextScramble({ text, className }) {
  const [displayed, setDisplayed] = useState('');
  const frameRef = useRef(null);

  useEffect(() => {
    let iteration = 0;
    const totalFrames = text.length * 3;

    const scramble = () => {
      setDisplayed(
        text
          .split('')
          .map((char, i) => {
            if (char === ' ') return ' ';
            if (i < iteration / 3) return text[i];
            return CHARS[Math.floor(Math.random() * CHARS.length)];
          })
          .join('')
      );

      iteration++;

      if (iteration <= totalFrames) {
        frameRef.current = requestAnimationFrame(() => {
          setTimeout(scramble, 30);
        });
      }
    };

    scramble();

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [text]);

  return <span className={className}>{displayed}</span>;
}
