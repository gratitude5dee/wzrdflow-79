
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

  try {
    // Parse the webhook payload
    const payload = await req.json();
    console.log("Received Luma webhook:", JSON.stringify(payload));

    // Validate the webhook payload
    if (!payload.id || !payload.status) {
      console.error("Invalid webhook payload:", payload);
      return new Response(
        JSON.stringify({ success: false, error: "Invalid webhook payload" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Find the generation record for this Luma job
    const { data: generation, error: genError } = await supabase
      .from("generations")
      .select("id, user_id, project_id, shot_id, api_provider")
      .eq("external_request_id", payload.id)
      .single();

    if (genError || !generation) {
      console.error(`No generation found for Luma job ID: ${payload.id}`);
      return new Response(
        JSON.stringify({ success: false, error: "Generation not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Processing webhook for generation ${generation.id}, shot ${generation.shot_id}`);

    // Map Luma status to our status
    let status = "pending";
    if (payload.status === "completed") {
      status = "completed";
    } else if (payload.status === "failed") {
      status = "failed";
    } else if (payload.status === "started") {
      status = "dreaming";
    } else if (payload.status === "queued") {
      status = "submitted";
    }

    // Update the generation record
    const updateData: Record<string, any> = {
      status,
      callback_received_at: new Date().toISOString(),
    };

    // Handle failures
    if (status === "failed") {
      updateData.failure_reason = payload.failure_reason || "Unknown error";
      
      // Update the shot status as well
      if (generation.api_provider === "luma_image") {
        await supabase
          .from("shots")
          .update({ 
            image_status: "failed",
            failure_reason: updateData.failure_reason
          })
          .eq("id", generation.shot_id);
          
        console.log(`Updated shot ${generation.shot_id} status to failed`);
      }
    }

    // Handle successful completions
    if (status === "completed" && payload.output) {
      // For image generation
      if (generation.api_provider === "luma_image" && payload.output.images && payload.output.images[0]) {
        const imageUrl = payload.output.images[0];
        
        // Create a media asset entry
        const { data: mediaAsset, error: mediaError } = await supabase
          .from("media_assets")
          .insert({
            user_id: generation.user_id,
            project_id: generation.project_id,
            cdn_url: imageUrl,
            file_name: `luma_image_${payload.id}.png`,
            mime_type: "image/png",
            asset_type: "image",
            purpose: "generation_result"
          })
          .select()
          .single();
          
        if (mediaError) {
          console.error(`Error creating media asset: ${mediaError.message}`);
        } else {
          updateData.result_media_asset_id = mediaAsset.id;
          
          // Update the shot with the new image URL
          await supabase
            .from("shots")
            .update({ 
              image_url: imageUrl,
              image_status: "completed"
            })
            .eq("id", generation.shot_id);
            
          console.log(`Updated shot ${generation.shot_id} with image URL`);
        }
      }
      
      // For video generation
      if (generation.api_provider === "luma_video" && payload.output.videos && payload.output.videos[0]) {
        const videoUrl = payload.output.videos[0];
        
        // Create a media asset entry
        const { data: mediaAsset, error: mediaError } = await supabase
          .from("media_assets")
          .insert({
            user_id: generation.user_id,
            project_id: generation.project_id,
            cdn_url: videoUrl,
            file_name: `luma_video_${payload.id}.mp4`,
            mime_type: "video/mp4",
            asset_type: "video",
            purpose: "generation_result"
          })
          .select()
          .single();
          
        if (mediaError) {
          console.error(`Error creating media asset: ${mediaError.message}`);
        } else {
          updateData.result_media_asset_id = mediaAsset.id;
        }
      }
    }

    // Update the generation record
    const { error: updateError } = await supabase
      .from("generations")
      .update(updateData)
      .eq("id", generation.id);

    if (updateError) {
      console.error(`Error updating generation: ${updateError.message}`);
      return new Response(
        JSON.stringify({ success: false, error: updateError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error(`Unexpected error: ${error.message}`);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
