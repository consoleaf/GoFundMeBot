# GoFundMe alert box (WIP: Currently only the back-end)

**Notice**: this project is not ready for production use.

## Setup
### Install the dependencies
```bash
npm install
```
### Customize the values
- The checking interval (`N` in the code)
- The GoFundMe page (`gofundme_url` in the code)

## Run
```bash
npm run start
```

The app will save the latest found donation to the `lastdono.json` file.
Example:

```json
{"lastDonator":"Anonymous","lastDonation":"$10"}
```