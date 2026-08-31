import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import { deduplicateAllQuestions, createDefaultTest, alignQuestionsToOutcomeMatrix } from './testGenerator.ts';
dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Lazy initialization for Google GenAI client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // API Route: Generate fresh questions and matrix
  app.post('/api/generate-questions', async (req, res) => {
    const { config, promptOverride } = req.body;

    const selectedTopicNames = config?.selectedTopicNames || ['Ứng dụng đạo hàm để khảo sát và vẽ đồ thị của hàm số'];
    const selectedLessonNames = Array.isArray(config?.selectedLessonNames) && config.selectedLessonNames.length > 0
      ? config.selectedLessonNames
      : [config?.selectedLessonName || 'Khảo sát và vẽ đồ thị hàm số'];
    const selectedOutcomes = config?.selectedOutcomes || ['Nhận biết và vận dụng kiến thức Toán lớp 12 GDPT 2018.'];

    const mcqCounts = config?.counts?.multipleChoice || { nhanBiet: 2, thongHieu: 2, vanDung: 0 };
    const tfCounts = config?.counts?.trueFalse || { nhanBiet: 0, thongHieu: 1, vanDung: 1 };
    const saCounts = config?.counts?.shortAnswer || { nhanBiet: 0, thongHieu: 1, vanDung: 1 };

    const outcomeMatrix = config?.outcomeMatrix || {};
    const totalNB_All = mcqCounts.nhanBiet + tfCounts.nhanBiet + saCounts.nhanBiet;
    const totalTH_All = mcqCounts.thongHieu + tfCounts.thongHieu + saCounts.thongHieu;
    const totalVD_All = mcqCounts.vanDung + tfCounts.vanDung + saCounts.vanDung;

    const outcomeBreakdownText = selectedOutcomes.map((o: string, idx: number) => {
      let c = outcomeMatrix[o];
      if (!c) {
        const foundKey = Object.keys(outcomeMatrix).find((k) =>
          k.trim() === o.trim() || k.toLowerCase().includes(o.toLowerCase()) || o.toLowerCase().includes(k.toLowerCase())
        );
        if (foundKey) c = outcomeMatrix[foundKey];
      }
      const nb = c ? c.nhanBiet : Math.floor(totalNB_All / selectedOutcomes.length) + (idx < (totalNB_All % selectedOutcomes.length) ? 1 : 0);
      const th = c ? c.thongHieu : Math.floor(totalTH_All / selectedOutcomes.length) + (idx < (totalTH_All % selectedOutcomes.length) ? 1 : 0);
      const vd = c ? c.vanDung : Math.floor(totalVD_All / selectedOutcomes.length) + (idx < (totalVD_All % selectedOutcomes.length) ? 1 : 0);
      const totalO = nb + th + vd;
      return `  + YCCĐ ${idx + 1} (learningOutcomeIndex: ${idx}): "${o}" -> Cần sinh đúng: ${nb} câu Nhận biết (NhanBiet), ${th} câu Thông hiểu (ThongHieu), ${vd} câu Vận dụng (VanDung) (Tổng: ${totalO} câu)`;
    }).join('\n');

    const prompt = `
Bạn là Trợ lý Khảo sát Trí tuệ Nhân tạo chuyên môn Toán lớp 12 theo Chương trình Giáo dục Phổ thông GDPT 2018 của Bộ Giáo dục và Đạo tạo Việt Nam.

Nhiệm vụ NÒNG CỐT TRỌNG YẾU: Tạo một bộ câu hỏi và ma trận đề thi MỚI HOÀN TOÀN, ĐÚNG CHÍNH XÁC NỘI DUNG CHỦ ĐỀ, BÀI HỌC VÀ CẤU TRÚC MỨC ĐỘ NHẬN THỨC THEO YÊU CẦU DƯỚI ĐÂY.

1. YÊU CẦU CHỦ ĐỀ VÀ BÀI HỌC (BẮT BUỘC 100% CÂU HỎI PHẢI THUỘC CÁC CHỦ ĐỀ VÀ BÀI HỌC DƯỚI ĐÂY):
- Chủ đề đã chọn (${selectedTopicNames.length} chủ đề): ${selectedTopicNames.join('; ')}
- Bài học đã chọn (${selectedLessonNames.length} bài học):
${selectedLessonNames.map((l: string, idx: number) => `  + Bài ${idx + 1}: ${l}`).join('\n')}
- Yêu cầu cần đạt (YCCĐ - CT 2018) của các bài học đã chọn:
${selectedOutcomes.map((o: string, idx: number) => `  + YCCĐ ${idx + 1}: ${o}`).join('\n')}

2. BẢNG PHÂN BỔ SỐ CÂU CHI TIẾT THEO TỪNG YÊU CẦU CẦN ĐẠT (YCCĐ) - BẮT BUỘC TUÂN THỦ 100% (KHÔNG LỆCH SỐ CÂU THEO MỨC ĐỘ, KHÔNG LỆCH THEO YCCĐ):
${outcomeBreakdownText}

3. QUY ĐỊNH SỐ LƯỢNG VÀ MỨC ĐỘ NHẬN THỨC THEO DẠNG CÂU HỎI:
- Mức độ bao gồm 3 cấp: 'NhanBiet' (Nhận biết), 'ThongHieu' (Thông hiểu), 'VanDung' (Vận dụng).

a) PHẦN I. Trắc nghiệm 4 lựa chọn (type: 'multiple_choice'):
   - Số câu 'NhanBiet': ${mcqCounts.nhanBiet} câu
   - Số câu 'ThongHieu': ${mcqCounts.thongHieu} câu
   - Số câu 'VanDung': ${mcqCounts.vanDung} câu

b) PHẦN II. Trắc nghiệm Đúng/Sai (type: 'true_false', gồm 4 phát biểu độc lập a, b, c, d):
   - Số câu 'NhanBiet': ${tfCounts.nhanBiet} câu
   - Số câu 'ThongHieu': ${tfCounts.thongHieu} câu
   - Số câu 'VanDung': ${tfCounts.vanDung} câu

c) PHẦN III. Trắc nghiệm trả lời ngắn / Tự luận (type: 'short_answer'):
   - Số câu 'NhanBiet': ${saCounts.nhanBiet} câu
   - Số câu 'ThongHieu': ${saCounts.thongHieu} câu
   - Số câu 'VanDung': ${saCounts.vanDung} câu

4. THÔNG TIN BỔ SUNG KHÁC:
- Loại bài kiểm tra: ${config?.mode === 'kt_dinh_ky' ? 'Kiểm tra Định kỳ (45 phút)' : 'Kiểm tra Cuối bài (15 phút)'}
- Tiêu đề đề thi: "${config?.title || 'ĐỀ KIỂM TRA MÔN TOÁN LỚP 12'}"
- Trường/Đơn vị: "${config?.schoolName || 'TRƯỜNG THPT MAI THANH THẾ'}"
- Ghi chú thêm: "${promptOverride || config?.customInstructions || 'Đảm bảo nội dung sinh động, chính xác toán học, định dạng LaTeX kẹp giữa $'}"

5. QUY CHUẨN ĐỊNH DẠNG VÀ DỮ LIỆU TOÁN HỌC (QUY TẮC BẮT BUỘC):
- Mọi công thức toán học PHẢI dùng LaTeX kẹp trong $...$ (ví dụ: $y = f(x)$, $f'(x) = 0$, $\\vec{a} = (1; 2; 3)$, $\\int_0^1 f(x)dx$).
- QUY TẮC PROMPT TIKZ VÀ XUẤT ẢNH HÌNH VẼ:
  + Khi câu hỏi có hình vẽ (bảng xét dấu, bảng biến thiên, đồ thị hàm số, hình học không gian 3D, hệ tọa độ Oxyz, sơ đồ cây xác suất,...), BẮT BUỘC sinh mã nguồn LaTeX TikZ chuẩn trong trường "tikzCode" và yêu cầu vẽ trong "tikzPrompt".
  + Cú pháp TikZ chuẩn hóa:
    * Bảng biến thiên / Bảng xét dấu: dùng gói tkz-tab (ví dụ: \\begin{tikzpicture} \\tkzTabInit{$x$/1, $y'$/1, $y$/2}{$-\\infty$, $x_1$, $x_2$, $+\\infty$} \\tkzTabLine{, +, 0, -, 0, +, } \\tkzTabVar{-/ $-\\infty$, +/ $y_1$, -/ $y_2$, +/ $+\\infty$} \\end{tikzpicture}).
    * Đồ thị hàm số: dùng \\begin{tikzpicture}[scale=0.8, >=stealth] ... \\draw[->] (-3,0) -- (3,0) node[below] {$x$}; ... \\draw[blue, thick, domain=-2.5:2.5] plot (\\x, {...}); \\end{tikzpicture}.
    * Hình học không gian 3D (hình chóp, lăng trụ, hình hộp, nón, trụ, cầu): dùng các lệnh \\coordinate, \\draw[dashed], \\draw[thick] chuẩn.
    * Hệ tọa độ Oxyz: vẽ 3 trục Ox, Oy, Oz với các vectơ đơn vị $\\vec{i}, \\vec{j}, \\vec{k}$ hoặc tọa độ điểm/mặt phẳng.
  + Hệ thống sẽ tự động chuyển đổi mã TikZ thành ảnh sắc nét và chèn ảnh ngay tại đúng vị trí hình vẽ trong câu hỏi và lời giải khi xuất file Word.
- QUY TẮC KÝ HIỆU TOÁN HỌC VIỆT NAM:
  + Khi giải phương trình, phương trình tích, tìm nghiệm đạo hàm $y' = 0$ (phép toán HOẶC / tuyển nghiệm của một biến $x$), BẮT BUỘC dùng ngoặc vuông $\\left[\\begin{array}{l} x = x_1 \\\\ x = x_2 \\end{array}\\right.$ hoặc viết rõ '$x = x_1$ hoặc $x = x_2$'.
  + TUYỆT ĐỐI CẤM dùng ngoặc nhọn $\\begin{cases} x = x_1 \\\\ x = x_2 \\end{cases}$ khi liệt kê các nghiệm của cùng một phương trình (vì ngoặc nhọn là hệ phương trình / phép VÀ, một biến không thể vừa bằng $x_1$ vừa bằng $x_2$).
  + Dấu ngoặc nhọn $\\begin{cases} ... \\end{cases}$ CHỈ ĐƯỢC DÙNG cho hệ phương trình nhiều biến ($x, y, z$) hoặc hệ điều kiện giao nhau.
  + TUYỆT ĐỐI KHÔNG dùng thẻ HTML như <br> hay <p> trong văn bản câu hỏi và lời giải. Sử dụng xuống dòng \\n tự nhiên.
  + QUY TẮC BẢNG XÉT DẤU VÀ BẢNG BIẾN THIÊN TRONG LỜI GIẢI:
    * Bảng xét dấu: Chỉ gồm các dòng cần thiết (dòng $x$, dòng các nhân tử nếu có, và dòng $y'$ hoặc $f'(x)$), TUYỆT ĐỐI KHÔNG sinh dòng $y$ rỗng nếu không có giá trị hàm số.
    * ĐỒNG BỘ CỘT TRONG BẢNG XÉT DẤU: Mọi dòng trong cùng một bảng xét dấu PHẢI CÓ CHÍNH XÁC CÙNG SỐ LƯỢNG CỘT. Dòng $x$ bắt đầu bằng $-\infty$ và kết thúc bằng $+\infty$. Các số $0$ ở các dòng nhân tử và dòng đạo hàm phải thẳng hàng tuyệt đối với nghiệm tương ứng trên dòng $x$.
    * ĐÚNG DẤU TOÁN HỌC: Kiểm tra kỹ quy tắc nhân dấu (nghiệm bội lẻ đổi dấu, nghiệm bội chẵn không đổi dấu).
    * Định dạng bảng Markdown chuẩn 1 dòng đạo hàm:
      | x | -\\infty | x_1 | x_2 | +\\infty |
      | y' | + | 0 | - | 0 | + |
    * Định dạng bảng Markdown chuẩn nhiều dòng nhân tử:
      | x | -\\infty | x_1 | x_2 | +\\infty |
      | x - x_1 | - | 0 | + | + | + |
      | x - x_2 | - | - | - | 0 | + |
      | f'(x) | + | 0 | - | 0 | + |
- Với các câu hỏi có đồ thị hoặc bảng biến thiên, ưu tiên tham chiếu hoặc chọn các mẫu đồ thị/bảng biến thiên có sẵn trong thư viện:
  + 'bbt_bac3_1': Bảng biến thiên hàm bậc ba 2 cực trị tại x = -1, x = 1.
  + 'bbt_trungphuong_1': Bảng biến thiên hàm trùng phương 3 cực trị x = -1, 0, 1.
  + 'graph_bac3_1': Đồ thị hàm số bậc ba y = x^3 - 3x + 1 có cực đại (-1; 3), cực tiểu (1; -1).
  + 'graph_nhatbien_1': Đồ thị hàm nhất biến y = (2x - 1)/(x + 1) tiệm cận x = -1, y = 2.
  + 'graph_oblique_1': Đồ thị hàm tiệm cận xiên y = x + 1/(x-1) tiệm cận đứng x = 1, tiệm cận xiên y = x.
  + 'graph_fprime_1': Đồ thị hàm số đạo hàm y = f'(x) cắt Ox tại x = -2, 1, 3.
- Mọi câu hỏi có đồ thị hoặc bảng biến thiên trong BẤT KỲ ĐỀ THI NÀO đều PHẢI DÙNG KHÁC NHAU 100% diagramId. CẤM DÙNG TRÙNG diagramId CHO 2 CÂU HỎI TRONG CÙNG MỘT ĐỀ THI.
- Mỗi câu hỏi trong danh sách "questions" PHẢI ghi chính xác:
  + "topicName": "${selectedTopicNames[0] || 'Toán 12'}"
  + "lessonName": "${selectedLessonNames[0] || 'Khảo sát hàm số'}"
  + "level": Trị số chính xác là 'NhanBiet' hoặc 'ThongHieu' hoặc 'VanDung' theo phân bổ số lượng ở trên.
  + "learningOutcomeIndex": Chỉ số YCCĐ số (0, 1, 2...).
  + "learningOutcome": Trích dẫn đúng câu văn của YCCĐ tương ứng từ danh sách ở mục 2.
- Mảng "matrix" gồm 1 phần tử tóm tắt ma trận cho các bài "${selectedLessonNames.join('; ')}" khớp tổng số câu từng mức độ.

6. QUY ĐỊNH CỰC KỲ NGHIÊM NGẶT VỀ CHỐNG TRÙNG LẶP CÂU HỎI:
- TẤT CẢ các câu hỏi trong đề thi PHẢI HOÀN TOÀN DUY NHẤT VÀ KHÔNG LẶP LẠI NỘI DUNG.
- Mỗi câu hỏi PHẢI dùng một hàm số/biểu thức/con số riêng biệt.
- Dạng Đúng/Sai (type: 'true_false'): 4 phát biểu a, b, c, d của từng câu hỏi phải độc lập, mới mẻ và toán học chính xác.
- Dạng Trả lời ngắn (type: 'short_answer'): Đáp số (correctAnswer) bắt buộc là MỘT CON SỐ CHÍNH XÁC dài TỐI ĐA 4 KÝ TỰ (ví dụ: '12', '-0.5', '3.25', '2026', '-1.5', '0.75'). Không được kèm chữ hay đơn vị vào trường correctAnswer.
`;

    const modelsToTry = ['gemini-2.5-flash', 'gemini-3.6-flash', 'gemini-2.0-flash'];
    let parsedData: any = null;
    const ai = getGeminiClient();

    if (ai) {
      for (const modelName of modelsToTry) {
        try {
          const response = await ai.models.generateContent({
            model: modelName,
            contents: prompt,
            config: {
              responseMimeType: 'application/json',
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  schoolName: { type: Type.STRING },
                  academicYear: { type: Type.STRING },
                  durationMinutes: { type: Type.INTEGER },
                  questions: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        id: { type: Type.STRING },
                        type: { type: Type.STRING, description: 'multiple_choice | true_false | short_answer' },
                        topicId: { type: Type.STRING },
                        topicName: { type: Type.STRING },
                        lessonId: { type: Type.STRING },
                        lessonName: { type: Type.STRING },
                        level: { type: Type.STRING, description: 'NhanBiet | ThongHieu | VanDung' },
                        learningOutcome: { type: Type.STRING },
                        diagramId: { type: Type.STRING, description: 'ID of predefined diagram from bank e.g. bbt_bac3_1, graph_bac3_1, bbt_trungphuong_1, graph_nhatbien_1, graph_oblique_1, graph_fprime_1' },
                        tikzCode: { type: Type.STRING, description: 'LaTeX TikZ code (using tikzpicture or tkzTab) for diagrams, variation tables, graphs, 3D geometry, or Oxyz' },
                        tikzPrompt: { type: Type.STRING, description: 'Short description of what the TikZ figure represents' },
                        content: { type: Type.STRING },
                        options: {
                          type: Type.ARRAY,
                          items: {
                            type: Type.OBJECT,
                            properties: {
                              key: { type: Type.STRING },
                              text: { type: Type.STRING },
                            },
                          },
                        },
                        correctAnswer: { type: Type.STRING },
                        statements: {
                          type: Type.ARRAY,
                          items: {
                            type: Type.OBJECT,
                            properties: {
                              id: { type: Type.STRING },
                              text: { type: Type.STRING },
                              isCorrect: { type: Type.BOOLEAN },
                            },
                          },
                        },
                        solution: { type: Type.STRING },
                      },
                      required: ['id', 'type', 'level', 'content', 'solution'],
                    },
                  },
                  matrix: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        topicName: { type: Type.STRING },
                        lessonName: { type: Type.STRING },
                        learningOutcome: { type: Type.STRING },
                        multipleChoiceCount: {
                          type: Type.OBJECT,
                          properties: {
                            nhanBiet: { type: Type.INTEGER },
                            thongHieu: { type: Type.INTEGER },
                            vanDung: { type: Type.INTEGER },
                          },
                        },
                        trueFalseCount: {
                          type: Type.OBJECT,
                          properties: {
                            nhanBiet: { type: Type.INTEGER },
                            thongHieu: { type: Type.INTEGER },
                            vanDung: { type: Type.INTEGER },
                          },
                        },
                        shortAnswerCount: {
                          type: Type.OBJECT,
                          properties: {
                            nhanBiet: { type: Type.INTEGER },
                            thongHieu: { type: Type.INTEGER },
                            vanDung: { type: Type.INTEGER },
                          },
                        },
                        totalPoints: { type: Type.NUMBER },
                        percentage: { type: Type.NUMBER },
                      },
                    },
                  },
                },
                required: ['questions', 'matrix'],
              },
            },
          });

          const jsonText = response.text || '{}';
          parsedData = JSON.parse(jsonText);
          if (parsedData && Array.isArray(parsedData.questions) && parsedData.questions.length > 0) {
            break;
          }
        } catch (err: any) {
          console.warn(`Model ${modelName} failed/quota exceeded, trying next fallback if available.`);
        }
      }
    }

    if (parsedData && Array.isArray(parsedData.questions) && parsedData.questions.length > 0) {
      const aligned = alignQuestionsToOutcomeMatrix(parsedData.questions, config || {});
      parsedData.questions = deduplicateAllQuestions(aligned);
      return res.json({
        success: true,
        data: parsedData,
      });
    }

    // Fallback directly to local high quality question bank generator
    const fallbackTest = createDefaultTest(config || {});
    return res.json({
      success: true,
      data: fallbackTest,
      isFallback: true,
      warning: 'Đã tự động sử dụng Ngân hàng câu hỏi chuẩn GDPT 2018.',
    });
  });

  // API Route: Assistant Chat
  app.post('/api/chat-assistant', async (req, res) => {
    try {
      const { message, currentTest } = req.body;
      const ai = getGeminiClient();

      if (!ai) {
        return res.json({
          success: true,
          reply: 'Chưa cài đặt API key. Bạn vẫn có thể sử dụng các tính năng tạo đề từ Ngân hàng câu hỏi, xuất Word và xem slide trình chiếu bình thường.',
        });
      }

      const prompt = `
Bạn là Trợ lý Khảo sát Trí tuệ Nhân tạo chuyên môn Toán lớp 12 GDPT 2018.
Lời nhắn người dùng: "${message}"

Hiện tại đề thi có: ${currentTest?.questions?.length || 0} câu hỏi.

Hãy đưa ra câu trả lời ngắn gọn, chuẩn chuyên môn, hỗ trợ người dùng phân tích ma trận đề thi, tư vấn ma trận phù hợp với kiểm tra 15 phút hoặc 45 phút/học kỳ theo đúng định hướng GDPT 2018. Nếu người dùng yêu cầu tạo mới câu hỏi, hãy khuyên họ bấm nút "[1] KT ĐỊNH KỲ; KT CUỐI BÀI: Tạo câu hỏi" hoặc sử dụng lệnh tạo mới.
`;

      const modelsToTry = ['gemini-2.5-flash', 'gemini-3.6-flash'];
      let replyText = '';

      for (const modelName of modelsToTry) {
        try {
          const response = await ai.models.generateContent({
            model: modelName,
            contents: prompt,
          });
          if (response.text) {
            replyText = response.text;
            break;
          }
        } catch (err: any) {
          console.warn(`Chat model ${modelName} call failed, trying fallback.`);
        }
      }

      if (!replyText) {
        replyText = 'Hệ thống AI hiện đang trong thời gian chờ lượt gọi (Quota 429). Bạn có thể tự do bấm nút "TẠO CÂU HỎI TỪ NGÂN HÀNG" hoặc tùy chỉnh Ma trận đề thi trực tiếp trên giao diện!';
      }

      res.json({
        success: true,
        reply: replyText,
      });
    } catch (error: any) {
      res.json({
        success: true,
        reply: 'Hệ thống AI hiện tạm thời bận. Bạn hãy bấm nút "TẠO CÂU HỎI TỪ NGÂN HÀNG" để nhận ngay bộ đề thi chuẩn nhé!',
      });
    }
  });

  // API Route: Parse questions from uploaded file text (.doc, .docx, .pdf, .txt)
  app.post('/api/parse-uploaded-file', async (req, res) => {
    try {
      const { fileText, fileName } = req.body;
      const ai = getGeminiClient();

      if (!ai) {
        return res.status(500).json({ error: 'Chưa cấu hình GEMINI_API_KEY.' });
      }

      if (!fileText || fileText.trim().length === 0) {
        return res.status(400).json({ error: 'Nội dung file trống.' });
      }

      const prompt = `
Bạn là Chuyên gia Trí tuệ Nhân tạo Đánh giá Khảo sát Môn Toán lớp 12 - Chương trình GDPT 2018.
Nhiệm vụ TRỌNG TÂM: Phân tích kỹ lưỡng TOÀN BỘ văn bản tài liệu/đề thi tải lên từ "${fileName || 'các file tài liệu'}" và trích xuất/chuyển đổi CHÍNH XÁC 100% TẤT CẢ các câu hỏi có trong tài liệu thành cấu trúc Ngân Hàng Câu Hỏi. KHÔNG BỎ SÓT BẤT KỲ CÂU HỎI NÀO.

NỘI DUNG VĂN BẢN TẢI LÊN:
"""
${fileText}
"""

QUY CHUẨN BẮT BUỘC KHI PHÂN TÍCH VÀ PHÂN LOẠI:
1. PHÂN MỨC ĐỘ NHẬN THỨC KHOA HỌC:
   - "NhanBiet" (NB - Nhận biết): Câu hỏi kiểm tra định nghĩa, công thức trực tiếp, nhận biết đồ thị/BBT cơ bản.
   - "ThongHieu" (TH - Thông hiểu): Câu hỏi yêu cầu biến đổi 1-2 bước, giải phương trình/bất phương trình cơ bản, tìm tiệm cận, cực trị, góc/khoảng cách đơn giản.
   - "VanDung" (VD - Vận dụng / Vận dụng cao): Câu hỏi bài toán thực tế, tham số m, tổng hợp nhiều kiến thức, hình học không gian phức tạp.

2. TÁCH THEO CHỦ ĐỀ (topicName) VÀ BÀI HỌC (lessonName) TOÁN 12 GDPT 2018:
   - Tự động gán chính xác Chủ đề (Ví dụ: "Ứng dụng đạo hàm để khảo sát và vẽ đồ thị của hàm số", "Nguyên hàm và Tích phân", "Phương pháp tọa độ trong không gian (Oxyz)", "Các số đặc trưng đo độ đao cho mẫu số liệu ghép nhóm", "Xác suất có điều kiện").
   - Tự động gán Bài học tương ứng (Ví dụ: "Tính đơn điệu của hàm số", "Giá trị lớn nhất và giá trị nhỏ nhất", "Khảo sát và vẽ đồ thị của hàm số", "Nguyên hàm", "Tích phân", "Tọa độ của vectơ đối với hệ trục tọa độ Oxyz").

3. YÊU CẦU CẦN ĐẠT (learningOutcome):
   - Tự động diễn giải YCCĐ chuẩn GDPT 2018 cho từng câu hỏi (Ví dụ: "Nhận biết được tính đơn điệu của hàm số thông qua bảng biến thiên", "Tính được tích vô hướng của hai véctơ trong không gian").

4. DẠNG CÂU HỎI (type):
   - "multiple_choice": Trắc nghiệm 4 lựa chọn A, B, C, D.
   - "true_false": Trắc nghiệm Đúng/Sai gồm 4 ý a, b, c, d.
   - "short_answer": Trắc nghiệm trả lời ngắn hoặc Tự luận.

5. CÔNG THỨC TOÁN HỌC:
   - BẮT BUỘC đưa tất cả biểu thức toán, phương trình, số liệu toán học về định dạng LaTeX chuẩn và kẹp trong cặp dấu $...$ (Ví dụ: $y = x^3 - 3x^2 + 1$, $x \in (0; +\infty)$, $f'(x) = 0$).
   - Ký hiệu toán học Việt Nam: Khi giải phương trình tích, tìm nghiệm đạo hàm $y' = 0$ (phép toán HOẶC / tuyển nghiệm của một biến $x$), BẮT BUỘC dùng ngoặc vuông $\\left[\\begin{array}{l} x = x_1 \\\\ x = x_2 \\end{array}\\right.$ hoặc viết rõ '$x = x_1$ hoặc $x = x_2$'. TUYỆT ĐỐI KHÔNG dùng ngoặc nhọn $\\begin{cases} ... \\end{cases}$ khi liệt kê các nghiệm của phương trình.

6. ĐÁP ÁN & LỜI GIẢI CHI TIẾT:
   - Nếu đề file có sẵn lời giải/đáp án thì trích xuất. Nếu chưa có, AI hãy tự động giải chi tiết và đưa ra đáp án chính xác theo đúng chuyên môn Toán 12.
`;

      const modelsToTry = ['gemini-2.5-flash', 'gemini-3.6-flash'];
      let parsedData: any = null;

      for (const modelName of modelsToTry) {
        try {
          const response = await ai.models.generateContent({
            model: modelName,
            contents: prompt,
            config: {
              responseMimeType: 'application/json',
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  questions: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        id: { type: Type.STRING },
                        type: { type: Type.STRING, description: 'multiple_choice | true_false | short_answer' },
                        topicName: { type: Type.STRING },
                        lessonName: { type: Type.STRING },
                        level: { type: Type.STRING, description: 'NhanBiet | ThongHieu | VanDung' },
                        learningOutcome: { type: Type.STRING },
                        content: { type: Type.STRING },
                        options: {
                          type: Type.ARRAY,
                          items: {
                            type: Type.OBJECT,
                            properties: {
                              key: { type: Type.STRING },
                              text: { type: Type.STRING },
                            },
                          },
                        },
                        correctAnswer: { type: Type.STRING },
                        statements: {
                          type: Type.ARRAY,
                          items: {
                            type: Type.OBJECT,
                            properties: {
                              id: { type: Type.STRING },
                              text: { type: Type.STRING },
                              isCorrect: { type: Type.BOOLEAN },
                            },
                          },
                        },
                        solution: { type: Type.STRING },
                      },
                      required: ['type', 'content'],
                    },
                  },
                },
                required: ['questions'],
              },
            },
          });

          if (response.text) {
            parsedData = JSON.parse(response.text);
            if (parsedData && Array.isArray(parsedData.questions)) {
              break;
            }
          }
        } catch (err: any) {
          console.warn(`Parse file model ${modelName} call failed, trying fallback.`);
        }
      }

      if (parsedData && Array.isArray(parsedData.questions)) {
        return res.json({ success: true, questions: parsedData.questions });
      }

      res.status(429).json({
        success: false,
        error: 'Hệ thống AI đạt giới hạn lượt gọi tạm thời. Vui lòng thử lại sau ít phút.',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Không thể phân tích file câu hỏi bằng AI.',
      });
    }
  });

  // Vite middleware for development vs static serve for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
