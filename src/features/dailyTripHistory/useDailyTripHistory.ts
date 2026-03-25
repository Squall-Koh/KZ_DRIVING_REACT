import { useState, useEffect, useCallback } from 'react';

// ─── 타입 정의 ──────────────────────────────────────────────
export interface TripRecord {
  id: number;
  startTime: string;
  endTime: string | null;
  elapsed: string;
  distance: string | null;
  startLocation: string;
  endLocation: string | null;
  status: string;
}

export interface AttendanceRecord {
  checkIn: string;
  checkOut: string;
  workTime: string;
  status: string;
}

declare global {
  interface Window {
    updateDailyTripHistory?: (jsonString: string) => void;
  }
}

// ─── 훅 반환 타입 ────────────────────────────────────────────
export interface UseDailyTripHistoryReturn {
  currentDate: Date;
  formattedDate: string;
  attendance: AttendanceRecord;
  trips: TripRecord[];
  handlePrevDay: () => void;
  handleNextDay: () => void;
  handleDateSelect: (d: Date) => void;
  loading: boolean;
}

// ─── 로직 훅 ────────────────────────────────────────────────
export function useDailyTripHistory(): UseDailyTripHistoryReturn {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const [attendance, setAttendance] = useState<AttendanceRecord>({
    checkIn: '--:--', checkOut: '--:--', workTime: '0시간 0분', status: '데이터 없음'
  });
  const [trips, setTrips] = useState<TripRecord[]>([]);
  const [loading, setLoading] = useState(false);

  // Flutter로부터 데이터 수신
  const handleUpdate = useCallback((jsonString: string) => {
    try {
      const data = JSON.parse(jsonString);
      if (data.attendance) setAttendance(data.attendance);
      if (data.trips) setTrips(data.trips);
    } catch (e) {
      console.error('Failed to parse daily trip history', e);
    } finally {
      setLoading(false);
    }
  }, []);

  // 날짜가 바뀔 때마다 Flutter DB에 기록 요청
  useEffect(() => {
    window.updateDailyTripHistory = handleUpdate;
    
    setLoading(true);
    
    // YYYY-MM-DD 포맷
    const yyyy = currentDate.getFullYear();
    const mm = String(currentDate.getMonth() + 1).padStart(2, '0');
    const dd = String(currentDate.getDate()).padStart(2, '0');
    const targetDateStr = `${yyyy}-${mm}-${dd}`;
    
    if (window.FlutterBridge) {
      window.FlutterBridge.postMessage(JSON.stringify({
        action: 'requestDailyTripHistory',
        payload: { date: targetDateStr }
      }));
    } else {
      // 웹 테스트용 (더미 지원)
      setTimeout(() => {
        setAttendance({ checkIn: '08:32', checkOut: '18:15', workTime: '9시간 43분', status: '퇴근 완료' });
        setTrips([
          { id: 1, startTime: '08:40', endTime: '09:25', elapsed: '45분', distance: '15.2', startLocation: '서울시 강남구 역삼동', endLocation: '경기도 성남시 분당구', status: '도착' }
        ]);
        setLoading(false);
      }, 300);
    }
    
    return () => {
      delete window.updateDailyTripHistory;
    };
  }, [currentDate, handleUpdate]);

  const handlePrevDay = () => {
    const prev = new Date(currentDate);
    prev.setDate(prev.getDate() - 1);
    setCurrentDate(prev);
  };

  const handleNextDay = () => {
    const next = new Date(currentDate);
    next.setDate(next.getDate() + 1);
    setCurrentDate(next);
  };
  
  const handleDateSelect = (d: Date) => {
    setCurrentDate(d);
  };

  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
  const formattedDate = `${currentDate.getMonth() + 1}월 ${currentDate.getDate()}일 (${dayNames[currentDate.getDay()]})`;

  return {
    currentDate,
    formattedDate,
    attendance,
    trips,
    handlePrevDay,
    handleNextDay,
    handleDateSelect,
    loading,
  };
}
