import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix for default markers in React Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

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
  Latitude?: number
  Longitude?: number
  Paid?: boolean
}

interface AlumniLocation {
  country: string
  city: string
  latitude: number
  longitude: number
  alumni: Alumni[]
}

// Custom marker icon for alumni
const alumniIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

// Custom marker icon for clusters
const clusterIcon = (count: number) => new L.DivIcon({
  html: `<div class="cluster-marker">
    <div class="cluster-inner">
      <span>${count}</span>
    </div>
  </div>`,
  className: 'custom-div-icon',
  iconSize: [40, 40],
  iconAnchor: [20, 20]
})

const MapController = ({ locations }: { locations: AlumniLocation[] }) => {
  const map = useMap()
  
  useEffect(() => {
    // Set fixed world view - don't auto-fit to locations
    map.setView([20, 0], 2) // World center with zoom level 2
    
    // Disable all interactions
    map.dragging.disable()
    map.touchZoom.disable()
    map.doubleClickZoom.disable()
    map.scrollWheelZoom.disable()
    map.boxZoom.disable()
    map.keyboard.disable()
    
    // Disable tap for mobile (check if it exists)
    const mapWithTap = map as any
    if (mapWithTap.tap) mapWithTap.tap.disable()
  }, [map])

  return null
}

interface LeafletAlumniMapProps {
  refreshTrigger?: number
}

