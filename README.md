# Luna Prototype

Prototyp av ett enterprise-granssnitt byggt med Next.js + MUI for att validera navigation, tabellfloden och detaljvyer for kontrakt och kontraktsrader.

## Vad projektet innehaller

- Sidomeny med kontextstyrd toppmeny och breadcrumbs
- Kontraktlista med sokfalt, kolumnhantering och valbara tabellrader
- Delad listvy med huvudtabell + kontraktsrader (60/40-layout)
- Kontraktdetalj med flera tabbar
- Kontraktsrad som egen djupare route med egen detaljvy och egna tabbar
- Dynamisk browser-titel baserat pa djupaste breadcrumb + valt bolag

## Teknik

- Next.js (App Router)
- React + TypeScript
- MUI (Material UI)
- SCSS Modules (ingen inline-styling)

## Kom igang

### 1) Installera beroenden

```bash
npm install
```

### 2) Starta utvecklingsserver

```bash
npm run dev
```

Appen kor pa `http://localhost:3000`.

### 3) Bygg for produktion

```bash
npm run build
```

### 4) Starta produktionsbuild lokalt

```bash
npm run start
```

### 5) Kor lint

```bash
npm run lint
```

## Viktiga npm-skript

- `npm run dev` - startar dev-server
- `npm run build` - skapar produktionsbuild
- `npm run start` - kor produktionsserver
- `npm run lint` - kor ESLint pa projektet

## Exempel pa routes

- `/{section}/{menu}` - list-/oversiktsvyer
- `/{section}/{menu}/{contractId}` - kontraktdetalj
- `/{section}/{menu}/{contractId}/{lineItemId}` - kontraktsrad-detalj

Exempel:

- `/marknad/kontraktlista`
- `/marknad/kontraktlista/163311`
- `/marknad/kontraktlista/163311/RAD-1001`

## Projektstruktur (forenkling)

- `app/page.tsx` - huvudlayout, navigation, listvyer och route-baserad rendering
- `app/page.module.scss` - huvuddesign och komponentstilar
- `app/components/contract-tabs/` - tabbinnehall for detaljvyer
- `app/[section]/[menu]/...` - dynamiska route-entrypoints
