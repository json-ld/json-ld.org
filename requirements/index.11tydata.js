import { fileURLToPath } from 'url';
import fs from 'node:fs/promises';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const specStatuses = ['ED'];

async function getDrafts(spec) {
  // Find all drafts and store them in [[date, directory], ...] form
  const all = {};
  for(const status of specStatuses) {
    let dates = [];
    try {
      dates = await fs.readdir(path.join(__dirname, status));
    } catch(e) {
      if(e.code !== 'ENOENT') {
        throw e;
      }
    }

    if(dates.length) {
      for(const date of dates) {
        if(date[0] === '.') {
          continue;
        }

        all[date] = path.join(status, date);
      }
    }
  }

  // Sort drafts in descending order
  return Object.entries(all).sort((a, b) => b[0].localeCompare(a[0]));
}

const specs = [
  'requirements'
];

export default async function() {
  return {
    specs: Object.fromEntries(await Promise.all(specs.map(async spec => {
      return [spec, await getDrafts(spec)];
    })))
  };
}
