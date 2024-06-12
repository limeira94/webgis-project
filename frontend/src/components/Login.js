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
                placeholder='Usuário'
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
                placeholder='Senha'
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
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
