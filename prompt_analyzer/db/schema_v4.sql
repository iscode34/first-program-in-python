-- Add more prompt templates across all categories

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM prompt_templates WHERE title = 'Email Newsletter') THEN
        INSERT INTO prompt_templates (title, category, description, prompt_text) VALUES
            ('Email Newsletter', 'Email', 'Generate a professional email newsletter from provided content.', 'Act as a professional email copywriter. Write a newsletter email for [audience] about [topic/subject]. Include: 1) a catchy subject line under 50 chars 2) personalized greeting 3) main content with 2-3 key points 4) clear call-to-action button 5) professional sign-off. Keep it concise and scannable. Tone: [friendly/professional/formal].');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM prompt_templates WHERE title = 'Data Analysis Report') THEN
        INSERT INTO prompt_templates (title, category, description, prompt_text) VALUES
            ('Data Analysis Report', 'Data Analysis', 'Generate a summary report from raw data or statistics.', 'Act as a senior data analyst. Analyze the following dataset and produce a report: [data/statistics]. Include: 1) executive summary 2) key trends and patterns 3) anomalies or outliers 4) actionable recommendations 5) limitations of the analysis. Format using clear headings and, where appropriate, suggest visualizations. Dataset:\n```\n[data]\n```');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM prompt_templates WHERE title = 'Customer Support Reply') THEN
        INSERT INTO prompt_templates (title, category, description, prompt_text) VALUES
            ('Customer Support Reply', 'Customer Support', 'Generate empathetic and helpful customer support responses.', 'Act as a senior customer support specialist for [company/product]. Respond to this customer complaint/query: [customer message]. Your response should: 1) acknowledge their frustration 2) apologize sincerely 3) provide a clear solution or next steps 4) offer additional help 5) thank them for their patience. Keep it warm, professional, and solution-focused. Do not use corporate jargon.');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM prompt_templates WHERE title = 'Sales Pitch Script') THEN
        INSERT INTO prompt_templates (title, category, description, prompt_text) VALUES
            ('Sales Pitch Script', 'Sales', 'Create a persuasive sales pitch script for any product or service.', 'Act as an experienced sales strategist. Create a sales pitch script for [product/service] targeting [industry/role]. Include: 1) opening hook (first 30 seconds) 2) problem statement the prospect relates to 3) solution presentation with 3 key benefits 4) social proof or case study snippet 5) objection handling for 3 common objections 6) closing with clear next step. Keep it conversational, not scripted. Estimated duration: [X] minutes.');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM prompt_templates WHERE title = 'UI Design Brief') THEN
        INSERT INTO prompt_templates (title, category, description, prompt_text) VALUES
            ('UI Design Brief', 'Design', 'Generate a comprehensive design brief for UI/UX projects.', 'Act as a lead product designer. Create a UI design brief for [product/feature] targeting [user persona]. Include: 1) project overview and goals 2) target user persona details 3) key user flows to design 4) design constraints and technical limitations 5) visual style direction (colors, typography, spacing) 6) success metrics 7) timeline and deliverables. Be specific and actionable.');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM prompt_templates WHERE title = 'Blog Article Writer') THEN
        INSERT INTO prompt_templates (title, category, description, prompt_text) VALUES
            ('Blog Article Writer', 'Writing', 'Write a complete, engaging blog article on any topic.', 'Act as a professional blog writer. Write a [word count]-word article about [topic] for [target audience]. Structure: 1) attention-grabbing title 2) compelling introduction with a hook 3) 3-5 body sections with subheadings 4) practical takeaways or actionable tips 5) conclusion with a thought-provoking question. Use a [conversational/authoritative/inspirational] tone. Include [number] relevant examples. Do not use filler content.');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM prompt_templates WHERE title = 'Social Media Content Calendar') THEN
        INSERT INTO prompt_templates (title, category, description, prompt_text) VALUES
            ('Social Media Content Calendar', 'Social Media', 'Plan a full week/month of social media content.', 'Act as a social media strategist. Create a [weekly/monthly] content calendar for [brand/business] on [platform]. For each day, provide: 1) content theme/pillar 2) post copy (within platform character limits) 3) visual/video concept 4) hashtags (3-5) 5) best posting time. Cover a mix of educational, promotional, engagement, and behind-the-scenes content. Target audience: [audience].');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM prompt_templates WHERE title = 'Research Summary') THEN
        INSERT INTO prompt_templates (title, category, description, prompt_text) VALUES
            ('Research Summary', 'Research', 'Summarize and synthesize research papers or articles.', 'Act as an academic research assistant. Summarize the following research material on [topic]: [paste text or outline]. Provide: 1) one-paragraph TLDR 2) 5 key findings with citations 3) methodology critique (if applicable) 4) gaps in the research 5) suggested further reading. Write for an audience of [undergraduates/graduates/professionals]. Do not plagiarize; always paraphrase.');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM prompt_templates WHERE title = 'Daily Planner & Prioritizer') THEN
        INSERT INTO prompt_templates (title, category, description, prompt_text) VALUES
            ('Daily Planner & Prioritizer', 'Productivity', 'Organize your tasks and priorities for the day.', 'Act as a productivity coach. Help me plan my day. Here are my tasks: [list tasks]. For each task: 1) assign an Eisenhower priority (urgent/important) 2) estimate time needed 3) suggest the best order to tackle them 4) identify one task I can delegate or eliminate. Also suggest: one deep-work block, two break slots, and an end-of-day review prompt. My energy peaks at: [morning/afternoon/evening].');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM prompt_templates WHERE title = 'Wellness Routine Builder') THEN
        INSERT INTO prompt_templates (title, category, description, prompt_text) VALUES
            ('Wellness Routine Builder', 'Health & Wellness', 'Create a personalized wellness or self-care routine.', 'Act as a certified wellness coach. Create a personalized [morning/evening/weekly] wellness routine for someone who: [describe lifestyle, goals, challenges]. Include: 1) 3-5 simple, evidence-based practices 2) estimated time for each 3) how to track progress 4) one habit-stacking tip 5) gentle accountability method. Keep it realistic for a busy schedule. Avoid pseudoscience.');
    END IF;
END $$;
