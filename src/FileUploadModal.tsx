import React, { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, X, Loader2, FileCode, Layers, Sparkles, Files, Filter } from 'lucide-react';
import { Question, MultipleChoiceQuestion, TrueFalseQuestion, ShortAnswerQuestion, CognitiveLevel } from './types';
import mammoth from 'mammoth';
import { MATH_12_SYLLABUS } from './math12Syllabus';
import { autoDeduplicateQuestions } from './deduplication';
import { processQuestionTableToImage } from './tableImageGenerator';
const ensureUniqueDiagramsInText = (text: any): any => text;
const sanitizeQuestionMath = (q: any): any => q;
import { detectQuestionVisuals, filterQuestionsByVisualCategory } from './visualDetector';
import { extractTikZFromText } from './tikzParser';

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportQuestions: (questions: Question[], appendMode: boolean) => void;
}

// Helper: Match AI extracted topic and lesson names against official MATH_12_SYLLABUS
function matchSyllabus(rawTopicName?: string, rawLessonName?: string) {
  let topicId = 'imported_topic';
  let topicName = rawTopicName || 'Chủ đề Toán 12 Tải Lên';
  let lessonId = 'imported_lesson';
  let lessonName = rawLessonName || 'Bài học Tải Lên';

  const cleanTopicStr = (rawTopicName || '').toLowerCase().trim();
  const cleanLessonStr = (rawLessonName || '').toLowerCase().trim();

  const matchedTopic = MATH_12_SYLLABUS.find((t) => {
    const tName = t.name.toLowerCase();
    return (
      (cleanTopicStr && (tName.includes(cleanTopicStr) || cleanTopicStr.includes(tName))) ||
      (cleanTopicStr.includes('đạo hàm') && t.id === 'topic_dao_ham') ||
      ((cleanTopicStr.includes('nguyên hàm') || cleanTopicStr.includes('tích phân')) && t.id === 'topic_nguyen_ham_tich_phan') ||
      ((cleanTopicStr.includes('oxyz') || cleanTopicStr.includes('tọa độ') || cleanTopicStr.includes('vectơ')) && t.id === 'topic_oxyz') ||
      ((cleanTopicStr.includes('thống kê') || cleanTopicStr.includes('xác suất')) && t.id === 'topic_xac_suat_thong_ke')
    );
  });

  if (matchedTopic) {
    topicId = matchedTopic.id;
    topicName = matchedTopic.name;

    const matchedLesson = matchedTopic.lessons.find((l) => {
      const lName = l.name.toLowerCase();
      return cleanLessonStr && (lName.includes(cleanLessonStr) || cleanLessonStr.includes(lName));
    });

    if (matchedLesson) {
      lessonId = matchedLesson.id;
      lessonName = matchedLesson.name;
    } else if (matchedTopic.lessons.length > 0) {
      lessonId = matchedTopic.lessons[0].id;
      lessonName = matchedTopic.lessons[0].name;
    }
  } else if (rawTopicName) {
    const slugTopic = rawTopicName.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 30);
    topicId = `topic_${slugTopic}`;
    const slugLesson = (rawLessonName || 'bai_hoc').toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 30);
    lessonId = `lesson_${slugLesson}`;
  }

  return { topicId, topicName, lessonId, lessonName };
}

