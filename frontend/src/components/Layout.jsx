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

      <main className="flex-1" style={{ backgroundColor: "#f9f1d0" }}>{children}</main>


      <footer className="bg-brand-black border-t border-primary-1/20 text-white/70 py-12 mt-auto footer-content">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-12" style={{ fontFamily: "'Montserrat', sans-serif" }}>
            {/* Asia Book of Records Badge */}
            <div className="flex-shrink-0">
              <img
                src="https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcSCvQjv5YmvlJPhYAiidRAWuqzMxnMOC_qzWg7nwYY7d6xZGRp7"
                alt="Polaris Campus"
                className="w-32 h-44 object-cover rounded-sm shadow-lg"
                style={{
                  boxShadow: 'rgba(0, 0, 0, 0.25) 0px 3.65px 24px 0px'
                }}
              />
            </div>

            {/* Content Grid */}
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-8">
              {/* Programs Column */}
              <div>
                <p className="font-semibold text-white mb-4 italic text-lg">Programs</p>
                <ul className="text-sm space-y-3">
                  <li>
                    <a
                      href="https://polariscampus.com/programs/applied-artificial-intelligence"
                      className="hover:text-white transition-colors"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Applied Artificial Intelligence [with Microsoft]
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://polariscampus.com/programs/product-management-engineering"
                      className="hover:text-white transition-colors"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Product Management [with Amazon Web Services & Microsoft]
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://polariscampus.com/programs/cloud-big-data-engineering"
                      className="hover:text-white transition-colors"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Cloud & Big Data [with Google Cloud, Amazon Web Services & Microsoft]
                    </a>
                  </li>
                </ul>
              </div>

              {/* Explore Column */}
              <div>
                <p className="font-semibold text-white mb-4 italic text-lg">Explore</p>
                <ul className="text-sm space-y-2">
                  <li>
                    <a
                      href="https://polariscampus.com/career"
                      className="hover:text-white transition-colors"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Student Careers
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://polariscampus.com/faculty"
                      className="hover:text-white transition-colors"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Faculty
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://polariscampus.com/lifeat-pst"
                      className="hover:text-white transition-colors"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Life at Polaris
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://polariscampus.com/admissions"
                      className="hover:text-white transition-colors"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Admissions
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://polariscampus.com/experience"
                      className="hover:text-white transition-colors"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Experiences
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://luma.com/user/polariscampus"
                      className="hover:text-white transition-colors"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Events
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://blogs.polariscampus.com/"
                      className="hover:text-white transition-colors"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Blogs
                    </a>
                  </li>
                  <li>
                    <Link
                      to="/"
                      className="hover:text-white transition-colors"
                    >
                      Student Directory
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Address & Contact Column */}
              <div>
                <div className="mb-8">
                  <p className="font-semibold text-white mb-3 italic text-lg">Address</p>
                  <p className="text-sm leading-relaxed">
                    A3 Tower- DivyaSree Technopark,<br />
                    EPIP Zone, Brookfield,<br />
                    Bengaluru, Karnataka, 560066
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-white mb-3 italic text-lg">Contact</p>
                  <p className="text-sm">
                    <a
                      href="mailto:connect@polariscampus.com"
                      className="hover:text-white transition-colors"
                    >
                      connect@polariscampus.com
                    </a>
                  </p>
                  <p className="text-sm">
                    <a
                      href="tel:+917948062863"
                      className="hover:text-white transition-colors"
                    >
                      +91 79480 62863
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
