import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import iconKz from '../../assets/icon_kz.png';
import iconMegaphone from '../../assets/icon_megaphone.png';

// ── 정비 항목 타입 ──────────────────────────────────────────
interface MaintenanceItem {
  id: string;
  name: string;
  elapsedKm: number;
  intervalKm: number;
}

// ── 더미 데이터 ──────────────────────────────────────────────
const MAINTENANCE_ITEMS: MaintenanceItem[] = [
  { id: 'engine_oil',   name: '엔진오일',          elapsedKm:  2000, intervalKm: 10000 },
  { id: 'air_filter',   name: '공기 / 에어컨 필터', elapsedKm: 12000, intervalKm: 10000 },
  { id: 'battery',      name: '배터리',             elapsedKm: 32000, intervalKm: 40000 },
  { id: 'trans_oil',    name: '변속기 오일',         elapsedKm: 32000, intervalKm: 40000 },
  { id: 'tire',         name: '타이어',             elapsedKm:  2000, intervalKm: 50000 },
  { id: 'spark_plug',   name: '점화플러그',          elapsedKm:  2000, intervalKm: 60000 },
];

function barColor(elapsed: number, interval: number): string {
  const pct = elapsed / interval;
  if (pct >= 1)    return '#ef4444';
  if (pct >= 0.75) return '#f59e0b';
  return '#22c55e';
}
function barWidth(elapsed: number, interval: number): number {
  return Math.min((elapsed / interval) * 100, 100);
}

export function Maintenance() {
  const navigate = useNavigate();
  const [showVehicleMenu, setShowVehicleMenu] = useState(false);

  const userName = '강무호';
  const isConnected = false;
  const plateNumber = '';
  const vehicleName = '연결된 차량이 없습니다';
  const selectedVehicle = '154 후 5698 벤츠 스프린터';

  return (
    <div style={s.container}>

      {/* ── 고정 헤더 (Attendance 스타일) ── */}
      <div style={s.fixedHeader}>
        {/* 사용자 바 */}
        <div style={s.userBar}>
          <div style={s.userLeft}>
            <img src={iconKz} alt="kz" style={s.logoIcon} />
            <span style={s.userName}>{userName}님</span>
          </div>
        </div>

        {/* 차량 연결 바 (Attendance vehicleBar 스타일) */}
        <div style={s.vehicleBar}>
          <img src={iconMegaphone} alt="차량" style={s.megaphoneIcon} />
          <span style={s.vehicleBadge}>{isConnected ? '차량연결됨' : '연결대기중'}</span>
          <span style={s.vehicleInfo}>{isConnected ? `[${plateNumber}] ${vehicleName}` : vehicleName}</span>
        </div>

        {/* 차량 선택 — vehicleBar와 동일한 라운드 pill 스타일 */}
        <div style={s.vehicleSelector} onClick={() => setShowVehicleMenu(v => !v)}>
          <span style={s.vehicleSelectorName}>{selectedVehicle}</span>
          <span style={s.chevron}>{showVehicleMenu ? '▲' : '▼'}</span>
        </div>
      </div>

      {/* ── 정비 항목 리스트 (Notifications 카드 스타일) ── */}
      <div style={s.scrollArea}>
        <div style={s.listWrapper}>
          {MAINTENANCE_ITEMS.map(item => {
            const color = barColor(item.elapsedKm, item.intervalKm);
            const width = barWidth(item.elapsedKm, item.intervalKm);
            const over  = item.elapsedKm >= item.intervalKm;
            return (
              <div
                key={item.id}
                style={s.card}
                onClick={() => navigate('/maintenance/detail', { state: { item } })}
              >
                <div style={s.cardHeader}>
                  <span style={s.itemName}>{item.name}</span>
                  <span
                    style={s.registerBtn}
                    onClick={e => { e.stopPropagation(); navigate('/maintenance/detail', { state: { item } }); }}
                  >정비등록</span>
                </div>
                {/* 프로그레스 바 */}
                <div style={s.barBg}>
                  <div style={{ ...s.barFill, width: `${width}%`, backgroundColor: color }} />
                </div>
                <div style={s.barLabels}>
                  <span style={{ color, fontSize: 12, fontWeight: 600 }}>
                    {item.elapsedKm.toLocaleString()}km {over ? '초과' : '경과'}
                  </span>
                  <span style={s.intervalLabel}>{item.intervalKm.toLocaleString()}km</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex', flexDirection: 'column', height: '100vh',
    backgroundColor: '#f5f5f7', fontFamily: "'Pretendard','Noto Sans KR',sans-serif",
    overflow: 'hidden',
  },

  /* ── 고정 헤더 (Attendance 스타일) ── */
  fixedHeader: {
    flexShrink: 0, backgroundColor: '#f5f5f7',
  },
  userBar: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '12px 16px 8px',
  },
  userLeft:    { display: 'flex', alignItems: 'center', gap: 8 },
  logoIcon:    { width: 28, height: 28, objectFit: 'contain' as const },
  userName:    { fontSize: 16, fontWeight: 700, color: '#111' },

  /* 차량 연결 바 — Attendance vehicleBar 그대로 */
  vehicleBar: {
    display: 'flex', alignItems: 'center', gap: 8,
    margin: '0 16px 8px', padding: '10px 14px',
    backgroundColor: '#fff', borderRadius: 24, border: '1px solid #e0e7ff',
  },
  megaphoneIcon: { width: 18, height: 18, objectFit: 'contain' as const },
  vehicleBadge:  { fontSize: 12, fontWeight: 700, color: '#2563eb', whiteSpace: 'nowrap' as const },
  vehicleInfo:   { fontSize: 12, color: '#444', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const },

  /* 차량 선택 — vehicleBar와 동일한 라운드 pill */
  vehicleSelector: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    margin: '0 16px 8px', padding: '10px 14px',
    backgroundColor: '#fff', borderRadius: 24, border: '1px solid #e0e7ff',
    cursor: 'pointer',
  },
  vehicleSelectorName: { fontSize: 14, fontWeight: 600, color: '#111' },
  chevron:             { fontSize: 12, color: '#888' },

  /* ── 스크롤 영역 ── */
  scrollArea: {
    flex: 1, overflowY: 'auto' as const,
  },
  listWrapper: {
    display: 'flex', flexDirection: 'column', gap: 0, padding: '8px 0',
  },

  /* ── Notifications 스타일 카드 ── */
  card: {
    margin: '6px 16px',
    padding: '14px 16px',
    backgroundColor: '#ffffff',
    borderRadius: 10,
    border: '1px solid #eeeeee',
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
    cursor: 'pointer',
  },
  cardHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 10,
  },
  itemName:    { fontSize: 15, fontWeight: 700, color: '#111' },
  registerBtn: { fontSize: 12, color: '#888', cursor: 'pointer' },

  /* 프로그레스 바 */
  barBg: {
    height: 8, borderRadius: 4, backgroundColor: '#e5e7eb', overflow: 'hidden', marginBottom: 6,
  },
  barFill: {
    height: '100%', borderRadius: 4, transition: 'width 0.3s',
  },
  barLabels:     { display: 'flex', justifyContent: 'space-between' },
  intervalLabel: { fontSize: 12, color: '#999' },
};
