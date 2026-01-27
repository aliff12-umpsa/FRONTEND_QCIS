# Quality Control System

A modern web application for managing quality control inspections in manufacturing environments. Built with React and Node.js, designed for inspectors to record product quality checks, track defects, and generate comprehensive reports.

## 🌟 Features

- **User Authentication**: Secure login and registration with role-based access control
- **Dashboard Analytics**: Real-time charts and statistics showing quality metrics and trends
- **Inspection Management**: Create and manage product inspections with pass/fail status
- **Defect Tracking**: Record multiple defects per inspection with severity levels
- **Quality Reports**: Track daily inspection summaries with automatic pass rate calculations
- **Product Management**: Maintain product catalog with categories and pricing
- **User Management**: Admin controls for managing system users and roles
- **Responsive Design**: Seamless experience across desktop and mobile devices

## 🛠 Tech Stack

### Frontend
- **React 18** - Modern UI library
- **React Router v6** - Client-side routing
- **Axios** - HTTP client for API calls
- **Recharts** - Data visualization and charts
- **Font Awesome** - Icon library
- **Custom CSS** - Modern gradient design system

### Backend
- **Node.js** - JavaScript runtime
- **Express** - Web application framework
- **PostgreSQL** - Relational database
- **bcryptjs** - Password hashing

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- PostgreSQL (v12 or higher)

## 🚀 Installation

### 1. Clone the Repository
```bash
git clone <repository-url>
cd quality-control-system
```

### 2. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create PostgreSQL database
createdb quality_control

# Configure database connection in config/pgdb.js

# Start backend server
npm start
# Server runs on http://localhost:5000
```

### 3. Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm start
# App runs on http://localhost:3000
```

## 📁 Project Structure

```
quality-control-system/
├── backend/
│   ├── config/
│   │   └── pgdb.js              # PostgreSQL configuration
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── defects.controller.js
│   │   ├── inspection_records.controller.js
│   │   ├── products.controller.js
│   │   ├── quality_reports.controller.js
│   │   └── users.controller.js
│   ├── middleware/              # Authentication middleware (if any)
│   ├── routes/                  # API routes
│   ├── node_modules/
│   ├── .env
│   ├── index.js                 # Server entry point
│   ├── package.json
│   └── server.js
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── BarChartComp.jsx
│   │   │   ├── InspectionTable.jsx
│   │   │   ├── Layout.css
│   │   │   ├── Layout.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── ProductForm.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── Sidebar.css
│   │   │   └── Sidebar.jsx
│   │   ├── pages/
│   │   │   ├── Dashboard.css
│   │   │   ├── Dashboard.jsx
│   │   │   ├── DataPages.css
│   │   │   ├── DefectPage.jsx
│   │   │   ├── InspectionPage.css
│   │   │   ├── InspectionPage.jsx
│   │   │   ├── LineChartComp.jsx
│   │   │   ├── Login.css
│   │   │   ├── Login.jsx
│   │   │   ├── ProductPage.jsx
│   │   │   ├── QualityReport.jsx
│   │   │   └── UserPage.jsx
│   │   ├── services/            # API service layer (optional)
│   │   ├── App.jsx
│   │   ├── index.css
│   │   ├── index.html
│   │   ├── index.js
│   │   └── main.jsx
│   ├── node_modules/
│   ├── package.json
│   ├── postcss.config.js
│   ├── server.js
│   └── tailwind.config.js
│
├── sql/                         # Database scripts (optional)
└── README.md
```

## 🔌 API Endpoints

### Authentication
```
POST   /api/auth/login          # User login
```

### Users
```
GET    /api/users               # Get all users
POST   /api/users               # Create user
PUT    /api/users/:id           # Update user
DELETE /api/users/:id           # Delete user
```

### Products
```
GET    /api/products            # Get all products
POST   /api/products            # Create product
PUT    /api/products/:id        # Update product
DELETE /api/products/:id        # Delete product
```

### Inspections
```
GET    /api/inspections         # Get all inspections
POST   /api/inspections         # Create inspection
PUT    /api/inspections/:id     # Update inspection
DELETE /api/inspections/:id     # Delete inspection
```

### Defects
```
GET    /api/defects/:inspection_id  # Get defects by inspection
POST   /api/defects                 # Create defect
PUT    /api/defects/:id             # Update defect
DELETE /api/defects/:id             # Delete defect
```

### Quality Reports
```
GET    /api/quality-reports     # Get all reports
POST   /api/quality-reports     # Create report
PUT    /api/quality-reports/:id # Update report
DELETE /api/quality-reports/:id # Delete report
```

## 👥 User Roles & Permissions

### Admin
- ✅ Full access to all features
- ✅ User management (create, edit, delete users)
- ✅ Product management (create, edit, delete products)
- ✅ Can edit and delete inspections, defects, and reports
- ✅ Access to all analytics and dashboards

### Inspector
- ✅ View dashboard and all records
- ✅ Create new inspections, defects, and quality reports
- ✅ View existing records (read-only)
- ❌ Cannot edit or delete records
- ❌ No access to user management

## 📊 Key Features

