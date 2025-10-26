const express = require('express');
const { Client } = require('pg');
const cors = require('cors');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const client = new Client({
  host: 'ep-jolly-breeze-adg00zr0-pooler.c-2.us-east-1.aws.neon.tech',
  user: 'neondb_owner',
  password: 'npg_9ejkJh1BPgQR',
  database: 'neondb',
  port: 5432,
  ssl: {
    rejectUnauthorized: false // Required for Neon.tech
  }
});

// Connect to PostgreSQL
client.connect()
  .then(() => {
    console.log('Connected to PostgreSQL database');
  })
  .catch(err => {
    console.error('Connection error', err.stack);
  });

// NAAC Criteria
const naacCriteria = {
  1: { code: 'CR-I', name: 'Curricular Aspects', weight: 0.15 },
  2: { code: 'CR-II', name: 'Teaching-Learning & Evaluation', weight: 0.20 },
  3: { code: 'CR-III', name: 'Research, Innovations & Extension', weight: 0.20 },
  4: { code: 'CR-IV', name: 'Infrastructure & Learning Resources', weight: 0.10 },
  5: { code: 'CR-V', name: 'Student Support & Progression', weight: 0.15 },
  6: { code: 'CR-VI', name: 'Governance, Leadership & Management', weight: 0.10 },
  7: { code: 'CR-VII', name: 'Institutional Values & Best Practices', weight: 0.10 }
};

// Test route
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'IQAC System API is working!',
    timestamp: new Date().toISOString()
  });
});

