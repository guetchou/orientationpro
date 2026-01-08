
export interface RiasecQuestionData {
  question: string;
  category: string;
}

export interface RiasecQuestionProps {
  question: RiasecQuestionData;
  onAnswer: (score: number) => void;
  loading: boolean;
}

export interface TestHeaderProps {
  currentQuestion: number;
  totalQuestions: number;
}

export interface QuestionDisplayProps {
  currentQuestion: number;
  question: RiasecQuestionData;
  onAnswer: (score: number) => void;
  loading: boolean;
}
