
import { useEffect, useState } from "react";

function Posts() {
  const [posts, setPosts] = useState([]);
  const [newTitle, setNewTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("https://jsonplaceholder.typicode.com/posts?_limit=5")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch posts");
        }
        return response.json();
      })
      .then((data) => {
        setPosts(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Could not load posts. Check your internet connection.");
        setLoading(false);
      });
  }, []);

  function addPost(event) {
    event.preventDefault();

    const title = newTitle.trim();

    if (!title) return;

    const post = {
      id: Date.now(),
      title: title,
      body: "This post was created in my React application."
    };

    setPosts((currentPosts) => [post, ...currentPosts]);
    setNewTitle("");
  }

  function deletePost(id) {
    setPosts((currentPosts) =>
      currentPosts.filter((post) => post.id !== id)
    );
  }

  if (loading) return <p>Loading posts...</p>;
  if (error) return <p>{error}</p>;

  return (
    <section>
      <h2>Posts from API</h2>

      <form onSubmit={addPost}>
        <label htmlFor="postTitle">New post title: </label>
        <input
          id="postTitle"
          type="text"
          value={newTitle}
          onChange={(event) => setNewTitle(event.target.value)}
          placeholder="Enter a title"
          required
        />
        <button type="submit">Add Post</button>
      </form>

      <p>Total posts: {posts.length}</p>

      {posts.map((post) => (
        <article key={post.id}>
          <h3>{post.title}</h3>
          <p>{post.body}</p>
          <button
            type="button"
            onClick={() => deletePost(post.id)}
          >
            Delete
          </button>
          <hr />
        </article>
      ))}
    </section>
  );
}

export default Posts;
