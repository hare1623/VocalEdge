import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

const LandingPage: React.FC = () => (
  <div>
    <Header />
    <main>
      <h2>Welcome to VocalEdge!</h2>
      <p>Transform text into audio, summarize documents, and more.</p>
      <Link to="/signup">
        <button>Get Started</button>
      </Link>
    </main>
    <Footer />
  </div>
);

export default LandingPage;
