import React, { useState, useEffect } from 'react';
import { getStoredTestBank, deleteTestFromBank, StoredTestItem } from './testBankStorage';
import { FileText, Trash2, Download, Search, Database, Eye } from 'lucide-react';

interface QuestionBankManagerProps {
  onSelectTest?: (test: any) => void;
}

export const QuestionBankManager: React.FC<QuestionBankManagerProps> = ({ onSelectTest }) => {
  const [testList, setTestList] = useState<StoredTestItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadTests();
  }, []);

  const loadTests = () => {
    const stored = getStoredTestBank();
    setTestList(stored);
  };

  const handleDelete = (id: string) => {
    if (confirm('Thầy có chắc chắn muốn xóa mục này khỏi ngân hàng đề không?')) {
      deleteTestFromBank(id);
      loadTests();
    }
  };

  const filteredTests = testList.filter(item => 
    item.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.topicName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 bg-slate-50 min-h-screen text-slate-800">
      {/* Header Toolbar */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 text-slate-900">
            <Database className="w-7 h-7 text-blue-600" />
            Ngân Hàng Đề & Ma Trận Đã Lưu
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Quản lý, xem lại và xuất bản các đề kiểm tra, ma trận và bảng đặc tả đã lưu.
          </p>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm kiếm theo tên, chủ đề..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm text-slate-800"
          />
        </div>
      </div>

      {/* Table Data List */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {filteredTests.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <FileText className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-lg font-bold text-slate-700">Chưa có dữ liệu trong Ngân hàng đề</h3>
            <p className="text-sm text-slate-500">Hãy tạo đề thi hoặc lưu ma trận từ màn hình biên soạn để hiển thị ở đây.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <th className="p-4">STT</th>
                  <th className="p-4">Tên Hiển Thị / Tiêu Đề</th>
                  <th className="p-4">Mã Định Danh (File)</th>
                  <th className="p-4 text-center">Khối</th>
                  <th className="p-4 text-center">Số Câu</th>
                  <th className="p-4">Ngày Lưu</th>
                  <th className="p-4 text-center">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredTests.map((item, index) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-semibold text-slate-600 text-center">{index + 1}</td>
                    <td className="p-4 font-bold text-slate-900">
                      {item.displayName}
                      <div className="text-xs text-slate-400 font-normal mt-0.5">Chủ đề: {item.topicName}</div>
                    </td>
                    <td className="p-4 font-mono text-xs text-blue-600">{item.fileName}</td>
                    <td className="p-4 text-center font-semibold">
                      <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs">
                        {item.grade}
                      </span>
                    </td>
                    <td className="p-4 text-center font-semibold text-slate-700">{item.totalQuestions} câu</td>
                    <td className="p-4 text-xs text-slate-500">
                      {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {onSelectTest && (
                          <button
                            onClick={() => onSelectTest(item.test)}
                            title="Xem chi tiết"
                            className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(item.id)}
                          title="Xóa mục này"
                          className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionBankManager;
