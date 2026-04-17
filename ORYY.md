# Orryy Customization Notes

This branch (`oryy`) contains branding customizations on top of the Safe Wallet monorepo (forked from `safe-global/safe-wallet-monorepo` via `flrfinance/safe-wallet-monorepo`).

## Changed Files (10 total)

### Theme Colors (Safe green → Orryy purple/violet)

- `packages/theme/src/palettes/light.ts` — primary: `#5B2FD4`, secondary/CTA: `#E85D3A` coral
- `packages/theme/src/palettes/dark.ts` — primary: `#B49AFF`, secondary kept white, background tints purple
- `packages/theme/src/palettes/static.ts` — textBrand: `#5B2FD4`
- `apps/web/src/styles/vars.css` — **generated file**, regenerate after palette changes: `cd apps/web && yarn css-vars`
- `apps/web/src/styles/shadcn.css` — primary colors updated for shadcn/ui components

### Branding (logo, welcome page text)

- `apps/web/src/components/common/Header/index.tsx` — shows BRAND_LOGO on mobile + desktop for non-official hosts
- `apps/web/src/components/common/Header/styles.module.css` — `filter: invert(1)` for img logos in dark mode
- `apps/web/src/components/welcome/NewSafe.tsx` — uses BRAND_LOGO instead of Safe Labs logo, updated tagline
- `apps/web/src/components/welcome/WelcomeLogin/index.tsx` — removed "Safe" from account description text
- `apps/web/src/components/welcome/styles.module.css` — purple gradient on welcome right panel

## Environment Variables (set in Vercel + .env.local)

```
NEXT_PUBLIC_GATEWAY_URL_PRODUCTION=https://oryy-cgw.fly.dev
NEXT_PUBLIC_GATEWAY_URL_STAGING=https://oryy-cgw.fly.dev
NEXT_PUBLIC_IS_PRODUCTION=true          # false for local dev
NEXT_PUBLIC_DEFAULT_TESTNET_CHAIN_ID=14
NEXT_PUBLIC_DEFAULT_MAINNET_CHAIN_ID=14
NEXT_PUBLIC_BRAND_LOGO=/logo.svg
NEXT_PUBLIC_BRAND_NAME=Orryy
NEXT_PUBLIC_WC_PROJECT_ID=96798ffb45bccf5256bc577da4e96b07
NEXT_PUBLIC_INFURA_TOKEN=placeholder
NEXT_PUBLIC_IS_OFFICIAL_HOST=false
ENABLE_EXPERIMENTAL_COREPACK=1          # Vercel only — enables Yarn 4
```

## Backend (Fly.io)

All services deployed in `fra` region:

| Service             | App Name         | Image                                        | Notes                              |
| ------------------- | ---------------- | -------------------------------------------- | ---------------------------------- |
| Config Service      | `oryy-cfg`       | `safeglobal/safe-config-service:latest`      | Django admin at `/cfg/admin/`      |
| Client Gateway      | `oryy-cgw`       | `safeglobal/safe-client-gateway-nest:latest` | Set `CGW_ENV=development` for CORS |
| Transaction Service | `oryy-txs-flare` | `safeglobal/safe-transaction-service:latest` | One per chain                      |
| PostgreSQL          | `oryy-postgres`  | Fly Postgres                                 | Shared by all services             |
| Redis               | `fly-oryy-redis` | Upstash on Fly                               | Private endpoint, IPv6             |
| RabbitMQ            | `oryy-rabbitmq`  | `rabbitmq:3-management`                      | For TX service workers             |

### Key Fly.io gotchas

- CGW uses `REDIS_PASS` (not `REDIS_PASSWORD`) and `REDIS_USER=default`
- CGW needs `POSTGRES_SSL_ENABLED=false` for internal Fly Postgres
- CGW needs `CGW_ENV=development` for CORS to work
- Config Service uses `[[statics]]` in fly.toml for serving Django static files (no Nginx in image)
- Config Service v2 chains endpoint: features must be linked to WALLET_WEB **service** in `chains_feature_services` table, not just to the chain

### Adding features to a chain via raw SQL

```bash
fly ssh console -a oryy-cfg -C "python /app/src/manage.py shell -c \"
from django.db import connection
cursor = connection.cursor()
# Create feature
cursor.execute(\\\"INSERT INTO chains_feature (key, description, scope) VALUES (%s, '', '') ON CONFLICT (key) DO NOTHING\\\", ['FEATURE_NAME'])
# Get feature ID
cursor.execute(\\\"SELECT id FROM chains_feature WHERE key = %s\\\", ['FEATURE_NAME'])
fid = cursor.fetchone()[0]
# Link to chain
cursor.execute(\\\"INSERT INTO chains_feature_chains (feature_id, chain_id) VALUES (%s, '14') ON CONFLICT DO NOTHING\\\", [fid])
# Link to WALLET_WEB service (id=1) — REQUIRED for v2 endpoint
cursor.execute(\\\"INSERT INTO chains_feature_services (feature_id, service_id) VALUES (%s, 1) ON CONFLICT DO NOTHING\\\", [fid])
\""
# Then restart CGW to clear cache:
fly apps restart oryy-cgw
```

### Flare chain (ID 14) contract addresses (Safe v1.4.1)

- safeSingletonAddress: `0x41675C099F32341bf84BFc5382aF534df5C7461a`
- safeProxyFactoryAddress: `0x4e1DCf7AD4e460CfD30791CCC4F9c8a4f820ec67`
- multiSendAddress: `0x38869bf66a61cF6bDB996A6aE40D5853Fd43B526`
- multiSendCallOnlyAddress: `0x9641d764fc13c8B624c04430C7356C1C7C8102e2`
- fallbackHandlerAddress: `0xfd0732Dc9E303f09fCEf3a7388Ad10A83459Ec99`
- signMessageLibAddress: `0xd53cd0aB83D845Ac265BE939c57F53AD838012c9`
- createCallAddress: `0x9b35Af71d77eaf8d7e40252370304687390A1A52`
- simulateTxAccessorAddress: `0x3d4BA2E0884aa488718476ca2FB8Efc291A46199`

## Updating from Upstream

```bash
# Add upstream remote (one-time)
git remote add upstream https://github.com/safe-global/safe-wallet-monorepo.git

# Sync dev branch
git checkout dev
git fetch upstream
git merge upstream/main  # or upstream/dev depending on their branch structure

# Rebase oryy on top
git checkout oryy
git rebase dev

# Regenerate vars.css if palette files conflicted
cd apps/web && yarn css-vars

# Push
git push origin dev
git push origin oryy --force-with-lease
```

## Potential Merge Conflicts

Most likely conflicts during upstream updates:

1. `packages/theme/src/palettes/light.ts` — if Safe changes color values
2. `packages/theme/src/palettes/dark.ts` — same
3. `apps/web/src/components/welcome/NewSafe.tsx` — if welcome page is redesigned
4. `apps/web/src/styles/vars.css` — always regenerate, never merge manually

Resolution: keep our color values, accept their structural changes, then regenerate vars.css.
