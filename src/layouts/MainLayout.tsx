import React, { useState, useRef } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { openDevMenu } from '../bridge/nativeInterface';
import { ScanLine, Bell, Menu, Megaphone, ArrowLeft, Home, Map, Clock, DollarSign, Wrench } from 'lucide-react';

// Assets
import IconKz from '../assets/images/icon_kz.png';

export function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  // 1. Native Dev Menu Trigger (5x Taps)
  const [tapCount, setTapCount] = useState(0);
  const tapTimerRef = useRef<number | null>(null);

  const handleLogoTap = () => {
    setTapCount((prev) => prev + 1);

    if (tapTimerRef.current) {
      clearTimeout(tapTimerRef.current);
    }
    // Reset tap count if idle for 1.5 seconds
    tapTimerRef.current = window.setTimeout(() => {
      setTapCount(0);
    }, 1500);
  };

  React.useEffect(() => {
    if (tapCount >= 5) {
      console.log('Secret 5 taps detected. Opening Native Dev Menu...');
      openDevMenu();
      setTapCount(0);
    }
  }, [tapCount]);

  // 탭 활성화 상태 확인 헬퍼
  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <div style={styles.page}>
      {/* Top Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft} onClick={handleLogoTap}>
          <img src={IconKz} alt="KZ" style={{ width: 32, height: 32, borderRadius: 8 }} />
          <span style={styles.userName}>SeungJoo Koh 님</span>
        </div>
        <div style={styles.headerRight}>
          <button style={styles.iconBtn} onClick={() => console.log('Barcode/Scan clicked')}>
            <ScanLine size={24} strokeWidth={1.5} color="#4B5563" />
          </button>
          <button style={styles.iconBtn} onClick={() => navigate('/notifications')}>
            <Bell size={24} strokeWidth={1.5} color="#4B5563" />
          </button>
          <button style={styles.iconBtn}>
            <Menu size={24} strokeWidth={1.5} color="#4B5563" />
          </button>
        </div>
      </div>

      {/* Connection Status Bar */}
      <div style={styles.statusBar}>
        <Megaphone size={18} fill="#2B5CFF" color="#2B5CFF" style={{ marginRight: 6 }} />
        <span style={styles.statusTitle}>운행 대기중</span>
        <div style={styles.divider} />
        <span style={styles.statusDesc}>차량 이동이 감지되면 자동으로 운행기록을...</span>
      </div>

      {/* Scrollable Content Area for Sub Tabs */}
      <div style={styles.contentArea}>
        <Outlet />
        {/* Dummy Bottom Padding for Nav */}
        <div style={{ height: 100 }} />
      </div>

      {/* Custom Bottom Nav */}
      <div style={styles.bottomNav}>
        <div style={styles.navBackBtn} onClick={() => navigate(-1)}>
          <ArrowLeft size={24} color="#333" />
        </div>
        <div style={isActive('/') ? styles.navItemActive : styles.navItem} onClick={() => navigate('/')}>
          <Home size={22} strokeWidth={isActive('/') ? 2.5 : 2} color={isActive('/') ? '#2B5CFF' : '#9BA3AF'} />
          <span style={styles.navText}>메인화면</span>
        </div>
        <div style={isActive('/driving-history') ? styles.navItemActive : styles.navItem} onClick={() => navigate('/driving-history')}>
          <Map size={22} strokeWidth={isActive('/driving-history') ? 2.5 : 2} color={isActive('/driving-history') ? '#2B5CFF' : '#9BA3AF'} />
          <span style={styles.navText}>운행내역</span>
        </div>
        <div style={isActive('/attendance') ? styles.navItemActive : styles.navItem} onClick={() => navigate('/attendance')}>
          <Clock size={22} strokeWidth={isActive('/attendance') ? 2.5 : 2} color={isActive('/attendance') ? '#2B5CFF' : '#9BA3AF'} />
          <span style={styles.navText}>근태관리</span>
        </div>
        <div style={isActive('/receipts') ? styles.navItemActive : styles.navItem} onClick={() => navigate('/receipts')}>
          <DollarSign size={22} strokeWidth={isActive('/receipts') ? 2.5 : 2} color={isActive('/receipts') ? '#2B5CFF' : '#9BA3AF'} />
          <span style={styles.navText}>경비관리</span>
        </div>
        <div style={isActive('/maintenance') ? styles.navItemActive : styles.navItem} onClick={() => navigate('/maintenance')}>
          <Wrench size={22} strokeWidth={isActive('/maintenance') ? 2.5 : 2} color={isActive('/maintenance') ? '#2B5CFF' : '#9BA3AF'} />
          <span style={styles.navText}>정비관리</span>
        </div>
      </div>
    </div>
  );
}

// ─── 공통 레이아웃 스타일 ─────────────────────────────────────────────
const styles: Record<string, React.CSSProperties> = {
  page: {
    height: '100dvh',
    overflow: 'hidden',
    backgroundColor: '#F5F6FA',
    fontFamily: "'Pretendard','Noto Sans KR', sans-serif",
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    padding: '16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F5F6FA', // keep same as page
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
    userSelect: 'none',
  },
  userName: {
    fontSize: '18px',
    fontWeight: 'bold',
  },
  headerRight: {
    display: 'flex',
    gap: '12px',
  },
  iconBtn: {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
  },
  statusBar: {
    margin: '0 16px',
    padding: '12px 16px',
    backgroundColor: '#fff',
    borderRadius: '30px',
    border: '1.5px solid #2B5CFF',
    display: 'flex',
    alignItems: 'center',
  },
  statusTitle: {
    color: '#2B5CFF',
    fontWeight: 'bold',
    fontSize: '14px',
    whiteSpace: 'nowrap',
  },
  divider: {
    width: '1px',
    height: '16px',
    backgroundColor: '#eee',
    margin: '0 12px',
  },
  statusDesc: {
    fontSize: '13px',
    color: '#666',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  heroCard: {
    margin: '16px',
    backgroundColor: '#5A8BFF',
    borderRadius: '20px',
    padding: '30px 20px',
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
  contentArea: {
    flex: 1,
    overflowY: 'auto',
  },
  bottomNav: {
    position: 'fixed',
    bottom: '20px',
    left: '16px',
    right: '16px',
    backgroundColor: '#fff',
    borderRadius: '35px',
    padding: '8px 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 12px 40px rgba(0,0,0,0.25), 0 0px 15px rgba(0,0,0,0.08)',
    zIndex: 100,
  },
  navBackBtn: {
    width: 48,
    height: 48,
    borderRadius: '24px',
    backgroundColor: '#F3F4F6',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    marginRight: '8px',
  },
  navItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    color: '#9BA3AF',
    cursor: 'pointer',
  },
  navItemActive: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    color: '#2B5CFF',
    cursor: 'pointer',
  },
  navText: {
    fontSize: '11px',
    fontWeight: 'bold',
  },
};
