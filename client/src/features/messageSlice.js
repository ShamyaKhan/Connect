import { createSlice } from "@reduxjs/toolkit";

const messageSlice = createSlice({
  name: "message",
  initialState: {
    message: [],
  },
  reducers: {},
});

export default messageSlice.reducer;
