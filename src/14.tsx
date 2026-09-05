import React, { useState, useEffect } from 'react';
import { TestConfig, GeneratedTest, StudentAccount, StudentSubmission } from './types';
import { generateUniqueTestForStudent } from './testGenerator';
import { MathText } from './MathText';
import { DiagramRenderer } from './DiagramRenderer';
import { getStoredClasses, saveStudentSubmission, ClassRoom } from './classStorage';
import {
  Play, Clock, Award, LogIn, Send, AlertCircle, Trophy,
  Sparkles, User, Lock, Eye, EyeOff
} from 'lucide-react';

interface StudentPortalProps {
  testConfig?: TestConfig;
  assignmentTitle?: string;
}

export const StudentPortal: React.FC<StudentPortalProps> = ({ testConfig, assignmentTitle }) => {
  const assignmentId = new URLSearchParams(window.location.search).get('assignmentId') || 'assign_default';
  const classes: ClassRoom[] = getStoredClasses();

  // ĐĂNG NHẬP DUY NHẤT: TÊN ĐĂNG NHẬP & MẬT KHẨU
  const [usernameInput, setUsernameInput] = useState<string>('');
  const [passwordInput, setPasswordInput] = useState<string>('123');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const [currentUser, setCurrentUser] = useState<StudentAccount | null>(() => {
    try {
      const saved = localStorage.getItem('current_student_session');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isAiGenerating, setIsAiGenerating] = useState<boolean>(false);
  const [isExamStarted, setIsExamStarted] = useState<boolean>(false);
  const [studentTest, setStudentTest] = useState<GeneratedTest | null>(null);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>((testConfig?.durationMinutes || 45) * 60);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [submissionResult, setSubmissionResult] = useState<any | null>(null);

  const [mcqAnswers, setMcqAnswers] = useState<Record<string, string>>({});
  const [tfAnswers, setTfAnswers] = useState<Record<string, Record<string, boolean>>>({});
  const [saAnswers, setSaAnswers] = useState<Record<string, string>>({});

  // XỬ LÝ ĐĂNG NHẬP BẰNG TÊN ĐĂNG NHẬP VÀ MẬT KHẨU
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const query = usernameInput.trim().toLowerCase();
    const pass = passwordInput.trim();

    if (!query) {
      setLoginError('Vui lòng nhập tên đăng nhập của bạn!');
      return;
    }

    if (!pass) {
      setLoginError('Vui lòng nhập mật khẩu đăng nhập!');
      return;
    }

    let foundStudent: any = null;
    let foundClassName = '12A6';

    for (const cls of classes) {
      const match = (cls.students || []).find(
        (s) =>
          (s.username && s.username.toLowerCase() === query) ||
          (s.code && s.code.toLowerCase() === query) ||
          (s.name && s.name.toLowerCase() === query)
      );
      if (match) {
        foundStudent = match;
        foundClassName = cls.name;
        break;
      }
    }

    if (!foundStudent) {
      foundStudent = {
        id: `std_${Date.now()}`,
        name: usernameInput.trim(),
      };
    }

    // Kiểm tra mật khẩu (mặc định là 12345)
    if (pass !== '12345' && foundStudent.password && pass !== foundStudent.password) {
      setLoginError('Mật khẩu không chính xác! (Mật khẩu mặc định là 123)');
      return;
    }

    const userObj: StudentAccount = {
      id: foundStudent.id || `std_${Date.now()}`,
      name: foundStudent.name || usernameInput.trim(),
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

  // KHỞI TẠO ĐỀ THI
  const handleStartExam = async () => {
    if (!currentUser) return;
    setIsAiGenerating(true);

    const defaultCfg = testConfig || {
      title: assignmentTitle || 'BÀI KIỂM TRA TOÁN THPT - GDPT 2018',
      grade: '11',
      durationMinutes: 90,
      selectedTopicIds: [],
      selectedOutcomes: [],
    };

    let generatedExam: GeneratedTest | null = null;

    try {
      const res = await fetch('/api/generate-exam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config: defaultCfg, student: currentUser }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data && data.questions && data.questions.length >= 10) {
          generatedExam = {
            id: `test_ai_${Date.now()}`,
            title: data.title || defaultCfg.title,
            config: defaultCfg,
            questions: data.questions,
            createdAt: new Date().toISOString(),
          } as any;
        }
      }
    } catch (err) {
      console.warn('Fallback:', err);
    }

    if (!generatedExam) {
      generatedExam = generateUniqueTestForStudent(defaultCfg as any, currentUser);
    }

    setStudentTest(generatedExam);
    setTimeLeftSeconds((defaultCfg.durationMinutes || 45) * 60);
    setIsAiGenerating(false);
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

  // Chấm điểm chuẩn GDPT 2018
  const handleSubmitExam = () => {
    if (!studentTest || !currentUser) return;

    let part1Score = 0;
    let part2Score = 0;
    let part3Score = 0;
    const questions = studentTest.questions || [];

    questions.forEach((q) => {
      if (q.type === 'multiple_choice') {
        if (mcqAnswers[q.id] === (q as any).correctAnswer) {
          part1Score += 0.25;
        }
      } else if (q.type === 'true_false') {
        const userSts = tfAnswers[q.id] || {};
        const sts = (q as any).statements || [];
        let correctCount = 0;
        sts.forEach((st: any) => {
          if (userSts[st.id] === st.isCorrect) correctCount++;
        });
        if (correctCount === 1) part2Score += 0.1;
        else if (correctCount === 2) part2Score += 0.25;
        else if (correctCount === 3) part2Score += 0.5;
        else if (correctCount === 4) part2Score += 1.0;
      } else if (q.type === 'short_answer') {
        const userAns = (saAnswers[q.id] || '').trim().toLowerCase();
        const correctAns = ((q as any).correctAnswer || '').trim().toLowerCase();
        if (userAns && correctAns && (userAns === correctAns || userAns.replace(',', '.') === correctAns.replace(',', '.'))) {
          part3Score += 0.5;
        }
      }
    });

    part1Score = Math.round(part1Score * 100) / 100;
    part2Score = Math.round(part2Score * 100) / 100;
    part3Score = Math.round(part3Score * 100) / 100;
    const totalFinal = Math.min(10, Math.round((part1Score + part2Score + part3Score) * 10) / 10);

    const submissionData = {
      id: `sub_${Date.now()}`,
      studentId: currentUser.id,
      studentName: currentUser.name,
      assignmentId,
      score: totalFinal,
      part1Score,
      part2Score,
      part3Score,
      submittedAt: new Date().toLocaleTimeString(),
    };

    saveStudentSubmission(submissionData as any);
    setSubmissionResult(submissionData);
    setIsSubmitted(true);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const part1Questions = (studentTest?.questions || []).filter((q) => q.type === 'multiple_choice');
  const part2Questions = (studentTest?.questions || []).filter((q) => q.type === 'true_false');
  const part3Questions = (studentTest?.questions || []).filter((q) => q.type === 'short_answer');

  // ==============================================================
  // MÀN HÌNH ĐĂNG NHẬP DUY NHẤT (CHUẨN 100% THEO YÊU CẦU CỦA THẦY)
  // ==============================================================
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4 font-sans">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center font-black text-lg mx-auto shadow-lg">
              THPT
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white">ĐĂNG NHẬP LÀM BÀI THI</h1>
            <p className="text-xs text-slate-400">Chương trình GDPT 2018 • Trường THPT Mai Thanh Thế</p>
          </div>

          {loginError && (
            <div className="p-3 bg-rose-500/20 border border-rose-500/50 rounded-xl text-xs text-rose-300 flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          {/* FORM ĐĂNG NHẬP DUY NHẤT: TÊN ĐĂNG NHẬP & MẬT KHẨU */}
          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-bold mb-1.5 flex items-center gap-1.5">
                <User className="w-4 h-4 text-blue-400" /> Tên đăng nhập:
              </label>
              <input
                type="text"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                placeholder="Nhập tên đăng nhập"
                className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white outline-none focus:border-blue-500"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1.5 flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-amber-400" /> Mật khẩu đăng nhập:
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Nhập mật khẩu (Mặc định: 12345)..."
                  className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white outline-none focus:border-blue-500 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <span className="text-[10px] text-slate-500 block mt-1">Mật khẩu mặc định khởi tạo là: <strong>123</strong></span>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl text-sm shadow-lg hover:shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <LogIn className="w-4 h-4" /> ĐĂNG NHẬP VÀO LÀM BÀI
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ==============================================================
  // MÀN HÌNH LÀM BÀI / XEM KẾT QUẢ CỦA HỌC SINH
  // ==============================================================
  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 font-sans pb-20">
      <header className="bg-slate-900 text-white p-4 shadow-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center font-black text-xs shadow">
              THPT
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black text-white leading-snug">
                {studentTest?.title || assignmentTitle || 'BÀI KIỂM TRA TOÁN THPT - GDPT 2018'}
              </h2>
              <p className="text-[11px] text-slate-400">
                Thí sinh: <strong className="text-blue-300">{currentUser.name}</strong> • Lớp: <strong>{currentUser.className}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {isExamStarted && !isSubmitted && (
              <div className="flex items-center gap-2 px-4 py-2 bg-rose-500/20 border border-rose-500/40 text-rose-300 rounded-2xl text-sm font-mono font-black animate-pulse">
                <Clock className="w-4 h-4 text-rose-400" />
                <span>{formatTime(timeLeftSeconds)}</span>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="text-xs text-slate-400 hover:text-white px-3 py-1.5 bg-slate-800 rounded-xl cursor-pointer"
            >
              Đăng xuất
            </button>
          </div>
        </div>
      </header>

      {/* MÀN HÌNH CHỜ AI */}
      {isAiGenerating && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl text-center space-y-4 max-w-sm w-full shadow-2xl text-white">
            <div className="w-16 h-16 bg-blue-600/20 text-blue-400 rounded-2xl flex items-center justify-center mx-auto border border-blue-500/30">
              <Sparkles className="w-8 h-8 animate-spin text-amber-300" />
            </div>
            <h3 className="text-base font-black text-white">AI ĐANG TẠO ĐỀ THI RIÊNG</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Mô hình AI đang tự động biên soạn đề thi theo đúng ma trận của Thầy/Cô dành riêng cho bạn...
            </p>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-blue-500 h-full w-2/3 animate-pulse rounded-full"></div>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
        {/* CHƯA BẮT ĐẦU */}
        {!isExamStarted && !isSubmitted && !isAiGenerating && (
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm text-center space-y-5 max-w-xl mx-auto mt-6">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
              <Award className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900">{assignmentTitle || 'BÀI KIỂM TRA ĐỊNH DẠNG GDPT 2018'}</h3>
              <p className="text-xs text-slate-500 mt-1">Hệ thống AI sẽ tự động sinh mã đề ngẫu nhiên đúng theo ma trận của giáo viên</p>
            </div>

            <div className="bg-slate-50 p-5 rounded-2xl border text-xs text-slate-700 space-y-2 text-left">
              <div className="font-bold text-slate-900 border-b pb-1.5 uppercase text-[11px]">
                Cấu trúc đề kiểm tra:
              </div>
              <p>• <strong>PHẦN I:</strong> 12 câu trắc nghiệm 4 lựa chọn (3,0 điểm)</p>
              <p>• <strong>PHẦN II:</strong> 4 câu trắc nghiệm Đúng / Sai (4,0 điểm)</p>
              <p>• <strong>PHẦN III:</strong> 6 câu trắc nghiệm trả lời ngắn (3,0 điểm)</p>
              <p>• <strong>Thời gian:</strong> {testConfig?.durationMinutes || 45} phút • Thang điểm 10,0</p>
            </div>

            <button
              type="button"
              onClick={handleStartExam}
              className="px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl shadow-lg hover:shadow-emerald-500/25 transition-all text-sm flex items-center gap-2 mx-auto cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" /> BẮT ĐẦU LÀM BÀI THI
            </button>
          </div>
        )}

        {/* ĐÃ NỘP BÀI */}
        {isSubmitted && submissionResult && (
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm text-center space-y-6 max-w-lg mx-auto mt-6">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <Trophy className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900">BẠN ĐÃ NỘP BÀI THÀNH CÔNG!</h3>
              <p className="text-xs text-slate-500 mt-1">Điểm số đã được lưu tự động vào sổ theo dõi của Thầy</p>
            </div>

            <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-200 text-left space-y-3">
              <div className="flex justify-between items-center border-b border-emerald-200 pb-2">
                <span className="font-bold text-xs text-emerald-950">TỔNG ĐIỂM:</span>
                <span className="text-3xl font-black text-emerald-700">{submissionResult.score} / 10.0</span>
              </div>
              <div className="space-y-1.5 text-xs text-slate-700">
                <div className="flex justify-between">
                  <span>• Điểm Phần I:</span>
                  <strong className="text-blue-700">{submissionResult.part1Score} / 3.0đ</strong>
                </div>
                <div className="flex justify-between">
                  <span>• Điểm Phần II:</span>
                  <strong className="text-indigo-700">{submissionResult.part2Score} / 4.0đ</strong>
                </div>
                <div className="flex justify-between">
                  <span>• Điểm Phần III:</span>
                  <strong className="text-purple-700">{submissionResult.part3Score} / 3.0đ</strong>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ĐANG LÀM BÀI */}
        {isExamStarted && !isSubmitted && studentTest && (
          <div className="space-y-8">
            {/* PHẦN I */}
            <div className="space-y-4">
              <div className="bg-blue-900 text-white p-4 sm:p-5 rounded-2xl shadow-md space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-sm sm:text-base tracking-wide uppercase">
                    PHẦN I. CÂU TRẮC NGHIỆM NHIỀU PHƯƠNG ÁN LỰA CHỌN
                  </h3>
                  <span className="px-3 py-0.5 bg-blue-700 rounded-full text-xs font-bold">3,0 ĐIỂM</span>
                </div>
                <p className="text-xs text-blue-100 italic">
                  Thí sinh trả lời từ câu 1 đến câu 12. Mỗi câu chỉ chọn một phương án. Mỗi câu đúng được 0,25 điểm.
                </p>
              </div>

              {part1Questions.map((q, idx) => (
                <div key={q.id} className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="px-3 py-1 bg-blue-100 text-blue-900 rounded-lg text-xs font-black shrink-0">
                      Câu {idx + 1}
                    </span>
                    <div className="flex-1 text-sm font-semibold text-slate-900 leading-relaxed">
                      <MathText text={q.content} />
                    </div>
                  </div>

                  {q.diagramId && (
                    <div className="my-2 p-3 bg-slate-50 rounded-xl border flex justify-center">
                      <DiagramRenderer diagramId={q.diagramId} formula={(q as any).formula} questionContent={q.content} />
                    </div>
                  )}

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
                </div>
              ))}
            </div>

            {/* PHẦN II */}
            <div className="space-y-4 pt-4">
              <div className="bg-indigo-900 text-white p-4 sm:p-5 rounded-2xl shadow-md space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-sm sm:text-base tracking-wide uppercase">
                    PHẦN II. CÂU TRẮC NGHIỆM ĐÚNG SAI
                  </h3>
                  <span className="px-3 py-0.5 bg-indigo-700 rounded-full text-xs font-bold">4,0 ĐIỂM</span>
                </div>
                <p className="text-xs text-indigo-100 italic">
                  Thí sinh trả lời từ câu 1 đến câu 4. Trong mỗi ý a), b), c), d) ở mỗi câu, thí sinh chọn Đúng hoặc Sai.
                </p>
              </div>

              {part2Questions.map((q, idx) => (
                <div key={q.id} className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="px-3 py-1 bg-indigo-100 text-indigo-900 rounded-lg text-xs font-black shrink-0">
                      Câu {idx + 1}
                    </span>
                    <div className="flex-1 text-sm font-semibold text-slate-900 leading-relaxed">
                      <MathText text={q.content} />
                    </div>
                  </div>

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
                              onClick={() => setTfAnswers((prev) => ({ ...prev, [q.id]: { ...(prev[q.id] || {}), [st.id]: true } }))}
                              className={`px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                                userChoice === true ? 'bg-emerald-600 text-white shadow' : 'bg-white border text-slate-600 hover:bg-slate-100'
                              }`}
                            >
                              Đúng
                            </button>
                            <button
                              type="button"
                              onClick={() => setTfAnswers((prev) => ({ ...prev, [q.id]: { ...(prev[q.id] || {}), [st.id]: false } }))}
                              className={`px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                                userChoice === false ? 'bg-rose-600 text-white shadow' : 'bg-white border text-slate-600 hover:bg-slate-100'
                              }`}
                            >
                              Sai
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* PHẦN III */}
            <div className="space-y-4 pt-4">
              <div className="bg-purple-900 text-white p-4 sm:p-5 rounded-2xl shadow-md space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-sm sm:text-base tracking-wide uppercase">
                    PHẦN III. CÂU TRẮC NGHIỆM TRẢ LỜI NGẮN
                  </h3>
                  <span className="px-3 py-0.5 bg-purple-700 rounded-full text-xs font-bold">3,0 ĐIỂM</span>
                </div>
                <p className="text-xs text-purple-100 italic">
                  Thí sinh trả lời từ câu 1 đến câu 6. Điền kết quả số vào ô trống. Mỗi câu trả lời đúng được 0,5 điểm.
                </p>
              </div>

              {part3Questions.map((q, idx) => (
                <div key={q.id} className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="px-3 py-1 bg-purple-100 text-purple-900 rounded-lg text-xs font-black shrink-0">
                      Câu {idx + 1}
                    </span>
                    <div className="flex-1 text-sm font-semibold text-slate-900 leading-relaxed">
                      <MathText text={q.content} />
                    </div>
                  </div>

                  <div className="pt-2 flex flex-wrap items-center gap-3">
                    <label className="font-bold text-xs text-slate-700">Đáp số của bạn:</label>
                    <input
                      type="text"
                      value={saAnswers[q.id] || ''}
                      onChange={(e) => setSaAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
                      placeholder="Nhập kết quả số (VD: 5, -2, 1/2...)"
                      className="w-64 p-2.5 border border-slate-300 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* NỘP BÀI */}
            <div className="text-center pt-6">
              <button
                type="button"
                onClick={handleSubmitExam}
                className="px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl text-base shadow-2xl transition-all flex items-center gap-2 mx-auto cursor-pointer"
              >
                <Send className="w-5 h-5" /> NỘP BÀI THI & XEM ĐIỂM
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default StudentPortal;
