import { NextResponse } from "next/server";

export const maxDuration = 30;
export const runtime = "nodejs";

/**
 * Enhanced Speech-to-Text API endpoint
 * Uses backend processing for better accuracy with US accents
 * 
 * This endpoint can be extended to use:
 * - Google Cloud Speech-to-Text API
 * - Azure Speech Services
 * - AWS Transcribe
 * - Or other cloud-based services for better accuracy
 */
export async function POST(request) {
    try {
        const formData = await request.formData();
        const audioFile = formData.get('audio');
        const language = formData.get('language') || 'en-IN';
        
        if (!audioFile) {
            return NextResponse.json(
                { error: "No audio file provided" },
                { status: 400 }
            );
        }

        // For now, we'll return a message that backend processing is available
        // In production, you can integrate with:
        // 1. Google Cloud Speech-to-Text (best for US accents)
        // 2. Azure Speech Services
        // 3. AWS Transcribe
        
        // Example integration structure:
        /*
        const audioBuffer = await audioFile.arrayBuffer();
        const audioBytes = Buffer.from(audioBuffer);
        
        // Google Cloud Speech-to-Text example
        const speech = require('@google-cloud/speech');
        const client = new speech.SpeechClient();
        
        const config = {
            encoding: 'WEBM_OPUS',
            sampleRateHertz: 48000,
            languageCode: 'en-IN',
            alternativeLanguageCodes: ['en-US', 'en-GB'],
            enableAutomaticPunctuation: true,
            model: 'latest_long', // Better for longer speech
            useEnhanced: true, // Enhanced model for better accuracy
        };
        
        const audio = {
            content: audioBytes.toString('base64'),
        };
        
        const [response] = await client.recognize({ config, audio });
        const transcription = response.results
            .map(result => result.alternatives[0].transcript)
            .join('\n');
        
        return NextResponse.json({ 
            transcript: transcription,
            confidence: response.results[0].alternatives[0].confidence 
        });
        */

        // Placeholder response - replace with actual implementation
        return NextResponse.json({
            error: "Backend speech recognition not yet configured",
            message: "Please use browser-based speech recognition for now. We're working on enhanced backend support.",
            fallback: true
        }, { status: 501 });

    } catch (error) {
        console.error("Speech-to-Text API Error:", error);
        return NextResponse.json(
            { error: "Failed to process audio", details: error.message },
            { status: 500 }
        );
    }
}
