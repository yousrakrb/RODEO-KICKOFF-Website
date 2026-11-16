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

            <div className="footer-legal">
                <p className="footer-privacy">
                    All data collected is strictly confidential and protected under AIESEC data privacy regulations.
                </p>
                <p className="footer-copyright">
                    © 2026 AIESEC in Constantine.
                </p>
            </div>
        </footer>
    );
}