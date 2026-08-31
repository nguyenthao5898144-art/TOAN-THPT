import React, { useState, useEffect, useMemo } from 'react';
import { TestConfig, GeneratedTest, StudentAccount, StudentSubmission } from '../types';
import { generateUniqueTestForStudent } from '../utils/studentTestGenerator';
import { MathText } from './MathText';
import { DiagramRenderer } from './DiagramRenderer';
import { resolveQuestionDiagram } from '../utils/mathGraphParser';
import { 
  Play, Clock, CheckCircle2, Award, LogIn, UserCheck, 
  Send, AlertCircle, RefreshCw, Trophy, BookOpen 
} from 'lucide-react';

interface StudentPortalProps {
  testConfig: TestConfig;
  assignmentTitle: string;
}

// Danh sách tài khoản học sinh mẫu (Thầy có thể đồng bộ từ danh sách lớp)
const MOCK_STUDENT_DATABASE: StudentAccount[] = [
  { id: 'HS12_01', username: '12a1_01', password: '123', fullName: 'Nguyễn Văn An', className: '12A1' },
  { id: 'HS12_02', username: '12a1_02', password: '123', fullName: 'Trần Thị Mai', className: '12A1' },
  { id: 'HS12_03', username: '12a1_03', password: '123', fullName: 'Lê Hoàng Nam', className: '12A1' },
  { id: 'HS12_04', username: '12a2_01', password: '123', fullName: 'Phạm Quốc Bảo', className: '12A2' },
];

