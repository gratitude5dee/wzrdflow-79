
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
    });
  }

  let shotId: string | null = null;
  try {
    const body = await req.json();
    shotId = body.shot_id;

    if (!shotId) {
      console.error("[generate-visual-prompt] Missing shot_id in request");
      return new Response(
        JSON.stringify({ success: false, error: "Missing shot ID" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[generate-visual-prompt][Shot ${shotId}] Request received.`);

    // Get shot information including the prompt idea, scene info, and project details
    console.log(`[generate-visual-prompt][Shot ${shotId}] Fetching shot, scene, and project data...`);
    const { data: shot, error: shotError } = await supabase
      .from("shots")
      .select(`
        id, 
        project_id,
        scene_id,
        shot_type,
        prompt_idea,
        scenes!inner(
          description,
          location,
          lighting,
          weather
        ),
        projects!inner(
          video_style,
          aspect_ratio
        )
      `)
      .eq("id", shotId)
      .single();

    if (shotError || !shot) {
      console.error(`[generate-visual-prompt][Shot ${shotId}] Error fetching shot: ${shotError?.message}`);
      return new Response(
        JSON.stringify({ success: false, error: shotError?.message || "Shot not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[generate-visual-prompt][Shot ${shotId}] Data fetched successfully.`);

    // Create a visual prompt based on the shot details and scene context
    const scene = shot.scenes;
    const project = shot.projects;
    
    // Log the data being used to create the prompt
    console.log(`[generate-visual-prompt][Shot ${shotId}] Prompt components:`, {
      shot_type: shot.shot_type,
      prompt_idea: shot.prompt_idea,
      scene_description: scene.description,
      scene_location: scene.location,
      scene_lighting: scene.lighting,
      scene_weather: scene.weather,
      video_style: project.video_style
    });
    
    // Start with shot type
    let shotTypeDesc = "";
    if (shot.shot_type) {
      if (shot.shot_type === "close_up" || shot.shot_type === "close-up" || shot.shot_type === "close") {
        shotTypeDesc = "close-up";
      } else if (shot.shot_type === "medium") {
        shotTypeDesc = "medium shot";
      } else if (shot.shot_type === "wide") {
        shotTypeDesc = "wide shot";
      } else if (shot.shot_type === "extreme_close_up" || shot.shot_type === "extreme-close-up") {
        shotTypeDesc = "extreme close-up";
      } else if (shot.shot_type === "establishing") {
        shotTypeDesc = "establishing shot";
      } else {
        shotTypeDesc = shot.shot_type;
      }
    } else {
      shotTypeDesc = "medium shot";
    }

    // Build the prompt components
    const promptParts = [];
    
    // Start with the shot type
    promptParts.push(shotTypeDesc);
    
    // Add prompt idea if available
    if (shot.prompt_idea && shot.prompt_idea.trim() !== "") {
      promptParts.push(shot.prompt_idea.trim());
    }
    
    // Add scene context
    if (scene.location && scene.location.trim() !== "") {
      promptParts.push(scene.location.trim());
    }
    
    if (scene.lighting && scene.lighting.trim() !== "") {
      promptParts.push(scene.lighting.trim());
    }
    
    if (scene.weather && scene.weather.trim() !== "") {
      promptParts.push(scene.weather.trim());
    }
    
    // Add video style from project
    if (project.video_style && project.video_style.trim() !== "") {
      promptParts.push(project.video_style.trim() + " style");
    }
    
    // Combine the prompt parts, making sure no part is too dominant
    let visualPrompt = promptParts.join(", ");
    
    // Add scene description at the end if available
    if (scene.description && scene.description.trim() !== "") {
      // Only take a portion of the description to keep the prompt concise
      const shortenedDesc = scene.description.trim().split('.')[0];
      visualPrompt += ". " + shortenedDesc;
    }

    console.log(`[generate-visual-prompt][Shot ${shotId}] Generated visual prompt: "${visualPrompt}"`);

    // Update the shot with the generated visual prompt
    console.log(`[generate-visual-prompt][Shot ${shotId}] Updating shot with visual prompt and status 'prompt_ready'...`);
    const { error: updateError } = await supabase
      .from("shots")
      .update({ 
        visual_prompt: visualPrompt,
        image_status: "prompt_ready",
        failure_reason: null // Clear any previous failure reason
      })
      .eq("id", shotId);

    if (updateError) {
      console.error(`[generate-visual-prompt][Shot ${shotId}] Error updating shot with visual prompt: ${updateError.message}`);
      return new Response(
        JSON.stringify({ success: false, error: updateError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[generate-visual-prompt][Shot ${shotId}] Visual prompt generation successfully completed.`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        visual_prompt: visualPrompt,
        shot_id: shotId
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error(`[generate-visual-prompt][Shot ${shotId || 'UNKNOWN'}] Unexpected error: ${error.message}`, error.stack);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
