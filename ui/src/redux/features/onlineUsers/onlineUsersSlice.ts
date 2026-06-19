import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface OnlineUsersState {
  onlineUserIds: string[];
}

const initialState: OnlineUsersState = {
  onlineUserIds: [],
};

const onlineUsersSlice = createSlice({
  name: 'onlineUsers',
  initialState,
  reducers: {
    setOnlineUsers(state, action: PayloadAction<string[]>) {
      state.onlineUserIds = action.payload;
    },
    userOnline(state, action: PayloadAction<string>) {
      if (!state.onlineUserIds.includes(action.payload)) {
        state.onlineUserIds.push(action.payload);
      }
    },
    userOffline(state, action: PayloadAction<string>) {
      state.onlineUserIds = state.onlineUserIds.filter(id => id !== action.payload);
    }
  }
});

export const { setOnlineUsers, userOnline, userOffline } = onlineUsersSlice.actions;
export default onlineUsersSlice.reducer;
