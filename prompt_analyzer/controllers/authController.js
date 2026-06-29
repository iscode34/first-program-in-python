const db = require('../config/database');
const bcrypt = require('bcrypt');

exports.register = async (req, res) => {
    try {
        const { full_name, email, password } = req.body;

        const userExists = await db.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );

        if (userExists.rows.length > 0) {
            return res.status(400).json({
                message: 'Email already exists'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await db.query(
            `INSERT INTO users
            (full_name, email, password)
            VALUES ($1,$2,$3)
            RETURNING id, full_name, email`,
            [full_name, email, hashedPassword]
        );

        res.status(201).json({
            success: true,
            user: newUser.rows[0]
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: 'Server Error'
        });
    }
};

const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await db.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );

        if (user.rows.length === 0) {
            return res.status(400).json({
                message: 'Invalid email or password'
            });
        }

        const validPassword = await bcrypt.compare(
            password,
            user.rows[0].password
        );

        if (!validPassword) {
            return res.status(400).json({
                message: 'Invalid email or password'
            });
        }

        const token = jwt.sign(
            {
                id: user.rows[0].id,
                email: user.rows[0].email
            },
            process.env.JWT_SECRET,
            {
                expiresIn: '24h'
            }
        );

        res.json({
            success: true,
            token,
            user: {
                id: user.rows[0].id,
                full_name: user.rows[0].full_name,
                email: user.rows[0].email
            }
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: 'Server Error'
        });
    }
};