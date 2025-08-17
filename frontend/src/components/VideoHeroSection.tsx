import { useState } from 'react'

interface VideoHeroSectionProps {
  onJoinCelebration: () => void
  onLearnMore: () => void
}

const VideoHeroSection = ({ onJoinCelebration, onLearnMore }: VideoHeroSectionProps) => {
  const [videoError, setVideoError] = useState(false)

  return (
    <section className="py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="relative h-[600px] rounded-3xl overflow-hidden shadow-2xl">
          {/* Video Background */}
          {!videoError ? (
            <video
              className="absolute inset-0 w-full h-full object-cover"
              autoPlay
              muted
              loop
              playsInline
              onError={() => setVideoError(true)}
            >
              <source src="/hero.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          ) : (
            // Fallback gradient background if video fails to load
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900" />
          )}

          {/* Animated Light Beams */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Light beam 1 */}
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-transparent via-white/30 to-transparent transform -skew-x-12 animate-light-beam-1"></div>
            {/* Light beam 2 */}
            <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-transparent via-blue-300/20 to-transparent transform -skew-x-12 animate-light-beam-2"></div>
            {/* Light beam 3 */}
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-transparent via-indigo-300/25 to-transparent transform -skew-x-12 animate-light-beam-3"></div>
          </div>

          {/* Overlay */}
          <div className="absolute inset-0 bg-black/40" />

          {/* Content */}
          <div className="relative z-10 h-full">
            {/* Action Buttons - positioned in lower left */}
            <div className="absolute bottom-8 left-8">
              <div className="space-y-4 sm:space-y-0 sm:space-x-6 sm:flex">
                <button
                  onClick={onJoinCelebration}
                  className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  Join the Celebration
                </button>
                <button 
                  onClick={onLearnMore}
                  className="w-full sm:w-auto bg-transparent border-2 border-white text-white hover:bg-white hover:text-indigo-900 px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300"
                >
                  Learn More
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default VideoHeroSection
