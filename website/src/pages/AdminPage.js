import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/AdminPage.css';
import { supabase } from '../supabaseClient'; // Import supabase client

const AdminPage = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    const { data, error } = await supabase
      .from('users') // Assume Table is named 'users'
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching users:', error.message);
    } else {
      setUsers(data);
    }
  }

  const handleToggle = async (id, currentEnabled) => {
    const { error } = await supabase
      .from('users')
      .update({ enabled: !currentEnabled })
      .eq('id', id);

    if (error) {
      console.error('Error updating user status:', error.message);
    } else {
      // Update local state after successful update
      setUsers(users.map(user => 
        user.id === id ? { ...user, enabled: !currentEnabled } : user
      ));
    }
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
            {users.length === 0 ? (
              <tr>
                <td colSpan="2">No user data available</td>
              </tr>
            ) : (
              users.map((user) => ( 
                <tr key={user.id}> 
                  <td>{user.name}</td>
                  <td>
                    <label className="switch">
                      <input 
                        type="checkbox" 
                        checked={user.enabled} 
                        onChange={() => handleToggle(user.id, user.enabled)} 
                      />
                      <span className="slider"></span>
                    </label>
                    {user.enabled ? 'Enabled' : 'Disabled'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminPage;
