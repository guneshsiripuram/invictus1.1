import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { FileText, Loader2, Sparkles } from 'lucide-react';
import LessonPlanDisplay from '@/components/LessonPlanDisplay';
import Layout from '@/components/Layout';

export default function Generate() {
  const [topic, setTopic] = useState('');
  const [grade, setGrade] = useState('High School (Introductory)');
  const [subject, setSubject] = useState('');
  const [modalities, setModalities] = useState('Balanced (Visual, Auditory, Kinesthetic)');
  const [context, setContext] = useState('Standard/Global');
  const [loading, setLoading] = useState(false);
  const [lessonData, setLessonData] = useState<any>(null);
  const [copilotText, setCopilotText] = useState('');

  const suggestions = [
    'Photosynthesis',
    'The Roman Empire',
    'Introduction to Python',
    "Newton's Laws of Motion",
    'Literary Devices',
    'The Water Cycle',
  ];

  useEffect(() => {
    let suggestionIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    const typeText = () => {
      const currentSuggestion = suggestions[suggestionIndex];

      if (!isDeleting) {
        setCopilotText(currentSuggestion.substring(0, charIndex));
        charIndex++;

        if (charIndex > currentSuggestion.length) {
          isDeleting = true;
          setTimeout(typeText, 2000);
        } else {
          setTimeout(typeText, 50);
        }
      } else {
        setCopilotText(currentSuggestion.substring(0, charIndex));
        charIndex--;

        if (charIndex === 0) {
          isDeleting = false;
          suggestionIndex = (suggestionIndex + 1) % suggestions.length;
          setTimeout(typeText, 500);
        } else {
          setTimeout(typeText, 30);
        }
      }
    };

    const timer = setTimeout(typeText, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!topic || !subject) {
      toast.error('Please define a Lesson Topic and Field of Study');
      return;
    }

    setLoading(true);
    setLessonData(null);

    try {
      const { data: functionData, error: functionError } = await supabase.functions.invoke('generate-lesson', {
        body: { topic, grade, subject, modalities, context }
      });

      if (functionError) throw functionError;

      if (functionData) {
        setLessonData(functionData);
        toast.success('Lesson plan generated successfully!');
      } else {
        toast.error('No data received from generation');
      }
    } catch (error: any) {
      console.error('Generation error:', error);
      if (error.message?.includes('429')) {
        toast.error('Rate limit exceeded. Please try again in a moment.');
      } else if (error.message?.includes('402')) {
        toast.error('AI credits depleted. Please add credits to continue.');
      } else {
        toast.error('Failed to generate lesson plan. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto p-4 md:p-8 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Panel */}
          <div className="lg:col-span-1 glass-pane p-6 rounded-2xl h-fit">
            <h2 className="font-orbitron text-2xl font-semibold mb-6 border-b border-primary/30 pb-3 text-primary">
              1. Define Core Parameters
            </h2>
            <form onSubmit={handleGenerate} className="space-y-4">
              <div>
                <Label htmlFor="topic" className="text-muted-foreground">
                  Lesson Topic
                </Label>
                <Input
                  id="topic"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., Quantum Entanglement"
                  className="mt-1 bg-background/70 border-input focus:border-primary focus:ring-primary"
                />
                <p className="text-xs text-primary/70 h-4 mt-1">{copilotText}</p>
              </div>

              <div>
                <Label htmlFor="grade" className="text-muted-foreground">
                  Academic Level
                </Label>
                <Select value={grade} onValueChange={setGrade}>
                  <SelectTrigger className="mt-1 bg-background/70 border-input focus:border-primary focus:ring-primary">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass-pane border-primary/30">
                    <SelectItem value="High School (Introductory)">High School (Introductory)</SelectItem>
                    <SelectItem value="University (Undergraduate)">University (Undergraduate)</SelectItem>
                    <SelectItem value="Postgraduate (Specialized)">Postgraduate (Specialized)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="subject" className="text-muted-foreground">
                  Field of Study
                </Label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g., Physics"
                  className="mt-1 bg-background/70 border-input focus:border-primary focus:ring-primary"
                />
              </div>

              <h2 className="font-orbitron text-2xl font-semibold my-6 border-b border-primary/30 pb-3 text-primary">
                2. Advanced Customization
              </h2>

              <div>
                <Label htmlFor="modalities" className="text-muted-foreground">
                  Learning Modalities
                </Label>
                <Select value={modalities} onValueChange={setModalities}>
                  <SelectTrigger className="mt-1 bg-background/70 border-input focus:border-primary focus:ring-primary">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass-pane border-primary/30">
                    <SelectItem value="Balanced (Visual, Auditory, Kinesthetic)">
                      Balanced (Visual, Auditory, Kinesthetic)
                    </SelectItem>
                    <SelectItem value="Visual & Theoretical">Visual & Theoretical</SelectItem>
                    <SelectItem value="Interactive & Project-Based">Interactive & Project-Based</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="context" className="text-muted-foreground">
                  Global & Cultural Context
                </Label>
                <Select value={context} onValueChange={setContext}>
                  <SelectTrigger className="mt-1 bg-background/70 border-input focus:border-primary focus:ring-primary">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass-pane border-primary/30">
                    <SelectItem value="Standard/Global">Standard/Global</SelectItem>
                    <SelectItem value="Include Historical Context (Asian)">
                      Include Historical Context (Asian)
                    </SelectItem>
                    <SelectItem value="Include Historical Context (European)">
                      Include Historical Context (European)
                    </SelectItem>
                    <SelectItem value="Focus on Modern Applications">Focus on Modern Applications</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="mt-8">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-primary hover:opacity-90 shadow-lg shadow-primary/30 font-orbitron uppercase tracking-wide"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin mr-2" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <FileText className="mr-2" />
                      Architect Lesson
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>

          {/* Right Panel */}
          {lessonData ? (
            <div className="lg:col-span-2 glass-pane p-6 rounded-2xl">
              <LessonPlanDisplay data={lessonData} />
            </div>
          ) : (
            <div className="lg:col-span-2 glass-pane p-6 rounded-2xl flex flex-col items-center justify-center text-center min-h-[400px]">
              <Sparkles className="w-20 h-20 text-primary/50 mb-4" />
              <h3 className="font-orbitron text-2xl text-primary mb-2">Awaiting Generation Signal</h3>
              <p className="text-muted-foreground max-w-md">
                Define your lesson parameters and click "Architect Lesson" to generate the materials. The output
                will be visualized here.
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}