import './App.css';
import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import Home from './components/Homepage';
import Map from './components/Map';
import Login from "./components/Login"
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import ResetPassword from './components/ResetPassword';
import Project from './components/Project';
import NewProject from './components/NewProject';
import About from './components/About';

// import Upload from './components/Upload'

import { checkAuth } from './features/user';

function App() {
  const [
    cookies, 
    // setCookie
  ] = useCookies(['access_token', 'refresh_token'])

  const dispatch = useDispatch();
  
  useEffect(() => {
    dispatch(
      checkAuth(cookies.refresh_token)
      ).catch((error) => {
      if (error.message !== '400') {
        console.error('Error:', error);
      }
    });
  }, [dispatch]);

  return (
    <Router>
      <Routes>
        <Route path="/" exact element={<Home />} />
        <Route path="/map" exact element={<Map />} />
        <Route path="/login" exact element={<Login />} />
        {/* <Route path="/map2" exact element={<Map2 />} /> */}
        
        {/* <Route path="/upload-file" exact element={<UploadMap />} /> */}
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/reset" element={<ResetPassword />}/>
        <Route path="/project" element={<Project />}/>
        <Route path="/project/:project_id" element={<Project />} />
        <Route path="/new-project" element={<NewProject />}/>
        <Route path="/about" element={<About/>}/>

      </Routes>
    </Router>
  );
}

export default App;