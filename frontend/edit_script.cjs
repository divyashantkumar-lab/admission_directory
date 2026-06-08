const fs = require('fs');
let code = fs.readFileSync('src/pages/StudentList.jsx', 'utf-8');

// 1. Add new Icons
const newIcons = `
const UsersIcon = ({ className = "" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={mergeClasses("w-4 h-4 inline", className)}>
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
  </svg>
);

const StarIcon = ({ className = "" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={mergeClasses("w-4 h-4 inline", className)}>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const CrownIcon = ({ className = "" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={mergeClasses("w-4 h-4 inline", className)}>
    <path d="M2 22h20M2 18l3-11 5 6 2-9 2 9 5-6 3 11H2z"/>
  </svg>
);

const FlagIcon = ({ className = "" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={mergeClasses("w-4 h-4 inline", className)}>
    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7" />
  </svg>
);
`;
code = code.replace('// ── Avatar Component', newIcons + '\n// ── Avatar Component');

// 2. Change Avatar sizes
code = code.replace(
  "sm: 'w-12 h-12 text-base',",
  "sm: 'w-16 h-16 text-xl',"
);

// 3. Main component changes
// We'll replace the inside of export default function StudentList() { ... }
const studentListCode = `export default function StudentList() {
  const dispatch = useDispatch();
  const { list, loading, error } = useSelector((state) => state.students);

  // Filter States
  const [searchInput, setSearchInput] = useState('');
  const [activeFilterTab, setActiveFilterTab] = useState('All students');

  // Student detail modal state
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Fetch all students once on mount
  useEffect(() => {
    dispatch(fetchStudents({}));
  }, [dispatch]);

  const openModal = useCallback((student) => setSelectedStudent(student), []);
  const closeModal = useCallback(() => setSelectedStudent(null), []);

  const handleClearAll = useCallback(() => {
    setSearchInput('');
    setActiveFilterTab('All students');
  }, []);

  const counts = useMemo(() => {
    return {
      'All students': list.length,
      'Open source': list.filter(s => s.openSource).length,
      'Internships': list.filter(s => s.internships).length,
      'Student council': list.filter(s => s.clubOrCouncil?.toLowerCase().includes('council')).length,
      'Core members': list.filter(s => s.clubOrCouncil?.toLowerCase().includes('core')).length,
      'OG OC': list.filter(s => s.clubOrCouncil?.toLowerCase().match(/\\b(og|oc)\\b/)).length,
    };
  }, [list]);

  const filterTabs = [
    { id: 'All students', label: 'All students', icon: <UsersIcon /> },
    { id: 'Open source', label: 'Open source', icon: <GitHubIcon /> },
    { id: 'Internships', label: 'Internships', icon: <BriefcaseIcon /> },
    { id: 'Student council', label: 'Student council', icon: <StarIcon /> },
    { id: 'Core members', label: 'Core members', icon: <CrownIcon /> },
    { id: 'OG OC', label: 'OG OC', icon: <FlagIcon /> },
  ];

  // Compute final filtered student list in memory (instant)
  const filteredStudents = useMemo(() => {
    return list.filter((student) => {
      // 1. Text Search
      if (searchInput.trim()) {
        const query = searchInput.toLowerCase().trim();
        const matchesSearchText =
          String(student.name || '').toLowerCase().includes(query) ||
          String(student.city || '').toLowerCase().includes(query) ||
          String(student.school || '').toLowerCase().includes(query) ||
          String(student.oneLiner || '').toLowerCase().includes(query) ||
          String(student.techStack || '').toLowerCase().includes(query) ||
          String(student.projectTitleSem1 || '').toLowerCase().includes(query) ||
          String(student.projectStackSem1 || '').toLowerCase().includes(query) ||
          String(student.projectTitleSem2 || '').toLowerCase().includes(query) ||
          String(student.projectStackSem2 || '').toLowerCase().includes(query);

        if (!matchesSearchText) return false;
      }

      if (activeFilterTab === 'Open source' && !student.openSource) return false;
      if (activeFilterTab === 'Internships' && !student.internships) return false;
      if (activeFilterTab === 'Student council' && !student.clubOrCouncil?.toLowerCase().includes('council')) return false;
      if (activeFilterTab === 'Core members' && !student.clubOrCouncil?.toLowerCase().includes('core')) return false;
      if (activeFilterTab === 'OG OC' && !student.clubOrCouncil?.toLowerCase().match(/\\b(og|oc)\\b/)) return false;

      return true;
    });
  }, [list, searchInput, activeFilterTab]);

  return (
    <>
      <SEOMeta
        title="Student Directory | Portfolio Compass"
        description="Browse student portfolios with academic achievements, technical skills, open source contributions and projects."
        path="/students"
      />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 -mt-6">
        
        {/* Horizontal Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-8">
          {filterTabs.map(tab => {
            const isActive = activeFilterTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveFilterTab(tab.id)}
                className={\`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all \${
                  isActive 
                    ? 'bg-brand-black text-white border-brand-black shadow-md' 
                    : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }\`}
              >
                <span className={isActive ? 'text-white' : 'text-gray-500'}>
                  {tab.icon}
                </span>
                <span className="font-semibold text-sm">{tab.label}</span>
                <span className={\`text-xs font-bold \${isActive ? 'text-gray-300' : 'text-gray-400'}\`}>
                  {counts[tab.id]}
                </span>
              </button>
            )
          })}
        </div>

        {/* ── STUDENT DIRECTORY LIST ───────────────────────────────────────── */}
        <div className="w-full">
          {/* Results metadata */}
          <div className="flex justify-between items-center mb-4">
            {!loading && (
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                {filteredStudents.length} profile{filteredStudents.length !== 1 ? 's' : ''} found
              </p>
            )}
            
            {/* Search input */}
            <div className="relative w-64">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                <SearchIcon />
              </span>
              <input
                type="text"
                placeholder="Search..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-10 pr-8 py-2 rounded-xl border border-black/10 bg-white text-sm focus:border-primary-2 focus:ring-2 focus:ring-primary-1/30 transition-all"
              />
              {searchInput && (
                <button
                  onClick={() => setSearchInput('')}
                  className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-gray-400 hover:text-gray-600"
                >
                  <CloseIcon />
                </button>
              )}
            </div>
          </div>

          {error && (
            <p className="text-red-600 mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-sm font-semibold" role="alert">
              {error}
            </p>
          )}

          {loading ? (
            <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-5">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => <CardSkeleton key={n} />)}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredStudents.map((student, index) => (
                <StudentCard
                  key={\`\${student.id}-\${index}\`}
                  student={student}
                  onOpen={() => openModal(student)}
                  onTagToggle={() => {}}
                  selectedTags={[]}
                />
              ))}

              {filteredStudents.length === 0 && (
                <div className="col-span-full text-center py-20 card-surface bg-white/50">
                  <EmptySearchIcon />
                  <p className="text-brand-black font-extrabold text-lg">No profiles found</p>
                  <p className="text-gray-500 text-sm mt-1 max-w-sm mx-auto">
                    No student matches the search query.
                  </p>
                  <button
                    onClick={handleClearAll}
                    className="mt-5 btn-primary !py-2 !px-5 !text-xs font-bold"
                  >
                    Clear Search
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Detail Modal overlay */}
      {selectedStudent && (
        <StudentModal student={selectedStudent} onClose={closeModal} />
      )}
    </>
  );
}`;

code = code.replace(/export default function StudentList\(\) \{[\s\S]*$/, studentListCode);

fs.writeFileSync('src/pages/StudentList.jsx', code);
