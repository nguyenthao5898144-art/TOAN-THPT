import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

// Kích hoạt đọc cấu hình file biến môi trường .env
dotenv.config();

const app = express();
app.use(express.json());

// Khởi tạo đối tượng kết nối với API Trí tuệ nhân tạo Gemini
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Xác định vị trí thư mục hiện tại của file server sau khi build
const currentDir = typeof __dirname !== 'undefined'
  ? __dirname
  : path.dirname(new URL(import.meta.url).pathname);

// Trỏ Express đọc toàn bộ tệp tĩnh (HTML/CSS/JS) nằm cùng cấp trong thư mục dist
app.use(express.static(currentDir));

// --- CÁC ĐƯỜNG DẪN API (ROUTE API) CỦA BẠN SẼ ĐẶT TẠI ĐÂY ---
app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: message,
    });
    res.json({ text: response.text });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Điều hướng bắt buộc trả về index.html cho toàn bộ các yêu cầu tải trang Front-end
app.get('*', (req, res) => {
  res.sendFile(path.join(currentDir, 'index.html'));
});

// Cấu hình cổng kết nối thích ứng tự động với máy chủ Render
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Hệ thống máy chủ vận hành mượt mà tại cổng: ${PORT}`));
