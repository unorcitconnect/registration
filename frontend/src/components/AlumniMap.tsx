import { useState, useEffect } from 'react'

interface AlumniLocation {
  id: number
  firstName: string
  lastName: string
  country: string
  city: string
  latitude: number
  longitude: number
  year: number
}

const AlumniMap = () => {
  const [alumniLocations, setAlumniLocations] = useState<AlumniLocation[]>([])
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Sample data - in real app, this would come from the API
  const sampleLocations: AlumniLocation[] = [
    { id: 1, firstName: "John", lastName: "Doe", country: "Philippines", city: "Bacolod", latitude: 10.6767, longitude: 122.9500, year: 2020 },
    { id: 2, firstName: "Jane", lastName: "Smith", country: "United States", city: "San Francisco", latitude: 37.7749, longitude: -122.4194, year: 2019 },
    { id: 3, firstName: "Carlos", lastName: "Rodriguez", country: "Canada", city: "Toronto", latitude: 43.6532, longitude: -79.3832, year: 2018 },
    { id: 4, firstName: "Maria", lastName: "Garcia", country: "Australia", city: "Sydney", latitude: -33.8688, longitude: 151.2093, year: 2021 },
    { id: 5, firstName: "Ahmed", lastName: "Hassan", country: "United Kingdom", city: "London", latitude: 51.5074, longitude: -0.1278, year: 2017 },
    { id: 6, firstName: "Yuki", lastName: "Tanaka", country: "Japan", city: "Tokyo", latitude: 35.6762, longitude: 139.6503, year: 2020 },
    { id: 7, firstName: "Hans", lastName: "Mueller", country: "Germany", city: "Berlin", latitude: 52.5200, longitude: 13.4050, year: 2019 },
    { id: 8, firstName: "Pierre", lastName: "Dubois", country: "France", city: "Paris", latitude: 48.8566, longitude: 2.3522, year: 2018 }
  ]

  useEffect(() => {
    // Simulate API call
    const fetchAlumniLocations = async () => {
      setLoading(true)
      try {
        // In real app: const response = await fetch('/api/alumni/locations')
        // const data = await response.json()
        setTimeout(() => {
          setAlumniLocations(sampleLocations)
          setLoading(false)
        }, 1000)
      } catch (error) {
        console.error('Error fetching alumni locations:', error)
        setLoading(false)
      }
    }

    fetchAlumniLocations()
  }, [])

  const countryStats = alumniLocations.reduce((acc, alumni) => {
    acc[alumni.country] = (acc[alumni.country] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const topCountries = Object.entries(countryStats)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 8)

  return (
    <section className="py-20 bg-gradient-to-br from-indigo-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Alumni Around the World
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our graduates are making an impact across the globe. Discover where our alumni community thrives.
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 mx-auto mt-6"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* World Map Visualization */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl p-6 h-96">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Global Alumni Distribution</h3>
              
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
              ) : (
                  <div className="relative h-full bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl overflow-hidden">
                    {/* Improved world map representation */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg viewBox="0 0 1000 500" className="w-full h-full">
                        {/* More accurate world map continents */}
                        <g fill="#e5e7eb" stroke="#d1d5db" strokeWidth="1">
                          {/* North America */}
                          <path d="M50 100 Q80 80 120 90 L180 85 Q220 90 250 110 L280 130 Q300 150 290 180 L270 220 Q250 250 220 260 L180 270 Q150 280 120 270 L80 250 Q50 220 45 180 Q40 140 50 100 Z" />
                          {/* South America */}
                          <path d="M220 280 Q240 275 260 285 L280 300 Q290 330 285 360 L280 390 Q275 420 260 440 L240 450 Q220 455 200 450 L180 440 Q170 420 175 390 L180 360 Q185 330 200 300 Q210 285 220 280 Z" />
                          {/* Europe */}
                          <path d="M450 80 Q480 75 510 85 L540 95 Q560 105 570 125 L575 145 Q570 165 550 175 L520 180 Q490 175 470 165 L450 155 Q440 135 445 115 Q450 95 450 80 Z" />
                          {/* Africa */}
                          <path d="M480 180 Q510 175 540 185 L570 200 Q590 220 595 250 L600 280 Q595 310 585 340 L570 370 Q550 390 520 395 L490 390 Q470 380 460 360 L455 330 Q460 300 470 270 Q475 240 480 210 Q485 195 480 180 Z" />
                          {/* Asia */}
                          <path d="M580 70 Q620 65 660 75 L700 85 Q740 95 780 110 L820 130 Q850 150 860 180 L865 210 Q860 240 840 260 L800 275 Q760 280 720 275 L680 270 Q640 265 600 255 L580 245 Q570 225 575 195 Q580 165 585 135 Q590 105 580 70 Z" />
                          {/* Australia */}
                          <path d="M720 320 Q750 315 780 325 L810 335 Q830 345 835 365 L830 385 Q820 395 800 400 L770 395 Q750 390 730 385 L720 375 Q715 355 720 335 Q725 325 720 320 Z" />
                          {/* Antarctica */}
                          <path d="M100 450 Q300 445 500 450 Q700 455 900 450 L900 500 L100 500 Z" />
                        </g>
                        
                        {/* Alumni location pins */}
                        {alumniLocations.map((alumni) => {
                          // More accurate coordinate mapping
                          const x = ((alumni.longitude + 180) / 360) * 1000
                          const y = ((90 - alumni.latitude) / 180) * 400 + 50 // Adjusted for better positioning
                          
                          return (
                            <g key={alumni.id}>
                              <circle
                                cx={x}
                                cy={y}
                                r="6"
                                fill="#3b82f6"
                                stroke="#ffffff"
                                strokeWidth="2"
                                className="cursor-pointer hover:fill-red-500 transition-colors"
                                onClick={() => setSelectedCountry(alumni.country)}
                              >
                                <title>{`${alumni.firstName} ${alumni.lastName} - ${alumni.city}, ${alumni.country}`}</title>
                              </circle>
                              <circle
                                cx={x}
                                cy={y}
                                r="10"
                                fill="#3b82f6"
                                opacity="0.2"
                                className="animate-ping"
                              />
                            </g>
                          )
                        })}
                      </svg>
                    </div>
                  
                  {/* Legend */}
                  <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3">
                    <div className="flex items-center space-x-2 text-sm">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span>Alumni Location</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Country Statistics */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Top Countries</h3>
              <div className="space-y-4">
                {topCountries.map(([country, count], index) => (
                  <div 
                    key={country}
                    className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedCountry === country ? 'bg-indigo-100' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedCountry(selectedCountry === country ? null : country)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                        index === 0 ? 'bg-yellow-500' : 
                        index === 1 ? 'bg-gray-400' : 
                        index === 2 ? 'bg-amber-600' : 'bg-indigo-500'
                      }`}>
                        {index + 1}
                      </div>
                      <span className="font-medium text-gray-900">{country}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl font-bold text-indigo-600">{count}</span>
                      <span className="text-sm text-gray-500">alumni</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-xl p-6 text-white">
              <h3 className="text-xl font-bold mb-4">Global Reach</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Total Countries</span>
                  <span className="font-bold">{Object.keys(countryStats).length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Alumni</span>
                  <span className="font-bold">{alumniLocations.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Continents</span>
                  <span className="font-bold">6</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Selected Country Details */}
        {selectedCountry && (
          <div className="mt-8 bg-white rounded-2xl shadow-xl p-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Alumni in {selectedCountry}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {alumniLocations
                .filter(alumni => alumni.country === selectedCountry)
                .map(alumni => (
                  <div key={alumni.id} className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-bold text-gray-900">{alumni.firstName} {alumni.lastName}</h4>
                    <p className="text-gray-600">{alumni.city}, {alumni.country}</p>
                    <p className="text-sm text-indigo-600">Class of {alumni.year}</p>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

export default AlumniMap
