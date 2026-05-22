import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import PublicLayout from './components/PublicLayout';

// Existing admin pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Businesses from './pages/Businesses';
import Customers from './pages/Customers';
import Bookings from './pages/Bookings';
import Reviews from './pages/Reviews';
import Campaigns from './pages/Campaigns';
import Leads from './pages/Leads';
import Websites from './pages/Websites';
import Social from './pages/Social';
import Analytics from './pages/Analytics';
import Notifications from './pages/Notifications';
import AIAssistant from './pages/AIAssistant';
import AISales from './pages/AISales';
import SEO from './pages/SEO';

// New admin pages (consulting)
import AdminContacts from './pages/AdminContacts';
import AdminCompanies from './pages/AdminCompanies';
import AdminCandidates from './pages/AdminCandidates';
import AdminPartners from './pages/AdminPartners';
import AdminDeals from './pages/AdminDeals';
import AdminPayments from './pages/AdminPayments';
import AdminOrders from './pages/AdminOrders';
import AdminConsultations from './pages/AdminConsultations';
import InsightsAdmin from './pages/InsightsAdmin';
import AdminOpportunities from './pages/AdminOpportunities';
import AdminPackages from './pages/AdminPackages';
import AdminMeetings from './pages/AdminMeetings';
import AdminOnboarding from './pages/AdminOnboarding';
import AdminCaseStudies from './pages/AdminCaseStudies';
import AdminIndustries from './pages/AdminIndustries';
import CustomViewsPage from './pages/CustomViewsPage';

// Public pages
import PublicHome from './pages/public/Home';
import About from './pages/public/About';
import ValueDeliverySystem from './pages/public/ValueDeliverySystem';
import Services from './pages/public/Services';
import ServiceDetail from './pages/public/ServiceDetail';
import Industries from './pages/public/Industries';
import GlobalMarkets from './pages/public/GlobalMarkets';
import Insights from './pages/public/Insights';
import InsightDetail from './pages/public/InsightDetail';
import Partnerships from './pages/public/Partnerships';
import Contact from './pages/public/Contact';
import BookConsultation from './pages/public/BookConsultation';
import SubmitOpportunity from './pages/public/SubmitOpportunity';
import JoinTalentNetwork from './pages/public/JoinTalentNetwork';
import Team from './pages/public/Team';
import ServicePackages from './pages/public/ServicePackages';
import PaymentSuccess from './pages/public/PaymentSuccess';
import PaymentCancel from './pages/public/PaymentCancel';
import CaseStudies from './pages/public/CaseStudies';
import CaseStudyDetail from './pages/public/CaseStudyDetail';
import IndustryDetail from './pages/public/IndustryDetail';
import WhyMCGDetail from './pages/public/WhyMCGDetail';
import MethodologyDetail from './pages/public/MethodologyDetail';

import CodexCustomVizFeature from './pages/CodexCustomVizFeature';
import CodexOperationsFeature from './pages/CodexOperationsFeature';

