import express from 'express';
import path from 'path';

const app = express();

// Cơ chế xác định đường dẫn thư mục an toàn, tương thích định dạng CommonJS (CJS)
const currentDir = typeof __dirname !== 'undefined'
  ? __dirname
  : path.dirname(new URL(import.meta.url).pathname);

// Phục vụ toàn bộ các tài nguyên tĩnh được Vite biên dịch tự động
app.use(express.static(path.join(currentDir, 'client')));

// Định tuyến toàn bộ các yêu cầu tải trang về tệp tin index.html gốc để Front-end tự xử lý điều hướng
app.get('*', (req, res) => {
  res.sendFile(path.join(currentDir, 'client', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Hệ thống đang vận hành tại cổng kết nối: ${PORT}`));
