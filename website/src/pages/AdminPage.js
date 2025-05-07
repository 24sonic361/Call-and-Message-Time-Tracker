import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import Sidebar from '../components/Sidebar'; 
import '../styles/AdminPage.css';

const AdminPage = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('name', { ascending: true });

    if (error) console.error('Error fetching users:', error);
    else setUsers(data);
  };

  const handleToggle = async (id, current) => {
    const { error } = await supabase
      .from('users')
      .update({ enabled: !current })
      .eq('id', id);

    if (!error) {
      setUsers(users.map(u => u.id === id ? { ...u, enabled: !current } : u));
    }
  };

  return (
    <div className="admin-container">
      <Sidebar />

      <main className="main-section">
        <h1 className="page-title">Admin - User Management</h1>
        <div className="table-container">
          <table className="styled-table">
            <thead>
              <tr>
                <th>User Name</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr><td colSpan="2" className="empty-message">No user data available</td></tr>
              ) : (
                users.map(user => (
                  <tr key={user.id}>
                    <td>{user.name}</td>
                    <td>
                      <label className="switch">
                        <input
                          type="checkbox"
                          checked={user.enabled}
                          onChange={() => handleToggle(user.id, user.enabled)}
                        />
                        <span className="slider" />
                      </label>
                      <span className={`status-label ${user.enabled ? 'enabled' : 'disabled'}`}>
                        {user.enabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default AdminPage;