// Helper: Format raw object into strictly typed Question
function formatQuestionObject(q: any, idx: number): Question {
  const { topicId, topicName, lessonId, lessonName } = matchSyllabus(q.topicName, q.lessonName);
  const level: CognitiveLevel = (q.level === 'NhanBiet' || q.level === 'ThongHieu' || q.level === 'VanDung') ? q.level : 'ThongHieu';
  const id = q.id ? `${q.id}_${idx + 1}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}` : `imp_q_${idx + 1}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const learningOutcome = q.learningOutcome || 'Đạt yêu cầu GDPT 2018 môn Toán 12';
  const rawContent = q.content || 'Nội dung câu hỏi';
  const solution = q.solution || 'Lời giải chi tiết.';

  // Extract any TikZ prompt or environment
  const tikzRes = extractTikZFromText(rawContent);
  const content = tikzRes.hasTikZ && tikzRes.cleanContent ? tikzRes.cleanContent : rawContent;
  const tikzCode = q.tikzCode || tikzRes.rawTikZ;
  let tableData = q.tableData;
  if (tikzRes.bbtData && !tableData?.bbtData) {
    tableData = { ...tableData, bbtData: tikzRes.bbtData };
  }

  let finalQuestion: Question;

  if (q.type === 'true_false') {
    finalQuestion = {
      id,
      type: 'true_false',
      topicId,
      topicName,
      lessonId,
      lessonName,
      level,
      learningOutcome,
      diagramId: q.diagramId,
      imageUrl: q.imageUrl,
      tableData,
      tikzCode,
      content,
      statements: q.statements,
      solution,
    };
  } else if (q.type === 'short_answer') {
    finalQuestion = {
      id,
      type: 'short_answer',
      topicId,
      topicName,
      lessonId,
      lessonName,
      level,
      learningOutcome,
      diagramId: q.diagramId,
      imageUrl: q.imageUrl,
      tableData,
      tikzCode,
      content,
      correctAnswer: String(q.correctAnswer || '0'),
      solution,
    };
  } else {
    finalQuestion = {
      id,
      type: 'multiple_choice',
      topicId,
      topicName,
      lessonId,
      lessonName,
      level,
      learningOutcome,
      diagramId: q.diagramId,
      imageUrl: q.imageUrl,
      tableData,
      tikzCode,
      content,
      options: q.options,
      correctAnswer: (q.correctAnswer === 'B' || q.correctAnswer === 'C' || q.correctAnswer === 'D') ? q.correctAnswer : 'A',
      solution,
    };
  }

  return sanitizeQuestionMath(processQuestionTableToImage(finalQuestion));
}

// Helper: Split large file text into manageable chunks (~10,000-12,000 chars) by Question markers or lines
function splitTextIntoChunks(text: string, maxChunkLength = 12000): string[] {
  if (text.length <= maxChunkLength) {
    return [text];
  }

  const questionRegex = /(?=(?:Câu|Bài|Cau|Câu\s*hỏi|Question)\s+\d+[\.:\s])/gi;
  const parts = text.split(questionRegex).filter((p) => p.trim().length > 0);

  if (parts.length > 1) {
    const chunks: string[] = [];
    let currentChunk = '';

    for (const part of parts) {
      if ((currentChunk + part).length > maxChunkLength && currentChunk.length > 0) {
        chunks.push(currentChunk);
        currentChunk = part;
      } else {
        currentChunk += part;
      }
    }
    if (currentChunk.trim().length > 0) {
      chunks.push(currentChunk);
    }
    return chunks;
  }

  const lines = text.split('\n');
  const chunks: string[] = [];
  let currentChunk = '';

  for (const line of lines) {
    if ((currentChunk + '\n' + line).length > maxChunkLength && currentChunk.length > 0) {
      chunks.push(currentChunk);
      currentChunk = line;
    } else {
      currentChunk += (currentChunk ? '\n' : '') + line;
    }
  }
  if (currentChunk.trim().length > 0) {
    chunks.push(currentChunk);
  }

  return chunks;
}

export const FileUploadModal: React.FC<FileUploadModalProps> = ({
  isOpen,
  onClose,
  onImportQuestions,
}) => {
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [parsedQuestions, setParsedQuestions] = useState<Question[]>([]);
  const [uploadedFileNames, setUploadedFileNames] = useState<string[]>([]);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [previewVisualFilter, setPreviewVisualFilter] = useState<'all' | 'has_visual'>('all');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files: File[] = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setErrorText(null);
    const fileNames = files.map((f) => f.name);
    setUploadedFileNames(fileNames);
    setIsProcessing(true);
    setStatusMessage(`Đang đọc dữ liệu từ ${files.length} file...`);

    let accumulatedQuestions: Question[] = [];
    let accumulatedTextList: { name: string; text: string }[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split('.').pop()?.toLowerCase() || '';
        setStatusMessage(`Đang đọc file (${i + 1}/${files.length}): "${file.name}"...`);

        if (fileExt === 'json') {
          const text = await file.text();
          const data = JSON.parse(text);
          let qArray: any[] = [];
          if (Array.isArray(data)) {
            qArray = data;
          } else if (data.questions && Array.isArray(data.questions)) {
            qArray = data.questions;
          }
          const formattedJsonQuestions: Question[] = qArray.map((q: any, idx: number) =>
            formatQuestionObject(q, idx)
          );
          accumulatedQuestions = [...accumulatedQuestions, ...formattedJsonQuestions];
        } else if (fileExt === 'docx' || fileExt === 'doc') {
          const arrayBuffer = await file.arrayBuffer();
          let extractedText = '';

          try {
            const result = await mammoth.extractRawText({ arrayBuffer });
            extractedText = result.value || '';
          } catch (mErr) {
            console.warn('Mammoth extraction notice:', mErr);
            const decoder = new TextDecoder('utf-8');
            extractedText = decoder.decode(arrayBuffer);
          }

          if (extractedText && extractedText.trim().length > 0) {
            accumulatedTextList.push({ name: file.name, text: extractedText });
          }
        } else {
          // .pdf, .txt, .md or other text formats
          const text = await file.text();
          if (text && text.trim().length > 0) {
            accumulatedTextList.push({ name: file.name, text: text });
          }
        }
      }

      // If we have text documents, split into chunks and send to AI to parse ALL questions without limits
      if (accumulatedTextList.length > 0) {
        const combinedText = accumulatedTextList
          .map((item, idx) => `=== TÀI LIỆU FILE ${idx + 1}: ${item.name} ===\n${item.text}`)
          .join('\n\n');

        const chunks = splitTextIntoChunks(combinedText, 12000);

        for (let cIdx = 0; cIdx < chunks.length; cIdx++) {
          const chunk = chunks[cIdx];
          setStatusMessage(
            `Đang dùng AI phân tích & phân loại không giới hạn số lượng câu hỏi (Đoạn ${cIdx + 1}/${chunks.length} - Đã tách ${accumulatedQuestions.length} câu):\n- Phân loại Mức độ (NB, TH, VD)\n- Tách Chủ đề, Bài học & YCCĐ GDPT 2018\n- Chuyển biểu thức toán về LaTeX $...$`
          );

          const aiQuestions = await sendTextToAi(chunk, `Tài liệu tải lên (Đoạn ${cIdx + 1})`);
          accumulatedQuestions = [...accumulatedQuestions, ...aiQuestions];
        }
      }

      if (accumulatedQuestions.length > 0) {
        const totalRaw = accumulatedQuestions.length;
        const { uniqueQuestions, removedCount } = autoDeduplicateQuestions(accumulatedQuestions, 0.80);
        const finalQuestionsWithVisuals = ensureUniqueDiagramsInTest(uniqueQuestions);
        
        setParsedQuestions(finalQuestionsWithVisuals);

        const visualCount = finalQuestionsWithVisuals.filter((q) => detectQuestionVisuals(q).hasVisual).length;

        if (removedCount > 0) {
          setStatusMessage(
            `🎉 Đã bóc tách thành công ${totalRaw} câu hỏi từ ${files.length} file (Đã tự động loại bỏ ${removedCount} câu trùng lặp ≥80% nội dung, còn lại ${finalQuestionsWithVisuals.length} câu duy nhất, trong đó có ${visualCount} câu có BBT/Đồ thị/Bảng/Hình)!`
          );
        } else {
          setStatusMessage(
            `🎉 Đã bóc tách & phân loại thành công TOÀN BỘ ${finalQuestionsWithVisuals.length} câu hỏi duy nhất từ ${files.length} file (Đã tự động nhận diện ${visualCount} câu có BBT/Đồ thị/Bảng/Hình)!`
          );
        }
      } else {
        throw new Error('Không bóc tách được câu hỏi nào từ các file đã chọn.');
      }
    } catch (err: any) {
      console.error('Multi-file import error:', err);
      setErrorText(err.message || 'Xảy ra lỗi khi đọc và phân tích file.');
    } finally {
      setIsProcessing(false);
    }
  };

  const sendTextToAi = async (fileText: string, fileName: string): Promise<Question[]> => {
    try {
      const res = await fetch('/api/parse-uploaded-file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileText, fileName }),
      });

      const data = await res.json();
      if (data.success && data.questions && data.questions.length > 0) {
        return data.questions.map((q: any, idx: number) => formatQuestionObject(q, idx));
      } else {
        return [];
      }
    } catch (err: any) {
      console.warn('AI parsing warning for chunk:', err);
      return [];
    }
  };

  const handleConfirmImport = (append: boolean) => {
    if (parsedQuestions.length === 0) return;
    onImportQuestions(parsedQuestions, append);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 border border-slate-200 relative animate-in fade-in zoom-in duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3 mb-5 border-b border-slate-100 pb-4">
          <div className="p-3 bg-emerald-100 text-emerald-700 rounded-xl">
            <Upload className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              TẢI LÊN FILE ĐỀ THI & PHÂN LOẠI CÂU HỎI BẰNG AI
            </h2>
            <p className="text-xs text-slate-500">
              Hỗ trợ tải <strong>1 hoặc nhiều file cùng lúc</strong>: Word (<strong className="text-emerald-700">.docx, .doc</strong>), PDF (<strong className="text-emerald-700">.pdf</strong>), Văn bản (<strong className="text-emerald-700">.txt</strong>), JSON (<strong className="text-emerald-700">.json</strong>)
            </p>
          </div>
        </div>

        {/* Multi-file Upload Area */}
        <div className="mb-6">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".doc,.docx,.pdf,.txt,.json"
            multiple
            className="hidden"
          />

          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-emerald-300 hover:border-emerald-500 bg-emerald-50/50 hover:bg-emerald-50 p-8 rounded-2xl text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-3 group"
          >
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
              <Files className="w-7 h-7" />
            </div>
            <div>
              <p className="font-bold text-slate-800 text-sm">
                Bấm vào đây để chọn 1 HOẶC NHIỀU FILE từ máy tính
              </p>
              <p className="text-xs text-slate-500 mt-1">
                AI sẽ tự động: Phân mức độ (NB, TH, VD) • Tách theo Chủ đề, Bài học, YCCĐ GDPT 2018 • Đưa công thức về LaTeX $...$
              </p>
            </div>
            <span className="inline-flex items-center space-x-1.5 text-xs font-semibold px-3 py-1 bg-white rounded-full border border-emerald-200 text-emerald-700 shadow-xs">
              <FileCode className="w-3.5 h-3.5" />
              <span>Cho phép chọn nhiều file cùng lúc (.doc, .docx, .pdf, .txt)</span>
            </span>
          </div>
        </div>

        {/* Processing Indicator */}
        {isProcessing && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-center space-x-3 text-blue-900 text-xs mb-4">
            <Loader2 className="w-5 h-5 text-blue-600 animate-spin shrink-0" />
            <div>
              <p className="font-bold text-blue-950">Đang phân tích dữ liệu câu hỏi bằng AI...</p>
              <p className="text-blue-700 whitespace-pre-line">{statusMessage}</p>
            </div>
          </div>
        )}

        {/* Error message */}
        {errorText && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center space-x-3 text-rose-900 text-xs mb-4">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <div>
              <p className="font-bold">Lỗi xử lý file:</p>
              <p>{errorText}</p>
            </div>
          </div>
        )}

        {/* Parsed Result Preview */}
        {parsedQuestions.length > 0 && !isProcessing && (
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2 text-xs font-bold text-slate-800 border-b border-slate-200 pb-2">
              <span className="flex items-center space-x-1.5 text-emerald-700">
                <CheckCircle className="w-4 h-4" />
                <span>Đã bóc tách & phân loại bằng AI thành công: {parsedQuestions.length} câu hỏi</span>
              </span>
              <span className="text-slate-500 font-normal">
                {uploadedFileNames.length} file: {uploadedFileNames.join(', ').slice(0, 40)}{uploadedFileNames.join(', ').length > 40 ? '...' : ''}
              </span>
            </div>

            {/* Quick Filter Bar for Visual Questions */}
            <div className="flex items-center gap-2 text-xs pt-1">
              <span className="font-bold text-slate-600 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5 text-indigo-600" />
                <span>Lọc nhanh:</span>
              </span>
              <button
                type="button"
                onClick={() => setPreviewVisualFilter('all')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all border cursor-pointer ${
                  previewVisualFilter === 'all'
                    ? 'bg-blue-600 text-white border-blue-500'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
              >
                Tất cả ({parsedQuestions.length})
              </button>
              <button
                type="button"
                onClick={() => setPreviewVisualFilter('has_visual')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all border cursor-pointer ${
                  previewVisualFilter === 'has_visual'
                    ? 'bg-emerald-600 text-white border-emerald-500'
                    : 'bg-white text-emerald-800 border-emerald-300 hover:bg-emerald-50'
                }`}
              >
                🎯 Câu chứa BBT / Đồ thị / Bảng / Hình ({parsedQuestions.filter((q) => detectQuestionVisuals(q).hasVisual).length})
              </button>
            </div>

            <div className="max-h-52 overflow-y-auto space-y-2 pr-1 text-xs text-slate-700">
              {filterQuestionsByVisualCategory(parsedQuestions, previewVisualFilter).map((q, i) => {
                const visualRes = detectQuestionVisuals(q);
                return (
                  <div key={i} className="p-2.5 bg-white rounded-lg border border-slate-200 shadow-2xs space-y-1.5">
                    <div className="flex items-center justify-between flex-wrap gap-1">
                      <div className="flex items-center space-x-1.5 flex-wrap">
                        <span className="font-bold text-blue-700">
                          Câu {i + 1} ({q.type === 'multiple_choice' ? 'Trắc nghiệm' : q.type === 'true_false' ? 'Đúng/Sai' : 'Trả lời ngắn'}):
                        </span>
                        {visualRes.hasVisual &&
                          visualRes.badges.map((b, bIdx) => (
                            <span
                              key={bIdx}
                              className={`px-1.5 py-0.2 rounded text-[9px] font-bold border flex items-center gap-0.5 ${b.colorClass}`}
                            >
                              <span>{b.icon}</span>
                              <span>{b.label}</span>
                            </span>
                          ))}
                      </div>

                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        q.level === 'NhanBiet'
                          ? 'bg-emerald-100 text-emerald-800'
                          : q.level === 'ThongHieu'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        Mức độ: {q.level === 'NhanBiet' ? 'Nhận biết (NB)' : q.level === 'ThongHieu' ? 'Thông hiểu (TH)' : 'Vận dụng (VD)'}
                      </span>
                    </div>
                    <div className="text-slate-800">
                      {q.content.slice(0, 100)}{q.content.length > 100 ? '...' : ''}
                    </div>
                    <div className="text-[10px] text-slate-500 italic flex items-center justify-between pt-0.5 border-t border-slate-100">
                      <span>Chủ đề: {q.topicName} • {q.lessonName}</span>
                      <span>YCCĐ: {q.learningOutcome.slice(0, 35)}...</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => handleConfirmImport(false)}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all flex items-center space-x-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Thay thế toàn bộ Ngân hàng câu hỏi ({parsedQuestions.length} câu)</span>
              </button>

              <button
                type="button"
                onClick={() => handleConfirmImport(true)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all flex items-center space-x-1.5 cursor-pointer"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Nạp thêm vào Ngân hàng câu hỏi (+{parsedQuestions.length} câu)</span>
              </button>
            </div>
          </div>
        )}

        <div className="flex justify-end pt-2 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
