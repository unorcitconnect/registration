import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  Typography,
  Box,
  Stepper,
  Step,
  StepLabel,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Chip,
  IconButton,
  Paper,
} from '@mui/material'
import {
  Close as CloseIcon,
  Email as EmailIcon,
  Security as SecurityIcon,
  Person as PersonIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
} from '@mui/icons-material'

interface RegistrationModalProps {
  open: boolean
  onClose: () => void
  onSuccess?: () => void
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
  ID: number
  Name: string
  Code: string
}

interface Course {
  ID: number
  Code: string
  Name: string
}

const steps = ['Email Verification', 'OTP Verification', 'Registration Form']

const RegistrationModalMD = ({ open, onClose, onSuccess }: RegistrationModalProps) => {
  const [activeStep, setActiveStep] = useState(0)
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState(['', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [existingAlumni, setExistingAlumni] = useState<Alumni | null>(null)
  const [timeLeft, setTimeLeft] = useState(120)
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

  useEffect(() => {
    if (open) {
      console.log('Modal opened, fetching countries and courses...')
      fetchCountries()
      fetchCourses()
      
      // Add hardcoded data for testing
      setCountries([
        { ID: 1, Name: 'Philippines', Code: 'PH' },
        { ID: 2, Name: 'United States', Code: 'US' },
        { ID: 3, Name: 'Canada', Code: 'CA' },
        { ID: 4, Name: 'Australia', Code: 'AU' },
        { ID: 5, Name: 'United Kingdom', Code: 'GB' }
      ])
      
      setCourses([
        { ID: 1, Code: 'BSCS', Name: 'Bachelor of Science in Computer Science' },
        { ID: 2, Code: 'BSIT', Name: 'Bachelor of Science in Information Technology' },
        { ID: 3, Code: 'BSIM', Name: 'Bachelor of Science in Information Management' },
        { ID: 4, Code: 'BSIS', Name: 'Bachelor of Science in Information Systems' },
        { ID: 5, Code: 'BSEMC', Name: 'Bachelor of Science in Entertainment and Multimedia Computing' },
        { ID: 6, Code: 'BSCCS', Name: 'Commerce major in Computer Science' }
      ])
    }
  }, [open])

  const fetchCountries = async () => {
    console.log('Fetching countries...')
    setCountriesLoading(true)
    try {
      const response = await fetch('http://localhost:8080/api/countries')
      console.log('Countries response status:', response.status)
      if (response.ok) {
        const data = await response.json()
        console.log('Countries data received:', data.length, 'countries')
        setCountries(data)
      } else {
        console.error('Countries fetch failed with status:', response.status)
      }
    } catch (err) {
      console.error('Failed to fetch countries:', err)
    } finally {
      setCountriesLoading(false)
    }
  }

  const fetchCourses = async () => {
    console.log('Fetching courses...')
    setCoursesLoading(true)
    try {
      const response = await fetch('http://localhost:8080/api/courses')
      console.log('Courses response status:', response.status)
      if (response.ok) {
        const data = await response.json()
        console.log('Courses data received:', data.length, 'courses')
        setCourses(data)
      } else {
        console.error('Courses fetch failed with status:', response.status)
      }
    } catch (err) {
      console.error('Failed to fetch courses:', err)
    } finally {
      setCoursesLoading(false)
    }
  }

  const sendOTP = async () => {
    if (!email) {
      setError('Please enter your email address')
      return
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('http://localhost:8080/api/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, purpose: 'registration' }),
      })

      const data = await response.json()

      if (response.ok) {
        setActiveStep(1)
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: otpCode, purpose: 'registration' }),
      })

      const data = await response.json()

      if (response.ok) {
        if (data.alumni_exists && data.alumni_data) {
          setExistingAlumni(data.alumni_data)
          // Map backend field names (PascalCase) to frontend field names (camelCase)
          setFormData({
            id: data.alumni_data.ID,
            firstName: data.alumni_data.FirstName || '',
            lastName: data.alumni_data.LastName || '',
            email: email,
            phone: data.alumni_data.Phone || '',
            year: data.alumni_data.Year || new Date().getFullYear(),
            course: data.alumni_data.Course || '',
            company: data.alumni_data.Company || '',
            position: data.alumni_data.Position || '',
            country: data.alumni_data.Country || '',
            city: data.alumni_data.City || '',
            latitude: data.alumni_data.Latitude,
            longitude: data.alumni_data.Longitude,
            paid: data.alumni_data.Paid,
            paymentProof: data.alumni_data.PaymentProof
          })
        } else {
          setFormData(prev => ({ ...prev, email }))
        }
        setActiveStep(2)
      } else {
        setError(data.error || 'Invalid OTP')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const submitRegistration = async () => {
    setLoading(true)
    setError('')

    console.log('🚀 SUBMIT REGISTRATION FUNCTION CALLED!')
    console.log('=== SUBMIT REGISTRATION DEBUG (MD) ===')
    console.log('existingAlumni:', existingAlumni)
    console.log('formData:', formData)
    console.log('formData.id:', formData.id, 'Type:', typeof formData.id)
    console.log('paymentProofFile:', paymentProofFile)
    console.log('paymentProofFile details:', paymentProofFile ? {
      name: paymentProofFile.name,
      size: paymentProofFile.size,
      type: paymentProofFile.type
    } : 'No file')

    try {
      // Use formData.id which should have the correct ID from OTP verification
      const url = formData.id 
        ? `http://localhost:8080/api/alumni/${formData.id}`
        : 'http://localhost:8080/api/alumni'
      
      const method = formData.id ? 'PUT' : 'POST'
      
      console.log('Final URL:', url)
      console.log('Final method:', method)

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
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        })
      }

      const data = await response.json()

      if (response.ok) {
        toast.success(existingAlumni ? 'Profile updated successfully!' : 'Registration completed successfully!')
        // Call success callback to trigger map refresh
        if (onSuccess) {
          onSuccess()
        } else {
          onClose()
        }
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

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return
    
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)
    
    if (value && index < 3) {
      const nextInput = document.getElementById(`otp-${index + 1}`)
      nextInput?.focus()
    }
  }

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <EmailIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Enter Your Email Address
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              We'll send you a verification code to confirm your identity
            </Typography>
            <TextField
              fullWidth
              type="email"
              label="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              variant="outlined"
              sx={{ mb: 3 }}
            />
          </Box>
        )

      case 1:
        return (
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <SecurityIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Enter Verification Code
            </Typography>
            <Alert severity="info" sx={{ mb: 3 }}>
              We've sent a 4-digit code to <strong>{email}</strong>
              <br />
              Code expires in: <Chip label={formatTime(timeLeft)} size="small" />
            </Alert>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 3 }}>
              {otp.map((digit, index) => (
                <TextField
                  key={index}
                  id={`otp-${index}`}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value.replace(/\D/g, ''))}
                  inputProps={{
                    maxLength: 1,
                    style: { textAlign: 'center', fontSize: '1.5rem' }
                  }}
                  sx={{ width: 56 }}
                />
              ))}
            </Box>
          </Box>
        )

      case 2:
        return (
          <Box sx={{ py: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <PersonIcon sx={{ fontSize: 32, color: 'primary.main', mr: 1 }} />
              <Typography variant="h6">
                {existingAlumni ? 'Update Your Profile' : 'Complete Registration'}
              </Typography>
            </Box>

            {existingAlumni && (
              <Alert severity="success" sx={{ mb: 3 }}>
                Welcome back! We found your existing profile. You can update your information below.
              </Alert>
            )}

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                <TextField
                  fullWidth
                  label="First Name"
                  value={formData.firstName}
                  onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                  required
                />
                <TextField
                  fullWidth
                  label="Last Name"
                  value={formData.lastName}
                  onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                  required
                />
              </Box>
              
              <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                />
                <TextField
                  fullWidth
                  type="number"
                  label="Graduation Year"
                  value={formData.year}
                  onChange={(e) => setFormData(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                  inputProps={{ min: 1980, max: new Date().getFullYear() }}
                  required
                />
              </Box>

              <FormControl fullWidth required disabled={coursesLoading}>
                <InputLabel>Course/Program</InputLabel>
                <Select
                  value={formData.course}
                  label="Course/Program"
                  onChange={(e) => setFormData(prev => ({ ...prev, course: e.target.value }))}
                >
                  {courses.map((course) => (
                    <MenuItem key={course.ID} value={course.Name}>
                      {course.Name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                <TextField
                  fullWidth
                  label="Current Company"
                  value={formData.company}
                  onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                />
                <TextField
                  fullWidth
                  label="Current Position"
                  value={formData.position}
                  onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
                />
              </Box>

              <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                <FormControl fullWidth required disabled={countriesLoading}>
                  <InputLabel>Country</InputLabel>
                  <Select
                    value={formData.country}
                    label="Country"
                    onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                  >
                    {countries.map((country) => (
                      <MenuItem key={country.ID} value={country.Name}>
                        {country.Name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  fullWidth
                  label="City"
                  value={formData.city}
                  onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                />
              </Box>
            </Box>

            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <WarningIcon sx={{ color: 'warning.main', mr: 1 }} />
                  <Typography variant="h6">Homecoming Event Payment</Typography>
                </Box>
                <Alert severity="warning" sx={{ mb: 2 }}>
                  Payment is required for event participation. Please upload your payment receipt.
                </Alert>
                <Button
                  variant="outlined"
                  component="label"
                  fullWidth
                  sx={{ mb: 1 }}
                >
                  Upload Payment Proof
                  <input
                    type="file"
                    hidden
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
                        console.log('📎 File selected:', file.name, 'Size:', file.size, 'Type:', file.type)
                        
                        // Store file for upload when form is submitted
                        setPaymentProofFile(file)
                        setFormData(prev => ({ 
                          ...prev, 
                          paymentProof: file.name,
                          paid: true 
                        }))
                      } else {
                        // File was deselected
                        setPaymentProofFile(null)
                        setFormData(prev => ({ 
                          ...prev, 
                          paymentProof: '',
                          paid: false 
                        }))
                      }
                    }}
                  />
                </Button>
                {formData.paymentProof && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <CheckCircleIcon sx={{ color: 'success.main', mr: 1 }} />
                    <Typography variant="body2" color="success.main">
                      Payment proof uploaded: {formData.paymentProof}
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Box>
        )

      default:
        return null
    }
  }

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: { 
          borderRadius: 2,
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(8px)',
          overflow: 'visible'
        }
      }}
    >
      {/* Custom Header with Gradient Background */}
      <Box sx={{ 
        background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
        color: 'white',
        p: 3,
        borderRadius: '8px 8px 0 0'
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
            {existingAlumni ? 'Update Profile' : 'Alumni Registration'}
          </Typography>
          <IconButton onClick={onClose} size="small" sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', mt: 1 }}>
          {activeStep === 0 && 'Enter your email to get started'}
          {activeStep === 1 && 'Enter the verification code sent to your email'}
          {activeStep === 2 && (existingAlumni ? 'Update your information' : 'Complete your registration')}
        </Typography>
      </Box>

      {/* Progress Indicators */}
      <Box sx={{ px: 3, py: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {/* Step 1 */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Box sx={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold',
                backgroundColor: activeStep === 0 ? '#4f46e5' : (activeStep > 0 ? '#9ca3af' : '#d1d5db')
              }}>
                1
              </Box>
              <Typography variant="caption" sx={{ color: '#6b7280', mt: 1 }}>
                Email Verification
              </Typography>
            </Box>
            
            {/* Line 1 */}
            <Box sx={{
              height: 2,
              width: 96,
              backgroundColor: activeStep > 0 ? '#9ca3af' : '#d1d5db'
            }} />
            
            {/* Step 2 */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Box sx={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold',
                backgroundColor: activeStep === 1 ? '#4f46e5' : (activeStep > 1 ? '#9ca3af' : '#d1d5db')
              }}>
                2
              </Box>
              <Typography variant="caption" sx={{ color: '#6b7280', mt: 1 }}>
                OTP Verification
              </Typography>
            </Box>
            
            {/* Line 2 */}
            <Box sx={{
              height: 2,
              width: 96,
              backgroundColor: activeStep > 1 ? '#9ca3af' : '#d1d5db'
            }} />
            
            {/* Step 3 */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Box sx={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold',
                backgroundColor: activeStep === 2 ? '#4f46e5' : '#d1d5db'
              }}>
                3
              </Box>
              <Typography variant="caption" sx={{ color: '#6b7280', mt: 1 }}>
                Registration Form
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {renderStepContent()}
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        {activeStep > 0 && (
          <Button onClick={() => setActiveStep(activeStep - 1)} disabled={loading}>
            Back
          </Button>
        )}
        <Box sx={{ flex: 1 }} />
        {activeStep === 0 && (
          <button
            onClick={sendOTP}
            disabled={loading || !email}
            style={{
              backgroundColor: loading || !email ? '#e5e7eb' : '#d1d5db',
              color: loading || !email ? '#9ca3af' : '#374151',
              border: 'none',
              padding: '8px 24px',
              borderRadius: '8px',
              fontWeight: '500',
              cursor: loading || !email ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => {
              if (!loading && email) {
                e.currentTarget.style.backgroundColor = '#9ca3af'
              }
            }}
            onMouseLeave={(e) => {
              if (!loading && email) {
                e.currentTarget.style.backgroundColor = '#d1d5db'
              }
            }}
          >
            {loading ? 'Sending...' : 'Send Code'}
          </button>
        )}
        {activeStep === 1 && (
          <>
            <Button
              variant="outlined"
              onClick={sendOTP}
              disabled={loading || timeLeft > 0}
              size="small"
            >
              {timeLeft > 0 ? `Resend (${formatTime(timeLeft)})` : 'Resend Code'}
            </Button>
            <Button
              variant="contained"
              onClick={verifyOTP}
              disabled={loading || otp.join('').length !== 4}
              startIcon={loading ? <CircularProgress size={20} /> : null}
            >
              {loading ? 'Verifying...' : 'Verify'}
            </Button>
          </>
        )}
        {activeStep === 2 && (
          <Button
            variant="contained"
            onClick={() => {
              console.log('🔥 BUTTON CLICKED!')
              console.log('Button disabled?', loading || !formData.firstName || !formData.lastName || !formData.course || !formData.country)
              console.log('Loading:', loading)
              console.log('Form validation:')
              console.log('  firstName:', formData.firstName, 'Valid:', !!formData.firstName)
              console.log('  lastName:', formData.lastName, 'Valid:', !!formData.lastName)
              console.log('  course:', formData.course, 'Valid:', !!formData.course)
              console.log('  country:', formData.country, 'Valid:', !!formData.country)
              submitRegistration()
            }}
            disabled={loading || !formData.firstName || !formData.lastName || !formData.course || !formData.country}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? 'Saving...' : (existingAlumni ? 'Update Profile' : 'Complete Registration')}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  )
}

export default RegistrationModalMD
