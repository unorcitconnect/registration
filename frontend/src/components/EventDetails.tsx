import { useState } from 'react'

interface EventDetailsProps {
  onBack: () => void
  onRegister?: () => void
}

const EventDetails = ({ onBack, onRegister }: EventDetailsProps) => {
  const [showGCashModal, setShowGCashModal] = useState(false)
  
  const generateEventGuidePDF = () => {
    // Import jsPDF dynamically
    import('jspdf').then(({ jsPDF }) => {
      const pdf = new jsPDF()
      
      // Set up fonts and colors
      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(20)
      pdf.setTextColor(63, 81, 181) // Indigo color
      
      // Title
      pdf.text('UNOR CIT Connect', 105, 20, { align: 'center' })
      pdf.setFontSize(16)
      pdf.text('Alumni Homecoming Event Guide', 105, 30, { align: 'center' })
      
      // Reset font
      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(14)
      pdf.setTextColor(0, 0, 0)
      
      // Event title
      pdf.text('40th Years of IT Education and 25th CIT Anniversary', 20, 45)
      pdf.setFont('helvetica', 'normal')
      pdf.setFontSize(12)
      pdf.text('College of Information Technology Alumni Association [CITAA]', 20, 52)
      pdf.text('Alumni and Grand Anniversary Celebration', 20, 59)
      
      // Theme
      pdf.setFont('helvetica', 'italic')
      pdf.setFontSize(11)
      pdf.setTextColor(63, 81, 181)
      const themeText = '"Four Decades of IT Education, A Quarter Century of Excellence:'
      const themeText2 = 'Connecting Generations, Inspiring The Future!"'
      pdf.text(themeText, 20, 70)
      pdf.text(themeText2, 20, 77)
      
      // Event details
      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(12)
      pdf.setTextColor(0, 0, 0)
      pdf.text('EVENT DATES: November 21-22, 2025', 20, 90)
      pdf.text('VENUE: UNO-R Campus & Acacia Grand Pavilion Convention Hall', 20, 97)
      
      // Program Overview
      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(14)
      pdf.text('PROGRAM OVERVIEW', 20, 110)
      
      // Day 1
      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(12)
      pdf.setTextColor(63, 81, 181)
      pdf.text('Day 1: On-Campus Activities (UNO-R Campus)', 20, 120)
      pdf.setFont('helvetica', 'normal')
      pdf.setFontSize(10)
      pdf.setTextColor(0, 0, 0)
      pdf.text('November 21, 2025 (Friday) 8:00 AM - 5:00 PM', 20, 127)
      
      const day1Activities = [
        '• Alumni-Student Engagement',
        '• Speakers & Talks | Breakout Sessions',
        '• Interactive Workshops | Breakout Sessions',
        '• Student Presentations',
        '• Networking Lunch',
        '• Alumni Career Panel – "Where Are They Now?"',
        '• Campus Tour'
      ]
      
      let yPos = 134
      day1Activities.forEach(activity => {
        pdf.text(activity, 25, yPos)
        yPos += 6
      })
      
      // Day 2
      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(12)
      pdf.setTextColor(147, 51, 234) // Purple color
      pdf.text('Day 2: Gala Night (Acacia Grand Pavilion Convention Hall)', 20, yPos + 10)
      pdf.setFont('helvetica', 'normal')
      pdf.setFontSize(10)
      pdf.setTextColor(0, 0, 0)
      pdf.text('November 22, 2025 (Saturday) 6:00 PM', 20, yPos + 17)
      
      const day2Activities = [
        '• Cocktail Reception',
        '• Anniversary Dinner and Live Performances',
        '• Awards Night – 25 Distinguished Alumni',
        '• Election of Officers and Turnover Ceremony',
        '• Batch Dance Performances',
        '• Fellowship, Storytelling, and Socials'
      ]
      
      yPos += 24
      day2Activities.forEach(activity => {
        pdf.text(activity, 25, yPos)
        yPos += 6
      })
      
      pdf.setFont('helvetica', 'italic')
      pdf.text('Attire: Yuppie Look / Modern Corporate (Wednesday Throwback Attire)', 25, yPos + 5)
      
      // Add new page for fees and awards
      pdf.addPage()
      
      // Registration Fees
      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(14)
      pdf.setTextColor(0, 0, 0)
      pdf.text('REGISTRATION FEES', 20, 20)
      
      pdf.setFont('helvetica', 'normal')
      pdf.setFontSize(12)
      pdf.text('Early Bird Rate Extended: ₱1,500 (Valid Until August 31, 2025)', 20, 30)
      pdf.text('Regular Rate: ₱2,000', 20, 37)
      
      // Batch Commitment
      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(14)
      pdf.text('BATCH COMMITMENT PLEDGE', 20, 50)
      
      pdf.setFont('helvetica', 'normal')
      pdf.setFontSize(12)
      pdf.text('₱10,000 minimum per batch', 20, 60)
      pdf.text('To be collected by Batch Coordinators', 20, 67)
      pdf.text('Deadline: on or before August 31, 2025 (Extended)', 20, 74)
      
      // Awards Categories
      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(14)
      pdf.text('AWARDS CATEGORIES (25 Total Awardees)', 20, 90)
      
      const awards = [
        '• Pioneer in Tech and Innovation',
        '• Public Service and Social Impact',
        '• Arts, Culture and Media Excellence',
        '• Outstanding Entrepreneurial Spirit',
        '• Leadership in Healthcare and Wellness',
        '• Global Impact Excellence Award',
        '• Young Alumni Achievement',
        '• Excellence in Education and Academic Leadership',
        '• Law Enforcement, Public Safety and Judiciary',
        '• Lifetime Achievement Award'
      ]
      
      pdf.setFont('helvetica', 'normal')
      pdf.setFontSize(10)
      yPos = 100
      awards.forEach(award => {
        pdf.text(award, 25, yPos)
        yPos += 6
      })
      
      // Contact Information
      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(12)
      pdf.text('CONTACT INFORMATION', 20, yPos + 15)
      
      pdf.setFont('helvetica', 'normal')
      pdf.setFontSize(10)
      pdf.text('For more information and registration, visit: UNOR CIT Connect', 20, yPos + 25)
      pdf.text('Email: unorcitconnect@gmail.com', 20, yPos + 32)
      pdf.text('Phone: 433-2449 loc 181', 20, yPos + 39)
      
      // Footer
      pdf.setFont('helvetica', 'italic')
      pdf.setFontSize(8)
      pdf.setTextColor(128, 128, 128)
      pdf.text('© 2025 UNOR CIT Connect. All rights reserved.', 105, 280, { align: 'center' })
      
      // Save the PDF
      pdf.save('UNOR-CIT-Alumni-Homecoming-Event-Guide.pdf')
    }).catch(error => {
      console.error('Error generating PDF:', error)
      // Fallback to text file if PDF generation fails
      const pdfContent = `
UNOR CIT Connect - Alumni Homecoming Event Guide

40th Years of IT Education and 25th CIT Anniversary
College of Information Technology Alumni Association [CITAA]
Alumni and Grand Anniversary Celebration

"Four Decades of IT Education, A Quarter Century of Excellence: 
Connecting Generations, Inspiring The Future!"

EVENT DATES: November 21-22, 2025
VENUE: UNO-R Campus & Acacia Grand Pavilion Convention Hall

For more information and registration, visit: UNOR CIT Connect
Contact: unorcitconnect@gmail.com

© 2025 UNOR CIT Connect. All rights reserved.
      `
      
      const blob = new Blob([pdfContent], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'UNOR-CIT-Alumni-Homecoming-Event-Guide.txt'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    })
  }
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

      {/* Event Details Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            40th Years of IT Education and 25th CIT Anniversary
          </h1>
          <h2 className="text-2xl sm:text-3xl font-semibold text-indigo-600 mb-4">
            College of Information Technology Alumni Association [CITAA]
          </h2>
          <h3 className="text-xl sm:text-2xl font-medium text-gray-700 mb-6">
            Alumni and Grand Anniversary Celebration
          </h3>
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-2xl inline-block">
            <p className="text-lg font-medium">
              "Four Decades of IT Education, A Quarter Century of Excellence: Connecting Generations, Inspiring The Future!"
            </p>
          </div>
        </div>

        {/* Event Information Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="text-3xl font-bold text-indigo-600 mb-2">Nov 21-22</div>
            <div className="text-gray-600 font-medium">2025</div>
            <div className="text-sm text-gray-500 mt-2">University Week: Nov 16-22</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="text-lg font-bold text-green-600 mb-2">UNO-R Campus</div>
            <div className="text-gray-600">& Acacia Grand Pavilion</div>
            <div className="text-sm text-gray-500 mt-2">Convention Hall</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="text-lg font-bold text-purple-600 mb-2">Launch</div>
            <div className="text-gray-600">August 20</div>
            <div className="text-sm text-gray-500 mt-2">CIT Family Day</div>
          </div>
        </div>

        {/* About the Event */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">About the Event</h2>
          <p className="text-gray-600 leading-relaxed">
            This program aims to celebrate the 40 Years of IT Education and 25th anniversary of the 
            College of Information Technology by bringing together alumni from all batches, fostering 
            camaraderie, recognizing achievements, and charting a course for future collaboration and growth. 
            The event will be a blend of formal and informal activities, offering opportunities for networking, 
            reminiscing, and engagement.
          </p>
        </div>

        {/* Program Overview */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Program Overview</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Day 1 */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6">
              <h3 className="text-xl font-bold text-indigo-600 mb-4">
                Day 1: On-Campus Activities (UNO-R Campus)
              </h3>
              <p className="text-sm text-gray-600 mb-4">November 21, 2025 (Friday) 8:00 AM - 5:00 PM</p>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3 mt-2"></span>
                  Alumni-Student Engagement
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3 mt-2"></span>
                  Speakers & Talks | Breakout Sessions
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3 mt-2"></span>
                  Interactive Workshops | Breakout Sessions
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3 mt-2"></span>
                  Student Presentations
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3 mt-2"></span>
                  Networking Lunch
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3 mt-2"></span>
                  Alumni Career Panel – "Where Are They Now?"
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3 mt-2"></span>
                  Campus Tour
                </li>
              </ul>
            </div>

            {/* Day 2 */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6">
              <h3 className="text-xl font-bold text-purple-600 mb-4">
                Day 2: Gala Night (Acacia Grand Pavilion Convention Hall)
              </h3>
              <p className="text-sm text-gray-600 mb-4">November 22, 2025 (Saturday) 6:00 PM</p>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-3 mt-2"></span>
                  Cocktail Reception
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-3 mt-2"></span>
                  Anniversary Dinner and Live Performances
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-3 mt-2"></span>
                  Awards Night – 25 Distinguished Alumni
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-3 mt-2"></span>
                  Election of Officers and Turnover Ceremony
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-3 mt-2"></span>
                  Batch Dance Performances
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-3 mt-2"></span>
                  Fellowship, Storytelling, and Socials
                </li>
              </ul>
              <div className="mt-4 p-3 bg-purple-100 rounded-lg">
                <p className="text-sm text-purple-700 font-medium">
                  Attire: Yuppie Look / Modern Corporate (Wednesday Throwback Attire)
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Registration Information */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Fees & Budget</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-lg font-semibold text-indigo-600 mb-4">Registration Fee (per attendee):</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 px-4 bg-green-50 rounded-lg border border-green-200">
                  <span className="font-medium text-gray-700">Early Bird Rate Extended</span>
                  <span className="text-green-600 font-bold text-xl">₱1,500</span>
                </div>
                <div className="flex justify-between items-center py-3 px-4 bg-gray-50 rounded-lg border border-gray-200">
                  <span className="font-medium text-gray-700">Regular Rate</span>
                  <span className="text-indigo-600 font-bold text-xl">₱2,000</span>
                </div>
              </div>
              <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm text-green-700 font-medium">
                  <strong>Early Bird Deadline:</strong> Valid Until August 31, 2025
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-purple-600 mb-4">Batch Commitment Pledge:</h3>
              <div className="bg-purple-50 rounded-lg p-6 border border-purple-200">
                <div className="text-center mb-4">
                  <span className="text-3xl font-bold text-purple-600">₱10,000</span>
                  <p className="text-gray-600">minimum per batch</p>
                </div>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• To be collected by Batch Coordinators</li>
                  <li>• Deadline: on or before August 31, 2025 (Extended)</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Payment Method Section */}
          <div className="border-t border-gray-200 pt-8">
            <h3 className="text-lg font-semibold text-blue-600 mb-6">Payment Method</h3>
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-200">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="flex-shrink-0">
                  <button
                    onClick={() => setShowGCashModal(true)}
                    className="transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg"
                  >
                    <img 
                      src="/images/gcash.jpg" 
                      alt="GCash Payment - Click to enlarge" 
                      className="w-32 h-32 object-contain rounded-lg shadow-md cursor-pointer hover:shadow-lg"
                    />
                  </button>
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h4 className="text-xl font-bold text-blue-700 mb-2">Pay via GCash</h4>
                  <div className="space-y-2">
                    <p className="text-gray-700 font-medium">
                      <strong>Ms. Bernice Jennifer Bontalilid</strong>
                    </p>
                    <p className="text-gray-600">
                      Finance and Sponsorship Committee
                    </p>
                  </div>
                  <div className="mt-4 p-3 bg-blue-100 rounded-lg">
                    <p className="text-sm text-blue-700 font-medium">
                      Scan the QR code or send payment to the GCash number provided
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Gifts, Tokens and Awards */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Gifts, Tokens and Awards</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg">
              <div className="text-2xl mb-2">🕐</div>
              <h3 className="font-semibold text-gray-800">Personalized Commemorative Clock</h3>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg">
              <div className="text-2xl mb-2">👕</div>
              <h3 className="font-semibold text-gray-800">Event T-Shirt</h3>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg">
              <div className="text-2xl mb-2">👜</div>
              <h3 className="font-semibold text-gray-800">Tote Bag</h3>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
              <div className="text-2xl mb-2">🏆</div>
              <h3 className="font-semibold text-gray-800">Certificate, Plaque and Token for Service Awardees</h3>
            </div>
          </div>
        </div>

        {/* Other Highlights */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Other Highlights</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <span className="w-2 h-2 bg-indigo-500 rounded-full mt-2"></span>
                <div>
                  <h3 className="font-semibold text-gray-800">Souvenir Program</h3>
                  <p className="text-sm text-gray-600">A commemorative booklet featuring event highlights, sponsor ads, messages, and alumni features</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <span className="w-2 h-2 bg-indigo-500 rounded-full mt-2"></span>
                <div>
                  <h3 className="font-semibold text-gray-800">Marketing Campaign</h3>
                  <p className="text-sm text-gray-600">Includes promotional materials such as ads, tarpaulins, event logo, t-shirt design, and a dedicated website</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <span className="w-2 h-2 bg-indigo-500 rounded-full mt-2"></span>
                <div>
                  <h3 className="font-semibold text-gray-800">Organizing Committee</h3>
                  <p className="text-sm text-gray-600">Assigned teams with clear roles to oversee planning and execution</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <span className="w-2 h-2 bg-indigo-500 rounded-full mt-2"></span>
                <div>
                  <h3 className="font-semibold text-gray-800">University Week Motorcade</h3>
                  <p className="text-sm text-gray-600">Alumni participation in the official motorcade celebration</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <span className="w-2 h-2 bg-purple-500 rounded-full mt-2"></span>
                <div>
                  <h3 className="font-semibold text-gray-800">Batch Coordinators</h3>
                  <p className="text-sm text-gray-600">Led by Governors/Class Mayors to manage batch engagement and communication</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <span className="w-2 h-2 bg-purple-500 rounded-full mt-2"></span>
                <div>
                  <h3 className="font-semibold text-gray-800">Election of New Alumni Officers</h3>
                  <p className="text-sm text-gray-600">With Batch 2001 (Silver Jubilarians) as the next official host</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <span className="w-2 h-2 bg-purple-500 rounded-full mt-2"></span>
                <div>
                  <h3 className="font-semibold text-gray-800">OFW Video Greetings</h3>
                  <p className="text-sm text-gray-600">15–30 second clips from overseas alumni wearing the official shirt and proudly showing their country's flag</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <span className="w-2 h-2 bg-purple-500 rounded-full mt-2"></span>
                <div>
                  <h3 className="font-semibold text-gray-800">Potential Activities</h3>
                  <p className="text-sm text-gray-600">Memorabilia Exhibit, Alumni Business Showcase, Photo Booth, Leave Your Mark Wall, Online Engagement, Silent Auction</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Awards Categories */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Awards Categories (25 Total Awardees)</h2>
          <p className="text-gray-600 mb-6">Covered Fields: Education, Government, IT Business, Law Enforcement, Judiciary, Arts & Media, & Entrepreneurship</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              "Pioneer in Tech and Innovation",
              "Public Service and Social Impact", 
              "Arts, Culture and Media Excellence",
              "Outstanding Entrepreneurial Spirit",
              "Leadership in Healthcare and Wellness",
              "Global Impact Excellence Award",
              "Young Alumni Achievement",
              "Excellence in Education and Academic Leadership",
              "Law Enforcement, Public Safety and Judiciary",
              "Lifetime Achievement Award"
            ].map((award, index) => (
              <div key={index} className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-lg p-4 border border-amber-200">
                <div className="text-sm font-medium text-gray-800">{award}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Expected Outcomes */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-8 text-white mb-8">
          <h2 className="text-2xl font-bold mb-6">Expected Outcomes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl mb-2">🤝</div>
              <h3 className="font-semibold mb-2">Reconnect alumni across all batches</h3>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">💡</div>
              <h3 className="font-semibold mb-2">Inspire students through alumni stories</h3>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">🏫</div>
              <h3 className="font-semibold mb-2">Strengthen alumni-college relationship</h3>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">🏆</div>
              <h3 className="font-semibold mb-2">Recognize contributions of distinguished alumni</h3>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">💰</div>
              <h3 className="font-semibold mb-2">Support future CIT programs (financial & in-kind)</h3>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">🌐</div>
              <h3 className="font-semibold mb-2">Build stronger alumni network for mentorship and collaboration</h3>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <button
            onClick={onRegister || onBack}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl mr-4"
          >
            Register Now
          </button>
          <button
            onClick={generateEventGuidePDF}
            className="bg-white border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-600 hover:text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300"
          >
            Download Event Guide
          </button>
        </div>
      </div>

      {/* GCash Modal */}
      {showGCashModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setShowGCashModal(false)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300 transition-colors"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <img
              src="/images/gcash.jpg"
              alt="GCash Payment QR Code"
              className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
              onClick={() => setShowGCashModal(false)}
            />
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white p-4 rounded-b-lg">
              <p className="text-center font-medium">
                <strong>Ms. Bernice Jennifer Bontalilid</strong> - Finance and Sponsorship Committee
              </p>
              <p className="text-center text-sm text-gray-300 mt-1">
                Click anywhere to close
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default EventDetails
