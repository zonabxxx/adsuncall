# AdsUncall Mobile App

Mobilná aplikácia pre správu hovorov a klientov.

## Funkcie

- Autentifikácia používateľov (prihlásenie/registrácia)
- Správa klientov
- Správa hovorov a telefonátov
- Prehľad a štatistiky

## Technológie

- React Native / Expo
- React Navigation
- Axios pre API volania
- AsyncStorage pre lokálne úložisko

## Inštalácia

1. Nainštalujte závislosti:

```bash
npm install
```

2. Spustite aplikáciu:

```bash
npm start
```

## Štruktúra projektu

```
/assets            - Statické súbory a obrázky
/src
  /api             - API volania a integrácia
  /components      - Znovupoužiteľné komponenty
  /context         - React Context API pre správu stavu
  /navigation      - Navigačná konfigurácia
  /screens         - Obrazovky aplikácie
  /utils           - Pomocné funkcie a nástroje
```

## API Pripojenie

Aplikácia predpokladá, že backend API beží na adrese špecifikovanej v `src/api/api.js`. Pred spustením nastavte správnu URL adresu pre pripojenie k vášmu backend serveru.

## Vývojový tím

- Peter Polák - Hlavný vývojár 