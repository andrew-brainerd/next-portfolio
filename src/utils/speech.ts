// Thin wrapper over the Web Speech API; no-ops where unsupported.
export const speak = (text: string) => {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
  } catch {
    // Speech synthesis can throw if unavailable — ignore.
  }
};
