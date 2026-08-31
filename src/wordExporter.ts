import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  BorderStyle,
  HeadingLevel,
  ShadingType,
  VerticalAlign,
  PageOrientation,
  SectionType,
  VerticalAlignSection,
  convertMillimetersToTwip,
  ImageRun,
} from 'docx';
import JSZip from 'jszip';
import saveAs from 'file-saver';
import { GeneratedTest, Question } from '../types';
import { extractTestMetadata } from './testBankStorage';
import { buildStandardMatrixData, StandardMatrixData } from './matrixStandardGenerator';
import { generateQuestionDiagramImage, GeneratedImageData } from './diagramImageGenerator';
import { MATH_12_SYLLABUS } from '../data/math12Syllabus';

/**
 * Standard Page Setup according to the required specifications:
 * - Margins: Top: 1cm, Bottom: 1cm, Inside (Left): 2cm, Outside (Right): 1cm, Gutter: 0cm
 * - Orientation: Portrait
 * - Multiple pages: Mirror margins
 * - Section start: New page
 * - Header from edge: 0.6cm, Footer from edge: 0.6cm
 * - Page Vertical alignment: Top
 */
export const STANDARD_WORD_PAGE_PROPERTIES = {
  type: SectionType.NEXT_PAGE,
  verticalAlign: VerticalAlignSection.TOP,
  page: {
    size: {
      orientation: PageOrientation.PORTRAIT,
    },
    margin: {
      top: convertMillimetersToTwip(10), // 1.0 cm
      bottom: convertMillimetersToTwip(10), // 1.0 cm
      left: convertMillimetersToTwip(20), // Inside (Trong): 2.0 cm
      right: convertMillimetersToTwip(10), // Outside (Ngoài): 1.0 cm
      header: convertMillimetersToTwip(6), // 0.6 cm
      footer: convertMillimetersToTwip(6), // 0.6 cm
      gutter: 0,
    },
  },
};

/**
 * Saves generated Word document with Mirror Margins enabled in settings.xml
 */
async function saveDocxWithStandardPageSetup(doc: Document, fileName: string): Promise<void> {
  const blob = await Packer.toBlob(doc);
  try {
    const zip = await JSZip.loadAsync(blob);
    let settings = await zip.file('word/settings.xml')?.async('string');
    if (settings && !settings.includes('<w:mirrorMargins')) {
      settings = settings.replace('</w:settings>', '<w:mirrorMargins/></w:settings>');
      zip.file('word/settings.xml', settings);
      const updatedBlob = await zip.generateAsync({
        type: 'blob',
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      });
      saveAs(updatedBlob, fileName);
      return;
    }
  } catch (err) {
    console.warn('Error injecting mirrorMargins into docx settings:', err);
  }
  saveAs(blob, fileName);
}

/**
 * Ensures mathematical formulas and expressions in text are correctly formatted as LaTeX and enclosed in $...$
 */
