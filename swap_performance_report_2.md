# Swap Transaction Performance Report
Generated: 2025-03-24T13:02:10.147Z

## Transaction Details
- Input Token: Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB
- Output Token: EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v
- Amount: 1000000

## Nozomi Swap Performance
- Transaction ID: 5c8KgUG73r1GxGqu67PMfHT9h4rk1asGEw9XTMkr4iYtx2kdqNkNxSvbqWEXYR75DU1Dde5thSAvJqmitQeHXyvT
- Transaction Send Time: 2025-03-24T13:02:06.799Z
- Transaction Confirmation Time: 2025-03-24T13:02:08.118Z
- Total Time: 1.319 seconds
- Transaction Landing Time: 0.569 seconds

## Normal Swap Performance
- Transaction ID: ktBvqbMBSLAPCHVJBDLizU9DWJMmHsQB27usa4PWKuBnKJfX9YDQFnNCwqvdePFV5hcaHGBkPW46mtdNe4F62tJ
- Transaction Send Time: 2025-03-24T13:02:08.124Z
- Transaction Confirmation Time: 2025-03-24T13:02:10.147Z
- Total Time: 2.023 seconds
- Transaction Landing Time: 0.828 seconds

## Comparison
- Speed Difference: 0.704 seconds
- Nozomi was 1.53x faster than normal RPC
- Landing Time Difference: 0.259 seconds

## Raw Timing Data
```json
{
  "inputToken": "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
  "outputToken": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
  "amount": 1000000,
  "nozomi": {
    "sendTime": 1742821326799,
    "txid": "5c8KgUG73r1GxGqu67PMfHT9h4rk1asGEw9XTMkr4iYtx2kdqNkNxSvbqWEXYR75DU1Dde5thSAvJqmitQeHXyvT",
    "landingTime": 0.569,
    "confirmTime": 1742821328118,
    "totalTime": 1.319
  },
  "normal": {
    "sendTime": 1742821328124,
    "txid": "ktBvqbMBSLAPCHVJBDLizU9DWJMmHsQB27usa4PWKuBnKJfX9YDQFnNCwqvdePFV5hcaHGBkPW46mtdNe4F62tJ",
    "landingTime": 0.828,
    "confirmTime": 1742821330147,
    "totalTime": 2.023
  }
}
```
