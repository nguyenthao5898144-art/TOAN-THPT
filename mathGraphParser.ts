import { GraphData, BBTData } from '../data/diagramBank';
import { cleanMathString } from './mathSanitizer';

/**
 * Parses and evaluates high school math functions for dynamic Oxy graphing.
 */

export interface ParsedMathFunction {
  rawFormula: string;
  expressionDisplay: string;
  evaluate: (x: number) => number;
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
  keyPoints: { x: number; y: number; label?: string }[];
  asymptotes: { type: 'vertical' | 'horizontal' | 'oblique'; val: number; eq: string; slope?: number; intercept?: number }[];
  discontinuities: number[];
}

/**
 * Parses raw text containing an ASCII / Markdown Bảng Biến Thiên (BBT) table
 * and converts it into a clean structured BBTData object while removing table junk from content text.
 */
export function parseAsciiBBT(rawText: string): { cleanedText: string; bbtData?: BBTData } | null {
  if (!rawText) return null;

  // Unescape literal \n strings if present
  const unescapedText = rawText.replace(/\\n/g, '\n');

  // Check if text has signs of an ASCII/Markdown BBT table or Bảng xét dấu
  const hasBBTSigns =
    (unescapedText.toLowerCase().includes('bảng biến thiên') ||
      unescapedText.toLowerCase().includes('bảng xét dấu') ||
      unescapedText.toLowerCase().includes("f'(x)") ||
      unescapedText.includes("y'") ||
      unescapedText.includes("f'") ||
      unescapedText.includes("y\\prime") ||
      unescapedText.includes("f\\prime") ||
      /\|\s*[\+\-0]\s*\|/i.test(unescapedText) ||
      /\b[a-zA-Z]\s*\|\s*.*(?:\\infty|infty|oo)/i.test(unescapedText)) &&
    unescapedText.includes('|');

  if (!hasBBTSigns) return null;

  try {
    // Look for lines containing table parts
    const lines = unescapedText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

    let xLine = '';
    let xLabel = '$x$';
    let fPrimeLine = '';
    let fPrimeLabel = "$y'$";
    let fLine = '';
    let fLabel = '$y$';
    let tableStartIndex = -1;
    let tableEndIndex = -1;

    // Search within lines
    lines.forEach((l, idx) => {
      const lower = l.toLowerCase();
      // Variable / X line
      if (
        !xLine &&
        (lower.startsWith('x') ||
          lower.startsWith('m') ||
          lower.startsWith('t') ||
          lower.includes('x |') ||
          lower.includes('m |') ||
          lower.startsWith('| x |') ||
          lower.startsWith('| m |') ||
          lower.startsWith('|x|') ||
          lower.startsWith('|m|') ||
          /^\|?\s*([a-zA-Z](?:_[0-9]+)?)\s*\|/i.test(l))
      ) {
        const m = l.match(/^\|?\s*([a-zA-Z0-9_\^\-\+\s\(\)]+?)\s*\|/);
        if (m) {
          xLabel = `$${m[1].replace(/[\$]/g, '').trim()}$`;
        }
        xLine = l;
        if (tableStartIndex === -1) tableStartIndex = idx;
        tableEndIndex = Math.max(tableEndIndex, idx);
      } else if (
        !fPrimeLine &&
        (lower.includes("f'(x)") ||
          lower.includes("y'") ||
          lower.includes("f' (x)") ||
          lower.includes("f'") ||
          lower.includes("y\\prime") ||
          lower.includes("f\\prime") ||
          lower.includes("m^2") ||
          lower.includes("m²") ||
          /^\|?\s*([^|]+?)\s*\|[\s\+\-0\s\|]+$/i.test(l) ||
          /^\|?\s*(?:y'|f'\(x\)|f'|y\\prime|f\\prime|m\^2.*?)\s*\|/i.test(l))
      ) {
        const m = l.match(/^\|?\s*([^|]+?)\s*\|/);
        if (m) {
          fPrimeLabel = `$${m[1].replace(/[\$]/g, '').trim()}$`;
        }
        fPrimeLine = l;
        if (tableStartIndex === -1) tableStartIndex = idx;
        tableEndIndex = Math.max(tableEndIndex, idx);
      } else if (
        !fLine &&
        (lower.includes('f(x)') ||
          lower.includes('y |') ||
          lower.includes('f (x)') ||
          lower.startsWith('| y |') ||
          lower.startsWith('|y|') ||
          /^\|?\s*(?:y|f\(x\)|f)\s*\|/i.test(l))
      ) {
        const m = l.match(/^\|?\s*([^|]+?)\s*\|/);
        if (m) {
          fLabel = `$${m[1].replace(/[\$]/g, '').trim()}$`;
        }
        fLine = l;
        if (tableStartIndex === -1) tableStartIndex = idx;
        tableEndIndex = Math.max(tableEndIndex, idx);
      } else if (l.includes('---|') || l.includes('====') || l.includes('---|---')) {
        if (tableStartIndex !== -1) {
          tableEndIndex = Math.max(tableEndIndex, idx);
        }
      }
    });

    // If single line string with inline table (like in inline option strings)
    let isSingleLineTable = false;
    if (!xLine || !fPrimeLine) {
      const inlineMatch = rawText.match(
        /([a-zA-Z])\s*\|\s*([^|]+(?:\|[^|]+)+)[\s\-\|]+([^|]+)\s*\|\s*([^|]+(?:\|[^|]+)+)(?:[\s\-\|]+(?:f\(x\)|y|f)\s*\|\s*([^|\n]+(?:\|[^|\n]+)+))?/i
      );
      if (inlineMatch) {
        isSingleLineTable = true;
        xLabel = `$${inlineMatch[1].trim()}$`;
        xLine = `${inlineMatch[1]} | ${inlineMatch[2]}`;
        fPrimeLabel = `$${inlineMatch[3].trim()}$`;
        fPrimeLine = `${inlineMatch[3]} | ${inlineMatch[4]}`;
        if (inlineMatch[5]) {
          fLine = `y | ${inlineMatch[5]}`;
        }
      }
    }

    if (!xLine || !fPrimeLine) {
      return null;
    }

    // Clean tokens
    const cleanToken = (s: string) => {
      let r = cleanMathString(s).replace(/[\$\\/\s]/g, '').trim();
      if (r === '-infty' || r === '-inf' || r === '-oo' || r === '-\\infty' || r === '-∞') r = '-\\infty';
      if (
        r === '+infty' ||
        r === '+inf' ||
        r === '+oo' ||
        r === 'infty' ||
        r === 'inf' ||
        r === 'oo' ||
        r === '+\\infty' ||
        r === '+∞' ||
        r === '∞'
      )
        r = '+\\infty';
      return r || s.trim();
    };

    // Parse x values
    const rawXTokens = xLine.split('|').map((p) => p.trim());
    // remove header token
    rawXTokens.shift();
    const xParts = rawXTokens
      .flatMap((p) => p.split(/\s{2,}|\t/).map((t) => t.trim()))
      .filter((p) => p && !p.startsWith('---'));

    // Parse f'(x) values
    const rawFpTokens = fPrimeLine.split('|').map((p) => p.trim());
    rawFpTokens.shift();
    const fPrimeParts = rawFpTokens
      .flatMap((p) => p.split(/\s{2,}|\t/).map((t) => t.trim()))
      .filter((p) => p && !p.startsWith('---'));

    if (xParts.length === 0 || fPrimeParts.length === 0) {
      return null;
    }

    const xValues = xParts.map(cleanToken);
    const N = xValues.length;

    const fPrimeValues = fPrimeParts.map((p) => {
      const c = p.replace(/[\$\s]/g, '').trim();
      if (c === '0' || c === '+' || c === '-' || c === '−' || c === '||' || c === '|') {
        return c === '−' ? '-' : c;
      }
      return c || '+';
    });

    // If 2-row Sign Table (Bảng xét dấu) with no 3rd row fLine:
    if (!fLine) {
      const bbtData: BBTData = {
        xLabel,
        fPrimeLabel,
        xValues,
        fPrimeValues,
      };

      let cleanedText = rawText;
      if (isSingleLineTable) {
        cleanedText = '';
      } else if (tableStartIndex !== -1 && tableEndIndex !== -1) {
        const preservedLines = lines.filter((_, idx) => idx < tableStartIndex || idx > tableEndIndex);
        cleanedText = preservedLines.join('\n');
      }
      cleanedText = cleanedText
        .replace(/\|[\s\-\|]+\|/g, ' ')
        .replace(/-------[\|\-]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      return { cleanedText, bbtData };
    }

    // Parse f(x) values for full 3-row BBT
    const rawFTokens = fLine.split('|').map((p) => p.trim());
    rawFTokens.shift();
    const fRawParts = rawFTokens
      .flatMap((p) => p.split(/\s{2,}|\t/).map((t) => t.trim()))
      .filter((p) => p && !p.startsWith('---'));

    if (xParts.length === 0 || fRawParts.length === 0) {
      return null;
    }

    // Helper to get derivative sign on interval k (0 <= k < N - 1)
    const getIntervalSign = (k: number): '+' | '-' => {
      if (fPrimeValues.length === 2 * N - 3) {
        const token = fPrimeValues[2 * k];
        return token === '-' || token === '−' ? '-' : '+';
      } else if (fPrimeValues.length === N - 1) {
        const token = fPrimeValues[k];
        return token === '-' || token === '−' ? '-' : '+';
      }
      // If only raw signs provided, check raw signs
      const signs = fPrimeValues.filter((p) => p === '+' || p === '-' || p === '−');
      if (k < signs.length) return signs[k] === '-' || signs[k] === '−' ? '-' : '+';
      return '+';
    };

    // Check if there is an asymptote '||' in derivative row
    const hasAsymptote = fPrimeValues.some((fp) => fp === '||') || fRawParts.some((fp) => fp === '||');

    // Parse fValues and arrows
    const fValues: { value: string; type: 'val' | 'asymptote' | 'infinity'; position: 'top' | 'bottom' | 'middle' }[] = [];
    const arrows: { fromIndex: number; toIndex: number; direction: 'up' | 'down'; fromVal: string; toVal: string }[] = [];

    // Filter raw parts to meaningful tokens
    const cleanedRawParts = fRawParts
      .map(cleanToken)
      .filter((p) => p.length > 0 && p !== '---' && p !== '&nbsp;');

    if (!hasAsymptote && cleanedRawParts.length === N) {
      // Continuous function: 1-to-1 match with N critical points
      cleanedRawParts.forEach((val, idx) => {
        let position: 'top' | 'bottom' | 'middle' = 'middle';
        let type: 'val' | 'asymptote' | 'infinity' = 'val';

        if (val.includes('+\\infty') || val === '+oo' || val === '+∞' || val === '∞') {
          position = 'top';
          type = 'infinity';
        } else if (val.includes('-\\infty') || val === '-oo' || val === '-∞') {
          position = 'bottom';
          type = 'infinity';
        } else if (idx === 0) {
          // At x = -infinity
          const s0 = getIntervalSign(0);
          position = s0 === '+' ? 'bottom' : 'top';
        } else if (idx === N - 1) {
          // At x = +infinity
          const sLast = getIntervalSign(N - 2);
          position = sLast === '+' ? 'top' : 'bottom';
        } else {
          // At internal critical point x_idx
          const sBefore = getIntervalSign(idx - 1);
          const sAfter = getIntervalSign(idx);
          if (sBefore === '+' && sAfter === '-') {
            position = 'top'; // local maximum
          } else if (sBefore === '-' && sAfter === '+') {
            position = 'bottom'; // local minimum
          } else {
            position = 'middle'; // inflection point
          }
        }

        fValues.push({ value: val, type, position });
      });

      // Generate arrows for each interval
      for (let k = 0; k < N - 1; k++) {
        const sign = getIntervalSign(k);
        const dir: 'up' | 'down' = sign === '+' ? 'up' : 'down';
        arrows.push({
          fromIndex: k,
          toIndex: k + 1,
          direction: dir,
          fromVal: fValues[k]?.value || '',
          toVal: fValues[k + 1]?.value || '',
        });
      }
    } else {
      // Discontinuous or custom format
      cleanedRawParts.forEach((val, idx) => {
        let isUp = val.includes('/') || val.includes('↗') || val.includes('^');
        let isDown = val.includes('\\') || val.includes('↘') || val.includes('v');
        let position: 'top' | 'bottom' | 'middle' = 'middle';
        let type: 'val' | 'asymptote' | 'infinity' = 'val';

        if (val.includes('+\\infty') || val === '+oo') {
          position = 'top';
          type = 'infinity';
        } else if (val.includes('-\\infty') || val === '-oo') {
          position = 'bottom';
          type = 'infinity';
        } else if (val === '||') {
          type = 'asymptote';
        } else if (isUp) {
          position = 'top';
        } else if (isDown) {
          position = 'bottom';
        } else {
          // Alternate positions based on interval signs
          const intIdx = Math.min(idx, N - 2);
          const sign = getIntervalSign(Math.max(0, intIdx));
          if (idx === 0) {
            position = sign === '+' ? 'bottom' : 'top';
          } else if (idx === cleanedRawParts.length - 1) {
            position = sign === '+' ? 'top' : 'bottom';
          } else {
            position = idx % 2 === 1 ? 'top' : 'bottom';
          }
        }

        fValues.push({ value: val, type, position });
      });

      // Generate arrows between consecutive non-asymptote pairs
      for (let i = 0; i < fValues.length - 1; i++) {
        const v1 = fValues[i];
        const v2 = fValues[i + 1];
        if (v1.value === '||' || v2.value === '||') continue;
        const dir: 'up' | 'down' = v1.position === 'bottom' || v2.position === 'top' ? 'up' : 'down';
        arrows.push({
          fromIndex: i,
          toIndex: i + 1,
          direction: dir,
          fromVal: v1.value,
          toVal: v2.value,
        });
      }
    }

    const bbtData: BBTData = {
      xValues,
      fPrimeValues,
      fValues,
      arrows,
    };

    // Clean the text
    let cleanedText = rawText;
    if (isSingleLineTable) {
      cleanedText = rawText.replace(
        /x\s*\|\s*([^|]+(?:\|[^|]+)+)[\s\-\|]+(?:f'\(x\)|y'|f'|y\\prime|f\\prime)\s*\|\s*([^|]+(?:\|[^|]+)+)[\s\-\|]+(?:f\(x\)|y|f)\s*\|\s*([^|\n]+(?:\|[^|\n]+)+)/gi,
        ' '
      );
    } else if (tableStartIndex !== -1 && tableEndIndex !== -1) {
      const preservedLines = lines.filter((_, idx) => idx < tableStartIndex || idx > tableEndIndex);
      cleanedText = preservedLines.join('\n');
    }

    // Clean leftover dashes and pipes
    cleanedText = cleanedText
      .replace(/\|[\s\-\|]+\|/g, ' ')
      .replace(/-------[\|\-]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    // Ensure polite intro phrasing if text was only table
    if (!cleanedText && !rawText.includes('Chọn') && !rawText.includes('Cho')) {
      cleanedText = '';
    }

    return { cleanedText, bbtData };
  } catch (err) {
    console.warn('Could not parse ASCII BBT:', err);
    return null;
  }
}

/**
 * Detects whether a mathematical formula or question text contains unknown parameters (e.g., m, k, t, a, b, c, etc.)
 * or parameter-finding instructions ("tham số m", "tìm m để", "chứa tham số", etc.).
 * Parametric functions cannot be plotted numerically without a concrete parameter value.
 */
export function hasUnknownParameters(formulaOrText: string): boolean {
  if (!formulaOrText) return false;

  const textLower = formulaOrText.toLowerCase();

  // 1. Keyword check for parameter-finding questions or expressions
  if (
    textLower.includes('tham số') ||
    textLower.includes('tham so') ||
    textLower.includes('chứa tham số') ||
    textLower.includes('chua tham so') ||
    textLower.includes('giá trị của m') ||
    textLower.includes('giá trị thực của m') ||
    textLower.includes('giá trị của k') ||
    textLower.includes('giá trị thực của k') ||
    textLower.includes('tìm m') ||
    textLower.includes('tim m') ||
    textLower.includes('tìm k') ||
    textLower.includes('tim k') ||
    textLower.includes('tìm a') ||
    textLower.includes('tìm b') ||
    textLower.includes('với m') ||
    textLower.includes('với k') ||
    textLower.includes('tất cả các giá trị của m') ||
    textLower.includes('m \\in') ||
    textLower.includes('m\\in') ||
    textLower.includes('m \\le') ||
    textLower.includes('m \\ge') ||
    textLower.includes('m >') ||
    textLower.includes('m <') ||
    textLower.includes('m =')
  ) {
    return true;
  }

  // If text contains Vietnamese space or word boundary, it's natural language, not a pure math formula.
  // We only run character-level parameter checking on pure formulas.
  const isLikelyNaturalLanguage =
    formulaOrText.includes(' ') &&
    (textLower.includes('cho') ||
      textLower.includes('hàm') ||
      textLower.includes('số') ||
      textLower.includes('đồ') ||
      textLower.includes('thị') ||
      textLower.includes('hình') ||
      textLower.includes('bảng') ||
      textLower.includes('biến') ||
      textLower.includes('thiên') ||
      textLower.includes('mệnh') ||
      textLower.includes('đề') ||
      textLower.includes('xét') ||
      textLower.includes('tính'));

  if (isLikelyNaturalLanguage) {
    // If it's natural language, check formulas inside $...$
    const mathMatches = formulaOrText.match(/\$([^$]+)\$/g);
    if (mathMatches) {
      for (const m of mathMatches) {
        const inner = m.replace(/\$/g, '').trim();
        // If inner is just y = f(x) or f'(x) = 0 or a number, it's not parametric
        if (/^(?:y|f\(x\)|g\(x\))\s*=\s*f\(x\)$/i.test(inner)) continue;
        if (/^[a-zA-Z]\s*=\s*[+-]?\d+(?:\.\d+)?$/i.test(inner)) continue;
        if (hasUnknownParameters(inner)) return true;
      }
    }
    return false;
  }

  // 2. Pure formula check: Normalize and check if expression contains non-x parameter letters (like m, k, a, b, t, etc.)
  let clean = formulaOrText
    .replace(/\$\$/g, ' ')
    .replace(/\$/g, ' ')
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1)/($2)')
    .replace(/\\dfrac\{([^}]+)\}\{([^}]+)\}/g, '($1)/($2)')
    .replace(/\\[a-zA-Z]+/g, ' ') // Remove LaTeX commands like \sqrt, \infty, \mathbb, \left, \right
    .replace(/\b(sin|cos|tan|cot|sqrt|ln|log|exp|abs|pi|max|min)\b/gi, ' ')
    .replace(/\b(y|f|g)\s*\(\s*x\s*\)/gi, ' ')
    .replace(/\by\s*=/gi, ' ')
    .replace(/\bx\b/gi, ' ')
    .replace(/x\^(\d+|\{[^}]+\})/gi, ' ')
    .replace(/x/gi, ' ');

  // Remove standard numbers, operators, parens, whitespaces, punctuation
  clean = clean.replace(/[\d\+\-\*\/\^\(\)\[\]\{\}\=\<\>\,\.\;\:\s\_]/g, '');

  // If there are leftover alphabet characters (e.g. 'm', 'k', 'a', 'b', 'c', 't' etc.), it has parameters!
  if (/[a-zA-Z]/.test(clean)) {
    return true;
  }

  return false;
}

/**
 * Extracts function formula from text like:
 * "y = x^3 - 3x^2 + 4"
 * "f(x) = \frac{2x+1}{x-1}"
 * "y = -x^3 + 3x"
 * "y = \frac{x^2 - x + 1}{x - 1}"
 */
export function extractFormulaFromText(text: string): string | null {
  if (!text) return null;
  if (hasUnknownParameters(text)) return null;

  // Clean LaTeX delimiters
  const clean = text
    .replace(/\$\$/g, ' ')
    .replace(/\$/g, ' ')
    .replace(/\\cdot/g, '')
    .replace(/\\times/g, '')
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1)/($2)')
    .replace(/\\dfrac\{([^}]+)\}\{([^}]+)\}/g, '($1)/($2)');

  // Look for y = ... or f(x) = ...
  const match = clean.match(/(?:y|f\(x\)|g\(x\))\s*=\s*([a-zA-Z0-9\^\+\-\*\/\(\)\.\s]+?)(?:[\.,;\?]|\s+là|\s+có|\s+đồng|\s+nghịch|\s+với|\s+tại|\s+trên|\s*$)/i);
  if (match && match[1]) {
    const raw = match[1].trim();
    if (raw.includes('x') && raw.length >= 2 && !hasUnknownParameters(raw)) {
      return raw;
    }
  }

  return null;
}

