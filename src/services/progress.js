// Serie di giorni di studio e obiettivo giornaliero (ripassi, risposte al quiz, prove di pronuncia).
// Tutto resta sul dispositivo; il promemoria giornaliero è una notifica locale.
import { useSyncExternalStore } from 'react';
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { readJSON, writeJSON } from './storage';

const KEY = 'omni_progress';
const REMINDER_ID = 4101;
const dayKey = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

let state = readJSON(KEY, { days: {}, goal: 10, best: 0, reminder: null });
const listeners = new Set();

function save(patch) {
  state = { ...state, ...patch };
  writeJSON(KEY, state);
  listeners.forEach(l => l());
}

export function streakOf(days) {
  let streak = 0;
  const d = new Date();
  // se oggi non si è ancora studiato la serie conta da ieri
  if (!days[dayKey(d)]) d.setDate(d.getDate() - 1);
  while (days[dayKey(d)]) {
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

export function recordActivity(n = 1) {
  const today = dayKey();
  const days = { ...state.days, [today]: (state.days[today] || 0) + n };
  // si tengono solo gli ultimi 400 giorni
  const keys = Object.keys(days).sort();
  while (keys.length > 400) delete days[keys.shift()];
  save({ days, best: Math.max(state.best || 0, streakOf(days)) });
}

export function setGoal(goal) {
  save({ goal });
}

export function useProgress() {
  const snap = useSyncExternalStore(cb => {
    listeners.add(cb);
    return () => listeners.delete(cb);
  }, () => state);
  return { ...snap, today: snap.days[dayKey()] || 0, streak: streakOf(snap.days) };
}

/** Promemoria giornaliero all'ora scelta ("HH:MM"), oppure null per disattivarlo. */
export async function setReminder(time, { title, body }) {
  if (Capacitor.isNativePlatform()) {
    await LocalNotifications.cancel({ notifications: [{ id: REMINDER_ID }] }).catch(() => {});
    if (time) {
      let perm = await LocalNotifications.checkPermissions();
      if (perm.display !== 'granted') perm = await LocalNotifications.requestPermissions();
      if (perm.display !== 'granted') throw new Error('permission');
      const [hour, minute] = time.split(':').map(Number);
      await LocalNotifications.schedule({
        notifications: [{ id: REMINDER_ID, title, body, schedule: { on: { hour, minute }, allowWhileIdle: true } }]
      });
    }
  }
  save({ reminder: time });
}
