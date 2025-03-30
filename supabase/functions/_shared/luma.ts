
/**
 * Shared helper functions for Luma API interactions
 */

interface LumaGenerationResponse {
    id: string;
    state: 'pending' | 'processing' | 'completed' | 'failed';
    created_at: string;
}

interface LumaCompletedResponse extends LumaGenerationResponse {
    state: 'completed';
    assets: {
        video?: string | null; 
        image?: string | null;
    };
}

interface LumaFailedResponse extends LumaGenerationResponse {
    state: 'failed';
    failure_reason: string | null;
}

/**
 * Initiates an image generation request with Luma Labs API.
 * @param lumaApiKey Your Luma API key.
 * @param visualPrompt The prompt for image generation.
 * @param aspectRatio Aspect ratio (e.g., "16:9", "3:4"). Defaults to "16:9".
 * @param userId Optional user ID for Luma API tracking.
 * @returns The initial Luma generation response containing the ID and state.
 */
export async function initiateLumaImageGeneration(
    lumaApiKey: string,
    visualPrompt: string,
    aspectRatio: string = "16:9",
    userId?: string | null
): Promise<LumaGenerationResponse> {
    console.log(`Calling Luma API (photon-flash-1, ${aspectRatio}) with prompt: ${visualPrompt.substring(0, 100)}...`);
    const lumaApiUrl = "https://api.lumalabs.ai/dream-machine/v1/generations/image"; // Image endpoint

    const payload: any = {
        prompt: visualPrompt,
        aspect_ratio: aspectRatio,
        model: "photon-flash-1", // Explicitly use photon-flash-1
    };
    
    if (userId) {
        payload.user_id = userId;
        console.log(`  with user_id: ${userId}`);
    }

    const response = await fetch(lumaApiUrl, {
        method: 'POST',
        headers: {
            'Authorization': `luma-api-key=${lumaApiKey}`, // Correct header format
            'Content-Type': 'application/json',
            'accept': 'application/json'
        },
        body: JSON.stringify(payload)
    });

    const responseBodyText = await response.text();

    if (!response.ok) {
        console.error(`Luma API Error (${response.status}):`, responseBodyText);
        throw new Error(`Luma API Error (${response.status}): ${responseBodyText}`);
    }

    const initialResponse: LumaGenerationResponse = JSON.parse(responseBodyText);
    console.log(`Luma job submitted. Generation ID: ${initialResponse.id}, State: ${initialResponse.state}`);

    if (!initialResponse.id) {
        throw new Error("Luma API did not return a generation ID.");
    }

    return initialResponse;
}

/**
 * Polls the Luma API for the result of a generation task.
 * @param lumaApiKey Your Luma API key.
 * @param generationId The ID of the generation task to poll.
 * @param maxAttempts Maximum number of polling attempts.
 * @param delay Delay between polling attempts in milliseconds.
 * @returns The completed Luma response containing the image URL or throws an error.
 */
export async function pollLumaResult(
    lumaApiKey: string,
    generationId: string,
    maxAttempts = 90, // Increase polling attempts (~4.5 mins)
    delay = 3000
): Promise<LumaCompletedResponse> {
    console.log(`Polling Luma result (ID: ${generationId})...`);
    const pollUrl = `https://api.lumalabs.ai/dream-machine/v1/generations/${generationId}`;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        console.log(`Poll attempt ${attempt}/${maxAttempts} for ${generationId}`);
        try {
            await new Promise(resolve => setTimeout(resolve, delay)); // Wait before polling

            const response = await fetch(pollUrl, {
                method: 'GET',
                headers: {
                    'Authorization': `luma-api-key=${lumaApiKey}`,
                    'accept': 'application/json'
                }
            });

            const responseBodyText = await response.text();

            if (!response.ok) {
                // Log non-fatal errors but continue polling unless it's auth/not found
                console.warn(`Luma Poll Status ${response.status} for ${generationId}:`, responseBodyText);
                 if (response.status === 401 || response.status === 404) {
                    throw new Error(`Luma Poll Error (${response.status}): ${responseBodyText}`);
                }
                continue; // Continue polling on other errors (like temporary server issues)
            }

            const pollData: LumaGenerationResponse = JSON.parse(responseBodyText);
            console.log(`Luma Poll Status (ID: ${generationId}): ${pollData.state}`);

            if (pollData.state === 'completed') {
                const completedData = pollData as LumaCompletedResponse;
                if (completedData.assets?.image) {
                    console.log(`Polling complete. Image URL found for ${generationId}.`);
                    return completedData;
                } else {
                    console.error('Luma generation completed but no image asset found:', completedData);
                    throw new Error('Luma generation completed but the image URL is missing.');
                }
            } else if (pollData.state === 'failed') {
                const failedData = pollData as LumaFailedResponse;
                console.error('Luma generation failed:', failedData);
                throw new Error(`Luma image generation failed: ${failedData.failure_reason || 'Unknown reason'}`);
            }
            // If pending or processing, continue to the next attempt

        } catch (pollError) {
            // Log errors during polling but allow retries
            console.error(`Error during Luma poll attempt ${attempt} for ${generationId}:`, pollError);
            if (attempt === maxAttempts) { // Throw only on the last attempt
                throw new Error(`Failed to get Luma result after ${maxAttempts} attempts: ${pollError.message}`);
            }
        }
    }

    throw new Error(`Luma polling timed out after ${maxAttempts} attempts for generation ID: ${generationId}`);
}
