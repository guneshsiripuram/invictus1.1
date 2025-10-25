import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { slides, topic } = await req.json();

    if (!slides || !Array.isArray(slides)) {
      return new Response(
        JSON.stringify({ error: "Slides array is required" }),
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

    // Generate images sequentially to avoid rate limiting
    const images = [];
    
    for (let index = 0; index < slides.length; index++) {
      const slide = slides[index];
      try {
        // Create a detailed prompt for image generation
        const imagePrompt = `Create a professional, educational illustration for a presentation slide about "${slide.title}". 
The image should be clean, modern, and suitable for classroom use. 
Context: ${slide.content.slice(0, 2).join(". ")}
Style: Professional educational graphic with clear visuals, high quality, suitable for teaching ${topic}.
16:9 aspect ratio.`;

        console.log(`Generating image for slide ${index + 1}:`, slide.title);

        const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash-image-preview",
            messages: [
              {
                role: "user",
                content: imagePrompt
              }
            ],
            modalities: ["image", "text"]
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Failed to generate image for slide ${index + 1}:`, response.status, errorText);
          images.push({ slideIndex: index, image: null, error: `HTTP ${response.status}` });
          continue;
        }

        const result = await response.json();
        const imageUrl = result.choices?.[0]?.message?.images?.[0]?.image_url?.url;

        if (imageUrl) {
          console.log(`Successfully generated image for slide ${index + 1}`);
          images.push({ slideIndex: index, image: imageUrl });
        } else {
          console.error(`No image URL in response for slide ${index + 1}`);
          images.push({ slideIndex: index, image: null });
        }
      } catch (error) {
        console.error(`Error generating image for slide ${index + 1}:`, error);
        images.push({ slideIndex: index, image: null, error: error instanceof Error ? error.message : "Unknown error" });
      }
      
      // Add delay between requests to avoid rate limiting
      if (index < slides.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return new Response(
      JSON.stringify({ images }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in generate-slide-images function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
