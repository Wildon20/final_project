# DR T Dental Backend API

這是一個為DR T牙科診所設計的完整後端API系統，提供預約管理、患者門戶、醫療記錄管理等功能。

## 🚀 功能特色

- **患者認證系統** - 註冊、登入、密碼重設
- **預約管理** - 創建、查看、更新、取消預約
- **醫療記錄管理** - 查看治療歷史、醫療摘要
- **服務管理** - 牙科服務展示和搜索
- **患者門戶** - 個人資料管理、預約歷史
- **安全認證** - JWT令牌、密碼加密
- **數據驗證** - 輸入驗證和錯誤處理

## 🛠 技術棧

- **Node.js** - 運行環境
- **Express.js** - Web框架
- **MongoDB** - 數據庫
- **Mongoose** - ODM
- **JWT** - 身份驗證
- **bcryptjs** - 密碼加密
- **express-validator** - 數據驗證
- **helmet** - 安全中間件
- **cors** - 跨域支持

## 📋 系統要求

- Node.js 14.0 或更高版本
- MongoDB 4.4 或更高版本
- npm 或 yarn

## 🔧 安裝和設置

### 1. 克隆項目
```bash
git clone <repository-url>
cd backend
```

### 2. 安裝依賴
```bash
npm install
```

### 3. 環境變量設置
創建 `.env` 文件並配置以下變量：

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/drt-dental
MONGODB_TEST_URI=mongodb://localhost:27017/drt-dental-test

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=7d

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Frontend URL
FRONTEND_URL=http://localhost:3000

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 4. 啟動服務器
```bash
# 開發模式
npm run dev

# 生產模式
npm start
```

## 📚 API 文檔

### 認證端點

#### 註冊患者
```http
POST /api/auth/register
Content-Type: application/json

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
  }
}
```

#### 患者登入
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

#### 獲取當前患者信息
```http
GET /api/auth/me
Authorization: Bearer <token>
```

### 預約端點

#### 創建預約
```http
POST /api/appointments
Authorization: Bearer <token>
Content-Type: application/json

{
  "service": "consultation",
  "serviceName": "Free Consultation",
  "appointmentDate": "2025-02-15",
  "appointmentTime": "09:00",
  "urgency": "routine",
  "notes": "Regular checkup",
  "paymentMethod": "insurance"
}
```

#### 獲取患者預約
```http
GET /api/appointments?status=scheduled&page=1&limit=10
Authorization: Bearer <token>
```

#### 獲取可用時間段
```http
GET /api/appointments/available-slots?date=2025-02-15&service=consultation
```

### 醫療記錄端點

#### 獲取醫療記錄
```http
GET /api/medical-records?recordType=examination&page=1&limit=10
Authorization: Bearer <token>
```

#### 獲取醫療摘要
```http
GET /api/medical-records/summary
Authorization: Bearer <token>
```

### 服務端點

#### 獲取所有服務
```http
GET /api/services?category=general&featured=true&page=1&limit=20
```

#### 搜索服務
```http
GET /api/services/search?q=cleaning&category=general&minPrice=50&maxPrice=200
```

## 🗄 數據庫模型

### Patient (患者)
- 個人信息 (姓名、郵箱、電話等)
- 認證信息 (密碼、令牌等)
- 醫療歷史
- 保險信息
- 偏好設置

### Appointment (預約)
- 患者和醫生關聯
- 服務信息
- 時間安排
- 狀態管理
- 支付信息

### MedicalRecord (醫療記錄)
- 治療詳情
- 診斷信息
- 臨床筆記
- 附件和影像
- 藥物信息

### Doctor (醫生)
- 專業信息
- 工作時間
- 服務範圍
- 資格認證

### Service (服務)
- 服務詳情
- 定價信息
- 分類和標籤
- 技術要求

## 🔒 安全特性

- **JWT認證** - 安全的令牌認證
- **密碼加密** - bcrypt加密存儲
- **輸入驗證** - 全面的數據驗證
- **速率限制** - 防止濫用
- **CORS配置** - 跨域安全
- **Helmet** - HTTP安全頭

## 🧪 測試

```bash
# 運行測試
npm test

# 測試覆蓋率
npm run test:coverage
```

## 📦 部署

### 使用 Docker

```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

### 使用 PM2

```bash
# 安裝 PM2
npm install -g pm2

# 啟動應用
pm2 start server.js --name "drt-dental-api"

# 設置開機自啟
pm2 startup
pm2 save
```

## 🤝 貢獻

1. Fork 項目
2. 創建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 開啟 Pull Request

## 📄 許可證

此項目使用 MIT 許可證 - 查看 [LICENSE](LICENSE) 文件了解詳情。

## 📞 支持

如有問題或建議，請聯繫：
- 郵箱: contact@drtdental.com
- 電話: +268 78514785

## 🔄 更新日誌

### v1.0.0
- 初始版本發布
- 完整的患者管理系統
- 預約管理功能
- 醫療記錄管理
- 服務展示系統
