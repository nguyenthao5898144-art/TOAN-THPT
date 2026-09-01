import React from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { cleanMathString } from '.mathSanitizer';

export { cleanMathString };

interface MathTextProps {
  text: string;
  className?: string;
  inline?: boolean;
}

export const MathText: React.FC<MathTextProps> = ({ text, className = '', inline = false }) => {
  if (!text) return null;

  // Helper to render KaTeX formula string safely
  const renderFormulaToHtml = (rawFormula: string, isDisplay: boolean): string => {
    let formula = isDisplay
      ? rawFormula.replace(/^\$\$|\$\$$/g, '').trim()
      : rawFormula.replace(/^\$|\$$/g, '').trim();

    // Clean formula escapes
    formula = cleanMathString(formula);

    // Auto-fix missing backslash in escaped delimiters (e.g. \end{array}ight. -> \end{array}\right.)
    formula = formula
      .replace(/\\?(\b|[^\\])ight\./g, '$1\\right.')
      .replace(/\\?(\b|[^\\])ight\]/g, '$1\\right]')
      .replace(/\\?(\b|[^\\])ight\)/g, '$1\\right)')
      .replace(/\\?(\b|[^\\])ight\}/g, '$1\\right\\}')
      .replace(/\\?(\b|[^\\])ight\|/g, '$1\\right|')
      .replace(/\\?(\b|[^\\])eft\[/g, '$1\\left[')
      .replace(/\\?(\b|[^\\])eft\(/g, '$1\\left(')
      .replace(/\\?(\b|[^\\])eft\{/g, '$1\\left\\{');

    // Auto-brace unbraced multi-digit/char superscripts and subscripts for KaTeX
    formula = formula
      .replace(/\^([0-9a-zA-Z]{2,})/g, '^{$1}')
      .replace(/_([0-9a-zA-Z]{2,})/g, '_{$1}');

    // Fix single backslash row breaks inside \begin{array}...\end{array} if any
    formula = formula.replace(/\\begin\{array\}([\s\S]*?)\\end\{array\}/g, (match, inner) => {
      const fixedInner = inner.replace(/([^\\])\\\s+([a-zA-Z0-9])/g, '$1 \\\\ $2');
      return `\\begin{array}${fixedInner}\\end{array}`;
    });

    // Auto-convert incorrect \begin{cases} used for single-variable roots/disjunctions (OR) to \left[\begin{array}{l}...\end{array}\right.
    formula = formula.replace(/\\begin\{cases\}([\s\S]*?)\\end\{cases\}/g, (match, inner) => {
      const lines = inner.split('\\\\').map((l: string) => l.trim()).filter(Boolean);
      if (lines.length >= 2) {
        const firstTokens = lines.map((line: string) => {
          const m = line.match(/^([a-zA-Z](?:_[a-zA-Z0-9]+)?)\s*(=|<|>|\\le|\\ge|\\in|\\neq)/);
          return m ? m[1] : null;
        });
        const allSameVar = firstTokens.every((v: string | null) => v !== null && v === firstTokens[0]);
        if (allSameVar) {
          return `\\left[\\begin{array}{l} ${inner} \\end{array}\\right.`;
        }
      }
      return match;
    });

    // Auto-close unmatched \left[ or \left( with \right.
    const leftCount = (formula.match(/\\left(?:\[|\(|\{|\.|\|)/g) || []).length;
    const rightCount = (formula.match(/\\right(?:\]|\)|\}|\.|\|)/g) || []).length;
    if (leftCount > rightCount) {
      for (let i = 0; i < leftCount - rightCount; i++) {
        formula += ' \\right.';
      }
    }

    // Clean up trailing misplaced dot after \right.
    formula = formula.replace(/\\right\.\s*\./g, '\\right.');

    try {
      return katex.renderToString(formula, {
        displayMode: isDisplay,
        throwOnError: false,
        output: 'html',
      });
    } catch {
      return `<code class="text-red-500 font-mono text-xs px-1 bg-red-50 rounded">${formula}</code>`;
    }
  };

  // Helper to auto-wrap plain text (OUTSIDE of math delimiters $) with LaTeX delimiters
  const autoWrapPlainText = (plainText: string): string => {
    if (!plainText) return '';
    let safe = cleanMathString(plainText);

    // Fix raw ight. or eft[ in plain text before wrapping
    safe = safe
      .replace(/([^\\])ight\./g, '$1\\right.')
      .replace(/([^\\])eft\[/g, '$1\\left[');

    // Patterns to wrap in math delimiters $...$
    // We execute sequentially while preserving existing $...$ blocks
    const patterns = [
      // 1. Compound formulas containing logical arrows or systems
      /(?:(?:[a-zA-Z0-9_'\(\)\+\-\*\/\^\s=<>]+)\s*(?:\\Leftrightarrow|\\Rightarrow|\\Leftarrow|\\iff|\\implies)\s*)+(?:[a-zA-Z0-9_'\(\)\+\-\*\/\^\s=<>]+|\\left\[[\s\S]*?\\right\.?|\\begin\{[a-z]+\}[\s\S]*?\\end\{[a-z]+\})/g,
      // 2. Standalone \begin{...}...\end{...} or \left[...\right.
      /(?:\\begin\{(?:bmatrix|pmatrix|array|cases|matrix)\}[\s\S]*?\\end\{(?:bmatrix|pmatrix|array|cases|matrix)\}|\\left\[[\s\S]*?\\right\.?)/g,
      // 3. Math intervals like (-\infty; 0), [0; 2], (-1; 1), (1; +\infty), (-\frac{1}{2}; 3)
      /([\(\[]\s*[-\+]?(?:\\frac\{[^{}]+\}\{[^{}]+\}|\d+(?:\.\d+)?|[a-zA-Z]|\\infty|\\sqrt\{[^{}]+\})\s*;\s*[-\+]?(?:\\frac\{[^{}]+\}\{[^{}]+\}|\d+(?:\.\d+)?|[a-zA-Z]|\\infty|\\sqrt\{[^{}]+\})\s*[\)\]])/g,
      // 4. Standalone math declarations like D = \mathbb{R}
      /\b([a-zA-Z]\s*(?:=|\in|\\in)\s*\\mathbb\{[A-Z]\})/g,
      // 5. Standalone derivative assignments
      /\b([a-zA-Z]'\s*=\s*[0-9a-zA-Z_\^\+\-\*\/\(\)\s]{3,})/g,
      // 6. Standalone unescaped LaTeX symbols/commands
      /(?:\\(?:Leftrightarrow|Rightarrow|Leftarrow|iff|implies|frac\{[^{}]+\}\{[^{}]+\}|sqrt\{[^{}]+\}|mathbb\{[^{}]+\}|infty|alpha|beta|gamma|theta|pi|pm|mp|le|ge|neq|approx|equiv|forall|exists|subset|cup|cap|setminus|in|notin|nearrow|searrow|nwarrow|swarrow|uparrow|downarrow))/g,
    ];

    for (const pat of patterns) {
      // Split by existing $...$ so we never match inside already-wrapped math
      const segments = safe.split(/(\$[^\$]+?\$)/g);
      safe = segments
        .map((seg) => {
          if (seg.startsWith('$') && seg.endsWith('$')) {
            return seg; // already in math mode
          }
          return seg.replace(pat, (m) => {
            let clean = m.trim();
            let prefix = '';
            const leadMatch = clean.match(/^(Cho|Ta có|Khi đó|Do đó|Suy ra|Phương trình|Đặt|Vì|Nên)\s+/i);
            if (leadMatch) {
              prefix = leadMatch[0];
              clean = clean.substring(prefix.length).trim();
            }
            return `${prefix}$${clean}$`;
          });
        })
        .join('');
    }

    return safe;
  };

  // Render text containing inline $...$ or display $$...$$ math notation
  const renderInlineMath = (content: string, keyPrefix: string = 'math'): React.ReactNode[] => {
    if (!content) return [];

    const sanitized = cleanMathString(content);

    // Step 1: Split content by existing math delimiters ($$...$$ or $...$)
    // So we NEVER alter or corrupt what is already inside math delimiters!
    const mathRegex = /(\$\$[\s\S]*?\$\$|\$[^$\n]+?\$)/g;
    let safeContent = '';
    let lastPos = 0;
    let m: RegExpExecArray | null;

    while ((m = mathRegex.exec(sanitized)) !== null) {
      if (m.index > lastPos) {
        const plainSegment = sanitized.substring(lastPos, m.index);
        safeContent += autoWrapPlainText(plainSegment);
      }
      safeContent += m[0]; // keep existing math block untouched
      lastPos = mathRegex.lastIndex;
    }
    if (lastPos < sanitized.length) {
      safeContent += autoWrapPlainText(sanitized.substring(lastPos));
    }

    const parts: React.ReactNode[] = [];
    // Strict non-newline spanning inline math to prevent unclosed $ from swallowing paragraphs
    const regex = /(\$\$[\s\S]*?\$\$|\$[^$\n]+?\$)/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(safeContent)) !== null) {
      if (match.index > lastIndex) {
        parts.push(
          <span key={`${keyPrefix}-txt-${lastIndex}`}>
            {safeContent.substring(lastIndex, match.index)}
          </span>
        );
      }

      const rawFormula = match[0];
      const isDisplay = rawFormula.startsWith('$$') && rawFormula.endsWith('$$');
      const html = renderFormulaToHtml(rawFormula, isDisplay);

      parts.push(
        <span
          key={`${keyPrefix}-formula-${match.index}`}
          className={isDisplay ? 'my-2 block overflow-x-auto text-center py-1' : 'inline-block px-0.5'}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      );

      lastIndex = regex.lastIndex;
    }

    if (lastIndex < safeContent.length) {
      parts.push(
        <span key={`${keyPrefix}-txt-${lastIndex}`}>
          {safeContent.substring(lastIndex)}
        </span>
      );
    }

    return parts;
  };

  // Helper to detect if a text contains table structures
  const hasTableStructure = (str: string): boolean => {
    if (!str || !str.includes('|')) return false;
    const clean = str.replace(/\\+n/g, '\n');
    return (
      /\|(?:\s*:?-{2,}:?\s*\|)+/.test(clean) ||
      (/\|\s*(?:x|y'|f'\(x\)|f'|y|f\(x\)|f|x_i)\s*\|/i.test(clean) && (clean.match(/\|/g) || []).length >= 3)
    );
  };

  // Format a single cell inside a math/sign table
  const renderTableCell = (rawCell: string, cellIdx: number, isHeader = false) => {
    let cell = cleanMathString(rawCell || '').trim();
    if (!cell || cell === '&nbsp;') {
      return (
        <td
          key={cellIdx}
          className={`px-2 py-2 text-center min-w-[30px] ${
            isHeader ? 'bg-slate-100 font-bold text-slate-900 border-r-2 border-r-slate-400' : 'text-slate-800'
          }`}
        >
          &nbsp;
        </td>
      );
    }

    // Check special single line vertical divider e.g. |
    if (cell === '|' && !isHeader) {
      return (
        <td key={cellIdx} className="px-1.5 py-2 text-center min-w-[24px]">
          <span className="inline-block border-l border-slate-300 h-5 align-middle" />
        </td>
      );
    }

    // Check special double line symbol e.g. || or ||| or $$||$$
    const isDoubleLine = cell === '||' || cell === '$$||$$' || cell === '|||' || cell === '$||$';
    if (isDoubleLine) {
      return (
        <td
          key={cellIdx}
          className="px-2 py-1.5 text-center min-w-[32px] font-bold text-red-600 leading-none"
        >
          <span className="inline-block border-l-2 border-r-2 border-red-500 h-6 w-1.5 align-middle" />
        </td>
      );
    }

    // Solo arrows (e.g. \nearrow, \searrow, \uparrow, \downarrow, ↗, ↘, ↑, ↓)
    const isSoloDownArrow = /^(?:\\?searrow|↘|\$+\\?searrow\$+|\$*↘\$*)$/i.test(cell);
    if (isSoloDownArrow) {
      return (
        <td key={cellIdx} className="px-2.5 py-1.5 text-center min-w-[36px] text-blue-600 font-extrabold text-lg">
          ↘
        </td>
      );
    }
    const isSoloUpArrow = /^(?:\\?nearrow|↗|\$+\\?nearrow\$+|\$*↗\$*)$/i.test(cell);
    if (isSoloUpArrow) {
      return (
        <td key={cellIdx} className="px-2.5 py-1.5 text-center min-w-[36px] text-blue-600 font-extrabold text-lg">
          ↗
        </td>
      );
    }
    const isSoloDownStraight = /^(?:\\?downarrow|↓|\$+\\?downarrow\$+|\$*↓\$*)$/i.test(cell);
    if (isSoloDownStraight) {
      return (
        <td key={cellIdx} className="px-2.5 py-1.5 text-center min-w-[36px] text-blue-600 font-extrabold text-lg">
          ↓
        </td>
      );
    }
    const isSoloUpStraight = /^(?:\\?uparrow|↑|\$+\\?uparrow\$+|\$*↑\$*)$/i.test(cell);
    if (isSoloUpStraight) {
      return (
        <td key={cellIdx} className="px-2.5 py-1.5 text-center min-w-[36px] text-blue-600 font-extrabold text-lg">
          ↑
        </td>
      );
    }

    // Clean inline LaTeX arrows if mixed with text/numbers (e.g. -\infty \nearrow 4)
    let processedCell = cell
      .replace(/\\nearrow/g, ' ↗ ')
      .replace(/\\searrow/g, ' ↘ ')
      .replace(/\\uparrow/g, ' ↑ ')
      .replace(/\\downarrow/g, ' ↓ ');

    // Single sign markers: +, -, 0
    if (!isHeader) {
      if (processedCell === '+' || processedCell === '-' || processedCell === '−' || processedCell === '$+$' || processedCell === '$-$') {
        const signChar = processedCell.includes('-') || processedCell.includes('−') ? '−' : '+';
        return (
          <td
            key={cellIdx}
            className="px-3 py-2 text-center min-w-[48px] text-[17px] font-black text-blue-700 select-none"
          >
            {signChar}
          </td>
        );
      }
      if (processedCell === '0' || processedCell === '$0$') {
        return (
          <td
            key={cellIdx}
            className="px-2 py-2 text-center min-w-[32px] text-sm font-bold text-slate-700 select-none"
          >
            0
          </td>
        );
      }
    }

    // If already has $...$, render directly
    if (processedCell.includes('$')) {
      return (
        <td
          key={cellIdx}
          className={`px-3 py-2 text-center min-w-[36px] text-sm font-bold ${
            isHeader ? 'bg-slate-100 font-bold text-slate-900 border-r-2 border-r-slate-400' : 'text-slate-800'
          }`}
        >
          {renderInlineMath(processedCell, `cell-${cellIdx}`)}
        </td>
      );
    }

    // Auto-detect math formulas or symbols like -\infty, +\infty, y', x_1, etc.
    const hasLatexCmd = /\\(infty|pm|frac|sqrt|left|right|begin|end|alpha|beta|pi|times|mathbb|ne)/.test(processedCell);
    const isMathSymbol = /^[\+\-\±0-9a-zA-Z'_\^/\\\(\)\.\s↗↘↑↓]+$/.test(processedCell);

    const isFormula = hasLatexCmd || isMathSymbol;
    const formulaHtml = isFormula
      ? renderFormulaToHtml(`$${processedCell}$`, false)
      : null;

    return (
      <td
        key={cellIdx}
        className={`px-3 py-2 text-center min-w-[36px] text-sm font-bold ${
          isHeader ? 'bg-slate-100 font-bold text-slate-900 border-r-2 border-r-slate-400' : 'text-slate-900'
        }`}
      >
        {formulaHtml ? (
          <span dangerouslySetInnerHTML={{ __html: formulaHtml }} />
        ) : (
          renderInlineMath(processedCell, `cell-${cellIdx}`)
        )}
      </td>
    );
  };

  // Process & normalize math table rows with smart alignment for sign tables (BXD)
  const processTableRows = (contentRows: string[]): string[][] => {
    // 1. Parse raw cells
    const rawParsedRows = contentRows
      .map((rowStr) => rowStr.split('|').slice(1, -1).map((c) => c.trim()))
      .filter((row) => {
        // Discard rows where all cells are empty
        if (row.length === 0) return false;
        return row.some((c) => c.length > 0 && c !== '&nbsp;');
      });

    if (rawParsedRows.length === 0) return [];

    // Detect if this is a mathematical sign table (BXD / BBT)
    const firstRowHeader = (rawParsedRows[0]?.[0] || '').replace(/[\$\\]/g, '').trim().toLowerCase();
    const isSignTable =
      firstRowHeader === 'x' ||
      rawParsedRows.some((r) => {
        const h = (r[0] || '').replace(/[\$\\]/g, '').trim().toLowerCase();
        return h.includes("f'(x)") || h.includes("y'") || h.includes("f'") || h.includes("f(x)") || h.includes("y");
      }) ||
      rawParsedRows.some((r) => r.slice(1).some((c) => c === '+' || c === '-' || c === '0' || c === '||'));

    // If it's a sign table with multiple rows, perform mathematical interval-interleaved alignment
    if (isSignTable && rawParsedRows.length >= 2 && firstRowHeader === 'x') {
      const header0 = rawParsedRows[0][0];
      // Extract critical points from row 0
      const xVals = rawParsedRows[0]
        .slice(1)
        .map((v) => v.trim())
        .filter((v) => v.length > 0 && v !== '&nbsp;');

      const N = xVals.length;

      // When we have N critical points (e.g. -\infty, 0, 4, +\infty), there are N-1 intervals
      // Total content columns = 2*N - 1
      // Even columns (0, 2, 4, ...): Points x_0, x_1, x_2, ...
      // Odd columns (1, 3, 5, ...): Intervals (x_0, x_1), (x_1, x_2), ...
      if (N >= 2) {
        const totalContentCols = 2 * N - 1;
        const normalizedRows: string[][] = [];

        // 1. Build Row 0 (x variable row)
        // Point values land on even columns, interval columns remain empty
        const xRowFormatted = new Array(totalContentCols + 1).fill('');
        xRowFormatted[0] = header0;
        for (let k = 0; k < N; k++) {
          xRowFormatted[1 + 2 * k] = xVals[k];
        }
        normalizedRows.push(xRowFormatted);

        // 2. Process subsequent factor / derivative rows
        for (let r = 1; r < rawParsedRows.length; r++) {
          const row = rawParsedRows[r];
          const header = row[0];
          const cells = row
            .slice(1)
            .map((c) => c.trim())
            .filter((c) => c.length > 0 && c !== '&nbsp;');

          const formattedRow = new Array(totalContentCols + 1).fill('');
          formattedRow[0] = header;

          if (cells.length === 2 * N - 3) {
            // Standard format: [s_0, v_1, s_1, v_2, ..., s_{N-2}]
            // s_k is interval sign at odd content col (1 + 2*k + 1 = 2 + 2*k)
            // v_k is root value (0 or ||) at even content col (1 + 2*k = 1 + 2*k)
            for (let idx = 0; idx < cells.length; idx++) {
              // idx 0 -> Interval 0 -> Col 2
              // idx 1 -> Point 1 -> Col 3
              // idx 2 -> Interval 1 -> Col 4
              formattedRow[2 + idx] = cells[idx];
            }
          } else if (cells.length === N - 1) {
            // Only interval signs provided: [s_0, s_1, ..., s_{N-2}]
            for (let k = 0; k < N - 1; k++) {
              formattedRow[1 + 2 * k + 1] = cells[k]; // Interval column
              if (k < N - 2) {
                formattedRow[1 + 2 * (k + 1)] = '0'; // Root column default 0
              }
            }
          } else if (cells.length === totalContentCols) {
            // Already full columns matching totalContentCols
            for (let c = 0; c < totalContentCols; c++) {
              formattedRow[1 + c] = cells[c];
            }
          } else {
            // General distribution: place signs in interval cols and zeros/dividers in point cols
            let signIdx = 0;
            for (let c = 0; c < totalContentCols; c++) {
              const isIntervalCol = c % 2 === 1;
              if (signIdx < cells.length) {
                const cell = cells[signIdx];
                const isSign = cell === '+' || cell === '-' || cell === '−';
                if (isIntervalCol) {
                  formattedRow[1 + c] = cell;
                  signIdx++;
                } else if (c > 0 && c < totalContentCols - 1) {
                  if (cell === '0' || cell === '||' || cell === '|') {
                    formattedRow[1 + c] = cell;
                    signIdx++;
                  } else if (!isSign) {
                    formattedRow[1 + c] = cell;
                    signIdx++;
                  } else {
                    formattedRow[1 + c] = '0';
                  }
                }
              } else if (isIntervalCol) {
                // If running out of signs, repeat last known sign
                const lastKnown = formattedRow[1 + c - 2] || '+';
                formattedRow[1 + c] = lastKnown === '0' ? '+' : lastKnown;
              }
            }
          }

          normalizedRows.push(formattedRow);
        }

        // 3. Multi-factor verification: Ensure product signs on f'(x) / y' are mathematically accurate
        const factorRows = normalizedRows.slice(1, -1).filter((r) => {
          const h = (r[0] || '').replace(/[\$\\]/g, '').trim().toLowerCase();
          return !h.includes("f'(x)") && !h.includes("y'") && !h.includes("f(x)") && !h.includes("y");
        });

        const lastRow = normalizedRows[normalizedRows.length - 1];
        const lastHeader = (lastRow?.[0] || '').replace(/[\$\\]/g, '').trim().toLowerCase();
        const isLastRowDerivative = lastHeader.includes("f'(x)") || lastHeader.includes("y'");

        if (factorRows.length >= 2 && isLastRowDerivative && lastRow) {
          for (let c = 1; c <= totalContentCols; c++) {
            const isIntervalCol = (c - 1) % 2 === 1;
            let hasZero = false;
            let hasDoubleLine = false;
            let minusCount = 0;

            for (const fRow of factorRows) {
              const val = (fRow[c] || '').trim();
              if (val === '0') hasZero = true;
              if (val === '||') hasDoubleLine = true;
              if (val === '-' || val === '−') minusCount++;
            }

            if (hasDoubleLine) {
              lastRow[c] = '||';
            } else if (hasZero && !isIntervalCol) {
              lastRow[c] = '0';
            } else if (isIntervalCol) {
              lastRow[c] = minusCount % 2 === 1 ? '−' : '+';
            }
          }
        }

        return normalizedRows;
      }
    }

    // Default table padding: ensure each row has maxCols
    let maxCols = Math.max(...rawParsedRows.map((r) => r.length));
    return rawParsedRows.map((row) => {
      const padded = [...row];
      while (padded.length < maxCols) {
        padded.push('');
      }
      return padded;
    });
  };

  // Normalize string: convert all escaped \n, <br>, <br/>, <br /> to newline \n
  // Do NOT match \n inside LaTeX commands like \nearrow, \nwarrow, \neq, \nabla, etc.
  let normalizedText = cleanMathString(text || '')
    .replace(/\\\\n/g, '\n')
    .replace(/\\n(?![a-zA-Z])/g, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n');

  // Pre-process inline / single-line markdown table rows into separate lines
  if (normalizedText.includes('|')) {
    // 1. Separate table separator rows e.g. " |---|---| " (requiring AT LEAST 2 dashes per cell so single minus '-' is NOT mistaken for table header separator)
    normalizedText = normalizedText.replace(/([^\n])\s*(\|(?:\s*:?-{2,}:?\s*\|)+)/g, '$1\n$2');
    normalizedText = normalizedText.replace(/(\|(?:\s*:?-{2,}:?\s*\|)+)\s*([^\n|])/g, '$1\n$2');

    // 2. Separate known table header rows e.g. "| x |", "| y' |", "| y |", "| f'(x) |", "| f(x) |", "| f' |", "| f |"
    normalizedText = normalizedText.replace(/([^\n])\s*(\|\s*(?:x|y'|f'\(x\)|f'|y|f\(x\)|f|x_i)\s*\|)/gi, '$1\n$2');
  }

  // Only return raw inline math span if inline requested AND text has NO table structure
  if (inline && !hasTableStructure(text)) {
    return (
      <span className={`leading-relaxed ${className}`}>
        {renderInlineMath(normalizedText.replace(/\n+/g, ' '))}
      </span>
    );
  }

  // Split into lines and parse table blocks vs text blocks
  const rawLines = normalizedText.split('\n');
  const blocks: { type: 'text' | 'table'; lines: string[] }[] = [];
  let currentTableLines: string[] = [];

  rawLines.forEach((line) => {
    let trimmed = line.trim();
    if (!trimmed) {
      if (currentTableLines.length > 0) {
        blocks.push({ type: 'table', lines: [...currentTableLines] });
        currentTableLines = [];
      }
      blocks.push({ type: 'text', lines: [''] });
      return;
    }

    // Check if this is a table separator row e.g. |---|---|, ---|, |---, :---:|:---:, ---
    const isSeparatorRow = /^[\|\s\-:]+$/.test(trimmed) && trimmed.includes('--');
    // Check if this is a table row: has pipe characters separating cells
    const pipeCount = (trimmed.match(/\|/g) || []).length;
    const isHeaderRow = /^(?:\|)?\s*(?:x|y'|f'\(x\)|f'|y|f\(x\)|f|x_i)\s*\|/i.test(trimmed);
    const isTableRow =
      (trimmed.startsWith('|') && pipeCount >= 2) ||
      (pipeCount >= 2 && /[\+\-0]/.test(trimmed)) ||
      (pipeCount >= 3) ||
      isHeaderRow ||
      (isSeparatorRow && currentTableLines.length > 0);

    if (isTableRow) {
      // Normalize line to standard | cell | cell | format
      if (!trimmed.startsWith('|')) trimmed = `| ${trimmed}`;
      if (!trimmed.endsWith('|')) trimmed = `${trimmed} |`;
      currentTableLines.push(trimmed);
    } else {
      if (currentTableLines.length > 0) {
        blocks.push({ type: 'table', lines: [...currentTableLines] });
        currentTableLines = [];
      }

      // Auto-balance single line math $ if odd count
      let safeLine = line;
      const nonDisplay = safeLine.replace(/\$\$/g, '');
      const dollarCount = (nonDisplay.match(/\$/g) || []).length;
      if (dollarCount % 2 !== 0) {
        safeLine = `${safeLine}$`;
      }

      blocks.push({ type: 'text', lines: [safeLine] });
    }
  });

  if (currentTableLines.length > 0) {
    blocks.push({ type: 'table', lines: currentTableLines });
  }

  return (
    <div className={`leading-relaxed space-y-1.5 ${className}`}>
      {blocks.map((block, bIdx) => {
        if (block.type === 'table') {
          // Filter out markdown separator line e.g. |---|---| or ---|
          const isSeparatorLine = (l: string) => /^[\|\s\-:]+$/.test(l.trim()) && l.includes('--');
          const contentRows = block.lines.filter((l) => !isSeparatorLine(l));
          if (contentRows.length === 0) return null;

          const processedRows = processTableRows(contentRows);
          if (processedRows.length === 0) return null;

          return (
            <div key={`table-${bIdx}`} className="my-3 overflow-x-auto rounded-xl border border-slate-300 shadow-sm max-w-full inline-block bg-white">
              <table className="border-collapse text-sm">
                <tbody>
                  {processedRows.map((rowCells, rIdx) => {
                    return (
                      <tr key={`row-${rIdx}`} className={`border-b border-slate-300 last:border-b-0 ${rIdx === 0 ? 'bg-slate-50' : 'hover:bg-slate-50/50'}`}>
                        {rowCells.map((cellText, cIdx) =>
                          renderTableCell(cellText, cIdx, cIdx === 0)
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          );
        }

        // Text block: render line with math
        const lineText = block.lines.join(' ');
        if (!lineText.trim()) {
          return <div key={`empty-${bIdx}`} className="h-1" />;
        }

        return (
          <div key={`txt-${bIdx}`}>
            {renderInlineMath(lineText, `blk-${bIdx}`)}
          </div>
        );
      })}
    </div>
  );
};
