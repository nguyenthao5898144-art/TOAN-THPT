import { Question } from '../types';
import { DIAGRAM_BANK } from '../data/diagramBank';
import { hasUnknownParameters } from './mathGraphParser';

export type VisualType = 'bbt' | 'dothi' | 'bang_giatri' | 'hinh_ve';

export interface VisualBadge {
  type: VisualType;
  label: string;
  icon: string;
  colorClass: string;
}

export interface VisualDetectionResult {
  hasVisual: boolean;
  types: VisualType[];
  badges: VisualBadge[];
}

/**
 * Detects whether a question contains or requires visual elements:
 * - Bảng biến thiên (BBT)
 * - Đồ thị hàm số
 * - Bảng giá trị / Bảng thống kê, xác suất
 * - Hình vẽ & sơ đồ hình học
 */
export function detectQuestionVisuals(q: Question): VisualDetectionResult {
  const text = (
    q.content +
    ' ' +
    (q.solution || '') +
    ' ' +
    (q.type === 'multiple_choice'
      ? q.options.map((o) => o.text).join(' ')
      : q.type === 'true_false'
      ? q.statements.map((s) => s.text).join(' ')
      : '')
  ).toLowerCase();

  const typesSet = new Set<VisualType>();
  const isParametric = hasUnknownParameters(q.content);

  // Explicit diagramId check
  if (q.diagramId) {
    if (q.diagramId.startsWith('formula:')) {
      const form = q.diagramId.replace('formula:', '');
      if (!hasUnknownParameters(form) && !isParametric) {
        typesSet.add('dothi');
      }
    } else if (q.diagramId.includes('bbt')) {
      if (!isParametric) typesSet.add('bbt');
    } else if (q.diagramId.includes('graph')) {
      if (!isParametric) typesSet.add('dothi');
    }
  }

  // Explicit imageUrl check
  if (q.imageUrl) {
    typesSet.add('hinh_ve');
  }

  // Explicit tableData check
  if (q.tableData) {
    typesSet.add('bang_giatri');
  }

  const contentLower = q.content.toLowerCase();
  const hasFigureRef =
    contentLower.includes('như hình vẽ') ||
    contentLower.includes('như hình bên') ||
    contentLower.includes('như hình dưới') ||
    contentLower.includes('cho hình vẽ') ||
    contentLower.includes('trong hình vẽ') ||
    contentLower.includes('cho đồ thị như hình') ||
    contentLower.includes('có đồ thị như hình') ||
    contentLower.includes('bảng biến thiên như hình') ||
    contentLower.includes('có bảng biến thiên như hình') ||
    contentLower.includes('bảng biến thiên sau') ||
    contentLower.includes('bảng biến thiên như sau') ||
    contentLower.includes('bảng biến thiên dưới đây') ||
    contentLower.includes('bảng biến thiên bên dưới') ||
    contentLower.includes('có bảng biến thiên') ||
    contentLower.includes('cho bảng biến thiên') ||
    contentLower.includes('bảng xét dấu sau') ||
    contentLower.includes('bảng xét dấu như sau') ||
    contentLower.includes('bảng xét dấu dưới đây') ||
    contentLower.includes('bảng xét dấu bên dưới') ||
    contentLower.includes('có bảng xét dấu') ||
    contentLower.includes('cho bảng xét dấu') ||
    contentLower.includes('đường cong trong hình') ||
    contentLower.includes('hình bên là đồ thị') ||
    contentLower.includes('hình vẽ bên là đồ thị') ||
    contentLower.includes('hình bên') ||
    contentLower.includes('hình vẽ') ||
    contentLower.includes('đồ thị cho ở hình') ||
    contentLower.includes('đồ thị sau') ||
    contentLower.includes('đồ thị như sau') ||
    contentLower.includes('đồ thị dưới đây') ||
    contentLower.includes('có đồ thị sau') ||
    contentLower.includes('cho đồ thị sau');

  // Keyword check: Bảng biến thiên (only if not parametric or has explicit figure ref)
  if (!isParametric || hasFigureRef) {
    if (
      contentLower.includes('bảng biến thiên như hình') ||
      (hasFigureRef && (contentLower.includes('bảng biến thiên') || contentLower.includes('bbt')))
    ) {
      typesSet.add('bbt');
    }
  }

  // Keyword check: Đồ thị (only if not parametric or has explicit figure ref)
  if (!isParametric || hasFigureRef) {
    if (
      contentLower.includes('đồ thị như hình') ||
      contentLower.includes('đường cong trong hình') ||
      (hasFigureRef && (contentLower.includes('đồ thị') || contentLower.includes("f'(x)")))
    ) {
      typesSet.add('dothi');
    }
  }

  // Keyword check: Bảng giá trị / Thống kê / Xác suất
  if (
    q.tableData ||
    contentLower.includes('bảng giá trị') ||
    contentLower.includes('bảng số liệu') ||
    contentLower.includes('bảng thống kê') ||
    contentLower.includes('bảng tần số') ||
    contentLower.includes('mẫu số liệu ghép nhóm')
  ) {
    typesSet.add('bang_giatri');
  }

  // Keyword check: Hình vẽ / Hình học / Sơ đồ
  if (
    text.includes('hình vẽ') ||
    text.includes('hình bên') ||
    text.includes('cho hình chóp') ||
    text.includes('cho hình lăng trụ') ||
    text.includes('cho hình hộp') ||
    text.includes('cho khối chóp') ||
    text.includes('cho khối lăng trụ') ||
    text.includes('cho khối nón') ||
    text.includes('cho khối trụ') ||
    text.includes('cho khối cầu') ||
    text.includes('cho tam giác') ||
    text.includes('sơ đồ')
  ) {
    typesSet.add('hinh_ve');
  }

  const types = Array.from(typesSet);
  const badges: VisualBadge[] = types.map((type) => {
    switch (type) {
      case 'bbt':
        return {
          type,
          label: 'Bảng biến thiên',
          icon: '📊',
          colorClass: 'bg-purple-100 text-purple-800 border-purple-200',
        };
      case 'dothi':
        return {
          type,
          label: 'Đồ thị hàm số',
          icon: '📈',
          colorClass: 'bg-blue-100 text-blue-800 border-blue-200',
        };
      case 'bang_giatri':
        return {
          type,
          label: 'Bảng giá trị (Thống kê/Xác suất)',
          icon: '📋',
          colorClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        };
      case 'hinh_ve':
        return {
          type,
          label: 'Hình vẽ & Sơ đồ',
          icon: '📐',
          colorClass: 'bg-amber-100 text-amber-800 border-amber-200',
        };
    }
  });

  return {
    hasVisual: types.length > 0,
    types,
    badges,
  };
}

/**
 * Filter questions based on visual categories
 */
export function filterQuestionsByVisualCategory(
  questions: Question[],
  filterMode: 'all' | 'has_visual' | VisualType
): Question[] {
  if (filterMode === 'all') return questions;

  return questions.filter((q) => {
    const res = detectQuestionVisuals(q);
    if (filterMode === 'has_visual') return res.hasVisual;
    return res.types.includes(filterMode);
  });
}
