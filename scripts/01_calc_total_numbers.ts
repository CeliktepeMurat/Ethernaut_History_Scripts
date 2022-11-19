import dotenv from 'dotenv';
import fs from 'fs';
import { FETCH_DATA } from '../utils/interface';
dotenv.config();

const ALL_DATA_PATH = `./data/all_data.json`;
const TOTAL_INSTANCE_NUMBERS_PATHS = `./data/total_instance_numbers.json`;

const main = () => {
  const all_data = loadFetchedData(ALL_DATA_PATH);
  console.log(all_data.length);

  const created_instances = filterCreateInstance(all_data);
  const solved_instances = filterSubmitInstance(all_data);

  storeData(TOTAL_INSTANCE_NUMBERS_PATHS, {
    Total_Number_Of_Instances_Created: created_instances.length,
    Total_Number_Of_Instance_Solved: solved_instances.length,
  });
};

const filterCreateInstance = (data: FETCH_DATA[]) => {
  return data.filter((data: FETCH_DATA) => {
    return data.event === 'create_instance';
  });
};

const filterSubmitInstance = (data: FETCH_DATA[]) => {
  return data.filter((data: FETCH_DATA) => {
    return data.event === 'solve_instance';
  });
};

const loadFetchedData = (path: string) => {
  try {
    return JSON.parse(fs.readFileSync(path).toString());
  } catch (err) {
    return {};
  }
};

const storeData = (path: string, data: {}) => {
  fs.writeFileSync(path, JSON.stringify(data, null, 2));
};

main();
