import { useState } from 'react';

/**
 * TỰ ĐỘNG QUÉT CÁC FILE BÀI HỌC .tsx
 * Hỗ trợ quét cả khi file nằm ở src/ hoặc trong src/nguồn/
 */
const files = import.meta.glob(['./[0-9]*.tsx', './nguồn/*.tsx', './nguon/*.tsx'], { eager: true });

// Xây dựng danh sách các Component dựa trên tên file quét được
const componentMap: Record<string, any> = {};
Object.keys(files).forEach((key) => {
  const fileName = key.replace('./nguồn/', '').replace('./nguon/', '').replace('./', '').replace('.tsx', '');
  const module: any = files[key];
  if (module && module.default) {
    componentMap[fileName] = module.default;
  }
});

// Sắp xếp danh sách tên file theo thứ tự số tăng dần (1, 2, 3... 25)
const sortedFileNames = Object.keys(componentMap).sort((a, b) => {
  const numA = parseInt(a, 10);
  const numB = parseInt(b, 10);
  if (isNaN(numA) || isNaN(numB)) return a.localeCompare(b);
  return numA - numB;
});

export default function App() {
  // Mặc định kích hoạt hiển thị bài học đầu tiên trong danh sách
  const [currentView, setCurrentView] = useState<string>(sortedFileNames[0] || '');

  // Trích xuất Component tương ứng để render lên giao diện
  const TargetComponent = componentMap[currentView];

  if (sortedFileNames.length === 0) {
    return (
      <div style={{ padding: '30px', color: 'red', fontFamily: 'sans-serif' }}>
        ⚠️ Không tìm thấy file code .tsx nào. Vui lòng kiểm tra lại danh sách file trong thư mục src!
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      {/* THANH MENU ĐIỀU HƯỚNG BÊN TRÁI TỰ ĐỘNG SINH */}
      <div
        style={{
          width: '280px',
          background: '#f8f9fa',
          padding: '20px',
          borderRight: '1px solid #dee2e6',
          height: '100vh',
          overflowY: 'auto',
          position: 'sticky',
          top: 0,
        }}
      >
        <h2 style={{ color: '#0d6efd', marginBottom: '8px', fontSize: '18px' }}>TOÁN THPT</h2>
        <p style={{ color: '#666', fontSize: '12px', marginBottom: '20px' }}>Tác giả: Nguyễn Quốc Thảo</p>

        <p style={{ fontWeight: 'bold', fontSize: '14px', color: '#495057', marginBottom: '10px' }}>
          DANH SÁCH BÀI HỌC ({sortedFileNames.length}):
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {sortedFileNames.map((name) => (
            <button
              key={name}
              onClick={() => setCurrentView(name)}
              style={{
                padding: '10px 12px',
                textAlign: 'left',
                backgroundColor: currentView === name ? '#0d6efd' : '#fff',
                color: currentView === name ? '#fff' : '#495057',
                border: '1px solid #ced4da',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: currentView === name ? 'bold' : 'normal',
                transition: 'all 0.15s ease',
              }}
            >
              📄 Bài học {name}
            </button>
          ))}
        </div>
      </div>

      {/* VÙNG CHỨA NỘI DUNG GIAO DIỆN CỦA BÀI ĐƯỢC CHỌN */}
      <div style={{ flex: 1, padding: '25px', background: '#ffffff', minWidth: 0 }}>
        {TargetComponent ? <TargetComponent /> : <div>Đang tải nội dung...</div>}
      </div>
    </div>
  );
}
