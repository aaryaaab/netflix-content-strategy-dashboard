import React from 'react';
import Dashboard from './components/Dashboard';

function App() {
  return (
    <div className="app-container">
      <header className="main-header">
        <div className="logo-text">
          NETFLIX <span>Content Strategy</span>
        </div>
      </header>
      
      <div className="project-overview">
        <h2>Strategic Content Dashboard</h2>
        <p>
          This dashboard analyzes Netflix content trends to support strategic decisions. 
          It provides insights into content growth, genre distribution, and performance differences 
          between Movies and TV Shows.
        </p>
      </div>

      <main className="dashboard-content">
        <Dashboard />
      </main>
    </div>
  );
}

export default App;
