import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { Document, Packer, Paragraph, TextRun } from 'docx';

dotenv.config();

const app = express();
app.use(express.json());

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Phục vụ giao diện tĩnh từ thư mục dist/client
const staticDir = path.join(process.cwd(), 'dist', 'client');
app.use(express.static(staticDir));

// ROUTE 1: XỬ LÝ CHATBOT VÀ TRỢ LÝ TOÁN HỌC
app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.json({ text: 'Xin chào Thầy/Cô! Vui lòng nhập nội dung cần hỗ trợ soạn đề.' });
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

// ROUTE 2: TỰ ĐỘNG SINH ĐỀ THI TOÁN THPT CHUẨN GDPT 2018 CHO HỌC SINH
app.post('/api/generate-exam', async (req, res) => {
  try {
    const { config, student } = req.body;
    const grade = config?.grade || '12';
    const title = config?.title || `BÀI KIỂM TRA TOÁN ${grade} - GDPT 2018`;
    const outcomes = (config?.selectedOutcomes || []).join('; ');

    const prompt = `
Bạn là chuyên gia khảo thí biên soạn đề thi môn Toán THPT của Bộ Giáo dục và Đào tạo Việt Nam theo Chương trình GDPT 2018.
Hãy biên soạn một đề kiểm tra môn Toán lớp ${grade} dành riêng cho học sinh: ${student?.name || 'Học sinh'}.
- Tiêu đề đề thi: ${title}
- Các Yêu cầu cần đạt (YCCĐ) cần bám sát: ${outcomes || 'Chương trình chuẩn GDPT 2018 môn Toán lớp ' + grade}

CẤU TRÚC ĐỀ THI BẮT BUỘC 100% THEO ĐỊNH DẠNG BỘ GD&ĐT (22 CÂU - 10 ĐIỂM):
1. PHẦN I: Gồm 12 câu trắc nghiệm nhiều lựa chọn (mỗi câu 4 phương án A, B, C, D; chỉ có 1 phương án đúng). Thang điểm 3.0 điểm (0.25đ/câu).
2. PHẦN II: Gồm 4 câu trắc nghiệm Đúng/Sai (mỗi câu gồm 4 ý a, b, c, d rõ ràng). Thang điểm 4.0 điểm.
3. PHẦN III: Gồm 6 câu trắc nghiệm trả lời ngắn (kết quả là số nguyên hoặc số thập phân/phân số). Thang điểm 3.0 điểm (0.5đ/câu).

Công thức Toán viết bằng LaTeX kẹp trong dấu $...$.
Hãy trả về DUY NHẤT một chuỗi JSON thuần túy (không thêm lời dẫn) theo cấu trúc:
{
  "title": "${title}",
  "grade": "${grade}",
  "questions": [
    {
      "id": "q1",
      "type": "multiple_choice",
      "level": "NhanBiet",
      "content": "Nội dung câu hỏi $...$",
      "options": [{"key": "A", "text": "$...$"}, {"key": "B", "text": "$...$"}, {"key": "C", "text": "$...$"}, {"key": "D", "text": "$...$"}],
      "correctAnswer": "A",
      "solution": "Lời giải chi tiết..."
    },
    {
      "id": "q13",
      "type": "true_false",
      "level": "ThongHieu",
      "content": "Nội dung câu dẫn $...$",
      "statements": [
        {"id": "a", "text": "Mệnh đề 1", "isCorrect": true},
        {"id": "b", "text": "Mệnh đề 2", "isCorrect": false},
        {"id": "c", "text": "Mệnh đề 3", "isCorrect": true},
        {"id": "d", "text": "Mệnh đề 4", "isCorrect": false}
      ],
      "solution": "Lời giải chi tiết..."
    },
    {
      "id": "q17",
      "type": "short_answer",
      "level": "VanDung",
      "content": "Nội dung câu hỏi $...$",
      "correctAnswer": "5",
      "solution": "Lời giải chi tiết..."
    }
  ]
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsedJson = JSON.parse(response.text || '{}');
    res.json(parsedJson);
  } catch (error: any) {
    console.error('Lỗi sinh đề thi AI:', error);
    res.status(500).json({ error: error.message || 'Lỗi khi gọi AI' });
  }
});

// ROUTE 3: XUẤT FILE WORD
app.post('/api/export-docx', async (req, res) => {
  try {
    const { title, content } = req.body;
    const doc = new Document({
      sections: [
        {
          children: [
            new Paragraph({
              children: [new TextRun({ text: title || 'ĐỀ THI TOÁN THPT', bold: true, size: 32 })],
            }),
            new Paragraph({
              children: [new TextRun({ text: content || '' })],
            }),
          ],
        },
      ],
    });
    const buffer = await Packer.toBuffer(doc);
    res.setHeader('Content-Disposition', 'attachment; filename="DeThiToanTHPT.docx"');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.send(buffer);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Điều hướng trả về file index.html cho mọi đường dẫn web
app.get('*', (req, res) => {
  res.sendFile(path.join(staticDir, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Máy chủ vận hành mượt mà tại cổng kết nối: ${PORT}`));
