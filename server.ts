import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { Document, Packer, Paragraph, TextRun } from 'docx';

dotenv.config();

const app = express();
app.use(express.json());

// Khởi tạo thực thể trí tuệ nhân tạo Google Gen AI
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/**
 * 🛠️ THIẾT LẬP ĐƯỜNG DẪN TĨNH KHỚP VỚI VITE:
 * Tệp tin server.cjs chạy ở thư mục gốc, kết quả build của Vite nằm tại 'dist/client'.
 * Đoạn mã này gộp chuẩn xác các cấp thư mục để Express đọc đúng file index.html.
 */
const staticDir = path.join(__dirname, 'dist', 'client');
app.use(express.static(staticDir));

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
              new TextRun({ text: content || "Nội dung tài liệu...", size: 24 }),
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
// 🛠️ ĐIỀU HƯỚNG BẮT BUỘC TRẢ VỀ INDEX.HTML TRONG DIST/CLIENT:
// Đảm bảo Express phân phối tệp tin gốc chính xác, gỡ bỏ lỗi ENOENT
// =================================================================
app.get('*', (req, res) => {
  res.sendFile(path.join(staticDir, 'index.html'));
});

// Vận hành ứng dụng tích hợp cổng thích ứng của môi trường Render (Mặc định 10000)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Máy chủ vận hành mượt mà tại cổng kết nối: ${PORT}`));
