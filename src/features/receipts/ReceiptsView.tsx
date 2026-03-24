import React from 'react';
import iconKz from '../../assets/icon_kz.png';
import iconMegaphone from '../../assets/icon_megaphone.png';
import { DateRangePicker } from '../../components/DateRangePicker';
import type { UseReceiptsReturn } from './useReceipts';

export function ReceiptsView({
  bridge,
  expenseStatus,
  receiptsToProcess,
  corporateCardInfo,
  personalCardInfo,
  corporateReceipts,
  personalReceipts,
  recentExpenses,
  scrollRef,
  onNavigate,
  showDatePicker,
  startDate,
  endDate,
  onOpenDatePicker,
  onCloseDatePicker,
  onConfirmDateRange,
}: UseReceiptsReturn) {
  return (
    <div style={styles.container}>
      {/* ── 고정 헤더 ─────────────────────────────────────────── */}
      <div style={styles.fixedHeader}>
        <div style={styles.userBar}>
          <div style={styles.userLeft}>
            <img src={iconKz} alt="kz" style={styles.logoIcon} />
            <span style={styles.userName}>
              {bridge.userName ? bridge.userName : '연결 대기중...'}
            </span>
          </div>
        </div>
        <div style={styles.vehicleBar}>
          <img src={iconMegaphone} alt="차량" style={styles.megaphoneIcon} />
          <span style={{
            ...styles.vehicleBadge,
            color: bridge.isVehicleConnected ? '#2b5cff' : '#aaaaaa',
          }}>
            {bridge.connectionStatus}
          </span>
          <div style={styles.divider} />
          {bridge.plateNumber ? (
            <span style={styles.vehicleInfo}>[{bridge.plateNumber}] {bridge.vehicleName}</span>
          ) : (
            <span style={{ ...styles.vehicleInfo, color: '#bbbbbb' }}>차량 정보를 기다리는 중...</span>
          )}
        </div>

        {/* ── 경비 현황 (고정) ─────────────────────────────────── */}
        <div style={styles.expenseStatusCard}>
          <div style={styles.cardHeader}>
            <span style={styles.cardTitle}>경비현황</span>
            <svg onClick={onOpenDatePicker} style={{ cursor: 'pointer' }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          </div>
          <div style={styles.expenseRow}>
            <span style={styles.expensePeriod}>{expenseStatus.period}</span>
            <div style={styles.expenseAmountWrapper}>
              <span style={styles.expenseAmount}>{expenseStatus.totalAmount.toLocaleString()}</span>
              <span style={styles.expenseUnit}>원</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 스크롤 영역 ──────────────────────────────────────── */}
      <div style={styles.scrollArea} ref={scrollRef}>

        {/* ── 처리할 영수증 ──────────────────────────────────── */}
        <div style={styles.sectionGroup}>
          <div style={styles.sectionHeader}>처리할 영수증</div>
          
          <button style={styles.listItem} onClick={() => onNavigate('/receipts/list', { 
            tab: 'corporate', 
            corporateReceipts, 
            personalReceipts, 
            corporateCardInfo, 
            personalCardInfo 
          })}>
            <span style={styles.listLabel}>법인카드</span>
            <div style={styles.listRight}>
              <span style={styles.countBadge}>{receiptsToProcess.corporateCount} 건</span>
              <span style={styles.listArrow}>›</span>
            </div>
          </button>
          
          <button style={styles.listItem} onClick={() => onNavigate('/receipts/list', { 
            tab: 'personal', 
            corporateReceipts, 
            personalReceipts, 
            corporateCardInfo, 
            personalCardInfo 
          })}>
            <span style={styles.listLabel}>개인카드</span>
            <div style={styles.listRight}>
              <span style={{...styles.countBadge, color: '#ef4444', backgroundColor: '#fee2e2'}}>{receiptsToProcess.personalCount} 건</span>
              <span style={styles.listArrow}>›</span>
            </div>
          </button>

          <div style={styles.buttonWrapper}>
            <button style={styles.primaryButton}>
              + 미등록카드 경비등록
            </button>
          </div>
        </div>

        {/* ── 최근 경비 내역 ────────────────────────────────── */}
        <div style={styles.sectionGroup}>
          <div style={{ ...styles.sectionHeader, borderBottom: 'none' }}>
            <span>최근경비 내역</span>
            {/* 더보기 버튼 활성화 및 이동 */}
            <button style={styles.moreButton} onClick={() => onNavigate('/receipts/history', { recentExpenses, startDate, endDate })}>더보기</button>
          </div>
          
          <div style={styles.historyList}>
            {recentExpenses.map((item, index) => (
              <div key={item.id} style={{ ...styles.historyItem, borderBottom: index < recentExpenses.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                <div style={styles.historyLeft}>
                  <span style={styles.historyDate}>{item.date}</span>
                  <span style={styles.historyStore}>{item.store}</span>
                </div>
                <div style={styles.historyRight}>
                  <span style={styles.historyAmount}>{item.amount.toLocaleString()}</span>
                  <span style={styles.historyAmountUnit}>원</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {showDatePicker && (
        <DateRangePicker
          initialStart={startDate}
          initialEnd={endDate}
          onConfirm={onConfirmDateRange}
          onCancel={onCloseDatePicker}
        />
      )}
    </div>
  );
}

// ─── 스타일 ──────────────────────────────────────────────────
const styles: Record<string, React.CSSProperties> = {
  container: { display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#f5f5f7', fontFamily: "'Pretendard','Noto Sans KR',sans-serif", overflow: 'hidden' },
  fixedHeader: { flexShrink: 0, position: 'sticky', top: 0, zIndex: 10, backgroundColor: '#f5f5f7' },
  userBar: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px 8px' },
  userLeft: { display: 'flex', alignItems: 'center', gap: 8 },
  logoIcon: { width: 32, height: 32, objectFit: 'contain' as const },
  userName: { fontSize: 18, fontWeight: 700, color: '#111' },
  vehicleBar: { display: 'flex', alignItems: 'center', gap: 8, margin: '0 16px 8px', padding: '8px 16px', backgroundColor: '#fff', borderRadius: 30, border: '1.5px solid #2b5cff' },
  megaphoneIcon: { width: 20, height: 20, objectFit: 'contain' as const },
  divider: { width: '1px', height: '14px', backgroundColor: '#d1d5db', flexShrink: 0 },
  vehicleBadge: { fontSize: 14, fontWeight: 700, whiteSpace: 'nowrap' as const },
  vehicleInfo: { fontSize: 14, color: '#444', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const },
  
  // Expense Status Card
  expenseStatusCard: { margin: '8px 16px', padding: '20px 16px', backgroundColor: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  cardTitle: { fontSize: 16, fontWeight: 700, color: '#111' },
  expenseRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' },
  expensePeriod: { fontSize: 13, color: '#888' },
  expenseAmountWrapper: { display: 'flex', alignItems: 'baseline', gap: 4 },
  expenseAmount: { fontSize: 24, fontWeight: 700, color: '#111' },
  expenseUnit: { fontSize: 14, fontWeight: 600, color: '#111' },

  scrollArea: { flex: 1, overflowY: 'auto' as const, display: 'block', paddingBottom: 32 },
  
  // Section Group
  sectionGroup: { backgroundColor: '#fff', borderRadius: 12, margin: '8px 16px', overflow: 'hidden' },
  sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 16px 16px', fontSize: 15, fontWeight: 700, color: '#111' },
  
  // List Item for Receipts Process
  listItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 16px', width: '100%', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', borderBottom: '1px solid #f0f0f0' },
  listLabel: { fontSize: 15, color: '#222', fontWeight: 500 },
  listRight: { display: 'flex', alignItems: 'center', gap: 8 },
  countBadge: { fontSize: 13, fontWeight: 600, color: '#ef4444', backgroundColor: '#fee2e2', padding: '4px 10px', borderRadius: 16 },
  listArrow: { fontSize: 20, color: '#aaa', marginTop: -2 },
  
  buttonWrapper: { padding: '16px' },
  primaryButton: { width: '100%', padding: '14px 0', backgroundColor: '#4f7cff', color: '#fff', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: 'pointer' },

  // History List
  moreButton: { fontSize: 13, color: '#aaa', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 500 },
  historyList: { display: 'flex', flexDirection: 'column', padding: '0 16px 16px' },
  historyItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0' },
  historyLeft: { display: 'flex', alignItems: 'center', gap: 12, flex: 1, overflow: 'hidden' },
  historyDate: { fontSize: 14, color: '#aaa', flexShrink: 0 },
  historyStore: { fontSize: 15, color: '#111', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const },
  historyRight: { display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 },
  historyAmount: { fontSize: 15, fontWeight: 700, color: '#111' },
  historyAmountUnit: { fontSize: 14, color: '#111' },
};
