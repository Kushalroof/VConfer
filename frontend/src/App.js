import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/landing';
import Authentication from './pages/authentication';
import SignUpSide from './pages/signup';
import { AuthProvider } from './contexts/authContext';
import VideoMeetComponent from './pages/VideoMeet';
import History from './pages/history';
import HomeComponent from './pages/home';

function App() {
  return (
    <>
      <Router>
      <AuthProvider>
      <Routes>
        <Route path="/" element ={<Landing/>}/>
        <Route path='/auth' element={<Authentication/>}/>
        <Route path='/signup' element={<SignUpSide/>}/>
        <Route path= '/home' element={<HomeComponent/>}/>
        <Route path="/history" element={<History/>}/>
        <Route path="/:url" element={<VideoMeetComponent/>}/>
      </Routes>
      </AuthProvider>
      </Router>
    </>
  );
}

export default App;
