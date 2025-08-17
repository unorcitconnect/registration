interface HeroSectionProps {
  onJoinCelebration: () => void
}

const HeroSection = ({ onJoinCelebration }: HeroSectionProps) => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Video */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="/hero.mp4" type="video/mp4" />
      </video>
      
      {/* Video Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-50" />
      
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-20 w-3 h-3 bg-blue-400 rounded-full animate-bounce"></div>
        <div className="absolute bottom-32 left-1/4 w-2 h-2 bg-green-400 rounded-full animate-ping"></div>
        <div className="absolute bottom-20 right-1/3 w-4 h-4 bg-purple-400 rounded-full animate-pulse"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center text-white px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        {/* Main Hero Content */}
        <div className="mb-8">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-red-500 p-4 rounded-full mr-4">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-8 py-4">
              <h2 className="text-2xl md:text-3xl font-bold text-yellow-300">Did You Know?</h2>
            </div>
          </div>
          
          <div className="space-y-4 mb-8">
            <p className="text-lg md:text-xl text-blue-100">We are celebrating</p>
            <div className="flex items-center justify-center space-x-4">
              <div className="text-6xl md:text-8xl font-bold text-blue-300">40</div>
              <div className="text-right">
                <div className="text-2xl md:text-3xl font-bold text-yellow-400 transform -rotate-12">Years</div>
                <div className="text-lg text-blue-100">as College</div>
              </div>
            </div>
            <div className="flex items-center justify-center space-x-2 text-xl md:text-2xl">
              <span className="text-white font-bold">&</span>
              <span className="text-6xl md:text-7xl font-bold text-yellow-400">25</span>
            </div>
            <p className="text-lg md:text-xl text-blue-100">
              of IT Education<br />
              in Western Visayas
            </p>
          </div>

          {/* Connecting Worldwide */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-8">
            <div className="flex items-center justify-center space-x-4">
              <div className="flex space-x-1">
                {[...Array(15)].map((_, i) => (
                  <div key={i} className="w-2 h-2 bg-white rounded-full animate-pulse" style={{animationDelay: `${i * 0.1}s`}}></div>
                ))}
              </div>
            </div>
            <h3 className="text-3xl md:text-4xl font-bold mt-4">Connecting Worldwide!</h3>
          </div>
        </div>

        {/* Call to Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button 
            onClick={onJoinCelebration}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-2xl transform hover:scale-105 transition-all duration-300"
          >
            Join the Celebration
          </button>
          <button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-2xl transform hover:scale-105 transition-all duration-300">
            View Alumni Stories
          </button>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <div className="animate-bounce">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection
