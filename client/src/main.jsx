import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { ClerkProvider } from "@clerk/react";
import { CLERK_PUBLISHABLE_KEY } from "./utils/constants.js";
import { Provider } from "react-redux";
import { store } from "./app/store.js";

createRoot(document.getElementById("root")).render(
  <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
    <BrowserRouter>
      <Provider store={store}>
        <App />
      </Provider>
    </BrowserRouter>
  </ClerkProvider>,
);
