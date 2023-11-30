import React, { useState,useEffect } from 'react';
import NavbarComponent from './include/Navbar';
import { useSelector } from 'react-redux';
import { 
  useNavigate 
} from 'react-router-dom';
import { useDispatch } from 'react-redux';
import M from 'materialize-css';

function NewProject() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [confirmDelete, setConfirmDelete] = useState(false);
    const { isAuthenticated, user, loading } = useSelector(state => state.user);
    
    useEffect(() => {
      M.AutoInit();
    }, []);


    return (
        <>
          <NavbarComponent />
          
        </>
      );
    }

export default NewProject;
