const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'iqacdb',
  port: 3306
});

// Connect to MySQL
connection.connect((err) => {
  if (err) {
    console.error('❌ MySQL Connection Failed:', err.message);
  } else {
    console.log('✅ Connected to MySQL database successfully!');
  }
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
app.get('/api/faculty', (req, res) => {
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
  
  connection.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching faculty:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    console.log(`✅ Sent ${results.length} faculty members with iqac_record counts`);
    res.json(results);
  });
});

// Add new faculty member
app.post('/api/faculty', (req, res) => {
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

  // First, get or create department
  const getDeptSql = 'SELECT id FROM department WHERE name = ? OR LOWER(name) = LOWER(?) LIMIT 1';
  
  connection.query(getDeptSql, [dept_name, dept_name], (err, deptResults) => {
    if (err) {
      console.error('Error checking department:', err);
      return res.status(500).json({ error: 'Database error while checking department' });
    }
    
    let departmentId;
    
    if (deptResults.length > 0) {
      // Department exists
      departmentId = deptResults[0].id;
      insertFaculty();
    } else {
      // Create new department
      const insertDeptSql = 'INSERT INTO department (name) VALUES (?)';
      connection.query(insertDeptSql, [dept_name], (err, deptInsertResult) => {
        if (err) {
          console.error('Error creating department:', err);
          return res.status(500).json({ error: 'Failed to create department' });
        }
        departmentId = deptInsertResult.insertId;
        insertFaculty();
      });
    }
    
    function insertFaculty() {
      // Check if email already exists
      const checkEmailSql = 'SELECT id FROM faculty WHERE email = ?';
      connection.query(checkEmailSql, [email], (err, emailResults) => {
        if (err) {
          console.error('Error checking email:', err);
          return res.status(500).json({ error: 'Database error while checking email' });
        }
        
        if (emailResults.length > 0) {
          return res.status(400).json({ error: 'Email already exists in the system' });
        }
        
        // Insert new faculty member
        const insertFacultySql = `
          INSERT INTO faculty 
          (employee_id, first_name, last_name, email, phone, hire_date, department_id) 
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        
        connection.query(insertFacultySql, [
          employee_id,
          first_name,
          last_name,
          email,
          phone || null,
          hire_date || null,
          departmentId
        ], (err, facultyResult) => {
          if (err) {
            console.error('Error adding faculty:', err);
            return res.status(500).json({ error: 'Failed to add faculty member to database' });
          }
          
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
            WHERE f.id = ?
          `;
          
          connection.query(getNewFacultySql, [facultyResult.insertId], (err, newFacultyResults) => {
            if (err) {
              console.error('Error fetching new faculty:', err);
              // Still return success even if we can't fetch the complete data
              return res.json({ 
                message: 'Faculty member added successfully!',
                faculty_id: facultyResult.insertId,
                faculty_name: faculty_name,
                dept_name: dept_name,
                email: email
              });
            }
            
            res.status(201).json({ 
              message: 'Faculty member added successfully!',
              faculty: newFacultyResults[0]
            });
          });
        });
      });
    }
  });
});

// Delete faculty member
app.delete('/api/faculty/:id', (req, res) => {
  const facultyId = req.params.id;
  
  console.log('Deleting faculty ID:', facultyId);
  
  // First check if faculty exists
  const checkFacultySql = 'SELECT id, CONCAT(first_name, " ", last_name) as faculty_name FROM faculty WHERE id = ?';
  
  connection.query(checkFacultySql, [facultyId], (err, facultyResults) => {
    if (err) {
      console.error('Error checking faculty:', err);
      return res.status(500).json({ error: 'Database error while checking faculty' });
    }
    
    if (facultyResults.length === 0) {
      return res.status(404).json({ error: 'Faculty member not found' });
    }
    
    const facultyName = facultyResults[0].faculty_name;
    
    // Check if faculty has IQAC records
    const checkRecordsSql = 'SELECT COUNT(*) as record_count FROM iqac_record WHERE faculty_id = ?';
    
    connection.query(checkRecordsSql, [facultyId], (err, recordResults) => {
      if (err) {
        console.error('Error checking records:', err);
        return res.status(500).json({ error: 'Database error while checking records' });
      }
      
      const recordCount = recordResults[0].record_count;
      
      if (recordCount > 0) {
        return res.status(400).json({ 
          error: `Cannot delete faculty member. ${facultyName} has ${recordCount} IQAC record(s). Delete the records first.` 
        });
      }
      
      // Delete faculty member
      const deleteFacultySql = 'DELETE FROM faculty WHERE id = ?';
      
      connection.query(deleteFacultySql, [facultyId], (err, deleteResult) => {
        if (err) {
          console.error('Error deleting faculty:', err);
          return res.status(500).json({ error: 'Failed to delete faculty member from database' });
        }
        
        if (deleteResult.affectedRows === 0) {
          return res.status(404).json({ error: 'Faculty member not found' });
        }
        
        res.json({ 
          message: 'Faculty member deleted successfully!',
          deleted_faculty: facultyName
        });
      });
    });
  });
});

