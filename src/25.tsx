{/* Bộ chọn Khối lớp 10, 11, 12 */}
<div className="flex items-center gap-2 p-1.5 bg-slate-900 rounded-2xl border border-slate-800 text-xs mb-4">
  <span className="text-slate-400 font-bold px-2 flex items-center gap-1">
    <BookOpen className="w-3.5 h-3.5 text-blue-400" /> Khối lớp:
  </span>
  <button
    type="button"
    onClick={() => handleSwitchGrade('10')}
    className={`px-4 py-2 rounded-xl font-black transition-all cursor-pointer ${
      selectedGrade === '10' ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-300 hover:bg-slate-800'
    }`}
  >
    📘 TOÁN 10
  </button>
  <button
    type="button"
    onClick={() => handleSwitchGrade('11')}
    className={`px-4 py-2 rounded-xl font-black transition-all cursor-pointer ${
      selectedGrade === '11' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-300 hover:bg-slate-800'
    }`}
  >
    📗 TOÁN 11
  </button>
  <button
    type="button"
    onClick={() => handleSwitchGrade('12')}
    className={`px-4 py-2 rounded-xl font-black transition-all cursor-pointer ${
      selectedGrade === '12' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-300 hover:bg-slate-800'
    }`}
  >
    📕 TOÁN 12
  </button>
</div>
