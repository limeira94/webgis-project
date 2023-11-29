// import React from 'react';
import React, { useState,useEffect } from 'react';
import NavbarComponent from './include/Navbar';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { 
  // Navigate,
  useNavigate 
} from 'react-router-dom';
import { useDispatch } from 'react-redux';
import M from 'materialize-css';

const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/'

function ResetPassword() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    
    const { isAuthenticated, user, loading } = useSelector(state => state.user);
    
    useEffect(() => {
      // Initialize Materialize CSS toast
      M.AutoInit();
    }, []);

    const handleSendEmailReset = async (event) => {

        event.preventDefault();
        
        const formData = new FormData();
        formData.append('email', email);
    
        try {
        const response = await axios.post(
            `${API_URL}api/users/reset-password/`,
            formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            }
        );
        M.toast({html: "An email will be sent to your address, please, check your inbox.", 
        classes: 'green rounded',
        displayLength:5000});

        console.log(response.data);
        navigate("/");

        } catch (error) {
        console.error(error);
        }
};

    // if (!isAuthenticated && !loading && user === null)
    //   return <Navigate to='/login'/>;

    return (
        <>
          <NavbarComponent />
          <div className='container'>
            <form onSubmit={handleSendEmailReset} >
                <label>Provide your email</label>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />

                <button type="submit" className='btn '>Send to email</button>
            </form>
            
          </div>
          
          
        </>
      );
    }

export default ResetPassword;
