import { Navigate } from "react-router-dom";

const ProtectedAdmin = ({ children }) => {
  const isAdmin = localStorage.getItem("admin-auth") === "true";

  return isAdmin ? children : <Navigate to="/admin-login" />;
};

export default ProtectedAdmin;
