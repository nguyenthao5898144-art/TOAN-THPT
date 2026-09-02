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
      return res.json({ text: 'Xin chào Thầy/Cô! Vui lòng nhập nội dung cần hỗ trợ.' });
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

// ROUTE TỰ ĐỘNG BIÊN SOẠN ĐỀ THI BÁM SÁT MA TRẬN & KHỐI LỚP (CÓ BẢNG BIẾN THIÊN / BẢNG XÉT DẤU)
app.post('/api/generate-exam', async (req, res) => {
  try {
    const { config, student } = req.body;
    const grade = String(config?.grade || '12');
    const title = config?.title || `BÀI KIỂM TRA TOÁN ${grade} - GDPT 2018`;
    const outcomes = (config?.selectedOutcomes || []).join('; ');

    // 1. RÀO CHẮN KIẾN THỨC CHUẨN XÁC THEO TỪNG KHỐI LỚP (GDPT 2018)
    let gradeConstraint = '';
    if (grade === '10') {
      gradeConstraint = `
*** QUY ĐỊNH BẮT BUỘC VỀ PHẠM VI KIẾN THỨC TOÁN LỚP 10 ***:
- Đây là đề thi dành riêng cho TOÁN LỚP 10.
- TUYỆT ĐỐI KHÔNG ĐƯỢC sử dụng kiến thức Đạo hàm, Nguyên hàm, Tích phân, Mũ - Logarit, Hình học Oxyz (đây là kiến thức lớp 11, 12).
- CHỈ ĐƯỢC SỬ DỤNG các chuyên đề Toán 10: Mệnh đề, Tập hợp, Bất phương trình & Hệ BPT bậc nhất hai ẩn, Hàm số bậc hai, Dấu của tam thức bậc hai, Hệ thức lượng trong tam giác, Vectơ, Phương pháp tọa độ trong mặt phẳng Oxy (Đường thẳng, Đường tròn, Ba đường conic), Đại số tổ hợp, Thống kê và Xác suất lớp 10.`;
    } else if (grade === '11') {
      gradeConstraint = `
*** QUY ĐỊNH BẮT BUỘC VỀ PHẠM VI KIẾN THỨC TOÁN LỚP 11 ***:
- Đây là đề thi dành riêng cho TOÁN LỚP 11.
- TUYỆT ĐỐI KHÔNG ĐƯỢC đưa kiến thức Tích phân, Khảo sát hàm số nâng cao, Tọa độ không gian Oxyz (kiến thức lớp 12).
- CHỈ ĐƯỢC SỬ DỤNG các chuyên đề Toán 11: Hàm số lượng giác & Phương trình lượng giác, Cấp số cộng, Cấp số nhân, Giới hạn dãy số & hàm số, Hàm số liên tục, Hình không gian (Quan hệ song song, Quan hệ vuông góc, Góc & Khoảng cách), Mũ & Logarit, Đạo hàm lớp 11, Các quy tắc tính xác suất.`;
    } else {
      gradeConstraint = `
*** QUY ĐỊNH VỀ PHẠM VI KIẾN THỨC TOÁN LỚP 12 ***:
- Sử dụng các chuyên đề Toán 12: Ứng dụng đạo hàm để khảo sát và vẽ đồ thị hàm số, Nguyên hàm, Tích phân và Ứng dụng hình học, Phương pháp tọa độ trong không gian Oxyz, Thống kê số liệu ghép nhóm, Xác suất có điều kiện và công thức Bayes.`;
    }

    const prompt = `
Bạn là Chuyên gia Khảo thí và Đo lường Giáo dục môn Toán THPT theo Chương trình GDPT 2018 của Bộ Giáo dục và Đào tạo Việt Nam.
Hãy biên soạn một đề kiểm tra chuẩn cấu trúc cho:
- Đối tượng: Học sinh môn Toán Khối ${grade}.
- Tiêu đề đề thi: ${title}
- Yêu cầu cần đạt (YCCĐ): ${outcomes || 'Theo ma trận đặc tả chuẩn môn Toán lớp ' + grade}
${gradeConstraint}

*** NGUYÊN TẮC BẮT BUỘC VỀ BẢNG BIẾN THIÊN & BẢNG XÉT DẤU (THAY THẾ MÔ TẢ CHAY) ***:
1. Với các câu hỏi về:
   - Dấu tam thức bậc hai, bất phương trình bậc hai (Toán 10)
   - Bảng biến thiên hàm số bậc hai parabol (Toán 10)
   - Xét dấu nhị thức, lượng giác, đạo hàm (Toán 11, 12)
   - Chiều biến thiên, điểm cực trị, giá trị lớn nhất / nhỏ nhất, tiệm cận (Toán 12)
2. TUYỆT ĐỐI KHÔNG dùng câu văn miêu tả chay (ví dụ KHÔNG viết: "Cho hàm số có đạo hàm dương trên khoảng...").
3. BẮT BUỘC PHẢI TRÌNH BÀY BẢNG BIẾN THIÊN HOẶC BẢNG XÉT DẤU TRỰC QUAN bằng cú pháp mảng LaTeX:
   Ví dụ Bảng biến thiên:
   "Cho hàm số $y = f(x)$ có bảng biến thiên như sau:
   $$\\begin{array}{c|ccccc}
   x & -\\infty & & 2 & & +\\infty \\\\ \\hline
   f'(x) & & - & 0 & + & \\\\ \\hline
   f(x) & +\\infty & \\searrow & -3 & \\nearrow & +\\infty
   \\end{array}$$"
   Ví dụ Bảng xét dấu:
   "Cho tam thức bậc hai $f(x)$ có bảng xét dấu như sau:
   $$\\begin{array}{c|ccccccc}
   x & -\\infty & & -1 & & 3 & & +\\infty \\\\ \\hline
   f(x) & & + & 0 & - & 0 & + &
   \\end{array}$$"

CẤU TRÚC ĐỀ THI CHUẨN ĐỊNH DẠNG BỘ GD&ĐT (TỔNG CỘNG 22 CÂU - 10 ĐIỂM):
- PHẦN I: Gồm 12 câu trắc nghiệm 4 lựa chọn (A, B, C, D). Mỗi câu đúng 0.25đ (Tổng 3.0đ).
- PHẦN II: Gồm 4 câu trắc nghiệm Đúng / Sai. Mỗi câu gồm 4 ý a, b, c, d (Tổng 4.0đ).
- PHẦN III: Gồm 6 câu trắc nghiệm Trả lời ngắn. Kết quả là số thực, phân số hoặc số nguyên (Tổng 3.0đ).

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
      "id": "q13",
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
      "id": "q17",
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

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (error: any) {
    console.error('Lỗi sinh đề AI:', error);
    res.status(500).json({ error: error.message || 'Lỗi tạo đề' });
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
app.listen(PORT, () => console.log(`Máy chủ vận hành mượt mà tại cổng kết nối: ${PORT}`));
