# Production Deployment Guide

This Phase 1 setup is designed for a low-cost VPS such as DigitalOcean, Hetzner, or a small AWS EC2 instance.

## Recommended structure

```text
/opt/ai-receptionist/
  backend/
  frontend/
  deployment/
  backups/
```

## Practical architecture

```text
Internet
  -> Nginx
  -> Frontend (Next.js on 3001)
  -> Backend (NestJS on 4000)
  -> PostgreSQL
```

## First-time VPS setup

1. Install Node.js 20, `pnpm`, PostgreSQL, and Nginx.
2. Copy the repo to `/opt/ai-receptionist`.
3. Create `backend/.env.production` and `frontend/.env.production`.
4. Build both apps with `deployment/scripts/deploy-vps.sh`.
5. Run the apps with PM2 or Docker.
6. Copy `deployment/nginx/ai-receptionist.conf` into `/etc/nginx/sites-available/`.
7. Symlink it into `sites-enabled`.
8. Issue certificates with Certbot.

## HTTPS setup

```bash
sudo certbot --nginx -d app.example.com -d api.example.com
```

## Docker workflow

Development:

```bash
docker compose up --build
```

Optional Redis and pgAdmin:

```bash
docker compose --profile optional up --build
```

Production-style image builds:

```bash
docker build -f backend/Dockerfile --target production -t ai-receptionist-backend ./backend
docker build -f frontend/Dockerfile --target production -t ai-receptionist-frontend ./frontend
```

## PM2 workflow

```bash
cd /opt/ai-receptionist
pm2 start deployment/pm2/ecosystem.config.js
pm2 save
pm2 startup
```

## Rollback strategy

1. Keep the previous Git commit tagged before each deploy.
2. Keep the previous `backups/postgres/*.sql` dump.
3. Keep the previous `backups/uploads/*.tar.gz` archive.
4. Roll back code with Git, restore the database dump if needed, then restart PM2 or Docker.

## Backups

PostgreSQL:

```bash
DATABASE_URL='postgresql://...' sh deployment/scripts/backup-postgres.sh
```

Uploads:

```bash
sh deployment/scripts/backup-uploads.sh
```

## Future microservice boundaries

- `auth-service`: users, auth, tokens, access policy
- `crm-service`: businesses, clients, services
- `communication-service`: calls, messages, providers, webhooks
- `ai-service`: Gemini, Deepgram, summaries, replies, STT/TTS
- `automation-service`: automations, retries, scheduling
- `reporting-service`: analytics, exports, report history

## Future queue strategy

Recommended next step:

- Redis + BullMQ

Likely first async jobs:

- `ai.summary.generate`
- `communication.whatsapp.send`
- `communication.transcript.process`
- `automation.reminder.execute`
- `report.pdf.generate`
