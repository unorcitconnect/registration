import { useState } from 'react'

interface AlumniSuccessStoriesProps {
  onBack: () => void
}

interface SuccessStory {
  id: number
  name: string
  graduationYear: string
  course: string
  currentPosition: string
  company: string
  story: string
  achievements: string[]
  image: string
  linkedIn?: string
}

// Placeholder data for success stories
const successStories: SuccessStory[] = [
  {
    "id": 1,
    "name": "Quincyanne Mari T. Tampo",
    "graduationYear": "2015",
    "course": "Bachelor of Science in Information Technology",
    "currentPosition": "Senior Assistant R&D Engineer",
    "company": "Advanced World Solutions, Inc.",
    "story": "The programming activities practiced in school come in handy since I have been assigned to projects with different domains used. The ethics taught to us were also really applicable in the workplace, and really helped me discern how to behave inside the office.",
    "achievements": [],
    "image": "public/images/quincyanne_tampo.jpg",
    "linkedIn": ""
  },
  {
    "id": 2,
    "name": "Shad Roi A. De La Cruz",
    "graduationYear": "2014",
    "course": "Bachelor of Science in Computer Science",
    "currentPosition": "Special Operations Lead",
    "company": "Symph / Co-founder & Managing Lead, Shiftrē Digital Co",
    "story": "I believe that one of the biggest learning I got from the UNO-R College of Information Technology is on how to do problem-solving and critical thinking... allowing yourself to exercise your mind through programming that allow you to find the best solutions and reasonable conclusions that work.",
    "achievements": [
      "Google Ambassador",
      "Co-founded Shiftrē Digital Co"
    ],
    "image": "public/images/shad_roi_delacruz.jpg",
    "linkedIn": ""
  },
  {
    "id": 3,
    "name": "Shemamee N. Clavecillas",
    "graduationYear": "2010",
    "course": "Bachelor of Science in Computer Science",
    "currentPosition": "Associate R&D Engineer",
    "company": "Advanced World Solutions, Inc.",
    "story": "The ability to effectively deliver outputs considering time and resource constraints, understanding clients’ needs and perspective when dealing with a project, and being passionate about communication and innovation to succeed. I learned to be a more functional and self-sustained individual.",
    "achievements": [],
    "image": "public/images/shemamee_clavecillas.jpg",
    "linkedIn": ""
  },
  {
    "id": 4,
    "name": "Ralph Anthony P. Palomar",
    "graduationYear": "2009",
    "course": "Bachelor of Science in Computer Science",
    "currentPosition": "Technology Consultant",
    "company": "Hewlett Packard Enterprise",
    "story": "My program of study had provided me with opportunities to improve things and find ways through innovation. Social connections, business processes, automating tasks, setting goals and the right attitude were learned from school and applied in my current assignments.",
    "achievements": [],
    "image": "public/images/ralph_palomar.jpg",
    "linkedIn": ""
  },
  {
    "id": 5,
    "name": "John Mari B. Asuncion",
    "graduationYear": "2013",
    "course": "Bachelor of Science in Computer Science",
    "currentPosition": "Software Engineer",
    "company": "Advanced World Solutions, Inc.",
    "story": "I am still able to apply the learning I had during college in my workplace. Courses like database management and programming were really helpful... have more technical knowledge to give you the kind of head start.",
    "achievements": [],
    "image": "public/images/john_mari_asuncion.jpg",
    "linkedIn": ""
  },
  {
    "id": 6,
    "name": "Milmar Q. Tan",
    "graduationYear": "2005",
    "course": "Bachelor of Science in Computer Science",
    "currentPosition": "Software Engineer",
    "company": "Hewlett Packard - Singapore",
    "story": "The UNO-Recoletos College of Information Technology had equipped me with sufficient knowledge on the different programming languages, automata theory and the software development life cycle which had helped me in performing varied tasks in my workplace.",
    "achievements": [],
    "image": "public/images/milmar_tan.jpg",
    "linkedIn": ""
  }
]