// Get all faculty with record counts
app.get('/api/faculty', async (req, res) => {
  try {
    const sql = `
      SELECT 
        f.id as faculty_id,
        f.employee_id,
        CONCAT(f.first_name, ' ', COALESCE(f.last_name, '')) as faculty_name,
        f.email,
        f.phone,
        f.hire_date,
        COALESCE(d.name, 'Unknown Department') as dept_name,
        COUNT(ir.id) as iqac_record_count
      FROM faculty f 
      LEFT JOIN department d ON f.department_id = d.id 
      LEFT JOIN iqac_record ir ON f.id = ir.faculty_id
      GROUP BY f.id, f.employee_id, f.first_name, f.last_name, f.email, f.phone, f.hire_date, d.name
      ORDER BY f.id
    `;
    
    const result = await client.query(sql);
    console.log(`✅ Sent ${result.rows.length} faculty members with iqac_record counts`);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching faculty:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Add new faculty member
app.post('/api/faculty', async (req, res) => {
  const { faculty_name, dept_name, email, phone, hire_date } = req.body;
  
  console.log('Received faculty data:', req.body);
  
  // Validation
  if (!faculty_name || !dept_name || !email) {
    return res.status(400).json({ 
      error: 'Faculty name, department, and email are required fields' 
    });
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Please provide a valid email address' });
  }

  // Split faculty name into first and last name
  const nameParts = faculty_name.split(' ');
  const first_name = nameParts[0] || '';
  const last_name = nameParts.slice(1).join(' ') || '';

  // Generate employee ID
  const employee_id = 'EMP' + Date.now().toString().slice(-6);

  try {
    // First, get or create department
    const getDeptSql = 'SELECT id FROM department WHERE name = $1 OR LOWER(name) = LOWER($2) LIMIT 1';
    const deptResult = await client.query(getDeptSql, [dept_name, dept_name]);
    
    let departmentId;
    
    if (deptResult.rows.length > 0) {
      // Department exists
      departmentId = deptResult.rows[0].id;
    } else {
      // Create new department
      const insertDeptSql = 'INSERT INTO department (name) VALUES ($1) RETURNING id';
      const deptInsertResult = await client.query(insertDeptSql, [dept_name]);
      departmentId = deptInsertResult.rows[0].id;
    }
    
    // Check if email already exists
    const checkEmailSql = 'SELECT id FROM faculty WHERE email = $1';
    const emailResult = await client.query(checkEmailSql, [email]);
    
    if (emailResult.rows.length > 0) {
      return res.status(400).json({ error: 'Email already exists in the system' });
    }
    
    // Insert new faculty member
    const insertFacultySql = `
      INSERT INTO faculty 
      (employee_id, first_name, last_name, email, phone, hire_date, department_id) 
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id
    `;
    
    const facultyResult = await client.query(insertFacultySql, [
      employee_id,
      first_name,
      last_name,
      email,
      phone || null,
      hire_date || null,
      departmentId
    ]);
    
    // Get the newly created faculty member with department name
    const getNewFacultySql = `
      SELECT 
        f.id as faculty_id,
        f.employee_id,
        CONCAT(f.first_name, ' ', f.last_name) as faculty_name,
        f.email,
        f.phone,
        f.hire_date,
        d.name as dept_name
      FROM faculty f 
      LEFT JOIN department d ON f.department_id = d.id 
      WHERE f.id = $1
    `;
    
    const newFacultyResult = await client.query(getNewFacultySql, [facultyResult.rows[0].id]);
    
    res.status(201).json({ 
      message: 'Faculty member added successfully!',
      faculty: newFacultyResult.rows[0]
    });
    
  } catch (err) {
    console.error('Error adding faculty:', err);
    res.status(500).json({ error: 'Failed to add faculty member to database' });
  }
});

// Delete faculty member
app.delete('/api/faculty/:id', async (req, res) => {
  const facultyId = req.params.id;
  
  console.log('Deleting faculty ID:', facultyId);
  
  try {
    // First check if faculty exists
    const checkFacultySql = 'SELECT id, CONCAT(first_name, \' \', last_name) as faculty_name FROM faculty WHERE id = $1';
    const facultyResult = await client.query(checkFacultySql, [facultyId]);
    
    if (facultyResult.rows.length === 0) {
      return res.status(404).json({ error: 'Faculty member not found' });
    }
    
    const facultyName = facultyResult.rows[0].faculty_name;
    
    // Check if faculty has IQAC records
    const checkRecordsSql = 'SELECT COUNT(*) as record_count FROM iqac_record WHERE faculty_id = $1';
    const recordResult = await client.query(checkRecordsSql, [facultyId]);
    
    const recordCount = parseInt(recordResult.rows[0].record_count);
    
    if (recordCount > 0) {
      return res.status(400).json({ 
        error: `Cannot delete faculty member. ${facultyName} has ${recordCount} IQAC record(s). Delete the records first.` 
      });
    }
    
    // Delete faculty member
    const deleteFacultySql = 'DELETE FROM faculty WHERE id = $1';
    const deleteResult = await client.query(deleteFacultySql, [facultyId]);
    
    if (deleteResult.rowCount === 0) {
      return res.status(404).json({ error: 'Faculty member not found' });
    }
    
    res.json({ 
      message: 'Faculty member deleted successfully!',
      deleted_faculty: facultyName
    });
    
  } catch (err) {
    console.error('Error deleting faculty:', err);
    res.status(500).json({ error: 'Failed to delete faculty member from database' });
  }
});

// Update faculty member
app.put('/api/faculty/:id', async (req, res) => {
  const facultyId = req.params.id;
  const { faculty_name, dept_name, email, phone, hire_date } = req.body;
  
  console.log('Updating faculty ID:', facultyId, 'with data:', req.body);
  
  if (!faculty_name || !dept_name || !email) {
    return res.status(400).json({ 
      error: 'Faculty name, department, and email are required fields' 
    });
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Please provide a valid email address' });
  }

  // Split faculty name into first and last name
  const nameParts = faculty_name.split(' ');
  const first_name = nameParts[0] || '';
  const last_name = nameParts.slice(1).join(' ') || '';

  try {
    // First, get or create department
    const getDeptSql = 'SELECT id FROM department WHERE name = $1 OR LOWER(name) = LOWER($2) LIMIT 1';
    const deptResult = await client.query(getDeptSql, [dept_name, dept_name]);
    
    let departmentId;
    
    if (deptResult.rows.length > 0) {
      // Department exists
      departmentId = deptResult.rows[0].id;
    } else {
      // Create new department
      const insertDeptSql = 'INSERT INTO department (name) VALUES ($1) RETURNING id';
      const deptInsertResult = await client.query(insertDeptSql, [dept_name]);
      departmentId = deptInsertResult.rows[0].id;
    }
    
    // Check if email already exists for other faculty
    const checkEmailSql = 'SELECT id FROM faculty WHERE email = $1 AND id != $2';
    const emailResult = await client.query(checkEmailSql, [email, facultyId]);
    
    if (emailResult.rows.length > 0) {
      return res.status(400).json({ error: 'Email already exists for another faculty member' });
    }
    
    // Update faculty member
    const updateFacultySql = `
      UPDATE faculty 
      SET first_name = $1, last_name = $2, email = $3, phone = $4, hire_date = $5, department_id = $6
      WHERE id = $7
    `;
    
    const updateResult = await client.query(updateFacultySql, [
      first_name,
      last_name,
      email,
      phone || null,
      hire_date || null,
      departmentId,
      facultyId
    ]);
    
    if (updateResult.rowCount === 0) {
      return res.status(404).json({ error: 'Faculty member not found' });
    }
    
    res.json({ 
      message: 'Faculty member updated successfully!',
      faculty_id: parseInt(facultyId)
    });
    
  } catch (err) {
    console.error('Error updating faculty:', err);
    res.status(500).json({ error: 'Failed to update faculty member in database' });
  }
});

// Get all criteria
app.get('/api/criteria', (req, res) => {
  res.json(naacCriteria);
});

// Get all IQAC records from iqac_record table
app.get('/api/iqac', async (req, res) => {
  try {
    const sql = `
      SELECT 
        ir.id as record_id,
        ir.faculty_id,
        CONCAT(f.first_name, ' ', COALESCE(f.last_name, '')) as faculty_name,
        ir.criteria_id,
        ir.sub_criteria,
        ir.period,
        ir.value as score,
        COALESCE(ir.evaluator_name, 'Self-Assessment') as evaluator_name,
        ir.recorded_at as evaluation_date,
        ir.comments,
        COALESCE(d.name, 'Unknown Department') as department,
        ir.evidence_doc as evidence
      FROM iqac_record ir 
      LEFT JOIN faculty f ON ir.faculty_id = f.id 
      LEFT JOIN department d ON f.department_id = d.id
      ORDER BY ir.id DESC
    `;
    
    const result = await client.query(sql);
    
    const formattedResults = result.rows.map(record => {
      const criteria = naacCriteria[record.criteria_id] || { name: 'Unknown', code: 'N/A' };
      const scoreOutOf10 = Math.round((record.score / 100) * 10);
      return {
        ...record,
        criteria_name: criteria.name,
        criteria_code: criteria.code,
        score_out_of_10: scoreOutOf10
      };
    });
    
    console.log(`✅ Sent ${formattedResults.length} IQAC records from iqac_record table`);
    res.json(formattedResults);
  } catch (err) {
    console.error('Error fetching IQAC records:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Get IQAC records by faculty ID from iqac_record table
app.get('/api/iqac/faculty/:facultyId', async (req, res) => {
  const facultyId = req.params.facultyId;
  
  try {
    const sql = `
      SELECT 
        ir.id as record_id,
        ir.faculty_id,
        CONCAT(f.first_name, ' ', COALESCE(f.last_name, '')) as faculty_name,
        ir.criteria_id,
        ir.sub_criteria,
        ir.period,
        ir.value as score,
        COALESCE(ir.evaluator_name, 'Self-Assessment') as evaluator_name,
        ir.recorded_at as evaluation_date,
        ir.comments,
        COALESCE(d.name, 'Unknown Department') as department,
        ir.evidence_doc as evidence
      FROM iqac_record ir 
      LEFT JOIN faculty f ON ir.faculty_id = f.id 
      LEFT JOIN department d ON f.department_id = d.id
      WHERE ir.faculty_id = $1
      ORDER BY ir.id DESC
    `;
    
    const result = await client.query(sql, [facultyId]);
    
    const formattedResults = result.rows.map(record => {
      const criteria = naacCriteria[record.criteria_id] || { name: 'Unknown', code: 'N/A' };
      const scoreOutOf10 = Math.round((record.score / 100) * 10);
      return {
        ...record,
        criteria_name: criteria.name,
        criteria_code: criteria.code,
        score_out_of_10: scoreOutOf10
      };
    });
    
    res.json(formattedResults);
  } catch (err) {
    console.error('Error fetching faculty records:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Calculate automatic score
function calculateScore(evidence, comments) {
  let score = 70; // Base score
  
  const text = (evidence + ' ' + comments).toLowerCase();

  if (text.includes('published') || text.includes('journal')) score += 15;
  if (text.includes('conference') || text.includes('seminar')) score += 10;
  if (text.includes('award') || text.includes('recognition')) score += 20;
  if (text.includes('innovation') || text.includes('new')) score += 15;
  if (text.includes('student') && text.includes('feedback')) score += 10;
  if (text.includes('international')) score += 10;
  if (text.includes('patent')) score += 25;

  return Math.min(score, 100);
}

// Add new IQAC record to iqac_record table
app.post('/api/iqac', async (req, res) => {
  const { faculty_id, criteria_id, sub_criteria, period, evidence, comments } = req.body;
  
  console.log('Received data for iqac_record:', req.body);
  
  if (!faculty_id || !criteria_id || !sub_criteria) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  try {
    // Calculate score automatically
    const calculatedScore = calculateScore(evidence || '', comments || '');
    
    // Use criteria_id as indicator_id (simplified mapping)
    const indicator_id = criteria_id;
    
    const sql = `
      INSERT INTO iqac_record 
      (faculty_id, indicator_id, criteria_id, sub_criteria, period, value, evaluator_name, recorded_at, comments, evidence_doc) 
      VALUES ($1, $2, $3, $4, $5, $6, 'Self-Assessment', NOW(), $7, $8)
      RETURNING id
    `;
    
    const result = await client.query(sql, [
      faculty_id, 
      indicator_id, 
      criteria_id, 
      sub_criteria, 
      period, 
      calculatedScore,
      comments || '',
      evidence || '' // Store evidence in evidence_doc field
    ]);
    
    res.json({ 
      message: 'Record added successfully!',
      record_id: result.rows[0].id,
      calculated_score: calculatedScore,
      score_out_of_10: Math.round(calculatedScore / 10)
    });
  } catch (err) {
    console.error('Error adding record to iqac_record:', err);
    res.status(500).json({ error: 'Database error: ' + err.message });
  }
});

// Delete IQAC record from iqac_record table
app.delete('/api/iqac/:recordId', async (req, res) => {
  const recordId = req.params.recordId;
  const facultyId = req.query.faculty_id;
  
  try {
    let sql, params;
    
    if (facultyId) {
      sql = 'DELETE FROM iqac_record WHERE id = $1 AND faculty_id = $2';
      params = [recordId, facultyId];
    } else {
      sql = 'DELETE FROM iqac_record WHERE id = $1';
      params = [recordId];
    }
    
    const result = await client.query(sql, params);
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Record not found' });
    }
    
    res.json({ message: 'Record deleted successfully!' });
  } catch (err) {
    console.error('Error deleting record from iqac_record:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Get leaderboard using iqac_record table
app.get('/api/leaderboard', async (req, res) => {
  try {
    const sql = `
      SELECT 
        f.id as faculty_id,
        CONCAT(f.first_name, ' ', COALESCE(f.last_name, '')) as faculty_name,
        d.name as department,
        COUNT(ir.id) as total_records,
        ROUND(AVG(ir.value)::numeric, 2) as avg_score,
        ROUND((AVG(ir.value) / 10)::numeric, 2) as score_out_of_10
      FROM faculty f 
      LEFT JOIN iqac_record ir ON f.id = ir.faculty_id 
      LEFT JOIN department d ON f.department_id = d.id 
      WHERE ir.id IS NOT NULL
      GROUP BY f.id, f.first_name, f.last_name, d.name
      HAVING COUNT(ir.id) > 0
      ORDER BY avg_score DESC
      LIMIT 10
    `;
    
    const result = await client.query(sql);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching leaderboard:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Get charts data using iqac_record table
app.get('/api/charts/performance', async (req, res) => {
  try {
    // Department performance data
    const deptSql = `
      SELECT 
        d.name as department,
        COUNT(DISTINCT f.id) as faculty_count,
        ROUND(AVG(ir.value)::numeric, 2) as avg_score
      FROM department d
      LEFT JOIN faculty f ON d.id = f.department_id
      LEFT JOIN iqac_record ir ON f.id = ir.faculty_id
      WHERE ir.id IS NOT NULL
      GROUP BY d.id, d.name
      HAVING COUNT(ir.id) > 0
    `;
    
    // Criteria distribution data
    const criteriaSql = `
      SELECT 
        criteria_id,
        COUNT(*) as record_count,
        ROUND(AVG(value)::numeric, 2) as avg_score
      FROM iqac_record
      GROUP BY criteria_id
      ORDER BY criteria_id
    `;
    
    const deptResult = await client.query(deptSql);
    const criteriaResult = await client.query(criteriaSql);
    
    const pieData = criteriaResult.rows.map(item => {
      const criteria = naacCriteria[item.criteria_id];
      return {
        criteria_id: item.criteria_id,
        criteria_name: criteria ? criteria.name : `Criteria ${item.criteria_id}`,
        record_count: item.record_count,
        avg_score: item.avg_score
      };
    });
    
    res.json({
      bar_chart: deptResult.rows,
      pie_chart: pieData
    });
  } catch (err) {
    console.error('Error fetching charts data:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Get faculty statistics
app.get('/api/faculty/stats', async (req, res) => {
  try {
    const sql = `
      SELECT 
        COUNT(*) as total_faculty,
        COUNT(DISTINCT ir.faculty_id) as faculty_with_records,
        COUNT(ir.id) as total_records,
        ROUND(AVG(ir.value)::numeric, 2) as avg_score_all
      FROM faculty f 
      LEFT JOIN iqac_record ir ON f.id = ir.faculty_id
    `;
    
    const result = await client.query(sql);
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching faculty stats:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Database diagnostics endpoint
app.get('/api/diagnostics', async (req, res) => {
  try {
    const queries = {
      iqac_indicator: "SELECT COUNT(*) as count FROM iqac_indicator",
      iqac_record: "SELECT COUNT(*) as count FROM iqac_record",
      faculty: "SELECT COUNT(*) as count FROM faculty",
      faculty_with_records: "SELECT COUNT(DISTINCT faculty_id) as count FROM iqac_record"
    };
    
    const results = {};
    
    for (const [table, query] of Object.entries(queries)) {
      try {
        const result = await client.query(query);
        results[table] = { count: parseInt(result.rows[0].count) };
      } catch (err) {
        results[table] = { error: err.message };
      }
    }
    
    res.json(results);
  } catch (err) {
    console.error('Error in diagnostics:', err);
    res.status(500).json({ error: 'Diagnostics error' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 API: http://localhost:${PORT}/api`);
  console.log(`✅ Using PostgreSQL with iqac_record table for faculty data`);
  console.log(`✅ Faculty management endpoints are ready!`);
});