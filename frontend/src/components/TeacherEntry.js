import React, { useState, useEffect } from 'react';
import { iqacAPI, facultyAPI, criteriaAPI } from '../services/api';
import './TeacherEntry.css';

const TeacherEntry = () => {
  const [faculty, setFaculty] = useState([]);
  const [selectedFaculty, setSelectedFaculty] = useState('');
  const [criteria, setCriteria] = useState([]);
  const [formData, setFormData] = useState({
    criteria_id: '',
    sub_criteria: '',
    period: '2024-S1',
    evidence: '',
    comments: ''
  });
  const [message, setMessage] = useState('');
  const [records, setRecords] = useState([]);
  const [calculatedScore, setCalculatedScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [scoreBreakdown, setScoreBreakdown] = useState([]);
  const [dataVersion, setDataVersion] = useState(0); // Add this for force refresh

  // Refresh data when component mounts or dataVersion changes
  useEffect(() => {
    fetchFaculty();
    fetchCriteria();
  }, [dataVersion]);

  useEffect(() => {
    if (selectedFaculty) {
      fetchFacultyRecords();
    }
  }, [selectedFaculty, dataVersion]);

  useEffect(() => {
    calculateScore();
  }, [formData.evidence, formData.comments]);

  const fetchFaculty = async () => {
    try {
      console.log('🔄 Fetching faculty list for Teacher Entry...');
      const response = await facultyAPI.getAll();
      console.log('✅ Teacher Entry - Faculty loaded:', response.data.length, 'members');
      console.log('✅ Faculty IDs in Teacher Entry:', response.data.map(f => f.faculty_id));
      setFaculty(response.data);
    } catch (err) {
      console.error('❌ Faculty fetch error in Teacher Entry:', err);
      setMessage('❌ Error loading faculty data. Check if backend is running.');
    }
  };

  const fetchCriteria = async () => {
    try {
      const response = await criteriaAPI.getAll();
      if (Array.isArray(response.data)) {
        setCriteria(response.data);
      } else if (typeof response.data === 'object') {
        const criteriaArray = Object.entries(response.data).map(([id, crit]) => ({
          id: parseInt(id),
          ...crit
        }));
        setCriteria(criteriaArray);
      }
    } catch (err) {
      console.error('Error fetching criteria:', err);
      setCriteria([
        { id: 1, code: 'C1', name: 'Curriculum Aspects' },
        { id: 2, code: 'C2', name: 'Teaching-Learning and Evaluation' },
        { id: 3, code: 'C3', name: 'Research, Innovations and Extension' },
        { id: 4, code: 'C4', name: 'Infrastructure and Learning Resources' },
        { id: 5, code: 'C5', name: 'Student Support and Progression' },
        { id: 6, code: 'C6', name: 'Governance, Leadership and Management' },
        { id: 7, code: 'C7', name: 'Institutional Values and Best Practices' }
      ]);
    }
  };

  const fetchFacultyRecords = async () => {
    try {
      console.log(`🔄 Fetching records for faculty ID: ${selectedFaculty}`);
      const response = await iqacAPI.getByFaculty(selectedFaculty);
      console.log(`✅ Records for faculty ${selectedFaculty}:`, response.data.length);
      setRecords(response.data || []);
    } catch (err) {
      console.error('Error fetching records:', err);
      setRecords([]);
    }
  };

  const calculateScore = () => {
    if (!formData.evidence.trim() && !formData.comments.trim()) {
      setCalculatedScore(0);
      setScoreBreakdown([]);
      return;
    }

    let score = 70;
    const text = (formData.evidence + ' ' + formData.comments).toLowerCase();
    const breakdown = [];

    const scoringRules = [
      { keyword: ['published', 'journal'], points: 15, description: 'Publication in journal' },
      { keyword: ['conference', 'seminar'], points: 10, description: 'Conference/Seminar participation' },
      { keyword: ['award', 'recognition'], points: 20, description: 'Award/Recognition received' },
      { keyword: ['innovation', 'new'], points: 15, description: 'Innovation/New initiative' },
      { keyword: ['student', 'feedback'], points: 10, description: 'Student feedback/engagement' },
      { keyword: ['international'], points: 10, description: 'International exposure' },
      { keyword: ['patent'], points: 25, description: 'Patent filed/granted' },
      { keyword: ['workshop', 'training'], points: 8, description: 'Workshop/Training conducted' },
      { keyword: ['book', 'chapter'], points: 12, description: 'Book/Chapter published' },
      { keyword: ['grant', 'funding'], points: 18, description: 'Grant/Funding received' },
      { keyword: ['community', 'service'], points: 7, description: 'Community service' },
      { keyword: ['research'], points: 12, description: 'Research activity' },
      { keyword: ['project'], points: 10, description: 'Project completed' },
      { keyword: ['mentor', 'guidance'], points: 8, description: 'Student mentorship' }
    ];

    scoringRules.forEach(rule => {
      const hasKeyword = rule.keyword.some(keyword => text.includes(keyword));
      if (hasKeyword) {
        score += rule.points;
        breakdown.push({
          description: rule.description,
          points: `+${rule.points}`,
          achieved: true
        });
      }
    });

    const finalScore = Math.min(score, 100);
    setCalculatedScore(finalScore);
    setScoreBreakdown(breakdown);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    if (!selectedFaculty) {
      setMessage('❌ Please select a faculty member');
      setLoading(false);
      return;
    }

    if (!formData.criteria_id) {
      setMessage('❌ Please select NAAC criteria');
      setLoading(false);
      return;
    }

    if (!formData.sub_criteria.trim()) {
      setMessage('❌ Please enter activity description');
      setLoading(false);
      return;
    }

    if (!formData.evidence.trim()) {
      setMessage('❌ Please provide evidence details');
      setLoading(false);
      return;
    }

    try {
      const recordData = {
        faculty_id: parseInt(selectedFaculty),
        criteria_id: parseInt(formData.criteria_id),
        sub_criteria: formData.sub_criteria.trim(),
        period: formData.period,
        evidence: formData.evidence.trim(),
        comments: formData.comments.trim()
      };

      console.log('📤 Sending IQAC record:', recordData);

      const response = await iqacAPI.add(recordData);
      console.log('✅ IQAC record added:', response.data);

      setMessage(`✅ Record added successfully! Score: ${response.data.calculated_score || calculatedScore}%`);
      
      // Reset form
      setFormData({
        criteria_id: '',
        sub_criteria: '',
        period: '2024-S1',
        evidence: '',
        comments: ''
      });
      setCalculatedScore(0);
      setScoreBreakdown([]);
      
      // Refresh records
      fetchFacultyRecords();
      
    } catch (err) {
      console.error('❌ Error adding IQAC record:', err);
      const errorMessage = err.response?.data?.error || 
                          err.response?.data?.message || 
                          'Failed to add record. Check if backend server is running on port 5000.';
      setMessage(`❌ Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (recordId) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      try {
        await iqacAPI.delete(recordId, selectedFaculty);
        setMessage('✅ Record deleted successfully!');
        fetchFacultyRecords();
      } catch (err) {
        console.error('Delete error:', err);
        setMessage('❌ Error deleting record: ' + (err.response?.data?.error || 'Please try again.'));
      }
    }
  };

  // Add this function to manually refresh data
  const refreshData = () => {
    console.log('🔄 Manually refreshing data...');
    setDataVersion(prev => prev + 1);
    setMessage('🔄 Refreshing data...');
  };

  const getSelectedFacultyName = () => {
    const facultyMember = faculty.find(f => f.faculty_id == selectedFaculty);
    return facultyMember ? facultyMember.faculty_name : 'Unknown Faculty';
  };

  const getScoreBadgeClass = (score) => {
    const scoreOutOf10 = Math.round(score / 10);
    if (scoreOutOf10 >= 8) return 'score-high';
    if (scoreOutOf10 >= 6) return 'score-medium';
    return 'score-low';
  };

  return (
    <div className="teacher-entry">
      <div className="page-header">
        <div>
          <h2>👨‍🏫 Teacher Self-Assessment Portal</h2>
          <p>Describe your activities - score is calculated automatically based on content</p>
          <div className="data-info">
            <small>
              📊 Loaded {faculty.length} faculty members | 
              💡 If new faculty are missing, click Refresh Data
            </small>
          </div>
        </div>
        <button onClick={refreshData} className="refresh-btn">
          🔄 Refresh Data
        </button>
      </div>

      {message && (
        <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

      <div className="entry-form">
        <h3>📝 Add New Activity Record</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>👤 Select Your Name:</label>
            <select 
              value={selectedFaculty} 
              onChange={(e) => setSelectedFaculty(e.target.value)}
              required
              disabled={loading}
            >
              <option value="">Choose Your Name from List ({faculty.length} faculty members)</option>
              {faculty.map((member) => (
                <option key={member.faculty_id} value={member.faculty_id}>
                  {member.faculty_name} - {member.dept_name} (ID: {member.faculty_id})
                </option>
              ))}
            </select>
            <small className="tip-text">
              💡 If you don't see your name, add it in the Faculty List first, then refresh here.
            </small>
          </div>

          <div className="form-group">
            <label>📊 NAAC Criteria:</label>
            <select 
              value={formData.criteria_id} 
              onChange={(e) => setFormData({...formData, criteria_id: e.target.value})}
              required
              disabled={loading}
            >
              <option value="">Select Assessment Criteria</option>
              {criteria.map((crit) => (
                <option key={crit.id} value={crit.id}>
                  {crit.code}: {crit.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>📋 Activity Description:</label>
            <input 
              type="text" 
              value={formData.sub_criteria} 
              onChange={(e) => setFormData({...formData, sub_criteria: e.target.value})}
              placeholder="e.g., Research paper publication, Workshop conducted, Award received"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>📝 Evidence Details (Auto-scoring based on content):</label>
            <textarea 
              value={formData.evidence} 
              onChange={(e) => setFormData({...formData, evidence: e.target.value})}
              placeholder="Describe your evidence in detail. Include keywords like: published, journal, conference, award, innovation, international, patent, workshop, student feedback, etc. to increase your score."
              rows="4"
              required
              disabled={loading}
            />
            <small className="tip-text">
              💡 Tip: Mention specific achievements like "published in international journal", "received best paper award", "organized workshop" for higher scores.
            </small>
          </div>

          <div className="form-group">
            <label>🗓️ Assessment Period:</label>
            <select 
              value={formData.period} 
              onChange={(e) => setFormData({...formData, period: e.target.value})}
              required
              disabled={loading}
            >
              <option value="2024-S1">2024 Semester 1</option>
              <option value="2024-S2">2024 Semester 2</option>
              <option value="2023-S1">2023 Semester 1</option>
              <option value="2023-S2">2023 Semester 2</option>
              <option value="2022-S1">2022 Semester 1</option>
              <option value="2022-S2">2022 Semester 2</option>
            </select>
          </div>

          <div className="form-group">
            <label>💬 Additional Comments:</label>
            <textarea 
              value={formData.comments} 
              onChange={(e) => setFormData({...formData, comments: e.target.value})}
              placeholder="Any additional information or context"
              rows="2"
              disabled={loading}
            />
          </div>

          <div className="score-preview">
            <div className="score-header">
              <strong>🎯 Auto-Calculated Score: </strong>
              <span className={`score-badge ${getScoreBadgeClass(calculatedScore)}`}>
                {calculatedScore}% ({Math.round(calculatedScore/10)}/10)
              </span>
            </div>
            
            {scoreBreakdown.length > 0 && (
              <div className="score-breakdown">
                <div className="breakdown-header">
                  <small>Score Breakdown (Base: 70%):</small>
                </div>
                <div className="breakdown-list">
                  {scoreBreakdown.map((item, index) => (
                    <div key={index} className="breakdown-item">
                      <span className="breakdown-desc">{item.description}</span>
                      <span className="breakdown-points">{item.points}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="score-note">
              <small>Score updates automatically as you type in Evidence field</small>
            </div>
          </div>

          <button 
            type="submit" 
            className="submit-btn"
            disabled={loading || calculatedScore === 0}
          >
            {loading ? '⏳ Adding Record...' : '➕ Add Record with Auto-Scoring'}
          </button>
        </form>
      </div>

      {selectedFaculty && (
        <div className="faculty-records">
          <div className="records-header">
            <h3>📚 Records for {getSelectedFacultyName()}</h3>
            <div className="records-info">
              <span className="records-count">{records.length} record(s)</span>
              <button onClick={fetchFacultyRecords} className="refresh-small-btn">
                🔄 Refresh
              </button>
            </div>
          </div>
          
          {records.length === 0 ? (
            <div className="no-records">
              <p>No records found for this faculty member.</p>
              <p>Add your first record using the form above.</p>
            </div>
          ) : (
            <div className="records-list">
              {records.map((record) => (
                <div key={record.record_id} className="record-card">
                  <div className="record-header">
                    <h4>{record.criteria_name || `Criteria ${record.criteria_id}`}</h4>
                    <button 
                      onClick={() => handleDelete(record.record_id)}
                      className="delete-btn"
                      disabled={loading}
                    >
                      {loading ? '⏳' : '🗑️ Delete'}
                    </button>
                  </div>
                  <div className="record-details">
                    <p><strong>Activity:</strong> {record.sub_criteria}</p>
                    <p><strong>Score:</strong> 
                      <span className={`score-badge ${getScoreBadgeClass(record.score || record.calculated_score)}`}>
                        {record.score_out_of_10 || Math.round((record.score || record.calculated_score) / 10)}/10 
                        ({record.score || record.calculated_score}%)
                      </span>
                    </p>
                    <p><strong>Period:</strong> {record.evaluation_period || record.period}</p>
                    <p><strong>Evidence:</strong> {record.evidence}</p>
                    {record.comments && (
                      <p><strong>Comments:</strong> {record.comments}</p>
                    )}
                    <p><strong>Date Added:</strong> {new Date(record.evaluation_date || record.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TeacherEntry;