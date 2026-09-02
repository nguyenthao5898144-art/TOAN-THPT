import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { Document, Packer, Paragraph, TextRun } from 'docx';

dotenv.config();

const app = express();
app.use(express.json());

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const staticDir = path.join(process.cwd(), 'dist', 'client');
app.use(express.static(staticDir));

app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.json({ text: 'Xin chào Thầy/Cô! Tôi là Trợ lý AI môn Toán THPT.' });
    }
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: message,
    });
    res.json({ text: response.text || '' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Lỗi xử lý AI' });
  }
});

// ROUTE TỰ ĐỘNG SINH ĐỀ THI TOÁN THPT - ĐÃ XỬ LÝ LÀM SẠCH CHUỖI JSON CHỐNG LỖI 500
app.post('/api/generate-exam', async (req, res) => {
  try {
    const { config, student } = req.body;
    const grade = String(config?.grade || '12');
    const title = config?.title || `BÀI KIỂM TRA TOÁN ${grade} - GDPT 2018`;
    const outcomes = (config?.selectedOutcomes || []).join('; ');

    let gradeConstraint = '';
    if (grade === '10') {
      gradeConstraint = `
*** QUY ĐỊNH BẮT BUỘC VỀ PHẠM VI KIẾN THỨC TOÁN LỚP 10 ***:
- Đây là đề thi dành riêng cho TOÁN LỚP 10.
- TUYỆT ĐỐI KHÔNG ĐƯỢC sử dụng kiến thức Đạo hàm, Nguyên hàm, Tích phân, Mũ - Logarit, Hình học Oxyz.
- CHỈ ĐƯỢC SỬ DỤNG kiến thức Toán 10: Mệnh đề, Tập hợp, Bất phương trình & Hệ BPT bậc nhất hai ẩn, Hàm số bậc hai, Dấu của tam thức bậc hai, Hệ thức lượng, Vectơ, Tọa độ Oxy, Đại số tổ hợp, Thống kê và Xác suất lớp 10.`;
    } else if (grade === '11') {
      gradeConstraint = `
*** QUY ĐỊNH BẮT BUỘC VỀ PHẠM VI KIẾN THỨC TOÁN LỚP 11 ***:
- Đây là đề thi dành riêng cho TOÁN LỚP 11.
- TUYỆT ĐỐI KHÔNG ĐƯỢC đưa kiến thức Tích phân, Tọa độ không gian Oxyz.
- CHỈ ĐƯỢC SỬ DỤNG kiến thức Toán 11: Hàm số lượng giác & Phương trình lượng giác, Cấp số cộng, Cấp số nhân, Giới hạn, Hàm số liên tục, Hình không gian (Song song, Vuông góc), Mũ & Logarit, Đạo hàm lớp 11, Các quy tắc xác suất.`;
    } else {
      gradeConstraint = `
*** QUY ĐỊNH VỀ PHẠM VI KIẾN THỨC TOÁN LỚP 12 ***:
- Sử dụng các chuyên đề Toán 12: Ứng dụng đạo hàm để khảo sát và vẽ đồ thị hàm số, Nguyên hàm, Tích phân, Tọa độ không gian Oxyz, Thống kê số liệu ghép nhóm, Xác suất có điều kiện và công thức Bayes.`;
    }

    const prompt = `
Bạn là Chuyên gia Khảo thí và Đo lường Giáo dục môn Toán THPT theo Chương trình GDPT 2018 của Bộ GD&ĐT Việt Nam.
Hãy biên soạn một đề kiểm tra chuẩn cấu trúc cho:
- Môn Toán Khối: ${grade}
- Tiêu đề đề thi: ${title}
- Yêu cầu cần đạt: ${outcomes || 'Theo ma trận đặc tả chuẩn môn Toán lớp ' + grade}
${gradeConstraint}

*** NGUYÊN TẮC BẮT BUỘC VỀ BẢNG BIẾN THIÊN & BẢNG XÉT DẤU (THAY THẾ MÔ TẢ CHAY) ***:
1. Các câu hỏi về chiều biến thiên, cực trị, dấu tam thức bậc hai, dấu đạo hàm BẮT BUỘC vẽ bảng trực quan dạng mảng LaTeX:
   "Cho hàm số $y = f(x)$ có bảng biến thiên như sau:
   $$\\begin{array}{c|ccccc}
   x & -\\infty & & 2 & & +\\infty \\\\ \\hline
   f'(x) & & - & 0 & + & \\\\ \\hline
   f(x) & +\\infty & \\searrow & -3 & \\nearrow & +\\infty
   \\end{array}$$"
2. TUYỆT ĐỐI KHÔNG dùng câu văn miêu tả chay.

CẤU TRÚC ĐỀ THI CHUẨN ĐỊNH DẠNG BỘ GD&ĐT (TỔNG CỘNG 22 CÂU - 10 ĐIỂM):
- PHẦN I: Gồm 12 câu trắc nghiệm 4 lựa chọn (A, B, C, D). Mỗi câu đúng 0.25đ (Tổng 3.0đ).
- PHẦN II: Gồm 4 câu trắc nghiệm Đúng / Sai. Mỗi câu gồm 4 ý a, b, c, d (Tổng 4.0đ).
- PHẦN III: Gồm 6 câu trắc nghiệm Trả lời ngắn. Kết quả là số thực có đúng 4 ký tự (Tổng 3.0đ).

Công thức Toán bọc trong dấu $...$.
Hãy trả về DUY NHẤT một chuỗi JSON thuần túy (không kèm Markdown giải thích ngoài JSON):
{
  "title": "${title}",
  "grade": "${grade}",
  "questions": [
    {
      "id": "q1",
      "type": "multiple_choice",
      "level": "NhanBiet",
      "content": "Nội dung câu hỏi Toán ${grade} có công thức $...$ hoặc bảng LaTeX $...$",
      "options": [{"key": "A", "text": "$...$"}, {"key": "B", "text": "$...$"}, {"key": "C", "text": "$...$"}, {"key": "D", "text": "$...$"}],
      "correctAnswer": "A",
      "solution": "Lời giải chi tiết..."
    },
    {
      "id": "q1",
      "type": "true_false",
      "level": "ThongHieu",
      "content": "Câu dẫn Phần II kèm bảng biến thiên / bảng xét dấu nếu có...",
      "statements": [
        {"id": "a", "text": "Mệnh đề 1", "isCorrect": true},
        {"id": "b", "text": "Mệnh đề 2", "isCorrect": false},
        {"id": "c", "text": "Mệnh đề 3", "isCorrect": true},
        {"id": "d", "text": "Mệnh đề 4", "isCorrect": false}
      ],
      "solution": "Lời giải chi tiết..."
    },
    {
      "id": "q1",
      "type": "short_answer",
      "level": "VanDung",
      "content": "Nội dung câu hỏi trả lời ngắn...",
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

    // LÀM SẠCH CHUỖI JSON ĐẢM BẢO KHÔNG BỊ CRASH
    let rawText = response.text || '{}';
    rawText = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
    const firstBrace = rawText.indexOf('{');
    const lastBrace = rawText.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1) {
      rawText = rawText.substring(firstBrace, lastBrace + 1);
    }

    const parsed = JSON.parse(rawText);
    res.json(parsed);
  } catch (error: any) {
    console.error('Lỗi sinh đề AI (chuyển sang chế độ dự phòng):', error);
    // Trả về đối tượng an toàn để frontend tự fallback, không bao giờ báo lỗi 500
    res.json({ error: error.message, fallback: true });
  }
});

app.post('/api/export-docx', async (req, res) => {
  try {
    const { title, content } = req.body;
    const doc = new Document({
      sections: [{ children: [new Paragraph({ children: [new TextRun({ text: title || 'ĐỀ THI TOÁN THPT', bold: true, size: 32 })] })] }],
    });
    const buffer = await Packer.toBuffer(doc);
    res.setHeader('Content-Disposition', 'attachment; filename="DeThiToanTHPT.docx"');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.send(buffer);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(staticDir, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Máy chủ vận hành mượt mà tại cổng: ${PORT}`));
