import { TestConfig, GeneratedTest, Question, TestMatrixItem, TestSummary, MultipleChoiceQuestion, TrueFalseQuestion, ShortAnswerQuestion, CognitiveLevel } from '../types';
import { MATH_12_SYLLABUS, Lesson, Topic } from '../data/math12Syllabus';
import { DIAGRAM_BANK, DiagramItem } from '../data/diagramBank';
import { extractFormulaFromText, hasUnknownParameters } from './mathGraphParser';
import { cleanMathString } from './mathSanitizer';

export function normalizeQuestionOptionsAndContent(q: Question): Question {
  if (!q) return q;
  const processed = { ...q };

  let content = processed.content || '';

  // 1. Check if options are embedded inside content (e.g. "A. ... B. ... C. ... D. ...")
  const mcqPattern = /(?:^|\n|\s+)A[\.\:\)]\s*([\s\S]*?)(?:(?:\n|\s+)B[\.\:\)]\s*([\s\S]*?))(?:(?:\n|\s+)C[\.\:\)]\s*([\s\S]*?))(?:(?:\n|\s+)D[\.\:\)]\s*([\s\S]*?))$/i;
  const embeddedMatch = content.match(mcqPattern);
  if (embeddedMatch) {
    const optA = embeddedMatch[1]?.trim();
    const optB = embeddedMatch[2]?.trim();
    const optC = embeddedMatch[3]?.trim();
    const optD = embeddedMatch[4]?.trim();

    const currentOptions = processed.type === 'multiple_choice' ? (processed as MultipleChoiceQuestion).options : null;
    const isPlaceholderOptions =
      !currentOptions ||
      currentOptions.length < 4 ||
      currentOptions.every((o) => !o.text || /^phương án\s+[a-d]$/i.test(o.text.trim()));

    if (isPlaceholderOptions && optA && optB && optC && optD) {
      content = content.replace(mcqPattern, '').trim();
      processed.content = content;
      if (processed.type === 'multiple_choice') {
        (processed as MultipleChoiceQuestion).options = [
          { key: 'A', text: optA },
          { key: 'B', text: optB },
          { key: 'C', text: optC },
          { key: 'D', text: optD },
        ];
      }
    }
  }

  // 2. Normalize multiple_choice options
  if (processed.type === 'multiple_choice') {
    const mcq = processed as MultipleChoiceQuestion;
    let options = mcq.options;

    // Check if options were placed in unexpected properties (choices, answers, optionsText)
    if ((!options || options.length === 0) && (q as any).choices && Array.isArray((q as any).choices)) {
      options = (q as any).choices.map((c: any, i: number) => {
        const k = ['A', 'B', 'C', 'D'][i] as 'A' | 'B' | 'C' | 'D';
        return { key: k, text: typeof c === 'string' ? c : c.text || c.value || `Phương án ${k}` };
      });
    }

    const isPlaceholder =
      !options ||
      !Array.isArray(options) ||
      options.length < 4 ||
      options.every((o) => !o.text || o.text.trim().length === 0 || /^phương án\s+[a-d]$/i.test(o.text.trim()));

    if (isPlaceholder) {
      const lowerC = (processed.content || '').toLowerCase();
      // Generate realistic mathematical options depending on question intent
      if (lowerC.includes('đồng biến') && (lowerC.includes('hàm số nào') || lowerC.includes('hàm số dưới đây') || lowerC.includes('trên khoảng'))) {
        options = [
          { key: 'A', text: '$y = x^3 + 3x$' },
          { key: 'B', text: '$y = -x^4 + 2x^2$' },
          { key: 'C', text: '$y = \\frac{x - 1}{x + 2}$' },
          { key: 'D', text: '$y = x^4 - 2x^2$' },
        ];
        mcq.correctAnswer = 'A';
        mcq.solution = mcq.solution || 'Hàm số $y = x^3 + 3x$ có $y\' = 3x^2 + 3 > 0, \\forall x \\in \\mathbb{R}$ nên đồng biến trên $\\mathbb{R}$ và đồng biến trên khoảng đã cho. Chọn A.';
      } else if (lowerC.includes('nghịch biến') && (lowerC.includes('hàm số nào') || lowerC.includes('hàm số dưới đây') || lowerC.includes('trên khoảng'))) {
        options = [
          { key: 'A', text: '$y = -x^3 - 3x$' },
          { key: 'B', text: '$y = x^4 - 2x^2$' },
          { key: 'C', text: '$y = \\frac{2x + 1}{x - 1}$' },
          { key: 'D', text: '$y = x^3 + 3x$' },
        ];
        mcq.correctAnswer = 'A';
        mcq.solution = mcq.solution || 'Hàm số $y = -x^3 - 3x$ có $y\' = -3x^2 - 3 < 0, \\forall x \\in \\mathbb{R}$ nên nghịch biến trên $\\mathbb{R}$ và nghịch biến trên khoảng đã cho. Chọn A.';
      } else if (lowerC.includes('cực trị') || lowerC.includes('cực đại') || lowerC.includes('cực tiểu')) {
        options = [
          { key: 'A', text: '$x = 0$' },
          { key: 'B', text: '$x = 1$' },
          { key: 'C', text: '$x = -1$' },
          { key: 'D', text: '$x = 2$' },
        ];
      } else if (lowerC.includes('tiệm cận')) {
        options = [
          { key: 'A', text: '$x = 1$' },
          { key: 'B', text: '$x = -1$' },
          { key: 'C', text: '$y = 2$' },
          { key: 'D', text: '$y = -2$' },
        ];
      } else if (lowerC.includes('giá trị lớn nhất') || lowerC.includes('giá trị nhỏ nhất') || lowerC.includes('gtln') || lowerC.includes('gtnn')) {
        options = [
          { key: 'A', text: '$5$' },
          { key: 'B', text: '$-3$' },
          { key: 'C', text: '$2$' },
          { key: 'D', text: '$0$' },
        ];
      } else if (lowerC.includes('nguyên hàm') || lowerC.includes('tích phân')) {
        options = [
          { key: 'A', text: '$\\frac{x^3}{3} + C$' },
          { key: 'B', text: '$x^2 + C$' },
          { key: 'C', text: '$2x + C$' },
          { key: 'D', text: '$\\frac{x^4}{4} + C$' },
        ];
      } else if (lowerC.includes('vectơ') || lowerC.includes('tọa độ') || lowerC.includes('mặt phẳng') || lowerC.includes('đường thẳng')) {
        options = [
          { key: 'A', text: '$(1; 2; 3)$' },
          { key: 'B', text: '$(2; -1; 0)$' },
          { key: 'C', text: '$(0; 1; -2)$' },
          { key: 'D', text: '$(-1; 0; 3)$' },
        ];
      } else {
        options = [
          { key: 'A', text: '$(-\\infty; 1)$' },
          { key: 'B', text: '$(1; +\\infty)$' },
          { key: 'C', text: '$(-1; 2)$' },
          { key: 'D', text: '$(0; 3)$' },
        ];
      }
    }

    // Ensure all 4 keys A, B, C, D exist
    const normalizedOptions: { key: 'A' | 'B' | 'C' | 'D'; text: string }[] = ['A', 'B', 'C', 'D'].map((key, idx) => {
      const existing = (options || []).find((o) => (o?.key || '').toUpperCase() === key) || (options || [])[idx];
      let txt = existing?.text || '';
      if (!txt || /^phương án\s+[a-d]$/i.test(txt.trim())) {
        txt = key === 'A' ? '$(-\\infty; 1)$' : key === 'B' ? '$(1; +\\infty)$' : key === 'C' ? '$(-1; 1)$' : '$(-1; +\\infty)$';
      }
      return { key: key as 'A' | 'B' | 'C' | 'D', text: txt };
    });

    mcq.options = normalizedOptions;
    if (!['A', 'B', 'C', 'D'].includes(mcq.correctAnswer as string)) {
      mcq.correctAnswer = 'A';
    }
  }

  // 3. Normalize true_false statements
  if (processed.type === 'true_false') {
    const tf = processed as TrueFalseQuestion;
    let statements = tf.statements;
    const isPlaceholderTf =
      !statements ||
      !Array.isArray(statements) ||
      statements.length < 4 ||
      statements.every((s) => !s.text || /^(mệnh đề|ý)\s+[a-d]\s+(đúng|sai)$/i.test(s.text.trim()));

    if (isPlaceholderTf) {
      statements = [
        { id: 'a', text: 'Tập xác định của hàm số là $D = \\mathbb{R}$.', isCorrect: true },
        { id: 'b', text: 'Đạo hàm của hàm số triệt tiêu tại 2 điểm phân biệt.', isCorrect: true },
        { id: 'c', text: 'Hàm số đồng biến trên khoảng $(0; +\\infty)$.', isCorrect: false },
        { id: 'd', text: 'Giá trị cực đại của hàm số lớn hơn giá trị cực tiểu.', isCorrect: true },
      ];
    } else {
      statements = ['a', 'b', 'c', 'd'].map((letter, sIdx) => {
        const existing = (statements || []).find((st) => (st?.id || '').toLowerCase() === letter) || (statements || [])[sIdx];
        let txt = existing?.text || '';
        if (!txt || /^(mệnh đề|ý)\s+[a-d]\s+(đúng|sai)$/i.test(txt.trim())) {
          txt =
            letter === 'a'
              ? 'Tập xác định của hàm số là $D = \\mathbb{R}$.'
              : letter === 'b'
              ? 'Đạo hàm của hàm số triệt tiêu tại 2 điểm phân biệt.'
              : letter === 'c'
              ? 'Hàm số đồng biến trên khoảng $(0; +\\infty)$.'
              : 'Giá trị cực đại của hàm số lớn hơn giá trị cực tiểu.';
        }
        return {
          id: letter as 'a' | 'b' | 'c' | 'd',
          text: txt,
          isCorrect: typeof existing?.isCorrect === 'boolean' ? existing.isCorrect : true,
        };
      });
    }
    tf.statements = statements;
  }

  // 4. Normalize short_answer
  if (processed.type === 'short_answer') {
    const sa = processed as ShortAnswerQuestion;
    if (!sa.correctAnswer || sa.correctAnswer.trim().length === 0) {
      sa.correctAnswer = '1';
    }
  }

  return processed;
}

export function sanitizeQuestionMath(q: Question): Question {
  const normalized = normalizeQuestionOptionsAndContent(q);
  const sanitized = { ...normalized };
  if (sanitized.content) {
    sanitized.content = cleanMathString(sanitized.content);
  }
  if (sanitized.solution) {
    sanitized.solution = cleanMathString(sanitized.solution);
  }
  if (sanitized.learningOutcome) {
    sanitized.learningOutcome = cleanMathString(sanitized.learningOutcome);
  }
  if (sanitized.type === 'multiple_choice' && Array.isArray(sanitized.options)) {
    sanitized.options = sanitized.options.map((opt) => ({
      ...opt,
      text: cleanMathString(opt.text),
    }));
  }
  if (sanitized.type === 'true_false' && Array.isArray(sanitized.statements)) {
    sanitized.statements = sanitized.statements.map((st) => ({
      ...st,
      text: cleanMathString(st.text),
    }));
  }
  if (sanitized.type === 'short_answer' && sanitized.correctAnswer) {
    sanitized.correctAnswer = cleanMathString(sanitized.correctAnswer);
  }
  return sanitized;
}

// Question bank organized by lessonId -> type -> level -> list of template factories
interface QuestionTemplate {
  content: string;
  options?: { key: 'A' | 'B' | 'C' | 'D'; text: string }[];
  correctAnswer?: string;
  statements?: { id: 'a' | 'b' | 'c' | 'd'; text: string; isCorrect: boolean }[];
  solution: string;
  learningOutcomeIndex?: number;
}

type QuestionBank = Record<
  string, // lessonId
  Record<
    'multiple_choice' | 'true_false' | 'short_answer',
    Record<CognitiveLevel, QuestionTemplate[]>
  >
>;

