import React, { useState } from 'react';
import { DatePicker } from '../../components/DatePicker';
import iconCalendar from '../../assets/icon_calendar.png';
import type {
  ReceiptRecord,
  HistoryRecord,
  UseMaintenanceDetailReturn,
} from './useMaintenanceDetail';

// ─── 등록 탭 ─────────────────────────────────────────────────
function RegisterTab({
  mainDate,
  receipts,
  onDateChange,
}: {
  mainDate: string;
  receipts: ReceiptRecord[];
  onDateChange: (date: string) => void;
}) {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const displayDate = mainDate ? mainDate : '';

  return (
    <div style={ts.form}>
      <div style={ts.fixedTop}>
        <div style={ts.fieldGroup}>
          <label style={ts.label}>정비일자 <span style={{ color: '#ef4444' }}>*</span></label>
          <div style={{...ts.inputRow, cursor: 'pointer'}} onClick={() => setShowDatePicker(true)}>
            <input
              style={{...ts.input, cursor: 'pointer'}}
              type="text"
              readOnly
              placeholder="정비일자를 선택해주세요."
              value={displayDate}
            />
            <img
              src={iconCalendar}
              alt="calendar"
              style={ts.iconImg}
            />
          </div>
        </div>

        <div style={ts.fieldGroup}>
          <label style={ts.label}>경비내역</label>
          <button style={ts.addBtn}>정비 영수증 추가 +</button>
          <p style={ts.hint}>* 차량 정비를 위한 경비가 발생한 경우 경비를 등록해주세요.</p>
        </div>
      </div>

      {showDatePicker && (
        <DatePicker
          initialDate={mainDate}
          onConfirm={(date) => {
            onDateChange(date);
            setShowDatePicker(false);
          }}
          onCancel={() => setShowDatePicker(false)}
        />
      )}

      <div style={ts.receiptScroll}>
        {receipts.map((r) => (
          <div key={r.id} style={ts.receiptCard}>
            <div style={ts.receiptTop}>
              <span style={ts.receiptDate}>{r.date}</span>
              <div style={{ display: 'flex', gap: 12 }}>
                <span style={ts.editBtn}>수정</span>
                <span style={ts.deleteBtn}>삭제</span>
              </div>
            </div>
            <div style={ts.receiptShop}>{r.shopName}</div>
            <div style={ts.receiptInfo}>거래금액 : {r.amount.toLocaleString()}원</div>
            <div style={ts.receiptInfo}>가맹점주소 : {r.address}</div>
          </div>
        ))}
      </div>

      <div style={ts.submitWrap}>
        <button style={ts.submitBtn}>등록완료</button>
      </div>
    </div>
  );
}

// ─── 정비내역 탭 ─────────────────────────────────────────────
function HistoryTab({ records }: { records: HistoryRecord[] }) {
  return (
    <div style={ts.historyList}>
      {records.length === 0 && (
        <div style={{ textAlign: 'center', color: '#aaa', padding: 40, fontSize: 14 }}>
          정비 내역이 없습니다.
        </div>
      )}
      {records.map((r) => (
        <div key={r.id} style={ts.historyCard}>
          <div style={ts.historyTop}>
            <span style={ts.historyDate}>{r.date}</span>
            <span style={ts.historyKm}>{r.km.toLocaleString()} km</span>
          </div>
          <div style={ts.historyDesc}>{r.description}</div>
          <div style={ts.historyManager}>담당자 : {r.manager}</div>
        </div>
      ))}
    </div>
  );
}

// ─── View 컴포넌트 (순수 UI) ─────────────────────────────────
export function MaintenanceDetailView({
  item,
  tab,
  mainDate,
  receipts,
  historyRecords,
  onTabChange,
  onDateChange,
  onBack,
}: UseMaintenanceDetailReturn) {
  return (
    <div style={s.container}>

      {/* 헤더 */}
      <div style={s.header}>
        <button style={s.backBtn} onClick={onBack}>‹</button>
        <span style={s.title}>정비항목 상세보기</span>
        <div style={{ width: 32 }} />
      </div>

      {/* 탭 */}
      <div style={s.tabRow}>
        <button
          style={{ ...s.tabBtn, ...(tab === 'register' ? s.tabActive : s.tabInactive) }}
          onClick={() => onTabChange('register')}
        >
          정비등록
        </button>
        <button
          style={{ ...s.tabBtn, ...(tab === 'history' ? s.tabActive : s.tabInactive) }}
          onClick={() => onTabChange('history')}
        >
          정비내역
        </button>
      </div>

      {/* 콘텐츠 */}
      <div style={s.content}>
        <div style={s.itemBadge}>
          <span style={s.itemBadgeText}>{item.name}</span>
          <span style={s.itemBadgeSub}>주기 {item.intervalKm.toLocaleString()}km</span>
        </div>
        {tab === 'register' ? (
          <RegisterTab
            mainDate={mainDate}
            receipts={receipts}
            onDateChange={onDateChange}
          />
        ) : (
          <HistoryTab records={historyRecords} />
        )}
      </div>
    </div>
  );
}

