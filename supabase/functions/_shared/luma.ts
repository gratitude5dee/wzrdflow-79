
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const LUMA_API_KEY = Deno.env.get("LUMA_API_KEY");
const LUMA_API_URL = "https://api.lumalabs.ai/v0";

// Types for the function parameters
interface LumaImageGenerationParams {
  supabase: ReturnType<typeof createClient>;
  userId: string;
  shotId: string;
  projectId: string;
  prompt: string;
  aspectRatio: string;
}

interface LumaVideoGenerationParams {
  supabase: ReturnType<typeof createClient>;
  userId: string;
  shotId: string;
  projectId: string;
  imageUrl: string;
}

// Function to initiate image generation with Luma
export async function initiateLumaImageGeneration({
  supabase,
  userId,
  shotId,
  projectId,
  prompt,
  aspectRatio = "16:9"
}: LumaImageGenerationParams) {
  if (!LUMA_API_KEY) {
    throw new Error("Luma API key is not configured");
  }

  // Determine aspect ratio dimensions
  let width = 1024;
  let height = 576; // Default 16:9
  
  if (aspectRatio === "1:1") {
    width = 1024;
    height = 1024;
  } else if (aspectRatio === "4:3") {
    width = 1024;
    height = 768;
  } else if (aspectRatio === "9:16") {
    width = 576;
    height = 1024;
  }

  try {
    console.log(`Calling Luma API (photon-flash-1, ${aspectRatio}) with prompt: ${prompt.substring(0, 80)}...`);
    console.log(`  with user_id: ${userId}`);
    
    // Call Luma API to generate an image
    const response = await fetch(`${LUMA_API_URL}/images/generations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${LUMA_API_KEY}`
      },
      body: JSON.stringify({
        prompt: prompt,
        model: "photon-flash-1", // Using the latest Photon model
        width: width,
        height: height,
        num_images: 1
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Luma API Error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    
    if (!data.id) {
      throw new Error("Luma API did not return a generation ID");
    }

    // Store the generation record in our database
    const { data: generation, error } = await supabase
      .from("generations")
      .insert({
        user_id: userId,
        project_id: projectId,
        shot_id: shotId,
        api_provider: "luma_image",
        external_request_id: data.id,
        request_payload: {
          prompt,
          model: "photon-flash-1",
          width,
          height
        },
        status: "submitted"
      })
      .select()
      .single();

    if (error) {
      console.error(`Error storing generation record: ${error.message}`);
    }

    return {
      generation_id: generation?.id || null,
      luma_generation_id: data.id,
      status: "submitted"
    };
  } catch (error) {
    throw error;
  }
}

// Function to initiate video generation with Luma
export async function initiateLumaVideoGeneration({
  supabase,
  userId,
  shotId,
  projectId,
  imageUrl
}: LumaVideoGenerationParams) {
  if (!LUMA_API_KEY) {
    throw new Error("Luma API key is not configured");
  }

  try {
    console.log(`Calling Luma API (Ray-2 Flash) to generate video from image: ${imageUrl.substring(0, 80)}...`);
    console.log(`  for shot_id: ${shotId}, user_id: ${userId}`);
    
    // Call Luma API to generate a video from the image
    const response = await fetch(`${LUMA_API_URL}/videos/generations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${LUMA_API_KEY}`
      },
      body: JSON.stringify({
        model: "ray-2-flash",
        input_image_url: imageUrl,
        animation_settings: {
          motion_strength: 0.6, // Use moderate motion strength
          camera_motion: "subtle_panning" // Subtle camera motion
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Luma API Error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    
    if (!data.id) {
      throw new Error("Luma API did not return a generation ID");
    }

    // Store the generation record in our database
    const { data: generation, error } = await supabase
      .from("generations")
      .insert({
        user_id: userId,
        project_id: projectId,
        shot_id: shotId,
        api_provider: "luma_video",
        external_request_id: data.id,
        request_payload: {
          model: "ray-2-flash",
          input_image_url: imageUrl,
          animation_settings: {
            motion_strength: 0.6,
            camera_motion: "subtle_panning"
          }
        },
        status: "submitted"
      })
      .select()
      .single();

    if (error) {
      console.error(`Error storing generation record: ${error.message}`);
    }

    return {
      generation_id: generation?.id || null,
      luma_generation_id: data.id,
      status: "submitted"
    };
  } catch (error) {
    throw error;
  }
}
