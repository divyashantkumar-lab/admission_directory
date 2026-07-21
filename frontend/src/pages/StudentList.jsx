import { useEffect, useState, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import SEOMeta from '../components/SEOMeta';
import { fetchStudents, fetchMoreStudents } from '../store/studentSlice';
import { StudentCard, CardSkeleton } from '../components/StudentCard';
import StudentModal from '../components/StudentModal';
import {
  UsersIcon,
  GitHubIcon,
  BriefcaseIcon,
  StarIcon,
  SearchIcon,
  CloseIcon,
  EmptySearchIcon,
  ClubMembersIcon,
  StudentCouncilIcon,
} from '../components/icons';

export default function StudentList() {
  const dispatch = useDispatch();
  const { list, loading, loadingMore, error, pagination } = useSelector(
    (state) => state.students
  );

  const [searchInput, setSearchInput] = useState('');
  const [activeFilterTab, setActiveFilterTab] = useState('All students');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const isInitialMount = useRef(true);
  const searchTimeoutRef = useRef(null);

  const observerRef = useRef(null);
  const loadMoreRef = useRef(null);

  // Initial fetch - only once on mount
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      dispatch(fetchStudents({}));
    }

    // Cleanup function
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [dispatch]);

  // Debounce search input - but skip on initial mount
  useEffect(() => {
    if (!isInitialMount.current && searchInput !== '') {
      // Clear previous timeout
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      // Set new timeout
      searchTimeoutRef.current = setTimeout(() => {
        dispatch(fetchStudents({ search: searchInput }));
      }, 300);
    }
  }, [searchInput, dispatch]);

  // Handle filter changes
  const handleFilterChange = useCallback((filterId) => {
    setActiveFilterTab(filterId);
    let batch = '';
    if (filterId.startsWith('Batch')) {
      batch = filterId.replace('Batch ', '');
    }
    dispatch(fetchStudents({ batch: batch || '' }));
  }, [dispatch]);

  const openModal = useCallback((student) => setSelectedStudent(student), []);
  const closeModal = useCallback(() => setSelectedStudent(null), []);

  const handleClearAll = useCallback(() => {
    setSearchInput('');
    setActiveFilterTab('All students');
    dispatch(fetchStudents({}));
  }, [dispatch]);

  const filterTabs = [
    { id: 'All students', label: 'All students', icon: <UsersIcon /> },
    { id: 'Open source', label: 'Open source', icon: <GitHubIcon /> },
    { id: 'Internships', label: 'Internships', icon: <BriefcaseIcon /> },
    { id: 'Club Members', label: 'Club Members', icon: <ClubMembersIcon /> },
    { id: 'Student Council', label: 'Student Council', icon: <StudentCouncilIcon /> },
    { id: 'Batch 2024', label: 'Batch 2024', icon: <StarIcon /> },
    { id: 'Batch 2025', label: 'Batch 2025', icon: <StarIcon /> },
  ];

  // Infinite scroll: Load more when sentinel is visible
  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    if (!loadMoreRef.current || !pagination.hasMore || loading || loadingMore) {
      return;
    }

    const handleIntersection = (entries) => {
      if (entries[0].isIntersecting && pagination.hasMore && !loadingMore) {
        dispatch(fetchMoreStudents());
      }
    };

    observerRef.current = new IntersectionObserver(handleIntersection, {
      threshold: 0.1,
      rootMargin: '200px',
    });

    observerRef.current.observe(loadMoreRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [pagination.hasMore, loading, loadingMore, dispatch]);

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
          {filterTabs.map((tab) => {
            const isActive = activeFilterTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleFilterChange(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${
                  isActive
                    ? 'bg-brand-black text-white border-brand-black shadow-md'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <span className={isActive ? 'text-white' : 'text-gray-500'}>
                  {tab.icon}
                </span>
                <span className="font-semibold text-sm">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* STUDENT DIRECTORY LIST */}
        <div className="w-full">
          {/* Results metadata */}
          <div className="flex justify-between items-center mb-4">
            {!loading && (
              <p className="text-xs font-bold text-black uppercase tracking-wider">
                {pagination.total} profile{pagination.total !== 1 ? 's' : ''} found
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
            <p
              className="text-red-600 mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-sm font-semibold"
              role="alert"
            >
              {error}
            </p>
          )}

          {loading ? (
            <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-5">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <CardSkeleton key={n} />
              ))}
            </div>
          ) : (
            <>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {list.map((student) => (
                  <StudentCard
                    key={student.id}
                    student={student}
                    onOpen={() => openModal(student)}
                    onTagToggle={() => {}}
                    selectedTags={[]}
                  />
                ))}

                {list.length === 0 && (
                  <div className="col-span-full text-center py-20 card-surface bg-white/50">
                    <EmptySearchIcon />
                    <p className="text-brand-black font-extrabold text-lg">
                      No profiles found
                    </p>
                    <p className="text-gray-500 text-sm mt-1 max-w-sm mx-auto">
                      No student matches your criteria.
                    </p>
                    <button
                      onClick={handleClearAll}
                      className="mt-5 btn-primary !py-2 !px-5 !text-xs font-bold"
                    >
                      Clear Filters
                    </button>
                  </div>
                )}
              </div>

              {/* Loading more indicator */}
              {loadingMore && (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mt-5">
                  {[1, 2, 3, 4].map((n) => (
                    <CardSkeleton key={`loading-${n}`} />
                  ))}
                </div>
              )}

              {/* Infinite scroll sentinel */}
              {pagination.hasMore && (
                <div ref={loadMoreRef} className="h-px mt-8" aria-label="Load more trigger" />
              )}

              {/* End of list message */}
              {!pagination.hasMore && list.length > 0 && (
                <div className="text-center py-8 mt-8">
                  <p className="text-gray-400 text-sm">
                    No more profiles to load • Showing {pagination.total} total
                  </p>
                </div>
              )}
            </>
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