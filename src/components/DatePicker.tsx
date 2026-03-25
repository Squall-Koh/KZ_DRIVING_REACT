import React, { useState } from 'react';

interface DatePickerProps {
  initialDate?: string; // "YYYY-MM-DD"
  onConfirm: (date: string) => void;
  onCancel: () => void;
}

export function DatePicker({ initialDate, onConfirm, onCancel }: DatePickerProps) {
  const [baseDate, setBaseDate] = useState(() => {
    return initialDate ? new Date(initialDate) : new Date();
  });
  const [selected, setSelected] = useState<string | null>(initialDate || null);

  const year = baseDate.getFullYear();
  const month = baseDate.getMonth(); // 0-11

  const formatYMD = (y: number, m: number, d: number) => {
    return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  };

  const getDaysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
  const getFirstDayOfMonth = (y: number, m: number) => new Date(y, m, 1).getDay();

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const prevMonth = () => {
    setBaseDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setBaseDate(new Date(year, month + 1, 1));
  };

  const handleDateClick = (d: number) => {
    setSelected(formatYMD(year, month, d));
  };

  const handleConfirm = () => {
    if (selected) {
      onConfirm(selected);
    }
  };

  const weeks = [];
  let currentWeek = [];
  
  // Empty slots for first week
  for (let i = 0; i < firstDay; i++) {
    currentWeek.push(null);
  }

  // Fill days
  for (let d = 1; d <= daysInMonth; d++) {
    currentWeek.push(d);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }
  
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push(null);
    }
    weeks.push(currentWeek);
  }

  return (
    <div style={s.overlay} onClick={onCancel}>
      <div style={s.modal} onClick={(e) => e.stopPropagation()}>
        <div style={s.header}>
          날짜 선택
          <span style={s.closeBtn} onClick={onCancel}>✕</span>
        </div>
        
        <div style={s.monthNav}>
          <button style={s.navBtn} onClick={prevMonth}>‹</button>
          <span style={s.monthTitle}>{year}년 {month + 1}월</span>
          <button style={s.navBtn} onClick={nextMonth}>›</button>
        </div>

        <div style={s.weekCol}>
          {['일', '월', '화', '수', '목', '금', '토'].map((wd, i) => (
            <div key={i} style={{ ...s.wdcell, color: i === 0 ? '#ef4444' : i === 6 ? '#3b82f6' : '#888' }}>
              {wd}
            </div>
          ))}
        </div>

        <div style={s.calendarBody}>
          {weeks.map((wk, wi) => (
            <div key={wi} style={s.weekRow}>
              {wk.map((d, di) => {
                if (d === null) return <div key={di} style={s.daycell} />;
                
                const currentStr = formatYMD(year, month, d);
                const isSelected = currentStr === selected;
                
                return (
                  <div key={di} style={s.daycell} onClick={() => handleDateClick(d)}>
                    <div style={{
                      ...s.dayCircle,
                      ...(isSelected ? s.selectedDay : {}),
                    }}>
                      <span style={{ 
                        ...(isSelected ? { color: '#fff', fontWeight: 700 } : {}),
                        ...(di === 0 && !isSelected ? { color: '#ef4444' } : {}),
                        ...(di === 6 && !isSelected ? { color: '#3b82f6' } : {})
                      }}>{d}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        <div style={s.footer}>
          <button 
            style={{ ...s.confirmBtn, ...(selected ? {} : s.confirmDisabled) }}
            onClick={handleConfirm}
            disabled={!selected}
          >
            {selected ? `${selected} 선택` : '날짜를 선택해주세요'}
          </button>
        </div>
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed' as const, inset: 0, backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
    fontFamily: "'Pretendard','Noto Sans KR',sans-serif",
  },
  modal: {
    backgroundColor: '#fff', width: '90%', maxWidth: 360, borderRadius: 16,
    display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 8px 30px rgba(0,0,0,0.12)'
  },
  header: {
    padding: '16px', fontSize: 16, fontWeight: 700, color: '#111', 
    textAlign: 'center' as const, position: 'relative' as const, borderBottom: '1px solid #f0f0f0'
  },
  closeBtn: {
    position: 'absolute' as const, right: 16, top: 16, fontSize: 18, 
    color: '#888', cursor: 'pointer', lineHeight: 1
  },
  monthNav: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px 10px'
  },
  navBtn: {
    fontSize: 24, padding: '0 10px', background: 'none', border: 'none', color: '#666', cursor: 'pointer'
  },
  monthTitle: { fontSize: 16, fontWeight: 700, color: '#111' },
  weekCol: {
    display: 'flex', padding: '0 16px', marginBottom: 8
  },
  wdcell: {
    flex: 1, textAlign: 'center' as const, fontSize: 13, fontWeight: 600
  },
  calendarBody: {
    padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 4, minHeight: 250
  },
  weekRow: {
    display: 'flex', alignContent: 'center'
  },
  daycell: {
    flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', 
    height: 40, cursor: 'pointer'
  },
  dayCircle: {
    width: 32, height: 32, borderRadius: 16, display: 'flex', 
    justifyContent: 'center', alignItems: 'center', fontSize: 14, color: '#333'
  },
  selectedDay: {
    backgroundColor: '#4f7cff', color: '#fff'
  },
  footer: {
    padding: '16px', borderTop: '1px solid #f0f0f0'
  },
  confirmBtn: {
    width: '100%', padding: '14px 0', fontSize: 15, fontWeight: 700,
    border: 'none', borderRadius: 10, backgroundColor: '#4f7cff', color: '#fff', cursor: 'pointer', transition: '0.2s'
  },
  confirmDisabled: {
    backgroundColor: '#cdd6fc', cursor: 'not-allowed'
  }
};
