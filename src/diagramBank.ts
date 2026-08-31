export interface BBTData {
  xValues: string[]; // e.g. ["-\\infty", "-1", "1", "+\\infty"]
  fPrimeValues: string[]; // e.g. ["+", "0", "-", "0", "+"]
  xLabel?: string;
  fPrimeLabel?: string;
  fLabel?: string;
  hideArrows?: boolean;
  fValues?: {
    value: string;
    type?: 'val' | 'asymptote' | 'infinity';
    position: 'top' | 'bottom' | 'middle';
    xPos?: number;
  }[];
  arrows?: {
    fromIndex: number;
    toIndex: number;
    direction?: 'up' | 'down';
    fromVal?: string;
    toVal?: string;
  }[];
  doubleLines?: {
    xIndex: number;
    color?: string;
    rows?: 'prime' | 'f' | 'all';
  }[];
  singleDividers?: {
    xIndex: number;
    color?: string;
    rows?: 'prime' | 'f' | 'all';
  }[];
  hatchedRegions?: {
    fromXIndex: number;
    toXIndex: number;
  }[];
}

export interface GraphData {
  kind: 'cubic' | 'quartic' | 'rational' | 'oblique' | 'f_prime';
  titleLabel: string;
  expression?: string;
  xMin?: number;
  xMax?: number;
  yMin?: number;
  yMax?: number;
  keyPoints?: { x: number; y: number; label?: string }[];
  asymptotes?: { type: 'vertical' | 'horizontal' | 'oblique'; val: number; eq?: string }[];
}

export interface DiagramItem {
  id: string;
  title: string;
  type: 'bbt' | 'graph';
  category: 'Bảng biến thiên' | 'Bảng xét dấu' | 'Hàm bậc 3' | 'Hàm trùng phương' | 'Hàm nhất biến' | 'Hàm tiệm cận xiên' | 'Đồ thị đạo hàm';
  description: string;
  bbtData?: BBTData;
  graphData?: GraphData;
  promptContext: string;
  sampleQuestions: {
    content: string;
    options?: { key: 'A' | 'B' | 'C' | 'D'; text: string }[];
    correctAnswer?: string;
    statements?: { id: 'a' | 'b' | 'c' | 'd'; text: string; isCorrect: boolean }[];
    solution: string;
  }[];
}

