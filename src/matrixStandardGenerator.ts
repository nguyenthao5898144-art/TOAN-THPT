import { GeneratedTest, Question, CognitiveLevel } from './types';
import { MATH_12_SYLLABUS } from './math12Syllabus';

export interface StandardMatrixCell {
  count: number;
  tags: string[]; // e.g. ["C1, C2, C3,"] or ["C1a, C1b, C2a..."]
  label?: string; // e.g. "2", "6 ý", "8 ý"
}

export interface StandardMatrixRow {
  index: number; // 1, 2, 3...
  topicName: string;
  lessonName: string;
  requirementText: string; // Yêu cầu cần đạt (YCCĐ)
  
  topicRowSpan: number;
  isFirstInTopic: boolean;
  
  lessonRowSpan: number;
  isFirstInLesson: boolean;
  
  // TNKQ - Nhiều lựa chọn (MCQ)
  mcq: {
    nhanBiet: StandardMatrixCell;
    thongHieu: StandardMatrixCell;
    vanDung: StandardMatrixCell;
  };
  
  // TNKQ - Đúng / Sai (TF) - đếm theo số ý (1 ý, 2 ý, ...)
  trueFalse: {
    nhanBiet: StandardMatrixCell;
    thongHieu: StandardMatrixCell;
    vanDung: StandardMatrixCell;
  };
  
  // TNKQ - Trả lời ngắn (Short Answer)
  shortAnswer: {
    nhanBiet: StandardMatrixCell;
    thongHieu: StandardMatrixCell;
    vanDung: StandardMatrixCell;
  };
  
  // Tự luận (nếu có)
  essay: {
    nhanBiet: StandardMatrixCell;
    thongHieu: StandardMatrixCell;
    vanDung: StandardMatrixCell;
  };
  
  // Tổng câu / ý theo từng dòng YCCĐ
  rowKnown: number;       // Biết của dòng YCCĐ này
  rowUnderstand: number;  // Hiểu của dòng YCCĐ này
  rowApply: number;       // Vận dụng của dòng YCCĐ này
  rowTotal: number;       // Tổng câu/ý của dòng YCCĐ này

  // Tổng câu/ý theo mức độ nhận thức của bài học / YCCĐ
  totalKnown: number;     // Biết của toàn bài học
  totalUnderstand: number; // Hiểu của toàn bài học
  totalApply: number;      // Vận dụng của toàn bài học
  
  // Tỉ lệ % điểm của bài học
  score: number;
  percentage: number;
}

export interface StandardMatrixSummary {
  // Dòng đếm số lượng câu/ý ngay dưới tiêu đề các cột (như trong ảnh mẫu)
  countHeaderRow: {
    mcq: { nhanBiet: number; thongHieu: number; vanDung: number };
    trueFalse: { nhanBiet: number; thongHieu: number; vanDung: number };
    shortAnswer: { nhanBiet: number; thongHieu: number; vanDung: number };
    essay: { nhanBiet: number; thongHieu: number; vanDung: number };
    total: { nhanBiet: number; thongHieu: number; vanDung: number };
    totalPercentage: number;
  };
  // Tổng số câu / ý (dòng cuối 1)
  totalCount: {
    mcq: { nhanBiet: number; thongHieu: number; vanDung: number; total: number };
    trueFalse: { nhanBiet: number; thongHieu: number; vanDung: number; total: number };
    shortAnswer: { nhanBiet: number; thongHieu: number; vanDung: number; total: number };
    essay: { nhanBiet: number; thongHieu: number; vanDung: number; total: number };
    byLevel: { nhanBiet: number; thongHieu: number; vanDung: number; total: number };
  };
  // Tổng số điểm (dòng cuối 2)
  score: {
    mcq: number;
    trueFalse: number;
    shortAnswer: number;
    essay: number;
    byLevel: { nhanBiet: number; thongHieu: number; vanDung: number };
    total: number;
  };
  // Tỉ lệ % (dòng cuối 3)
  percentage: {
    mcq: number;
    trueFalse: number;
    shortAnswer: number;
    essay: number;
    byLevel: { nhanBiet: number; thongHieu: number; vanDung: number };
    total: number;
  };
}

