# 📈 StockVault — Virtual Stock Trading Platform

A full-stack virtual stock market simulation built for a Software Engineering Lab project.  
Users receive **$100,000** in virtual funds on registration and can trade 35 real-world companies in a realistic dark-themed trading dashboard.

---

## 🗂 Project Structure

```
stockvault/
├── backend/                  # Node.js + Express REST API
│   ├── config/
│   │   └── db.js             # MySQL connection pool
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── stockController.js
│   │   ├── portfolioController.js
│   │   ├── transactionController.js
│   │   ├── settingsController.js
│   │   └── adminController.js
│   ├── middleware/
│   │   └── auth.js           # JWT + admin guard
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── stockRoutes.js
│   │   ├── portfolioRoutes.js
│   │   ├── transactionRoutes.js
│   │   ├── settingsRoutes.js
│   │   └── adminRoutes.js
│   ├── server.js
│   ├── package.json
│   └── .env.example
│
├── frontend/                 # React + Vite + Tailwind CSS
│   ├── src/
│   │   ├── components/
│   │   │   ├── admin/        # AdminSidebar, AdminTopbar
│   │   │   ├── charts/       # Chart.js wrappers
│   │   │   └── common/       # Sidebar, Topbar, StatCard, TradeModal, etc.
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── layouts/
│   │   │   ├── UserLayout.jsx
│   │   │   └── AdminLayout.jsx
│   │   ├── pages/
│   │   │   ├── auth/         # Login, Register, AdminLogin
│   │   │   ├── user/         # Dashboard, Stocks, Portfolio, Transactions, Settings
│   │   │   └── admin/        # AdminDashboard, AdminStocks, AdminUsers, AdminTransactions
│   │   ├── services/
│   │   │   └── api.js        # Axios instance with JWT interceptors
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
│
└── database/
    ├── schema.sql            # All table definitions + default admin
    └── seeds.sql             # 35 stock entries
```

---

## ✅ Prerequisites

| Tool    | Version     | Download |
|---------|-------------|----------|
| Node.js | 18+         | https://nodejs.org |
| npm     | 9+          | Bundled with Node |
| MySQL   | 8.0+        | https://dev.mysql.com/downloads/ |
| Git     | any         | https://git-scm.com |

---

## 🗄️ Step 1 — Database Setup

### 1a. Start MySQL and open a client

```bash
# Mac (Homebrew)
brew services start mysql
mysql -u root -p

# Windows
# Open MySQL Workbench or MySQL Shell

# Linux
sudo systemctl start mysql
sudo mysql -u root -p
```

### 1b. Create the database and run schema

```sql
-- Inside MySQL client:
SOURCE /full/path/to/stockvault/database/schema.sql;
SOURCE /full/path/to/stockvault/database/seeds.sql;
```

**Or using the mysql command directly from your terminal:**

```bash
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seeds.sql
```

### 1c. Verify

```sql
USE stockvault;
SHOW TABLES;
SELECT company_name, symbol, current_price FROM stocks LIMIT 5;
SELECT email FROM admins;
```

Expected tables: `users`, `admins`, `stocks`, `portfolios`, `transactions`, `user_settings`

---

## ⚙️ Step 2 — Backend Setup

### 2a. Navigate to backend folder

```bash
cd stockvault/backend
```

### 2b. Install dependencies

```bash
npm install
```

### 2c. Create environment file

```bash
cp .env.example .env
```

Edit `.env` with your MySQL credentials:

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password_here
DB_NAME=stockvault
JWT_SECRET=stockvault_jwt_secret_change_this_in_production_2024
JWT_EXPIRES_IN=7d
```

### 2d. Start the backend

**Development (with auto-reload):**
```bash
npm run dev
```

**Production:**
```bash
npm start
```

You should see:
```
✅ MySQL connected
🚀 StockVault API running on http://localhost:5000
```

### 2e. Test the API health endpoint

Open in browser or run:
```bash
curl http://localhost:5000/api/health
```
Expected: `{"status":"OK","timestamp":"..."}`

---

## 🖥️ Step 3 — Frontend Setup

Open a **new terminal tab/window**.

### 3a. Navigate to frontend folder

```bash
cd stockvault/frontend
```

### 3b. Install dependencies

```bash
npm install
```

### 3c. Start the development server

```bash
npm run dev
```

You should see:
```
  VITE v5.x.x  ready in xxx ms
  ➜  Local:   http://localhost:5173/
