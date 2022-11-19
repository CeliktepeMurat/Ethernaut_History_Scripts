export interface FETCH_DATA {
  event: string;
  transactionHash: string;
  blockNumber: number;
  timeStamp: number;
  player: string;
  instance: string;
  level: string;
}

export const EVENT_TYPE_SIG = {
  create_instance:
    '0x7bf7f1ed7f75e83b76de0ff139966989aff81cb85aac26469c18978d86aac1c2',
  solve_instance:
    '0x9dfdf7e3e630f506a3dfe38cdbe34e196353364235df33e5a3b588488d9a1e78',
};
export interface TOTAL_NUMBERS_STAT {
  Total_Number_Of_Instances_Created: number;
  Total_Number_Of_Instance_Solved: number;
  Total_Number_Of_Instances_Failed: number;
}

export interface PLAYER_STAT {
  [key: string]: { created_instances: number; solved_instances: number };
}
export interface LEVEL_FACTORY_STAT {
  [key: string]: { created_instances: number; solved_instances: number };
}

export interface PLAYER_METRICS {
  [key: string]: {
    [key: string]: {
      instance: string;
      isCompleted: boolean;
      timeCreated: number;
      timeCompleted: number;
    };
  };
}
