import React, { useState } from 'react';
import SponsorshipModal from './SponsorshipModalMD';
import ContactModal from './ContactModal';

interface SponsorshipSectionProps {
  onBack?: () => void
}

const SponsorshipSection = ({ onBack }: SponsorshipSectionProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState('');
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  const openModal = (level: string = '') => {
    setSelectedLevel(level);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedLevel('');
  };

  const handleDownloadPDF = () => {
    const link = document.createElement('a');
    link.href = '/sponsorship-package.pdf';
    link.download = 'UNOR-CIT-Connect-Sponsorship-Package.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleContactUs = () => {
    setIsContactModalOpen(true);
  };
  const sponsorshipLevels = [
    {
      level: "Platinum",
      amount: "₱90,000",
      color: "from-gray-300 to-gray-500",
      textColor: "text-gray-800",
      benefits: [
        "Prime branding placement",
        "3x3 booth space",
        "Full-page ad in souvenir program",
        "5 Gala Night tickets",
        "VIP acknowledgments",
        "Social media mentions",
        "VIP treatment throughout event"
      ]
    },
    {
      level: "Gold",
      amount: "₱70,000",
      color: "from-yellow-300 to-yellow-500",
      textColor: "text-yellow-900",
      benefits: [
        "Major branding placement",
        "3x2 booth space",
        "Half-page ad in souvenir program",
        "3 Gala Night tickets",
        "Event acknowledgments",
        "Social media mentions"
      ]
    },
    {
      level: "Silver",
      amount: "₱50,000",
      color: "from-gray-200 to-gray-400",
      textColor: "text-gray-800",
      benefits: [
        "Secondary branding placement",
        "2x2 booth space",
        "Quarter-page ad in souvenir program",
        "2 Gala Night tickets",
        "Event acknowledgments"
      ]
    },
    {
      level: "Bronze",
      amount: "₱30,000",
      color: "from-orange-300 to-orange-500",
      textColor: "text-orange-900",
      benefits: [
        "Basic branding placement",
        "Shared 1x1 table space",
        "Logo in souvenir program",
        "1 Gala Night ticket",
        "Event acknowledgments"
      ]
    }
  ]

  const exhibitorPackage = {
    title: "Exhibitor Package",
    amount: "₱25,000",
    benefits: [
      "2x2 booth space",
      "Company name in program",
      "2 event passes (excludes Gala Dinner)"
    ],
    note: "Subject to availability after sponsor booth assignment"
  }

  const inKindOpportunities = [
    "Printing, lanyards, event materials",
    "Prizes (gadgets, gift certificates)",
    "Coffee break sponsorship",
    "Tech equipment and support"
  ]

  const eventRequirements = [
    "LED Wall",
    "Photo Booth",
    "360° Camera",
    "Lights & Sound System",
    "Band / DJ / Live Performers",
    "Event Setup & Decorations",
    "Mobile Bar & Signature Cocktails",
    "Program Souvenir"
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 text-indigo-700 hover:text-indigo-900 transition-colors"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="font-medium">Back to Home</span>
            </button>
            <div className="flex items-center space-x-3">
              <img 
                src="/cit_logo.png" 
                alt="CIT Logo" 
                className="h-10 w-10 object-contain"
              />
              <h1 className="text-2xl font-bold text-indigo-900">UNOR CIT Connect</h1>
            </div>
          </div>
        </div>
      </nav>

      <section className="py-20 bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Partnership & Sponsorship
          </h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto">
            Join us in celebrating 40 years of IT Education and 25 years of CIT Excellence. 
            Partner with us to connect with our global alumni network and support the future of IT education.
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 mx-auto mt-6"></div>
        </div>

        {/* Event Overview */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Event Overview</h3>
              <div className="space-y-3 text-gray-600">
                <p><strong>Theme:</strong> "Four Decades of IT Education, A Quarter Century of Excellence: Connecting Generations, Inspiring The Future!"</p>
                <p><strong>Date:</strong> November 21-22, 2025</p>
                <p><strong>Venue:</strong> UNO-R Campus & Acacia Grand Pavilion Convention Hall</p>
                <p><strong>Expected Attendees:</strong> 500+ Alumni from all batches</p>
                <p><strong>Coverage:</strong> Global alumni network across 50+ countries</p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl p-6">
              <h4 className="text-lg font-bold text-gray-900 mb-4">Event Highlights</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-center"><span className="w-2 h-2 bg-indigo-500 rounded-full mr-3"></span>Alumni-Student Engagement Sessions</li>
                <li className="flex items-center"><span className="w-2 h-2 bg-indigo-500 rounded-full mr-3"></span>Awards Night - 25 Distinguished Alumni</li>
                <li className="flex items-center"><span className="w-2 h-2 bg-indigo-500 rounded-full mr-3"></span>Gala Night with Live Performances</li>
                <li className="flex items-center"><span className="w-2 h-2 bg-indigo-500 rounded-full mr-3"></span>Alumni Business Showcase</li>
                <li className="flex items-center"><span className="w-2 h-2 bg-indigo-500 rounded-full mr-3"></span>Networking & Career Panels</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Sponsorship Levels */}
        <div className="mb-16">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">Sponsorship Levels</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {sponsorshipLevels.map((sponsor, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden">
                <div className={`bg-gradient-to-r ${sponsor.color} p-6 text-center`}>
                  <h4 className={`text-2xl font-bold ${sponsor.textColor} mb-2`}>{sponsor.level}</h4>
                  <div className={`text-3xl font-bold ${sponsor.textColor}`}>{sponsor.amount}</div>
                </div>
                <div className="p-6">
                  <ul className="space-y-3">
                    {sponsor.benefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-start text-sm text-gray-600">
                        <svg className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        {benefit}
                      </li>
                    ))}
                  </ul>
                  <button 
                    onClick={() => openModal(sponsor.level.toLowerCase())}
                    className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                  >
                    Choose {sponsor.level}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Exhibitor Package */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">{exhibitorPackage.title}</h3>
              <div className="text-3xl font-bold text-indigo-600 mb-4">{exhibitorPackage.amount}</div>
              <ul className="space-y-3">
                {exhibitorPackage.benefits.map((benefit, idx) => (
                  <li key={idx} className="flex items-center text-gray-600">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {benefit}
                  </li>
                ))}
              </ul>
              <p className="text-sm text-amber-600 mt-4 font-medium">
                <strong>Note:</strong> {exhibitorPackage.note}
              </p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6">
              <h4 className="text-lg font-bold text-gray-900 mb-4">Perfect For:</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-center"><span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>Startups and SMEs</li>
                <li className="flex items-center"><span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>Tech companies</li>
                <li className="flex items-center"><span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>Service providers</li>
                <li className="flex items-center"><span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>Alumni-owned businesses</li>
              </ul>
              <button 
                onClick={() => openModal('exhibitor package')}
                className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
              >
                Book Exhibitor Package
              </button>
            </div>
          </div>
        </div>

        {/* In-Kind Sponsorship */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">In-Kind Sponsorship Opportunities</h3>
            <div className="space-y-4">
              {inKindOpportunities.map((opportunity, idx) => (
                <div key={idx} className="flex items-center p-3 bg-green-50 rounded-lg">
                  <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">{opportunity}</span>
                </div>
              ))}
            </div>
            <button 
              onClick={() => openModal('in-kind options')}
              className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
            >
              Explore In-Kind Options
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Event Production Requirements</h3>
            <div className="grid grid-cols-2 gap-3">
              {eventRequirements.map((requirement, idx) => (
                <div key={idx} className="flex items-center p-2 bg-purple-50 rounded-lg">
                  <svg className="w-4 h-4 text-purple-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm text-gray-700">{requirement}</span>
                </div>
              ))}
            </div>
            <button 
              onClick={() => openModal('equipment')}
              className="w-full mt-6 bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
            >
              Sponsor Equipment
            </button>
          </div>
        </div>

        {/* Why Partner With Us */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-8 md:p-12 text-white">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold mb-4">Why Partner With Us?</h3>
            <p className="text-xl opacity-90">Connect with a global network of IT professionals and industry leaders</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">5,000+</div>
              <div className="opacity-90">Global Alumni Network</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">50+</div>
              <div className="opacity-90">Countries Represented</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">40</div>
              <div className="opacity-90">Years of Excellence</div>
            </div>
          </div>
        </div>

        {/* Contact CTA */}
        <div className="text-center mt-16">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to Partner With Us?</h3>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Join us in celebrating this milestone and connect with our vibrant alumni community. 
            Let's create something amazing together!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={handleDownloadPDF}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              Download Sponsorship Package
            </button>
            <button 
              onClick={handleContactUs}
              className="bg-white border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-600 hover:text-white px-8 py-3 rounded-xl font-medium transition-all duration-300"
            >
              Contact Us
            </button>
          </div>
        </div>
        </div>
      </section>

      {/* Sponsorship Modal */}
      <SponsorshipModal
        open={isModalOpen}
        onClose={closeModal}
        selectedLevel={selectedLevel}
      />

      {/* Contact Modal */}
      <ContactModal
        open={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
      />
    </div>
  )
}

export default SponsorshipSection
