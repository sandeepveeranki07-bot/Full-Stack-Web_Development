
import { useEffect, useState } from "react";
import Login from "./login";
import Signup from "./signup";

function App() {
  const API = "http://localhost:5000/api/students";
  const [user, setUser] = useState(null);
  const [authScreen, setAuthScreen] = useState("login");
  const [authChecked, setAuthChecked] = useState(false);

  const [students, setStudents] = useState([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [course, setCourse] = useState("");
  const [editId, setEditId] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function checkSession() {
      const token = localStorage.getItem("token");

      if (token) {
        try {
          const response = await fetch(
            "http://localhost:5000/api/auth/profile",
            { headers: { Authorization: `Bearer ${token}` } }
          );

          if (response.ok) {
            const data = await response.json();
            setUser(data.user);
          } else {
            localStorage.removeItem("token");
          }
        } catch {
          setError("Cannot connect to backend.");
        }
      }

      setAuthChecked(true);
    }

    checkSession();
  }, []);

  async function loadStudents() {
    try {
      const response = await fetch(API);
      if (!response.ok) throw new Error("Failed to load students");
      setStudents(await response.json());
    } catch {
      setError("Cannot connect to backend. Check that it is running.");
    }
  }

  useEffect(() => {
    if (user) loadStudents();
  }, [user]);

  function handleAuthSuccess(data) {
    localStorage.setItem("token", data.token);
    setUser(data.user);
    setError("");
    setMessage("");
  }

  function logout() {
    localStorage.removeItem("token");
    setUser(null);
    setStudents([]);
    setAuthScreen("login");
    setMessage("");
    setError("");
  }

  function resetForm() {
    setName("");
    setEmail("");
    setCourse("");
    setEditId(null);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setError("");

    try {
      const response = await fetch(
        editId === null ? API : `${API}/${editId}`,
        {
          method: editId === null ? "POST" : "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, course })
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Operation failed");

      setMessage(
        editId === null
          ? "Student added successfully!"
          : "Student updated successfully!"
      );

      resetForm();
      await loadStudents();
    } catch (err) {
      setError(err.message || "Something went wrong.");
    }
  }

  function editStudent(student) {
    setEditId(student.id);
    setName(student.name);
    setEmail(student.email);
    setCourse(student.course);
    setMessage("");
    setError("");
    window.scrollTo(0, 0);
  }

  async function deleteStudent(id) {
    if (!window.confirm("Are you sure you want to delete this student?")) {
      return;
    }

    setMessage("");
    setError("");

    try {
      const response = await fetch(`${API}/${id}`, {
        method: "DELETE"
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Delete failed");

      setMessage("Student deleted successfully!");
      await loadStudents();
    } catch (err) {
      setError(err.message || "Could not delete student.");
    }
  }

  if (!authChecked) {
    return <p style={{ padding: 30 }}>Checking login...</p>;
  }

  if (!user) {
    return (
      <main style={{
        maxWidth: 420,
        margin: "50px auto",
        padding: 24,
        fontFamily: "Arial, sans-serif"
      }}>
        <h1>Full Stack Internship Project</h1>
        {authScreen === "login" ? (
          <Login
            onLoginSuccess={handleAuthSuccess}
            onShowSignup={() => setAuthScreen("signup")}
          />
        ) : (
          <Signup
            onSignupSuccess={handleAuthSuccess}
            onShowLogin={() => setAuthScreen("login")}
          />
        )}
      </main>
    );
  }

  return (
    <main style={{
      maxWidth: 850,
      margin: "35px auto",
      padding: 24,
      fontFamily: "Arial, sans-serif",
      color: "#222"
    }}>
      <header style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 12,
        flexWrap: "wrap"
      }}>
        <div>
          <h1>Full Stack Internship Project</h1>
          <p>Student Management System</p>
          <p>Logged in as: {user.name} ({user.email})</p>
        </div>
        <button onClick={logout}>Logout</button>
      </header>

      <h2>{editId === null ? "Add a Student" : "Edit Student"}</h2>

      <form onSubmit={handleSubmit} style={{
        display: "grid",
        gap: 12,
        marginBottom: 25
      }}>
        <input
          placeholder="Student name"
          value={name}
          onChange={e => setName(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Student email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <input
          placeholder="Course"
          value={course}
          onChange={e => setCourse(e.target.value)}
          required
        />

        <button type="submit">
          {editId === null ? "Add Student" : "Save Changes"}
        </button>

        {editId !== null && (
          <button type="button" onClick={resetForm}>
            Cancel Editing
          </button>
        )}
      </form>

      {message && <p style={{ color: "green" }}>{message}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <h2>Student Records ({students.length})</h2>

      {students.length === 0 && <p>No student records found.</p>}

      {students.map(student => (
        <article key={student.id} style={{
          border: "1px solid #ccc",
          borderRadius: 8,
          padding: 16,
          marginBottom: 12
        }}>
          <h3>{student.name}</h3>
          <p>Email: {student.email}</p>
          <p>Course: {student.course}</p>
          <button onClick={() => editStudent(student)}>Edit</button>{" "}
          <button onClick={() => deleteStudent(student.id)}>Delete</button>
        </article>
      ))}
    </main>
  );
}

export default App;
