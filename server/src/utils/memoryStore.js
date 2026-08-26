/**
 * In-memory fallback database for local development when MongoDB is not connected.
 * Provides Mongoose-like interface methods (find, findOne, findById, create, findByIdAndUpdate, findByIdAndDelete).
 */

class CollectionStore {
  constructor(name) {
    this.name = name;
    this.items = new Map();
    this.idCounter = 1;
  }

  _generateId() {
    return (Date.now().toString(36) + Math.random().toString(36).substring(2, 9)).toLowerCase();
  }

  async create(data) {
    const _id = data._id ? String(data._id) : this._generateId();
    const now = new Date();
    const doc = {
      _id,
      id: _id,
      createdAt: now,
      updatedAt: now,
      ...data,
    };
    this.items.set(_id, doc);
    return JSON.parse(JSON.stringify(doc));
  }

  async find(query = {}) {
    const results = [];
    for (const doc of this.items.values()) {
      if (this._matches(doc, query)) {
        results.push(JSON.parse(JSON.stringify(doc)));
      }
    }
    return results;
  }

  async findOne(query = {}) {
    for (const doc of this.items.values()) {
      if (this._matches(doc, query)) {
        return JSON.parse(JSON.stringify(doc));
      }
    }
    return null;
  }

  async findById(id) {
    if (!id) return null;
    const doc = this.items.get(String(id));
    return doc ? JSON.parse(JSON.stringify(doc)) : null;
  }

  async findByIdAndUpdate(id, update = {}, options = {}) {
    const doc = this.items.get(String(id));
    if (!doc) {
      if (options.upsert) {
        const newDoc = { _id: String(id), ...update, createdAt: new Date(), updatedAt: new Date() };
        this.items.set(String(id), newDoc);
        return JSON.parse(JSON.stringify(newDoc));
      }
      return null;
    }

    const updated = {
      ...doc,
      ...(update.$set || update),
      updatedAt: new Date(),
    };
    this.items.set(String(id), updated);
    return JSON.parse(JSON.stringify(updated));
  }

  async findOneAndUpdate(query, update = {}, options = {}) {
    const doc = await this.findOne(query);
    if (!doc) {
      if (options.upsert) {
        return this.create({ ...query, ...(update.$set || update) });
      }
      return null;
    }
    return this.findByIdAndUpdate(doc._id, update, options);
  }

  async findByIdAndDelete(id) {
    const doc = this.items.get(String(id));
    if (doc) {
      this.items.delete(String(id));
      return JSON.parse(JSON.stringify(doc));
    }
    return null;
  }

  async deleteMany(query = {}) {
    let deletedCount = 0;
    for (const [id, doc] of this.items.entries()) {
      if (this._matches(doc, query)) {
        this.items.delete(id);
        deletedCount++;
      }
    }
    return { deletedCount };
  }

  async countDocuments(query = {}) {
    const list = await this.find(query);
    return list.length;
  }

  _matches(doc, query) {
    for (const key of Object.keys(query)) {
      if (key === '$or' && Array.isArray(query.$or)) {
        const matchesOr = query.$or.some(subQuery => this._matches(doc, subQuery));
        if (!matchesOr) return false;
        continue;
      }
      if (doc[key] !== query[key]) {
        return false;
      }
    }
    return true;
  }
}

class MemoryStore {
  constructor() {
    this.collections = {
      users: new CollectionStore('users'),
      workflows: new CollectionStore('workflows'),
      executions: new CollectionStore('executions'),
      executionLogs: new CollectionStore('executionLogs'),
      integrations: new CollectionStore('integrations'),
      notifications: new CollectionStore('notifications'),
      agentMemory: new CollectionStore('agentMemory'),
    };
  }

  getCollection(name) {
    if (!this.collections[name]) {
      this.collections[name] = new CollectionStore(name);
    }
    return this.collections[name];
  }
}

const memoryStore = new MemoryStore();
module.exports = memoryStore;
