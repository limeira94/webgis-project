import React, { 
    // useEffect, 
    useState 
} from "react";
// import { Navigate} from 'react-router-dom';
import { useNavigate } from "react-router-dom";
import Navbar from './include/Navbar';
import M from 'materialize-css';
import './Login.css'
import { 
  useDispatch, 
  // useSelector 
} from 'react-redux';
import {
  // resetRegistered,
  login
} from '../features/user';

const Login = () => {
    const [formData,setFormData] = useState({
        username:'',
        password:'',
    });
    const dispatch = useDispatch();
    const navigate = useNavigate();
    
    const onSubmit = e => {
      e.preventDefault();
      dispatch(login(formData))
        .then(data => {
          if (data.meta.requestStatus==='rejected') {
            M.toast(
              {html: "Login failed", 
               classes: 'red rounded',
               displayLength:5000});
          } else {
            M.toast(
              {html: "Login sucessful", 
               classes: 'green rounded',
               displayLength:5000});
            navigate("/");
          }        
        })
        .catch(error => {
          console.error('Login error:', error);
        });
    };

    const onChange = e => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };
    var url = process.env.PUBLIC_URL

    return (
    <>
      
      <div className="center overlay room-login ">
        <div className="row login-position centered-element back-color"  >
        <div className='center'>
              <a href="/" className="brand-logo">
                <img className="img-logo" src={url + "/logo.png"} alt="Web GIS Logo" height={100} />
              </a>
            </div>
          
        
        <div className="center white-text">
          <h4>
              <b>Login</b>
          </h4>
        </div>
        

          <form className="col s12" onSubmit={onSubmit}>
            <div className='row'>
              <div className='col s12'></div>
            </div>

            <div className='row'>
            {/* <label htmlFor='email'>Username</label> */}
              <div className='input-field col s12'>
                <input className='validate' type='text' name='username' id='username' onChange={onChange}/>
                <label htmlFor='email'>Type your username</label>
              </div>
            </div>

            <div className='row'>
            {/* <label htmlFor='password'>Password</label> */}
              <div className='input-field col s12'>
                <input className='validate' type='password' name='password' id='password' onChange={onChange}/>
                <label htmlFor='password'>Type your password</label>
              </div>
        <label className="label-forgot">
          <a className='pink-text' href='/reset'><b>Forgot Password?</b></a>
        </label>
        <p><a className='white-text left' href='/register'>Don't have an account? <b>Register</b> now!</a></p>
            </div>
            <br/>
              <div className='row'>
                <button type='submit' className='col s12 btn btn-large waves-effect login-button'>Login</button>
              </div>
          </form>
          <div className="row">
            <a href="/" className="col s12 btn btn-large waves-effect home-button ">Homepage</a>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
