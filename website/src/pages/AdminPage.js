import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import Sidebar from '../components/Sidebar';
import '../styles/AdminPage.css';
import Swal from 'sweetalert2';

const AdminPage = () => {
  const [users, setUsers] = useState([]); // State to hold user data
  const [showForm, setShowForm] = useState(false); // State to control the visibility of the form
  const [newUser, setNewUser] = useState({ name: '', phone: '', pin: '' }); // State for new user input

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

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!newUser.name || !newUser.phone || !newUser.pin) return;
  
    const { error } = await supabase
      .from('users')
      .insert([{
        name: newUser.name,
        phone_number: newUser.phone,
        pin: newUser.pin,
        enabled: true
      }]);
  
    if (!error) {
      setNewUser({ name: '', phone: '', pin: '' });
      setShowForm(false);
      fetchUsers();
  
      // SweetAlert success
      Swal.fire({
        icon: 'success',
        title: 'User Added!',
        text: 'The new user has been added successfully.',
        background: '#fdf7ff',
        color: '#4a235a',
        confirmButtonColor: '#a675b0',
        confirmButtonText: 'OK'
      });
    } else {
      console.error('Error adding user:', error);
  
      // Optional error alert
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to add user. Please try again.',
        confirmButtonColor: '#a675b0'
      });
    }
  };
  

  return (
    <div className="admin-container">
      <Sidebar />

      <main className="main-section">
        <div className="page-title-area">
          <h1 className="page-title">Admin - User Management</h1>
          <button className="add-user-button" onClick={() => setShowForm(true)}>
            Add User
          </button>
        </div>

        {showForm && (
          <div className="form-popup">
            <form className="popup-form" onSubmit={handleAddUser}>
              <h3>Add New User</h3>
              <input
                type="text"
                placeholder="Name"
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                required
              />
              <input
                type="tel"
                placeholder="Phone Number"
                value={newUser.phone}
                onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                required
              />
              <input
                type="password"
                placeholder="PIN"
                value={newUser.pin}
                onChange={(e) => setNewUser({ ...newUser, pin: e.target.value })}
                required
              />
              <div className="form-actions">
                <button type="submit">Add</button>
                <button type="button" onClick={() => setShowForm(false)}>Cancel</button>
              </div>
            </form>
          </div>
        )}

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
