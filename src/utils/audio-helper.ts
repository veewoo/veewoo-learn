
/**
 * Converts a base64 encoded audio string to an HTMLAudioElement.
 * @param base64String The base64 encoded audio data.
 * @param audioType The MIME type of the audio (e.g., "audio/mpeg", "audio/wav"). Defaults to "audio/mpeg".
 * @returns An HTMLAudioElement ready to be played.
 */
export const convertBase64ToAudio = (
    base64String: string,
    audioType = "audio/mpeg"
) => {
    console.log("response.data.audioBase64:", base64String);
    // Step 1: Decode the base64 string to a Uint8Array
    const byteCharacters = atob(base64String);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);

    // Step 2: Create a Blob from the Uint8Array
    const audioBlob = new Blob([byteArray], { type: audioType });

    // Step 3: Create an object URL from the Blob
    const audioUrl = URL.createObjectURL(audioBlob);

    // Step 4: Create a new Audio object
    const audioElement = new Audio(audioUrl);

    // Optional: Clean up the object URL when the audio finishes playing or is no longer needed
    // audioElement.onended = () => {
    //   URL.revokeObjectURL(audioUrl);
    // };
    // audioElement.onabort = () => { // Also handle cases where loading is aborted
    //   URL.revokeObjectURL(audioUrl);
    // };
    // audioElement.onerror = () => { // And errors
    //    URL.revokeObjectURL(audioUrl);
    // }

    return audioElement;
};