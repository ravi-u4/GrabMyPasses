# 🎫 GrabMyPasses

**GrabMyPasses** is a full-stack digital event management and secure ticketing ecosystem designed for college fests and university events. It replaces manual, error-prone ticketing workflows with a secure, digital-first system that handles everything from registration to real-time on-ground check-ins.

---

## 🌐 Live Demo

👉 https://grab-my-passes.vercel.app/

---

## 🚀 Overview

The platform provides end-to-end functionality to ensure a seamless experience for both attendees and organizers. It is optimized for high-traffic college environments and utilizes serverless architecture for scalability.

---

## 🧩 Problem & 💡 Solution

* 📝 **Manual Processes:** Traditional college fests suffer from slow, physical registration. GrabMyPasses enables instant digital booking.
* 🎭 **Ticket Fraud:** Physical tickets are easily duplicated. We use unique QR-based validation for every pass.
* 📊 **Tracking:** Lack of real-time data. We provide live dashboards for organizers to monitor sales and attendance.

---

## 🛠️ Tech Stack

* 🎨 **Frontend:** HTML5, CSS3 (Glassmorphism), JavaScript (ES6+)
* ⚙️ **Backend:** Node.js, Express.js
* 🗄️ **Database:** MongoDB Atlas
* 🔐 **Authentication:** Bcrypt.js (Password Hashing) and Email-based OTP
* ☁️ **Deployment:** Vercel (Serverless Functions)
* 🧰 **Utilities:** Nodemailer (Emails), QRCode.js (Pass generation), Lucide Icons

---

## 🔑 Key Features

### 🛡️ Authentication & Security

* 🔐 **OTP Verification:** Mandatory email-based OTP for both Users and Organizers to ensure account validity.
* 🔑 **Bcrypt Hashing:** All passwords are salted and hashed before storage to ensure maximum security.
* 🧑‍💻 **Role-Based Access:** Strict middleware separation between Users, Organizers, and Super Admins.

---

### 🎟️ Event & Ticketing System

* ⚙️ **Dynamic Creation:** Organizers can configure event capacity, pricing, and venue details.
* 📊 **Capacity Management:** Real-time tracking to prevent overbooking events.
* 🎫 **Instant Digital Passes:** Every confirmed booking generates a unique pass with an embedded QR code for scanning.

---

### ⚡ Admin Control (Super Admin)

* 🧠 **Centralized Control:** Hardcoded authority to monitor platform-wide data and revenue.
* 🛠️ **Manual Override:** Power to manually verify or revoke accounts if OTP systems fail.
* 🗑️ **Global Moderation:** One-click deletion of events, users, or bookings to maintain platform integrity.
* 📩 **Support Panel:** Direct monitoring and resolution of "Contact Us" inquiries.

---

### 📲 QR-Based Check-in

* 📷 **Live Scanner:** A specialized organizer interface using the device camera to validate tickets.
* 🚫 **Double-Entry Prevention:** The system instantly marks tickets as "Checked-In" to prevent duplicate entry fraud.

---

## 📂 Project Structure

```bash
grabmypasses/
├── backend/
│   ├── models/        # Mongoose schemas (User, Organizer, Event, etc.)
│   ├── routes/        # API endpoints (Auth, Scan, SuperAdmin, etc.)
│   ├── middleware/    # Security gatekeepers (organizerAuth.js)
│   ├── utils/         # Helper functions (sendEmail.js)
│   └── server.js      # Main entry point
├── frontend/
│   ├── admin/         # Organizer dashboard & scanner
│   ├── superadmin/    # God Mode interface
│   ├── signup/        # Authentication logic
│   └── landing-page/  # Homepage
└── vercel.json        # Deployment configuration
```

---

## 📈 Engineering Highlights

* 🧩 **Modular Architecture:** Designed with clean separation of concerns for easy feature expansion.
* ☁️ **Stateless APIs:** Built to function seamlessly in serverless environments like Vercel.
* ⚡ **Database Optimization:** Utilized `.lean()` in complex queries to reduce memory overhead and improve response times.
* 🛡️ **Failsafe Access:** Implemented `collection.findOne()` for Super Admin logins to bypass schema filters during emergency maintenance.

---

## 👨‍💻 Author

**Ravi**
GrabMyPasses - Digital College Fest Management System