function AlumniSuccessStories({ onBack }: AlumniSuccessStoriesProps) {
  const [selectedStory, setSelectedStory] = useState<SuccessStory | null>(null)

  const handleViewDetails = (story: SuccessStory) => {
    setSelectedStory(story)
  }

  const handleCloseDetails = () => {
    setSelectedStory(null)
  }

  if (selectedStory) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Navigation */}
        <nav className="bg-white/80 backdrop-blur-md shadow-lg sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <button
                onClick={handleCloseDetails}
                className="flex items-center space-x-2 text-indigo-700 hover:text-indigo-900 transition-colors"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="font-medium">Back to Success Stories</span>
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

        <div className="py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-3xl shadow-xl p-8">
              <div className="flex items-center mb-8">
                <img
                  src={selectedStory.image}
                  alt={selectedStory.name}
                  className="w-20 h-20 rounded-full object-cover mr-6"
                />
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{selectedStory.name}</h1>
                  <h2 className="text-xl text-indigo-600 font-semibold mb-1">{selectedStory.currentPosition}</h2>
                  <p className="text-gray-600">{selectedStory.company}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Success Story</h3>
                  <p className="text-gray-700 leading-relaxed mb-6">{selectedStory.story}</p>

                  <h3 className="text-xl font-bold text-gray-900 mb-4">Key Achievements</h3>
                  <div className="space-y-3">
                    {selectedStory.achievements.map((achievement, index) => (
                      <div key={index} className="flex items-center">
                        <svg className="w-5 h-5 text-yellow-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="text-gray-700">{achievement}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Academic Background</h3>
                  <div className="flex items-center mb-4">
                    <svg className="w-6 h-6 text-indigo-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                    </svg>
                    <div>
                      <p className="font-semibold text-gray-900">{selectedStory.course}</p>
                      <p className="text-gray-600">Class of {selectedStory.graduationYear}</p>
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 mb-4">Current Role</h3>
                  <div className="flex items-center mb-4">
                    <svg className="w-6 h-6 text-indigo-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm2 6a2 2 0 104 0 2 2 0 00-4 0zm6 0a2 2 0 104 0 2 2 0 00-4 0z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p className="font-semibold text-gray-900">{selectedStory.currentPosition}</p>
                      <p className="text-gray-600">{selectedStory.company}</p>
                    </div>
                  </div>

                  {selectedStory.linkedIn && (
                    <a
                      href={selectedStory.linkedIn}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center"
                    >
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z" clipRule="evenodd" />
                      </svg>
                      Connect on LinkedIn
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

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

      <section className="py-20 bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Alumni Success Stories
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto">
              Inspiring journeys of our graduates who are making their mark in the tech industry worldwide. 
              Discover how UNOR CIT education has shaped successful careers across the globe.
            </p>
            <div className="w-24 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 mx-auto mt-6"></div>
          </div>

          {/* Success Stories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            {successStories.map((story) => (
              <div 
                key={story.id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <img
                      src={story.image}
                      alt={story.name}
                      className="w-16 h-16 rounded-full object-cover mr-4"
                    />
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{story.name}</h3>
                      <p className="text-gray-600">Class of {story.graduationYear}</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium">
                      {story.course}
                    </span>
                  </div>

                  <h4 className="text-lg font-semibold text-indigo-600 mb-1">{story.currentPosition}</h4>
                  <p className="text-gray-600 mb-4">{story.company}</p>

                  <p className="text-gray-700 text-sm leading-relaxed mb-4 line-clamp-3">
                    {story.story}
                  </p>

                  <button
                    onClick={() => handleViewDetails(story)}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                  >
                    Read Full Story
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Call to Action */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-8 md:p-12 text-white text-center">
            <h3 className="text-3xl font-bold mb-4">Share Your Success Story</h3>
            <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
              Are you a UNOR CIT graduate with an inspiring career journey? We'd love to feature your story 
              and inspire current students and fellow alumni.
            </p>
            <button className="bg-white text-indigo-600 hover:bg-gray-100 px-8 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              Submit Your Story
            </button>
          </div>

          {/* Stats Section */}
          <div className="mt-16 bg-white rounded-3xl shadow-xl p-8 md:p-12">
            <div className="text-center mb-8">
              <h3 className="text-3xl font-bold text-gray-900 mb-4">Our Alumni Impact</h3>
              <p className="text-xl text-gray-600">Making a difference across industries and continents</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div className="group">
                <div className="text-3xl md:text-4xl font-bold text-indigo-600 mb-2 group-hover:scale-110 transition-transform">
                  5,000+
                </div>
                <div className="text-gray-600 font-medium">Global Alumni</div>
              </div>
              <div className="group">
                <div className="text-3xl md:text-4xl font-bold text-purple-600 mb-2 group-hover:scale-110 transition-transform">
                  50+
                </div>
                <div className="text-gray-600 font-medium">Countries</div>
              </div>
              <div className="group">
                <div className="text-3xl md:text-4xl font-bold text-amber-600 mb-2 group-hover:scale-110 transition-transform">
                  100+
                </div>
                <div className="text-gray-600 font-medium">Tech Companies</div>
              </div>
              <div className="group">
                <div className="text-3xl md:text-4xl font-bold text-green-600 mb-2 group-hover:scale-110 transition-transform">
                  40
                </div>
                <div className="text-gray-600 font-medium">Years of Excellence</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default AlumniSuccessStories
