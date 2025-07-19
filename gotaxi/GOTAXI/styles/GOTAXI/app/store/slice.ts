import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { TypeFrom, TypeInitialState } from './types';
import { rideService, driverService } from '../services/api';

export const fetchDriverLocation = createAsyncThunk(
  'taxi/fetchDriverLocation',
  async (driverId: string) => {
    const response = await driverService.getDriverLocation(driverId);
    return response;
  }
);

export const createRide = createAsyncThunk(
  'taxi/createRide',
  async (rideData: {
    from: TypeFrom;
    to: TypeFrom;
    selectedOption: string;
    price: number;
  }) => {
    const response = await rideService.createRide(rideData);
    return response;
  }
);

export const fetchRideStatus = createAsyncThunk(
  'taxi/fetchRideStatus',
  async (rideId: string) => {
    const response = await rideService.getRideStatus(rideId);
    return response.ride;
  }
);

const initialState: TypeInitialState = {
  from: {} as TypeFrom,
  to: {} as TypeFrom,
  travelTime: 0,
  selectedOption: '',
  rideStatus: 'idle',
  driverLocation: null,
  price: 0,
  currentRideId: null,
  error: null,
};

export const taxiSlice = createSlice({
  name: 'taxi',
  initialState,
  reducers: {
    setFrom: (state, action) => {
      state.from = action.payload;
    },
    setTo: (state, action) => {
      state.to = action.payload;
    },
    setTravelTime: (state, action) => {
      state.travelTime = action.payload;
    },
    setSelectedOption: (state, action) => {
      state.selectedOption = action.payload;
    },
    setRideStatus: (state, action: { payload: TypeInitialState['rideStatus'] }) => {
      state.rideStatus = action.payload;
    },
    setDriverLocation: (state, action) => {
      state.driverLocation = action.payload;
    },
    setPrice: (state, action) => {
      state.price = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchDriverLocation
      .addCase(fetchDriverLocation.pending, (state) => {
        state.rideStatus = 'searching';
      })
      .addCase(fetchDriverLocation.fulfilled, (state, action) => {
        state.driverLocation = action.payload;
        state.rideStatus = 'driver_assigned';
      })
      .addCase(fetchDriverLocation.rejected, (state) => {
        state.rideStatus = 'idle';
        state.error = 'Failed to fetch driver location';
      })
      // createRide
      .addCase(createRide.pending, (state) => {
        state.rideStatus = 'searching';
        state.error = null;
      })
      .addCase(createRide.fulfilled, (state, action) => {
        state.currentRideId = action.payload.ride.id;
        state.rideStatus = 'searching';
      })
      .addCase(createRide.rejected, (state, action) => {
        state.rideStatus = 'idle';
        state.error = action.error.message || 'Failed to create ride';
      })
      // fetchRideStatus
      .addCase(fetchRideStatus.fulfilled, (state, action) => {
        const ride = action.payload;
        state.rideStatus = ride.status === 'accepted' ? 'driver_assigned' : 
                         ride.status === 'arriving' ? 'arriving' : 
                         ride.status === 'arrived' ? 'arrived' : 
                         ride.status === 'completed' ? 'completed' : 'searching';
        
        if (ride.driverLocation) {
          state.driverLocation = ride.driverLocation;
        }
      })
      .addCase(fetchRideStatus.rejected, (state) => {
        state.error = 'Failed to fetch ride status';
      });
  },
});

export const { actions, reducer } = taxiSlice;
