import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import LessonPlanDisplay from '@/components/LessonPlanDisplay';

interface LessonPlan {
  id: string;
  title: string;
  learning_objectives: string[];
  timeline: any;
  quiz: any;
  homework: any;
  metadata: any;
  created_at: string;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [lessonPlans, setLessonPlans] = useState<LessonPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLesson, setSelectedLesson] = useState<LessonPlan | null>(null);

  useEffect(() => {
    if (user) {
      loadLessonPlans();
    }
  }, [user]);

  const loadLessonPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('lesson_plans')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setLessonPlans(data || []);
    } catch (error: any) {
      console.error('Error loading lesson plans:', error);
      toast.error('Failed to load lesson plans');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto p-4 md:p-8 max-w-6xl">
          <div className="flex items-center justify-center min-h-[400px]">
            <p className="text-muted-foreground">Loading your lesson plans...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto p-4 md:p-8 max-w-6xl">
        <div className="mb-8">
          <h2 className="font-orbitron text-3xl font-bold glowing-text mb-4">Generation Dashboard</h2>
          <p className="text-muted-foreground">Manage and revisit all your generated educational content</p>
        </div>

        {lessonPlans.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lessonPlans.map((lesson) => (
              <Card
                key={lesson.id}
                className="glass-pane border-primary/20 hover:border-primary/50 transition-all cursor-pointer"
              >
                <CardHeader>
                  <div className="mb-2">
                    <Badge className="bg-primary/20 text-primary hover:bg-primary/30">Lesson Plan</Badge>
                  </div>
                  <CardTitle className="text-lg font-bold text-foreground line-clamp-2">{lesson.title}</CardTitle>
                  <CardDescription className="flex items-center text-xs text-muted-foreground mt-2">
                    <Calendar className="w-3 h-3 mr-1" />
                    Generated on {formatDate(lesson.created_at)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={() => setSelectedLesson(lesson)}
                    className="w-full bg-secondary hover:bg-secondary/80 text-secondary-foreground font-semibold"
                  >
                    <BookOpen className="w-4 h-4 mr-2" />
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 glass-pane rounded-2xl">
            <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold text-muted-foreground mb-2">Dashboard is Empty</h3>
            <p className="text-muted-foreground">Generate a lesson plan to see it appear here.</p>
          </div>
        )}
      </div>

      <Dialog open={!!selectedLesson} onOpenChange={() => setSelectedLesson(null)}>
        <DialogContent className="glass-pane max-w-4xl max-h-[90vh] overflow-y-auto border-primary/30">
          <DialogHeader>
            <DialogTitle className="font-orbitron text-2xl">Lesson Plan Details</DialogTitle>
          </DialogHeader>
          {selectedLesson && (
            <LessonPlanDisplay
              data={{
                title: selectedLesson.title,
                learning_objectives: selectedLesson.learning_objectives,
                timeline: selectedLesson.timeline,
                quiz: selectedLesson.quiz,
                homework: selectedLesson.homework,
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
}