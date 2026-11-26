# AGENTS.md — Plateforme BLUE

Site de l'ONG BLUE (Côte d'Ivoire). Next.js 15 (App Router), React 19, JavaScript
(pas de TypeScript), Tailwind CSS v4, framer-motion, FontAwesome. Interface 100 % en français.

## Commandes (pnpm uniquement)

| Commande | Rôle |
| --- | --- |
| `pnpm install` | Installer les dépendances |
| `pnpm dev` | Serveur de développement (Turbopack) — http://localhost:3000 |
| `pnpm build` | Build de production (+ sitemap via `postbuild`) — **vérification principale** |
| `pnpm start` | Lancer le build de production |
| `pnpm hash:password` | Générer `ADMIN_PASSWORD_HASH` (bcrypt) pour le compte admin |
| `pnpm seed:admin` | Créer le compte admin en base (mode Supabase uniquement, phase 7) |

- `pnpm lint` ne fonctionne pas (ESLint 9 + `.eslintrc.json` hérité) ; le lint est ignoré au build.
- Pas de suite de tests automatisés : vérifier avec `pnpm build`, puis tester les routes
  (`curl`) et les parcours dans le navigateur.

## Configuration minimale (.env.local)

```
DATA_DRIVER=local
AUTH_SECRET=<64 caractères hexadécimaux>
ADMIN_EMAIL=admin@exemple.org
ADMIN_PASSWORD_HASH=<sortie de pnpm hash:password, avec les $ échappés en \$>
GROQ_API_KEY=<clé Groq pour MR BLUE>
```

Piège : Next.js remplace les `$` dans `.env.local` (même entre guillemets). Un hash bcrypt
doit y être écrit avec `\$`. Sur Vercel, coller le hash brut.

## Architecture des données (règle n°1)

- **Tout accès aux données passe par `lib/data/`** (`import { courses, media, … } from "@/lib/data"`).
  Aucun composant ni route n'appelle Supabase ou `fs` directement.
- `DATA_DRIVER=local` (défaut) : JSON dans `data/`, fichiers téléversés dans `public/uploads/`
  (deux dossiers ignorés par git). Écritures atomiques et sérialisées par fichier.
- `DATA_DRIVER=supabase` : squelette (`lib/data/supabase/`) qui lève « Non configuré — phase 7 ».
- L'interface commune est listée dans `lib/data/interface.js` (vérifiée au démarrage en dev).
- Amorçage : `lib/data/seed/*.json` (formations et bénévole du mois issus de `0001_init.sql`),
  `json/data.json` (projets). Utilisé quand le fichier de `data/` est absent.
- Sur Vercel (disque en lecture seule) : lectures = valeurs par défaut, écritures = 503 explicite.
- Les fichiers téléversés sont servis par `app/uploads/[...path]/route.js` (Next ne sert pas
  les fichiers ajoutés à `public/` après le build).
- Migrations SQL futures : `supabase/migrations/0002+` (ne jamais modifier `0001_init.sql`).

## Règles pour toute nouvelle route

- Écriture admin : `requireAdmin()` (`lib/apiAuth.js`) + `logAdminAction({ action, module, target, changes })`
  (`lib/adminLog.server.js`, libellés dans `lib/adminLogConstants.js`).
- Données visiteur : validation zod (`lib/validation.js`) via `parseJson(req, schema)`.
- Envelopper avec `apiHandler()` (`lib/apiHandler.js`) pour des erreurs JSON en français.
- Limites de fichiers partagées client/serveur : `lib/uploadLimits.js`.

## Admin

- Connexion nominative en 2 étapes (`/admin`), session JWT de 8 h (cookie `blue_admin_session`).
- Pages sous `app/admin/(panel)/` avec mise en page commune ; `middleware.js` protège `/admin/:path+`.
- Composants réutilisables : `components/admin/` (MediaPicker, GalleryEditor, LastModified, MoveButtons…).