export interface StandardMatrixData {
  title: string;
  grade: string;
  schoolName: string;
  academicYear: string;
  durationMinutes: number;
  rows: StandardMatrixRow[];
  summary: StandardMatrixSummary;
}

/**
 * Builds the standard Vietnamese Ministry of Education 2018 exam matrix exactly matching the image layout
 * with 20 columns and Yêu cầu cần đạt (YCCĐ) sub-rows.
 */
export function buildStandardMatrixData(test: GeneratedTest): StandardMatrixData {
  const { questions, config } = test;

  // Separate questions by type
  const mcqQuestions = questions.filter((q) => q.type === 'multiple_choice');
  const tfQuestions = questions.filter((q) => q.type === 'true_false');
  const saQuestions = questions.filter((q) => q.type === 'short_answer');

  // Find all unique topic & lesson combinations preserving syllabus order
  interface LessonKey {
    topicName: string;
    lessonName: string;
  }
  const lessonList: LessonKey[] = [];
  const lessonSet = new Set<string>();

  // Extract from questions
  questions.forEach((q) => {
    const tName = q.topicName?.trim() || 'Ứng dụng đạo hàm để khảo sát và vẽ đồ thị của hàm số';
    const lName = q.lessonName?.trim() || 'Tính đơn điệu của hàm số';
    const key = `${tName}:::${lName}`;
    if (!lessonSet.has(key)) {
      lessonSet.add(key);
      lessonList.push({ topicName: tName, lessonName: lName });
    }
  });

  // If empty, provide a fallback lesson
  if (lessonList.length === 0) {
    lessonList.push({
      topicName: 'Ứng dụng đạo hàm để khảo sát và vẽ đồ thị của hàm số',
      lessonName: 'Tính đơn điệu của hàm số',
    });
  }

  // Pre-index questions to assign exact codes (e.g. C1, C2.. for MCQ; C1a, C1b.. for TF; C1, C2.. for SA)
  const mcqTagMap = new Map<string, string>();
  mcqQuestions.forEach((q, idx) => {
    mcqTagMap.set(q.id, `C${idx + 1}`);
  });

  const saTagMap = new Map<string, string>();
  saQuestions.forEach((q, idx) => {
    saTagMap.set(q.id, `C${idx + 1}`);
  });

  interface TFStatementItem {
    tag: string;
    level: CognitiveLevel;
  }
  const tfQuestionStatementsMap = new Map<string, TFStatementItem[]>();
  tfQuestions.forEach((q, idx) => {
    const qNumber = idx + 1;
    let statementsDistribution: TFStatementItem[] = [];

    if (q.level === 'NhanBiet') {
      statementsDistribution = [
        { tag: `C${qNumber}a`, level: 'NhanBiet' },
        { tag: `C${qNumber}b`, level: 'NhanBiet' },
        { tag: `C${qNumber}c`, level: 'NhanBiet' },
        { tag: `C${qNumber}d`, level: 'NhanBiet' },
      ];
    } else if (q.level === 'VanDung') {
      statementsDistribution = [
        { tag: `C${qNumber}a`, level: 'VanDung' },
        { tag: `C${qNumber}b`, level: 'VanDung' },
        { tag: `C${qNumber}c`, level: 'VanDung' },
        { tag: `C${qNumber}d`, level: 'VanDung' },
      ];
    } else {
      // ThongHieu
      statementsDistribution = [
        { tag: `C${qNumber}a`, level: 'ThongHieu' },
        { tag: `C${qNumber}b`, level: 'ThongHieu' },
        { tag: `C${qNumber}c`, level: 'ThongHieu' },
        { tag: `C${qNumber}d`, level: 'ThongHieu' },
      ];
    }
    tfQuestionStatementsMap.set(q.id, statementsDistribution);
  });

  // Find syllabus outcomes for a given lesson
  const getOutcomesForLesson = (topicName: string, lessonName: string): string[] => {
    // 1. If test config specifies selected outcomes for a single lesson or matches
    if (test.config?.selectedOutcomes && test.config.selectedOutcomes.length > 0) {
      if (lessonList.length === 1) {
        return test.config.selectedOutcomes;
      }
      // If multi-lesson, filter outcomes belonging to this lesson from syllabus
      for (const t of MATH_12_SYLLABUS) {
        for (const l of t.lessons) {
          if (
            l.name.toLowerCase().includes(lessonName.toLowerCase()) ||
            lessonName.toLowerCase().includes(l.name.toLowerCase())
          ) {
            const matched = test.config.selectedOutcomes.filter((so) =>
              l.outcomes.some((lo) => lo.toLowerCase().includes(so.toLowerCase()) || so.toLowerCase().includes(lo.toLowerCase()))
            );
            if (matched.length > 0) return matched;
          }
        }
      }
    }

    for (const t of MATH_12_SYLLABUS) {
      for (const l of t.lessons) {
        if (
          l.name.toLowerCase().includes(lessonName.toLowerCase()) ||
          lessonName.toLowerCase().includes(l.name.toLowerCase()) ||
          t.name.toLowerCase().includes(topicName.toLowerCase())
        ) {
          if (l.outcomes && l.outcomes.length > 0) {
            return l.outcomes;
          }
        }
      }
    }
    // Fallback if not matched in syllabus
    return [
      'Nhận biết được tính đồng biến, nghịch biến của một hàm số trên một khoảng dựa vào dấu của đạo hàm cấp một của nó.',
      'Thể hiện được tính đồng biến, nghịch biến của hàm số trong bảng biến thiên.',
      'Nhận biết được tính đơn điệu, điểm cực trị, giá trị cực trị của hàm số thông qua bảng biến thiên hoặc thông qua hình ảnh hình học của đồ thị hàm số.',
    ];
  };

  // Helper to create cell
  const createCell = (tags: string[], isTF = false): StandardMatrixCell => ({
    count: tags.length,
    tags,
    label: tags.length > 0 ? (isTF ? `${tags.length} ý` : `${tags.length}`) : '',
  });

  const emptyCell: StandardMatrixCell = { count: 0, tags: [] };

  const allRows: StandardMatrixRow[] = [];

  // Group lessons by topic for computing topic-level spans
  lessonList.forEach((lesson, lessonIdx) => {
    const { topicName, lessonName } = lesson;
    const outcomes = getOutcomesForLesson(topicName, lessonName);

    // Get all questions in this lesson
    const lMcq = mcqQuestions.filter(
      (q) => (q.topicName?.trim() || 'Toán 12') === topicName && (q.lessonName?.trim() || 'Kiến thức trọng tâm') === lessonName
    );
    const lTf = tfQuestions.filter(
      (q) => (q.topicName?.trim() || 'Toán 12') === topicName && (q.lessonName?.trim() || 'Kiến thức trọng tâm') === lessonName
    );
    const lSa = saQuestions.filter(
      (q) => (q.topicName?.trim() || 'Toán 12') === topicName && (q.lessonName?.trim() || 'Kiến thức trọng tâm') === lessonName
    );

    // Number of outcome sub-rows for this lesson (e.g. 3)
    const numOutcomes = Math.max(outcomes.length, 1);

    // Prepare outcome buckets for each cell
    const outcomeBuckets = Array.from({ length: numOutcomes }, () => ({
      mcqNB: [] as string[],
      mcqTH: [] as string[],
      mcqVD: [] as string[],
      tfNB: [] as string[],
      tfTH: [] as string[],
      tfVD: [] as string[],
      saNB: [] as string[],
      saTH: [] as string[],
      saVD: [] as string[],
    }));

    // Helper to find outcome index for a question
    const getOutcomeIndex = (q: Question, fallbackIdx: number): number => {
      if (typeof q.learningOutcomeIndex === 'number' && q.learningOutcomeIndex >= 0) {
        return q.learningOutcomeIndex % numOutcomes;
      }
      if (q.learningOutcome) {
        const found = outcomes.findIndex((o) =>
          o.toLowerCase().includes(q.learningOutcome!.toLowerCase()) ||
          q.learningOutcome!.toLowerCase().includes(o.toLowerCase())
        );
        if (found >= 0) return found;
      }
      return fallbackIdx % numOutcomes;
    };

    // 1. Distribute MCQ
    let mcqNbCounter = 0;
    let mcqThCounter = 0;
    let mcqVdCounter = 0;

    lMcq.forEach((q, idx) => {
      const tag = mcqTagMap.get(q.id) || `C${idx + 1}`;
      let fallback = 0;
      if (q.level === 'NhanBiet') {
        fallback = mcqNbCounter % numOutcomes;
        mcqNbCounter++;
      } else if (q.level === 'ThongHieu') {
        fallback = mcqThCounter % numOutcomes;
        mcqThCounter++;
      } else {
        fallback = mcqVdCounter % numOutcomes;
        mcqVdCounter++;
      }

      let targetOutcome = getOutcomeIndex(q, fallback);
      if (numOutcomes === 1) targetOutcome = 0;

      if (q.level === 'NhanBiet') {
        outcomeBuckets[targetOutcome].mcqNB.push(tag);
      } else if (q.level === 'ThongHieu') {
        outcomeBuckets[targetOutcome].mcqTH.push(tag);
      } else {
        outcomeBuckets[targetOutcome].mcqVD.push(tag);
      }
    });

    // 2. Distribute True/False (4 questions distributed across outcomes)
    lTf.forEach((q, qIdx) => {
      const stmts = tfQuestionStatementsMap.get(q.id) || [];
      const targetOutcome = numOutcomes === 1 ? 0 : getOutcomeIndex(q, qIdx % numOutcomes);
      stmts.forEach((s) => {
        if (s.level === 'NhanBiet') {
          outcomeBuckets[targetOutcome].tfNB.push(s.tag);
        } else if (s.level === 'ThongHieu') {
          outcomeBuckets[targetOutcome].tfTH.push(s.tag);
        } else {
          outcomeBuckets[targetOutcome].tfVD.push(s.tag);
        }
      });
    });

    // 3. Distribute Short Answer
    let saNbCounter = 0;
    let saThCounter = 0;
    let saVdCounter = 0;

    lSa.forEach((q, qIdx) => {
      const tag = saTagMap.get(q.id) || `C${qIdx + 1}`;
      let fallback = 0;
      if (q.level === 'NhanBiet') {
        fallback = saNbCounter % numOutcomes;
        saNbCounter++;
      } else if (q.level === 'ThongHieu') {
        fallback = saThCounter % numOutcomes;
        saThCounter++;
      } else {
        fallback = saVdCounter % numOutcomes;
        saVdCounter++;
      }

      const targetOutcome = numOutcomes === 1 ? 0 : getOutcomeIndex(q, fallback);
      if (q.level === 'NhanBiet') {
        outcomeBuckets[targetOutcome].saNB.push(tag);
      } else if (q.level === 'ThongHieu') {
        outcomeBuckets[targetOutcome].saTH.push(tag);
      } else {
        outcomeBuckets[targetOutcome].saVD.push(tag);
      }
    });

    // All tags in this lesson
    const allMcqNB = outcomeBuckets.flatMap((b) => b.mcqNB);
    const allMcqTH = outcomeBuckets.flatMap((b) => b.mcqTH);
    const allMcqVD = outcomeBuckets.flatMap((b) => b.mcqVD);
    const allTfNB = outcomeBuckets.flatMap((b) => b.tfNB);
    const allTfTH = outcomeBuckets.flatMap((b) => b.tfTH);
    const allTfVD = outcomeBuckets.flatMap((b) => b.tfVD);
    const allSaNB = outcomeBuckets.flatMap((b) => b.saNB);
    const allSaTH = outcomeBuckets.flatMap((b) => b.saTH);
    const allSaVD = outcomeBuckets.flatMap((b) => b.saVD);

    // Overall count for this lesson
    const totalKnownLesson = allMcqNB.length + allTfNB.length + allSaNB.length;
    const totalUnderstandLesson = allMcqTH.length + allTfTH.length + allSaTH.length;
    const totalApplyLesson = allMcqVD.length + allTfVD.length + allSaVD.length;

    const mcqPoints = (allMcqNB.length + allMcqTH.length + allMcqVD.length) * 0.25;
    const tfPoints = (allTfNB.length + allTfTH.length + allTfVD.length) * 0.25;
    const saPoints = (allSaNB.length + allSaTH.length + allSaVD.length) * 0.5;
    const lessonScore = Number((mcqPoints + tfPoints + saPoints).toFixed(2));
    const lessonPercentage = lessonList.length === 1 ? 100 : Math.round(((lessonScore / 10.0) * 100));

    // Construct sub-rows
    for (let oIdx = 0; oIdx < numOutcomes; oIdx++) {
      const outcomeText = outcomes[oIdx] || 'Vận dụng kiến thức trọng tâm giải quyết bài toán.';
      const isFirst = oIdx === 0;
      const b = outcomeBuckets[oIdx];

      const rKnown = b.mcqNB.length + (b.tfNB.length > 0 ? Math.round(b.tfNB.length / 4) : 0) + b.saNB.length;
      const rUnderstand = b.mcqTH.length + (b.tfTH.length > 0 ? Math.round(b.tfTH.length / 4) : 0) + b.saTH.length;
      const rApply = b.mcqVD.length + (b.tfVD.length > 0 ? Math.round(b.tfVD.length / 4) : 0) + b.saVD.length;
      const rTotal = rKnown + rUnderstand + rApply;

      allRows.push({
        index: lessonIdx + 1,
        topicName,
        lessonName,
        requirementText: outcomeText,
        topicRowSpan: 0, // calculated later
        isFirstInTopic: false,
        lessonRowSpan: numOutcomes,
        isFirstInLesson: isFirst,
        mcq: {
          nhanBiet: createCell(b.mcqNB),
          thongHieu: createCell(b.mcqTH),
          vanDung: createCell(b.mcqVD),
        },
        trueFalse: {
          nhanBiet: createCell(b.tfNB, true),
          thongHieu: createCell(b.tfTH, true),
          vanDung: createCell(b.tfVD, true),
        },
        shortAnswer: {
          nhanBiet: createCell(b.saNB),
          thongHieu: createCell(b.saTH),
          vanDung: createCell(b.saVD),
        },
        essay: {
          nhanBiet: emptyCell,
          thongHieu: emptyCell,
          vanDung: emptyCell,
        },
        rowKnown: rKnown,
        rowUnderstand: rUnderstand,
        rowApply: rApply,
        rowTotal: rTotal,
        totalKnown: totalKnownLesson,
        totalUnderstand: totalUnderstandLesson,
        totalApply: totalApplyLesson,
        score: lessonScore,
        percentage: lessonPercentage,
      });
    }
  });

  // Calculate topic row spans
  const topicCounts = new Map<string, number>();
  allRows.forEach((r) => {
    topicCounts.set(r.topicName, (topicCounts.get(r.topicName) || 0) + 1);
  });

  const seenTopics = new Set<string>();
  allRows.forEach((r) => {
    if (!seenTopics.has(r.topicName)) {
      seenTopics.add(r.topicName);
      r.isFirstInTopic = true;
      r.topicRowSpan = topicCounts.get(r.topicName) || 1;
    } else {
      r.isFirstInTopic = false;
      r.topicRowSpan = 0;
    }
  });

  // Calculate summary counts
  const sumMcqNB = mcqQuestions.filter((q) => q.level === 'NhanBiet').length;
  const sumMcqTH = mcqQuestions.filter((q) => q.level === 'ThongHieu').length;
  const sumMcqVD = mcqQuestions.filter((q) => q.level === 'VanDung').length;
  const totalMcqCount = sumMcqNB + sumMcqTH + sumMcqVD;

  let sumTfNB = 0;
  let sumTfTH = 0;
  let sumTfVD = 0;
  tfQuestions.forEach((q) => {
    const stmts = tfQuestionStatementsMap.get(q.id) || [];
    stmts.forEach((s) => {
      if (s.level === 'NhanBiet') sumTfNB++;
      else if (s.level === 'ThongHieu') sumTfTH++;
      else if (s.level === 'VanDung') sumTfVD++;
    });
  });
  const totalTfCount = sumTfNB + sumTfTH + sumTfVD;

  const sumSaNB = saQuestions.filter((q) => q.level === 'NhanBiet').length;
  const sumSaTH = saQuestions.filter((q) => q.level === 'ThongHieu').length;
  const sumSaVD = saQuestions.filter((q) => q.level === 'VanDung').length;
  const totalSaCount = sumSaNB + sumSaTH + sumSaVD;

  const totalKnownAll = sumMcqNB + sumTfNB + sumSaNB;
  const totalUnderstandAll = sumMcqTH + sumTfTH + sumSaTH;
  const totalApplyAll = sumMcqVD + sumTfVD + sumSaVD;
  const totalQuestionsOrStatements = totalKnownAll + totalUnderstandAll + totalApplyAll;

  // Scores
  const scoreMcq = Number((totalMcqCount * 0.25).toFixed(1));
  const scoreTf = Number((totalTfCount * 0.25).toFixed(1));
  const scoreSa = Number((totalSaCount * 0.5).toFixed(1));
  const scoreEssay = 0.0;
  const totalScore = Number((scoreMcq + scoreTf + scoreSa + scoreEssay).toFixed(1)) || 10.0;

  const scoreNB = Number(((sumMcqNB * 0.25) + (sumTfNB * 0.25) + (sumSaNB * 0.5)).toFixed(1));
  const scoreTH = Number(((sumMcqTH * 0.25) + (sumTfTH * 0.25) + (sumSaTH * 0.5)).toFixed(1));
  const scoreVD = Number(((sumMcqVD * 0.25) + (sumTfVD * 0.25) + (sumSaVD * 0.5)).toFixed(1));

  // Percentages
  const pctMcq = Number(((scoreMcq / 10.0) * 100).toFixed(0));
  const pctTf = Number(((scoreTf / 10.0) * 100).toFixed(0));
  const pctSa = Number(((scoreSa / 10.0) * 100).toFixed(0));
  const pctEssay = 0;

  const pctNB = Number(((scoreNB / 10.0) * 100).toFixed(0));
  const pctTH = Number(((scoreTH / 10.0) * 100).toFixed(0));
  const pctVD = Number(((scoreVD / 10.0) * 100).toFixed(0));
  const pctTotal = Math.round((totalScore / 10.0) * 100);

  const summary: StandardMatrixSummary = {
    countHeaderRow: {
      mcq: { nhanBiet: sumMcqNB, thongHieu: sumMcqTH, vanDung: sumMcqVD },
      trueFalse: { nhanBiet: sumTfNB, thongHieu: sumTfTH, vanDung: sumTfVD },
      shortAnswer: { nhanBiet: sumSaNB, thongHieu: sumSaTH, vanDung: sumSaVD },
      essay: { nhanBiet: 0, thongHieu: 0, vanDung: 0 },
      total: { nhanBiet: totalKnownAll, thongHieu: totalUnderstandAll, vanDung: totalApplyAll },
      totalPercentage: pctTotal,
    },
    totalCount: {
      mcq: { nhanBiet: sumMcqNB, thongHieu: sumMcqTH, vanDung: sumMcqVD, total: totalMcqCount },
      trueFalse: { nhanBiet: sumTfNB, thongHieu: sumTfTH, vanDung: sumTfVD, total: totalTfCount },
      shortAnswer: { nhanBiet: sumSaNB, thongHieu: sumSaTH, vanDung: sumSaVD, total: totalSaCount },
      essay: { nhanBiet: 0, thongHieu: 0, vanDung: 0, total: 0 },
      byLevel: { nhanBiet: totalKnownAll, thongHieu: totalUnderstandAll, vanDung: totalApplyAll, total: totalQuestionsOrStatements },
    },
    score: {
      mcq: scoreMcq,
      trueFalse: scoreTf,
      shortAnswer: scoreSa,
      essay: scoreEssay,
      byLevel: { nhanBiet: scoreNB, thongHieu: scoreTH, vanDung: scoreVD },
      total: totalScore,
    },
    percentage: {
      mcq: pctMcq,
      trueFalse: pctTf,
      shortAnswer: pctSa,
      essay: pctEssay,
      byLevel: { nhanBiet: pctNB, thongHieu: pctTH, vanDung: pctVD },
      total: 100,
    },
  };

  return {
    title: config.title || 'ĐỀ KIỂM TRA ĐỊNH KÌ MÔN TOÁN',
    grade: 'TOÁN 12',
    schoolName: config.schoolName || 'TRƯỜNG THPT',
    academicYear: config.academicYear || '2024 - 2025',
    durationMinutes: config.durationMinutes || 45,
    rows: allRows,
    summary,
  };
}