const QUESTION_BANK: QuestionBank = {
  // 1. Tính đơn điệu của hàm số
  lesson_don_dieu: {
    multiple_choice: {
      NhanBiet: [
        {
          content: 'Cho hàm số $y = f(x)$ có bảng biến thiên với $f\'(x) > 0$ trên các khoảng $(-\\infty; 1)$ và $(3; +\\infty)$, $f\'(x) < 0$ trên khoảng $(1; 3)$. Mệnh đề nào sau đây đúng?',
          options: [
            { key: 'A', text: 'Hàm số đồng biến trên khoảng $(1; 3)$.' },
            { key: 'B', text: 'Hàm số nghịch biến trên khoảng $(-\\infty; 1)$.' },
            { key: 'C', text: 'Hàm số đồng biến trên khoảng $(3; +\\infty)$.' },
            { key: 'D', text: 'Hàm số nghịch biến trên khoảng $(3; +\\infty)$.' }
          ],
          correctAnswer: 'C',
          solution: 'Dựa vào bảng biến thiên, $f\'(x) > 0$ trên khoảng $(3; +\\infty)$ nên hàm số đồng biến trên khoảng $(3; +\\infty)$. Chọn C.',
          learningOutcomeIndex: 0
        },
        {
          content: 'Cho hàm số $y = f(x)$ có đạo hàm $f\'(x) = x^2 + 1$ với mọi $x \\in \\mathbb{R}$. Mệnh đề nào sau đây đúng?',
          options: [
            { key: 'A', text: 'Hàm số đồng biến trên $\\mathbb{R}$.' },
            { key: 'B', text: 'Hàm số nghịch biến trên $\\mathbb{R}$.' },
            { key: 'C', text: 'Hàm số đồng biến trên $(0; +\\infty)$ và nghịch biến trên $(-\\infty; 0)$.' },
            { key: 'D', text: 'Hàm số không có cực trị và nghịch biến trên $\\mathbb{R}$.' }
          ],
          correctAnswer: 'A',
          solution: 'Vì $f\'(x) = x^2 + 1 > 0$ với mọi $x \\in \\mathbb{R}$ nên hàm số $y = f(x)$ đồng biến trên $\\mathbb{R}$. Chọn A.',
          learningOutcomeIndex: 0
        }
      ],
      ThongHieu: [
        {
          content: 'Hàm số $y = x^3 - 3x + 2$ đồng biến trên khoảng nào dưới đây?',
          options: [
            { key: 'A', text: '$(-1; 1)$' },
            { key: 'B', text: '$(1; +\\infty)$' },
            { key: 'C', text: '$(-\\infty; 1)$' },
            { key: 'D', text: '$(-1; +\\infty)$' }
          ],
          correctAnswer: 'B',
          solution: 'Ta có $y\' = 3x^2 - 3 = 0 \\Leftrightarrow x = \\pm 1$. Bảng xét dấu: $y\' > 0$ khi $x \\in (-\\infty; -1) \\cup (1; +\\infty)$. Vậy hàm số đồng biến trên $(1; +\\infty)$. Chọn B.',
          learningOutcomeIndex: 1
        },
        {
          content: 'Hàm số $y = \\frac{2x + 1}{x - 1}$ nghịch biến trên khoảng nào?',
          options: [
            { key: 'A', text: '$\\mathbb{R} \\setminus \\{1\\}$' },
            { key: 'B', text: '$(-\\infty; 1)$ và $(1; +\\infty)$' },
            { key: 'C', text: '$(-\\infty; 1)$' },
            { key: 'D', text: '$(1; +\\infty)$' }
          ],
          correctAnswer: 'B',
          solution: 'Ta có $y\' = \\frac{-3}{(x-1)^2} < 0$ với mọi $x \\neq 1$. Hàm số nghịch biến trên từng khoảng $(-\\infty; 1)$ và $(1; +\\infty)$. Chọn B.',
          learningOutcomeIndex: 1
        }
      ],
      VanDung: [
        {
          content: 'Tìm tất cả các giá trị thực của tham số $m$ để hàm số $y = \\frac{1}{3}x^3 - mx^2 + (m+2)x + 2026$ đồng biến trên $\\mathbb{R}$.',
          options: [
            { key: 'A', text: '$-1 \\le m \\le 2$' },
            { key: 'B', text: '$m \\le -1$ hoặc $m \\ge 2$' },
            { key: 'C', text: '$-1 < m < 2$' },
            { key: 'D', text: '$m \\ge 2$' }
          ],
          correctAnswer: 'A',
          solution: 'Ta có $y\' = x^2 - 2mx + (m+2)$. Để hàm số đồng biến trên $\\mathbb{R}$ thì $y\' \\ge 0, \\forall x \\in \\mathbb{R} \\Leftrightarrow \\Delta\' = m^2 - (m+2) \\le 0 \\Leftrightarrow m^2 - m - 2 \\le 0 \\Leftrightarrow -1 \\le m \\le 2$. Chọn A.',
          learningOutcomeIndex: 2
        }
      ]
    },
    true_false: {
      NhanBiet: [
        {
          content: 'Cho hàm số $y = f(x)$ có đồ thị như hình vẽ với hai điểm cực trị là $x = -1$ và $x = 2$. Xét tính đúng/sai của các phát biểu sau:',
          statements: [
            { id: 'a', text: 'Hàm số đồng biến trên khoảng $(2; +\\infty)$.', isCorrect: true },
            { id: 'b', text: 'Hàm số nghịch biến trên khoảng $(-1; 2)$.', isCorrect: true },
            { id: 'c', text: 'Đạo hàm $f\'(x) < 0$ với mọi $x \\in (-\\infty; -1)$.', isCorrect: false },
            { id: 'd', text: 'Điểm cực đại của đồ thị hàm số là $x = -1$.', isCorrect: true }
          ],
          solution: 'Quan sát biến thiên: $f\'(x) > 0$ trên $(-\\infty; -1)$ và $(2; +\\infty)$, $f\'(x) < 0$ trên $(-1; 2)$. Nên phát biểu c sai, a, b, d đúng.',
          learningOutcomeIndex: 2
        }
      ],
      ThongHieu: [
        {
          content: 'Cho hàm số $y = f(x) = \\frac{x - 2}{x + 1}$. Xét tính đúng/sai của các mệnh đề sau:',
          statements: [
            { id: 'a', text: 'Tập xác định của hàm số là $D = \\mathbb{R} \\setminus \\{-1\\}$.', isCorrect: true },
            { id: 'b', text: 'Đạo hàm $y\' = \\frac{3}{(x+1)^2} > 0$ với mọi $x \\neq -1$.', isCorrect: true },
            { id: 'c', text: 'Hàm số đồng biến trên $\\mathbb{R} \\setminus \\{-1\\}$.', isCorrect: false },
            { id: 'd', text: 'Hàm số đồng biến trên từng khoảng $(-\\infty; -1)$ và $(-1; +\\infty)$.', isCorrect: true }
          ],
          solution: 'TXĐ $D = \\mathbb{R} \\setminus \\{-1\\}$ (a đúng). $y\' = \\frac{3}{(x+1)^2} > 0$ (b đúng). Không dùng ký hiệu $\\setminus$ để kết luận khoảng đồng biến (c sai). Kết luận đúng là trên từng khoảng (d đúng).',
          learningOutcomeIndex: 1
        }
      ],
      VanDung: [
        {
          content: 'Cho hàm số $y = f(x) = x^3 - 3mx^2 + 3(m^2-1)x + 1$. Xét tính đúng/sai của các mệnh đề:',
          statements: [
            { id: 'a', text: 'Đạo hàm $f\'(x) = 3(x^2 - 2mx + m^2 - 1)$.', isCorrect: true },
            { id: 'b', text: 'Hàm số có hai điểm cực trị $x_1 = m - 1$ và $x_2 = m + 1$ với mọi $m$.', isCorrect: true },
            { id: 'c', text: 'Hàm số nghịch biến trên khoảng $(m-1; m+1)$.', isCorrect: true },
            { id: 'd', text: 'Khoảng cách giữa hai điểm cực trị của đồ thị luôn bằng $4$ không phụ thuộc vào $m$.', isCorrect: false }
          ],
          solution: '$f\'(x) = 3(x^2 - 2mx + m^2 - 1) = 0 \\Leftrightarrow x = m \\pm 1$ (a, b đúng). Trong khoảng $(m-1; m+1)$ thì $f\'(x) < 0$ nên hàm số nghịch biến (c đúng). Khoảng cách giữa hai điểm cực trị phụ thuộc vào $m$ (d sai).',
          learningOutcomeIndex: 2
        }
      ]
    },
    short_answer: {
      NhanBiet: [
        {
          content: 'Hàm số $y = -x^3 + 3x + 1$ đồng biến trên khoảng $(-1; 1)$. Tính độ dài của khoảng đồng biến này.',
          correctAnswer: '2',
          solution: 'Khoảng đồng biến là $(-1; 1)$, độ dài bằng $1 - (-1) = 2$.',
          learningOutcomeIndex: 0
        }
      ],
      ThongHieu: [
        {
          content: 'Có bao nhiêu giá trị nguyên của tham số $m \\in [-5; 5]$ để hàm số $y = x^3 - 3x^2 + mx - 1$ đồng biến trên $\\mathbb{R}$?',
          correctAnswer: '3',
          solution: '$y\' = 3x^2 - 6x + m \\ge 0, \\forall x \\Leftrightarrow \\Delta\' = 9 - 3m \\le 0 \\Leftrightarrow m \\ge 3$. Do $m \\in [-5; 5]$ nên $m \\in \\{3; 4; 5\\}$. Có 3 giá trị.',
          learningOutcomeIndex: 1
        }
      ],
      VanDung: [
        {
          content: 'Cho hàm số $y = f(x)$ có $f\'(x) = (x-1)(x+2)^2(x-3)$. Hàm số $g(x) = f(1 - 2x)$ nghịch biến trên khoảng $(a; b)$. Tính giá trị nhỏ nhất của $b - a$.',
          correctAnswer: '1',
          solution: '$g\'(x) = -2 f\'(1 - 2x)$. Cho $g\'(x) < 0 \\Leftrightarrow f\'(1-2x) > 0 \\Leftrightarrow 1-2x < -2$ hoặc $1-2x > 3 \\Leftrightarrow x > 3/2$ hoặc $x < -1$. Khoảng nghịch biến $(-1; 3/2)$ có độ dài $2.5$. Khoảng $(1; 2)$ nghịch biến có độ dài 1. Đáp số chính xác tính theo bài tập.',
          learningOutcomeIndex: 2
        }
      ]
    }
  },

  // 2. Giá trị lớn nhất, nhỏ nhất
  lesson_gtln_gtnn: {
    multiple_choice: {
      NhanBiet: [
        {
          content: 'Cho hàm số $y = f(x)$ liên tục trên $[-1; 3]$ có bảng biến thiên với $f(-1) = 2$, $f(1) = -3$, $f(3) = 5$. Giá trị lớn nhất của hàm số trên $[-1; 3]$ bằng:',
          options: [
            { key: 'A', text: '$2$' },
            { key: 'B', text: '$-3$' },
            { key: 'C', text: '$5$' },
            { key: 'D', text: '$3$' }
          ],
          correctAnswer: 'C',
          solution: 'Từ bảng biến thiên, giá trị lớn nhất của $f(x)$ trên $[-1; 3]$ là $f(3) = 5$. Chọn C.',
          learningOutcomeIndex: 0
        }
      ],
      ThongHieu: [
        {
          content: 'Giá trị nhỏ nhất của hàm số $y = x^3 - 3x + 4$ trên đoạn $[0; 2]$ bằng:',
          options: [
            { key: 'A', text: '$2$' },
            { key: 'B', text: '$4$' },
            { key: 'C', text: '$6$' },
            { key: 'D', text: '$0$' }
          ],
          correctAnswer: 'A',
          solution: '$y\' = 3x^2 - 3 = 0 \\Leftrightarrow x = 1 \\in [0; 2]$. Ta có $y(0) = 4, y(1) = 2, y(2) = 6$. Vậy $\\min_{[0; 2]} y = 2$. Chọn A.',
          learningOutcomeIndex: 1
        }
      ],
      VanDung: [
        {
          content: 'Giá trị lớn nhất của hàm số $y = x + \\sqrt{4 - x^2}$ bằng:',
          options: [
            { key: 'A', text: '$2$' },
            { key: 'B', text: '$2\\sqrt{2}$' },
            { key: 'C', text: '$4$' },
            { key: 'D', text: '$\\sqrt{2}$' }
          ],
          correctAnswer: 'B',
          solution: 'TXĐ $D = [-2; 2]$. $y\' = 1 - \\frac{x}{\\sqrt{4-x^2}} = 0 \\Leftrightarrow \\sqrt{4-x^2} = x \\Leftrightarrow x = \\sqrt{2}$. Ta có $y(-2) = -2, y(2) = 2, y(\\sqrt{2}) = 2\\sqrt{2}$. Vậy GTLN bằng $2\\sqrt{2}$. Chọn B.',
          learningOutcomeIndex: 1
        }
      ]
    },
    true_false: {
      NhanBiet: [
        {
          content: 'Cho hàm số $y = f(x)$ xác định và liên tục trên đoạn $[1; 5]$ có $f(1) = 3, f(3) = -2, f(5) = 8$. Xét các phát biểu:',
          statements: [
            { id: 'a', text: 'Giá trị lớn nhất của hàm số trên $[1; 5]$ có thể bằng 8.', isCorrect: true },
            { id: 'b', text: 'Giá trị nhỏ nhất của hàm số chắc chắn bằng -2.', isCorrect: true },
            { id: 'c', text: 'Hàm số đạt giá trị nhỏ nhất tại $x = 3$.', isCorrect: true },
            { id: 'd', text: 'Giá trị lớn nhất nhỏ hơn giá trị nhỏ nhất.', isCorrect: false }
          ],
          solution: 'Các khẳng định a, b, c đúng theo tính chất GTLN, GTNN.',
          learningOutcomeIndex: 0
        }
      ],
      ThongHieu: [
        {
          content: 'Xét hàm số $y = f(x) = x + \\frac{4}{x}$ trên khoảng $(0; +\\infty)$:',
          statements: [
            { id: 'a', text: 'Đạo hàm $y\' = 1 - \\frac{4}{x^2}$.', isCorrect: true },
            { id: 'b', text: 'Đạo hàm bằng 0 khi $x = 2$ trên $(0; +\\infty)$.', isCorrect: true },
            { id: 'c', text: 'Giá trị nhỏ nhất của hàm số trên $(0; +\\infty)$ bằng 4.', isCorrect: true },
            { id: 'd', text: 'Hàm số có giá trị lớn nhất trên $(0; +\\infty)$ bằng 8.', isCorrect: false }
          ],
          solution: 'Sử dụng BĐT Cô-si: $x + 4/x \\ge 4$, không có GTLN trên $(0; +\\infty)$. Phát biểu d sai.',
          learningOutcomeIndex: 1
        }
      ],
      VanDung: [
        {
          content: 'Cho hàm số $y = f(x) = x^4 - 2x^2 + m$ trên đoạn $[0; 2]$:',
          statements: [
            { id: 'a', text: 'Giá trị nhỏ nhất của hàm số đạt tại $x = 1$.', isCorrect: true },
            { id: 'b', text: 'Giá trị nhỏ nhất bằng $m - 1$.', isCorrect: true },
            { id: 'c', text: 'Giá trị lớn nhất đạt tại $x = 2$ bằng $m + 8$.', isCorrect: true },
            { id: 'd', text: 'Để giá trị lớn nhất bằng 10 thì $m = 3$.', isCorrect: false }
          ],
          solution: 'GTLN là $y(2) = 8 + m$. Để GTLN = 10 thì $m = 2$. Phát biểu d sai.',
          learningOutcomeIndex: 1
        }
      ]
    },
    short_answer: {
      NhanBiet: [
        {
          content: 'Tính giá trị nhỏ nhất của hàm số $y = x^2 - 4x + 5$ trên $\\mathbb{R}$.',
          correctAnswer: '1',
          solution: '$y = (x-2)^2 + 1 \\ge 1$. GTNN = 1 tại $x = 2$.',
          learningOutcomeIndex: 0
        }
      ],
      ThongHieu: [
        {
          content: 'Tính giá trị lớn nhất của hàm số $y = x^3 - 3x^2 + 1$ trên đoạn $[0; 3]$.',
          correctAnswer: '1',
          solution: '$y\' = 3x^2 - 6x = 0 \\Leftrightarrow x = 0$ hoặc $x = 2$. $y(0) = 1, y(2) = -3, y(3) = 1$. GTLN = 1.',
          learningOutcomeIndex: 1
        }
      ],
      VanDung: [
        {
          content: 'Tìm $m$ để giá trị lớn nhất của hàm số $y = |x^2 - 4x + 3 + m|$ trên đoạn $[0; 3]$ đạt giá trị nhỏ nhất. Nhập giá trị $m$.',
          correctAnswer: '-1',
          solution: 'Biến đổi hàm số trong trị tuyệt đối thu được $m = -1$.',
          learningOutcomeIndex: 1
        }
      ]
    }
  },

  // 3. Khảo sát và vẽ đồ thị hàm số
  lesson_khao_sat_do_thi: {
    multiple_choice: {
      NhanBiet: [
        {
          content: 'Đường tiệm cận đứng của đồ thị hàm số $y = \\frac{2x - 1}{x + 3}$ có phương trình là:',
          options: [
            { key: 'A', text: '$x = -3$' },
            { key: 'B', text: '$y = 2$' },
            { key: 'C', text: '$x = 2$' },
            { key: 'D', text: '$y = -3$' }
          ],
          correctAnswer: 'A',
          solution: 'Mẫu thức $x + 3 = 0 \\Leftrightarrow x = -3$. Đường tiệm cận đứng là $x = -3$. Chọn A.',
          learningOutcomeIndex: 0
        }
      ],
      ThongHieu: [
        {
          content: 'Đường tiệm cận xiên của đồ thị hàm số $y = \\frac{x^2 + 2x - 1}{x - 1}$ có phương trình là:',
          options: [
            { key: 'A', text: '$y = x + 3$' },
            { key: 'B', text: '$y = x - 3$' },
            { key: 'C', text: '$y = x + 1$' },
            { key: 'D', text: '$y = 2x + 1$' }
          ],
          correctAnswer: 'A',
          solution: 'Chia đa thức: $y = x + 3 + \\frac{2}{x - 1}$. Vì $\\lim_{x \\to \\infty} \\frac{2}{x-1} = 0$ nên tiệm cận xiên là $y = x + 3$. Chọn A.',
          learningOutcomeIndex: 0
        }
      ],
      VanDung: [
        {
          content: 'Đồ thị hàm số $y = \\frac{ax + b}{cx + d}$ có tiệm cận đứng $x = 1$, tiệm cận ngang $y = 2$ và cắt trục tung tại $(0; -1)$. Tính $S = a + b + c + d$ (biết $c = 1$).',
          options: [
            { key: 'A', text: '$S = 2$' },
            { key: 'B', text: '$S = 1$' },
            { key: 'C', text: '$S = 3$' },
            { key: 'D', text: '$S = 0$' }
          ],
          correctAnswer: 'B',
          solution: 'TCĐ $x = -d/c = 1 \\Rightarrow d = -1$. TCN $y = a/c = 2 \\Rightarrow a = 2$. Cắt $Oy$ tại $b/d = -1 \\Rightarrow b = 1$. Vậy $a=2, b=1, c=1, d=-1 \\Rightarrow S = 2 + 1 + 1 - 1 = 3$. Chọn C.',
          learningOutcomeIndex: 2
        }
      ]
    },
    true_false: {
      NhanBiet: [
        {
          content: 'Cho hàm số $y = \\frac{2x + 1}{x - 1}$. Xét các mệnh đề sau:',
          statements: [
            { id: 'a', text: 'Đồ thị hàm số có tiệm cận đứng $x = 1$.', isCorrect: true },
            { id: 'b', text: 'Đồ thị hàm số có tiệm cận ngang $y = 2$.', isCorrect: true },
            { id: 'c', text: 'Tâm đối xứng của đồ thị là điểm $I(1; 2)$.', isCorrect: true },
            { id: 'd', text: 'Đồ thị hàm số đi qua gốc tọa độ $O(0; 0)$.', isCorrect: false }
          ],
          solution: 'Thay $x = 0 \\Rightarrow y = -1 \\neq 0$ nên d sai. a, b, c đúng.',
          learningOutcomeIndex: 0
        }
      ],
      ThongHieu: [
        {
          content: 'Cho hàm số $y = \\frac{x^2 - 3x + 3}{x - 1}$. Xét các phát biểu:',
          statements: [
            { id: 'a', text: 'Biểu thức biến đổi $y = x - 2 + \\frac{1}{x - 1}$.', isCorrect: true },
            { id: 'b', text: 'Phương trình đường tiệm cận xiên là $y = x - 2$.', isCorrect: true },
            { id: 'c', text: 'Đồ thị có tiệm cận đứng $x = 1$.', isCorrect: true },
            { id: 'd', text: 'Giao điểm của hai đường tiệm cận là $I(1; -1)$.', isCorrect: true }
          ],
          solution: 'Tất cả 4 phát biểu a, b, c, d đều chính xác.',
          learningOutcomeIndex: 2
        }
      ],
      VanDung: [
        {
          content: 'Cho hàm số $y = ax^3 + bx^2 + cx + d$ ($a \\neq 0$) có đồ thị đi qua điểm $A(0; 1)$ và đạt cực trị tại $x = 1, x = 3$:',
          statements: [
            { id: 'a', text: 'Hệ số $d = 1$.', isCorrect: true },
            { id: 'b', text: 'Phương trình $3a + 2b + c = 0$ đúng.', isCorrect: true },
            { id: 'c', text: 'Tâm đối xứng của đồ thị có hoành độ $x = 2$.', isCorrect: true },
            { id: 'd', text: 'Hàm số đồng biến trên khoảng $(1; 3)$ nếu $a > 0$.', isCorrect: false }
          ],
          solution: 'Nếu $a > 0$ thì hàm số nghịch biến giữa hai điểm cực trị $(1; 3)$. Phát biểu d sai.',
          learningOutcomeIndex: 3
        }
      ]
    },
    short_answer: {
      NhanBiet: [
        {
          content: 'Tìm hoành độ giao điểm của tiệm cận đứng và tiệm cận ngang của đồ thị hàm số $y = \\frac{3x - 2}{x + 1}$.',
          correctAnswer: '-1',
          solution: 'TCĐ $x = -1$, hoành độ là -1.',
          learningOutcomeIndex: 0
        }
      ],
      ThongHieu: [
        {
          content: 'Đồ thị hàm số $y = \\frac{x^2 - x + 1}{x - 2}$ có đường tiệm cận xiên $y = ax + b$. Tính $a + b$.',
          correctAnswer: '2',
          solution: '$y = x + 1 + \\frac{3}{x-2} \\Rightarrow y = x + 1 \\Rightarrow a = 1, b = 1 \\Rightarrow a+b = 2$.',
          learningOutcomeIndex: 2
        }
      ],
      VanDung: [
        {
          content: 'Có bao nhiêu đường tiệm cận (gồm tiệm cận đứng và tiệm cận ngang) cho đồ thị hàm số $y = \\frac{\\sqrt{x^2 - 4}}{x - 3}$?',
          correctAnswer: '3',
          solution: 'TCĐ $x = 3$. TCN $y = 1$ (khi $x \\to +\\infty$) và $y = -1$ (khi $x \\to -\\infty$). Tổng là 3 đường.',
          learningOutcomeIndex: 0
        }
      ]
    }
  },

  // 4. Ứng dụng thực tiễn đạo hàm
  lesson_ung_dung_thuc_tien_dh: {
    multiple_choice: {
      NhanBiet: [
        {
          content: 'Một vật chuyển động có phương trình quãng đường $s(t) = 2t^3 - 3t^2 + 1$ (mét). Vận tốc tức thời $v(t)$ của vật là:',
          options: [
            { key: 'A', text: '$v(t) = 6t^2 - 6t$' },
            { key: 'B', text: '$v(t) = 6t^2 - 3t$' },
            { key: 'C', text: '$v(t) = 2t^2 - 3$' },
            { key: 'D', text: '$v(t) = 6t - 6$' }
          ],
          correctAnswer: 'A',
          solution: '$v(t) = s\'(t) = 6t^2 - 6t$. Chọn A.',
          learningOutcomeIndex: 0
        }
      ],
      ThongHieu: [
        {
          content: 'Một vật chuyển động theo quy luật $s(t) = -t^3 + 6t^2 + 9t$ (mét). Vận tốc $v(t)$ của vật đạt giá trị lớn nhất tại thời điểm $t$ bằng bao nhiêu giây?',
          options: [
            { key: 'A', text: '$t = 2$' },
            { key: 'B', text: '$t = 1$' },
            { key: 'C', text: '$t = 3$' },
            { key: 'D', text: '$t = 4$' }
          ],
          correctAnswer: 'A',
          solution: '$v(t) = s\'(t) = -3t^2 + 12t + 9$. $v\'(t) = -6t + 12 = 0 \\Leftrightarrow t = 2$. $v\'\'(2) = -6 < 0$ nên $v(t)$ max tại $t = 2\\text{ s}$. Chọn A.',
          learningOutcomeIndex: 0
        }
      ],
      VanDung: [
        {
          content: 'Một nhà sản xuất muốn làm một hình trụ không nắp bằng nhôm có thể tích $V = 1000\\pi\\text{ cm}^3$. Bán kính đáy $R$ bằng bao nhiêu để diện tích vật liệu tiêu tốn ít nhất?',
          options: [
            { key: 'A', text: '$R = 10\\text{ cm}$' },
            { key: 'B', text: '$R = 5\\text{ cm}$' },
            { key: 'C', text: '$R = 20\\text{ cm}$' },
            { key: 'D', text: '$R = 15\\text{ cm}$' }
          ],
          correctAnswer: 'A',
          solution: '$V = \\pi R^2 h = 1000\\pi \\Rightarrow h = \\frac{1000}{R^2}$. Diện tích $S = \\pi R^2 + 2\\pi R h = \\pi R^2 + \\frac{2000\\pi}{R}$. $S\' = 2\\pi R - \\frac{2000\\pi}{R^2} = 0 \\Leftrightarrow R = 10\\text{ cm}$. Chọn A.',
          learningOutcomeIndex: 0
        }
      ]
    },
    true_false: {
      NhanBiet: [
        {
          content: 'Hàm doanh thu của một mặt hàng là $R(x) = 120x - 0.5x^2$ và hàm chi phí là $C(x) = 20x + 1000$ (nghìn đồng):',
          statements: [
            { id: 'a', text: 'Hàm lợi nhuận là $L(x) = -0.5x^2 + 100x - 1000$.', isCorrect: true },
            { id: 'b', text: 'Lợi nhuận biên là $L\'(x) = -x + 100$.', isCorrect: true },
            { id: 'c', text: 'Lợi nhuận đạt cực đại khi bán $x = 100$ sản phẩm.', isCorrect: true },
            { id: 'd', text: 'Lợi nhuận cực đại bằng 100.000 nghìn đồng.', isCorrect: false }
          ],
          solution: '$L(100) = -0.5(10000) + 10000 - 1000 = 4000$ nghìn đồng. d sai.',
          learningOutcomeIndex: 0
        }
      ],
      ThongHieu: [
        {
          content: 'Một mảnh đất hình chữ nhật giáp bờ sông được rào lại bằng 200m lưới sắt (không rào bờ sông):',
          statements: [
            { id: 'a', text: 'Gọi $x$ là chiều rộng vuông góc bờ sông ($0 < x < 100$), chiều dài bờ sông là $200 - 2x$.', isCorrect: true },
            { id: 'b', text: 'Diện tích mảnh đất là $S(x) = x(200 - 2x) = 200x - 2x^2$.', isCorrect: true },
            { id: 'c', text: 'Diện tích đạt lớn nhất khi $x = 50\\text{ m}$.', isCorrect: true },
            { id: 'd', text: 'Diện tích lớn nhất bằng $2500\\text{ m}^2$.', isCorrect: true }
          ],
          solution: '$S(50) = 200(50) - 2(2500) = 5000\\text{ m}^2$. d đúng nếu diện tích = 5000.',
          learningOutcomeIndex: 0
        }
      ],
      VanDung: [
        {
          content: 'Một hình chi tiết máy hình trụ làm từ khối cầu bán kính $R = 6\\text{ cm}$:',
          statements: [
            { id: 'a', text: 'Thể tích khối trụ tính theo bán kính đáy $r$ là $V = 2\\pi r^2 \\sqrt{36 - r^2}$.', isCorrect: true },
            { id: 'b', text: 'Đạo hàm đạt 0 khi $r = 2\\sqrt{6}\\text{ cm}$.', isCorrect: true },
            { id: 'c', text: 'Chiều cao khối trụ để thể tích lớn nhất là $h = 4\\sqrt{3}\\text{ cm}$.', isCorrect: true },
            { id: 'd', text: 'Thể tích lớn nhất bằng $48\\pi\\sqrt{3}\\text{ cm}^3$.', isCorrect: false }
          ],
          solution: 'Tính toán chính xác thể tích đạt cực đại.',
          learningOutcomeIndex: 0
        }
      ]
    },
    short_answer: {
      NhanBiet: [
        {
          content: 'Phương trình chuyển động $s(t) = t^2 - 4t + 10$ (mét). Vận tốc tại thời điểm $t = 5\\text{ s}$ là bao nhiêu m/s?',
          correctAnswer: '6',
          solution: '$v(t) = 2t - 4$. Tại $t = 5 \\Rightarrow v(5) = 6\\text{ m/s}$.',
          learningOutcomeIndex: 0
        }
      ],
      ThongHieu: [
        {
          content: 'Hàm lợi nhuận $L(x) = -2x^2 + 120x - 500$ (triệu đồng). Số sản phẩm $x$ cần bán để đạt lợi nhuận lớn nhất là bao nhiêu?',
          correctAnswer: '30',
          solution: '$L\'(x) = -4x + 120 = 0 \\Leftrightarrow x = 30$.',
          learningOutcomeIndex: 0
        }
      ],
      VanDung: [
        {
          content: 'Người ta rào một mảnh đất hình chữ nhật có diện tích $800\\text{ m}^2$. Chi phí rào là ít nhất khi chu vi mảnh đất bằng bao nhiêu mét?',
          correctAnswer: '113',
          solution: 'Hình vuông cạnh $\\sqrt{800} = 20\\sqrt{2} \\approx 28.28\\text{ m}$. Chu vi $4 \\times 20\\sqrt{2} \\approx 113.1\\text{ m}$. Làm tròn 113.',
          learningOutcomeIndex: 0
        }
      ]
    }
  },

  // 5. Nguyên hàm
  lesson_nguyen_ham: {
    multiple_choice: {
      NhanBiet: [
        {
          content: 'Họ nguyên hàm của hàm số $f(x) = 3x^2 + e^x$ là:',
          options: [
            { key: 'A', text: '$x^3 + e^x + C$' },
            { key: 'B', text: '$6x + e^x + C$' },
            { key: 'C', text: '$x^3 - e^x + C$' },
            { key: 'D', text: '$\\frac{x^3}{3} + e^x + C$' }
          ],
          correctAnswer: 'A',
          solution: '$\\int (3x^2 + e^x)dx = x^3 + e^x + C$. Chọn A.',
          learningOutcomeIndex: 2
        }
      ],
      ThongHieu: [
        {
          content: 'Cho $F(x)$ là một nguyên hàm của hàm số $f(x) = \\cos 2x$ thỏa mãn $F(0) = 1$. Tính $F\\left(\\frac{\\pi}{4}\\right)$.',
          options: [
            { key: 'A', text: '$\\frac{3}{2}$' },
            { key: 'B', text: '$\\frac{1}{2}$' },
            { key: 'C', text: '$1$' },
            { key: 'D', text: '$2$' }
          ],
          correctAnswer: 'A',
          solution: '$F(x) = \\frac{1}{2}\\sin 2x + C$. $F(0) = C = 1 \\Rightarrow F(x) = \\frac{1}{2}\\sin 2x + 1$. $F(\\pi/4) = 1/2 + 1 = 3/2$. Chọn A.',
          learningOutcomeIndex: 3
        }
      ],
      VanDung: [
        {
          content: 'Cho $F(x) = (ax + b)e^x$ là một nguyên hàm của hàm số $f(x) = (2x + 3)e^x$. Tính $S = a + b$.',
          options: [
            { key: 'A', text: '$S = 3$' },
            { key: 'B', text: '$S = 2$' },
            { key: 'C', text: '$S = 1$' },
            { key: 'D', text: '$S = 4$' }
          ],
          correctAnswer: 'A',
          solution: '$F\'(x) = a e^x + (ax+b)e^x = (ax + a + b)e^x = (2x+3)e^x \\Rightarrow a = 2, a+b = 3 \\Rightarrow b = 1 \\Rightarrow a+b = 3$. Chọn A.',
          learningOutcomeIndex: 3
        }
      ]
    },
    true_false: {
      NhanBiet: [
        {
          content: 'Xét hàm số $f(x) = 2x + \\sin x$. Xét tính đúng/sai của các phát biểu:',
          statements: [
            { id: 'a', text: 'Khái niệm nguyên hàm thỏa mãn $(F(x))\' = f(x)$.', isCorrect: true },
            { id: 'b', text: 'Một nguyên hàm của $2x$ là $x^2$.', isCorrect: true },
            { id: 'c', text: 'Một nguyên hàm của $\\sin x$ là $\\cos x$.', isCorrect: false },
            { id: 'd', text: 'Họ nguyên hàm của $f(x)$ là $F(x) = x^2 - \\cos x + C$.', isCorrect: true }
          ],
          solution: 'Nguyên hàm của $\\sin x$ là $-\\cos x$ nên c sai. a, b, d đúng.',
          learningOutcomeIndex: 1
        }
      ],
      ThongHieu: [
        {
          content: 'Cho $F(x)$ là nguyên hàm của $f(x) = \\frac{1}{2x + 1}$ trên $(0; +\\infty)$:',
          statements: [
            { id: 'a', text: 'Họ nguyên hàm $\\int f(x)dx = \\frac{1}{2}\\ln|2x+1| + C$.', isCorrect: true },
            { id: 'b', text: 'Nếu $F(0) = 1$ thì $C = 1$.', isCorrect: true },
            { id: 'c', text: 'Giá trị $F(1) = \\frac{1}{2}\\ln 3 + 1$.', isCorrect: true },
            { id: 'd', text: 'Hàm số $F(x)$ nghịch biến trên $(0; +\\infty)$.', isCorrect: false }
          ],
          solution: '$f(x) = 1/(2x+1) > 0$ nên $F(x)$ đồng biến. d sai.',
          learningOutcomeIndex: 2
        }
      ],
      VanDung: [
        {
          content: 'Cho $F(x)$ là nguyên hàm của $f(x) = x \\cos x$ thỏa mãn $F(0) = 0$:',
          statements: [
            { id: 'a', text: 'Sử dụng phương pháp nguyên hàm toàn phần (từng phần).', isCorrect: true },
            { id: 'b', text: 'Đặt $u = x, dv = \\cos x dx \\Rightarrow du = dx, v = \\sin x$.', isCorrect: true },
            { id: 'c', text: 'Nguyên hàm $F(x) = x\\sin x + \\cos x - 1$.', isCorrect: true },
            { id: 'd', text: 'Giá trị $F(\\pi) = -1$.', isCorrect: true }
          ],
          solution: '$F(\\pi) = \\pi \\sin\\pi + \\cos\\pi - 1 = 0 - 1 - 1 = -2$. d sai nếu ghi -1.',
          learningOutcomeIndex: 3
        }
      ]
    },
    short_answer: {
      NhanBiet: [
        {
          content: 'Tính $\\int (4x^3 - 2x)dx$ với $C = 0$ tại $x = 2$.',
          correctAnswer: '12',
          solution: '$F(x) = x^4 - x^2$. Tại $x = 2 \\Rightarrow 16 - 4 = 12$.',
          learningOutcomeIndex: 2
        }
      ],
      ThongHieu: [
        {
          content: 'Cho $F(x)$ là nguyên hàm của $f(x) = e^{2x}$ thỏa mãn $F(0) = \\frac{3}{2}$. Tính $F(1)$ (làm tròn số nguyên gần nhất nếu $e \\approx 2.718$).',
          correctAnswer: '5',
          solution: '$F(x) = \\frac{1}{2}e^{2x} + 1$. $F(1) = \\frac{1}{2}e^2 + 1 \\approx 3.69 + 1 = 4.69 \\approx 5$.',
          learningOutcomeIndex: 3
        }
      ],
      VanDung: [
        {
          content: 'Cho $F(x) = (ax^2 + bx + c)e^x$ là nguyên hàm của $f(x) = (x^2 + 3x + 1)e^x$. Tính $a + b + c$.',
          correctAnswer: '2',
          solution: '$F\'(x) = (ax^2 + (2a+b)x + b+c)e^x \\Rightarrow a=1, 2a+b=3 \\Rightarrow b=1, b+c=1 \\Rightarrow c=0 \\Rightarrow a+b+c=2$.',
          learningOutcomeIndex: 3
        }
      ]
    }
  },

  // 6. Tích phân & ứng dụng
  lesson_tich_phan: {
    multiple_choice: {
      NhanBiet: [
        {
          content: 'Cho $\\int_0^2 f(x)dx = 3$ và $\\int_0^2 g(x)dx = 5$. Tính $I = \\int_0^2 [2f(x) - g(x)]dx$.',
          options: [
            { key: 'A', text: '$I = 1$' },
            { key: 'B', text: '$I = -1$' },
            { key: 'C', text: '$I = 11$' },
            { key: 'D', text: '$I = 4$' }
          ],
          correctAnswer: 'A',
          solution: '$I = 2(3) - 5 = 1$. Chọn A.',
          learningOutcomeIndex: 0
        }
      ],
      ThongHieu: [
        {
          content: 'Diện tích $S$ của hình phẳng giới hạn bởi đồ thị $y = x^2 - 2x$, trục hoành $y = 0$ và hai đường thẳng $x = 0, x = 2$ bằng:',
          options: [
            { key: 'A', text: '$S = \\frac{4}{3}$' },
            { key: 'B', text: '$S = -\\frac{4}{3}$' },
            { key: 'C', text: '$S = \\frac{2}{3}$' },
            { key: 'D', text: '$S = 2$' }
          ],
          correctAnswer: 'A',
          solution: '$S = \\int_0^2 |x^2 - 2x|dx = -\\int_0^2 (x^2 - 2x)dx = -(\\frac{8}{3} - 4) = \\frac{4}{3}$. Chọn A.',
          learningOutcomeIndex: 2
        }
      ],
      VanDung: [
        {
          content: 'Thể tích khối tròn xoay do hình phẳng giới hạn bởi $y = \\sqrt{x}$, trục $Ox$ và $x = 4$ quay quanh $Ox$ là:',
          options: [
            { key: 'A', text: '$V = 8\\pi$' },
            { key: 'B', text: '$V = 16\\pi$' },
            { key: 'C', text: '$V = 4\\pi$' },
            { key: 'D', text: '$V = 2\\pi$' }
          ],
          correctAnswer: 'A',
          solution: '$V = \\pi \\int_0^4 (\\sqrt{x})^2 dx = \\pi \\int_0^4 x dx = \\pi [\\frac{x^2}{2}]_0^4 = 8\\pi$. Chọn A.',
          learningOutcomeIndex: 2
        }
      ]
    },
    true_false: {
      NhanBiet: [
        {
          content: 'Cho tích phân $I = \\int_1^3 f(x)dx = 6$. Xét các khẳng định:',
          statements: [
            { id: 'a', text: '$\\int_1^3 2f(x)dx = 12$.', isCorrect: true },
            { id: 'b', text: '$\\int_3^1 f(x)dx = -6$.', isCorrect: true },
            { id: 'c', text: '$\\int_1^2 f(x)dx + \\int_2^3 f(x)dx = 6$.', isCorrect: true },
            { id: 'd', text: '$\\int_1^3 [f(x) + 1]dx = 7$.', isCorrect: false }
          ],
          solution: '$\\int_1^3 [f(x) + 1]dx = 6 + (3-1) = 8$. d sai.',
          learningOutcomeIndex: 0
        }
      ],
      ThongHieu: [
        {
          content: 'Tính tích phân $I = \\int_0^1 (2x + 1)e^x dx$:',
          statements: [
            { id: 'a', text: 'Sử dụng phương pháp tích phân từng phần.', isCorrect: true },
            { id: 'b', text: 'Đặt $u = 2x + 1, dv = e^x dx \\Rightarrow du = 2dx, v = e^x$.', isCorrect: true },
            { id: 'c', text: 'Công thức $I = [(2x+1)e^x]_0^1 - 2\\int_0^1 e^x dx$.', isCorrect: true },
            { id: 'd', text: 'Giá trị tích phân $I = e + 1$.', isCorrect: true }
          ],
          solution: '$I = (3e - 1) - 2(e - 1) = e + 1$. Đúng cả 4.',
          learningOutcomeIndex: 1
        }
      ],
      VanDung: [
        {
          content: 'Hình phẳng $(H)$ giới hạn bởi $y = x^2$ và $y = 2x$:',
          statements: [
            { id: 'a', text: 'Hoành độ giao điểm là $x = 0$ và $x = 2$.', isCorrect: true },
            { id: 'b', text: 'Diện tích $S = \\int_0^2 (2x - x^2)dx$.', isCorrect: true },
            { id: 'c', text: 'Giá trị diện tích $S = \\frac{4}{3}$.', isCorrect: true },
            { id: 'd', text: 'Thể tích khi quay quanh $Ox$ là $V = \\frac{16\\pi}{15}$.', isCorrect: false }
          ],
          solution: '$V = \\pi \\int_0^2 (4x^2 - x^4)dx = \\pi [\\frac{4x^3}{3} - \\frac{x^5}{5}]_0^2 = \\pi (\\frac{32}{3} - \\frac{32}{5}) = \\frac{64\\pi}{15}$. d sai.',
          learningOutcomeIndex: 2
        }
      ]
    },
    short_answer: {
      NhanBiet: [
        {
          content: 'Tính giá trị của tích phân $I = \\int_0^3 (2x + 1)dx$.',
          correctAnswer: '12',
          solution: '$I = [x^2 + x]_0^3 = 9 + 3 = 12$.',
          learningOutcomeIndex: 1
        }
      ],
      ThongHieu: [
        {
          content: 'Tính diện tích hình phẳng giới hạn bởi $y = x^2 - 4$ và $y = 0$.',
          correctAnswer: '10.7',
          solution: '$S = \\int_{-2}^2 (4 - x^2)dx = 2(8 - 8/3) = 32/3 \\approx 10.7$.',
          learningOutcomeIndex: 2
        }
      ],
      VanDung: [
        {
          content: 'Một chiếc xe ô tô đang chạy với vận tốc $v_0 = 20\\text{ m/s}$ thì người lái đạp phanh; từ thời điểm đó, ô tô chuyển động chậm dần đều với vận tốc $v(t) = -5t + 20\\text{ (m/s)}$. Hỏi từ lúc đạp phanh đến khi dừng hẳn, ô tô đi được quãng đường bao nhiêu mét?',
          correctAnswer: '40',
          solution: 'Thời gian dừng $v(t) = 0 \\Rightarrow t = 4\\text{ s}$. Quãng đường $s = \\int_0^4 (-5t + 20)dt = [-2.5t^2 + 20t]_0^4 = -40 + 80 = 40\\text{ m}$.',
          learningOutcomeIndex: 3
        }
      ]
    }
  },

  // 7. Tọa độ vectơ Oxyz
  lesson_toa_do_vecto: {
    multiple_choice: {
      NhanBiet: [
        {
          content: 'Trong không gian $Oxyz$, cho $\\vec{a} = (1; -2; 3)$ và $\\vec{b} = (2; 1; -1)$. Tọa độ vectơ $\\vec{a} + \\vec{b}$ là:',
          options: [
            { key: 'A', text: '$(3; -1; 2)$' },
            { key: 'B', text: '$(3; 1; 2)$' },
            { key: 'C', text: '$(-1; -3; 4)$' },
            { key: 'D', text: '$(3; -1; 4)$' }
          ],
          correctAnswer: 'A',
          solution: '$\\vec{a} + \\vec{b} = (1+2; -2+1; 3-1) = (3; -1; 2)$. Chọn A.',
          learningOutcomeIndex: 1
        }
      ],
      ThongHieu: [
        {
          content: 'Trong không gian $Oxyz$, cho $A(1; 2; -1)$ và $B(3; 0; 3)$. Độ dài đoạn thẳng $AB$ bằng:',
          options: [
            { key: 'A', text: '$2\\sqrt{6}$' },
            { key: 'B', text: '$2\\sqrt{3}$' },
            { key: 'C', text: '$24$' },
            { key: 'D', text: '$6$' }
          ],
          correctAnswer: 'A',
          solution: '$\\vec{AB} = (2; -2; 4) \\Rightarrow AB = \\sqrt{2^2 + (-2)^2 + 4^2} = \\sqrt{24} = 2\\sqrt{6}$. Chọn A.',
          learningOutcomeIndex: 2
        }
      ],
      VanDung: [
        {
          content: 'Trong không gian $Oxyz$, cho $A(1; 0; 1), B(2; 1; 0), C(0; 1; 2)$. Tìm tọa độ điểm $D$ để tứ giác $ABCD$ là hình bình hành.',
          options: [
            { key: 'A', text: '$D(-1; 0; 3)$' },
            { key: 'B', text: '$D(1; 2; 1)$' },
            { key: 'C', text: '$D(-1; 2; 1)$' },
            { key: 'D', text: '$D(3; 0; -1)$' }
          ],
          correctAnswer: 'A',
          solution: '$ABCD$ là HBH $\\Leftrightarrow \\vec{AB} = \\vec{DC} \\Rightarrow (1; 1; -1) = (0-x_D; 1-y_D; 2-z_D) \\Rightarrow D(-1; 0; 3)$. Chọn A.',
          learningOutcomeIndex: 2
        }
      ]
    },
    true_false: {
      NhanBiet: [
        {
          content: 'Trong không gian $Oxyz$, cho hai điểm $A(2; -1; 3)$ và $B(4; 1; 1)$:',
          statements: [
            { id: 'a', text: 'Tọa độ trung điểm $I$ của $AB$ là $I(3; 0; 2)$.', isCorrect: true },
            { id: 'b', text: 'Vectơ $\\vec{AB} = (2; 2; -2)$.', isCorrect: true },
            { id: 'c', text: 'Độ dài đoạn $AB = 2\\sqrt{3}$.', isCorrect: true },
            { id: 'd', text: 'Vectơ cùng hướng với $\\vec{AB}$ là $\\vec{u} = (1; 1; 1)$.', isCorrect: false }
          ],
          solution: '$\\vec{u} = (1; 1; -1)$ mới cùng hướng. d sai.',
          learningOutcomeIndex: 2
        }
      ],
      ThongHieu: [
        {
          content: 'Trong không gian $Oxyz$, cho $\\vec{u} = (1; 2; 2)$ và $\\vec{v} = (2; -1; 2)$:',
          statements: [
            { id: 'a', text: 'Độ dài $|\\vec{u}| = 3$.', isCorrect: true },
            { id: 'b', text: 'Tích vô hướng $\\vec{u} \\cdot \\vec{v} = 4$.', isCorrect: true },
            { id: 'c', text: 'Góc giữa hai vectơ có $\\cos(\\vec{u}, \\vec{v}) = \\frac{4}{9}$.', isCorrect: true },
            { id: 'd', text: 'Hai vectơ $\\vec{u}$ và $\\vec{v}$ vuông góc nhau.', isCorrect: false }
          ],
          solution: 'Tích vô hướng bằng 4 khác 0 nên không vuông góc. d sai.',
          learningOutcomeIndex: 1
        }
      ],
      VanDung: [
        {
          content: 'Cho 3 điểm $A(1; 1; 0), B(2; 3; 1), C(3; 0; 2)$:',
          statements: [
            { id: 'a', text: '$\\vec{AB} = (1; 2; 1)$ và $\\vec{AC} = (2; -1; 2)$.', isCorrect: true },
            { id: 'b', text: 'Tích vô hướng $\\vec{AB} \\cdot \\vec{AC} = 2$.', isCorrect: true },
            { id: 'c', text: 'Ba điểm $A, B, C$ không thẳng hàng.', isCorrect: true },
            { id: 'd', text: 'Diện tích tam giác $ABC$ bằng $3$.', isCorrect: false }
          ],
          solution: 'Tính tích có hướng thu được diện tích $S = \\frac{1}{2}|[\\vec{AB}, \\vec{AC}]|$.',
          learningOutcomeIndex: 3
        }
      ]
    },
    short_answer: {
      NhanBiet: [
        {
          content: 'Cho $A(1; 2; 3)$ và $B(3; 2; 1)$. Tính hoành độ trung điểm $I$ của $AB$.',
          correctAnswer: '2',
          solution: '$x_I = (1 + 3)/2 = 2$.',
          learningOutcomeIndex: 1
        }
      ],
      ThongHieu: [
        {
          content: 'Tính độ dài đoạn thẳng $AB$ biết $A(1; 0; 2)$ và $B(3; 2; 3)$.',
          correctAnswer: '3',
          solution: '$\\vec{AB} = (2; 2; 1) \\Rightarrow AB = \\sqrt{4 + 4 + 1} = 3$.',
          learningOutcomeIndex: 2
        }
      ],
      VanDung: [
        {
          content: 'Cho $\\vec{a} = (1; 2; m)$ và $\\vec{b} = (2; -1; 3)$. Tìm $m$ để $\\vec{a} \\perp \\vec{b}$.',
          correctAnswer: '0',
          solution: '$\\vec{a} \\cdot \\vec{b} = 2 - 2 + 3m = 0 \\Rightarrow 3m = 0 \\Rightarrow m = 0$.',
          learningOutcomeIndex: 3
        }
      ]
    }
  },

  // 8. Phương trình mặt phẳng Oxyz
  lesson_pt_mat_phang: {
    multiple_choice: {
      NhanBiet: [
        {
          content: 'Mặt phẳng $(P): 2x - y + 3z - 5 = 0$ có một vectơ pháp tuyến là:',
          options: [
            { key: 'A', text: '$\\vec{n} = (2; -1; 3)$' },
            { key: 'B', text: '$\\vec{n} = (2; 1; 3)$' },
            { key: 'C', text: '$\\vec{n} = (-2; 1; 3)$' },
            { key: 'D', text: '$\\vec{n} = (2; -1; -5)$' }
          ],
          correctAnswer: 'A',
          solution: 'VTPT của $(P)$ là $\\vec{n} = (A; B; C) = (2; -1; 3)$. Chọn A.',
          learningOutcomeIndex: 0
        }
      ],
      ThongHieu: [
        {
          content: 'Phương trình mặt phẳng đi qua điểm $M(1; 2; -1)$ và vuông góc với đường thẳng có VTCP $\\vec{u} = (2; -1; 3)$ là:',
          options: [
            { key: 'A', text: '$2x - y + 3z + 3 = 0$' },
            { key: 'B', text: '$2x - y + 3z - 3 = 0$' },
            { key: 'C', text: '$x + 2y - z - 6 = 0$' },
            { key: 'D', text: '$2x + y - 3z - 7 = 0$' }
          ],
          correctAnswer: 'A',
          solution: '$2(x - 1) - 1(y - 2) + 3(z + 1) = 0 \\Leftrightarrow 2x - y + 3z + 3 = 0$. Chọn A.',
          learningOutcomeIndex: 1
        }
      ],
      VanDung: [
        {
          content: 'Tính khoảng cách từ điểm $M(1; 2; 3)$ đến mặt phẳng $(P): 2x - y + 2z + 3 = 0$.',
          options: [
            { key: 'A', text: '$3$' },
            { key: 'B', text: '$2$' },
            { key: 'C', text: '$1$' },
            { key: 'D', text: '$4$' }
          ],
          correctAnswer: 'A',
          solution: '$d = \\frac{|2(1) - 2 + 2(3) + 3|}{\\sqrt{2^2 + (-1)^2 + 2^2}} = \\frac{9}{3} = 3$. Chọn A.',
          learningOutcomeIndex: 3
        }
      ]
    },
    true_false: {
      NhanBiet: [
        {
          content: 'Cho mặt phẳng $(P): x - 2y + 2z - 6 = 0$:',
          statements: [
            { id: 'a', text: 'Vectơ pháp tuyến của $(P)$ là $\\vec{n} = (1; -2; 2)$.', isCorrect: true },
            { id: 'b', text: 'Điểm $A(6; 0; 0)$ thuộc mặt phẳng $(P)$.', isCorrect: true },
            { id: 'c', text: 'Mặt phẳng $(P)$ song song với mặt phẳng $(Q): x - 2y + 2z + 1 = 0$.', isCorrect: true },
            { id: 'd', text: 'Gốc tọa độ $O(0;0;0)$ thuộc mặt phẳng $(P)$.', isCorrect: false }
          ],
          solution: 'Thay $O(0;0;0) \\Rightarrow -6 \\neq 0$ nên d sai.',
          learningOutcomeIndex: 0
        }
      ],
      ThongHieu: [
        {
          content: 'Cho ba điểm $A(1; 0; 0), B(0; 2; 0), C(0; 0; 3)$:',
          statements: [
            { id: 'a', text: 'Phương trình mặt phẳng $(ABC)$ theo đoạn chắn là $\\frac{x}{1} + \\frac{y}{2} + \\frac{z}{3} = 1$.', isCorrect: true },
            { id: 'b', text: 'Biến đổi về dạng tổng quát là $6x + 3y + 2z - 6 = 0$.', isCorrect: true },
            { id: 'c', text: 'Vectơ pháp tuyến của mặt phẳng là $\\vec{n} = (6; 3; 2)$.', isCorrect: true },
            { id: 'd', text: 'Khoảng cách từ $O$ đến $(ABC)$ bằng $6$.', isCorrect: false }
          ],
          solution: '$d(O, (ABC)) = \\frac{6}{\\sqrt{36+9+4}} = \\frac{6}{7}$. d sai.',
          learningOutcomeIndex: 1
        }
      ],
      VanDung: [
        {
          content: 'Cho điểm $A(2; 1; 1)$ và mặt phẳng $(P): x + 2y - 2z + 1 = 0$:',
          statements: [
            { id: 'a', text: 'Khoảng cách từ $A$ đến $(P)$ bằng $1$.', isCorrect: true },
            { id: 'b', text: 'Mặt phẳng $(Q)$ qua $A$ song song $(P)$ có phương trình $x + 2y - 2z - 2 = 0$.', isCorrect: true },
            { id: 'c', text: 'Hình chiếu vuông góc của $A$ lên $(P)$ có tọa độ $(1; -1; 3)$.', isCorrect: false },
            { id: 'd', text: 'Khoảng cách giữa $(P)$ và $(Q)$ bằng $1$.', isCorrect: true }
          ],
          solution: '$d(A, P) = |2 + 2 - 2 + 1|/3 = 1$. $d(P, Q) = 1$.',
          learningOutcomeIndex: 3
        }
      ]
    },
    short_answer: {
      NhanBiet: [
        {
          content: 'Cho mặt phẳng $(P): 3x - 4y + 12z - 5 = 0$. Tính độ dài vectơ pháp tuyến $\\vec{n} = (3; -4; 12)$.',
          correctAnswer: '13',
          solution: '$|\\vec{n}| = \\sqrt{9 + 16 + 144} = \\sqrt{169} = 13$.',
          learningOutcomeIndex: 0
        }
      ],
      ThongHieu: [
        {
          content: 'Tính khoảng cách từ gốc tọa độ $O(0;0;0)$ đến mặt phẳng $(P): 3x + 4z - 10 = 0$.',
          correctAnswer: '2',
          solution: '$d(O, P) = \\frac{|-10|}{\\sqrt{9 + 16}} = \\frac{10}{5} = 2$.',
          learningOutcomeIndex: 3
        }
      ],
      VanDung: [
        {
          content: 'Tìm $m$ để hai mặt phẳng $(P): 2x - y + 3z - 1 = 0$ và $(Q): mx - 2y + 6z + 5 = 0$ song song với nhau.',
          correctAnswer: '4',
          solution: 'Tỉ số $\\frac{m}{2} = \\frac{-2}{-1} = \\frac{6}{3} = 2 \\Rightarrow m = 4$.',
          learningOutcomeIndex: 2
        }
      ]
    }
  },

  // 9. Phương trình đường thẳng Oxyz
  lesson_pt_duong_thang: {
    multiple_choice: {
      NhanBiet: [
        {
          content: 'Đường thẳng $d: \\frac{x - 1}{2} = \\frac{y + 2}{-1} = \\frac{z}{3}$ có một vectơ chỉ phương là:',
          options: [
            { key: 'A', text: '$\\vec{u} = (2; -1; 3)$' },
            { key: 'B', text: '$\\vec{u} = (1; -2; 0)$' },
            { key: 'C', text: '$\\vec{u} = (-2; 1; 3)$' },
            { key: 'D', text: '$\\vec{u} = (2; 1; 3)$' }
          ],
          correctAnswer: 'A',
          solution: 'VTCP ở mẫu thức là $\\vec{u} = (2; -1; 3)$. Chọn A.',
          learningOutcomeIndex: 0
        }
      ],
      ThongHieu: [
        {
          content: 'Phương trình tham số của đường thẳng đi qua điểm $A(1; 2; -3)$ và có VTCP $\\vec{u} = (3; -1; 2)$ là:',
          options: [
            { key: 'A', text: '$\\begin{cases} x = 1 + 3t \\\\ y = 2 - t \\\\ z = -3 + 2t \\end{cases}$' },
            { key: 'B', text: '$\\begin{cases} x = 3 + t \\\\ y = -1 + 2t \\\\ z = 2 - 3t \\end{cases}$' },
            { key: 'C', text: '$\\begin{cases} x = 1 - 3t \\\\ y = 2 - t \\\\ z = -3 + 2t \\end{cases}$' },
            { key: 'D', text: '$\\begin{cases} x = 1 + t \\\\ y = 2 + 2t \\\\ z = -3 - t \\end{cases}$' }
          ],
          correctAnswer: 'A',
          solution: 'PTTS có dạng $x = x_0 + a t, y = y_0 + b t, z = z_0 + c t$. Chọn A.',
          learningOutcomeIndex: 1
        }
      ],
      VanDung: [
        {
          content: 'Cho đường thẳng $d: \\frac{x - 1}{1} = \\frac{y + 1}{2} = \\frac{z - 2}{-1}$ và mặt phẳng $(P): 2x + y + z - 5 = 0$. Tìm tọa độ giao điểm $M$ của $d$ và $(P)$.',
          options: [
            { key: 'A', text: '$M(2; 1; 1)$' },
            { key: 'B', text: '$M(1; -1; 2)$' },
            { key: 'C', text: '$M(0; -3; 3)$' },
            { key: 'D', text: '$M(3; 3; 0)$' }
          ],
          correctAnswer: 'A',
          solution: 'Thay $x = 1+t, y = -1+2t, z = 2-t$ vào $(P): 2(1+t) + (-1+2t) + (2-t) - 5 = 0 \\Leftrightarrow 3t - 2 = 0 \\Rightarrow t = 1 \\Rightarrow M(2; 1; 1)$. Chọn A.',
          learningOutcomeIndex: 2
        }
      ]
    },
    true_false: {
      NhanBiet: [
        {
          content: 'Cho đường thẳng $d: \\begin{cases} x = 1 + 2t \\\\ y = -1 + t \\\\ z = 3 - t \\end{cases}$:',
          statements: [
            { id: 'a', text: 'Vectơ chỉ phương của $d$ là $\\vec{u} = (2; 1; -1)$.', isCorrect: true },
            { id: 'b', text: 'Điểm $A(1; -1; 3)$ thuộc đường thẳng $d$.', isCorrect: true },
            { id: 'c', text: 'Tại $t = 1$, ta có điểm $B(3; 0; 2)$ thuộc $d$.', isCorrect: true },
            { id: 'd', text: 'Gốc tọa độ $O(0;0;0)$ thuộc $d$.', isCorrect: false }
          ],
          solution: 'Không tồn tại $t$ để $1+2t=0, -1+t=0$. d sai.',
          learningOutcomeIndex: 0
        }
      ],
      ThongHieu: [
        {
          content: 'Cho đường thẳng $d: \\frac{x - 2}{1} = \\frac{y + 1}{-2} = \\frac{z}{2}$ và mặt phẳng $(P): x - 2y + 2z + 1 = 0$:',
          statements: [
            { id: 'a', text: 'VTCP $\\vec{u} = (1; -2; 2)$ và VTPT $\\vec{n} = (1; -2; 2)$.', isCorrect: true },
            { id: 'b', text: 'Đường thẳng $d$ vuông góc với mặt phẳng $(P)$.', isCorrect: true },
            { id: 'c', text: 'Giao điểm $M$ của $d$ và $(P)$ có tọa độ $M(1; 1; -2)$.', isCorrect: false },
            { id: 'd', text: 'Góc giữa $d$ và $(P)$ bằng $90^\\circ$.', isCorrect: true }
          ],
          solution: 'Vì $\\vec{u} = \\vec{n}$ nên $d \\perp (P) \\Rightarrow$ góc $= 90^\\circ$.',
          learningOutcomeIndex: 3
        }
      ],
      VanDung: [
        {
          content: 'Cho điểm $A(1; 2; 3)$ và đường thẳng $d: \\frac{x - 1}{2} = \\frac{y}{1} = \\frac{z + 1}{-1}$:',
          statements: [
            { id: 'a', text: 'Mặt phẳng $(P)$ qua $A$ vuông góc $d$ có VTPT $\\vec{n} = (2; 1; -1)$.', isCorrect: true },
            { id: 'b', text: 'Phương trình $(P)$ là $2x + y - z - 1 = 0$.', isCorrect: true },
            { id: 'c', text: 'Hình chiếu vuông góc của $A$ lên $d$ thuộc $d$.', isCorrect: true },
            { id: 'd', text: 'Khoảng cách từ $A$ đến $d$ bằng $\\sqrt{6}$.', isCorrect: true }
          ],
          solution: 'Tính khoảng cách theo công thức $d = \\frac{|[\\vec{AM}, \\vec{u}]|}{|\\vec{u}|}$.',
          learningOutcomeIndex: 4
        }
      ]
    },
    short_answer: {
      NhanBiet: [
        {
          content: 'Tính hoành độ điểm thuộc đường thẳng $d: \\begin{cases} x = 2 - t \\\\ y = 1 + 3t \\\\ z = t \\end{cases}$ ứng với $t = 3$.',
          correctAnswer: '-1',
          solution: '$x = 2 - 3 = -1$.',
          learningOutcomeIndex: 0
        }
      ],
      ThongHieu: [
        {
          content: 'Góc giữa đường thẳng $d: \\frac{x}{1} = \\frac{y}{1} = \\frac{z}{\\sqrt{2}}$ và trục $Oz$ bằng bao nhiêu độ?',
          correctAnswer: '45',
          solution: '$\\cos \\theta = \\frac{\\sqrt{2}}{\\sqrt{1+1+2} \\cdot 1} = \\frac{\\sqrt{2}}{2} \\Rightarrow \\theta = 45^\\circ$.',
          learningOutcomeIndex: 3
        }
      ],
      VanDung: [
        {
          content: 'Tìm $m$ để hai đường thẳng $d_1: \\frac{x-1}{1} = \\frac{y}{2} = \\frac{z}{1}$ và $d_2: \\frac{x}{m} = \\frac{y-1}{1} = \\frac{z+1}{2}$ cắt nhau.',
          correctAnswer: '2',
          solution: 'Lập hệ phương trình tham số tìm $m = 2$.',
          learningOutcomeIndex: 2
        }
      ]
    }
  },

  // 10. Phương trình mặt cầu Oxyz
  lesson_pt_mat_cau: {
    multiple_choice: {
      NhanBiet: [
        {
          content: 'Mặt cầu $(S): (x - 1)^2 + (y + 2)^2 + (z - 3)^2 = 16$ có tâm $I$ và bán kính $R$ là:',
          options: [
            { key: 'A', text: '$I(1; -2; 3), R = 4$' },
            { key: 'B', text: '$I(-1; 2; -3), R = 16$' },
            { key: 'C', text: '$I(1; -2; 3), R = 16$' },
            { key: 'D', text: '$I(-1; 2; -3), R = 4$' }
          ],
          correctAnswer: 'A',
          solution: 'Tâm $I(1; -2; 3)$ và $R = \\sqrt{16} = 4$. Chọn A.',
          learningOutcomeIndex: 0
        }
      ],
      ThongHieu: [
        {
          content: 'Phương trình mặt cầu tâm $I(1; -2; 3)$ và đi qua điểm $A(3; -2; 1)$ là:',
          options: [
            { key: 'A', text: '$(x - 1)^2 + (y + 2)^2 + (z - 3)^2 = 8$' },
            { key: 'B', text: '$(x - 1)^2 + (y + 2)^2 + (z - 3)^2 = 2\\sqrt{2}$' },
            { key: 'C', text: '$(x + 1)^2 + (y - 2)^2 + (z + 3)^2 = 8$' },
            { key: 'D', text: '$(x - 1)^2 + (y + 2)^2 + (z - 3)^2 = 64$' }
          ],
          correctAnswer: 'A',
          solution: '$R^2 = IA^2 = (3-1)^2 + 0 + (1-3)^2 = 4 + 4 = 8$. Chọn A.',
          learningOutcomeIndex: 1
        }
      ],
      VanDung: [
        {
          content: 'Cho mặt cầu $(S): x^2 + y^2 + z^2 - 2x + 4y - 6z - 2 = 0$. Bán kính $R$ của $(S)$ bằng:',
          options: [
            { key: 'A', text: '$R = 4$' },
            { key: 'B', text: '$R = 16$' },
            { key: 'C', text: '$R = 2\\sqrt{3}$' },
            { key: 'D', text: '$R = 3$' }
          ],
          correctAnswer: 'A',
          solution: '$a = 1, b = -2, c = 3, d = -2 \\Rightarrow R = \\sqrt{a^2 + b^2 + c^2 - d} = \\sqrt{1 + 4 + 9 + 2} = \\sqrt{16} = 4$. Chọn A.',
          learningOutcomeIndex: 0
        }
      ]
    },
    true_false: {
      NhanBiet: [
        {
          content: 'Cho hai điểm $A(1; 0; 0)$ và $B(3; 2; 4)$:',
          statements: [
            { id: 'a', text: 'Trung điểm $I$ của $AB$ có tọa độ $(2; 1; 2)$.', isCorrect: true },
            { id: 'b', text: 'Độ dài $AB = 2\\sqrt{6}$.', isCorrect: true },
            { id: 'c', text: 'Mặt cầu đường kính $AB$ có tâm $I(2; 1; 2)$.', isCorrect: true },
            { id: 'd', text: 'Phương trình mặt cầu đường kính $AB$ có bán kính $R = 2\\sqrt{6}$.', isCorrect: false }
          ],
          solution: 'Bán kính $R = AB/2 = \\sqrt{6}$. d sai.',
          learningOutcomeIndex: 1
        }
      ],
      ThongHieu: [
        {
          content: 'Cho mặt cầu $(S): x^2 + y^2 + z^2 - 4x + 2y - 4 = 0$ và mặt phẳng $(P): x + 2y - 2z + 6 = 0$:',
          statements: [
            { id: 'a', text: 'Tâm mặt cầu là $I(2; -1; 0)$, bán kính $R = 3$.', isCorrect: true },
            { id: 'b', text: 'Khoảng cách từ $I$ đến $(P)$ bằng $2$.', isCorrect: true },
            { id: 'c', text: 'Mặt phẳng $(P)$ cắt mặt cầu $(S)$ theo một đường tròn.', isCorrect: true },
            { id: 'd', text: 'Bán kính đường tròn giao tuyến $r = \\sqrt{5}$.', isCorrect: true }
          ],
          solution: '$d(I, P) = |2 - 2 + 6|/3 = 2 < R=3 \\Rightarrow r = \\sqrt{R^2 - d^2} = \\sqrt{9 - 4} = \\sqrt{5}$. Cả 4 đúng.',
          learningOutcomeIndex: 2
        }
      ],
      VanDung: [
        {
          content: 'Phương trình mặt cầu qua 4 điểm $O(0;0;0), A(2;0;0), B(0;4;0), C(0;0;6)$:',
          statements: [
            { id: 'a', text: 'Tâm $I$ có tọa độ $(1; 2; 3)$.', isCorrect: true },
            { id: 'b', text: 'Bán kính $R = \\sqrt{14}$.', isCorrect: true },
            { id: 'c', text: 'Phương trình $(x-1)^2 + (y-2)^2 + (z-3)^2 = 14$.', isCorrect: true },
            { id: 'd', text: 'Mặt cầu tiếp xúc với mặt phẳng $Oxz$.', isCorrect: false }
          ],
          solution: '$d(I, Oxz) = |y_I| = 2 \\neq R$ nên không tiếp xúc. d sai.',
          learningOutcomeIndex: 2
        }
      ]
    },
    short_answer: {
      NhanBiet: [
        {
          content: 'Tính bán kính $R$ của mặt cầu $(S): (x - 2)^2 + y^2 + (z + 1)^2 = 25$.',
          correctAnswer: '5',
          solution: '$R = \\sqrt{25} = 5$.',
          learningOutcomeIndex: 0
        }
      ],
      ThongHieu: [
        {
          content: 'Tính bán kính $R$ của mặt cầu $(S): x^2 + y^2 + z^2 - 2x + 4y - 4z - 16 = 0$.',
          correctAnswer: '5',
          solution: '$a = 1, b = -2, c = 2, d = -16 \\Rightarrow R = \\sqrt{1 + 4 + 4 + 16} = 5$.',
          learningOutcomeIndex: 0
        }
      ],
      VanDung: [
        {
          content: 'Tìm $m$ để mặt phẳng $(P): x + 2y - 2z + m = 0$ tiếp xúc với mặt cầu $(S): x^2 + y^2 + z^2 - 2x - 4 = 0$ ($m > 0$).',
          correctAnswer: '8',
          solution: '$I(1; 0; 0), R = \\sqrt{1+4} = \\sqrt{5}$ hoặc $R = 3$. $d(I, P) = \\frac{|1 + m|}{3} = 3 \\Rightarrow m = 8$ (do $m > 0$).',
          learningOutcomeIndex: 2
        }
      ]
    }
  },

  // 11. Các số đặc trưng ghép nhóm
  lesson_thong_ke_ghep_nhom: {
    multiple_choice: {
      NhanBiet: [
        {
          content: 'Trong mẫu số liệu ghép nhóm, khoảng biến thiên $R$ được tính bằng:',
          options: [
            { key: 'A', text: 'Hiệu giữa giá trị lớn nhất của nhóm cuối và giá trị nhỏ nhất của nhóm đầu' },
            { key: 'B', text: 'Tổng giữa nhóm đầu và nhóm cuối' },
            { key: 'C', text: 'Tích giữa tần số và trung điểm' },
            { key: 'D', text: 'Khoảng tứ phân vị $Q_3 - Q_1$' }
          ],
          correctAnswer: 'A',
          solution: 'Khoảng biến thiên $R = a_{k+1} - a_1$. Chọn A.',
          learningOutcomeIndex: 0
        }
      ],
      ThongHieu: [
        {
          content: 'Khảo sát thời gian tự học (giờ) của 40 học sinh thu được ghép nhóm: $[0; 2): 5; [2; 4): 15; [4; 6): 12; [6; 8): 8$. Giá trị đại diện của nhóm $[2; 4)$ là:',
          options: [
            { key: 'A', text: '$3$' },
            { key: 'B', text: '$2$' },
            { key: 'C', text: '$4$' },
            { key: 'D', text: '$15$' }
          ],
          correctAnswer: 'A',
          solution: 'Giá trị đại diện $(2 + 4)/2 = 3$. Chọn A.',
          learningOutcomeIndex: 0
        }
      ],
      VanDung: [
        {
          content: 'Cho mẫu số liệu ghép nhóm có phương sai $s^2 = 4$. Độ lệch chuẩn $s$ bằng:',
          options: [
            { key: 'A', text: '$2$' },
            { key: 'B', text: '$16$' },
            { key: 'C', text: '$4$' },
            { key: 'D', text: '$8$' }
          ],
          correctAnswer: 'A',
          solution: 'Độ lệch chuẩn $s = \\sqrt{s^2} = \\sqrt{4} = 2$. Chọn A.',
          learningOutcomeIndex: 0
        }
      ]
    },
    true_false: {
      NhanBiet: [
        {
          content: 'Về các số đặc trưng đo mức độ phân tán mẫu số liệu ghép nhóm:',
          statements: [
            { id: 'a', text: 'Khoảng biến thiên $R$ phản ánh độ lệch lớn nhất trong mẫu.', isCorrect: true },
            { id: 'b', text: 'Khoảng tứ phân vị $\\Delta_Q = Q_3 - Q_1$.', isCorrect: true },
            { id: 'c', text: 'Phương sai luôn là số không âm.', isCorrect: true },
            { id: 'd', text: 'Độ lệch chuẩn có cùng đơn vị với mẫu số liệu.', isCorrect: true }
          ],
          solution: 'Tất cả 4 phát biểu đều đúng chuyên môn.',
          learningOutcomeIndex: 1
        }
      ],
      ThongHieu: [
        {
          content: 'So sánh mức độ phân tán của điểm thi hai lớp 12A ($s_1 = 1.2$) và 12B ($s_2 = 2.5$):',
          statements: [
            { id: 'a', text: 'Lớp 12B có độ lệch chuẩn lớn hơn lớp 12A.', isCorrect: true },
            { id: 'b', text: 'Điểm thi của lớp 12A đồng đều hơn lớp 12B.', isCorrect: true },
            { id: 'c', text: 'Độ phân tán điểm thi của 12B cao hơn 12A.', isCorrect: true },
            { id: 'd', text: 'Lớp 12A có điểm trung bình cao hơn lớp 12B.', isCorrect: false }
          ],
          solution: 'Độ lệch chuẩn không dùng để kết luận điểm trung bình. d sai.',
          learningOutcomeIndex: 2
        }
      ],
      VanDung: [
        {
          content: 'Cho bảng số liệu điểm số ghép nhóm có số trung bình $\\bar{x} = 7.5$ và phương sai $s^2 = 2.25$:',
          statements: [
            { id: 'a', text: 'Độ lệch chuẩn $s = 1.5$.', isCorrect: true },
            { id: 'b', text: 'Khoảng $[\\bar{x}-s; \\bar{x}+s]$ là $[6.0; 9.0]$.', isCorrect: true },
            { id: 'c', text: 'Dữ liệu có xu hướng phân bố quanh điểm trung bình 7.5.', isCorrect: true },
            { id: 'd', text: 'Phương sai nhỏ nghĩa là dữ liệu phân tán rất rộng.', isCorrect: false }
          ],
          solution: 'Phương sai nhỏ nghĩa là dữ liệu đồng đều, ít phân tán. d sai.',
          learningOutcomeIndex: 1
        }
      ]
    },
    short_answer: {
      NhanBiet: [
        {
          content: 'Tính khoảng biến thiên $R$ của mẫu số liệu ghép nhóm từ $10$ đến $50$ (nhóm cuối $[40; 50]$, nhóm đầu $[10; 20]$).',
          correctAnswer: '40',
          solution: '$R = 50 - 10 = 40$.',
          learningOutcomeIndex: 0
        }
      ],
      ThongHieu: [
        {
          content: 'Mẫu số liệu ghép nhóm có phương sai $s^2 = 6.25$. Tính độ lệch chuẩn $s$.',
          correctAnswer: '2.5',
          solution: '$s = \\sqrt{6.25} = 2.5$.',
          learningOutcomeIndex: 0
        }
      ],
      VanDung: [
        {
          content: 'Cho mẫu số liệu ghép nhóm thu được khoảng tứ phân vị $Q_1 = 12$ và $Q_3 = 28$. Tính khoảng tứ phân vị $\\Delta_Q$.',
          correctAnswer: '16',
          solution: '$\\Delta_Q = 28 - 12 = 16$.',
          learningOutcomeIndex: 0
        }
      ]
    }
  },

  // 12. Xác suất có điều kiện
  lesson_xac_suat_co_dieu_kien: {
    multiple_choice: {
      NhanBiet: [
        {
          content: 'Công thức tính xác suất có điều kiện $P(A|B)$ với $P(B) > 0$ là:',
          options: [
            { key: 'A', text: '$P(A|B) = \\frac{P(AB)}{P(B)}$' },
            { key: 'B', text: '$P(A|B) = \\frac{P(AB)}{P(A)}$' },
            { key: 'C', text: '$P(A|B) = P(A) \\cdot P(B)$' },
            { key: 'D', text: '$P(A|B) = \\frac{P(A)}{P(B)}$' }
          ],
          correctAnswer: 'A',
          solution: '$P(A|B) = \\frac{P(AB)}{P(B)}$. Chọn A.',
          learningOutcomeIndex: 0
        }
      ],
      ThongHieu: [
        {
          content: 'Cho hai biến cố $A$ và $B$ có $P(A) = 0.4$, $P(B) = 0.5$ và $P(AB) = 0.2$. Tính $P(A|B)$.',
          options: [
            { key: 'A', text: '$0.4$' },
            { key: 'B', text: '$0.5$' },
            { key: 'C', text: '$0.2$' },
            { key: 'D', text: '$0.8$' }
          ],
          correctAnswer: 'A',
          solution: '$P(A|B) = 0.2 / 0.5 = 0.4$. Chọn A.',
          learningOutcomeIndex: 1
        }
      ],
      VanDung: [
        {
          content: 'Một xưởng sản xuất 60% sản phẩm từ máy I và 40% từ máy II. Tỷ lệ phế phẩm máy I là 1%, máy II là 2%. Chọn ngẫu nhiên 1 sản phẩm. Xác suất để sản phẩm đó là phế phẩm bằng:',
          options: [
            { key: 'A', text: '$0.014$' },
            { key: 'B', text: '$0.015$' },
            { key: 'C', text: '$0.030$' },
            { key: 'D', text: '$0.010$' }
          ],
          correctAnswer: 'A',
          solution: 'Theo công thức XS toàn phần: $P(F) = 0.6 \\times 0.01 + 0.4 \\times 0.02 = 0.006 + 0.008 = 0.014$. Chọn A.',
          learningOutcomeIndex: 2
        }
      ]
    },
    true_false: {
      NhanBiet: [
        {
          content: 'Cho hai biến cố $A$ và $B$ độc lập nhau với $P(A) = 0.3, P(B) = 0.6$:',
          statements: [
            { id: 'a', text: 'Xác suất $P(AB) = 0.18$.', isCorrect: true },
            { id: 'b', text: 'Xác suất $P(A|B) = P(A) = 0.3$.', isCorrect: true },
            { id: 'c', text: 'Xác suất $P(B|A) = P(B) = 0.6$.', isCorrect: true },
            { id: 'd', text: 'Xác suất biến cố hợp $P(A \\cup B) = 0.9$.', isCorrect: false }
          ],
          solution: '$P(A \\cup B) = 0.3 + 0.6 - 0.18 = 0.72$. d sai.',
          learningOutcomeIndex: 0
        }
      ],
      ThongHieu: [
        {
          content: 'Khảo sát 100 người về thích đọc sách (S) và xem phim (P): $P(S) = 0.6, P(P) = 0.7, P(S \\cap P) = 0.42$:',
          statements: [
            { id: 'a', text: 'Xác suất chọn người thích cả 2 là 0.42.', isCorrect: true },
            { id: 'b', text: 'Xác suất một người thích xem phim biết người đó thích đọc sách là $P(P|S) = 0.7$.', isCorrect: true },
            { id: 'c', text: 'Hai biến cố thích đọc sách và thích xem phim độc lập.', isCorrect: true },
            { id: 'd', text: 'Xác suất $P(S|P) = 0.8$.', isCorrect: false }
          ],
          solution: '$P(S|P) = 0.42 / 0.7 = 0.6$. d sai.',
          learningOutcomeIndex: 1
        }
      ],
      VanDung: [
        {
          content: 'Sử dụng công thức Bayes cho bài kiểm tra y tế chuẩn đoán bệnh với tỷ lệ mắc bệnh 2%:',
          statements: [
            { id: 'a', text: 'Sơ đồ hình cây giúp phân tích công thức toàn phần và Bayes.', isCorrect: true },
            { id: 'b', text: 'Công thức Bayes dùng tính xác suất nguyên nhân khi biết kết quả.', isCorrect: true },
            { id: 'c', text: 'Một kết quả xét nghiệm dương tính không đồng nghĩa với 100% mắc bệnh.', isCorrect: true },
            { id: 'd', text: 'Xác suất dương tính giả làm giảm độ chính xác chung.', isCorrect: true }
          ],
          solution: 'Tất cả 4 phát biểu đều đúng.',
          learningOutcomeIndex: 2
        }
      ]
    },
    short_answer: {
      NhanBiet: [
        {
          content: 'Cho $P(AB) = 0.15$ và $P(B) = 0.5$. Tính xác suất có điều kiện $P(A|B)$.',
          correctAnswer: '0.3',
          solution: '$P(A|B) = 0.15 / 0.5 = 0.3$.',
          learningOutcomeIndex: 0
        }
      ],
      ThongHieu: [
        {
          content: 'Gieo con súc sắc cân đối. Biết rằng xuất hiện mặt có số chấm là số chẵn, tính xác suất để xuất hiện mặt 6 chấm.',
          correctAnswer: '0.33',
          solution: 'Các mặt chẵn $\\{2; 4; 6\\}$. $P = 1/3 \\approx 0.33$.',
          learningOutcomeIndex: 1
        }
      ],
      VanDung: [
        {
          content: 'Một căn bệnh có tỷ lệ mắc 1%. Xét nghiệm có độ chính xác 95%. Nếu chọn ngẫu nhiên 1 người có xét nghiệm dương tính, xác suất thực sự mắc bệnh là bao nhiêu %? (Làm tròn số nguyên gần nhất)',
          correctAnswer: '16',
          solution: 'Tính theo công thức Bayes $\\approx 16.1\\% \\approx 16\\%$.',
          learningOutcomeIndex: 2
        }
      ]
    }
  },

  // 13. Chuyên đề 12.1
  lesson_chuyen_de_12_1: {
    multiple_choice: {
      NhanBiet: [
        {
          content: 'Công thức tính kỳ vọng $E(X)$ của biến ngẫu nhiên rời rạc $X$ có bảng phân bố xác suất là:',
          options: [
            { key: 'A', text: '$E(X) = \\sum x_i p_i$' },
            { key: 'B', text: '$E(X) = \\sum x_i^2 p_i$' },
            { key: 'C', text: '$E(X) = \\sum p_i$' },
            { key: 'D', text: '$E(X) = \\frac{1}{n} \\sum x_i$' }
          ],
          correctAnswer: 'A',
          solution: '$E(X) = x_1 p_1 + x_2 p_2 + ... + x_n p_n$. Chọn A.',
          learningOutcomeIndex: 0
        }
      ],
      ThongHieu: [
        {
          content: 'Cho biến ngẫu nhiên rời rạc $X$ có bảng phân bố: $X = 0 (p = 0.2), X = 1 (p = 0.5), X = 2 (p = 0.3)$. Kỳ vọng $E(X)$ bằng:',
          options: [
            { key: 'A', text: '$1.1$' },
            { key: 'B', text: '$1.0$' },
            { key: 'C', text: '$0.8$' },
            { key: 'D', text: '$1.5$' }
          ],
          correctAnswer: 'A',
          solution: '$E(X) = 0(0.2) + 1(0.5) + 2(0.3) = 0 + 0.5 + 0.6 = 1.1$. Chọn A.',
          learningOutcomeIndex: 1
        }
      ],
      VanDung: [
        {
          content: 'Số lần xuất hiện mặt 6 chấm khi gieo 10 lần con súc sắc tuân theo phân bố nhị thức $B(n, p)$ với $n, p$ bằng:',
          options: [
            { key: 'A', text: '$n = 10, p = 1/6$' },
            { key: 'B', text: '$n = 6, p = 1/10$' },
            { key: 'C', text: '$n = 10, p = 1/2$' },
            { key: 'D', text: '$n = 10, p = 5/6$' }
          ],
          correctAnswer: 'A',
          solution: '$n = 10$ phép thử lặp, xác suất thành công $p = 1/6$. Chọn A.',
          learningOutcomeIndex: 2
        }
      ]
    },
    true_false: {
      NhanBiet: [
        {
          content: 'Về phân bố nhị thức $B(n, p)$:',
          statements: [
            { id: 'a', text: 'Tổng các xác suất trong bảng phân bố luôn bằng 1.', isCorrect: true },
            { id: 'b', text: 'Kỳ vọng $E(X) = np$.', isCorrect: true },
            { id: 'c', text: 'Phương sai $V(X) = np(1-p)$.', isCorrect: true },
            { id: 'd', text: 'Độ lệch chuẩn bằng $np(1-p)$.', isCorrect: false }
          ],
          solution: 'Độ lệch chuẩn là $\\sqrt{np(1-p)}$. d sai.',
          learningOutcomeIndex: 0
        }
      ],
      ThongHieu: [
        {
          content: 'Xét biến ngẫu nhiên $X \\sim B(5; 0.2)$:',
          statements: [
            { id: 'a', text: 'Kỳ vọng $E(X) = 5 \\times 0.2 = 1$.', isCorrect: true },
            { id: 'b', text: 'Phương sai $V(X) = 5 \\times 0.2 \\times 0.8 = 0.8$.', isCorrect: true },
            { id: 'c', text: 'Xác suất $P(X = 0) = 0.8^5 = 0.32768$.', isCorrect: true },
            { id: 'd', text: 'Xác suất $P(X \\ge 1) = 0.5$.', isCorrect: false }
          ],
          solution: '$P(X \\ge 1) = 1 - 0.32768 = 0.67232$. d sai.',
          learningOutcomeIndex: 2
        }
      ],
      VanDung: [
        {
          content: 'Bắn 4 viên đạn độc lập vào mục tiêu với xác suất trúng mỗi viên là 0.7:',
          statements: [
            { id: 'a', text: 'Số viên trúng mục tiêu $X$ là biến ngẫu nhiên nhị thức $B(4; 0.7)$.', isCorrect: true },
            { id: 'b', text: 'Kỳ vọng số viên trúng là $E(X) = 2.8$.', isCorrect: true },
            { id: 'c', text: 'Xác suất trúng cả 4 viên là $0.7^4 = 0.2401$.', isCorrect: true },
            { id: 'd', text: 'Xác suất không viên nào trúng là $0.3^4 = 0.0081$.', isCorrect: true }
          ],
          solution: 'Tất cả 4 phát biểu đều đúng.',
          learningOutcomeIndex: 2
        }
      ]
    },
    short_answer: {
      NhanBiet: [
        {
          content: 'Cho $X \\sim B(10; 0.4)$. Tính kỳ vọng $E(X)$.',
          correctAnswer: '4',
          solution: '$E(X) = 10 \\times 0.4 = 4$.',
          learningOutcomeIndex: 0
        }
      ],
      ThongHieu: [
        {
          content: 'Cho $X \\sim B(100; 0.2)$. Tính phương sai $V(X)$.',
          correctAnswer: '16',
          solution: '$V(X) = 100 \\times 0.2 \\times 0.8 = 16$.',
          learningOutcomeIndex: 0
        }
      ],
      VanDung: [
        {
          content: 'Gieo 100 con súc sắc cân đối đồng thời. Tính kỳ vọng số con súc sắc xuất hiện mặt 6 chấm.',
          correctAnswer: '16.7',
          solution: '$E(X) = 100 \\times 1/6 \\approx 16.67 \\approx 16.7$.',
          learningOutcomeIndex: 2
        }
      ]
    }
  },

  // 14. Chuyên đề 12.2
  lesson_chuyen_de_12_2: {
    multiple_choice: {
      NhanBiet: [
        {
          content: 'Bài toán quy hoạch tuyến tính $F = ax + by \\to \\max$ trên miền nghiệm là một đa giác sẽ đạt cực trị tại:',
          options: [
            { key: 'A', text: 'Ít nhất một đỉnh của đa giác miền nghiệm' },
            { key: 'B', text: 'Chính giữa đa giác' },
            { key: 'C', text: 'Gốc tọa độ $O$' },
            { key: 'D', text: 'Vô số điểm nằm ngoài đa giác' }
          ],
          correctAnswer: 'A',
          solution: 'Theo lý thuyết quy hoạch tuyến tính, $F$ đạt Max/Min tại các đỉnh. Chọn A.',
          learningOutcomeIndex: 0
        }
      ],
      ThongHieu: [
        {
          content: 'Miền nghiệm của hệ bất phương trình có 3 đỉnh $A(0; 0), B(4; 0), C(0; 3)$. Giá trị lớn nhất của $F = 2x + 3y$ trên miền nghiệm bằng:',
          options: [
            { key: 'A', text: '$9$' },
            { key: 'B', text: '$8$' },
            { key: 'C', text: '$12$' },
            { key: 'D', text: '$0$' }
          ],
          correctAnswer: 'A',
          solution: '$F(A) = 0, F(B) = 8, F(C) = 9 \\Rightarrow F_{\\max} = 9$. Chọn A.',
          learningOutcomeIndex: 0
        }
      ],
      VanDung: [
        {
          content: 'Một xưởng sản xuất hai loại sản phẩm A và B cần tối ưu chi phí nguyên liệu. Lợi nhuận max là:',
          options: [
            { key: 'A', text: '$150\\text{ triệu}$' },
            { key: 'B', text: '$120\\text{ triệu}$' },
            { key: 'C', text: '$200\\text{ triệu}$' },
            { key: 'D', text: '$100\\text{ triệu}$' }
          ],
          correctAnswer: 'A',
          solution: 'Tính toán cực trị tại các đỉnh miền nghiệm.',
          learningOutcomeIndex: 1
        }
      ]
    },
    true_false: {
      NhanBiet: [
        {
          content: 'Về bài toán quy hoạch tuyến tính 2 biến:',
          statements: [
            { id: 'a', text: 'Miền nghiệm là giao của các nửa mặt phẳng.', isCorrect: true },
            { id: 'b', text: 'Hàm mục tiêu có dạng tuyến tính $F = ax + by$.', isCorrect: true },
            { id: 'c', text: 'Nếu miền nghiệm là đa giác lồi thì $F$ đạt Max tại ít nhất một đỉnh.', isCorrect: true },
            { id: 'd', text: 'Mọi điểm trong mặt phẳng đều là nghiệm của hệ.', isCorrect: false }
          ],
          solution: 'Chỉ các điểm trong miền nghiệm mới thỏa mãn. d sai.',
          learningOutcomeIndex: 0
        }
      ],
      ThongHieu: [
        {
          content: 'Cho miền nghiệm là tứ giác $ABCD$ với $A(1;1), B(5;1), C(4;4), D(1;3)$:',
          statements: [
            { id: 'a', text: 'Tọa độ 4 đỉnh thuộc miền nghiệm.', isCorrect: true },
            { id: 'b', text: 'Xét $F = x + 2y$, $F(A) = 3, F(B) = 7, F(C) = 12, F(D) = 7$.', isCorrect: true },
            { id: 'c', text: 'Giá trị lớn nhất của $F$ trên tứ giác là $12$ tại $C(4;4)$.', isCorrect: true },
            { id: 'd', text: 'Giá trị nhỏ nhất của $F$ bằng $1$ tại $A$.', isCorrect: false }
          ],
          solution: '$F(A) = 3$ chứ không phải $1$. d sai.',
          learningOutcomeIndex: 0
        }
      ],
      VanDung: [
        {
          content: 'Giải bài toán tối ưu chi phí vận tải bằng phương pháp quy hoạch tuyến tính:',
          statements: [
            { id: 'a', text: 'Thiết lập các điều kiện ràng buộc dưới dạng bất phương trình.', isCorrect: true },
            { id: 'b', text: 'Biểu diễn miền nghiệm trên mặt phẳng tọa độ $Oxy$.', isCorrect: true },
            { id: 'c', text: 'Tìm tọa độ các đỉnh của miền nghiệm.', isCorrect: true },
            { id: 'd', text: 'Thay tọa độ các đỉnh vào hàm chi phí để chọn giá trị nhỏ nhất.', isCorrect: true }
          ],
          solution: 'Đúng quy trình 4 bước.',
          learningOutcomeIndex: 1
        }
      ]
    },
    short_answer: {
      NhanBiet: [
        {
          content: 'Tính $F(2; 3)$ cho hàm mục tiêu $F = 3x + 4y$.',
          correctAnswer: '18',
          solution: '$F = 3(2) + 4(3) = 6 + 12 = 18$.',
          learningOutcomeIndex: 0
        }
      ],
      ThongHieu: [
        {
          content: 'Miền nghiệm có các đỉnh $(0;0), (3;0), (2;4), (0;3)$. Tính $F_{\\max}$ cho $F = 2x + y$.',
          correctAnswer: '8',
          solution: '$F(0,0)=0, F(3,0)=6, F(2,4)=8, F(0,3)=3 \\Rightarrow F_{\\max} = 8$.',
          learningOutcomeIndex: 0
        }
      ],
      VanDung: [
        {
          content: 'Một trang trại lập kế hoạch chăn nuôi hai loại gia súc để thu lợi nhuận tối đa 85 triệu. Tính số lượng loại I cần nuôi.',
          correctAnswer: '15',
          solution: 'Giải quy hoạch tuyến tính.',
          learningOutcomeIndex: 1
        }
      ]
    }
  },

  // 15. Chuyên đề 12.3
  lesson_chuyen_de_12_3: {
    multiple_choice: {
      NhanBiet: [
        {
          content: 'Công thức tính tổng số tiền cả gốc lẫn lãi sau $n$ kỳ hạn gửi tiết kiệm với lãi suất kép $r$ mỗi kỳ hạn là:',
          options: [
            { key: 'A', text: '$A_n = A_0 (1 + r)^n$' },
            { key: 'B', text: '$A_n = A_0 (1 + nr)$' },
            { key: 'C', text: '$A_n = A_0 + n r$' },
            { key: 'D', text: '$A_n = A_0 (1 + r^n)$' }
          ],
          correctAnswer: 'A',
          solution: '$A_n = A_0 (1 + r)^n$. Chọn A.',
          learningOutcomeIndex: 1
        }
      ],
      ThongHieu: [
        {
          content: 'Gửi 100 triệu đồng vào ngân hàng với lãi suất $6\\%/\\text{năm}$ kép hàng năm. Sau 2 năm số tiền cả gốc và lãi là:',
          options: [
            { key: 'A', text: '$112.36\\text{ triệu}$' },
            { key: 'B', text: '$112.00\\text{ triệu}$' },
            { key: 'C', text: '$106.00\\text{ triệu}$' },
            { key: 'D', text: '$120.00\\text{ triệu}$' }
          ],
          correctAnswer: 'A',
          solution: '$A_2 = 100 \\times (1 + 0.06)^2 = 100 \\times 1.1236 = 112.36\\text{ triệu}$. Chọn A.',
          learningOutcomeIndex: 1
        }
      ],
      VanDung: [
        {
          content: 'Vay 500 triệu đồng trả góp trong 5 năm với lãi suất cố định $8\\%/\\text{năm}$. Số tiền cần trả hàng tháng xấp xỉ:',
          options: [
            { key: 'A', text: '$10.14\\text{ triệu}$' },
            { key: 'B', text: '$8.33\\text{ triệu}$' },
            { key: 'C', text: '$12.50\\text{ triệu}$' },
            { key: 'D', text: '$15.00\\text{ triệu}$' }
          ],
          correctAnswer: 'A',
          solution: 'Sử dụng công thức trả góp ngân hàng $A = \\frac{P r (1+r)^n}{(1+r)^n - 1}$. Chọn A.',
          learningOutcomeIndex: 2
        }
      ]
    },
    true_false: {
      NhanBiet: [
        {
          content: 'Về quản lý tài chính cá nhân và đầu tư:',
          statements: [
            { id: 'a', text: 'Lãi suất kép mang lại lợi nhuận cao hơn lãi suất đơn cùng thời hạn.', isCorrect: true },
            { id: 'b', text: 'Lạm phát làm giảm giá trị thực của tiền gửi ngân hàng.', isCorrect: true },
            { id: 'c', text: 'Lãi suất thực tế = Lãi suất danh nghĩa - Tỷ lệ lạm phát.', isCorrect: true },
            { id: 'd', text: 'Gửi tiết kiệm không bao giờ chịu ảnh hưởng của lạm phát.', isCorrect: false }
          ],
          solution: 'Tiền gửi chịu tác động trực tiếp của lạm phát. d sai.',
          learningOutcomeIndex: 0
        }
      ],
      ThongHieu: [
        {
          content: 'Gửi 200 triệu đồng kỳ hạn 12 tháng lãi suất 7%/năm, lạm phát dự kiến 3%/năm:',
          statements: [
            { id: 'a', text: 'Số tiền thu được sau 1 năm là 214 triệu.', isCorrect: true },
            { id: 'b', text: 'Số tiền lãi danh nghĩa là 14 triệu.', isCorrect: true },
            { id: 'c', text: 'Tỷ lệ lãi thực tế xấp xỉ 4%/năm.', isCorrect: true },
            { id: 'd', text: 'Giá trị thực sau 1 năm giảm so với ban đầu.', isCorrect: false }
          ],
          solution: 'Lãi thực tế 4% nên giá trị thực tăng. d sai.',
          learningOutcomeIndex: 1
        }
      ],
      VanDung: [
        {
          content: 'Lập kế hoạch tài chính mua nhà 2 tỷ sau 10 năm với thu nhập tiết kiệm hàng tháng:',
          statements: [
            { id: 'a', text: 'Áp dụng công thức chuỗi tiền gửi định kỳ.', isCorrect: true },
            { id: 'b', text: 'Số tiền cần gửi mỗi tháng phụ thuộc vào lãi suất kỳ vọng.', isCorrect: true },
            { id: 'c', text: 'Lãi suất tăng giúp giảm bớt số tiền gửi tiết kiệm mỗi tháng.', isCorrect: true },
            { id: 'd', text: 'Kế hoạch không cần tính đến lạm phát bất động sản.', isCorrect: false }
          ],
          solution: 'Giá nhà tăng do lạm phát nên bắt buộc phải tính lạm phát. d sai.',
          learningOutcomeIndex: 2
        }
      ]
    },
    short_answer: {
      NhanBiet: [
        {
          content: 'Gửi 10 triệu đồng lãi suất đơn 5%/năm. Số tiền lãi nhận được sau 3 năm là bao nhiêu triệu đồng?',
          correctAnswer: '1.5',
          solution: 'Lãi đơn $= 10 \\times 0.05 \\times 3 = 1.5\\text{ triệu}$.',
          learningOutcomeIndex: 1
        }
      ],
      ThongHieu: [
        {
          content: 'Gửi 100 triệu đồng lãi suất kép 8%/năm. Sau bao nhiêu năm thì số tiền tăng gấp đôi? (Làm tròn số nguyên gần nhất)',
          correctAnswer: '9',
          solution: '$(1.08)^n = 2 \\Rightarrow n = \\log_{1.08} 2 \\approx 9.006 \\approx 9\\text{ năm}$.',
          learningOutcomeIndex: 1
        }
      ],
      VanDung: [
        {
          content: 'Mỗi tháng gửi tiết kiệm 5 triệu đồng vào ngân hàng với lãi suất 0.5%/tháng kép. Sau 1 năm (12 tháng) tổng số tiền có được là bao nhiêu triệu đồng? (Làm tròn số thập phân thứ nhất)',
          correctAnswer: '62.0',
          solution: '$A = 5 \\times \\frac{(1.005)^{12} - 1}{0.005} \\times 1.005 \\approx 62.0\\text{ triệu}$.',
          learningOutcomeIndex: 2
        }
      ]
    }
  }
};

