import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Homepage';
import Map from './components/Map';
import MapComponent from './components/MapComponent';
import UploadComponent from './components/UploadComponent';
import './Caixa.css';

// function App() {
//   return (
//     <Router>
//       <Routes>
//         <Route path="/" exact element={<Home />} />
//         <Route path="/map" exact element={<Map />} />
//       </Routes>
//     </Router>
//   );
// }

// export default App;

// function App() {
//   return (
//     <div className="App">
//       <h1>Visualizador de Mapa</h1>
//       <MapComponent />
//     </div>
//   );
// }

// export default App;


function App() {
  return (
    <div className="map-container">
      <MapComponent lat={-20} lon={-50} />
      <div className="caixa">
        <h1>Adicione seu arquivo geojson</h1>
        <UploadComponent />
      </div>
    </div>
  );
}

export default App;