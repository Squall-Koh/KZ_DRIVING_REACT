import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import iconKz from '../assets/icon_kz.png';
import iconMegaphone from '../assets/icon_megaphone.png';
import { ALL_DUMMY_DAYS, type DayRecord } from '../data/attendanceDummyData';

// ─── 타입 ────────────────────────────────────────────────────
interface WeekRecord {
  weekLabel: string;   // "26.03.02 (일) ~ 26.03.08 (토)"
  dateFrom: string;    // "2026-03-02"
  dateTo:   string;    // "2026-03-08"
  regularH: number;
  overtimeH: number;
  nightH: number;
  days: DayRecord[];   // 해당 주간 일별 레코드
}

interface FlutterBridgeData {
  userName: string;
  isVehicleConnected: boolean;
  plateNumber: string;
  vehicleName: string;
  checkIn: string;
  checkOut: string;
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

// ─── 달력 주간 계산 ───────────────────────────────────────────
// 일요일(0) 기준 주간 리스트를 선택 월 기준으로 생성
// 첫 주: 해당 월 포함된 일요일부터 시작
// 마지막 주: 해당 월 마지막 날 포함된 주까지
function generateWeeks(yearMonth: string): { weekLabel: string; dateFrom: string; dateTo: string }[] {
  const [y, m] = yearMonth.split('.').map(Number);
  const fmt = (d: Date) =>
    `${String(d.getFullYear()).slice(2)}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
  const iso = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const DAY = ['일', '월', '화', '수', '목', '금', '토'];

  // 해당 월 1일이 속한 주의 일요일 구하기
  const firstDay = new Date(y, m - 1, 1);
  const startSun = new Date(firstDay);
  startSun.setDate(firstDay.getDate() - firstDay.getDay()); // 이전 일요일

  // 해당 월 마지막 날
  const lastDay = new Date(y, m, 0);

  const weeks: { weekLabel: string; dateFrom: string; dateTo: string }[] = [];
  const cur = new Date(startSun);

  while (cur <= lastDay) {
    const from = new Date(cur);
    const to   = new Date(cur);
    to.setDate(to.getDate() + 6);

    const label = `${fmt(from)} (${DAY[from.getDay()]}) ~ ${fmt(to)} (${DAY[to.getDay()]})`;
    weeks.push({ weekLabel: label, dateFrom: iso(from), dateTo: iso(to) });

    cur.setDate(cur.getDate() + 7);
  }

  return weeks;
}

// ─── 주간 더미 데이터 빌더 (ALL_DUMMY_DAYS 합산) ──────────────
function buildWeeks(yearMonth: string): WeekRecord[] {
  return generateWeeks(yearMonth).map(w => {
    const days = ALL_DUMMY_DAYS.filter(d => d.date >= w.dateFrom && d.date <= w.dateTo);
    const regularH  = days.reduce((a, d) => a + d.regularH,  0);
    const overtimeH = days.reduce((a, d) => a + d.overtimeH, 0);
    const nightH    = days.reduce((a, d) => a + d.nightH,    0);
    return { ...w, regularH, overtimeH, nightH, days };
  });
}


// ─── 반원 게이지 ──────────────────────────────────────────────
// stroke-dasharray 방식을 사용하여 이음새와 각도 문제를 완벽히 해결
function SemiCircleGauge({ regular, overtime, night }: { regular: number; overtime: number; night: number }) {
  const total = regular + overtime + night || 1;

  // 비율
  const rPct = regular  / total;
  const oPct = overtime / total;
  const nPct = night    / total;

  const VW = 250;
  const VH = 135;
  const cx = VW / 2;
  const cy = 115;
  const R  = 96;
  const SW = 22;

  // 반원의 총 길이 (π * r)
  const arcLength = Math.PI * R;

  // dashoffset 계산 (채워진 만큼 왼쪽으로 밀어냄)
  // 가장 첫 번째(정규)는 offset=0, 그 다음(초과)은 offset = -rLen, 이런 식인데
  // 간단하게 겹쳐 그리는 방식: 전부 다 그리고, 윗단부터 덮어씌움.
  
  // 1. 전체 (정규+초과+야간) : 배경(가장 아래) -> 야간 색상으로 칠함 (어차피 맨 오른쪽 끝만 남음)
  const layer1Len = arcLength; // 100%
  // 2. 정규+초과 : 그 위에 덧씌움 -> 초과 색상으로 칠함 (가운데+왼쪽)
  const layer2Len = arcLength * (rPct + oPct);
  // 3. 정규 : 가장 마지막(최상단)에 덧씌움 -> 정규 색상 (왼쪽만 남음)
  const layer3Len = arcLength * rPct;

  // 아크 경로 (왼쪽 끝 -> 오른쪽 끝, 시계방향 위쪽 반원 180도 고정)
  const baseArcD = `M ${cx - R} ${cy} A ${R} ${R} 0 0 1 ${cx + R} ${cy}`;

  const totalH = regular + overtime + night;
  const mins   = Math.round((totalH % 1) * 60);
  const label  = mins > 0 ? `${Math.floor(totalH)}시간 ${mins}분` : `${totalH}시간`;

  return (
    <div style={gaugeStyles.wrapper}>
      <svg
        viewBox={`0 0 ${VW} ${VH}`}
        width="100%"
        style={{ display: 'block', maxWidth: 260, margin: '0 auto' }}
      >
        {/*
          stroke-dasharray="차오르는길이 안보이는길이" 형태로 구현.
          가장 아래에 전체(야간색), 그 위에 부분(초과색), 가장 위에 부분(정규색)을 순서대로 쌓음.
          단, 선 끝이 딱 떨어지게 butt 캡 사용.
        */}

        {/* 1. 밑바탕 트랙 (투명/배경색, 180도 전체) */}
        <path d={baseArcD} fill="none" stroke="#f0f4ff" strokeWidth={SW - 0.5} strokeLinecap="butt" />

        {/* 2. 가장 아래 레이어 (야간 - 주황색) : 100% 길이 */}
        {nPct > 0 && (
          <path
            d={baseArcD} fill="none" stroke="#f59e0b" strokeWidth={SW} strokeLinecap="butt"
            strokeDasharray={`${layer1Len} ${arcLength}`}
            strokeDashoffset="0"
          />
        )}

        {/* 3. 중간 레이어 (초과 - 초록색) : 정규+초과 길이만큼 */}
        {oPct > 0 && (
          <path
            d={baseArcD} fill="none" stroke="#22c55e" strokeWidth={SW} strokeLinecap="butt"
            strokeDasharray={`${layer2Len} ${arcLength}`}
            strokeDashoffset="0"
          />
        )}

        {/* 4. 최상단 레이어 (정규 - 파란색) : 정규 길이만큼 */}
        {rPct > 0 && (
          <path
            d={baseArcD} fill="none" stroke="#4f7cff" strokeWidth={SW} strokeLinecap="butt"
            strokeDasharray={`${layer3Len} ${arcLength}`}
            strokeDashoffset="0"
          />
        )}

        {/* 총 시간 텍스트 */}
        <text x={cx} y={cy - 10} textAnchor="middle" fontSize="22" fontWeight="700" fill="#111827">
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
    backgroundColor: '#f0f4ff',
    borderRadius: 16,
    margin: '12px 16px',
    padding: '16px 12px 14px',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
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

  const today = new Date();
  const DEFAULT_MONTH = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, '0')}`;
  
  // sessionStorage에서 초기값 가져오기
  const initMonth = sessionStorage.getItem('attendance_month') || DEFAULT_MONTH;

  const [selectedMonth, setSelectedMonth] = useState<string>(initMonth);
  const [showPopup, setShowPopup] = useState(false);
  const [weeks, setWeeks] = useState<WeekRecord[]>(buildWeeks(initMonth));
  const [loaded, setLoaded] = useState(true);

  const scrollRef = React.useRef<HTMLDivElement>(null);

  // 초기 렌더링 시 스크롤 복구
  useEffect(() => {
    const savedScroll = sessionStorage.getItem('attendance_scroll');
    if (savedScroll && scrollRef.current) {
      scrollRef.current.scrollTop = parseInt(savedScroll, 10);
    }
  }, []);

  // 월 선택 변경 시 갱신 및 sessionStorage 저장
  const handleSelectMonth = (m: string) => {
    setSelectedMonth(m);
    sessionStorage.setItem('attendance_month', m);
    setShowPopup(false);
    setWeeks(buildWeeks(m));
    setLoaded(true);
  };

  // 라우팅 시 스크롤 저장 핸들러
  const handleNavigate = (path: string, state?: any) => {
    if (scrollRef.current) {
      sessionStorage.setItem('attendance_scroll', scrollRef.current.scrollTop.toString());
    }
    navigate(path, { state });
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
      <div style={styles.scrollArea} ref={scrollRef}>

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
              {/* 주간 목록 */}
              <div style={styles.listWrapper}>
                {weeks.map((w, i) => (
                  <div
                    key={i}
                    style={{
                      ...styles.weekRow,
                      borderBottom: i < weeks.length - 1 ? '1px solid #f0f0f0' : 'none',
                      cursor: 'pointer',
                    }}
                    onClick={() => handleNavigate('/attendance/detail', {
                      dateFrom: w.dateFrom, dateTo: w.dateTo, weekLabel: w.weekLabel, days: w.days
                    })}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <span style={styles.weekLabel}>{w.weekLabel.split(' ~ ')[0]}</span>
                      <span style={{ ...styles.weekLabel, color: '#999', fontSize: 11 }}>~ {w.weekLabel.split(' ~ ')[1]}</span>
                    </div>
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
          <button style={styles.adjustRow} onClick={() => handleNavigate('/attendance/adjustment')}>
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
    backgroundColor: 'transparent', border: 'none',
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
    overflow: 'hidden',
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
    backgroundColor: 'transparent', border: 'none',
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
