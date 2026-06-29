const db = require('../config/database');

exports.getCategories = async (req, res) => {
    try {

        const result = await db.query(
            'SELECT * FROM categories ORDER BY id'
        );

        res.json(result.rows);

    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: 'Server Error'
        });
    }
};