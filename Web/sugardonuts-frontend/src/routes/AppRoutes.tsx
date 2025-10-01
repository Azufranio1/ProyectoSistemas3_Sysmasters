import { Routes, Route } from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import PageOne from "../pages/PageOne";
import PageTwo from "../pages/PageTwo";
import NotFound from "../pages/NotFound";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/page-one" element={<PageOne />} />
      <Route path="/page-two" element={<PageTwo />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
