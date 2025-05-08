import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../AuthProvider';
import '../styles/AdminPage.css';
import Swal from 'sweetalert2';

const AdminPage = () => {
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newUser, setNewUser] = useState({ firstname: '', lastname: '', phone: '', pincode: '' });
  const { currentUser } = useAuth();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from('Clients')
      .select('*')
      .order('firstname', { ascending: true });

    if (error) {
      console.error('Error fetching users:', error);
    } else {
      setUsers(data);
    }
  };

  const handleToggle = async (clid, currentStatus) => {
    console.log(`Toggling user ${clid} from ${currentStatus} to ${currentStatus === 'enabled' ? 'disabled' : 'enabled'}`);
    const newStatus = currentStatus === 'enabled' ? 'disabled' : 'enabled';
    const { error } = await supabase
      .from('Clients')
      .update({ status: newStatus })
      .eq('clid', clid);

    if (!error) {
      setUsers(users.map(u => u.clid === clid ? { ...u, status: newStatus } : u));
    } else {
      console.error('Error updating status:', error);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!newUser.firstname || !newUser.lastname || !newUser.phone || !newUser.pincode) return;
    if (!/^\d{4}$/.test(newUser.pincode)) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid PIN',
        text: 'PIN must be a 4-digit number.',
        confirmButtonColor: '#a675b0'
      });
      return;
    }

    const currentTime = new Date();
    const adminEmail = String(currentUser.email || 'Admin');
    const { error } = await supabase
      .from('Clients')
      .insert([{
        firstname: newUser.firstname,
        lastname: newUser.lastname,
        phonenumber: newUser.phone,
        pincode: newUser.pincode,
        createdby: adminEmail,
        modifiedby: adminEmail,
        createdon: currentTime,
        modifiedon: currentTime,
        status: 'enabled'
      }]);

    if (!error) {
      setNewUser({ firstname: '', lastname: '', phone: '', pincode: '' });
      setShowForm(false);
      fetchUsers();

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
                placeholder="First Name"
                value={newUser.firstname}
                onChange={(e) => setNewUser({ ...newUser, firstname: e.target.value })}
                required
              />
              <input
                type="text"
                placeholder="Last Name"
                value={newUser.lastname}
                onChange={(e) => setNewUser({ ...newUser, lastname: e.target.value })}
                required
              />
              <input
                type="text"
                placeholder="Phone Number"
                value={newUser.phone}
                onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                required
              />
              <input
                type="text"
                placeholder="4-Digit PIN"
                value={newUser.pincode}
                onChange={(e) => setNewUser({ ...newUser, pincode: e.target.value })}
                pattern="[0-9]{4}"
                maxLength="4"
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
                <th>Phone</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr><td colSpan="3" className="empty-message">No user data available</td></tr>
              ) : (
                users.map(user => (
                  <tr key={user.clid}>
                    <td>{user.firstname} {user.lastname}</td>
                    <td>{user.phonenumber}</td>
                    <td>
                      <label className="switch">
                        <input
                          type="checkbox"
                          checked={user.status === 'disabled'}
                          onChange={() => handleToggle(user.clid, user.status)}
                          style={{ position: 'relative', zIndex: 10 }}
                        />
                        <span className="slider" />
                      </label>
                      <span className={`status-label ${user.status === 'enabled' ? 'enabled' : 'disabled'}`}>
                        {user.status === 'enabled' ? 'Enabled' : 'Disabled'}
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