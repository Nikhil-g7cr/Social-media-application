import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { BrowserRouter as Router } from "react-router-dom";
import { Provider } from "react-redux";
createRoot(document.getElementById("root")!).render(
  <Router>
    <Provider>

    <App />
    </Provider>
  </Router>,
);
