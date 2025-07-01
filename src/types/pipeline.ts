
export interface PipelineCandidate {
  id: string;
  name: string;
  email: string;
  position: string;
  rating?: number;
  daysInStage: number;
}

export interface PipelineStage {
  id: string;
  name: string;
  candidates: PipelineCandidate[];
  color: string;
}
