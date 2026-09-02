import React, { useState } from 'react';
import { GeneratedTest } from './types';
import { StoredTestItem, getStoredTestBank, deleteStoredTest } from './testBankStorage';
import { exportTestToWord } from './wordExporter';
import {
  Search, Plus, FolderPlus, FileText, Download, Trash2, Folder,
  Database, ChevronRight, ChevronLeft, QrCode, Copy, Check, Calendar,
  Clock, Users, Award, Shield, Share2, BarChart2, Trophy, RotateCcw,
  CheckCircle2, XCircle, ArrowLeft, Printer, MessageSquare
} from 'lucide-react';

export interface TestBankModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  onSelectTest?: (test: GeneratedTest) => void;
  onCreateNew?: () => void;
}

export const TestBankModal: React.FC<TestBankModalProps> = ({
  onSelectTest,
  onCreateNew,
}) => {
  const [storedTests, setStoredTests] = useState<StoredTestItem[]>(() => {
    try {
      return getStoredTestBank();
    } catch {
      return [];
    }
  });

  const [searchTerm, setSearchTerm] = useState<string>('');

  // Cấp 1 & 2: Đường dẫn thư mục
  const [folderPath, setFolderPath] = useState<string[]>(['KIỂM TRA 2025-2026', 'TOÁN 12']);

  // Cấp 3: Xem tổng quan đề thi
  const [selectedExamDetail, setSelectedExamDetail] = useState<any | null>(null);

  // Cấp 4: Xem chi tiết bài làm của 1 học sinh cụ thể
  const [selectedStudentDetail, setSelectedStudentDetail] = useState<any | null>(null);
  const [teacherFeedback, setTeacherFeedback] = useState<string>('Bài làm rất tốt, lập luận chặt chẽ và tính toán chính xác!');

  // Cấp 5: Xem phổ điểm & thống kê câu hỏi
  const [isStatsViewOpen, setIsStatsViewOpen] = useState<boolean>(false);

  const [isCopied, setIsCopied] = useState<boolean>(false);

  // Cấu trúc cây thư mục đa cấp
  const [folderTree] = useState<Record<string, string[]>>({
    root: ['Kho đề Azota', 'TOÁN 12', 'TOÁN 10', 'KIỂM TRA 2025-2026', 'ÔN TẬP RÈN LUYỆN'],
    'KIỂM TRA 2025-2026': ['TOÁN 12', 'TOÁN 11', 'TOÁN 10'],
    'TOÁN 12': ['ÔN TẬP GK1', 'TX1', 'TX2', 'TX3', 'TX4', 'TX5', 'TX6'],
  });

  // Đề thi hiển thị ở Cấp 2
  const examList = [
    {
      id: 'exam_1',
      name: 'THƯỜNG XUYÊN-CẢI THIỆN ĐIỂM',
      submissions: 0,
      status: 'Chưa xuất bản',
      targetClass: '12A6',
      assignedTime: '23/04/2026 15:00 -> 23/04/2026 15:10',
      createdAt: '23/04/2026 13:04',
      creator: 'Nguyễn Thảo',
      durationMinutes: 15,
      grade: 'Khối 12 - Toán',
    },
    {
      id: 'exam_2',
      name: 'TO12-THƯỜNG XUYÊN 8.3',
      submissions: 26,
      status: 'Đã xuất bản',
      targetClass: '12A6',
      assignedTime: '20/04/2026 15:30 -> 20/04/2026 15:40',
      createdAt: '20/04/2026 15:06',
      creator: 'Nguyễn Thảo',
      durationMinutes: 15,
      grade: 'Khối 12 - Toán',
    },
  ];

  // Danh sách kết quả thi học sinh (Cấp 3)
  const studentResults = [
    { id: '1', name: 'Châu Ngô Nhật Ái', initials: 'CA', score: 9.5, duration: '9 phút 5 giây', submittedAt: '20/04/2026 15:40', sbd: '67339301' },
    { id: '2', name: 'Lê Thị Yến Duy', initials: 'LD', score: 9.5, duration: '9 phút 49 giây', submittedAt: '20/04/2026 15:42', sbd: '67339302' },
    { id: '3', name: 'Lê Vũ Đạt', initials: 'LD', score: 9.0, duration: '11 phút 56 giây', submittedAt: '20/04/2026 15:44', sbd: '67339303' },
    { id: '4', name: 'Trần Thành Đạt', initials: 'Đ', score: 9.5, duration: '3 phút 55 giây', submittedAt: '20/04/2026 15:35', sbd: '67339304' },
    { id: '5', name: 'Sử Lưu Phước Hậu', initials: 'SH', score: 9.0, duration: '3 phút 13 giây', submittedAt: '20/04/2026 15:34', sbd: '67339305' },
    { id: '6', name: 'Trần Chấn Hiệp', initials: 'TH', score: 8.5, duration: '8 phút 20 giây', submittedAt: '20/04/2026 15:39', sbd: '67339306' },
  ];

  // Câu hỏi & Bài làm mẫu của học sinh (Cấp 4)
  const sampleStudentExamAnswers = [
    { num: 1, type: 'Trắc nghiệm', question: 'Cho hàm số y = f(x) có đạo hàm f\'(x) = x(x-1)². Mệnh đề nào sau đây đúng?', userAns: 'A', correctAns: 'A', isRight: true, point: 0.25 },
    { num: 2, type: 'Trắc nghiệm', question: 'Đường tiệm cận đứng của đồ thị hàm số y = (2x+1)/(x-1) là đường thẳng có phương trình:', userAns: 'B', correctAns: 'B', isRight: true, point: 0.25 },
    { num: 3, type: 'Trắc nghiệm', question: 'Giá trị lớn nhất của hàm số f(x) = x³ - 3x trên đoạn [0; 2] bằng:', userAns: 'C', correctAns: 'C', isRight: true, point: 0.25 },
    { num: 4, type: 'Đúng / Sai', question: 'Cho hàm số y = ax³ + bx² + cx + d có đồ thị như hình vẽ. Xét tính đúng sai của các mệnh đề sau:', userAns: 'Đúng 4/4 ý', correctAns: 'Đúng 4/4 ý', isRight: true, point: 1.0 },
    { num: 5, type: 'Trả lời ngắn', question: 'Tìm số điểm cực trị của hàm số g(x) = f(x² - 2x):', userAns: '5', correctAns: '5', isRight: true, point: 0.5 },
    { num: 6, type: 'Trả lời ngắn', question: 'Tính diện tích hình phẳng giới hạn bởi đồ thị hàm số y = x² - 4 và trục hoành:', userAns: '10.5', correctAns: '32/3 (≈ 10.67)', isRight: false, point: 0.0 },
  ];

  // Thống kê phân tích câu hỏi (Cấp 5)
  const questionAnalytics = [
    { qNum: 'Câu 1', type: 'Phần I - MCQ', correctRate: '96%', avgScore: '0.24 / 0.25', level: 'Nhận biết', status: 'Dễ' },
    { qNum: 'Câu 2', type: 'Phần I - MCQ', correctRate: '92%', avgScore: '0.23 / 0.25', level: 'Nhận biết', status: 'Dễ' },
    { qNum: 'Câu 3', type: 'Phần I - MCQ', correctRate: '88%', avgScore: '0.22 / 0.25', level: 'Thông hiểu', status: 'Trung bình' },
    { qNum: 'Câu 4', type: 'Phần II - Đ/S', correctRate: '85%', avgScore: '0.85 / 1.00', level: 'Thông hiểu', status: 'Phân hóa tốt' },
    { qNum: 'Câu 5', type: 'Phần III - TLN', correctRate: '73%', avgScore: '0.36 / 0.50', level: 'Vận dụng', status: 'Khó' },
    { qNum: 'Câu 6', type: 'Phần III - TLN', correctRate: '42%', avgScore: '0.21 / 0.50', level: 'Vận dụng cao', status: 'Học sinh sai nhiều' },
  ];

  const currentParentKey = folderPath.length === 0 ? 'root' : folderPath[folderPath.length - 1];
  const currentSubFolders = folderTree[currentParentKey] || [];

  const handleOpenFolder = (folderName: string) => {
    setFolderPath([...folderPath, folderName]);
  };

  const handleBreadcrumbClick = (index: number) => {
    if (index === -1) {
      setFolderPath([]);
    } else {
      setFolderPath(folderPath.slice(0, index + 1));
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/?mode=student`);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // ==========================================================
  // CẤP 5: PHÂN TÍCH PHỔ ĐIỂM & THỐNG KÊ CÂU HỎI TOÀN LỚP
  // ==========================================================
  if (isStatsViewOpen) {
    return (
      <div className="font-sans max-w-7xl mx-auto p-4 sm:p-6 text-slate-800 space-y-5">
        <div className="flex items-center justify-between border-b pb-3">
          <button
            type="button"
            onClick={() => setIsStatsViewOpen(false)}
            className="px-3.5 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm hover:bg-slate-50 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4 text-blue-600" /> Quay lại Bảng điểm (Cấp 3)
          </button>
          <span className="text-xs font-black uppercase text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            CẤP 5: BÁO CÁO PHÂN TÍCH CHẤT LƯỢNG BÀI THI (GDPT 2018)
          </span>
        </div>

        {/* Tổng quan chỉ số */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-2xl border text-center shadow-sm">
            <span className="text-xs text-slate-500 font-bold block">Sĩ số tham gia</span>
            <span className="text-2xl font-black text-slate-900">26 / 38</span>
            <span className="text-[10px] text-emerald-600 font-bold block mt-1">Đạt tỉ lệ 68.4%</span>
          </div>
          <div className="bg-white p-4 rounded-2xl border text-center shadow-sm">
            <span className="text-xs text-slate-500 font-bold block">Điểm trung bình lớp</span>
            <span className="text-2xl font-black text-blue-600">9.12</span>
            <span className="text-[10px] text-slate-400 block mt-1">Chuẩn học lực Giỏi</span>
          </div>
          <div className="bg-white p-4 rounded-2xl border text-center shadow-sm">
            <span className="text-xs text-slate-500 font-bold block">Điểm cao nhất</span>
            <span className="text-2xl font-black text-emerald-600">9.5</span>
            <span className="text-[10px] text-slate-400 block mt-1">3 học sinh đạt</span>
          </div>
          <div className="bg-white p-4 rounded-2xl border text-center shadow-sm">
            <span className="text-xs text-slate-500 font-bold block">Thời gian làm TB</span>
            <span className="text-2xl font-black text-indigo-600">8.2 ph</span>
            <span className="text-[10px] text-slate-400 block mt-1">Hạn mức: 15 phút</span>
          </div>
        </div>

        {/* Bảng phân tích chi tiết độ khó từng câu hỏi */}
        <div className="bg-white p-5 rounded-2xl border shadow-sm space-y-3">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-blue-600" /> BẢNG PHÂN TÍCH TỶ LỆ LÀM ĐÚNG TỪNG CÂU HỎI
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse border border-slate-200">
              <thead className="bg-slate-100 font-bold text-[11px] text-slate-700">
                <tr>
                  <th className="border p-2.5 text-center w-16">Câu số</th>
                  <th className="border p-2.5 w-32">Dạng thức</th>
                  <th className="border p-2.5 text-center w-28">Tỷ lệ làm đúng</th>
                  <th className="border p-2.5 text-center w-28">Điểm TB câu</th>
                  <th className="border p-2.5 text-center w-28">Mức nhận thức</th>
                  <th className="border p-2.5 text-center w-36">Đánh giá sư phạm</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {questionAnalytics.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="border p-2.5 text-center font-bold">{row.qNum}</td>
                    <td className="border p-2.5 font-semibold text-slate-700">{row.type}</td>
                    <td className="border p-2.5 text-center font-bold text-blue-700">{row.correctRate}</td>
                    <td className="border p-2.5 text-center font-mono">{row.avgScore}</td>
                    <td className="border p-2.5 text-center">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-bold">
                        {row.level}
                      </span>
                    </td>
                    <td className="border p-2.5 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        row.status.includes('sai') ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================================
  // CẤP 4: XEM CHI TIẾT BÀI LÀM CỦA 1 HỌC SINH CỤ THỂ
  // ==========================================================
  if (selectedStudentDetail) {
    return (
      <div className="font-sans max-w-5xl mx-auto p-4 sm:p-6 text-slate-800 space-y-5">
        <div className="flex items-center justify-between border-b pb-3">
          <button
            type="button"
            onClick={() => setSelectedStudentDetail(null)}
            className="px-3.5 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm hover:bg-slate-50 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4 text-blue-600" /> Quay lại danh sách học sinh (Cấp 3)
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-slate-300"
            >
              <Printer className="w-3.5 h-3.5" /> In bài làm
            </button>
            <span className="text-xs font-black uppercase text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
              CẤP 4: PHIẾU BÀI LÀM CHI TIẾT
            </span>
          </div>
        </div>

        {/* Thông tin bài thi học sinh */}
        <div className="bg-white p-5 rounded-2xl border shadow-sm flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-sm shadow">
              {selectedStudentDetail.initials}
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">{selectedStudentDetail.name}</h2>
              <p className="text-xs text-slate-500">
                SBD: <strong>{selectedStudentDetail.sbd}</strong> • Lớp: <strong>12A6</strong> • Thời gian nộp: <strong>{selectedStudentDetail.submittedAt}</strong>
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-500 block font-semibold">Điểm bài thi:</span>
            <span className="text-3xl font-black text-emerald-600">{selectedStudentDetail.score} / 10</span>
          </div>
        </div>

        {/* Lời phê của giáo viên */}
        <div className="bg-amber-50/70 border border-amber-200 p-4 rounded-2xl space-y-2">
          <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
            <MessageSquare className="w-4 h-4" /> Lời phê & Nhận xét của Thầy Nguyễn Quốc Tâm:
          </span>
          <textarea
            rows={2}
            value={teacherFeedback}
            onChange={(e) => setTeacherFeedback(e.target.value)}
            className="w-full p-2.5 bg-white border border-amber-300 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        {/* Danh sách từng câu hỏi & bài làm học sinh đã chọn */}
        <div className="space-y-3">
          <h3 className="font-bold text-sm text-slate-900">Chi tiết từng câu hỏi & Kết quả chấm:</h3>
          {sampleStudentExamAnswers.map((ans) => (
            <div
              key={ans.num}
              className={`p-4 rounded-2xl border bg-white shadow-sm space-y-2.5 transition-all ${
                ans.isRight ? 'border-emerald-200' : 'border-rose-200 bg-rose-50/20'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-lg text-xs font-black text-white ${ans.isRight ? 'bg-emerald-600' : 'bg-rose-600'}`}>
                    Câu {ans.num}
                  </span>
                  <span className="text-xs text-slate-500 font-bold">({ans.type})</span>
                </div>
                <div className="flex items-center gap-1 font-bold text-xs">
                  {ans.isRight ? (
                    <span className="text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> ĐÚNG (+{ans.point} điểm)
                    </span>
                  ) : (
                    <span className="text-rose-700 flex items-center gap-1">
                      <XCircle className="w-4 h-4" /> SAI (0 điểm)
                    </span>
                  )}
                </div>
              </div>

              <p className="text-xs font-semibold text-slate-800 leading-relaxed">{ans.question}</p>

              <div className="p-2.5 bg-slate-50 rounded-xl border text-xs flex flex-wrap items-center justify-between gap-2">
                <div>
                  Thí sinh chọn: <strong className={ans.isRight ? 'text-emerald-700' : 'text-rose-700'}>{ans.userAns}</strong>
                </div>
                <div>
                  Đáp án chuẩn: <strong className="text-blue-700">{ans.correctAns}</strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ==========================================================
  // CẤP 3: MÀN HÌNH DANH SÁCH 26 HỌC SINH ĐÃ THI (ẢNH 3)
  // ==========================================================
  if (selectedExamDetail) {
    return (
      <div className="font-sans max-w-7xl mx-auto p-4 sm:p-6 text-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setSelectedExamDetail(null)}
            className="px-3.5 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm hover:bg-slate-50 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4 text-blue-600" /> Quay lại thư mục {folderPath[folderPath.length - 1]}
          </button>
          <span className="text-xs font-black uppercase text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            CẤP 3: THEO DÕI BẢNG ĐIỂM HỌC SINH
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* CỘT TRÁI: THÔNG TIN BÀI THI & MENU QUẢN TRỊ */}
          <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-5">
            <div className="space-y-2 pb-4 border-b border-slate-100">
              <div className="flex items-start gap-2.5">
                <FileText className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <h2 className="text-base font-black text-slate-900 leading-snug">
                  {selectedExamDetail.name}
                </h2>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="flex-1 py-2 px-3 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm"
                >
                  {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{isCopied ? 'Đã sao chép link!' : 'Copy link'}</span>
                </button>
                <span className="p-2 bg-slate-50 border rounded-xl"><QrCode className="w-4 h-4 text-slate-600" /></span>
              </div>
            </div>

            <div className="space-y-2.5 text-xs text-slate-600">
              <p>📅 Ngày tạo: <strong>{selectedExamDetail.createdAt}</strong></p>
              <div>
                <span>Thời gian giao đề:</span>
                <p className="font-bold text-rose-600 font-mono text-[11px] mt-0.5">{selectedExamDetail.assignedTime}</p>
              </div>
              <p>👤 Người tạo: <strong className="text-slate-900">{selectedExamDetail.creator}</strong></p>
              <p>✍️ Số lượt làm: <strong>{selectedExamDetail.submissions}</strong></p>
              <p>📚 {selectedExamDetail.grade}</p>
              <button
                type="button"
                onClick={handleCopyLink}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 border"
              >
                <Share2 className="w-3.5 h-3.5 text-blue-600" /> Chia sẻ
              </button>
            </div>

            <div className="space-y-1 pt-3 border-t border-slate-100 text-xs font-bold text-slate-600">
              <div className="p-2 bg-blue-50 text-blue-800 rounded-xl flex items-center gap-2">
                <Users className="w-4 h-4" /> Danh sách đã thi ({selectedExamDetail.submissions}/38)
              </div>
              {/* BẤM MỞ CẤP 5: THỐNG KÊ & PHỔ ĐIỂM */}
              <div
                onClick={() => setIsStatsViewOpen(true)}
                className="p-2 hover:bg-slate-50 rounded-xl flex items-center gap-2 cursor-pointer text-blue-600 font-bold"
              >
                <BarChart2 className="w-4 h-4 text-blue-500" /> 📊 Xem Phổ điểm & Phân tích câu (Cấp 5)
              </div>
              <div className="p-2 hover:bg-slate-50 rounded-xl flex items-center gap-2 cursor-pointer">
                <Trophy className="w-4 h-4 text-amber-500" /> Bảng xếp hạng
              </div>
              <div className="p-2 hover:bg-slate-50 rounded-xl flex items-center gap-2 cursor-pointer" onClick={() => alert('Đã kích hoạt chấm lại điểm!')}>
                <RotateCcw className="w-4 h-4 text-emerald-600" /> Chấm lại điểm
              </div>
            </div>
          </div>

          {/* CỘT PHẢI: BẢNG HỌC SINH ĐÃ NỘP (BẤM VÀO HỌC SINH SẼ MỞ RA CẤP 4) */}
          <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b flex flex-wrap items-center justify-between gap-3 bg-slate-50/60">
              <h3 className="font-black text-xs sm:text-sm text-slate-900">
                Danh sách đã thi ({selectedExamDetail.submissions}/38) • <span className="text-blue-600 font-normal">Bấm vào tên học sinh để xem chi tiết bài làm</span>
              </h3>
              <div className="relative w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Tìm kiếm theo Tên | SĐT | SBD..."
                  className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs outline-none"
                />
              </div>
            </div>

            <div className="p-3 border-b flex items-center justify-between text-xs bg-white">
              <span className="font-bold border-b-2 border-blue-600 pb-1 text-blue-700">
                12A6 ({selectedExamDetail.submissions}/38)
              </span>
              <button
                type="button"
                onClick={() => alert('Đang xuất bảng điểm Excel...')}
                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs flex items-center gap-1 shadow"
              >
                <Download className="w-3.5 h-3.5" /> Xuất Excel
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="bg-slate-50 text-[11px] font-bold text-slate-600 border-b">
                  <tr>
                    <th className="p-3 text-center w-12">STT</th>
                    <th className="p-3">Họ và tên (Click xem bài)</th>
                    <th className="p-3 text-center w-36">Thời gian làm bài</th>
                    <th className="p-3 text-center w-36">Thời gian nộp bài</th>
                    <th className="p-3 text-center w-28">Điểm số</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {studentResults.map((st, i) => (
                    <tr
                      key={st.id}
                      onClick={() => setSelectedStudentDetail(st)}
                      className="hover:bg-blue-50/60 transition-colors cursor-pointer group"
                      title="Bấm để xem chi tiết phiếu bài làm của học sinh này"
                    >
                      <td className="p-3 text-center font-bold text-slate-500">{i + 1}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs group-hover:bg-blue-600 group-hover:text-white transition-colors">
                            {st.initials}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block group-hover:text-blue-600">{st.name} ♂</span>
                            <span className="text-[10px] text-emerald-600 font-bold">Điểm: {st.score}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-center font-mono text-slate-600">{st.duration}</td>
                      <td className="p-3 text-center font-mono text-slate-500 text-[11px]">{st.submittedAt}</td>
                      <td className="p-3 text-center">
                        <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-lg font-black text-xs">
                          {st.score} / 10
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================================
  // CẤP 1 & CẤP 2: CÂY THƯ MỤC & DANH SÁCH ĐỀ (CHUẨN ẢNH 1 & ẢNH 2)
  // ==========================================================
  return (
    <div className="font-sans space-y-5 max-w-7xl mx-auto p-4 sm:p-6 text-slate-800">
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative flex-1 min-w-[260px] max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm kiếm..."
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onCreateNew}
            className="px-4 py-2 bg-cyan-700 hover:bg-cyan-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm cursor-pointer"
          >
            <Database className="w-4 h-4 text-cyan-200" /> Tạo đề từ ngân hàng chung
          </button>

          <button
            type="button"
            onClick={onCreateNew}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Tạo đề thi
          </button>

          <button
            type="button"
            onClick={() => alert('Nhập tên thư mục mới...')}
            className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm cursor-pointer"
          >
            <FolderPlus className="w-4 h-4 text-blue-300" /> Tạo thư mục
          </button>
        </div>
      </div>

      {/* THANH BREADCRUMB */}
      <div className="flex items-center space-x-2 text-sm font-bold px-1">
        <button
          type="button"
          onClick={() => handleBreadcrumbClick(-1)}
          className={`cursor-pointer transition-colors ${
            folderPath.length === 0 ? 'text-slate-900 font-black' : 'text-slate-500 hover:text-blue-600'
          }`}
        >
          Tất cả
        </button>

        {folderPath.map((folder, idx) => {
          const isLast = idx === folderPath.length - 1;
          return (
            <React.Fragment key={idx}>
              <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
              <button
                type="button"
                onClick={() => handleBreadcrumbClick(idx)}
                className={`cursor-pointer transition-colors ${
                  isLast ? 'text-blue-600 font-black' : 'text-slate-500 hover:text-blue-600'
                }`}
              >
                {folder}
              </button>
            </React.Fragment>
          );
        })}
      </div>

      {/* BẢNG CẤP 2 */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-slate-50 text-[11px] font-bold text-slate-600 border-b border-slate-200">
              <tr>
                <th className="p-3.5 w-10 text-center"><input type="checkbox" className="rounded" /></th>
                <th className="p-3.5">Tên</th>
                <th className="p-3.5 text-center w-28">Số bài đã nộp</th>
                <th className="p-3.5 text-center w-28">Trạng Thái</th>
                <th className="p-3.5 w-32">Đã Giao Cho</th>
                <th className="p-3.5 w-44">Thời gian giao đề</th>
                <th className="p-3.5 w-28">Thời gian tạo</th>
                <th className="p-3.5 text-center w-24">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {currentSubFolders.map((fName, idx) => (
                <tr
                  key={idx}
                  onClick={() => handleOpenFolder(fName)}
                  className="hover:bg-blue-50/50 transition-colors cursor-pointer group"
                >
                  <td className="p-3.5 text-center" onClick={(e) => e.stopPropagation()}><input type="checkbox" className="rounded" /></td>
                  <td className="p-3.5 flex items-center gap-3 font-bold text-slate-900 group-hover:text-blue-600">
                    <Folder className="w-5 h-5 text-slate-700 fill-slate-600 shrink-0 group-hover:text-blue-600" />
                    <span>{fName}</span>
                  </td>
                  <td className="p-3.5 text-center text-slate-400">---</td>
                  <td className="p-3.5 text-center text-slate-400">---</td>
                  <td className="p-3.5 text-slate-400">---</td>
                  <td className="p-3.5 text-slate-400">---</td>
                  <td className="p-3.5 text-slate-500 font-mono">2026</td>
                  <td className="p-3.5 text-center text-slate-400">Thư mục</td>
                </tr>
              ))}

              {examList.map((exam) => (
                <tr
                  key={exam.id}
                  onClick={() => setSelectedExamDetail(exam)}
                  className="hover:bg-amber-50/40 transition-colors cursor-pointer"
                >
                  <td className="p-3.5 text-center" onClick={(e) => e.stopPropagation()}><input type="checkbox" className="rounded" /></td>
                  <td className="p-3.5">
                    <div className="flex items-center gap-3 font-bold text-slate-900 hover:text-blue-600">
                      <FileText className="w-5 h-5 text-amber-600 shrink-0" />
                      <span>{exam.name}</span>
                    </div>
                  </td>
                  <td className="p-3.5 text-center font-bold text-slate-800">{exam.submissions}</td>
                  <td className="p-3.5 text-center">
                    <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                      exam.status === 'Đã xuất bản' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {exam.status}
                    </span>
                  </td>
                  <td className="p-3.5 text-slate-700 font-semibold">{exam.targetClass}</td>
                  <td className="p-3.5 text-slate-600 font-mono text-[11px]">{exam.assignedTime}</td>
                  <td className="p-3.5 text-slate-600 font-mono text-[11px]">{exam.createdAt}</td>
                  <td className="p-3.5 text-center">
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); alert(`Đang tải file Word: ${exam.name}`); }}
                      className="p-1 text-slate-400 hover:text-blue-600"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TestBankModal;
