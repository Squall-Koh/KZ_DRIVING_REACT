import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import iconKz from '../assets/icon_kz.png';
import iconMegaphone from '../assets/icon_megaphone.png';

// ─── 타입 ────────────────────────────────────────────────────
interface WeekRecord {
  weekLabel: string;   // "26.03.30 ~26.03.31"
  regularH: number;
  overtimeH: number;
  nightH: number;
}

interface FlutterBridgeData {
  userName: string;
  isVehicleConnected: boolean;
  plateNumber: string;
  vehicleName: string;
  checkIn: string;   // "07:30"
  checkOut: string;  // "00:00" (퇴근 전이면 빈값)
}

// ─── 연월 선택지 ──────────────────────────────────────────────
function generateMonthOptions(): string[] {
  const opts: string[] = [];
  const base = new Date(2026, 2);
  for (let i = 0; i < 12; i++) {
    const d = new Date(base.getFullYear(), base.getMonth() - i);
    opts.push(`${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}`);
  }
  return opts;
}
const MONTH_OPTIONS = generateMonthOptions();

// ─── 더미 주간 데이터 (월별) ─────────────────────────────────
const DUMMY_WEEKS: Record<string, WeekRecord[]> = {
  '2026.03': [
    { weekLabel: '26.03.30 ~26.03.31', regularH: 16, overtimeH: 0, nightH: 3 },
    { weekLabel: '26.03.23 ~26.03.27', regularH: 40.5, overtimeH: 0, nightH: 3 },
    { weekLabel: '26.03.16 ~26.03.20', regularH: 40, overtimeH: 0, nightH: 1 },
    { weekLabel: '26.03.09 ~26.03.13', regularH: 40, overtimeH: 2, nightH: 8 },
    { weekLabel: '26.03.01 ~26.03.07', regularH: 40, overtimeH: 5, nightH: 1 },
    { weekLabel: '26.02.23 ~26.02.28', regularH: 32, overtimeH: 0, nightH: 0 },
    { weekLabel: '26.02.16 ~26.02.20', regularH: 40, overtimeH: 1, nightH: 2 },
    { weekLabel: '26.02.09 ~26.02.13', regularH: 40, overtimeH: 0, nightH: 0 },
    { weekLabel: '26.02.02 ~26.02.07', regularH: 38, overtimeH: 2, nightH: 0 },
    { weekLabel: '26.01.26 ~26.01.31', regularH: 40, overtimeH: 3, nightH: 4 },
  ],
  '2026.02': [
    { weekLabel: '26.02.23 ~26.02.28', regularH: 40, overtimeH: 0, nightH: 0 },
    { weekLabel: '26.02.16 ~26.02.20', regularH: 40, overtimeH: 3, nightH: 2 },
    { weekLabel: '26.02.09 ~26.02.13', regularH: 40, overtimeH: 0, nightH: 0 },
    { weekLabel: '26.02.01 ~26.02.07', regularH: 38, overtimeH: 1, nightH: 0 },
  ],
  '2026.01': [
    { weekLabel: '26.01.26 ~26.01.31', regularH: 40, overtimeH: 2, nightH: 0 },
    { weekLabel: '26.01.19 ~26.01.23', regularH: 40, overtimeH: 0, nightH: 1 },
    { weekLabel: '26.01.12 ~26.01.16', regularH: 40, overtimeH: 4, nightH: 0 },
    { weekLabel: '26.01.05 ~26.01.09', regularH: 36, overtimeH: 0, nightH: 0 },
  ],
};

