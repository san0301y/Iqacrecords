-- NAAC IQAC Data Update
-- Updating existing data with NAAC criteria mapping

-- Step 1: Update existing records with NAAC criteria mapping
UPDATE iqac_record SET 
criteria_id = CASE 
    WHEN indicator_id = 1 THEN 2  -- Teaching → CR-II
    WHEN indicator_id = 2 THEN 3  -- Research → CR-III  
    WHEN indicator_id = 3 THEN 5  -- Extension → CR-V
    ELSE 2 
END;

UPDATE iqac_record SET 
sub_criteria = CASE
    WHEN indicator_id = 1 THEN 'Teaching Effectiveness'
    WHEN indicator_id = 2 THEN 'Research Output'
    WHEN indicator_id = 3 THEN 'Student Support'
    ELSE 'General Evaluation' 
END;

UPDATE iqac_record SET 
evaluator_name = CONCAT('IQAC Committee Member #', evaluator_id);

-- Step 2: Add sample data for all 7 NAAC criteria (with indicator_id)
INSERT INTO iqac_record (faculty_id, indicator_id, criteria_id, sub_criteria, period, value, evaluator_name, recorded_at, comments) VALUES
-- Criterion I: Curricular Aspects
(3, 1, 1, 'Curriculum Design & Development', '2024-S1', 85.00, 'Dr. Sharma', NOW(), 'Excellent curriculum innovation'),
(4, 1, 1, 'Curriculum Enrichment', '2024-S1', 78.00, 'Dr. Sharma', NOW(), 'Good industry integration'),

-- Criterion II: Teaching-Learning & Evaluation
(5, 1, 2, 'Teaching Effectiveness', '2024-S1', 88.00, 'Dr. Verma', NOW(), 'Outstanding teaching methodology'),
(6, 1, 2, 'Student Assessment', '2024-S1', 82.00, 'Dr. Verma', NOW(), 'Effective evaluation methods'),

-- Criterion III: Research, Innovations & Extension
(7, 2, 3, 'Research Publications', '2024-S1', 92.00, 'Dr. Reddy', NOW(), 'High-quality publications'),
(8, 2, 3, 'Research Projects', '2024-S1', 85.00, 'Dr. Reddy', NOW(), 'Successful project completion'),

-- Criterion IV: Infrastructure & Learning Resources
(9, 1, 4, 'Lab Facilities', '2024-S1', 75.00, 'Dr. Kumar', NOW(), 'Adequate infrastructure'),
(10, 1, 4, 'Library Resources', '2024-S1', 80.00, 'Dr. Kumar', NOW(), 'Good resource availability'),

-- Criterion V: Student Support & Progression
(11, 3, 5, 'Student Mentoring', '2024-S1', 88.00, 'Dr. Patel', NOW(), 'Effective student guidance'),
(12, 3, 5, 'Placement Support', '2024-S1', 82.00, 'Dr. Patel', NOW(), 'Good placement record'),

-- Criterion VI: Governance, Leadership & Management
(13, 1, 6, 'Institutional Management', '2024-S1', 90.00, 'Dr. Singh', NOW(), 'Strong leadership'),
(14, 1, 6, 'Financial Management', '2024-S1', 85.00, 'Dr. Singh', NOW(), 'Efficient resource utilization'),

-- Criterion VII: Institutional Values & Best Practices
(15, 1, 7, 'Ethical Practices', '2024-S1', 95.00, 'Dr. Joshi', NOW(), 'Exemplary ethical standards'),
(16, 1, 7, 'Social Responsibility', '2024-S1', 88.00, 'Dr. Joshi', NOW(), 'Active community engagement');

-- Step 3: Verification queries
SELECT 'NAAC Data Update Completed Successfully!' as status;
SELECT criteria_id, COUNT(*) as record_count FROM iqac_record GROUP BY criteria_id;
SELECT faculty_id, criteria_id, sub_criteria, value as score FROM iqac_record ORDER BY criteria_id LIMIT 10;