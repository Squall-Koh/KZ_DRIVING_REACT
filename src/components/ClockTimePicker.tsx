import { useState } from 'react';
import React from 'react';

interface Props {
  value: string;           // "HH:MM"
  onConfirm: (v: string) => void;
  onCancel: () => void;
}

type PickMode = 'hour' | 'minute';

const CX = 130, CY = 130;
const R_OUT = 100;   // 바깥 링 (시 0–11, 분)
const R_IN  = 65;    // 안쪽 링 (시 12–23)
const R_DOT = 4;     // 선택 점 크기

// ── 각도 → 숫자 ────────────────────────────────────────────
function angleToHour(ax: number, ay: number): { h: number; outer: boolean } {
  const dist = Math.sqrt(ax * ax + ay * ay);
  let a = Math.atan2(ay, ax) + Math.PI / 2; // 12시 = 0
  if (a < 0) a += 2 * Math.PI;
  const idx = Math.round((a / (2 * Math.PI)) * 12) % 12;
  const outer = dist > (R_OUT + R_IN) / 2;
  return { h: outer ? idx : idx + 12, outer };
}

function angleToMinute(ax: number, ay: number): number {
  let a = Math.atan2(ay, ax) + Math.PI / 2;
  if (a < 0) a += 2 * Math.PI;
  return Math.round((a / (2 * Math.PI)) * 60) % 60;
}

// ── 시계 숫자 좌표 ──────────────────────────────────────────
function pos(idx: number, total: number, r: number) {
  const a = ((idx / total) * 2 * Math.PI) - Math.PI / 2;
  return { x: CX + r * Math.cos(a), y: CY + r * Math.sin(a) };
}

// ── 시침/분침 끝점 ─────────────────────────────────────────
function handPos(val: number, total: number, r: number) {
  const a = ((val / total) * 2 * Math.PI) - Math.PI / 2;
  return { x: CX + r * Math.cos(a), y: CY + r * Math.sin(a) };
}

