
import React from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

interface CTAButtonProps {
  text: string;
  onClick: () => void;
  color?: "blue" | "green" | "purple" | "pink" | "indigo";
  size?: "sm" | "md" | "lg";
  withArrow?: boolean;
  withAnimation?: boolean;
  className?: string;
}

const CTAButton = ({
  text,
  onClick,
  color = "blue",
  size = "md",
  withArrow = true,
  withAnimation = true,
  className = ""
}: CTAButtonProps) => {
  const getColorClasses = () => {
    switch (color) {
      case "green":
        return "bg-green-600 hover:bg-green-700 text-white";
      case "purple":
        return "bg-purple-600 hover:bg-purple-700 text-white";
      case "pink":
        return "bg-pink-600 hover:bg-pink-700 text-white";
      case "indigo":
        return "bg-indigo-600 hover:bg-indigo-700 text-white";
      default:
        return "bg-blue-600 hover:bg-blue-700 text-white";
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return "text-sm py-1 px-4";
      case "lg":
        return "text-lg py-3 px-8";
      default:
        return "text-base py-2 px-6";
    }
  };

  const Button = withAnimation ? motion.button : "button";
  
  const animationProps = withAnimation
    ? {
        whileHover: { scale: 1.03 },
        whileTap: { scale: 0.97 },
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { type: "spring", stiffness: 500, damping: 30 }
      }
    : {};

  return (
    <Button
      onClick={onClick}
      className={`rounded-full font-medium ${getColorClasses()} ${getSizeClasses()} ${className} flex items-center justify-center gap-2 transition-all duration-300 shadow-md hover:shadow-lg`}
      {...animationProps}
    >
      {text}
      {withArrow && <ArrowRight className="h-4 w-4" />}
    </Button>
  );
};

export default CTAButton;
