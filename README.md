# Car Technical Inspection Reservation System

A modern, responsive web application for booking car technical inspection appointments in Morocco. Built with React, TypeScript, and Tailwind CSS.

## 🚀 Features

### Public Pages
- **Home** - Landing page with service overview
- **Services** - List of available inspection services
- **Locations** - Available inspection centers (magazins)
- **Appointments** - Multi-step booking system
- **Check Appointment** - View booking status
- **Booking Status** - Detailed appointment information
- **Magazin Detail** - Individual center information

### Admin Panel
- **Dashboard** - Overview and statistics
- **Services Management** - CRUD operations for services
- **Magazins Management** - CRUD operations for inspection centers
- **Appointments Management** - View and manage bookings
- **Calendar** - Visual appointment calendar
- **Reports** - Analytics and reporting
- **Login** - Secure admin authentication

### Technical Features
- 🌙 Dark mode support
- 🌍 Internationalization (English, French, Arabic)
- 📱 Fully responsive design
- ⚡ Fast performance with Vite
- 🎨 Professional UI with Tailwind CSS
- 🔒 Type-safe with TypeScript
- 🔧 Centralized API configuration with environment variables

## 🏗️ Detailed Project Structure

```
car-res-morocco/
├── 📁 client/                          # Frontend React application
│   ├── 📁 public/                      # Static assets
│   │   ├── robots.txt                  # SEO robots file
│   │   └── sitemap.xml                 # SEO sitemap
│   ├── 📁 src/                         # Source code
│   │   ├── 📁 components/              # Reusable UI components
│   │   │   ├── 📁 admin/               # Admin-specific components
│   │   │   │   └── WorkingHoursManager.tsx
│   │   │   ├── 📁 ui/                  # Base UI components
│   │   │   │   ├── Button.tsx          # Custom button component
│   │   │   │   ├── Card.tsx            # Card container component
│   │   │   │   ├── Calendar.tsx        # Calendar component
│   │   │   │   ├── Checkbox.tsx        # Checkbox input component
│   │   │   │   ├── Input.tsx           # Text input component
│   │   │   │   ├── QuickDatePicker.tsx # Date picker component
│   │   │   │   ├── Radio.tsx           # Radio button component
│   │   │   │   ├── Select.tsx          # Dropdown select component
│   │   │   │   ├── SelectedDateInfo.tsx # Date display component
│   │   │   │   ├── Table.tsx           # Data table component
│   │   │   │   ├── Textarea.tsx        # Multi-line text input
│   │   │   │   └── index.ts            # Component exports
│   │   │   ├── AdminNav.tsx            # Admin navigation component
│   │   │   ├── AdminRoute.tsx          # Protected admin route wrapper
│   │   │   ├── ErrorBoundary.tsx       # Error handling component
│   │   │   ├── Loading.tsx             # Loading spinner component
│   │   │   ├── Navbar.tsx              # Main navigation bar
│   │   │   └── SEO.tsx                 # SEO optimization component
│   │   ├── 📁 contexts/                # React context providers
│   │   │   ├── AuthContext.tsx         # Authentication state management
│   │   │   └── ThemeContext.tsx        # Theme switching (dark/light)
│   │   ├── 📁 i18n/                    # Internationalization
│   │   │   ├── 📁 locales/             # Locale-specific files
│   │   │   ├── ar.json                 # Arabic translations
│   │   │   ├── en.json                 # English translations
│   │   │   ├── fr.json                 # French translations
│   │   │   ├── config.ts               # i18n configuration
│   │   │   └── index.ts                # i18n setup and exports
│   │   ├── 📁 pages/                   # Page components
│   │   │   ├── 📁 admin/               # Admin panel pages
│   │   │   │   ├── Appointments.tsx    # Admin appointments management
│   │   │   │   ├── Calendar.tsx        # Admin calendar view
│   │   │   │   ├── Dashboard.tsx       # Admin dashboard
│   │   │   │   ├── Login.tsx           # Admin login page
│   │   │   │   ├── Magazins.tsx        # Admin magazins management
│   │   │   │   ├── Reports.tsx         # Admin reports and analytics
│   │   │   │   └── Services.tsx        # Admin services management
│   │   │   ├── Appointments.tsx        # Public appointment booking
│   │   │   ├── BookingStatus.tsx       # Appointment status view
│   │   │   ├── CheckAppointment.tsx    # Appointment lookup
│   │   │   ├── Home.tsx                # Landing page
│   │   │   ├── Locations.tsx           # Inspection centers list
│   │   │   ├── MagazinDetail.tsx       # Individual center details
│   │   │   ├── Magazins.tsx            # Centers overview
│   │   │   ├── NotFound.tsx            # 404 error page
│   │   │   └── Services.tsx            # Services overview
│   │   ├── 📁 utils/                   # Utility functions
│   │   │   └── api.ts                  # API client configuration
│   │   ├── App.tsx                     # Main application component
│   │   ├── index.css                   # Global styles and Tailwind imports
│   │   └── main.tsx                    # Application entry point
│   ├── env.example                     # Environment variables template
│   ├── index.html                      # HTML template
│   ├── package.json                    # Frontend dependencies and scripts
│   ├── postcss.config.js               # PostCSS configuration
│   ├── tailwind.config.js              # Tailwind CSS configuration
│   ├── tsconfig.json                   # TypeScript configuration
│   ├── tsconfig.node.json              # Node-specific TS config
│   └── vite.config.ts                  # Vite build configuration
├── 📁 server/                          # Backend API server
│   ├── 📁 src/                         # Source code
│   │   ├── 📁 config/                  # Configuration files
│   │   │   └── env.ts                  # Environment configuration
│   │   ├── 📁 db/                      # Database connection
│   │   │   └── connect.ts              # MongoDB connection setup
│   │   ├── 📁 middleware/              # Express middleware
│   │   │   └── auth.ts                 # JWT authentication middleware
│   │   ├── 📁 models/                  # MongoDB data models
│   │   │   ├── Appointment.ts          # Appointment data model
│   │   │   ├── Magazin.ts              # Inspection center model
│   │   │   ├── Service.ts              # Service type model
│   │   │   ├── User.ts                 # User account model
│   │   │   └── index.ts                # Model exports
│   │   ├── 📁 routes/                  # API route handlers
│   │   │   ├── appointments.routes.ts  # Appointment endpoints
│   │   │   ├── auth.routes.ts          # Authentication endpoints
│   │   │   ├── magazins.routes.ts      # Magazin management endpoints
│   │   │   ├── reports.routes.ts       # Reporting endpoints
│   │   │   └── services.routes.ts      # Service management endpoints
│   │   ├── 📁 types/                   # TypeScript type definitions
│   │   ├── app.ts                      # Express application setup
│   │   └── server.ts                   # Server entry point
│   ├── env.example                     # Environment variables template
│   ├── package.json                    # Backend dependencies and scripts
│   └── tsconfig.json                   # TypeScript configuration
├── package.json                         # Root package.json with workspace config
├── .gitignore                          # Git ignore rules
├── README.md                            # This documentation file
└── DEPLOYMENT.md                        # Deployment guide
```

