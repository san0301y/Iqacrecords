import React, { useState, useEffect } from 'react';
import { iqacAPI, facultyAPI, facultySummaryAPI } from '../services/api';
import './IqacRecords.css';

const IqacRecords = () => {
  const [records, setRecords] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [selectedFaculty, setSelectedFaculty] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [teacherDetails, setTeacherDetails] = useState(null);
  const [showTeacherModal, setShowTeacherModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedFaculty && selectedFaculty !== 'all') {
      fetchFacultyRecords(selectedFaculty);
    } else {
      fetchAllRecords();
    }
  }, [selectedFaculty]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const facultyResponse = await facultyAPI.getAll();
      setFaculty(facultyResponse.data);
      
      await fetchAllRecords();
      
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data. Please check if the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllRecords = async () => {
    try {
      const response = await iqacAPI.getAll();
      console.log('All IQAC records:', response.data);
      setRecords(response.data);
    } catch (err) {
      console.error('Error fetching all records:', err);
      setError('Failed to load IQAC records.');
    }
  };

  const fetchFacultyRecords = async (facultyId) => {
    try {
      const response = await iqacAPI.getByFaculty(facultyId);
      console.log(`Faculty ${facultyId} records:`, response.data);
      setRecords(response.data);
    } catch (err) {
      console.error('Error fetching faculty records:', err);
      setError('Failed to load faculty records.');
    }
  };

  const fetchTeacherDetails = async (facultyId) => {
    try {
      // First get basic faculty info
      const facultyInfo = faculty.find(f => f.faculty_id == facultyId);
      
      // Then get IQAC records for this faculty
      const iqacResponse = await iqacAPI.getByFaculty(facultyId);
      
      // Calculate statistics
      const teacherRecords = iqacResponse.data;
      const totalRecords = teacherRecords.length;
      const avgScore = totalRecords > 0 
        ? Math.round(teacherRecords.reduce((sum, record) => sum + (record.score || record.calculated_score || 0), 0) / totalRecords)
        : 0;
      
      setTeacherDetails({
        ...facultyInfo,
        records: teacherRecords,
        statistics: {
          totalRecords,
          avgScore,
          criteriaCovered: new Set(teacherRecords.map(record => record.criteria_id)).size
        }
      });
      
      setShowTeacherModal(true);
    } catch (err) {
      console.error('Error fetching teacher details:', err);
      alert('Failed to load teacher details.');
    }
  };

  const handleDeleteRecord = async (recordId, facultyName) => {
    if (!window.confirm(`Are you sure you want to delete this record for ${facultyName}?`)) {
      return;
    }

    try {
      await iqacAPI.delete(recordId);
      
      if (selectedFaculty && selectedFaculty !== 'all') {
        fetchFacultyRecords(selectedFaculty);
      } else {
        fetchAllRecords();
      }
      
      alert('Record deleted successfully!');
    } catch (err) {
      console.error('Error deleting record:', err);
      alert('Failed to delete record. Please try again.');
    }
  };

  const handleViewTeacherDetails = (facultyId, facultyName) => {
    setSelectedTeacher({ facultyId, facultyName });
    fetchTeacherDetails(facultyId);
  };

  const closeTeacherModal = () => {
    setShowTeacherModal(false);
    setTeacherDetails(null);
    setSelectedTeacher(null);
  };

  const getScoreBadgeClass = (scoreOutOf10) => {
    if (scoreOutOf10 >= 8) return 'score-high';
    if (scoreOutOf10 >= 6) return 'score-medium';
    return 'score-low';
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading IQAC records...</p>
      </div>
    );
  }

  return (
    <div className="iqac-container">
      <div className="page-header">
        <h2>📊 IQAC Records Management</h2>
        <p>View and manage all faculty IQAC assessment records</p>
      </div>

      {error && (
        <div className="error">
          <h3>⚠️ Error</h3>
          <p>{error}</p>
          <button onClick={fetchData} className="retry-btn">
            🔄 Retry
          </button>
        </div>
      )}

      {/* Filters Section */}
      <div className="filters">
        <div className="filter-group">
          <label htmlFor="faculty-filter">Filter by Faculty:</label>
          <select 
            id="faculty-filter"
            value={selectedFaculty} 
            onChange={(e) => setSelectedFaculty(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Faculty Members</option>
            {faculty.map((member) => (
              <option key={member.faculty_id} value={member.faculty_id}>
                {member.faculty_name} - {member.dept_name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="filter-info">
          <span className="records-count">
            📋 Showing {records.length} record(s)
            {selectedFaculty !== 'all' && ' for selected faculty'}
          </span>
        </div>
      </div>

      {/* Info Box */}
      <div className="info-box">
        <p>
          💡 <strong>Tip:</strong> Click on any faculty name to view their complete profile, contact details, and all IQAC records.
        </p>
      </div>

      {/* Records Table */}
      <div className="table-container">
        <table className="iqac-table">
          <thead>
            <tr>
              <th>Record ID</th>
              <th>Faculty Name</th>
              <th>Criteria</th>
              <th>Activity</th>
              <th>Period</th>
              <th>Score</th>
              <th>Score /10</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record) => (
              <tr key={record.record_id}>
                <td className="record-id">#{record.record_id}</td>
                <td className="faculty-name">
                  <span 
                    className="faculty-name-link"
                    onClick={() => handleViewTeacherDetails(record.faculty_id, record.faculty_name)}
                    title="Click to view complete teacher profile"
                  >
                    <strong>{record.faculty_name}</strong> 👁️
                  </span>
                  <br />
                  <small className="department">{record.department || 'N/A'}</small>
                </td>
                <td className="criteria">
                  <strong>{record.criteria_code || `C${record.criteria_id}`}</strong>
                  <br />
                  <small>{record.criteria_name || `Criteria ${record.criteria_id}`}</small>
                </td>
                <td className="activity">
                  <div>
                    <strong>{record.sub_criteria}</strong>
                    {record.comments && (
                      <div className="comments">
                        <small>💬 {record.comments}</small>
                      </div>
                    )}
                  </div>
                </td>
                <td className="period">
                  <span className="period-badge">{record.period}</span>
                </td>
                <td className="score">
                  <span className="score-percentage">{record.score || record.calculated_score}%</span>
                </td>
                <td className="score-out-of-10">
                  <span className={`score-badge ${getScoreBadgeClass(record.score_out_of_10)}`}>
                    {record.score_out_of_10 || Math.round((record.score || record.calculated_score) / 10)}/10
                  </span>
                </td>
                <td className="date">
                  {record.evaluation_date ? new Date(record.evaluation_date).toLocaleDateString('en-IN') : 'N/A'}
                </td>
                <td className="actions">
                  <button
                    onClick={() => handleDeleteRecord(record.record_id, record.faculty_name)}
                    className="delete-btn"
                    title="Delete this record"
                  >
                    🗑️ Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Teacher Details Modal */}
      {showTeacherModal && teacherDetails && (
        <div className="modal-overlay" onClick={closeTeacherModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>👨‍🏫 Teacher Profile: {teacherDetails.faculty_name}</h3>
              <button className="close-btn" onClick={closeTeacherModal}>✕</button>
            </div>
            
            <div className="teacher-profile">
              <div className="profile-section">
                <h4>📋 Basic Information</h4>
                <div className="profile-grid">
                  <div className="profile-item">
                    <label>Employee ID:</label>
                    <span>{teacherDetails.employee_id || 'N/A'}</span>
                  </div>
                  <div className="profile-item">
                    <label>Department:</label>
                    <span>{teacherDetails.dept_name}</span>
                  </div>
                  <div className="profile-item">
                    <label>Email:</label>
                    <span>{teacherDetails.email}</span>
                  </div>
                  <div className="profile-item">
                    <label>Phone:</label>
                    <span>{teacherDetails.phone || 'N/A'}</span>
                  </div>
                  <div className="profile-item">
                    <label>Hire Date:</label>
                    <span>{teacherDetails.hire_date ? new Date(teacherDetails.hire_date).toLocaleDateString('en-IN') : 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div className="profile-section">
                <h4>📊 IQAC Performance Summary</h4>
                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-number">{teacherDetails.statistics.totalRecords}</div>
                    <div className="stat-label">Total Records</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-number">{teacherDetails.statistics.avgScore}%</div>
                    <div className="stat-label">Average Score</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-number">{teacherDetails.statistics.criteriaCovered}/7</div>
                    <div className="stat-label">Criteria Covered</div>
                  </div>
                </div>
              </div>

              <div className="profile-section">
                <h4>📝 Recent IQAC Records</h4>
                {teacherDetails.records.length > 0 ? (
                  <div className="teacher-records">
                    {teacherDetails.records.slice(0, 5).map((record) => (
                      <div key={record.record_id} className="record-item">
                        <div className="record-header">
                          <strong>{record.criteria_name || `Criteria ${record.criteria_id}`}</strong>
                          <span className={`score-badge ${getScoreBadgeClass(record.score_out_of_10)}`}>
                            {record.score_out_of_10}/10
                          </span>
                        </div>
                        <div className="record-details">
                          <span>{record.sub_criteria}</span>
                          <span className="period">{record.period}</span>
                        </div>
                        {record.comments && (
                          <div className="record-comments">💬 {record.comments}</div>
                        )}
                      </div>
                    ))}
                    {teacherDetails.records.length > 5 && (
                      <div className="more-records">
                        <small>... and {teacherDetails.records.length - 5} more records</small>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="no-records">No IQAC records found for this faculty member.</p>
                )}
              </div>
            </div>
            
            <div className="modal-footer">
              <button onClick={closeTeacherModal} className="close-modal-btn">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {records.length === 0 && !loading && (
        <div className="no-data">
          <p>📭 No IQAC records found.</p>
          <p>
            {selectedFaculty === 'all' 
              ? 'Faculty members can add records through the Teacher Portal.'
              : 'This faculty member has no IQAC records yet.'
            }
          </p>
          <div className="no-data-actions">
            <button onClick={fetchData} className="retry-btn">
              🔄 Refresh
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default IqacRecords;