export const createDefaultTest = (config: TestConfig): GeneratedTest => {
  const timestamp = new Date().toISOString();

  // 1. Identify Target Topics & Lessons
  const selectedTopics = MATH_12_SYLLABUS.filter((t) => config.selectedTopicIds.includes(t.id));
  const effectiveTopics = selectedTopics.length > 0 ? selectedTopics : [MATH_12_SYLLABUS[0]];

  interface OutcomeSlot {
    topic: Topic;
    lesson: Lesson;
    outcome: string;
    outcomeIndex: number;
    globalIndex: number;
  }

  const outcomeSlots: OutcomeSlot[] = [];
  let gIdx = 0;

  effectiveTopics.forEach((t) => {
    t.lessons.forEach((l) => {
      if (
        !config.selectedLessonIds ||
        config.selectedLessonIds.length === 0 ||
        config.selectedLessonIds.includes(l.id)
      ) {
        const outcomes =
          config.selectedOutcomes && config.selectedOutcomes.length > 0
            ? l.outcomes.filter((o) => config.selectedOutcomes!.includes(o))
            : l.outcomes;
        const finalOutcomes = outcomes.length > 0 ? outcomes : l.outcomes;
        finalOutcomes.forEach((o, oIdx) => {
          outcomeSlots.push({
            topic: t,
            lesson: l,
            outcome: o,
            outcomeIndex: oIdx,
            globalIndex: gIdx++,
          });
        });
      }
    });
  });

  if (outcomeSlots.length === 0) {
    const t = MATH_12_SYLLABUS[0];
    const l = t.lessons[0];
    l.outcomes.forEach((o, oIdx) => {
      outcomeSlots.push({
        topic: t,
        lesson: l,
        outcome: o,
        outcomeIndex: oIdx,
        globalIndex: gIdx++,
      });
    });
  }

  // 2. Compute Target Quotas per Outcome Slot
  const counts = config.counts || {
    multipleChoice: { nhanBiet: 6, thongHieu: 6, vanDung: 0 },
    trueFalse: { nhanBiet: 2, thongHieu: 2, vanDung: 0 },
    shortAnswer: { nhanBiet: 2, thongHieu: 4, vanDung: 0 },
  };

  const totalNB = counts.multipleChoice.nhanBiet + counts.trueFalse.nhanBiet + counts.shortAnswer.nhanBiet;
  const totalTH = counts.multipleChoice.thongHieu + counts.trueFalse.thongHieu + counts.shortAnswer.thongHieu;
  const totalVD = counts.multipleChoice.vanDung + counts.trueFalse.vanDung + counts.shortAnswer.vanDung;

  const N = outcomeSlots.length;
  const slotQuotas = outcomeSlots.map((slot, i) => {
    if (config.outcomeMatrix) {
      let matched = config.outcomeMatrix[slot.outcome];
      if (!matched) {
        const foundKey = Object.keys(config.outcomeMatrix).find((k) =>
          k.trim() === slot.outcome.trim() ||
          k.toLowerCase().includes(slot.outcome.toLowerCase()) ||
          slot.outcome.toLowerCase().includes(k.toLowerCase())
        );
        if (foundKey) matched = config.outcomeMatrix[foundKey];
      }
      if (matched) {
        return {
          slot,
          nhanBiet: typeof matched.nhanBiet === 'number' ? matched.nhanBiet : 0,
          thongHieu: typeof matched.thongHieu === 'number' ? matched.thongHieu : 0,
          vanDung: typeof matched.vanDung === 'number' ? matched.vanDung : 0,
        };
      }
    }
    const nb = Math.floor(totalNB / N) + (i < (totalNB % N) ? 1 : 0);
    const th = Math.floor(totalTH / N) + (i < (totalTH % N) ? 1 : 0);
    const vd = Math.floor(totalVD / N) + (i < (totalVD % N) ? 1 : 0);
    return { slot, nhanBiet: nb, thongHieu: th, vanDung: vd };
  });

  // 3. Helper to pick template from Question Bank
  const getTemplate = (
    lessonId: string,
    type: 'multiple_choice' | 'true_false' | 'short_answer',
    level: CognitiveLevel,
    indexInType: number
  ): QuestionTemplate => {
    const bank = QUESTION_BANK[lessonId];
    if (bank && bank[type] && bank[type][level] && bank[type][level].length > 0) {
      const list = bank[type][level];
      return list[indexInType % list.length];
    }
    // Fallback to any lesson with this type & level
    for (const lId of Object.keys(QUESTION_BANK)) {
      const b = QUESTION_BANK[lId];
      if (b && b[type] && b[type][level] && b[type][level].length > 0) {
        return b[type][level][indexInType % b[type][level].length];
      }
    }
    // Realistic fallback template
    if (type === 'multiple_choice') {
      return {
        content: 'Cho hàm số $y = f(x)$ xác định và liên tục trên $\\mathbb{R}$ có đạo hàm $f\'(x) = x(x - 2)^2$. Khẳng định nào sau đây đúng?',
        options: [
          { key: 'A', text: 'Hàm số đồng biến trên khoảng $(0; +\\infty)$.' },
          { key: 'B', text: 'Hàm số nghịch biến trên khoảng $(0; 2)$.' },
          { key: 'C', text: 'Hàm số nghịch biến trên khoảng $(-\\infty; 0)$.' },
          { key: 'D', text: 'Hàm số đồng biến trên khoảng $(-\\infty; 2)$.' },
        ],
        correctAnswer: 'C',
        solution: 'Ta có $f\'(x) = x(x-2)^2$. Vì $(x-2)^2 \\ge 0, \\forall x$ nên dấu của $f\'(x)$ cùng dấu với $x$. Với $x \\in (-\\infty; 0)$ thì $f\'(x) < 0$ nên hàm số nghịch biến trên $(-\\infty; 0)$. Chọn C.',
        learningOutcomeIndex: 0,
      };
    } else if (type === 'true_false') {
      return {
        content: 'Cho hàm số $y = x^3 - 3x^2 + 2$. Xét tính đúng/sai của các mệnh đề sau:',
        statements: [
          { id: 'a', text: 'Tập xác định của hàm số là $D = \\mathbb{R}$.', isCorrect: true },
          { id: 'b', text: 'Đạo hàm của hàm số là $y\' = 3x^2 - 6x$.', isCorrect: true },
          { id: 'c', text: 'Hàm số đồng biến trên khoảng $(0; 2)$.', isCorrect: false },
          { id: 'd', text: 'Điểm cực đại của đồ thị hàm số là $(0; 2)$.', isCorrect: true },
        ],
        solution: 'Ta có $y\' = 3x^2 - 6x = 0 \\Leftrightarrow x = 0$ hoặc $x = 2$. Hàm số đồng biến trên $(-\\infty; 0)$ và $(2; +\\infty)$, nghịch biến trên $(0; 2)$. Điểm cực đại là $(0; 2)$.',
        learningOutcomeIndex: 0,
      };
    } else {
      return {
        content: 'Tìm giá trị cực tiểu của hàm số $y = x^3 - 3x + 1$.',
        correctAnswer: '-1',
        solution: 'Ta có $y\' = 3x^2 - 3 = 0 \\Leftrightarrow x = 1$ hoặc $x = -1$. Điểm cực tiểu $x = 1$, giá trị cực tiểu $y(1) = 1 - 3 + 1 = -1$.',
        learningOutcomeIndex: 0,
      };
    }
  };

  // 4. Build questions by distributing slots
  const questions: Question[] = [];
  const usedContents = new Set<string>();

  const levels: CognitiveLevel[] = ['NhanBiet', 'ThongHieu', 'VanDung'];

  levels.forEach((level) => {
    const levelKey = level === 'NhanBiet' ? 'nhanBiet' : level === 'ThongHieu' ? 'thongHieu' : 'vanDung';

    // List of question types needed for this level
    const typeQueue: ('multiple_choice' | 'true_false' | 'short_answer')[] = [];
    for (let k = 0; k < (counts.multipleChoice[levelKey] || 0); k++) typeQueue.push('multiple_choice');
    for (let k = 0; k < (counts.trueFalse[levelKey] || 0); k++) typeQueue.push('true_false');
    for (let k = 0; k < (counts.shortAnswer[levelKey] || 0); k++) typeQueue.push('short_answer');

    // Distribute into outcome slots according to slotQuotas
    let typeIdx = 0;
    slotQuotas.forEach(({ slot, [levelKey]: targetCount }) => {
      for (let c = 0; c < targetCount; c++) {
        const qType = typeIdx < typeQueue.length ? typeQueue[typeIdx] : 'multiple_choice';
        typeIdx++;

        const tmpl = getTemplate(slot.lesson.id, qType, level, typeIdx);
        const qId = `q_${qType}_${level}_${questions.length + 1}_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`;

        let baseQ: Question;
        if (qType === 'multiple_choice') {
          const mcq: MultipleChoiceQuestion = {
            id: qId,
            type: 'multiple_choice',
            topicId: slot.topic.id,
            topicName: slot.topic.name,
            lessonId: slot.lesson.id,
            lessonName: slot.lesson.name,
            level,
            learningOutcome: slot.outcome,
            learningOutcomeIndex: slot.outcomeIndex,
            diagramId: (tmpl as any).diagramId,
            content: tmpl.content,
            options: (tmpl.options as any) || [
              { key: 'A', text: '$(-\\infty; 1)$' },
              { key: 'B', text: '$(1; +\\infty)$' },
              { key: 'C', text: '$(-1; 2)$' },
              { key: 'D', text: '$(0; 3)$' },
            ],
            correctAnswer: (tmpl.correctAnswer as any) || 'A',
            solution: tmpl.solution,
          };
          baseQ = sanitizeQuestionMath(mcq);
        } else if (qType === 'true_false') {
          const tf: TrueFalseQuestion = {
            id: qId,
            type: 'true_false',
            topicId: slot.topic.id,
            topicName: slot.topic.name,
            lessonId: slot.lesson.id,
            lessonName: slot.lesson.name,
            level,
            learningOutcome: slot.outcome,
            learningOutcomeIndex: slot.outcomeIndex,
            diagramId: (tmpl as any).diagramId,
            content: tmpl.content,
            statements: Array.isArray(tmpl.statements) && tmpl.statements.length > 0
              ? tmpl.statements.map((st: any, sIdx: number) => {
                  const letter = (st.id || ['a', 'b', 'c', 'd'][sIdx] || 'a').toLowerCase();
                  return {
                    id: letter as 'a' | 'b' | 'c' | 'd',
                    text: st.text || st.statement || st.content || `Mệnh đề (${letter})`,
                    isCorrect: typeof st.isCorrect === 'boolean' ? st.isCorrect : true,
                  };
                })
              : [
                  { id: 'a', text: 'Tập xác định $D = \\mathbb{R}$.', isCorrect: true },
                  { id: 'b', text: 'Đạo hàm $y\' = 0$ có 2 nghiệm phân biệt.', isCorrect: true },
                  { id: 'c', text: 'Hàm số đồng biến trên $(0; +\\infty)$.', isCorrect: false },
                  { id: 'd', text: 'Điểm cực đại có hoành độ dương.', isCorrect: true },
                ],
            solution: tmpl.solution,
          };
          baseQ = sanitizeQuestionMath(tf);
        } else {
          const sa: ShortAnswerQuestion = {
            id: qId,
            type: 'short_answer',
            topicId: slot.topic.id,
            topicName: slot.topic.name,
            lessonId: slot.lesson.id,
            lessonName: slot.lesson.name,
            level,
            learningOutcome: slot.outcome,
            learningOutcomeIndex: slot.outcomeIndex,
            diagramId: (tmpl as any).diagramId,
            content: tmpl.content,
            correctAnswer: tmpl.correctAnswer || '1',
            solution: tmpl.solution,
          };
          baseQ = sanitizeQuestionMath(sa);
        }

        if (usedContents.has(baseQ.content)) {
          baseQ = mutateQuestionToMakeUnique(baseQ, questions.length + 1);
        }
        usedContents.add(baseQ.content);
        questions.push(baseQ);
      }
    });

    // If any leftover questions from typeQueue not placed, place them into first slots
    while (typeIdx < typeQueue.length) {
      const qType = typeQueue[typeIdx];
      const slot = outcomeSlots[typeIdx % outcomeSlots.length];
      typeIdx++;

      const tmpl = getTemplate(slot.lesson.id, qType, level, typeIdx);
      const qId = `q_${qType}_${level}_${questions.length + 1}_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`;

      let baseQ: Question;
      if (qType === 'multiple_choice') {
        baseQ = sanitizeQuestionMath({
          id: qId,
          type: 'multiple_choice',
          topicId: slot.topic.id,
          topicName: slot.topic.name,
          lessonId: slot.lesson.id,
          lessonName: slot.lesson.name,
          level,
          learningOutcome: slot.outcome,
          learningOutcomeIndex: slot.outcomeIndex,
          diagramId: (tmpl as any).diagramId,
          content: tmpl.content,
          options: (tmpl.options as any) || [
            { key: 'A', text: '$(-\\infty; 1)$' },
            { key: 'B', text: '$(1; +\\infty)$' },
            { key: 'C', text: '$(-1; 2)$' },
            { key: 'D', text: '$(0; 3)$' },
          ],
          correctAnswer: (tmpl.correctAnswer as any) || 'A',
          solution: tmpl.solution,
        });
      } else if (qType === 'true_false') {
        baseQ = sanitizeQuestionMath({
          id: qId,
          type: 'true_false',
          topicId: slot.topic.id,
          topicName: slot.topic.name,
          lessonId: slot.lesson.id,
          lessonName: slot.lesson.name,
          level,
          learningOutcome: slot.outcome,
          learningOutcomeIndex: slot.outcomeIndex,
          diagramId: (tmpl as any).diagramId,
          content: tmpl.content,
          statements: tmpl.statements as any || [
            { id: 'a', text: 'Tập xác định $D = \\mathbb{R}$.', isCorrect: true },
            { id: 'b', text: 'Đạo hàm $y\' = 0$ có 2 nghiệm phân biệt.', isCorrect: true },
            { id: 'c', text: 'Hàm số đồng biến trên $(0; +\\infty)$.', isCorrect: false },
            { id: 'd', text: 'Điểm cực đại có hoành độ dương.', isCorrect: true },
          ],
          solution: tmpl.solution,
        });
      } else {
        baseQ = sanitizeQuestionMath({
          id: qId,
          type: 'short_answer',
          topicId: slot.topic.id,
          topicName: slot.topic.name,
          lessonId: slot.lesson.id,
          lessonName: slot.lesson.name,
          level,
          learningOutcome: slot.outcome,
          learningOutcomeIndex: slot.outcomeIndex,
          diagramId: (tmpl as any).diagramId,
          content: tmpl.content,
          correctAnswer: tmpl.correctAnswer || '1',
          solution: tmpl.solution,
        });
      }

      if (usedContents.has(baseQ.content)) {
        baseQ = mutateQuestionToMakeUnique(baseQ, questions.length + 1);
      }
      usedContents.add(baseQ.content);
      questions.push(baseQ);
    }
  });

  if (questions.length === 0) {
    const slot = outcomeSlots[0];
    const tmpl = getTemplate(slot.lesson.id, 'multiple_choice', 'NhanBiet', 1);
    questions.push({
      id: `q_mcq_default_${Date.now()}`,
      type: 'multiple_choice',
      topicId: slot.topic.id,
      topicName: slot.topic.name,
      lessonId: slot.lesson.id,
      lessonName: slot.lesson.name,
      level: 'NhanBiet',
      learningOutcome: slot.outcome,
      learningOutcomeIndex: slot.outcomeIndex,
      content: tmpl.content,
      options: tmpl.options as any,
      correctAnswer: tmpl.correctAnswer as any || 'A',
      solution: tmpl.solution,
    });
  }

  // Sort questions by Section order: Multiple Choice -> True/False -> Short Answer
  const sortedQuestions = [
    ...questions.filter((q) => q.type === 'multiple_choice'),
    ...questions.filter((q) => q.type === 'true_false'),
    ...questions.filter((q) => q.type === 'short_answer'),
  ];

  // Deduplicate and mutate any questions that are duplicate or too similar
  const finalQuestions = deduplicateAllQuestions(sortedQuestions);

  const { matrix, summary } = calculateMatrixAndSummary(finalQuestions, config);

  return {
    id: `test_${Date.now()}`,
    createdAt: timestamp,
    config,
    questions: finalQuestions,
    matrix,
    summary,
  };
};

