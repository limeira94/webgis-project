// import React from 'react';
import React, { useState,useEffect } from 'react';
import NavbarComponent from './include/Navbar';
import { useSelector } from 'react-redux';
import { 
  Navigate,
  // useNavigate 
} from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { deleteUser,logout } from '../features/user';
import M from 'materialize-css';

function Dashboard() {
    const dispatch = useDispatch();
    const [confirmDelete, setConfirmDelete] = useState(false);
    
    const { isAuthenticated, user, loading } = useSelector(state => state.user);
    
    useEffect(() => {
      // Initialize Materialize CSS toast
      M.AutoInit();
    }, []);
    
    const handleDeleteUser = () => {
      if (confirmDelete) {
        M.toast({ html: 'User deleted successfully' });
        dispatch(deleteUser(user.id))
          .unwrap()
          .then(() => {
            console.log('User deleted successfully');
            
            // Redirect to the homepage
            // return <Navigate to='/' />;
          })
          .catch((error) => {
            console.log('Error deleting user:', error);
          });
          dispatch(logout());
      } else {
        setConfirmDelete(true);
      }
    };

    // if (!isAuthenticated && !loading && user === null)
    //   return <Navigate to='/login'/>;

    return (
        <>
          <NavbarComponent />
          {loading || user === null ? (
            <div className='spinner-border text-primary' role='status'>
              <span className='visually-hidden'>Loading...</span>
            </div>
          ) : (
            <div className='container'>
              <h1 className='mb-5 center'>Dashboard</h1>
              <div className='card'>
                <div className='card-body'>
                  <h5 className='card-title center'>User Details</h5>
                  <div className='row'>
                    <div className='col-2'>Username:</div>
                    <div className='col'>{user.username}</div>
                  </div>
                  <div className='row'>
                    <div className='col-2'>Email:</div>
                    <div className='col'>{user.email}</div>
                  </div>
                </div>
              </div>
              {!confirmDelete ? (
              <button className='btn btn-primary mt-3' onClick={() => setConfirmDelete(true)}>
                Delete User
              </button>
            ) : (
              <>
                <p>Are you sure you want to delete this user? All your requests will be lost forever.</p>
                <button className='btn btn-danger mt-3' onClick={handleDeleteUser}>
                  Yes
                </button>
                <button className='btn btn-secondary mt-3' onClick={() => setConfirmDelete(false)}>
                  No
                </button>
              </>
            )}
            </div>
          )}
        </>
      );
    }

export default Dashboard;
