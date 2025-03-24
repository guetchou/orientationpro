
import React from "react";
import { Link } from "react-router-dom";
import { Home, ArrowLeft } from "lucide-react";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";

interface TestBreadcrumbProps {
  testName: string;
  color?: string;
}

const TestBreadcrumb = ({ testName, color = "indigo" }: TestBreadcrumbProps) => {
  const colorClasses = {
    indigo: `text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300`,
    blue: `text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300`,
    pink: `text-pink-600 dark:text-pink-400 hover:text-pink-800 dark:hover:text-pink-300`,
    purple: `text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300`,
    green: `text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300`,
  };

  const linkColorClass = colorClasses[color as keyof typeof colorClasses] || colorClasses.indigo;

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link to="/" className={`flex items-center ${linkColorClass} transition-colors`}>
              <Home className="h-4 w-4 mr-2" />
              Accueil
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link to="/tests" className={`flex items-center ${linkColorClass} transition-colors`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Tests
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <span className="font-medium">{testName}</span>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export default TestBreadcrumb;
