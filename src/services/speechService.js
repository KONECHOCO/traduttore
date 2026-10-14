// Voce: sintesi (TTS), riconoscimento (STT) e suoni dell'interfaccia.
// - App: plugin nativi (@capacitor-community/text-to-speech e speech-recognition): le WebView di
//   iOS e Android non offrono in modo affidabile le Web Speech API.
// - Browser: Web Speech API (riconoscimento solo su Chrome/Edge/Safari).

import { Capacitor } from '@capacitor/core';
import { TextToSpeech } from '@capacitor-community/text-to-speech';
import { SpeechRecognition } from '@capacitor-community/speech-recognition';

const native = Capacitor.isNativePlatform();

class SpeechService {
  constructor() {
    this.audioCtx = null;
    this.webRecognition = null;
    this.nativeHandles = [];
    this.session = 0;
  }

  // ---------- Suoni tattili (Web Audio) ----------
  initAudio() {
    if (!this.audioCtx && (window.AudioContext || window.webkitAudioContext)) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioContextClass();
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  tone(steps, type = 'sine', volume = 0.07) {
    try {
      this.initAudio();
      if (!this.audioCtx) return;
      const now = this.audioCtx.currentTime;
      steps.forEach(([freq, start, duration, endFreq]) => {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, now + start);
        if (endFreq) osc.frequency.exponentialRampToValueAtTime(endFreq, now + start + duration);
        gain.gain.setValueAtTime(volume, now + start);
        gain.gain.exponentialRampToValueAtTime(0.001, now + start + duration);
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.start(now + start);
        osc.stop(now + start + duration + 0.02);
      });
    } catch {
      // politica di autoplay del browser
    }
  }

  playClickSound() {
    this.tone([[600, 0, 0.04, 200]]);
  }

  playSuccessChime() {
    this.tone([[523.25, 0, 0.2], [659.25, 0.08, 0.2], [783.99, 0.16, 0.2]], 'sine', 0.05);
  }

  playMicStartTone() {
    this.tone([[440, 0, 0.15, 880]], 'triangle');
  }

  // ---------- Sintesi vocale ----------
  async speakText(text, langCode = 'en-US', rate = 1.0) {
    if (!text || !text.trim()) return;
    if (native) {
      try {
        await TextToSpeech.stop();
        await TextToSpeech.speak({ text, lang: langCode, rate, pitch: 1.0, volume: 1.0, category: 'playback' });
      } catch (err) {
        console.warn('TTS non disponibile per', langCode, err);
      }
      return;
    }
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = langCode;
    utterance.rate = rate;
    const voices = window.speechSynthesis.getVoices();
    const exact = voices.find(v => v.lang.toLowerCase() === langCode.toLowerCase());
    const sameLang = voices.find(v => v.lang.toLowerCase().startsWith(langCode.slice(0, 2).toLowerCase()));
    if (exact || sameLang) utterance.voice = exact || sameLang;
    window.speechSynthesis.speak(utterance);
  }

  stopSpeaking() {
    if (native) TextToSpeech.stop().catch(() => {});
    else if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  }

  // ---------- Riconoscimento vocale ----------
  isRecognitionSupported() {
    return native || !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  /**
   * Avvia l'ascolto di una frase.
   * onPartial(text): testo provvisorio; onFinal(text): frase conclusa; onEnd(): ascolto terminato;
   * onError(code): 'unsupported' | 'permission' | 'failed'.
   */
  async startListening({ lang = 'en-US', onPartial, onFinal, onEnd, onError }) {
    await this.stopListening();
    const session = ++this.session;
    this.playMicStartTone();

    if (native) {
      try {
        const { available } = await SpeechRecognition.available();
        if (!available) {
          onError?.('unsupported');
          return false;
        }
        let perm = await SpeechRecognition.checkPermissions();
        if (perm.speechRecognition !== 'granted') perm = await SpeechRecognition.requestPermissions();
        if (perm.speechRecognition !== 'granted') {
          onError?.('permission');
          return false;
        }
        let last = '';
        let finished = false;
        const finish = () => {
          if (finished || session !== this.session) return;
          finished = true;
          if (last.trim()) onFinal?.(last.trim());
          onEnd?.();
          this.removeNativeListeners();
        };
        this.nativeHandles.push(
          await SpeechRecognition.addListener('partialResults', data => {
            if (session !== this.session) return;
            last = data.matches?.[0] || last;
            onPartial?.(last);
          }),
          await SpeechRecognition.addListener('listeningState', data => {
            // Android segnala la fine del parlato prima di consegnare il risultato definitivo
            if (data.status === 'stopped') setTimeout(finish, 400);
          })
        );
        await SpeechRecognition.start({ language: lang, maxResults: 1, partialResults: true, popup: false });
        return true;
      } catch (err) {
        console.warn('Riconoscimento vocale fallito', err);
        this.removeNativeListeners();
        onError?.('failed');
        return false;
      }
    }

    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) {
      onError?.('unsupported');
      return false;
    }
    const rec = new Recognition();
    rec.lang = lang;
    rec.continuous = false;
    rec.interimResults = true;
    let last = '';
    rec.onresult = event => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const text = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          last = '';
          onFinal?.(text.trim());
        } else {
          interim += text;
        }
      }
      if (interim) {
        last = interim;
        onPartial?.(interim);
      }
    };
    rec.onerror = event => {
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') onError?.('permission');
      else if (event.error !== 'no-speech' && event.error !== 'aborted') onError?.('failed');
    };
    rec.onend = () => {
      if (session !== this.session) return;
      if (last.trim()) onFinal?.(last.trim());
      this.webRecognition = null;
      onEnd?.();
    };
    this.webRecognition = rec;
    try {
      rec.start();
      return true;
    } catch {
      onError?.('failed');
      return false;
    }
  }

  removeNativeListeners() {
    this.nativeHandles.forEach(h => h.remove());
    this.nativeHandles = [];
  }

  /** Ferma l'ascolto: la frase in corso viene comunque consegnata con onFinal. */
  async stopListening() {
    if (native) {
      try {
        const { listening } = await SpeechRecognition.isListening();
        if (listening) await SpeechRecognition.stop();
      } catch {
        // già fermo
      }
      return;
    }
    if (this.webRecognition) {
      try {
        this.webRecognition.stop();
      } catch {
        // già fermo
      }
    }
  }
}

export const speechService = new SpeechService();

/** Somiglianza 0–100 tra due frasi (distanza di Levenshtein su lettere, ignorando punteggiatura e maiuscole). */
export function textSimilarity(a, b) {
  const norm = s => (s || '').toLowerCase().normalize('NFKC').replace(/[\p{P}\p{S}\s]+/gu, '');
  const x = norm(a);
  const y = norm(b);
  if (!x && !y) return 100;
  if (!x || !y) return 0;
  const prev = Array.from({ length: y.length + 1 }, (_, i) => i);
  for (let i = 1; i <= x.length; i++) {
    let diag = prev[0];
    prev[0] = i;
    for (let j = 1; j <= y.length; j++) {
      const tmp = prev[j];
      prev[j] = Math.min(prev[j] + 1, prev[j - 1] + 1, diag + (x[i - 1] === y[j - 1] ? 0 : 1));
      diag = tmp;
    }
  }
  return Math.round((1 - prev[y.length] / Math.max(x.length, y.length)) * 100);
}
