import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../api/axiosInstance';
import cacheService from '../services/cacheService';

const initialState = {
  list: [],
  current: null,
  loading: false,
  loadingMore: false,
  error: null,
  filters: { batch: '', search: '' },
  fromCache: false,
  pagination: {
    total: 0,
    limit: 24,
    offset: 0,
    hasMore: false,
  },
};

export const fetchStudents = createAsyncThunk(
  'students/fetchList',
  async (params, { rejectWithValue }) => {
    try {
      // Fallback to network with pagination
      const query = {
        limit: 24,
        offset: 0,
      };
      if (params?.batch) query.batch = params.batch;
      if (params?.search) query.search = params.search;
      const { data } = await axiosInstance.get('/students', { params: query });

      // Save to cache
      if (data.data && data.data.length > 0) {
        await cacheService.saveStudentsListToCache(data.data);
      }

      return {
        data: data.data,
        pagination: data.pagination,
        fromCache: false,
      };
    } catch (err) {
      // If network fails, try cache as fallback
      try {
        const cachedStudents = await cacheService.getStudentsListFromCache();
        if (cachedStudents && cachedStudents.length > 0) {
          return {
            data: cachedStudents,
            pagination: {
              total: cachedStudents.length,
              limit: 24,
              offset: 0,
              hasMore: cachedStudents.length > 24,
            },
            fromCache: true,
          };
        }
      } catch (cacheErr) {
        // Cache fallback failed
      }

      return rejectWithValue(
        err.response?.data?.message || 'Failed to load students'
      );
    }
  }
);

export const fetchMoreStudents = createAsyncThunk(
  'students/fetchMore',
  async (params, { rejectWithValue, getState }) => {
    try {
      const state = getState();
      const currentOffset = state.students.pagination.offset;
      const filters = state.students.filters;

      const query = {
        limit: 24,
        offset: currentOffset + 24,
      };
      if (filters?.batch) query.batch = filters.batch;
      if (filters?.search) query.search = filters.search;

      const { data } = await axiosInstance.get('/students', { params: query });

      return {
        data: data.data,
        pagination: data.pagination,
      };
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to load more students'
      );
    }
  }
);

export const fetchStudentById = createAsyncThunk(
  'students/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      // Try to get from cache first
      const cachedStudent = await cacheService.getStudentDetailFromCache(id);
      if (cachedStudent) {
        return { data: cachedStudent, fromCache: true };
      }

      // Fallback to network
      const { data } = await axiosInstance.get(`/students/${id}`);

      // Save to cache
      await cacheService.saveStudentDetailToCache(data.data);

      return { data: data.data, fromCache: false };
    } catch (err) {
      // If network fails, try cache as fallback
      try {
        const cachedStudent = await cacheService.getStudentDetailFromCache(id);
        if (cachedStudent) {
          return { data: cachedStudent, fromCache: true };
        }
      } catch (cacheErr) {
        // Cache fallback failed
      }

      return rejectWithValue(
        err.response?.data?.message || 'Failed to load student'
      );
    }
  }
);

export const createStudent = createAsyncThunk(
  'students/create',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post('/students', payload);
      // Update cache
      await cacheService.addStudentToCache(data.data);
      return data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to create student'
      );
    }
  }
);

export const updateStudent = createAsyncThunk(
  'students/update',
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.put(`/students/${id}`, payload);
      // Update cache
      await cacheService.updateStudentInCache(data.data);
      return data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to update student'
      );
    }
  }
);

export const deleteStudent = createAsyncThunk(
  'students/delete',
  async (id, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/students/${id}`);
      // Update cache
      await cacheService.removeStudentFromCache(id);
      return id;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to delete student'
      );
    }
  }
);

const studentSlice = createSlice({
  name: 'students',
  initialState,
  reducers: {
    setFilters(state, action) {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearCurrent(state) {
      state.current = null;
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStudents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStudents.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.data;
        state.pagination = action.payload.pagination;
        state.fromCache = action.payload.fromCache;
      })
      .addCase(fetchStudents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.fromCache = false;
      })
      .addCase(fetchMoreStudents.pending, (state) => {
        state.loadingMore = true;
        state.error = null;
      })
      .addCase(fetchMoreStudents.fulfilled, (state, action) => {
        state.loadingMore = false;
        state.list = [...state.list, ...action.payload.data];
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchMoreStudents.rejected, (state, action) => {
        state.loadingMore = false;
        state.error = action.payload;
      })
      .addCase(fetchStudentById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStudentById.fulfilled, (state, action) => {
        state.loading = false;
        state.current = action.payload.data;
        state.fromCache = action.payload.fromCache;
      })
      .addCase(fetchStudentById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.fromCache = false;
      })
      .addCase(createStudent.fulfilled, (state, action) => {
        state.list.push({
          id: action.payload.id,
          name: action.payload.name,
          batch: action.payload.batch,
          school: action.payload.school,
          oneLiner: action.payload.oneLiner,
          techStack: action.payload.techStack,
        });
      })
      .addCase(updateStudent.fulfilled, (state, action) => {
        state.current = action.payload;
        const idx = state.list.findIndex((s) => s.id === action.payload.id);
        if (idx !== -1) {
          state.list[idx] = {
            id: action.payload.id,
            name: action.payload.name,
            batch: action.payload.batch,
            school: action.payload.school,
            oneLiner: action.payload.oneLiner,
            techStack: action.payload.techStack,
          };
        }
      })
      .addCase(deleteStudent.fulfilled, (state, action) => {
        state.list = state.list.filter((s) => s.id !== action.payload);
        state.current = null;
      });
  },
});

export const { setFilters, clearCurrent, clearError } = studentSlice.actions;
export default studentSlice.reducer;
