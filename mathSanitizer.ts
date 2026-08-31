// Comprehensive math string sanitizer to repair corrupted LaTeX escapes, control chars, and shorthand notation
export const cleanMathString = (text: string): string => {
  if (!text || typeof text !== 'string') return text || '';

  let s = text;

  // 1. Convert JSON-escaped control characters back to their intended LaTeX commands
  s = s
    .replace(/\x0Crac/g, '\\frac') // Form Feed + rac -> \frac
    .replace(/\x0C/g, '\\f') // Form Feed -> \f (e.g. \forall)
    .replace(/\x08egin/gi, '\\begin') // Backspace + egin -> \begin
    .replace(/\x08oldsymbol/gi, '\\boldsymbol')
    .replace(/\x08eta/gi, '\\beta')
    .replace(/\x08ar/gi, '\\bar')
    .replace(/\x08/g, '\\b')
    .replace(/\x0Dight/gi, '\\right')
    .replace(/\x0Dho/gi, '\\rho')
    .replace(/\x09imes/gi, '\\times')
    .replace(/\x09ext/gi, '\\text')
    .replace(/\x09heta/gi, '\\theta')
    .replace(/\x09au/gi, '\\tau')
    .replace(/\x09o\b/g, '\\to')
    .replace(/[\u0000-\u0006\u000B\u000E-\u001F]/g, '');

  // 2. Clean corrupted HTML entities & broken ampersand prefixes before infinity or math symbols
  // e.g. -&\infty; or -&∞; or &infin; or &infty; or - & \infty or -&oo; or &infin
  s = s
    .replace(/([-\+])\s*&+(?:amp;)?\s*\\?(?:infty|infin|oo|∞);?/gi, '$1\\infty')
    .replace(/&+(?:amp;)?\s*\\?(?:infty|infin|oo|∞);?/gi, '\\infty')
    .replace(/&minus;/gi, '-')
    .replace(/&plusmn;/gi, '\\pm')
    .replace(/&le;/gi, '\\le')
    .replace(/&ge;/gi, '\\ge')
    .replace(/&ne;/gi, '\\neq')
    .replace(/&times;/gi, '\\times')
    .replace(/&middot;/gi, '\\cdot')
    .replace(/&alpha;/gi, '\\alpha')
    .replace(/&beta;/gi, '\\beta')
    .replace(/&gamma;/gi, '\\gamma')
    .replace(/&theta;/gi, '\\theta')
    .replace(/&pi;/gi, '\\pi')
    .replace(/&Delta;/gi, '\\Delta')
    .replace(/&infin;/gi, '\\infty')
    .replace(/&rarr;/gi, '\\to')
    .replace(/&harr;/gi, '\\leftrightarrow')
    .replace(/&sub;/gi, '\\subset')
    .replace(/&cup;/gi, '\\cup')
    .replace(/&cap;/gi, '\\cap')
    .replace(/&empty;/gi, '\\emptyset')
    .replace(/&isin;/gi, '\\in')
    .replace(/&notin;/gi, '\\notin');

  // Convert standalone unicode infinity symbol ∞ to \infty
  s = s.replace(/([-\+])\s*∞/g, '$1\\infty').replace(/∞/g, '\\infty');

  // Fix corrupted superscript signs before infty/infinity like ^{-} infty, ^{-} \infty, ^{+} infty, ^{+} \infty, ^-\infty, ^+\infty
  s = s
    .replace(/\^\{\s*-\s*\}\s*\\?inft?y\b/gi, '-\\infty')
    .replace(/\^\{\s*\+\s*\}\s*\\?inft?y\b/gi, '+\\infty')
    .replace(/\^-\s*\\?inft?y\b/gi, '-\\infty')
    .replace(/\^\+\s*\\?inft?y\b/gi, '+\\infty')
    .replace(/\^\{\s*-\s*\}\s*\\infty/gi, '-\\infty')
    .replace(/\^\{\s*\+\s*\}\s*\\infty/gi, '+\\infty')
    .replace(/\^-\s*\\infty/gi, '-\\infty')
    .replace(/\^\+\s*\\infty/gi, '+\\infty')
    .replace(/\^\{\s*-\s*\}\s*oo\b/gi, '-\\infty')
    .replace(/\^\{\s*\+\s*\}\s*oo\b/gi, '+\\infty')
    .replace(/\^-\s*oo\b/gi, '-\\infty')
    .replace(/\^\+\s*oo\b/gi, '+\\infty')
    .replace(/\b-\s*inft?y\b/gi, '-\\infty')
    .replace(/\b\+\s*inft?y\b/gi, '+\\infty');

  // 3. Clean nested or double dollar corruptions like $(-\$\infty\$; 0)$ or $\$$
  s = s
    .replace(/\$\s*\$\s*\\infty\s*\$\s*\$/g, '\\infty')
    .replace(/([-\+])\s*\$\s*\\infty\s*\$/g, '$1\\infty')
    .replace(/\$\s*\\infty\s*\$/g, '\\infty');

  // 4. Repair corrupted \frac where \f was eaten completely (e.g. rac12 -> \frac{1}{2}, -rac12 -> -\frac{1}{2})
  // Shorthand rac with brackets: rac{1}{2} -> \frac{1}{2}
  s = s.replace(/(?<![a-zA-Z\\])rac\{([^{}]+)\}\{([^{}]+)\}/g, '\\frac{$1}{$2}');

  // Shorthand rac with 2 digits: rac12 -> \frac{1}{2}, rac34 -> \frac{3}{4}, rac13 -> \frac{1}{3}, etc.
  s = s.replace(/(?<![a-zA-Z\\])rac([0-9])([0-9])/g, '\\frac{$1}{$2}');

  // Shorthand rac with alphanumeric: rac1x -> \frac{1}{x}, racx2 -> \frac{x}{2}
  s = s.replace(/(?<![a-zA-Z\\])rac([0-9a-zA-Z])([0-9a-zA-Z])/g, '\\frac{$1}{$2}');

  // Unbraced single-token \frac: \frac12 -> \frac{1}{2}, \frac34 -> \frac{3}{4}
  s = s.replace(/\\frac([0-9])([0-9])/g, '\\frac{$1}{$2}');
  s = s.replace(/\\frac([0-9])([a-zA-Z])/g, '\\frac{$1}{$2}');
  s = s.replace(/\\frac([a-zA-Z])([0-9])/g, '\\frac{$1}{$2}');

  // 5. Repair missing backslashes for common math symbols when preceded by non-letters
  s = s.replace(
    /(?<![a-zA-Z\\])(sqrt\{[^{}]+\}|mathbb\{[^{}]+\}|infty|alpha|beta|gamma|theta|pi|pm|mp|le|ge|neq|approx|equiv|forall|exists|subset|cup|cap|setminus|nearrow|searrow|nwarrow|swarrow|uparrow|downarrow)\b/g,
    '\\$1'
  );

  return s;
};
