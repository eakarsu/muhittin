import { Link } from 'react-router-dom';

export default function PaymentCancel() {
  return (
    <div className="pub-page">
      <section className="pub-section pub-section-centered">
        <div className="pub-container pub-content-narrow pub-text-center">
          <div className="pub-status-icon pub-status-cancel">&#10005;</div>
          <h1 className="pub-section-title">Payment Cancelled</h1>
          <p className="pub-body-text">
            Your payment was cancelled. No charges have been made. If you have questions or
            encountered an issue, please do not hesitate to reach out.
          </p>
          <div className="pub-hero-ctas">
            <Link to="/" className="pub-btn pub-btn-primary">Back to Home</Link>
            <Link to="/contact" className="pub-btn pub-btn-outline">Contact Us</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