export function formatMathTextToLatexWord(text: string | number | undefined | null): string {
  if (text === undefined || text === null) return '';
  let str = String(text).trim();

  // Normalize <br> tags to standard newlines
  str = str.replace(/<br\s*\/?>/gi, '\n');

  // Normalize double $$ to single $ for Word compatibility
  str = str.replace(/\$\$(.*?)\$\$/g, '$$$1$$');

  // Auto-convert incorrect \begin{cases} used for single-variable roots/disjunctions (OR) to \left[\begin{array}{l}...\end{array}\right.
  str = str.replace(/\\begin\{cases\}([\s\S]*?)\\end\{cases\}/g, (match, inner) => {
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

  // If text already has $...$, return cleaned string
  if (str.includes('$')) {
    return str;
  }

  // If text has NO $ at all, check if it contains math formulas/LaTeX syntax
  const hasLatexCommand = /\\(frac|sqrt|vec|int|lim|alpha|beta|gamma|delta|theta|pi|infty|in|notin|subset|cup|cap|rightarrow|Rightarrow|le|ge|neq|pm|times|div|mathbb|mathbf|text|mathcal)/.test(str);
  const hasMathSymbols = /[\^_\=\{\}\>\<]/;

  if (hasLatexCommand) {
    // If pure math expression or LaTeX
    const isPureMath = !/[a-zA-ZÀ-ỹ]{4,}/.test(str.replace(/\\([a-zA-Z]+)/g, ''));
    if (isPureMath) {
      return `$${str}$`;
    } else {
      // Wrap LaTeX parts in $...$
      return str.replace(/(\\([a-zA-Z]+)(\{.*?\})*|([a-zA-Z0-9_\^]+\s*[\=><\+\-\*\/]\s*[a-zA-Z0-9_\^\\\{\}\.\,\-]+))/g, (m) => `$${m}$`);
    }
  } else if (hasMathSymbols.test(str)) {
    const isShortMath = !/[a-zA-ZÀ-ỹ]{4,}/.test(str);
    if (isShortMath && str.length > 0) {
      return `$${str}$`;
    }
  }

  return str;
}

export const exportTestToWord = async (test: GeneratedTest, customFileName?: string) => {
  const { config, questions, matrix, summary } = test;

  // Separate questions by type
  const mcqList = questions.filter((q) => q.type === 'multiple_choice');
  const trueFalseList = questions.filter((q) => q.type === 'true_false');
  const shortAnswerList = questions.filter((q) => q.type === 'short_answer');

  const docChildren: any[] = [];

  // Header Table: School & Title
  docChildren.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        top: { style: BorderStyle.NONE },
        bottom: { style: BorderStyle.NONE },
        left: { style: BorderStyle.NONE },
        right: { style: BorderStyle.NONE },
        insideHorizontal: { style: BorderStyle.NONE },
        insideVertical: { style: BorderStyle.NONE },
      },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              width: { size: 50, type: WidthType.PERCENTAGE },
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new TextRun({ text: config.schoolName.toUpperCase(), bold: true, size: 22 }),
                  ],
                }),
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new TextRun({ text: (config.departmentName || 'TỔ TOÁN').toUpperCase(), italics: true, size: 20 }),
                  ],
                }),
              ],
            }),
            new TableCell({
              width: { size: 50, type: WidthType.PERCENTAGE },
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new TextRun({ text: 'ĐỀ KIỂM TRA MÔN TOÁN LỚP 12', bold: true, size: 22 }),
                  ],
                }),
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new TextRun({ text: `Chương trình GDPT 2018 - Năm học: ${config.academicYear || '2026 - 2027'}`, italics: true, size: 20 }),
                  ],
                }),
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new TextRun({ text: `Thời gian làm bài: ${config.durationMinutes} phút`, italics: true, bold: true, size: 20 }),
                  ],
                }),
              ],
            }),
          ],
        }),
      ],
    })
  );

  docChildren.push(new Paragraph({ text: '', spacing: { after: 200 } }));

  // Title
  docChildren.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      heading: HeadingLevel.HEADING_1,
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: config.title.toUpperCase(),
          bold: true,
          size: 26,
          color: '1A365D',
        }),
      ],
    })
  );

  // Pre-generate visual diagram/BBT/graph images for all questions
  const questionDiagramMap = new Map<string, GeneratedImageData>();
  await Promise.all(
    questions.map(async (q) => {
      try {
        const img = await generateQuestionDiagramImage(q);
        if (img) {
          questionDiagramMap.set(q.id, img);
        }
      } catch (err) {
        console.warn(`Could not generate diagram image for question ${q.id}:`, err);
      }
    })
  );

  // Helper to create centered diagram paragraph in Word doc
  const createDiagramParagraph = (img: GeneratedImageData) => {
    return new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 80, after: 120 },
      children: [
        new ImageRun({
          data: img.data,
          transformation: {
            width: img.width,
            height: img.height,
          },
          type: img.type,
        }),
      ],
    });
  };

  // PART 1: Multiple Choice
  if (mcqList.length > 0) {
    docChildren.push(
      new Paragraph({
        spacing: { before: 200, after: 100 },
        children: [
          new TextRun({
            text: 'PHẦN I. Câu trắc nghiệm nhiều phương án lựa chọn. ',
            bold: true,
            size: 24,
          }),
          new TextRun({
            text: `Thí sinh trả lời từ câu 1 đến câu ${mcqList.length}. Mỗi câu hỏi thí sinh chỉ chọn một phương án.`,
            italics: true,
            size: 22,
          }),
        ],
      })
    );

    mcqList.forEach((q, idx) => {
      docChildren.push(
        new Paragraph({
          spacing: { before: 120, after: 60 },
          children: [
            new TextRun({ text: `Câu ${idx + 1}: `, bold: true, size: 22 }),
            new TextRun({ text: formatMathTextToLatexWord(q.content), size: 22 }),
          ],
        })
      );

      // Render Visual Diagram (Bảng biến thiên / Đồ thị / Hình ảnh) if available
      const diagramImg = questionDiagramMap.get(q.id);
      if (diagramImg) {
        docChildren.push(createDiagramParagraph(diagramImg));
      }

      if (q.type === 'multiple_choice') {
        q.options.forEach((opt) => {
          docChildren.push(
            new Paragraph({
              indent: { left: 360 },
              spacing: { after: 40 },
              children: [
                new TextRun({ text: `${opt.key}. `, bold: true, size: 22 }),
                new TextRun({ text: formatMathTextToLatexWord(opt.text), size: 22 }),
              ],
            })
          );
        });
      }
    });
  }

  // PART 2: True/False
  if (trueFalseList.length > 0) {
    docChildren.push(
      new Paragraph({
        spacing: { before: 300, after: 100 },
        children: [
          new TextRun({
            text: 'PHẦN II. Câu trắc nghiệm Đúng/Sai. ',
            bold: true,
            size: 24,
          }),
          new TextRun({
            text: `Thí sinh trả lời từ câu 1 đến câu ${trueFalseList.length}. Trong mỗi ý a), b), c), d) ở mỗi câu, thí sinh chọn Đúng hoặc Sai.`,
            italics: true,
            size: 22,
          }),
        ],
      })
    );

    trueFalseList.forEach((q, idx) => {
      docChildren.push(
        new Paragraph({
          spacing: { before: 120, after: 60 },
          children: [
            new TextRun({ text: `Câu ${idx + 1}: `, bold: true, size: 22 }),
            new TextRun({ text: formatMathTextToLatexWord(q.content), size: 22 }),
          ],
        })
      );

      // Render Visual Diagram (Bảng biến thiên / Đồ thị / Hình ảnh) if available
      const diagramImg = questionDiagramMap.get(q.id);
      if (diagramImg) {
        docChildren.push(createDiagramParagraph(diagramImg));
      }

      if (q.type === 'true_false') {
        q.statements.forEach((st) => {
          docChildren.push(
            new Paragraph({
              indent: { left: 360 },
              spacing: { after: 40 },
              children: [
                new TextRun({ text: `${st.id.toLowerCase()}) `, bold: true, size: 22 }),
                new TextRun({ text: formatMathTextToLatexWord(st.text), size: 22 }),
              ],
            })
          );
        });
      }
    });
  }

  // PART 3: Short Answer
  if (shortAnswerList.length > 0) {
    docChildren.push(
      new Paragraph({
        spacing: { before: 300, after: 100 },
        children: [
          new TextRun({
            text: 'PHẦN III. Câu trắc nghiệm trả lời ngắn (Điền kết quả 4 ký tự). ',
            bold: true,
            size: 24,
          }),
          new TextRun({
            text: `Thí sinh trả lời từ câu 1 đến câu ${shortAnswerList.length}. Mỗi câu hỏi thí sinh viết đáp số (tối đa 4 ký tự) vào ô trả lời.`,
            italics: true,
            size: 22,
          }),
        ],
      })
    );

    shortAnswerList.forEach((q, idx) => {
      docChildren.push(
        new Paragraph({
          spacing: { before: 120, after: 60 },
          children: [
            new TextRun({ text: `Câu ${idx + 1}: `, bold: true, size: 22 }),
            new TextRun({ text: formatMathTextToLatexWord(q.content), size: 22 }),
          ],
        })
      );

      // Render Visual Diagram (Bảng biến thiên / Đồ thị / Hình ảnh) if available
      const diagramImg = questionDiagramMap.get(q.id);
      if (diagramImg) {
        docChildren.push(createDiagramParagraph(diagramImg));
      }

      // Optical answer box representation for Word output
      docChildren.push(
        new Paragraph({
          indent: { left: 300 },
          spacing: { before: 40, after: 100 },
          children: [
            new TextRun({ text: 'Ô trả lời (tối đa 4 ký tự): [   ][   ][   ][   ]', bold: true, color: '6B7280', size: 20 }),
          ],
        })
      );
    });
  }

  // Page Break for Answer Key & Explanations
  docChildren.push(
    new Paragraph({
      pageBreakBefore: true,
      alignment: AlignmentType.CENTER,
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 200, after: 200 },
      children: [
        new TextRun({
          text: 'ĐÁP ÁN VÀ LỜI GIẢI CHI TIẾT',
          bold: true,
          size: 26,
          color: '1A365D',
        }),
      ],
    })
  );

  questions.forEach((q, idx) => {
    docChildren.push(
      new Paragraph({
        spacing: { before: 140, after: 40 },
        children: [
          new TextRun({ text: `Câu ${idx + 1} (${q.type === 'multiple_choice' ? 'PHẦN I' : q.type === 'true_false' ? 'PHẦN II' : 'PHẦN III'}): `, bold: true, size: 22 }),
          new TextRun({ text: `[${q.topicName} - ${q.level}]`, italics: true, size: 20, color: '4A5568' }),
        ],
      })
    );

    // If there is a diagram, we can also render it before the answer/solution for complete context
    const diagramImg = questionDiagramMap.get(q.id);
    if (diagramImg) {
      docChildren.push(createDiagramParagraph(diagramImg));
    }

    if (q.type === 'multiple_choice') {
      docChildren.push(
        new Paragraph({
          indent: { left: 200 },
          children: [
            new TextRun({ text: 'Đáp án đúng: ', bold: true, size: 22 }),
            new TextRun({ text: formatMathTextToLatexWord(q.correctAnswer), bold: true, color: '2B6CB0', size: 22 }),
          ],
        })
      );
    } else if (q.type === 'true_false') {
      docChildren.push(
        new Paragraph({
          indent: { left: 200 },
          children: [
            new TextRun({ text: 'Đáp án: ', bold: true, size: 22 }),
            new TextRun({
              text: q.statements.map((s) => `${s.id.toLowerCase()}) ${s.isCorrect ? 'Đ' : 'S'}`).join(' | '),
              bold: true,
              color: '2B6CB0',
              size: 22,
            }),
          ],
        })
      );
    } else if (q.type === 'short_answer') {
      docChildren.push(
        new Paragraph({
          indent: { left: 200 },
          children: [
            new TextRun({ text: 'Đáp số: ', bold: true, size: 22 }),
            new TextRun({ text: formatMathTextToLatexWord(String(q.correctAnswer)), bold: true, color: '2B6CB0', size: 22 }),
          ],
        })
      );
    }

    docChildren.push(
      new Paragraph({
        indent: { left: 200 },
        spacing: { after: 100 },
        children: [
          new TextRun({ text: 'Lời giải chi tiết: ', italics: true, bold: true, size: 22 }),
          new TextRun({ text: formatMathTextToLatexWord(q.solution), size: 22 }),
        ],
      })
    );
  });

  // Section C: 1. MA TRẬN THEO DẠNG CÂU HỎI (ĐỊNH DẠNG BỘ GD&ĐT - TRONG ẢNH)
  const questionFormatElements = buildQuestionFormatMatrixDocxElements(test, true);
  docChildren.push(...questionFormatElements);

  // Section D: 2. MA TRẬN CHI TIẾT YCCĐ (PHÂN BỐ SỐ CÂU THEO TỪNG CHỦ ĐỀ, BÀI HỌC VÀ YCCĐ - TRONG ẢNH)
  const outcomeDetailElements = buildOutcomeDetailMatrixDocxElements(test, true);
  docChildren.push(...outcomeDetailElements);

  // Section E: 3. MA TRẬN ĐỀ KIỂM TRA ĐỊNH KÌ (CHUẨN 19 CỘT THEO GDPT 2018)
  const matrixElements = buildStandardMatrixDocxElements(test, true);
  docChildren.push(...matrixElements);

  // Section F: 4. BẢNG ĐẶC TẢ KĨ THUẬT ĐỀ KIỂM TRA ĐỊNH KÌ (YCCĐ CHI TIẾT)
  const specMatrixElements = buildSpecMatrixDocxElements(test, true);
  docChildren.push(...specMatrixElements);

  const doc = new Document({
    evenAndOddHeaderAndFooters: false,
    sections: [
      {
        properties: STANDARD_WORD_PAGE_PROPERTIES,
        children: docChildren,
      },
    ],
  });

  const meta = extractTestMetadata(test);
  const safeName = customFileName
    ? (customFileName.endsWith('.docx') ? customFileName : `${customFileName}.docx`)
    : `${meta.cleanFileName}.docx`;
  await saveDocxWithStandardPageSetup(doc, safeName);
};

/**
 * Helper to build Docx elements for Matrix 1 (In uploaded image):
 * BẢNG MA TRẬN THEO DẠNG CÂU HỎI (ĐỊNH DẠNG BỘ GD&ĐT)
 */
