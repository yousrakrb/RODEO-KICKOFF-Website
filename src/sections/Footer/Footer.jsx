import './Footer.css';

export default function Footer() {
    return (
        <footer className="site-footer">
            <div className="footer-logos">
                <img
                    src="/assets/Footer/Constantine.png"
                    alt="AIESEC in Constantine"
                    className="footer-logo footer-logo-aiesec"
                />

                <img
                    src="/assets/Footer/RODEO LOGO.png"
                    alt="RODEO KICKOFF"
                    className="footer-logo footer-logo-rodeo"
                />

                <img
                    src="/assets/Footer/Miras.png"
                    alt="Miras"
                    className="footer-logo footer-logo-miras"
                />
            </div>
        </footer>
    );
}