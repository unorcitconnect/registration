import { useState } from 'react'
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
  EmojiEvents as AwardIcon,
  Person as PersonIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
} from '@mui/icons-material'

interface NominationModalProps {
  open: boolean
  onClose: () => void
}

interface Nomination {
  firstName: string
  lastName: string
  nominatedEmail: string
  nominatorEmail: string
  year: number
  category: string
}

const steps = ['Email Verification', 'Nomination Form']

const NominationModalMD = ({ open, onClose }: NominationModalProps) => {
  const [activeStep, setActiveStep] = useState(0)
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState<Nomination>({
    firstName: '',
    lastName: '',
    nominatedEmail: '',
    nominatorEmail: '',
    year: new Date().getFullYear(),
    category: ''
  })

  const categories = [
    'Outstanding Alumni in Technology',
    'Outstanding Alumni in Business',
    'Outstanding Alumni in Education',
    'Outstanding Alumni in Public Service',
    'Outstanding Alumni in Healthcare',
    'Outstanding Alumni in Arts & Culture',
    'Outstanding Alumni in Social Impact',
    'Young Achiever Award',
    'Lifetime Achievement Award'
  ]

  const checkAlumniEmail = async () => {
    if (!email) {
      setError('Please enter your email address')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch(`http://localhost:8080/api/check-alumni-email?email=${encodeURIComponent(email)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (response.ok) {
        if (data.exists) {
          // User is registered, proceed to nomination form
          setFormData(prev => ({ ...prev, nominatorEmail: email }))
          setActiveStep(1)
        } else {
          // User is not registered, show error message
          setError('You must be a registered alumni to submit nominations. Please register first before nominating.')
        }
      } else {
        setError(data.error || 'Failed to verify email')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const submitNomination = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch('http://localhost:8080/api/nominations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Nomination submitted successfully!')
        onClose()
      } else {
        setError(data.error || 'Failed to submit nomination')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <EmailIcon sx={{ fontSize: 64, color: 'warning.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Enter Your Email Address
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              We need to verify that you are a registered alumni before you can submit nominations
            </Typography>

            {/* Nomination Guidelines */}
            <Alert severity="warning" sx={{ mb: 3, textAlign: 'left' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                Nomination Guidelines:
              </Typography>
              <Box component="ul" sx={{ pl: 2, m: 0 }}>
                <li>You must be a registered UNOR CIT alumni to submit nominations</li>
                <li>You can only submit one nomination per category</li>
                <li>Nominees must be UNOR CIT alumni</li>
                <li>Provide accurate information about the nominee</li>
                <li>Nominations will be reviewed by the selection committee</li>
              </Box>
            </Alert>

            <TextField
              fullWidth
              type="email"
              label="Your Email Address (Nominator)"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              variant="outlined"
              sx={{ mb: 3 }}
              onKeyPress={(e) => e.key === 'Enter' && checkAlumniEmail()}
            />
          </Box>
        )

      case 1:
        return (
          <Box sx={{ py: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <AwardIcon sx={{ fontSize: 32, color: 'warning.main', mr: 1 }} />
              <Typography variant="h6">
                Outstanding Alumni Nomination
              </Typography>
            </Box>

            <Alert severity="success" sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CheckCircleIcon sx={{ mr: 1 }} />
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    Email verified successfully!
                  </Typography>
                  <Typography variant="body2">
                    You can now proceed with the nomination.
                  </Typography>
                </Box>
              </Box>
            </Alert>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <FormControl fullWidth required>
                <InputLabel>Award Category</InputLabel>
                <Select
                  value={formData.category}
                  label="Award Category"
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                >
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                <TextField
                  fullWidth
                  label="Nominee First Name"
                  value={formData.firstName}
                  onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                  required
                />
                <TextField
                  fullWidth
                  label="Nominee Last Name"
                  value={formData.lastName}
                  onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                  required
                />
              </Box>

              <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                <TextField
                  fullWidth
                  type="email"
                  label="Nominee Email (Optional)"
                  value={formData.nominatedEmail}
                  onChange={(e) => setFormData(prev => ({ ...prev, nominatedEmail: e.target.value }))}
                  placeholder="nominee@example.com"
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
            </Box>

            {/* Nomination Summary */}
            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Nomination Summary
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Typography variant="body2">
                    <strong>Category:</strong> {formData.category || 'Not selected'}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Nominee:</strong> {formData.firstName} {formData.lastName}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Graduation Year:</strong> {formData.year}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Nominator:</strong> {email}
                  </Typography>
                </Box>
              </CardContent>
            </Card>

            {/* Important Note */}
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Note:</strong> By submitting this nomination, you confirm that the information provided is accurate 
                and that the nominee is a graduate of UNOR CIT. You can only submit one nomination per category.
              </Typography>
            </Alert>
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
        background: 'linear-gradient(135deg, #d97706 0%, #ea580c 100%)',
        color: 'white',
        p: 3,
        borderRadius: '8px 8px 0 0'
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
            Outstanding Alumni Nomination
          </Typography>
          <IconButton onClick={onClose} size="small" sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', mt: 1 }}>
          {activeStep === 0 && 'Enter your email to get started'}
          {activeStep === 1 && 'Nominate a deserving alumni for recognition'}
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
                backgroundColor: activeStep === 0 ? '#d97706' : (activeStep > 0 ? '#9ca3af' : '#d1d5db')
              }}>
                1
              </Box>
              <Typography variant="caption" sx={{ color: '#6b7280', mt: 1 }}>
                Email Verification
              </Typography>
            </Box>
            
            {/* Line */}
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
                backgroundColor: activeStep === 1 ? '#d97706' : '#d1d5db'
              }}>
                2
              </Box>
              <Typography variant="caption" sx={{ color: '#6b7280', mt: 1 }}>
                Nomination Form
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
            onClick={checkAlumniEmail}
            disabled={loading || !email}
            style={{
              backgroundColor: loading || !email ? '#e5e7eb' : '#d97706',
              color: loading || !email ? '#9ca3af' : '#ffffff',
              border: 'none',
              padding: '8px 24px',
              borderRadius: '8px',
              fontWeight: '500',
              cursor: loading || !email ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => {
              if (!loading && email) {
                e.currentTarget.style.backgroundColor = '#b45309'
              }
            }}
            onMouseLeave={(e) => {
              if (!loading && email) {
                e.currentTarget.style.backgroundColor = '#d97706'
              }
            }}
          >
            {loading ? 'Checking...' : 'Vote'}
          </button>
        )}
        {activeStep === 1 && (
          <Button
            variant="contained"
            onClick={submitNomination}
            disabled={loading || !formData.firstName || !formData.lastName || !formData.category || !formData.year}
            startIcon={loading ? <CircularProgress size={20} /> : null}
            sx={{ 
              backgroundColor: '#d97706',
              '&:hover': { backgroundColor: '#b45309' },
              '&:disabled': { backgroundColor: '#9ca3af' }
            }}
          >
            {loading ? 'Submitting...' : 'Submit Nomination'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  )
}

export default NominationModalMD
