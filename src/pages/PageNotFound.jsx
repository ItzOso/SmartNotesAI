import React from "react";
import { Link } from "react-router-dom";

function PageNotFound() {
  return (
    <div className="text-center mt-48 flex flex-col gap-4 items-center">
      <div>
        <h2 className="text-7xl font-bold text-primary">404</h2>
        <p className="text-4xl font-semibold text-text">Page Not Found</p>
      </div>
      <p className="text-xl text-text-light max-w-lg">
        The page you were looking for does not exist. Make sure the URL is
        correct or go back to the homepage.
      </p>
      <Link className="btn-primary text-lg" to="/">
        Go Home
      </Link>
    </div>
  );
}

export default PageNotFound;
