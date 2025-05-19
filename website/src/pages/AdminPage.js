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
  const [editingUser, setEditingUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const { currentUser } = useAuth();
  const adminEmail = String(currentUser.email || 'Admin');
  const itemsPerPage = 10;

  //display all users right when the page is triggered
  useEffect(() => {
    fetchUsers();
  }, []);

  // Fetch all clients
  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from('Clients')
      .select('*')
      .order('firstname', { ascending: true });

    if (error) {
      console.error('Error fetching users:', error);
    } else {
      setUsers(data);
      setCurrentPage(1); // Reset to page 1 when data is refreshed
    }
  };

  // Update a client status
  const handleToggle = async (clid, currentStatus) => {
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

  // Add new client
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

  // Update a client information (beside status)
  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!editingUser.firstname || !editingUser.lastname || !editingUser.phonenumber || !editingUser.pincode) return;
    if (!/^\d{4}$/.test(editingUser.pincode)) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid PIN',
        text: 'PIN must be a 4-digit number.',
        confirmButtonColor: '#a675b0'
      });
      return;
    }

    //compare data (only update modified field)
    const originalUser = users.find(u => u.clid === editingUser.clid);
    const updates = {};
    if (editingUser.firstname !== originalUser.firstname) updates.firstname = editingUser.firstname;
    if (editingUser.lastname !== originalUser.lastname) updates.lastname = editingUser.lastname;
    if (editingUser.phonenumber !== originalUser.phonenumber) updates.phonenumber = editingUser.phonenumber;
    if (editingUser.pincode !== originalUser.pincode) updates.pincode = editingUser.pincode;
    updates.modifiedby = adminEmail;

    if (Object.keys(updates).length > 0) {
      updates.modifiedby = String(currentUser.email || 'Admin');
      updates.modifiedon = new Date();
      const { error } = await supabase
        .from('Clients')
        .update(updates)
        .eq('clid', editingUser.clid);
      if (!error) {
        setEditingUser(null);
        fetchUsers();
        Swal.fire({
          icon: 'success',
          title: 'User Updated!',
          text: 'The user has been updated successfully.',
          background: '#fdf7ff',
          color: '#4a235a',
          confirmButtonColor: '#a675b0',
          confirmButtonText: 'OK'
        });
      } else {
        console.error('Error updating user:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to update user. Please try again.',
          confirmButtonColor: '#a675b0'
        });
      }
    } else {
      setEditingUser(null);
    }
  };

  // Delete a client
  const handleDeleteUser = async (clid) => {
    const result = await Swal.fire({
      title: 'Delete Confirmation',
      text: 'Do you want to delete this user?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#a675b0',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, Delete!',
      background: '#fdf7ff',
      color: '#4a235a'
    });

    if (result.isConfirmed) {
      const { error } = await supabase
        .from('Clients')
        .delete()
        .eq('clid', clid);
      if (!error) {
        fetchUsers();
        Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'The user has been deleted.',
          background: '#fdf7ff',
          color: '#4a235a',
          confirmButtonColor: '#a675b0'
        });
      } else {
        console.error('Error deleting user:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to delete user. Please try again.',
          confirmButtonColor: '#a675b0'
        });
      }
    }
  };

  //paging calculation logic
  const totalPages = Math.ceil(users.length / itemsPerPage);
  const paginatedUsers = users.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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

        {editingUser && (
          <div className="form-popup">
            <form className="popup-form" onSubmit={handleUpdateUser}>
              <h3>Update User</h3>
              <input
                type="text"
                placeholder="First Name"
                value={editingUser.firstname}
                onChange={(e) => setEditingUser({ ...editingUser, firstname: e.target.value })}
                required
              />
              <input
                type="text"
                placeholder="Last Name"
                value={editingUser.lastname}
                onChange={(e) => setEditingUser({ ...editingUser, lastname: e.target.value })}
                required
              />
              <input
                type="text"
                placeholder="Phone Number"
                value={editingUser.phonenumber}
                onChange={(e) => setEditingUser({ ...editingUser, phonenumber: e.target.value })}
                required
              />
              <input
                type="text"
                placeholder="4-Digit PIN"
                value={editingUser.pincode}
                onChange={(e) => setEditingUser({ ...editingUser, pincode: e.target.value })}
                pattern="[0-9]{4}"
                maxLength="4"
                required
              />
              <div className="form-actions">
                <button type="submit">Update</button>
                <button type="button" onClick={() => setEditingUser(null)}>Cancel</button>
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
                <th>Status (Switch to Disable)</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.length === 0 ? (
                <tr><td colSpan="4" className="empty-message">No user data available</td></tr>
              ) : (
                paginatedUsers.map(user => (
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
                    <td>
                      <button
                        className="action-icon"
                        onClick={() => setEditingUser({ ...user })}
                        title="Edit User"
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4a235a" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                      <button
                        className="action-icon"
                        onClick={() => handleDeleteUser(user.clid)}
                        title="Delete User"
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ff0000" strokeWidth="2">
                          <path d="M3 6h18" />
                          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                          <path d="M3 6v14c0 1 1 2 2 2h14c1 0 2-1 2-2V6" />
                          <path d="M10 11v6" />
                          <path d="M14 11v6" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <div className="pagination">
            <button
              className="pagination-button"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <span className="pagination-info">
              Page {currentPage} of {totalPages || 1}
            </span>
            <button
              className="pagination-button"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages || totalPages === 0}
            >
              Next
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminPage;