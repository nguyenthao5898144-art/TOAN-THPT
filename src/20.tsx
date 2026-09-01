import React, { useState } from 'react';
import { getStoredAssignments, getStudentSubmissions } from './classStorage';
import { Clock, AlertCircle, CheckCircle2, Lock } from 'lucide-react';

export default function Lesson20() {
  const [assignmentId] = useState<string>(() => {
    return new URLSearchParams(window.location.search).get('assignmentId') || '';
  });

  const currentAssignment = getStoredAssignments().find((a) => a.id === assignmentId);
  const submissions = getStudentSubmissions(assignmentId);
  const attemptCount = submissions.length;

  const now = new Date();
  const isOpen = currentAssignment?.openAt ? new Date(currentAssignment.openAt) <= now : true;
  const isClosed = currentAssignment?.closeAt ? new Date(currentAssignment.closeAt) < now : false;
  const isExceededAttempts =
    currentAssignment && currentAssignment.maxAttempts > 0 && attemptCount >= currentAssignment.maxAttempts;

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#0d6efd', marginBottom: '15px' }}>
        Chuyên đề 20: Kiểm tra điều kiện mở/đóng đề & Phân phối đề thi
      </h2>

      <div style={{ padding: '20px', background: '#f8f9fa', borderRadius: '12px', border: '1px solid #dee2e6' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '10px' }}>Trạng thái bài kiểm tra</h3>

        {!isOpen && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#b02a37', background: '#f8d7da', padding: '12px', borderRadius: '8px', marginBottom: '10px' }}>
            <Lock size={20} />
            <span>Đề thi chưa mở. Vui lòng quay lại sau!</span>
          </div>
        )}

        {isClosed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#b02a37', background: '#f8d7da', padding: '12px', borderRadius: '8px', marginBottom: '10px' }}>
            <AlertCircle size={20} />
            <span>Đề thi đã đóng vào lúc {currentAssignment?.closeAt}. Bạn không thể làm bài nữa.</span>
          </div>
        )}

        {isExceededAttempts && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#664d03', background: '#fff3cd', padding: '12px', borderRadius: '8px', marginBottom: '10px' }}>
            <AlertCircle size={20} />
            <span>Bạn đã làm tối đa {currentAssignment?.maxAttempts} lần bài tập này.</span>
          </div>
        )}

        {isOpen && !isClosed && !isExceededAttempts && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0f5132', background: '#d1e7dd', padding: '12px', borderRadius: '8px' }}>
            <CheckCircle2 size={20} />
            <span>Hệ thống phân phối đề thi đang mở và sẵn sàng cho học sinh làm bài trực tuyến.</span>
          </div>
        )}

        <div style={{ marginTop: '15px', color: '#6c757d', fontSize: '13px', borderTop: '1px solid #dee2e6', paddingTop: '10px' }}>
          <p>• Mã bài tập: <strong>{assignmentId || 'Chưa gắn mã bài'}</strong></p>
          <p>• Số lượt đã làm: <strong>{attemptCount} lượt</strong></p>
        </div>
      </div>
    </div>
  );
}
