import { useState, useEffect } from 'react'

interface RegistrationModalProps {
  onClose: () => void
}

interface Alumni {
  id?: number
  firstName: string
  lastName: string
  email: string
  phone: string
  year: number
  course: string
  company: string
  position: string
  country: string
  city: string
  latitude?: number
  longitude?: number
  paid?: boolean
  paymentProof?: string
}

interface Country {
  id: number
  name: string
  code: string
}

interface Course {
  id: number
  code: string
  name: string
}

const RegistrationModal = ({ onClose }: RegistrationModalProps) => {
  console.log('🚀 REGISTRATION MODAL LOADED - NEW VERSION WITH DEBUGGING!')
  const [step, setStep] = useState<'email' | 'otp' | 'form'>('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState(['', '', '', ''])
  const [otpSent, setOtpSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [existingAlumni, setExistingAlumni] = useState<Alumni | null>(null)
  const [alumniId, setAlumniId] = useState<number | null>(null) // Separate state for ID
  const [timeLeft, setTimeLeft] = useState(120) // 2 minutes in seconds
  const [timer, setTimer] = useState<number | null>(null)
  const [countries, setCountries] = useState<Country[]>([])
  const [countriesLoading, setCountriesLoading] = useState(false)
  const [courses, setCourses] = useState<Course[]>([])
  const [coursesLoading, setCoursesLoading] = useState(false)

  const [formData, setFormData] = useState<Alumni>({
    id: undefined,
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    year: new Date().getFullYear(),
    course: '',
    company: '',
    position: '',
    country: 'Philippines',
    city: ''
  })
  const [paymentProofFile, setPaymentProofFile] = useState<File | null>(null)

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timer) {
        clearInterval(timer)
      }
    }
  }, [timer])

  // Debug: Track formData changes
  useEffect(() => {
    console.log('FormData changed:', formData)
    console.log('FormData ID:', formData.id, 'Type:', typeof formData.id)
  }, [formData])

  // Fetch countries and courses when component mounts
  useEffect(() => {
    const fetchCountries = async () => {
      setCountriesLoading(true)
      try {
        const response = await fetch('/api/countries')
        if (response.ok) {
          const data = await response.json()
          setCountries(data)
        }
      } catch (err) {
        console.error('Failed to fetch countries:', err)
      } finally {
        setCountriesLoading(false)
      }
    }

    const fetchCourses = async () => {
      setCoursesLoading(true)
      try {
        const response = await fetch('/api/courses')
        if (response.ok) {
          const data = await response.json()
          setCourses(data)
        }
      } catch (err) {
        console.error('Failed to fetch courses:', err)
      } finally {
        setCoursesLoading(false)
      }
    }

    fetchCountries()
    fetchCourses()
  }, [])

  const startTimer = () => {
    // Clear previous timer if exists
    if (timer) {
      clearInterval(timer)
      setTimer(null)
    }
    
    // Reset timer to 2 minutes (120 seconds)
    setTimeLeft(120)
    
    // Start countdown timer
    const newTimer = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(newTimer)
          setTimer(null)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    setTimer(newTimer)
  }

  const sendOTP = async () => {
    if (!email) {
      setError('Please enter your email address')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/otp/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          purpose: 'registration'
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setOtpSent(true)
        setStep('otp')
        // Reset OTP fields
        setOtp(['', '', '', ''])
        // Start/restart timer
        startTimer()
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
    console.log('=== VERIFY OTP FUNCTION CALLED ===')
    console.log('OTP array:', otp)
    
    const otpCode = otp.join('')
    console.log('OTP code joined:', otpCode, 'Length:', otpCode.length)
    
    if (otpCode.length !== 4) {
      console.log('OTP validation failed - length not 4')
      setError('Please enter the complete 4-digit OTP code')
      return
    }

    console.log('Starting OTP verification...')
    setLoading(true)
    setError('')

    try {
      console.log('Making fetch request to verify OTP...')
      const response = await fetch('/api/otp/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          code: otpCode,
          purpose: 'registration'
        }),
      })

      console.log('Fetch response received, status:', response.status)
      const data = await response.json()
      console.log('=== OTP VERIFICATION RESPONSE DEBUG ===')
      console.log('Full response:', data)
      console.log('response.ok:', response.ok)
      console.log('data.alumni_exists:', data.alumni_exists)
      console.log('data.alumni_data:', data.alumni_data)
      console.log('Condition check (data.alumni_exists && data.alumni_data):', data.alumni_exists && data.alumni_data)

      if (response.ok) {
        if (data.alumni_exists && data.alumni_data) {
          console.log('Raw alumni data from backend:', data.alumni_data)
          setExistingAlumni(data.alumni_data)
          
          // Extract ID from alumni data - Backend returns uppercase 'ID'
          const alumniId = data.alumni_data.ID || data.alumni_data.id
          
          console.log('Alumni ID used:', alumniId, 'Type:', typeof alumniId)
          
          // Map backend field names to frontend field names
          const mappedData = {
            id: Number(alumniId),
            firstName: data.alumni_data.FirstName || data.alumni_data.firstName || '',
            lastName: data.alumni_data.LastName || data.alumni_data.lastName || '',
            email: email,
            phone: data.alumni_data.Phone || data.alumni_data.phone || '',
            year: data.alumni_data.Year || data.alumni_data.year || new Date().getFullYear(),
            course: data.alumni_data.Course || data.alumni_data.course || '',
            company: data.alumni_data.Company || data.alumni_data.company || '',
            position: data.alumni_data.Position || data.alumni_data.position || '',
            country: data.alumni_data.Country || data.alumni_data.country || '',
            city: data.alumni_data.City || data.alumni_data.city || '',
            latitude: data.alumni_data.Latitude || data.alumni_data.latitude,
            longitude: data.alumni_data.Longitude || data.alumni_data.longitude,
            paid: data.alumni_data.Paid || data.alumni_data.paid || false,
            paymentProof: data.alumni_data.PaymentProof || data.alumni_data.paymentProof || ''
          }
          
          console.log('Final mapped form data:', mappedData)
          setAlumniId(Number(alumniId)) // Store ID separately
          setFormData(mappedData)
        } else {
          console.log('No existing alumni found, creating new registration')
          setAlumniId(null)
          setFormData(prev => ({ ...prev, email: email, id: undefined }))
        }
        setStep('form')
      } else {
        setError(data.error || 'Invalid OTP')
      }
    } catch (err) {
      console.error('OTP verification error:', err)
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const submitRegistration = async () => {
    console.log('🚀 SUBMIT REGISTRATION FUNCTION CALLED!')
    setLoading(true)
    setError('')

    console.log('=== SUBMIT REGISTRATION DEBUG ===')
    console.log('existingAlumni:', existingAlumni)
    console.log('alumniId (separate state):', alumniId, 'Type:', typeof alumniId)
    console.log('formData:', formData)
    console.log('formData.id:', formData.id, 'Type:', typeof formData.id)
    console.log('paymentProofFile:', paymentProofFile)
    console.log('paymentProofFile details:', paymentProofFile ? {
      name: paymentProofFile.name,
      size: paymentProofFile.size,
      type: paymentProofFile.type
    } : 'No file')
    console.log('email being used:', email)

    try {
      // DIRECT APPROACH: Use formData.id since it's clearly present in the payload
      let url, method
      
      // Check if formData has an ID (which it clearly does based on the payload)
      if (formData.id) {
        url = `/api/alumni/${formData.id}`
        method = 'PUT'
        console.log('Using UPDATE mode with formData.id:', formData.id)
      } else if (alumniId) {
        url = `/api/alumni/${alumniId}`
        method = 'PUT'
        console.log('Using UPDATE mode with alumniId:', alumniId)
      } else {
        // Create new alumni
        url = '/api/alumni'
        method = 'POST'
        console.log('Using CREATE mode')
      }

      console.log('Final URL:', url)
      console.log('Final method:', method)
      console.log('Final data:', formData)

      let response
      
      // If there's a file, send as multipart form data
      if (paymentProofFile) {
        console.log('Sending as multipart form data with file')
        const formDataToSend = new FormData()
        
        // Add all form fields
        formDataToSend.append('firstName', formData.firstName)
        formDataToSend.append('lastName', formData.lastName)
        formDataToSend.append('email', formData.email)
        formDataToSend.append('phone', formData.phone)
        formDataToSend.append('year', formData.year.toString())
        formDataToSend.append('course', formData.course)
        formDataToSend.append('company', formData.company)
        formDataToSend.append('position', formData.position)
        formDataToSend.append('country', formData.country)
        formDataToSend.append('city', formData.city)
        
        // Add coordinates if they exist
        if (formData.latitude) formDataToSend.append('latitude', formData.latitude.toString())
        if (formData.longitude) formDataToSend.append('longitude', formData.longitude.toString())
        
        // Add the file
        formDataToSend.append('payment_proof', paymentProofFile)
        
        response = await fetch(url, {
          method: method,
          body: formDataToSend, // No Content-Type header - browser will set it with boundary
        })
      } else {
        console.log('Sending as JSON (no file)')
        response = await fetch(url, {
          method: method,
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        })
      }

      const data = await response.json()

      if (response.ok) {
        alert(existingAlumni ? 'Profile updated successfully!' : 'Registration completed successfully!')
        onClose()
      } else {
        setError(data.error || 'Failed to save registration')
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">
              {existingAlumni ? 'Update Profile' : 'Alumni Registration'}
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
            {step === 'form' && (existingAlumni ? 'Update your information' : 'Complete your registration')}
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
                <span className="text-sm text-gray-600 mt-2">Registration Form</span>
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
            <div className="space-y-4">
              <div className="text-center">
                <div className="bg-indigo-50 rounded-lg p-4 mb-4">
                  <p className="text-indigo-700">
                    We've sent a 4-digit verification code to <strong>{email}</strong>
                  </p>
                  <p className="text-sm text-indigo-600 mt-2">
                    Code expires in: <span className="font-mono font-bold">{formatTime(timeLeft)}</span>
                  </p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Verification Code
                </label>
                <div className="flex justify-center space-x-3">
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
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setStep('email')}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-lg font-medium transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={() => {
                    console.log('BUTTON CLICKED!')
                    console.log('OTP length check:', otp.join('').length)
                    console.log('Loading state:', loading)
                    console.log('Button disabled?', loading || otp.join('').length !== 4)
                    verifyOTP()
                  }}
                  disabled={loading || otp.join('').length !== 4}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white py-3 rounded-lg font-medium transition-colors"
                >
                  {loading ? 'Verifying...' : 'Verify Code'}
                </button>
              </div>
              
              <button
                onClick={sendOTP}
                disabled={loading || timeLeft > 0}
                className="w-full text-indigo-600 hover:text-indigo-800 text-sm font-medium disabled:text-gray-400"
              >
                {timeLeft > 0 ? `Resend code in ${formatTime(timeLeft)}` : 'Resend verification code'}
              </button>
            </div>
          )}

          {/* Step 3: Registration Form */}
          {step === 'form' && (
            <div className="space-y-4">
              {existingAlumni && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
                  Welcome back! We found your existing profile. You can update your information below.
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      firstName: e.target.value,
                      id: prev.id || (existingAlumni as any)?.ID || existingAlumni?.id // Preserve ID
                    }))}
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
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      lastName: e.target.value,
                      id: prev.id || (existingAlumni as any)?.ID || existingAlumni?.id // Preserve ID
                    }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      phone: e.target.value,
                      id: prev.id || (existingAlumni as any)?.ID || existingAlumni?.id // Preserve ID
                    }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Graduation Year *
                  </label>
                  <input
                    type="number"
                    value={formData.year}
                    onChange={(e) => setFormData(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    min="1980"
                    max={new Date().getFullYear()}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course/Program *
                </label>
                <select
                  value={formData.course}
                  onChange={(e) => setFormData(prev => ({ ...prev, course: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                  disabled={coursesLoading}
                >
                  <option value="">
                    {coursesLoading ? 'Loading courses...' : 'Select a course'}
                  </option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.name}>
                      {course.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Company
                  </label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Position
                  </label>
                  <input
                    type="text"
                    value={formData.position}
                    onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country *
                  </label>
                  <select
                    value={formData.country}
                    onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                    disabled={countriesLoading}
                  >
                    <option value="">
                      {countriesLoading ? 'Loading countries...' : 'Select a country'}
                    </option>
                    {countries.map((country) => (
                      <option key={country.id} value={country.name}>
                        {country.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Payment Section */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Homecoming Event Payment</h3>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-amber-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <p className="text-amber-800 font-medium">Payment Required for Event Participation</p>
                  </div>
                  <p className="text-amber-700 text-sm mt-2">
                    Please upload your payment receipt or proof of payment to complete your registration for the homecoming event.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Proof/Receipt (PDF only, Max 5MB)
                  </label>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        // Validate file type and size
                        if (file.type !== 'application/pdf') {
                          setError('Only PDF files are allowed for payment proof')
                          return
                        }
                        if (file.size > 5 * 1024 * 1024) { // 5MB
                          setError('File size must be less than 5MB')
                          return
                        }
                        setError('') // Clear any previous errors
                        setPaymentProofFile(file) // Store the actual file object
                        setFormData(prev => ({ 
                          ...prev, 
                          paymentProof: file.name,
                          paid: true 
                        }))
                      } else {
                        setPaymentProofFile(null)
                        setFormData(prev => ({ 
                          ...prev, 
                          paymentProof: '',
                          paid: false 
                        }))
                      }
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Only PDF files accepted (Max 5MB)
                  </p>
                  {formData.paymentProof && (
                    <div className="mt-2 flex items-center text-green-600">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm">Payment proof selected: {formData.paymentProof}</span>
                    </div>
                  )}
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
                  onClick={() => {
                    console.log('=== SUBMIT BUTTON CLICKED ===')
                    console.log('Button disabled?', loading || !formData.firstName || !formData.lastName || !formData.year || !formData.course || !formData.country)
                    console.log('Loading:', loading)
                    console.log('Form validation:')
                    console.log('  firstName:', formData.firstName, 'Valid:', !!formData.firstName)
                    console.log('  lastName:', formData.lastName, 'Valid:', !!formData.lastName)
                    console.log('  year:', formData.year, 'Valid:', !!formData.year)
                    console.log('  course:', formData.course, 'Valid:', !!formData.course)
                    console.log('  country:', formData.country, 'Valid:', !!formData.country)
                    submitRegistration()
                  }}
                  disabled={loading || !formData.firstName || !formData.lastName || !formData.year || !formData.course || !formData.country}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white py-3 rounded-lg font-medium transition-colors"
                >
                  {loading ? 'Saving...' : (existingAlumni ? 'Update Profile' : 'Complete Registration')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default RegistrationModal
