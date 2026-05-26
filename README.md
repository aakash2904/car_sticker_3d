# CarSticker Pro v3.0

Clean, professional vehicle sticker management system.
Simple spinning 3D car on login, fully functional CRUD app.

---

## Quick Start

### 1. Backend
```bash
cd backend
npm install
```

Edit `.env` with your SQL Server details:
```
DB_USER=sa
DB_PASSWORD=YourPassword
DB_SERVER=localhost\SQLEXPRESS
DB_NAME=car_sticker_db
JWT_SECRET=change_this_to_a_long_random_string
PORT=5000
```

```bash
npm start
```

### 2. Frontend
```bash
cd frontend
npm install
npm run dev       # http://localhost:3000
```

For production:
```bash
npm run build && npm start
```

---

## First Admin User (SQL)
```sql
INSERT INTO Users (userid, password, name, role, created_at)
VALUES ('admin',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lihO',
  'Administrator', 'admin', GETDATE());
-- Password: admin123
```

---

## Pages
| Route | Description |
|-------|-------------|
| `/login` | Login with spinning 3D car |
| `/dashboard` | Stats + monthly chart |
| `/stickers` | Full CRUD — add, edit, delete, search, filter, paginate |
| `/vehicles` | Add & list vehicles |
| `/owners` | Add & list owners (card grid) |
| `/reports` | Bar chart + pie chart |
| `/admin` | User management (admin role only) |

---

## Deploy

**Frontend → Vercel**
1. Push `frontend/` to GitHub
2. Import on vercel.com
3. Set `NEXT_PUBLIC_API_URL` env var to your backend URL

**Backend → Render.com**
1. Push `backend/` to GitHub
2. New Web Service → Build: `npm install`, Start: `node server.js`
3. Add all env vars from `.env`

**Backend → Docker**
```bash
cd backend
docker build -t car-sticker-api .
docker run -p 5000:5000 --env-file .env car-sticker-api
```

---

## Stack
- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, Three.js (R3F), Recharts, Zustand
- **Backend**: Node.js, Express, MSSQL, JWT, bcryptjs
