import React, { useState, useEffect } from 'react';
import { facultyAPI } from '../services/api';
import './FacultyList.css';

const FacultyList = ({ onViewTeacherDetails }) => {
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    faculty_name: '',
    dept_name: '',
    email: '',
    phone: '',
    hire_date: ''
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchFaculty();
  }, []);

  const fetchFaculty = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await facultyAPI.getAll();
      setFaculty(response.data);
    } catch (err) {
      console.error('Error fetching faculty:', err);
      setError('Failed to load faculty data. Please check if the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleAddFaculty = async (e) => {
    e.preventDefault();
    
    if (!formData.faculty_name.trim() || !formData.dept_name.trim() || !formData.email.trim()) {
      setMessage('❌ Please fill in all required fields');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setMessage('❌ Please enter a valid email address');
      return;
    }

    try {
      setLoading(true);
      
      const facultyData = {
        faculty_name: formData.faculty_name.trim(),
        dept_name: formData.dept_name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || null,
        hire_date: formData.hire_date || null
      };

      console.log('📤 Adding faculty:', facultyData);
      const response = await facultyAPI.add(facultyData);
      console.log('✅ Faculty added:', response.data);
      
      setMessage('✅ Faculty member added successfully!');
      
      // Reset form
      setFormData({
        faculty_name: '',
        dept_name: '',
        email: '',
        phone: '',
        hire_date: ''
      });
      
      setShowAddForm(false);
      
      // Refresh faculty list
      fetchFaculty();
      
    } catch (err) {
      console.error('❌ Error adding faculty:', err);
      const errorMsg = err.response?.data?.error || 'Failed to add faculty member. Please try again.';
      setMessage(`❌ ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFaculty = async (facultyId, facultyName) => {
    if (!window.confirm(`Are you sure you want to delete ${facultyName}? This action cannot be undone.`)) {
      return;
    }

    try {
      setLoading(true);
      await facultyAPI.delete(facultyId);
      setMessage(`✅ ${facultyName} has been deleted successfully!`);
      fetchFaculty();
    } catch (err) {
      console.error('Error deleting faculty:', err);
      const errorMsg = err.response?.data?.error || 'Failed to delete faculty member. Please try again.';
      setMessage(`❌ ${errorMsg}`);
      setLoading(false);
    }
  };

  const handleViewTeacherDetails = (facultyMember) => {
    if (onViewTeacherDetails) {
      onViewTeacherDetails(facultyMember);
    }
  };

  const resetForm = () => {
    setFormData({
      faculty_name: '',
      dept_name: '',
      email: '',
      phone: '',
      hire_date: ''
    });
    setShowAddForm(false);
    setMessage('');
  };

  if (loading && faculty.length === 0) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading faculty data...</p>
      </div>
    );
  }

  return (
    <div className="faculty-container">
      <div className="page-header">
        <div>
          <h2>👨‍🏫 Faculty Management</h2>
          <p>Manage faculty members - Add, view, and delete faculty records</p>
        </div>
        <div className="header-actions">
          <div className="stats-badge">{faculty.length} faculty members</div>
          <button 
            onClick={() => setShowAddForm(true)}
            className="add-faculty-btn"
            disabled={loading}
          >
            ➕ Add New Faculty
          </button>
        </div>
      </div>

      {message && (
        <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

      {error && (
        <div className="error">
          <h3>⚠️ Connection Error</h3>
          <p>{error}</p>
          <button onClick={fetchFaculty} className="retry-btn">
            🔄 Retry
          </button>
        </div>
      )}

      {/* Add Faculty Form */}
      {showAddForm && (
        <div className="add-faculty-form">
          <h3>➕ Add New Faculty Member</h3>
          <form onSubmit={handleAddFaculty}>
            <div className="form-row">
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  name="faculty_name"
                  value={formData.faculty_name}
                  onChange={handleInputChange}
                  placeholder="Enter faculty full name"
                  required
                  disabled={loading}
                />
              </div>
              
              <div className="form-group">
                <label>Department *</label>
                <select
                  name="dept_name"
                  value={formData.dept_name}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                >
                  <option value="">Select Department</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Physics">Physics</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="Biology">Biology</option>
                  <option value="Electrical Engineering">Electrical Engineering</option>
                  <option value="Mechanical Engineering">Mechanical Engineering</option>
                  <option value="Civil Engineering">Civil Engineering</option>
                  <option value="Management">Management</option>
                  <option value="Humanities">Humanities</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Email Address *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="faculty@college.edu"
                  required
                  disabled={loading}
                />
              </div>
              
              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+91 9876543210"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Hire Date</label>
              <input
                type="date"
                name="hire_date"
                value={formData.hire_date}
                onChange={handleInputChange}
                disabled={loading}
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? '⏳ Adding...' : '➕ Add Faculty Member'}
              </button>
              <button type="button" onClick={resetForm} className="cancel-btn" disabled={loading}>
                ❌ Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Faculty Table */}
      <div className="table-container">
        <table className="faculty-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Department</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Hire Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {faculty.map((member) => (
              <tr key={member.faculty_id}>
                <td className="faculty-id">#{member.faculty_id}</td>
                <td className="faculty-name">
                  <span 
                    className="faculty-name-link"
                    onClick={() => handleViewTeacherDetails(member)}
                    title="Click to view teacher details and records"
                  >
                    {member.faculty_name} 👁️
                  </span>
                </td>
                <td className="department">{member.dept_name}</td>
                <td className="email">{member.email}</td>
                <td className="phone">{member.phone || 'N/A'}</td>
                <td className="hire-date">
                  {member.hire_date ? new Date(member.hire_date).toLocaleDateString('en-IN') : 'N/A'}
                </td>
                <td className="actions">
                  <button
                    onClick={() => handleDeleteFaculty(member.faculty_id, member.faculty_name)}
                    className="delete-btn"
                    title="Delete faculty member"
                    disabled={loading}
                  >
                    {loading ? '⏳' : '🗑️ Delete'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {faculty.length === 0 && !loading && (
        <div className="no-data">
          <p>No faculty members found.</p>
          <p>Click "Add New Faculty" to add the first faculty member.</p>
        </div>
      )}
    </div>
  );
};

export default FacultyList;