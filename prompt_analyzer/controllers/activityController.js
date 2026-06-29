const db = require('../config/database');

exports.logActivity = async (userId, action, details) => {
    try {
        await db.query(
            'INSERT INTO activity_log (user_id, action, details) VALUES ($1, $2, $3)',
            [userId, action, details || '']
        );
    } catch (err) {
        console.error('Activity log error:', err.message);
    }
};

exports.getActivity = async (req, res) => {
    try {
        const userId = req.user.id;
        const limit = parseInt(req.query.limit) || 20;

        const result = await db.query(
            'SELECT * FROM activity_log WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2',
            [userId, limit]
        );

        res.json({ success: true, activities: result.rows });

    } catch (error) {
        console.error('Get activity error:', error);
        res.status(500).json({ message: 'Failed to fetch activity' });
    }
};
