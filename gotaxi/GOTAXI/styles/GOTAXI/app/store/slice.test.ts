import { fetchDriverLocation } from './slice';
import axios from 'axios';
import { configureStore } from '@reduxjs/toolkit';
import taxiReducer, { RideStatus } from './slice';

jest.mock('axios');

describe('fetchDriverLocation', () => {
  it('updates state correctly on success', async () => {
    const mockResponse = { lat: 123, lng: 456 };
    (axios.get as jest.Mock).mockResolvedValue({ data: mockResponse });

    const store = configureStore({ reducer: { taxi: taxiReducer } });
    await store.dispatch(fetchDriverLocation('driver123'));

    const state = store.getState().taxi;
    expect(state.driverLocation).toEqual(mockResponse);
    expect(state.rideStatus).toBe(RideStatus.DriverAssigned);
  });
});