# Design

Mockups live here, one file per screen. They are **static HTML** with no build
step and no framework: open one in a browser and you are looking at the product
as it is meant to be, before any application code exists.

| Path | What it is |
|---|---|
| `design/tokens.css` | the token set — colour, type scale, spacing, radius, motion |
| `design/screens/_template.html` | the mockup skeleton to copy |
| `design/screens/<name>.html` | one screen, static and self-contained |

## The rule

**No engineer starts a UI task until its mockup exists and has been approved.**

A task that touches a UI path declares which mockup it builds:

```yaml
design: design/screens/ledger.html
```

`opc doctor` fails a UI task with no `design:`, or one pointing at a file that
does not exist. That is the whole enforcement: the gate is a file that has to be
there, not a promise in a prompt.

## What a mockup has to contain

1. **The real content**, not Lorem ipsum — use the words the spec uses.
2. **All four states**: empty, loading, error, success. A screen that only shows
   the happy path is a screen that will ship without the other three.
3. **The tokens**, not ad-hoc values: no raw hex, no magic pixel numbers. If a
   value is missing, add it to `tokens.css` first.
4. **The primary action** visible, and what happens after it.

## From mockup to implementation

The engineer builds the mockup, not a reinterpretation of it. If the mockup turns
out to be wrong once the real data arrives, the **mockup** is updated first, then
the code — otherwise the next task builds on a picture nobody has agreed to.

## Reviewing a mockup

Open it in a browser. Ask: would I understand this screen with no explanation?
Is every state here? Is the primary action obvious? If the answer needs a
sentence of apology, the mockup is not done.
