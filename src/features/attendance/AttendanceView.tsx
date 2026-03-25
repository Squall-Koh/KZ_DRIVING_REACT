import type { UseAttendanceReturn, WeekRecord } from './useAttendance';

// ─── 반원 게이지 ──────────────────────────────────────────────
function SemiCircleGauge({ regular, overtime, night }: { regular: number; overtime: number; night: number }) {
  const total = regular + overtime + night || 1;
  const rPct = regular  / total;
  const oPct = overtime / total;
  const nPct = night    / total;

  const VW = 250, VH = 135, cx = VW / 2, cy = 115, R = 96, SW = 22;
  const arcLength = Math.PI * R;
  const layer1Len = arcLength;
  const layer2Len = arcLength * (rPct + oPct);
  const layer3Len = arcLength * rPct;
  const baseArcD  = `M ${cx - R} ${cy} A ${R} ${R} 0 0 1 ${cx + R} ${cy}`;

  const totalH = regular + overtime + night;
  const mins   = Math.round((totalH % 1) * 60);
  const label  = mins > 0 ? `${Math.floor(totalH)}시간 ${mins}분` : `${totalH}시간`;

  return (
    <div style={gaugeStyles.wrapper}>
      <svg viewBox={`0 0 ${VW} ${VH}`} width="100%" style={{ display: 'block', maxWidth: 260, margin: '0 auto' }}>
        <path d={baseArcD} fill="none" stroke="#f0f4ff" strokeWidth={SW - 0.5} strokeLinecap="butt" />
        {nPct > 0 && <path d={baseArcD} fill="none" stroke="#f59e0b" strokeWidth={SW} strokeLinecap="butt" strokeDasharray={`${layer1Len} ${arcLength}`} strokeDashoffset="0" />}
        {oPct > 0 && <path d={baseArcD} fill="none" stroke="#22c55e" strokeWidth={SW} strokeLinecap="butt" strokeDasharray={`${layer2Len} ${arcLength}`} strokeDashoffset="0" />}
        {rPct > 0 && <path d={baseArcD} fill="none" stroke="#4f7cff" strokeWidth={SW} strokeLinecap="butt" strokeDasharray={`${layer3Len} ${arcLength}`} strokeDashoffset="0" />}
        <text x={cx} y={cy - 10} textAnchor="middle" fontSize="22" fontWeight="700" fill="#111827">{label}</text>
      </svg>
      <div style={gaugeStyles.legend}>
        <span style={gaugeStyles.legendItem}><span style={{ ...gaugeStyles.dot, background: '#4f7cff' }} /> 정규근무</span>
        <span style={gaugeStyles.legendItem}><span style={{ ...gaugeStyles.dot, background: '#22c55e' }} /> 초과근무</span>
        <span style={gaugeStyles.legendItem}><span style={{ ...gaugeStyles.dot, background: '#f59e0b' }} /> 야간근무</span>
      </div>
    </div>
  );
}