// Update faculty member
app.put('/api/faculty/:id', (req, res) => {
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

  // First, get or create department
  const getDeptSql = 'SELECT id FROM department WHERE name = ? OR LOWER(name) = LOWER(?) LIMIT 1';
  
  connection.query(getDeptSql, [dept_name, dept_name], (err, deptResults) => {
    if (err) {
      console.error('Error checking department:', err);
      return res.status(500).json({ error: 'Database error while checking department' });
    }
    
    let departmentId;
    
    if (deptResults.length > 0) {
      // Department exists
      departmentId = deptResults[0].id;
      updateFaculty();
    } else {
      // Create new department
      const insertDeptSql = 'INSERT INTO department (name) VALUES (?)';
      connection.query(insertDeptSql, [dept_name], (err, deptInsertResult) => {
        if (err) {
          console.error('Error creating department:', err);
          return res.status(500).json({ error: 'Failed to create department' });
        }
        departmentId = deptInsertResult.insertId;
        updateFaculty();
      });
    }
    
    function updateFaculty() {
      // Check if email already exists for other faculty
      const checkEmailSql = 'SELECT id FROM faculty WHERE email = ? AND id != ?';
      connection.query(checkEmailSql, [email, facultyId], (err, emailResults) => {
        if (err) {
          console.error('Error checking email:', err);
          return res.status(500).json({ error: 'Database error while checking email' });
        }
        
        if (emailResults.length > 0) {
          return res.status(400).json({ error: 'Email already exists for another faculty member' });
        }
        
        // Update faculty member
        const updateFacultySql = `
          UPDATE faculty 
          SET first_name = ?, last_name = ?, email = ?, phone = ?, hire_date = ?, department_id = ?
          WHERE id = ?
        `;
        
        connection.query(updateFacultySql, [
          first_name,
          last_name,
          email,
          phone || null,
          hire_date || null,
          departmentId,
          facultyId
        ], (err, updateResult) => {
          if (err) {
            console.error('Error updating faculty:', err);
            return res.status(500).json({ error: 'Failed to update faculty member in database' });
          }
          
          if (updateResult.affectedRows === 0) {
            return res.status(404).json({ error: 'Faculty member not found' });
          }
          
          res.json({ 
            message: 'Faculty member updated successfully!',
            faculty_id: parseInt(facultyId)
          });
        });
      });
    }
  });
});

// Get all criteria
app.get('/api/criteria', (req, res) => {
  res.json(naacCriteria);
});

// Get all IQAC records from iqac_record table
app.get('/api/iqac', (req, res) => {
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
  
  connection.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching IQAC records:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    const formattedResults = results.map(record => {
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
  });
});