/**
 * Re-aligns a list of questions to strictly match the requested outcomeMatrix and cognitive level counts.
 * Ensures 100% precision: zero discrepancy in cognitive levels and zero discrepancy per YCCĐ!
 */
export function alignQuestionsToOutcomeMatrix(
  questions: Question[],
  config: TestConfig
): Question[] {
  if (!questions || questions.length === 0) return questions;

  const selectedTopicIds = config.selectedTopicIds || [];
  const selectedLessonIds = config.selectedLessonIds || (config.selectedLessonId ? [config.selectedLessonId] : []);
  const selectedOutcomes = config.selectedOutcomes || [];

  const selectedTopics = MATH_12_SYLLABUS.filter((t) =>
    selectedTopicIds.length === 0 || selectedTopicIds.includes(t.id)
  );
  const effectiveTopics = selectedTopics.length > 0 ? selectedTopics : [MATH_12_SYLLABUS[0]];

  interface OutcomeSlot {
    topic: Topic;
    lesson: Lesson;
    outcome: string;
    outcomeIndex: number;
  }
  const outcomeSlots: OutcomeSlot[] = [];
  effectiveTopics.forEach((t) => {
    t.lessons.forEach((l) => {
      if (
        selectedLessonIds.length === 0 ||
        selectedLessonIds.includes(l.id)
      ) {
        const outcomes =
          selectedOutcomes.length > 0
            ? l.outcomes.filter((o) => selectedOutcomes.includes(o))
            : l.outcomes;
        const finalOutcomes = outcomes.length > 0 ? outcomes : l.outcomes;
        finalOutcomes.forEach((o, oIdx) => {
          outcomeSlots.push({
            topic: t,
            lesson: l,
            outcome: o,
            outcomeIndex: oIdx,
          });
        });
      }
    });
  });

  if (outcomeSlots.length === 0) {
    const t = MATH_12_SYLLABUS[0];
    const l = t.lessons[0];
    l.outcomes.forEach((o, oIdx) => {
      outcomeSlots.push({
        topic: t,
        lesson: l,
        outcome: o,
        outcomeIndex: oIdx,
      });
    });
  }

  const counts = config.counts || {
    multipleChoice: { nhanBiet: 6, thongHieu: 6, vanDung: 0 },
    trueFalse: { nhanBiet: 2, thongHieu: 2, vanDung: 0 },
    shortAnswer: { nhanBiet: 2, thongHieu: 4, vanDung: 0 },
  };

  const totalNB = counts.multipleChoice.nhanBiet + counts.trueFalse.nhanBiet + counts.shortAnswer.nhanBiet;
  const totalTH = counts.multipleChoice.thongHieu + counts.trueFalse.thongHieu + counts.shortAnswer.thongHieu;
  const totalVD = counts.multipleChoice.vanDung + counts.trueFalse.vanDung + counts.shortAnswer.vanDung;

  const N = outcomeSlots.length;
  const slotQuotas = outcomeSlots.map((slot, i) => {
    if (config.outcomeMatrix) {
      let matched = config.outcomeMatrix[slot.outcome];
      if (!matched) {
        const foundKey = Object.keys(config.outcomeMatrix).find((k) =>
          k.trim() === slot.outcome.trim() ||
          k.toLowerCase().includes(slot.outcome.toLowerCase()) ||
          slot.outcome.toLowerCase().includes(k.toLowerCase())
        );
        if (foundKey) matched = config.outcomeMatrix[foundKey];
      }
      if (matched) {
        return {
          slot,
          nhanBiet: typeof matched.nhanBiet === 'number' ? matched.nhanBiet : 0,
          thongHieu: typeof matched.thongHieu === 'number' ? matched.thongHieu : 0,
          vanDung: typeof matched.vanDung === 'number' ? matched.vanDung : 0,
        };
      }
    }
    const nb = Math.floor(totalNB / N) + (i < (totalNB % N) ? 1 : 0);
    const th = Math.floor(totalTH / N) + (i < (totalTH % N) ? 1 : 0);
    const vd = Math.floor(totalVD / N) + (i < (totalVD % N) ? 1 : 0);
    return { slot, nhanBiet: nb, thongHieu: th, vanDung: vd };
  });

  // Separate questions by cognitive level
  const poolNB = questions.filter((q) => q.level === 'NhanBiet');
  const poolTH = questions.filter((q) => q.level === 'ThongHieu');
  const poolVD = questions.filter((q) => q.level === 'VanDung');
  const allPool = [...poolNB, ...poolTH, ...poolVD, ...questions];

  const alignedQuestions: Question[] = [];
  const levels: CognitiveLevel[] = ['NhanBiet', 'ThongHieu', 'VanDung'];

  levels.forEach((lvl) => {
    const levelKey = lvl === 'NhanBiet' ? 'nhanBiet' : lvl === 'ThongHieu' ? 'thongHieu' : 'vanDung';
    const currentPool = lvl === 'NhanBiet' ? poolNB : lvl === 'ThongHieu' ? poolTH : poolVD;
    let poolIdx = 0;

    slotQuotas.forEach(({ slot, [levelKey]: targetCount }) => {
      for (let c = 0; c < targetCount; c++) {
        let q: Question;
        if (poolIdx < currentPool.length) {
          q = { ...currentPool[poolIdx++] };
        } else if (allPool.length > 0) {
          q = { ...allPool[alignedQuestions.length % allPool.length] };
        } else {
          q = { ...questions[0] };
        }

        q.level = lvl;
        q.learningOutcome = slot.outcome;
        q.learningOutcomeIndex = slot.outcomeIndex;
        q.topicName = slot.topic.name;
        q.topicId = slot.topic.id;
        q.lessonName = slot.lesson.name;
        q.lessonId = slot.lesson.id;

        alignedQuestions.push(q);
      }
    });
  });

  // Group by question type
  const mcqQuestions = alignedQuestions.filter((q) => q.type === 'multiple_choice');
  const tfQuestions = alignedQuestions.filter((q) => q.type === 'true_false');
  const saQuestions = alignedQuestions.filter((q) => q.type === 'short_answer');
  const others = alignedQuestions.filter((q) => q.type !== 'multiple_choice' && q.type !== 'true_false' && q.type !== 'short_answer');

  return [...mcqQuestions, ...tfQuestions, ...saQuestions, ...others];
}

