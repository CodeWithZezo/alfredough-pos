# Release and Version Management

This document describes how Alfredough POS is versioned, how changes move from a
developer's machine to a released build, and how to recover if a release goes wrong.

- A **version** identifies one state of the software (a commit, labelled `1.2.0`).
- A **release** is a version that has been tested, approved, tagged and delivered.

## 1. Version numbering

The project uses Semantic Versioning: `MAJOR.MINOR.PATCH` (for example `1.4.2`).
The single source of truth is the `version` field in `package.json`.

| Part  | Bump when…                                                                 | Alfredough POS examples |
|-------|-----------------------------------------------------------------------------|-------------------------|
| MAJOR | The change is incompatible: a database migration that can't simply be rolled back, removed features, or changed API responses | Moving from SQLite to MySQL, redesigning the order schema |
| MINOR | A new feature is added and existing data and behaviour keep working       | Adding a staff-login module or a new sales report |
| PATCH | Only bug fixes, small UI corrections or security fixes                       | Fixing a discount calculation or a receipt layout bug |

Pre-release versions add a suffix:

- **Release candidate**: `1.1.0-rc.0`, `1.1.0-rc.1`, … A build believed to be ready that gets final testing.
- **Beta**: `2.0.0-beta.0`. A build shared for wider testing before a major release.

Docs-only or tooling-only changes don't need a version bump.

## 2. Branches

| Branch            | Purpose                                                       |
|-------------------|---------------------------------------------------------------|
| `main`            | Always stable and releasable. Every release tag points here.  |
| `feature/<name>`  | A new feature, e.g. `feature/staff-accounts`. Branch from `main`. |
| `fix/<name>`      | A non-urgent bug fix, e.g. `fix/discount-rounding`.           |
| `hotfix/<name>`   | An urgent fix for a problem in the live system.               |
| `release/<x.y>`   | Optional: stabilises a release while `main` keeps moving.     |

Rules:

1. Nobody commits directly to `main`. Every change arrives through a pull request.
2. A pull request is merged only when CI is green (see section 5) and someone has reviewed it.
3. Keep branches short-lived. Merge or delete them so the branches don't pile up.
4. On a **merge conflict**, merge `main` into your branch, resolve it by hand, re-run the
   checks and push.

## 3. Commits

Write one logical change per commit, with a message that says what the change does and why:

```
fix(orders): apply discount before service charge
feat(reports): add daily revenue export
docs: describe rollback steps
chore(release): v1.1.0
```

Prefixes: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`. A `feat` normally means a MINOR
bump and a `fix` a PATCH bump. A change marked `BREAKING CHANGE:` in the body means a MAJOR bump.

## 4. Release life cycle

1. **Planning**: decide which features and fixes go into the release.
2. **Development**: implement them on feature/fix branches.
3. **Integration**: merge the branches into `main` through pull requests. CI builds every merge.
4. **Testing**: CI runs the type check, lint and production build. Then test manually against
   the checklist below, including **regression testing** of features you didn't change.
5. **Release candidate** (optional for small releases): `npm run release:rc` and push the tag.
   CI publishes it as a *pre-release*. Fix any defects and cut `rc.1`, `rc.2`, … as needed.
6. **Approval**: the maintainer reviews the test results and the changelog.
7. **Packaging and tagging**: bump the version and create the tag (steps below).
8. **Deployment**: deploy the tagged build.
9. **Monitoring**: watch the app after deployment. Check that `GET /api/version` reports the
   expected version and commit, and look for errors in the server logs and complaints from users.

### Cutting a release, step by step

```bash
git checkout main && git pull

# 1. Write the release notes: in CHANGELOG.md, move the items under [Unreleased]
#    into a new "## [x.y.z] - YYYY-MM-DD" section and update the compare links.
git commit -am "docs: changelog for vX.Y.Z"

# 2. Bump package.json, commit and create the vX.Y.Z tag in one step
npm run release:minor      # or release:patch / release:major / release:rc

# 3. Publish the commit and the tag
git push --follow-tags
```

Pushing a `v*` tag runs `.github/workflows/release.yml`. That workflow runs the checks again,
confirms that the tag matches `package.json`, and publishes a GitHub Release whose notes come
from that version's section of `CHANGELOG.md`. Tags with a pre-release suffix (`-rc.N`,
`-beta.N`) are published as pre-releases.

### Hotfix

When a live problem can't wait for the next planned release (for example, orders can't be saved):

1. Branch from the tag that is running in production: `git checkout -b hotfix/<name> vX.Y.Z`.
2. Make the smallest fix that solves the problem, and test it as much as time allows.
3. Open a pull request into `main`, merge it, then `npm run release:patch` → `vX.Y.(Z+1)`.

### Pre-release checklist

- [ ] CI is green on the commit being released.
- [ ] `CHANGELOG.md` has a section for this version: new features, fixes, known issues, and any
      upgrade steps.
- [ ] Database changes are new Prisma migrations. Existing migration files are never edited.
- [ ] Manual smoke test: log in, create an order with a discount, print a receipt, cancel and
      return an order, adjust stock, open reports.
- [ ] Back up the production database file (see Rollback).

## 5. Continuous Integration

`.github/workflows/ci.yml` runs on every push and every pull request:

```
npm ci → prisma generate → typecheck → lint → next build
```

`npm ci` installs exactly the versions in `package-lock.json`, so every machine and every CI run
builds the same software. Always commit `package-lock.json` changes along with `package.json`.

Lint currently runs in report-only mode because of existing ESLint errors (listed under
*Known issues* in the changelog). Make it blocking once those errors are fixed.

## 6. Configuration management

A version is more than its source code. These parts are versioned together in this repository:

| Part                 | Where it lives                                  |
|----------------------|-------------------------------------------------|
| Database schema      | `prisma/schema.prisma` + `prisma/migrations/`   |
| Seed / sample data   | `prisma/seed.ts`, `prisma/setup.sql`            |
| Build configuration  | `next.config.ts`, `prisma.config.ts`, `tsconfig.json` |
| Dependencies         | `package.json` + `package-lock.json`            |

Secrets and environment-specific settings (`DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`)
stay in `.env` and are **never** committed.

## 7. Traceability

Every build records which source it came from:

- The sidebar footer shows `v<version> · <commit>`.
- `GET /api/version` returns `{ "version", "commit", "buildDate" }`.

When someone reports a bug, ask for the version shown in the sidebar, then run
`git checkout v<version>` to reproduce the bug against the exact code that's running.

## 8. Rollback

If a release causes a serious problem, go back to the last good version:

```bash
# 1. Stop the app and restore the database backup taken before the release
cp backups/dev-<date>.db prisma/dev.db        # or restore your MySQL/libSQL dump

# 2. Check out and rebuild the previous release
git checkout vX.Y.Z
npm ci
npm run build && npm start
```

Things to know before releasing:

- **Which version is stable**: the previous `v*` tag, listed on the GitHub Releases page.
- **Database changes**: Prisma migrations only go forward. If the new release added a migration,
  restore the backup instead of running old code against the new schema.
- **Who decides**: the project maintainer decides whether to roll back and records the reason in
  the follow-up release's changelog.

After the rollback, fix the problem on a `hotfix/` branch and release a new PATCH version.
