const db = require('../config/database');

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_BASE_URL = process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com/v1';

async function callDeepSeek(promptText) {
    const response = await fetch(`${DEEPSEEK_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
        },
        body: JSON.stringify({
            model: 'deepseek-chat',
            messages: [
                {
                    role: 'system',
                    content: `You are an expert AI prompt analyzer. Analyze the given prompt and return a JSON object with the following fields:
- clarity_score: number 0-100 (how clear and specific the prompt is)
- grammar_score: number 0-100 (grammar quality)
- optimization_score: number 0-100 (how well optimized for AI response)
- clarity_suggestions: string (1-2 specific tips to improve clarity)
- grammar_suggestions: string (1-2 specific grammar fixes if needed)
- optimization_suggestions: string (1-2 specific tips to get better AI output)

Return ONLY valid JSON, no other text.`
                },
                {
                    role: 'user',
                    content: `Analyze this prompt and return the scores and suggestions as JSON:\n\n${promptText}`
                }
            ],
            temperature: 0.3,
            max_tokens: 1000,
            response_format: { type: 'json_object' }
        })
    });

    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`DeepSeek API error ${response.status}: ${errText}`);
    }

    const data = await response.json();
    return JSON.parse(data.choices[0].message.content);
}

exports.analyzePrompt = async (req, res) => {
    try {
        const { prompt_text } = req.body;

        if (!prompt_text || prompt_text.trim().length === 0) {
            return res.status(400).json({ message: 'Prompt text is required' });
        }

        if (prompt_text.length > 4000) {
            return res.status(400).json({ message: 'Prompt text exceeds 4000 characters' });
        }

        const analysis = await callDeepSeek(prompt_text);

        res.json({
            success: true,
            analysis: {
                clarity_score: Math.round(analysis.clarity_score),
                grammar_score: Math.round(analysis.grammar_score),
                optimization_score: Math.round(analysis.optimization_score),
                clarity_suggestions: analysis.clarity_suggestions,
                grammar_suggestions: analysis.grammar_suggestions,
                optimization_suggestions: analysis.optimization_suggestions
            }
        });

    } catch (error) {
        console.error('Analyze error:', error);
        res.status(500).json({
            message: 'AI analysis failed',
            error: error.message
        });
    }
};

exports.savePrompt = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id, title, category, prompt_text, context } = req.body;

        if (!title || !category || !prompt_text) {
            return res.status(400).json({ message: 'Title, category, and prompt text are required' });
        }

        if (id) {
            const existing = await db.query('SELECT * FROM prompts WHERE id = $1 AND user_id = $2', [id, userId]);
            if (existing.rows.length === 0) {
                return res.status(404).json({ message: 'Prompt not found' });
            }

            const oldPrompt = existing.rows[0];

            if (oldPrompt.prompt_text !== prompt_text) {
                const versionCount = await db.query(
                    'SELECT COALESCE(MAX(version_number), 0) + 1 AS next_version FROM prompt_history WHERE prompt_id = $1',
                    [id]
                );

                await db.query(
                    'INSERT INTO prompt_history (prompt_id, prompt_text, version_number) VALUES ($1, $2, $3)',
                    [id, oldPrompt.prompt_text, versionCount.rows[0].next_version]
                );
            }

            const updated = await db.query(
                `UPDATE prompts SET title = $1, category = $2, prompt_text = $3, context = $4, updated_at = NOW()
                 WHERE id = $5 AND user_id = $6
                 RETURNING *`,
                [title, category, prompt_text, context || '', id, userId]
            );

            let analysis = null;
            if (prompt_text) {
                try {
                    const aiResult = await callDeepSeek(prompt_text);
                    await db.query(
                        'DELETE FROM ai_analysis WHERE prompt_id = $1',
                        [id]
                    );
                    const aiInsert = await db.query(
                        `INSERT INTO ai_analysis (prompt_id, clarity_score, grammar_score, optimization_score, clarity_suggestions, grammar_suggestions, optimization_suggestions)
                         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
                        [id, Math.round(aiResult.clarity_score), Math.round(aiResult.grammar_score), Math.round(aiResult.optimization_score),
                         aiResult.clarity_suggestions, aiResult.grammar_suggestions, aiResult.optimization_suggestions]
                    );
                    analysis = aiInsert.rows[0];
                } catch (aiErr) {
                    console.error('AI analysis failed during save:', aiErr.message);
                }
            }

            res.json({ success: true, prompt: updated.rows[0], analysis });

        } else {
            const result = await db.query(
                `INSERT INTO prompts (user_id, title, category, prompt_text, context)
                 VALUES ($1, $2, $3, $4, $5)
                 RETURNING *`,
                [userId, title, category, prompt_text, context || '']
            );

            const newPrompt = result.rows[0];

            let analysis = null;
            try {
                const aiResult = await callDeepSeek(prompt_text);
                const aiInsert = await db.query(
                    `INSERT INTO ai_analysis (prompt_id, clarity_score, grammar_score, optimization_score, clarity_suggestions, grammar_suggestions, optimization_suggestions)
                     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
                    [newPrompt.id, Math.round(aiResult.clarity_score), Math.round(aiResult.grammar_score), Math.round(aiResult.optimization_score),
                     aiResult.clarity_suggestions, aiResult.grammar_suggestions, aiResult.optimization_suggestions]
                );
                analysis = aiInsert.rows[0];
            } catch (aiErr) {
                console.error('AI analysis failed during save:', aiErr.message);
            }

            res.status(201).json({ success: true, prompt: newPrompt, analysis });
        }

    } catch (error) {
        console.error('Save prompt error:', error);
        res.status(500).json({ message: 'Failed to save prompt' });
    }
};

exports.getPrompts = async (req, res) => {
    try {
        const userId = req.user.id;

        const result = await db.query(
            `SELECT p.*, 
                    COALESCE(a.clarity_score, 0) AS clarity_score,
                    COALESCE(a.grammar_score, 0) AS grammar_score,
                    COALESCE(a.optimization_score, 0) AS optimization_score,
                    COALESCE(a.clarity_suggestions, '') AS clarity_suggestions,
                    COALESCE(a.grammar_suggestions, '') AS grammar_suggestions,
                    COALESCE(a.optimization_suggestions, '') AS optimization_suggestions,
                    (SELECT COUNT(*) FROM prompt_history WHERE prompt_id = p.id)::int AS version_count
             FROM prompts p
             LEFT JOIN ai_analysis a ON a.prompt_id = p.id AND a.id = (
                 SELECT id FROM ai_analysis WHERE prompt_id = p.id ORDER BY created_at DESC LIMIT 1
             )
             WHERE p.user_id = $1
             ORDER BY p.updated_at DESC`,
            [userId]
        );

        res.json({ success: true, prompts: result.rows });

    } catch (error) {
        console.error('Get prompts error:', error);
        res.status(500).json({ message: 'Failed to fetch prompts' });
    }
};

exports.getPromptById = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        const result = await db.query('SELECT * FROM prompts WHERE id = $1 AND user_id = $2', [id, userId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Prompt not found' });
        }

        const analysis = await db.query(
            'SELECT * FROM ai_analysis WHERE prompt_id = $1 ORDER BY created_at DESC LIMIT 1',
            [id]
        );

        const history = await db.query(
            'SELECT * FROM prompt_history WHERE prompt_id = $1 ORDER BY version_number DESC',
            [id]
        );

        res.json({
            success: true,
            prompt: result.rows[0],
            analysis: analysis.rows[0] || null,
            history: history.rows
        });

    } catch (error) {
        console.error('Get prompt error:', error);
        res.status(500).json({ message: 'Failed to fetch prompt' });
    }
};

exports.deletePrompt = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        const result = await db.query('DELETE FROM prompts WHERE id = $1 AND user_id = $2 RETURNING id', [id, userId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Prompt not found' });
        }

        res.json({ success: true, message: 'Prompt deleted' });

    } catch (error) {
        console.error('Delete prompt error:', error);
        res.status(500).json({ message: 'Failed to delete prompt' });
    }
};

exports.toggleFavorite = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        const prompt = await db.query('SELECT * FROM prompts WHERE id = $1 AND user_id = $2', [id, userId]);

        if (prompt.rows.length === 0) {
            return res.status(404).json({ message: 'Prompt not found' });
        }

        const newState = !prompt.rows[0].is_favorite;

        await db.query('UPDATE prompts SET is_favorite = $1 WHERE id = $2', [newState, id]);

        res.json({ success: true, is_favorite: newState });

    } catch (error) {
        console.error('Toggle favorite error:', error);
        res.status(500).json({ message: 'Failed to toggle favorite' });
    }
};

exports.getPromptHistory = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        const prompt = await db.query('SELECT id FROM prompts WHERE id = $1 AND user_id = $2', [id, userId]);

        if (prompt.rows.length === 0) {
            return res.status(404).json({ message: 'Prompt not found' });
        }

        const history = await db.query(
            'SELECT * FROM prompt_history WHERE prompt_id = $1 ORDER BY version_number DESC',
            [id]
        );

        res.json({ success: true, history: history.rows });

    } catch (error) {
        console.error('Get history error:', error);
        res.status(500).json({ message: 'Failed to fetch history' });
    }
};

exports.restoreVersion = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id, historyId } = req.params;

        const prompt = await db.query('SELECT * FROM prompts WHERE id = $1 AND user_id = $2', [id, userId]);

        if (prompt.rows.length === 0) {
            return res.status(404).json({ message: 'Prompt not found' });
        }

        const historyEntry = await db.query(
            'SELECT * FROM prompt_history WHERE id = $1 AND prompt_id = $2',
            [historyId, id]
        );

        if (historyEntry.rows.length === 0) {
            return res.status(404).json({ message: 'History entry not found' });
        }

        const oldText = historyEntry.rows[0].prompt_text;
        const currentText = prompt.rows[0].prompt_text;

        const versionCount = await db.query(
            'SELECT COALESCE(MAX(version_number), 0) + 1 AS next_version FROM prompt_history WHERE prompt_id = $1',
            [id]
        );

        await db.query(
            'INSERT INTO prompt_history (prompt_id, prompt_text, version_number) VALUES ($1, $2, $3)',
            [id, currentText, versionCount.rows[0].next_version]
        );

        await db.query('UPDATE prompts SET prompt_text = $1, updated_at = NOW() WHERE id = $2', [oldText, id]);

        let analysis = null;
        try {
            const aiResult = await callDeepSeek(oldText);
            await db.query('DELETE FROM ai_analysis WHERE prompt_id = $1', [id]);
            const aiInsert = await db.query(
                `INSERT INTO ai_analysis (prompt_id, clarity_score, grammar_score, optimization_score, clarity_suggestions, grammar_suggestions, optimization_suggestions)
                 VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
                [id, Math.round(aiResult.clarity_score), Math.round(aiResult.grammar_score), Math.round(aiResult.optimization_score),
                 aiResult.clarity_suggestions, aiResult.grammar_suggestions, aiResult.optimization_suggestions]
            );
            analysis = aiInsert.rows[0];
        } catch (aiErr) {
            console.error('AI analysis failed during restore:', aiErr.message);
        }

        res.json({ success: true, prompt: prompt.rows[0], analysis });

    } catch (error) {
        console.error('Restore version error:', error);
        res.status(500).json({ message: 'Failed to restore version' });
    }
};
