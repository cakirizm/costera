# COSTERA POS print bridge

The till hardware lives on the restaurant's LAN; the COSTERA server does not.
This small service closes that gap: it runs on the till PC, drains the server's
print queue and pushes the bytes onto the printer and cash drawer.

It holds no business state. If it crashes mid-service, jobs stay queued on the
server and print as soon as it comes back. Nothing is lost, nothing is printed
twice: a job is claimed with a conditional update, so two bridges on the same
till cannot take the same receipt.

## Install

```bash
cd bridge
npm install
cp .env.example .env
```

## Enrol the bridge

In COSTERA: **Dashboard → Integrations → Terminals & print bridge**. Add a
device of kind *Print bridge*. The token is shown **once** — the server keeps
only its SHA-256 digest — so paste it straight into `.env` as
`COSTERA_DEVICE_TOKEN`. Lost a token? Enrol again and revoke the old device.

## Run

```bash
npm start
```

Point `COSTERA_URL` at the server the tills use.

## Keep it running on the till

From an elevated PowerShell, in this folder:

```powershell
.install-task.ps1
```

That registers a Scheduled Task which starts the bridge at logon and restarts it
a minute after any crash. Use `-AtStartup` on a till that runs without anyone
logging in, and `-TaskName` if one machine drives two bridges.

A Scheduled Task rather than a real Windows service on purpose: a Node script is
not a service binary, so a service would mean pulling in a wrapper such as
`nssm`. The task needs nothing extra and survives reboots just as well. If you
already run `nssm` for other things, wrapping `npm start` with it works too.

Managing it afterwards:

```powershell
Get-ScheduledTask -TaskName "COSTERA POS Bridge"
Stop-ScheduledTask -TaskName "COSTERA POS Bridge"
Unregister-ScheduledTask -TaskName "COSTERA POS Bridge" -Confirm:$false
```

The token stays in `.env` and out of the task definition, which is readable by
anyone on the machine.

**Updating is manual for now.** There is no update channel: pull the repo on the
till, `npm install`, then `Stop-ScheduledTask` / `Start-ScheduledTask`. Worth
automating once more than a couple of venues run this.

## Printer transports

| `PRINTER_TRANSPORT` | Use |
|---|---|
| `network` | Raw ESC/POS over TCP, normally port 9100. Set `PRINTER_HOST`. This is the real one. |
| `file`    | Appends the byte stream to `PRINTER_FILE`. For checking a layout without paper. |
| `stdout`  | Prints a readable rendering to the console. For setup and support calls. |

Set `PRINTER_COLUMNS` to match the paper: 32 for 58mm, 42 or 48 for 80mm.

## Cash drawer

The drawer hangs off the printer's RJ11 port. After each receipt the bridge
sends the standard pulse (pin 2, 50/250ms). Turn it off with
`OPEN_DRAWER_ON_RECEIPT=false` on a terminal that has no drawer, such as a bar
station that only prints.

## What it prints

| Job kind | Layout |
|---|---|
| `KITCHEN` | Station name in double height, ticket number and table, then each line in bold with its note. No prices — a cook does not need them. |
| `RECEIPT` | Venue, ticket number and table, every line with its total, discount if any, VAT included, then the total in double width. |

Both end with a paper cut.

> These are information dockets, not fiscal receipts. Legal receipts come from
> the YN ÖKC integration, which lands in this same bridge in a later phase.

## Failures

A print failure is reported back to the server and the job returns to the queue,
up to five attempts, with the printer's error kept against the job. After that
it is marked `FAILED` and stops being picked up, so a jammed printer cannot spew
the same ticket forever. Server outages back off exponentially up to a minute.

## Development

```bash
npm run typecheck          # inside bridge/
npm test                   # from the repo root; covers the ESC/POS layouts
```

The bridge is excluded from the app's TypeScript project (like `mobile/`) and
has its own `tsconfig.json`. Its tests run with the root test suite.
