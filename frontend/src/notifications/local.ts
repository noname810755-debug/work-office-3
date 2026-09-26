import AsyncStorage from "@react-native-async-storage/async-storage";

export type LocalNotification = {
  id: string;
  title: string;
  body: string;
  createdAt: number;
  read: boolean;
};

const KEY = "jarvis:notifications";
const seed: LocalNotification[] = [
  {
    id: "welcome",
    title: "Welcome to Jarvis Office",
    body: "Your documents, sheets and presentations are ready to use offline.",
    createdAt: Date.now(),
    read: false,
  },
  {
    id: "privacy",
    title: "Your work stays on this device",
    body: "Jarvis Office is local-first. Review Privacy Policy in Settings any time.",
    createdAt: Date.now() - 60_000,
    read: false,
  },
];

async function read(): Promise<LocalNotification[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) {
      await AsyncStorage.setItem(KEY, JSON.stringify(seed));
      return seed;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function write(items: LocalNotification[]): Promise<boolean> {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(items));
    return true;
  } catch {
    return false;
  }
}

export async function listNotifications(): Promise<LocalNotification[]> {
  return (await read()).sort((a, b) => b.createdAt - a.createdAt);
}

export async function unreadNotificationCount(): Promise<number> {
  return (await read()).filter((item) => !item.read).length;
}

export async function markNotificationRead(id: string): Promise<boolean> {
  const items = await read();
  return write(items.map((item) => item.id === id ? { ...item, read: true } : item));
}

export async function markAllNotificationsRead(): Promise<boolean> {
  const items = await read();
  return write(items.map((item) => ({ ...item, read: true })));
}
