import { useEffect, useState, useMemo, useCallback, useRef, useTransition } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import SEOMeta from '../components/SEOMeta';
import { fetchStudents } from '../store/studentSlice';
import { StudentCard, CardSkeleton } from '../components/StudentCard';
import StudentModal from '../components/StudentModal';
import { driveToDirectImg } from '../utils/helpers';
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

const debounce = (fn, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
};

export default function StudentList() {
  const dispatch = useDispatch();
  const { list, loading, error } = useSelector((state) => state.students);

  // Filter States
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeFilterTab, setActiveFilterTab] = useState('All students');

  // Student detail modal state
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Fetch all students once on mount
  useEffect(() => {
    dispatch(fetchStudents({}));
  }, [dispatch]);

  // Debounce search input (300ms delay)
  useEffect(() => {
    const debouncedFn = debounce((value) => setDebouncedSearch(value), 300);
    debouncedFn(searchInput);
    return () => clearTimeout(debouncedFn);
  }, [searchInput]);

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
      if (debouncedSearch.trim()) {
        const query = debouncedSearch.toLowerCase().trim();
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
  }, [list, debouncedSearch, activeFilterTab]);

  const [visibleCount, setVisibleCount] = useState(32); // Load more initially
  const [, startTransition] = useTransition();
  const loadMoreRef = useRef(null);
  const observerRef = useRef(null);
  const lastLoadTimeRef = useRef(0);
  const rafIdRef = useRef(null);
  const isLoadingRef = useRef(false);
  const scrollLockRef = useRef(false);

  // Reset pagination when search queries or filters change
  useEffect(() => {
    setVisibleCount(32); // Load 32 initially to avoid jump
  }, [searchInput, activeFilterTab]);

  const visibleStudents = useMemo(() => {
    return filteredStudents.slice(0, visibleCount);
  }, [filteredStudents, visibleCount]);

  // Optimized image preloading with unified size (256px)
  useEffect(() => {
    // Preload visible cards immediately with high priority
    const visibleImagesToLoad = filteredStudents.slice(0, visibleCount);
    visibleImagesToLoad.forEach(student => {
      if (student.profilePicture) {
        const img = new Image();
        img.loading = 'eager';
        if ('fetchPriority' in img) {
          img.fetchPriority = 'high';
        }
        img.src = driveToDirectImg(student.profilePicture, 256);
      }
    });

    // Preload next 32 cards in background with low priority
    const upcomingStudents = filteredStudents.slice(visibleCount, visibleCount + 32);
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        upcomingStudents.forEach(student => {
          if (student.profilePicture) {
            const img = new Image();
            img.src = driveToDirectImg(student.profilePicture, 256);
          }
        });
      }, { timeout: 2000 });
    }
  }, [visibleCount, filteredStudents]);

  // Optimized Intersection Observer with RAF debouncing and aggressive throttling
  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    if (!loadMoreRef.current) return;

    const handleIntersection = (entries) => {
      if (entries[0].isIntersecting && !isLoadingRef.current && !scrollLockRef.current) {
        const now = Date.now();
        // Reduced throttle: 500ms for smoother loading
        if (now - lastLoadTimeRef.current > 500) {
          lastLoadTimeRef.current = now;
          scrollLockRef.current = true;

          // Cancel previous RAF if pending
          if (rafIdRef.current) {
            cancelAnimationFrame(rafIdRef.current);
          }

          // Use RAF to sync with browser repaint cycle
          rafIdRef.current = requestAnimationFrame(() => {
            isLoadingRef.current = true;

            // Use startTransition to defer non-urgent update
            startTransition(() => {
              setVisibleCount((prev) => {
                // Load in smaller batches (16 instead of 32) for smoother appearance
                const newCount = Math.min(prev + 16, filteredStudents.length);

                // Reset loading flags after state update
                setTimeout(() => {
                  isLoadingRef.current = false;
                  scrollLockRef.current = false;
                }, 50);

                return newCount !== prev ? newCount : prev;
              });
            });
          });
        }
      }
    };

    const observer = new IntersectionObserver(handleIntersection, {
      threshold: 0,
      rootMargin: '2000px', // Load even earlier to prevent visible jumps
    });

    observer.observe(loadMoreRef.current);
    observerRef.current = observer;

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [filteredStudents.length]);

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
              <p className="text-xs font-bold text-black uppercase tracking-wider">
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
            <>
              <div
                className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
                style={{
                  willChange: 'contents',
                  contain: 'layout style paint',
                  contentVisibility: 'auto',
                  containIntrinsicSize: 'auto 8000px'
                }}
              >
                {visibleStudents.map((student) => (
                  <StudentCard
                    key={student.id}
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

              {filteredStudents.length > visibleCount && (
                <div ref={loadMoreRef} className="col-span-full h-px mt-6" />
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