**Note:** This structure represents the clean, production-ready codebase. Build outputs (`dist/` folders), dependencies (`node_modules/`), and development utilities have been removed and are properly ignored by `.gitignore`.

## 🛠️ Tech Stack

### Frontend (Client)
- **React 18** - Modern UI framework with hooks
- **TypeScript 5.3** - Type-safe development
- **Tailwind CSS 3.3** - Utility-first CSS framework
- **Vite 5.0** - Fast build tool and dev server
- **React Router 6.20** - Client-side routing
- **React i18next 13.5** - Internationalization
- **React Hook Form 7.48** - Form handling with validation
- **Zod 3.22** - Schema validation
- **Zustand 5.0** - State management
- **Day.js 1.11** - Date manipulation
- **Axios 1.6** - HTTP client
- **Radix UI** - Accessible UI primitives
- **Heroicons** - Icon library

### Backend (Server)
- **Node.js** - JavaScript runtime
- **Express 4.18** - Web framework
- **TypeScript 5.3** - Type-safe development
- **MongoDB** - NoSQL database
- **Mongoose 8.0** - MongoDB ODM
- **JWT** - JSON Web Token authentication
- **bcryptjs 2.4** - Password hashing
- **Helmet 7.1** - Security middleware
- **CORS** - Cross-origin resource sharing
- **Morgan** - HTTP request logging
- **PDFKit** - PDF generation
- **json2csv** - CSV export functionality
- **Rate limiting** - API protection

### Development Tools
- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixes
- **ts-node-dev** - TypeScript development server
- **Concurrently** - Run multiple commands

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- MongoDB instance

### 1. Clone and Install
```bash
git clone <your-repo-url>
cd car-res-morocco

# Install all dependencies (root, client, and server)
npm run install:all

# Or install individually:
npm install
cd client && npm install
cd ../server && npm install
```

### 2. Environment Setup
```bash
# Frontend (.env in client directory)
VITE_API_BASE_URL=http://localhost:4000/api

# Backend (.env in server directory)
PORT=4000
MONGODB_URI=mongodb://localhost:27017/car-inspection
JWT_SECRET=your-secret-key
NODE_ENV=development
```

