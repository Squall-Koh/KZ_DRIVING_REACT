# SORIN DB ERD (Mermaid)

> 차량 운행 관리 앱의 로컬 SQLite 데이터베이스 — teble 관계도

## 전체 ERD

```mermaid
erDiagram

  %% ============================================================
  %% [TYPE 1] 정의(마스터) 테이블 - Web Admin에서 관리
  %% ============================================================

  obd_devices {
    int     id                  PK
    text    ble_name            "NOT NULL"
    text    mac_address         "NOT NULL"
    text    service_uuid
    text    characteristic_uuid
    text    protocol_type
    int     is_active           "DEFAULT 1"
    text    created_at          "NOT NULL"
    text    updated_at          "NOT NULL"
  }

  vehicles {
    int     id                  PK
    int     obd_device_id       FK
    text    name                "NOT NULL"
    text    vin
    text    license_plate
    text    model
    int     year
    text    created_at          "NOT NULL"
    text    updated_at          "NOT NULL"
  }

  drivers {
    int     id                  PK
    text    emp_no
    text    name
    text    phone
    text    department
    text    role                "admin|driver"
    int     is_active           "DEFAULT 1"
    text    created_at
    text    updated_at
  }

  card_types {
    int     id                  PK
    text    code                "UNIQUE"
    text    label
    int     sort_order
  }

  cards {
    int     id                  PK
    int     card_type           FK
    text    card_name
    text    card_number
    int     is_active           "DEFAULT 1"
  }

  adjustment_types {
    int     id                  PK
    text    code                "UNIQUE"
    text    name
    int     sort_order
  }

  attendance_types {
    int     id                  PK
    text    code                "UNIQUE"
    text    name
    int     sort_order
  }

  driving_states {
    int     id                  PK
    text    code                "UNIQUE"
    text    name
    int     sort_order
  }

  expense_categories {
    int     id                  PK
    text    code                "UNIQUE"
    text    name
    int     sort_order
  }

  maintenance_items {
    int     id                  PK
    text    name
    int     interval_km
    int     sort_order
  }

  push_message_item {
    int     id                  PK
    text    type_code           "UNIQUE NOT NULL"
    text    type_name           "NOT NULL"
    text    title_template      "NOT NULL"
    text    body_template       "NOT NULL"
    text    created_at          "NOT NULL"
  }

  %% ============================================================
  %% [TYPE 2] 승인 관련 테이블 - 원천시스템 연동
  %% ============================================================

  attendance_adjustments {
    text    id                  PK "UUID"
    text    driver_id           FK
    text    work_date
    text    time_from
    text    time_to
    text    adjustment_type_id  FK
    text    reason
    text    status
    text    submit_date
    int     is_canceled         "DEFAULT 0"
    text    created_at
    text    updated_at
  }

  expenses {
    int     id                  PK
    int     driver_id           FK
    text    expense_date
    int     card_id             FK
    text    category_id         FK
    int     amount
    text    merchant_name
    text    address
    text    memo
    text    receipt_image_path
    int     is_sync             "DEFAULT 0"
    text    created_at
    text    updated_at
  }

  maintenance_histories {
    int     id                  PK
    int     driver_id           FK
    int     vehicle_id          FK
    int     item_id             FK
    text    maintenance_date
    int     odometer_km
    int     cost
    text    shop_name
    text    memo
    text    receipt_image_path
    text    created_at
    text    updated_at
  }

  %% ============================================================
  %% [TYPE 3] 앱 생성 데이터 테이블 - BLE 앱이 직접 생성
  %% ============================================================

  work_days {
    int     id                  PK
    int     driver_id           FK
    text    date                "UNIQUE NOT NULL"
    text    check_in_time       "NOT NULL"
    text    check_out_time
    int     vehicle_id          FK
    text    vehicle_vin
    int     odo_start
    int     odo_end
    text    created_at          "NOT NULL"
    text    updated_at          "NOT NULL"
  }

  trips {
    int     id                  PK
    int     work_day_id         FK "NOT NULL CASCADE"
    int     vehicle_id          FK
    int     driver_id           FK
    int     trip_number         "NOT NULL"
    text    start_time          "NOT NULL"
    real    start_lat
    real    start_lng
    int     start_odo
    text    end_time
    real    end_lat
    real    end_lng
    int     end_odo
    real    distance_km
    text    created_at          "NOT NULL"
    text    updated_at          "NOT NULL"
  }

  track_data {
    int     id                  PK
    int     trip_id             FK "NOT NULL CASCADE"
    real    latitude            "NOT NULL"
    real    longitude           "NOT NULL"
    real    distance_km         "NOT NULL"
    text    recorded_at         "NOT NULL"
  }

  notifications {
    int     id                  PK
    int     item_id             FK "NOT NULL"
    text    title               "NOT NULL"
    text    body                "NOT NULL"
    int     work_day_id         FK
    int     trip_id             FK
    int     is_read             "DEFAULT 0"
    int     is_synced           "DEFAULT 0"
    text    occurred_at         "NOT NULL IDX DESC"
    text    created_at          "NOT NULL"
  }

  %% ============================================================
  %% [TYPE 4] 로그 테이블 - 앱 분석용
  %% ============================================================

  ble_scan_logs {
    int     id                  PK
    text    recorded_at         "NOT NULL"
    int     driving_state       FK "NOT NULL"
    int     is_device_found     "NOT NULL"
    int     rssi
    int     last_seen_secs
    int     trip_id
    int     work_day_id
    int     battery_level
    text    event_str
  }

  %% ============================================================
  %% 관계 정의
  %% ============================================================

  %% 마스터 내부
  obd_devices ||--o{ vehicles         : "obd_device_id"
  card_types   ||--o{ cards           : "card_type"

  %% 마스터 → 승인
  drivers               ||--o{ attendance_adjustments : "driver_id"
  adjustment_types      ||--o{ attendance_adjustments : "adjustment_type_id"
  drivers               ||--o{ expenses               : "driver_id"
  cards                 ||--o{ expenses               : "card_id"
  expense_categories    ||--o{ expenses               : "category_id"
  drivers               ||--o{ maintenance_histories  : "driver_id"
  vehicles              ||--o{ maintenance_histories  : "vehicle_id"
  maintenance_items     ||--o{ maintenance_histories  : "item_id"

  %% 마스터 → 앱 데이터
  drivers           ||--o{ work_days   : "driver_id"
  vehicles          ||--o{ work_days   : "vehicle_id"
  work_days         ||--o{ trips       : "work_day_id (CASCADE)"
  vehicles          ||--o{ trips       : "vehicle_id"
  drivers           ||--o{ trips       : "driver_id"
  trips             ||--o{ track_data  : "trip_id (CASCADE)"
  push_message_item ||--o{ notifications : "item_id"
  work_days         ||--o{ notifications : "work_day_id"
  trips             ||--o{ notifications : "trip_id"

  %% 마스터 → 로그
  driving_states ||--o{ ble_scan_logs : "driving_state"
```

---

## 테이블 분류 요약

| 분류 | 테이블 | 관리 주체 | 특징 |
|---|---|---|---|
| ① 정의(마스터) | adjustment_types, attendance_types, card_types, driving_states, expense_categories, maintenance_items, push_message_item, obd_devices, vehicles, drivers, cards | Web Admin | 코드 테이블 + 장치/차량/운전자 기준정보 |
| ② 승인 관련 | attendance_adjustments, expenses, maintenance_histories | 원천시스템 동기화 | 결재 워크플로우, 서버 동기화 필요 |
| ③ 앱 생성 데이터 | work_days, trips, track_data, notifications | BLE 앱 자동 생성 | BLE OBD 연동, GPS 궤적, 운행일지 |
| ④ 로그 | ble_scan_logs | 앱 자동 기록 | 디버깅·분석용, RSSI/배터리/상태 이력 |

---

## 핵심 데이터 흐름

```
BLE 스캔 감지
  └─► driving_states 변경
        ├─► ble_scan_logs 기록 (로그)
        └─► work_days 생성 (출근)
              └─► trips 생성 (운행 시작)
                    ├─► track_data 누적 (GPS 궤적)
                    └─► notifications 발송 (알림)
```
