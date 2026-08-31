import React, { useState } from 'react';

export default function Lesson15() {
  const [isStudentMode, setIsStudentMode] = useState(false);

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: '#0d6efd', marginBottom: '12px' }}>
        Chuyên đề 15: Hệ thống Luyện tập & Đánh giá Toán THPT
      </h2>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button
          onClick={() => setIsStudentMode(false)}
          style={{
            padding: '8px 16px',
            backgroundColor: !isStudentMode ? '#0d6efd' : '#e9ecef',
            color: !isStudentMode ? '#fff' : '#000',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          👨‍🏫 Chế độ Giáo viên
        </button>

        <button
          onClick={() => setIsStudentMode(true)}
          style={{
            padding: '8px 16px',
            backgroundColor: isStudentMode ? '#198754' : '#e9ecef',
            color: isStudentMode ? '#fff' : '#000',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          👨‍🎓 Chế độ Học sinh
        </button>
      </div>

      <div style={{ padding: '20px', border: '1px solid #dee2e6', borderRadius: '8px', background: '#f8f9fa' }}>
        {!isStudentMode ? (
          <div>
            <h3 style={{ fontSize: '18px', color: '#0d6efd', marginBottom: '10px' }}>Giao diện Quản trị & Soạn đề (Giáo viên)</h3>
            <p style={{ color: '#555' }}>
              Tại đây giáo viên có thể tạo đề thi, quản lý ngân hàng câu hỏi ma trận đặc tả theo chuẩn GDPT 2018 và xuất bản file Word.
            </p>
          </div>
        ) : (
          <div>
            <h3 style={{ fontSize: '18px', color: '#198754', marginBottom: '10px' }}>Cổng Luyện tập & Làm bài (Học sinh)</h3>
            <p style={{ color: '#555' }}>
              Học sinh tham gia làm bài trắc nghiệm nhiều lựa chọn, đúng/sai và trả lời ngắn trực tuyến với đồng hồ đếm ngược.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
