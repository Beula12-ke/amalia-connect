import { Link } from "react-router-dom";
export default function NotFound() {
  return (
    <div className="min-h-screen grid place-items-center bg-ivory">
      <div className="text-center">
        <h1 className="text-3xl text-navy mb-2">404 — Not found</h1>
        <Link to="/" className="btn-primary inline-block">Go home</Link>
      </div>
    </div>
  );
}