export function buildQuestionFormatMatrixDocxElements(test: GeneratedTest, isPartOfFullDoc: boolean = false): (Paragraph | Table)[] {
  const { questions, config } = test;
  const elements: (Paragraph | Table)[] = [];

  const mcq = questions.filter((q) => q.type === 'multiple_choice');
  const tf = questions.filter((q) => q.type === 'true_false');
  const sa = questions.filter((q) => q.type === 'short_answer');

  const counts = {
    mcq: {
      nb: mcq.filter((q) => q.level === 'NhanBiet').length,
      th: mcq.filter((q) => q.level === 'ThongHieu').length,
      vd: mcq.filter((q) => q.level === 'VanDung').length,
      total: mcq.length,
    },
    tf: {
      nb: tf.filter((q) => q.level === 'NhanBiet').length,
      th: tf.filter((q) => q.level === 'ThongHieu').length,
      vd: tf.filter((q) => q.level === 'VanDung').length,
      total: tf.length,
    },
    sa: {
      nb: sa.filter((q) => q.level === 'NhanBiet').length,
      th: sa.filter((q) => q.level === 'ThongHieu').length,
      vd: sa.filter((q) => q.level === 'VanDung').length,
      total: sa.length,
    },
  };

  const totalNB = counts.mcq.nb + counts.tf.nb + counts.sa.nb;
  const totalTH = counts.mcq.th + counts.tf.th + counts.sa.th;
  const totalVD = counts.mcq.vd + counts.tf.vd + counts.sa.vd;
  const totalQuestions = questions.length;
  const totalScore = (counts.mcq.total * 0.25 + counts.tf.total * 1.0 + counts.sa.total * 0.5).toFixed(1);

  // Title
  elements.push(
    new Paragraph({
      pageBreakBefore: isPartOfFullDoc,
      alignment: AlignmentType.CENTER,
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 200, after: 80 },
      children: [
        new TextRun({
          text: 'I. BẢNG MA TRẬN THEO DẠNG CÂU HỎI (ĐỊNH DẠNG BỘ GD&ĐT)',
          bold: true,
          size: 24,
          color: '000000',
        }),
      ],
    })
  );

  elements.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 150 },
      children: [
        new TextRun({
          text: `Môn: TOÁN 12 - Thời gian: ${config.durationMinutes || 45} phút | Tổng: ${totalQuestions} câu (${totalScore} điểm)`,
          italics: true,
          size: 20,
          color: '334155',
        }),
      ],
    })
  );

  const makeSimpleHeaderCell = (text: string, fill = 'F1F5F9', align: any = AlignmentType.CENTER): TableCell => {
    return new TableCell({
      verticalAlign: VerticalAlign.CENTER,
      shading: { fill, type: ShadingType.CLEAR },
      children: [
        new Paragraph({
          alignment: align,
          children: [new TextRun({ text, bold: true, size: 18, color: '000000' })],
        }),
      ],
    });
  };

  const makeSimpleDataCell = (text: string, isBold = false, align: any = AlignmentType.CENTER, fill?: string): TableCell => {
    return new TableCell({
      verticalAlign: VerticalAlign.CENTER,
      shading: fill ? { fill, type: ShadingType.CLEAR } : undefined,
      children: [
        new Paragraph({
          alignment: align,
          children: [new TextRun({ text, bold: isBold, size: 18, color: '000000' })],
        }),
      ],
    });
  };

  const tableRows: TableRow[] = [];

  // Table 1: Header Row
  tableRows.push(
    new TableRow({
      children: [
        makeSimpleHeaderCell('Dạng câu hỏi (Định dạng Bộ GD&ĐT)', 'F1F5F9', AlignmentType.LEFT),
        makeSimpleHeaderCell('Nhận biết', 'DCFCE7'),
        makeSimpleHeaderCell('Thông hiểu', 'DBEAFE'),
        makeSimpleHeaderCell('Vận dụng', 'FEF3C7'),
        makeSimpleHeaderCell('Tổng số câu', 'E2E8F0'),
      ],
    })
  );

  // Row 1: MCQ
  tableRows.push(
    new TableRow({
      children: [
        makeSimpleDataCell('Phần I: Trắc nghiệm 4 lựa chọn (Chọn 1 phương án)', true, AlignmentType.LEFT),
        makeSimpleDataCell(String(counts.mcq.nb)),
        makeSimpleDataCell(String(counts.mcq.th)),
        makeSimpleDataCell(String(counts.mcq.vd)),
        makeSimpleDataCell(`${counts.mcq.total} câu`, true),
      ],
    })
  );

  // Row 2: TF
  tableRows.push(
    new TableRow({
      children: [
        makeSimpleDataCell('Phần II: Trắc nghiệm Đúng/Sai (Mỗi câu gồm 4 ý a, b, c, d)', true, AlignmentType.LEFT),
        makeSimpleDataCell(String(counts.tf.nb)),
        makeSimpleDataCell(String(counts.tf.th)),
        makeSimpleDataCell(String(counts.tf.vd)),
        makeSimpleDataCell(`${counts.tf.total} câu`, true),
      ],
    })
  );

  // Row 3: SA
  tableRows.push(
    new TableRow({
      children: [
        makeSimpleDataCell('Phần III: Trắc nghiệm trả lời ngắn / Tự luận', true, AlignmentType.LEFT),
        makeSimpleDataCell(String(counts.sa.nb)),
        makeSimpleDataCell(String(counts.sa.th)),
        makeSimpleDataCell(String(counts.sa.vd)),
        makeSimpleDataCell(`${counts.sa.total} câu`, true),
      ],
    })
  );

  // Row 4: Summary
  tableRows.push(
    new TableRow({
      children: [
        makeSimpleDataCell('TỔNG CỘNG SỐ CÂU:', true, AlignmentType.LEFT, 'F8FAFC'),
        makeSimpleDataCell(`${totalNB} câu`, true, AlignmentType.CENTER, 'DCFCE7'),
        makeSimpleDataCell(`${totalTH} câu`, true, AlignmentType.CENTER, 'DBEAFE'),
        makeSimpleDataCell(`${totalVD} câu`, true, AlignmentType.CENTER, 'FEF3C7'),
        makeSimpleDataCell(`${totalQuestions} câu`, true, AlignmentType.CENTER, 'E2E8F0'),
      ],
    })
  );

  elements.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: tableRows,
    })
  );

  // Preview Box Table
  const uniqueTopics = Array.from(new Set(questions.map((q) => q.topicName || 'Toán 12')));
  const uniqueLessons = Array.from(new Set(questions.map((q) => q.lessonName || 'Toán 12')));

  elements.push(
    new Paragraph({
      spacing: { before: 150, after: 60 },
      children: [
        new TextRun({
          text: '★ BẢNG XEM TRƯỚC MA TRẬN & TỔNG KẾT ĐIỂM SỐ:',
          bold: true,
          size: 19,
          color: '1E3A8A',
        }),
      ],
    })
  );

  elements.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              columnSpan: 3,
              shading: { fill: 'F3E8FF', type: ShadingType.CLEAR },
              children: [
                new Paragraph({
                  alignment: AlignmentType.LEFT,
                  children: [
                    new TextRun({
                      text: `• Đã chọn: ${uniqueTopics.length} chủ đề (${uniqueLessons.length} bài học) | Tổng: ${totalQuestions} câu | ${totalScore} điểm`,
                      bold: true,
                      size: 18,
                      color: '581C87',
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),
        new TableRow({
          children: [
            makeSimpleDataCell(`🟢 Nhận biết: ${counts.mcq.nb} MCQ | ${counts.tf.nb} ĐS | ${counts.sa.nb} TL (${totalNB} câu)`, false, AlignmentType.LEFT, 'F0FDF4'),
            makeSimpleDataCell(`🔵 Thông hiểu: ${counts.mcq.th} MCQ | ${counts.tf.th} ĐS | ${counts.sa.th} TL (${totalTH} câu)`, false, AlignmentType.LEFT, 'EFF6FF'),
            makeSimpleDataCell(`🟠 Vận dụng: ${counts.mcq.vd} MCQ | ${counts.tf.vd} ĐS | ${counts.sa.vd} TL (${totalVD} câu)`, false, AlignmentType.LEFT, 'FFFBEB'),
          ],
        }),
      ],
    })
  );

  elements.push(new Paragraph({ spacing: { after: 200 }, children: [] }));
  return elements;
}

/**
 * Helper to build Docx elements for Matrix 2 (In uploaded image):
 * MA TRẬN CHI TIẾT YCCĐ - PHÂN BỐ SỐ CÂU THEO TỪNG CHỦ ĐỀ, BÀI HỌC VÀ YÊU CẦU CẦN ĐẠT (YCCĐ)
 */
