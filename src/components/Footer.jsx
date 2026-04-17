export function Footer() {
  return (
    <footer className="relative w-full mt-20 border-t border-white/10 bg-white/5 backdrop-blur-md">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#147DE1]/5 via-transparent to-transparent pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-8 py-12 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
          {/* Logo & Copyright Section */}
          <div className="flex flex-col items-center md:items-start gap-3">
            <div className="flex items-center gap-3 group">
              {/* Logo Image from public folder */}
              <img 
                src="/logo.png" 
                alt="TixSigurado Logo" 
                className="h-8 w-auto transition-transform duration-300 group-hover:scale-110"
              />
            </div>
            <p className="font-body text-sm text-white/40 hover:text-white/60 transition-colors duration-300">
              © 2024 TixSigurado. Trust built into every ticket.
            </p>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-wrap justify-center gap-6 md:gap-8">
            {[
              { name: 'Terms of Service', icon: 'description' },
              { name: 'Privacy Policy', icon: 'privacy_tip' },
              { name: 'Verification', icon: 'verified_user' },
              { name: 'Support', icon: 'support_agent' },
            ].map((link, idx) => (
              <a
                key={link.name}
                href="#"
                className="group relative flex items-center gap-1.5 font-body text-sm text-white/50 hover:text-white transition-all duration-300 hover:-translate-y-0.5"
                style={{animationDelay: `${idx * 50}ms`}}
              >
                <span className="material-symbols-outlined text-sm opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-0 -translate-x-1">
                  {link.icon}
                </span>
                <span>{link.name}</span>
                {/* Subtle underline on hover */}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-[#147DE1] to-[#B1E5F5] group-hover:w-full transition-all duration-300" />
              </a>
            ))}
          </div>
        </div>

        {/* Bottom decorative line */}
        <div className="mt-8 pt-6 border-t border-white/5 flex justify-center">
          <div className="flex items-center gap-2 text-xs text-white/30">
            <span className="material-symbols-outlined text-[12px]">verified</span>
            <span>Secured on Stellar Blockchain</span>
            <div className="w-1 h-1 rounded-full bg-white/20 mx-1" />
            <span className="material-symbols-outlined text-[12px]">gpp_good</span>
            <span>On-Chain Verification</span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .footer-link {
          animation: fade-in 0.4s ease-out forwards;
        }
      `}</style>
    </footer>
  );
}