import React from 'react';
import DrivingIdle from '../../assets/images/driving_idle.png';
import DrivingStop from '../../assets/images/driving_stop.png';
import DrivingOn from '../../assets/images/driving_on.png';
import type { UseOperationDashboardReturn } from './useOperationDashboard';

// 시간 포맷 헬퍼 (ISO 문자열 -> HH:MM)
const formatTime = (isoString: string) => {
  if (!isoString) return '--:--';
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return isoString;
  const h = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
};

export function OperationDashboardView({
  drivingState,
  cycleState,
  syncPayload,
  recentDrivingData,
  recentExpenseData,
  onMoreAttendance,
  onMoreDriving,
  onMoreExpense,
  onCheckIn,
  onCheckOut,
}: UseOperationDashboardReturn) {
  
  const getHeroConfig = () => {
    switch (drivingState) {
      case 0: return { color: '#9BA3AF', img: DrivingIdle, title: '현재 연결 대기중 입니다', sub: '차량에 탑승해 주세요.' };
      case 1: return { color: '#5A8BFF', img: DrivingStop, title: '현재 운행 대기중 입니다', sub: '차량 이동이 감지되면 자동으로 운행기록을 시작합니다.' };
      case 2: return { color: '#22C55E', img: DrivingOn, title: '현재 운행중 입니다', sub: '안전운전 하세요!' };
      default: return { color: '#5A8BFF', img: DrivingStop, title: '', sub: '' };
    }
  };
  const hero = getHeroConfig();

  // 실제 데이터 맵핑
  const workDay = syncPayload?.workDay;
  const isCheckedIn = !!workDay;
  const isCheckedOut = !!workDay?.checkOutTime;
  
  const checkInTimeStr = workDay?.checkInTime ? formatTime(workDay.checkInTime) : '--:--';
  const checkOutTimeStr = workDay?.checkOutTime ? formatTime(workDay.checkOutTime) : '--:--';
  
  // 총 운행(근무) 시간 및 프로그레스 바 계산
  let workTimeStr = '';
  let progressPercent = 0;
  const EIGHT_HOURS_MS = 8 * 60 * 60 * 1000; // 8시간

  if (isCheckedIn && workDay?.checkInTime) {
    const dIn = new Date(workDay.checkInTime);
    const dOut = isCheckedOut && workDay?.checkOutTime ? new Date(workDay.checkOutTime) : new Date();
    const diffMs = dOut.getTime() - dIn.getTime();
    
    if (!isNaN(diffMs) && diffMs >= 0) {
      const diffMins = Math.floor(diffMs / 60000);
      const h = Math.floor(diffMins / 60);
      const m = diffMins % 60;
      workTimeStr = `${h}시간 ${m}분`;
      
      progressPercent = Math.min(100, (diffMs / EIGHT_HOURS_MS) * 100);
    }
  }
  
  const primaryBtnText = isCheckedIn ? (isCheckedOut ? `퇴근완료 (${checkInTimeStr} - ${checkOutTimeStr})` : '퇴근 등록') : '출근 등록';
  const primaryBtnColor = isCheckedIn ? (isCheckedOut ? '#ced4da' : '#22c55e') : '#2B5CFF';
  const handlePrimaryBtn = isCheckedIn ? (isCheckedOut ? () => {} : onCheckOut) : onCheckIn;

  return (
    <div style={styles.pageContent}>
      {/* Main Status Hero (Dashboard Only) - Sticky Top */}
      <div style={{ position: 'sticky', top: 0, zIndex: 10, padding: '16px 0', backgroundColor: '#F5F6FA', margin: '0 -16px', paddingLeft: 16, paddingRight: 16 }}>
        <div style={{ ...styles.heroCard, margin: 0, backgroundColor: hero.color }} onClick={cycleState}>
          <div style={styles.heroCircle}>
            <img src={hero.img} alt="Driving Status" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <h2 style={styles.heroTitle}>{hero.title}</h2>
          <p style={styles.heroSub}>{hero.sub}</p>
        </div>
      </div>

      {/* Attendance Card */}
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <h3 style={styles.cardTitle}>일일근태현황</h3>
          <span style={styles.cardMore} onClick={onMoreAttendance}>더보기</span>
        </div>
        <div style={styles.progressContainer}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#999', marginBottom: 4 }}>
            <span>0h</span><span>8h</span>
          </div>
          <div style={styles.progressBarBg}>
            <div style={{
              ...styles.progressBarFill, 
              width: `${progressPercent}%`, 
              backgroundColor: isCheckedOut ? '#22c55e' : '#2B5CFF'
            }} />
          </div>
        </div>
        <div style={styles.attendanceTimes}>
          <div style={{color: isCheckedIn ? '#333' : '#999', fontSize: 14, fontWeight: 'bold' }}>출발 {checkInTimeStr}</div>
          
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 10px' }}>
            <div style={{ flex: 1, height: 1, backgroundColor: '#eee' }} />
            {workTimeStr && (
              <span style={{ fontSize: 12, color: '#2B5CFF', backgroundColor: '#eef2ff', padding: '4px 10px', borderRadius: 12, fontWeight: 'bold', margin: '0 8px' }}>
                {workTimeStr}
              </span>
            )}
            <div style={{ flex: 1, height: 1, backgroundColor: '#eee' }} />
          </div>

          <div style={{color: isCheckedOut ? '#333' : '#999', fontSize: 14, fontWeight: 'bold' }}>도착 {checkOutTimeStr}</div>
        </div>
        <button 
          style={{...styles.primaryBtn, backgroundColor: primaryBtnColor, cursor: isCheckedOut ? 'not-allowed' : 'pointer'}} 
          onClick={handlePrimaryBtn}
          disabled={isCheckedOut}
        >
          {primaryBtnText}
        </button>
      </div>

      {/* Driving History Card Mock */}
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <h3 style={styles.cardTitle}>최근운행 내역</h3>
          <span style={styles.cardMore} onClick={onMoreDriving}>더보기</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {recentDrivingData.map((item) => (
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
          <span style={styles.cardMore} onClick={onMoreExpense}>더보기</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {recentExpenseData.map((item, index) => {
            const dateStr = item.date || '';
            const dPart = dateStr.includes(' ') ? dateStr.split(' ')[0] : dateStr;
            const tPart = dateStr.includes(' ') && dateStr.split(' ')[1] ? dateStr.split(' ')[1].substring(0, 5) : '';

            return (
              <div key={item.id} style={{
                ...styles.expenseItemRow,
                borderBottom: index !== recentExpenseData.length - 1 ? '1px solid #EDF0F4' : 'none'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, overflow: 'hidden' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 2, minWidth: 70 }}>
                      <span style={{ fontSize: 12, color: '#64748b' }}>{dPart}</span>
                      {tPart && <span style={{ fontSize: 11, color: '#94a3b8' }}>{tPart}</span>}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                      {item.cardType === 'simple' && <span style={{ ...styles.badge, color: '#f97316', backgroundColor: '#ffedd5' }}>{item.cardTypeLabel}</span>}
                      {item.cardType === 'corporate' && <span style={{ ...styles.badge, color: '#10b981', backgroundColor: '#d1fae5' }}>{item.cardTypeLabel}</span>}
                      {item.cardType === 'personal' && <span style={{ ...styles.badge, color: '#4f7cff', backgroundColor: '#eff6ff' }}>{item.cardTypeLabel}</span>}
                      {item.isSync && <span style={{ width: 62, textAlign: 'center', padding: '3px 0', borderRadius: 4, fontSize: 10, color: '#ef4444', backgroundColor: '#fee2e2', boxSizing: 'border-box' }}>전송완료</span>}
                    </div>
                  </div>
                  <span style={styles.expenseMerchant}>{item.merchant}</span>
                </div>
                <span style={styles.priceText}>{item.amount} <span style={{ fontSize: 13, color: '#333', fontWeight: 'normal' }}>원</span></span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── 스타일 ──────────────────────────────────────────────────
const styles: Record<string, React.CSSProperties> = {
  pageContent: {
    padding: '0 16px',
    paddingBottom: '20px',
  },
  heroCard: {
    margin: '16px 0',
    backgroundColor: '#5A8BFF',
    borderRadius: '20px',
    padding: '20px',
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
  card: {
    backgroundColor: '#fff',
    borderRadius: '16px',
    padding: '20px',
    marginBottom: '16px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
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
    fontSize: '15px',
    fontWeight: 'bold',
    color: '#2B5CFF',
    textAlign: 'right',
  },
  badge: { width: 62, fontSize: 11, fontWeight: 600, padding: '2px 0', textAlign: 'center', borderRadius: 4, flexShrink: 0, boxSizing: 'border-box' },
  drivingItemBg: {
    backgroundColor: '#F5F6FA',
    borderRadius: '12px',
    padding: '12px 16px',
    margin: '0 -4px',
    boxShadow: '0 4px 14px rgba(0,0,0,0.12)',
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