export function buildOutcomeDetailMatrixDocxElements(test: GeneratedTest, isPartOfFullDoc: boolean = false): (Paragraph | Table)[] {
  const { questions, config } = test;
  const elements: (Paragraph | Table)[] = [];

  interface OutcomeRowItem {
    topicName: string;
    lessonName: string;
    outcomeText: string;
    nb: number;
    th: number;
    vd: number;
    total: number;
  }

  const rows: OutcomeRowItem[] = [];

  // Gather outcomes from config or syllabus or questions
  const outcomeMap = new Map<string, { topicName: string; lessonName: string; nb: number; th: number; vd: number }>();

  // If config.outcomeMatrix exists
  if (config.outcomeMatrix && Object.keys(config.outcomeMatrix).length > 0) {
    Object.entries(config.outcomeMatrix).forEach(([outcomeText, counts]) => {
      let tName = 'Ứng dụng đạo hàm để khảo sát và vẽ đồ thị của hàm số';
      let lName = 'Tính đơn điệu của hàm số';

      // Find in syllabus
      for (const t of MATH_12_SYLLABUS) {
        for (const l of t.lessons) {
          if (l.outcomes.includes(outcomeText)) {
            tName = t.name;
            lName = l.name;
            break;
          }
        }
      }

      outcomeMap.set(outcomeText, {
        topicName: tName,
        lessonName: lName,
        nb: counts.nhanBiet || 0,
        th: counts.thongHieu || 0,
        vd: counts.vanDung || 0,
      });
    });
  }

  // Also verify from actual questions in test
  questions.forEach((q) => {
    const outcomeText = q.learningOutcome?.trim() || 'Vận dụng kiến thức bài học để giải quyết bài toán.';
    const tName = q.topicName?.trim() || 'Ứng dụng đạo hàm để khảo sát và vẽ đồ thị của hàm số';
    const lName = q.lessonName?.trim() || 'Tính đơn điệu của hàm số';

    if (!outcomeMap.has(outcomeText)) {
      outcomeMap.set(outcomeText, {
        topicName: tName,
        lessonName: lName,
        nb: 0,
        th: 0,
        vd: 0,
      });
    }

    const item = outcomeMap.get(outcomeText)!;
    if (q.level === 'NhanBiet') item.nb += 1;
    else if (q.level === 'ThongHieu') item.th += 1;
    else if (q.level === 'VanDung') item.vd += 1;
  });

  // Fallback if empty
  if (outcomeMap.size === 0) {
    outcomeMap.set('Nhận biết tính đồng biến, nghịch biến của hàm số trên một khoảng.', {
      topicName: 'Ứng dụng đạo hàm để khảo sát và vẽ đồ thị của hàm số',
      lessonName: 'Tính đơn điệu của hàm số',
      nb: 1,
      th: 1,
      vd: 0,
    });
  }

  // Convert map to rows
  let outcomeCounter = 1;
  outcomeMap.forEach((val, outText) => {
    const itemTotal = val.nb + val.th + val.vd;
    rows.push({
      topicName: val.topicName,
      lessonName: val.lessonName,
      outcomeText: outText.startsWith('[YCCĐ') || outText.startsWith('YCCĐ') ? outText : `[YCCĐ ${outcomeCounter}] ${outText}`,
      nb: val.nb,
      th: val.th,
      vd: val.vd,
      total: itemTotal,
    });
    outcomeCounter++;
  });

  // Title
  elements.push(
    new Paragraph({
      pageBreakBefore: isPartOfFullDoc,
      alignment: AlignmentType.CENTER,
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 200, after: 80 },
      children: [
        new TextRun({
          text: 'II. MA TRẬN CHI TIẾT YCCĐ (PHÂN BỐ SỐ CÂU THEO TỪNG CHỦ ĐỀ, BÀI HỌC VÀ YCCĐ)',
          bold: true,
          size: 24,
          color: '000000',
        }),
      ],
    })
  );

  elements.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 150 },
      children: [
        new TextRun({
          text: `Căn cứ theo Chương trình GDPT 2018 môn Toán và Bộ Yêu cầu cần đạt chuẩn của Bộ Giáo dục & Đào tạo`,
          italics: true,
          size: 19,
          color: '334155',
        }),
      ],
    })
  );

  const makeCell = (text: string, isBold = false, align: any = AlignmentType.CENTER, fill?: string, colSpan = 1): TableCell => {
    return new TableCell({
      columnSpan: colSpan,
      verticalAlign: VerticalAlign.CENTER,
      shading: fill ? { fill, type: ShadingType.CLEAR } : undefined,
      children: [
        new Paragraph({
          alignment: align,
          children: [new TextRun({ text, bold: isBold, size: 17, color: '000000' })],
        }),
      ],
    });
  };

  const tableRows: TableRow[] = [];

  // Header Row
  tableRows.push(
    new TableRow({
      children: [
        makeCell('Chủ đề', true, AlignmentType.LEFT, 'F1F5F9'),
        makeCell('Bài học', true, AlignmentType.LEFT, 'F1F5F9'),
        makeCell('Yêu cầu cần đạt (YCCĐ)', true, AlignmentType.LEFT, 'F1F5F9'),
        makeCell('NB', true, AlignmentType.CENTER, 'DCFCE7'),
        makeCell('TH', true, AlignmentType.CENTER, 'DBEAFE'),
        makeCell('VD', true, AlignmentType.CENTER, 'FEF3C7'),
        makeCell('Tổng câu', true, AlignmentType.CENTER, 'E2E8F0'),
      ],
    })
  );

  let sumNB = 0;
  let sumTH = 0;
  let sumVD = 0;
  let sumTotal = 0;

  rows.forEach((r) => {
    sumNB += r.nb;
    sumTH += r.th;
    sumVD += r.vd;
    sumTotal += r.total;

    tableRows.push(
      new TableRow({
        children: [
          makeCell(r.topicName, true, AlignmentType.LEFT),
          makeCell(r.lessonName, false, AlignmentType.LEFT),
          makeCell(r.outcomeText, false, AlignmentType.LEFT),
          makeCell(r.nb > 0 ? String(r.nb) : '', false, AlignmentType.CENTER),
          makeCell(r.th > 0 ? String(r.th) : '', false, AlignmentType.CENTER),
          makeCell(r.vd > 0 ? String(r.vd) : '', false, AlignmentType.CENTER),
          makeCell(r.total > 0 ? `${r.total} câu` : '', true, AlignmentType.CENTER, 'F8FAFC'),
        ],
      })
    );
  });

  // Footer Row
  tableRows.push(
    new TableRow({
      children: [
        makeCell('TỔNG CỘNG SỐ CÂU PHÂN BỐ THEO YCCĐ:', true, AlignmentType.CENTER, 'F1F5F9', 3),
        makeCell(`${sumNB} NB`, true, AlignmentType.CENTER, 'DCFCE7'),
        makeCell(`${sumTH} TH`, true, AlignmentType.CENTER, 'DBEAFE'),
        makeCell(`${sumVD} VD`, true, AlignmentType.CENTER, 'FEF3C7'),
        makeCell(`${sumTotal} câu`, true, AlignmentType.CENTER, 'E2E8F0'),
      ],
    })
  );

  elements.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: tableRows,
    })
  );

  elements.push(new Paragraph({ spacing: { after: 200 }, children: [] }));
  return elements;
}

/**
 * Builds the complete standard 19-column table and footnotes for Word export matching the exact image layout
 */
