if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const express = require('express');
const path = require('path');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 50,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Too many requests, please try again later.' }
});

const generalDailyLimiter = rateLimit({
    windowMs: 24 * 60 * 60 * 1000,
    max: 120,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Daily request limit reached.' }
});

const aiLimiter = rateLimit({
    windowMs: 20 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'AI request limit reached. Please wait 20 minutes.' }
});

const aiDailyLimiter = rateLimit({
    windowMs: 24 * 60 * 60 * 1000,
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Daily AI request limit reached.' }
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 15,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Too many login attempts. Try again later.' }
});

app.use('/api/', generalLimiter);
app.use('/api/', generalDailyLimiter);
app.use('/api/auth', authLimiter);
app.use('/api/prompts/analyze', aiLimiter);
app.use('/api/prompts/analyze', aiDailyLimiter);
app.use('/api/prompts/enhance', aiLimiter);
app.use('/api/prompts/enhance', aiDailyLimiter);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'marketing.html'));
});

const SPA_ROUTES = ['/login', '/dashboard', '/prompts', '/settings', '/templates'];

SPA_ROUTES.forEach(route => {
    app.get(route, (req, res) => {
        res.sendFile(path.join(__dirname, 'public', 'index.html'));
    });
});

app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/test', (req, res) => {
    res.json({ success: true, message: 'PromptPilot API is running' });
});

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/prompts', require('./routes/promptRoutes'));
app.use('/api/templates', require('./routes/templateRoutes'));
app.use('/api/settings', require('./routes/settingsRoutes'));
app.use('/api/activity', require('./routes/activityRoutes'));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

module.exports = app;

if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`PromptPilot server running on http://localhost:${PORT}`);
    });
}
