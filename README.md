# 📦 CampusCrate
### Smart College Campus Lost & Found Management System

CampusCrate is a modern full-stack web application designed to simplify the **Lost & Found** process within college campuses. It enables students to report lost or found items, communicate securely with each other, and recover belongings through a structured and transparent workflow.

The platform provides real-time communication, secure authentication, item verification, and an intuitive interface to create a safer and more organized campus environment.

---

## 📖 Overview

Finding lost belongings on a college campus can be difficult due to scattered communication and the absence of a centralized system.

CampusCrate addresses this challenge by providing a dedicated platform where students can:

- Report lost items
- Report found items
- Search available listings
- Connect with the finder or owner
- Verify ownership
- Successfully recover belongings

---

# ✨ Features

### 🔐 Secure Authentication
- Email OTP verification during registration
- Secure login system
- JWT-based authentication
- Password encryption

### 📦 Lost & Found Management
- Report lost or found items
- Upload item images
- Add category, location, date, and description
- Edit or delete your own posts
- Mark items as claimed

### 🔍 Smart Search & Filtering
- Search items instantly
- Filter by category
- Filter by item type
- Easy browsing experience

### 💬 Real-Time Chat
- Private messaging between owner and finder
- Instant message delivery
- Unread message notifications

### 🛡️ Admin Dashboard
- Manage users
- Monitor item listings
- Remove inappropriate content
- Maintain platform safety

### 🌙 Modern User Interface
- Responsive design
- Light & Dark Mode
- Glassmorphism-inspired interface
- Mobile-friendly layout

---

# 🚀 Tech Stack

## Frontend

- React.js
- Vite
- CSS3
- React Router
- Socket.io Client
- Lucide Icons

## Backend

- Node.js
- Express.js
- MongoDB Atlas
- Mongoose
- Socket.io
- JWT Authentication
- Bcrypt

## Services

- Nodemailer (Email OTP)
- ImageKit (Image Storage)

---

# 📂 Project Structure

```
CampusCrate/
│
├── client/
│   ├── public/
│   ├── src/
│   ├── components/
│   ├── pages/
│   ├── context/
│   └── assets/
│
├── server/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── config/
│   ├── socket/
│   └── server.js
│
├── README.md
└── package.json
```

---

# ⚙️ Environment Variables

Create a `.env` file inside the **server** directory.

```env
# Server
PORT=5050
NODE_ENV=development

# Database
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/CampusCrate

# Authentication
JWT_SECRET=your_jwt_secret_key

# ImageKit
IMAGEKIT_PUBLIC_KEY=your_public_key
IMAGEKIT_PRIVATE_KEY=your_private_key
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_endpoint

# Email
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

---

# 💻 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/CampusCrate.git
```

### 2. Navigate to the Project

```bash
cd CampusCrate
```

### 3. Install Dependencies

Frontend

```bash
cd client
npm install
```

Backend

```bash
cd ../server
npm install
```

---

# ▶️ Run the Application

Start Backend

```bash
npm run dev
```

Start Frontend

```bash
npm run dev
```

---

# 📸 Screenshots

Add screenshots of:

- Home Page
- Login Page
- Lost Items
- Found Items
- Item Details
- Chat System
- Admin Dashboard

---

# 🎯 Future Enhancements

- AI-based image matching
- QR code integration
- Push notifications
- Campus location map
- Mobile application
- Multi-language support
- Advanced analytics dashboard

---

# 👥 Team

| Name | Role |
|------|------|
| **Sanjeev Bhawra** | Lead Developer & System Integration |
| **Vivek** | Backend Developer |
| **Varun** | Frontend Developer |
| **Ankit Nehar** | UI/UX & Documentation |

---

# 🌐 Live Demo

**Frontend:** https://campus-crate-pink.vercel.app/

**Backend:** https://campuscrate-em9z.onrender.com/

---

# 🤝 Contributing

Contributions are welcome!

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push the branch
5. Open a Pull Request

---

# 📄 License

This project is developed for educational and academic purposes.

---

# ⭐ Support

If you found this project helpful, consider giving it a ⭐ on GitHub.

It helps support the project and encourages future development.
