import { useState, useEffect } from 'react'
import {
  ThemeProvider,
  CssBaseline,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  Grid,
  Paper,
  Link,
  Fab,
  useScrollTrigger,
  Slide,
  Zoom,
} from '@mui/material'
import {
  PersonAdd as PersonAddIcon,
  EmojiEvents as EmojiEventsIcon,
  Business as BusinessIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
} from '@mui/icons-material'
import { createTheme } from '@mui/material/styles'
import VideoHeroSection from './components/VideoHeroSection'
import NewsSection from './components/NewsSection'
import LeafletAlumniMap from './components/LeafletAlumniMap'
import RegistrationModalMD from './components/RegistrationModalMD'
import NominationModal from './components/NominationModalMD'
import AdminLoginModal from './components/AdminLoginModalMD'
import AdminPage from './components/AdminPageMD'
import EventDetails from './components/EventDetails'
import SponsorshipSection from './components/SponsorshipSection'
import SponsorshipModal from './components/SponsorshipModalMD'
import OutstandingAlumniAwards from './components/OutstandingAlumniAwards'
import AlumniSuccessStories from './components/AlumniSuccessStories'

// Create Material Design theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#3f51b5', // Indigo
      light: '#7986cb',
      dark: '#303f9f',
    },
    secondary: {
      main: '#ff9800', // Orange/Amber
      light: '#ffb74d',
      dark: '#f57c00',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 600,
    },
    h3: {
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
  },
})

// Hide on scroll component
interface HideOnScrollProps {
  children: React.ReactElement
}

function HideOnScroll({ children }: HideOnScrollProps) {
  const trigger = useScrollTrigger()
  return (
    <Slide appear={false} direction="down" in={!trigger}>
      {children}
    </Slide>
  )
}

// Scroll to top component
function ScrollTop() {
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 100,
  })

  const handleClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <Zoom in={trigger}>
      <Fab
        onClick={handleClick}
        color="primary"
        size="small"
        aria-label="scroll back to top"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          zIndex: 1000,
        }}
      >
        <KeyboardArrowUpIcon />
      </Fab>
    </Zoom>
  )
}

