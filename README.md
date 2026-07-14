# 🍕 Alfredough POS System

A full-featured Point of Sale system built with **Next.js 14**, **Prisma ORM**, and **MySQL**.

Submitted to: **The Superior University Lahore, Faisalabad Campus**

---

## 🚀 Quick Setup (Step by Step)

### Step 1 — Start XAMPP/WAMP
- Start **Apache** and **MySQL** in XAMPP/WAMP

### Step 2 — Create Database
- Open **phpMyAdmin** → `http://localhost/phpmyadmin`
- Click **Import** → choose file: `prisma/setup.sql` → click **Go**
- This creates all tables + seeds default admin + sample data

### Step 3 — Install Node Modules
```bash
npm install
```

### Step 4 — Configure Environment
- Copy `.env.example` to `.env`
- If your MySQL has a password, update it:
```
DATABASE_URL="mysql://root:YOUR_PASSWORD@localhost:3306/alfredough_pos"
```

### Step 5 — Generate Prisma Client
```bash
npx prisma generate
```

### Step 6 — Run the App
```bash
npm run dev
```
Open **http://localhost:3000**

---

## 🔐 Default Login
| Field | Value |
|-------|-------|
| Username | `admin` |
| Password | `admin123` |

---

## ✅ Features

| Module | Features |
|--------|----------|
| 🔐 Auth | Admin login, JWT session, protected routes |
| 📊 Dashboard | Order stats, revenue, recent orders |
| 🗂️ Categories | Add / Edit / Delete / Toggle status |
| 🍔 Products | Add with variants (Small/Medium/Large), Edit, Delete |
| 👥 Customers | CRUD + phone/name search |
| 🧾 Orders | Create order with cart, discounts, service charge, delivery fee |
| 📦 Orders Mgmt | Complete / Cancel (with reason) / Return (with refund) |
| 🏪 Inventory | Kitchen stock: Add / Use / Set / History log |
| 📈 Reports | Order stats, cancellations, returns, revenue |

---

## 🗄️ Database Tables

| Core Tables | Audit Tables |
|-------------|-------------|
| admins | order_edits |
| categories | order_cancellations |
| products | order_returns |
| product_variants | order_id_mapping |
| customers | |
| orders | |
| order_items | |
| kitchen_stock | |
| kitchen_stock_history | |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router) |
| Styling | Tailwind CSS |
| Database | MySQL via XAMPP/WAMP |
| ORM | Prisma |
| Auth | NextAuth.js v4 |
| Language | TypeScript |

---

## 📁 Project Structure

```
alfredough-pos/
├── app/
│   ├── (dashboard)/        # Protected pages
│   │   ├── dashboard/
│   │   ├── orders/
│   │   ├── products/
│   │   ├── categories/
│   │   ├── customers/
│   │   ├── inventory/
│   │   └── reports/
│   ├── api/                # REST API routes
│   └── login/
├── components/
│   └── layout/             # Sidebar, Topbar
├── lib/
│   ├── auth.ts             # NextAuth config
│   ├── db.ts               # Prisma client
│   └── utils.ts            # Helpers
├── prisma/
│   ├── schema.prisma       # Database schema
│   ├── seed.ts             # Sample data seeder
│   └── setup.sql           # Raw SQL setup file
└── middleware.ts           # Route protection
```

---

## 💡 Notes
- All amounts are in **Pakistani Rupees (Rs.)**
- Default admin password is hashed with **bcrypt**
- Order auditing logs every cancel/return/edit automatically
- Low stock alerts shown when quantity ≤ minimum stock level
# alfredough-pos
