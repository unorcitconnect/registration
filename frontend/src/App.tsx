import { useState, useEffect } from 'react'
import VideoHeroSection from './components/VideoHeroSection'
import NewsSection from './components/NewsSection'
import LeafletAlumniMap from './components/LeafletAlumniMap'
import RegistrationModal from './components/RegistrationModal'
import RegistrationModalMD from './components/RegistrationModalMD'
import NominationModal from './components/NominationModalMD'
import AdminLoginModal from './components/AdminLoginModalMD'
import AdminPage from './components/AdminPageMD'
import EventDetails from './components/EventDetails'
import SponsorshipSection from './components/SponsorshipSection'
import SponsorshipModal from './components/SponsorshipModalMD'
import OutstandingAlumniAwards from './components/OutstandingAlumniAwards'

function App() {
  const [showRegistration, setShowRegistration] = useState(false)
  const [showNomination, setShowNomination] = useState(false)
  const [showSponsorshipModal, setShowSponsorshipModal] = useState(false)
  const [showAdminLogin, setShowAdminLogin] = useState(false)
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false)
  const [showEventDetails, setShowEventDetails] = useState(false)
  const [showSponsorship, setShowSponsorship] = useState(false)
  const [showOutstandingAlumni, setShowOutstandingAlumni] = useState(false)
  const [useMaterialDesign, setUseMaterialDesign] = useState(true)
  const [mapRefreshTrigger, setMapRefreshTrigger] = useState(0)

  // Check if admin is already logged in
  useEffect(() => {
    const adminLoggedIn = localStorage.getItem('admin_logged_in') === 'true'
    setIsAdminLoggedIn(adminLoggedIn)
  }, [])

  const handleJoinCelebration = () => {
    setShowRegistration(true)
  }

  const handleLearnMore = () => {
    setShowEventDetails(true)
  }

  const handleNewsReadMore = (newsId: number) => {
    // For news item 1 (Alumni Homecoming), show event details
    if (newsId === 1) {
      setShowEventDetails(true)
    }
    // For news item 2 (Outstanding Alumni Awards), show awards section
    else if (newsId === 2) {
      setShowOutstandingAlumni(true)
    }
    // For news item 3 (Sponsorship), show sponsorship section
    else if (newsId === 3) {
      setShowSponsorship(true)
    }
    // For other news items, you can add specific handling later
  }

  const handleAdminLoginSuccess = () => {
    setIsAdminLoggedIn(true)
  }

  const handleAdminLogout = () => {
    localStorage.removeItem('admin_logged_in')
    localStorage.removeItem('admin_username')
    setIsAdminLoggedIn(false)
  }

  const handleRegistrationSuccess = () => {
    setShowRegistration(false)
    // Trigger map refresh by incrementing the trigger
    setMapRefreshTrigger(prev => prev + 1)
  }

  // If admin is logged in, show admin page
  if (isAdminLoggedIn) {
    return <AdminPage onLogout={handleAdminLogout} />
  }

  // If showing event details, show event details page
  if (showEventDetails) {
    return <EventDetails onBack={() => setShowEventDetails(false)} onRegister={() => { setShowEventDetails(false); setShowRegistration(true); }} />
  }

  // If showing sponsorship, show sponsorship page
  if (showSponsorship) {
    return <SponsorshipSection onBack={() => setShowSponsorship(false)} />
  }

  // If showing outstanding alumni awards, show awards page
  if (showOutstandingAlumni) {
    return <OutstandingAlumniAwards onBack={() => setShowOutstandingAlumni(false)} onNominate={() => { setShowOutstandingAlumni(false); setShowNomination(true); }} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <img 
                src="/cit_logo.png" 
                alt="CIT Logo" 
                className="h-10 w-10 object-contain"
              />
              <h1 className="text-2xl font-bold text-indigo-900">UNOR CIT Connect</h1>
            </div>
            <div className="flex space-x-4 items-center">
              <button
                onClick={() => setShowRegistration(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
              >
                Register
              </button>
              <button
                onClick={() => setShowNomination(true)}
                className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
              >
                Nominate
              </button>
              <button
                onClick={() => setShowSponsorshipModal(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
              >
                Sponsor
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <VideoHeroSection onJoinCelebration={handleJoinCelebration} onLearnMore={handleLearnMore} />

      {/* News Section */}
      <NewsSection onReadMore={handleNewsReadMore} />

      {/* Alumni World Map */}
      <LeafletAlumniMap refreshTrigger={mapRefreshTrigger} />

      {/* Footer */}
      <footer className="bg-indigo-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">UNOR CIT Connect</h3>
              <p className="text-indigo-200">
                Celebrating 40 years of IT Education in Western Visayas & 25 years as College
              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-indigo-200">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Events</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Alumni Directory</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><button onClick={() => setShowAdminLogin(true)} className="hover:text-white transition-colors text-left">Administration</button></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Contact Info</h3>
              <p className="text-indigo-200">
                University of Negros Occidental - Recoletos<br />
                Bacolod City, Philippines<br />
                Email: unorcitconnect@gmail.com<br />
                Phone: 433-2449 loc 181
              </p>
            </div>
          </div>
          <div className="border-t border-indigo-800 mt-8 pt-8 text-center text-indigo-200">
            <p>&copy; 2025 UNOR CIT Connect. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {showRegistration && (
        useMaterialDesign ? (
          <RegistrationModalMD 
            open={showRegistration} 
            onClose={() => setShowRegistration(false)}
            onSuccess={handleRegistrationSuccess}
          />
        ) : (
          <RegistrationModal onClose={() => setShowRegistration(false)} />
        )
      )}
      {showNomination && (
        <NominationModal 
          open={showNomination}
          onClose={() => setShowNomination(false)} 
        />
      )}
      {showSponsorshipModal && (
        <SponsorshipModal 
          open={showSponsorshipModal}
          onClose={() => setShowSponsorshipModal(false)}
        />
      )}
      {showAdminLogin && (
        <AdminLoginModal 
          open={showAdminLogin}
          onClose={() => setShowAdminLogin(false)} 
          onLoginSuccess={handleAdminLoginSuccess}
        />
      )}
    </div>
  )
}

export default App
