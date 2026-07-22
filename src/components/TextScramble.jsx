import { useState, useEffect, useRef } from 'react';

const CHARS = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲンΑΒΓΔΕΖΗΘΙΚΛΜΞΟΠΡΣΤΥΦΧΨΩабвгдежзийклмнопрстуфхцчшщэюя0123456789@#$%&';

export default function TextScramble({ text, className }) {
  const [displayed, setDisplayed] = useState(() =>
    text.split('').map(c => c === ' ' ? ' ' : CHARS[Math.floor(Math.random() * CHARS.length)]).join('')
  );
  const resolvedRef = useRef(new Set());
  const frameRef = useRef(null);

  useEffect(() => {
    resolvedRef.current = new Set();
    let frame = 0;

    const scramble = () => {
      // Every few frames, lock in the next unresolved character
      if (frame % 4 === 0 && resolvedRef.current.size < text.length) {
        // Find next unresolved non-space character
        for (let i = 0; i < text.length; i++) {
          if (!resolvedRef.current.has(i) && text[i] !== ' ') {
            resolvedRef.current.add(i);
            break;
          }
        }
      }

      setDisplayed(
        text
          .split('')
          .map((char, i) => {
            if (char === ' ') return ' ';
            if (resolvedRef.current.has(i)) return text[i];
            return CHARS[Math.floor(Math.random() * CHARS.length)];
          })
          .join('')
      );

      frame++;

      if (resolvedRef.current.size < text.replace(/ /g, '').length) {
        frameRef.current = requestAnimationFrame(() => {
          setTimeout(scramble, 40);
        });
      } else {
        setDisplayed(text);
      }
    };

    // Small delay before starting
    const timeout = setTimeout(scramble, 200);

    return () => {
      clearTimeout(timeout);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [text]);

  return <span className={className}>{displayed}</span>;
}
