
import { FC } from "react";
import { Button } from "@/components/ui/button";
import { TestType } from "./testsData";

interface TestSelectorProps {
  tests: TestType[];
  activeTestIndex: number;
  setActiveTestIndex: (index: number) => void;
  onViewAllTests: () => void;
}

export const TestSelector: FC<TestSelectorProps> = ({ 
  tests, 
  activeTestIndex, 
  setActiveTestIndex,
  onViewAllTests
}) => {
  const nextTest = () => {
    const newIndex = (activeTestIndex + 1) % tests.length;
    setActiveTestIndex(newIndex);
  };

  const prevTest = () => {
    const newIndex = (activeTestIndex - 1 + tests.length) % tests.length;
    setActiveTestIndex(newIndex);
  };

  return (
    <>
      {/* Test Selector - Mobile */}
      <div className="md:hidden space-y-2 mb-6">
        <div className="flex items-center justify-between">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={prevTest}
            className="flex-shrink-0"
          >
            Précédent
          </Button>
          <span className="text-sm text-gray-500">
            Test {activeTestIndex + 1}/{tests.length}
          </span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={nextTest}
            className="flex-shrink-0"
          >
            Suivant
          </Button>
        </div>
      </div>

      {/* Test List for Desktop */}
      <div className="hidden md:block">
        <div className="space-y-3">
          {tests.map((test, index) => (
            <div 
              key={test.id}
              onClick={() => setActiveTestIndex(index)}
              className={`p-4 rounded-lg cursor-pointer transition-all duration-300 ${
                index === activeTestIndex 
                  ? 'bg-white shadow-md border-l-4 border-primary' 
                  : 'hover:bg-white/50 border-l-4 border-transparent'
              }`}
            >
              <div className="flex items-center">
                <div className={`p-2 rounded-full mr-3 ${
                  index === activeTestIndex ? 'bg-primary/10' : 'bg-gray-100'
                }`}>
                  {test.icon}
                </div>
                <div>
                  <h3 className={`font-medium ${
                    index === activeTestIndex ? 'text-primary' : 'text-gray-700'
                  }`}>
                    {test.title}
                  </h3>
                  <p className="text-sm text-gray-500">{test.duration}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6">
          <Button 
            variant="outline" 
            className="w-full"
            onClick={onViewAllTests}
          >
            Voir tous les tests
          </Button>
        </div>
      </div>
    </>
  );
};