export function buildStandardMatrixDocxElements(test: GeneratedTest, isPartOfFullDoc: boolean = false): (Paragraph | Table)[] {
  const matrixData = buildStandardMatrixData(test);
  const elements: (Paragraph | Table)[] = [];

  // Title
  elements.push(
    new Paragraph({
      pageBreakBefore: isPartOfFullDoc,
      alignment: AlignmentType.CENTER,
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 200, after: 100 },
      children: [
        new TextRun({
          text: '1. MA TRẬN ĐỀ KIỂM TRA ĐỊNH KÌ',
          bold: true,
          size: 26,
          color: '000000',
        }),
      ],
    })
  );

  elements.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: `Môn: TOÁN 12 - Thời gian làm bài: ${matrixData.durationMinutes} phút (Cấu trúc định dạng GDPT 2018)`,
          italics: true,
          size: 20,
          color: '334155',
        }),
      ],
    })
  );

  const makeHeaderCell = (text: string, colSpan = 1, rowSpan = 1, fill = 'F1F5F9'): TableCell => {
    const lines = text.split('\n');
    return new TableCell({
      columnSpan: colSpan,
      rowSpan: rowSpan,
      verticalAlign: VerticalAlign.CENTER,
      shading: { fill, type: ShadingType.CLEAR },
      children: lines.map(
        (l) =>
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: l, bold: true, size: 18, color: '000000' })],
          })
      ),
    });
  };

  const makeDataCell = (countText: string, tagsText: string, align: (typeof AlignmentType)[keyof typeof AlignmentType] = AlignmentType.CENTER, isBold = false): TableCell => {
    const pChildren: Paragraph[] = [];
    if (countText) {
      pChildren.push(
        new Paragraph({
          alignment: align,
          children: [new TextRun({ text: countText, bold: isBold, size: 18 })],
        })
      );
    }
    if (tagsText) {
      pChildren.push(
        new Paragraph({
          alignment: align,
          children: [new TextRun({ text: tagsText, italics: true, size: 16, color: '334155' })],
        })
      );
    }
    if (pChildren.length === 0) {
      pChildren.push(new Paragraph({ children: [new TextRun({ text: '', size: 18 })] }));
    }

    return new TableCell({
      verticalAlign: VerticalAlign.CENTER,
      children: pChildren,
    });
  };

  const tableRows: TableRow[] = [];

  // Header Level 1
  tableRows.push(
    new TableRow({
      tableHeader: true,
      children: [
        makeHeaderCell('TT', 1, 4),
        makeHeaderCell('Chủ đề/\nChương', 1, 4),
        makeHeaderCell('Nội dung/\nđơn vị kiến thức', 1, 4),
        makeHeaderCell('Yêu cầu cần đạt', 1, 4),
        makeHeaderCell('Mức độ đánh giá', 12, 1),
        makeHeaderCell('Tổng', 3, 3),
        makeHeaderCell('Tỉ lệ\n%\nđiểm', 1, 4),
      ],
    })
  );

  // Header Level 2
  tableRows.push(
    new TableRow({
      tableHeader: true,
      children: [
        makeHeaderCell('TNKQ', 9, 1),
        makeHeaderCell('Tự luận', 3, 2),
      ],
    })
  );

  // Header Level 3
  tableRows.push(
    new TableRow({
      tableHeader: true,
      children: [
        makeHeaderCell('Nhiều lựa chọn', 3, 1),
        makeHeaderCell('“Đúng – Sai”', 3, 1),
        makeHeaderCell('Trả lời ngắn', 3, 1),
      ],
    })
  );

  // Header Level 4
  tableRows.push(
    new TableRow({
      tableHeader: true,
      children: [
        // Nhiều lựa chọn
        makeHeaderCell('Biết', 1, 1),
        makeHeaderCell('Hiểu', 1, 1),
        makeHeaderCell('Vận\ndụng', 1, 1),
        // Đúng – Sai
        makeHeaderCell('Biết', 1, 1),
        makeHeaderCell('Hiểu', 1, 1),
        makeHeaderCell('Vận\ndụng', 1, 1),
        // Trả lời ngắn
        makeHeaderCell('Biết', 1, 1),
        makeHeaderCell('Hiểu', 1, 1),
        makeHeaderCell('Vận\ndụng', 1, 1),
        // Tự luận
        makeHeaderCell('Biết', 1, 1),
        makeHeaderCell('Hiểu', 1, 1),
        makeHeaderCell('Vận\ndụng', 1, 1),
        // Tổng
        makeHeaderCell('Biết', 1, 1),
        makeHeaderCell('Hiểu', 1, 1),
        makeHeaderCell('Vận\ndụng', 1, 1),
      ],
    })
  );

  // Count Header Row directly under column headers (as in user's image)
  const { summary } = matrixData;
  tableRows.push(
    new TableRow({
      children: [
        makeDataCell('', ''),
        makeDataCell('', ''),
        makeDataCell('', ''),
        makeDataCell('', ''),
        // MCQ
        makeDataCell(summary.countHeaderRow.mcq.nhanBiet ? String(summary.countHeaderRow.mcq.nhanBiet) : '', ''),
        makeDataCell(summary.countHeaderRow.mcq.thongHieu ? String(summary.countHeaderRow.mcq.thongHieu) : '', ''),
        makeDataCell(summary.countHeaderRow.mcq.vanDung ? String(summary.countHeaderRow.mcq.vanDung) : '', ''),
        // Đúng - Sai
        makeDataCell(summary.countHeaderRow.trueFalse.nhanBiet ? `${summary.countHeaderRow.trueFalse.nhanBiet} ý` : '', ''),
        makeDataCell(summary.countHeaderRow.trueFalse.thongHieu ? `${summary.countHeaderRow.trueFalse.thongHieu} ý` : '', ''),
        makeDataCell(summary.countHeaderRow.trueFalse.vanDung ? `${summary.countHeaderRow.trueFalse.vanDung} ý` : '', ''),
        // Trả lời ngắn
        makeDataCell(summary.countHeaderRow.shortAnswer.nhanBiet ? String(summary.countHeaderRow.shortAnswer.nhanBiet) : '', ''),
        makeDataCell(summary.countHeaderRow.shortAnswer.thongHieu ? String(summary.countHeaderRow.shortAnswer.thongHieu) : '', ''),
        makeDataCell(summary.countHeaderRow.shortAnswer.vanDung ? String(summary.countHeaderRow.shortAnswer.vanDung) : '', ''),
        // Tự luận
        makeDataCell('', ''),
        makeDataCell('', ''),
        makeDataCell('', ''),
        // Tổng
        makeDataCell(summary.countHeaderRow.total.nhanBiet ? String(summary.countHeaderRow.total.nhanBiet) : '', '', AlignmentType.CENTER, true),
        makeDataCell(summary.countHeaderRow.total.thongHieu ? String(summary.countHeaderRow.total.thongHieu) : '', '', AlignmentType.CENTER, true),
        makeDataCell(summary.countHeaderRow.total.vanDung ? String(summary.countHeaderRow.total.vanDung) : '', '', AlignmentType.CENTER, true),
        // Tỉ lệ %
        makeDataCell(String(summary.countHeaderRow.totalPercentage), '', AlignmentType.CENTER, true),
      ],
    })
  );

  // Data Rows
  matrixData.rows.forEach((row) => {
    const cells: TableCell[] = [];

    // 1. TT
    cells.push(makeDataCell(row.isFirstInTopic ? String(row.index) : '', '', AlignmentType.CENTER, true));

    // 2. Chủ đề / Chương
    cells.push(
      new TableCell({
        verticalAlign: VerticalAlign.CENTER,
        children: [new Paragraph({ children: [new TextRun({ text: row.isFirstInTopic ? row.topicName : '', bold: true, size: 18 })] })],
      })
    );

    // 3. Nội dung / đơn vị kiến thức
    cells.push(
      new TableCell({
        verticalAlign: VerticalAlign.CENTER,
        children: [new Paragraph({ children: [new TextRun({ text: row.isFirstInLesson ? row.lessonName : '', size: 18 })] })],
      })
    );

    // 4. Yêu cầu cần đạt (YCCĐ)
    cells.push(
      new TableCell({
        verticalAlign: VerticalAlign.CENTER,
        children: [new Paragraph({ children: [new TextRun({ text: row.requirementText, size: 17 })] })],
      })
    );

    // 5..7. Nhiều lựa chọn
    cells.push(makeDataCell('', row.mcq.nhanBiet.tags.length > 0 ? row.mcq.nhanBiet.tags.join(', ') : ''));
    cells.push(makeDataCell('', row.mcq.thongHieu.tags.length > 0 ? row.mcq.thongHieu.tags.join(', ') : ''));
    cells.push(makeDataCell('', row.mcq.vanDung.tags.length > 0 ? row.mcq.vanDung.tags.join(', ') : ''));

    // 8..10. Đúng - Sai
    cells.push(makeDataCell('', row.trueFalse.nhanBiet.tags.length > 0 ? row.trueFalse.nhanBiet.tags.join(', ') : ''));
    cells.push(makeDataCell('', row.trueFalse.thongHieu.tags.length > 0 ? row.trueFalse.thongHieu.tags.join(', ') : ''));
    cells.push(makeDataCell('', row.trueFalse.vanDung.tags.length > 0 ? `(${row.trueFalse.vanDung.tags.join(', ')})` : ''));

    // 11..13. Trả lời ngắn
    cells.push(makeDataCell('', row.shortAnswer.nhanBiet.tags.length > 0 ? `(${row.shortAnswer.nhanBiet.tags.join(', ')})` : ''));
    cells.push(makeDataCell('', row.shortAnswer.thongHieu.tags.length > 0 ? row.shortAnswer.thongHieu.tags.join(', ') : ''));
    cells.push(makeDataCell('', row.shortAnswer.vanDung.tags.length > 0 ? row.shortAnswer.vanDung.tags.join(', ') : ''));

    // 14..16. Tự luận
    cells.push(makeDataCell('', ''));
    cells.push(makeDataCell('', ''));
    cells.push(makeDataCell('', ''));

    // 17..19. Tổng
    cells.push(makeDataCell(row.isFirstInLesson && row.totalKnown > 0 ? String(row.totalKnown) : '', '', AlignmentType.CENTER, true));
    cells.push(makeDataCell(row.isFirstInLesson && row.totalUnderstand > 0 ? String(row.totalUnderstand) : '', '', AlignmentType.CENTER, true));
    cells.push(makeDataCell(row.isFirstInLesson && row.totalApply > 0 ? String(row.totalApply) : '', '', AlignmentType.CENTER, true));

    // 20. Tỉ lệ % điểm
    cells.push(makeDataCell(row.isFirstInLesson ? String(row.percentage || 100) : '', '', AlignmentType.CENTER, true));

    tableRows.push(new TableRow({ children: cells }));
  });

  // Summary Row 1: Tổng số câu/ý
  tableRows.push(
    new TableRow({
      children: [
        makeHeaderCell('Tổng số câu/ý', 4, 1, 'FFFFFF'),
        // MCQ
        makeDataCell(summary.totalCount.mcq.nhanBiet > 0 ? String(summary.totalCount.mcq.nhanBiet) : '', '', AlignmentType.CENTER, true),
        makeDataCell(summary.totalCount.mcq.thongHieu > 0 ? String(summary.totalCount.mcq.thongHieu) : '', '', AlignmentType.CENTER, true),
        makeDataCell(summary.totalCount.mcq.vanDung > 0 ? String(summary.totalCount.mcq.vanDung) : '', '', AlignmentType.CENTER, true),
        // Đúng Sai
        makeDataCell(summary.totalCount.trueFalse.nhanBiet > 0 ? String(summary.totalCount.trueFalse.nhanBiet) : '', '', AlignmentType.CENTER, true),
        makeDataCell(summary.totalCount.trueFalse.thongHieu > 0 ? String(summary.totalCount.trueFalse.thongHieu) : '', '', AlignmentType.CENTER, true),
        makeDataCell(summary.totalCount.trueFalse.vanDung > 0 ? String(summary.totalCount.trueFalse.vanDung) : '', '', AlignmentType.CENTER, true),
        // Trả lời ngắn
        makeDataCell(summary.totalCount.shortAnswer.nhanBiet > 0 ? String(summary.totalCount.shortAnswer.nhanBiet) : '', '', AlignmentType.CENTER, true),
        makeDataCell(summary.totalCount.shortAnswer.thongHieu > 0 ? String(summary.totalCount.shortAnswer.thongHieu) : '', '', AlignmentType.CENTER, true),
        makeDataCell(summary.totalCount.shortAnswer.vanDung > 0 ? String(summary.totalCount.shortAnswer.vanDung) : '', '', AlignmentType.CENTER, true),
        // Tự luận
        makeDataCell('0', '', AlignmentType.CENTER),
        makeDataCell('0', '', AlignmentType.CENTER),
        makeDataCell('0', '', AlignmentType.CENTER),
        // Tổng theo mức độ
        makeDataCell(String(summary.totalCount.byLevel.nhanBiet), '', AlignmentType.CENTER, true),
        makeDataCell(String(summary.totalCount.byLevel.thongHieu), '', AlignmentType.CENTER, true),
        makeDataCell(String(summary.totalCount.byLevel.vanDung), '', AlignmentType.CENTER, true),
        // Tỉ lệ %
        makeDataCell('', ''),
      ],
    })
  );

  // Summary Row 2: Tổng số điểm
  tableRows.push(
    new TableRow({
      children: [
        makeHeaderCell('Tổng số điểm', 4, 1, 'FFFFFF'),
        makeHeaderCell(`${summary.score.mcq.toFixed(1)} điểm`, 3, 1, 'FFFFFF'),
        makeHeaderCell(`${summary.score.trueFalse.toFixed(1)} điểm`, 3, 1, 'FFFFFF'),
        makeHeaderCell(`${summary.score.shortAnswer.toFixed(1)} điểm`, 3, 1, 'FFFFFF'),
        makeHeaderCell(`${summary.score.essay.toFixed(1)} điểm`, 3, 1, 'FFFFFF'),
        makeDataCell(summary.score.byLevel.nhanBiet.toFixed(1), '', AlignmentType.CENTER, true),
        makeDataCell(summary.score.byLevel.thongHieu.toFixed(1), '', AlignmentType.CENTER, true),
        makeDataCell(summary.score.byLevel.vanDung.toFixed(1), '', AlignmentType.CENTER, true),
        makeDataCell(summary.score.total.toFixed(1), '', AlignmentType.CENTER, true),
      ],
    })
  );

  // Summary Row 3: Tỉ lệ %
  tableRows.push(
    new TableRow({
      children: [
        makeHeaderCell('Tỉ lệ %', 4, 1, 'FFFFFF'),
        makeHeaderCell(`${summary.percentage.mcq}`, 3, 1, 'FFFFFF'),
        makeHeaderCell(`${summary.percentage.trueFalse}`, 3, 1, 'FFFFFF'),
        makeHeaderCell(`${summary.percentage.shortAnswer}`, 3, 1, 'FFFFFF'),
        makeHeaderCell(`${summary.percentage.essay}`, 3, 1, 'FFFFFF'),
        makeDataCell(String(summary.percentage.byLevel.nhanBiet), '', AlignmentType.CENTER, true),
        makeDataCell(String(summary.percentage.byLevel.thongHieu), '', AlignmentType.CENTER, true),
        makeDataCell(String(summary.percentage.byLevel.vanDung), '', AlignmentType.CENTER, true),
        makeDataCell(String(summary.percentage.total), '', AlignmentType.CENTER, true),
      ],
    })
  );

  elements.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: tableRows,
    })
  );

  // Footnotes
  elements.push(
    new Paragraph({
      spacing: { before: 150 },
      children: [
        new TextRun({
          text: '¹ Dạng II Đúng – Sai: Ma trận chi tiết 16 ý theo mã C1a, C1b...; 4 ý vẫn ghép thành 1 câu.',
          italics: true,
          size: 18,
          color: '475569',
        }),
      ],
    })
  );

  elements.push(
    new Paragraph({
      spacing: { before: 50 },
      children: [
        new TextRun({
          text: '² Chấm Đúng/Sai theo kiểu TN THPT: đúng 1 ý = 0,10 điểm; 2 ý = 0,25; 3 ý = 0,50; đúng cả 4 ý = 1,00; không đúng ý nào = 0.',
          italics: true,
          size: 18,
          color: '475569',
        }),
      ],
    })
  );

  elements.push(
    new Paragraph({
      spacing: { before: 50, after: 200 },
      children: [
        new TextRun({
          text: '³ Môn không sử dụng Trả lời ngắn có thể chuyển điểm sang dạng Đúng – Sai.',
          italics: true,
          size: 18,
          color: '475569',
        }),
      ],
    })
  );

  return elements;
}

