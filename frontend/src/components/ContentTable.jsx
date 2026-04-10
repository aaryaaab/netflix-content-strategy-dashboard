import React from 'react';
import './ContentTable.css';

const ContentTable = ({ data, isLoading, page, totalPages, onPageChange }) => {
  return (
    <div className="content-table-container">
      <div className="table-header">
        <h3>Recent Additions</h3>
      </div>
      
      <div style={{ overflowX: 'auto' }}>
        <table className="styled-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Type</th>
              <th>Release Year</th>
              <th>Rating</th>
              <th>Duration</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '40px' }}>Loading data...</td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '40px' }}>No data available</td>
              </tr>
            ) : (
              data.map((item, i) => (
                <tr key={item.show_id || i}>
                  <td style={{ fontWeight: 500 }}>{item.title}</td>
                  <td>
                    <span className={`badge ${item.type === 'Movie' ? 'badge-movie' : 'badge-tv'}`}>
                      {item.type}
                    </span>
                  </td>
                  <td>{item.release_year}</td>
                  <td>{item.rating}</td>
                  <td>{item.duration}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {!isLoading && data.length > 0 && (
        <div className="table-pagination">
          <button 
            className="btn-page" 
            disabled={page === 1} 
            onClick={() => onPageChange(page - 1)}
          >
            Previous
          </button>
          <span className="page-info">Page {page} of {totalPages}</span>
          <button 
            className="btn-page" 
            disabled={page === totalPages} 
            onClick={() => onPageChange(page + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default ContentTable;
