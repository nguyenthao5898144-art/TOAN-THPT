import { useState } from 'react';

/**
 * TỰ ĐỘNG QUÉT THƯ MỤC "nguồn":
 * Vite tự động tìm kiếm và nạp (eager import) toàn bộ các file .tsx trong thư mục 'nguồn'
 */
const files = import.meta.glob('./nguồn/*.tsx', { eager: true });

// Xây dựng danh sách các Component dựa trên tên file quét được
const componentsMap: Record<string, any> = {};
Object.keys(files).forEach((key) => {
  // Trích xuất tên file (Ví dụ: "./nguồn/1.tsx" -> "1")
  const fileName = key.replace('./nguồn/', '').replace('.tsx', '');
  const module: any = files[key];
  // Lấy Component được export mặc định (export default) bên trong file
  componentsMap[fileName] = module.default;
});

// Sắp xếp danh sách tên file theo thứ tự số tăng dần (1, 2, 3... 25)
const sortedFileNames = Object.keys(componentsMap).sort((a, b) => {
  const numA = parseInt(a, 10);
  const numB = parseInt(b, 10);
  if (isNaN(numA) || isNaN(numB)) return a.localeCompare(b);
  return numA - numB;
});

export default function App() {
  // Mặc định kích hoạt hiển thị file code giao diện đầu tiên trong danh sách
  const [currentView, setCurrentView] = useState<string>(sortedFileNames[0] || '');

  // Trích xuất Component tương ứng để render lên giao diện
  const TargetComponent = componentsMap[currentView];

  if (sortedFileNames.length === 0) {
    return (
      <div style={{ padding: '20px', color: 'red', fontFamily: 'sans-serif' }}>
        ⚠️ Không tìm thấy file code .tsx nào trong thư mục 'nguồn'. Vui lòng kiểm tra lại cấu trúc thư mục!
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      
      {/* THANH MENU ĐIỀU HƯỚNG BÊN TRÁI TỰ ĐỘNG SINH */}
      <div style={{ 
        width: '260px', 
        background: '#f8f9fa', 
        padding: '20px', 
        borderRight: '1px solid #dee2e6',
        height: '100vh',
        overflowY: 'auto',
        position: 'sticky',
        top: 0
      }}>
        <h3 style={{ color: '#1a73e8', marginBottom: '5px', fontSize: '18px' }}>Toán THPT</h3>
        <p style={{ color: '#666', fontSize: '12px', marginBottom: '20px' }}>Tác giả: NGUYỄN QUỐC TÂM</p>
        
        <p style={{ fontWeight: 'bold', fontSize: '13px', color: '#495057', marginBottom: '10px' }}>
          DANH SÁCH FILE GIAO DIỆN ({sortedFileNames.length}):
        </p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {sortedFileNames.map((name) => (
            <button
              key={name}
              onClick={() => setCurrentView(name)}
              style={{
                padding: '10px 12px',
                textAlign: 'left',
                backgroundColor: currentView === name ? '#1a73e8' : '#fff',
                color: currentView === name ? '#fff' : '#495057',
                border: '1px solid #ced4da',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: currentView === name ? 'bold' : 'normal',
                transition: 'all 0.1s ease'
              }}
            >
              📄 Chạy file {name}.tsx
            </button>
          ))}
        </div>
      </div>

      {/* VÙNG CHẠY LOGIC VÀ PHỤC VỤ HIỂN THỊ CỦA COMPONENT ĐƯỢC CHỌN */}
      <div style={{ flex: 1, padding: '35px', background: '#ffffff', minWidth: 0 }}>
        {TargetComponent ? <TargetComponent /> : <div>Đang tải logic giao diện...</div>}
      </div>

    </div>
  );
}
