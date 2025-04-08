"use client";

// Mock data for the documentation platform

export const featuredProjects = [
  {
    _id: "1",
    title: "React Dashboard",
    slug: "react-dashboard",
    description:
      "A comprehensive React dashboard with multiple components, charts, and data visualization tools.",
    technologies: ["React", "Redux", "Chart.js", "Tailwind CSS"],
    thumbnail: "/placeholder.svg?height=300&width=500",
    updatedAt: new Date("2023-03-15").toISOString(),
    views: 1245,
  },
  {
    _id: "2",
    title: "E-commerce API",
    slug: "ecommerce-api",
    description:
      "RESTful API for e-commerce applications with product management, cart functionality, and order processing.",
    technologies: ["Node.js", "Express", "MongoDB", "JWT"],
    thumbnail: "/placeholder.svg?height=300&width=500",
    updatedAt: new Date("2023-04-20").toISOString(),
    views: 982,
  },
  {
    _id: "3",
    title: "Mobile App Template",
    slug: "mobile-app-template",
    description:
      "A starter template for React Native mobile applications with authentication, navigation, and state management.",
    technologies: ["React Native", "Expo", "Redux", "Firebase"],
    thumbnail: "/placeholder.svg?height=300&width=500",
    updatedAt: new Date("2023-05-10").toISOString(),
    views: 756,
  },
  {
    _id: "4",
    title: "Laravel CMS",
    slug: "laravel-cms",
    description:
      "A content management system built with Laravel featuring user roles, media management, and a powerful admin panel.",
    technologies: ["Laravel", "MySQL", "Alpine.js", "Tailwind CSS"],
    thumbnail: "/placeholder.svg?height=300&width=500",
    updatedAt: new Date("2023-06-05").toISOString(),
    views: 543,
  },
  {
    _id: "5",
    title: "Next.js Blog",
    slug: "nextjs-blog",
    description:
      "A blog platform built with Next.js featuring static site generation, dynamic routes, and markdown support.",
    technologies: ["Next.js", "React", "Markdown", "Vercel"],
    thumbnail: "/placeholder.svg?height=300&width=500",
    updatedAt: new Date("2023-07-12").toISOString(),
    views: 821,
  },
  {
    _id: "6",
    title: "Vue.js Portfolio",
    slug: "vuejs-portfolio",
    description:
      "A portfolio template built with Vue.js featuring smooth animations, project showcases, and contact forms.",
    technologies: ["Vue.js", "GSAP", "Tailwind CSS", "Firebase"],
    thumbnail: "/placeholder.svg?height=300&width=500",
    updatedAt: new Date("2023-08-18").toISOString(),
    views: 432,
  },
];

export const allProjects = [
  ...featuredProjects,
  {
    _id: "7",
    title: "Django REST API",
    slug: "django-rest-api",
    description:
      "A RESTful API built with Django REST Framework for web and mobile applications.",
    technologies: ["Django", "Python", "PostgreSQL", "Docker"],
    thumbnail: "/placeholder.svg?height=300&width=500",
    updatedAt: new Date("2023-09-05").toISOString(),
    views: 321,
  },
  {
    _id: "8",
    title: "Flutter UI Kit",
    slug: "flutter-ui-kit",
    description:
      "A collection of UI components and screens for Flutter applications with dark mode support.",
    technologies: ["Flutter", "Dart", "Firebase", "Provider"],
    thumbnail: "/placeholder.svg?height=300&width=500",
    updatedAt: new Date("2023-10-10").toISOString(),
    views: 654,
  },
  {
    _id: "9",
    title: "MERN Stack Boilerplate",
    slug: "mern-stack-boilerplate",
    description:
      "A boilerplate for MERN stack applications with authentication, authorization, and CRUD operations.",
    technologies: ["MongoDB", "Express", "React", "Node.js"],
    thumbnail: "/placeholder.svg?height=300&width=500",
    updatedAt: new Date("2023-11-15").toISOString(),
    views: 789,
  },
];

