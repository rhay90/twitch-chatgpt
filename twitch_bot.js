import tmi from 'tmi.js';
import fetch from 'node-fetch'; // Import node-fetch for making HTTP requests
import { promises as fsPromises } from 'fs';

export class TwitchBot {
    constructor(bot_username, oauth_token, channels, enable_tts, elevenlabs_api_key) {
        this.channels = channels;
        this.client = new tmi.client({
            connection: {
                reconnect: true,
                secure: true
            },
            identity: {
                username: bot_username,
                password: oauth_token
            },
            channels: this.channels
        });
        this.enable_tts = enable_tts;
        this.elevenlabs_api_key = elevenlabs_api_key; // Store Elevenlabs API key
    }

    // Other methods remain unchanged...

    async sayTTS(channel, text, userstate) {
        // Check if TTS is enabled
        if (this.enable_tts !== 'true') {
            return;
        }
        try {
            // Make a call to the Elevenlabs TTS API
            const response = await fetch('https://api.elevenlabs.com/v1/tts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.elevenlabs_api_key}` // Use Elevenlabs API key for authentication
                },
                body: JSON.stringify({
                    text: text
                })
            });

            // Check if the request was successful
            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            // Parse the JSON response
            const responseBody = await response.json();

            // Get the audio URL from the response
            const audioUrl = responseBody.audioUrl;

            // Fetch the audio file
            const audioResponse = await fetch(audioUrl);

            // Convert the audio to a buffer
            const audioBuffer = await audioResponse.buffer();

            // Save the buffer as an MP3 file
            const filePath = './public/file.mp3';
            await fsPromises.writeFile(filePath, audioBuffer);

            // Return the path of the saved audio file
            return filePath;
        } catch (error) {
            console.error('Error in sayTTS:', error);
        }
    }
}
