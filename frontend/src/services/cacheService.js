import {
  getFromCache,
  getAllFromCache,
  saveToCache,
  saveMultipleToCache,
  deleteFromCache,
  getCacheMetadata,
  setCacheMetadata,
  clearStore,
  STORES,
} from './indexedDB';

const CACHE_DURATIONS = {
  STUDENTS_LIST: 5 * 60 * 1000, // 5 minutes
  STUDENT_DETAIL: 10 * 60 * 1000, // 10 minutes
};

const METADATA_KEYS = {
  STUDENTS_LIST: 'students_list_cache',
  STUDENT_DETAIL: (id) => `student_detail_${id}`,
};

const isExpired = (timestamp, duration) => {
  return Date.now() - timestamp > duration;
};

export const cacheService = {
  // ─── STUDENTS LIST ───
  async getStudentsListFromCache() {
    try {
      const students = await getAllFromCache(STORES.STUDENTS_LIST);
      const metadata = await getCacheMetadata(METADATA_KEYS.STUDENTS_LIST);

      if (!metadata || isExpired(metadata.timestamp, CACHE_DURATIONS.STUDENTS_LIST)) {
        return null;
      }

      return students;
    } catch (error) {
      return null;
    }
  },

  async saveStudentsListToCache(students) {
    try {
      // Clear previous data
      await clearStore(STORES.STUDENTS_LIST);

      // Save all students in batch
      await saveMultipleToCache(STORES.STUDENTS_LIST, students);

      // Update metadata
      await setCacheMetadata(METADATA_KEYS.STUDENTS_LIST, {
        count: students.length,
      });

    } catch (error) {
    }
  },

  // ─── STUDENT DETAIL ───
  async getStudentDetailFromCache(id) {
    try {
      const student = await getFromCache(STORES.STUDENTS_DETAIL, id);
      const metadata = await getCacheMetadata(METADATA_KEYS.STUDENT_DETAIL(id));

      if (!student || !metadata || isExpired(metadata.timestamp, CACHE_DURATIONS.STUDENT_DETAIL)) {
        return null;
      }

      return student;
    } catch (error) {
      return null;
    }
  },

  async saveStudentDetailToCache(student) {
    try {
      await saveToCache(STORES.STUDENTS_DETAIL, student);
      await setCacheMetadata(METADATA_KEYS.STUDENT_DETAIL(student.id), {
        studentId: student.id,
      });
    } catch (error) {
    }
  },

  // ─── MUTATIONS ───
  async invalidateStudentsList() {
    try {
      await clearStore(STORES.STUDENTS_LIST);
      // Don't delete metadata, just clear store to force refetch
    } catch (error) {
    }
  },

  async removeStudentFromCache(id) {
    try {
      await deleteFromCache(STORES.STUDENTS_DETAIL, id);
      // Also remove from list cache
      const students = await getAllFromCache(STORES.STUDENTS_LIST);
      const updated = students.filter((s) => s.id !== id);
      await clearStore(STORES.STUDENTS_LIST);
      if (updated.length > 0) {
        await saveMultipleToCache(STORES.STUDENTS_LIST, updated);
      }
    } catch (error) {
    }
  },

  async updateStudentInCache(student) {
    try {
      // Update detail cache
      await saveToCache(STORES.STUDENTS_DETAIL, student);

      // Update in list cache
      const students = await getAllFromCache(STORES.STUDENTS_LIST);
      const index = students.findIndex((s) => s.id === student.id);
      if (index !== -1) {
        students[index] = student;
        await clearStore(STORES.STUDENTS_LIST);
        await saveMultipleToCache(STORES.STUDENTS_LIST, students);
      }
    } catch (error) {
    }
  },

  async addStudentToCache(student) {
    try {
      // Add to both stores
      await saveToCache(STORES.STUDENTS_DETAIL, student);
      await saveToCache(STORES.STUDENTS_LIST, student);
    } catch (error) {
    }
  },

  // ─── UTILITIES ───
  async clearAllCache() {
    try {
      await clearStore(STORES.STUDENTS_LIST);
      await clearStore(STORES.STUDENTS_DETAIL);
      await clearStore(STORES.CACHE_METADATA);
    } catch (error) {
    }
  },

  async getCacheStats() {
    try {
      const students = await getAllFromCache(STORES.STUDENTS_LIST);
      const listMeta = await getCacheMetadata(METADATA_KEYS.STUDENTS_LIST);
      return {
        studentsCount: students.length,
        lastUpdated: listMeta?.timestamp ? new Date(listMeta.timestamp).toLocaleString() : 'Never',
      };
    } catch (error) {
      return { studentsCount: 0, lastUpdated: 'Error' };
    }
  },
};

export default cacheService;
