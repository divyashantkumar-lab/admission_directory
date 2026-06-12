import { useEffect, useState, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import SEOMeta from '../components/SEOMeta';
import { fetchStudents } from '../store/studentSlice';
import { StudentCard, CardSkeleton } from '../components/StudentCard';
import StudentModal from '../components/StudentModal';
import {
  UsersIcon,
  GitHubIcon,
  BriefcaseIcon,
  StarIcon,
  CrownIcon,
  FlagIcon,
  SearchIcon,
  CloseIcon,
  EmptySearchIcon,
  ClubMembersIcon,
  StudentCouncilIcon,
} from '../components/icons';

export default function StudentList() {
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

  // const counts = useMemo(() => {
  //   return {
  //     'All students': list.length,
  //     'Open source': list.filter(s => s.openSource).length,
  //     'Internships': list.filter(s => (s.internshipRole || s.internshipCompany)).length,
  //     'Student council': list.filter(s => s.clubOrCouncil != "").length,
  //     // 'Core members': list.filter(s => s.clubOrCouncil?.toLowerCase().includes('core')).length,
  //     // 'OG OC': list.filter(s => s.clubOrCouncil?.toLowerCase().match(/\b(og|oc)\b/)).length,
  //   };
  // }, [list]);

  const filterTabs = [
    { id: 'All students', label: 'All students', icon: <UsersIcon /> },
    { id: 'Open source', label: 'Open source', icon: <GitHubIcon /> },
    { id: 'Internships', label: 'Internships', icon: <BriefcaseIcon /> },
    { id: 'Club Members', label: 'Club Members', icon: <ClubMembersIcon/> },
    { id: 'Student Council', label: 'Student Council', icon: <StudentCouncilIcon /> },
    { id: 'Batch 2024', label: 'Batch 2024', icon: <StarIcon /> },
    { id: 'Batch 2025', label: 'Batch 2025', icon: <StarIcon /> },
    // { id: 'Core members', label: 'Core members', icon: <CrownIcon /> },
    // { id: 'OG OC', label: 'OG OC', icon: <FlagIcon /> },
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
      if (activeFilterTab === 'Internships' && !(student.internshipRole || student.internshipCompany)) return false;
      if (activeFilterTab === 'Club Members' && !student.club) return false;
      if (activeFilterTab === 'Student Council' && !student.studentCouncil) return false;
      if (activeFilterTab === 'Batch 2024' && (!student.classOf || !student.classOf.startsWith('2024'))) return false;
      if (activeFilterTab === 'Batch 2025' && (!student.classOf || !student.classOf.startsWith('2025'))) return false;
      // if (activeFilterTab === 'Core members' && !student.clubOrCouncil?.toLowerCase().includes('core')) return false;
      // if (activeFilterTab === 'OG OC' && !student.clubOrCouncil?.toLowerCase().match(/\b(og|oc)\b/)) return false;
      // classOf
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
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${isActive
                  ? 'bg-brand-black text-white border-brand-black shadow-md'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
              >
                <span className={isActive ? 'text-white' : 'text-gray-500'}>
                  {tab.icon}
                </span>
                <span className="font-semibold text-sm">{tab.label}</span>
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
                profile{filteredStudents.length !== 1 ? 's' : ''} found
              </p>
            )}

            {/* Search input */}
            <div className="relative w-64">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                <SearchIcon />
              </span>
              <input
                type="text"
                placeholder="Search by name, city, skills…"
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
                  key={`${student.id}-${index}`}
                  student={student}
                  onOpen={() => openModal(student)}
                  onTagToggle={() => { }}
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
}