/**
 * Audio Utility for converting base64 / raw PCM audio to valid browser-playable WAV URLs
 * and safely handling HTML5 audio playback without AbortError.
 */

export function createPlayableAudioUrl(base64Audio: string, sampleRate = 24000): string {
  if (!base64Audio) return '';

  let cleanB64 = base64Audio.trim();
  if (cleanB64.startsWith('data:')) {
    const parts = cleanB64.split(',');
    cleanB64 = parts[1] || cleanB64;
  }

  // If already contains RIFF WAV header (base64 starts with 'UklGR')
  if (cleanB64.startsWith('UklGR')) {
    return `data:audio/wav;base64,${cleanB64}`;
  }

  try {
    // Decode base64 to binary
    const binaryString = atob(cleanB64);
    const len = binaryString.length;
    const pcmBytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      pcmBytes[i] = binaryString.charCodeAt(i);
    }

    // If binary data already starts with 'RIFF' (0x52, 0x49, 0x46, 0x46)
    if (pcmBytes.length > 44 && pcmBytes[0] === 0x52 && pcmBytes[1] === 0x49 && pcmBytes[2] === 0x46 && pcmBytes[3] === 0x46) {
      const blob = new Blob([pcmBytes], { type: 'audio/wav' });
      return URL.createObjectURL(blob);
    }

    // Wrap raw 16-bit Mono PCM in a standard 44-byte RIFF WAV header
    const wavHeader = new ArrayBuffer(44);
    const view = new DataView(wavHeader);

    // RIFF chunk descriptor
    view.setUint32(0, 0x52494646, false); // "RIFF"
    view.setUint32(4, 36 + len, true);    // File size - 8
    view.setUint32(8, 0x57415645, false); // "WAVE"

    // "fmt " sub-chunk
    view.setUint32(12, 0x666d7420, false); // "fmt "
    view.setUint32(16, 16, true);          // Subchunk1Size (16 for PCM)
    view.setUint16(20, 1, true);           // AudioFormat (1 = PCM)
    view.setUint16(22, 1, true);           // NumChannels (1 = Mono)
    view.setUint32(24, sampleRate, true);  // SampleRate (24000 Hz)
    view.setUint32(28, sampleRate * 2, true); // ByteRate (sampleRate * numChannels * bitsPerSample/8)
    view.setUint16(32, 2, true);           // BlockAlign (numChannels * bitsPerSample/8)
    view.setUint16(34, 16, true);          // BitsPerSample (16 bits)

    // "data" sub-chunk
    view.setUint32(36, 0x64617461, false); // "data"
    view.setUint32(40, len, true);         // Subchunk2Size (data bytes)

    const blob = new Blob([wavHeader, pcmBytes], { type: 'audio/wav' });
    return URL.createObjectURL(blob);
  } catch (err) {
    console.warn('Audio header wrap fallback:', err);
    return `data:audio/wav;base64,${cleanB64}`;
  }
}

export function safePlayAudio(audio: HTMLAudioElement): Promise<void> {
  return new Promise((resolve) => {
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => resolve())
        .catch((err) => {
          // AbortError is normal when a user pauses, re-triggers, or moves away
          if (err.name === 'AbortError') {
            resolve();
            return;
          }
          console.warn('Audio play error:', err);
          resolve();
        });
    } else {
      resolve();
    }
  });
}