// Get IQAC records by faculty ID from iqac_record table
app.get('/api/iqac/faculty/:facultyId', (req, res) => {
  const facultyId = req.params.facultyId;
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
    WHERE ir.faculty_id = ?
    ORDER BY ir.id DESC
  `;
  
  connection.query(sql, [facultyId], (err, results) => {
    if (err) {
      console.error('Error fetching faculty records:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    const formattedResults = results.map(record => {
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
  });
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
app.post('/api/iqac', (req, res) => {
  const { faculty_id, criteria_id, sub_criteria, period, evidence, comments } = req.body;
  
  console.log('Received data for iqac_record:', req.body);
  
  if (!faculty_id || !criteria_id || !sub_criteria) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  // Calculate score automatically
  const calculatedScore = calculateScore(evidence || '', comments || '');
  
  // Use criteria_id as indicator_id (simplified mapping)
  const indicator_id = criteria_id;
  
  const sql = `
    INSERT INTO iqac_record 
    (faculty_id, indicator_id, criteria_id, sub_criteria, period, value, evaluator_name, recorded_at, comments, evidence_doc) 
    VALUES (?, ?, ?, ?, ?, ?, 'Self-Assessment', NOW(), ?, ?)
  `;
  
  connection.query(sql, [
    faculty_id, 
    indicator_id, 
    criteria_id, 
    sub_criteria, 
    period, 
    calculatedScore,
    comments || '',
    evidence || '' // Store evidence in evidence_doc field
  ], (err, results) => {
    if (err) {
      console.error('Error adding record to iqac_record:', err);
      return res.status(500).json({ error: 'Database error: ' + err.message });
    }
    
    res.json({ 
      message: 'Record added successfully!',
      record_id: results.insertId,
      calculated_score: calculatedScore,
      score_out_of_10: Math.round(calculatedScore / 10)
    });
  });
});

// Delete IQAC record from iqac_record table
app.delete('/api/iqac/:recordId', (req, res) => {
  const recordId = req.params.recordId;
  const facultyId = req.query.faculty_id;
  
  let sql = 'DELETE FROM iqac_record WHERE id = ?';
  let params = [recordId];
  
  if (facultyId) {
    sql += ' AND faculty_id = ?';
    params.push(facultyId);
  }
  
  connection.query(sql, params, (err, results) => {
    if (err) {
      console.error('Error deleting record from iqac_record:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'Record not found' });
    }
    
    res.json({ message: 'Record deleted successfully!' });
  });
});

// Get leaderboard using iqac_record table
app.get('/api/leaderboard', (req, res) => {
  const sql = `
    SELECT 
      f.id as faculty_id,
      CONCAT(f.first_name, ' ', COALESCE(f.last_name, '')) as faculty_name,
      d.name as department,
      COUNT(ir.id) as total_records,
      ROUND(AVG(ir.value), 2) as avg_score,
      ROUND(AVG(ir.value) / 10, 2) as score_out_of_10
    FROM faculty f 
    LEFT JOIN iqac_record ir ON f.id = ir.faculty_id 
    LEFT JOIN department d ON f.department_id = d.id 
    WHERE ir.id IS NOT NULL
    GROUP BY f.id, f.first_name, f.last_name, d.name
    HAVING COUNT(ir.id) > 0
    ORDER BY avg_score DESC
    LIMIT 10
  `;
  
  connection.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching leaderboard:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
});

// Get charts data using iqac_record table
app.get('/api/charts/performance', (req, res) => {
  // Department performance data
  const deptSql = `
    SELECT 
      d.name as department,
      COUNT(DISTINCT f.id) as faculty_count,
      ROUND(AVG(ir.value), 2) as avg_score
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
      ROUND(AVG(value), 2) as avg_score
    FROM iqac_record
    GROUP BY criteria_id
    ORDER BY criteria_id
  `;
  
  connection.query(deptSql, (err, deptResults) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    connection.query(criteriaSql, (err, criteriaResults) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      const pieData = criteriaResults.map(item => {
        const criteria = naacCriteria[item.criteria_id];
        return {
          criteria_id: item.criteria_id,
          criteria_name: criteria ? criteria.name : `Criteria ${item.criteria_id}`,
          record_count: item.record_count,
          avg_score: item.avg_score
        };
      });
      
      res.json({
        bar_chart: deptResults,
        pie_chart: pieData
      });
    });
  });
});

// Get faculty statistics
app.get('/api/faculty/stats', (req, res) => {
  const sql = `
    SELECT 
      COUNT(*) as total_faculty,
      COUNT(DISTINCT ir.faculty_id) as faculty_with_records,
      COUNT(ir.id) as total_records,
      ROUND(AVG(ir.value), 2) as avg_score_all
    FROM faculty f 
    LEFT JOIN iqac_record ir ON f.id = ir.faculty_id
  `;
  
  connection.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching faculty stats:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results[0]);
  });
});

// Database diagnostics endpoint
app.get('/api/diagnostics', (req, res) => {
  const queries = {
    iqac_indicator: "SELECT COUNT(*) as count FROM iqac_indicator",
    iqac_record: "SELECT COUNT(*) as count FROM iqac_record",
    faculty: "SELECT COUNT(*) as count FROM faculty",
    faculty_with_records: "SELECT COUNT(DISTINCT faculty_id) as count FROM iqac_record"
  };
  
  const results = {};
  let completed = 0;
  
  // Check each table
  Object.keys(queries).forEach(table => {
    connection.query(queries[table], (err, result) => {
      if (err) {
        results[table] = { error: err.message };
      } else {
        results[table] = { count: result[0].count };
      }
      
      completed++;
      // When all queries are done, send response
      if (completed === Object.keys(queries).length) {
        res.json(results);
      }
    });
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 API: http://localhost:${PORT}/api`);
  console.log(`✅ Using iqac_record table for faculty data`);
  console.log(`✅ Faculty management endpoints are ready!`);
});