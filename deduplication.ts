import { Question } from '../types';

/**
 * Clean and normalize text for string similarity comparison
 */
export function normalizeText(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    // Remove LaTeX dollar signs and common LaTeX commands for pure content comparison
    .replace(/\\[a-zA-Z]+/g, ' ')
    .replace(/[\$\{\}\_\^\,\.\:\;\!\?\(\)\[\]\\\/]/g, ' ')
    // Normalize spaces
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Generate n-gram tokens from text
 */
function getNgrams(text: string, n = 2): Set<string> {
  const words = normalizeText(text).split(' ').filter(Boolean);
  const ngrams = new Set<string>();
  
  if (words.length < n) {
    if (words.length > 0) ngrams.add(words.join(' '));
    return ngrams;
  }

  for (let i = 0; i <= words.length - n; i++) {
    ngrams.add(words.slice(i, i + n).join(' '));
  }
  return ngrams;
}

/**
 * Generate character n-grams (3-grams) for robust string similarity
 */
function getCharNgrams(text: string, n = 3): Set<string> {
  const norm = normalizeText(text);
  const ngrams = new Set<string>();
  if (norm.length < n) {
    if (norm.length > 0) ngrams.add(norm);
    return ngrams;
  }
  for (let i = 0; i <= norm.length - n; i++) {
    ngrams.add(norm.slice(i, i + n));
  }
  return ngrams;
}

/**
 * Calculate Jaccard / Dice similarity between two text strings (0.0 to 1.0)
 */
export function calculateTextSimilarity(text1: string, text2: string): number {
  const norm1 = normalizeText(text1);
  const norm2 = normalizeText(text2);

  if (!norm1 || !norm2) return 0;
  if (norm1 === norm2) return 1.0;

  // 1. Word 2-gram Dice Coefficient
  const wordSet1 = getNgrams(norm1, 2);
  const wordSet2 = getNgrams(norm2, 2);

  let wordIntersectCount = 0;
  wordSet1.forEach((token) => {
    if (wordSet2.has(token)) wordIntersectCount++;
  });

  const wordDice = (2 * wordIntersectCount) / (wordSet1.size + wordSet2.size || 1);

  // 2. Character 3-gram Dice Coefficient
  const charSet1 = getCharNgrams(norm1, 3);
  const charSet2 = getCharNgrams(norm2, 3);

  let charIntersectCount = 0;
  charSet1.forEach((token) => {
    if (charSet2.has(token)) charIntersectCount++;
  });

  const charDice = (2 * charIntersectCount) / (charSet1.size + charSet2.size || 1);

  // Weighted average favoring character n-grams for math formulas/short text
  const combinedScore = wordDice * 0.4 + charDice * 0.6;
  return Math.min(1.0, Math.max(0.0, combinedScore));
}

export interface DuplicateGroup {
  id: string;
  originalQuestion: Question;
  duplicateQuestions: { question: Question; similarity: number }[];
}

/**
 * Find all duplicate groups with >= threshold similarity (default 80% / 0.80)
 */
export function findDuplicateQuestionGroups(
  questions: Question[],
  threshold = 0.80
): DuplicateGroup[] {
  const visited = new Set<string>();
  const duplicateGroups: DuplicateGroup[] = [];

  for (let i = 0; i < questions.length; i++) {
    const q1 = questions[i];
    if (visited.has(q1.id)) continue;

    const duplicates: { question: Question; similarity: number }[] = [];

    for (let j = i + 1; j < questions.length; j++) {
      const q2 = questions[j];
      if (visited.has(q2.id)) continue;

      const sim = calculateTextSimilarity(q1.content, q2.content);
      if (sim >= threshold) {
        duplicates.push({ question: q2, similarity: Math.round(sim * 100) });
        visited.add(q2.id);
      }
    }

    if (duplicates.length > 0) {
      visited.add(q1.id);
      duplicateGroups.push({
        id: `dup_group_${i}_${q1.id}`,
        originalQuestion: q1,
        duplicateQuestions: duplicates,
      });
    }
  }

  return duplicateGroups;
}

/**
 * Remove duplicates automatically (keeps the first occurrence, removes those with >= threshold similarity)
 */
export function autoDeduplicateQuestions(
  questions: Question[],
  threshold = 0.80
): { uniqueQuestions: Question[]; removedCount: number } {
  const keptQuestions: Question[] = [];
  let removedCount = 0;

  for (const q of questions) {
    let isDuplicate = false;
    for (const kept of keptQuestions) {
      const sim = calculateTextSimilarity(kept.content, q.content);
      if (sim >= threshold) {
        isDuplicate = true;
        removedCount++;
        break;
      }
    }
    if (!isDuplicate) {
      keptQuestions.push(q);
    }
  }

  return { uniqueQuestions: keptQuestions, removedCount };
}
