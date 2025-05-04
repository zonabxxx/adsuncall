import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import callService from './callService';

const initialState = {
  calls: [],
  todaysCalls: [],
  call: {},
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: '',
};

// Create new call
export const createCall = createAsyncThunk(
  'calls/create',
  async (callData, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await callService.createCall(callData, token);
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get all calls
export const getCalls = createAsyncThunk(
  'calls/getAll',
  async (_, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await callService.getCalls(token);
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get today's calls
export const getTodaysCalls = createAsyncThunk(
  'calls/getToday',
  async (_, thunkAPI) => {
    try {
      console.log('Getting today calls - thunkAPI action');
      const token = thunkAPI.getState().auth.user.token;
      const result = await callService.getTodaysCalls(token);
      console.log('Today calls result from API:', result);
      return result;
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      console.error('Error in getTodaysCalls thunk:', message);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get client calls
export const getClientCalls = createAsyncThunk(
  'calls/getClientCalls',
  async (clientId, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await callService.getClientCalls(clientId, token);
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get call by ID
export const getCall = createAsyncThunk(
  'calls/get',
  async (callId, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await callService.getCall(callId, token);
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Update call
export const updateCall = createAsyncThunk(
  'calls/update',
  async ({ callId, callData }, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await callService.updateCall(callId, callData, token);
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Delete call
export const deleteCall = createAsyncThunk(
  'calls/delete',
  async (callId, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await callService.deleteCall(callId, token);
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const callSlice = createSlice({
  name: 'call',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isError = false;
      state.isSuccess = false;
      state.message = '';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createCall.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createCall.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.calls.push(action.payload);
      })
      .addCase(createCall.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(getCalls.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getCalls.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.calls = action.payload;
      })
      .addCase(getCalls.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(getTodaysCalls.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
      })
      .addCase(getTodaysCalls.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.isError = false;
        console.log('Reducer: setting todaysCalls to', action.payload);
        
        state.todaysCalls = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(getTodaysCalls.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.todaysCalls = [];
        console.error('Reducer: getTodaysCalls rejected with message:', action.payload);
      })
      .addCase(getClientCalls.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getClientCalls.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.calls = action.payload;
      })
      .addCase(getClientCalls.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(getCall.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getCall.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.call = action.payload;
      })
      .addCase(getCall.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(updateCall.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateCall.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.calls = state.calls.map(call => 
          call._id === action.payload._id ? action.payload : call
        );
      })
      .addCase(updateCall.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(deleteCall.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteCall.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.calls = state.calls.filter(call => call._id !== action.payload.id);
      })
      .addCase(deleteCall.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { reset } = callSlice.actions;
export default callSlice.reducer; 