interface OutstandingAlumniAwardsProps {
  onBack: () => void
  onNominate?: () => void
}

const OutstandingAlumniAwards = ({ onBack, onNominate }: OutstandingAlumniAwardsProps) => {
  const awardCategories = [
    {
      title: "Pioneer in Tech and Innovation",
      description: "Recognizing alumni who have made groundbreaking contributions to technology and innovation, leading digital transformation in their organizations or industries.",
      icon: "🚀",
      color: "from-blue-500 to-cyan-500"
    },
    {
      title: "Public Service and Social Impact",
      description: "Honoring alumni who have dedicated their careers to public service, making significant positive impacts on society and communities.",
      icon: "🏛️",
      color: "from-green-500 to-emerald-500"
    },
    {
      title: "Arts, Culture and Media Excellence",
      description: "Celebrating alumni who have excelled in creative fields, contributing to arts, culture, and media with outstanding achievements.",
      icon: "🎨",
      color: "from-purple-500 to-pink-500"
    },
    {
      title: "Outstanding Entrepreneurial Spirit",
      description: "Recognizing alumni who have demonstrated exceptional entrepreneurship, building successful businesses and creating employment opportunities.",
      icon: "💼",
      color: "from-orange-500 to-red-500"
    },
    {
      title: "Leadership in Healthcare and Wellness",
      description: "Honoring alumni who have made significant contributions to healthcare, medical technology, and wellness initiatives.",
      icon: "⚕️",
      color: "from-teal-500 to-green-500"
    },
    {
      title: "Global Impact Excellence Award",
      description: "Celebrating alumni who have made international impact, representing Filipino excellence on the global stage.",
      icon: "🌍",
      color: "from-indigo-500 to-purple-500"
    },
    {
      title: "Young Alumni Achievement",
      description: "Recognizing outstanding achievements by alumni who graduated within the last 10 years, showing exceptional early career success.",
      icon: "⭐",
      color: "from-yellow-500 to-orange-500"
    },
    {
      title: "Excellence in Education and Academic Leadership",
      description: "Honoring alumni who have made significant contributions to education, research, and academic leadership.",
      icon: "🎓",
      color: "from-blue-500 to-indigo-500"
    },
    {
      title: "Law Enforcement, Public Safety and Judiciary",
      description: "Recognizing alumni who have served with distinction in law enforcement, public safety, and the judicial system.",
      icon: "⚖️",
      color: "from-gray-600 to-gray-800"
    },
    {
      title: "Lifetime Achievement Award",
      description: "The highest honor, recognizing alumni who have demonstrated sustained excellence and made lasting contributions throughout their careers.",
      icon: "🏆",
      color: "from-yellow-400 to-yellow-600"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 text-indigo-700 hover:text-indigo-900 transition-colors"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="font-medium">Back to Home</span>
            </button>
            <div className="flex items-center space-x-3">
              <img 
                src="/cit_logo.png" 
                alt="CIT Logo" 
                className="h-10 w-10 object-contain"
              />
              <h1 className="text-2xl font-bold text-indigo-900">UNOR CIT Connect</h1>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Outstanding Alumni Awards 2025
          </h1>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto mb-6">
            Celebrating excellence and recognizing the remarkable achievements of our distinguished alumni 
            who have made significant contributions to their fields and communities worldwide.
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 mx-auto"></div>
        </div>

        {/* Awards Overview */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">About the Awards</h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  The Outstanding Alumni Awards 2025 is part of our 40th Anniversary celebration, 
                  recognizing 25 distinguished alumni who have brought honor to our institution 
                  through their exceptional achievements and contributions.
                </p>
                <p>
                  These awards celebrate alumni across diverse fields including Education, Government, 
                  IT Business, Law Enforcement, Judiciary, Arts & Media, and Entrepreneurship, 
                  showcasing the breadth of excellence within our alumni community.
                </p>
                <p>
                  The awards ceremony will be held during the Gala Night on November 22, 2025, 
                  at the Acacia Grand Pavilion Convention Hall as part of our grand anniversary celebration.
                </p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl p-8">
              <div className="text-center">
                <div className="text-6xl font-bold text-indigo-600 mb-2">25</div>
                <div className="text-xl font-semibold text-gray-800 mb-4">Distinguished Awardees</div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-white/50 rounded-lg p-3">
                    <div className="font-semibold text-indigo-600">10</div>
                    <div className="text-gray-700">Award Categories</div>
                  </div>
                  <div className="bg-white/50 rounded-lg p-3">
                    <div className="font-semibold text-purple-600">7</div>
                    <div className="text-gray-700">Fields Covered</div>
                  </div>
                  <div className="bg-white/50 rounded-lg p-3">
                    <div className="font-semibold text-green-600">40</div>
                    <div className="text-gray-700">Years Celebrated</div>
                  </div>
                  <div className="bg-white/50 rounded-lg p-3">
                    <div className="font-semibold text-orange-600">Nov 22</div>
                    <div className="text-gray-700">Awards Night</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Award Categories */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Award Categories</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {awardCategories.map((category, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden">
                <div className={`bg-gradient-to-r ${category.color} p-6 text-white`}>
                  <div className="text-4xl mb-3">{category.icon}</div>
                  <h3 className="text-xl font-bold">{category.title}</h3>
                </div>
                <div className="p-6">
                  <p className="text-gray-600 leading-relaxed">{category.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Nomination Process */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Nomination Process</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-indigo-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-indigo-600">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Submit Nomination</h3>
              <p className="text-gray-600">
                Alumni, faculty, and peers can nominate deserving candidates through our online nomination form.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-600">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Review & Evaluation</h3>
              <p className="text-gray-600">
                A distinguished panel reviews nominations based on achievements, impact, and contributions.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Awards Ceremony</h3>
              <p className="text-gray-600">
                Winners are honored during the Gala Night with certificates, plaques, and recognition.
              </p>
            </div>
          </div>
        </div>

        {/* Selection Criteria */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Selection Criteria</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold text-indigo-600 mb-4">Professional Excellence</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-indigo-500 rounded-full mr-3 mt-2"></span>
                  Outstanding achievements in their chosen field
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-indigo-500 rounded-full mr-3 mt-2"></span>
                  Leadership roles and responsibilities
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-indigo-500 rounded-full mr-3 mt-2"></span>
                  Innovation and pioneering contributions
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-indigo-500 rounded-full mr-3 mt-2"></span>
                  Recognition by peers and industry
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-purple-600 mb-4">Community Impact</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-3 mt-2"></span>
                  Positive impact on society and community
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-3 mt-2"></span>
                  Mentorship and support to others
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-3 mt-2"></span>
                  Contribution to alma mater
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-3 mt-2"></span>
                  Ethical leadership and integrity
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Awards Timeline</h2>
          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-indigo-500 to-purple-500"></div>
            <div className="space-y-8">
              <div className="flex items-center">
                <div className="flex-1 text-right pr-8">
                  <h3 className="text-lg font-semibold text-gray-900">Nomination Period</h3>
                  <p className="text-gray-600">Submit your nominations</p>
                </div>
                <div className="bg-indigo-500 rounded-full w-4 h-4 relative z-10"></div>
                <div className="flex-1 pl-8">
                  <p className="text-indigo-600 font-semibold">August - September 2025</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="flex-1 text-right pr-8">
                  <p className="text-purple-600 font-semibold">October 2025</p>
                </div>
                <div className="bg-purple-500 rounded-full w-4 h-4 relative z-10"></div>
                <div className="flex-1 pl-8">
                  <h3 className="text-lg font-semibold text-gray-900">Review & Selection</h3>
                  <p className="text-gray-600">Panel evaluation and finalist selection</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="flex-1 text-right pr-8">
                  <h3 className="text-lg font-semibold text-gray-900">Awards Ceremony</h3>
                  <p className="text-gray-600">Gala Night celebration</p>
                </div>
                <div className="bg-green-500 rounded-full w-4 h-4 relative z-10"></div>
                <div className="flex-1 pl-8">
                  <p className="text-green-600 font-semibold">November 22, 2025</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-8 md:p-12 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">Nominate a Deserving Alumni Today</h2>
          <p className="text-xl opacity-90 mb-8 max-w-3xl mx-auto">
            Help us recognize the outstanding achievements of our alumni community. 
            Your nomination could honor someone who has made a significant impact.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={onNominate || onBack}
              className="bg-white text-indigo-600 hover:bg-gray-100 px-8 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              Submit Nomination
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OutstandingAlumniAwards
