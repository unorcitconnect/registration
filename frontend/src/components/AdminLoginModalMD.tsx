import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  IconButton,
  InputAdornment,
} from '@mui/material'
import {
  Close as CloseIcon,
  AdminPanelSettings as AdminIcon,
  Person as PersonIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material'

interface AdminLoginModalProps {
  open: boolean
  onClose: () => void
  onLoginSuccess: () => void
}

const AdminLoginModalMD = ({ open, onClose, onLoginSuccess }: AdminLoginModalProps) => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!username || !password) {
      setError('Please enter both username and password')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // Store admin session (in a real app, you'd use proper session management)
        localStorage.setItem('admin_logged_in', 'true')
        localStorage.setItem('admin_username', data.admin.username)
        localStorage.setItem('admin_is_superuser', data.admin.is_superuser.toString())
        onLoginSuccess()
        onClose()
      } else {
        setError(data.error || 'Login failed')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
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
        background: 'linear-gradient(135deg, #374151 0%, #111827 100%)',
        color: 'white',
        p: 3,
        borderRadius: '8px 8px 0 0'
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AdminIcon sx={{ fontSize: 28 }} />
            <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
              Admin Login
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small" sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', mt: 1 }}>
          Access the administration dashboard
        </Typography>
      </Box>

      <DialogContent sx={{ p: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <AdminIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Administrator Access
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Please enter your credentials to access the admin dashboard
          </Typography>
        </Box>

        <Box component="form" onSubmit={handleLogin} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <TextField
            fullWidth
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            variant="outlined"
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonIcon color="action" />
                </InputAdornment>
              ),
            }}
            placeholder="Enter admin username"
          />

          <TextField
            fullWidth
            label="Password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            variant="outlined"
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon color="action" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                    size="small"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            placeholder="Enter admin password"
          />

          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={loading || !username || !password}
            startIcon={loading ? <CircularProgress size={20} /> : <AdminIcon />}
            sx={{ 
              backgroundColor: '#374151',
              '&:hover': { backgroundColor: '#111827' },
              '&:disabled': { backgroundColor: '#9ca3af' },
              py: 1.5,
              mt: 2
            }}
          >
            {loading ? 'Logging in...' : 'Login to Dashboard'}
          </Button>
        </Box>

        {/* Security Notice */}
        <Alert severity="info" sx={{ mt: 3 }}>
          <Typography variant="body2">
            <strong>Security Notice:</strong> This is a secure admin area. All login attempts are logged and monitored.
          </Typography>
        </Alert>
      </DialogContent>
    </Dialog>
  )
}

export default AdminLoginModalMD