export const DIAGRAM_BANK: DiagramItem[] = [
  // --- BẢNG XÉT DẤU Y' ---
  {
    id: 'bxd_0_2_neg_neg_pos',
    title: "BXD 1: Bảng xét dấu y' có nghiệm kép x = 0, nghiệm đơn x = 2 (Dấu: - 0 - 0 +)",
    type: 'bbt',
    category: 'Bảng xét dấu',
    description: "Bảng xét dấu đạo hàm y' với x = 0 (y' không đổi dấu, giữ dấu âm) và x = 2 (y' đổi dấu từ âm sang dương). Hàm số có đúng 1 điểm cực trị là cực tiểu tại x = 2.",
    promptContext: "Cho hàm số y = f(x) có đạo hàm y' với bảng xét dấu: dòng x gồm -infinity, 0, 2, +infinity; dòng y' mang dấu - trên (-infinity; 0), bằng 0 tại x=0, mang dấu - trên (0; 2), bằng 0 tại x=2, mang dấu + trên (2; +infinity).",
    bbtData: {
      xValues: ['-\\infty', '0', '2', '+\\infty'],
      fPrimeValues: ['-', '0', '-', '0', '+'],
      fValues: [],
      arrows: []
    },
    sampleQuestions: [
      {
        content: "Cho hàm số $y = f(x)$ xác định trên $\\mathbb{R}$ và có bảng xét dấu của đạo hàm $y'$ như hình vẽ bên dưới. Hàm số $y = f(x)$ nghịch biến trên khoảng nào dưới đây?",
        options: [
          { key: 'A', text: '$(-\\infty; 2)$' },
          { key: 'B', text: '$(0; 2)$' },
          { key: 'C', text: '$(2; +\\infty)$' },
          { key: 'D', text: '$(-\\infty; 0)$' }
        ],
        correctAnswer: 'A',
        solution: "Đạo hàm $y' \\le 0$ với mọi $x \\in (-\\infty; 2)$ và $y' = 0$ chỉ tại điểm $x = 0$, do đó hàm số $y = f(x)$ nghịch biến trên khoảng $(-\\infty; 2)$."
      },
      {
        content: "Cho hàm số $y = f(x)$ có bảng xét dấu của đạo hàm $y'$ như sau. Số điểm cực trị của hàm số đã cho là:",
        options: [
          { key: 'A', text: '$1$' },
          { key: 'B', text: '$2$' },
          { key: 'C', text: '$0$' },
          { key: 'D', text: '$3$' }
        ],
        correctAnswer: 'A',
        solution: "Qua điểm $x = 0$, đạo hàm $y'$ không đổi dấu (giữ dấu âm). Qua điểm $x = 2$, đạo hàm $y'$ đổi dấu từ âm sang dương, nên hàm số chỉ có đúng $1$ điểm cực trị (là điểm cực tiểu $x = 2$)."
      },
      {
        content: "Cho hàm số $y = f(x)$ liên tục trên $\\mathbb{R}$ và có bảng xét dấu đạo hàm $y'$ như hình vẽ. Xét tính đúng/sai của các khẳng định sau:",
        statements: [
          { id: 'a', text: 'Hàm số $y = f(x)$ đồng biến trên khoảng $(2; +\\infty)$.', isCorrect: true },
          { id: 'b', text: 'Điểm $x = 0$ là điểm cực đại của hàm số $y = f(x)$.', isCorrect: false },
          { id: 'c', text: 'Hàm số $y = f(x)$ đạt cực tiểu tại điểm $x = 2$.', isCorrect: true },
          { id: 'd', text: 'Hàm số $y = f(x)$ có $2$ điểm cực trị.', isCorrect: false }
        ],
        solution: "a) Đúng vì trên $(2; +\\infty)$, $y' > 0$.\nb) Sai vì qua $x = 0$, $y'$ không đổi dấu nên $x = 0$ không phải điểm cực trị.\nc) Đúng vì qua $x = 2$, $y'$ đổi dấu từ $(-)$ sang $(+)$ nên $x = 2$ là điểm cực tiểu.\nd) Sai vì hàm số chỉ có duy nhất $1$ điểm cực trị."
      }
    ]
  },
  {
    id: 'bxd_0_2_pos_pos_neg',
    title: "BXD 2: Bảng xét dấu y' có nghiệm kép x = 0, nghiệm đơn x = 2 (Dấu: + 0 + 0 -)",
    type: 'bbt',
    category: 'Bảng xét dấu',
    description: "Bảng xét dấu đạo hàm y' với x = 0 (y' không đổi dấu, giữ dấu dương) và x = 2 (y' đổi dấu từ dương sang âm). Hàm số đồng biến trên (-\\infty; 2) và nghịch biến trên (2; +\\infty), có đúng 1 điểm cực đại tại x = 2.",
    promptContext: "Cho hàm số y = f(x) có đạo hàm y' với bảng xét dấu: dòng x gồm -infinity, 0, 2, +infinity; dòng y' mang dấu + trên (-infinity; 0), bằng 0 tại x=0, mang dấu + trên (0; 2), bằng 0 tại x=2, mang dấu - trên (2; +infinity).",
    bbtData: {
      xValues: ['-\\infty', '0', '2', '+\\infty'],
      fPrimeValues: ['+', '0', '+', '0', '-'],
      fValues: [],
      arrows: []
    },
    sampleQuestions: [
      {
        content: "Cho hàm số $y = f(x)$ có bảng xét dấu của đạo hàm $y'$ như hình vẽ bên dưới. Điểm cực đại của hàm số đã cho là:",
        options: [
          { key: 'A', text: '$x = 2$' },
          { key: 'B', text: '$x = 0$' },
          { key: 'C', text: '$x = -\\infty$' },
          { key: 'D', text: '$x = +\\infty$' }
        ],
        correctAnswer: 'A',
        solution: "Tại điểm $x = 2$, đạo hàm $y'$ đổi dấu từ dương $(+)$ sang âm $(-)$ khi đi qua $x = 2$, do đó hàm số đạt cực đại tại $x = 2$."
      },
      {
        content: "Cho hàm số $y = f(x)$ xác định trên $\\mathbb{R}$ và có bảng xét dấu của đạo hàm $y'$ như hình vẽ. Khẳng định nào sau đây là đúng?",
        options: [
          { key: 'A', text: 'Hàm số $y = f(x)$ đồng biến trên khoảng $(-\\infty; 2)$.' },
          { key: 'B', text: 'Hàm số $y = f(x)$ đồng biến trên khoảng $(2; +\\infty)$.' },
          { key: 'C', text: 'Hàm số $y = f(x)$ nghịch biến trên khoảng $(0; 2)$.' },
          { key: 'D', text: 'Hàm số $y = f(x)$ có 2 điểm cực trị.' }
        ],
        correctAnswer: 'A',
        solution: "Vì $y' \\ge 0$ với mọi $x \\in (-\\infty; 2)$ và $y' = 0$ chỉ tại điểm $x = 0$, nên hàm số đồng biến trên toàn bộ khoảng $(-\\infty; 2)$."
      }
    ]
  },
  {
    id: 'bxd_0_2_pos_neg_pos',
    title: "BXD 3: Bảng xét dấu y' có 2 nghiệm phân biệt x = 0, x = 2 (Dấu: + 0 - 0 +)",
    type: 'bbt',
    category: 'Bảng xét dấu',
    description: "Bảng xét dấu đạo hàm y' đổi dấu đan xen: dương trên (-\\infty; 0), âm trên (0; 2), dương trên (2; +\\infty). Hàm số đạt cực đại tại x = 0 và cực tiểu tại x = 2.",
    promptContext: "Cho hàm số y = f(x) có đạo hàm y' với bảng xét dấu: dòng x gồm -infinity, 0, 2, +infinity; dòng y' mang dấu + trên (-infinity; 0), bằng 0 tại x=0, mang dấu - trên (0; 2), bằng 0 tại x=2, mang dấu + trên (2; +infinity).",
    bbtData: {
      xValues: ['-\\infty', '0', '2', '+\\infty'],
      fPrimeValues: ['+', '0', '-', '0', '+'],
      fValues: [],
      arrows: []
    },
    sampleQuestions: [
      {
        content: "Cho hàm số $y = f(x)$ có bảng xét dấu của đạo hàm $y'$ như hình vẽ bên. Hàm số $y = f(x)$ nghịch biến trên khoảng nào dưới đây?",
        options: [
          { key: 'A', text: '$(0; 2)$' },
          { key: 'B', text: '$(-\\infty; 0)$' },
          { key: 'C', text: '$(2; +\\infty)$' },
          { key: 'D', text: '$(-\\infty; 2)$' }
        ],
        correctAnswer: 'A',
        solution: "Dựa vào bảng xét dấu đạo hàm, $y' < 0$ trên khoảng $(0; 2)$, do đó hàm số nghịch biến trên khoảng $(0; 2)$."
      },
      {
        content: "Cho hàm số $y = f(x)$ có bảng xét dấu của đạo hàm $y'$ như hình vẽ. Điểm cực tiểu của hàm số đã cho là:",
        options: [
          { key: 'A', text: '$x = 2$' },
          { key: 'B', text: '$x = 0$' },
          { key: 'C', text: '$x = -\\infty$' },
          { key: 'D', text: '$x = +\\infty$' }
        ],
        correctAnswer: 'A',
        solution: "Đạo hàm $y'$ đổi dấu từ âm $(-)$ sang dương $(+)$ khi đi qua điểm $x = 2$, do đó điểm cực tiểu của hàm số là $x = 2$."
      }
    ]
  },
  {
    id: 'bxd_0_2_neg_pos_neg',
    title: "BXD 4: Bảng xét dấu y' có 2 nghiệm phân biệt x = 0, x = 2 (Dấu: - 0 + 0 -)",
    type: 'bbt',
    category: 'Bảng xét dấu',
    description: "Bảng xét dấu của đạo hàm y' với 2 nghiệm x = 0 và x = 2. Hàm số đồng biến trên khoảng (0; 2) và nghịch biến trên các khoảng (-\\infty; 0), (2; +\\infty). Cực tiểu tại x = 0, cực đại tại x = 2.",
    promptContext: "Cho hàm số y = f(x) có đạo hàm y' với bảng xét dấu: dòng x gồm -infinity, 0, 2, +infinity; dòng y' mang dấu - trên (-infinity; 0), bằng 0 tại x=0, mang dấu + trên (0; 2), bằng 0 tại x=2, mang dấu - trên (2; +infinity).",
    bbtData: {
      xValues: ['-\\infty', '0', '2', '+\\infty'],
      fPrimeValues: ['-', '0', '+', '0', '-'],
      fValues: [],
      arrows: []
    },
    sampleQuestions: [
      {
        content: "Cho hàm số $y = f(x)$ xác định trên $\\mathbb{R}$ và có bảng xét dấu của đạo hàm $y'$ như hình vẽ bên. Hàm số $y = f(x)$ đồng biến trên khoảng nào dưới đây?",
        options: [
          { key: 'A', text: '$(0; 2)$' },
          { key: 'B', text: '$(-\\infty; 0)$' },
          { key: 'C', text: '$(2; +\\infty)$' },
          { key: 'D', text: '$(-\\infty; 2)$' }
        ],
        correctAnswer: 'A',
        solution: "Dựa vào bảng xét dấu đạo hàm, ta thấy $y' > 0$ với mọi $x \\in (0; 2)$. Do đó hàm số đồng biến trên khoảng $(0; 2)$."
      }
    ]
  },
  {
    id: 'bxd_neg1_1_pos_neg_pos',
    title: "BXD 5: Bảng xét dấu y' có 2 nghiệm x = -1, x = 1 (Dấu: + 0 - 0 +)",
    type: 'bbt',
    category: 'Bảng xét dấu',
    description: "Bảng xét dấu của đạo hàm y' với 2 nghiệm x = -1 và x = 1. Hàm số đồng biến trên (-\\infty; -1) và (1; +\\infty), nghịch biến trên (-1; 1).",
    promptContext: "Cho hàm số y = f(x) có đạo hàm y' với bảng xét dấu: dòng x gồm -infinity, -1, 1, +infinity; dòng y' mang dấu + trên (-infinity; -1), bằng 0 tại x=-1, mang dấu - trên (-1; 1), bằng 0 tại x=1, mang dấu + trên (1; +infinity).",
    bbtData: {
      xValues: ['-\\infty', '-1', '1', '+\\infty'],
      fPrimeValues: ['+', '0', '-', '0', '+'],
      fValues: [],
      arrows: []
    },
    sampleQuestions: [
      {
        content: "Cho hàm số $y = f(x)$ có bảng xét dấu của đạo hàm $y'$ như hình vẽ bên. Hàm số $y = f(x)$ nghịch biến trên khoảng nào dưới đây?",
        options: [
          { key: 'A', text: '$(-1; 1)$' },
          { key: 'B', text: '$(-\\infty; -1)$' },
          { key: 'C', text: '$(1; +\\infty)$' },
          { key: 'D', text: '$(-\\infty; 1)$' }
        ],
        correctAnswer: 'A',
        solution: "Dựa vào bảng xét dấu, $y' < 0$ với mọi $x \\in (-1; 1)$, do đó hàm số nghịch biến trên khoảng $(-1; 1)$."
      }
    ]
  },
  {
    id: 'bxd_trung_phuong_3_roots',
    title: "BXD 6: Bảng xét dấu y' có 3 nghiệm x = -2, x = 0, x = 2 (Dấu: - 0 + 0 - 0 +)",
    type: 'bbt',
    category: 'Bảng xét dấu',
    description: "Bảng xét dấu đạo hàm hàm số trùng phương bậc 4 có 3 điểm cực trị x = -2, x = 0, x = 2.",
    promptContext: "Bảng xét dấu của y': dòng x gồm -infinity, -2, 0, 2, +infinity; dòng y' mang dấu - trên (-infinity; -2), bằng 0 tại x=-2, dấu + trên (-2; 0), bằng 0 tại x=0, dấu - trên (0; 2), bằng 0 tại x=2, dấu + trên (2; +infinity).",
    bbtData: {
      xValues: ['-\\infty', '-2', '0', '2', '+\\infty'],
      fPrimeValues: ['-', '0', '+', '0', '-', '0', '+'],
      fValues: [],
      arrows: []
    },
    sampleQuestions: [
      {
        content: "Cho hàm số $y = f(x)$ có bảng xét dấu của đạo hàm $y'$ như hình bên. Số điểm cực trị của hàm số đã cho là:",
        options: [
          { key: 'A', text: '$3$' },
          { key: 'B', text: '$2$' },
          { key: 'C', text: '$1$' },
          { key: 'D', text: '$0$' }
        ],
        correctAnswer: 'A',
        solution: "Đạo hàm $y'$ đổi dấu 3 lần khi qua các điểm $x = -2, x = 0, x = 2$, do đó hàm số có 3 điểm cực trị."
      }
    ]
  },
  {
    id: 'bxd_nhat_bien_pos',
    title: "BXD 7: Bảng xét dấu y' hàm nhất biến không xác định tại x = 1 (Dấu: + || +)",
    type: 'bbt',
    category: 'Bảng xét dấu',
    description: "Bảng xét dấu đạo hàm hàm số nhất biến đồng biến trên (-\\infty; 1) và (1; +\\infty).",
    promptContext: "Bảng xét dấu y': x gồm -infinity, 1, +infinity; y' mang dấu + trên (-infinity; 1), không xác định (hai gạch ||) tại x=1, mang dấu + trên (1; +infinity).",
    bbtData: {
      xValues: ['-\\infty', '1', '+\\infty'],
      fPrimeValues: ['+', '||', '+'],
      fValues: [],
      arrows: []
    },
    sampleQuestions: [
      {
        content: "Cho hàm số $y = f(x)$ có bảng xét dấu của đạo hàm $y'$ như hình vẽ bên. Mệnh đề nào sau đây là đúng?",
        options: [
          { key: 'A', text: 'Hàm số đồng biến trên các khoảng $(-\\infty; 1)$ và $(1; +\\infty)$.' },
          { key: 'B', text: 'Hàm số đồng biến trên $\\mathbb{R} \\setminus \\{1\\}$.' },
          { key: 'C', text: 'Hàm số nghịch biến trên $(-\\infty; 1)$.' },
          { key: 'D', text: 'Hàm số đạt cực trị tại $x = 1$.' }
        ],
        correctAnswer: 'A',
        solution: "Đạo hàm $y' > 0$ trên từng khoảng $(-\\infty; 1)$ và $(1; +\\infty)$, do đó hàm số đồng biến trên các khoảng $(-\\infty; 1)$ và $(1; +\\infty)$."
      }
    ]
  },
  {
    id: 'bxd_nhat_bien_neg',
    title: "BXD 8: Bảng xét dấu y' hàm nhất biến không xác định tại x = -2 (Dấu: - || -)",
    type: 'bbt',
    category: 'Bảng xét dấu',
    description: "Bảng xét dấu đạo hàm hàm số nhất biến nghịch biến trên (-\\infty; -2) và (-2; +\\infty).",
    promptContext: "Bảng xét dấu y': x gồm -infinity, -2, +infinity; y' mang dấu - trên (-infinity; -2), không xác định (hai gạch ||) tại x=-2, mang dấu - trên (-2; +infinity).",
    bbtData: {
      xValues: ['-\\infty', '-2', '+\\infty'],
      fPrimeValues: ['-', '||', '-'],
      fValues: [],
      arrows: []
    },
    sampleQuestions: [
      {
        content: "Cho hàm số $y = f(x)$ có bảng xét dấu của đạo hàm $y'$ như hình vẽ bên. Hàm số $y = f(x)$ nghịch biến trên khoảng nào dưới đây?",
        options: [
          { key: 'A', text: '$(-\\infty; -2)$' },
          { key: 'B', text: '$(-\\infty; +\\infty)$' },
          { key: 'C', text: '$(-2; 2)$' },
          { key: 'D', text: '$(0; +\\infty)$' }
        ],
        correctAnswer: 'A',
        solution: "Dựa vào bảng xét dấu, đạo hàm $y' < 0$ trên các khoảng $(-\\infty; -2)$ và $(-2; +\\infty)$. Do đó hàm số nghịch biến trên khoảng $(-\\infty; -2)$."
      }
    ]
  },

  // --- BẢNG BIẾN THIÊN ---
  {
    id: 'bbt_bac3_1',
    title: 'BBT 1: Hàm số bậc ba có 2 cực trị (Cực đại tại x = -1, Cực tiểu tại x = 1)',
    type: 'bbt',
    category: 'Bảng biến thiên',
    description: 'Hàm số $y = x^3 - 3x + 1$ đồng biến trên $(-\\infty; -1)$ và $(1; +\\infty)$, nghịch biến trên $(-1; 1)$.',
    promptContext: 'Bảng biến thiên của hàm số y = f(x) có hàng x từ -infinity đến -1, 1, +infinity. f\'(x) đổi dấu + 0 - 0 +. f(x) tăng từ -infinity lên 3 (tại x=-1), giảm xuống -1 (tại x=1), tăng lên +infinity.',
    bbtData: {
      xValues: ['-\\infty', '-1', '1', '+\\infty'],
      fPrimeValues: ['+', '0', '-', '0', '+'],
      fValues: [
        { value: '-\\infty', type: 'infinity', position: 'bottom' },
        { value: '3', type: 'val', position: 'top' },
        { value: '-1', type: 'val', position: 'bottom' },
        { value: '+\\infty', type: 'infinity', position: 'top' }
      ],
      arrows: [
        { fromIndex: 0, toIndex: 1, direction: 'up', fromVal: '-\\infty', toVal: '3' },
        { fromIndex: 1, toIndex: 2, direction: 'down', fromVal: '3', toVal: '-1' },
        { fromIndex: 2, toIndex: 3, direction: 'up', fromVal: '-1', toVal: '+\\infty' }
      ]
    },
    sampleQuestions: [
      {
        content: 'Cho hàm số $y = f(x)$ có bảng biến thiên như hình bên dưới. Mệnh đề nào sau đây đúng?',
        options: [
          { key: 'A', text: 'Hàm số đồng biến trên khoảng $(-1; 1)$.' },
          { key: 'B', text: 'Hàm số nghịch biến trên khoảng $(1; +\\infty)$.' },
          { key: 'C', text: 'Hàm số đạt cực đại tại $x = -1$ và giá trị cực đại $y_{CĐ} = 3$.' },
          { key: 'D', text: 'Hàm số đạt cực tiểu tại $x = 3$.' }
        ],
        correctAnswer: 'C',
        solution: 'Dựa vào BBT, tại $x = -1$ đạo hàm $f\'(x)$ đổi dấu từ $+$ sang $-$, $f(-1) = 3$ nên hàm số đạt cực đại tại $x = -1$ với $y_{CĐ} = 3$. Chọn C.'
      },
      {
        content: 'Cho hàm số $y = f(x)$ có bảng biến thiên như hình bên dưới. Số nghiệm thực của phương trình $f(x) - 1 = 0$ là:',
        options: [
          { key: 'A', text: '1' },
          { key: 'B', text: '2' },
          { key: 'C', text: '3' },
          { key: 'D', text: '0' }
        ],
        correctAnswer: 'C',
        solution: 'Phương trình $f(x) = 1$. Đường thẳng $y = 1$ cắt đồ thị hàm số tại 3 điểm phân biệt vì $-1 < 1 < 3$. Chọn C.'
      }
    ]
  },
  {
    id: 'bbt_bac3_2',
    title: 'BBT 2: Hàm số bậc ba $y = -x^3 + 3x^2 - 1$ (CT tại x = 0, CĐ tại x = 2)',
    type: 'bbt',
    category: 'Bảng biến thiên',
    description: 'Hàm số nghịch biến trên $(-\\infty; 0)$ và $(2; +\\infty)$, đồng biến trên $(0; 2)$.',
    promptContext: 'Bảng biến thiên hàm số bậc ba hệ số a < 0. x từ -infinity đến 0, 2, +infinity. f\'(x) đổi dấu - 0 + 0 -. f(x) giảm từ +infinity xuống -1 (tại x=0), tăng lên 3 (tại x=2), giảm xuống -infinity.',
    bbtData: {
      xValues: ['-\\infty', '0', '2', '+\\infty'],
      fPrimeValues: ['-', '0', '+', '0', '-'],
      fValues: [
        { value: '+\\infty', type: 'infinity', position: 'top' },
        { value: '-1', type: 'val', position: 'bottom' },
        { value: '3', type: 'val', position: 'top' },
        { value: '-\\infty', type: 'infinity', position: 'bottom' }
      ],
      arrows: [
        { fromIndex: 0, toIndex: 1, direction: 'down', fromVal: '+\\infty', toVal: '-1' },
        { fromIndex: 1, toIndex: 2, direction: 'up', fromVal: '-1', toVal: '3' },
        { fromIndex: 2, toIndex: 3, direction: 'down', fromVal: '3', toVal: '-\\infty' }
      ]
    },
    sampleQuestions: []
  },
  {
    id: 'bbt_bac3_3',
    title: 'BBT 3: Hàm số bậc ba $y = x^3 - 3x^2 + 2$ (CĐ tại x = 0, CT tại x = 2)',
    type: 'bbt',
    category: 'Bảng biến thiên',
    description: 'Hàm số đạt CĐ tại $(0; 2)$ và CT tại $(2; -2)$.',
    promptContext: 'BBT hàm bậc ba y = x^3 - 3x^2 + 2 có x từ -infinity đến 0, 2, +infinity. f\'(x) + 0 - 0 +. f(x) tăng từ -infinity lên 2, giảm xuống -2, tăng lên +infinity.',
    bbtData: {
      xValues: ['-\\infty', '0', '2', '+\\infty'],
      fPrimeValues: ['+', '0', '-', '0', '+'],
      fValues: [
        { value: '-\\infty', type: 'infinity', position: 'bottom' },
        { value: '2', type: 'val', position: 'top' },
        { value: '-2', type: 'val', position: 'bottom' },
        { value: '+\\infty', type: 'infinity', position: 'top' }
      ],
      arrows: [
        { fromIndex: 0, toIndex: 1, direction: 'up', fromVal: '-\\infty', toVal: '2' },
        { fromIndex: 1, toIndex: 2, direction: 'down', fromVal: '2', toVal: '-2' },
        { fromIndex: 2, toIndex: 3, direction: 'up', fromVal: '-2', toVal: '+\\infty' }
      ]
    },
    sampleQuestions: []
  },

  {
    id: 'bbt_trungphuong_1',
    title: 'BBT 3: Hàm trùng phương $y = x^4 - 2x^2 - 1$ (3 cực trị tại $x = -1, 0, 1$)',
    type: 'bbt',
    category: 'Bảng biến thiên',
    description: 'Hàm trùng phương có 3 cực trị, đạt cực đại tại $x=0$, cực tiểu tại $x=\\pm 1$.',
    promptContext: 'Bảng biến thiên hàm trùng phương y = x^4 - 2x^2 - 1. x từ -infinity -> -1 -> 0 -> 1 -> +infinity. f\'(x) có dấu - 0 + 0 - 0 +. f(x) giảm từ +infinity xuống -2, tăng lên -1, giảm xuống -2, tăng lên +infinity.',
    bbtData: {
      xValues: ['-\\infty', '-1', '0', '1', '+\\infty'],
      fPrimeValues: ['-', '0', '+', '0', '-', '0', '+'],
      fValues: [
        { value: '+\\infty', type: 'infinity', position: 'top' },
        { value: '-2', type: 'val', position: 'bottom' },
        { value: '-1', type: 'val', position: 'middle' },
        { value: '-2', type: 'val', position: 'bottom' },
        { value: '+\\infty', type: 'infinity', position: 'top' }
      ],
      arrows: [
        { fromIndex: 0, toIndex: 1, direction: 'down', fromVal: '+\\infty', toVal: '-2' },
        { fromIndex: 1, toIndex: 2, direction: 'up', fromVal: '-2', toVal: '-1' },
        { fromIndex: 2, toIndex: 3, direction: 'down', fromVal: '-1', toVal: '-2' },
        { fromIndex: 3, toIndex: 4, direction: 'up', fromVal: '-2', toVal: '+\\infty' }
      ]
    },
    sampleQuestions: [
      {
        content: 'Cho hàm số $y = f(x)$ có bảng biến thiên như bên dưới. Giá trị cực đại của hàm số đã cho bằng:',
        options: [
          { key: 'A', text: '$0$' },
          { key: 'B', text: '$-1$' },
          { key: 'C', text: '$-2$' },
          { key: 'D', text: '$1$' }
        ],
        correctAnswer: 'B',
        solution: 'Hàm số đạt cực đại tại $x = 0$ và giá trị cực đại $y_{CĐ} = -1$. Chọn B.'
      }
    ]
  },
  {
    id: 'bbt_nhatbien_dongbien_1',
    title: 'BBT 4: Hàm nhất biến $y = \\frac{ax+b}{cx+d}$ ($y\' > 0$, Đồng biến trên từng khoảng xác định)',
    type: 'bbt',
    category: 'Bảng biến thiên',
    description: 'Bảng biến thiên hàm số nhất biến $y = \\frac{ax+b}{cx+d}$ với $y\' > 0$. Tiệm cận đứng $x = -1$, tiệm cận ngang $y = \\frac{1}{2}$. Hàm số đồng biến trên $(-\\infty; -1)$ và $(-1; +\\infty)$.',
    promptContext: 'Bảng biến thiên hàm số nhất biến y = (ax+b)/(cx+d) có y\' > 0. Hàng x: -infinity -> -1 -> +infinity. Hàng y\' mang dấu + trên (-infinity; -1), vạch đôi || tại x = -1, mang dấu + trên (-1; +infinity). Hàng y: từ 1/2 tăng lên +infinity (trước vạch đôi ||), và từ -infinity tăng lên 1/2 (sau vạch đôi ||).',
    bbtData: {
      xValues: ['-\\infty', '-1', '+\\infty'],
      fPrimeValues: ['+', '||', '+'],
      fValues: [
        { value: '\\frac{1}{2}', type: 'val', position: 'bottom' },
        { value: '+\\infty', type: 'infinity', position: 'top' },
        { value: '-\\infty', type: 'infinity', position: 'bottom' },
        { value: '\\frac{1}{2}', type: 'val', position: 'top' }
      ],
      arrows: [
        { fromIndex: 0, toIndex: 1, direction: 'up', fromVal: '\\frac{1}{2}', toVal: '+\\infty' },
        { fromIndex: 2, toIndex: 3, direction: 'up', fromVal: '-\\infty', toVal: '\\frac{1}{2}' }
      ]
    },
    sampleQuestions: [
      {
        content: 'Cho hàm số $y = f(x)$ có bảng biến thiên như hình bên dưới. Mệnh đề nào sau đây đúng?',
        options: [
          { key: 'A', text: 'Hàm số đồng biến trên các khoảng $(-\\infty; -1)$ và $(-1; +\\infty)$.' },
          { key: 'B', text: 'Hàm số đồng biến trên $\\mathbb{R} \\setminus \\{-1\\}$.' },
          { key: 'C', text: 'Hàm số nghịch biến trên khoảng $(-\\infty; -1)$.' },
          { key: 'D', text: 'Hàm số đồng biến trên $\\mathbb{R}$.' }
        ],
        correctAnswer: 'A',
        solution: 'Dựa vào bảng biến thiên, đạo hàm $f\'(x) > 0, \\forall x \\neq -1$. Do đó hàm số đồng biến trên từng khoảng xác định $(-\\infty; -1)$ và $(-1; +\\infty)$. (Lưu ý: Không kết luận hàm số đồng biến trên $\\mathbb{R} \\setminus \\{-1\\}$ hay $(-\\infty; -1) \\cup (-1; +\\infty)$). Chọn A.'
      },
      {
        content: 'Cho hàm số $y = f(x)$ có bảng biến thiên như hình vẽ. Tổng số đường tiệm cận đứng và tiệm cận ngang của đồ thị hàm số đã cho là:',
        options: [
          { key: 'A', text: '2' },
          { key: 'B', text: '1' },
          { key: 'C', text: '3' },
          { key: 'D', text: '0' }
        ],
        correctAnswer: 'A',
        solution: 'Ta có $\\lim_{x \\to -1^-} f(x) = +\\infty$ nên đường thẳng $x = -1$ là tiệm cận đứng. Mặt khác $\\lim_{x \\to -\\infty} f(x) = \\lim_{x \\to +\\infty} f(x) = \\frac{1}{2}$ nên đường thẳng $y = \\frac{1}{2}$ là tiệm cận ngang. Vậy đồ thị hàm số có $1 + 1 = 2$ đường tiệm cận. Chọn A.'
      }
    ]
  },
  {
    id: 'bbt_nhatbien_nghichbien_1',
    title: 'BBT 5: Hàm nhất biến $y = \\frac{ax+b}{cx+d}$ ($y\' < 0$, Nghịch biến trên từng khoảng xác định)',
    type: 'bbt',
    category: 'Bảng biến thiên',
    description: 'Bảng biến thiên hàm số nhất biến $y = \\frac{ax+b}{cx+d}$ với $y\' < 0$. Tiệm cận đứng $x = -2$, tiệm cận ngang $y = 1$. Hàm số nghịch biến trên $(-\\infty; -2)$ và $(-2; +\\infty)$.',
    promptContext: 'Bảng biến thiên hàm số nhất biến y = (ax+b)/(cx+d) có y\' < 0. Hàng x: -infinity -> -2 -> +infinity. Hàng y\' mang dấu - trên (-infinity; -2), vạch đôi || tại x = -2, mang dấu - trên (-2; +infinity). Hàng y: từ 1 giảm xuống -infinity (trước vạch đôi ||), và từ +infinity giảm xuống 1 (sau vạch đôi ||).',
    bbtData: {
      xValues: ['-\\infty', '-2', '+\\infty'],
      fPrimeValues: ['-', '||', '-'],
      fValues: [
        { value: '1', type: 'val', position: 'top' },
        { value: '-\\infty', type: 'infinity', position: 'bottom' },
        { value: '+\\infty', type: 'infinity', position: 'top' },
        { value: '1', type: 'val', position: 'bottom' }
      ],
      arrows: [
        { fromIndex: 0, toIndex: 1, direction: 'down', fromVal: '1', toVal: '-\\infty' },
        { fromIndex: 2, toIndex: 3, direction: 'down', fromVal: '+\\infty', toVal: '1' }
      ]
    },
    sampleQuestions: [
      {
        content: 'Cho hàm số $y = f(x)$ có bảng biến thiên như hình bên dưới. Khẳng định nào sau đây là đúng?',
        options: [
          { key: 'A', text: 'Hàm số nghịch biến trên từng khoảng $(-\\infty; -2)$ và $(-2; +\\infty)$.' },
          { key: 'B', text: 'Hàm số đồng biến trên khoảng $(-\\infty; -2)$.' },
          { key: 'C', text: 'Đồ thị hàm số có tiệm cận đứng là $x = 1$.' },
          { key: 'D', text: 'Hàm số có giá trị cực tiểu bằng $1$.' }
        ],
        correctAnswer: 'A',
        solution: 'Dựa vào bảng biến thiên, $f\'(x) < 0, \\forall x \\neq -2$ nên hàm số nghịch biến trên từng khoảng xác định $(-\\infty; -2)$ và $(-2; +\\infty)$. Hàm nhất biến không có cực trị. Chọn A.'
      },
      {
        content: 'Cho hàm số $y = \\frac{ax + b}{cx + d}$ có bảng biến thiên như hình vẽ. Phương trình đường tiệm cận đứng của đồ thị hàm số là:',
        options: [
          { key: 'A', text: 'x = -2' },
          { key: 'B', text: 'y = 1' },
          { key: 'C', text: 'x = 1' },
          { key: 'D', text: 'y = -2' }
        ],
        correctAnswer: 'A',
        solution: 'Tại $x = -2$, hàm số không xác định và $\\lim_{x \\to -2^-} f(x) = -\\infty$ (cũng như $\\lim_{x \\to -2^+} f(x) = +\\infty$), suy ra $x = -2$ là tiệm cận đứng của đồ thị hàm số. Chọn A.'
      }
    ]
  },
  {
    id: 'bbt_nhatbien_dongbien_2',
    title: 'BBT 6: Hàm nhất biến $y = \\frac{2x-1}{x+1}$ ($y\' > 0$, TCĐ $x = -1$, TCN $y = 2$)',
    type: 'bbt',
    category: 'Bảng biến thiên',
    description: 'Bảng biến thiên hàm số $y = \\frac{2x-1}{x+1}$ đồng biến trên $(-\\infty; -1)$ và $(-1; +\\infty)$.',
    promptContext: 'Bảng biến thiên hàm số y = (2x-1)/(x+1) có y\' > 0. x từ -infinity đến -1 và +infinity. y tăng từ 2 lên +infinity và từ -infinity lên 2.',
    bbtData: {
      xValues: ['-\\infty', '-1', '+\\infty'],
      fPrimeValues: ['+', '||', '+'],
      fValues: [
        { value: '2', type: 'val', position: 'bottom' },
        { value: '+\\infty', type: 'infinity', position: 'top' },
        { value: '-\\infty', type: 'infinity', position: 'bottom' },
        { value: '2', type: 'val', position: 'top' }
      ],
      arrows: [
        { fromIndex: 0, toIndex: 1, direction: 'up', fromVal: '2', toVal: '+\\infty' },
        { fromIndex: 2, toIndex: 3, direction: 'up', fromVal: '-\\infty', toVal: '2' }
      ]
    },
    sampleQuestions: []
  },
  {
    id: 'bbt_nhatbien_nghichbien_2',
    title: 'BBT 7: Hàm nhất biến $y = \\frac{2x+1}{x-1}$ ($y\' < 0$, TCĐ $x = 1$, TCN $y = 2$)',
    type: 'bbt',
    category: 'Bảng biến thiên',
    description: 'Bảng biến thiên hàm số $y = \\frac{2x+1}{x-1}$ nghịch biến trên $(-\\infty; 1)$ và $(1; +\\infty)$.',
    promptContext: 'Bảng biến thiên hàm số y = (2x+1)/(x-1) có y\' < 0. x từ -infinity đến 1 và +infinity. y giảm từ 2 xuống -infinity và từ +infinity xuống 2.',
    bbtData: {
      xValues: ['-\\infty', '1', '+\\infty'],
      fPrimeValues: ['-', '||', '-'],
      fValues: [
        { value: '2', type: 'val', position: 'top' },
        { value: '-\\infty', type: 'infinity', position: 'bottom' },
        { value: '+\\infty', type: 'infinity', position: 'top' },
        { value: '2', type: 'val', position: 'bottom' }
      ],
      arrows: [
        { fromIndex: 0, toIndex: 1, direction: 'down', fromVal: '2', toVal: '-\\infty' },
        { fromIndex: 2, toIndex: 3, direction: 'down', fromVal: '+\\infty', toVal: '2' }
      ]
    },
    sampleQuestions: []
  },
  {
    id: 'graph_bac3_1',
    title: 'Đồ thị 1: Hàm số bậc ba $y = x^3 - 3x + 1$',
    type: 'graph',
    category: 'Hàm bậc 3',
    description: 'Đồ thị hàm bậc ba đi qua $(-1, 3)$, $(0, 1)$, $(1, -1)$.',
    promptContext: 'Đồ thị hàm số bậc ba y = x^3 - 3x + 1 trong hệ tọa độ Oxy. Điểm cực đại A(-1, 3), điểm cực tiểu B(1, -1), cắt Oy tại (0, 1).',
    graphData: {
      kind: 'cubic',
      titleLabel: 'y = x^3 - 3x + 1',
      expression: 'x^3 - 3x + 1',
      xMin: -2.5,
      xMax: 2.5,
      yMin: -2.5,
      yMax: 4.0,
      keyPoints: [
        { x: -1, y: 3, label: '(-1; 3)' },
        { x: 1, y: -1, label: '(1; -1)' },
        { x: 0, y: 1, label: '(0; 1)' }
      ]
    },
    sampleQuestions: [
      {
        content: 'Cho hàm số $y = f(x)$ có đồ thị như hình vẽ bên dưới. Điểm cực đại của đồ thị hàm số là:',
        options: [
          { key: 'A', text: '$(1; -1)$' },
          { key: 'B', text: '$(-1; 3)$' },
          { key: 'C', text: '$x = -1$' },
          { key: 'D', text: '$y = 3$' }
        ],
        correctAnswer: 'B',
        solution: 'Quan sát đồ thị Oxy, điểm cao nhất tương ứng đỉnh lồi của đồ thị là điểm $A(-1; 3)$. Do đó điểm cực đại của đồ thị hàm số là $(-1; 3)$. Chọn B.'
      }
    ]
  },
  {
    id: 'graph_nhatbien_1',
    title: 'Đồ thị 2: Hàm nhất biến $y = \\frac{2x - 1}{x + 1}$ (TCĐ $x = -1$, TCN $y = 2$)',
    type: 'graph',
    category: 'Hàm nhất biến',
    description: 'Đồ thị đường cong Hyperbol với tiệm cận đứng $x = -1$, tiệm cận ngang $y = 2$.',
    promptContext: 'Đồ thị hàm nhất biến y = (2x - 1)/(x + 1) trong hệ tọa độ Oxy. Tiệm cận đứng x = -1, tiệm cận ngang y = 2. Giao Ox tại (0.5, 0), giao Oy tại (0, -1).',
    graphData: {
      kind: 'rational',
      titleLabel: 'y = (2x - 1)/(x + 1)',
      expression: '(2x - 1)/(x + 1)',
      xMin: -5,
      xMax: 4,
      yMin: -4,
      yMax: 6,
      asymptotes: [
        { type: 'vertical', val: -1, eq: 'x = -1' },
        { type: 'horizontal', val: 2, eq: 'y = 2' }
      ],
      keyPoints: [
        { x: 0, y: -1, label: '(0; -1)' },
        { x: 0.5, y: 0, label: '(1/2; 0)' }
      ]
    },
    sampleQuestions: [
      {
        content: 'Cho hàm số $y = \\frac{ax + b}{cx + d}$ có đồ thị như hình vẽ dưới đây. Tọa độ tiệm cận đứng và tiệm cận ngang của đồ thị hàm số lần lượt là:',
        options: [
          { key: 'A', text: '$x = -1$ và $y = 2$' },
          { key: 'B', text: '$x = 2$ và $y = -1$' },
          { key: 'C', text: '$x = 1$ và $y = 2$' },
          { key: 'D', text: '$x = -1$ và $y = -1$' }
        ],
        correctAnswer: 'A',
        solution: 'Đường tiệm cận đứng nét đứt vuông góc với Ox tại $x = -1$. Đường tiệm cận ngang nét đứt vuông góc với Oy tại $y = 2$. Chọn A.'
      }
    ]
  },
  {
    id: 'graph_oblique_1',
    title: 'Đồ thị 3: Hàm tiệm cận xiên $y = \\frac{x^2 - x + 1}{x - 1} = x + \\frac{1}{x-1}$ (CT GDPT 2018)',
    type: 'graph',
    category: 'Hàm tiệm cận xiên',
    description: 'Đồ thị hàm số phân thức bậc hai trên bậc nhất có tiệm cận đứng $x = 1$ và tiệm cận xiên $y = x$.',
    promptContext: 'Đồ thị hàm số y = (x^2 - x + 1)/(x - 1) = x + 1/(x-1) có tiệm cận đứng x = 1 và tiệm cận xiên y = x. Cực đại tại x = 0 (y = -1), cực tiểu tại x = 2 (y = 3).',
    graphData: {
      kind: 'oblique',
      titleLabel: 'y = x + 1/(x-1)',
      expression: 'x + 1/(x-1)',
      xMin: -3,
      xMax: 5,
      yMin: -4,
      yMax: 6,
      asymptotes: [
        { type: 'vertical', val: 1, eq: 'x = 1' },
        { type: 'oblique', val: 1, eq: 'y = x' }
      ],
      keyPoints: [
        { x: 0, y: -1, label: '(0; -1)' },
        { x: 2, y: 3, label: '(2; 3)' }
      ]
    },
    sampleQuestions: [
      {
        content: 'Cho hàm số $y = f(x) = \\frac{ax^2 + bx + c}{px + q}$ có đồ thị như hình bên. Phương trình đường tiệm cận xiên của đồ thị hàm số là:',
        options: [
          { key: 'A', text: '$y = x$' },
          { key: 'B', text: '$y = x + 1$' },
          { key: 'C', text: '$y = 2x$' },
          { key: 'D', text: '$y = -x$' }
        ],
        correctAnswer: 'A',
        solution: 'Đường tiệm cận xiên nét đứt đi qua gốc tọa độ $O(0;0)$ và điểm $(1;1)$ có phương trình $y = x$. Chọn A.'
      }
    ]
  },
  {
    id: 'graph_fprime_1',
    title: 'Đồ thị 4: Đồ thị hàm số đạo hàm $y = f\'(x)$',
    type: 'graph',
    category: 'Đồ thị đạo hàm',
    description: 'Đường cong đạo hàm $y = f\'(x)$ cắt trục hoành $Ox$ tại các điểm $x = -2, x = 1, x = 3$.',
    promptContext: 'Đồ thị đạo hàm y = f\'(x) cắt trục Ox tại x = -2, x = 1, x = 3. f\'(x) > 0 trên (-2; 1) và (3; +infinity), f\'(x) < 0 trên (-infinity; -2) và (1; 3).',
    graphData: {
      kind: 'f_prime',
      titleLabel: "y = f'(x)",
      expression: "f'(x)",
      xMin: -3.5,
      xMax: 4.5,
      yMin: -3,
      yMax: 4,
      keyPoints: [
        { x: -2, y: 0, label: 'x = -2' },
        { x: 1, y: 0, label: 'x = 1' },
        { x: 3, y: 0, label: 'x = 3' }
      ]
    },
    sampleQuestions: [
      {
        content: 'Cho hàm số $y = f(x)$ có đồ thị đạo hàm $y = f\'(x)$ như hình vẽ bên dưới. Hàm số $y = f(x)$ đồng biến trên khoảng nào dưới đây?',
        options: [
          { key: 'A', text: '$(-2; 1)$' },
          { key: 'B', text: '$(1; 3)$' },
          { key: 'C', text: '$(-\\infty; -2)$' },
          { key: 'D', text: '$(-2; 3)$' }
        ],
        correctAnswer: 'A',
        solution: 'Hàm số $y = f(x)$ đồng biến khi $f\'(x) > 0$, tức là phần đồ thị $y = f\'(x)$ nằm phía trên trục hoành Ox. Dựa vào hình vẽ, $f\'(x) > 0$ khi $x \\in (-2; 1)$ và $x \\in (3; +\\infty)$. Chọn A.'
      }
    ]
  },
  {
    id: 'bbt_sogd_hanoi_1',
    title: '[Sở GD&ĐT Hà Nội] BBT Hàm bậc ba $y = -x^3 + 3x + 2$ (CĐ tại $x = 1$, CT tại $x = -1$)',
    type: 'bbt',
    category: 'Bảng biến thiên',
    description: 'Trích từ Đề thi thử Sở GD&ĐT Hà Nội. Cực tiểu $y_{CT} = 0$ tại $x = -1$, cực đại $y_{CĐ} = 4$ tại $x = 1$.',
    promptContext: 'Bảng biến thiên hàm số y = -x^3 + 3x + 2 của Sở GD&ĐT Hà Nội. f\'(x) = 0 tại x = -1 và x = 1. Đạo hàm mang dấu - trên (-infinity; -1) và (1; +infinity), mang dấu + trên (-1; 1).',
    bbtData: {
      xValues: ['-\\infty', '-1', '1', '+\\infty'],
      fPrimeValues: ['-', '0', '+', '0', '-'],
      fValues: [
        { value: '+\\infty', type: 'infinity', position: 'top' },
        { value: '0', type: 'val', position: 'bottom' },
        { value: '4', type: 'val', position: 'top' },
        { value: '-\\infty', type: 'infinity', position: 'bottom' }
      ],
      arrows: [
        { fromIndex: 0, toIndex: 1, direction: 'down', fromVal: '+\\infty', toVal: '0' },
        { fromIndex: 1, toIndex: 2, direction: 'up', fromVal: '0', toVal: '4' },
        { fromIndex: 2, toIndex: 3, direction: 'down', fromVal: '4', toVal: '-\\infty' }
      ]
    },
    sampleQuestions: [
      {
        content: 'Cho hàm số $y = f(x)$ có bảng biến thiên như hình bên dưới (Nguồn: Sở GD&ĐT Hà Nội). Giá trị cực tiểu của hàm số đã cho là:',
        options: [
          { key: 'A', text: '$y_{CT} = 0$' },
          { key: 'B', text: '$y_{CT} = -1$' },
          { key: 'C', text: '$y_{CT} = 4$' },
          { key: 'D', text: '$y_{CT} = 1$' }
        ],
        correctAnswer: 'A',
        solution: 'Dựa vào bảng biến thiên, hàm số đạt cực tiểu tại $x = -1$ và giá trị cực tiểu là $y_{CT} = f(-1) = 0$. Chọn A.'
      }
    ]
  },

  {
    id: 'graph_sogd_vinhphuc_1',
    title: '[Sở GD&ĐT Vĩnh Phúc] Đồ thị hàm số bậc ba $y = -x^3 + 3x$',
    type: 'graph',
    category: 'Hàm bậc 3',
    description: 'Trích từ Đề thi thử Sở GD&ĐT Vĩnh Phúc. Đồ thị nhận gốc $O(0,0)$ làm tâm đối xứng, đi qua $(-1, -2)$ và $(1, 2)$.',
    promptContext: 'Đồ thị hàm số bậc ba y = -x^3 + 3x của Sở GD&ĐT Vĩnh Phúc. Cực tiểu tại (-1, -2), cực đại tại (1, 2), qua gốc O(0,0).',
    graphData: {
      kind: 'cubic',
      titleLabel: 'y = -x^3 + 3x',
      expression: '-x^3 + 3x',
      xMin: -2.5,
      xMax: 2.5,
      yMin: -3.5,
      yMax: 3.5,
      keyPoints: [
        { x: -1, y: -2, label: '(-1; -2)' },
        { x: 1, y: 2, label: '(1; 2)' },
        { x: 0, y: 0, label: 'O(0; 0)' }
      ]
    },
    sampleQuestions: [
      {
        content: 'Cho hàm số $y = f(x)$ có đồ thị như hình vẽ bên dưới (Nguồn: Sở GD&ĐT Vĩnh Phúc). Điểm cực đại của đồ thị hàm số là:',
        options: [
          { key: 'A', text: '$(1; 2)$' },
          { key: 'B', text: '$(-1; -2)$' },
          { key: 'C', text: '$x = 1$' },
          { key: 'D', text: '$y = 2$' }
        ],
        correctAnswer: 'A',
        solution: 'Điểm đỉnh lồi trên đồ thị tương ứng với tọa độ $x = 1, y = 2$. Do đó điểm cực đại của đồ thị là $(1; 2)$. Chọn A.'
      }
    ]
  },
  {
    id: 'graph_sogd_tphcm_1',
    title: '[Sở GD&ĐT TP.HCM] Đồ thị hàm nhất biến $y = \\frac{2x + 1}{x - 1}$',
    type: 'graph',
    category: 'Hàm nhất biến',
    description: 'Trích từ Đề khảo sát GDPT 2018 Sở GD&ĐT TP.Hồ Chí Minh. Đường tiệm cận đứng $x = 1$, tiệm cận ngang $y = 2$.',
    promptContext: 'Đồ thị hàm nhất biến y = (2x + 1)/(x - 1) của Sở GD&ĐT TP.HCM. Tiệm cận đứng x = 1, tiệm cận ngang y = 2.',
    graphData: {
      kind: 'rational',
      titleLabel: 'y = (2x + 1)/(x - 1)',
      expression: '(2x + 1)/(x - 1)',
      xMin: -4,
      xMax: 5,
      yMin: -4,
      yMax: 6,
      asymptotes: [
        { type: 'vertical', val: 1, eq: 'x = 1' },
        { type: 'horizontal', val: 2, eq: 'y = 2' }
      ],
      keyPoints: [
        { x: 0, y: -1, label: '(0; -1)' },
        { x: -0.5, y: 0, label: '(-1/2; 0)' }
      ]
    },
    sampleQuestions: [
      {
        content: 'Cho hàm số $y = \\frac{2x + 1}{x - 1}$ có đồ thị như hình vẽ dưới đây (Nguồn: Sở GD&ĐT TP.HCM). Giao điểm của hai đường tiệm cận có tọa độ là:',
        options: [
          { key: 'A', text: '$(1; 2)$' },
          { key: 'B', text: '$(2; 1)$' },
          { key: 'C', text: '$(-1; 2)$' },
          { key: 'D', text: '$(1; -1)$' }
        ],
        correctAnswer: 'A',
        solution: 'Đồ thị có tiệm cận đứng $x = 1$ và tiệm cận ngang $y = 2$. Giao điểm $I$ của hai đường tiệm cận có tọa độ $I(1; 2)$. Chọn A.'
      }
    ]
  },
  // --- 4 BẢNG BIẾN THIÊN MẪU MỚI (TỪ ĐỀ THI / HÌNH ẢNH) ---
  {
    id: 'bbt_mau_1_trung_phuong_3_cuc_tri',
    title: 'BBT Mẫu 1: Hàm trùng phương có 3 điểm cực trị x = -1, 0, 1 (Dạng W)',
    type: 'bbt',
    category: 'Bảng biến thiên',
    description: 'Bảng biến thiên hàm đa thức bậc 4 trùng phương với 3 điểm cực trị tại x = -1, 0, 1. Cực đại tại (0; 1), cực tiểu tại (-1; 3) và (1; 3).',
    promptContext: "Bảng biến thiên hàm số f(x): dòng x gồm -infinity, -1, 0, 1, +infinity; dòng f'(x) mang dấu - trên (-infinity; -1), bằng 0 tại x=-1, mang dấu + trên (-1; 0), bằng 0 tại x=0, mang dấu - trên (0; 1), bằng 0 tại x=1, mang dấu + trên (1; +infinity); dòng f(x) đi từ +infinity xuống 3 rồi lên 1 rồi xuống 3 rồi lên +infinity.",
    bbtData: {
      xLabel: '$x$',
      fPrimeLabel: "$f'(x)$",
      fLabel: '$f(x)$',
      xValues: ['-\\infty', '-1', '0', '1', '+\\infty'],
      fPrimeValues: ['-', '0', '+', '0', '-', '0', '+'],
      fValues: [
        { value: '+\\infty', type: 'infinity', position: 'top', xPos: 12 },
        { value: '3', type: 'val', position: 'bottom', xPos: 31 },
        { value: '1', type: 'val', position: 'top', xPos: 50 },
        { value: '3', type: 'val', position: 'bottom', xPos: 69 },
        { value: '+\\infty', type: 'infinity', position: 'top', xPos: 88 }
      ],
      arrows: [
        { fromIndex: 0, toIndex: 1, direction: 'down', fromVal: '+\\infty', toVal: '3' },
        { fromIndex: 1, toIndex: 2, direction: 'up', fromVal: '3', toVal: '1' },
        { fromIndex: 2, toIndex: 3, direction: 'down', fromVal: '1', toVal: '3' },
        { fromIndex: 3, toIndex: 4, direction: 'up', fromVal: '3', toVal: '+\\infty' }
      ]
    },
    sampleQuestions: [
      {
        content: 'Cho hàm số $y = f(x)$ có bảng biến thiên như hình vẽ bên dưới. Hàm số đồng biến trên khoảng nào dưới đây?',
        options: [
          { key: 'A', text: '$(-1; 0)$' },
          { key: 'B', text: '$(-\\infty; -1)$' },
          { key: 'C', text: '$(0; 1)$' },
          { key: 'D', text: '$(-1; 1)$' }
        ],
        correctAnswer: 'A',
        solution: 'Dựa vào bảng biến thiên, đạo hàm $f\'(x) > 0$ trên các khoảng $(-1; 0)$ và $(1; +\\infty)$, do đó hàm số đồng biến trên khoảng $(-1; 0)$. Chọn A.'
      },
      {
        content: 'Cho hàm số $y = f(x)$ liên tục trên $\\mathbb{R}$ và có bảng biến thiên như hình vẽ. Khẳng định nào sau đây là đúng?',
        options: [
          { key: 'A', text: 'Hàm số đạt cực đại tại $x = 0$ và đạt cực tiểu tại $x = \\pm 1$.' },
          { key: 'B', text: 'Giá trị cực đại của hàm số là $y_{CĐ} = 3$.' },
          { key: 'C', text: 'Hàm số có đúng 2 điểm cực trị.' },
          { key: 'D', text: 'Hàm số đồng biến trên khoảng $(-\\infty; 0)$.' }
        ],
        correctAnswer: 'A',
        solution: 'Dựa vào bảng biến thiên, tại $x = 0$, $f\'(x)$ đổi dấu từ $(+)$ sang $(-)$ nên $x = 0$ là điểm cực đại (với $y_{CĐ} = 1$). Tại $x = -1$ và $x = 1$, $f\'(x)$ đổi dấu từ $(-)$ sang $(+)$ nên $x = \\pm 1$ là các điểm cực tiểu (với $y_{CT} = 3$). Chọn A.'
      },
      {
        content: 'Cho hàm số $y = f(x)$ có bảng biến thiên như hình vẽ bên dưới. Xét tính đúng/sai của các khẳng định sau:',
        statements: [
          { id: 'a', text: 'Hàm số $y = f(x)$ có 3 điểm cực trị.', isCorrect: true },
          { id: 'b', text: 'Giá trị nhỏ nhất của hàm số trên $\\mathbb{R}$ bằng $3$.', isCorrect: true },
          { id: 'c', text: 'Hàm số nghịch biến trên khoảng $(0; 1)$.', isCorrect: true },
          { id: 'd', text: 'Phương trình $f(x) = 2$ có đúng 4 nghiệm thực phân biệt.', isCorrect: false }
        ],
        solution: 'a) Đúng vì hàm số có 3 điểm cực trị là $x = -1, 0, 1$.\nb) Đúng vì $f(x) \\ge 3$ tại 2 điểm cực tiểu và khi $x \\to \\pm\\infty$ thì $f(x) \\to +\\infty$, giá trị nhỏ nhất đạt được là $3$.\nc) Đúng vì trên $(0; 1)$ có $f\'(x) < 0$.\nd) Sai vì giá trị nhỏ nhất của hàm số là $3$, do đó đường thẳng $y = 2$ nằm phía dưới giá trị nhỏ nhất nên phương trình $f(x) = 2$ vô nghiệm.'
      }
    ]
  },
  {
    id: 'bbt_mau_2_tiem_can_dung_am1_cuc_tieu_0',
    title: 'BBT Mẫu 2: Hàm số có TCĐ x = -1, TCN y = -1, y = 1 và cực tiểu tại x = 0',
    type: 'bbt',
    category: 'Bảng biến thiên',
    description: 'Bảng biến thiên có đường tiệm cận đứng x = -1 (hai gạch qua cả y\' và y), điểm x = 0 không có đạo hàm nhưng hàm số liên tục và đạt cực tiểu tại (0; 0).',
    promptContext: "Bảng biến thiên hàm số y: dòng x gồm -infinity, -1, 0, +infinity; dòng y' mang dấu - trên (-infinity; -1), không xác định (||) tại x=-1, mang dấu - trên (-1; 0), không xác định (||) tại x=0, mang dấu + trên (0; +infinity); dòng y: từ -1 giảm xuống -infinity (tiến về bên trái -1), từ +infinity giảm xuống 0 (tại x=0) rồi tăng lên 1 (khi x -> +infinity).",
    bbtData: {
      xLabel: '$x$',
      fPrimeLabel: "$y'$",
      fLabel: '$y$',
      xValues: ['-\\infty', '-1', '0', '+\\infty'],
      fPrimeValues: ['-', '||', '-', '||', '+'],
      doubleLines: [
        { xIndex: 1, color: 'slate', rows: 'all' },
        { xIndex: 2, color: 'slate', rows: 'prime' }
      ],
      fValues: [
        { value: '-1', type: 'val', position: 'middle', xPos: 12 },
        { value: '-\\infty', type: 'infinity', position: 'bottom', xPos: 32 },
        { value: '+\\infty', type: 'infinity', position: 'top', xPos: 43 },
        { value: '0', type: 'val', position: 'bottom', xPos: 63 },
        { value: '1', type: 'val', position: 'middle', xPos: 88 }
      ],
      arrows: [
        { fromIndex: 0, toIndex: 1, direction: 'down', fromVal: '-1', toVal: '-\\infty' },
        { fromIndex: 2, toIndex: 3, direction: 'down', fromVal: '+\\infty', toVal: '0' },
        { fromIndex: 3, toIndex: 4, direction: 'up', fromVal: '0', toVal: '1' }
      ]
    },
    sampleQuestions: [
      {
        content: 'Cho hàm số $y = f(x)$ có bảng biến thiên như hình vẽ bên dưới. Tổng số đường tiệm cận đứng và tiệm cận ngang của đồ thị hàm số là:',
        options: [
          { key: 'A', text: '$3$' },
          { key: 'B', text: '$2$' },
          { key: 'C', text: '$1$' },
          { key: 'D', text: '$4$' }
        ],
        correctAnswer: 'A',
        solution: 'Dựa vào bảng biến thiên:\n- $\\lim_{x \\to -1^-} y = -\\infty$ và $\\lim_{x \\to -1^+} y = +\\infty \\implies$ Đồ thị có 1 tiệm cận đứng $x = -1$.\n- $\\lim_{x \\to -\\infty} y = -1 \\implies$ Tiệm cận ngang $y = -1$.\n- $\\lim_{x \\to +\\infty} y = 1 \\implies$ Tiệm cận ngang $y = 1$.\nTổng cộng có $1 + 2 = 3$ đường tiệm cận. Chọn A.'
      },
      {
        content: 'Cho hàm số $y = f(x)$ có bảng biến thiên như hình vẽ bên dưới. Điểm cực tiểu của hàm số đã cho là:',
        options: [
          { key: 'A', text: '$x = 0$' },
          { key: 'B', text: '$x = -1$' },
          { key: 'C', text: '$x = 1$' },
          { key: 'D', text: '$y = 0$' }
        ],
        correctAnswer: 'A',
        solution: 'Tại $x = 0$, hàm số liên tục, đạo hàm $y\'$ đổi dấu từ âm $(-)$ sang dương $(+)$ khi đi qua $x = 0$, do đó hàm số đạt cực tiểu tại điểm $x = 0$. Chọn A.'
      }
    ]
  },
  {
    id: 'bbt_mau_3_mien_gach_cheo_khong_xac_dinh',
    title: 'BBT Mẫu 3: Hàm số không xác định trên (1; +\\infty), có miền gạch chéo và TCĐ x = -1, x = 1',
    type: 'bbt',
    category: 'Bảng biến thiên',
    description: 'Bảng biến thiên có miền gạch chéo không xác định trên khoảng (1; +\\infty), tiệm cận đứng x = -1 và x = 1, điểm cực đại tại (0; 2).',
    promptContext: "Bảng biến thiên hàm số f(x): dòng x gồm -infinity, -1, 0, 1, +infinity; khoảng (1; +infinity) bị gạch chéo không xác định; dòng f'(x) mang dấu + trên (-infinity; -1), vách ngăn tại x=-1, mang dấu + trên (-1; 0), không xác định (||) tại x=0, mang dấu - trên (0; 1), không xác định (||) tại x=1; dòng f(x) đi từ 3 lên +infinity, rồi từ -5 lên 2 (tại x=0) rồi giảm xuống -infinity.",
    bbtData: {
      xLabel: '$x$',
      fPrimeLabel: "$f'(x)$",
      fLabel: '$f(x)$',
      xValues: ['-\\infty', '-1', '0', '1', '+\\infty'],
      fPrimeValues: ['+', '|', '+', '||', '-', '||', ''],
      singleDividers: [{ xIndex: 1, color: 'slate', rows: 'all' }],
      doubleLines: [
        { xIndex: 2, color: 'slate', rows: 'prime' },
        { xIndex: 3, color: 'slate', rows: 'all' }
      ],
      hatchedRegions: [{ fromXIndex: 3, toXIndex: 4 }],
      fValues: [
        { value: '3', type: 'val', position: 'bottom', xPos: 12 },
        { value: '+\\infty', type: 'infinity', position: 'top', xPos: 27 },
        { value: '-5', type: 'val', position: 'bottom', xPos: 35 },
        { value: '2', type: 'val', position: 'top', xPos: 50 },
        { value: '-\\infty', type: 'infinity', position: 'bottom', xPos: 65 }
      ],
      arrows: [
        { fromIndex: 0, toIndex: 1, direction: 'up', fromVal: '3', toVal: '+\\infty' },
        { fromIndex: 2, toIndex: 3, direction: 'up', fromVal: '-5', toVal: '2' },
        { fromIndex: 3, toIndex: 4, direction: 'down', fromVal: '2', toVal: '-\\infty' }
      ]
    },
    sampleQuestions: [
      {
        content: 'Cho hàm số $y = f(x)$ có bảng biến thiên như hình vẽ bên dưới. Tập xác định của hàm số đã cho là:',
        options: [
          { key: 'A', text: '$(-\\infty; 1) \\setminus \\{-1\\}$' },
          { key: 'B', text: '$(-\\infty; 1)$' },
          { key: 'C', text: '$(-\\infty; +\\infty) \\setminus \\{-1; 1\\}$' },
          { key: 'D', text: '$(-1; 1)$' }
        ],
        correctAnswer: 'A',
        solution: 'Dựa vào bảng biến thiên, hàm số không xác định trên khoảng $(1; +\\infty)$ và tại điểm $x = -1$. Do đó tập xác định của hàm số là $D = (-\\infty; 1) \\setminus \\{-1\\}$. Chọn A.'
      },
      {
        content: 'Cho hàm số $y = f(x)$ có bảng biến thiên như hình vẽ bên dưới. Điểm cực đại của hàm số đã cho là:',
        options: [
          { key: 'A', text: '$x = 0$' },
          { key: 'B', text: '$x = 2$' },
          { key: 'C', text: '$x = -1$' },
          { key: 'D', text: '$x = 1$' }
        ],
        correctAnswer: 'A',
        solution: 'Tại $x = 0$, hàm số liên tục, đạo hàm đổi dấu từ dương $(+)$ sang âm $(-)$, do đó hàm số đạt cực đại tại điểm $x = 0$ (với giá trị cực đại $y_{CĐ} = 2$). Chọn A.'
      }
    ]
  },
  {
    id: 'bbt_mau_4_hai_tiem_can_dung_song_song_do',
    title: 'BBT Mẫu 4: Hàm số có 2 tiệm cận đứng x = 1, x = 5 (Hai vạch song song màu đỏ), TCN y = -2, y = 2025',
    type: 'bbt',
    category: 'Bảng biến thiên',
    description: 'Bảng biến thiên hàm số có 2 đường tiệm cận đứng x = 1 và x = 5 (vẽ vạch đôi màu đỏ nổi bật), 2 đường tiệm cận ngang y = -2 và y = 2025.',
    promptContext: "Bảng biến thiên hàm số y: dòng x gồm -infinity, 1, 5, +infinity; dòng y' mang dấu + trên (-infinity; 1), hai gạch đỏ (||) tại x=1, mang dấu - trên (1; 5), hai gạch đỏ (||) tại x=5, mang dấu + trên (5; +infinity); dòng y: từ -2 tăng lên +infinity, rồi từ 3 giảm xuống -infinity, rồi từ 0 tăng lên 2025.",
    bbtData: {
      xLabel: '$x$',
      fPrimeLabel: "$y'$",
      fLabel: '$y$',
      xValues: ['-\\infty', '1', '5', '+\\infty'],
      fPrimeValues: ['+', '||', '-', '||', '+'],
      doubleLines: [
        { xIndex: 1, color: 'red', rows: 'all' },
        { xIndex: 2, color: 'red', rows: 'all' }
      ],
      fValues: [
        { value: '-2', type: 'val', position: 'bottom', xPos: 12 },
        { value: '+\\infty', type: 'infinity', position: 'top', xPos: 32 },
        { value: '3', type: 'val', position: 'top', xPos: 42 },
        { value: '-\\infty', type: 'infinity', position: 'bottom', xPos: 58 },
        { value: '0', type: 'val', position: 'bottom', xPos: 67 },
        { value: '2025', type: 'val', position: 'top', xPos: 88 }
      ],
      arrows: [
        { fromIndex: 0, toIndex: 1, direction: 'up', fromVal: '-2', toVal: '+\\infty' },
        { fromIndex: 2, toIndex: 3, direction: 'down', fromVal: '3', toVal: '-\\infty' },
        { fromIndex: 4, toIndex: 5, direction: 'up', fromVal: '0', toVal: '2025' }
      ]
    },
    sampleQuestions: [
      {
        content: 'Cho hàm số $y = f(x)$ có bảng biến thiên như hình vẽ bên dưới. Tổng số đường tiệm cận đứng và tiệm cận ngang của đồ thị hàm số là:',
        options: [
          { key: 'A', text: '$4$' },
          { key: 'B', text: '$3$' },
          { key: 'C', text: '$2$' },
          { key: 'D', text: '$5$' }
        ],
        correctAnswer: 'A',
        solution: 'Dựa vào bảng biến thiên:\n- $\\lim_{x \\to 1^-} y = +\\infty \\implies$ Tiệm cận đứng $x = 1$.\n- $\\lim_{x \\to 5^-} y = -\\infty \\implies$ Tiệm cận đứng $x = 5$.\n- $\\lim_{x \\to -\\infty} y = -2 \\implies$ Tiệm cận ngang $y = -2$.\n- $\\lim_{x \\to +\\infty} y = 2025 \\implies$ Tiệm cận ngang $y = 2025$.\nTổng cộng đồ thị có 4 đường tiệm cận ($2$ tiệm cận đứng và $2$ tiệm cận ngang). Chọn A.'
      },
      {
        content: 'Cho hàm số $y = f(x)$ có bảng biến thiên như hình vẽ bên dưới. Phương trình $f(x) = 2$ có bao nhiêu nghiệm thực phân biệt?',
        options: [
          { key: 'A', text: '$3$' },
          { key: 'B', text: '$2$' },
          { key: 'C', text: '$1$' },
          { key: 'D', text: '$4$' }
        ],
        correctAnswer: 'A',
        solution: 'Số nghiệm của phương trình $f(x) = 2$ là số giao điểm của đồ thị hàm số $y = f(x)$ và đường thẳng nằm ngang $y = 2$:\n- Trên khoảng $(-\\infty; 1)$, hàm số tăng từ $-2$ đến $+\\infty$, nên cắt đường thẳng $y = 2$ tại đúng $1$ điểm (vì $-2 < 2 < +\\infty$).\n- Trên khoảng $(1; 5)$, hàm số giảm từ $3$ xuống $-\\infty$, nên cắt đường thẳng $y = 2$ tại đúng $1$ điểm (vì $-\\infty < 2 < 3$).\n- Trên khoảng $(5; +\\infty)$, hàm số tăng từ $0$ lên $2025$, nên cắt đường thẳng $y = 2$ tại đúng $1$ điểm (vì $0 < 2 < 2025$).\nVậy phương trình $f(x) = 2$ có tất cả $1 + 1 + 1 = 3$ nghiệm thực phân biệt. Chọn A.'
      }
    ]
  }
];

export const getDiagramById = (id: string): DiagramItem | undefined => {
  return DIAGRAM_BANK.find((d) => d.id === id);
};
