import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { register } from '../features/user';
import NavbarComponent from './include/Navbar';
import { Navigate } from 'react-router-dom';
import M from 'materialize-css';
import '../styles/Register.css'

function Register() {
    const dispatch = useDispatch();
    const { registered, } = useSelector(state => state.user);
    const [registerError, setRegisterError] = useState('');
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        password2: '',
    })
    useEffect(() => {
        M.AutoInit();
    }, []);

    const { username, email, password, password2 } = formData;

    const onChange = e => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const onSubmit = e => {
        e.preventDefault();
        dispatch(register({ username, email, password, password2 }))
            .then(data => {
                if (data.meta.requestStatus === 'rejected') {
                    const errors = Object.values(data.payload).flat();
                    setRegisterError(errors.join(' '));
                    errors.forEach(error => {
                        M.toast({
                            html: error,
                            classes: 'red rounded',
                            displayLength: 10000
                        });
                    })
                } else {
                    M.toast({
                        html: "Successfully registered",
                        classes: 'green rounded',
                        displayLength: 5000
                    });
                }
            })
            .catch(error => {
                console.error('Login error:', error);
            });
    };

    if (registered) return <Navigate to='/login' />;

    var url = process.env.PUBLIC_URL

    return (
        <div className="register-container">
            <div className="register-card">
                <div className="center">
                    <a href="/" className="brand-logo">
                        <img className="img-logo" src={`${url}/logo-world.svg`} alt="Web GIS Logo" height={100} />
                    </a>
                </div>
                <div className="register-form-container">
                    <div className="register-title">Cadastro</div>
                    <form onSubmit={onSubmit}>
                        <div className='input-field'>

                            <input
                                type='text'
                                name='username'
                                id='username'
                                placeholder='Usuário'
                                value={username}
                                onChange={onChange}
                            />
                        </div>
                        <div className='input-field'>

                            <input
                                type='email'
                                name='email'
                                id='email'
                                placeholder='Email'
                                value={email}
                                onChange={onChange}
                            />
                        </div>
                        <div className='input-field'>

                            <input
                                type='password'
                                name='password'
                                id='password'
                                placeholder='Senha'
                                value={password}
                                onChange={onChange}
                            />
                        </div>
                        <div className='input-field'>

                            <input
                                type='password'
                                name='password2'
                                id='password2'
                                placeholder='Confirmar senha'
                                value={password2}
                                onChange={onChange}
                            />
                        </div>
                        {registerError && <p style={{ color: 'red' }}>{registerError}</p>}
                        <div className="center">
                            <button className="waves-effect waves-light btn red rounded-button" type="submit">Criar conta</button>
                        </div>
                        <div className="section center">
                            Já tem uma conta? <a href="/login">Entrar</a>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Register;