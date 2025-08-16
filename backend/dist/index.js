"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const http_1 = require("http");
const migrate_1 = require("./database/migrate");
const connection_1 = require("./database/connection");
const workshopSync_1 = __importDefault(require("./services/workshopSync"));
const auth_1 = __importDefault(require("./routes/auth"));
const users_1 = __importDefault(require("./routes/users"));
const projects_1 = __importDefault(require("./routes/projects"));
const criteria_1 = __importDefault(require("./routes/criteria"));
const alternatives_1 = __importDefault(require("./routes/alternatives"));
const comparisons_1 = __importDefault(require("./routes/comparisons"));
const evaluate_1 = __importDefault(require("./routes/evaluate"));
const evaluators_1 = __importDefault(require("./routes/evaluators"));
const results_1 = __importDefault(require("./routes/results"));
const analysis_1 = __importDefault(require("./routes/analysis"));
const matrix_1 = __importDefault(require("./routes/matrix"));
const compute_1 = __importDefault(require("./routes/compute"));
const export_1 = __importDefault(require("./routes/export"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
const PORT = process.env.PORT || 5000;
// Initialize WebSocket service (disabled for deployment)
const workshopSync = new workshopSync_1.default(httpServer);
// Trust proxy for Render.com
app.set('trust proxy', 1);
app.use((0, helmet_1.default)({
    crossOriginEmbedderPolicy: false,
}));
// Enhanced CORS configuration for production
const allowedOrigins = [
    'http://localhost:3000',
    'https://aebonlee.github.io',
    'https://ahp-frontend-render.onrender.com',
    'https://ahp-forpaper.onrender.com'
];
app.use((0, cors_1.default)({
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, etc.)
        if (!origin)
            return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1 || process.env.CORS_ORIGIN === origin) {
            return callback(null, true);
        }
        // In development, allow any origin
        if (process.env.NODE_ENV !== 'production') {
            return callback(null, true);
        }
        callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use((0, morgan_1.default)(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'AHP Decision System API',
        version: '1.0.0',
        endpoints: {
            health: '/api/health',
            auth: '/api/auth',
            projects: '/api/projects'
        }
    });
});
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// Manual migration endpoint for production debugging
app.post('/api/admin/migrate', async (req, res) => {
    try {
        console.log('🔧 Manual migration requested...');
        await (0, migrate_1.runMigrations)();
        res.json({ success: true, message: 'Database migrations completed successfully' });
    }
    catch (error) {
        console.error('❌ Manual migration failed:', error);
        res.status(500).json({ success: false, error: error instanceof Error ? error.message : String(error) });
    }
});
app.use('/api/auth', auth_1.default);
app.use('/api/users', users_1.default);
app.use('/api/projects', projects_1.default);
app.use('/api/criteria', criteria_1.default);
app.use('/api/alternatives', alternatives_1.default);
app.use('/api/comparisons', comparisons_1.default);
app.use('/api/evaluate', evaluate_1.default);
app.use('/api/evaluators', evaluators_1.default);
app.use('/api/results', results_1.default);
app.use('/api/analysis', analysis_1.default);
app.use('/api/matrix', matrix_1.default);
app.use('/api/compute', compute_1.default);
app.use('/api/export', export_1.default);
// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ error: 'Internal server error' });
});
// Workshop status API endpoints
app.get('/api/workshop/:projectId', (req, res) => {
    const workshopInfo = workshopSync.getWorkshopInfo(req.params.projectId);
    if (workshopInfo) {
        res.json(workshopInfo);
    }
    else {
        res.status(404).json({ error: 'Workshop not found' });
    }
});
app.get('/api/workshops', (req, res) => {
    const workshops = workshopSync.getAllWorkshops();
    res.json({ workshops });
});
// Start server
const server = httpServer.listen(PORT, async () => {
    console.log(`🚀 AHP Backend Server started with SQLite v2`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌐 Port: ${PORT}`);
    console.log(`🔗 Health check: /api/health`);
    try {
        if (process.env.DATABASE_URL) {
            console.log('🔧 Running database migrations...');
            await (0, migrate_1.runMigrations)();
            console.log('✅ Database migrations completed successfully');
        }
        else {
            console.log('🔧 Initializing SQLite database...');
            await (0, connection_1.initDatabase)();
            console.log('✅ SQLite database initialized successfully');
        }
    }
    catch (error) {
        console.error('❌ Failed to initialize database:', error);
        console.error('Error details:', error instanceof Error ? error.message : String(error));
        // Continue running the server even if database init fails
        console.log('⚠️ Server starting without database initialization');
    }
});
// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('🛑 SIGTERM received, shutting down gracefully...');
    server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
    });
});
process.on('SIGINT', () => {
    console.log('🛑 SIGINT received, shutting down gracefully...');
    server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
    });
});
