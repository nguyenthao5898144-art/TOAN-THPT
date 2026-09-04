import { BBTData, GraphData, DiagramItem, DIAGRAM_BANK } from './diagramBank';
import { Question } from './types';
import { parseAsciiBBT } from './mathGraphParser';

export interface ParsedTikZResult {
  hasTikZ: boolean;
  rawTikZ?: string;
  tikzType?: 'bbt' | 'graph' | 'geometry_3d' | 'oxyz' | 'tree' | 'histogram' | 'custom';
  bbtData?: BBTData;
  graphData?: GraphData;
  cleanContent: string;
}

/**
 * Extract TikZ environment or PROMPT TIKZ from question content
 */
export function extractTikZFromText(text: string): ParsedTikZResult {
  if (!text) return { hasTikZ: false, cleanContent: '' };

  let content = text;
  let rawTikZ: string | undefined;
  let tikzType: 'bbt' | 'graph' | 'geometry_3d' | 'oxyz' | 'tree' | 'histogram' | 'custom' | undefined;
  let bbtData: BBTData | undefined;

  // 1. Check for standard \begin{tikzpicture} ... \end{tikzpicture}
  const tikzEnvMatch = content.match(/\\begin\{tikzpicture\}[\s\S]*?\\end\{tikzpicture\}/i);
  if (tikzEnvMatch) {
    rawTikZ = tikzEnvMatch[0];
    content = content.replace(rawTikZ, '').trim();
  }

  // 2. Check for \begin{tkzTab} ... \end{tkzTab}
  const tkzTabMatch = content.match(/\\begin\{tkzTab\}[\s\S]*?\\end\{tkzTab\}/i);
  if (tkzTabMatch) {
    rawTikZ = rawTikZ || tkzTabMatch[0];
    content = content.replace(tkzTabMatch[0], '').trim();
  }

  // 3. Check for [TIKZ] ... [/TIKZ]
  const bracketTikzMatch = content.match(/\[TIKZ\]([\s\S]*?)\[\/TIKZ\]/i);
  if (bracketTikzMatch) {
    rawTikZ = rawTikZ || bracketTikzMatch[1];
    content = content.replace(bracketTikzMatch[0], '').trim();
  }

  // 4. Check for "PROMPT TIKZ:" or "CẤU TRÚC TIKZ:"
  const promptTikzMatch = content.match(/(?:PROMPT\s+TIKZ|CẤU\s+TRÚC\s+TIKZ|HÌNH\s+VẼ\s+TIKZ)[\s\:]+([^\n\r]+(?:\n[^\n\r]+){0,5})/i);
  if (promptTikzMatch && !rawTikZ) {
    rawTikZ = promptTikzMatch[0];
    content = content.replace(promptTikzMatch[0], '').trim();
  }

  if (rawTikZ) {
    // Determine type
    const lowerRaw = rawTikZ.toLowerCase();
    if (lowerRaw.includes('tkztab') || lowerRaw.includes('tkztabinit') || lowerRaw.includes('bảng biến thiên') || lowerRaw.includes('bảng xét dấu') || lowerRaw.includes('bxd') || lowerRaw.includes('bbt')) {
      tikzType = 'bbt';
      bbtData = parseTkzTabToBBT(rawTikZ) || parseAsciiBBT(rawTikZ)?.bbtData;
    } else if (lowerRaw.includes('plot') || lowerRaw.includes('domain') || lowerRaw.includes('đồ thị') || lowerRaw.includes('arrows')) {
      tikzType = 'graph';
    } else if (lowerRaw.includes('oxyz') || lowerRaw.includes('vectơ') || lowerRaw.includes('vector') || lowerRaw.includes('tọa độ không gian')) {
      tikzType = 'oxyz';
    } else if (lowerRaw.includes('chóp') || lowerRaw.includes('lăng trụ') || lowerRaw.includes('hình hộp') || lowerRaw.includes('mặt cầu')) {
      tikzType = 'geometry_3d';
    } else if (lowerRaw.includes('tree') || lowerRaw.includes('sơ đồ cây') || lowerRaw.includes('xác suất')) {
      tikzType = 'tree';
    } else {
      tikzType = 'custom';
    }

    return {
      hasTikZ: true,
      rawTikZ,
      tikzType,
      bbtData,
      cleanContent: content,
    };
  }

  return {
    hasTikZ: false,
    cleanContent: content,
  };
}

