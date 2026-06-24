// Simple in-memory cache utility
class Cache {
  constructor(ttl = 300000) { // 5 minutes default TTL
    this.store = new Map();
    this.ttl = ttl;
  }

  set(key, value, ttl = this.ttl) {
    if (this.store.has(key)) {
      clearTimeout(this.store.get(key).timeout);
    }
    
    const timeout = setTimeout(() => {
      this.store.delete(key);
    }, ttl);

    this.store.set(key, { value, timeout });
  }

  get(key) {
    if (!this.store.has(key)) {
      return null;
    }
    return this.store.get(key).value;
  }

  has(key) {
    return this.store.has(key);
  }

  delete(key) {
    if (this.store.has(key)) {
      clearTimeout(this.store.get(key).timeout);
      this.store.delete(key);
    }
  }

  clear() {
    for (const entry of this.store.values()) {
      clearTimeout(entry.timeout);
    }
    this.store.clear();
  }

  // Utility to create cache key
  static createKey(...parts) {
    return parts.join(":");
  }
}

// Export singleton instance
module.exports = new Cache();
