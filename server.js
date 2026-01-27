import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';

import productRoutes from './routes/products.js';
import defectRoutes from './routes/defects.js';
import inspectionRoutes from './routes/inspectionRecords.js';
import qualityReportRoutes from './routes/qualityReports.js';
import userRoutes from './routes/users.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS
app.use(cors({
  origin: 'http://localhost:3000', // React frontend URL
  credentials: true, // allow cookies if needed
}));

app.use(bodyParser.json());

app.use('/api/products', productRoutes);
app.use('/api/defects', defectRoutes);
app.use('/api/inspection-records', inspectionRoutes);
app.use('/api/quality-reports', qualityReportRoutes);
app.use('/api/users', userRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
