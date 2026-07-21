import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../api/axiosInstance';

const initialState = {
  list: [],
  current: null,
  loading: false,
  loadingMore: false,
  error: null,
  filters: {
    batch: '',
    search: '',
    openSource: '',
    internship: '',
    club: '',
    studentCouncil: '',
  },
  pagination: {
    total: 0,
    limit: 24,
    offset: 0,
    hasMore: false,
  },
};

export const fetchStudents = createAsyncThunk(
  'students/fetchList',
  async (params, { rejectWithValue, dispatch }) => {
    try {
      const query = {
        limit: 24,
        offset: 0,
      };

      if (params?.batch) query.batch = params.batch;
      if (params?.search) query.search = params.search;
      if (params?.openSource) query.openSource = params.openSource;
      if (params?.internship) query.internship = params.internship;
      if (params?.club) query.club = params.club;
      if (params?.studentCouncil) query.studentCouncil = params.studentCouncil;

      const { data } = await axiosInstance.get('/students', { params: query });

      // Update filters in Redux state for pagination
      dispatch(setFilters({
        batch: params?.batch || '',
        search: params?.search || '',
        openSource: params?.openSource || '',
        internship: params?.internship || '',
        club: params?.club || '',
        studentCouncil: params?.studentCouncil || '',
      }));

      return {
        data: data.data,
        pagination: data.pagination,
      };
    } catch (err) {
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
      if (filters?.openSource) query.openSource = filters.openSource;
      if (filters?.internship) query.internship = filters.internship;
      if (filters?.club) query.club = filters.club;
      if (filters?.studentCouncil) query.studentCouncil = filters.studentCouncil;

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
      const { data } = await axiosInstance.get(`/students/${id}`);
      return { data: data.data };
    } catch (err) {
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
      })
      .addCase(fetchStudents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
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
      })
      .addCase(fetchStudentById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
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
