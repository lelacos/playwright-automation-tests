# Playwright Automation Tests

Test Automation Suite della sezione Account con Playwright e TypeScript.

## Scenari coperti

- registrazione player
- registrazione organizer
- email già esistente
- display name già esistente
- password troppo corta
- login player
- login organizer
- login con credenziali errate
- logout
- persistenza sessione dopo refresh

## Prerequisiti

- Node.js installato
- TennisMatch up and running


## Installazione

```powershell
npm install
npx playwright install chromium
```

## Esecuzione

```powershell
npm test
```

