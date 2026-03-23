import { useSearchParams } from 'react-router-dom';

export function Receipts() {
  const [searchParams] = useSearchParams();
  const receiptId = searchParams.get('receiptId');

  return (
    <div className="min-h-screen w-full bg-slate-50 flex flex-col">
      <main className="flex-1 w-full bg-white px-6 py-10 space-y-6 flex flex-col">
        <div className="flex items-center justify-center w-16 h-16 bg-rose-50 text-rose-600 rounded-full mb-2 mx-auto">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-slate-800 text-center tracking-tight">영수증 관리</h1>
        
        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
          <p className="text-xs text-slate-400 font-semibold mb-2 uppercase tracking-wide">수신된 파라미터</p>
          <div className="flex flex-col space-y-1">
            <span className="text-sm font-medium text-slate-500">receiptId</span>
            <span className="text-xl font-bold text-rose-600 truncate">{receiptId || '없음'}</span>
          </div>
        </div>
        
        <p className="text-center text-sm text-slate-400 mt-4">
          제출된 영수증 내역을 확인합니다.
        </p>
      </main>
    </div>
  );
}
