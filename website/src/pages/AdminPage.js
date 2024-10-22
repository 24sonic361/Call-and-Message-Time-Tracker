import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/AdminPage.css';

const initialUsers = [
  { id: 1, name: 'Ice', enabled: true },
  { id: 2, name: 'Billy', enabled: false },
  { id: 3, name: 'Tagi', enabled: true },
  { id: 4, name: 'Yijin', enabled: false }
];

const AdminPage = () => {
  const [users, setUsers] = useState(initialUsers);

  // Function to handle the toggle switch
  const handleToggle = (id) => {
    setUsers(users.map(user => 
      user.id === id ? { ...user, enabled: !user.enabled } : user
    ));
  };

  return (
    <div className="admin-page-container">
      {/* Sidebar */}
      <div className="sidebar">
        <h2 className="law-firm-title">LAW FIRM</h2>
        <nav className="menu">
          <ul>
            <li className="menu-item">
              <Link to="/" className="menu-link">Call / Msg Tracking</Link>
            </li>
            <li className="menu-item">
              <Link to="/admin" className="menu-link">Admin</Link>
            </li>
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <h1>Admin - User Management</h1>
        
        <table className="admin-table">
          <thead>
            <tr>
              <th>User Name</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>
                  <label className="switch">
                    <input 
                      type="checkbox" 
                      checked={user.enabled} 
                      onChange={() => handleToggle(user.id)} 
                    />
                    <span className="slider"></span>
                  </label>
                  {user.enabled ? 'Enabled' : 'Disabled'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminPage;
