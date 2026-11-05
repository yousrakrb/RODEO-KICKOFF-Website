// src/App.jsx
import { Routes, Route, Outlet } from 'react-router-dom';
import './App.css';
import Hero from './sections/Hero/Hero';
import Countdown from './sections/Countdown/Countdown';
import CanyonMap from './sections/CanyonMap/CanyonMap';
import ApplySuitcase from './sections/ApplySuitcase/ApplySuitcase';
import Footer from './sections/Footer/Footer';
import RegistrationPage from './sections/Registration/RegistrationPage';
import CanyonSuitcase from './sections/Suitcase/Canyonsuitcase';
import PreOrder from './sections/Preorder/Preorder';
import GearComingSoon from './sections/GearComingSoon/GearComingSoon';
import Navbar from './components/Navbar/Navbar';
import { useSmoothScroll } from './hooks/useSmoothScroll';

function Layout() {
  useSmoothScroll();

  return (
    <>
      <Navbar />
      <Outlet />
    </>
  );
}

function LandingPage() {
  return (
    <>
      <div className="fixed-background" />
      <main className="content">
        <Hero />
        <Countdown />
        <CanyonMap />
        <ApplySuitcase />
        <CanyonSuitcase />
        <Footer />
      </main>
    </>
  );
}

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/apply" element={<RegistrationPage />} />
        <Route path="/gear" element={<GearComingSoon />} />
        <Route path="/preorder" element={<PreOrder />} />
      </Route>
    </Routes>
  );
}

export default App;