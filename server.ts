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

/**
 * 🛠️ SỬA ĐƯỜNG DẪN CHÍNH XÁC:
 * Vì server.cjs đang chạy bên trong thư mục 'src', ta dùng '..' để đi ra ngoài thư mục gốc,
 * sau đó mới đi vào thư mục 'dist/client' nơi chứa giao diện của Vite.
 */
const staticDir = path.join(process.cwd(), 'dist', 'client');
app.use(express.static(staticDir));

// =================================================================
// 🚀 ROUTE API 1: XỬ LÝ CHATBOT MÔ HÌNH GEMINI AI
// =================================================================
// ROUTE API 1: XỬ LÝ CHATBOT MÔ HÌNH GEMINI AI (AN TOÀN)
app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;
    
    // Nếu tin nhắn rỗng, trả về thông báo hướng dẫn thay vì báo lỗi EMPTY_TEXT
    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.json({ text: 'Xin chào! Vui lòng nhập nội dung chuyên đề hoặc câu hỏi bạn cần tạo đề.' });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: message,
    });
    res.json({ text: response.text || '' });
  } catch (error: any) {
    console.error('Lỗi Gemini API:', error);
    res.status(500).json({ error: error.message || 'Lỗi xử lý AI' });
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
// 🛠️ ĐIỀU HƯỚNG TRẢ VỀ FILE TRONG THƯ MỤC DIST/CLIENT:
// Đảm bảo Express phân phối tệp tin gốc chính xác, gỡ bỏ lỗi ENOENT
// =================================================================
app.get('*', (req, res) => {
  res.sendFile(path.join(staticDir, 'index.html'));
});

// Khởi chạy hệ thống trên cổng Render cung cấp (Mặc định là 10000)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Máy chủ vận hành mượt mà tại cổng kết nối: ${PORT}`));
