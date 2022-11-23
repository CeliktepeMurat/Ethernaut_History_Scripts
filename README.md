# Ethernaut_History_Scripts

All historical data are being saved to JSON files under data folder.

Transactions Batch -> 
```
{
  "fromBlock": 7632928,
  "toBlock": 7978269
}
```

Total Txns -> `18746`

> Depending on web3 provider, block interval should be set properly. In the case of Infura provider, since it has 10k rate limit, block numbers should be arranged for having up to 5k logs each time. Because, for every log, script's making 2 calls (`getTxn` and `getBlock`).

# Scripts
- `fetch:all_data` -> Fetchs all logs, corresponding transactions and blocks in range of given `fromBlock` and `toBlock` params. It saves data in the following format:
  
```
FETCH_DATA {
  event: string;
  transactionHash: string;
  blockNumber: number;
  timeStamp: number;
  player: string;
  instance: string;
  level: string;
}
```
- `calc:total_nums` -> Calculates total numbers of instances created and solved. Data is saved to `data/total_instance_numbers.json`. Format:
```
TOTAL_NUMBERS_STAT {
  Total_Number_Of_Instances_Created: number;
  Total_Number_Of_Instance_Solved: number;
}
```

- `calc:player_stats` -> Calculates total numbers of instances created and solved by a player. Data is saved to `data/palyer_stat.json`. Also gets all players and save them into another file (`data/all_player_list.json`) as a list. Format:

```
PLAYER_STAT {
  [key: string]: { //player address
    created_instances: number; 
    solved_instances: number 
  };
}
```

- `calc:level_stats` -> Calculates total numbers of instances created and solved for each level. Data is saved to `data/level_stat.json`. Also gets all levels and save them into another file (`data/all_level_list.json`) as a list. Format:

```
LEVEL_FACTORY_STAT {
  [key: string]:  { //level address
    created_instances: number; 
    solved_instances: number 
  };
}
```

- `calc:player_metrics` -> Calculates player performance statistics. For each player, it calculates the address of levels and instances created-solved by these levels. It also saves that whether instance is completed, `timeCreated` of instance and `timeCompleted` of instance. Format:

```
PLAYER_METRICS {
  [key: string]: { // player address
    [key: string]: { // level address
      instance: string;
      isCompleted: boolean;
      timeCreated: number;
      timeCompleted: number;
    };
  };
}
```

