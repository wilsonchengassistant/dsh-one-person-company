# Architecture

Four diagrams, in one file. They are **text**, on purpose: they diff in git,
GitHub renders them, and an agent can read the whole thing in about 90 lines
instead of reading the repository.

The point is that a human can answer *"did the system change shape?"* in 30
seconds. Prose and ADRs cannot give you that.

| Section | Answers |
|---|---|
| [System](#system) | What are the moving parts, and what talks to what? |
| [Backend](#backend) | What is the request path, and which module owns each step? |
| [Frontend](#frontend) | What screens exist, and which endpoint does each call? |
| [Data](#data) | What are the tables, and how are they joined? |

## The rules

1. **A diagram that does not match the code is worse than no diagram.** When a
   task adds or removes a component, a table, a route or a third party, the same
   task updates this file. It is part of the definition of done.
2. **These are not auto-generated.** Anything derived from code goes stale the
   moment the code changes and nobody notices. They are owned artefacts: the
   `architect` role writes them, the `reviewer` role checks them against the
   diff.
3. **One diagram per question.** If `## System` needs a legend to be read, it is
   two diagrams.
4. **Name the real things.** The names here are the names in the code and in the
   ADRs. `api`, not "The Application Layer".

## Reviewing a change

Open `## System`. Ask: did this change add a box, remove a box, or add an
arrow? If yes, this file had to change in the same commit. If it did not change
and the system's shape did, the change is not done.

## System

```mermaid
%% What the moving parts are and what talks to what. Keep this to the containers
%% a person would draw on a whiteboard; anything smaller belongs under Backend.
flowchart LR
  user([User])

  subgraph client["Clients"]
    web["<b>web</b><br/>Next.js on Vercel"]
    mobile["<b>mobile</b><br/>Expo / React Native"]
  end

  subgraph server["Our server"]
    api["<b>api</b><br/>the only public entry point"]
    worker["<b>worker</b><br/>background jobs"]
    db[("<b>postgres</b><br/>data + queue")]
    storage[("<b>object store</b><br/>private files")]
  end

  subgraph third["Third parties"]
    billing["Stripe"]
    mail["Email"]
  end

  user --> web
  user --> mobile
  web --> api
  mobile --> api
  api --> db
  api --> storage
  api --> worker
  worker --> db
  worker --> storage
  api --> billing
  worker --> mail

  classDef ours fill:#eef6ff,stroke:#3b82f6,color:#0b3b6f
  classDef data fill:#f4f4f5,stroke:#71717a,color:#27272a
  class api,worker,web,mobile ours
  class db,storage data
```

## Backend

```mermaid
%% The request path and which module owns each step. Every box here is a
%% directory or a named module in the repository.
flowchart TD
  req([HTTP request])
  auth{authenticated, scoped to owner?}
  validate["input validation<br/>(schema at the boundary)"]
  handler["<b>module handler</b><br/>one module per resource"]
  usecase["use case<br/>the business rule, no I/O"]
  repo["repository<br/>the only place with SQL"]
  queue["enqueue a job<br/>(if the work is slow or external)"]
  resp([response])

  req --> auth
  auth -- rejected --> reject([401 / 404])
  auth --> validate
  validate -- invalid --> badreq([400])
  validate --> handler
  handler --> usecase
  usecase --> repo
  usecase --> queue
  repo --> resp
  queue --> resp
```

What this shape enforces: authorisation is checked once at the boundary, not
sprinkled through handlers; a repository is the only thing that writes SQL;
anything slow or third-party becomes a job rather than an inline await.

## Frontend

```mermaid
%% The screens and which endpoint each one calls. One box per route; if a screen
%% calls more than two endpoints it is two screens.
flowchart LR
  subgraph routes["Routes"]
    home["/ (landing)"]
    app["/app (the product)"]
    settings["/app/settings"]
  end

  subgraph components["Shared components"]
    shell["app shell"]
    table["data table"]
    form["form primitives"]
  end

  subgraph endpoints["API"]
    e_list["GET /api/…"]
    e_write["POST /api/…"]
    e_export["GET /api/export/…"]
  end

  home --> e_list
  app --> shell
  shell --> table
  table --> e_list
  app --> form
  form --> e_write
  settings --> e_export
```

What this shape enforces: every screen is assembled from shared components;
naming the endpoints per screen gives a backend change a visible blast radius.

## Data

```mermaid
%% The tables and how they are joined. Name the columns that matter: the owner
%% column, the money column, the time column.
erDiagram
  USER ||--o{ PROJECT : owns
  PROJECT ||--o{ ITEM : contains
  ITEM ||--o{ EVENT : "audited by"

  USER {
    uuid id PK
    text email
    timestamptz created_at
  }
  PROJECT {
    uuid id PK
    uuid user_id FK
    text name
    timestamptz created_at
  }
  ITEM {
    uuid id PK
    uuid project_id FK
    int amount_cents
    text currency
    timestamptz occurred_at
  }
  EVENT {
    uuid id PK
    uuid item_id FK
    text kind
    timestamptz at
  }
```

What this shape enforces: every table has an owner column and row-level
security filters on it; money is integer minor units plus a currency, never a
float; anything a customer can lose has an audit table.
