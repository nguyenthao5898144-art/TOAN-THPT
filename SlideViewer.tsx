import React, { useState, useEffect, useMemo } from 'react';
import { GeneratedTest, Question } from '../types';
import { DIAGRAM_BANK } from '../data/diagramBank';
import { MathText } from './MathText';
import { DiagramRenderer } from './DiagramRenderer';
import { deduplicateAllQuestions } from '../utils/testGenerator';
import { resolveQuestionDiagram } from '../utils/mathGraphParser';
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Maximize2,
  Minimize2,
  Play,
  BookOpen,
  Type,
  Plus,
  Minus,
  RotateCcw,
  MoveHorizontal,
  Sliders,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Check,
  X,
  Edit3,
  Award,
  Trophy,
  BarChart2,
  Send,
  FileCheck,
  RefreshCw,
} from 'lucide-react';

interface SlideViewerProps {
  test: GeneratedTest;
}

type SlideWidthOption = '3xl' | '5xl' | '7xl' | 'full';

export const SlideViewer: React.FC<SlideViewerProps> = ({ test }) => {
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const [showAnswer, setShowAnswer] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Layout & Font Size Adjustments
  const [slideWidth, setSlideWidth] = useState<SlideWidthOption>('5xl');
  const [fontSize, setFontSize] = useState<number>(22); // Default 22px
  const [showToolbarInFullscreen, setShowToolbarInFullscreen] = useState<boolean>(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const isDocFullscreen = !!document.fullscreenElement;
      setIsFullscreen(isDocFullscreen);
      if (!isDocFullscreen) {
        setShowToolbarInFullscreen(false);
      }
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
      setIsFullscreen(true);
    } else {
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
      setShowToolbarInFullscreen(false);
    }
  };

  // Deduplicate and ensure 100% unique questions in slide mode
  const questions = useMemo(() => {
    return deduplicateAllQuestions(test.questions || []);
  }, [test.questions]);

  const totalSlides = questions.length + 1; // Slide 0 = Cover slide

  // User Interactive Answers State
  const [userMcqAnswers, setUserMcqAnswers] = useState<Record<string, string>>({});
  const [userTfAnswers, setUserTfAnswers] = useState<Record<string, Record<string, boolean>>>({});
  const [userSaAnswers, setUserSaAnswers] = useState<Record<string, string>>({});
  const [showResultModal, setShowResultModal] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Calculate grading details
  const testResults = useMemo(() => {
    let mcqTotal = 0;
    let mcqCorrect = 0;

    let tfTotalQ = 0;
    let tfStatementsTotal = 0;
    let tfStatementsCorrect = 0;
    let tfPointsEarned = 0;

    let saTotal = 0;
    let saCorrect = 0;

    questions.forEach((q) => {
      const qKey = q.id || '';
      if (q.type === 'multiple_choice') {
        mcqTotal++;
        if (userMcqAnswers[qKey] === q.correctAnswer) {
          mcqCorrect++;
        }
      } else if (q.type === 'true_false') {
        tfTotalQ++;
        const statements = q.statements || [];
        let correctCountInQ = 0;
        statements.forEach((st, idx) => {
          tfStatementsTotal++;
          const letter = (st.id || ['a', 'b', 'c', 'd'][idx] || 'a').toLowerCase();
          const userVal = userTfAnswers[qKey]?.[letter];
          if (userVal !== undefined && userVal === st.isCorrect) {
            tfStatementsCorrect++;
            correctCountInQ++;
          }
        });
        if (correctCountInQ === 1) tfPointsEarned += 0.1;
        else if (correctCountInQ === 2) tfPointsEarned += 0.25;
        else if (correctCountInQ === 3) tfPointsEarned += 0.5;
        else if (correctCountInQ === 4) tfPointsEarned += 1.0;
      } else if (q.type === 'short_answer') {
        saTotal++;
        const userAns = (userSaAnswers[qKey] || '').trim().toLowerCase();
        const correctAns = (q.correctAnswer || '').trim().toLowerCase();
        if (userAns && userAns === correctAns) {
          saCorrect++;
        }
      }
    });

    const rawMcqMax = mcqTotal * 0.25;
    const rawMcqEarned = mcqCorrect * 0.25;

    const rawTfMax = tfTotalQ * 1.0;
    const rawTfEarned = tfPointsEarned;

    const rawSaMax = saTotal * 0.5;
    const rawSaEarned = saCorrect * 0.5;

    const totalRawMax = rawMcqMax + rawTfMax + rawSaMax || 1;
    const totalRawEarned = rawMcqEarned + rawTfEarned + rawSaEarned;

    const finalScore = Math.min(10, Math.max(0, (totalRawEarned / totalRawMax) * 10));

    let gradeRating = 'Cần cố gắng';
    let gradeColor = 'text-rose-400 bg-rose-950/80 border-rose-800';
    if (finalScore >= 9.0) {
      gradeRating = 'Xuất sắc';
      gradeColor = 'text-emerald-400 bg-emerald-950/80 border-emerald-800';
    } else if (finalScore >= 8.0) {
      gradeRating = 'Giỏi';
      gradeColor = 'text-blue-400 bg-blue-950/80 border-blue-800';
    } else if (finalScore >= 6.5) {
      gradeRating = 'Khá';
      gradeColor = 'text-amber-400 bg-amber-950/80 border-amber-800';
    } else if (finalScore >= 5.0) {
      gradeRating = 'Trung bình';
      gradeColor = 'text-orange-400 bg-orange-950/80 border-orange-800';
    }

    return {
      finalScore: finalScore.toFixed(2),
      finalScoreNum: finalScore,
      gradeRating,
      gradeColor,
      mcqTotal,
      mcqCorrect,
      tfTotalQ,
      tfStatementsTotal,
      tfStatementsCorrect,
      saTotal,
      saCorrect,
    };
  }, [questions, userMcqAnswers, userTfAnswers, userSaAnswers]);

  const handleSubmitTest = () => {
    setIsSubmitted(true);
    setShowAnswer(true); // Auto show answers and solutions on slides
    setShowResultModal(true);
  };

  const handleRetakeTest = () => {
    setUserMcqAnswers({});
    setUserTfAnswers({});
    setUserSaAnswers({});
    setIsSubmitted(false);
    setShowAnswer(false);
    setShowResultModal(false);
    setCurrentSlide(1);
  };

  const nextSlide = () => {
    if (currentSlide < totalSlides - 1) {
      setCurrentSlide((prev) => prev + 1);
      setShowAnswer(false);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide((prev) => prev - 1);
      setShowAnswer(false);
    }
  };

  const increaseFontSize = () => setFontSize((prev) => Math.min(38, prev + 2));
  const decreaseFontSize = () => setFontSize((prev) => Math.max(16, prev - 2));
  const resetFontSize = () => setFontSize(22);

  const activeQuestion = currentSlide > 0 ? questions[currentSlide - 1] : null;
  const qId = activeQuestion ? activeQuestion.id || `q_${currentSlide}` : '';

  const handleSelectMcq = (optKey: string) => {
    if (!qId) return;
    setUserMcqAnswers((prev) => ({
      ...prev,
      [qId]: prev[qId] === optKey ? '' : optKey, // toggle
    }));
  };

  const handleSelectTf = (statementKey: string, val: boolean) => {
    if (!qId) return;
    setUserTfAnswers((prev) => {
      const qSts = { ...(prev[qId] || {}) };
      if (qSts[statementKey] === val) {
        delete qSts[statementKey]; // toggle off
      } else {
        qSts[statementKey] = val;
      }
      return { ...prev, [qId]: qSts };
    });
  };

  const handleSaChange = (val: string) => {
    if (!qId) return;
    setUserSaAnswers((prev) => ({
      ...prev,
      [qId]: val,
    }));
  };

  const handleResetCurrentQuestion = () => {
    if (!qId) return;
    setUserMcqAnswers((prev) => {
      const copy = { ...prev };
      delete copy[qId];
      return copy;
    });
    setUserTfAnswers((prev) => {
      const copy = { ...prev };
      delete copy[qId];
      return copy;
    });
    setUserSaAnswers((prev) => {
      const copy = { ...prev };
      delete copy[qId];
      return copy;
    });
  };

  // Map slide width preset to Tailwind max-w class
  const getMaxWidthClass = () => {
    switch (slideWidth) {
      case '3xl':
        return 'max-w-3xl';
      case '5xl':
        return 'max-w-5xl';
      case '7xl':
        return 'max-w-7xl';
      case 'full':
        return 'max-w-full';
      default:
        return 'max-w-5xl';
    }
  };

  return (
    <div
      className={`transition-all ${
        isFullscreen
          ? 'fixed inset-0 z-50 bg-slate-950 p-4 sm:p-6 flex flex-col justify-between overflow-hidden'
          : 'bg-slate-900 text-white rounded-2xl shadow-xl p-4 sm:p-6 border border-slate-800'
      }`}
    >
      {/* Top Slide Header & Quick Adjustment Toolbar - Hidden in Fullscreen by Default */}
      {(!isFullscreen || showToolbarInFullscreen) && (
        <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-4 mb-4 gap-3">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-600/20 text-blue-400 rounded-lg border border-blue-500/30">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-slate-100 flex items-center gap-2">
                <span>SLIDE TRÌNH CHIẾU DẠNG CÂU HỎI & ĐÁP ÁN</span>
                <span className="text-[10px] bg-emerald-900/80 text-emerald-300 font-semibold px-2 py-0.5 rounded border border-emerald-700">
                  Lớp 12 GDPT 2018
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Trình chiếu trực tiếp trên máy chiếu / màn hình với tùy chỉnh kích thước chữ & độ rộng thanh chiếu
              </p>
            </div>
          </div>

          {/* Live Presentation Adjustments Toolbar */}
          <div className="flex flex-wrap items-center gap-2 bg-slate-950/90 p-1.5 rounded-xl border border-slate-800">
            {/* 1. Slide Container Width Adjustment */}
            <div className="flex items-center space-x-1 px-2 border-r border-slate-800">
              <MoveHorizontal className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span className="text-[11px] font-semibold text-slate-400 mr-1 hidden sm:inline">Khung chiếu:</span>
              <button
                onClick={() => setSlideWidth('3xl')}
                className={`px-2 py-1 rounded text-[11px] font-bold transition-all cursor-pointer ${
                  slideWidth === '3xl'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
                title="Khung vừa vặn (768px)"
              >
                3XL
              </button>
              <button
                onClick={() => setSlideWidth('5xl')}
                className={`px-2 py-1 rounded text-[11px] font-bold transition-all cursor-pointer ${
                  slideWidth === '5xl'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
                title="Khung chuẩn (1024px)"
              >
                5XL
              </button>
              <button
                onClick={() => setSlideWidth('7xl')}
                className={`px-2 py-1 rounded text-[11px] font-bold transition-all cursor-pointer ${
                  slideWidth === '7xl'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
                title="Khung rộng 16:9 (1280px)"
              >
                7XL
              </button>
              <button
                onClick={() => setSlideWidth('full')}
                className={`px-2 py-1 rounded text-[11px] font-bold transition-all cursor-pointer ${
                  slideWidth === 'full'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
                title="Tràn toàn màn hình (100%)"
              >
                Tràn viền
              </button>
            </div>

            {/* 2. Question Content Font Size Adjustment */}
            <div className="flex items-center space-x-1 px-2 border-r border-slate-800">
              <Type className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="text-[11px] font-semibold text-slate-400 mr-1 hidden sm:inline">Cỡ chữ:</span>
              <button
                onClick={decreaseFontSize}
                disabled={fontSize <= 16}
                className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 transition-all cursor-pointer"
                title="Giảm kích thước chữ"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="text-xs font-black text-amber-300 px-1.5 min-w-[32px] text-center">
                {fontSize}px
              </span>
              <button
                onClick={increaseFontSize}
                disabled={fontSize >= 38}
                className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 transition-all cursor-pointer"
                title="Tăng kích thước chữ"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>

              {/* Quick Size Presets */}
              <div className="hidden md:flex items-center space-x-1 ml-1">
                {[18, 22, 28, 34].map((sz) => (
                  <button
                    key={sz}
                    onClick={() => setFontSize(sz)}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                      fontSize === sz
                        ? 'bg-amber-500 text-slate-950 font-black'
                        : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>

              <button
                onClick={resetFontSize}
                className="p-1 text-slate-400 hover:text-slate-200 transition-all cursor-pointer"
                title="Đặt lại cỡ chữ mặc định (22px)"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            </div>

            {/* Fullscreen Toggle Button */}
            <button
              onClick={toggleFullscreen}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center space-x-1.5 transition-all shadow-sm cursor-pointer"
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{isFullscreen ? 'Thoát toàn màn hình' : 'Toàn màn hình'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Slide Content Area */}
      <div className="flex-1 min-h-[400px] sm:min-h-[480px] flex flex-col justify-center bg-slate-950/90 rounded-2xl p-4 sm:p-8 border border-slate-800/80 relative shadow-2xl overflow-y-auto">
        {currentSlide === 0 ? (
          /* Cover Slide */
          <div className="text-center space-y-6 max-w-2xl mx-auto py-8">
            <span className="px-3.5 py-1.5 rounded-full bg-blue-900/60 text-blue-300 border border-blue-700 text-xs font-bold uppercase tracking-wider">
              {test.config.schoolName} - {test.config.departmentName || 'TỔ TOÁN'}
            </span>

            <h1 className="text-2xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 leading-tight">
              {test.config.title}
            </h1>

            <div className="text-sm text-slate-300 space-y-1">
              <p className="font-semibold text-slate-200">Chương trình GDPT 2018 - Môn Toán Lớp 12 - Năm học: {test.config.academicYear || '2026 - 2027'}</p>
              <p className="text-slate-400">
                Thời gian làm bài: <strong className="text-blue-300">{test.config.durationMinutes} phút</strong> | Tổng số câu: <strong className="text-emerald-400">{test.questions.length} câu</strong>
              </p>
            </div>

            <div className="pt-4">
              <button
                onClick={nextSlide}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg transition-all flex items-center space-x-2 mx-auto cursor-pointer"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Bắt đầu trình chiếu câu hỏi</span>
              </button>
            </div>
          </div>
        ) : (
          /* Question Slide with Adjustable Width and Font Sizes */
          activeQuestion && (
            <div className={`space-y-6 mx-auto w-full transition-all ${getMaxWidthClass()}`}>
              {/* Question Header & Level Badge */}
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 gap-2">
                <div className="flex items-center space-x-2">
                  <span className="px-3.5 py-1.5 rounded-xl bg-blue-600 text-white font-black text-sm shadow-md">
                    Câu {currentSlide} / {questions.length}
                  </span>
                  <span className="px-3 py-1 rounded-lg bg-slate-800 text-blue-300 text-xs font-semibold border border-slate-700">
                    {activeQuestion.type === 'multiple_choice'
                      ? 'Trắc nghiệm 4 lựa chọn'
                      : activeQuestion.type === 'true_false'
                      ? 'Trắc nghiệm Đúng / Sai'
                      : 'Trả lời ngắn / Tự luận'}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-xs text-slate-400 hidden sm:inline">Cỡ chữ: {fontSize}px</span>
                  <span className="text-xs text-amber-300 font-bold bg-amber-950/80 px-3 py-1 rounded-lg border border-amber-800">
                    Mức độ: {activeQuestion.level}
                  </span>
                </div>
              </div>

              {/* Dynamic Font Size Adjusted Question Content */}
              <div
                className="font-medium text-slate-100 leading-relaxed pt-1"
                style={{ fontSize: `${fontSize}px`, lineHeight: 1.6 }}
              >
                <MathText text={activeQuestion.content} />
              </div>

              {/* Diagram Render */}
              <DiagramRenderer
                diagramId={resolveQuestionDiagram(activeQuestion)}
                questionContent={activeQuestion.content}
                tikzCode={activeQuestion.tikzCode}
                tikzPrompt={activeQuestion.tikzPrompt}
                imageUrl={activeQuestion.imageUrl}
              />

              {/* Multiple Choice Options */}
              {activeQuestion.type === 'multiple_choice' && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="font-semibold text-slate-300">Nhấp vào phương án để chọn đáp án:</span>
                    {userMcqAnswers[qId] && (
                      <button
                        onClick={handleResetCurrentQuestion}
                        className="text-amber-400 hover:text-amber-300 flex items-center space-x-1 font-semibold cursor-pointer"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Xóa chọn</span>
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {activeQuestion.options.map((opt) => {
                      const isSelected = userMcqAnswers[qId] === opt.key;
                      const isCorrectAnswer = opt.key === activeQuestion.correctAnswer;
                      const choiceFontSize = Math.max(14, fontSize - 3);

                      let containerStyle = 'bg-slate-900/90 border-slate-800 text-slate-200 hover:border-slate-700';
                      let badgeStyle = 'bg-slate-800 text-slate-300';
                      let statusText = null;

                      if (showAnswer) {
                        if (isCorrectAnswer) {
                          containerStyle =
                            'bg-emerald-950/90 border-emerald-500 text-emerald-100 font-bold ring-2 ring-emerald-500 shadow-lg';
                          badgeStyle = 'bg-emerald-500 text-white';
                          statusText = isSelected ? '✓ CHỌN ĐÚNG' : '★ ĐÁP ÁN ĐÚNG';
                        } else if (isSelected) {
                          containerStyle =
                            'bg-rose-950/90 border-rose-500 text-rose-100 font-bold ring-2 ring-rose-500 shadow-lg';
                          badgeStyle = 'bg-rose-500 text-white';
                          statusText = '✗ CHỌN SAI';
                        }
                      } else if (isSelected) {
                        containerStyle =
                          'bg-blue-950/90 border-blue-500 text-blue-100 font-bold ring-2 ring-blue-500 shadow-md';
                        badgeStyle = 'bg-blue-500 text-white';
                        statusText = 'ĐÃ CHỌN';
                      }

                      return (
                        <button
                          key={opt.key}
                          type="button"
                          onClick={() => handleSelectMcq(opt.key)}
                          style={{ fontSize: `${choiceFontSize}px`, lineHeight: 1.5 }}
                          className={`p-4 rounded-xl border text-left transition-all flex items-start justify-between space-x-3.5 cursor-pointer overflow-x-auto ${containerStyle}`}
                        >
                          <div className="flex items-start space-x-3.5 flex-1 min-w-0">
                            <span
                              className={`rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 ${badgeStyle}`}
                              style={{
                                width: `${Math.max(26, choiceFontSize + 4)}px`,
                                height: `${Math.max(26, choiceFontSize + 4)}px`,
                                fontSize: `${Math.max(12, choiceFontSize - 4)}px`,
                              }}
                            >
                              {opt.key}
                            </span>
                            <div className="pt-0.5 flex-1 min-w-0 overflow-x-auto">
                              <MathText text={opt.text} />
                            </div>
                          </div>
                          {statusText && (
                            <span
                              className={`text-[11px] font-black uppercase px-2 py-0.5 rounded shrink-0 ${
                                statusText.includes('ĐÚNG')
                                  ? 'bg-emerald-600 text-white'
                                  : statusText.includes('SAI')
                                  ? 'bg-rose-600 text-white'
                                  : 'bg-blue-600 text-white'
                              }`}
                            >
                              {statusText}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* True / False Statements */}
              {activeQuestion.type === 'true_false' && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="font-semibold text-slate-300">Chọn Đúng hoặc Sai cho mỗi mệnh đề:</span>
                    {userTfAnswers[qId] && Object.keys(userTfAnswers[qId]).length > 0 && (
                      <button
                        onClick={handleResetCurrentQuestion}
                        className="text-amber-400 hover:text-amber-300 flex items-center space-x-1 font-semibold cursor-pointer"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Xóa chọn</span>
                      </button>
                    )}
                  </div>

                  <div className="space-y-2.5">
                    {(activeQuestion.statements || []).map((st, index) => {
                      const statementFontSize = Math.max(14, fontSize - 3);
                      const letter = (st.id || ['a', 'b', 'c', 'd'][index] || 'a').toLowerCase();
                      const statementText =
                        st.text ||
                        (st as any).statement ||
                        (st as any).content ||
                        (st as any).value ||
                        `Mệnh đề (${letter}) của bài toán`;

                      const userChoice = userTfAnswers[qId]?.[letter];
                      const isUserCorrect = showAnswer && userChoice !== undefined && userChoice === st.isCorrect;
                      const isUserWrong = showAnswer && userChoice !== undefined && userChoice !== st.isCorrect;

                      return (
                        <div
                          key={st.id || index}
                          style={{ fontSize: `${statementFontSize}px`, lineHeight: 1.5 }}
                          className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs transition-all ${
                            isUserCorrect
                              ? 'bg-emerald-950/60 border-emerald-500/80'
                              : isUserWrong
                              ? 'bg-rose-950/60 border-rose-500/80'
                              : 'bg-slate-900 border-slate-800'
                          }`}
                        >
                          <div className="flex items-start space-x-2.5 flex-1 min-w-0">
                            <span className="font-bold text-blue-400 shrink-0">{letter})</span>
                            <div className="text-slate-100 flex-1">
                              <MathText text={statementText} inline />
                            </div>
                          </div>

                          {/* Interactive ĐÚNG / SAI Buttons */}
                          <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
                            <button
                              type="button"
                              onClick={() => handleSelectTf(letter, true)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1 cursor-pointer border ${
                                userChoice === true
                                  ? 'bg-emerald-600 text-white border-emerald-400 ring-2 ring-emerald-500 shadow-md'
                                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                              }`}
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>ĐÚNG</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleSelectTf(letter, false)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1 cursor-pointer border ${
                                userChoice === false
                                  ? 'bg-rose-600 text-white border-rose-400 ring-2 ring-rose-500 shadow-md'
                                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                              }`}
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>SAI</span>
                            </button>

                            {/* Official Answer & Accuracy Badge */}
                            {showAnswer && (
                              <div className="flex items-center space-x-1 pl-2 border-l border-slate-700">
                                <span
                                  className={`px-2.5 py-1 rounded-md font-black text-xs ${
                                    st.isCorrect ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                                  }`}
                                >
                                  {st.isCorrect ? 'ĐÚNG' : 'SAI'}
                                </span>
                                {userChoice !== undefined && (
                                  <span className="ml-1" title={isUserCorrect ? 'Bạn chọn chính xác' : 'Bạn chọn chưa đúng'}>
                                    {isUserCorrect ? (
                                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                    ) : (
                                      <XCircle className="w-4 h-4 text-rose-400" />
                                    )}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Short Answer Input */}
              {activeQuestion.type === 'short_answer' && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="font-semibold text-slate-300 flex items-center space-x-1">
                      <Edit3 className="w-3.5 h-3.5 text-purple-400" />
                      <span>Nhập đáp số (Dạng điền kết quả 4 ký tự):</span>
                    </span>
                    {userSaAnswers[qId] && (
                      <button
                        onClick={handleResetCurrentQuestion}
                        className="text-amber-400 hover:text-amber-300 flex items-center space-x-1 font-semibold cursor-pointer"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Xóa nhập</span>
                      </button>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 bg-slate-900/80 p-3 rounded-xl border border-slate-700/80">
                    <input
                      type="text"
                      maxLength={4}
                      value={userSaAnswers[qId] || ''}
                      onChange={(e) => handleSaChange(e.target.value.slice(0, 4))}
                      placeholder="VD: 12, -0.5..."
                      style={{ fontSize: `${Math.max(16, fontSize - 2)}px` }}
                      className="w-44 px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-amber-300 font-bold font-mono tracking-wider text-center focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all placeholder:text-slate-600"
                    />

                    {/* 4 character boxes representation */}
                    <div className="flex items-center space-x-1.5">
                      {Array.from({ length: 4 }).map((_, charIdx) => {
                        const val = userSaAnswers[qId] || '';
                        const char = val[charIdx] || '';
                        return (
                          <div
                            key={charIdx}
                            className={`w-9 h-11 border-2 rounded-lg flex items-center justify-center font-mono font-black text-lg transition-all ${
                              char
                                ? 'border-amber-400 bg-amber-500/10 text-amber-300 shadow-sm'
                                : 'border-slate-700 bg-slate-950 text-slate-600'
                            }`}
                          >
                            {char || '·'}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    * Phiếu trả lời GDPT 2018: Mỗi ô chứa 1 ký tự (số, dấu trừ '-' hoặc dấu phẩy/chấm thập phân).
                  </p>

                  {showAnswer && (
                    <div
                      className={`p-4 rounded-xl border text-sm space-y-1 ${
                        (userSaAnswers[qId] || '').trim().toLowerCase() ===
                        (activeQuestion.correctAnswer || '').trim().toLowerCase()
                          ? 'bg-emerald-950/80 border-emerald-500 text-emerald-100'
                          : 'bg-purple-950/80 border-purple-800 text-purple-100'
                      }`}
                    >
                      <div className="flex items-center space-x-2 font-bold text-base">
                        {(userSaAnswers[qId] || '').trim().toLowerCase() ===
                        (activeQuestion.correctAnswer || '').trim().toLowerCase() ? (
                          <>
                            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                            <span className="text-emerald-300">Chính xác! Bạn đã điền đúng đáp số.</span>
                          </>
                        ) : (
                          <>
                            <HelpCircle className="w-5 h-5 text-purple-300" />
                            <span className="text-purple-200">
                              Đáp số chuẩn: <strong className="text-white text-lg ml-1">{activeQuestion.correctAnswer}</strong>
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Solution Reveal */}
              {showAnswer && (
                <div
                  className="mt-4 p-4.5 bg-blue-950/80 border border-blue-800/80 rounded-xl text-slate-200 space-y-1.5 shadow-md"
                  style={{ fontSize: `${Math.max(13, fontSize - 5)}px`, lineHeight: 1.6 }}
                >
                  <span className="font-bold text-blue-300 block mb-1">Hướng dẫn giải chi tiết:</span>
                  <MathText text={activeQuestion.solution} />
                </div>
              )}

              {/* On Last Question Slide: Prominent Submit Test Banner */}
              {currentSlide === questions.length && (
                <div className="mt-6 p-5 rounded-2xl bg-gradient-to-r from-emerald-950/90 via-teal-950/90 to-blue-950/90 border-2 border-emerald-500/80 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center space-x-3.5">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0 text-emerald-400">
                      <Award className="w-7 h-7" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-white flex items-center gap-2">
                        <span>Đây là câu hỏi cuối cùng của đề thi</span>
                        <span className="px-2.5 py-0.5 text-xs bg-emerald-500 text-slate-950 font-black rounded-full uppercase">
                          Câu {questions.length}/{questions.length}
                        </span>
                      </h4>
                      <p className="text-xs text-slate-300 mt-0.5">
                        {isSubmitted
                          ? 'Bạn đã nộp bài. Nhấp bên dưới để xem bảng điểm chi tiết.'
                          : 'Hãy kiểm tra kĩ các đáp án đã chọn trước khi bấm Nộp bài & Chấm điểm!'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2.5 w-full sm:w-auto shrink-0">
                    <button
                      onClick={handleSubmitTest}
                      className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm flex items-center justify-center space-x-2 shadow-lg shadow-emerald-900/40 hover:scale-[1.02] transition-all cursor-pointer"
                    >
                      <Send className="w-4 h-4 fill-slate-950" />
                      <span>{isSubmitted ? 'Xem lại kết quả & Bảng điểm' : 'Nộp bài (Chấm & Trả điểm)'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        )}
      </div>

      {/* Bottom Controls Bar */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">
        <div className="flex items-center space-x-2">
          <button
            onClick={prevSlide}
            disabled={currentSlide === 0}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-xs font-semibold flex items-center space-x-1 transition-all border border-slate-700 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Trang trước</span>
          </button>

          <span className="text-xs font-bold text-slate-300 px-3 py-1 bg-slate-950 rounded-lg border border-slate-800">
            {currentSlide} / {questions.length}
          </span>

          <button
            onClick={nextSlide}
            disabled={currentSlide >= totalSlides - 1}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-xs font-semibold flex items-center space-x-1 transition-all border border-slate-700 cursor-pointer"
          >
            <span>Trang tiếp</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Submit/Results Button in Bottom Controls */}
          {(currentSlide === questions.length || isSubmitted) && (
            <button
              onClick={handleSubmitTest}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black flex items-center space-x-1.5 transition-all shadow-md cursor-pointer border border-emerald-400/50"
            >
              <Award className="w-4 h-4 text-emerald-200" />
              <span>{isSubmitted ? 'Xem Bảng Điểm' : 'Nộp Bài'}</span>
            </button>
          )}

          {/* In Fullscreen mode: Quick Font Size controls */}
          {isFullscreen && (
            <div className="flex items-center space-x-1 px-2 py-1 bg-slate-900 rounded-xl border border-slate-800 text-xs">
              <Type className="w-3.5 h-3.5 text-amber-400 shrink-0 hidden sm:inline" />
              <button
                onClick={decreaseFontSize}
                disabled={fontSize <= 16}
                className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 transition-all cursor-pointer"
                title="Giảm kích thước chữ"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="text-xs font-black text-amber-300 px-1 min-w-[28px] text-center">
                {fontSize}px
              </span>
              <button
                onClick={increaseFontSize}
                disabled={fontSize >= 38}
                className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 transition-all cursor-pointer"
                title="Tăng kích thước chữ"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {currentSlide > 0 && (
            <button
              onClick={() => setShowAnswer(!showAnswer)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 border cursor-pointer ${
                showAnswer
                  ? 'bg-emerald-600 text-white border-emerald-500 shadow-md'
                  : 'bg-blue-600 text-white border-blue-500 hover:bg-blue-500'
              }`}
            >
              {showAnswer ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span>{showAnswer ? 'Ẩn đáp án & Lời giải' : 'Hiện đáp án & Lời giải'}</span>
            </button>
          )}

          {/* Fullscreen Toolbar Toggle & Exit Fullscreen Buttons */}
          {isFullscreen && (
            <div className="flex items-center space-x-1.5">
              <button
                onClick={() => setShowToolbarInFullscreen(!showToolbarInFullscreen)}
                className={`p-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                  showToolbarInFullscreen
                    ? 'bg-blue-600 text-white border-blue-500'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
                title={showToolbarInFullscreen ? 'Ẩn thanh công cụ trên' : 'Hiện thanh công cụ cài đặt'}
              >
                <Sliders className="w-4 h-4" />
              </button>

              <button
                onClick={toggleFullscreen}
                className="px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center space-x-1.5 transition-all shadow-md cursor-pointer"
                title="Thoát chế độ toàn màn hình"
              >
                <Minimize2 className="w-4 h-4" />
                <span className="hidden md:inline">Thoát toàn màn hình</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Score Result Modal Dialog */}
      {showResultModal && (
        <div className="fixed inset-0 z-[9999] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Background Glow */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-2xl text-emerald-400">
                  <Trophy className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white">Kết Quả Đề Thi</h3>
                  <p className="text-xs text-slate-400">{test.config.title || 'Đề thi Toán GDPT 2018'}</p>
                </div>
              </div>
              <button
                onClick={() => setShowResultModal(false)}
                className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Score Big Display */}
            <div className="my-6 p-6 rounded-2xl bg-slate-950/90 border border-slate-800 text-center relative">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Điểm số đạt được
              </span>
              <div className="text-5xl font-black text-white tracking-tight my-2">
                <span className="text-emerald-400">{testResults.finalScore}</span>
                <span className="text-slate-500 text-3xl font-bold"> / 10.0</span>
              </div>
              <div className="mt-3">
                <span className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold border ${testResults.gradeColor}`}>
                  <Award className="w-3.5 h-3.5" />
                  <span>Xếp loại: {testResults.gradeRating}</span>
                </span>
              </div>
            </div>

            {/* Breakdown Stats */}
            <div className="space-y-2.5 my-4">
              {testResults.mcqTotal > 0 && (
                <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-medium">Phần 1: Trắc nghiệm (4 phương án)</span>
                  <span className="font-bold text-emerald-400">
                    {testResults.mcqCorrect} / {testResults.mcqTotal} câu đúng
                  </span>
                </div>
              )}

              {testResults.tfTotalQ > 0 && (
                <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-medium">Phần 2: Đúng / Sai ({testResults.tfTotalQ} câu)</span>
                  <span className="font-bold text-blue-400">
                    {testResults.tfStatementsCorrect} / {testResults.tfStatementsTotal} ý chính xác
                  </span>
                </div>
              )}

              {testResults.saTotal > 0 && (
                <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-medium">Phần 3: Trả lời ngắn</span>
                  <span className="font-bold text-purple-400">
                    {testResults.saCorrect} / {testResults.saTotal} đáp số đúng
                  </span>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={() => {
                  setShowResultModal(false);
                  setShowAnswer(true);
                }}
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center justify-center space-x-2 transition-all shadow-lg cursor-pointer"
              >
                <FileCheck className="w-4 h-4" />
                <span>Xem lại Đáp án & Lời giải</span>
              </button>

              <button
                onClick={handleRetakeTest}
                className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm flex items-center justify-center space-x-2 transition-all border border-slate-700 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Làm lại đề thi</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

