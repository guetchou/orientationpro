
import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface FAQItem {
  question: string;
  answer: string;
}

interface TestFAQProps {
  testType: string;
  faqs: FAQItem[];
}

const TestFAQ = ({ testType, faqs }: TestFAQProps) => {
  return (
    <div className="my-8">
      <h3 className="text-xl font-semibold mb-4">Questions fréquentes sur le test {testType}</h3>
      <Accordion type="single" collapsible className="space-y-2">
        {faqs.map((faq, index) => (
          <AccordionItem 
            key={index} 
            value={`item-${index}`}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
          >
            <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-gray-50 dark:hover:bg-gray-700/50 text-left">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent className="px-4 py-3 text-gray-700 dark:text-gray-300">
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

export default TestFAQ;
