import './App.css';
import { BrowserRouter, Route, Router, Routes } from 'react-router-dom';
import Login from './components/Login/login';
import Home from './components/HomePage/home';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/search" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
