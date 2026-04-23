import { configureStore } from "@reduxjs/toolkit";
import userReducer from "../features/userSlice";
import connectionReducer from "../features/connectionSlice";
import messageReducer from "../features/messageSlice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    message: messageReducer,
    connection: connectionReducer,
  },
});
