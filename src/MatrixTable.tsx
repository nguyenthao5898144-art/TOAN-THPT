import React, { useState } from 'react';
import { GeneratedTest, Question } from './types';
import { Table, FileText, CheckCircle2, Award, BookOpen, Download, Printer } from 'lucide-react';

interface MatrixTableProps {
  test: GeneratedTest;
}

export const MatrixTable: React.FC<MatrixTableProps> = ({ test }) => {
  const [viewMode, setViewMode] = useState<'matrix' | 'spec'>('matrix');

  const grade = test.config?.grade || (test as any).grade || '12';
  const questions = test.questions || [];

  // 1. TÍNH TOÁN CƠ CẤU THEO THỰC TẾ 22 CÂU HỎI ĐANG CÓ TRONG ĐỀ
  const part1Questions = questions.filter((q) => q.type === 'multiple_choice');
  const part2Questions = questions.filter((q) => q.type === 'true_false');
  const part3Questions = questions.filter((q) => q.type === 'short_answer');

  // Đếm số câu từng mức độ
  const countLevel = (list: Question[], lvl: string) =>
    list.filter((q) => q.level === lvl || (lvl === 'NhanBiet' && !q.level)).length;

  const p1_nb = countLevel(part1Questions, 'NhanBiet');
  const p1_th = countLevel(part1Questions, 'ThongHieu');
  const p1_vd = countLevel(part1Questions, 'VanDung');

  const p2_nb = countLevel(part2Questions, 'NhanBiet');
  const p2_th = countLevel(part2Questions, 'ThongHieu');
  const p2_vd = countLevel(part2Questions, 'VanDung');

  const p3_nb = countLevel(part3Questions, 'NhanBiet');
  const p3_th = countLevel(part3Questions, 'ThongHieu');
  const p3_vd = countLevel(part3Questions, 'VanDung');

  const totalNB = p1_nb + p2_nb + p3_nb;
  const totalTH = p1_th + p2_th + p3_th;
  const totalVD = p1_vd + p2_vd + p3_vd;
  const totalQ = questions.length || 22;

  // Điểm số
  const scoreNB = (p1_nb * 0.25 + p2_nb * 1.0 + p3_nb * 0.5).toFixed(1);
  const scoreTH = (p1_th * 0.25 + p2_th * 1.0 + p3_th * 0.5).toFixed(1);
  const scoreVD = (p1_vd * 0.25 + p2_vd * 1.0 + p3_vd * 0.5).toFixed(1);
  const totalScore = (Number(scoreNB) + Number(scoreTH) + Number(scoreVD)).toFixed(1);

  // Gom nhóm câu hỏi theo chủ đề thực tế
  const topicsMap: Record<string, Question[]> = {};
  questions.forEach((q) => {
    const key = (q as any).topicName || (q as any).lessonName || `Chuyên đề Toán ${grade}`;
    if (!topicsMap[key]) topicsMap[key] = [];
    topicsMap[key].push(q);
  });

  return (
    <div className="font-sans space-y-6 max-w-7xl mx-auto p-4 sm:p-6 text-slate-800">
      {/* HEADER BẢNG MA TRẬN */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider block">
            BỘ GIÁO DỤC VÀ ĐÀO TẠO • CHƯƠNG TRÌNH GDPT 2018
          </span>
          <h2 className="text-lg sm:text-xl font-black text-slate-900 mt-0.5">
            MA TRẬN & BẢN ĐẶC TẢ ĐỀ THI TOÁN {grade}
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Đề bài: <strong>{test.title}</strong> • Đang đồng bộ chuẩn <strong>100% với {totalQ} câu hỏi</strong> trong đề
          </p>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-2xl text-xs font-bold border border-slate-200">
          <button
            type="button"
            onClick={() => setViewMode('matrix')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
              viewMode === 'matrix' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Ma trận đề kiểm tra
          </button>
          <button
            type="button"
            onClick={() => setViewMode('spec')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
              viewMode === 'spec' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Bản đặc tả chi tiết
          </button>
        </div>
      </div>

      {/* TỔNG QUAN TỈ LỆ 40% - 30% - 30% CHUẨN BỘ */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs font-bold">
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-blue-600 block">Nhận biết (40%)</span>
            <span className="text-xl font-black text-blue-950">{totalNB} câu ({scoreNB}đ)</span>
          </div>
          <span className="p-2 bg-blue-600 text-white rounded-xl text-xs">NB</span>
        </div>

        <div className="bg-indigo-50 border border-indigo-200 p-4 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-indigo-600 block">Thông hiểu (30%)</span>
            <span className="text-xl font-black text-indigo-950">{totalTH} câu ({scoreTH}đ)</span>
          </div>
          <span className="p-2 bg-indigo-600 text-white rounded-xl text-xs">TH</span>
        </div>

        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-emerald-600 block">Vận dụng (30%)</span>
            <span className="text-xl font-black text-emerald-950">{totalVD} câu ({scoreVD}đ)</span>
          </div>
          <span className="p-2 bg-emerald-600 text-white rounded-xl text-xs">VD</span>
        </div>

        <div className="bg-slate-900 text-white p-4 rounded-2xl flex items-center justify-between shadow">
          <div>
            <span className="text-slate-400 block">Tổng cộng</span>
            <span className="text-xl font-black text-white">{totalQ} câu ({totalScore}đ)</span>
          </div>
          <Award className="w-6 h-6 text-amber-300" />
        </div>
      </div>

      {/* CHẾ ĐỘ 1: BẢNG MA TRẬN ĐỀ THI THEO CÔNG VĂN 7991 */}
      {viewMode === 'matrix' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-0">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
            <h3 className="text-xs sm:text-sm font-black text-slate-900 uppercase">
              KHUNG MA TRẬN ĐỀ KIỂM TRA ĐỊNH KỲ MÔN TOÁN LỚP {grade} (CÔNG VĂN 7991/BGDĐT-GDTrH)
            </h3>
            <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Khớp 100% với đề thi
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-center border-collapse border border-slate-300">
              <thead className="bg-slate-100 font-bold text-slate-800 text-[11px]">
                <tr>
                  <th rowSpan={2} className="border border-slate-300 p-2 w-10">STT</th>
                  <th rowSpan={2} className="border border-slate-300 p-2 text-left min-w-[200px]">Chủ đề / Đơn vị kiến thức</th>
                  <th colSpan={3} className="border border-slate-300 p-2 bg-blue-50 text-blue-900">Phần I (Nhiều lựa chọn - 0.25đ)</th>
                  <th colSpan={3} className="border border-slate-300 p-2 bg-indigo-50 text-indigo-900">Phần II (Đúng / Sai - 1.0đ)</th>
                  <th colSpan={3} className="border border-slate-300 p-2 bg-emerald-50 text-emerald-900">Phần III (Trả lời ngắn - 0.5đ)</th>
                  <th rowSpan={2} className="border border-slate-300 p-2 bg-amber-50 text-amber-950 font-black w-24">Tổng câu</th>
                  <th rowSpan={2} className="border border-slate-300 p-2 bg-slate-200 text-slate-900 font-black w-24">Tổng điểm</th>
                </tr>
                <tr>
                  <th className="border border-slate-300 p-1.5 w-12 bg-blue-50/70">NB</th>
                  <th className="border border-slate-300 p-1.5 w-12 bg-blue-50/70">TH</th>
                  <th className="border border-slate-300 p-1.5 w-12 bg-blue-50/70">VD</th>

                  <th className="border border-slate-300 p-1.5 w-12 bg-indigo-50/70">NB</th>
                  <th className="border border-slate-300 p-1.5 w-12 bg-indigo-50/70">TH</th>
                  <th className="border border-slate-300 p-1.5 w-12 bg-indigo-50/70">VD</th>

                  <th className="border border-slate-300 p-1.5 w-12 bg-emerald-50/70">NB</th>
                  <th className="border border-slate-300 p-1.5 w-12 bg-emerald-50/70">TH</th>
                  <th className="border border-slate-300 p-1.5 w-12 bg-emerald-50/70">VD</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(topicsMap).map(([topicName, qList], idx) => {
                  const t_p1 = qList.filter((q) => q.type === 'multiple_choice');
                  const t_p2 = qList.filter((q) => q.type === 'true_false');
                  const t_p3 = qList.filter((q) => q.type === 'short_answer');

                  const nb1 = countLevel(t_p1, 'NhanBiet');
                  const th1 = countLevel(t_p1, 'ThongHieu');
                  const vd1 = countLevel(t_p1, 'VanDung');

                  const nb2 = countLevel(t_p2, 'NhanBiet');
                  const th2 = countLevel(t_p2, 'ThongHieu');
                  const vd2 = countLevel(t_p2, 'VanDung');

                  const nb3 = countLevel(t_p3, 'NhanBiet');
                  const th3 = countLevel(t_p3, 'ThongHieu');
                  const vd3 = countLevel(t_p3, 'VanDung');

                  const topicTotalQ = qList.length;
                  const topicScore = (
                    (nb1 + th1 + vd1) * 0.25 +
                    (nb2 + th2 + vd2) * 1.0 +
                    (nb3 + th3 + vd3) * 0.5
                  ).toFixed(2);

                  return (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="border border-slate-300 p-2 font-bold text-slate-500">{idx + 1}</td>
                      <td className="border border-slate-300 p-2 text-left font-bold text-slate-900">{topicName}</td>
                      <td className="border border-slate-300 p-2 bg-blue-50/20 font-semibold">{nb1 || '-'}</td>
                      <td className="border border-slate-300 p-2 bg-blue-50/20 font-semibold">{th1 || '-'}</td>
                      <td className="border border-slate-300 p-2 bg-blue-50/20 font-semibold">{vd1 || '-'}</td>

                      <td className="border border-slate-300 p-2 bg-indigo-50/20 font-semibold">{nb2 || '-'}</td>
                      <td className="border border-slate-300 p-2 bg-indigo-50/20 font-semibold">{th2 || '-'}</td>
                      <td className="border border-slate-300 p-2 bg-indigo-50/20 font-semibold">{vd2 || '-'}</td>

                      <td className="border border-slate-300 p-2 bg-emerald-50/20 font-semibold">{nb3 || '-'}</td>
                      <td className="border border-slate-300 p-2 bg-emerald-50/20 font-semibold">{th3 || '-'}</td>
                      <td className="border border-slate-300 p-2 bg-emerald-50/20 font-semibold">{vd3 || '-'}</td>

                      <td className="border border-slate-300 p-2 font-black text-slate-900 bg-amber-50/40">{topicTotalQ} câu</td>
                      <td className="border border-slate-300 p-2 font-bold text-slate-700 bg-slate-50">{topicScore} đ</td>
                    </tr>
                  );
                })}

                {/* DÒNG TỔNG CỘNG TOÀN ĐỀ */}
                <tr className="bg-slate-100 font-black text-slate-900 text-xs">
                  <td colSpan={2} className="border border-slate-300 p-3 text-right uppercase tracking-wider">
                    TỔNG SỐ CÂU THEO MỨC ĐỘ:
                  </td>
                  <td className="border border-slate-300 p-2 bg-blue-100 text-blue-900">{p1_nb}</td>
                  <td className="border border-slate-300 p-2 bg-blue-100 text-blue-900">{p1_th}</td>
                  <td className="border border-slate-300 p-2 bg-blue-100 text-blue-900">{p1_vd}</td>

                  <td className="border border-slate-300 p-2 bg-indigo-100 text-indigo-900">{p2_nb}</td>
                  <td className="border border-slate-300 p-2 bg-indigo-100 text-indigo-900">{p2_th}</td>
                  <td className="border border-slate-300 p-2 bg-indigo-100 text-indigo-900">{p2_vd}</td>

                  <td className="border border-slate-300 p-2 bg-emerald-100 text-emerald-900">{p3_nb}</td>
                  <td className="border border-slate-300 p-2 bg-emerald-100 text-emerald-900">{p3_th}</td>
                  <td className="border border-slate-300 p-2 bg-emerald-100 text-emerald-900">{p3_vd}</td>

                  <td className="border border-slate-300 p-2 bg-amber-200 text-amber-950 font-black text-sm">{totalQ} CÂU</td>
                  <td className="border border-slate-300 p-2 bg-slate-300 text-slate-950 font-black text-sm">{totalScore} Đ</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CHẾ ĐỘ 2: BẢN ĐẶC TẢ CHI TIẾT TỪNG CÂU HỎI TRONG ĐỀ */}
      {viewMode === 'spec' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-0">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
            <h3 className="text-xs sm:text-sm font-black text-slate-900 uppercase">
              BẢN ĐẶC TẢ KỸ THUẬT ĐỀ THI TOÁN {grade} (CHI TIẾT TỪNG CÂU TỪ CÂU 1 ĐẾN CÂU {totalQ})
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse border border-slate-300">
              <thead className="bg-slate-100 font-bold text-slate-800 text-[11px]">
                <tr>
                  <th className="border border-slate-300 p-2.5 text-center w-14">Thứ tự</th>
                  <th className="border border-slate-300 p-2.5 w-32">Dạng câu hỏi</th>
                  <th className="border border-slate-300 p-2.5 w-48">Chuyên đề / Bài học</th>
                  <th className="border border-slate-300 p-2.5 min-w-[250px]">Yêu cầu cần đạt (YCCĐ) bám sát</th>
                  <th className="border border-slate-300 p-2.5 text-center w-28">Mức độ nhận thức</th>
                  <th className="border border-slate-300 p-2.5 text-center w-24">Điểm số</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {questions.map((q, idx) => {
                  const partName = q.type === 'multiple_choice' ? 'Phần I' : q.type === 'true_false' ? 'Phần II' : 'Phần III';
                  const point = q.type === 'multiple_choice' ? '0.25 đ' : q.type === 'true_false' ? '1.00 đ' : '0.50 đ';

                  return (
                    <tr key={q.id || idx} className="hover:bg-slate-50">
                      <td className="border border-slate-300 p-2.5 text-center font-bold text-blue-700">Câu {idx + 1}</td>
                      <td className="border border-slate-300 p-2.5 font-semibold text-slate-800">{partName}</td>
                      <td className="border border-slate-300 p-2.5 font-bold text-slate-900">
                        {(q as any).topicName || `Toán ${grade}`}
                      </td>
                      <td className="border border-slate-300 p-2.5 text-slate-700">
                        {(q as any).outcome || 'Nhận biết và vận dụng kiến thức chuẩn GDPT 2018 theo ma trận của giáo viên.'}
                      </td>
                      <td className="border border-slate-300 p-2.5 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          q.level === 'NhanBiet' ? 'bg-blue-100 text-blue-800' : q.level === 'ThongHieu' ? 'bg-indigo-100 text-indigo-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {q.level === 'NhanBiet' ? 'Nhận biết' : q.level === 'ThongHieu' ? 'Thông hiểu' : 'Vận dụng'}
                        </span>
                      </td>
                      <td className="border border-slate-300 p-2.5 text-center font-mono font-bold text-slate-800">{point}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default MatrixTable;
