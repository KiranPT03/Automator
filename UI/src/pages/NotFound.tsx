
import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/Layout/Layout";

const NotFound: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center py-20">
        <h1 className="text-9xl font-bold text-primary">404</h1>
        <p className="text-xl mt-4 mb-8">The page you're looking for doesn't exist</p>
        <Button onClick={() => navigate("/")} className="px-8">
          Return to Dashboard
        </Button>
      </div>
    </Layout>
  );
};

export default NotFound;
