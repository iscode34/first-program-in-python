-- Add more categories (skip if already exist)

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Productivity') THEN
        INSERT INTO categories (name) VALUES ('Productivity');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Research') THEN
        INSERT INTO categories (name) VALUES ('Research');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Social Media') THEN
        INSERT INTO categories (name) VALUES ('Social Media');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Email') THEN
        INSERT INTO categories (name) VALUES ('Email');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Data Analysis') THEN
        INSERT INTO categories (name) VALUES ('Data Analysis');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Customer Support') THEN
        INSERT INTO categories (name) VALUES ('Customer Support');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Sales') THEN
        INSERT INTO categories (name) VALUES ('Sales');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Design') THEN
        INSERT INTO categories (name) VALUES ('Design');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Writing') THEN
        INSERT INTO categories (name) VALUES ('Writing');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Health & Wellness') THEN
        INSERT INTO categories (name) VALUES ('Health & Wellness');
    END IF;
END $$;
