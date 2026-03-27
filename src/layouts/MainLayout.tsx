import React, { useState, useRef } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { openDevMenu, resetBgService } from '../bridge/nativeInterface';
import { ScanLine, Bell, Menu, Megaphone, ArrowLeft, Home, Map, Clock, DollarSign, Wrench, Bluetooth } from 'lucide-react';
import type { DrivingStateContext } from '../features/dashboard/useOperationDashboard';

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
    // 정확히 7번 도달했을 때 딱 한 번만 엽니다.
    // 8번, 9번 막 눌러도 추가 트리거되지 않도록 === 7 로 설정하고,
    // tapCount 초기화는 1.5초 뒤 자동 타임아웃에 맡깁니다.
    if (tapCount === 7) {
      console.log('Secret 7 taps detected. Opening Native Dev Menu...');
      openDevMenu();
    }
  }, [tapCount]);

  // User Name 5x Taps to Reset BG Service
  const [userNameTapCount, setUserNameTapCount] = useState(0);
  const userNameTapTimerRef = useRef<number | null>(null);

  const handleUserNameTap = (e: React.MouseEvent) => {
    e.stopPropagation();
    setUserNameTapCount((prev) => prev + 1);

    if (userNameTapTimerRef.current) {
      clearTimeout(userNameTapTimerRef.current);
    }
    userNameTapTimerRef.current = window.setTimeout(() => {
      setUserNameTapCount(0);
    }, 1500);
  };

  React.useEffect(() => {
    if (userNameTapCount === 5) {
      console.log('Secret 5 taps on user name detected. Resetting Background Service...');
      resetBgService();
    }
  }, [userNameTapCount]);

  // 2. Real Global State Sync from Native
  const [drivingState, setDrivingState] = useState<0 | 1 | 2>(1);
  const [syncPayload, setSyncPayload] = useState<any>(null);
  const [heartbeat, setHeartbeat] = useState<any>(null);

  React.useEffect(() => {
    const handleNativeMessage = (event: MessageEvent) => {
      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        if (data.type === 'SYNC_DRIVING_STATE' && data.payload) {
          console.log('[React WebView] Sync State Received:', data.payload);
          setSyncPayload(data.payload);
          if (typeof data.payload.drivingState === 'number') {
            setDrivingState(data.payload.drivingState as 0 | 1 | 2);
          }
          if (data.payload.heartbeat) {
            setHeartbeat({
              timestamp: Date.now(),
              tick: data.payload.heartbeat.tick,
              isScanning: data.payload.heartbeat.isScanning,
            });
          }
        }
        if (data.type === 'SYNC_HEARTBEAT' && data.payload) {
          setHeartbeat({
            timestamp: Date.now(),
            tick: data.payload.tick,
            isScanning: data.payload.isScanning,
          });
        }
      } catch (e) {
        // Ignored
      }
    };
    window.addEventListener('message', handleNativeMessage);

    // 컴포넌트 마운트 시, 혹은 뒤로가기로 다시 그려질 때 Native에 현재 상태 재요청
    import('../bridge/nativeInterface').then(m => m.requestSync());

    return () => window.removeEventListener('message', handleNativeMessage);
  }, []);

  const [isAlive, setIsAlive] = useState(false);
  const [blink, setBlink] = useState(false);

  React.useEffect(() => {
    const interval = setInterval(() => {
      let currentAlive = false;
      if (heartbeat) {
        const timeDiff = Date.now() - heartbeat.timestamp;
        currentAlive = (timeDiff < 6000 && heartbeat.isScanning);
      }
      setIsAlive(currentAlive);

      if (currentAlive) {
        setBlink(b => !b);
      } else {
        setBlink(false);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [heartbeat]);

  const cycleState = () => {
    if (!window.FlutterBridge) {
      setDrivingState((prev) => ((prev + 1) % 3) as 0 | 1 | 2); // 브라우저 테스트용
    }
  };

  const getStateConfig = () => {
    const plate = syncPayload?.plateNumber || '차량 미배정';
    switch (drivingState) {
      case 0: return { color: '#9BA3AF', title: '연결 대기중', desc: '차량에 탑승해 주세요.' };
      case 1: return { color: '#2B5CFF', title: '운행 대기중', desc: `[${plate}]에 연결되었습니다.` };
      case 2: return { color: '#22C55E', title: '운행중', desc: `[${plate}] 운행이 시작되었습니다.` };
      default: return { color: '#9BA3AF', title: '연결 대기중', desc: '' };
    }
  };
  const config = getStateConfig();

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
          <img src={IconKz} alt="KZ" style={{ width: 'auto', height: 'auto', objectFit: 'contain', borderRadius: 8 }} />
          <span style={styles.userName} onClick={handleUserNameTap}>{syncPayload?.userName || '사용자 정보 확인 중...'}</span>
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
      <div style={{ ...styles.statusBar, borderColor: config.color }} onClick={cycleState}>
        <Megaphone size={18} fill={config.color} color={config.color} style={{ marginRight: 6 }} />
        <span style={{ ...styles.statusTitle, color: config.color }}>{config.title}</span>

        {/* Tiny Health Indicator */}
        <div style={{
          width: 6, height: 6, borderRadius: '50%', marginLeft: 6,
          backgroundColor: isAlive ? '#10B981' : '#EF4444',
          boxShadow: isAlive ? '0 0 4px #10B981' : '0 0 4px #EF4444',
          opacity: blink ? 1 : 0.4,
          transition: 'all 0.4s ease-in-out',
        }} />

        <div style={styles.divider} />
        <span style={{ ...styles.statusDesc, flex: 1 }}>{config.desc}</span>

        {syncPayload?.bleConnectedMac && (
          <div style={{ display: 'flex', alignItems: 'center', marginLeft: 8, gap: 4 }}>
            <Bluetooth size={14} color="#2B5CFF" strokeWidth={2} />
            <span style={{ fontSize: 12, color: '#333', fontWeight: 'bold' }}>
              {syncPayload.bleConnectedMac.slice(-5).replace(':', '')}
            </span>
          </div>
        )}
      </div>

      {/* Scrollable Content Area for Sub Tabs */}
      <div style={styles.contentArea}>
        <Outlet context={{ drivingState, cycleState, syncPayload } satisfies DrivingStateContext} />
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
