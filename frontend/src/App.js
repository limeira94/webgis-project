import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Homepage';
import Map from './components/Map';
// import Upload from './components/Upload'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" exact element={<Home />} />
        <Route path="/map" exact element={<Map />} />
        {/* <Route path="/upload-file" exact element={<UploadMap />} /> */}
      </Routes>
    </Router>
  );
}

export default App;