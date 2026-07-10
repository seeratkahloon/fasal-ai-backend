# 🌾 FasalAI Backend
### Node.js + Express + MongoDB REST API

---

## 🚀 Setup Instructions

### Step 1 — Open in VS Code
Open the `fasal-ai-backend` folder in VS Code.

### Step 2 — Install dependencies
```bash
npm install
```

### Step 3 — Setup MongoDB (Free)
1. Go to https://cloud.mongodb.com
2. Create free account → New Project → Build Database (free tier)
3. Create a username and password
4. Click "Connect" → "Drivers" → copy the connection string

### Step 4 — Create your .env file
Copy `.env.example` to `.env`:
```bash
copy .env.example .env
```
Then fill in your values in `.env`

### Step 5 — Start the server
```bash
npm run dev
```
Server runs at: **http://localhost:5000**

---

## 📁 Folder Structure
```
fasal-ai-backend/
├── server.js              ← Entry point
├── config/
│   └── db.js              ← MongoDB connection
├── models/
│   ├── User.js            ← User schema
│   └── Report.js          ← Crop report schema
├── controllers/
│   ├── authController.js  ← Register, login logic
│   └── reportController.js← Disease detection logic
├── routes/
│   ├── auth.js            ← /api/auth/*
│   ├── reports.js         ← /api/reports/*
│   ├── chat.js            ← /api/chat
│   └── weather.js         ← /api/weather
└── middleware/
    └── auth.js            ← JWT protection middleware
```

---

## 🔗 All API Routes

### Auth Routes
| Method | Route               | Access  | Description        |
|--------|--------------------|---------|--------------------|
| POST   | /api/auth/register | Public  | Register new user  |
| POST   | /api/auth/login    | Public  | Login user         |
| GET    | /api/auth/me       | Private | Get my profile     |
| PUT    | /api/auth/profile  | Private | Update profile     |

### Report Routes
| Method | Route              | Access  | Description        |
|--------|-------------------|---------|--------------------|
| POST   | /api/reports/detect| Private | Upload & detect    |
| GET    | /api/reports       | Private | Get all my reports |
| GET    | /api/reports/:id   | Private | Get one report     |
| DELETE | /api/reports/:id   | Private | Delete report      |

### Other Routes
| Method | Route         | Access  | Description     |
|--------|--------------|---------|-----------------|
| POST   | /api/chat    | Private | AI chatbot      |
| GET    | /api/weather | Private | Weather data    |

---

## 🧪 Testing with Postman
1. Open Postman
2. Import `FasalAI.postman_collection.json`
3. Run requests in order (register → login → copy token → test others)
