import { Link } from 'react-router-dom';

export default function PaymentSuccess() {
  return (
    <div className="pub-page">
      <section className="pub-section pub-section-centered">
        <div className="pub-container pub-content-narrow pub-text-center">
          <div className="pub-status-icon pub-status-success">&#10003;</div>
          <h1 className="pub-section-title">Payment Successful</h1>
          <p className="pub-body-text">
            Thank you for your payment. We will be in touch within 24 hours to confirm next steps
            and schedule your engagement kickoff.
          </p>
          <div className="pub-hero-ctas">
            <Link to="/" className="pub-btn pub-btn-primary">Back to Home</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