/**
 * Safely parse a mathematical function and calculate critical points and bounds.
 */
export function parseMathFunction(formulaOrText: string): ParsedMathFunction | null {
  if (!formulaOrText) return null;
  if (hasUnknownParameters(formulaOrText)) return null;

  let raw = extractFormulaFromText(formulaOrText) || formulaOrText.trim();
  if (hasUnknownParameters(raw)) return null;

  // Normalize formula string - clean LaTeX, operators, multiplication symbols, spaces
  raw = raw
    .replace(/\$\$/g, '')
    .replace(/\$/g, '')
    .replace(/\\cdot/g, '')
    .replace(/\\times/g, '')
    .replace(/\*/g, '')
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1)/($2)')
    .replace(/\\dfrac\{([^}]+)\}\{([^}]+)\}/g, '($1)/($2)')
    .replace(/\s+/g, '')
    .replace(/^(?:y|f\(x\)|g\(x\))=/, '');

  const parseCoeff = (val: string | undefined, defaultVal = 1): number => {
    if (val === undefined || val === '') return defaultVal;
    if (val === '+') return 1;
    if (val === '-') return -1;
    const num = Number(val);
    return isNaN(num) ? defaultVal : num;
  };

  // 1. Check Cubic: ax^3 + bx^2 + cx + d
  // e.g. x^3 - 3x + 1, -x^3 + 3x, x^3 - 3x^2 + 4, 2x^3 - 3x^2 + 1
  if (raw.includes('x^3') && !raw.includes('/')) {
    let a = 1, b = 0, c = 0, d = 0;

    // a x^3
    const term3 = raw.match(/([+-]?\d*(?:\.\d+)?)x\^3/);
    if (term3) a = parseCoeff(term3[1], 1);

    // b x^2
    const term2 = raw.match(/([+-]?\d*(?:\.\d+)?)x\^2/);
    if (term2) b = parseCoeff(term2[1], 1);

    // c x (not x^2, not x^3)
    const term1 = raw.match(/([+-]?\d*(?:\.\d+)?)x(?!\^)/);
    if (term1) c = parseCoeff(term1[1], 1);

    // constant d at the end
    const term0 = raw.match(/([+-]\d+(?:\.\d+)?)$/);
    if (term0 && !raw.endsWith('x')) d = Number(term0[1]);

    const evalFn = (x: number) => a * x * x * x + b * x * x + c * x + d;

    // Extrema: y' = 3a x^2 + 2b x + c = 0
    const delta = 4 * b * b - 12 * a * c;
    const keyPoints: { x: number; y: number; label?: string }[] = [];

    if (delta > 0) {
      const x1 = (-2 * b - Math.sqrt(delta)) / (6 * a);
      const x2 = (-2 * b + Math.sqrt(delta)) / (6 * a);
      const y1 = evalFn(x1);
      const y2 = evalFn(x2);

      const rX1 = Number(x1.toFixed(2));
      const rY1 = Number(y1.toFixed(2));
      const rX2 = Number(x2.toFixed(2));
      const rY2 = Number(y2.toFixed(2));

      keyPoints.push({ x: rX1, y: rY1, label: `(${rX1}; ${rY1})` });
      keyPoints.push({ x: rX2, y: rY2, label: `(${rX2}; ${rY2})` });
    }

    // Intercept with Oy
    const y0 = evalFn(0);
    const rY0 = Number(y0.toFixed(2));
    if (!keyPoints.some((p) => Math.abs(p.x) < 0.05 && Math.abs(p.y - rY0) < 0.05)) {
      keyPoints.push({ x: 0, y: rY0, label: `(0; ${rY0})` });
    }

    // Determine bounds
    const xs = keyPoints.map((p) => p.x).concat([-1.5, 1.5]);
    const ys = keyPoints.map((p) => p.y).concat([-1.5, 1.5]);
    const minX = Math.min(...xs) - 1.2;
    const maxX = Math.max(...xs) + 1.2;
    const minY = Math.min(...ys) - 1.5;
    const maxY = Math.max(...ys) + 1.5;

    let disp = `${a !== 1 ? (a === -1 ? '-' : a) : ''}x^3`;
    if (b !== 0) disp += `${b > 0 ? ' + ' : ' - '}${Math.abs(b) !== 1 ? Math.abs(b) : ''}x^2`;
    if (c !== 0) disp += `${c > 0 ? (disp ? ' + ' : '') : ' - '}${Math.abs(c) !== 1 ? Math.abs(c) : ''}x`;
    if (d !== 0) disp += `${d > 0 ? ' + ' : ' - '}${Math.abs(d)}`;

    return {
      rawFormula: raw,
      expressionDisplay: `y = ${disp || raw}`,
      evaluate: evalFn,
      xMin: Math.max(-6, Number(minX.toFixed(1))),
      xMax: Math.min(6, Number(maxX.toFixed(1))),
      yMin: Math.max(-8, Number(minY.toFixed(1))),
      yMax: Math.min(8, Number(maxY.toFixed(1))),
      keyPoints,
      asymptotes: [],
      discontinuities: [],
    };
  }

  // 2. Check Quartic: ax^4 + bx^2 + c
  // e.g. x^4 - 2x^2 - 1, -x^4 + 2x^2 + 3
  if (raw.includes('x^4') && !raw.includes('/')) {
    let a = 1, b = 0, c = 0;
    const term4 = raw.match(/([+-]?\d*(?:\.\d+)?)x\^4/);
    if (term4) a = parseCoeff(term4[1], 1);

    const term2 = raw.match(/([+-]?\d*(?:\.\d+)?)x\^2/);
    if (term2) b = parseCoeff(term2[1], 1);

    const term0 = raw.match(/([+-]\d+(?:\.\d+)?)$/);
    if (term0 && !raw.endsWith('x^2') && !raw.endsWith('x^4')) c = Number(term0[1]);

    const evalFn = (x: number) => a * Math.pow(x, 4) + b * x * x + c;

    // Extrema: y' = 4a x^3 + 2b x = 2x (2a x^2 + b) = 0
    const keyPoints: { x: number; y: number; label?: string }[] = [{ x: 0, y: c, label: `(0; ${c})` }];

    if (-b / (2 * a) > 0) {
      const x1 = Math.sqrt(-b / (2 * a));
      const x2 = -x1;
      const yVal = evalFn(x1);
      const rX1 = Number(x1.toFixed(2));
      const rX2 = Number(x2.toFixed(2));
      const rY = Number(yVal.toFixed(2));
      keyPoints.push({ x: rX1, y: rY, label: `(${rX1}; ${rY})` });
      keyPoints.push({ x: rX2, y: rY, label: `(${rX2}; ${rY})` });
    }

    const xs = keyPoints.map((p) => p.x).concat([-2, 2]);
    const ys = keyPoints.map((p) => p.y).concat([-2, 2]);

    return {
      rawFormula: raw,
      expressionDisplay: `y = ${raw}`,
      evaluate: evalFn,
      xMin: Number((Math.min(...xs) - 1.2).toFixed(1)),
      xMax: Number((Math.max(...xs) + 1.2).toFixed(1)),
      yMin: Number((Math.min(...ys) - 1.5).toFixed(1)),
      yMax: Number((Math.max(...ys) + 1.5).toFixed(1)),
      keyPoints,
      asymptotes: [],
      discontinuities: [],
    };
  }

  // 3. Check Quadratic: ax^2 + bx + c
  if (raw.includes('x^2') && !raw.includes('x^3') && !raw.includes('x^4') && !raw.includes('/')) {
    let a = 1, b = 0, c = 0;
    const term2 = raw.match(/([+-]?\d*(?:\.\d+)?)x\^2/);
    if (term2) a = parseCoeff(term2[1], 1);

    const term1 = raw.match(/([+-]?\d*(?:\.\d+)?)x(?!\^)/);
    if (term1) b = parseCoeff(term1[1], 1);

    const term0 = raw.match(/([+-]\d+(?:\.\d+)?)$/);
    if (term0 && !raw.endsWith('x') && !raw.endsWith('x^2')) c = Number(term0[1]);

    const evalFn = (x: number) => a * x * x + b * x + c;

    const xV = -b / (2 * a);
    const yV = evalFn(xV);
    const rXV = Number(xV.toFixed(2));
    const rYV = Number(yV.toFixed(2));

    const keyPoints: { x: number; y: number; label?: string }[] = [{ x: rXV, y: rYV, label: `(${rXV}; ${rYV})` }];

    if (Math.abs(rXV) > 0.05) {
      const y0 = evalFn(0);
      const rY0 = Number(y0.toFixed(2));
      keyPoints.push({ x: 0, y: rY0, label: `(0; ${rY0})` });
    }

    const xs = [rXV - 2.5, rXV + 2.5];
    const ys = [rYV - 2, rYV + 3];

    return {
      rawFormula: raw,
      expressionDisplay: `y = ${raw}`,
      evaluate: evalFn,
      xMin: Math.min(...xs),
      xMax: Math.max(...xs),
      yMin: Math.min(...ys),
      yMax: Math.max(...ys),
      keyPoints,
      asymptotes: [],
      discontinuities: [],
    };
  }

  // 4. Check Rational: (ax + b)/(cx + d)
  // e.g. (2x - 1)/(x + 1) or 2x+1/x-1
  if (raw.includes('/') && !raw.includes('x^2')) {
    const parts = raw.replace(/^\(/, '').replace(/\)$/, '').split('/');
    if (parts.length === 2) {
      const numStr = parts[0].replace(/[\(\)]/g, '');
      const denStr = parts[1].replace(/[\(\)]/g, '');

      // Parse num: ax + b
      let a = 0, b = 0;
      const numX = numStr.match(/([+-]?\d*(?:\.\d+)?)x/);
      if (numX) a = parseCoeff(numX[1], 1);
      const numC = numStr.match(/([+-]\d+(?:\.\d+)?)$/);
      if (numC && !numStr.endsWith('x')) b = Number(numC[1]);
      else if (!numX && /^[+-]?\d+$/.test(numStr)) b = Number(numStr);

      // Parse den: cx + d
      let c = 1, d = 0;
      const denX = denStr.match(/([+-]?\d*(?:\.\d+)?)x/);
      if (denX) c = parseCoeff(denX[1], 1);
      const denC = denStr.match(/([+-]\d+(?:\.\d+)?)$/);
      if (denC && !denStr.endsWith('x')) d = Number(denC[1]);

      if (c !== 0) {
        const vertAsymp = -d / c;
        const horizAsymp = a / c;

        const evalFn = (x: number) => {
          if (Math.abs(x - vertAsymp) < 0.001) return NaN;
          return (a * x + b) / (c * x + d);
        };

        const keyPoints: { x: number; y: number; label?: string }[] = [];
        // Oy intercept
        if (Math.abs(vertAsymp) > 0.05) {
          const y0 = evalFn(0);
          if (!isNaN(y0)) {
            const rY0 = Number(y0.toFixed(2));
            keyPoints.push({ x: 0, y: rY0, label: `(0; ${rY0})` });
          }
        }
        // Ox intercept
        if (a !== 0) {
          const x0 = -b / a;
          const rX0 = Number(x0.toFixed(2));
          if (Math.abs(x0 - vertAsymp) > 0.05 && Math.abs(x0) > 0.05) {
            keyPoints.push({ x: rX0, y: 0, label: `(${rX0}; 0)` });
          }
        }

        const rVert = Number(vertAsymp.toFixed(2));
        const rHoriz = Number(horizAsymp.toFixed(2));

        return {
          rawFormula: raw,
          expressionDisplay: `y = \\frac{${numStr}}{${denStr}}`,
          evaluate: evalFn,
          xMin: Math.min(-4, rVert - 3.5),
          xMax: Math.max(4, rVert + 3.5),
          yMin: Math.min(-4, rHoriz - 3.5),
          yMax: Math.max(4, rHoriz + 3.5),
          keyPoints,
          asymptotes: [
            { type: 'vertical', val: rVert, eq: `x = ${rVert}` },
            { type: 'horizontal', val: rHoriz, eq: `y = ${rHoriz}` },
          ],
          discontinuities: [rVert],
        };
      }
    }
  }

  // 5. Check Oblique Rational: (ax^2 + bx + c)/(dx + e) or (x^2 - x + 1)/(x - 1) or x + 1/(x-1)
  if ((raw.includes('x^2') && raw.includes('/')) || (raw.includes('x+') && raw.includes('/(x')) || (raw.includes('x-') && raw.includes('/(x'))) {
    // Check if format is x + 1/(x-1)
    let evalFn = (x: number) => {
      if (Math.abs(x - 1) < 0.001) return NaN;
      return (x * x - x + 1) / (x - 1);
    };

    let vertVal = 1;
    let obliqueEq = 'y = x';
    let slope = 1;
    let intercept = 0;

    if (raw.includes('/')) {
      const parts = raw.replace(/^\(/, '').replace(/\)$/, '').split('/');
      if (parts.length === 2) {
        const numStr = parts[0].replace(/[\(\)]/g, '');
        const denStr = parts[1].replace(/[\(\)]/g, '');

        let a = 1, b = -1, c = 1;
        const t2 = numStr.match(/([+-]?\d*(?:\.\d+)?)x\^2/);
        if (t2) a = parseCoeff(t2[1], 1);
        const t1 = numStr.match(/([+-]?\d*(?:\.\d+)?)x(?!\^)/);
        if (t1) b = parseCoeff(t1[1], 1);
        const t0 = numStr.match(/([+-]\d+(?:\.\d+)?)$/);
        if (t0 && !numStr.endsWith('x') && !numStr.endsWith('x^2')) c = Number(t0[1]);

        let d = 1, e = -1;
        const dt1 = denStr.match(/([+-]?\d*(?:\.\d+)?)x/);
        if (dt1) d = parseCoeff(dt1[1], 1);
        const dt0 = denStr.match(/([+-]\d+(?:\.\d+)?)$/);
        if (dt0 && !denStr.endsWith('x')) e = Number(dt0[1]);

        if (d !== 0) {
          vertVal = -e / d;
          slope = a / d;
          intercept = (b * d - a * e) / (d * d);
          obliqueEq = `y = ${slope !== 1 ? slope : ''}x${intercept !== 0 ? (intercept > 0 ? ` + ${intercept}` : ` - ${Math.abs(intercept)}`) : ''}`;

          evalFn = (x: number) => {
            if (Math.abs(x - vertVal) < 0.001) return NaN;
            return (a * x * x + b * x + c) / (d * x + e);
          };
        }
      }
    }

    const keyPoints: { x: number; y: number; label?: string }[] = [];
    const yAt0 = evalFn(0);
    if (!isNaN(yAt0) && Math.abs(vertVal) > 0.05) {
      keyPoints.push({ x: 0, y: Number(yAt0.toFixed(2)), label: `(0; ${Number(yAt0.toFixed(2))})` });
    }
    const yAt2 = evalFn(2);
    if (!isNaN(yAt2) && Math.abs(vertVal - 2) > 0.05) {
      keyPoints.push({ x: 2, y: Number(yAt2.toFixed(2)), label: `(2; ${Number(yAt2.toFixed(2))})` });
    }

    return {
      rawFormula: raw,
      expressionDisplay: `y = \\frac{x^2 - x + 1}{x - 1}`,
      evaluate: evalFn,
      xMin: Math.min(-3.5, vertVal - 4),
      xMax: Math.max(5.5, vertVal + 4),
      yMin: -4.5,
      yMax: 6.5,
      keyPoints,
      asymptotes: [
        { type: 'vertical', val: vertVal, eq: `x = ${vertVal}` },
        { type: 'oblique', val: vertVal, eq: obliqueEq, slope, intercept },
      ],
      discontinuities: [vertVal],
    };
  }

  // Fallback default function
  return null;
}

