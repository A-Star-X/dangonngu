// @spec DATA-06, APP-08
// Bọc localStorage. Khi trình duyệt chặn lưu, chuyển sang bộ nhớ tạm trong phiên và báo cờ `blocked`.

type Listener = (blocked: boolean) => void;

export class SafeStorage {
  private memory = new Map<string, string>();
  private blocked = false;
  private listeners = new Set<Listener>();
  private backend: Storage | null;

  constructor(backend?: Storage | null) {
    this.backend = backend === undefined ? SafeStorage.detect() : backend;
    if (!this.backend) this.blocked = true;
    else {
      try {
        const k = 'vitasr2.__probe';
        this.backend.setItem(k, '1');
        this.backend.removeItem(k);
      } catch {
        this.blocked = true;
      }
    }
  }

  private static detect(): Storage | null {
    try {
      return typeof window !== 'undefined' ? window.localStorage : null;
    } catch {
      return null;
    }
  }

  isBlocked() {
    return this.blocked;
  }

  subscribe(fn: Listener) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  private markBlocked() {
    if (this.blocked) return;
    this.blocked = true;
    this.listeners.forEach((l) => l(true));
  }

  get(key: string): string | null {
    if (this.memory.has(key)) return this.memory.get(key)!;
    if (!this.backend) return null;
    try {
      return this.backend.getItem(key);
    } catch {
      this.markBlocked();
      return null;
    }
  }

  set(key: string, value: string) {
    this.memory.set(key, value);
    if (!this.backend || this.blocked) return;
    try {
      this.backend.setItem(key, value);
      // Đã ghi được thì không cần giữ bản trong bộ nhớ.
      this.memory.delete(key);
    } catch {
      this.markBlocked();
    }
  }

  remove(key: string) {
    this.memory.delete(key);
    if (!this.backend) return;
    try {
      this.backend.removeItem(key);
    } catch {
      this.markBlocked();
    }
  }

  /** Các khóa bắt đầu bằng `prefix` (cả bản trên máy và bản tạm khi bộ nhớ bị chặn). */
  keys(prefix: string): string[] {
    const out = new Set<string>();
    for (const k of this.memory.keys()) if (k.startsWith(prefix)) out.add(k);
    if (this.backend) {
      try {
        for (let i = 0; i < this.backend.length; i++) {
          const k = this.backend.key(i);
          if (k && k.startsWith(prefix)) out.add(k);
        }
      } catch {
        this.markBlocked();
      }
    }
    return [...out].sort();
  }

  getJSON<T>(key: string): T | null {
    const raw = this.get(key);
    if (raw == null) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  setJSON(key: string, value: unknown) {
    this.set(key, JSON.stringify(value));
  }
}
