import { useState, useEffect } from 'react'
import * as XLSX from 'xlsx'
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Tabs,
  Tab,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
  FormControlLabel,
  CircularProgress,
  AppBar,
  Toolbar,
  Container,
  InputAdornment,
  Tooltip,
  GridLegacy as Grid,
} from '@mui/material'

import {
  Logout as LogoutIcon,
  People as PeopleIcon,
  EmojiEvents as AwardIcon,
  Business as BusinessIcon,
  Search as SearchIcon,
  Download as DownloadIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Close as CloseIcon,
  Payment as PaymentIcon,
  LocationOn as LocationIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material'


interface Alumni {
  ID: number
  FirstName: string
  LastName: string
  Email: string
  Phone: string
  Year: number
  Course: string
  Company: string
  Position: string
  Country: string
  City: string
  Paid: boolean
  PaymentProof?: string
  PaymentProofData?: number[]
  PaymentProofType?: string
  PaymentProofSize?: number
}

interface Nomination {
  ID: number
  FirstName: string
  LastName: string
  NominatedEmail: string
  NominatorEmail: string
  Year: number
  Category: string
  CreatedAt: string
}

interface Sponsorship {
  ID: number
  Email: string
  Level: string
  Requirement: string
  LastName: string
  FirstName: string
  Company: string
  Address: string
  ContactNumber: string
  Confirmed: boolean
  Feedback: string
  CreatedAt: string
}

interface AdminPageProps {
  onLogout: () => void
}

const AdminPageMD = ({ onLogout }: AdminPageProps) => {
  const [activeTab, setActiveTab] = useState(0)
  const [alumni, setAlumni] = useState<Alumni[]>([])
  const [nominations, setNominations] = useState<Nomination[]>([])
  const [sponsorships, setSponsorships] = useState<Sponsorship[]>([])
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState({ total_alumni: 0, total_nominations: 0, total_sponsorships: 0, confirmed_sponsorships: 0 })
  const [alumniSearchTerm, setAlumniSearchTerm] = useState('')
  const [nominationsSearchTerm, setNominationsSearchTerm] = useState('')
  const [sponsorshipsSearchTerm, setSponsorshipsSearchTerm] = useState('')
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'alumni' | 'nomination' | 'sponsorship', id: number, name: string } | null>(null)

  // Check if current user is superuser
  const isSuperuser = localStorage.getItem('admin_is_superuser') === 'true'

  useEffect(() => {
    fetchDashboardData()
    fetchSponsorships()
  }, [])

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      const response = await fetch('http://localhost:8080/api/admin/dashboard')
      if (response.ok) {
        const data = await response.json()
        setAlumni(data.alumni || [])
        setNominations(data.nominations || [])
        setStats(data.stats || { total_alumni: 0, total_nominations: 0 })
      }
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchSponsorships = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/sponsorships')
      if (response.ok) {
        const data = await response.json()
        setSponsorships(data.sponsorships || [])
      }
    } catch (err) {
      console.error('Failed to fetch sponsorships:', err)
    }
  }

  const updateSponsorshipConfirmation = async (id: number, confirmed: boolean, feedback: string) => {
    try {
      const response = await fetch(`http://localhost:8080/api/sponsorships/${id}/confirm`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ confirmed, feedback }),
      })

      if (response.ok) {
        fetchSponsorships()
      } else {
        console.error('Failed to update sponsorship')
      }
    } catch (err) {
      console.error('Failed to update sponsorship:', err)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Filter functions
  const filteredAlumni = alumni.filter(alumnus => {
    const searchTerm = alumniSearchTerm.toLowerCase()
    return (
      alumnus.FirstName.toLowerCase().includes(searchTerm) ||
      alumnus.LastName.toLowerCase().includes(searchTerm) ||
      alumnus.Email.toLowerCase().includes(searchTerm) ||
      alumnus.Course.toLowerCase().includes(searchTerm) ||
      alumnus.Company.toLowerCase().includes(searchTerm) ||
      alumnus.Position.toLowerCase().includes(searchTerm) ||
      alumnus.Country.toLowerCase().includes(searchTerm) ||
      alumnus.City.toLowerCase().includes(searchTerm) ||
      alumnus.Year.toString().includes(searchTerm)
    )
  })

  const filteredNominations = nominations.filter(nomination => {
    const searchTerm = nominationsSearchTerm.toLowerCase()
    return (
      nomination.FirstName.toLowerCase().includes(searchTerm) ||
      nomination.LastName.toLowerCase().includes(searchTerm) ||
      nomination.NominatedEmail.toLowerCase().includes(searchTerm) ||
      nomination.NominatorEmail.toLowerCase().includes(searchTerm) ||
      nomination.Category.toLowerCase().includes(searchTerm) ||
      nomination.Year.toString().includes(searchTerm)
    )
  })

  const filteredSponsorships = sponsorships.filter(sponsorship => {
    const searchTerm = sponsorshipsSearchTerm.toLowerCase()
    return (
      sponsorship.FirstName.toLowerCase().includes(searchTerm) ||
      sponsorship.LastName.toLowerCase().includes(searchTerm) ||
      sponsorship.Company.toLowerCase().includes(searchTerm) ||
      sponsorship.Level.toLowerCase().includes(searchTerm) ||
      sponsorship.ContactNumber.includes(searchTerm)
    )
  })

  // Excel export functions
  const exportAlumniToExcel = () => {
    const exportData = filteredAlumni.map(alumnus => ({
      'First Name': alumnus.FirstName,
      'Last Name': alumnus.LastName,
      'Email': alumnus.Email,
      'Phone': alumnus.Phone,
      'Year': alumnus.Year,
      'Course': alumnus.Course,
      'Company': alumnus.Company,
      'Position': alumnus.Position,
      'Country': alumnus.Country,
      'City': alumnus.City,
      'Payment Status': alumnus.Paid ? 'Paid' : 'Unpaid'
    }))

    const worksheet = XLSX.utils.json_to_sheet(exportData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Alumni')
    
    const fileName = `alumni_export_${new Date().toISOString().split('T')[0]}.xlsx`
    XLSX.writeFile(workbook, fileName)
  }

  const exportNominationsToExcel = () => {
    const exportData = filteredNominations.map(nomination => ({
      'Nominee First Name': nomination.FirstName,
      'Nominee Last Name': nomination.LastName,
      'Nominee Email': nomination.NominatedEmail,
      'Category': nomination.Category,
      'Year': nomination.Year,
      'Nominator Email': nomination.NominatorEmail,
      'Submission Date': formatDate(nomination.CreatedAt)
    }))

    const worksheet = XLSX.utils.json_to_sheet(exportData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Nominations')
    
    const fileName = `nominations_export_${new Date().toISOString().split('T')[0]}.xlsx`
    XLSX.writeFile(workbook, fileName)
  }

  const exportSponsorshipsToExcel = () => {
    const exportData = filteredSponsorships.map(sponsorship => ({
      'First Name': sponsorship.FirstName,
      'Last Name': sponsorship.LastName,
      'Email': sponsorship.Email,
      'Company': sponsorship.Company,
      'Address': sponsorship.Address,
      'Contact Number': sponsorship.ContactNumber,
      'Sponsorship Level': sponsorship.Level,
      'Requirements': sponsorship.Requirement,
      'Status': sponsorship.Confirmed ? 'Confirmed' : 'Pending',
      'Admin Feedback': sponsorship.Feedback || '',
      'Submission Date': formatDate(sponsorship.CreatedAt)
    }))

    const worksheet = XLSX.utils.json_to_sheet(exportData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sponsorships')
    
    const fileName = `sponsorships_export_${new Date().toISOString().split('T')[0]}.xlsx`
    XLSX.writeFile(workbook, fileName)
  }

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue)
  }

  // Delete functions
  const handleDeleteClick = (type: 'alumni' | 'nomination' | 'sponsorship', id: number, name: string) => {
    setDeleteTarget({ type, id, name })
    setDeleteConfirmOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return

    try {
      const response = await fetch(`http://localhost:8080/api/${deleteTarget.type === 'alumni' ? 'alumni' : deleteTarget.type === 'nomination' ? 'nominations' : 'sponsorships'}/${deleteTarget.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        // Refresh data based on type
        if (deleteTarget.type === 'alumni') {
          fetchDashboardData()
        } else if (deleteTarget.type === 'nomination') {
          fetchDashboardData()
        } else if (deleteTarget.type === 'sponsorship') {
          fetchSponsorships()
        }
      } else {
        console.error('Failed to delete:', deleteTarget.type)
      }
    } catch (err) {
      console.error('Failed to delete:', err)
    } finally {
      setDeleteConfirmOpen(false)
      setDeleteTarget(null)
    }
  }

  const handleDeleteCancel = () => {
    setDeleteConfirmOpen(false)
    setDeleteTarget(null)
  }

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      {/* Header */}
      <AppBar position="static" sx={{ backgroundColor: '#1976d2' }}>
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
              Admin Dashboard
            </Typography>
            <Typography variant="body2" sx={{ ml: 2, opacity: 0.8 }}>
              UNOR CIT Connect Administration
            </Typography>
          </Box>
          <Button
            color="inherit"
            onClick={onLogout}
            startIcon={<LogoutIcon />}
            sx={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.2)' }
            }}
          >
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ py: 3 }}>
        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ 
                    p: 1.5, 
                    borderRadius: '50%', 
                    backgroundColor: '#e3f2fd',
                    mr: 2
                  }}>
                    <PeopleIcon sx={{ color: '#1976d2', fontSize: 24 }} />
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Total Alumni
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      {stats.total_alumni}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ 
                    p: 1.5, 
                    borderRadius: '50%', 
                    backgroundColor: '#e8f5e8',
                    mr: 2
                  }}>
                    <AwardIcon sx={{ color: '#4caf50', fontSize: 24 }} />
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Nominations
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      {stats.total_nominations}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ 
                    p: 1.5, 
                    borderRadius: '50%', 
                    backgroundColor: '#fff3e0',
                    mr: 2
                  }}>
                    <PaymentIcon sx={{ color: '#ff9800', fontSize: 24 }} />
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Paid Alumni
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      {alumni.filter(a => a.Paid).length}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ 
                    p: 1.5, 
                    borderRadius: '50%', 
                    backgroundColor: '#f3e5f5',
                    mr: 2
                  }}>
                    <LocationIcon sx={{ color: '#9c27b0', fontSize: 24 }} />
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Countries
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      {new Set(alumni.map(a => a.Country)).size}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Main Content */}
        <Card>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={activeTab} onChange={handleTabChange}>
              <Tab 
                label={`Alumni (${alumni.length})`} 
                icon={<PeopleIcon />}
                iconPosition="start"
              />
              <Tab 
                label={`Nominations (${nominations.length})`} 
                icon={<AwardIcon />}
                iconPosition="start"
              />
              <Tab 
                label={`Sponsorships (${sponsorships.length})`} 
                icon={<BusinessIcon />}
                iconPosition="start"
              />
            </Tabs>
          </Box>

          <Box sx={{ p: 3 }}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                {/* Alumni Tab */}
                {activeTab === 0 && (
                  <AlumniTab
                    alumni={filteredAlumni}
                    searchTerm={alumniSearchTerm}
                    onSearchChange={setAlumniSearchTerm}
                    onExport={exportAlumniToExcel}
                    totalCount={alumni.length}
                    isSuperuser={isSuperuser}
                    onDelete={handleDeleteClick}
                  />
                )}

                {/* Nominations Tab */}
                {activeTab === 1 && (
                  <NominationsTab
                    nominations={filteredNominations}
                    searchTerm={nominationsSearchTerm}
                    onSearchChange={setNominationsSearchTerm}
                    onExport={exportNominationsToExcel}
                    totalCount={nominations.length}
                    formatDate={formatDate}
                    isSuperuser={isSuperuser}
                    onDelete={handleDeleteClick}
                  />
                )}

                {/* Sponsorships Tab */}
                {activeTab === 2 && (
                  <SponsorshipsTab
                    sponsorships={filteredSponsorships}
                    searchTerm={sponsorshipsSearchTerm}
                    onSearchChange={setSponsorshipsSearchTerm}
                    onExport={exportSponsorshipsToExcel}
                    totalCount={sponsorships.length}
                    formatDate={formatDate}
                    onUpdate={updateSponsorshipConfirmation}
                    isSuperuser={isSuperuser}
                    onDelete={handleDeleteClick}
                  />
                )}
              </>
            )}
          </Box>
        </Card>
      </Container>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={handleDeleteCancel}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <DeleteIcon />
          <Typography variant="h6">
            Confirm Deletion
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {deleteTarget && (
            <Box>
              <Typography variant="body1" gutterBottom>
                Are you sure you want to delete this {deleteTarget.type}?
              </Typography>
              <Box sx={{ 
                p: 2, 
                backgroundColor: '#ffebee', 
                borderRadius: 1, 
                border: '1px solid #ffcdd2',
                mt: 2
              }}>
                <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                  {deleteTarget.type === 'alumni' && 'Alumni: '}
                  {deleteTarget.type === 'nomination' && 'Nomination for: '}
                  {deleteTarget.type === 'sponsorship' && 'Sponsorship from: '}
                  {deleteTarget.name}
                </Typography>
              </Box>
              <Typography variant="body2" color="error" sx={{ mt: 2, fontWeight: 'medium' }}>
                ⚠️ This action cannot be undone!
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button
            onClick={handleDeleteCancel}
            variant="outlined"
            color="inherit"
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            variant="contained"
            color="error"
            startIcon={<DeleteIcon />}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

// Alumni Tab Component
const AlumniTab = ({ alumni, searchTerm, onSearchChange, onExport, totalCount, isSuperuser, onDelete }: {
  alumni: Alumni[]
  searchTerm: string
  onSearchChange: (term: string) => void
  onExport: () => void
  totalCount: number
  isSuperuser: boolean
  onDelete: (type: 'alumni' | 'nomination' | 'sponsorship', id: number, name: string) => void
}) => (
  <Box>
    {/* Search and Export Controls */}
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
      <TextField
        placeholder="Search alumni..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
        sx={{ maxWidth: 400 }}
      />
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Showing {alumni.length} of {totalCount} alumni
        </Typography>
        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          onClick={onExport}
          color="success"
        >
          Export to Excel
        </Button>
      </Box>
    </Box>

    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Year</TableCell>
            <TableCell>Course</TableCell>
            <TableCell>Location</TableCell>
            <TableCell>Payment</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {alumni.map((alumnus) => (
            <TableRow key={alumnus.ID} hover>
              <TableCell>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                    {alumnus.FirstName} {alumnus.LastName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {alumnus.Position}
                  </Typography>
                </Box>
              </TableCell>
              <TableCell>{alumnus.Email}</TableCell>
              <TableCell>{alumnus.Year}</TableCell>
              <TableCell>{alumnus.Course}</TableCell>
              <TableCell>{alumnus.City}, {alumnus.Country}</TableCell>
              <TableCell>
                <Chip
                  label={alumnus.Paid ? 'Paid' : 'Unpaid'}
                  color={alumnus.Paid ? 'success' : 'error'}
                  size="small"
                />
              </TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  {alumnus.Paid && alumnus.PaymentProofData && alumnus.PaymentProofData.length > 0 ? (
                    <Tooltip title="Download payment proof">
                      <IconButton
                        component="a"
                        href={`http://localhost:8080/api/alumni/${alumnus.ID}/payment-proof`}
                        target="_blank"
                        rel="noopener noreferrer"
                        size="small"
                        color="primary"
                      >
                        <DownloadIcon />
                      </IconButton>
                    </Tooltip>
                  ) : (
                    <Typography variant="caption" color="text.secondary">
                      No attachment
                    </Typography>
                  )}
                  {isSuperuser && (
                    <Tooltip title="Delete alumni">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => onDelete('alumni', alumnus.ID, `${alumnus.FirstName} ${alumnus.LastName}`)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  </Box>
)

// Nominations Tab Component
const NominationsTab = ({ nominations, searchTerm, onSearchChange, onExport, totalCount, formatDate, isSuperuser, onDelete }: {
  nominations: Nomination[]
  searchTerm: string
  onSearchChange: (term: string) => void
  onExport: () => void
  totalCount: number
  formatDate: (date: string) => string
  isSuperuser: boolean
  onDelete: (type: 'alumni' | 'nomination' | 'sponsorship', id: number, name: string) => void
}) => (
  <Box>
    {/* Search and Export Controls */}
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
      <TextField
        placeholder="Search nominations..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
        sx={{ maxWidth: 400 }}
      />
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Showing {nominations.length} of {totalCount} nominations
        </Typography>
        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          onClick={onExport}
          color="success"
        >
          Export to Excel
        </Button>
      </Box>
    </Box>

    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Nominee</TableCell>
            <TableCell>Category</TableCell>
            <TableCell>Year</TableCell>
            <TableCell>Nominator</TableCell>
            <TableCell>Date</TableCell>
            {isSuperuser && <TableCell>Actions</TableCell>}
          </TableRow>
        </TableHead>
        <TableBody>
          {nominations.map((nomination) => (
            <TableRow key={nomination.ID} hover>
              <TableCell>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                    {nomination.FirstName} {nomination.LastName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {nomination.NominatedEmail}
                  </Typography>
                </Box>
              </TableCell>
              <TableCell>{nomination.Category}</TableCell>
              <TableCell>{nomination.Year}</TableCell>
              <TableCell>{nomination.NominatorEmail}</TableCell>
              <TableCell>
                <Typography variant="caption" color="text.secondary">
                  {formatDate(nomination.CreatedAt)}
                </Typography>
              </TableCell>
              {isSuperuser && (
                <TableCell>
                  <Tooltip title="Delete nomination">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => onDelete('nomination', nomination.ID, `${nomination.FirstName} ${nomination.LastName}`)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  </Box>
)

// Sponsorships Tab Component
const SponsorshipsTab = ({ sponsorships, searchTerm, onSearchChange, onExport, totalCount, formatDate, onUpdate, isSuperuser, onDelete }: {
  sponsorships: Sponsorship[]
  searchTerm: string
  onSearchChange: (term: string) => void
  onExport: () => void
  totalCount: number
  formatDate: (date: string) => string
  onUpdate: (id: number, confirmed: boolean, feedback: string) => void
  isSuperuser: boolean
  onDelete: (type: 'alumni' | 'nomination' | 'sponsorship', id: number, name: string) => void
}) => {
  const [selectedSponsorship, setSelectedSponsorship] = useState<Sponsorship | null>(null)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [feedback, setFeedback] = useState('')
  const [confirmed, setConfirmed] = useState(false)

  const handleEdit = (sponsorship: Sponsorship) => {
    setEditingId(sponsorship.ID)
    setFeedback(sponsorship.Feedback || '')
    setConfirmed(sponsorship.Confirmed)
  }

  const handleSave = (id: number) => {
    onUpdate(id, confirmed, feedback)
    setEditingId(null)
  }

  const handleCancel = () => {
    setEditingId(null)
    setFeedback('')
    setConfirmed(false)
  }

  const getSponsorshipLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'platinum': return 'default'
      case 'gold': return 'warning'
      case 'silver': return 'info'
      case 'bronze': return 'secondary'
      default: return 'primary'
    }
  }

  return (
    <Box>
      {/* Search and Export Controls */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <TextField
          placeholder="Search sponsorships..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ maxWidth: 400 }}
        />
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Showing {sponsorships.length} of {totalCount} sponsorships
          </Typography>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={onExport}
            color="success"
          >
            Export to Excel
          </Button>
        </Box>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Sponsor</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Company</TableCell>
              <TableCell>Level</TableCell>
              <TableCell>Contact</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sponsorships.map((sponsorship) => (
              <TableRow key={sponsorship.ID} hover>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                    {sponsorship.FirstName} {sponsorship.LastName}
                  </Typography>
                </TableCell>
                <TableCell>{sponsorship.Email}</TableCell>
                <TableCell>{sponsorship.Company}</TableCell>
                <TableCell>
                  <Chip
                    label={sponsorship.Level.charAt(0).toUpperCase() + sponsorship.Level.slice(1)}
                    color={getSponsorshipLevelColor(sponsorship.Level)}
                    size="small"
                  />
                </TableCell>
                <TableCell>{sponsorship.ContactNumber}</TableCell>
                <TableCell>
                  {editingId === sponsorship.ID ? (
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={confirmed}
                          onChange={(e) => setConfirmed(e.target.checked)}
                          size="small"
                        />
                      }
                      label="Confirmed"
                    />
                  ) : (
                    <Chip
                      label={sponsorship.Confirmed ? 'Confirmed' : 'Pending'}
                      color={sponsorship.Confirmed ? 'success' : 'warning'}
                      size="small"
                    />
                  )}
                </TableCell>
                <TableCell>
                  <Typography variant="caption" color="text.secondary">
                    {formatDate(sponsorship.CreatedAt)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="View Requirements">
                      <IconButton
                        size="small"
                        onClick={() => setSelectedSponsorship(sponsorship)}
                        color="info"
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                    {editingId === sponsorship.ID ? (
                      <>
                        <Tooltip title="Save">
                          <IconButton
                            size="small"
                            onClick={() => handleSave(sponsorship.ID)}
                            color="success"
                          >
                            <SaveIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Cancel">
                          <IconButton
                            size="small"
                            onClick={handleCancel}
                            color="error"
                          >
                            <CancelIcon />
                          </IconButton>
                        </Tooltip>
                      </>
                    ) : (
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          onClick={() => handleEdit(sponsorship)}
                          color="primary"
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                    {isSuperuser && (
                      <Tooltip title="Delete sponsorship">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => onDelete('sponsorship', sponsorship.ID, `${sponsorship.FirstName} ${sponsorship.LastName}`)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Requirements Dialog */}
      <Dialog
        open={!!selectedSponsorship}
        onClose={() => setSelectedSponsorship(null)}
        maxWidth="md"
        fullWidth
      >
        {selectedSponsorship && (
          <>
            <DialogTitle sx={{ 
              background: 'linear-gradient(135deg, #9c27b0 0%, #3f51b5 100%)',
              color: 'white',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <Typography variant="h6">
                Sponsorship Requirements - {selectedSponsorship.FirstName} {selectedSponsorship.LastName}
              </Typography>
              <IconButton
                onClick={() => setSelectedSponsorship(null)}
                sx={{ color: 'white' }}
                size="small"
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent sx={{ mt: 2 }}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Sponsor Information
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Typography variant="body2">
                            <strong>Company:</strong> {selectedSponsorship.Company}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2">
                            <strong>Contact:</strong> {selectedSponsorship.ContactNumber}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2">
                            <strong>Email:</strong> {selectedSponsorship.Email}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2">
                            <strong>Level:</strong> {selectedSponsorship.Level.charAt(0).toUpperCase() + selectedSponsorship.Level.slice(1)}
                          </Typography>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Requirements/Additional Information
                      </Typography>
                      <Box sx={{ p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                        {selectedSponsorship.Requirement ? (
                          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                            {selectedSponsorship.Requirement}
                          </Typography>
                        ) : (
                          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                            No specific requirements provided
                          </Typography>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Admin Feedback
                      </Typography>
                      {selectedSponsorship.Feedback && (
                        <Box sx={{ p: 2, backgroundColor: '#e8f5e8', borderRadius: 1, mb: 2 }}>
                          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                            {selectedSponsorship.Feedback}
                          </Typography>
                        </Box>
                      )}
                      <TextField
                        fullWidth
                        multiline
                        rows={4}
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        placeholder="Add or update feedback for this sponsorship application..."
                        variant="outlined"
                        sx={{ mb: 2 }}
                      />
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={confirmed}
                              onChange={(e) => setConfirmed(e.target.checked)}
                            />
                          }
                          label="Mark as Confirmed"
                        />
                        <Button
                          variant="contained"
                          onClick={() => {
                            onUpdate(selectedSponsorship.ID, confirmed, feedback)
                            setSelectedSponsorship(null)
                          }}
                          startIcon={<SaveIcon />}
                        >
                          Save Feedback
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Current Status
                      </Typography>
                      <Chip
                        label={selectedSponsorship.Confirmed ? 'Confirmed' : 'Pending Review'}
                        color={selectedSponsorship.Confirmed ? 'success' : 'warning'}
                        size="medium"
                      />
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </DialogContent>
          </>
        )}
      </Dialog>
    </Box>
  )
}

export default AdminPageMD
