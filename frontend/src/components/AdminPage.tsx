import { useState, useEffect } from 'react'
import * as XLSX from 'xlsx'

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

const AdminPage = ({ onLogout }: AdminPageProps) => {
  const [activeTab, setActiveTab] = useState<'alumni' | 'nominations' | 'sponsorships'>('alumni')
  const [alumni, setAlumni] = useState<Alumni[]>([])
  const [nominations, setNominations] = useState<Nomination[]>([])
  const [sponsorships, setSponsorships] = useState<Sponsorship[]>([])
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState({ total_alumni: 0, total_nominations: 0, total_sponsorships: 0, confirmed_sponsorships: 0 })
  const [alumniSearchTerm, setAlumniSearchTerm] = useState('')
  const [nominationsSearchTerm, setNominationsSearchTerm] = useState('')
  const [sponsorshipsSearchTerm, setSponsorshipsSearchTerm] = useState('')

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
        // Refresh sponsorships list
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">UNOR CIT Connect Administration</p>
            </div>
            <button
              onClick={onLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Alumni</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total_alumni}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Nominations</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total_nominations}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Paid Alumni</p>
                <p className="text-2xl font-bold text-gray-900">{alumni.filter(a => a.Paid).length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Countries</p>
                <p className="text-2xl font-bold text-gray-900">{new Set(alumni.map(a => a.Country)).size}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              <button
                onClick={() => setActiveTab('alumni')}
                className={`py-4 px-6 border-b-2 font-medium text-sm ${
                  activeTab === 'alumni'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Alumni ({alumni.length})
              </button>
              <button
                onClick={() => setActiveTab('nominations')}
                className={`py-4 px-6 border-b-2 font-medium text-sm ${
                  activeTab === 'nominations'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Nominations ({nominations.length})
              </button>
              <button
                onClick={() => setActiveTab('sponsorships')}
                className={`py-4 px-6 border-b-2 font-medium text-sm ${
                  activeTab === 'sponsorships'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Sponsorships ({sponsorships.length})
              </button>
            </nav>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <>
                {/* Alumni Tab */}
                {activeTab === 'alumni' && (
                  <div>
                    {/* Search and Export Controls */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                      <div className="flex-1 max-w-md">
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                          </div>
                          <input
                            type="text"
                            placeholder="Search alumni..."
                            value={alumniSearchTerm}
                            onChange={(e) => setAlumniSearchTerm(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">
                          Showing {filteredAlumni.length} of {alumni.length} alumni
                        </span>
                        <button
                          onClick={exportAlumniToExcel}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Export to Excel
                        </button>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {filteredAlumni.map((alumnus) => (
                            <tr key={alumnus.ID} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                  {alumnus.FirstName} {alumnus.LastName}
                                </div>
                                <div className="text-sm text-gray-500">{alumnus.Position}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {alumnus.Email}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {alumnus.Year}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {alumnus.Course}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {alumnus.City}, {alumnus.Country}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  alumnus.Paid 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {alumnus.Paid ? 'Paid' : 'Unpaid'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                {alumnus.Paid && alumnus.PaymentProofData && alumnus.PaymentProofData.length > 0 ? (
                                  <a
                                    href={`http://localhost:8080/api/alumni/${alumnus.ID}/payment-proof`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-blue-600 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    title="Download payment proof"
                                  >
                                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    Download
                                  </a>
                                ) : (
                                  <span className="text-gray-400 text-xs">No attachment</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Nominations Tab */}
                {activeTab === 'nominations' && (
                  <div>
                    {/* Search and Export Controls */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                      <div className="flex-1 max-w-md">
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                          </div>
                          <input
                            type="text"
                            placeholder="Search nominations..."
                            value={nominationsSearchTerm}
                            onChange={(e) => setNominationsSearchTerm(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">
                          Showing {filteredNominations.length} of {nominations.length} nominations
                        </span>
                        <button
                          onClick={exportNominationsToExcel}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Export to Excel
                        </button>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nominee</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nominator</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {filteredNominations.map((nomination) => (
                            <tr key={nomination.ID} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                  {nomination.FirstName} {nomination.LastName}
                                </div>
                                <div className="text-sm text-gray-500">{nomination.NominatedEmail}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {nomination.Category}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {nomination.Year}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {nomination.NominatorEmail}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatDate(nomination.CreatedAt)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Sponsorships Tab */}
                {activeTab === 'sponsorships' && (
                  <div>
                    {/* Search Controls */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                      <div className="flex-1 max-w-md">
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                          </div>
                          <input
                            type="text"
                            placeholder="Search sponsorships..."
                            value={sponsorshipsSearchTerm}
                            onChange={(e) => setSponsorshipsSearchTerm(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">
                          Showing {filteredSponsorships.length} of {sponsorships.length} sponsorships
                        </span>
                        <button
                          onClick={exportSponsorshipsToExcel}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Export to Excel
                        </button>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sponsor</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Level</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {filteredSponsorships.map((sponsorship) => (
                            <SponsorshipRow 
                              key={sponsorship.ID} 
                              sponsorship={sponsorship} 
                              onUpdate={updateSponsorshipConfirmation}
                              formatDate={formatDate}
                            />
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Sponsorship Row Component
const SponsorshipRow = ({ sponsorship, onUpdate, formatDate }: {
  sponsorship: Sponsorship
  onUpdate: (id: number, confirmed: boolean, feedback: string) => void
  formatDate: (date: string) => string
}) => {
  const [isEditing, setIsEditing] = useState(false)
  const [showRequirements, setShowRequirements] = useState(false)
  const [feedback, setFeedback] = useState(sponsorship.Feedback || '')
  const [confirmed, setConfirmed] = useState(sponsorship.Confirmed)

  const handleSave = () => {
    onUpdate(sponsorship.ID, confirmed, feedback)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setFeedback(sponsorship.Feedback || '')
    setConfirmed(sponsorship.Confirmed)
    setIsEditing(false)
  }

  return (
    <>
      <tr className="hover:bg-gray-50">
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-sm font-medium text-gray-900">
            {sponsorship.FirstName} {sponsorship.LastName}
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          {sponsorship.Email}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          {sponsorship.Company}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 max-w-xs truncate">
          {sponsorship.Address}
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
            sponsorship.Level === 'platinum' ? 'bg-gray-100 text-gray-800' :
            sponsorship.Level === 'gold' ? 'bg-yellow-100 text-yellow-800' :
            sponsorship.Level === 'silver' ? 'bg-gray-100 text-gray-600' :
            sponsorship.Level === 'bronze' ? 'bg-orange-100 text-orange-800' :
            'bg-blue-100 text-blue-800'
          }`}>
            {sponsorship.Level.charAt(0).toUpperCase() + sponsorship.Level.slice(1)}
          </span>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          {sponsorship.ContactNumber}
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          {isEditing ? (
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">Confirmed</span>
            </div>
          ) : (
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
              sponsorship.Confirmed 
                ? 'bg-green-100 text-green-800' 
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {sponsorship.Confirmed ? 'Confirmed' : 'Pending'}
            </span>
          )}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          {formatDate(sponsorship.CreatedAt)}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
          <div className="flex space-x-2">
            <button
              onClick={() => setShowRequirements(true)}
              className="text-purple-600 hover:text-purple-900"
              title="View Requirements"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </button>
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  className="text-green-600 hover:text-green-900"
                >
                  Save
                </button>
                <button
                  onClick={handleCancel}
                  className="text-gray-600 hover:text-gray-900"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="text-blue-600 hover:text-blue-900"
              >
                Edit
              </button>
            )}
          </div>
        </td>
      </tr>

      {/* Feedback Row */}
      {isEditing && (
        <tr className="bg-gray-50">
          <td colSpan={9} className="px-6 py-4">
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Admin Feedback
                </label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="Add feedback for this sponsorship application..."
                />
              </div>
            </div>
          </td>
        </tr>
      )}

      {/* Requirements Modal */}
      {showRequirements && (
        <tr>
          <td colSpan={9}>
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-t-lg">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-bold">
                      Sponsorship Requirements - {sponsorship.FirstName} {sponsorship.LastName}
                    </h3>
                    <button
                      onClick={() => setShowRequirements(false)}
                      className="text-white hover:text-gray-200"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Sponsor Information</h4>
                      <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                        <p><span className="font-medium">Company:</span> {sponsorship.Company}</p>
                        <p><span className="font-medium">Contact:</span> {sponsorship.ContactNumber}</p>
                        <p><span className="font-medium">Email:</span> {sponsorship.Email}</p>
                        <p><span className="font-medium">Level:</span> {sponsorship.Level.charAt(0).toUpperCase() + sponsorship.Level.slice(1)}</p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Requirements/Additional Information</h4>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        {sponsorship.Requirement ? (
                          <p className="text-gray-800 whitespace-pre-wrap">{sponsorship.Requirement}</p>
                        ) : (
                          <p className="text-gray-500 italic">No specific requirements provided</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Admin Feedback</h4>
                      {sponsorship.Feedback && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-3">
                          <p className="text-gray-800 whitespace-pre-wrap">{sponsorship.Feedback}</p>
                        </div>
                      )}
                      <div className="space-y-3">
                        <textarea
                          value={feedback}
                          onChange={(e) => setFeedback(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          rows={4}
                          placeholder="Add or update feedback for this sponsorship application..."
                        />
                        <div className="flex items-center space-x-3">
                          <label className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={confirmed}
                              onChange={(e) => setConfirmed(e.target.checked)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <span className="text-sm text-gray-700">Mark as Confirmed</span>
                          </label>
                          <button
                            onClick={() => {
                              onUpdate(sponsorship.ID, confirmed, feedback)
                              setShowRequirements(false)
                            }}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            Save Feedback
                          </button>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Current Status</h4>
                      <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                        sponsorship.Confirmed 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {sponsorship.Confirmed ? 'Confirmed' : 'Pending Review'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

export default AdminPage
