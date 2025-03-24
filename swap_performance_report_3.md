# Swap Transaction Performance Report
Generated: 2025-03-24T13:23:54.757Z

## Transaction Details
- Input Token: EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v
- Output Token: DwEDC3qSZGqUfuWBtdCffzsmkA8uAGdrF1cm32ygpump
- Amount: 10000000

## Nozomi Swap Performance
- Transaction ID: 52AYWUSqjRQDMzqShPVrQkyNm1UGq157RnTLEx26Zy2XnkVw4yakVTYmpt6GXekjxXVcougHdDb4He1MyJSRnrfV
- Transaction Send Time: 2025-03-24T13:23:51.439Z
- Transaction Confirmation Time: 2025-03-24T13:23:52.816Z
- Total Time: 1.377 seconds
- Transaction Landing Time: 0.444 seconds

## Normal Swap Performance
- Transaction ID: 2oAkFQfZrajKXgtZocH3W1eMparNs8BhCDs23oQy5QDYFyzkWfrgURavLLTV1xxo7nkQFNeuSa1mJLAsCrx9EvT6
- Transaction Send Time: 2025-03-24T13:23:52.820Z
- Transaction Confirmation Time: 2025-03-24T13:23:54.757Z
- Total Time: 1.937 seconds
- Transaction Landing Time: 0.849 seconds

## Comparison
- Speed Difference: 0.560 seconds
- Nozomi was 1.41x faster than normal RPC
- Landing Time Difference: 0.405 seconds

## Raw Timing Data
```json
{
  "inputToken": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
  "outputToken": "DwEDC3qSZGqUfuWBtdCffzsmkA8uAGdrF1cm32ygpump",
  "amount": 10000000,
  "nozomi": {
    "sendTime": 1742822631439,
    "txid": "52AYWUSqjRQDMzqShPVrQkyNm1UGq157RnTLEx26Zy2XnkVw4yakVTYmpt6GXekjxXVcougHdDb4He1MyJSRnrfV",
    "landingTime": 0.444,
    "confirmTime": 1742822632816,
    "totalTime": 1.377
  },
  "normal": {
    "sendTime": 1742822632820,
    "txid": "2oAkFQfZrajKXgtZocH3W1eMparNs8BhCDs23oQy5QDYFyzkWfrgURavLLTV1xxo7nkQFNeuSa1mJLAsCrx9EvT6",
    "landingTime": 0.849,
    "confirmTime": 1742822634757,
    "totalTime": 1.937
  }
}
```
