"use client";

import { createContext, useContext, useEffect, useState } from "react";

const ProjectsContext = createContext(undefined);

const demoProjects = [
  {
    id: "1",
    title: "E-commerce Platform",
    introduction:
      "A complete e-commerce solution with React frontend and Laravel backend. This project includes product management, cart functionality, checkout process, and admin dashboard.",
    prerequisites: "Node.js 16+, PHP 8.1+, Composer, MySQL 8.0+",
    installation: {
      frontend:
        "1. Clone the repository\n2. Run `npm install`\n3. Configure environment variables\n4. Run `npm run dev`",
      backend:
        "1. Navigate to the backend directory\n2. Run `composer install`\n3. Configure .env file\n4. Run migrations with `php artisan migrate`\n5. Seed database with `php artisan db:seed`",
    },
    configuration: {
      frontend:
        "Configure the .env file with your API endpoints and other environment-specific settings.",
      backend:
        "Set up your database credentials, mail server, and other Laravel configurations in the .env file.",
    },
    databaseSetup:
      "The database schema includes tables for users, products, categories, orders, and payments. Relationships are established between these tables for efficient data retrieval.",
    authentication:
      "The authentication system uses Laravel Sanctum for API token authentication. The frontend uses React Context API to manage authentication state.",
    apiIntegration:
      "The API follows RESTful principles with endpoints for products, users, orders, and payments. GraphQL is also available for more complex data queries.",
    deployment:
      "Frontend can be deployed to Vercel or Netlify. Backend should be deployed to a server with PHP and MySQL support, such as DigitalOcean or AWS.",
    troubleshooting:
      "Common issues include CORS errors, database connection problems, and authentication token expiration. Solutions for these issues are provided in this section.",
    customization:
      "The platform can be customized with themes, plugins, and extensions. The modular architecture allows for easy addition of new features.",
    faq: "Frequently asked questions about installation, configuration, and usage of the platform.",
    extensions:
      "Available extensions include payment gateways, shipping calculators, and analytics integrations.",
    image: "/placeholder.svg?height=300&width=600",
    demoLink: "https://example.com",
    price: 199.99,
    featured: true,
  },
];

export function ProjectsProvider({ children }) {
  const [projects, setProjects] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("projects");
      return saved ? JSON.parse(saved) : demoProjects;
    }
    return demoProjects;
  });

  const featuredProject = projects.find((p) => p.featured) || null;

  useEffect(() => {
    localStorage.setItem("projects", JSON.stringify(projects));
  }, [projects]);

  const addProject = (project) => {
    setProjects((prev) => [...prev, project]);
  };

  const updateProject = (project) => {
    setProjects((prev) => prev.map((p) => (p.id === project.id ? project : p)));
  };

  const deleteProject = (id) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
  };

  const toggleFeature = (id) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          return { ...p, featured: !p.featured };
        }
        if (
          p.id !== id &&
          !prev.find((project) => project.id === id)?.featured
        ) {
          return { ...p, featured: false };
        }
        return p;
      })
    );
  };

  return (
    <ProjectsContext.Provider
      value={{
        projects,
        featuredProject,
        addProject,
        updateProject,
        deleteProject,
        toggleFeature,
      }}
    >
      {children}
    </ProjectsContext.Provider>
  );
}

export function useProjects() {
  const context = useContext(ProjectsContext);
  if (context === undefined) {
    throw new Error("useProjects must be used within a ProjectsProvider");
  }
  return context;
}
