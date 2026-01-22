import { useState, useEffect } from 'react';
import Home from './pages/Home';
import Choice from './pages/Choice';
import Admin from './pages/Admin';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState(() => {
    // Restore page on load based on user's stored data
    const participantId = localStorage.getItem('participantId');
    const adminRoomId = localStorage.getItem('adminRoomId');
    
    if (participantId && localStorage.getItem('roomCode')) {
      return 'choice';
    } else if (adminRoomId && localStorage.getItem('adminRoomCode')) {
      return 'admin';
    }
    return 'home';
  });
  const [pageProps, setPageProps] = useState({});

  const navigateTo = (page, props = {}) => {
    setCurrentPage(page);
    setPageProps(props);
  };

  return (
    <>
      {currentPage === 'home' && <Home navigate={navigateTo} />}
      {currentPage === 'choice' && <Choice navigate={navigateTo} {...pageProps} />}
      {currentPage === 'admin' && <Admin navigate={navigateTo} {...pageProps} />}
    </>
  );
}

export default App;
