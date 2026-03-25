import { useState } from 'react';

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

// ─── 더미 데이터 ────────────────────────────────────────────
const DUMMY_TRIPS: TripRecord[] = [
  { id: 1, startTime: '08:40', endTime: '09:25', elapsed: '45분', distance: '15.2', startLocation: '서울시 강남구 역삼동', endLocation: '경기도 성남시 분당구', status: '도착' },
  { id: 2, startTime: '10:15', endTime: '11:05', elapsed: '50분', distance: '22.4', startLocation: '경기도 성남시 분당구', endLocation: '서울시 서초구 서초동', status: '도착' },
  { id: 3, startTime: '14:30', endTime: null, elapsed: '운행 중', distance: null, startLocation: '서울시 서초구 서초동', endLocation: null, status: '운행 중' },
];

const DUMMY_ATTENDANCE: AttendanceRecord = {
  checkIn: '08:32',
  checkOut: '18:15',
  workTime: '9시간 43분',
  status: '퇴근 완료',
};

// ─── 훅 반환 타입 ────────────────────────────────────────────
export interface UseDailyTripHistoryReturn {
  currentDate: Date;
  formattedDate: string;
  attendance: AttendanceRecord;
  trips: TripRecord[];
  handlePrevDay: () => void;
  handleNextDay: () => void;
}

// ─── 로직 훅 ────────────────────────────────────────────────
export function useDailyTripHistory(): UseDailyTripHistoryReturn {
  const [currentDate, setCurrentDate] = useState(new Date());

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

  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
  const formattedDate = `${currentDate.getMonth() + 1}월 ${currentDate.getDate()}일 (${dayNames[currentDate.getDay()]})`;

  return {
    currentDate,
    formattedDate,
    attendance: DUMMY_ATTENDANCE,
    trips: DUMMY_TRIPS,
    handlePrevDay,
    handleNextDay,
  };
}
