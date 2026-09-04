import React, { useState, useEffect } from 'react';
import { TestConfig, GeneratedTest, StudentAccount, StudentSubmission } from './types';
import { generateTest } from './testGenerator';
import { MathText } from './MathText';
import { DiagramRenderer } from './DiagramRenderer';
import { Sparkles, BookOpen, Clock, Table, CheckSquare, Square } from 'lucide-react';

interface ViewProps {
  test: GeneratedTest;
  onBack?: () => void;
}

export const StudentView: React.FC<ViewProps> = ({ test, onBack }) => {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);

  const handleSelectOption = (questionId: string, optionKey: string) => {
    if (submitted) return;
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: optionKey
    }));
  };

  const handleSubmit = () => {
    let totalScore = 0;
    test.questions.forEach((q) => {
      if (q.type === 'multiple_choice' && selectedAnswers[q.id] === q.correctAnswer) {
        totalScore += 0.25;
      }
    });
    setScore(totalScore);
    setSubmitted(true);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 bg-white min-h-screen text-slate-800">
      <div className="border-b border-slate-200 pb-6 mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold uppercase text-slate-900">{test.config.title}</h1>
          <p className="text-sm text-slate-500 mt-1">Môn: Toán Khối {test.config.grade} | Thời gian: {test.config.durationMinutes || 45} phút</p>
        </div>
        {onBack && (
          <button
            onClick={onBack}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition-colors text-sm"
          >
            Quay lại
          </button>
        )}
      </div>

      <div className="space-y-8">
        {test.questions.map((q, index) => (
          <div key={q.id} className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50 shadow-sm">
            <div className="font-bold text-slate-900 mb-3 flex items-start gap-2">
              <span className="text-blue-600">Câu {index + 1}:</span>
              <div className="flex-1">
                <MathText content={q.content} />
              </div>
            </div>

            {q.type === 'multiple_choice' && q.options && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                {q.options.map((opt) => {
                  const isSelected = selectedAnswers[q.id] === opt.key;
                  return (
                    <button
                      key={opt.key}
                      onClick={() => handleSelectOption(q.id, opt.key)}
                      className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                        isSelected 
                          ? 'bg-blue-600 text-white border-blue-600 shadow-md' 
                          : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700'
                      }`}
                    >
                      <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-sm ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {opt.key}
                      </span>
                      <span className="text-sm">
                        <MathText content={opt.text} />
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-8 pt-6 border-t border-slate-200 flex items-center justify-between">
        {submitted ? (
          <div className="text-lg font-bold text-emerald-600">
            Kết quả của bạn: {score} / 10 điểm
          </div>
        ) : (
          <button
            onClick={handleSubmit}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-600/25 transition-all ml-auto"
          >
            Nộp bài thi
          </button>
        )}
      </div>
    </div>
  );
};

export default StudentView;