// ─── 스타일 ──────────────────────────────────────────────────
const s: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex', flexDirection: 'column', height: '100vh',
    backgroundColor: '#fff', fontFamily: "'Pretendard','Noto Sans KR',sans-serif",
    overflow: 'hidden',
  },
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '14px 16px', backgroundColor: '#fff', borderBottom: '1px solid #eee', flexShrink: 0,
  },
  backBtn: { fontSize: 24, color: '#333', background: 'none', border: 'none', cursor: 'pointer', padding: '0 4px', lineHeight: 1 },
  title: { fontSize: 16, fontWeight: 700, color: '#111' },
  itemBadge: {
    display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6,
    padding: '3px 16px 1px', flexShrink: 0,
  },
  itemBadgeText: { fontSize: 11, fontWeight: 700, color: '#4f7cff' },
  itemBadgeSub: { fontSize: 11, color: '#9ca3af' },
  tabRow: {
    display: 'flex', backgroundColor: '#f1f5f9',
    margin: '12px 16px', borderRadius: 12, padding: 4, flexShrink: 0,
  },
  tabBtn: {
    flex: 1, padding: '10px 0', fontSize: 14, fontWeight: 600,
    border: 'none', cursor: 'pointer', borderRadius: 10, background: 'none',
    transition: 'all 0.2s',
  },
  tabActive: { backgroundColor: '#fff', color: '#111', boxShadow: '0 1px 4px rgba(0,0,0,0.10)' },
  tabInactive: { backgroundColor: 'transparent', color: '#8e8e93' },
  content: { flex: 1, overflowY: 'auto' as const, display: 'flex', flexDirection: 'column' },
};

const ts: Record<string, React.CSSProperties> = {
  form: { display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' },
  fixedTop: { display: 'flex', flexDirection: 'column', gap: 20, padding: '16px 16px 8px', flexShrink: 0 },
  receiptScroll: {
    flex: 1, overflowY: 'auto' as const,
    padding: '0 16px 8px', display: 'flex', flexDirection: 'column', gap: 10,
  },
  submitWrap: { flexShrink: 0, padding: '8px 16px 16px' },
  fieldGroup: { display: 'flex', flexDirection: 'column', gap: 8 },
  label: { fontSize: 13, fontWeight: 700, color: '#222' },
  inputRow: {
    display: 'flex', alignItems: 'center', gap: 8,
    border: '1px solid #e5e7eb', borderRadius: 10,
    padding: '10px 12px', backgroundColor: '#fff', position: 'relative' as const,
  },
  input: { flex: 1, border: 'none', outline: 'none', fontSize: 14, color: '#333', backgroundColor: 'transparent' },
  iconImg: { width: 20, height: 20, flexShrink: 0, objectFit: 'contain' as const },
  hint: { fontSize: 11, color: '#4f7cff', margin: '2px 0 0' },
  addBtn: {
    padding: '12px 0', fontSize: 14, fontWeight: 600, textAlign: 'center' as const,
    backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: 10,
    cursor: 'pointer', color: '#555',
  },
  receiptCard: {
    backgroundColor: '#fff', borderRadius: 12, padding: '14px 16px',
    border: '1px solid #f1f3f5', boxShadow: '0 4px 16px rgba(0,0,0,0.18)', transition: 'all 0.2s',
  },
  receiptTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  receiptDate: { fontSize: 13, fontWeight: 700, color: '#4D7EFF' },
  editBtn: { fontSize: 13, color: '#555', cursor: 'pointer' },
  deleteBtn: { fontSize: 13, color: '#ef4444', cursor: 'pointer' },
  receiptShop: { fontSize: 15, fontWeight: 700, color: '#111', marginBottom: 4 },
  receiptInfo: { fontSize: 13, color: '#555', marginTop: 2 },
  submitBtn: {
    width: '100%', padding: '14px 0', fontSize: 15, fontWeight: 700,
    border: 'none', borderRadius: 12, backgroundColor: '#4f7cff', color: '#fff', cursor: 'pointer',
  },
  historyList: { display: 'flex', flexDirection: 'column', gap: 10, padding: '12px 16px' },
  historyCard: {
    backgroundColor: '#fff', borderRadius: 12, padding: '14px 16px',
    border: '1px solid #f1f3f5', boxShadow: '0 4px 16px rgba(0,0,0,0.18)', transition: 'all 0.2s',
  },
  historyTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  historyDate: { fontSize: 13, fontWeight: 700, color: '#4D7EFF' },
  historyKm: { fontSize: 12, color: '#555', backgroundColor: '#f3f4f6', padding: '3px 10px', borderRadius: 20, fontWeight: 600 },
  historyDesc: { fontSize: 15, fontWeight: 700, color: '#111', marginBottom: 4 },
  historyManager: { fontSize: 13, color: '#666' },
};