```

Open your browser at **http://localhost:5173**

---

## 🔐 Default Credentials

### Admin Account
| Field    | Value                    |
|----------|--------------------------|
| Email    | admin@stockvault.com     |
| Password | Admin@123                |
| URL      | http://localhost:5173/admin/login |

### New User Registration
- Go to http://localhost:5173/register
- Fill in name, email, password
- You automatically receive **$100,000** virtual balance

---

## 🚀 Complete API Reference

### Authentication  `POST /api/auth/`

| Method | Endpoint                  | Auth | Description          |
|--------|---------------------------|------|----------------------|
| POST   | `/auth/register`          | ❌   | Register new user    |
| POST   | `/auth/login`             | ❌   | User login           |
| POST   | `/auth/admin/login`       | ❌   | Admin login          |
| GET    | `/auth/profile`           | ✅   | Get current user     |
| PUT    | `/auth/profile`           | ✅   | Update name          |
| PUT    | `/auth/change-password`   | ✅   | Change password      |

### Stocks  `GET/POST /api/stocks/`

| Method | Endpoint          | Auth  | Description         |
|--------|-------------------|-------|---------------------|
| GET    | `/stocks`         | ✅    | List all stocks     |
| GET    | `/stocks/:id`     | ✅    | Get single stock    |
| POST   | `/stocks/buy`     | ✅    | Buy shares          |
| POST   | `/stocks/sell`    | ✅    | Sell shares         |

### Portfolio  `/api/portfolio/`

| Method | Endpoint              | Auth | Description              |
|--------|-----------------------|------|--------------------------|
| GET    | `/portfolio`          | ✅   | User holdings + P&L      |
| GET    | `/portfolio/dashboard`| ✅   | Dashboard stats + charts |

### Transactions  `/api/transactions/`

| Method | Endpoint          | Auth | Description                           |
|--------|-------------------|------|---------------------------------------|
| GET    | `/transactions`   | ✅   | Paginated history (search, type filter)|

### Settings  `/api/settings/`

| Method | Endpoint      | Auth | Description         |
|--------|---------------|------|---------------------|
| GET    | `/settings`   | ✅   | Get user settings   |
| PUT    | `/settings`   | ✅   | Update settings     |

### Admin  `/api/admin/`  *(admin token required)*

| Method | Endpoint                   | Description              |
|--------|----------------------------|--------------------------|
| GET    | `/admin/dashboard`         | Platform stats           |
| GET    | `/admin/users`             | All users                |
| GET    | `/admin/transactions`      | All transactions (paged) |
| POST   | `/admin/stocks`            | Create stock             |
| PUT    | `/admin/stocks/:id`        | Update stock             |
| DELETE | `/admin/stocks/:id`        | Delete stock             |

---

## ✨ Feature Summary

| Module            | Features                                                        |
|-------------------|-----------------------------------------------------------------|
| **Auth**          | Register, Login, JWT, bcrypt, protected routes                  |
| **Dashboard**     | 6 stat cards, portfolio pie chart, buy/sell bar chart, recent trades |
| **Market**        | 35 stocks, search, sector filter, sort, buy/sell modal          |
| **Portfolio**     | Holdings, avg buy price, P&L per position, distribution chart   |
| **Transactions**  | Full history, pagination, search, BUY/SELL filter              |
| **Settings**      | Theme, currency (USD/INR), notifications, language, password    |
| **Admin Stocks**  | Full CRUD — create, edit, delete stocks with validation         |
| **Admin Users**   | View all users, wallet balances, join date                      |
| **Admin Txns**    | All platform trades with user details and pagination            |

---

## 🛠️ Build for Production

### Frontend
```bash
cd frontend
npm run build
# Output in frontend/dist/
```

### Backend
```bash
# Use PM2 for process management
npm install -g pm2
cd backend
pm2 start server.js --name stockvault-api
pm2 save
```

---

## 🐛 Troubleshooting

**MySQL connection refused**
```bash
# Check MySQL is running
sudo systemctl status mysql       # Linux
brew services list | grep mysql   # Mac
```

**Port 5000 already in use**
```bash
# Find and kill the process
lsof -i :5000
kill -9 <PID>
# Or change PORT in .env
```

**Port 5173 already in use**
```bash
# Vite will auto-increment to 5174 — just update api.js baseURL if needed
```

**CORS errors**
- Ensure backend `.env` has frontend URL matching exactly
- Backend `server.js` is set to `http://localhost:5173` — change if your frontend runs elsewhere

**"Cannot find module" errors**
```bash
# Run npm install again in the affected folder
cd backend && npm install
cd ../frontend && npm install
```

**Admin password not working**
```bash
# Re-run schema.sql to regenerate the default admin hash
mysql -u root -p stockvault < database/schema.sql
```

---

## 📚 Tech Stack

| Layer      | Technology                                     |
|------------|------------------------------------------------|
| Frontend   | React 18, Vite, Tailwind CSS, React Router v6  |
| Charts     | Chart.js 4, react-chartjs-2                    |
| HTTP       | Axios with JWT interceptors                    |
| Notifications | react-hot-toast                             |
| Backend    | Node.js, Express.js                            |
| Database   | MySQL 8, mysql2 (promise pool)                 |
| Auth       | JWT (jsonwebtoken), bcryptjs                   |
| Icons      | react-icons (Remix Icon set)                   |

---

## 👥 Credits

Built as a Software Engineering Lab project demonstrating:
- RESTful API design
- JWT authentication flow  
- Relational database design with normalized tables
- React component architecture with context API
- Protected routing for both user and admin roles
- Real-time portfolio P&L calculations
- Atomic database transactions for buy/sell operations