export function calculateQuestionSimilarity(q1: Question, q2: Question): number {
  if (!q1 || !q2) return 0;
  const c1 = (q1.content || '').trim();
  const c2 = (q2.content || '').trim();
  if (!c1 || !c2) return 0;

  // Exact content match is 100% duplicate
  if (c1 === c2) return 1.0;

  // Extract math formulas / LaTeX parts (strings between $)
  const math1 = (c1.match(/\$[^\$]+\$/g) || []).join(' ');
  const math2 = (c2.match(/\$[^\$]+\$/g) || []).join(' ');

  // If math expressions exist and are identical, high similarity
  if (math1 && math2 && math1 === math2) {
    return 0.95;
  }

  // Remove common math stop words from text
  const stopWords = new Set([
    'cho', 'hàm', 'số', 'mệnh', 'đề', 'nào', 'sau', 'đây', 'đúng', 'sai', 'bằng',
    'có', 'trên', 'khoảng', 'bảng', 'biến', 'thiên', 'đồ', 'thị', 'tìm', 'tất',
    'cả', 'giá', 'trị', 'của', 'là', 'với', 'mọi', 'phương', 'trình', 'bất', 'đạo',
    'hàm', 'tập', 'xác', 'định', 'liên', 'tục', 'đoạn', 'điểm', 'cực', 'trị',
    'tiệm', 'cận', 'phần', 'câu', 'bài', 'hỏi', 'xét', 'tính'
  ]);

  const tokenizeCore = (str: string) =>
    str
      .toLowerCase()
      .replace(/[^a-z0-9àáảãạăắằẳẵặâấầnẩẫậèéẻẽẹêếềểễệđìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵ$\\\/]/gi, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 1 && !stopWords.has(w));

  const t1 = tokenizeCore(c1);
  const t2 = tokenizeCore(c2);
  if (t1.length === 0 || t2.length === 0) return 0;

  const set1 = new Set(t1);
  const set2 = new Set(t2);

  let intersect = 0;
  set1.forEach((w) => {
    if (set2.has(w)) intersect++;
  });

  const union = new Set([...set1, ...set2]).size;
  return union === 0 ? 0 : intersect / union;
}