### Dashboard
- Real-time statistics (inspections, pass/fail counts, defects)
- Interactive line chart with trend analysis
- Filter data by time period (7 days, 30 days, all time)
- Recent activity feed with timestamps
- Quick action shortcuts

### Quality Reports
- Daily inspection summaries
- Automatic pass rate calculation
- Track total inspections, pass/fail counts
- Defect summaries and notes
- Historical data with filtering
- Export capabilities (coming soon)

### Inspection Management
- Select products from catalog
- Assign inspectors
- Record pass/fail results
- Add detailed notes
- Attach photo URLs
- Track inspection history

### Defect Tracking
- Link defects to specific inspections
- Categorize defect types
- Set severity levels (low, medium, high, critical)
- Detailed descriptions
- Search and filter defects

## 🗄️ Database Schema

### Users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'inspector',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Products Table
```sql
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  price DECIMAL(10, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Inspection Records Table
```sql
CREATE TABLE inspection_records (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id),
  inspector_id INTEGER REFERENCES users(id),
  inspection_date DATE NOT NULL,
  result VARCHAR(50),
  notes TEXT,
  photo_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Defects Table
```sql
CREATE TABLE defects (
  id SERIAL PRIMARY KEY,
  inspection_id INTEGER REFERENCES inspection_records(id),
  defect_type VARCHAR(100),
  description TEXT,
  severity VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Quality Reports Table
```sql
CREATE TABLE quality_reports (
  id SERIAL PRIMARY KEY,
  report_date DATE NOT NULL,
  total_inspections INTEGER DEFAULT 0,
  pass_count INTEGER DEFAULT 0,
  fail_count INTEGER DEFAULT 0,
  defect_summary TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🎨 Design System

### Color Palette
- **Primary Gradient**: #667eea → #764ba2 (Purple/Blue)
- **Success**: #10b981 (Green)
- **Danger**: #ef4444 (Red)
- **Warning**: #f59e0b (Orange)
- **Info**: #3b82f6 (Blue)
- **Background**: #f8fafc (Light Gray)
- **Text Primary**: #1e293b (Dark Slate)
- **Text Secondary**: #64748b (Slate)

### Component Styles
- Modern card-based layouts
- Gradient buttons with hover effects
- Responsive tables with zebra striping
- Color-coded status badges
- Smooth transitions and animations
- Custom scrollbars

## 🌐 Browser Support

- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## 🧪 Available Scripts

### Frontend
```bash
npm start          # Start development server
npm run build      # Build for production
npm test           # Run tests
```

### Backend
```bash
npm start          # Start Express server
npm run dev        # Start with nodemon (auto-reload)
```

## 🐛 Troubleshooting

### Backend Issues

**Cannot connect to database:**
- Check PostgreSQL is running: `pg_isready`
- Verify connection settings in `config/pgdb.js`
- Ensure database exists: `psql -l`

**Port already in use:**
- Change port in server configuration
- Kill process using port: `lsof -ti:5000 | xargs kill`

### Frontend Issues

**Cannot connect to API:**
- Verify backend is running on port 5000
- Check CORS configuration
- Inspect browser console for errors

**Styling not appearing:**
- Clear browser cache (Ctrl + Shift + R)
- Check CSS imports in components
- Verify all CSS files are in correct locations

**Login not working:**
- Check if users exist in database
- Verify password (currently not hashed)
- Clear localStorage: `localStorage.clear()`

## 🔒 Security Notes

- Passwords should be hashed (use bcrypt)
- Implement JWT token authentication
- Add HTTPS in production
- Sanitize all user inputs
- Implement rate limiting
- Use environment variables for sensitive data

## 📈 Future Enhancements

- [ ] Export reports to PDF/Excel
- [ ] Email notifications for failed inspections
- [ ] Advanced search and filtering
- [ ] Batch operations (bulk updates/deletes)
- [ ] Mobile app (React Native)
- [ ] Real-time updates (WebSockets)
- [ ] Barcode scanner integration
- [ ] Image upload for defect photos
- [ ] AI-powered defect detection
- [ ] Multi-language support
- [ ] Dark mode theme
- [ ] Audit logs for all changes
- [ ] Automated report scheduling
- [ ] Integration with ERP systems

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/AmazingFeature`
3. Make your changes
4. Test thoroughly
5. Commit: `git commit -m 'Add AmazingFeature'`
6. Push: `git push origin feature/AmazingFeature`
7. Open a Pull Request

### Coding Standards
- Follow existing code style
- Write meaningful commit messages
- Add comments for complex logic
- Update documentation for new features
- Test on multiple browsers

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📧 Support

- **Email**: support@qualitycontrol.com
- **Issues**: Open an issue in the repository
- **Documentation**: Check `/docs` folder

## 🙏 Acknowledgments

- **UMPSA Industrial Engineering Department** - Project sponsor
- **Contributors** - All developers and testers
- **Open Source Community** - For amazing tools and libraries

## 📊 Project Status

🟢 **Active Development**

- Latest Version: 1.1.0
- Last Updated: January 2026
- Status: Production Ready

---

**Built with ❤️ for manufacturing quality excellence**

*Ensuring product quality through systematic inspection and data-driven insights*
