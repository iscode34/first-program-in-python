const db = require('../config/database');

exports.getTemplates = async (req, res) => {
    try {
        const result = await db.query(
            'SELECT * FROM prompt_templates ORDER BY usage_count DESC, id ASC'
        );
        res.json({ success: true, templates: result.rows });
    } catch (error) {
        console.error('Get templates error:', error);
        res.status(500).json({ message: 'Failed to fetch templates' });
    }
};

exports.cloneTemplate = async (req, res) => {
    try {
        const userId = req.user.id;
        const { templateId } = req.params;

        const template = await db.query('SELECT * FROM prompt_templates WHERE id = $1', [templateId]);

        if (template.rows.length === 0) {
            return res.status(404).json({ message: 'Template not found' });
        }

        const t = template.rows[0];

        const result = await db.query(
            `INSERT INTO prompts (user_id, title, category, prompt_text, context)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [userId, t.title + ' (cloned)', t.category, t.prompt_text, t.context || '']
        );

        await db.query(
            'UPDATE prompt_templates SET usage_count = usage_count + 1 WHERE id = $1',
            [templateId]
        );

        await db.query(
            'INSERT INTO activity_log (user_id, action, details) VALUES ($1, $2, $3)',
            [userId, 'template_cloned', t.title]
        );

        res.status(201).json({ success: true, prompt: result.rows[0] });

    } catch (error) {
        console.error('Clone template error:', error);
        res.status(500).json({ message: 'Failed to clone template' });
    }
};
