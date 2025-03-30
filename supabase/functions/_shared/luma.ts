export async function initiateLumaImageGeneration({
  supabase,
  userId,
  shotId,
  projectId,
  prompt,
  aspectRatio = '16:9'
}: {
  supabase: any;
  userId: string;
  shotId: string;
  projectId: string;
  prompt: string;
  aspectRatio?: string;
}) {
  const lumaApiKey = Deno.env.get("LUMA_API_KEY");
  if (!lumaApiKey) {
    throw new Error("Missing Luma API key in environment variables");
  }

  // Determine model to use based on configuration or defaults
  const model = "photon-flash-1"; // Default model for image generation

  // Log the initiation
  console.log(`Calling Luma API (${model}, ${aspectRatio}) with prompt: ${prompt.substring(0, 75)}...`);
  console.log(`  with user_id: ${userId}`);

  // Prepare the request body for Luma API
  const requestBody = {
    prompt,
    aspect_ratio: aspectRatio,
    model,
  };

  try {
    // Call Luma API
    const response = await fetch("https://api.lumalabs.ai/photon", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${lumaApiKey}`
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Luma API Error (${response.status}): ${errorBody}`);
    }

    const data = await response.json();
    
    // Store the generation record in our database
    const { data: generation, error: insertError } = await supabase
      .from("generations")
      .insert({
        user_id: userId,
        project_id: projectId,
        shot_id: shotId,
        api_provider: "luma_image",
        external_request_id: data.id,
        request_payload: requestBody,
        status: "submitted"
      })
      .select('id')
      .single();

    if (insertError) {
      console.error(`Failed to record generation in database: ${insertError.message}`);
      throw new Error(`Database error: ${insertError.message}`);
    }

    return {
      generation_id: generation.id,
      luma_id: data.id,
      message: "Image generation started successfully"
    };
  } catch (error) {
    throw error;
  }
}

export async function initiateLumaVideoGeneration({
  supabase,
  userId,
  shotId,
  projectId,
  imageUrl
}: {
  supabase: any;
  userId: string;
  shotId: string;
  projectId: string;
  imageUrl: string;
}) {
  const lumaApiKey = Deno.env.get("LUMA_API_KEY");
  if (!lumaApiKey) {
    throw new Error("Missing Luma API key in environment variables");
  }

  // Determine model to use
  const model = "ray-2-flash"; // Default model for video generation from image
  
  // Log the initiation
  console.log(`Initiating video generation with Luma Ray model (${model}) from image`);
  console.log(`  with user_id: ${userId}, shot_id: ${shotId}`);

  // Prepare the request body for Luma API
  const requestBody = {
    input_image_url: imageUrl,
    model,
  };

  try {
    // Call Luma API
    const response = await fetch("https://api.lumalabs.ai/ray/video", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${lumaApiKey}`
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Luma API Error (${response.status}): ${errorBody}`);
    }

    const data = await response.json();
    
    // Store the generation record in our database
    const { data: generation, error: insertError } = await supabase
      .from("generations")
      .insert({
        user_id: userId,
        project_id: projectId,
        shot_id: shotId,
        api_provider: "luma_video",
        external_request_id: data.id,
        request_payload: requestBody,
        status: "submitted"
      })
      .select('id')
      .single();

    if (insertError) {
      console.error(`Failed to record video generation in database: ${insertError.message}`);
      throw new Error(`Database error: ${insertError.message}`);
    }

    return {
      generation_id: generation.id,
      luma_id: data.id,
      message: "Video generation started successfully"
    };
  } catch (error) {
    throw error;
  }
}
