import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { Document, Packer, Paragraph, TextRun } from 'docx';

dotenv.config();

const app = express();
app.use(express.json());

// Khởi tạo thực thể Google Gen AI kết nối với mô hình Gemini
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Xác định vị trí thư mục hiện hành của tệp chạy máy chủ
const currentDir = typeof __dirname !== 'undefined'
  ? __dirname
  : path.dirname(new URL(import.meta.url).pathname);

/**
 * 🛠️ SỬA ĐƯỜNG DẪN TẠI ĐÂY:
 * Vì Vite xuất thẳng vào 'dist' chứ không có 'dist/client', ta trỏ trực tiếp vào thư mục 'dist'
 */
app.use(express.static(path.join(currentDir, 'dist')));

// =================================================================
// 🚀 ROUTE API 1: XỬ LÝ CHATBOT MÔ HÌNH GEMINI AI
// =================================================================
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

// =================================================================
// 🚀 ROUTE API 2: TÍNH NĂNG XUẤT TÀI LIỆU TOÁN SANG FILE WORD (.DOCX)
// =================================================================
app.post('/api/export-docx', async (req, res) => {
  try {
    const { title, content } = req.body;
    
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            children: [
              new TextRun({ text: title || "Tài Liệu Toán THPT", bold: true, size: 32 }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: content || "Nội dung...", size: 24 }),
            ],
          }),
        ],
      }],
    });

    const b64string = await Packer.toBase64String(doc);
    const buffer = Buffer.from(b64string, 'base64');

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', 'attachment; filename=TaiLieuToan.docx');
    res.send(buffer);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// =================================================================
// 🛠️ SỬA ĐƯỜNG DẪN ĐIỀU HƯỚNG TẠI ĐÂY:
// Trả về file index.html nằm trực tiếp trong thư mục dist
// =================================================================
app.get('*', (req, res) => {
  res.sendFile(path.join(currentDir, 'dist', 'index.html'));
});

// Khởi chạy hệ thống trên cổng Render cung cấp (Mặc định là 10000)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server đang vận hành tại cổng: ${PORT}`));
