import { Link } from 'react-router-dom';
import './GearBanner.css';

export default function GearBanner() {
  return (
    <section className="gear-banner-section" aria-label="Get your gear">
      <Link to="/preorder" className="gear-banner-link">
        <img
          src="/assets/pre-order/Gear.png"
          alt="Get your Gear now!!"
          className="gear-banner-img"
        />
      </Link>
    </section>
  );
}