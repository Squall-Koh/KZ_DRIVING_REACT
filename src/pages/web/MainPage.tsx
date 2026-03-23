import React from 'react';
import { useNavigate } from 'react-router-dom';

// ─── 페이지 목록 ─────────────────────────────────────────────
const MOBILE_PAGES = [
  { label: '알림', emoji: '🔔', path: '/notifications',         desc: '차량 연결, 운행, 출퇴근 알림' },
  { label: '운행내역', emoji: '🚗', path: '/driving-history',   desc: '일별 운행 경로 및 이력 조회' },
  { label: '근태관리', emoji: '📅', path: '/attendance',         desc: '월간 근무시간 및 주간 통계' },
  { label: '정비관리', emoji: '🔧', path: '/maintenance',        desc: '차량 정비 일정 및 이력 관리' },
  { label: '영수증', emoji: '🧾', path: '/receipts',             desc: '경비 영수증 등록 및 조회' },
];

export function MainPage() {
  const navigate = useNavigate();

  return (
    <div style={styles.page}>
      <div style={styles.hero}>
        <div style={styles.heroInner}>
          <div style={styles.badge}>SORIN Car Management</div>
          <h1 style={styles.heroTitle}>스마트 차량 관리<br />플랫폼</h1>
          <p style={styles.heroSub}>
            Fleet 운영부터 근태·정비까지,<br />
            하나의 앱에서 간편하게 관리하세요.
          </p>
        </div>
        <div style={styles.heroDecor} aria-hidden="true" />
      </div>

      <div style={styles.content}>
        <p style={styles.sectionLabel}>Mobile WebView Pages</p>
        <div style={styles.grid}>
          {MOBILE_PAGES.map((p) => (
            <button
              key={p.path}
              style={styles.card}
              onClick={() => navigate(p.path)}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-4px)';
                (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 12px 32px rgba(59,130,246,0.18)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
                (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 2px 12px rgba(0,0,0,0.07)';
              }}
            >
              <span style={styles.cardEmoji}>{p.emoji}</span>
              <span style={styles.cardLabel}>{p.label}</span>
              <span style={styles.cardDesc}>{p.desc}</span>
              <span style={styles.cardArrow}>→</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── 스타일 ──────────────────────────────────────────────────
const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#f8faff',
    fontFamily: "'Pretendard','Noto Sans KR',Inter,sans-serif",
    display: 'flex',
    flexDirection: 'column',
  },

  /* Hero */
  hero: {
    position: 'relative',
    background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 60%, #60a5fa 100%)',
    padding: '64px 40px 80px',
    overflow: 'hidden',
    color: '#fff',
  },
  heroInner: { position: 'relative', zIndex: 1, maxWidth: 640 },
  badge: {
    display: 'inline-block',
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: '0.1em',
    textTransform: 'uppercase' as const,
    backgroundColor: 'rgba(255,255,255,0.15)',
    color: '#bfdbfe',
    padding: '4px 12px',
    borderRadius: 20,
    marginBottom: 18,
  },
  heroTitle: {
    margin: '0 0 16px',
    fontSize: 'clamp(28px, 5vw, 42px)',
    fontWeight: 800,
    lineHeight: 1.25,
    color: '#fff',
  },
  heroSub: {
    margin: 0,
    fontSize: 16,
    lineHeight: 1.7,
    color: '#bfdbfe',
  },
  heroDecor: {
    position: 'absolute',
    right: -80,
    top: -80,
    width: 400,
    height: 400,
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.06)',
    pointerEvents: 'none',
  },

  /* Content */
  content: {
    maxWidth: 860,
    width: '100%',
    margin: '-32px auto 0',
    padding: '0 24px 60px',
    flex: 1,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase' as const,
    color: '#94a3b8',
    margin: '0 0 16px',
  },

  /* Grid */
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
    gap: 16,
  },
  card: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'flex-start',
    gap: 6,
    padding: '24px 20px',
    backgroundColor: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: 16,
    boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
    cursor: 'pointer',
    textAlign: 'left' as const,
    transition: 'transform 0.2s, box-shadow 0.2s',
    position: 'relative' as const,
  },
  cardEmoji: { fontSize: 28, marginBottom: 4 },
  cardLabel: { fontSize: 16, fontWeight: 700, color: '#111827' },
  cardDesc: { fontSize: 13, color: '#6b7280', lineHeight: 1.5 },
  cardArrow: {
    position: 'absolute' as const,
    top: 20,
    right: 20,
    fontSize: 18,
    color: '#93c5fd',
    fontWeight: 700,
  },
};