/**
 * Parses LaTeX tkz-tab syntax into BBTData
 */
export function parseTkzTabToBBT(tkzCode: string): BBTData | undefined {
  try {
    // Example tkz-tab:
    // \tkzTabInit{$x$/1, $y'$/1, $y$/2}{$-\infty$, $-1$, $1$, $+\infty$}
    // \tkzTabLine{, +, 0, -, 0, +, }
    // \tkzTabVar{-/ $-\infty$, +/ 3, -/ -1, +/ $+\infty$}

    const initMatch = tkzCode.match(/\\tkzTabInit(?:\[[^\]]*\])?\{([^}]+)\}\{([^}]+)\}/);
    if (!initMatch) return undefined;

    // Parse row header labels (e.g., "$m$/1, $m^2-m-2$/1" or "$x$/1, $y'$/1, $y$/2")
    const rowHeaders = initMatch[1].split(',').map((h) => {
      const parts = h.split('/');
      return parts[0].trim();
    });
    const xLabel = rowHeaders[0] || '$x$';
    const fPrimeLabel = rowHeaders[1] || "$y'$";
    const fLabel = rowHeaders.length > 2 ? rowHeaders[2] : undefined;

    const rawXValues = initMatch[2].split(',').map((x) => x.replace(/[\$\{\}]/g, '').trim());
    const lineMatch = tkzCode.match(/\\tkzTabLine\{([^}]+)\}/);
    const varMatch = tkzCode.match(/\\tkzTabVar\{([^}]+)\}/);

    let fPrimeValues: string[] = [];
    if (lineMatch) {
      fPrimeValues = lineMatch[1]
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0)
        .map((s) => (s === 'd' || s === '||' ? '||' : s));
    }

    const fValues: { value: string; position: 'top' | 'bottom' | 'middle'; type?: 'val' | 'infinity' }[] = [];
    const arrows: { fromIndex: number; toIndex: number; direction?: 'up' | 'down' }[] = [];

    if (varMatch) {
      const varParts = varMatch[1].split(',').map((s) => s.trim()).filter((s) => s.length > 0);
      varParts.forEach((part, pIdx) => {
        const isTop = part.startsWith('+/') || part.startsWith('+ /');
        const isBottom = part.startsWith('-/') || part.startsWith('- /');
        const cleanVal = part.replace(/^[\+\-]\s*\/\s*/, '').replace(/[\$\{\}]/g, '').trim();
        const pos: 'top' | 'bottom' | 'middle' = isTop ? 'top' : isBottom ? 'bottom' : 'middle';

        fValues.push({
          value: cleanVal,
          position: pos,
          type: cleanVal.includes('infty') || cleanVal.includes('∞') ? 'infinity' : 'val',
        });

        if (pIdx > 0) {
          const prevPart = varParts[pIdx - 1];
          const prevTop = prevPart.startsWith('+/');
          arrows.push({
            fromIndex: pIdx - 1,
            toIndex: pIdx,
            direction: isTop && !prevTop ? 'up' : 'down',
          });
        }
      });
    }

    return {
      xLabel,
      fPrimeLabel,
      fLabel,
      xValues: rawXValues,
      fPrimeValues: fPrimeValues.length > 0 ? fPrimeValues : ['+', '0', '-', '0', '+'],
      fValues: fValues.length > 0 ? fValues : undefined,
      arrows: arrows.length > 0 ? arrows : undefined,
    };
  } catch (err) {
    console.warn('Error parsing tkz-tab:', err);
    return undefined;
  }
}