const gaugeStyles: Record<string, React.CSSProperties> = {
  wrapper: { backgroundColor: '#f0f4ff', borderRadius: 16, margin: '12px 16px', padding: '16px 12px 14px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 },
  legend: { display: 'flex', gap: 20, fontSize: 13, color: '#374151' },
  legendItem: { display: 'flex', alignItems: 'center', gap: 6 },
  dot: { display: 'inline-block', width: 12, height: 12, borderRadius: 3, flexShrink: 0 },
};

// ─── 주간 행 ─────────────────────────────────────────────────
function WeekRow({ week, index, total, onNavigate }: {
  week: WeekRecord;
  index: number;
  total: number;
  onNavigate: (path: string, state?: any) => void;
}) {
  return (
    <div
      style={{ ...styles.weekRow, borderBottom: index < total - 1 ? '1px solid #f0f0f0' : 'none', cursor: 'pointer' }}
      onClick={() => onNavigate('/attendance/detail', {
        dateFrom: week.dateFrom, dateTo: week.dateTo, weekLabel: week.weekLabel, days: week.days,
      })}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <span style={styles.weekLabel}>{week.weekLabel.split(' ~ ')[0]}</span>
        <span style={{ ...styles.weekLabel, color: '#999', fontSize: 11 }}>~ {week.weekLabel.split(' ~ ')[1]}</span>
      </div>
      <div style={styles.weekRight}>
        <span style={styles.weekTotal}>총 근무시간 : {Math.floor(week.regularH + week.overtimeH + week.nightH)}시간</span>
        <div style={styles.weekBadges}>
          <span style={styles.badgeText}><span style={{ color: '#3b82f6' }}>■</span> {Math.floor(week.regularH)}h</span>
          <span style={styles.badgeText}><span style={{ color: '#22c55e' }}>■</span> {Math.floor(week.overtimeH)}h</span>
          <span style={styles.badgeText}><span style={{ color: '#f59e0b' }}>■</span> {Math.floor(week.nightH)}h</span>
        </div>
      </div>
    </div>
  );
}

// ─── View 컴포넌트 (순수 UI) ─────────────────────────────────
export function AttendanceView({
  syncPayload,
  selectedMonth,
  showPopup,
  weeks,
  loaded,
  stats,
  monthOptions,
  scrollRef,
  workTimeStr,
  progressPercent,
  primaryBtnText,
  primaryBtnColor,
  checkInTimeStr,
  checkOutTimeStr,
  onSelectMonth,
  onTogglePopup,
  onClosePopup,
  onNavigate,
  onCheckIn,
  onCheckOut,
}: UseAttendanceReturn) {
  const isCheckedIn = !!syncPayload?.workDay;
  const isCheckedOut = !!syncPayload?.workDay?.checkOutTime;

  return (
    <div style={styles.container}>

      {/* ── 스크롤 영역 ──────────────────────────────────────── */}
      <div style={styles.scrollArea} ref={scrollRef}>

        {/* 일일 근태 현황 카드 (대시보드와 동일한 UI) */}
        <div style={styles.todayCard}>
          <div style={styles.todayHeader}><span style={styles.todayTitle}>일일근태현황</span></div>
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
            <div style={{color: isCheckedIn ? '#333' : '#999', fontSize: 14, fontWeight: 'bold' }}>출근 {checkInTimeStr}</div>
            
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 10px' }}>
              <div style={{ flex: 1, height: 1, backgroundColor: '#eee' }} />
              {workTimeStr && (
                <span style={{ fontSize: 12, color: '#2B5CFF', backgroundColor: '#eef2ff', padding: '4px 10px', borderRadius: 12, fontWeight: 'bold', margin: '0 8px' }}>
                  {workTimeStr}
                </span>
              )}
              <div style={{ flex: 1, height: 1, backgroundColor: '#eee' }} />
            </div>

            <div style={{color: isCheckedOut ? '#333' : '#999', fontSize: 14, fontWeight: 'bold' }}>퇴근 {checkOutTimeStr}</div>
          </div>
          <button 
            style={{...styles.primaryBtn, backgroundColor: primaryBtnColor, cursor: isCheckedOut ? 'not-allowed' : 'pointer'}} 
            onClick={isCheckedIn ? onCheckOut : onCheckIn}
            disabled={isCheckedOut}
          >
            {primaryBtnText}
          </button>
        </div>

        {/* ── 근무내역 섹션 ─────────────────────────────────── */}
        <div style={styles.sectionGroup}>
          <button style={styles.monthSelector} onClick={onTogglePopup}>
            <span style={styles.monthSelectorText}>
              {selectedMonth ? `${selectedMonth}월 근무내역` : '근무내역'}
            </span>
            <span style={{ ...styles.monthArrow, transform: showPopup ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
          </button>

          {!loaded ? (
            <div style={styles.emptyWrapper}><p style={styles.emptyText}>연/월을 선택하면 근무내역이 표시됩니다.</p></div>
          ) : (
            <>
              <SemiCircleGauge regular={stats.regular} overtime={stats.overtime} night={stats.night} />
              <div style={styles.listWrapper}>
                {weeks.map((w, i) => (
                  <WeekRow key={i} week={w} index={i} total={weeks.length} onNavigate={onNavigate} />
                ))}
              </div>
            </>
          )}
        </div>

        {/* ── 근태 결재요청 섹션 ───────────────────────────── */}
        <div style={styles.sectionGroup}>
          <div style={styles.sectionHeader}>근태 결재요청</div>
          <button style={styles.adjustRow} onClick={() => onNavigate('/attendance/adjustment')}>
            <span style={styles.adjustLabel}>근태조정 신청서 등록</span>
            <span style={styles.adjustArrow}>›</span>
          </button>
        </div>
      </div>

      {/* ── 월 선택 모달 ──────────────────────────────────── */}
      {showPopup && (
        <div style={styles.overlay} onClick={onClosePopup}>
          <div style={styles.popup} onClick={(e) => e.stopPropagation()}>
            <div style={styles.popupHeader}>
              <span style={styles.popupTitle}>조회연월 선택</span>
              <span style={styles.popupClose} onClick={onClosePopup}>∧</span>
            </div>
            <div style={styles.popupList}>
              {monthOptions.map((m) => (
                <div
                  key={m}
                  style={{ ...styles.popupItem, ...(m === selectedMonth ? styles.popupItemSelected : {}) }}
                  onClick={() => onSelectMonth(m)}
                >
                  {m}
                </div>
              ))}
            </div>
          </div>
        </div>
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
  divider: { width: 1, height: 14, backgroundColor: '#d1d5db', flexShrink: 0 },
  vehicleBadge: { fontSize: 14, fontWeight: 700, whiteSpace: 'nowrap' as const },
  vehicleInfo: { fontSize: 14, color: '#444', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const },
  todayCard: { margin: '16px 16px 8px', padding: '14px 16px', backgroundColor: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  todayHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  todayTitle: { fontSize: 14, fontWeight: 700, color: '#111' },
  progressContainer: { marginBottom: 12 },
  progressBarBg: { height: 8, backgroundColor: '#e5e7eb', borderRadius: 4, overflow: 'hidden' },
  progressBarFill: { height: '100%', transition: 'width 0.3s ease-in-out' },
  attendanceTimes: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  primaryBtn: { width: '100%', padding: '14px 0', borderRadius: 12, fontSize: 16, fontWeight: 'bold', color: '#fff', border: 'none' },
  monthSelector: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', width: '100%', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' as const },
  monthSelectorText: { fontSize: 14, fontWeight: 600, color: '#222' },
  monthArrow: { fontSize: 11, color: '#888', transition: 'transform 0.2s' },
  scrollArea: { flex: 1, overflowY: 'auto' as const, display: 'block', paddingBottom: 32 },
  sectionGroup: { backgroundColor: '#fff', borderRadius: 12, margin: '8px 16px', overflow: 'hidden' },
  emptyWrapper: { display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyText: { fontSize: 14, color: '#aaa', margin: 0 },
  listWrapper: { display: 'flex', flexDirection: 'column', margin: '8px 16px', gap: 0 },
  weekRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '12px 0', borderBottom: '1px solid #f0f0f0' },
  weekLabel: { fontSize: 12, color: '#888', flexShrink: 0, paddingRight: 8, paddingTop: 2 },
  weekRight: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 },
  weekTotal: { fontSize: 12, color: '#333', fontWeight: 600 },
  weekBadges: { display: 'flex', gap: 8 },
  badgeText: { fontSize: 12, color: '#444' },
  sectionHeader: { padding: '14px 16px', fontSize: 15, fontWeight: 700, color: '#111', borderBottom: '1px solid #f0f0f0' },
  adjustRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', width: '100%', backgroundColor: 'transparent', border: 'none', cursor: 'pointer' },
  adjustLabel: { fontSize: 14, color: '#222' },
  adjustArrow: { fontSize: 20, color: '#aaa' },
  overlay: { position: 'fixed' as const, inset: 0, backgroundColor: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 },
  popup: { width: '80%', maxWidth: 320, backgroundColor: '#fff', borderRadius: 14, overflow: 'hidden', boxShadow: '0 8px 30px rgba(0,0,0,0.16)' },
  popupHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderBottom: '1px solid #f0f0f0' },
  popupTitle: { fontSize: 14, fontWeight: 600, color: '#333' },
  popupClose: { fontSize: 16, color: '#888', cursor: 'pointer' },
  popupList: { maxHeight: 240, overflowY: 'auto' as const },
  popupItem: { padding: '12px 16px', fontSize: 14, color: '#333', cursor: 'pointer', borderBottom: '1px solid #f5f5f5' },
  popupItemSelected: { backgroundColor: '#eff6ff', color: '#2563eb', fontWeight: 600 },
};
