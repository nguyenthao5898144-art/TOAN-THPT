import React, { useState, useEffect, useMemo } from 'react';
import { TestConfig, GeneratedTest, StudentAccount, StudentSubmission } from './types';
import { generateUniqueTestForStudent } from './testGenerator';
import { MathText } from './MathText';
import { DiagramRenderer } from './DiagramRenderer';
import { resolveQuestionDiagram } from './mathGraphParser';
import { getStoredClasses, saveStudentSubmission, ClassRoom } from './classStorage';
import {
  Play, Clock, CheckCircle2, Award, LogIn, UserCheck,
  Send, AlertCircle, RefreshCw, Trophy, BookOpen, User, KeyRound, Check
} from 'lucide-react';

interface StudentPortalProps {
  testConfig?: TestConfig;
  assignmentTitle?: string;
}

export const StudentPortal: React.FC<StudentPortalProps> = ({ testConfig, assignmentTitle }) => {
  const assignmentId = new URLSearchParams(window.location.search).get('assignmentId') || 'assign_default';
  const classes: ClassRoom[] = getStoredClasses();

  // Chế độ đăng nhập: 'select' (Chọn tên trong lớp) hoặc 'input' (Gõ tài khoản)
  const [loginMode, setLoginMode] = useState<'select' | 'input'>('select');
  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || '');
  const [selectedStudentName, setSelectedStudentName] = useState<string>('');

  const [usernameInput, setUsernameInput] = useState<string>('');
  const [passwordInput, setPasswordInput] = useState<string>('123');
  const [loginError, setLoginError] = useState<string | null>(null);

  // Trạng thái phiên đăng nhập của học sinh
  const [currentUser, setCurrentUser] = useState<StudentAccount | null>(() => {
    try {
      const saved = localStorage.getItem('current_student_session');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Trạng thái làm bài
  const [isExamStarted, setIsExamStarted] = useState<boolean>(false);
  const [studentTest, setStudentTest] = useState<GeneratedTest | null>(null);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>((testConfig?.durationMinutes || 45) * 60);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [submissionResult, setSubmissionResult] = useState<StudentSubmission | null>(null);

  // Câu trả lời của học sinh
  const [mcqAnswers, setMcqAnswers] = useState<Record<string, string>>({});
  const [tfAnswers, setTfAnswers] = useState<Record<string, Record<string, boolean>>>({});
  const [saAnswers, setSaAnswers] = useState<Record<string, string>>({});

  const currentSelectedClass = classes.find((c) => c.id === selectedClassId) || classes[0];

  // 1. XỬ LÝ ĐĂNG NHẬP THEO CHỌN TÊN TRONG LỚP (CÁCH 1)
  const handleQuickSelectLogin = () => {
    if (!selectedStudentName.trim()) {
      setLoginError('Vui lòng chọn hoặc nhập họ và tên của bạn!');
      return;
    }
    const userObj: StudentAccount = {
      id: `std_${Date.now()}`,
      name: selectedStudentName.trim(),
      className: currentSelectedClass?.name || '12A1',
    };
    setCurrentUser(userObj);
    localStorage.setItem('current_student_session', JSON.stringify(userObj));
    setLoginError(null);
  };

  // 2. XỬ LÝ ĐĂNG NHẬP THEO TÀI KHOẢN / MÃ HỌC SINH (CÁCH 2)
  const handleInputLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const query = usernameInput.trim().toLowerCase();
    if (!query) {
      setLoginError('Vui lòng nhập mã học sinh hoặc họ tên!');
      return;
    }

    // Tìm trong danh sách tất cả các lớp
    let foundStudent: any = null;
    let foundClassName = '12A1';

    for (const cls of classes) {
      const match = (cls.students || []).find(
        (s) => s.name.toLowerCase() === query || (s.code && s.code.toLowerCase() === query)
      );
      if (match) {
        foundStudent = match;
        foundClassName = cls.name;
        break;
      }
    }

    const userObj: StudentAccount = {
      id: foundStudent?.id || `std_${Date.now()}`,
      name: foundStudent?.name || usernameInput.trim(),
      className: foundClassName,
    };

    setCurrentUser(userObj);
    localStorage.setItem('current_student_session', JSON.stringify(userObj));
    setLoginError(null);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsExamStarted(false);
    setStudentTest(null);
    setIsSubmitted(false);
    localStorage.removeItem('current_student_session');
  };

  // Bắt đầu làm bài -> Tự động sinh đề riêng biệt cho học sinh
  const handleStartExam = () => {
    if (!currentUser) return;
    const defaultCfg = testConfig || {
      title: assignmentTitle || 'BÀI KIỂM TRA TOÁN THPT',
      grade: '12',
      durationMinutes: 45,
      selectedTopicIds: [],
    };

    const uniqueTest = generateUniqueTestForStudent(defaultCfg as any, currentUser);
    setStudentTest(uniqueTest);
    setTimeLeftSeconds((defaultCfg.durationMinutes || 45) * 60);
    setIsExamStarted(true);
    setIsSubmitted(false);
  };

  // Đồng hồ đếm ngược
  useEffect(() => {
    if (!isExamStarted || isSubmitted) return;
    const timer = setInterval(() => {
      setTimeLeftSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isExamStarted, isSubmitted]);

  // Chấm điểm và Nộp bài
  const handleSubmitExam = () => {
    if (!studentTest || !currentUser) return;
    let earnedScore = 0;
    const questions = studentTest.questions || [];

    questions.forEach((q) => {
      if (q.type === 'multiple_choice') {
        if (mcqAnswers[q.id] === (q as any).correctAnswer) {
          earnedScore += 0.25;
        }
      } else if (q.type === 'true_false') {
        const userSts = tfAnswers[q.id] || {};
        const sts = (q as any).statements || [];
        let correctCount = 0;
        sts.forEach((st: any) => {
          if (userSts[st.id] === st.isCorrect) correctCount++;
        });
        if (correctCount === 1) earnedScore += 0.1;
        else if (correctCount === 2) earnedScore += 0.25;
        else if (correctCount === 3) earnedScore += 0.5;
        else if (correctCount === 4) earnedScore += 1.0;
      } else if (q.type === 'short_answer') {
        const userAns = (saAnswers[q.id] || '').trim().toLowerCase();
        const correctAns = ((q as any).correctAnswer || '').trim().toLowerCase();
        if (userAns && correctAns && userAns === correctAns) {
          earnedScore += 0.5;
        }
      }
    });

    const finalScore = Math.min(10, Math.round(earnedScore * 10) / 10);

    const submission: StudentSubmission = {
      id: `sub_${Date.now()}`,
      studentId: currentUser.id,
      studentName: currentUser.name,
      assignmentId,
      score: finalScore,
      totalScore: 10,
      submittedAt: new Date().toLocaleTimeString(),
      answers: { mcqAnswers, tfAnswers, saAnswers },
    };

    saveStudentSubmission(submission);
    setSubmissionResult(submission);
    setIsSubmitted(true);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // MÀN HÌNH ĐĂNG NHẬP
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4 font-sans">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center font-black text-lg mx-auto shadow-lg">
              12
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white">CỔNG LÀM BÀI TOÁN THPT</h1>
            <p className="text-xs text-slate-400">Trường THPT Mai Thanh Thế • Năm học 2026 - 2027</p>
          </div>

          {/* Chọn phương thức đăng nhập */}
          <div className="flex bg-slate-800/80 p-1 rounded-xl text-xs font-bold">
            <button
              type="button"
              onClick={() => setLoginMode('select')}
              className={`flex-1 py-2 rounded-lg transition-all ${
                loginMode === 'select' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Chọn Lớp & Tên (Dễ nhất)
            </button>
            <button
              type="button"
              onClick={() => setLoginMode('input')}
              className={`flex-1 py-2 rounded-lg transition-all ${
                loginMode === 'input' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Nhập Mã / Họ Tên
            </button>
          </div>

          {loginError && (
            <div className="p-3 bg-rose-500/20 border border-rose-500/50 rounded-xl text-xs text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          {loginMode === 'select' ? (
            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1.5">1. Chọn lớp học của bạn:</label>
                <select
                  value={selectedClassId}
                  onChange={(e) => {
                    setSelectedClassId(e.target.value);
                    setSelectedStudentName('');
                  }}
                  className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-sm font-bold text-white outline-none focus:border-blue-500"
                >
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      Lớp {cls.name} ({cls.students?.length || 0} học sinh)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1.5">2. Chọn hoặc nhập tên của bạn:</label>
                {(currentSelectedClass?.students || []).length > 0 ? (
                  <select
                    value={selectedStudentName}
                    onChange={(e) => setSelectedStudentName(e.target.value)}
                    className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white outline-none focus:border-blue-500"
                  >
                    <option value="">-- Bấm để chọn tên học sinh --</option>
                    {(currentSelectedClass?.students || []).map((st, i) => (
                      <option key={st.id} value={st.name}>
                        {i + 1}. {st.name} ({st.code || 'HS'})
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={selectedStudentName}
                    onChange={(e) => setSelectedStudentName(e.target.value)}
                    placeholder="Nhập họ và tên của bạn..."
                    className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white outline-none focus:border-blue-500"
                  />
                )}
              </div>

              <button
                type="button"
                onClick={handleQuickSelectLogin}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-sm shadow-lg hover:shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <LogIn className="w-4 h-4" /> ĐĂNG NHẬP VÀO LÀM BÀI
              </button>
            </div>
          ) : (
            <form onSubmit={handleInputLogin} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1.5">Tên đăng nhập / Mã học sinh / Họ tên:</label>
                <input
                  type="text"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  placeholder="Nhập mã HS hoặc họ tên..."
                  className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1.5">Mật khẩu (Mặc định: 123):</label>
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="123"
                  className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white outline-none focus:border-blue-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-sm shadow-lg hover:shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogIn className="w-4 h-4" /> ĐĂNG NHẬP VÀO LÀM BÀI
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  // MÀN HÌNH CHUẨN BỊ / KẾT QUẢ / LÀM BÀI
  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 font-sans pb-16">
      {/* Header học sinh */}
      <header className="bg-slate-900 text-white p-4 shadow-md sticky top-0 z-30">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-xs">
              HS
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">{assignmentTitle || 'BÀI KIỂM TRA TOÁN THPT'}</h2>
              <p className="text-[11px] text-slate-400">
                Thí sinh: <strong className="text-blue-300">{currentUser.name}</strong> • Lớp: <strong>{currentUser.className || '12A1'}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {isExamStarted && !isSubmitted && (
              <div className="flex items-center gap-1.5 px-3.5 py-1.5 bg-rose-500/20 border border-rose-500/40 text-rose-300 rounded-xl text-xs font-mono font-bold animate-pulse">
                <Clock className="w-4 h-4" /> {formatTime(timeLeftSeconds)}
              </div>
            )}
            <button
              onClick={handleLogout}
              className="text-xs text-slate-400 hover:text-white px-2.5 py-1 bg-slate-800 rounded-lg"
            >
              Đăng xuất
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
        {/* TRẠNG THÁI 1: CHƯA BẮT ĐẦU */}
        {!isExamStarted && !isSubmitted && (
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm text-center space-y-5 max-w-xl mx-auto mt-6">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
              <Award className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900">{assignmentTitle || 'KIỂM TRA ĐỊNH KỲ TOÁN THPT'}</h3>
              <p className="text-xs text-slate-500 mt-1">Hệ thống sẽ sinh đề thi riêng biệt ngẫu nhiên theo ma trận của giáo viên</p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border text-xs text-slate-600 space-y-2 text-left">
              <p>⏱️ Thời gian làm bài: <strong>{testConfig?.durationMinutes || 45} phút</strong></p>
              <p>📝 Cấu trúc: <strong>Trắc nghiệm 4 lựa chọn, Đúng/Sai & Trả lời ngắn</strong></p>
              <p>🎯 Thí sinh làm bài trực tiếp và bấm "Nộp bài" khi hoàn thành.</p>
            </div>

            <button
              type="button"
              onClick={handleStartExam}
              className="px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl shadow-lg hover:shadow-emerald-500/25 transition-all text-sm flex items-center gap-2 mx-auto cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" /> BẮT ĐẦU LÀM BÀI
            </button>
          </div>
        )}

        {/* TRẠNG THÁI 2: ĐÃ NỘP BÀI & XEM ĐIỂM */}
        {isSubmitted && submissionResult && (
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm text-center space-y-4 max-w-md mx-auto mt-6">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <Trophy className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black text-slate-900">BẠN ĐÃ NỘP BÀI THÀNH CÔNG!</h3>
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200">
              <span className="text-xs text-emerald-800 font-bold block mb-1">KẾT QUẢ ĐẠT ĐƯỢC:</span>
              <span className="text-4xl font-black text-emerald-700">{submissionResult.score} / 10</span>
              <span className="text-xs text-slate-500 block mt-1">Điểm số đã được tự động lưu vào hệ thống của Giáo viên</span>
            </div>
          </div>
        )}

        {/* TRẠNG THÁI 3: ĐANG LÀM BÀI THI */}
        {isExamStarted && !isSubmitted && studentTest && (
          <div className="space-y-6">
            {(studentTest.questions || []).map((q, idx) => (
              <div key={q.id} className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <span className="px-3 py-1 bg-blue-100 text-blue-900 rounded-lg text-xs font-black shrink-0">
                    Câu {idx + 1}
                  </span>
                  <div className="flex-1 text-sm font-semibold text-slate-900 leading-relaxed">
                    <MathText text={q.content} />
                  </div>
                </div>

                {/* Sơ đồ / Hình vẽ nếu có */}
                {q.diagramId && (
                  <div className="my-3 p-3 bg-slate-50 rounded-xl border flex justify-center">
                    <DiagramRenderer diagramId={q.diagramId} formula={(q as any).formula} questionContent={q.content} />
                  </div>
                )}

                {/* Phần I: Trắc nghiệm 4 lựa chọn */}
                {q.type === 'multiple_choice' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                    {((q as any).options || []).map((opt: any) => {
                      const isSelected = mcqAnswers[q.id] === opt.key;
                      return (
                        <div
                          key={opt.key}
                          onClick={() => setMcqAnswers((prev) => ({ ...prev, [q.id]: opt.key }))}
                          className={`p-3 rounded-xl border text-xs cursor-pointer flex items-center gap-2.5 transition-all ${
                            isSelected
                              ? 'bg-blue-600 text-white font-bold border-blue-600 shadow'
                              : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-black ${
                            isSelected ? 'bg-white text-blue-600' : 'bg-white border text-slate-700'
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
                {q.type === 'true_false' && (
                  <div className="space-y-2 pt-2">
                    {((q as any).statements || []).map((st: any) => {
                      const userChoice = tfAnswers[q.id]?.[st.id];
                      return (
                        <div key={st.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs gap-3">
                          <div className="flex items-center gap-2">
                            <span className="font-bold uppercase text-indigo-700">Ý {st.id})</span>
                            <MathText text={st.text} />
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => setTfAnswers((prev) => ({
                                ...prev,
                                [q.id]: { ...(prev[q.id] || {}), [st.id]: true }
                              }))}
                              className={`px-3 py-1 rounded-lg font-bold ${
                                userChoice === true ? 'bg-emerald-600 text-white' : 'bg-white border text-slate-600'
                              }`}
                            >
                              Đúng
                            </button>
                            <button
                              type="button"
                              onClick={() => setTfAnswers((prev) => ({
                                ...prev,
                                [q.id]: { ...(prev[q.id] || {}), [st.id]: false }
                              }))}
                              className={`px-3 py-1 rounded-lg font-bold ${
                                userChoice === false ? 'bg-rose-600 text-white' : 'bg-white border text-slate-600'
                              }`}
                            >
                              Sai
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Phần III: Trả lời ngắn */}
                {q.type === 'short_answer' && (
                  <div className="pt-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">Điền đáp số / kết quả:</label>
                    <input
                      type="text"
                      value={saAnswers[q.id] || ''}
                      onChange={(e) => setSaAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
                      placeholder="Nhập kết quả số (VD: 5, -2, 1/2...)"
                      className="w-full sm:w-64 p-2.5 border border-slate-300 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}
              </div>
            ))}

            {/* Nút nộp bài */}
            <div className="text-center pt-4">
              <button
                type="button"
                onClick={handleSubmitExam}
                className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl text-sm shadow-xl hover:shadow-blue-500/25 transition-all flex items-center gap-2 mx-auto cursor-pointer"
              >
                <Send className="w-4 h-4" /> NỘP BÀI THI & XEM ĐIỂM
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default StudentPortal;