export const StudentPortal: React.FC<StudentPortalProps> = ({ testConfig, assignmentTitle }) => {
  // Trạng thái đăng nhập học sinh
  const [currentUser, setCurrentUser] = useState<StudentAccount | null>(() => {
    try {
      const saved = localStorage.getItem('current_student_session');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);

  // Trạng thái bài làm
  const [isExamStarted, setIsExamStarted] = useState<boolean>(false);
  const [studentTest, setStudentTest] = useState<GeneratedTest | null>(null);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>((testConfig.durationMinutes || 45) * 60);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [submissionResult, setSubmissionResult] = useState<StudentSubmission | null>(null);

  // Trả lời của học sinh
  const [mcqAnswers, setMcqAnswers] = useState<Record<string, string>>({});
  const [tfAnswers, setTfAnswers] = useState<Record<string, Record<string, boolean>>>({});
  const [saAnswers, setSaAnswers] = useState<Record<string, string>>({});

  // 1. Xử lý Đăng nhập
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const found = MOCK_STUDENT_DATABASE.find(
      s => s.username.toLowerCase() === usernameInput.trim().toLowerCase() && 
           (s.password === passwordInput || !s.password)
    );
    if (found) {
      setCurrentUser(found);
      localStorage.setItem('current_student_session', JSON.stringify(found));
      setLoginError(null);
    } else {
      setLoginError('Tài khoản hoặc mật khẩu không chính xác! Vui lòng liên hệ Giáo viên bộ môn.');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsExamStarted(false);
    setStudentTest(null);
    setIsSubmitted(false);
    localStorage.removeItem('current_student_session');
  };

  // 2. Học sinh nhấn nút "BẮT ĐẦU LÀM BÀI" -> Sinh đề ngẫu nhiên riêng biệt
  const handleStartExam = () => {
    if (!currentUser) return;
    // Sinh đề độc bản theo đúng Ma trận cho học sinh này
    const uniqueTest = generateUniqueTestForStudent(testConfig, currentUser.id);
    setStudentTest(uniqueTest);
    setTimeLeftSeconds((testConfig.durationMinutes || 45) * 60);
    setIsExamStarted(true);
    setIsSubmitted(false);
  };

  // 3. Đồng hồ đếm ngược tự động
  useEffect(() => {
    if (!isExamStarted || isSubmitted) return;
    const timer = setInterval(() => {
      setTimeLeftSeconds(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitExam(); // Tự động nộp khi hết giờ
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isExamStarted, isSubmitted]);

  // 4. Chấm điểm & Nộp bài
  const handleSubmitExam = () => {
    if (!studentTest || !currentUser) return;

    let earnedScore = 0;
    const questions = studentTest.questions;

    questions.forEach(q => {
      if (q.type === 'multiple_choice') {
        if (mcqAnswers[q.id] === q.correctAnswer) {
          earnedScore += 0.25;
        }
      } else if (q.type === 'true_false') {
        let correctCount = 0;
        (q.statements || []).forEach((st, idx) => {
          const letter = (st.id || ['a', 'b', 'c', 'd'][idx]).toLowerCase();
          if (tfAnswers[q.id]?.[letter] === st.isCorrect) correctCount++;
        });
        if (correctCount === 1) earnedScore += 0.1;
        else if (correctCount === 2) earnedScore += 0.25;
        else if (correctCount === 3) earnedScore += 0.5;
        else if (correctCount === 4) earnedScore += 1.0;
      } else if (q.type === 'short_answer') {
        const userVal = (saAnswers[q.id] || '').trim().toLowerCase();
        const correctVal = (q.correctAnswer || '').trim().toLowerCase();
        if (userVal && userVal === correctVal) {
          earnedScore += 0.5;
        }
      }
    });

    const result: StudentSubmission = {
      assignmentId: testConfig.title,
      studentId: currentUser.id,
      studentName: currentUser.fullName,
      className: currentUser.className,
      score: Math.min(10, Math.max(0, Number(earnedScore.toFixed(2)))),
      totalQuestions: questions.length,
      submittedAt: new Date().toLocaleTimeString('vi-VN') + ' ' + new Date().toLocaleDateString('vi-VN'),
      timeSpentSeconds: (testConfig.durationMinutes || 45) * 60 - timeLeftSeconds,
      answers: { mcq: mcqAnswers, trueFalse: tfAnswers, shortAnswer: saAnswers }
    };

    setSubmissionResult(result);
    setIsSubmitted(true);

    // Lưu kết quả vào kho lịch sử nộp bài
    try {
      const history = JSON.parse(localStorage.getItem('student_submission_history') || '[]');
      history.push(result);
      localStorage.setItem('student_submission_history', JSON.stringify(history));
    } catch {}
  };

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // -------------------------------------------------------------
  // GIAO DIỆN 1: NẾU CHƯA ĐĂNG NHẬP
  // -------------------------------------------------------------
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-sans text-slate-100">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center mx-auto text-white font-black text-lg shadow-lg">
              12
            </div>
            <h2 className="text-xl font-black text-white">CỔNG LÀM BÀI TOÁN 12</h2>
            <p className="text-xs text-slate-400">Trường THPT Mai Thanh Thế - Năm học 2026 - 2027</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Tên đăng nhập / Mã học sinh:</label>
              <input
                type="text"
                required
                value={usernameInput}
                onChange={e => setUsernameInput(e.target.value)}
                placeholder="VD: 12a1_01"
                className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Mật khẩu:</label>
              <input
                type="password"
                required
                value={passwordInput}
                onChange={e => setPasswordInput(e.target.value)}
                placeholder="Nhập mật khẩu (mặc định: 123)"
                className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {loginError && (
              <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-800 text-xs text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{loginError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>ĐĂNG NHẬP VÀO LÀM BÀI</span>
            </button>
          </form>

          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-[11px] text-slate-400 text-center">
            * Học sinh đăng nhập bằng tài khoản do Thầy Thảo cấp để nhận đề kiểm tra.
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // GIAO DIỆN 2: MÀN HÌNH CHỜ - CHỈ CÓ NÚT "BẮT ĐẦU LÀM BÀI"
  // -------------------------------------------------------------
  if (!isExamStarted) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-sans text-slate-100">
        <div className="max-w-xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          {/* Header Thông tin Học sinh */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-white">{currentUser.fullName}</h3>
                <span className="text-xs text-emerald-400 font-semibold">Lớp: {currentUser.className} | Mã: {currentUser.id}</span>
              </div>
            </div>
            <button onClick={handleLogout} className="text-xs text-slate-400 hover:text-rose-400 underline">
              Đăng xuất
            </button>
          </div>

          {/* Chi tiết Bài tập do Thầy giao */}
          <div className="space-y-3 bg-slate-950 p-5 rounded-2xl border border-slate-800">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 bg-blue-950 px-2 py-0.5 rounded border border-blue-800">
              NHIỆM VỤ RÈN LUYỆN
            </span>
            <h1 className="text-xl font-black text-white leading-snug">{assignmentTitle || testConfig.title}</h1>
            
            <div className="grid grid-cols-2 gap-2.5 pt-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>Thời gian: <strong>{testConfig.durationMinutes || 45} phút</strong></span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-400" />
                <span>Định dạng: <strong>GDPT 2018</strong></span>
              </div>
            </div>

            <p className="text-[12px] text-slate-400 pt-2 leading-relaxed">
              📌 Khi nhấn <strong>"Bắt đầu làm bài"</strong>, hệ thống sẽ tự động tạo một <strong>mã đề ngẫu nhiên riêng cho bạn</strong> theo đúng cấu trúc Ma trận bài học.
            </p>
          </div>

          {/* Nút BẮT ĐẦU DUY NHẤT */}
          <button
            onClick={handleStartExam}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-600 hover:from-emerald-400 hover:to-blue-500 text-slate-950 font-black text-base flex items-center justify-center gap-3 shadow-xl hover:scale-[1.02] transition-all cursor-pointer"
          >
            <Play className="w-5 h-5 fill-slate-950" />
            <span>BẮT ĐẦU LÀM BÀI NGAY</span>
          </button>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // GIAO DIỆN 3: ĐANG LÀM BÀI HOẶC ĐÃ NỘP BÀI (STUDENT EXAM RUNNER)
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-12">
      {/* Thanh Header Đếm ngược cố định */}
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur border-b border-slate-800 px-4 py-3 shadow-lg">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
          <div>
            <span className="text-[11px] text-slate-400 block">{currentUser.fullName} ({currentUser.className})</span>
            <h2 className="text-xs sm:text-sm font-bold text-white truncate max-w-[200px] sm:max-w-md">
              {studentTest?.config.title}
            </h2>
          </div>

          <div className="flex items-center space-x-3">
            {/* Đồng hồ đếm ngược */}
            <div className={`px-3 py-1.5 rounded-xl border flex items-center space-x-2 font-mono font-black text-sm ${
              timeLeftSeconds < 300 
                ? 'bg-rose-950/90 text-rose-300 border-rose-700 animate-pulse' 
                : 'bg-slate-950 text-amber-300 border-slate-700'
            }`}>
              <Clock className="w-4 h-4" />
              <span>{formatTimer(timeLeftSeconds)}</span>
            </div>

            {!isSubmitted ? (
              <button
                onClick={handleSubmitExam}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center space-x-1.5 shadow-md cursor-pointer transition-all"
              >
                <Send className="w-3.5 h-3.5" />
                <span>NỘP BÀI</span>
              </button>
            ) : (
              <span className="px-3 py-1 rounded-xl bg-blue-600 text-white font-bold text-xs">
                ĐÃ NỘP BÀI
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Màn hình kết quả khi Nộp bài */}
      {isSubmitted && submissionResult && (
        <div className="max-w-5xl mx-auto px-4 pt-6">
          <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-950 via-slate-900 to-blue-950 border border-emerald-500/50 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400">
                <Trophy className="w-8 h-8" />
              </div>
              <div>
                <span className="text-xs font-bold text-emerald-400 uppercase">KẾT QUẢ ĐÃ LƯU</span>
                <h3 className="text-2xl font-black text-white">{submissionResult.studentName}</h3>
                <p className="text-xs text-slate-300">Nộp lúc: {submissionResult.submittedAt}</p>
              </div>
            </div>
            <div className="text-center sm:text-right bg-slate-950/80 px-6 py-3 rounded-2xl border border-slate-800">
              <span className="text-xs text-slate-400 block font-bold">ĐIỂM SỐ ĐẠT ĐƯỢC</span>
              <span className="text-4xl font-black text-emerald-400">{submissionResult.score}</span>
              <span className="text-slate-500 text-xl font-bold"> / 10.0</span>
            </div>
          </div>
        </div>
      )}

      {/* Danh sách câu hỏi đề thi độc bản của học sinh */}
      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {studentTest?.questions.map((q, idx) => (
          <div key={q.id} className="p-5 sm:p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-md space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <span className="font-extrabold text-blue-400 text-sm">
                Câu {idx + 1}. <span className="text-slate-400 font-normal text-xs">({q.type === 'multiple_choice' ? 'Trắc nghiệm 4 lựa chọn' : q.type === 'true_false' ? 'Đúng / Sai' : 'Trả lời ngắn'})</span>
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                {q.level}
              </span>
            </div>

            {/* Nội dung câu hỏi */}
            <div className="text-sm sm:text-base font-medium text-slate-100 leading-relaxed">
              <MathText text={q.content} />
            </div>

            {/* Hình vẽ / BBT nếu có */}
            <DiagramRenderer
              diagramId={resolveQuestionDiagram(q)}
              questionContent={q.content}
              imageUrl={q.imageUrl}
            />

            {/* Dạng 1: Trắc nghiệm 4 lựa chọn */}
            {q.type === 'multiple_choice' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {q.options.map(opt => {
                  const isChecked = mcqAnswers[q.id] === opt.key;
                  return (
                    <button
                      key={opt.key}
                      disabled={isSubmitted}
                      onClick={() => setMcqAnswers(prev => ({ ...prev, [q.id]: opt.key }))}
                      className={`p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                        isChecked
                          ? 'bg-blue-950 border-blue-500 text-white ring-2 ring-blue-400'
                          : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                        isChecked ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {opt.key}
                      </span>
                      <div className="pt-0.5 text-xs sm:text-sm">
                        <MathText text={opt.text} />
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Dạng 2: Đúng / Sai 4 ý a, b, c, d */}
            {q.type === 'true_false' && (
              <div className="space-y-2 pt-2">
                {q.statements.map((st, sIdx) => {
                  const letter = (st.id || ['a', 'b', 'c', 'd'][sIdx]).toLowerCase();
                  const currentChoice = tfAnswers[q.id]?.[letter];
                  return (
                    <div key={letter} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm">
                      <div className="flex items-start gap-2 flex-1">
                        <span className="font-bold text-blue-400 shrink-0">{letter})</span>
                        <MathText text={st.text} inline />
                      </div>
                      <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
                        <button
                          disabled={isSubmitted}
                          onClick={() => setTfAnswers(prev => ({ ...prev, [q.id]: { ...(prev[q.id] || {}), [letter]: true } }))}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                            currentChoice === true ? 'bg-emerald-600 text-white border-emerald-400' : 'bg-slate-800 text-slate-400 border-slate-700'
                          }`}
                        >
                          ĐÚNG
                        </button>
                        <button
                          disabled={isSubmitted}
                          onClick={() => setTfAnswers(prev => ({ ...prev, [q.id]: { ...(prev[q.id] || {}), [letter]: false } }))}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                            currentChoice === false ? 'bg-rose-600 text-white border-rose-400' : 'bg-slate-800 text-slate-400 border-slate-700'
                          }`}
                        >
                          SAI
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Dạng 3: Trả lời ngắn tối đa 4 ký tự */}
            {q.type === 'short_answer' && (
              <div className="pt-2 flex items-center gap-3">
                <span className="text-xs text-slate-400 font-bold">Đáp án của bạn (tối đa 4 ký tự):</span>
                <input
                  type="text"
                  maxLength={4}
                  disabled={isSubmitted}
                  value={saAnswers[q.id] || ''}
                  onChange={e => setSaAnswers(prev => ({ ...prev, [q.id]: e.target.value.slice(0, 4) }))}
                  placeholder="VD: 12, -0.5"
                  className="w-36 px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-center font-mono font-bold text-amber-300 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>
            )}

            {/* Lời giải chi tiết hiện sau khi nộp bài */}
            {isSubmitted && q.solution && (
              <div className="mt-3 p-3 bg-blue-950/70 border border-blue-800 rounded-xl text-xs space-y-1 text-slate-200">
                <span className="font-bold text-blue-300 block">Lời giải chi tiết:</span>
                <MathText text={q.solution} />
              </div>
            )}
          </div>
        ))}
      </main>
    </div>
  );
};
