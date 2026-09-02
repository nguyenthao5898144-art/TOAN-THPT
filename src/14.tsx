import React, { useState, useEffect } from 'react';
import { TestConfig, GeneratedTest, StudentAccount, StudentSubmission, Question } from './types';
import { generateUniqueTestForStudent } from './testGenerator';
import { MathText } from './MathText';
import { DiagramRenderer } from './DiagramRenderer';
import { getStoredClasses, saveStudentSubmission, ClassRoom } from './classStorage';
import {
  Play, Clock, Award, LogIn, Send, AlertCircle, Trophy, BookOpen,
  Sparkles, CheckCircle2, User, KeyRound, Check, HelpCircle, CheckSquare
} from 'lucide-react';

interface StudentPortalProps {
  testConfig?: TestConfig;
  assignmentTitle?: string;
}

export const StudentPortal: React.FC<StudentPortalProps> = ({ testConfig, assignmentTitle }) => {
  const assignmentId = new URLSearchParams(window.location.search).get('assignmentId') || 'assign_default';
  const classes: ClassRoom[] = getStoredClasses();

  const [loginMode, setLoginMode] = useState<'select' | 'input'>('select');
  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || '');
  const [selectedStudentName, setSelectedStudentName] = useState<string>('');
  const [usernameInput, setUsernameInput] = useState<string>('');
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

  // Câu trả lời của học sinh
  const [mcqAnswers, setMcqAnswers] = useState<Record<string, string>>({});
  const [tfAnswers, setTfAnswers] = useState<Record<string, Record<string, boolean>>>({});
  const [saAnswers, setSaAnswers] = useState<Record<string, string>>({});

  const currentSelectedClass = classes.find((c) => c.id === selectedClassId) || classes[0];

  const handleQuickSelectLogin = () => {
    if (!selectedStudentName.trim()) {
      setLoginError('Vui lòng chọn hoặc nhập họ và tên của bạn!');
      return;
    }
    const userObj: StudentAccount = {
      id: `std_${Date.now()}`,
      name: selectedStudentName.trim(),
      className: currentSelectedClass?.name || '12A6',
    };
    setCurrentUser(userObj);
    localStorage.setItem('current_student_session', JSON.stringify(userObj));
    setLoginError(null);
  };

  const handleInputLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const query = usernameInput.trim().toLowerCase();
    if (!query) {
      setLoginError('Vui lòng nhập mã học sinh hoặc họ tên!');
      return;
    }
    let foundStudent: any = null;
    let foundClassName = '12A6';
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

  // KHỞI TẠO ĐỀ THI BẰNG AI THEO ĐÚNG MA TRẬN GDPT 2018
  const handleStartExam = async () => {
    if (!currentUser) return;
    setIsAiGenerating(true);

    const defaultCfg = testConfig || {
      title: assignmentTitle || 'BÀI KIỂM TRA TOÁN THPT - GDPT 2018',
      grade: '12',
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
      console.warn('Fallback sang ngân hàng câu hỏi:', err);
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

  // Đếm ngược thời gian
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

  // CHẤM ĐIỂM CHUẨN THUẬT TOÁN BỘ GD&ĐT (TỪNG PHẦN I, II, III)
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

  // Tách 3 phần theo chuẩn GDPT 2018
  const part1Questions = (studentTest?.questions || []).filter((q) => q.type === 'multiple_choice');
  const part2Questions = (studentTest?.questions || []).filter((q) => q.type === 'true_false');
  const part3Questions = (studentTest?.questions || []).filter((q) => q.type === 'short_answer');

  // MÀN HÌNH ĐĂNG NHẬP
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4 font-sans">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center font-black text-lg mx-auto shadow-lg">
              THPT
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white">CỔNG LÀM BÀI TRỰC TUYẾN</h1>
            <p className="text-xs text-slate-400">Chương trình GDPT 2018 • Trường THPT Mai Thanh Thế</p>
          </div>

          <div className="flex bg-slate-800/80 p-1 rounded-xl text-xs font-bold">
            <button
              type="button"
              onClick={() => setLoginMode('select')}
              className={`flex-1 py-2 rounded-lg transition-all ${
                loginMode === 'select' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Chọn Lớp & Tên
            </button>
            <button
              type="button"
              onClick={() => setLoginMode('input')}
              className={`flex-1 py-2 rounded-lg transition-all ${
                loginMode === 'input' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Nhập Mã Học Sinh
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
                <label className="block text-slate-300 font-bold mb-1.5">2. Chọn họ và tên:</label>
                {(currentSelectedClass?.students || []).length > 0 ? (
                  <select
                    value={selectedStudentName}
                    onChange={(e) => setSelectedStudentName(e.target.value)}
                    className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white outline-none focus:border-blue-500"
                  >
                    <option value="">-- Bấm để chọn tên của bạn --</option>
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
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl text-sm shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <LogIn className="w-4 h-4" /> VÀO PHÒNG KIỂM TRA
              </button>
            </div>
          ) : (
            <form onSubmit={handleInputLogin} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1.5">Mã học sinh / Số báo danh:</label>
                <input
                  type="text"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  placeholder="VD: 67339301 hoặc SBD01..."
                  className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white outline-none focus:border-blue-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl text-sm shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogIn className="w-4 h-4" /> VÀO PHÒNG KIỂM TRA
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 font-sans pb-20">
      {/* HEADER BÀI THI */}
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
              className="text-xs text-slate-400 hover:text-white px-3 py-1.5 bg-slate-800 rounded-xl"
            >
              Thoát
            </button>
          </div>
        </div>
      </header>

      {/* MÀN HÌNH CHỜ AI SINH ĐỀ */}
      {isAiGenerating && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl text-center space-y-4 max-w-sm w-full shadow-2xl text-white">
            <div className="w-16 h-16 bg-blue-600/20 text-blue-400 rounded-2xl flex items-center justify-center mx-auto border border-blue-500/30">
              <Sparkles className="w-8 h-8 animate-spin text-amber-300" />
            </div>
            <h3 className="text-base font-black text-white">AI ĐANG KHỞI TẠO ĐỀ THI RIÊNG</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Gemini AI đang biên soạn trọn bộ 22 câu hỏi theo đúng ma trận GDPT 2018 của Thầy/Cô dành riêng cho bạn...
            </p>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-blue-500 h-full w-2/3 animate-pulse rounded-full"></div>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
        {/* TRẠNG THÁI 1: CHƯA BẮT ĐẦU */}
        {!isExamStarted && !isSubmitted && !isAiGenerating && (
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm text-center space-y-5 max-w-xl mx-auto mt-6">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
              <Award className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900">BÀI KIỂM TRA ĐỊNH DẠNG GDPT 2018</h3>
              <p className="text-xs text-slate-500 mt-1">Mỗi học sinh sẽ có một mã đề độc lập do AI Gemini tự động tạo theo ma trận</p>
            </div>

            <div className="bg-slate-50 p-5 rounded-2xl border text-xs text-slate-700 space-y-2 text-left">
              <div className="font-bold text-slate-900 border-b pb-1.5 uppercase text-[11px]">
                Quy định cấu trúc đề thi chính thức:
              </div>
              <p>• <strong>PHẦN I:</strong> 12 câu trắc nghiệm 4 lựa chọn (3,0 điểm - 0,25đ/câu)</p>
              <p>• <strong>PHẦN II:</strong> 4 câu Đúng / Sai gồm 16 ý độc lập (4,0 điểm - tối đa 1,0đ/câu)</p>
              <p>• <strong>PHẦN III:</strong> 6 câu trả lời ngắn điền kết quả (3,0 điểm - 0,5đ/câu)</p>
              <p>• <strong>Tổng thời gian:</strong> {testConfig?.durationMinutes || 45} phút • Thang điểm 10,0</p>
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

        {/* TRẠNG THÁI 2: ĐÃ NỘP BÀI & XEM KẾT QUẢ THEO TỪNG PHẦN */}
        {isSubmitted && submissionResult && (
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm text-center space-y-6 max-w-lg mx-auto mt-6">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <Trophy className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900">BẠN ĐÃ NỘP BÀI THÀNH CÔNG!</h3>
              <p className="text-xs text-slate-500 mt-1">Kết quả kiểm tra đã được lưu tự động vào sổ theo dõi của Thầy</p>
            </div>

            {/* BẢNG BÓC TÁCH ĐIỂM THEO ĐÚNG 3 PHẦN CỦA BỘ GD&ĐT */}
            <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-200 text-left space-y-3">
              <div className="flex justify-between items-center border-b border-emerald-200 pb-2">
                <span className="font-bold text-xs text-emerald-950">TỔNG ĐIỂM ĐẠT ĐƯỢC:</span>
                <span className="text-3xl font-black text-emerald-700">{submissionResult.score} / 10.0</span>
              </div>
              <div className="space-y-1.5 text-xs text-slate-700">
                <div className="flex justify-between">
                  <span>• Điểm Phần I (Trắc nghiệm 4 lựa chọn):</span>
                  <strong className="text-blue-700">{submissionResult.part1Score} / 3.0 điểm</strong>
                </div>
                <div className="flex justify-between">
                  <span>• Điểm Phần II (Trắc nghiệm Đúng / Sai):</span>
                  <strong className="text-indigo-700">{submissionResult.part2Score} / 4.0 điểm</strong>
                </div>
                <div className="flex justify-between">
                  <span>• Điểm Phần III (Trả lời ngắn):</span>
                  <strong className="text-purple-700">{submissionResult.part3Score} / 3.0 điểm</strong>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TRẠNG THÁI 3: ĐANG LÀM BÀI THI CHUẨN CẤU TRÚC 3 PHẦN GDPT 2018 */}
        {isExamStarted && !isSubmitted && studentTest && (
          <div className="space-y-8">
            {/* ======================================================= */}
            {/* PHẦN I: TRẮC NGHIỆM 4 LỰA CHỌN (CÂU 1 ĐẾN CÂU 12) */}
            {/* ======================================================= */}
            <div className="space-y-4">
              <div className="bg-blue-900 text-white p-4 sm:p-5 rounded-2xl shadow-md space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-sm sm:text-base tracking-wide uppercase">
                    PHẦN I. CÂU TRẮC NGHIỆM NHIỀU PHƯƠNG ÁN LỰA CHỌN
                  </h3>
                  <span className="px-3 py-0.5 bg-blue-700 rounded-full text-xs font-bold">
                    3,0 ĐIỂM
                  </span>
                </div>
                <p className="text-xs text-blue-100 italic">
                  Thí sinh trả lời từ câu 1 đến câu 12. Mỗi câu hỏi thí sinh chỉ chọn một phương án. Mỗi câu đúng được 0,25 điểm.
                </p>
              </div>

              {part1Questions.map((q, idx) => (
                <div key={q.id} id={`q_${idx + 1}`} className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
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

            {/* ======================================================= */}
            {/* PHẦN II: TRẮC NGHIỆM ĐÚNG / SAI (CÂU 1 ĐẾN CÂU 4) */}
            {/* ======================================================= */}
            <div className="space-y-4 pt-4">
              <div className="bg-indigo-900 text-white p-4 sm:p-5 rounded-2xl shadow-md space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-sm sm:text-base tracking-wide uppercase">
                    PHẦN II. CÂU TRẮC NGHIỆM ĐÚNG SAI
                  </h3>
                  <span className="px-3 py-0.5 bg-indigo-700 rounded-full text-xs font-bold">
                    4,0 ĐIỂM
                  </span>
                </div>
                <p className="text-xs text-indigo-100 italic">
                  Thí sinh trả lời từ câu 1 đến câu 4. Trong mỗi ý a), b), c), d) ở mỗi câu, thí sinh chọn Đúng hoặc Sai. (Đúng 1 ý được 0,1đ; 2 ý được 0,25đ; 3 ý được 0,5đ; 4 ý được 1,0đ).
                </p>
              </div>

              {part2Questions.map((q, idx) => (
                <div key={q.id} id={`q_${idx + 13}`} className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="px-3 py-1 bg-indigo-100 text-indigo-900 rounded-lg text-xs font-black shrink-0">
                      Câu {idx + 13} (Câu {idx + 1} Phần II)
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
                              className={`px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                                userChoice === true ? 'bg-emerald-600 text-white shadow' : 'bg-white border text-slate-600 hover:bg-slate-100'
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

            {/* ======================================================= */}
            {/* PHẦN III: TRẮC NGHIỆM TRẢ LỜI NGẮN (CÂU 1 ĐẾN CÂU 6) */}
            {/* ======================================================= */}
            <div className="space-y-4 pt-4">
              <div className="bg-purple-900 text-white p-4 sm:p-5 rounded-2xl shadow-md space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-sm sm:text-base tracking-wide uppercase">
                    PHẦN III. CÂU TRẮC NGHIỆM TRẢ LỜI NGẮN
                  </h3>
                  <span className="px-3 py-0.5 bg-purple-700 rounded-full text-xs font-bold">
                    3,0 ĐIỂM
                  </span>
                </div>
                <p className="text-xs text-purple-100 italic">
                  Thí sinh trả lời từ câu 17 đến câu 22. Điền kết quả số vào ô trống. Mỗi câu trả lời đúng được 0,5 điểm.
                </p>
              </div>

              {part3Questions.map((q, idx) => (
                <div key={q.id} id={`q_${idx + 17}`} className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="px-3 py-1 bg-purple-100 text-purple-900 rounded-lg text-xs font-black shrink-0">
                      Câu {idx + 17} (Câu {idx + 1} Phần III)
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

                  <div className="pt-2 flex flex-wrap items-center gap-3">
                    <label className="font-bold text-xs text-slate-700">Đáp số của bạn:</label>
                    <input
                      type="text"
                      value={saAnswers[q.id] || ''}
                      onChange={(e) => setSaAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
                      placeholder="Nhập kết quả số (VD: 5, -2, 1/2, 3.5...)"
                      className="w-64 p-2.5 border border-slate-300 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* NÚT NỘP BÀI CUỐI TRANG */}
            <div className="text-center pt-6">
              <button
                type="button"
                onClick={handleSubmitExam}
                className="px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl text-base shadow-2xl hover:shadow-blue-500/25 transition-all flex items-center gap-2 mx-auto cursor-pointer"
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