function ProtectedRoute({ children }) {
  const { token } = useAuth();
  if (!token) return <Navigate to="/login" />;
  return (
    <div className="app-layout">
      <Navbar />
      <div className="main-content">{children}</div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
        <Route path="/codex/custom-viz" element={<ProtectedRoute><CodexCustomVizFeature /></ProtectedRoute>} />
        <Route path="/codex/operations" element={<ProtectedRoute><CodexOperationsFeature /></ProtectedRoute>} />

      {/* Public website routes */}
      <Route path="/" element={<PublicLayout><PublicHome /></PublicLayout>} />
      <Route path="/about" element={<PublicLayout><About /></PublicLayout>} />
      <Route path="/leadership" element={<PublicLayout><Team /></PublicLayout>} />
      <Route path="/team" element={<Navigate to="/leadership" />} />
      <Route path="/value-delivery-system" element={<PublicLayout><ValueDeliverySystem /></PublicLayout>} />
      <Route path="/why-mcg/:slug" element={<PublicLayout><WhyMCGDetail /></PublicLayout>} />
      <Route path="/methodology/:slug" element={<PublicLayout><MethodologyDetail /></PublicLayout>} />
      <Route path="/services" element={<PublicLayout><Services /></PublicLayout>} />
      <Route path="/services/:slug" element={<PublicLayout><ServiceDetail /></PublicLayout>} />
      <Route path="/industries" element={<PublicLayout><Industries /></PublicLayout>} />
      <Route path="/industries/:slug" element={<PublicLayout><IndustryDetail /></PublicLayout>} />
      <Route path="/case-studies" element={<PublicLayout><CaseStudies /></PublicLayout>} />
      <Route path="/case-studies/:slug" element={<PublicLayout><CaseStudyDetail /></PublicLayout>} />
      <Route path="/global-markets" element={<PublicLayout><GlobalMarkets /></PublicLayout>} />
      <Route path="/insights" element={<PublicLayout><Insights /></PublicLayout>} />
      <Route path="/insights/:slug" element={<PublicLayout><InsightDetail /></PublicLayout>} />
      <Route path="/partnerships" element={<PublicLayout><Partnerships /></PublicLayout>} />
      <Route path="/contact" element={<PublicLayout><Contact /></PublicLayout>} />
      <Route path="/book-consultation" element={<PublicLayout><BookConsultation /></PublicLayout>} />
      <Route path="/submit-opportunity" element={<PublicLayout><SubmitOpportunity /></PublicLayout>} />
      <Route path="/join-talent-network" element={<PublicLayout><JoinTalentNetwork /></PublicLayout>} />
      <Route path="/packages" element={<PublicLayout><ServicePackages /></PublicLayout>} />
      <Route path="/payment-success" element={<PublicLayout><PaymentSuccess /></PublicLayout>} />
      <Route path="/payment-cancel" element={<PublicLayout><PaymentCancel /></PublicLayout>} />

      {/* Admin routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/admin" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/admin/businesses" element={<ProtectedRoute><Businesses /></ProtectedRoute>} />
      <Route path="/admin/customers" element={<ProtectedRoute><Customers /></ProtectedRoute>} />
      <Route path="/admin/bookings" element={<ProtectedRoute><Bookings /></ProtectedRoute>} />
      <Route path="/admin/reviews" element={<ProtectedRoute><Reviews /></ProtectedRoute>} />
      <Route path="/admin/campaigns" element={<ProtectedRoute><Campaigns /></ProtectedRoute>} />
      <Route path="/admin/leads" element={<ProtectedRoute><Leads /></ProtectedRoute>} />
      <Route path="/admin/websites" element={<ProtectedRoute><Websites /></ProtectedRoute>} />
      <Route path="/admin/social" element={<ProtectedRoute><Social /></ProtectedRoute>} />
      <Route path="/admin/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
      <Route path="/admin/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
      <Route path="/admin/ai" element={<ProtectedRoute><AIAssistant /></ProtectedRoute>} />
      <Route path="/admin/ai-sales" element={<ProtectedRoute><AISales /></ProtectedRoute>} />
      <Route path="/admin/seo" element={<ProtectedRoute><SEO /></ProtectedRoute>} />

      {/* New consulting admin routes */}
      <Route path="/admin/contacts" element={<ProtectedRoute><AdminContacts /></ProtectedRoute>} />
      <Route path="/admin/companies" element={<ProtectedRoute><AdminCompanies /></ProtectedRoute>} />
      <Route path="/admin/candidates" element={<ProtectedRoute><AdminCandidates /></ProtectedRoute>} />
      <Route path="/admin/partners" element={<ProtectedRoute><AdminPartners /></ProtectedRoute>} />
      <Route path="/admin/deals" element={<ProtectedRoute><AdminDeals /></ProtectedRoute>} />
      <Route path="/admin/payments" element={<ProtectedRoute><AdminPayments /></ProtectedRoute>} />
      <Route path="/admin/orders" element={<ProtectedRoute><AdminOrders /></ProtectedRoute>} />
      <Route path="/admin/consultations" element={<ProtectedRoute><AdminConsultations /></ProtectedRoute>} />
      <Route path="/admin/insights" element={<ProtectedRoute><InsightsAdmin /></ProtectedRoute>} />
      <Route path="/admin/opportunities" element={<ProtectedRoute><AdminOpportunities /></ProtectedRoute>} />
      <Route path="/admin/packages" element={<ProtectedRoute><AdminPackages /></ProtectedRoute>} />
      <Route path="/admin/meetings" element={<ProtectedRoute><AdminMeetings /></ProtectedRoute>} />
      <Route path="/admin/onboarding" element={<ProtectedRoute><AdminOnboarding /></ProtectedRoute>} />
      <Route path="/admin/case-studies" element={<ProtectedRoute><AdminCaseStudies /></ProtectedRoute>} />
      <Route path="/admin/industries" element={<ProtectedRoute><AdminIndustries /></ProtectedRoute>} />
      <Route path="/custom-views" element={<ProtectedRoute><CustomViewsPage /></ProtectedRoute>} />
      <Route path="/admin/custom-views" element={<ProtectedRoute><CustomViewsPage /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