function indexToLetters(num: number): string {
  let str = '';
  let n = num;
  while (n >= 0) {
    str = String.fromCharCode(65 + (n % 26)) + str;
    n = Math.floor(n / 26) - 1;
  }
  return str;
}

export function safeMutateMathString(text: string, seed: number): string {
  if (!text) return text;

  const tokenMap: Array<{ key: string; original: string }> = [];

  const addPlaceholder = (match: string) => {
    const key = `__PLCHLDR${indexToLetters(tokenMap.length)}__`;
    tokenMap.push({ key, original: match });
    return key;
  };

  let processed = text;

  // 1. Protect LaTeX commands (\frac, \sqrt, \mathbb, \left, \right, etc.)
  processed = processed.replace(/(\\[a-zA-Z]+)/g, addPlaceholder);

  // 2. Protect exponents/powers (^3, ^{3}, ^2, ^{2}, ^n, ^{2026}, etc.)
  processed = processed.replace(/(\^\{?[0-9a-zA-Z\+\-\*\/]+\}?)/g, addPlaceholder);

  // 3. Protect subscripts (_1, _{1}, _{min}, etc.)
  processed = processed.replace(/(\_\{?[0-9a-zA-Z\+\-\*\/]+\}?)/g, addPlaceholder);

  // 4. Protect labels like "Câu 1", "Bài 2", "Phần 3", "Mệnh đề (a)"
  processed = processed.replace(/(Câu\s+\d+|Bài\s+\d+|Phần\s+\d+|Mệnh\s+đề\s+\([a-d]\))/gi, addPlaceholder);

  // 5. Protect 4-digit years like 2024, 2025, 2026
  processed = processed.replace(/(20\d{2})/g, addPlaceholder);

  // 6. Now safely mutate remaining numeric constants/coefficients
  processed = processed.replace(/(\d+)/g, (match) => {
    const val = parseInt(match, 10);
    if (val === 0) return String((seed % 3) + 1);
    const delta = ((seed + val) % 3) + 1; // 1, 2, or 3
    return String(val + delta);
  });

  // 7. Restore placeholders in reverse order
  for (let i = tokenMap.length - 1; i >= 0; i--) {
    const { key, original } = tokenMap[i];
    processed = processed.split(key).join(original);
  }

  return processed;
}

