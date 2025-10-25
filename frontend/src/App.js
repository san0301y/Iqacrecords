import React, { useState } from 'react';
import Navbar from './components/Navbar';
import FacultyList from './components/FacultyList';
import IqacRecords from './components/IqacRecords';
import TeacherEntry from './components/TeacherEntry';
import Leaderboard from './components/Leaderboard';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('faculty');
  const [selectedTeacher, setSelectedTeacher] = useState(null);

  // Handle when a teacher is selected from Faculty List
  const handleViewTeacherDetails = (teacher) => {
    setSelectedTeacher(teacher);
    setActiveTab('iqac'); // Automatically switch to IQAC records tab
  };

  // Handle when returning from IQAC records
  const handleBackToFaculty = () => {
    setSelectedTeacher(null);
    setActiveTab('faculty');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'faculty':
        return (
          <FacultyList 
            onViewTeacherDetails={handleViewTeacherDetails}
          />
        );
      case 'iqac':
        return (
          <IqacRecords 
            selectedTeacher={selectedTeacher}
            onBackToFaculty={handleBackToFaculty}
          />
        );
      case 'teacher':
        return <TeacherEntry />;
      case 'leaderboard':
        return <Leaderboard />;
      default:
        return <FacultyList onViewTeacherDetails={handleViewTeacherDetails} />;
    }
  };

  return (
    <div className="App">
      <Navbar activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="main-content">
        {renderContent()}
      </main>
    </div>
  );
}

export default App;