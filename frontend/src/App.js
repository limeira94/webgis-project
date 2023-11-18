import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Homepage';
// import Map from './components/Map';
import Map from './components/Map2';
import Login from "./components/Login"
import Register from './components/Register';
import Dashboard from './components/Dashboard';
// import Upload from './components/Upload'

function App() {
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

      </Routes>
    </Router>
  );
}

export default App;