### 3. Start Development
```bash
# Option 1: Start both frontend and backend (recommended)
npm run dev

# Option 2: Start individually
# Terminal 1 - Backend
npm run dev:server

# Terminal 2 - Frontend  
npm run dev:client
```

## 📦 Build for Production

### Complete Build
```bash
# Build both frontend and backend
npm run build

# Or build individually:
npm run build:server
npm run build:client
```

### Frontend Build
```bash
cd client
npm run build
# Output: client/dist/
```

### Backend Build
```bash
cd server
npm run build
# Output: server/dist/
```

## 🚀 Deployment Steps

### Option 1: Vercel + Railway (Recommended)

#### Frontend (Vercel)
1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Connect your GitHub repository
   - Set build command: `cd client && npm run build`
   - Set output directory: `client/dist`
   - Set environment variable: `VITE_API_BASE_URL=https://your-backend-url.railway.app/api`

#### Backend (Railway)
1. **Deploy to Railway**
   - Go to [railway.app](https://railway.app)
   - Connect your GitHub repository
   - Set environment variables from your `.env` file
   - Railway will auto-deploy on push

### Option 2: Netlify + Render

#### Frontend (Netlify)
1. **Build locally**
   ```bash
   cd client
   npm run build
   ```

2. **Deploy to Netlify**
   - Drag `client/dist` folder to Netlify
   - Or connect GitHub for auto-deploy
   - Set environment variable: `VITE_API_BASE_URL=https://your-backend-url.onrender.com/api`

#### Backend (Render)
1. **Deploy to Render**
   - Go to [render.com](https://render.com)
   - Create new Web Service
   - Connect your GitHub repository
   - Set build command: `npm install && npm run build`
   - Set start command: `npm start`

### Option 3: Traditional Hosting

#### Frontend
1. **Build the project**
   ```bash
   cd client
   npm run build
   ```

2. **Upload to hosting**
   - Upload `client/dist` contents to your web server
   - Configure server to serve `index.html` for all routes

#### Backend
1. **Build the project**
   ```bash
   cd server
   npm run build
   ```

2. **Deploy to server**
   - Upload `server/dist` and `server/package.json`
   - Run `npm install --production`
   - Use PM2 or similar to run: `npm start`

## 🔧 Environment Variables

### Frontend (.env in client directory)
```env
VITE_API_BASE_URL=https://your-backend-url.com/api
```

### Backend (.env in server directory)
```env
PORT=4000
MONGODB_URI=mongodb://localhost:27017/car-inspection
JWT_SECRET=your-super-secret-key
NODE_ENV=production
```

## 📱 Available Scripts

### Root Level
```bash
npm run dev              # Start both frontend and backend
npm run dev:server       # Start only backend
npm run dev:client       # Start only frontend
npm run build            # Build both frontend and backend
npm run build:server     # Build only backend
npm run build:client     # Build only frontend
npm run start            # Start production backend
npm run start:server     # Start production backend
npm run install:all      # Install all dependencies
npm run clean            # Clean all node_modules and dist folders
```

### Frontend (client/)
```bash
npm run dev              # Start development server (port 3000)
npm run build            # Build for production
npm run preview          # Preview production build
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint issues
```

### Backend (server/)
```bash
npm run dev              # Start development server (port 4000)
npm run build            # Build for production
npm start                # Start production server
npm run seed             # Seed database with initial data
npm run seed:data        # Seed database with sample data
npm run demo:concurrency # Run concurrency demo
npm run update:slots     # Update slot duration
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint issues
```

## 🗑️ Files to Remove Before Deployment

### Development Files
- `FormExample.tsx` - Example form component
- `Book.tsx` - Redirect component (functionality moved to Appointments)
- Any test files or development utilities

### Build Artifacts
- `node_modules/` directories
- `dist/` directories
- `.env` files (use environment variables instead)

## ✅ Pre-Deployment Checklist

- [ ] Remove unnecessary files (`FormExample.tsx`, `Book.tsx`)
- [ ] Update environment variables for production
- [ ] Test build process locally
- [ ] Ensure all API endpoints work
- [ ] Check responsive design on mobile
- [ ] Verify dark mode functionality
- [ ] Test internationalization
- [ ] Remove console.log statements
- [ ] Update README with deployment info



## 🐛 Troubleshooting

### Common Issues
1. **Build fails** - Check TypeScript errors and fix them
2. **API not working** - Verify environment variables and backend URL
3. **Styling issues** - Ensure Tailwind CSS is building correctly
4. **Routing problems** - Configure server to handle SPA routing

### Support
For deployment issues, check:
- Environment variable configuration
- Build output directories
- Server configuration for SPA routing
- Database connection strings

## 📄 License

This project is proprietary software. All rights reserved.

---

**Ready for deployment! 🚀**