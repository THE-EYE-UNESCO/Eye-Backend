"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const config_1 = require("./config");
const errorHandler_1 = require("./middleware/errorHandler");
const auth_1 = require("./routes/auth");
const reports_1 = require("./routes/reports");
const admin_1 = require("./routes/admin");
const responder_1 = require("./routes/responder");
const stories_1 = require("./routes/stories");
const databaseService_1 = require("./services/databaseService");
const app = (0, express_1.default)();
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)(config_1.config.cors));
app.use((0, morgan_1.default)('combined'));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
app.use('/api/auth', auth_1.authRoutes);
app.use('/api/reports', reports_1.reportRoutes);
app.use('/api/admin', admin_1.adminRoutes);
app.use('/api/responder', responder_1.responderRoutes);
app.use('/api/stories', stories_1.storyRoutes);
app.get('/', (_, res) => {
    res.json({
        message: 'Welcome to The Eye Backend Service',
        version: '1.0.0',
        status: 'online'
    });
});
app.get('/health', (_, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});
app.use(errorHandler_1.errorHandler);
const startServer = async () => {
    try {
        await databaseService_1.DatabaseService.getInstance().initialize();
        app.listen(config_1.config.port, () => {
            console.log(`🚀 The Eye Backend running on port ${config_1.config.port}`);
        });
    }
    catch (err) {
        console.error('❌ Failed to start server', err);
        process.exit(1);
    }
};
startServer();
