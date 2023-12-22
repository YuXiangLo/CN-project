import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import SearchContext from './SearchContext';
import LoginForm from './LoginForm';
import MainPage from './MainPage';
import VideoPage from './VideoPage';
import SearchBar from './SearchBar';
import Cookies from 'js-cookie';

function AppWrapper() {
  const navigate = useNavigate();

  const handleLogout = () => {
    Cookies.remove('userToken');
    navigate('/');
  };

  const userData = Cookies.get('userToken');

  return (
    <>
      {userData && <SearchBar data={userData} handleLogout={handleLogout} navigate={navigate} />}
      <Routes>
        <Route path="/" element={<LoginForm />} />
        <Route path="/main" element={<MainPage />} />
        <Route path="/video" element={<VideoPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

function App() {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <Router>
      <div className="App">
        <SearchContext.Provider value={{ searchTerm, setSearchTerm }}>
          <AppWrapper />
        </SearchContext.Provider>
      </div>
    </Router>
  );
}

export default App;
