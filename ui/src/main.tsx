import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { BrowserRouter as Router } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./redux/store"
import ScrollToTop from "./shared/shared-components/scrolledTop.tsx";
createRoot(document.getElementById("root")!).render(
  <Router>
    <ScrollToTop />
    <Provider store={store}>
      <App />
    </Provider>
  </Router>,
);
