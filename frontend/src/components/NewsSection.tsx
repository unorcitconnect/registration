interface NewsSectionProps {
  onReadMore?: (newsId: number) => void
}

const NewsSection = ({ onReadMore }: NewsSectionProps) => {
  const newsItems = [
    {
      id: 1,
      title: "Alumni Homecoming 2025: A Grand Celebration",
      excerpt: "Join us for the biggest alumni gathering as we celebrate 40 years of excellence in IT education.",
      date: "March 15, 2025",
      image: "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=400&h=250&fit=crop",
      category: "Event"
    },
    {
      id: 2,
      title: "Outstanding Alumni Awards 2025",
      excerpt: "Nominate your fellow alumni who have made significant contributions to their fields and communities.",
      date: "February 28, 2025",
      image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=250&fit=crop",
      category: "Awards"
    },
    {
      id: 3,
      title: "Partnership & Sponsorship Opportunities",
      excerpt: "Join us as a sponsor and connect with our global alumni network. Multiple sponsorship levels available.",
      date: "February 20, 2025",
      image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=250&fit=crop",
      category: "Sponsorship"
    },
    {
      id: 4,
      title: "Alumni Success Stories",
      excerpt: "Inspiring journeys of our graduates who are making their mark in the tech industry worldwide.",
      date: "February 15, 2025",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=250&fit=crop",
      category: "Success"
    }
  ]

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Latest News & Updates
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Stay connected with the latest happenings in our alumni community and upcoming events
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 mx-auto mt-6"></div>
        </div>

        {/* News Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {newsItems.map((item) => (
            <article 
              key={item.id}
              className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden group"
            >
              {/* Image */}
              <div className="relative overflow-hidden">
                <img 
                  src={item.image} 
                  alt={item.title}
                  className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-indigo-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                    {item.category}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="text-sm text-gray-500 mb-2">{item.date}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                  {item.title}
                </h3>
                <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                  {item.excerpt}
                </p>
                <button 
                  onClick={() => onReadMore && onReadMore(item.id)}
                  className="text-indigo-600 hover:text-indigo-800 font-medium text-sm flex items-center group-hover:translate-x-1 transition-transform"
                >
                  Read More 
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </article>
          ))}
        </div>

        {/* View All News Button */}
        <div className="text-center mt-12">
          <button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            View All News
          </button>
        </div>

        {/* Stats Section */}
        <div className="mt-20 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-3xl p-8 md:p-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="group">
              <div className="text-3xl md:text-4xl font-bold text-indigo-600 mb-2 group-hover:scale-110 transition-transform">
                5,000+
              </div>
              <div className="text-gray-600 font-medium">Alumni Worldwide</div>
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
              <div className="text-gray-600 font-medium">Companies</div>
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
  )
}

export default NewsSection
