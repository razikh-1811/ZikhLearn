import { useState } from "react";
import { useNavigate } from "react-router-dom";

const AdminLogin = () => {
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const login = () => {
    if (password === "admin123") {
      localStorage.setItem("admin-auth", "true");
      navigate("/admin");
    } else {
      alert("Invalid admin password");
    }
  };

  return (
    <div style={styles.container}>
      <h2>Admin Login</h2>
      <input
        type="password"
        placeholder="Admin Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={styles.input}
      />
      <button onClick={login} style={styles.btn}>Login</button>
    </div>
  );
};

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    gap: 12
  },
  input: { padding: 10, width: 220 },
  btn: { padding: "10px 20px", cursor: "pointer" }
};

export default AdminLogin;