// ─── 반원 게이지 ──────────────────────────────────────────────
function SemiCircleGauge({ regular, overtime, night }: { regular: number; overtime: number; night: number }) {
  const total = regular + overtime + night || 1;
  const rPct = regular / total;
  const oPct = overtime / total;

  const VW = 240, VH = 130;
  const cx = VW / 2;
  const cy = 115;
  const R = 80;
  const SW = 19;

  function pt(pct: number) {
    const a = Math.PI * pct - Math.PI; // -π(왼쪽) → 0(오른쪽)
    return { x: cx + R * Math.cos(a), y: cy + R * Math.sin(a) };
  }

  function arcD(s: number, e: number) {
    const p1 = pt(s), p2 = pt(e);
    const large = e - s > 0.5 ? 1 : 0;
    return `M ${p1.x.toFixed(2)} ${p1.y.toFixed(2)} A ${R} ${R} 0 ${large} 1 ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
  }

  const totalH = regular + overtime + night;
  const mins = Math.round((totalH % 1) * 60);
  const label = mins > 0 ? `${Math.floor(totalH)}시간 ${mins}분` : `${totalH}시간`;

  // 세그먼트 경계
  const p0 = 0;
  const p1 = rPct;
  const p2 = rPct + oPct;
  const p3 = 1;

  return (
    <div style={gaugeStyles.wrapper}>
      <svg
        viewBox={`0 0 ${VW} ${VH}`}
        width="100%"
        style={{ display: 'block', maxWidth: 260, margin: '0 auto' }}
        preserveAspectRatio="xMidYMid meet"
      >
        {/*
          오른쪽 → 왼쪽 순서로 그림.
          마지막에 그린 (왼쪽) arc가 맨 위에 오므로
          각 세그먼트의 경계 round cap이 왼쪽 arc에 덮임.
          결과: 양 끝(left=blue, right=last)만 round cap 보임.
        */}

        {/* 배경 (wrap-color) — 빈 구간에만 보임 */}
        <path
          d={arcD(p0, p3)}
          fill="none"
          stroke="#d8deff"
          strokeWidth={SW}
          strokeLinecap="round"
        />

        {/* 야간 (오른쪽 끝) — 먼저 그림 */}
        {p3 - p2 > 0.001 && (
          <path d={arcD(p2, p3)} fill="none" stroke="#f59e0b" strokeWidth={SW} strokeLinecap="round" />
        )}

        {/* 초과 (중간) */}
        {p2 - p1 > 0.001 && (
          <path d={arcD(p1, p2)} fill="none" stroke="#22c55e" strokeWidth={SW} strokeLinecap="round" />
        )}

        {/* 정규 (왼쪽 끝, 마지막 = 최상단) */}
        {p1 - p0 > 0.001 && (
          <path d={arcD(p0, p1)} fill="none" stroke="#4f7cff" strokeWidth={SW} strokeLinecap="round" />
        )}

        {/* 시간 텍스트 */}
        <text x={cx} y={cy - 10} textAnchor="middle" fontSize="18" fontWeight="700" fill="#111827">
          {label}
        </text>
      </svg>

      {/* 범례 */}
      <div style={gaugeStyles.legend}>
        <span style={gaugeStyles.legendItem}><span style={{ ...gaugeStyles.dot, background: '#4f7cff' }} /> 정규근무</span>
        <span style={gaugeStyles.legendItem}><span style={{ ...gaugeStyles.dot, background: '#22c55e' }} /> 초과근무</span>
        <span style={gaugeStyles.legendItem}><span style={{ ...gaugeStyles.dot, background: '#f59e0b' }} /> 야간근무</span>
      </div>
    </div>
  );
}

const gaugeStyles: Record<string, React.CSSProperties> = {
  wrapper: {
    backgroundColor: '#eef2ff',
    borderRadius: 16,
    margin: '12px 16px',
    padding: '20px 12px 16px',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
  },
  legend: { display: 'flex', gap: 20, fontSize: 13, color: '#374151' },
  legendItem: { display: 'flex', alignItems: 'center', gap: 6 },
  dot: { display: 'inline-block', width: 12, height: 12, borderRadius: 3, flexShrink: 0 },
};

// ─── 메인 컴포넌트 ────────────────────────────────────────────
export function Attendance() {
  const navigate = useNavigate();

  const [bridge, setBridge] = useState<FlutterBridgeData>({
    userName: '강무호',
    isVehicleConnected: true,
    plateNumber: '123 허 4567',
    vehicleName: '카니발 하이리무진',
    checkIn: '07:30',
    checkOut: '12:00',
  });

  useEffect(() => {
    (window as any).updateAttendanceInfo = (data: Partial<FlutterBridgeData>) =>
      setBridge((p) => ({ ...p, ...data }));
  }, []);

  const DEFAULT_MONTH = '2026.03';
  const [selectedMonth, setSelectedMonth] = useState<string>(DEFAULT_MONTH);
  const [showPopup, setShowPopup] = useState(false);
  const [weeks, setWeeks] = useState<WeekRecord[]>(DUMMY_WEEKS[DEFAULT_MONTH] ?? []);
  const [loaded, setLoaded] = useState(true);

  const handleSelectMonth = (m: string) => {
    setSelectedMonth(m);
    setShowPopup(false);
    setWeeks(DUMMY_WEEKS[m] ?? []);
    setLoaded(true);
  };

  const stats = useMemo(() => {
    const totalH = weeks.reduce((a, w) => a + w.regularH + w.overtimeH + w.nightH, 0);
    const regular = weeks.reduce((a, w) => a + w.regularH, 0);
    const overtime = weeks.reduce((a, w) => a + w.overtimeH, 0);
    const night = weeks.reduce((a, w) => a + w.nightH, 0);
    return { totalH, regular, overtime, night };
  }, [weeks]);

  // 오늘 근무 진행 바 계산
  const workProgress = useMemo(() => {
    const toMin = (t: string) => {
      const [h, m] = t.split(':').map(Number);
      return h * 60 + m;
    };
    const inMin = toMin(bridge.checkIn);
    const outMin = bridge.checkOut ? toMin(bridge.checkOut) : inMin;
    const elapsed = Math.max(0, outMin - inMin);
    const pct = Math.min(100, (elapsed / (8 * 60)) * 100);
    const h = Math.floor(elapsed / 60);
    const mn = elapsed % 60;
    const label = mn > 0 ? `${h}시간 ${mn}분` : `${h}시간`;
    return { pct, label };
  }, [bridge.checkIn, bridge.checkOut]);

  return (
    <div style={styles.container}>

      {/* ── 고정 헤더 (일일근태현황까지만) ──────────────────── */}
      <div style={styles.fixedHeader}>
        {/* 사용자 바 */}
        <div style={styles.userBar}>
          <div style={styles.userLeft}>
            <img src={iconKz} alt="kz" style={styles.logoIcon} />
            <span style={styles.userName}>{bridge.userName}님</span>
          </div>
        </div>

        {/* 차량 연결 바 */}
        <div style={styles.vehicleBar}>
          <img src={iconMegaphone} alt="차량" style={styles.megaphoneIcon} />
          <span style={styles.vehicleBadge}>{bridge.isVehicleConnected ? '차량연결됨' : '차량미연결'}</span>
          <span style={styles.vehicleInfo}>[{bridge.plateNumber}] {bridge.vehicleName}</span>
        </div>

        {/* 일일 근태 현황 카드 */}
        <div style={styles.todayCard}>
          <div style={styles.todayHeader}>
            <span style={styles.todayTitle}>일일근태현황</span>
            <span
              style={styles.todayMore}
              onClick={() => navigate('/attendance/detail', { state: { month: selectedMonth ?? '2026.03' } })}
            >더보기</span>
          </div>
          <div style={styles.timeAxis}>
            <span style={styles.timeAxisLabel}>0h</span>
            <span style={styles.timeAxisLabel}>8h</span>
          </div>
          <div style={styles.progressBg}>
            <div style={{ ...styles.progressFill, width: `${workProgress.pct}%` }} />
          </div>
          <div style={styles.timeRow}>
            <span style={styles.timeLabel}>출근 : {bridge.checkIn}</span>
            <span style={styles.timeMid}>{workProgress.label}</span>
            <span style={styles.timeLabel}>퇴근 : {bridge.checkOut || '-'}</span>
          </div>
          <button style={styles.checkOutBtn}>퇴근등록</button>
        </div>
      </div>

      {/* ── 스크롤 영역 ──────────────────────────────────────── */}
      <div style={styles.scrollArea}>

        {/* ── 그룹 박스 1: 근무내역 ───────────────────────── */}
        <div style={styles.sectionGroup}>
          {/* 월 선택 버튼 */}
          <button style={styles.monthSelector} onClick={() => setShowPopup(v => !v)}>
            <span style={styles.monthSelectorText}>
              {selectedMonth ? `${selectedMonth}월 근무내역` : '근무내역'}
            </span>
            <span style={{ ...styles.monthArrow, transform: showPopup ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
          </button>

          {!loaded ? (
            <div style={styles.emptyWrapper}>
              <p style={styles.emptyText}>연/월을 선택하면 근무내역이 표시됩니다.</p>
            </div>
          ) : (
            <>
              {/* 반원 게이지 */}
              <SemiCircleGauge regular={stats.regular} overtime={stats.overtime} night={stats.night} />
              {/* 주간 목록 — 항목 수에 따라 자유롭게 늘어남 */}
              <div style={styles.listWrapper}>
                {weeks.map((w, i) => (
                  <div key={i} style={{
                    ...styles.weekRow,
                    borderBottom: i < weeks.length - 1 ? '1px solid #f0f0f0' : 'none',
                  }}>
                    <span style={styles.weekLabel}>{w.weekLabel}</span>
                    <div style={styles.weekRight}>
                      <span style={styles.weekTotal}>총 근무시간 : {w.regularH + w.overtimeH + w.nightH}시간</span>
                      <div style={styles.weekBadges}>
                        <span style={styles.badgeText}><span style={{ color: '#3b82f6' }}>■</span> {w.regularH}h</span>
                        <span style={styles.badgeText}><span style={{ color: '#22c55e' }}>■</span> {w.overtimeH}h</span>
                        <span style={styles.badgeText}><span style={{ color: '#f59e0b' }}>■</span> {w.nightH}h</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* ── 그룹 박스 2: 근태 결재요청 ──────────────────── */}
        <div style={styles.sectionGroup}>
          <div style={styles.sectionHeader}>근태 결재요청</div>
          <button style={styles.adjustRow} onClick={() => navigate('/attendance/adjustment')}>
            <span style={styles.adjustLabel}>근태조정 신청서 등록</span>
            <span style={styles.adjustArrow}>›</span>
          </button>
        </div>

      </div>

      {/* ── 모달 팝업 ────────────────────────────────────────── */}
      {showPopup && (
        <div style={styles.overlay} onClick={() => setShowPopup(false)}>
          <div style={styles.popup} onClick={e => e.stopPropagation()}>
            <div style={styles.popupHeader}>
              <span style={styles.popupTitle}>조회연월 선택</span>
              <span style={styles.popupClose} onClick={() => setShowPopup(false)}>∧</span>
            </div>
            <div style={styles.popupList}>
              {MONTH_OPTIONS.map(m => (
                <div
                  key={m}
                  style={{ ...styles.popupItem, ...(m === selectedMonth ? styles.popupItemSelected : {}) }}
                  onClick={() => handleSelectMonth(m)}
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
  container: {
    display: 'flex', flexDirection: 'column', height: '100vh',
    backgroundColor: '#f5f5f7', fontFamily: "'Pretendard','Noto Sans KR',sans-serif",
    overflow: 'hidden',
  },
  fixedHeader: {
    flexShrink: 0, position: 'sticky', top: 0, zIndex: 10,
    backgroundColor: '#f5f5f7',
  },
  userBar: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '12px 16px 8px',
  },
  userLeft: { display: 'flex', alignItems: 'center', gap: 8 },
  logoIcon: { width: 28, height: 28, objectFit: 'contain' },
  userName: { fontSize: 16, fontWeight: 700, color: '#111' },
  vehicleBar: {
    display: 'flex', alignItems: 'center', gap: 8,
    margin: '0 16px 8px', padding: '10px 14px',
    backgroundColor: '#fff', borderRadius: 24, border: '1px solid #e0e7ff',
  },
  megaphoneIcon: { width: 18, height: 18, objectFit: 'contain' },
  vehicleBadge: { fontSize: 12, fontWeight: 700, color: '#2563eb', whiteSpace: 'nowrap' as const },
  vehicleInfo: { fontSize: 12, color: '#444', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const },

  /* 일일 근태 */
  todayCard: {
    margin: '0 16px 8px', padding: '14px 16px',
    backgroundColor: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  },
  todayHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  todayTitle: { fontSize: 14, fontWeight: 700, color: '#111' },
  todayMore: { fontSize: 12, color: '#2563eb' },
  timeAxis: { display: 'flex', justifyContent: 'space-between', marginBottom: 4 },
  timeAxisLabel: { fontSize: 10, color: '#aaa' },
  progressBg: { height: 8, backgroundColor: '#e5e7eb', borderRadius: 4, marginBottom: 6 },
  progressFill: { height: '100%', backgroundColor: '#3b82f6', borderRadius: 4, transition: 'width 0.3s' },
  timeRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  timeLabel: { fontSize: 11, color: '#555' },
  timeMid: { fontSize: 12, fontWeight: 700, color: '#111' },
  checkOutBtn: {
    width: '100%', padding: '10px 0',
    backgroundColor: '#3b82f6', color: '#fff',
    border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: 'pointer',
  },

  /* 월 선택 버튼 */
  monthSelector: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '14px 16px', width: '100%',
    backgroundColor: '#fff', border: 'none',
    cursor: 'pointer', textAlign: 'left' as const,
    borderBottom: 'none',
  },
  monthSelectorText: { fontSize: 14, fontWeight: 600, color: '#222' },
  monthArrow: { fontSize: 11, color: '#888', transition: 'transform 0.2s' },

  /* 스크롤 */
  scrollArea: {
    flex: 1,
    overflowY: 'auto' as const,
    display: 'block',
    paddingBottom: 32,
  },

  /* 섹션 그룹 */
  sectionGroup: {
    backgroundColor: '#fff',
    borderRadius: 12,
    margin: '8px 16px',
  },

  /* 빈 상태 */
  emptyWrapper: {
    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40,
  },
  emptyText: { fontSize: 14, color: '#aaa', margin: 0 },

  /* 게이지 (그룹 박스 내부) */
  gaugeInner: {
    padding: '16px 0 8px',
    display: 'flex', justifyContent: 'center',
    borderBottom: '1px solid #f0f0f0',
  },
  gaugeCard: {
    margin: '8px 16px', padding: '16px 0 8px',
    backgroundColor: '#fff', borderRadius: 12,
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    display: 'flex', justifyContent: 'center',
  },

  /* 주간 목록 */
  listWrapper: { display: 'flex', flexDirection: 'column', margin: '8px 16px', gap: 0 },
  weekRow: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
    padding: '12px 0', borderBottom: '1px solid #f0f0f0',
  },
  weekLabel: { fontSize: 12, color: '#888', flexShrink: 0, paddingRight: 8, paddingTop: 2 },
  weekRight: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 },
  weekTotal: { fontSize: 12, color: '#333', fontWeight: 600 },
  weekBadges: { display: 'flex', gap: 8 },
  badge: { fontSize: 11, color: '#fff', borderRadius: 4, padding: '2px 6px', fontWeight: 600 },
  badgeText: { fontSize: 12, color: '#444' },

  /* 근태 결재요청 */
  sectionHeader: {
    padding: '14px 16px', fontSize: 15, fontWeight: 700, color: '#111',
    borderBottom: '1px solid #f0f0f0',
  },
  adjustRow: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '14px 16px', width: '100%',
    backgroundColor: '#fff', border: 'none',
    cursor: 'pointer',
  },
  adjustLabel: { fontSize: 14, color: '#222' },
  adjustArrow: { fontSize: 20, color: '#aaa' },

  /* 모달 */
  overlay: {
    position: 'fixed' as const, inset: 0, backgroundColor: 'rgba(0,0,0,0.35)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100,
  },
  popup: {
    width: '80%', maxWidth: 320, backgroundColor: '#fff',
    borderRadius: 14, overflow: 'hidden', boxShadow: '0 8px 30px rgba(0,0,0,0.16)',
  },
  popupHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '14px 16px', borderBottom: '1px solid #f0f0f0',
  },
  popupTitle: { fontSize: 14, fontWeight: 600, color: '#333' },
  popupClose: { fontSize: 16, color: '#888', cursor: 'pointer' },
  popupList: { maxHeight: 240, overflowY: 'auto' as const },
  popupItem: {
    padding: '12px 16px', fontSize: 14, color: '#333',
    cursor: 'pointer', borderBottom: '1px solid #f5f5f5',
  },
  popupItemSelected: { backgroundColor: '#eff6ff', color: '#2563eb', fontWeight: 600 },
};
