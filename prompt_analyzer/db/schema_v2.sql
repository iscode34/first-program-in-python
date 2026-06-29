-- Additional tables for PromptPilot v2

CREATE TABLE IF NOT EXISTS prompt_templates (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(255) NOT NULL,
    description TEXT DEFAULT '',
    prompt_text TEXT NOT NULL,
    context TEXT DEFAULT '',
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO prompt_templates (title, category, description, prompt_text) VALUES
    ('SEO Blog Post', 'Marketing', 'Generate an SEO-optimized blog post with meta description and keywords.',
     'Act as an expert SEO content writer. Write a blog post about [topic] targeting [audience]. Include: 1) an engaging title 2) meta description under 160 chars 3) introduction with hook 4) 5 key sections with H2 headings 5) conclusion with CTA. Use [tone] tone and target the keyword: [keyword].'),
    ('Code Review', 'Coding', 'Get a comprehensive code review of your code snippet.',
     'Act as a senior software engineer. Review the following code for: 1) bugs and edge cases 2) performance issues 3) security vulnerabilities 4) code style and readability 5) architectural improvements. For each issue, explain the problem and suggest a fix with a code example.\n\nCode:\n```\n[code]\n```'),
    ('Lesson Plan', 'Education', 'Create a detailed lesson plan for any subject.',
     'Act as an experienced educator. Create a [duration]-minute lesson plan for [subject] targeting [grade level] students. Include: 1) learning objectives 2) required materials 3) opening hook 4) main instruction with examples 5) group activity 6) assessment method 7) homework assignment. Format as a structured document.'),
    ('Interview Prep', 'Career', 'Generate targeted interview questions and model answers.',
     'Act as a career coach and hiring manager. Prepare me for a [job title] interview at [company type]. Provide: 1) 5 common technical questions with model answers 2) 3 behavioral questions using the STAR method 3) 3 questions I should ask the interviewer 4) tips specific to this role.'),
    ('Product Description', 'Creative', 'Write compelling product descriptions that convert.',
     'Act as a professional copywriter. Write a product description for [product name], which is a [product type] targeting [audience]. Include: 1) an attention-grabbing headline 2) 3 key benefits with emotional hooks 3) technical specifications 4) social proof line 5) call-to-action. Keep it under 200 words.')
ON CONFLICT DO NOTHING;

ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT DEFAULT '';

CREATE TABLE IF NOT EXISTS activity_log (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    action VARCHAR(255) NOT NULL,
    details TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activity_log_user_id ON activity_log(user_id);
