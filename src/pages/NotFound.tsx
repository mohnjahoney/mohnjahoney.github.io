import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div>
      <h1>Not found</h1>
      <p>
        <Link to="/">← Home</Link>
      </p>
    </div>
  );
}