export function ClockTimePicker({ value, onConfirm, onCancel }: Props) {
  const parts = value.split(':');
  const [hour,   setHour]   = useState(parseInt(parts[0]) || 0);
  const [minute, setMinute] = useState(parseInt(parts[1]) || 0);
  const [mode,   setMode]   = useState<PickMode>('hour');

  const pad = (n: number) => String(n).padStart(2, '0');

  // ── SVG 클릭 핸들러 ────────────────────────────────────────
  function handleClick(e: React.MouseEvent<SVGSVGElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const ax = e.clientX - rect.left - CX;
    const ay = e.clientY - rect.top  - CY;

    if (mode === 'hour') {
      const { h } = angleToHour(ax, ay);
      setHour(h);
      setMode('minute');
    } else {
      setMinute(angleToMinute(ax, ay));
    }
  }

  // ── 시침 / 분침 — 숫자 원 앞에서 멈춤 ───────────────────────
  const handR  = hour < 12 ? R_OUT - 22 : R_IN - 18;  // 숫자 원 앞 여백
  const hourHP = handPos(hour % 12, 12, handR);
  const minHP  = handPos(minute, 60, R_OUT - 22);

  return (
    <div style={css.overlay}>
      <div style={css.card}>

        {/* 시간 표시 */}
        <div style={css.display}>
          <span
            style={{ ...css.displayNum, color: mode === 'hour' ? '#4f7cff' : '#aaa' }}
            onClick={() => setMode('hour')}
          >{pad(hour)}</span>
          <span style={css.colon}>:</span>
          <span
            style={{ ...css.displayNum, color: mode === 'minute' ? '#4f7cff' : '#aaa' }}
            onClick={() => setMode('minute')}
          >{pad(minute)}</span>
        </div>

        {/* 시계 */}
        <svg
          width={CX * 2} height={CY * 2}
          style={{ cursor: 'pointer', display: 'block', margin: '0 auto' }}
          onClick={handleClick}
        >
          {/* 배경 원 */}
          <circle cx={CX} cy={CY} r={R_OUT + 18} fill="#f0f4ff" />

          {/* 시 모드 */}
          {mode === 'hour' && (
            <>
              {/* 바깥 링 숫자: 0–11 */}
              {Array.from({ length: 12 }, (_, i) => {
                const { x, y } = pos(i, 12, R_OUT);
                const selected = hour === i;
                return (
                  <g key={i}>
                    {selected && <circle cx={x} cy={y} r={18} fill="#4f7cff" />}
                    <text x={x} y={y} textAnchor="middle" dominantBaseline="central"
                      fontSize={13} fontWeight={selected ? 700 : 400}
                      fill={selected ? '#fff' : '#333'}>{i}</text>
                  </g>
                );
              })}
              {/* 안쪽 링 숫자: 12–23 */}
              {Array.from({ length: 12 }, (_, i) => {
                const h = i + 12;
                const { x, y } = pos(i, 12, R_IN);
                const selected = hour === h;
                return (
                  <g key={h}>
                    {selected && <circle cx={x} cy={y} r={14} fill="#4f7cff" />}
                    <text x={x} y={y} textAnchor="middle" dominantBaseline="central"
                      fontSize={11} fontWeight={selected ? 700 : 400}
                      fill={selected ? '#fff' : '#555'}>{h}</text>
                  </g>
                );
              })}
              {/* 시침 */}
              <line x1={CX} y1={CY} x2={hourHP.x} y2={hourHP.y}
                stroke="#4f7cff" strokeWidth={2} strokeLinecap="round" />
              <circle cx={CX} cy={CY} r={R_DOT} fill="#4f7cff" />
              <circle cx={hourHP.x} cy={hourHP.y} r={R_DOT} fill="#4f7cff" />
            </>
          )}

          {/* 분 모드 */}
          {mode === 'minute' && (
            <>
              {/* 5분 단위 숫자 */}
              {Array.from({ length: 12 }, (_, i) => {
                const m = i * 5;
                const { x, y } = pos(i, 12, R_OUT);
                const selected = Math.round(minute / 5) * 5 % 60 === m;
                return (
                  <g key={m}>
                    {selected && <circle cx={x} cy={y} r={18} fill="#4f7cff" />}
                    <text x={x} y={y} textAnchor="middle" dominantBaseline="central"
                      fontSize={13} fontWeight={selected ? 700 : 400}
                      fill={selected ? '#fff' : '#333'}>{pad(m)}</text>
                  </g>
                );
              })}
              {/* 분침 */}
              <line x1={CX} y1={CY} x2={minHP.x} y2={minHP.y}
                stroke="#4f7cff" strokeWidth={2} strokeLinecap="round" />
              <circle cx={CX} cy={CY} r={R_DOT} fill="#4f7cff" />
              <circle cx={minHP.x} cy={minHP.y} r={R_DOT} fill="#4f7cff" />
            </>
          )}
        </svg>

        {/* AM / PM 표시 */}
        <div style={css.ampm}>
          <span style={hour < 12 ? css.ampmActive : css.ampmInactive}>AM</span>
          <span style={{ margin: '0 8px', color: '#ccc' }}>|</span>
          <span style={hour >= 12 ? css.ampmActive : css.ampmInactive}>PM</span>
        </div>

        {/* 버튼 */}
        <div style={css.btnRow}>
          <button style={css.cancelBtn} onClick={onCancel}>취소</button>
          <button style={css.okBtn} onClick={() => onConfirm(`${pad(hour)}:${pad(minute)}`)}>확인</button>
        </div>

      </div>
    </div>
  );
}

const css: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed', inset: 0,
    backgroundColor: 'rgba(0,0,0,0.45)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 200,
  },
  card: {
    backgroundColor: '#fff', borderRadius: 20,
    padding: '24px 20px 16px',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
    boxShadow: '0 8px 40px rgba(0,0,0,0.18)',
    minWidth: 300,
  },
  display: {
    display: 'flex', alignItems: 'center', gap: 4,
    backgroundColor: '#f0f4ff', borderRadius: 12,
    padding: '10px 20px',
  },
  displayNum: {
    fontSize: 36, fontWeight: 700, cursor: 'pointer', minWidth: 48, textAlign: 'center' as const,
  },
  colon: { fontSize: 36, fontWeight: 700, color: '#bbb' },
  ampm: { display: 'flex', alignItems: 'center', fontSize: 14, fontWeight: 600 },
  ampmActive:   { color: '#4f7cff' },
  ampmInactive: { color: '#bbb' },
  btnRow: { display: 'flex', gap: 10, width: '100%', marginTop: 4 },
  cancelBtn: {
    flex: 1, padding: '12px 0', fontSize: 15, fontWeight: 600,
    border: '1px solid #e5e7eb', borderRadius: 12, backgroundColor: '#fff',
    color: '#555', cursor: 'pointer',
  },
  okBtn: {
    flex: 1, padding: '12px 0', fontSize: 15, fontWeight: 700,
    border: 'none', borderRadius: 12, backgroundColor: '#4f7cff',
    color: '#fff', cursor: 'pointer',
  },
};
