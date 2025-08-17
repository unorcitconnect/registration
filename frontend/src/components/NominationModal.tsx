import { useState } from 'react'
import toast from 'react-hot-toast'

interface NominationModalProps {
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

const NominationModal = ({ onClose }: NominationModalProps) => {
  const [step, setStep] = useState<'email' | 'form'>('email')
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
      const response = await fetch(`/api/check-alumni-email?email=${encodeURIComponent(email)}`, {
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
          setStep('form')
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
      const response = await fetch('/api/nominations', {
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

  return (
    <div className="fixed inset-0 bg-gray-400/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white bg-opacity-95 backdrop-blur-md rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 to-orange-600 text-white p-6 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Outstanding Alumni Nomination</h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-amber-100 mt-2">
            {step === 'email' && 'Enter your email to get started'}
            {step === 'form' && 'Nominate a deserving alumni for recognition'}
          </p>
        </div>

        <div className="p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          {/* Step 1: Email Input */}
          {step === 'email' && (
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-lg mb-4">
                <h3 className="font-bold mb-2">Nomination Guidelines:</h3>
                <ul className="text-sm space-y-1">
                  <li>• You must be a registered UNOR CIT alumni to submit nominations</li>
                  <li>• You can only submit one nomination per category</li>
                  <li>• Nominees must be UNOR CIT alumni</li>
                  <li>• Provide accurate information about the nominee</li>
                  <li>• Nominations will be reviewed by the selection committee</li>
                </ul>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Email Address (Nominator)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="Enter your email address"
                  onKeyPress={(e) => e.key === 'Enter' && checkAlumniEmail()}
                />
              </div>
              <button
                onClick={checkAlumniEmail}
                disabled={loading || !email}
                style={{
                  backgroundColor: loading || !email ? '#e5e7eb' : '#d97706',
                  color: loading || !email ? '#9ca3af' : '#ffffff',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  fontWeight: '500',
                  cursor: loading || !email ? 'not-allowed' : 'pointer',
                  transition: 'background-color 0.2s',
                  width: '100%'
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
            </div>
          )}

          {/* Step 2: Nomination Form */}
          {step === 'form' && (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
                <p className="font-medium">Email verified successfully!</p>
                <p className="text-sm">You can now proceed with the nomination.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Award Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  required
                >
                  <option value="">Select an award category</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nominee First Name *
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nominee Last Name *
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nominee Email (Optional)
                  </label>
                  <input
                    type="email"
                    value={formData.nominatedEmail}
                    onChange={(e) => setFormData(prev => ({ ...prev, nominatedEmail: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="nominee@example.com"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    min="1980"
                    max={new Date().getFullYear()}
                    required
                  />
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Nomination Summary</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><strong>Category:</strong> {formData.category || 'Not selected'}</p>
                  <p><strong>Nominee:</strong> {formData.firstName} {formData.lastName}</p>
                  <p><strong>Graduation Year:</strong> {formData.year}</p>
                  <p><strong>Nominator:</strong> {email}</p>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-lg">
                <p className="text-sm">
                  <strong>Note:</strong> By submitting this nomination, you confirm that the information provided is accurate 
                  and that the nominee is a graduate of UNOR CIT. You can only submit one nomination per category.
                </p>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setStep('email')}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-lg font-medium transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={submitNomination}
                  disabled={loading || !formData.firstName || !formData.lastName || !formData.category || !formData.year}
                  className="flex-1 bg-amber-600 hover:bg-amber-700 disabled:bg-gray-400 text-white py-3 rounded-lg font-medium transition-colors"
                >
                  {loading ? 'Submitting...' : 'Submit Nomination'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default NominationModal
