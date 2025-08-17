import { useState } from 'react'
import jsPDF from 'jspdf'
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
  Business as BusinessIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Download as DownloadIcon,
} from '@mui/icons-material'

interface SponsorshipModalProps {
  open: boolean
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

const steps = ['Email Verification', 'OTP Verification', 'Sponsorship Form']

const SponsorshipModalMD = ({ open, onClose, selectedLevel = '' }: SponsorshipModalProps) => {
  const [activeStep, setActiveStep] = useState(0)
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState(['', '', '', ''])
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
        setActiveStep(1)
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
              <BusinessIcon sx={{ fontSize: 32, color: 'primary.main', mr: 1 }} />
              <Typography variant="h6">
                {existingSponsorship ? 'Update Your Sponsorship' : 'Complete Sponsorship Application'}
              </Typography>
            </Box>

            {existingSponsorship && (
              <Alert severity="success" sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CheckCircleIcon sx={{ mr: 1 }} />
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      Existing Sponsorship Found!
                    </Typography>
                    <Typography variant="body2">
                      We found your previous sponsorship application. You can update your information below.
                    </Typography>
                  </Box>
                </Box>
              </Alert>
            )}

            {/* Sponsorship Package Download Section */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <DownloadIcon sx={{ color: 'primary.main', mr: 1 }} />
                      <Typography variant="h6" color="primary">
                        Download Sponsorship Package
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Get detailed information about sponsorship levels and benefits
                    </Typography>
                  </Box>
                  <Button
                    variant="contained"
                    onClick={downloadSponsorshipPackage}
                    startIcon={<DownloadIcon />}
                  >
                    Download
                  </Button>
                </Box>
              </CardContent>
            </Card>

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
                  label="Company"
                  value={formData.company}
                  onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                  required
                />
                <TextField
                  fullWidth
                  label="Contact Number"
                  value={formData.contactNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, contactNumber: e.target.value }))}
                  required
                />
              </Box>

              <TextField
                fullWidth
                label="Address"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                multiline
                rows={3}
                placeholder="Enter your complete address"
                required
              />

              <FormControl fullWidth required>
                <InputLabel>Sponsorship Level</InputLabel>
                <Select
                  value={formData.level}
                  label="Sponsorship Level"
                  onChange={(e) => setFormData(prev => ({ ...prev, level: e.target.value }))}
                >
                  {sponsorshipLevels.map((level) => (
                    <MenuItem key={level} value={level}>
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label="Requirements / Additional Information"
                value={formData.requirement}
                onChange={(e) => setFormData(prev => ({ ...prev, requirement: e.target.value }))}
                multiline
                rows={4}
                placeholder="Please describe your requirements or any additional information..."
              />
            </Box>

            {/* Contact Information */}
            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Contact Information
                </Typography>
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                      Email: unorcitconnect@gmail.com
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      Phone: 433-2449 loc 181
                    </Typography>
                  </Box>
                </Alert>

                <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                  Alternative Sponsorship Options
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                  <Paper sx={{ p: 2, textAlign: 'center', flex: 1 }}>
                    <Box sx={{ color: 'success.main', mb: 1 }}>
                      <BusinessIcon sx={{ fontSize: 32 }} />
                    </Box>
                    <Typography variant="subtitle2" gutterBottom>
                      In-Kind Options
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Non-monetary contributions
                    </Typography>
                  </Paper>
                  <Paper sx={{ p: 2, textAlign: 'center', flex: 1 }}>
                    <Box sx={{ color: 'secondary.main', mb: 1 }}>
                      <BusinessIcon sx={{ fontSize: 32 }} />
                    </Box>
                    <Typography variant="subtitle2" gutterBottom>
                      Equipment Sponsorship
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Equipment sponsorship and support
                    </Typography>
                  </Paper>
                </Box>
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
            Sponsorship Application
          </Typography>
          <IconButton onClick={onClose} size="small" sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', mt: 1 }}>
          {activeStep === 0 && 'Enter your email to get started'}
          {activeStep === 1 && 'Enter the verification code sent to your email'}
          {activeStep === 2 && 'Complete your sponsorship application'}
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
                Sponsorship Form
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
            onClick={submitSponsorship}
            disabled={loading || !formData.firstName || !formData.lastName || !formData.company || !formData.contactNumber || !formData.address || !formData.level}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? (existingSponsorship ? 'Updating...' : 'Submitting...') : (existingSponsorship ? 'Update Application' : 'Submit Application')}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  )
}

export default SponsorshipModalMD
