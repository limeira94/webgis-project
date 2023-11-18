import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { register } from '../features/user';
import NavbarComponent from './include/Navbar';
import { Navigate } from 'react-router-dom';

function Register() {
  const dispatch = useDispatch();
  const { registered,  } = useSelector(state => state.user);
  const [registerError, setRegisterError] = useState('');
  const [formData,setFormData] = useState({
        username: '',
        email: '',
        password: '',
        password2: '',
  })

  const { username,email,password,password2 } = formData;

  const onChange = e => {
    setFormData({...formData,[e.target.name]:e.target.value});
  };

  const onSubmit = e => {
        e.preventDefault();
        dispatch(register({username,email,password,password2}))
        .then(data=>{
          console.log(data);
          if (data.meta.requestStatus==='rejected') {
            setRegisterError(data.payload.username || data.payload.email || data.payload.error || data.payload.non_field_errors);
          } else {
            console.log("SUCESS")          
          }        
        })
        .catch(error => {
          console.log("ERROR",error);
          console.error('Login error:', error);
    });};

  if (registered) return <Navigate to='/login'/>;

  return (
    <>
      <NavbarComponent />
      <div className='container'>
      <h1>Register</h1>
      <form onSubmit={onSubmit}>
        <div>
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={onChange}
          />
        </div>
        <div>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={onChange}
          />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={onChange}
          />
        </div>
        <div>
          <label htmlFor="password2">Confirm Password</label>
          <input
            type="password"
            id="password2"
            name="password2"
            value={formData.password2}
            onChange={onChange}
          />
        </div>
        {registerError && <p style={{ color: 'red' }}>{registerError}</p>}
        <button type="submit">Register</button>
      </form>
    </div>
    </>
  );
}

export default Register;