/**
 * Builds the complete Specification Matrix (2. BẢNG ĐẶC TẢ KĨ THUẬT ĐỀ KIỂM TRA ĐỊNH KÌ) table for Word export
 */
export function buildSpecMatrixDocxElements(test: GeneratedTest, isPartOfFullDoc: boolean = false): (Paragraph | Table)[] {
  const matrixData = buildStandardMatrixData(test);
  const { summary, rows } = matrixData;
  const elements: (Paragraph | Table)[] = [];

  // Title
  elements.push(
    new Paragraph({
      pageBreakBefore: isPartOfFullDoc,
      alignment: AlignmentType.CENTER,
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 250, after: 100 },
      children: [
        new TextRun({
          text: '2. BẢNG ĐẶC TẢ KĨ THUẬT ĐỀ KIỂM TRA ĐỊNH KÌ',
          bold: true,
          size: 26,
          color: '000000',
        }),
      ],
    })
  );

  elements.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: `Môn: TOÁN 12 - Thời gian làm bài: ${matrixData.durationMinutes} phút (Cấu trúc định dạng GDPT 2018)`,
          italics: true,
          size: 20,
          color: '334155',
        }),
      ],
    })
  );

  const makeHeaderCell = (text: string, colSpan = 1, rowSpan = 1, fill = 'F1F5F9'): TableCell => {
    const lines = text.split('\n');
    return new TableCell({
      columnSpan: colSpan,
      rowSpan: rowSpan,
      verticalAlign: VerticalAlign.CENTER,
      shading: { fill, type: ShadingType.CLEAR },
      children: lines.map(
        (l) =>
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: l, bold: true, size: 17, color: '000000' })],
          })
      ),
    });
  };

  const makeDataCell = (
    mainText: string,
    subText: string = '',
    align: (typeof AlignmentType)[keyof typeof AlignmentType] = AlignmentType.CENTER,
    isBold = false,
    rowSpan = 1,
    colSpan = 1
  ): TableCell => {
    const pChildren: Paragraph[] = [];
    if (mainText) {
      pChildren.push(
        new Paragraph({
          alignment: align,
          children: [new TextRun({ text: mainText, bold: isBold, size: 17 })],
        })
      );
    }
    if (subText) {
      pChildren.push(
        new Paragraph({
          alignment: align,
          children: [new TextRun({ text: subText, italics: true, size: 15, color: '334155' })],
        })
      );
    }
    if (pChildren.length === 0) {
      pChildren.push(new Paragraph({ children: [new TextRun({ text: '', size: 17 })] }));
    }

    return new TableCell({
      rowSpan,
      columnSpan: colSpan,
      verticalAlign: VerticalAlign.CENTER,
      children: pChildren,
    });
  };

  const tableRows: TableRow[] = [];

  // Header Level 1 (Top Level)
  tableRows.push(
    new TableRow({
      tableHeader: true,
      children: [
        makeHeaderCell('TT', 1, 3),
        makeHeaderCell('Chủ đề/\nChương', 1, 3),
        makeHeaderCell('Nội dung/\nđơn vị kiến thức', 1, 3),
        makeHeaderCell('Mức độ đánh giá /\nYêu cầu cần đạt', 1, 3),
        makeHeaderCell('Số câu hỏi theo mức độ nhận thức', 12, 1),
        makeHeaderCell('Tổng', 3, 2),
        makeHeaderCell('Tỉ lệ\n%\nđiểm', 1, 3),
      ],
    })
  );

  // Header Level 2 (Question Types)
  tableRows.push(
    new TableRow({
      tableHeader: true,
      children: [
        makeHeaderCell('Nhiều lựa chọn\n(Phần I)', 3, 1),
        makeHeaderCell('“Đúng – Sai”\n(Phần II - số ý)', 3, 1),
        makeHeaderCell('Trả lời ngắn\n(Phần III)', 3, 1),
        makeHeaderCell('Tự luận', 3, 1),
      ],
    })
  );

  // Header Level 3 (Levels)
  tableRows.push(
    new TableRow({
      tableHeader: true,
      children: [
        // MCQ
        makeHeaderCell('Biết', 1, 1),
        makeHeaderCell('Hiểu', 1, 1),
        makeHeaderCell('Vận\ndụng', 1, 1),
        // TF
        makeHeaderCell('Biết', 1, 1),
        makeHeaderCell('Hiểu', 1, 1),
        makeHeaderCell('Vận\ndụng', 1, 1),
        // SA
        makeHeaderCell('Biết', 1, 1),
        makeHeaderCell('Hiểu', 1, 1),
        makeHeaderCell('Vận\ndụng', 1, 1),
        // Essay
        makeHeaderCell('Biết', 1, 1),
        makeHeaderCell('Hiểu', 1, 1),
        makeHeaderCell('Vận\ndụng', 1, 1),
        // Total by level
        makeHeaderCell('Biết', 1, 1),
        makeHeaderCell('Hiểu', 1, 1),
        makeHeaderCell('Vận\ndụng', 1, 1),
      ],
    })
  );

  // Data Rows: Render every row with question tags/codes (e.g. C1, C2, C1a...) matching the spec layout
  rows.forEach((row) => {
    const cells: TableCell[] = [];

    // TT (rowspanned for topic)
    if (row.isFirstInTopic) {
      cells.push(makeDataCell(String(row.index), '', AlignmentType.CENTER, true, row.topicRowSpan));
      cells.push(makeDataCell(row.topicName, '', AlignmentType.LEFT, true, row.topicRowSpan));
    }

    // Lesson Name (rowspanned for lesson)
    if (row.isFirstInLesson) {
      cells.push(makeDataCell(row.lessonName, '', AlignmentType.LEFT, true, row.lessonRowSpan));
    }

    // Learning Outcome (YCCĐ)
    cells.push(makeDataCell(row.requirementText || 'Vận dụng kiến thức bài học giải toán', '', AlignmentType.LEFT, false));

    // MCQ: NhanBiet, ThongHieu, VanDung (show tags/codes if available or count)
    const mcqNbTags = row.mcq.nhanBiet.tags.length > 0 ? row.mcq.nhanBiet.tags.join(', ') : (row.mcq.nhanBiet.count > 0 ? String(row.mcq.nhanBiet.count) : '');
    const mcqThTags = row.mcq.thongHieu.tags.length > 0 ? row.mcq.thongHieu.tags.join(', ') : (row.mcq.thongHieu.count > 0 ? String(row.mcq.thongHieu.count) : '');
    const mcqVdTags = row.mcq.vanDung.tags.length > 0 ? row.mcq.vanDung.tags.join(', ') : (row.mcq.vanDung.count > 0 ? String(row.mcq.vanDung.count) : '');
    cells.push(makeDataCell(mcqNbTags, '', AlignmentType.CENTER));
    cells.push(makeDataCell(mcqThTags, '', AlignmentType.CENTER));
    cells.push(makeDataCell(mcqVdTags, '', AlignmentType.CENTER));

    // TF: NhanBiet, ThongHieu, VanDung
    const tfNbTags = row.trueFalse.nhanBiet.tags.length > 0 ? row.trueFalse.nhanBiet.tags.join(', ') : (row.trueFalse.nhanBiet.count > 0 ? `${row.trueFalse.nhanBiet.count} ý` : '');
    const tfThTags = row.trueFalse.thongHieu.tags.length > 0 ? row.trueFalse.thongHieu.tags.join(', ') : (row.trueFalse.thongHieu.count > 0 ? `${row.trueFalse.thongHieu.count} ý` : '');
    const tfVdTags = row.trueFalse.vanDung.tags.length > 0 ? row.trueFalse.vanDung.tags.join(', ') : (row.trueFalse.vanDung.count > 0 ? `${row.trueFalse.vanDung.count} ý` : '');
    cells.push(makeDataCell(tfNbTags, '', AlignmentType.CENTER));
    cells.push(makeDataCell(tfThTags, '', AlignmentType.CENTER));
    cells.push(makeDataCell(tfVdTags, '', AlignmentType.CENTER));

    // SA: NhanBiet, ThongHieu, VanDung
    const saNbTags = row.shortAnswer.nhanBiet.tags.length > 0 ? row.shortAnswer.nhanBiet.tags.join(', ') : (row.shortAnswer.nhanBiet.count > 0 ? String(row.shortAnswer.nhanBiet.count) : '');
    const saThTags = row.shortAnswer.thongHieu.tags.length > 0 ? row.shortAnswer.thongHieu.tags.join(', ') : (row.shortAnswer.thongHieu.count > 0 ? String(row.shortAnswer.thongHieu.count) : '');
    const saVdTags = row.shortAnswer.vanDung.tags.length > 0 ? row.shortAnswer.vanDung.tags.join(', ') : (row.shortAnswer.vanDung.count > 0 ? String(row.shortAnswer.vanDung.count) : '');
    cells.push(makeDataCell(saNbTags, '', AlignmentType.CENTER));
    cells.push(makeDataCell(saThTags, '', AlignmentType.CENTER));
    cells.push(makeDataCell(saVdTags, '', AlignmentType.CENTER));

    // Essay: 0
    cells.push(makeDataCell('', '', AlignmentType.CENTER));
    cells.push(makeDataCell('', '', AlignmentType.CENTER));
    cells.push(makeDataCell('', '', AlignmentType.CENTER));

    // Row totals by level
    const rowKnown = row.rowKnown > 0 ? String(row.rowKnown) : (row.isFirstInLesson && row.totalKnown > 0 ? String(row.totalKnown) : '');
    const rowUnderstand = row.rowUnderstand > 0 ? String(row.rowUnderstand) : (row.isFirstInLesson && row.totalUnderstand > 0 ? String(row.totalUnderstand) : '');
    const rowApply = row.rowApply > 0 ? String(row.rowApply) : (row.isFirstInLesson && row.totalApply > 0 ? String(row.totalApply) : '');
    cells.push(makeDataCell(rowKnown, '', AlignmentType.CENTER, true));
    cells.push(makeDataCell(rowUnderstand, '', AlignmentType.CENTER, true));
    cells.push(makeDataCell(rowApply, '', AlignmentType.CENTER, true));

    // Percentage
    if (row.isFirstInLesson) {
      cells.push(makeDataCell(row.percentage ? `${row.percentage}%` : '100%', '', AlignmentType.CENTER, true, row.lessonRowSpan));
    }

    tableRows.push(new TableRow({ children: cells }));
  });

  // SUMMARY ROW 1: Tổng số câu/ý
  tableRows.push(
    new TableRow({
      children: [
        makeDataCell('Tổng số câu/ý', '', AlignmentType.CENTER, true, 1, 4),
        makeDataCell(summary.totalCount.mcq.nhanBiet ? String(summary.totalCount.mcq.nhanBiet) : '', '', AlignmentType.CENTER, true),
        makeDataCell(summary.totalCount.mcq.thongHieu ? String(summary.totalCount.mcq.thongHieu) : '', '', AlignmentType.CENTER, true),
        makeDataCell(summary.totalCount.mcq.vanDung ? String(summary.totalCount.mcq.vanDung) : '', '', AlignmentType.CENTER, true),
        makeDataCell(summary.totalCount.trueFalse.nhanBiet ? String(summary.totalCount.trueFalse.nhanBiet) : '', '', AlignmentType.CENTER, true),
        makeDataCell(summary.totalCount.trueFalse.thongHieu ? String(summary.totalCount.trueFalse.thongHieu) : '', '', AlignmentType.CENTER, true),
        makeDataCell(summary.totalCount.trueFalse.vanDung ? String(summary.totalCount.trueFalse.vanDung) : '', '', AlignmentType.CENTER, true),
        makeDataCell(summary.totalCount.shortAnswer.nhanBiet ? String(summary.totalCount.shortAnswer.nhanBiet) : '', '', AlignmentType.CENTER, true),
        makeDataCell(summary.totalCount.shortAnswer.thongHieu ? String(summary.totalCount.shortAnswer.thongHieu) : '', '', AlignmentType.CENTER, true),
        makeDataCell(summary.totalCount.shortAnswer.vanDung ? String(summary.totalCount.shortAnswer.vanDung) : '', '', AlignmentType.CENTER, true),
        makeDataCell('0', '', AlignmentType.CENTER),
        makeDataCell('0', '', AlignmentType.CENTER),
        makeDataCell('0', '', AlignmentType.CENTER),
        makeDataCell(String(summary.totalCount.byLevel.nhanBiet), '', AlignmentType.CENTER, true),
        makeDataCell(String(summary.totalCount.byLevel.thongHieu), '', AlignmentType.CENTER, true),
        makeDataCell(String(summary.totalCount.byLevel.vanDung), '', AlignmentType.CENTER, true),
        makeDataCell('', '', AlignmentType.CENTER),
      ],
    })
  );

  // SUMMARY ROW 2: Tổng số điểm
  tableRows.push(
    new TableRow({
      children: [
        makeDataCell('Tổng số điểm', '', AlignmentType.CENTER, true, 1, 4),
        makeDataCell(`${summary.score.mcq.toFixed(1)} điểm`, '', AlignmentType.CENTER, true, 1, 3),
        makeDataCell(`${summary.score.trueFalse.toFixed(1)} điểm`, '', AlignmentType.CENTER, true, 1, 3),
        makeDataCell(`${summary.score.shortAnswer.toFixed(1)} điểm`, '', AlignmentType.CENTER, true, 1, 3),
        makeDataCell('0.0 điểm', '', AlignmentType.CENTER, false, 1, 3),
        makeDataCell(summary.score.byLevel.nhanBiet.toFixed(1), '', AlignmentType.CENTER, true),
        makeDataCell(summary.score.byLevel.thongHieu.toFixed(1), '', AlignmentType.CENTER, true),
        makeDataCell(summary.score.byLevel.vanDung.toFixed(1), '', AlignmentType.CENTER, true),
        makeDataCell(summary.score.total.toFixed(1), '', AlignmentType.CENTER, true),
      ],
    })
  );

  // SUMMARY ROW 3: Tỉ lệ %
  tableRows.push(
    new TableRow({
      children: [
        makeDataCell('Tỉ lệ %', '', AlignmentType.CENTER, true, 1, 4),
        makeDataCell(String(summary.percentage.mcq), '', AlignmentType.CENTER, true, 1, 3),
        makeDataCell(String(summary.percentage.trueFalse), '', AlignmentType.CENTER, true, 1, 3),
        makeDataCell(String(summary.percentage.shortAnswer), '', AlignmentType.CENTER, true, 1, 3),
        makeDataCell('0', '', AlignmentType.CENTER, false, 1, 3),
        makeDataCell(String(summary.percentage.byLevel.nhanBiet), '', AlignmentType.CENTER, true),
        makeDataCell(String(summary.percentage.byLevel.thongHieu), '', AlignmentType.CENTER, true),
        makeDataCell(String(summary.percentage.byLevel.vanDung), '', AlignmentType.CENTER, true),
        makeDataCell('100', '', AlignmentType.CENTER, true),
      ],
    })
  );

  elements.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: tableRows,
    })
  );

  return elements;
}

