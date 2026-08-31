import { useState } from 'react';

// Nạp tự động (Import) các file bài học tương ứng của bạn
import Bai1 from './1.tsx';
import Bai12 from './12.tsx';
import Bai13 from './13.tsx';
import Bai14 from './14.tsx';
import Bai15 from './15.tsx';
import Bai16 from './16.tsx';
import Bai17 from './17.tsx';
import Bai18 from './18.tsx';
import Bai19 from './19.tsx';
import Bai20 from './20.tsx';
import Bai21 from './21.tsx';
import Bai22 from './22.tsx';
import Bai23 from './23.tsx';
import Bai24 from './24.tsx';
import Bai25 from './25.tsx';

export default function App() {
  // Trạng thái lưu trữ bài học đang được chọn (Mặc định khi mở trang là bài 1)
  const [currentLesson, setCurrentLesson] = useState<number>(1);

  // Hàm render giao diện bài học tương ứng dựa trên trạng thái bài được chọn
  const renderLesson = () => {
    switch (currentLesson) {
      case 1: return <Bai1 />;
      case 12: return <Bai12 />;
      case 13: return <Bai13 />;
      case 14: return <Bai14 />;
      case 15: return <Bai15 />;
      case 16: return <Bai16 />;
      case 17: return <Bai17 />;
      case 18: return <Bai18 />;
      case 19: return <Bai19 />;
      case 20: return <Bai20 />;
      case 21: return <Bai21 />;
      case 22: return <Bai22 />;
      case 23: return <Bai23 />;
      case 24: return <Bai24 />;
      case 25: return <Bai25 />;
      default: return <Bai1 />;
    }
  };

  // SỬA LỖI TẠI ĐÂY: Khai báo mảng số bài học đầy đủ, chính xác cấu trúc dữ liệu
  const lessons =;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      {/* THANH MENU ĐIỀU HƯỚNG BÊN TRÁI THƯ MỤC BÀI HỌC */}
      <div style={{ width: '250px', background: '#f0f2f5', padding: '20px', borderRight: '1px solid #ddd' }}>
        <h3 style={{ color: '#1a73e8', marginBottom: '20px' }}>Toán THPT</h3>
        <p style={{ fontWeight: 'bold', fontSize: '14px' }}>DANH SÁCH BÀI HỌC:</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {lessons.map((num) => (
            <button
              key={num}
              onClick={() => setCurrentLesson(num)}
              style={{
                padding: '10px',
                textAlign: 'left',
                backgroundColor: currentLesson === num ? '#1a73e8' : '#fff',
                color: currentLesson === num ? '#fff' : '#333',
                border: '1px solid #ccc',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: currentLesson === num ? 'bold' : 'normal'
              }}
            >
              Bài Học Số {num}
            </button>
          ))}
        </div>
      </div>

      {/* VÙNG CHỨA NỘI DUNG TÀI LIỆU TOÁN CHI TIẾT */}
      <div style={{ flex: 1, padding: '30px', background: '#fff' }}>
        {renderLesson()}
      </div>
    </div>
  );
}
