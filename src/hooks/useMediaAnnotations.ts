import { useState } from 'react';

export type Annotation = {
  time: number;
  text: string;
  id: string;
};

export const useMediaAnnotations = (initial: Annotation[] = []) => {
  const [annotations, setAnnotations] = useState<Annotation[]>(initial);
  
  const addAnnotation = (time: number, text: string) => {
    setAnnotations(prev => [
      ...prev,
      { time, text, id: crypto.randomUUID() },
    ]);
  };

  const editAnnotation = (id: string, text: string) => {
    setAnnotations(prev =>
      prev.map(ann => 
        ann.id === id ? { ...ann, text } : ann
      )
    );
  };

  return {
    annotations,
    addAnnotation,
    editAnnotation,
    removeAnnotation: (id: string) => 
      setAnnotations(prev => prev.filter(ann => ann.id !== id)),
  };
};
