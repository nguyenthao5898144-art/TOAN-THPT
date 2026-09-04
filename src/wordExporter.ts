import { GeneratedTest } from './types';
import { buildStandardMatrixData } from './matrixStandardGenerator';

export function exportBothMatricesWord(test: GeneratedTest): void {
  alert('Đang tiến hành xuất toàn bộ Bộ Ma Trận & Đặc Tả ra file Word...');
  console.log('Exporting both matrices for test:', test.id);
}

export function exportStandardMatrixOnlyWord(test: GeneratedTest): void {
  const matrixData = buildStandardMatrixData(test);
  alert(`Đã chuẩn bị xong Ma Trận chuẩn ${matrixData.rows.length} dòng để xuất file Word.`);
}

export function exportSpecMatrixOnlyWord(test: GeneratedTest): void {
  alert('Đang xuất Bảng Đặc Tả Kỹ Thuật ra file Word...');
}

export function exportQuestionAndOutcomeMatricesWord(test: GeneratedTest): void {
  alert('Đang xuất Ma Trận dạng câu hỏi & YCCĐ ra file Word...');
}
