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

// ROUTE TỰ ĐỘNG BIÊN SOẠN ĐỀ THI - KHÓA CHẶT 100% THEO MA TRẬN & KHỐI LỚP CỦA GIÁO VIÊN
app.post('/api/generate-exam', async (req, res) => {
  try {
    const { config, student, topicNames, lessonNames } = req.body;
    const grade = String(config?.grade || '12');
    const title = config?.title || `BÀI KIỂM TRA TOÁN ${grade} - GDPT 2018`;
    const outcomes = (config?.selectedOutcomes || []).join('; ');
    const chosenTopics = (topicNames || []).join(', ');
    const chosenLessons = (lessonNames || []).join(', ');

    // 1. RÀO CHẮN KIẾN THỨC CỰC KỲ NGHIÊM NGẶT THEO KHỐI LỚP
    let gradeRule = '';
    if (grade === '11') {
      gradeRule = `
*** CẢNH BÁO QUAN TRỌNG VỀ PHẠM VI KIẾN THỨC TOÁN LỚP 11 ***:
- Đây là đề kiểm tra môn TOÁN LỚP 11 theo Chương trình GDPT 2018.
- TUYỆT ĐỐI NGHIÊM CẤM đưa các câu hỏi về: 
  + Tính đơn điệu của hàm số (đồng biến, nghịch biến bằng đạo hàm f'(x) > 0, f'(x) < 0) - ĐÂY LÀ BÀI 1 TOÁN 12!
  + Cực trị hàm số, Giá trị lớn nhất - nhỏ nhất, Tiệm cận của hàm số - ĐÂY LÀ TOÁN 12!
  + Nguyên hàm, Tích phân, Tọa độ không gian Oxyz - ĐÂY LÀ TOÁN 12!
- CHỈ ĐƯỢC BIÊN SOẠN CÂU HỎI TRONG PHẠM VI TOÁN 11:
  1. Hàm số lượng giác và phương trình lượng giác cơ bản (sin x = m, cos x = m...)
  2. Dãy số, Cấp số cộng (u_n = u_1 + (n-1)d), Cấp số nhân (u_n = u_1 * q^(n-1))
  3. Giới hạn dãy số và Giới hạn hàm số (dạng 0/0, vô cùng / vô cùng), Hàm số liên tục
  4. Hình học không gian 11: Đường thẳng song song, vuông góc mặt phẳng, góc giữa đường thẳng và mặt phẳng
  5. Hàm số mũ và hàm số logarit lớp 11 (tính chất lũy thừa, phương trình logarit cơ bản)
  6. Đạo hàm lớp 11 (định nghĩa đạo hàm, quy tắc tính đạo hàm đa thức, lượng giác, phương trình tiếp tuyến y = f'(x0)(x - x0) + y0)
  7. Các quy tắc tính xác suất (biến cố giao, biến cố hợp, xác suất có điều kiện lớp 11).`;
    } else if (grade === '10') {
      gradeRule = `
*** CẢNH BÁO QUAN TRỌNG VỀ PHẠM VI KIẾN THỨC TOÁN LỚP 10 ***:
- Đây là đề kiểm tra môn TOÁN LỚP 10 theo Chương trình GDPT 2018.
- TUYỆT ĐỐI NGHIÊM CẤM đưa kiến thức Đạo hàm, Tích phân, Lượng giác phức tạp hay Oxyz của lớp 11, 12!
- CHỈ DÙNG KIẾN THỨC TOÁN 10: Mệnh đề, Tập hợp, Bất phương trình bậc nhất 2 ẩn, Hàm số bậc hai, Dấu tam thức bậc hai, Hệ thức lượng trong tam giác, Vectơ, Tọa độ Oxy (đường thẳng, đường tròn), Đại số tổ hợp (hoán vị, chỉnh hợp, tổ hợp), Xác suất lớp 10.`;
    } else {
      gradeRule = `
*** KIẾN THỨC TOÁN LỚP 12 ***:
- Sử dụng các chuyên đề Toán 12: Ứng dụng đạo hàm khảo sát hàm số, Nguyên hàm - Tích phân, Tọa độ Oxyz, Thống kê ghép nhóm, Xác suất có điều kiện và công thức Bayes.`;
    }

    const prompt = `
Bạn là Chuyên gia Khảo thí môn Toán THPT của Bộ GD&ĐT Việt Nam theo Chương trình GDPT 2018.
Nhiệm vụ: Biên soạn một đề kiểm tra chuẩn cấu trúc cho học sinh:
- Môn: Toán Khối ${grade}
- Tiêu đề: ${title}
- Các chuyên đề được giáo viên chọn: ${chosenTopics || 'Theo chương trình Toán ' + grade}
- Các bài học được giáo viên chọn: ${chosenLessons || 'Theo ma trận của giáo viên'}
- Yêu cầu cần đạt: ${outcomes || 'Chuẩn GDPT 2018 môn Toán ' + grade}

${gradeRule}

*** BẮT BUỘC DÙNG BẢNG BIẾN THIÊN HOẶC BẢNG XÉT DẤU DẠNG LATEX CHO CÂU HỎI VỀ HÀM SỐ / DẤU TAM THỨC: ***
TUYỆT ĐỐI KHÔNG viết mô tả chay bằng câu chữ. Phải vẽ bảng bằng \\begin{array}{c|ccccc}...\\end{array}.

CẤU TRÚC ĐỀ THI ĐỊNH DẠNG BỘ GD&ĐT (22 CÂU - 10 ĐIỂM):
- PHẦN I: Gồm 12 câu trắc nghiệm 4 lựa chọn (A, B, C, D), mỗi câu 0.25đ.
- PHẦN II: Gồm 4 câu trắc nghiệm Đúng/Sai, mỗi câu 4 ý a, b, c, d.
- PHẦN III: Gồm 6 câu trắc nghiệm Trả lời ngắn điền đáp số.

Trả về DUY NHẤT một chuỗi JSON thuần túy:
{
  "title": "${title}",
  "grade": "${grade}",
  "questions": [
    {
      "id": "q1",
      "type": "multiple_choice",
      "level": "NhanBiet",
      "topicName": "Tên bài học",
      "content": "Nội dung câu hỏi Toán ${grade} chuẩn xác $...$",
      "options": [{"key": "A", "text": "$...$"}, {"key": "B", "text": "$...$"}, {"key": "C", "text": "$...$"}, {"key": "D", "text": "$...$"}],
      "correctAnswer": "A",
      "solution": "Lời giải chi tiết..."
    },
    {
      "id": "q13",
      "type": "true_false",
      "level": "ThongHieu",
      "topicName": "Tên bài học",
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
      "topicName": "Tên bài học",
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
    console.error('Lỗi sinh đề AI (chuyển sang chế độ chuẩn):', error);
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