/**
 * Generates clean, standard LaTeX TikZ code from BBTData
 */
export function generateBBTTikZCode(bbt: BBTData): string {
  const xVals = bbt.xValues.map((v) => `$${v.replace(/\$/g, '')}$`).join(', ');
  const fpVals = bbt.fPrimeValues.map((v) => (v === '||' ? 'd' : v)).join(', ');

  let code = `\\begin{tikzpicture}\n`;
  code += `  \\tkzTabInit[lgt=1.2, espcl=2.2]{\n`;
  code += `    $x$ / 0.8,\n`;
  code += `    $y'$ / 0.8`;
  if (bbt.fValues && bbt.fValues.length > 0) {
    code += `,\n    $y$ / 2.0\n`;
  } else {
    code += `\n`;
  }
  code += `  }{${xVals}}\n`;
  code += `  \\tkzTabLine{, ${fpVals}, }\n`;

  if (bbt.fValues && bbt.fValues.length > 0) {
    const varItems = bbt.fValues.map((fv) => {
      const prefix = fv.position === 'top' ? '+/' : fv.position === 'bottom' ? '-/' : 'R/';
      return `${prefix} {$${fv.value.replace(/\$/g, '')}$}`;
    });
    code += `  \\tkzTabVar{${varItems.join(', ')}}\n`;
  }

  code += `\\end{tikzpicture}`;
  return code;
}

/**
 * Generates TikZ code for a 2D function graph
 */
export function generateGraphTikZCode(graphData?: GraphData, formula?: string): string {
  const expr = formula || graphData?.expression || 'x^3 - 3*x + 1';
  const xMin = graphData?.xMin ?? -3.5;
  const xMax = graphData?.xMax ?? 3.5;
  const yMin = graphData?.yMin ?? -3.5;
  const yMax = graphData?.yMax ?? 3.5;

  let code = `\\begin{tikzpicture}[scale=0.85, >=stealth]\n`;
  code += `  % Hệ trục tọa độ Oxy\n`;
  code += `  \\draw[->, thick] (${xMin - 0.5}, 0) -- (${xMax + 0.5}, 0) node[below] {$x$};\n`;
  code += `  \\draw[->, thick] (0, ${yMin - 0.5}) -- (0, ${yMax + 0.5}) node[left] {$y$};\n`;
  code += `  \\node[below left] at (0, 0) {$O$};\n`;
  code += `  \\clip (${xMin}, ${yMin}) rectangle (${xMax}, ${yMax});\n\n`;

  // Draw Grid
  code += `  % Lưới tọa độ\n`;
  code += `  \\draw[help lines, dashed, gray!30] (${xMin}, ${yMin}) grid (${xMax}, ${yMax});\n\n`;

  // Asymptotes
  if (graphData?.asymptotes) {
    graphData.asymptotes.forEach((a) => {
      if (a.type === 'vertical') {
        code += `  % Tiệm cận đứng x = ${a.val}\n`;
        code += `  \\draw[red, dashed, thick] (${a.val}, ${yMin}) -- (${a.val}, ${yMax});\n`;
      } else if (a.type === 'horizontal') {
        code += `  % Tiệm cận ngang y = ${a.val}\n`;
        code += `  \\draw[red, dashed, thick] (${xMin}, ${a.val}) -- (${xMax}, ${a.val});\n`;
      } else if (a.type === 'oblique') {
        code += `  % Tiệm cận xiên\n`;
        code += `  \\draw[purple, dashed, thick] (${xMin}, ${xMin}) -- (${xMax}, ${xMax});\n`;
      }
    });
  }

  // Draw Plot
  code += `  % Đồ thị hàm số\n`;
  code += `  \\draw[blue, thick, smooth, samples=200, domain=${xMin}:${xMax}] plot (\\x, {${expr.replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1)/($2)')}});\n\n`;

  // Key Points
  if (graphData?.keyPoints) {
    graphData.keyPoints.forEach((pt) => {
      code += `  \\filldraw[red] (${pt.x}, ${pt.y}) circle (1.8pt) node[above right] {${pt.label || ''}};\n`;
    });
  }

  code += `\\end{tikzpicture}`;
  return code;
}