const LeafletAlumniMap = ({ refreshTrigger }: LeafletAlumniMapProps) => {
  const [alumni, setAlumni] = useState<Alumni[]>([])
  const [locations, setLocations] = useState<AlumniLocation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedLocation, setSelectedLocation] = useState<AlumniLocation | null>(null)

  useEffect(() => {
    fetchAlumni()
  }, [])

  // Refresh when refreshTrigger changes
  useEffect(() => {
    if (refreshTrigger && refreshTrigger > 0) {
      fetchAlumni()
    }
  }, [refreshTrigger])

  const fetchAlumni = async () => {
    try {
      const response = await fetch('/api/alumni?page_size=1000')
      if (response.ok) {
        const data = await response.json()
        setAlumni(data.alumni || [])
        processLocations(data.alumni || [])
      } else {
        setError('Failed to fetch alumni data')
      }
    } catch (err) {
      setError('Network error occurred')
    } finally {
      setLoading(false)
    }
  }

  // Default coordinates for countries
  const getCountryCoordinates = (country: string): { lat: number; lng: number } | null => {
    const countryCoords: { [key: string]: { lat: number; lng: number } } = {
      'Philippines': { lat: 12.8797, lng: 121.7740 },
      'United States': { lat: 39.8283, lng: -98.5795 },
      'Canada': { lat: 56.1304, lng: -106.3468 },
      'Australia': { lat: -25.2744, lng: 133.7751 },
      'United Kingdom': { lat: 55.3781, lng: -3.4360 },
      'Japan': { lat: 36.2048, lng: 138.2529 },
      'Singapore': { lat: 1.3521, lng: 103.8198 },
      'Germany': { lat: 51.1657, lng: 10.4515 },
      'France': { lat: 46.2276, lng: 2.2137 },
      'Italy': { lat: 41.8719, lng: 12.5674 },
      'Spain': { lat: 40.4637, lng: -3.7492 },
      'Netherlands': { lat: 52.1326, lng: 5.2913 },
      'Sweden': { lat: 60.1282, lng: 18.6435 },
      'Norway': { lat: 60.4720, lng: 8.4689 },
      'Denmark': { lat: 56.2639, lng: 9.5018 },
      'South Korea': { lat: 35.9078, lng: 127.7669 },
      'China': { lat: 35.8617, lng: 104.1954 },
      'India': { lat: 20.5937, lng: 78.9629 },
      'Thailand': { lat: 15.8700, lng: 100.9925 },
      'Malaysia': { lat: 4.2105, lng: 101.9758 },
      'Indonesia': { lat: -0.7893, lng: 113.9213 },
      'Vietnam': { lat: 14.0583, lng: 108.2772 },
      'Brazil': { lat: -14.2350, lng: -51.9253 },
      'Mexico': { lat: 23.6345, lng: -102.5528 },
      'Argentina': { lat: -38.4161, lng: -63.6167 },
      'Chile': { lat: -35.6751, lng: -71.5430 },
      'South Africa': { lat: -30.5595, lng: 22.9375 },
      'Egypt': { lat: 26.0975, lng: 31.2357 },
      'Nigeria': { lat: 9.0820, lng: 8.6753 },
      'Kenya': { lat: -0.0236, lng: 37.9062 },
      'Afghanistan': { lat: 33.9391, lng: 67.7100 },
      'Pakistan': { lat: 30.3753, lng: 69.3451 },
      'Bangladesh': { lat: 23.6850, lng: 90.3563 },
      'Sri Lanka': { lat: 7.8731, lng: 80.7718 },
      'Myanmar': { lat: 21.9162, lng: 95.9560 },
      'Cambodia': { lat: 12.5657, lng: 104.9910 },
      'Laos': { lat: 19.8563, lng: 102.4955 },
      'Nepal': { lat: 28.3949, lng: 84.1240 },
      'Bhutan': { lat: 27.5142, lng: 90.4336 },
      'Maldives': { lat: 3.2028, lng: 73.2207 }
    }
    
    return countryCoords[country] || null
  }

  const processLocations = (alumniData: Alumni[]) => {
    // Group alumni by location
    const locationMap = new Map<string, AlumniLocation>()
    
    alumniData.forEach(alumnus => {
      let latitude = alumnus.Latitude
      let longitude = alumnus.Longitude
      
      // If no coordinates, try to get default country coordinates
      if ((!latitude || latitude === 0) && (!longitude || longitude === 0)) {
        const coords = getCountryCoordinates(alumnus.Country)
        if (coords) {
          latitude = coords.lat
          longitude = coords.lng
        }
      }
      
      // Only add if we have valid coordinates
      if (latitude && longitude && latitude !== 0 && longitude !== 0) {
        const key = `${alumnus.Country}-${alumnus.City || 'Unknown City'}`
        
        if (locationMap.has(key)) {
          locationMap.get(key)!.alumni.push(alumnus)
        } else {
          locationMap.set(key, {
            country: alumnus.Country,
            city: alumnus.City || 'Unknown City',
            latitude: latitude,
            longitude: longitude,
            alumni: [alumnus]
          })
        }
      }
    })
    
    setLocations(Array.from(locationMap.values()))
  }

  if (loading) {
    return (
      <section className="py-16 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Alumni Around the World</h2>
            <div className="flex justify-center items-center h-96">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              <span className="ml-3 text-gray-600">Loading alumni locations...</span>
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="py-16 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Alumni Around the World</h2>
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg max-w-md mx-auto">
              {error}
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <>
      <style>{`
        .cluster-marker {
          background: rgba(59, 130, 246, 0.9);
          border: 3px solid white;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        }
        .cluster-inner {
          color: white;
          font-weight: bold;
          font-size: 14px;
        }
        .leaflet-popup-content-wrapper {
          border-radius: 12px;
          box-shadow: 0 8px 25px rgba(0,0,0,0.15);
        }
        .leaflet-popup-content {
          margin: 16px;
          line-height: 1.5;
        }
      `}</style>
      
      <section className="py-16 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Alumni Around the World</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our graduates are making an impact globally. Explore where our alumni are working and living today.
            </p>
            <div className="mt-6 flex justify-center space-x-8 text-sm text-gray-600">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-blue-500 rounded-full mr-2"></div>
                <span>{alumni.length} Total Alumni</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
                <span>{locations.length} Locations</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-purple-500 rounded-full mr-2"></div>
                <span>{new Set(locations.map(l => l.country)).size} Countries</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl overflow-hidden relative z-10">
            <div className="h-[600px] relative z-10">
              <MapContainer
                center={[20, 0]} // World center
                zoom={2}
                zoomControl={false}
                dragging={false}
                touchZoom={false}
                doubleClickZoom={false}
                scrollWheelZoom={false}
                boxZoom={false}
                keyboard={false}
                style={{ height: '100%', width: '100%', zIndex: 10 }}
                className="rounded-2xl"
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                <MapController locations={locations} />
                
                {locations.map((location, index) => (
                  <Marker
                    key={index}
                    position={[location.latitude, location.longitude]}
                    icon={location.alumni.length > 1 ? clusterIcon(location.alumni.length) : alumniIcon}
                    eventHandlers={{
                      click: () => setSelectedLocation(location)
                    }}
                  >
                    <Popup className="custom-popup">
                      <div className="min-w-[250px]">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-lg font-bold text-gray-900">
                            {location.city}, {location.country}
                          </h3>
                          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                            {location.alumni.length} alumni
                          </span>
                        </div>
                        
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {location.alumni.slice(0, 5).map((alumnus, idx) => (
                            <div key={idx} className="border-l-4 border-blue-500 pl-3 py-1">
                              <div className="font-medium text-gray-900">
                                {alumnus.FirstName} {alumnus.LastName}
                              </div>
                              <div className="text-sm text-gray-600">
                                {alumnus.Position} at {alumnus.Company}
                              </div>
                              <div className="text-xs text-gray-500">
                                Class of {alumnus.Year} • {alumnus.Course}
                              </div>
                            </div>
                          ))}
                          
                          {location.alumni.length > 5 && (
                            <div className="text-center pt-2">
                              <span className="text-sm text-blue-600 font-medium">
                                +{location.alumni.length - 5} more alumni
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {new Set(alumni.map(a => a.Country)).size}
              </div>
              <div className="text-gray-600">Countries Represented</div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {new Set(alumni.map(a => a.Company)).size}
              </div>
              <div className="text-gray-600">Companies</div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {alumni.length > 0 ? Math.max(...alumni.map(a => a.Year)) - Math.min(...alumni.map(a => a.Year)) + 1 : 0}
              </div>
              <div className="text-gray-600">Years of Graduates</div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default LeafletAlumniMap