/**
 * Standalone Export: Exports ONLY the standard matrix to Word .docx
 */
export async function exportStandardMatrixOnlyWord(test: GeneratedTest, customFileName?: string): Promise<void> {
  const elements = buildStandardMatrixDocxElements(test, false);

  const doc = new Document({
    evenAndOddHeaderAndFooters: false,
    sections: [
      {
        properties: STANDARD_WORD_PAGE_PROPERTIES,
        children: elements,
      },
    ],
  });

  const meta = extractTestMetadata(test);
  const safeName = customFileName
    ? (customFileName.endsWith('.docx') ? customFileName : `${customFileName}.docx`)
    : `MaTran_${meta.cleanFileName}.docx`;
  await saveDocxWithStandardPageSetup(doc, safeName);
}

/**
 * Standalone Export: Exports ONLY the specification matrix (Bảng đặc tả YCCĐ) to Word .docx
 */
export async function exportSpecMatrixOnlyWord(test: GeneratedTest, customFileName?: string): Promise<void> {
  const elements = buildSpecMatrixDocxElements(test, false);

  const doc = new Document({
    evenAndOddHeaderAndFooters: false,
    sections: [
      {
        properties: STANDARD_WORD_PAGE_PROPERTIES,
        children: elements,
      },
    ],
  });

  const meta = extractTestMetadata(test);
  const safeName = customFileName
    ? (customFileName.endsWith('.docx') ? customFileName : `${customFileName}.docx`)
    : `BangDacTa_${meta.cleanFileName}.docx`;
  await saveDocxWithStandardPageSetup(doc, safeName);
}

