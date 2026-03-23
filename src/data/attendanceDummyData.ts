// ─── 더미 일별 근무 데이터 (API JSON 응답 형태) ──────────────
// 실제 API: GET /api/attendance/daily?from=YYYY-MM-DD&to=YYYY-MM-DD
export interface DayRecord {
  date: string;        // "2026-03-01"  (ISO, 정렬·비교용)
  dateLabel: string;   // "26.03.01 (토)"
  checkIn: string;     // "07:30"
  checkOut: string;    // "17:30"
  regularH: number;
  overtimeH: number;
  nightH: number;
}

export const ALL_DUMMY_DAYS: DayRecord[] = [
  // ── 2026.02 마지막 주 (02.23 일 ~ 03.01 토) ──
  { date: '2026-02-23', dateLabel: '26.02.23 (일)', checkIn: '08:30', checkOut: '17:30', regularH: 8, overtimeH: 0, nightH: 0 },
  { date: '2026-02-24', dateLabel: '26.02.24 (월)', checkIn: '08:30', checkOut: '17:30', regularH: 8, overtimeH: 0, nightH: 1 },
  { date: '2026-02-25', dateLabel: '26.02.25 (화)', checkIn: '08:30', checkOut: '17:30', regularH: 8, overtimeH: 0, nightH: 0 },
  { date: '2026-02-26', dateLabel: '26.02.26 (수)', checkIn: '08:30', checkOut: '20:00', regularH: 8, overtimeH: 0, nightH: 1 },
  { date: '2026-02-27', dateLabel: '26.02.27 (목)', checkIn: '08:30', checkOut: '17:30', regularH: 8, overtimeH: 0, nightH: 1 },
  { date: '2026-02-28', dateLabel: '26.02.28 (금)', checkIn: '08:30', checkOut: '17:30', regularH: 8, overtimeH: 0, nightH: 0 },
  { date: '2026-03-01', dateLabel: '26.03.01 (토)', checkIn: '07:30', checkOut: '17:30', regularH: 8, overtimeH: 2, nightH: 0 },

  // ── 1주차: 03.02 (일) ~ 03.08 (토) ──
  { date: '2026-03-02', dateLabel: '26.03.02 (일)', checkIn: '08:30', checkOut: '17:30', regularH: 8, overtimeH: 0, nightH: 0 },
  { date: '2026-03-03', dateLabel: '26.03.03 (월)', checkIn: '08:30', checkOut: '17:30', regularH: 8, overtimeH: 0, nightH: 0 },
  { date: '2026-03-04', dateLabel: '26.03.04 (화)', checkIn: '05:00', checkOut: '20:00', regularH: 8, overtimeH: 2, nightH: 5 },
  { date: '2026-03-05', dateLabel: '26.03.05 (수)', checkIn: '13:30', checkOut: '17:30', regularH: 4, overtimeH: 0, nightH: 0 },
  { date: '2026-03-06', dateLabel: '26.03.06 (목)', checkIn: '08:30', checkOut: '17:30', regularH: 8, overtimeH: 0, nightH: 0 },
  { date: '2026-03-07', dateLabel: '26.03.07 (금)', checkIn: '07:00', checkOut: '19:00', regularH: 8, overtimeH: 3, nightH: 1 },
  { date: '2026-03-08', dateLabel: '26.03.08 (토)', checkIn: '08:00', checkOut: '12:00', regularH: 4, overtimeH: 0, nightH: 0 },

  // ── 2주차: 03.09 (일) ~ 03.15 (토) ──
  { date: '2026-03-09', dateLabel: '26.03.09 (일)', checkIn: '08:30', checkOut: '18:30', regularH: 8, overtimeH: 2, nightH: 0 },
  { date: '2026-03-10', dateLabel: '26.03.10 (월)', checkIn: '08:30', checkOut: '17:30', regularH: 8, overtimeH: 0, nightH: 0 },
  { date: '2026-03-11', dateLabel: '26.03.11 (화)', checkIn: '22:00', checkOut: '06:00', regularH: 8, overtimeH: 0, nightH: 8 },
  { date: '2026-03-12', dateLabel: '26.03.12 (수)', checkIn: '08:30', checkOut: '17:30', regularH: 8, overtimeH: 0, nightH: 0 },
  { date: '2026-03-13', dateLabel: '26.03.13 (목)', checkIn: '08:30', checkOut: '17:30', regularH: 8, overtimeH: 0, nightH: 0 },
  { date: '2026-03-14', dateLabel: '26.03.14 (금)', checkIn: '08:30', checkOut: '17:30', regularH: 8, overtimeH: 0, nightH: 0 },

  // ── 3주차: 03.16 (일) ~ 03.22 (토) ──
  { date: '2026-03-16', dateLabel: '26.03.16 (일)', checkIn: '08:30', checkOut: '17:30', regularH: 8, overtimeH: 0, nightH: 0 },
  { date: '2026-03-17', dateLabel: '26.03.17 (월)', checkIn: '08:30', checkOut: '17:30', regularH: 8, overtimeH: 0, nightH: 1 },
  { date: '2026-03-18', dateLabel: '26.03.18 (화)', checkIn: '08:30', checkOut: '17:30', regularH: 8, overtimeH: 0, nightH: 0 },
  { date: '2026-03-19', dateLabel: '26.03.19 (수)', checkIn: '08:30', checkOut: '17:30', regularH: 8, overtimeH: 0, nightH: 0 },
  { date: '2026-03-20', dateLabel: '26.03.20 (목)', checkIn: '08:30', checkOut: '17:30', regularH: 8, overtimeH: 0, nightH: 0 },
  { date: '2026-03-21', dateLabel: '26.03.21 (금)', checkIn: '08:30', checkOut: '19:00', regularH: 8, overtimeH: 0, nightH: 0 },

  // ── 4주차: 03.23 (일) ~ 03.29 (토) ──
  { date: '2026-03-23', dateLabel: '26.03.23 (일)', checkIn: '08:30', checkOut: '17:30', regularH: 8, overtimeH: 0, nightH: 1 },
  { date: '2026-03-24', dateLabel: '26.03.24 (월)', checkIn: '08:30', checkOut: '17:30', regularH: 8, overtimeH: 0, nightH: 0 },
  { date: '2026-03-25', dateLabel: '26.03.25 (화)', checkIn: '08:30', checkOut: '18:30', regularH: 8, overtimeH: 0, nightH: 0 },
  { date: '2026-03-26', dateLabel: '26.03.26 (수)', checkIn: '08:30', checkOut: '17:30', regularH: 8, overtimeH: 0, nightH: 0 },
  { date: '2026-03-27', dateLabel: '26.03.27 (목)', checkIn: '08:30', checkOut: '17:30', regularH: 8, overtimeH: 0, nightH: 2 },
  { date: '2026-03-28', dateLabel: '26.03.28 (금)', checkIn: '08:30', checkOut: '17:30', regularH: 8, overtimeH: 0, nightH: 0 },

  // ── 5주차: 03.30 (일) ~ 04.05 (토) ──
  { date: '2026-03-30', dateLabel: '26.03.30 (일)', checkIn: '08:30', checkOut: '17:30', regularH: 8, overtimeH: 0, nightH: 0 },
  { date: '2026-03-31', dateLabel: '26.03.31 (월)', checkIn: '08:30', checkOut: '17:30', regularH: 8, overtimeH: 0, nightH: 0 },
];