export const projectDetails = {
  "react-dashboard": {
    _id: "1",
    title: "React Dashboard",
    slug: "react-dashboard",
    description:
      "A comprehensive React dashboard with multiple components, charts, and data visualization tools.",
    version: "2.1.0",
    author: "John Doe",
    status: "published",
    technologies: [
      "React",
      "Redux",
      "Chart.js",
      "Tailwind CSS",
      "Vite",
      "TypeScript",
    ],
    thumbnail: "/placeholder.svg?height=400&width=1200",
    featured: true,
    views: 1245,
    updatedAt: new Date("2023-03-15").toISOString(),
    sections: [
      {
        id: "introduction",
        title: "Introduction",
        content: [
          {
            type: "paragraph",
            text: "React Dashboard is a modern, responsive admin dashboard template built with React. It includes a variety of components, charts, and data visualization tools to help you build your next admin panel, CRM, or analytics dashboard.",
          },
          {
            type: "paragraph",
            text: "This documentation will guide you through the installation process, explain the project structure, and show you how to use the various components and features.",
          },
        ],
      },
      {
        id: "getting-started",
        title: "Getting Started",
        content: [
          {
            type: "paragraph",
            text: "To get started with React Dashboard, you need to have Node.js and npm installed on your machine.",
          },
          {
            type: "heading",
            level: 3,
            id: "installation",
            text: "Installation",
          },
          {
            type: "paragraph",
            text: "You can install React Dashboard using npm or yarn:",
          },
          {
            type: "code",
            language: "bash",
            filename: "terminal",
            code: "# Using npm\nnpm install react-dashboard\n\n# Using yarn\nyarn add react-dashboard",
          },
          {
            type: "heading",
            level: 3,
            id: "basic-usage",
            text: "Basic Usage",
          },
          {
            type: "paragraph",
            text: "After installation, you can import and use the dashboard components in your React application:",
          },
          {
            type: "code",
            language: "jsx",
            filename: "App.jsx",
            code: "import React from 'react';\nimport { Dashboard, Sidebar, Header } from 'react-dashboard';\n\nfunction App() {\n  return (\n    <Dashboard>\n      <Sidebar />\n      <Header title=\"My Dashboard\" />\n      <main>\n        {/* Your dashboard content */}\n      </main>\n    </Dashboard>\n  );\n}\n\nexport default App;",
          },
        ],
      },
      {
        id: "project-structure",
        title: "Project Structure",
        content: [
          {
            type: "paragraph",
            text: "React Dashboard follows a modular structure to keep the codebase organized and maintainable.",
          },
          {
            type: "list",
            style: "ordered",
            items: [
              "src/components: Contains all the reusable UI components",
              "src/layouts: Contains layout components like Dashboard, Sidebar, and Header",
              "src/pages: Contains page components for different dashboard sections",
              "src/hooks: Contains custom React hooks",
              "src/utils: Contains utility functions",
              "src/context: Contains React context providers",
              "src/api: Contains API service functions",
            ],
          },
          {
            type: "image",
            src: "/placeholder.svg?height=300&width=600",
            alt: "Project Structure Diagram",
            caption: "React Dashboard Project Structure",
          },
        ],
      },
      {
        id: "components",
        title: "Components",
        content: [
          {
            type: "paragraph",
            text: "React Dashboard includes a variety of components that you can use to build your dashboard.",
          },
          {
            type: "heading",
            level: 3,
            id: "charts",
            text: "Charts",
          },
          {
            type: "paragraph",
            text: "React Dashboard includes several chart components built with Chart.js:",
          },
          {
            type: "list",
            style: "unordered",
            items: [
              "LineChart: For displaying trends over time",
              "BarChart: For comparing values across categories",
              "PieChart: For showing proportions of a whole",
              "DoughnutChart: A variant of the pie chart with a hole in the center",
              "RadarChart: For comparing multiple variables",
            ],
          },
          {
            type: "code",
            language: "jsx",
            filename: "ChartExample.jsx",
            code: "import React from 'react';\nimport { LineChart } from 'react-dashboard';\n\nfunction ChartExample() {\n  const data = {\n    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],\n    datasets: [\n      {\n        label: 'Sales',\n        data: [12, 19, 3, 5, 2, 3],\n        borderColor: 'rgb(75, 192, 192)',\n        tension: 0.1\n      }\n    ]\n  };\n\n  return <LineChart data={data} />;\n}\n\nexport default ChartExample;",
          },
          {
            type: "note",
            variant: "info",
            title: "Chart Customization",
            text: "All chart components accept a options prop that allows you to customize the appearance and behavior of the chart. See the Chart.js documentation for more information.",
          },
        ],
      },
      {
        id: "customization",
        title: "Customization",
        content: [
          {
            type: "paragraph",
            text: "React Dashboard is highly customizable to fit your needs and brand identity.",
          },
          {
            type: "heading",
            level: 3,
            id: "theming",
            text: "Theming",
          },
          {
            type: "paragraph",
            text: "You can customize the theme by modifying the theme.js file:",
          },
          {
            type: "code",
            language: "javascript",
            filename: "theme.js",
            code: "export const theme = {\n  colors: {\n    primary: '#3b82f6',\n    secondary: '#10b981',\n    background: '#ffffff',\n    text: '#1f2937',\n    // Add more colors as needed\n  },\n  fonts: {\n    body: 'Inter, sans-serif',\n    heading: 'Inter, sans-serif',\n  },\n  // Add more theme properties as needed\n};",
          },
          {
            type: "heading",
            level: 3,
            id: "layout",
            text: "Layout Customization",
          },
          {
            type: "paragraph",
            text: "You can customize the layout by modifying the Dashboard component props:",
          },
          {
            type: "code",
            language: "jsx",
            filename: "CustomLayout.jsx",
            code: 'import React from \'react\';\nimport { Dashboard, Sidebar, Header } from \'react-dashboard\';\n\nfunction CustomLayout() {\n  return (\n    <Dashboard\n      sidebarWidth="300px"\n      headerHeight="80px"\n      sidebarPosition="right"\n      theme="dark"\n    >\n      <Sidebar />\n      <Header title="Custom Dashboard" />\n      <main>\n        {/* Your dashboard content */}\n      </main>\n    </Dashboard>\n  );\n}\n\nexport default CustomLayout;',
          },
          {
            type: "note",
            variant: "warning",
            title: "Browser Compatibility",
            text: "The dashboard is optimized for modern browsers. Some features may not work correctly in older browsers like Internet Explorer.",
          },
        ],
      },
      {
        id: "api-integration",
        title: "API Integration",
        content: [
          {
            type: "paragraph",
            text: "React Dashboard includes utilities for integrating with APIs to fetch and display data.",
          },
          {
            type: "heading",
            level: 3,
            id: "data-fetching",
            text: "Data Fetching",
          },
          {
            type: "paragraph",
            text: "You can use the provided API service functions to fetch data from your backend:",
          },
          {
            type: "code",
            language: "jsx",
            filename: "DataFetchingExample.jsx",
            code: "import React, { useEffect, useState } from 'react';\nimport { fetchData } from 'react-dashboard/api';\nimport { DataTable } from 'react-dashboard';\n\nfunction DataFetchingExample() {\n  const [data, setData] = useState([]);\n  const [loading, setLoading] = useState(true);\n  const [error, setError] = useState(null);\n\n  useEffect(() => {\n    const getData = async () => {\n      try {\n        const result = await fetchData('/api/users');\n        setData(result);\n      } catch (err) {\n        setError(err.message);\n      } finally {\n        setLoading(false);\n      }\n    };\n\n    getData();\n  }, []);\n\n  if (loading) return <div>Loading...</div>;\n  if (error) return <div>Error: {error}</div>;\n\n  return <DataTable data={data} />;\n}\n\nexport default DataFetchingExample;",
          },
          {
            type: "heading",
            level: 3,
            id: "real-time-updates",
            text: "Real-time Updates",
          },
          {
            type: "paragraph",
            text: "For real-time updates, you can use the WebSocket integration:",
          },
          {
            type: "code",
            language: "jsx",
            filename: "RealTimeExample.jsx",
            code: "import React, { useEffect, useState } from 'react';\nimport { useWebSocket } from 'react-dashboard/hooks';\nimport { LineChart } from 'react-dashboard';\n\nfunction RealTimeExample() {\n  const [data, setData] = useState({\n    labels: [],\n    datasets: [{\n      label: 'Real-time Data',\n      data: [],\n      borderColor: 'rgb(75, 192, 192)',\n      tension: 0.1\n    }]\n  });\n\n  const { lastMessage } = useWebSocket('wss://api.example.com/ws');\n\n  useEffect(() => {\n    if (lastMessage) {\n      const newData = JSON.parse(lastMessage.data);\n      setData(prevData => ({\n        labels: [...prevData.labels, newData.timestamp],\n        datasets: [{\n          ...prevData.datasets[0],\n          data: [...prevData.datasets[0].data, newData.value]\n        }]\n      }));\n    }\n  }, [lastMessage]);\n\n  return <LineChart data={data} />;\n}\n\nexport default RealTimeExample;",
          },
        ],
      },
      {
        id: "deployment",
        title: "Deployment",
        content: [
          {
            type: "paragraph",
            text: "When you're ready to deploy your React Dashboard application, you have several options.",
          },
          {
            type: "heading",
            level: 3,
            id: "build-for-production",
            text: "Build for Production",
          },
          {
            type: "paragraph",
            text: "First, you need to build your application for production:",
          },
          {
            type: "code",
            language: "bash",
            filename: "terminal",
            code: "# Using npm\nnpm run build\n\n# Using yarn\nyarn build",
          },
          {
            type: "paragraph",
            text: "This will create a build directory with optimized production files.",
          },
          {
            type: "heading",
            level: 3,
            id: "deployment-options",
            text: "Deployment Options",
          },
          {
            type: "list",
            style: "unordered",
            items: [
              "Vercel: Recommended for Next.js applications",
              "Netlify: Great for static sites and serverless functions",
              "AWS Amplify: Integrated with AWS services",
              "GitHub Pages: Free for open-source projects",
              "Firebase Hosting: Easy integration with Firebase services",
            ],
          },
          {
            type: "note",
            variant: "info",
            title: "Environment Variables",
            text: "Remember to set up your environment variables on your deployment platform. These are usually configured in the platform's dashboard.",
          },
        ],
      },
    ],
  },
  "ecommerce-api": {
    _id: "2",
    title: "E-commerce API",
    slug: "ecommerce-api",
    description:
      "RESTful API for e-commerce applications with product management, cart functionality, and order processing.",
    version: "1.5.0",
    author: "Jane Smith",
    status: "published",
    technologies: ["Node.js", "Express", "MongoDB", "JWT", "Swagger", "Docker"],
    thumbnail: "/placeholder.svg?height=400&width=1200",
    featured: true,
    views: 982,
    updatedAt: new Date("2023-04-20").toISOString(),
    sections: [
      {
        id: "introduction",
        title: "Introduction",
        content: [
          {
            type: "paragraph",
            text: "The E-commerce API is a comprehensive RESTful API built with Node.js and Express for e-commerce applications. It provides endpoints for product management, user authentication, cart functionality, and order processing.",
          },
          {
            type: "paragraph",
            text: "This documentation will guide you through the installation process, explain the API endpoints, and show you how to use the API in your applications.",
          },
        ],
      },
      {
        id: "getting-started",
        title: "Getting Started",
        content: [
          {
            type: "paragraph",
            text: "To get started with the E-commerce API, you need to have Node.js, npm, and MongoDB installed on your machine.",
          },
          {
            type: "heading",
            level: 3,
            id: "installation",
            text: "Installation",
          },
          {
            type: "paragraph",
            text: "Clone the repository and install dependencies:",
          },
          {
            type: "code",
            language: "bash",
            filename: "terminal",
            code: "git clone https://github.com/example/ecommerce-api.git\ncd ecommerce-api\nnpm install",
          },
          {
            type: "heading",
            level: 3,
            id: "configuration",
            text: "Configuration",
          },
          {
            type: "paragraph",
            text: "Create a .env file in the root directory with the following variables:",
          },
          {
            type: "code",
            language: "plaintext",
            filename: ".env",
            code: "PORT=5000\nMONGODB_URI=mongodb://localhost:27017/ecommerce\nJWT_SECRET=your_jwt_secret\nJWT_EXPIRES_IN=7d\nNODE_ENV=development",
          },
        ],
      },
      {
        id: "api-endpoints",
        title: "API Endpoints",
        content: [
          {
            type: "paragraph",
            text: "The E-commerce API provides the following endpoints:",
          },
          {
            type: "heading",
            level: 3,
            id: "authentication",
            text: "Authentication",
          },
          {
            type: "list",
            style: "unordered",
            items: [
              "POST /api/auth/register - Register a new user",
              "POST /api/auth/login - Login a user",
              "GET /api/auth/me - Get current user",
              "POST /api/auth/logout - Logout a user",
            ],
          },
          {
            type: "heading",
            level: 3,
            id: "products",
            text: "Products",
          },
          {
            type: "list",
            style: "unordered",
            items: [
              "GET /api/products - Get all products",
              "GET /api/products/:id - Get a single product",
              "POST /api/products - Create a new product (admin only)",
              "PUT /api/products/:id - Update a product (admin only)",
              "DELETE /api/products/:id - Delete a product (admin only)",
            ],
          },
          {
            type: "heading",
            level: 3,
            id: "cart",
            text: "Cart",
          },
          {
            type: "list",
            style: "unordered",
            items: [
              "GET /api/cart - Get user cart",
              "POST /api/cart - Add item to cart",
              "PUT /api/cart/:itemId - Update cart item",
              "DELETE /api/cart/:itemId - Remove item from cart",
            ],
          },
          {
            type: "heading",
            level: 3,
            id: "orders",
            text: "Orders",
          },
          {
            type: "list",
            style: "unordered",
            items: [
              "GET /api/orders - Get user orders",
              "GET /api/orders/:id - Get a single order",
              "POST /api/orders - Create a new order",
              "PUT /api/orders/:id/status - Update order status (admin only)",
            ],
          },
        ],
      },
      {
        id: "authentication",
        title: "Authentication",
        content: [
          {
            type: "paragraph",
            text: "The E-commerce API uses JWT (JSON Web Tokens) for authentication.",
          },
          {
            type: "heading",
            level: 3,
            id: "register",
            text: "Register a New User",
          },
          {
            type: "code",
            language: "javascript",
            filename: "register-example.js",
            code: "const response = await fetch('https://api.example.com/api/auth/register', {\n  method: 'POST',\n  headers: {\n    'Content-Type': 'application/json'\n  },\n  body: JSON.stringify({\n    name: 'John Doe',\n    email: 'john@example.com',\n    password: 'password123'\n  })\n});\n\nconst data = await response.json();",
          },
          {
            type: "heading",
            level: 3,
            id: "login",
            text: "Login a User",
          },
          {
            type: "code",
            language: "javascript",
            filename: "login-example.js",
            code: "const response = await fetch('https://api.example.com/api/auth/login', {\n  method: 'POST',\n  headers: {\n    'Content-Type': 'application/json'\n  },\n  body: JSON.stringify({\n    email: 'john@example.com',\n    password: 'password123'\n  })\n});\n\nconst data = await response.json();\nconst token = data.token;\n\n// Store the token in localStorage or a secure cookie\nlocalStorage.setItem('token', token);",
          },
          {
            type: "heading",
            level: 3,
            id: "authenticated-requests",
            text: "Making Authenticated Requests",
          },
          {
            type: "code",
            language: "javascript",
            filename: "authenticated-request-example.js",
            code: "const token = localStorage.getItem('token');\n\nconst response = await fetch('https://api.example.com/api/products', {\n  method: 'GET',\n  headers: {\n    'Authorization': `Bearer ${token}`\n  }\n});\n\nconst data = await response.json();",
          },
        ],
      },
      {
        id: "error-handling",
        title: "Error Handling",
        content: [
          {
            type: "paragraph",
            text: "The E-commerce API returns standardized error responses.",
          },
          {
            type: "heading",
            level: 3,
            id: "error-structure",
            text: "Error Response Structure",
          },
          {
            type: "code",
            language: "json",
            filename: "error-response.json",
            code: '{\n  "success": false,\n  "error": {\n    "statusCode": 400,\n    "message": "Invalid credentials"\n  }\n}',
          },
          {
            type: "heading",
            level: 3,
            id: "common-errors",
            text: "Common Error Codes",
          },
          {
            type: "list",
            style: "unordered",
            items: [
              "400 - Bad Request: The request was malformed or contains invalid data",
              "401 - Unauthorized: Authentication is required or has failed",
              "403 - Forbidden: The authenticated user does not have permission to access the resource",
              "404 - Not Found: The requested resource was not found",
              "500 - Internal Server Error: An unexpected error occurred on the server",
            ],
          },
          {
            type: "note",
            variant: "warning",
            title: "Validation Errors",
            text: "For validation errors, the API returns a 400 status code with a message and a details array containing the specific validation errors.",
          },
        ],
      },
      {
        id: "deployment",
        title: "Deployment",
        content: [
          {
            type: "paragraph",
            text: "The E-commerce API can be deployed to various platforms.",
          },
          {
            type: "heading",
            level: 3,
            id: "docker",
            text: "Docker Deployment",
          },
          {
            type: "paragraph",
            text: "The API includes a Dockerfile for containerization:",
          },
          {
            type: "code",
            language: "bash",
            filename: "terminal",
            code: "# Build the Docker image\ndocker build -t ecommerce-api .\n\n# Run the container\ndocker run -p 5000:5000 -e MONGODB_URI=mongodb://mongo:27017/ecommerce -e JWT_SECRET=your_jwt_secret ecommerce-api",
          },
          {
            type: "heading",
            level: 3,
            id: "heroku",
            text: "Heroku Deployment",
          },
          {
            type: "code",
            language: "bash",
            filename: "terminal",
            code: "# Login to Heroku\nheroku login\n\n# Create a new Heroku app\nheroku create\n\n# Set environment variables\nheroku config:set MONGODB_URI=your_mongodb_uri\nheroku config:set JWT_SECRET=your_jwt_secret\n\n# Push to Heroku\ngit push heroku main",
          },
        ],
      },
    ],
  },
};