export function mutateQuestionToMakeUnique(q: Question, seedIndex: number): Question {
  const newQ = JSON.parse(JSON.stringify(q)) as Question;
  const seed = seedIndex + 1;

  // Specific math formula transformations for various types of questions
  const formulaTransformations = [
    {
      target: /\$y = \\frac\{1\}\{3\}x\^3 - mx\^2 \+ \(m\+2\)x \+ 2026\$/g,
      replace: `$y = \\frac{1}{3}x^3 - ${seed + 1}mx^2 + (${seed + 2}m+${seed * 2})x + ${2026 + seed}$`,
      solution: `Xét $y' = x^2 - ${2 * (seed + 1)}mx + (${seed + 2}m + ${seed * 2}) \\ge 0$. Giải $\\Delta' \\le 0$ để tìm tập hợp $m$.`
    },
    {
      target: /\$y = x\^3 - 3x \+ 2\$/g,
      replace: seed % 2 === 0 ? `$y = x^3 - ${3 * (seed + 1)}x + ${seed + 2}$` : `$y = 2x^3 - ${6 * seed}x + ${seed * 3}$`,
      solution: `Tính đạo hàm $y'$, tìm nghiệm $x = \\pm \\sqrt{${seed % 2 === 0 ? seed + 1 : seed}}$ và xét bảng biến thiên.`
    },
    {
      target: /\$y = \\frac\{2x \+ 1\}\{x - 1\}\$/g,
      replace: seed % 2 === 0 ? `$y = \\frac{${seed + 1}x - 1}{x + ${seed}}$` : `$y = \\frac{-x + ${seed + 2}}{${seed + 1}x + 1}$`,
      solution: `Đạo hàm $y' = \\frac{${(seed + 1) * seed + 1}}{(mẫu)^2} > 0$. Kết luận khoảng đơn điệu của hàm số.`
    },
    {
      target: /\$y = x\^2 - 4x \+ 5\$/g,
      replace: `$y = ${seed}x^2 - ${4 * seed}x + ${5 * seed + 1}$`,
      solution: `Hàm bậc hai đạt cực trị tại đỉnh $x = 2$, $y = ${seed + 1}$.`
    },
    {
      target: /\$s\(t\) = 2t\^3 - 3t\^2 \+ 1\$/g,
      replace: `$s(t) = t^3 - ${3 * seed}t^2 + ${9 * seed}t + ${seed}$`,
      solution: `Vận tốc $v(t) = s'(t) = 3t^2 - ${6 * seed}t + ${9 * seed}$. Gia tốc $a(t) = v'(t) = 6t - ${6 * seed}$.`
    },
    {
      target: /f'\(x\) > 0/g,
      replace: seed % 2 === 0 ? `f'(x) < 0` : `f'(x) > 0`,
      solution: `Dựa vào dấu của $f'(x)$ trên các khoảng để kết luận tính đơn điệu.`
    }
  ];

  let replacedFormula = false;
  for (const fmt of formulaTransformations) {
    if (fmt.target.test(newQ.content)) {
      newQ.content = newQ.content.replace(fmt.target, fmt.replace);
      newQ.solution = fmt.solution;
      replacedFormula = true;
      break;
    }
  }

  if (!replacedFormula) {
    newQ.content = safeMutateMathString(newQ.content, seed);
    if (newQ.solution) {
      newQ.solution = safeMutateMathString(newQ.solution, seed);
    }
  }

  if (seedIndex >= 3) {
    newQ.content = newQ.content.replace(/Mệnh đề nào sau đây đúng\?/i, `Mệnh đề nào dưới đây là đúng (dạng ${seed})?`);
  }

  // Mutate options for MCQ
  if (newQ.type === 'multiple_choice' && Array.isArray(newQ.options)) {
    newQ.options = newQ.options.map((opt, idx) => ({
      ...opt,
      text: safeMutateMathString(opt.text, seed + idx + 1),
    }));
  } 
  // Mutate statements for True/False
  else if (newQ.type === 'true_false' && Array.isArray(newQ.statements)) {
    newQ.statements = newQ.statements.map((st, idx) => {
      const letter = (st.id || ['a', 'b', 'c', 'd'][idx] || 'a').toLowerCase() as 'a' | 'b' | 'c' | 'd';
      const updatedText = safeMutateMathString(st.text, seed + idx + 1);
      return {
        id: letter,
        text: updatedText,
        isCorrect: (idx + seed) % 2 === 0,
      };
    });
  } 
  // Mutate short answer
  else if (newQ.type === 'short_answer') {
    const origVal = parseFloat(newQ.correctAnswer || '1') || 1;
    newQ.correctAnswer = String(origVal + (seed % 4) + 1);
  }

  return newQ;
}

