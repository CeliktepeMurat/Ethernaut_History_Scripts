import fs from 'fs';

export const loadFetchedData = (path: string) => {
  try {
    return JSON.parse(fs.readFileSync(path).toString());
  } catch (err) {
    return {};
  }
};

export const storeData = (path: string, data: {}) => {
  fs.writeFileSync(path, JSON.stringify(data, null, 2));
};
