import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

// Nạp các biến môi trường từ file .env
dotenv.config();

const app = express();
app.use(express.json());

// Khởi tạo Google Gen AI với API Key bảo mật
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Xác định thư mục hiện tại chứa tệp server.cjs sau khi khởi chạy
const currentDir = typeof __dirname !== 'undefined'
  ? __dirname
  : path.dirname(new URL(import.meta.url).pathname);

/**
 * VÌ FILE SERVER.CJS VÀ CÁC FILE STATIC (INDEX.HTML, ASSETS) NẰM CHUNG TRONG THƯ MỤC DIST:
 * Express phải đọc các tài nguyên tĩnh nằm ngay cùng cấp (currentDir) xung quanh nó.
 */
app.use(express.static(currentDir));

// --- ĐƯỜNG DẪN XỬ LÝ API CHAT GEMINI ---
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

// Điều hướng bắt buộc: Trả về index.html nằm ngay cạnh file server cho mọi request tải trang
app.get('*', (req, res) => {
  res.sendFile(path.join(currentDir, 'index.html'));
});

// Cấu hình cổng kết nối thích ứng tự động với Render
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Máy chủ vận hành mượt mà tại cổng kết nối: ${PORT}`));