/**
 * Standalone Export: Exports the 2 matrices from the Step 2 configure screen (Ma trận dạng câu hỏi & Chi tiết YCCĐ) to Word .docx
 */
export async function exportQuestionAndOutcomeMatricesWord(test: GeneratedTest, customFileName?: string): Promise<void> {
  const elements1 = buildQuestionFormatMatrixDocxElements(test, false);
  const elements2 = buildOutcomeDetailMatrixDocxElements(test, false);

  const doc = new Document({
    evenAndOddHeaderAndFooters: false,
    sections: [
      {
        properties: STANDARD_WORD_PAGE_PROPERTIES,
        children: [...elements1, ...elements2],
      },
    ],
  });

  const meta = extractTestMetadata(test);
  const safeName = customFileName
    ? (customFileName.endsWith('.docx') ? customFileName : `${customFileName}.docx`)
    : `MaTran_DangCauHoi_Va_YCCD_${meta.cleanFileName}.docx`;
  await saveDocxWithStandardPageSetup(doc, safeName);
}

/**
 * Standalone Export: Exports ALL matrices (Ma trận theo dạng câu hỏi & YCCĐ trong ảnh + Ma trận chuẩn 19 cột + Bảng đặc tả YCCĐ) to Word .docx
 */
export async function exportBothMatricesWord(test: GeneratedTest, customFileName?: string): Promise<void> {
  const elements0 = buildQuestionFormatMatrixDocxElements(test, false);
  const elements0b = buildOutcomeDetailMatrixDocxElements(test, false);
  const elements1 = buildStandardMatrixDocxElements(test, true);
  const elements2 = buildSpecMatrixDocxElements(test, true);

  const doc = new Document({
    evenAndOddHeaderAndFooters: false,
    sections: [
      {
        properties: STANDARD_WORD_PAGE_PROPERTIES,
        children: [...elements0, ...elements0b, ...elements1, ...elements2],
      },
    ],
  });

  const meta = extractTestMetadata(test);
  const safeName = customFileName
    ? (customFileName.endsWith('.docx') ? customFileName : `${customFileName}.docx`)
    : `Bo_MaTran_Va_BangDacTa_${meta.cleanFileName}.docx`;
  await saveDocxWithStandardPageSetup(doc, safeName);
}
