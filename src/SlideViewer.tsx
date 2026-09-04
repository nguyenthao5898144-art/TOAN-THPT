import React, { useState } from 'react';
import { GeneratedTest, Question } from './types';
import { MathText } from './MathText';
import { DiagramRenderer } from './DiagramRenderer';
import {
  Maximize2, Minimize2, ChevronLeft, ChevronRight, Eye,
  EyeOff, RotateCcw, BookOpen
} from 'lucide-react';

interface SlideViewerProps {
  test: GeneratedTest;
}

export const SlideViewer: React.FC<SlideViewerProps> = ({ test }) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [showSolution, setShowSolution] = useState<boolean>(false);
  const [fontSize, setFontSize] = useState<number>(22);
  const [containerWidth, setContainerWidth] = useState<'3xl' | '5xl' | '7xl' | 'full'>('5xl');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Nhận diện chính xác khối lớp của đề thi
  const grade = test.config?.grade || (test as any).grade || '11';

  const questions = test.questions || [];
  const totalQuestions = questions.length;
  const currentQuestion: Question | undefined = questions[currentIndex];

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setShowSolution(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowSolution(false);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  const getContainerWidthClass = () => {
    switch (containerWidth) {
      case '3xl': return 'max-w-3xl';
      case '5xl': return 'max-w-5xl';
      case '7xl': return 'max-w-7xl';
      case 'full': return 'w-full px-2 sm:px-6';
      default: return 'max-w-5xl';
    }
  };

  if (!currentQuestion || totalQuestions === 0) {
    return (
      <div className="bg-slate-900 text-white p-12 rounded-3xl text-center border border-slate-800 space-y-3 font-sans">
        <BookOpen className="w-12 h-12 text-blue-400 mx-auto" />
        <h3 className="text-lg font-bold">Chưa có câu hỏi nào để trình chiếu</h3>
        <p className="text-xs text-slate-400">Vui lòng tạo đề thi hoặc nạp file câu hỏi trước khi mở trình chiếu Slide.</p>
      </div>
    );
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'multiple_choice': return 'Trắc nghiệm 4 lựa chọn';
      case 'true_false': return 'Trắc nghiệm Đúng / Sai';
      case 'short_answer': return 'Trắc nghiệm Trả lời ngắn';
      default: return 'Câu hỏi Toán học';
    }
  };

  return (
    <div className="font-sans space-y-4">
      {/* 1. THANH CÔNG CỤ TRÊN CÙNG */}
      <div className="bg-slate-950 text-white p-5 rounded-3xl border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/30 text-blue-400 flex items-center justify-center border border-blue-500/30 shadow">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-wide">
                  SLIDE TRÌNH CHIẾU DẠNG CÂU HỎI & ĐÁP ÁN
                </h2>
                <span className="text-xs bg-emerald-700/80 text-emerald-200 px-3 py-0.5 rounded-full font-bold border border-emerald-500/30">
                  Lớp {grade} GDPT 2018
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Trình chiếu trực tiếp trên máy chiếu / màn hình với tùy chỉnh kích thước chữ & độ rộng thanh chiếu
              </p>
            </div>
          </div>
        </div>

        {/* Thanh công cụ điều chỉnh Khung chiếu, Cỡ chữ & Toàn màn hình */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 p-3 rounded-2xl border border-slate-800 text-xs">
          {/* Khung chiếu */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-bold">↔ Khung chiếu:</span>
            <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700">
              <button
                type="button"
                onClick={() => setContainerWidth('3xl')}
                className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${containerWidth === '3xl' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
              >
                3XL
              </button>
              <button
                type="button"
                onClick={() => setContainerWidth('5xl')}
                className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${containerWidth === '5xl' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
              >
                5XL
              </button>
              <button
                type="button"
                onClick={() => setContainerWidth('7xl')}
                className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${containerWidth === '7xl' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
              >
                7XL
              </button>
              <button
                type="button"
                onClick={() => setContainerWidth('full')}
                className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${containerWidth === 'full' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
              >
                Tràn viền
              </button>
            </div>
          </div>

          {/* Cỡ chữ - CÁC NÚT ĐƯỢC VIẾT TĨNH CHẮC CHẮN 100% */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-bold">T Cỡ chữ:</span>
            <button
              type="button"
              onClick={() => setFontSize(Math.max(16, fontSize - 2))}
              className="w-7 h-7 bg-slate-800 hover:bg-slate-700 rounded-lg text-white font-bold flex items-center justify-center border border-slate-700 cursor-pointer"
            >
              -
            </button>
            <span className="font-bold text-amber-400 px-1 font-mono">{fontSize}px</span>
            <button
              type="button"
              onClick={() => setFontSize(Math.min(40, fontSize + 2))}
              className="w-7 h-7 bg-slate-800 hover:bg-slate-700 rounded-lg text-white font-bold flex items-center justify-center border border-slate-700 cursor-pointer"
            >
              +
            </button>

            {/* 4 NÚT CỠ CHỮ TĨNH CHUẨN XÁC */}
            <div className="flex bg-slate-800 p-0.5 rounded-lg border border-slate-700 ml-1">
              <button
                type="button"
                onClick={() => setFontSize(18)}
                className={`px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer ${fontSize === 18 ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-400 hover:text-white'}`}
              >
                18
              </button>
              <button
                type="button"
                onClick={() => setFontSize(22)}
                className={`px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer ${fontSize === 22 ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-400 hover:text-white'}`}
              >
                22
              </button>
              <button
                type="button"
                onClick={() => setFontSize(28)}
                className={`px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer ${fontSize === 28 ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-400 hover:text-white'}`}
              >
                28
              </button>
              <button
                type="button"
                onClick={() => setFontSize(34)}
                className={`px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer ${fontSize === 34 ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-400 hover:text-white'}`}
              >
                34
              </button>
            </div>

            <button
              type="button"
              onClick={() => setFontSize(22)}
              className="p-1.5 text-slate-400 hover:text-white ml-0.5 cursor-pointer"
              title="Đặt lại cỡ chữ 22px"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Toàn màn hình */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-lg cursor-pointer"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            <span>{isFullscreen ? 'Thu nhỏ' : 'Toàn màn hình'}</span>
          </button>
        </div>
      </div>

      {/* 2. KHUNG HIỂN THỊ CÂU HỎI TRÌNH CHIẾU */}
      <div className={`mx-auto ${getContainerWidthClass()} transition-all duration-300`}>
        <div className="bg-slate-950 text-white rounded-3xl border border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <span className="px-4 py-1.5 bg-blue-600 text-white font-black text-sm rounded-xl shadow">
                Câu {currentIndex + 1} / {totalQuestions}
              </span>
              <span className="px-3.5 py-1 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold border border-slate-700">
                {getTypeLabel(currentQuestion.type)}
              </span>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <span className="text-slate-400">Cỡ chữ: <strong className="text-slate-200">{fontSize}px</strong></span>
              <span className="px-3 py-1 bg-amber-950/80 text-amber-300 rounded-xl font-bold border border-amber-800/60">
                Mức độ: {currentQuestion.level || 'NhanBiet'}
              </span>
            </div>
          </div>

          {/* Nội dung câu hỏi (Render công thức Toán bằng KaTeX) */}
          <div style={{ fontSize: `${fontSize}px`, lineHeight: 1.6 }} className="text-slate-100 font-medium leading-relaxed">
            <MathText text={currentQuestion.content} />
          </div>

          {currentQuestion.diagramId && (
            <div className="my-4 p-4 bg-slate-900 rounded-2xl border border-slate-800 flex justify-center">
              <DiagramRenderer diagramId={currentQuestion.diagramId} formula={(currentQuestion as any).formula} questionContent={currentQuestion.content} />
            </div>
          )}

          {/* Phần I: Trắc nghiệm 4 lựa chọn */}
          {currentQuestion.type === 'multiple_choice' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {((currentQuestion as any).options || []).map((opt: any) => {
                const isCorrect = showSolution && opt.key === (currentQuestion as any).correctAnswer;
                return (
                  <div
                    key={opt.key}
                    style={{ fontSize: `${Math.max(16, fontSize - 2)}px` }}
                    className={`p-4 rounded-2xl border flex items-center gap-3 transition-all ${
                      isCorrect
                        ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200 ring-2 ring-emerald-400'
                        : 'bg-slate-900/90 border-slate-800 text-slate-200'
                    }`}
                  >
                    <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                      isCorrect ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300 border border-slate-700'
                    }`}>
                      {opt.key}
                    </span>
                    <MathText text={opt.text} />
                  </div>
                );
              })}
            </div>
          )}

          {/* Phần II: Trắc nghiệm Đúng / Sai */}
          {currentQuestion.type === 'true_false' && (
            <div className="space-y-2.5 pt-2">
              {((currentQuestion as any).statements || []).map((st: any) => (
                <div
                  key={st.id}
                  style={{ fontSize: `${Math.max(15, fontSize - 3)}px` }}
                  className="p-3.5 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="font-bold text-blue-400 uppercase">Ý {st.id})</span>
                    <MathText text={st.text} />
                  </div>
                  {showSolution && (
                    <span className={`px-3 py-1 rounded-xl text-xs font-black shrink-0 ${
                      st.isCorrect ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                    }`}>
                      {st.isCorrect ? 'ĐÚNG' : 'SAI'}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Phần III: Trả lời ngắn */}
          {currentQuestion.type === 'short_answer' && showSolution && (
            <div className="p-4 bg-blue-950/60 border border-blue-700/60 rounded-2xl">
              <span className="text-xs text-blue-300 font-bold block mb-1">ĐÁP SỐ CHUẨN:</span>
              <span className="text-xl font-black text-white font-mono">
                {(currentQuestion as any).correctAnswer || 'Chưa cập nhật'}
              </span>
            </div>
          )}

          {/* Hướng dẫn giải chi tiết */}
          {showSolution && currentQuestion.solution && (
            <div className="p-5 bg-slate-900/90 border border-slate-700 rounded-2xl space-y-2 animate-in fade-in">
              <span className="text-xs text-amber-400 font-bold uppercase tracking-wider block">
                HƯỚNG DẪN GIẢI CHI TIẾT:
              </span>
              <div style={{ fontSize: `${Math.max(15, fontSize - 4)}px` }} className="text-slate-300 leading-relaxed">
                <MathText text={currentQuestion.solution} />
              </div>
            </div>
          )}

          {/* Điều hướng câu hỏi */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              disabled={currentIndex === 0}
              onClick={handlePrev}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" /> Câu trước
            </button>

            <button
              type="button"
              onClick={() => setShowSolution(!showSolution)}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl text-xs flex items-center gap-2 shadow-lg cursor-pointer transition-all"
            >
              {showSolution ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span>{showSolution ? 'Ẩn đáp án & Lời giải' : 'Hiện đáp án & Lời giải'}</span>
            </button>

            <button
              type="button"
              disabled={currentIndex === totalQuestions - 1}
              onClick={handleNext}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <span>Câu sau</span> <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SlideViewer;
