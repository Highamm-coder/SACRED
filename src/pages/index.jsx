import Layout from "./Layout.jsx";

import Home from "./Home";

import Start from "./Start";

import Assessment from "./Assessment";

import Waiting from "./Waiting";

import Report from "./Report";

import Dashboard from "./Dashboard";

import Landing from "./Landing";

import Terms from "./Terms";

import Privacy from "./Privacy";

import Account from "./Account";

import OpenEndedAssessment from "./OpenEndedAssessment";

import OpenEndedStart from "./OpenEndedStart";

import OpenEndedInvite from "./OpenEndedInvite";

import Education from "./Education";

import Blog from "./Blog";

import AuthDebug from "./AuthDebug";

import Onboarding from "./Onboarding";

import Admin from "./Admin";

import OpenEndedReport from "./OpenEndedReport";

import AdminWedding from "./AdminWedding";

import PaymentRequired from "./PaymentRequired";

import PaymentSuccess from "./PaymentSuccess";

import Shop from "./Shop";

import BlogPost from "./BlogPost";

import Login from "./Login";

import EmailTest from "./EmailTest";

import AdminCMS from "./AdminCMS";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Home: Home,
    
    Start: Start,
    
    Assessment: Assessment,
    
    Waiting: Waiting,
    
    Report: Report,
    
    Dashboard: Dashboard,
    
    Landing: Landing,
    
    Terms: Terms,
    
    Privacy: Privacy,
    
    Account: Account,
    
    OpenEndedAssessment: OpenEndedAssessment,
    
    OpenEndedStart: OpenEndedStart,
    
    OpenEndedInvite: OpenEndedInvite,
    
    Education: Education,
    
    Blog: Blog,
    
    AuthDebug: AuthDebug,
    
    Onboarding: Onboarding,
    
    Admin: Admin,
    
    OpenEndedReport: OpenEndedReport,
    
    AdminWedding: AdminWedding,
    
    PaymentRequired: PaymentRequired,
    
    PaymentSuccess: PaymentSuccess,
    
    Shop: Shop,
    
    BlogPost: BlogPost,
    
    Login: Login,
    
    EmailTest: EmailTest,
    
    AdminCMS: AdminCMS,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Home />} />
                
                
                <Route path="/Home" element={<Home />} />
                
                <Route path="/Start" element={<Start />} />
                
                <Route path="/Assessment" element={<Assessment />} />
                
                <Route path="/Waiting" element={<Waiting />} />
                
                <Route path="/Report" element={<Report />} />
                
                <Route path="/Dashboard" element={<Dashboard />} />
                
                <Route path="/Landing" element={<Landing />} />
                
                <Route path="/Terms" element={<Terms />} />
                
                <Route path="/Privacy" element={<Privacy />} />
                
                <Route path="/Account" element={<Account />} />
                
                <Route path="/OpenEndedAssessment" element={<OpenEndedAssessment />} />
                
                <Route path="/OpenEndedStart" element={<OpenEndedStart />} />
                
                <Route path="/OpenEndedInvite" element={<OpenEndedInvite />} />
                
                <Route path="/Education" element={<Education />} />
                
                <Route path="/Blog" element={<Blog />} />
                
                <Route path="/AuthDebug" element={<AuthDebug />} />
                
                <Route path="/Onboarding" element={<Onboarding />} />
                
                <Route path="/Admin" element={<Admin />} />
                
                <Route path="/OpenEndedReport" element={<OpenEndedReport />} />
                
                <Route path="/AdminWedding" element={<AdminWedding />} />
                
                <Route path="/PaymentRequired" element={<PaymentRequired />} />
                
                <Route path="/PaymentSuccess" element={<PaymentSuccess />} />
                
                <Route path="/Shop" element={<Shop />} />
                
                <Route path="/BlogPost" element={<BlogPost />} />
                
                <Route path="/Login" element={<Login />} />
                
                <Route path="/EmailTest" element={<EmailTest />} />
                
                <Route path="/AdminCMS" element={<AdminCMS />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}