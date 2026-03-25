import React from 'react';
import { SelectDropdown } from '../../components/SelectDropdown';
import { barColor, barWidth } from './useMaintenance';
import type { MaintenanceItem, UseMaintenanceReturn } from './useMaintenance';

// ─── 정비 항목 카드 ──────────────────────────────────────────
function MaintenanceCard({
  item,
  onItemClick,
  onRegisterClick,
}: {
  item: MaintenanceItem;
  onItemClick: (item: MaintenanceItem) => void;
  onRegisterClick: (item: MaintenanceItem) => void;
}) {
  const color = barColor(item.elapsedKm, item.intervalKm);
  const width = barWidth(item.elapsedKm, item.intervalKm);
  const over  = item.elapsedKm >= item.intervalKm;

  return (
    <div style={styles.card} onClick={() => onItemClick(item)}>
      <div style={styles.cardHeader}>
        <span style={styles.itemName}>{item.name}</span>
        <span
          style={styles.registerBtn}
          onClick={(e) => { e.stopPropagation(); onRegisterClick(item); }}
        >
          정비등록
        </span>
      </div>
      <div style={styles.barBg}>
        <div style={{ ...styles.barFill, width: `${width}%`, backgroundColor: color }} />
      </div>
      <div style={styles.barLabels}>
        <span style={{ color, fontSize: 12, fontWeight: 600 }}>
          {item.elapsedKm.toLocaleString()}km {over ? '초과' : '경과'}
        </span>
        <span style={styles.intervalLabel}>{item.intervalKm.toLocaleString()}km</span>
      </div>
    </div>
  );
}

// ─── View 컴포넌트 (순수 UI) ─────────────────────────────────
export function MaintenanceView({
  vehicles,
  selectedVehicleId,
  items,
  onSelectVehicle,
  onItemClick,
  onRegisterClick,
}: UseMaintenanceReturn) {
  
  const vehicleOptions = vehicles.map(v => ({
    label: `${v.plateNumber} ${v.name}`,
    value: v.id,
  }));

  return (
    <div style={styles.container}>

      {/* ── 고정 헤더 (차량 선택기) ─────────────────────────── */}
      <div style={{ ...styles.fixedHeader, position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ padding: '16px 16px 8px' }}>
          <SelectDropdown
            value={selectedVehicleId}
            onChange={onSelectVehicle}
            options={vehicleOptions}
            placeholder="선택된 차량 없음"
            headerLabel="차량 선택"
          />
        </div>
      </div>

      {/* ── 정비 항목 리스트 ─────────────────────────────────── */}
      <div style={styles.scrollArea}>
        <div style={styles.listWrapper}>
          {items.map((item) => (
            <MaintenanceCard
              key={item.id}
              item={item}
              onItemClick={onItemClick}
              onRegisterClick={onRegisterClick}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── 스타일 ──────────────────────────────────────────────────
const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex', flexDirection: 'column',
    backgroundColor: '#fff', fontFamily: "'Pretendard','Noto Sans KR',sans-serif",
  },
  fixedHeader: { flexShrink: 0, backgroundColor: '#fff' },
  userBar: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '12px 16px 8px',
  },
  userLeft:  { display: 'flex', alignItems: 'center', gap: 8 },
  logoIcon: { width: 'auto', height: 'auto', objectFit: 'contain' as const },
  userName:  { fontSize: 18, fontWeight: 700, color: '#111' },
  vehicleBar: {
    display: 'flex', alignItems: 'center', gap: 8,
    margin: '0 16px 8px', padding: '8px 16px',
    backgroundColor: '#fff', borderRadius: 30, border: '1.5px solid #2b5cff',
  },
  megaphoneIcon: { width: 20, height: 20, objectFit: 'contain' as const },
  divider:       { width: 1, height: 14, backgroundColor: '#d1d5db', flexShrink: 0 },
  vehicleInfo:   { fontSize: 14, color: '#444', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const },
  scrollArea: { display: 'flex', flexDirection: 'column' },
  listWrapper: { display: 'flex', flexDirection: 'column', gap: 0, padding: '8px 0' },
  card: {
    margin: '6px 16px', padding: '14px 16px',
    backgroundColor: '#ffffff', borderRadius: 12,
    border: '1px solid #f1f3f5', boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
    cursor: 'pointer',
  },
  cardHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 10,
  },
  itemName:      { fontSize: 15, fontWeight: 700, color: '#111' },
  registerBtn:   { fontSize: 12, color: '#888', cursor: 'pointer' },
  barBg: {
    height: 8, borderRadius: 4, backgroundColor: '#e5e7eb',
    overflow: 'hidden', marginBottom: 6,
  },
  barFill:       { height: '100%', borderRadius: 4, transition: 'width 0.3s' },
  barLabels:     { display: 'flex', justifyContent: 'space-between' },
  intervalLabel: { fontSize: 12, color: '#999' },
};
