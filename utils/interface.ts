export interface FETCH_DATA {
  event: string;
  transactionHash: String;
  blockNumber: Number;
  timeStamp: Number;
  player: String;
  instance: String;
  level: String;
}

export const EVENT_TYPE_SIG = {
  create_instance:
    '0x7bf7f1ed7f75e83b76de0ff139966989aff81cb85aac26469c18978d86aac1c2',
  solve_instance:
    '0x9dfdf7e3e630f506a3dfe38cdbe34e196353364235df33e5a3b588488d9a1e78',
};

export interface PLAYER_STAT {
  [key: string]: { created_instances: number; solved_instances: number };
}
export interface LEVEL_FACTORY_STAT {
  [key: string]: { created_instances: number; solved_instances: number };
}
