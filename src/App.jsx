// src/App.jsx
import { Routes, Route, Outlet } from 'react-router-dom';
import './App.css';
import Hero from './sections/Hero/Hero';
import Countdown from './sections/Countdown/Countdown';
import CanyonMap from './sections/CanyonMap/CanyonMap';
import Footer from './sections/Footer/Footer';
import RegistrationPage from './sections/Registration/RegistrationPage';
import PreOrder from './sections/Preorder/Preorder';
import ProductDetail from './sections/Preorder/ProductDetail';
import Navbar from './components/Navbar/Navbar';
import { useSmoothScroll } from './hooks/useSmoothScroll';
import CanyonSuitcase from './sections/Suitcase/Canyonsuitcase';
import GearBanner from './sections/GearBanner/GearBanner';
import MusicPlayer from './components/MusicPlayer/MusicPlayer';

const SHEET_URL = "https://script.google.com/macros/s/AKfycbwRs-uIq35mOa9U04sI2DK4612Jkt7-WNf0L28YHALXVWNnvVb9ygjdhZIOwI4bcWSN/exec";

function Layout() {
  useSmoothScroll();

  return (
    <>
      <Navbar />
      <MusicPlayer />
      <Outlet />
      <Footer />
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
        <CanyonSuitcase />
        <GearBanner />
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
        <Route
          path="/preorder"
          element={<PreOrder sheetUrl={"https://script.google.com/macros/s/AKfycbwRs-uIq35mOa9U04sI2DK4612Jkt7-WNf0L28YHALXVWNnvVb9ygjdhZIOwI4bcWSN/exec"} logoUrl="/assets/invoice/aiesec-logo.png" />}
        />
        <Route path="/preorder/:productId" element={<ProductDetail />} />
      </Route>
    </Routes>
  );
}

export default App;