export const dashboardStats = {
  totalProjects: 9,
  publishedProjects: 7,
  draftProjects: 2,
  totalViews: 5982,
};

export const recentActivity = [
  {
    id: "1",
    type: "update",
    message: "Updated project: React Dashboard",
    timestamp: "2 hours ago",
    user: "Admin User",
    project: {
      title: "React Dashboard",
      slug: "react-dashboard",
    },
  },
  {
    id: "2",
    type: "create",
    message: "Created project: Vue.js Portfolio",
    timestamp: "1 day ago",
    user: "Admin User",
    project: {
      title: "Vue.js Portfolio",
      slug: "vuejs-portfolio",
    },
  },
  {
    id: "3",
    type: "update",
    message: "Updated project: E-commerce API",
    timestamp: "2 days ago",
    user: "Admin User",
    project: {
      title: "E-commerce API",
      slug: "ecommerce-api",
    },
  },
  {
    id: "4",
    type: "delete",
    message: "Deleted project: WordPress Theme",
    timestamp: "3 days ago",
    user: "Admin User",
    project: null,
  },
  {
    id: "5",
    type: "create",
    message: "Created project: Mobile App Template",
    timestamp: "5 days ago",
    user: "Admin User",
    project: {
      title: "Mobile App Template",
      slug: "mobile-app-template",
    },
  },
];

// Mock user for authentication
export const mockUser = {
  id: "1",
  name: "Admin User",
  email: "admin@example.com",
  role: "admin",
};

// Mock authentication functions
export const mockAuth = {
  login: async (email, password) => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (email === "admin@example.com" && password === "admin123") {
      localStorage.setItem("user", JSON.stringify(mockUser));
      return { success: true, user: mockUser };
    }

    throw new Error("Invalid credentials");
  },

  logout: async () => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    localStorage.removeItem("user");
    return { success: true };
  },

  check: async () => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    const user = localStorage.getItem("user");
    if (user) {
      return { success: true, user: JSON.parse(user) };
    }

    throw new Error("Not authenticated");
  },
};
