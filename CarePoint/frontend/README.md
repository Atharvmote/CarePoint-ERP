# MediPulse - Healthcare ERP System

A modern, production-grade medical ERP dashboard built with React and Tailwind CSS.

## 📁 Project Structure

```
medipulse/
├── src/
│   ├── api/
│   │   └── api.js                 # API integration functions
│   ├── components/
│   │   ├── Card.jsx               # Reusable card component
│   │   ├── Loader.jsx             # Loading spinner component
│   │   ├── Navbar.jsx             # Top navigation bar
│   │   ├── ProtectedRoute.jsx    # Route protection wrapper
│   │   ├── StatusBadge.jsx        # Status indicator badges
│   │   └── Table.jsx              # Reusable table component
│   ├── context/
│   │   └── AuthContext.jsx        # Authentication context provider
│   ├── layout/
│   │   ├── MainLayout.jsx         # Main application layout
│   │   ├── Sidebar.jsx            # Sidebar navigation
│   │   └── Topbar.jsx             # Top bar wrapper
│   ├── pages/
│   │   ├── Dashboard.jsx          # Dashboard with stats & appointments
│   │   ├── Doctors.jsx            # Doctor management
│   │   ├── Inquiries.jsx          # Patient inquiry management
│   │   ├── Login.jsx              # Login page
│   │   ├── Register.jsx           # Registration page
│   │   ├── Resources.jsx          # Medical resource/inventory management
│   │   └── Slots.jsx              # Appointment slot management
│   ├── utils/
│   │   └── helpers.js             # Utility functions
│   ├── App.jsx                    # Main app component
│   ├── App.css                    # Custom app styles
│   ├── main.jsx                   # Entry point
│   └── index.css                  # Global styles with Tailwind
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

## ✨ Features

### Pages
- **Login** - Modern split-screen authentication
- **Register** - User registration
- **Dashboard** - Overview with statistics and recent appointments
- **Doctors** - Doctor profiles and management
- **Inquiries** - Patient inquiry tracking
- **Slots** - Appointment slot scheduling
- **Resources** - Medical inventory management

### Components
- **Card** - Reusable card container
- **Loader** - Loading states
- **Navbar** - Search and user profile
- **StatusBadge** - Color-coded status indicators
- **Table** - Data tables
- **ProtectedRoute** - Authentication guard

### Features
- Dark sidebar navigation
- Context-based authentication
- Responsive design
- Status management
- Search functionality
- Modern UI/UX

## 🚀 Installation

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

4. Preview production build:
```bash
npm run preview
```

## 🛠️ Tech Stack

- **React 18** - UI framework
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **Vite** - Build tool
- **Context API** - State management

## 📋 Usage

1. Start the application with `npm run dev`
2. Login with any credentials (demo mode)
3. Navigate through different sections using the sidebar
4. All features are fully functional in demo mode

## 🎨 Design System

### Colors
- Primary: Blue (#3B82F6) to Cyan (#06B6D4) gradients
- Success: Green
- Warning: Amber
- Error: Red
- Neutral: Slate

### Typography
- Font: Inter (Google Fonts)
- Headings: Bold, Large sizes
- Body: Medium weight

## 📝 File Descriptions

### API
- `api.js` - Backend API integration with authentication and CRUD operations

### Context
- `AuthContext.jsx` - Manages authentication state and navigation

### Utils
- `helpers.js` - Date formatting, validation, storage, and utility functions

### Layout
- `MainLayout.jsx` - Wraps authenticated pages with sidebar and navbar
- `Sidebar.jsx` - Left navigation menu
- `Topbar.jsx` - Top navigation bar

## 🔒 Authentication

Uses Context API for state management. Login flow:
1. User enters credentials on Login page
2. AuthContext validates and sets authentication state
3. Protected routes redirect to login if not authenticated
4. Sidebar navigation only visible when authenticated

## 📦 Build Output

Production build creates optimized files in `dist/` directory:
- Minified JavaScript
- Optimized CSS
- Asset optimization
- Code splitting

## 🌐 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 📄 License

MIT

## 👥 Contributing

This is a production-ready template. Feel free to customize for your needs.

---

Built with ❤️ for modern healthcare
