import { Link, NavLink } from 'react-router-dom';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-brand-black border-b border-primary-1/20 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-wrap items-center justify-between gap-4">
          
          <nav className="flex items-center gap-6 flex-wrap" aria-label="Main navigation">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `nav-link ${isActive ? 'nav-link-active' : ''}`
              }
              end
            >
              Students Directory
            </NavLink>
          </nav>
        </div>
      </header>

      <main className="flex-1" style={{backgroundColor: "#e8873dff"}}>{children}</main>


      <footer className="bg-brand-black border-t border-primary-1/20 text-white/70 py-10 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-3 gap-8 mb-8">
            <div>
              <p className="font-bold text-white text-lg mb-2">
                Portfolio <span className="text-primary-1">Compass</span>
              </p>
              <p className="text-sm leading-relaxed">
                Helping students showcase achievements and giving parents a clear
                window into academic progress and project work.
              </p>
            </div>
            <div>
              <p className="font-semibold text-white mb-3">For students</p>
              <ul className="text-sm space-y-2">
                <li>Build your portfolio profile</li>
                <li>Highlight projects & tech skills</li>
                <li>Share deployment links</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-white mb-3">For parents</p>
              <ul className="text-sm space-y-2">
                <li>View academic scores at a glance</li>
                <li>Explore semester projects</li>
                <li>Track batch-wise progress</li>
              </ul>
            </div>
          </div>
          <p className="text-center text-xs text-white/40 border-t border-white/10 pt-6">
            Student Portfolio Compass — Built for learners and families
          </p>
        </div>
      </footer>
    </div>
  );
}