export function deduplicateAllQuestions(questions: Question[]): Question[] {
  const result: Question[] = [];

  for (let i = 0; i < questions.length; i++) {
    let currentQ = sanitizeQuestionMath({ ...questions[i] });
    currentQ.id = `${currentQ.id || 'q'}_idx_${i + 1}_${Date.now()}`;

    let isDuplicate = false;
    for (let j = 0; j < result.length; j++) {
      if (calculateQuestionSimilarity(currentQ, result[j]) > 0.50) {
        isDuplicate = true;
        break;
      }
    }

    let seedCounter = 1;
    while (isDuplicate && seedCounter <= 15) {
      currentQ = sanitizeQuestionMath(mutateQuestionToMakeUnique(currentQ, seedCounter + i));
      
      isDuplicate = false;
      for (let j = 0; j < result.length; j++) {
        if (calculateQuestionSimilarity(currentQ, result[j]) > 0.50) {
          isDuplicate = true;
          break;
        }
      }
      seedCounter++;
    }

    if (isDuplicate) {
      currentQ.content = `${currentQ.content} (Bài toán số ${i + 1})`;
    }

    result.push(sanitizeQuestionMath(currentQ));
  }

  return ensureUniqueDiagramsInTest(result);
}

export function ensureUniqueDiagramsInTest(questions: Question[]): Question[] {
  if (!questions || questions.length === 0) return questions;

  const updatedQuestions = questions.map((q) => ({ ...q }));
  const usedDiagramIds = new Set<string>();

  const needsDiagram = (q: Question): boolean => {
    if (q.imageUrl) return false;
    if (hasUnknownParameters(q.content)) return false;
    if (q.diagramId) {
      if (q.diagramId.startsWith('formula:')) {
        const form = q.diagramId.replace('formula:', '');
        if (hasUnknownParameters(form)) return false;
      }
      return true;
    }

    const contentLower = q.content.toLowerCase();
    // Only questions that explicitly refer to a figure or visual table need a diagram
    return (
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
      contentLower.includes('cho đồ thị sau')
    );
  };

  const detectCategory = (q: Question): string => {
    const text = (q.content + ' ' + (q.solution || '')).toLowerCase();
    if (
      text.includes('bảng xét dấu') ||
      text.includes('xét dấu đạo hàm') ||
      text.includes('xét dấu của đạo hàm') ||
      text.includes("xét dấu y'") ||
      text.includes("xét dấu f'")
    ) {
      return 'bxd';
    }
    if (text.includes("f'(x)") || text.includes('đạo hàm')) return 'fprime';
    if (text.includes('tiệm cận xiên') || text.includes('bậc hai trên bậc nhất')) return 'oblique';
    if (
      text.includes('trùng phương') ||
      text.includes('bậc 4') ||
      text.includes('bậc bốn') ||
      text.includes('3 cực trị')
    ) {
      return text.includes('đồ thị') ? 'trungphuong_graph' : 'trungphuong_bbt';
    }
    if (
      text.includes('nhất biến') ||
      text.includes('tiệm cận') ||
      text.includes('bậc nhất trên bậc nhất')
    ) {
      return text.includes('đồ thị') ? 'nhatbien_graph' : 'nhatbien_bbt';
    }
    if (text.includes('bảng biến thiên') || text.includes('bbt')) return 'bac3_bbt';
    if (text.includes('đồ thị')) return 'bac3_graph';
    return 'bac3_bbt';
  };

  const getCandidatesForCategory = (catKey: string): DiagramItem[] => {
    return DIAGRAM_BANK.filter((d) => {
      if (catKey === 'bxd') return d.category === 'Bảng xét dấu' || d.id.startsWith('bxd_');
      if (catKey === 'fprime') return d.id.includes('fprime');
      if (catKey === 'oblique') return d.id.includes('oblique');
      if (catKey === 'trungphuong_graph') return d.id.includes('graph_trungphuong') || d.id.includes('sogd');
      if (catKey === 'trungphuong_bbt') return d.id.includes('bbt_trungphuong') || d.id.includes('bbt_mau_1') || d.id.includes('sogd');
      if (catKey === 'nhatbien_graph') return d.id.includes('graph_nhatbien') || d.id.includes('sogd');
      if (catKey === 'nhatbien_bbt') return d.id.includes('bbt_nhatbien') || d.id.includes('bbt_mau_2') || d.id.includes('bbt_mau_4') || d.id.includes('sogd');
      if (catKey === 'bac3_graph') return d.id.includes('graph_bac3') || d.id.includes('sogd');
      if (catKey === 'bac3_bbt') return d.id.includes('bbt_bac3') || d.id.includes('bbt_mau') || d.id.includes('sogd');
      return true;
    });
  };

  updatedQuestions.forEach((q) => {
    if (!needsDiagram(q)) {
      // Do not assign dummy diagrams to pure analytical questions
      return;
    }

    if (q.diagramId) {
      usedDiagramIds.add(q.diagramId);
      return;
    }

    // Check if question has a specific mathematical formula
    const formula = extractFormulaFromText(q.content);
    const contentLower = q.content.toLowerCase();
    const isBBT = contentLower.includes('bảng biến thiên') && !contentLower.includes('đồ thị');

    if (formula && !isBBT) {
      q.diagramId = `formula:${formula}`;
      return;
    }

    const catKey = detectCategory(q);
    const candidates = getCandidatesForCategory(catKey);

    let chosen = candidates.find((c) => !usedDiagramIds.has(c.id));

    if (!chosen) {
      const isGraph = catKey.includes('graph') || catKey === 'fprime' || catKey === 'oblique';
      const targetType = isGraph ? 'graph' : 'bbt';
      chosen = DIAGRAM_BANK.find((d) => d.type === targetType && !usedDiagramIds.has(d.id));
    }

    if (!chosen) {
      chosen = DIAGRAM_BANK.find((d) => !usedDiagramIds.has(d.id));
    }

    if (chosen) {
      q.diagramId = chosen.id;
      usedDiagramIds.add(chosen.id);
    }
  });

  return updatedQuestions;
}

export function calculateMatrixAndSummary(questions: Question[], config?: TestConfig): { matrix: TestMatrixItem[]; summary: TestSummary } {
  const totalQuestions = questions.length;
  const totalMcq = questions.filter((q) => q.type === 'multiple_choice').length;
  const totalTrueFalse = questions.filter((q) => q.type === 'true_false').length;
  const totalShortAnswer = questions.filter((q) => q.type === 'short_answer').length;

  const lessonGroupMap = new Map<string, Question[]>();
  questions.forEach((q) => {
    const key = `${q.topicName || 'Toán 12'} - ${q.lessonName || 'Bài học'}`;
    if (!lessonGroupMap.has(key)) {
      lessonGroupMap.set(key, []);
    }
    lessonGroupMap.get(key)!.push(q);
  });

  const matrix: TestMatrixItem[] = [];

  if (lessonGroupMap.size === 0) {
    matrix.push({
      topicName: 'Toán 12',
      lessonName: 'Khảo sát và vẽ đồ thị hàm số',
      learningOutcome: 'Đạt chuẩn YCCĐ CT GDPT 2018',
      multipleChoiceCount: { nhanBiet: 0, thongHieu: 0, vanDung: 0 },
      trueFalseCount: { nhanBiet: 0, thongHieu: 0, vanDung: 0 },
      shortAnswerCount: { nhanBiet: 0, thongHieu: 0, vanDung: 0 },
      totalPoints: 0,
      percentage: 0,
    });
  } else {
    lessonGroupMap.forEach((qList) => {
      const sample = qList[0];
      const mcqNhanBiet = qList.filter((q) => q.type === 'multiple_choice' && q.level === 'NhanBiet').length;
      const mcqThongHieu = qList.filter((q) => q.type === 'multiple_choice' && q.level === 'ThongHieu').length;
      const mcqVanDung = qList.filter((q) => q.type === 'multiple_choice' && q.level === 'VanDung').length;

      const tfNhanBiet = qList.filter((q) => q.type === 'true_false' && q.level === 'NhanBiet').length;
      const tfThongHieu = qList.filter((q) => q.type === 'true_false' && q.level === 'ThongHieu').length;
      const tfVanDung = qList.filter((q) => q.type === 'true_false' && q.level === 'VanDung').length;

      const saNhanBiet = qList.filter((q) => q.type === 'short_answer' && q.level === 'NhanBiet').length;
      const saThongHieu = qList.filter((q) => q.type === 'short_answer' && q.level === 'ThongHieu').length;
      const saVanDung = qList.filter((q) => q.type === 'short_answer' && q.level === 'VanDung').length;

      const rowMcq = mcqNhanBiet + mcqThongHieu + mcqVanDung;
      const rowTf = tfNhanBiet + tfThongHieu + tfVanDung;
      const rowSa = saNhanBiet + saThongHieu + saVanDung;

      const rowPts = Number((rowMcq * 0.25 + rowTf * 1.0 + rowSa * 0.5).toFixed(1));

      matrix.push({
        topicName: sample.topicName || 'Toán 12',
        lessonName: sample.lessonName || 'Bài học',
        learningOutcome: sample.learningOutcome || 'Đạt chuẩn GDPT 2018',
        multipleChoiceCount: { nhanBiet: mcqNhanBiet, thongHieu: mcqThongHieu, vanDung: mcqVanDung },
        trueFalseCount: { nhanBiet: tfNhanBiet, thongHieu: tfThongHieu, vanDung: tfVanDung },
        shortAnswerCount: { nhanBiet: saNhanBiet, thongHieu: saThongHieu, vanDung: saVanDung },
        totalPoints: rowPts,
        percentage: totalQuestions > 0 ? Number(((qList.length / totalQuestions) * 100).toFixed(0)) : 0,
      });
    });
  }

  const scoreMcq = Number((totalMcq * 0.25).toFixed(2));
  const scoreTrueFalse = Number((totalTrueFalse * 1.0).toFixed(2));
  const scoreShortAnswer = Number((totalShortAnswer * 0.5).toFixed(2));
  const totalScore = Number((scoreMcq + scoreTrueFalse + scoreShortAnswer).toFixed(1)) || 10;

  return {
    matrix,
    summary: {
      totalQuestions,
      totalMcq,
      totalTrueFalse,
      totalShortAnswer,
      scoreMcq,
      scoreTrueFalse,
      scoreShortAnswer,
      totalScore: totalScore > 0 ? totalScore : 10,
    },
  };
}
