const fs = require('fs');
const path = require('path');

class JournalLinks {
  constructor() {
    this.fileName = 'links.json';
    this.journalPath = null;
    this.links = new Map();
  }

  resetIndex() {
    this.links.clear();
  }

  load(journalPath) {
    if (!journalPath) return;

    // skip loading
    if (journalPath === this.journalPath) {
      return;
    }

    // a different pile is being loaded
    if (journalPath !== this.journalPath) {
      this.resetIndex();
    }

    this.journalPath = journalPath;
    const linksFilePath = path.join(this.journalPath, this.fileName);

    if (fs.existsSync(linksFilePath)) {
      const data = fs.readFileSync(linksFilePath);
      const loadedIndex = new Map(JSON.parse(data));
      this.links = loadedIndex;

      return loadedIndex;
    } else {
      this.save();
      return this.links;
    }
  }

  get(journalPath, url) {
    if (journalPath !== this.journalPath) {
      this.load(journalPath);
    }
    return this.links.get(url);
  }

  set(journalPath, url, data) {
    if (journalPath !== this.journalPath) {
      this.load(journalPath);
    }

    this.links.set(url, data);
    this.save();

    return this.links;
  }

  save() {
    if (!this.journalPath) return;
    if (!fs.existsSync(this.journalPath)) {
      fs.mkdirSync(this.journalPath, { recursive: true });
    }

    const filePath = path.join(this.journalPath, this.fileName);
    const entries = this.links.entries();

    if (!entries) return;

    let strMap = JSON.stringify(Array.from(entries));
    fs.writeFileSync(filePath, strMap);
  }
}

module.exports = new JournalLinks();
