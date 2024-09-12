import React, {
  useState
} from "react";
import { useNavigate } from "react-router-dom";
import Navbar from './include/Navbar';
import M from 'materialize-css';
import '../styles/Login.css'
import {
  useDispatch
} from 'react-redux';
import {
  login
} from '../features/user';


const GoogleLoginButton = <>
  <button className="gsi-material-button">
    <div className="gsi-material-button-state"></div>
    <div className="gsi-material-button-content-wrapper">
      <div className="gsi-material-button-icon">
        <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style={{ display: 'block' }}>
          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
          <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
          <path fill="none" d="M0 0h48v48H0z"></path>
        </svg>
      </div>
      <span className="gsi-material-button-contents">Sign in with Google</span>
      <span style={{ display: 'none' }}>Sign in with Google</span>
    </div>
  </button>

</>

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [hover, setHover] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const onSubmit = e => {
    e.preventDefault();
    dispatch(login(formData))
      .then(data => {
        if (data.meta.requestStatus === 'rejected') {
          const errors = Object.values(data.payload).flat();
          errors.forEach(error => {
            M.toast({
              html: error,
              classes: 'red rounded',
              displayLength: 10000
            });
          })
        } else {
          M.toast(
            {
              html: "Login successful",
              classes: 'green rounded',
              displayLength: 5000
            });
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

  var url = process.env.PUBLIC_URL;

  return (
    <div className="login-container">
      <div className="login-title">Entrar na plataforma</div>
      <div className="login-card">
        <div
          className="login-image"
          style={{
            backgroundImage: hover
              ? `url('${url}/map_login.svg')`
              : `url('${url}/map_login2.svg')`
          }}
        ></div>
        <div className="login-form-container">
          <form onSubmit={onSubmit}>
            <div className='input-field'>
              <img
                src={`${url}/icon_login.svg`}
                alt="Username Icon"
              />
              <input
                type='text'
                name='username'
                id='username'
                placeholder=' Usuário'
                onChange={onChange}
              />
            </div>

            <div className='input-field'>
              <img
                src={`${url}/icon_password.svg`}
                alt="Password Icon"
              />
              <input
                type='password'
                name='password'
                id='password'
                placeholder=' Senha'
                onChange={onChange}
              />
            </div>

            <div className="login-links">
              <a href='/register'>Crie sua conta!</a>
              <a href='/reset'>Esqueceu a senha?</a>
            </div>

            <button
              type='submit'
              className='login-button'
              onMouseEnter={() => setHover(true)}
              onMouseLeave={() => setHover(false)}
            >
              Entrar
            </button>
            {/* <button
              className='login-google-button'
            >
              Login with Google
            </button>
            {GoogleLoginButton} */}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;

// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { Button, TextField, Card, Typography, Box, Link } from '@mui/material';
// import { useDispatch } from 'react-redux';
// import { login } from '../features/user';
// import '../styles/Login.css';

// const Login = () => {
//   const [formData, setFormData] = useState({
//     username: '',
//     password: '',
//   });
//   const [hover, setHover] = useState(false);
//   const dispatch = useDispatch();
//   const navigate = useNavigate();

//   const onSubmit = e => {
//     e.preventDefault();
//     dispatch(login(formData))
//       .then(data => {
//         if (data.meta.requestStatus === 'rejected') {
//           const errors = Object.values(data.payload).flat();
//           errors.forEach(error => {
//             // MUI Snackbar or Alert can be used instead of Materialize's toast
//             console.error(error);
//           });
//         } else {
//           console.log("Login successful");
//           navigate("/");
//         }
//       })
//       .catch(error => {
//         console.error('Login error:', error);
//       });
//   };

//   const onChange = e => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   var url = process.env.PUBLIC_URL;

//   return (
//     <Box className="login-container">
//       <Typography variant="h3" className="login-title">Entrar na plataforma</Typography>
//       <Card className="login-card">
//         <Box
//           className="login-image"
//           style={{
//             backgroundImage: hover
//               ? `url('${url}/map_login.svg')`
//               : `url('${url}/map_login2.svg')`
//           }}
//         ></Box>
//         <Box className="login-form-container">
//           <form onSubmit={onSubmit}>
//             <TextField
//               fullWidth
//               variant="outlined"
//               label="Usuário"
//               name="username"
//               onChange={onChange}
//               margin="normal"
//             />
//             <TextField
//               fullWidth
//               variant="outlined"
//               label="Senha"
//               name="password"
//               type="password"
//               onChange={onChange}
//               margin="normal"
//             />

//             <Box className="login-links">
//               <Link href='/register'>Crie sua conta!</Link>
//               <Link href='/reset'>Esqueceu a senha?</Link>
//             </Box>

//             <Button
//               variant="contained"
//               color="primary"
//               fullWidth
//               className="login-button"
//               onMouseEnter={() => setHover(true)}
//               onMouseLeave={() => setHover(false)}
//               type="submit"
//             >
//               Entrar
//             </Button>
//           </form>
//         </Box>
//       </Card>
//     </Box>
//   );
// };

// export default Login;
