# Petebit (PBIT)

A simple, secure fungible token built on the Stacks blockchain with Clarity and Clarinet.

## Overview

Petebit is a fungible token designed for experiments and community use. This repository contains a Clarinet project with a single smart contract implementing core FT functionality: mint, burn, transfer, and metadata getters.

## Token Details

- Name: Petebit
- Symbol: PBIT
- Decimals: 6
- Standard: Minimal FT (Clarity)

## Prerequisites

- Clarinet CLI (3.x)
- Node.js and npm (recommended for developer tooling)
- Git

Install Clarinet if needed:
```bash
npm install -g @hirosystems/clarinet
```

## Project Structure

- `Clarinet.toml` — Project configuration and contract registration
- `contracts/petebit.clar` — Petebit token smart contract
- `settings/` — Clarinet settings
- `tests/` — Place tests here (optional)

## Common Commands

```bash
# Validate contracts
clarinet check

# Start an interactive console
clarinet console

# Run tests (if present)
clarinet test
```

## Contract Interface

Read-only
- `(get-name) -> (string-utf8 32)`
- `(get-symbol) -> (string-utf8 10)`
- `(get-decimals) -> uint`
- `(get-total-supply) -> uint`
- `(get-balance-of (who principal)) -> uint`
- `(get-token-uri) -> (optional (string-utf8 256))`

Public
- `(mint (amount uint) (recipient principal)) -> (response bool uint)`
- `(burn (amount uint) (owner principal)) -> (response bool uint)`
- `(transfer (amount uint) (sender principal) (recipient principal)) -> (response bool uint)`
- `(set-token-uri (value (optional (string-utf8 256)))) -> (response bool uint)`
- `(transfer-ownership (new-owner principal)) -> (response bool uint)`

Notes
- The deployer becomes the initial `token-owner` and is the only address allowed to call `mint`, `set-token-uri`, and `transfer-ownership`.

## Usage Examples (Clarinet console)

```clarity
;; Mint 1,000,000 micro-PBIT (i.e., 1 PBIT with 6 decimals) to an address
(contract-call? .petebit mint u1000000 'SP2C2...ABC)

;; Transfer 0.5 PBIT (500,000 micro) from the sender to a recipient
(contract-call? .petebit transfer u500000 tx-sender 'SP3F4...XYZ)

;; Read a balance
(contract-call? .petebit get-balance-of 'SP2C2...ABC)
```

## Security

- Only the `token-owner` may mint or change token metadata.
- Transfers require the `sender` to be the transaction sender.
- Arithmetic is safe by default in Clarity; underflows/overflows abort execution.

## License

MIT
