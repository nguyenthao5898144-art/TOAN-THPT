export function generateUniqueTestForStudent(config: any, student: any) {
    return {
        success: true,
        message: "Hệ thống đang khởi tạo đề thi",
        questions: []
    };
}

export function createDefaultTest(config: any) {
    return { questions: [], metadata: { createdAt: new Date().toISOString() } };
}

export function deduplicateAllQuestions(questions: any) {
    if (!Array.isArray(questions)) return [];
    return questions.filter((q, index, self) => index === self.findIndex((t) => t.id === q.id));
}

export function alignQuestionsToOutcomeMatrix(questions: any, matrix: any) {
    return questions;
}
