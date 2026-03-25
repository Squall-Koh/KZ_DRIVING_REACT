import React from 'react';
import { useNavigate } from 'react-router-dom';
import DrivingStop from '../../assets/images/driving_stop.png';

const RECENT_DRIVING_DATA = [
  { id: 1, date: '26.03.01', vehicle: '벤츠 스프린터', plate: '154 후 5698', km: '30' },
  { id: 2, date: '26.02.28', vehicle: '카니발 하이리무진', plate: '154 후 5698', km: '16' },
  { id: 3, date: '26.02.28', vehicle: '카니발 하이리무진', plate: '154 후 5698', km: '22' },
];

const RECENT_EXPENSE_DATA = [
  { id: 1, date: '26.03.01', merchant: 'CU 편의점 종각역점', amount: '54,000' },
  { id: 2, date: '26.02.28', merchant: 'SK 주유소 종각역점', amount: '50,000' },
  { id: 3, date: '26.02.27', merchant: 'SK 주유소 서울시청역 이름이 긴...', amount: '50,000' },
  { id: 4, date: '26.02.27', merchant: 'CU 편의점 종각역점', amount: '10,000' },
];

export function OperationDashboard() {
  const navigate = useNavigate();

  return (
    <div style={styles.pageContent}>
      {/* Main Status Hero (Dashboard Only) */}
      <div style={styles.heroCard}>
        <div style={styles.heroCircle}>
          <img src={DrivingStop} alt="Driving Status" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </div>
        <h2 style={styles.heroTitle}>현재 운행 대기중 입니다</h2>
        <p style={styles.heroSub}>차량 이동이 감지되면 자동으로 운행기록을 시작합니다.</p>
      </div>

      {/* Attendance Card Mock */}
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <h3 style={styles.cardTitle}>일일근태현황</h3>
          <span style={styles.cardMore} onClick={() => navigate('/daily-trip-history')}>더보기</span>
        </div>
        <div style={styles.progressContainer}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#999', marginBottom: 4 }}>
            <span>0h</span><span>8h</span>
          </div>
          <div style={styles.progressBarBg}>
            <div style={{...styles.progressBarFill, width: '0%'}} />
          </div>
        </div>
        <div style={styles.attendanceTimes}>
          <div>출발 : --:--</div>
          <div style={{ fontSize: 16, fontWeight: 'bold' }}>-</div>
          <div>도착 : --:--</div>
        </div>
        <button style={styles.primaryBtn} onClick={() => console.log('출근 등록 클릭됨')}>
          출근 등록
        </button>
      </div>

      {/* Driving History Card Mock */}
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <h3 style={styles.cardTitle}>최근운행 내역</h3>
          <span style={styles.cardMore} onClick={() => navigate('/driving-history')}>더보기</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {RECENT_DRIVING_DATA.map((item) => (
            <div key={item.id} style={styles.drivingItemBg}>
              <div style={styles.drivingItemRow}>
                <span style={styles.dateText}>{item.date}</span>
                <span style={styles.plateText}>{item.plate}</span>
              </div>
              <div style={styles.drivingItemRow}>
                <span style={styles.vehicleName}>{item.vehicle}</span>
                <span style={styles.distanceText}>{item.km} <span style={{ fontSize: 13, color: '#999', fontWeight: 'normal' }}>km</span></span>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Expense History Card Mock */}
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <h3 style={styles.cardTitle}>최근경비 내역</h3>
          <span style={styles.cardMore} onClick={() => navigate('/receipts')}>더보기</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {RECENT_EXPENSE_DATA.map((item, index) => (
            <div key={item.id} style={{
              ...styles.expenseItemRow,
              borderBottom: index !== RECENT_EXPENSE_DATA.length - 1 ? '1px solid #EDF0F4' : 'none'
            }}>
              <span style={styles.dateText}>{item.date}</span>
              <span style={styles.expenseMerchant}>{item.merchant}</span>
              <span style={styles.priceText}>{item.amount} <span style={{ fontSize: 13, color: '#333', fontWeight: 'normal' }}>원</span></span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── 스타일 ──────────────────────────────────────────────────
const styles: Record<string, React.CSSProperties> = {
  page: {
    height: '100dvh', // 모바일 브라우저 툴바를 고려한 100vh
    overflow: 'hidden',
    backgroundColor: '#F5F6FA',
    fontFamily: "'Pretendard','Noto Sans KR', sans-serif",
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    padding: '16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
    userSelect: 'none', // 로고 연타 시 텍스트 선택 방지
  },
  logoBadge: {
    width: 32,
    height: 32,
    backgroundColor: '#2B5CFF',
    color: '#fff',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
  },
  userName: {
    fontSize: '18px',
    fontWeight: 'bold',
  },
  headerRight: {
    display: 'flex',
    gap: '12px',
  },
  iconBtn: {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
  },
  statusBar: {
    margin: '0 16px',
    padding: '12px 16px',
    backgroundColor: '#fff',
    borderRadius: '30px',
    border: '1.5px solid #2B5CFF',
    display: 'flex',
    alignItems: 'center',
  },
  statusTitle: {
    color: '#2B5CFF',
    fontWeight: 'bold',
    fontSize: '14px',
    whiteSpace: 'nowrap',
  },
  divider: {
    width: '1px',
    height: '16px',
    backgroundColor: '#eee',
    margin: '0 12px',
  },
  statusDesc: {
    fontSize: '13px',
    color: '#666',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  heroCard: {
    margin: '16px',
    backgroundColor: '#5A8BFF',
    borderRadius: '20px',
    padding: '20px 20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    color: '#fff',
    textAlign: 'center',
  },
  heroCircle: {
    width: 100,
    height: 100,
    backgroundColor: 'transparent',
    borderRadius: '50px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '16px',
  },
  heroTitle: {
    margin: '0 0 8px 0',
    fontSize: '20px',
    fontWeight: 'bold',
  },
  heroSub: {
    margin: 0,
    fontSize: '13px',
    color: 'rgba(255,255,255,0.8)',
  },
  contentArea: {
    padding: '0 16px',
    flex: 1,
    overflowY: 'auto',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '16px',
    padding: '20px',
    marginBottom: '16px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  cardTitle: {
    margin: 0,
    fontSize: '16px',
    fontWeight: 'bold',
  },
  cardMore: {
    fontSize: '13px',
    color: '#999',
    cursor: 'pointer',
  },
  progressContainer: {
    marginBottom: '16px',
  },
  progressBarBg: {
    width: '100%',
    height: '8px',
    backgroundColor: '#F0F0F0',
    borderRadius: '4px',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#2B5CFF',
    borderRadius: '4px',
  },
  attendanceTimes: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '14px',
    marginBottom: '16px',
  },
  primaryBtn: {
    width: '100%',
    padding: '14px',
    backgroundColor: '#2B5CFF',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  historyRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: '14px',
    color: '#C2C6CD',
  },
  vehicleName: {
    fontSize: '15px',
    color: '#555',
  },
  plateText: {
    fontSize: '15px',
    fontWeight: 'bold',
    color: '#333',
  },
  distanceText: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#2B5CFF',
  },
  priceText: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#000',
  },
  drivingItemBg: {
    backgroundColor: '#F5F6FA',
    borderRadius: '12px',
    padding: '12px 16px', // 상하 패딩 축소
    margin: '0 -4px', // 좌우 살짝 당겨서 위쪽 string과 시각적 정렬 느낌 주기
    boxShadow: '0 4px 14px rgba(0,0,0,0.12)', // 하단 그림자 한층 더 진하고 넓게 강화
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  drivingItemRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  expenseItemRow: {
    display: 'flex',
    alignItems: 'center',
    padding: '16px 0',
  },
  expenseMerchant: {
    fontSize: '15px',
    color: '#333',
    fontWeight: 'bold',
    flex: 1,
    margin: '0 16px',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
  },
};
