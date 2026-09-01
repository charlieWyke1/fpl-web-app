# Safe public upload instructions

Overview
- Goal: Make the codebase public while keeping server/database files and secrets private.

What is protected
- Files: server configs, database dumps, private keys, `.env` files.
- Secrets: API keys, DB credentials, SSH/private keys, service-account credentials.

What I added
- `.gitignore`: excludes server, db, env files, keys, and build artifacts.
- `.env.example`: placeholders so users know required env vars.
- `.
pre-commit-config.yaml`: optional pre-commit hooks to detect secrets locally.

Will my local copy still work?
- Yes. Your local files remain unchanged. Keep your real `.env` and server files on your laptop — do not commit them. To run locally, copy `.env.example` to `.env` and fill values:

```bash
cp .env.example .env
# edit .env with your secrets
```

Preparing the repo for public push
- Stage and commit the new helper files, then push to GitHub.

```bash
git add .gitignore .env.example README.md .pre-commit-config.yaml
git commit -m "Prepare repository for safe public publishing"
git push origin main
```

If you already committed sensitive files
- Remove them from the index and commit:

```bash
git rm --cached path/to/sensitive.file
git commit -m "Remove sensitive file"
git push origin main
```

- To purge sensitive data from history (disruptive): use `git filter-repo` or the BFG Repo-Cleaner and force-push. Coordinate with collaborators before rewriting history.

CI / Deployment
- Store production secrets in your CI/CD or secret manager (GitHub Actions Secrets, AWS Secrets Manager, Vault). Never store secrets in the repo.

Prevention and scanning
- Install `pre-commit` and run `pre-commit install` to enable local checks. Consider adding `detect-secrets` and enabling GitHub secret scanning.

Next steps I can do for you
- Install and configure `pre-commit` hooks and the `detect-secrets` baseline.
- Scan the repo for existing leaks and optionally remove them from history.