/**
 * Resolves the accurate diagram ID or formula string for a question.
 * Returns undefined if the question does not explicitly reference or need a diagram,
 * or if the function contains unknown parameters (m, k, etc.).
 */
export function resolveQuestionDiagram(q: {
  diagramId?: string;
  imageUrl?: string;
  content: string;
  solution?: string;
  statements?: { text: string; [key: string]: any }[];
  options?: { text: string; [key: string]: any }[];
}): string | undefined {
  // 1. If imageUrl is set, DiagramRenderer handles it directly
  if (q.imageUrl) return undefined;

  // 1.1. If question content already contains an embedded markdown table (rendered inline by MathText)
  const normalizedContent = (q.content || '').replace(/\\n/g, '\n');
  const hasEmbeddedTable =
    /\|[\s\-\$\w\+\\\/]+\|/.test(normalizedContent) &&
    (normalizedContent.toLowerCase().includes('x') || normalizedContent.includes("y'") || normalizedContent.includes("f'"));
  if (hasEmbeddedTable && !q.diagramId) {
    return undefined;
  }

  const contentLower = (q.content || '').toLowerCase();
  const contextLower = (
    (q.content || '') +
    ' ' +
    (q.solution || '') +
    ' ' +
    (q.statements ? q.statements.map((s) => s.text).join(' ') : '') +
    ' ' +
    (q.options ? q.options.map((o) => o.text).join(' ') : '')
  ).toLowerCase();

  // 2. Check for explicit visual reference phrases
  const hasExplicitFigureRef =
    contentLower.includes('như hình vẽ') ||
    contentLower.includes('như hình bên') ||
    contentLower.includes('như hình dưới') ||
    contentLower.includes('cho hình vẽ') ||
    contentLower.includes('trong hình vẽ') ||
    contentLower.includes('cho đồ thị như hình') ||
    contentLower.includes('có đồ thị như hình') ||
    contentLower.includes('bảng biến thiên như hình') ||
    contentLower.includes('có bảng biến thiên như hình') ||
    contentLower.includes('bảng biến thiên sau') ||
    contentLower.includes('bảng biến thiên như sau') ||
    contentLower.includes('bảng biến thiên dưới đây') ||
    contentLower.includes('bảng biến thiên bên dưới') ||
    contentLower.includes('có bảng biến thiên') ||
    contentLower.includes('cho bảng biến thiên') ||
    contentLower.includes('bảng xét dấu sau') ||
    contentLower.includes('bảng xét dấu như sau') ||
    contentLower.includes('bảng xét dấu dưới đây') ||
    contentLower.includes('bảng xét dấu bên dưới') ||
    contentLower.includes('có bảng xét dấu') ||
    contentLower.includes('cho bảng xét dấu') ||
    contentLower.includes('đường cong trong hình') ||
    contentLower.includes('hình bên là đồ thị') ||
    contentLower.includes('hình vẽ bên là đồ thị') ||
    contentLower.includes('hình bên') ||
    contentLower.includes('hình vẽ') ||
    contentLower.includes('đồ thị cho ở hình') ||
    contentLower.includes('đồ thị sau') ||
    contentLower.includes('đồ thị như sau') ||
    contentLower.includes('đồ thị dưới đây') ||
    contentLower.includes('có đồ thị sau') ||
    contentLower.includes('cho đồ thị sau');

  // 3. If explicit diagramId is assigned
  if (q.diagramId) {
    if (q.diagramId.startsWith('formula:')) {
      const form = q.diagramId.replace('formula:', '');
      if (hasUnknownParameters(form)) return undefined;
    }
    return q.diagramId;
  }

  // If question contains unknown parameter solving without concrete figure, skip
  if (hasUnknownParameters(q.content) && !hasExplicitFigureRef) {
    return undefined;
  }

  if (!hasExplicitFigureRef) {
    // Question does not explicitly refer to an accompanying figure -> DO NOT SHOW DUMMY GRAPH
    return undefined;
  }

  // 4. If it has explicit figure ref, try extracting exact math formula
  const formula = extractFormulaFromText(q.content);
  if (formula && !hasUnknownParameters(formula)) {
    const isBBT = contentLower.includes('bảng biến thiên') && !contentLower.includes('đồ thị');
    if (!isBBT) {
      return `formula:${formula}`;
    }
  }

  // 5. If no formula but question references a BXD, BBT or graph from standard bank (hàm số y=f(x), y=f'(x), g(x),...)
  if (
    contextLower.includes('bảng xét dấu') ||
    contextLower.includes('xét dấu đạo hàm') ||
    contextLower.includes('xét dấu của đạo hàm') ||
    contextLower.includes("xét dấu y'") ||
    contextLower.includes("xét dấu f'")
  ) {
    if (contextLower.includes('-2') && contextLower.includes('2')) {
      if (contextLower.includes('nghiệm kép') || contextLower.includes('3 nghiệm')) return 'bxd_trung_phuong_3_roots';
      return 'bxd_0_2_neg_pos_neg';
    }
    if (contextLower.includes('-1') && contextLower.includes('1')) {
      return 'bxd_neg1_1_pos_neg_pos';
    }
    if (contextLower.includes('0') && contextLower.includes('2')) {
      if (contextLower.includes('nghịch biến trên') && contextLower.includes('0; 2')) return 'bxd_0_2_pos_neg_pos';
      if (contextLower.includes('đồng biến trên') && contextLower.includes('0; 2')) return 'bxd_0_2_neg_pos_neg';
      return 'bxd_0_2_pos_neg_pos';
    }
    if (contextLower.includes('không xác định') || contextLower.includes('||')) {
      return contextLower.includes('-2') ? 'bxd_nhat_bien_neg' : 'bxd_nhat_bien_pos';
    }
    return 'bxd_0_2_neg_neg_pos';
  }

  if (
    contextLower.includes("f'(x)") ||
    contextLower.includes("y = f'(x)") ||
    contextLower.includes("y=f'(x)") ||
    contextLower.includes('đồ thị đạo hàm') ||
    contextLower.includes('đồ thị hàm số đạo hàm') ||
    contextLower.includes('của đạo hàm')
  ) {
    return 'graph_fprime_1';
  }
  if (contextLower.includes('tiệm cận xiên') || contextLower.includes('bậc hai trên bậc nhất')) {
    return 'graph_oblique_1';
  }
  if (contextLower.includes('trùng phương') || contextLower.includes('bậc 4') || contextLower.includes('bậc bốn') || contextLower.includes('3 cực trị')) {
    return contentLower.includes('đồ thị') ? 'graph_trungphuong_1' : 'bbt_mau_1_trung_phuong_3_cuc_tri';
  }
  if (
    contextLower.includes('nhất biến') ||
    contextLower.includes('bậc nhất trên bậc nhất') ||
    (contextLower.includes('tiệm cận đứng') && contextLower.includes('tiệm cận ngang')) ||
    contextLower.includes('(ax+b)/(cx+d)') ||
    contextLower.includes('(ax + b)/(cx + d)')
  ) {
    if (contentLower.includes('bảng biến thiên') || contentLower.includes('bbt')) {
      if (
        contextLower.includes('nghịch biến') ||
        contextLower.includes("y' < 0") ||
        contextLower.includes("f'(x) < 0") ||
        contextLower.includes("y'<0") ||
        contextLower.includes("f'(x)<0")
      ) {
        return 'bbt_nhatbien_nghichbien_1';
      }
      return 'bbt_nhatbien_dongbien_1';
    }
    return 'graph_nhatbien_1';
  }

  // Tiệm cận đứng / gạch chéo đặc biệt trong ngân hàng mẫu
  if (contentLower.includes('bảng biến thiên') || contentLower.includes('bbt')) {
    if (contextLower.includes('gạch chéo') || (contextLower.includes('tập xác định') && contextLower.includes('setminus'))) {
      return 'bbt_mau_3_mien_gach_cheo_khong_xac_dinh';
    }
    if (contextLower.includes('2 tiệm cận đứng') || contextLower.includes('hai tiệm cận đứng') || contextLower.includes('vạch đỏ')) {
      return 'bbt_mau_4_hai_tiem_can_dung_song_song_do';
    }
    if (contextLower.includes('tiệm cận đứng') && contextLower.includes('-1')) {
      return 'bbt_mau_2_tiem_can_dung_am1_cuc_tieu_0';
    }
    // Mặc định câu hỏi y=f(x) có bảng biến thiên -> lấy BBT hàm bậc 3 hoặc trùng phương chuẩn từ ngân hàng mẫu
    return 'bbt_bac3_1';
  }

  if (contentLower.includes('đồ thị') || hasExplicitFigureRef) {
    if (contextLower.includes("f'(x)") || contextLower.includes('đạo hàm')) {
      return 'graph_fprime_1';
    }
    return 'graph_bac3_1';
  }

  return undefined;
}
