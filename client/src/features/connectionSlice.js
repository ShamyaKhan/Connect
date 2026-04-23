import { createSlice } from "@reduxjs/toolkit";

const connectionSlice = createSlice({
  name: "connection",
  initialState: {
    connections: [],
    pendingConnections: [],
    followers: [],
    following: [],
  },
  reducers: {},
});

export default connectionSlice.reducer;
