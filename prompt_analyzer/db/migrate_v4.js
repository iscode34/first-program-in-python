require('dotenv').config();
const pool = require('../config/database');
const fs = require('fs');
const path = require('path');

async function migrate() {
    const sql = fs.readFileSync(path.join(__dirname, 'schema_v4.sql'), 'utf-8');
    try {
        await pool.query(sql);
        console.log('Templates v4 added successfully');
        process.exit(0);
    } catch (err) {
        console.error('Migration v4 failed:', err.message);
        process.exit(1);
    }
}

migrate();
