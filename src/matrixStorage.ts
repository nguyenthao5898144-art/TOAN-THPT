export interface SavedMatrix {
  id: string;
  title: string;
  grade: string;
  durationMinutes: number;
  createdAt: string;
  folderName: string; // Thêm trường lưu tên thư mục chuẩn xác
  config: any;
  yccdCounts: Record<string, { nb: number; th: number; vd: number }>;
}

const STORAGE_KEY = 'TOAN_THPT_MATRIX_BANK';

export const getSavedMatrices = (): SavedMatrix[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error(e);
    return [];
  }
};

export const saveMatrixToBank = (matrix: Omit<SavedMatrix, 'id' | 'createdAt'>) => {
  const list = getSavedMatrices();
  const newMatrix: SavedMatrix = {
    ...matrix,
    id: 'matrix_' + Date.now(),
    createdAt: new Date().toISOString(),
    folderName: (matrix.folderName || 'CHƯA PHÂN LOẠI').trim().toUpperCase(),
  };
  list.unshift(newMatrix);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  return newMatrix;
};

export const deleteMatrixFromBank = (id: string) => {
  const list = getSavedMatrices().filter((m) => m.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
};