function AppMD() {
  const [showRegistration, setShowRegistration] = useState(false)
  const [showNomination, setShowNomination] = useState(false)
  const [showSponsorshipModal, setShowSponsorshipModal] = useState(false)
  const [showAdminLogin, setShowAdminLogin] = useState(false)
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false)
  const [showEventDetails, setShowEventDetails] = useState(false)
  const [showSponsorship, setShowSponsorship] = useState(false)
  const [showOutstandingAlumni, setShowOutstandingAlumni] = useState(false)
  const [showAlumniSuccessStories, setShowAlumniSuccessStories] = useState(false)
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
    // For news item 4 (Alumni Success Stories), show success stories section
    else if (newsId === 4) {
      setShowAlumniSuccessStories(true)
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
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AdminPage onLogout={handleAdminLogout} />
      </ThemeProvider>
    )
  }

  // If showing event details, show event details page
  if (showEventDetails) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <EventDetails onBack={() => setShowEventDetails(false)} onRegister={() => { setShowEventDetails(false); setShowRegistration(true); }} />
      </ThemeProvider>
    )
  }

  // If showing sponsorship, show sponsorship page
  if (showSponsorship) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <SponsorshipSection onBack={() => setShowSponsorship(false)} />
      </ThemeProvider>
    )
  }

  // If showing outstanding alumni awards, show awards page
  if (showOutstandingAlumni) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <OutstandingAlumniAwards onBack={() => setShowOutstandingAlumni(false)} onNominate={() => { setShowOutstandingAlumni(false); setShowNomination(true); }} />
      </ThemeProvider>
    )
  }

  // If showing alumni success stories, show success stories page
  if (showAlumniSuccessStories) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AlumniSuccessStories onBack={() => setShowAlumniSuccessStories(false)} />
      </ThemeProvider>
    )
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
        {/* Navigation */}
        <HideOnScroll>
          <AppBar 
            position="sticky" 
            elevation={4}
            sx={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              color: 'primary.main',
            }}
          >
            <Toolbar sx={{ justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  component="img"
                  src="/cit_logo.png"
                  alt="CIT Logo"
                  sx={{ height: 40, width: 40, objectFit: 'contain' }}
                />
                <Typography 
                  variant="h5" 
                  component="h1" 
                  sx={{ 
                    fontWeight: 'bold',
                    color: 'primary.main',
                    display: { xs: 'none', sm: 'block' }
                  }}
                >
                  UNOR CIT Connect
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="contained"
                  startIcon={<PersonAddIcon />}
                  onClick={() => setShowRegistration(true)}
                  sx={{ 
                    backgroundColor: 'primary.main',
                    '&:hover': { backgroundColor: 'primary.dark' }
                  }}
                >
                  Register
                </Button>
                <Button
                  variant="contained"
                  startIcon={<EmojiEventsIcon />}
                  onClick={() => setShowNomination(true)}
                  sx={{ 
                    backgroundColor: 'secondary.main',
                    '&:hover': { backgroundColor: 'secondary.dark' }
                  }}
                >
                  Nominate
                </Button>
                <Button
                  variant="contained"
                  startIcon={<BusinessIcon />}
                  onClick={() => setShowSponsorshipModal(true)}
                  sx={{ 
                    backgroundColor: '#9c27b0',
                    '&:hover': { backgroundColor: '#7b1fa2' }
                  }}
                >
                  Sponsor
                </Button>
              </Box>
            </Toolbar>
          </AppBar>
        </HideOnScroll>

        {/* Hero Section */}
        <VideoHeroSection onJoinCelebration={handleJoinCelebration} onLearnMore={handleLearnMore} />

        {/* News Section */}
        <NewsSection onReadMore={handleNewsReadMore} />

        {/* Alumni World Map */}
        <LeafletAlumniMap refreshTrigger={mapRefreshTrigger} />

        {/* Footer */}
        <Paper 
          component="footer" 
          elevation={8}
          sx={{ 
            backgroundColor: 'primary.dark',
            color: 'white',
            py: 6,
            mt: 4,
            borderRadius: 0,
          }}
        >
          <Container maxWidth="lg">
            <Grid container spacing={4}>
              <Grid size={{ xs: 12, md: 4 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                  UNOR CIT Connect
                </Typography>
                <Typography variant="body2" sx={{ color: 'primary.light', lineHeight: 1.6 }}>
                  Celebrating 40 years of IT Education in Western Visayas & 25 years as College
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Quick Links
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Link href="#" color="primary.light" underline="hover">About</Link>
                  <Link 
                    component="button"
                    onClick={() => setShowEventDetails(true)}
                    color="primary.light" 
                    underline="hover"
                    sx={{ textAlign: 'left' }}
                  >
                    Events
                  </Link>
                  <Link 
                    component="button"
                    onClick={() => setShowAlumniSuccessStories(true)}
                    color="primary.light" 
                    underline="hover"
                    sx={{ textAlign: 'left' }}
                  >
                    Alumni Success Stories
                  </Link>
                  <Link href="#" color="primary.light" underline="hover">Contact</Link>
                  <Link 
                    component="button"
                    onClick={() => setShowAdminLogin(true)}
                    color="primary.light" 
                    underline="hover"
                    sx={{ textAlign: 'left' }}
                  >
                    Administration
                  </Link>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Contact Info
                </Typography>
                <Typography variant="body2" sx={{ color: 'primary.light', lineHeight: 1.6 }}>
                  University of Negros Occidental - Recoletos<br />
                  Bacolod City, Philippines<br />
                  Email: unorcitconnect@gmail.com<br />
                  Phone: 433-2449 loc 181
                </Typography>
              </Grid>
            </Grid>
            <Box 
              sx={{ 
                borderTop: 1, 
                borderColor: 'primary.main',
                mt: 4, 
                pt: 3, 
                textAlign: 'center' 
              }}
            >
              <Typography variant="body2" sx={{ color: 'primary.light' }}>
                &copy; 2025 UNOR CIT Connect. All rights reserved.
              </Typography>
            </Box>
          </Container>
        </Paper>

        {/* Scroll to Top Button */}
        <ScrollTop />

        {/* Modals */}
        {showRegistration && (
          <RegistrationModalMD 
            open={showRegistration} 
            onClose={() => setShowRegistration(false)}
            onSuccess={handleRegistrationSuccess}
          />
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
      </Box>
    </ThemeProvider>
  )
}

export default AppMD
