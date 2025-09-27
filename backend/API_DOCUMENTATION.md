# DR T Dental API 文檔

## 概述

DR T Dental API 是一個為牙科診所設計的完整後端系統，提供患者管理、預約系統、醫療記錄管理等功能。

**Base URL:** `http://localhost:5000/api`

## 認證

API 使用 JWT (JSON Web Token) 進行認證。在請求受保護的端點時，請在 Authorization 標頭中包含令牌：

```
Authorization: Bearer <your-jwt-token>
```

## 響應格式

所有 API 響應都遵循統一的格式：

### 成功響應
```json
{
  "success": true,
  "message": "操作成功",
  "data": { ... }
}
```

### 錯誤響應
```json
{
  "success": false,
  "message": "錯誤描述",
  "errors": [ ... ]
}
```

## 端點文檔

### 1. 認證端點

#### 1.1 患者註冊
```http
POST /api/auth/register
```

**請求體:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "+26812345678",
  "dateOfBirth": "1990-01-01",
  "gender": "male",
  "password": "SecurePass123",
  "address": {
    "street": "123 Main St",
    "city": "Mbabane",
    "postalCode": "H100"
  },
  "emergencyContact": {
    "name": "Jane Doe",
    "relationship": "Spouse",
    "phone": "+26812345679"
  },
  "insurance": {
    "provider": "Delta Dental",
    "memberId": "DD123456789",
    "groupNumber": "GRP001"
  }
}
```

**響應:**
```json
{
  "success": true,
  "message": "Patient registered successfully",
  "data": {
    "patient": { ... },
    "token": "jwt-token-here"
  }
}
```

#### 1.2 患者登入
```http
POST /api/auth/login
```

**請求體:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

#### 1.3 獲取當前患者信息
```http
GET /api/auth/me
Authorization: Bearer <token>
```

#### 1.4 更新患者資料
```http
PUT /api/auth/profile
Authorization: Bearer <token>
```

#### 1.5 修改密碼
```http
PUT /api/auth/change-password
Authorization: Bearer <token>
```

**請求體:**
```json
{
  "currentPassword": "oldPassword",
  "newPassword": "newPassword123"
}
```

#### 1.6 忘記密碼
```http
POST /api/auth/forgot-password
```

**請求體:**
```json
{
  "email": "john@example.com"
}
```

#### 1.7 重設密碼
```http
POST /api/auth/reset-password
```

**請求體:**
```json
{
  "token": "reset-token",
  "newPassword": "newPassword123"
}
```

### 2. 預約端點

#### 2.1 創建預約
```http
POST /api/appointments
Authorization: Bearer <token>
```

**請求體:**
```json
{
  "service": "consultation",
  "serviceName": "Free Consultation",
  "appointmentDate": "2025-02-15",
  "appointmentTime": "09:00",
  "urgency": "routine",
  "notes": "Regular checkup",
  "patientNotes": "Patient has anxiety about dental work",
  "paymentMethod": "insurance",
  "estimatedCost": 0
}
```

**可用服務類型:**
- `consultation` - 諮詢
- `cleaning` - 清潔
- `whitening` - 美白
- `emergency` - 急診
- `orthodontics` - 正畸
- `implants` - 植牙
- `crowns` - 牙冠
- `fillings` - 補牙
- `extraction` - 拔牙
- `root-canal` - 根管治療
- `veneers` - 貼面
- `invisalign` - 隱形矯正

**緊急程度:**
- `routine` - 常規
- `soon` - 盡快
- `urgent` - 緊急
- `emergency` - 急診

**支付方式:**
- `insurance` - 保險
- `selfPay` - 自費
- `paymentPlan` - 分期付款
- `careCredit` - CareCredit

#### 2.2 獲取患者預約
```http
GET /api/appointments?status=scheduled&page=1&limit=10
Authorization: Bearer <token>
```

**查詢參數:**
- `status` - 預約狀態 (scheduled, confirmed, completed, cancelled)
- `page` - 頁碼 (默認: 1)
- `limit` - 每頁數量 (默認: 10)

#### 2.3 獲取單個預約
```http
GET /api/appointments/:id
Authorization: Bearer <token>
```

#### 2.4 更新預約
```http
PUT /api/appointments/:id
Authorization: Bearer <token>
```

#### 2.5 取消預約
```http
DELETE /api/appointments/:id
Authorization: Bearer <token>
```

**請求體:**
```json
{
  "cancellationReason": "Schedule conflict"
}
```

#### 2.6 獲取可用時間段
```http
GET /api/appointments/available-slots?date=2025-02-15&service=consultation
```

**查詢參數:**
- `date` - 日期 (YYYY-MM-DD)
- `service` - 服務代碼

**響應:**
```json
{
  "success": true,
  "data": [
    {
      "time": "09:00",
      "doctor": {
        "id": "doctor-id",
        "name": "Dr. T",
        "specialization": "General Dentistry"
      },
      "duration": 30
    }
  ]
}
```

### 3. 醫療記錄端點

#### 3.1 獲取醫療記錄
```http
GET /api/medical-records?recordType=examination&page=1&limit=10
Authorization: Bearer <token>
```

**查詢參數:**
- `recordType` - 記錄類型 (examination, treatment, procedure, consultation, follow-up, emergency, cleaning, surgery, restoration)
- `page` - 頁碼
- `limit` - 每頁數量

#### 3.2 獲取單個醫療記錄
```http
GET /api/medical-records/:id
Authorization: Bearer <token>
```

#### 3.3 獲取醫療摘要
```http
GET /api/medical-records/summary
Authorization: Bearer <token>
```

**響應:**
```json
{
  "success": true,
  "data": {
    "lastVisit": {
      "date": "2025-01-15T00:00:00.000Z",
      "treatment": "Dental cleaning",
      "doctor": {
        "firstName": "T",
        "lastName": "Dental"
      }
    },
    "nextAppointment": {
      "date": "2025-03-15T00:00:00.000Z",
      "time": "09:00",
      "service": "Follow-up cleaning",
      "doctor": {
        "firstName": "T",
        "lastName": "Dental"
      }
    },
    "treatmentPlan": {
      "description": "Regular maintenance",
      "procedures": []
    },
    "insuranceStatus": "Active",
    "treatmentHistory": [
      {
        "_id": "examination",
        "count": 3,
        "lastTreatment": "2025-01-15T00:00:00.000Z"
      }
    ]
  }
}
```

#### 3.4 獲取治療時間線
```http
GET /api/medical-records/timeline?year=2025
Authorization: Bearer <token>
```

#### 3.5 下載醫療記錄附件
```http
GET /api/medical-records/:id/attachments/:attachmentId
Authorization: Bearer <token>
```

### 4. 服務端點

#### 4.1 獲取所有服務
```http
GET /api/services?category=general&featured=true&page=1&limit=20
```

**查詢參數:**
- `category` - 服務類別 (general, cosmetic, surgical, orthodontic, emergency, preventive, restorative)
- `featured` - 精選服務 (true/false)
- `popular` - 熱門服務 (true/false)
- `page` - 頁碼
- `limit` - 每頁數量

#### 4.2 獲取單個服務
```http
GET /api/services/:id
```

#### 4.3 根據代碼獲取服務
```http
GET /api/services/code/:code
```

#### 4.4 搜索服務
```http
GET /api/services/search?q=cleaning&category=general&minPrice=50&maxPrice=200
```

**查詢參數:**
- `q` - 搜索關鍵詞
- `category` - 服務類別
- `minPrice` - 最低價格
- `maxPrice` - 最高價格
- `page` - 頁碼
- `limit` - 每頁數量

#### 4.5 獲取服務類別
```http
GET /api/services/categories
```

#### 4.6 獲取精選服務
```http
GET /api/services/featured?limit=6
```

#### 4.7 獲取熱門服務
```http
GET /api/services/popular?limit=6
```

#### 4.8 獲取服務定價
```http
GET /api/services/:id/pricing
```

## 錯誤代碼

| 狀態碼 | 描述 |
|--------|------|
| 200 | 成功 |
| 201 | 創建成功 |
| 400 | 請求錯誤 |
| 401 | 未授權 |
| 403 | 禁止訪問 |
| 404 | 未找到 |
| 429 | 請求過於頻繁 |
| 500 | 服務器錯誤 |

## 速率限制

API 實施了速率限制以防止濫用：
- 每個 IP 地址每 15 分鐘最多 100 個請求
- 超過限制時返回 429 狀態碼

## 數據模型

### Patient (患者)
```json
{
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "phone": "string",
  "dateOfBirth": "date",
  "gender": "male|female|other|prefer-not",
  "address": {
    "street": "string",
    "city": "string",
    "postalCode": "string",
    "country": "string"
  },
  "emergencyContact": {
    "name": "string",
    "relationship": "string",
    "phone": "string"
  },
  "insurance": {
    "provider": "string",
    "memberId": "string",
    "groupNumber": "string",
    "isActive": "boolean"
  },
  "medicalHistory": {
    "allergies": ["string"],
    "medications": ["string"],
    "medicalConditions": ["string"],
    "previousDentalWork": ["string"]
  },
  "preferences": {
    "preferredContactMethod": "email|phone|sms",
    "marketingConsent": "boolean",
    "reminderConsent": "boolean"
  }
}
```

### Appointment (預約)
```json
{
  "patient": "ObjectId",
  "doctor": "ObjectId",
  "service": "string",
  "serviceName": "string",
  "appointmentDate": "date",
  "appointmentTime": "string",
  "duration": "number",
  "urgency": "routine|soon|urgent|emergency",
  "status": "scheduled|confirmed|in-progress|completed|cancelled|no-show",
  "notes": "string",
  "patientNotes": "string",
  "paymentMethod": "insurance|selfPay|paymentPlan|careCredit",
  "estimatedCost": "number",
  "actualCost": "number"
}
```

### Service (服務)
```json
{
  "name": "string",
  "code": "string",
  "category": "general|cosmetic|surgical|orthodontic|emergency|preventive|restorative",
  "description": "string",
  "detailedDescription": "string",
  "pricing": {
    "basePrice": "number",
    "priceRange": {
      "min": "number",
      "max": "number"
    },
    "isVariable": "boolean",
    "currency": "string"
  },
  "duration": "number",
  "features": [
    {
      "name": "string",
      "description": "string",
      "icon": "string"
    }
  ],
  "isActive": "boolean",
  "isFeatured": "boolean",
  "isPopular": "boolean"
}
```

## 示例代碼

### JavaScript (Fetch API)
```javascript
// 患者登入
const login = async (email, password) => {
  const response = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password })
  });
  
  const data = await response.json();
  return data;
};

// 創建預約
const createAppointment = async (appointmentData, token) => {
  const response = await fetch('http://localhost:5000/api/appointments', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(appointmentData)
  });
  
  const data = await response.json();
  return data;
};
```

### cURL
```bash
# 患者登入
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"Password123"}'

# 創建預約
curl -X POST http://localhost:5000/api/appointments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"service":"consultation","appointmentDate":"2025-02-15","appointmentTime":"09:00","urgency":"routine","paymentMethod":"insurance"}'
```

## 更新日誌

### v1.0.0 (2025-01-15)
- 初始版本發布
- 完整的患者認證系統
- 預約管理功能
- 醫療記錄管理
- 服務展示系統
