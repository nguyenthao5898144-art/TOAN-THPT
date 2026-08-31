import express from 'express';
import path from 'path';

const app = express();

// Xác định thư mục hiện tại chứa file server sau khi chạy
const currentDir = typeof __dirname !== 'undefined'
  ? __dirname
  : path.dirname(new URL(import.meta.url).pathname);

// VÌ FILE INTERNET VÀ SERVER NẰM CHUNG THƯ MỤC DIST:
// Trỏ thẳng Express vào 'currentDir' để đọc các file tĩnh (assets, index.html) nằm xung quanh nó
app.use(express.static(currentDir));

// Định tuyến mọi yêu cầu truy cập từ trình duyệt trả về file index.html nằm ngay cạnh file server
app.get('*', (req, res) => {
  res.sendFile(path.join(currentDir, 'index.html'));
});

// Cấu hình cổng kết nối tự động nhận diện môi trường Render
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Ứng dụng đang chạy mượt mà tại cổng: ${PORT}`));
