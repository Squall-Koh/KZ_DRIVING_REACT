import React, { useState } from 'react';

export interface SelectOption {
  label: React.ReactNode;
  value: string;
}

interface SelectDropdownProps {
  value: string;
  onChange: (v: string) => void;
  options: SelectOption[];
  placeholder: string;
  headerLabel: string;
}

export function SelectDropdown({ 
  value, 
  onChange, 
  options, 
  placeholder,
  headerLabel
}: SelectDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOpt = options.find(o => o.value === value);

  return (
    <div style={s.dropdownWrapper}>
      <button 
        style={{ ...s.selectInput, color: selectedOpt ? '#111' : '#64748b' }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div style={{ flex: 1, textAlign: 'left', display: 'flex', alignItems: 'center' }}>
          {selectedOpt ? selectedOpt.label : placeholder}
        </div>
        <span style={{ fontSize: 14, color: '#64748b', transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▼</span>
      </button>

      {isOpen && (
        <>
          <div style={s.dropdownBackdrop} onClick={() => setIsOpen(false)} />
          <div style={s.dropdownMenu}>
            <div style={s.dropdownMenuHeader}>
              <span>{headerLabel || placeholder}</span>
              <span style={{ fontSize: 16, cursor: 'pointer', padding: '0 4px', color: '#888' }} onClick={() => setIsOpen(false)}>
                ▲
              </span>
            </div>
            <div style={s.dropdownList}>
              {options.map(opt => (
                <div 
                  key={opt.value}
                  style={{
                    ...s.dropdownItem,
                    backgroundColor: opt.value === value ? '#eff6ff' : 'transparent',
                  }}
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                >
                  {opt.label}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  dropdownWrapper: { position: 'relative' as const },
  dropdownBackdrop: { position: 'fixed' as const, top: 0, left: 0, right: 0, bottom: 0, zIndex: 200 },
  selectInput: {
    width: '100%', padding: '12px', borderRadius: 8, border: '1px solid #e2e8f0',
    backgroundColor: '#fff', fontSize: 15, textAlign: 'left' as const,
    display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer',
    boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
  },
  dropdownMenu: {
    position: 'absolute' as const, top: 0, left: 0, width: '100%', 
    backgroundColor: '#fff', borderRadius: 12, zIndex: 201,
    boxShadow: '0 4px 24px rgba(0,0,0,0.12)', border: '1px solid #f1f5f9',
    display: 'flex', flexDirection: 'column', overflow: 'hidden'
  },
  dropdownMenuHeader: {
    padding: '16px 16px 12px', fontSize: 14, color: '#8e8e93', display: 'flex', 
    justifyContent: 'space-between', alignItems: 'center',
  },
  dropdownMenuClose: { fontSize: 16, cursor: 'pointer', padding: '0 4px' },
  dropdownList: { paddingBottom: 8, maxHeight: 240, overflowY: 'auto' },
  dropdownItem: {
    padding: '12px 16px', fontSize: 15, color: '#111', cursor: 'pointer',
    transition: 'background-color 0.2s'
  },
};