/**
 * Generates TikZ code for Oxyz 3D Geometry
 */
export function generateOxyzTikZCode(): string {
  return `\\begin{tikzpicture}[scale=0.9, >=stealth, x={(-0.5cm,-0.5cm)}, y={(1cm,0cm)}, z={(0cm,1cm)}]\n` +
    `  % Trục tọa độ Oxyz trong không gian\n` +
    `  \\draw[->, thick] (0,0,0) -- (4,0,0) node[below left] {$x$};\n` +
    `  \\draw[->, thick] (0,0,0) -- (0,5,0) node[right] {$y$};\n` +
    `  \\draw[->, thick] (0,0,0) -- (0,0,4) node[above] {$z$};\n` +
    `  \\node[above right] at (0,0,0) {$O$};\n` +
    `  % Vectơ đơn vị i, j, k\n` +
    `  \\draw[->, red, very thick] (0,0,0) -- (1,0,0) node[midway, above left] {$\\vec{i}$};\n` +
    `  \\draw[->, green!60!black, very thick] (0,0,0) -- (0,1,0) node[midway, below] {$\\vec{j}$};\n` +
    `  \\draw[->, blue, very thick] (0,0,0) -- (0,0,1) node[midway, left] {$\\vec{k}$};\n` +
    `\\end{tikzpicture}`;
}

/**
 * Generates TikZ code for 3D Tetrahedron / Pyramid
 */
export function generate3DGeometryTikZCode(): string {
  return `\\begin{tikzpicture}[scale=0.9, >=stealth]\n` +
    `  \\coordinate (A) at (0,0);\n` +
    `  \\coordinate (B) at (1.5,-1.2);\n` +
    `  \\coordinate (C) at (4.5,0);\n` +
    `  \\coordinate (S) at (2,4);\n` +
    `  % Nét đứt và nét liền\n` +
    `  \\draw[dashed, thick] (A) -- (C);\n` +
    `  \\draw[thick] (A) -- (B) -- (C) -- (S) -- (A) (S) -- (B);\n` +
    `  \\filldraw (A) circle (1pt) node[left] {$A$};\n` +
    `  \\filldraw (B) circle (1pt) node[below] {$B$};\n` +
    `  \\filldraw (C) circle (1pt) node[right] {$C$};\n` +
    `  \\filldraw (S) circle (1pt) node[above] {$S$};\n` +
    `\\end{tikzpicture}`;
}

/**
 * Gets full compilable TikZ string for any Question or DiagramItem
 */
export function getTikZCodeForQuestion(q: Question, diagramItem?: DiagramItem): string {
  if (q.tikzCode) return q.tikzCode;

  if (diagramItem?.bbtData) {
    return generateBBTTikZCode(diagramItem.bbtData);
  }

  if (diagramItem?.graphData) {
    return generateGraphTikZCode(diagramItem.graphData);
  }

  const lowerC = (q.content || '').toLowerCase();
  if (lowerC.includes('oxyz') || lowerC.includes('hệ tọa độ') || lowerC.includes('vectơ') || lowerC.includes('mặt phẳng')) {
    return generateOxyzTikZCode();
  }

  if (lowerC.includes('chóp') || lowerC.includes('lăng trụ') || lowerC.includes('hình hộp') || lowerC.includes('thể tích')) {
    return generate3DGeometryTikZCode();
  }

  return generateGraphTikZCode(undefined, 'x^3 - 3*x + 1');
}
