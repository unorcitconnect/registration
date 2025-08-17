import { useState } from 'react'
import jsPDF from 'jspdf'
import toast from 'react-hot-toast'

interface SponsorshipModalProps {
  isOpen: boolean
  onClose: () => void
  selectedLevel?: string
}

interface SponsorshipFormData {
  ID?: number
  email: string
  level: string
  requirement: string
  lastName: string
  firstName: string
  company: string
  address: string
  contactNumber: string
}

const SponsorshipModal = ({ isOpen, onClose, selectedLevel = '' }: SponsorshipModalProps) => {
  const [step, setStep] = useState<'email' | 'otp' | 'form'>('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState(['', '', '', ''])
  const [otpSent, setOtpSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [timeLeft, setTimeLeft] = useState(120) // 2 minutes in seconds
  const [existingSponsorship, setExistingSponsorship] = useState<SponsorshipFormData | null>(null)

  const [formData, setFormData] = useState<SponsorshipFormData>({
    email: '',
    level: selectedLevel,
    requirement: '',
    lastName: '',
    firstName: '',
    company: '',
    address: '',
    contactNumber: '',
  })

  const sponsorshipLevels = [
    'platinum',
    'gold',
    'silver',
    'bronze',
    'exhibitor package',
    'in-kind options',
    'equipment'
  ]

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const sendOTP = async () => {
    if (!email) {
      setError('Please enter your email address')
      return
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('http://localhost:8080/api/otp/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          purpose: 'sponsorship'
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setOtpSent(true)
        setStep('otp')
        // Start countdown timer
        const timer = setInterval(() => {
          setTimeLeft((prev) => {
            if (prev <= 1) {
              clearInterval(timer)
              return 0
            }
            return prev - 1
          })
        }, 1000)
      } else {
        setError(data.error || 'Failed to send OTP')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return // Only allow single digit
    
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)
    
    // Auto-focus next input
    if (value && index < 3) {
      const nextInput = document.getElementById(`otp-${index + 1}`)
      nextInput?.focus()
    }
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`)
      prevInput?.focus()
    }
  }

  const verifyOTP = async () => {
    const otpCode = otp.join('')
    if (otpCode.length !== 4) {
      setError('Please enter the complete 4-digit OTP code')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('http://localhost:8080/api/otp/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          code: otpCode,
          purpose: 'sponsorship'
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // Check if sponsorship exists for this email
        try {
          const sponsorshipResponse = await fetch(`http://localhost:8080/api/sponsorships/email/${encodeURIComponent(email)}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          })

          if (sponsorshipResponse.ok) {
            const sponsorshipData = await sponsorshipResponse.json()
            // User has existing sponsorship, load their data
            setExistingSponsorship(sponsorshipData)
            setFormData({
              email: email,
              firstName: sponsorshipData.FirstName || '',
              lastName: sponsorshipData.LastName || '',
              company: sponsorshipData.Company || '',
              contactNumber: sponsorshipData.ContactNumber || '',
              address: sponsorshipData.Address || '',
              level: sponsorshipData.Level || selectedLevel,
              requirement: sponsorshipData.Requirement || '',
            })
          } else {
            // No existing sponsorship, start with fresh form
            setFormData(prev => ({ ...prev, email: email }))
          }
        } catch (sponsorshipErr) {
          // If sponsorship check fails, continue with fresh form
          console.log('Failed to check existing sponsorship:', sponsorshipErr)
          setFormData(prev => ({ ...prev, email: email }))
        }

        setStep('form')
      } else {
        setError(data.error || 'Invalid OTP')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const submitSponsorship = async () => {
    setLoading(true)
    setError('')

    try {
      let response
      
      if (existingSponsorship) {
        // Update existing sponsorship
        response = await fetch(`http://localhost:8080/api/sponsorships/${existingSponsorship.ID}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        })
      } else {
        // Create new sponsorship
        response = await fetch('http://localhost:8080/api/sponsorships', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        })
      }

      const data = await response.json()

      if (response.ok) {
        toast.success(existingSponsorship ? 'Sponsorship application updated successfully!' : 'Sponsorship application submitted successfully!')
        onClose()
      } else {
        setError(data.error || 'Failed to submit sponsorship application')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const downloadSponsorshipPackage = () => {
    const pdf = new jsPDF()
    
    // Set font
    pdf.setFont('helvetica')
    
    // Header
    pdf.setFontSize(20)
    pdf.setTextColor(79, 70, 229) // Indigo color
    pdf.text('UNOR CIT Connect', 105, 20, { align: 'center' })
    
    pdf.setFontSize(16)
    pdf.setTextColor(31, 41, 55) // Gray color
    pdf.text('40th Anniversary Homecoming Celebration', 105, 30, { align: 'center' })
    pdf.text('Sponsorship Package', 105, 40, { align: 'center' })
    
    // Introduction
    pdf.setFontSize(12)
    pdf.setTextColor(0, 0, 0)
    pdf.text('Thank you for your interest in sponsoring our event!', 20, 60)
    pdf.text('We are celebrating 40 years as a College and 25 years of IT Education in Western Visayas.', 20, 70)
    
    // Sponsorship Levels
    pdf.setFontSize(14)
    pdf.setTextColor(31, 41, 55)
    pdf.text('Sponsorship Levels Available:', 20, 90)
    
    pdf.setFontSize(10)
    pdf.setTextColor(0, 0, 0)
    const levels = [
      'Platinum: Premium sponsorship with maximum visibility and exclusive benefits',
      'Gold: High-level sponsorship with excellent exposure and recognition',
      'Silver: Mid-level sponsorship with good visibility and networking opportunities',
      'Bronze: Entry-level sponsorship with basic exposure and acknowledgment',
      'Exhibitor Package: Exhibition space with basic amenities and setup',
      'In-Kind Options: Non-monetary contributions and service partnerships',
      'Equipment: Equipment sponsorship and technical support'
    ]
    
    let yPosition = 100
    levels.forEach((level) => {
      pdf.text(`• ${level}`, 25, yPosition)
      yPosition += 8
    })
    
    // Benefits
    pdf.setFontSize(14)
    pdf.setTextColor(31, 41, 55)
    pdf.text('Sponsorship Benefits Include:', 20, yPosition + 10)
    
    pdf.setFontSize(10)
    pdf.setTextColor(0, 0, 0)
    const benefits = [
      'Logo placement on event materials and promotional items',
      'Recognition during the event and ceremonies',
      'Networking opportunities with alumni and industry professionals',
      'Digital marketing exposure across our platforms',
      'Certificate of appreciation and partnership',
      'Access to exclusive sponsor events and activities'
    ]
    
    yPosition += 20
    benefits.forEach((benefit) => {
      pdf.text(`• ${benefit}`, 25, yPosition)
      yPosition += 8
    })
    
    // Contact Information
    pdf.setFontSize(14)
    pdf.setTextColor(31, 41, 55)
    pdf.text('Contact Information:', 20, yPosition + 15)
    
    pdf.setFontSize(11)
    pdf.setTextColor(0, 0, 0)
    pdf.text('Email: unorcitconnect@gmail.com', 25, yPosition + 25)
    pdf.text('Phone: 433-2449 loc 181', 25, yPosition + 35)
    pdf.text('Address: University of Negros Occidental - Recoletos, Bacolod City, Philippines', 25, yPosition + 45)
    
    // Footer
    pdf.setFontSize(10)
    pdf.setTextColor(100, 100, 100)
    pdf.text('UNOR CIT Connect Team', 20, yPosition + 65)
    pdf.text('University of Negros Occidental - Recoletos', 20, yPosition + 75)
    
    // Save the PDF
    pdf.save('UNOR_CIT_Connect_Sponsorship_Package.pdf')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-gray-400/40  flex items-center justify-center z-50 p-4">
      <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">
              Sponsorship Application
            </h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-indigo-100 mt-2">
            {step === 'email' && 'Enter your email to get started'}
            {step === 'otp' && 'Enter the verification code sent to your email'}
            {step === 'form' && 'Complete your sponsorship application'}
          </p>
        </div>

        {/* Progress Indicators */}
        <div className="px-6 py-4">
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-8">
              {/* Step 1 */}
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                  step === 'email' ? 'bg-indigo-600' : 
                  step === 'otp' || step === 'form' ? 'bg-gray-400' : 'bg-gray-300'
                }`}>
                  1
                </div>
                <span className="text-sm text-gray-600 mt-2">Email Verification</span>
              </div>
              
              {/* Line 1 */}
              <div className={`h-1 w-24 ${
                step === 'otp' || step === 'form' ? 'bg-gray-400' : 'bg-gray-300'
              }`}></div>
              
              {/* Step 2 */}
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                  step === 'otp' ? 'bg-indigo-600' : 
                  step === 'form' ? 'bg-gray-400' : 'bg-gray-300'
                }`}>
                  2
                </div>
                <span className="text-sm text-gray-600 mt-2">OTP Verification</span>
              </div>
              
              {/* Line 2 */}
              <div className={`h-1 w-24 ${
                step === 'form' ? 'bg-gray-400' : 'bg-gray-300'
              }`}></div>
              
              {/* Step 3 */}
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                  step === 'form' ? 'bg-indigo-600' : 'bg-gray-300'
                }`}>
                  3
                </div>
                <span className="text-sm text-gray-600 mt-2">Sponsorship Form</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          {/* Step 1: Email Input */}
          {step === 'email' && (
            <div className="text-center space-y-6">
              {/* Email Icon */}
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-indigo-600 rounded-lg flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              
              {/* Title and Description */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Enter Your Email Address</h3>
                <p className="text-gray-600">We'll send you a verification code to confirm your identity</p>
              </div>
              
              {/* Email Input */}
              <div className="text-left">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                  placeholder="Email Address"
                />
              </div>
              
              {/* Send Code Button */}
              <div className="flex justify-end">
                <button
                  onClick={sendOTP}
                  disabled={loading}
                  className="bg-gray-300 hover:bg-gray-400 disabled:bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  {loading ? 'Sending...' : 'Send Code'}
                </button>
              </div>
            </div>
          )}

          {/* Step 2: OTP Verification */}
          {step === 'otp' && (
            <div className="text-center space-y-6">
              {/* Shield Icon */}
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-indigo-600 rounded-lg flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
              </div>
              
              {/* Title */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Enter Verification Code</h3>
              </div>
              
              {/* Information Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <div className="text-center">
                    <p className="text-blue-800 font-medium">
                      We've sent a 4-digit code to <strong>{email}</strong>
                    </p>
                    <p className="text-blue-700 text-sm mt-1">
                      Code expires in: <span className="font-mono font-bold">{formatTime(timeLeft)}</span>
                    </p>
                  </div>
                </div>
              </div>
              
              {/* OTP Input Fields */}
              <div className="flex justify-center space-x-3 mb-8">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value.replace(/\D/g, ''))}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    className="w-16 h-16 text-center text-2xl font-mono border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    maxLength={1}
                  />
                ))}
              </div>
              
              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={() => setStep('email')}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-lg font-medium transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={verifyOTP}
                  disabled={loading || otp.join('').length !== 4}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white py-3 rounded-lg font-medium transition-colors"
                >
                  {loading ? 'Verifying...' : 'Verify Code'}
                </button>
              </div>
              
              {/* Resend Button */}
              <button
                onClick={sendOTP}
                disabled={loading || timeLeft > 0}
                className="w-full text-indigo-600 hover:text-indigo-800 text-sm font-medium disabled:text-gray-400"
              >
                {timeLeft > 0 ? `Resend code in ${formatTime(timeLeft)}` : 'Resend verification code'}
              </button>
            </div>
          )}

          {/* Step 3: Sponsorship Form */}
          {step === 'form' && (
            <div className="space-y-4">
              {/* Existing Sponsorship Alert */}
              {existingSponsorship && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="font-medium">Existing Sponsorship Found!</p>
                      <p className="text-sm">We found your previous sponsorship application. You can update your information below.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Sponsorship Package Download Section */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Sponsorship Information</h3>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center">
                        <svg className="w-5 h-5 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                        <p className="text-blue-800 font-medium">Download Sponsorship Package</p>
                      </div>
                      <p className="text-blue-700 text-sm mt-1">
                        Get detailed information about sponsorship levels and benefits
                      </p>
                    </div>
                    <button
                      onClick={downloadSponsorshipPackage}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      Download
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company *
                  </label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Number *
                  </label>
                  <input
                    type="tel"
                    value={formData.contactNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, contactNumber: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address *
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  rows={3}
                  placeholder="Enter your complete address"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sponsorship Level *
                </label>
                <select
                  value={formData.level}
                  onChange={(e) => setFormData(prev => ({ ...prev, level: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                >
                  <option value="">Select sponsorship level</option>
                  {sponsorshipLevels.map((level) => (
                    <option key={level} value={level}>
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Requirements / Additional Information
                </label>
                <textarea
                  value={formData.requirement}
                  onChange={(e) => setFormData(prev => ({ ...prev, requirement: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  rows={4}
                  placeholder="Please describe your requirements or any additional information..."
                />
              </div>

              {/* Contact Information */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center mb-3">
                    <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="font-medium text-blue-800">Email:</span>
                    <span className="text-blue-700 ml-2">unorcitconnect@gmail.com</span>
                  </div>
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span className="font-medium text-blue-800">Phone:</span>
                    <span className="text-blue-700 ml-2">433-2449 loc 181</span>
                  </div>
                </div>

                <h4 className="text-md font-semibold text-gray-900 mb-3">Alternative Sponsorship Options</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <svg className="w-8 h-8 text-green-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    <h5 className="font-semibold text-gray-900">In-Kind Options</h5>
                    <p className="text-sm text-gray-600">Non-monetary contributions</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <svg className="w-8 h-8 text-purple-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <h5 className="font-semibold text-gray-900">Equipment Sponsorship</h5>
                    <p className="text-sm text-gray-600">Equipment sponsorship and support</p>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setStep('otp')}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-lg font-medium transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={submitSponsorship}
                  disabled={loading || !formData.firstName || !formData.lastName || !formData.company || !formData.contactNumber || !formData.address || !formData.level}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white py-3 rounded-lg font-medium transition-colors"
                >
                  {loading ? (existingSponsorship ? 'Updating...' : 'Submitting...') : (existingSponsorship ? 'Update Application' : 'Submit Application')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SponsorshipModal
