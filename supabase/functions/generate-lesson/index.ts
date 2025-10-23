import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { topic, grade, subject, modalities, context, pdfContent } = await req.json();

    if (!topic || !subject) {
      return new Response(
        JSON.stringify({ error: "Topic and subject are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY not found");
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const systemPrompt = `You are an advanced educational AI that creates comprehensive, engaging lesson plans. 
Generate detailed and dynamic lesson plans that follow best practices in pedagogy.
Always structure the response as valid JSON matching the exact schema provided.`;

    const pdfSection = pdfContent ? `\n\nLECTURE PDF CONTENT:\n${pdfContent}\n\nIMPORTANT: Incorporate the content, structure, and key concepts from this lecture PDF into the lesson plan. Use the PDF as the primary source material.` : '';

    const userPrompt = `Generate an advanced, dynamic, and engaging lesson plan on "${topic}" for ${grade} level in ${subject}.
    
Learning modalities: ${modalities}
Context: ${context}${pdfSection}

Create a comprehensive lesson plan with:
1. A clear, engaging title
2. 4 learning objectives (phrased as "Students will be able to...")
3. A detailed timeline with 5 stages: Introduction, Core Concept 1, Core Concept 2, Activity, Conclusion
4. Visual aids: 5 specific visual elements (diagrams, charts, images, infographics) with detailed descriptions
5. PPT presentation slides: 8-10 slide outlines with titles and key bullet points for each slide
6. Interactive activities: 4 hands-on or digital interactive learning activities with step-by-step instructions
7. A 4-question multiple-choice quiz with 4 options each and correct answers
8. A creative homework assignment with an extension task for advanced students

Return ONLY valid JSON in this exact structure:
{
  "title": "string",
  "learning_objectives": ["string", "string", "string", "string"],
  "timeline": [
    {"stage": "string", "title": "string", "description": "string"}
  ],
  "visual_aids": [
    {"type": "string (e.g., diagram, chart, image)", "title": "string", "description": "string", "usage": "string"}
  ],
  "presentation_slides": [
    {"slide_number": number, "title": "string", "content": ["bullet point 1", "bullet point 2"], "notes": "string"}
  ],
  "interactive_activities": [
    {"title": "string", "type": "string (e.g., group work, simulation, game)", "duration": "string", "instructions": "string", "learning_outcome": "string"}
  ],
  "quiz": [
    {"question": "string", "options": ["string", "string", "string", "string"], "answer": "string"}
  ],
  "homework": {
    "title": "string",
    "description": "string",
    "extension_task": "string"
  }
}`;

    console.log("Calling Lovable AI...");
    
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits depleted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ error: "Failed to generate lesson plan" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const result = await response.json();
    const aiContent = result.choices?.[0]?.message?.content;
    
    if (!aiContent) {
      console.error("No content in AI response");
      return new Response(
        JSON.stringify({ error: "Invalid response from AI" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse the JSON response
    let lessonData;
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = aiContent.match(/```json\s*([\s\S]*?)\s*```/) || aiContent.match(/```\s*([\s\S]*?)\s*```/);
      const jsonString = jsonMatch ? jsonMatch[1] : aiContent;
      lessonData = JSON.parse(jsonString);
    } catch (parseError) {
      console.error("Failed to parse AI response as JSON:", parseError);
      return new Response(
        JSON.stringify({ error: "Failed to parse lesson plan data" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Save to database if user is authenticated
    const authHeader = req.headers.get("authorization");
    if (authHeader) {
      try {
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        const token = authHeader.replace("Bearer ", "");
        const { data: { user }, error: userError } = await supabase.auth.getUser(token);

        if (user && !userError) {
          const { error: insertError } = await supabase
            .from("lesson_plans")
            .insert({
              user_id: user.id,
              title: lessonData.title,
              learning_objectives: lessonData.learning_objectives,
              timeline: lessonData.timeline,
              visual_aids: lessonData.visual_aids,
              presentation_slides: lessonData.presentation_slides,
              interactive_activities: lessonData.interactive_activities,
              quiz: lessonData.quiz,
              homework: lessonData.homework,
              metadata: { topic, grade, subject, modalities, context }
            });

          if (insertError) {
            console.error("Failed to save lesson plan:", insertError);
          } else {
            console.log("Lesson plan saved successfully");
          }
        }
      } catch (dbError) {
        console.error("Database error:", dbError);
      }
    }

    return new Response(
      JSON.stringify(lessonData),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in generate-lesson function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});