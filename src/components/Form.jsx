
import { useState } from "react";

function Form(props) {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");

  function handleSubmit(event) {
    event.preventDefault();

    const cleanName = name.trim();

    if (cleanName === "") {
      setMessage("Please enter your name.");
      return;
    }

    setMessage("Welcome, " + cleanName + "!");
  }

  return (
    <section>
      <h2>{props.heading}</h2>

      <form onSubmit={handleSubmit}>
        <label htmlFor="studentName">Your Name: </label>

        <input
          id="studentName"
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Enter your name"
          required
        />

        <button type="submit">Submit</button>
      </form>

      <h3>{message}</h3>
    </section>
  );
}

export default Form;
