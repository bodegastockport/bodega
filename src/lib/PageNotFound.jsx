import { Link } from 'react-router-dom';

export default function PageNotFound() {
  return (
    <div style={{ backgroundColor: "#f3f2ee", fontFamily: "'Courier New', Courier, monospace", minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "48px 24px" }}>
      <div style={{ textAlign: "center" }}>
        <p style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.1em", color: "#777777", marginBottom: "16px" }}>404</p>
        <h1 style={{ fontSize: "20px", color: "#193c47", fontWeight: 400, marginBottom: "12px" }}>Page not found</h1>
        <p style={{ fontSize: "13px", color: "#777777", marginBottom: "24px" }}>
          The page you're looking for doesn't exist.
        </p>
        <Link
          to="/"
          style={{
            display: "inline-block",
            padding: "8px 20px",
            backgroundColor: "#193c47",
            color: "#f3f2ee",
            textDecoration: "none",
            borderRadius: "4px",
            fontSize: "11px",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
