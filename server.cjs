const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Phục vụ giao diện web từ thư mục dist đã build
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
}

// API dự phòng cho hệ thống tạo đề
app.post('/api/generate-exam', (req, res) => {
  res.json({ success: true, message: 'Server ready' });
});

// Chuyển tiếp tất cả đường dẫn về index.html (SPA routing)
app.get('*', (req, res) => {
  const indexPath = path.join(distPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(200).send('Hệ thống đang khởi động, vui lòng tải lại trang sau 5 giây...');
  }
});

// Lắng nghe trên 0.0.0.0 theo yêu cầu của Render
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});
