import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';

interface LessonPlanData {
  title: string;
  learning_objectives: string[];
  timeline: Array<{
    stage: string;
    title: string;
    description: string;
  }>;
  quiz: Array<{
    question: string;
    options: string[];
    answer: string;
  }>;
  homework: {
    title: string;
    description: string;
    extension_task: string;
  };
}

interface LessonPlanDisplayProps {
  data: LessonPlanData;
}

export default function LessonPlanDisplay({ data }: LessonPlanDisplayProps) {
  const [showAnswers, setShowAnswers] = useState<{ [key: number]: boolean }>({});

  const toggleAnswer = (index: number) => {
    setShowAnswers(prev => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Title */}
      <div className="text-center border-b border-primary/30 pb-4">
        <h2 className="font-orbitron text-3xl font-bold glowing-text">{data.title}</h2>
      </div>

      {/* Learning Objectives */}
      <section className="animate-in fade-in duration-500 delay-150">
        <h3 className="font-orbitron text-2xl font-semibold text-primary mb-4 flex items-center">
          <span className="mr-3 text-2xl">🎯</span>
          Learning Objectives
        </h3>
        <div className="pl-4 border-l-2 border-primary/30">
          <ul className="space-y-2 text-muted-foreground">
            {data.learning_objectives.map((obj, i) => (
              <li key={i} className="flex items-start">
                <CheckCircle2 className="w-4 h-4 mr-2 mt-1 text-primary flex-shrink-0" />
                <span>{obj}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Timeline */}
      <section className="animate-in fade-in duration-500 delay-300">
        <h3 className="font-orbitron text-2xl font-semibold text-primary mb-4 flex items-center">
          <span className="mr-3 text-2xl">⏳</span>
          Lesson Timeline
        </h3>
        <div className="pl-4 border-l-2 border-primary/30">
          <div className="relative">
            {data.timeline.map((item, i) => (
              <div key={i} className="timeline-item">
                <p className="font-semibold font-orbitron text-primary">
                  {item.stage}: {item.title}
                </p>
                <p className="text-muted-foreground text-sm mt-1">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quiz */}
      <section className="animate-in fade-in duration-500 delay-450">
        <h3 className="font-orbitron text-2xl font-semibold text-primary mb-4 flex items-center">
          <span className="mr-3 text-2xl">❓</span>
          Assessment Quiz
        </h3>
        <div className="pl-4 border-l-2 border-primary/30">
          <div className="space-y-4">
            {data.quiz.map((q, index) => (
              <div key={index} className="glass-pane p-4 rounded-lg border border-primary/20">
                <p className="font-medium mb-3">
                  {index + 1}. {q.question}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
                  {q.options.map((opt, i) => (
                    <button
                      key={i}
                      className="text-left text-sm p-2 rounded-md hover:bg-primary/20 border border-transparent hover:border-primary transition"
                    >
                      {opt}
                    </button>
                  ))}
                </div>
                <div className="mt-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleAnswer(index)}
                    className="text-primary hover:bg-primary/20"
                  >
                    {showAnswers[index] ? 'Hide Answer' : 'Show Answer'}
                  </Button>
                  {showAnswers[index] && (
                    <p className="mt-2 p-2 bg-primary/10 text-primary rounded-md text-sm border border-primary/50">
                      Correct Answer: <strong>{q.answer}</strong>
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Homework */}
      <section className="animate-in fade-in duration-500 delay-600">
        <h3 className="font-orbitron text-2xl font-semibold text-primary mb-4 flex items-center">
          <span className="mr-3 text-2xl">📚</span>
          Homework Assignment
        </h3>
        <div className="pl-4 border-l-2 border-primary/30">
          <div className="glass-pane p-5 rounded-lg border border-primary/20">
            <h4 className="font-bold font-orbitron text-primary">{data.homework.title}</h4>
            <p className="mt-2 text-muted-foreground">{data.homework.description}</p>
            <div className="mt-4 pt-4 border-t border-primary/20">
              <h5 className="font-semibold text-primary text-sm">Extension Task</h5>
              <p className="mt-1 text-muted-foreground text-sm">{data.homework.extension_task}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}