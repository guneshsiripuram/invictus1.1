import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Download } from 'lucide-react';
import pptxgen from 'pptxgenjs';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface LessonPlanData {
  title: string;
  learning_objectives: string[];
  timeline: Array<{
    stage: string;
    title: string;
    description: string;
  }>;
  visual_aids?: Array<{
    type: string;
    title: string;
    description: string;
    usage: string;
  }>;
  presentation_slides?: Array<{
    slide_number: number;
    title: string;
    content: string[];
    notes: string;
  }>;
  interactive_activities?: Array<{
    title: string;
    type: string;
    duration: string;
    instructions: string;
    learning_outcome: string;
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

  const downloadPowerPoint = async () => {
    try {
      toast.info("Generating presentation with AI images... This may take 1-2 minutes.");

      // Call edge function to generate images for slides
      let imageData: any = null;
      try {
        const response = await supabase.functions.invoke('generate-slide-images', {
          body: { 
            slides: data.presentation_slides,
            topic: data.title
          }
        });
        
        if (response.error) {
          console.error('Error generating images:', response.error);
          toast.warning('Some images could not be generated. Creating presentation with available content.');
        } else {
          imageData = response.data;
          console.log('Successfully generated images:', imageData);
        }
      } catch (error) {
        console.error('Failed to call image generation function:', error);
        toast.warning('Could not generate images. Creating presentation without images.');
      }

      const pptx = new pptxgen();
      
      // Set presentation properties
      pptx.author = 'INVICTUS Lesson Architect';
      pptx.title = data.title;
      pptx.subject = 'Lesson Plan Presentation';
      pptx.layout = 'LAYOUT_16x9';

      // Title Slide with gradient background
      const titleSlide = pptx.addSlide();
      titleSlide.background = { fill: '0F172A' };
      
      // Add decorative shapes
      titleSlide.addShape(pptx.ShapeType.rect, {
        x: 0,
        y: 0,
        w: '100%',
        h: '100%',
        fill: { type: 'solid', color: '1E293B', transparency: 50 }
      });

      titleSlide.addText(data.title, {
        x: 0.5,
        y: 2.5,
        w: 9,
        h: 1.5,
        fontSize: 44,
        bold: true,
        color: 'FFFFFF',
        align: 'center',
        shadow: {
          type: 'outer',
          blur: 8,
          offset: 4,
          angle: 45,
          color: '000000',
          opacity: 0.5
        }
      });

      titleSlide.addText('INVICTUS Lesson Architect', {
        x: 0.5,
        y: 4.5,
        w: 9,
        h: 0.5,
        fontSize: 18,
        color: '94A3B8',
        align: 'center',
        italic: true
      });

      // Add each presentation slide with images and professional design
      const images = imageData?.images || [];
      console.log(`Adding ${images.length} images to presentation. Images available:`, images.map((img: any) => ({ 
        slideIndex: img.slideIndex, 
        hasImage: !!img.image,
        imagePreview: img.image ? img.image.substring(0, 50) + '...' : null
      })));
      
      let imagesAdded = 0;
      
      data.presentation_slides?.forEach((slide, index) => {
        const newSlide = pptx.addSlide();
        
        // Modern gradient background
        newSlide.background = { fill: 'F8FAFC' };

        // Header bar
        newSlide.addShape(pptx.ShapeType.rect, {
          x: 0,
          y: 0,
          w: '100%',
          h: 1.2,
          fill: { type: 'solid', color: '1E293B' }
        });
        
        // Slide title on header
        newSlide.addText(slide.title, {
          x: 0.5,
          y: 0.3,
          w: 9,
          h: 0.7,
          fontSize: 28,
          bold: true,
          color: 'FFFFFF',
          valign: 'middle'
        });

        // Slide number badge
        newSlide.addShape(pptx.ShapeType.rect, {
          x: 9.2,
          y: 0.35,
          w: 0.6,
          h: 0.6,
          fill: { type: 'solid', color: '3B82F6' },
          line: { type: 'none' }
        });

        newSlide.addText(`${slide.slide_number}`, {
          x: 9.2,
          y: 0.35,
          w: 0.6,
          h: 0.6,
          fontSize: 16,
          bold: true,
          color: 'FFFFFF',
          align: 'center',
          valign: 'middle'
        });

        // Add AI-generated image if available
        const slideImage = images.find((img: any) => img.slideIndex === index);
        console.log(`Slide ${index + 1}: Looking for image. Found:`, slideImage ? 'Yes' : 'No');
        
        if (slideImage && slideImage.image) {
          try {
            console.log(`Adding image to slide ${index + 1}`);
            newSlide.addImage({
              data: slideImage.image,
              x: 0.5,
              y: 1.5,
              w: 4.5,
              h: 3,
              sizing: { type: 'contain', w: 4.5, h: 3 },
              rounding: true
            });
            imagesAdded++;
            console.log(`Successfully added image to slide ${index + 1}`);
          } catch (imgError) {
            console.error(`Error adding image to slide ${index + 1}:`, imgError);
          }
        } else {
          console.log(`No image available for slide ${index + 1}`);
        }

        // Content area with bullet points
        if (slide.content && slide.content.length > 0) {
          const bulletText = slide.content.map((item, idx) => ({ 
            text: `${idx + 1}. ${item}`,
            options: { 
              color: '1E293B',
              fontSize: 16,
              breakLine: true
            } 
          }));
          
          newSlide.addText(bulletText, {
            x: slideImage && slideImage.image ? 5.2 : 0.5,
            y: 1.5,
            w: slideImage && slideImage.image ? 4.3 : 9,
            h: 3.5,
            fontSize: 16,
            color: '334155',
            valign: 'top'
          });
        }

        // Footer with notes
        if (slide.notes) {
          newSlide.addShape(pptx.ShapeType.rect, {
            x: 0,
            y: 5.1,
            w: '100%',
            h: 0.5,
            fill: { type: 'solid', color: 'E2E8F0' }
          });

          newSlide.addText(`📝 ${slide.notes}`, {
            x: 0.5,
            y: 5.15,
            w: 9,
            h: 0.4,
            fontSize: 11,
            color: '64748B',
            italic: true,
            valign: 'middle'
          });
        }

        // Speaker notes
        if (slide.notes) {
          newSlide.addNotes(slide.notes);
        }
      });

      // Save the presentation
      await pptx.writeFile({ fileName: `${data.title.replace(/[^a-z0-9]/gi, '_')}.pptx` });
      
      const totalSlides = data.presentation_slides?.length || 0;
      toast.success(`PowerPoint downloaded! ${imagesAdded} of ${totalSlides} slides include AI-generated images.`);
    } catch (error) {
      console.error('Error generating PowerPoint:', error);
      toast.error('Failed to generate PowerPoint presentation');
    }
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

      {/* Visual Aids */}
      {data.visual_aids && data.visual_aids.length > 0 && (
        <section className="animate-in fade-in duration-500 delay-350">
          <h3 className="font-orbitron text-2xl font-semibold text-primary mb-4 flex items-center">
            <span className="mr-3 text-2xl">🎨</span>
            Visual Aids & Effects
          </h3>
          <div className="pl-4 border-l-2 border-primary/30">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.visual_aids.map((visual, i) => (
                <div key={i} className="glass-pane p-4 rounded-lg border border-primary/20">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs px-2 py-1 bg-primary/20 text-primary rounded-full font-semibold">
                      {visual.type}
                    </span>
                  </div>
                  <h4 className="font-bold text-primary mb-2">{visual.title}</h4>
                  <p className="text-sm text-muted-foreground mb-2">{visual.description}</p>
                  <p className="text-xs text-primary/70 italic">Usage: {visual.usage}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Presentation Slides */}
      {data.presentation_slides && data.presentation_slides.length > 0 && (
        <section className="animate-in fade-in duration-500 delay-400">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-orbitron text-2xl font-semibold text-primary flex items-center">
              <span className="mr-3 text-2xl">📊</span>
              PowerPoint Presentation
            </h3>
            <Button onClick={downloadPowerPoint} className="gap-2">
              <Download className="h-4 w-4" />
              Download PPT
            </Button>
          </div>
          <div className="pl-4 border-l-2 border-primary/30">
            <div className="space-y-3">
              {data.presentation_slides.map((slide, i) => (
                <div key={i} className="glass-pane p-4 rounded-lg border border-primary/20">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs px-2 py-1 bg-primary/20 text-primary rounded font-bold">
                      Slide {slide.slide_number}
                    </span>
                    <h4 className="font-bold text-primary">{slide.title}</h4>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-2">
                    {slide.content.map((point, j) => (
                      <li key={j}>{point}</li>
                    ))}
                  </ul>
                  {slide.notes && (
                    <p className="text-xs text-primary/70 italic mt-2 pt-2 border-t border-primary/10">
                      Notes: {slide.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Interactive Activities */}
      {data.interactive_activities && data.interactive_activities.length > 0 && (
        <section className="animate-in fade-in duration-500 delay-450">
          <h3 className="font-orbitron text-2xl font-semibold text-primary mb-4 flex items-center">
            <span className="mr-3 text-2xl">🎮</span>
            Interactive Learning Activities
          </h3>
          <div className="pl-4 border-l-2 border-primary/30">
            <div className="space-y-4">
              {data.interactive_activities.map((activity, i) => (
                <div key={i} className="glass-pane p-5 rounded-lg border border-primary/20">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold font-orbitron text-primary">{activity.title}</h4>
                    <div className="flex gap-2">
                      <span className="text-xs px-2 py-1 bg-primary/20 text-primary rounded-full">
                        {activity.type}
                      </span>
                      <span className="text-xs px-2 py-1 bg-primary/20 text-primary rounded-full">
                        ⏱️ {activity.duration}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs font-semibold text-primary mb-1">Instructions:</p>
                      <p className="text-sm text-muted-foreground">{activity.instructions}</p>
                    </div>
                    <div className="pt-2 border-t border-primary/10">
                      <p className="text-xs font-semibold text-primary mb-1">Learning Outcome:</p>
                      <p className="text-sm text-muted-foreground">{activity.learning_outcome}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Quiz */}
      <section className="animate-in fade-in duration-500 delay-500">
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
      <section className="animate-in fade-in duration-500 delay-550">
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