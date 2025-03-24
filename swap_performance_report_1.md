# Swap Transaction Performance Report
Generated: 2025-03-24T12:43:49.476Z

## Transaction Details
- Input Token: Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB
- Output Token: EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v
- Amount: 1000000

## Nozomi Swap Performance
- Transaction ID: 5CY8WN1vhYmomjKKzpixWqYcHW6wWUFrKZZd4jQrPUemp4UbJFsEUuT8Y983SwFSBhAPEdWc2VBQEfibK6wM6xUd
- Transaction Send Time: 2025-03-24T12:43:45.640Z
- Transaction Confirmation Time: 2025-03-24T12:43:47.377Z
- Transaction Confirmation Time (solscan -- accurate): March 24, 2025 12:43:46 +UTC
- Transaction Landing Time: 0.807 seconds
- Time landing time (based on solscan): 0.360 seconds

## Normal Swap Performance
- Transaction ID: 2jvWNdPQnbXcgAGFXUStBsT7UnMfFNBtadWBLLFiSWX4x6KE2PV3PPoioeQKf1MyscVJcfv3iGxrPafRsSJPPXhL
- Transaction Send Time: 2025-03-24T12:43:47.379Z
- Transaction Confirmation Time (delayed -- http overhead): 2025-03-24T12:43:49.476Z
- Transaction Confirmation Time (solscan -- accurate): March 24, 2025 12:43:48 +UTC
- Total Time: 2.097 seconds
- Transaction Landing Time: 0.911 seconds
- Time landing time (based on solscan): 0.621 seconds

## Comparison
- Speed Difference: 0.360 seconds
- Nozomi was 1.21x faster than normal RPC
- Landing Time Difference: 0.104 seconds
- Landing Time Difference (based on solscan): 0.261 seconds
- Nozomi was 1.7x faster in landing time based on solscan data

## Raw Timing Data
```json
{
  "inputToken": "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
  "outputToken": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
  "amount": 1000000,
  "nozomi": {
    "sendTime": 1742820225640,
    "txid": "5CY8WN1vhYmomjKKzpixWqYcHW6wWUFrKZZd4jQrPUemp4UbJFsEUuT8Y983SwFSBhAPEdWc2VBQEfibK6wM6xUd",
    "landingTime": 0.807,
    "confirmTime": 1742820227377,
    "totalTime": 1.737
  },
  "normal": {
    "sendTime": 1742820227379,
    "txid": "2jvWNdPQnbXcgAGFXUStBsT7UnMfFNBtadWBLLFiSWX4x6KE2PV3PPoioeQKf1MyscVJcfv3iGxrPafRsSJPPXhL",
    "landingTime": 0.911,
    "confirmTime": 1742820229476,
    "totalTime": 2.097
  }
}
```
