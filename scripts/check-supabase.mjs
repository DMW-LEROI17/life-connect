#!/usr/bin/env node
/**
 * Vérifie la configuration Supabase de LIFE CONNECT – HELP ME.
 * Usage : node scripts/check-supabase.mjs
 *
 * Ne modifie rien. N'affiche jamais les clés.
 */

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

function loadEnvFile() {
  const path = resolve(process.cwd(), '.env.local');

  try {
    const content = readFileSync(path, 'utf8');

    for (const line of content.split(/\r?\n/)) {
      const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (!match) continue;

      let value = match[2].trim();

      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }

      if (!process.env[match[1]]) process.env[match[1]] = value;
    }
  } catch {
    console.error(
      '❌ Fichier .env.local introuvable. Copie .env.example vers .env.local puis remplis-le.',
    );
    process.exit(1);
  }
}

function ok(message) {
  console.log(`✅ ${message}`);
}

function fail(message) {
  console.log(`❌ ${message}`);
}

function warn(message) {
  console.log(`⚠️  ${message}`);
}

loadEnvFile();

const url = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\/$/, '');
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const appUrl = process.env.NEXT_PUBLIC_APP_URL || '';
const adminPassword = process.env.ADMIN_PASSWORD || '';
const authSecret = process.env.AUTH_SECRET || '';

console.log('\n=== LIFE CONNECT – vérification Supabase ===\n');

let errors = 0;

if (!url) {
  fail('NEXT_PUBLIC_SUPABASE_URL est vide.');
  errors++;
} else if (!/^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(url)) {
  warn(
    `NEXT_PUBLIC_SUPABASE_URL ne ressemble pas à une URL Supabase standard : ${url}`,
  );
} else {
  ok(`URL Supabase : ${url}`);
}

if (!key) {
  fail('SUPABASE_SERVICE_ROLE_KEY est vide.');
  errors++;
} else if (key.length < 20) {
  fail('SUPABASE_SERVICE_ROLE_KEY semble trop courte.');
  errors++;
} else {
  ok('Clé service_role / secret présente.');
}

if (!appUrl || !/^https?:\/\//.test(appUrl)) {
  warn('NEXT_PUBLIC_APP_URL est vide ou invalide.');
} else {
  ok(`URL de l’application : ${appUrl}`);
}

if (!adminPassword || adminPassword.length < 8) {
  fail('ADMIN_PASSWORD doit contenir au moins 8 caractères.');
  errors++;
} else {
  ok('Mot de passe administrateur défini.');
}

if (!authSecret || authSecret.length < 32) {
  fail('AUTH_SECRET doit contenir au moins 32 caractères.');
  errors++;
} else {
  ok('AUTH_SECRET défini et assez long.');
}

if (errors > 0) {
  console.log(`\n${errors} problème(s) de configuration à corriger.\n`);
  process.exit(1);
}

const headers = {
  apikey: key,
  Authorization: `Bearer ${key}`,
  'Content-Type': 'application/json',
};

async function check(path, options = {}) {
  try {
    const response = await fetch(`${url}${path}`, {
      ...options,
      headers: { ...headers, ...(options.headers || {}) },
      signal: AbortSignal.timeout(15000),
    });

    return { response, body: await response.text() };
  } catch (error) {
    return { response: null, error };
  }
}

console.log('\n--- Connexion à Supabase ---');

const stats = await check('/rest/v1/rpc/admin_stats', {
  method: 'POST',
  body: '{}',
});

if (!stats.response) {
  fail(
    'Impossible de joindre Supabase. Vérifie l’URL, la connexion internet et que le projet n’est pas en pause.',
  );
  process.exit(1);
}

if (stats.response.status === 404) {
  fail(
    'La fonction admin_stats est introuvable. Exécute supabase/02_functions.sql, puis : notify pgrst, \'reload schema\';',
  );
  process.exit(1);
}

if (stats.response.status === 401 || stats.response.status === 403) {
  fail('Clé Supabase refusée. Utilise la clé service_role ou Secret key.');
  process.exit(1);
}

if (!stats.response.ok) {
  fail(`Réponse inattendue de Supabase (${stats.response.status}).`);
  console.log(stats.body.slice(0, 300));
  process.exit(1);
}

ok('Connexion Supabase et fonction admin_stats opérationnelles.');

const regions = await check('/rest/v1/regions?select=id,nom&limit=20');

if (regions.response?.status === 404) {
  fail(
    'La table regions est introuvable. Exécutez les scripts V2 (05 à 10) ou supabase/V2_ALL.sql.',
  );
  process.exit(1);
}

if (regions.response?.ok) {
  try {
    const rows = JSON.parse(regions.body);
    if (rows.length < 10) {
      fail(`Seulement ${rows.length} région(s) trouvée(s). Le seed 08 est incomplet.`);
      process.exit(1);
    }
    ok(`${rows.length} régions chargées.`);
  } catch {
    warn('Nombre de régions illisible.');
  }
}

const categories = await check('/rest/v1/categories?select=id&limit=1');

if (categories.response?.status === 404) {
  fail('La table categories est introuvable. Exécutez le script 05 puis 09.');
  process.exit(1);
}

ok('Catalogue categories accessible.');

const guides = await check('/rest/v1/emergency_guides?select=slug&limit=20');

if (guides.response?.status === 404) {
  fail('La table emergency_guides est introuvable. Exécutez le script 05 puis 10.');
  process.exit(1);
}

if (guides.response?.ok) {
  try {
    const rows = JSON.parse(guides.body);
    ok(`${rows.length} fiche(s) d’urgence chargée(s).`);
  } catch {
    warn('Fiches d’urgence illisibles.');
  }
}

const providerFunction = await check('/rest/v1/rpc/providers_for_request', {
  method: 'POST',
  body: JSON.stringify({
    p_request_id: '00000000-0000-4000-8000-000000000000',
  }),
});

if (providerFunction.response?.status === 404) {
  fail(
    'La fonction providers_for_request est introuvable. Exécutez le script 06.',
  );
  process.exit(1);
}

ok('Fonction providers_for_request accessible.');

const statsRegion = await check('/rest/v1/rpc/admin_stats_by_region', {
  method: 'POST',
  body: '{}',
});

if (statsRegion.response?.status === 404) {
  fail('La fonction admin_stats_by_region est introuvable. Exécutez le script 06.');
  process.exit(1);
}

ok('Statistiques par région accessibles.');

const profiles = await check('/rest/v1/profiles?select=id&limit=1');

if (profiles.response?.status === 404) {
  fail(
    'La table profiles est introuvable. Exécutez supabase/11_v3_accounts_posts.sql ou V3_ALL.sql.',
  );
  process.exit(1);
}

ok('Table profiles accessible.');

const posts = await check('/rest/v1/posts?select=id&limit=1');

if (posts.response?.status === 404) {
  fail(
    'La table posts est introuvable. Exécutez supabase/11_v3_accounts_posts.sql.',
  );
  process.exit(1);
}

ok('Table posts accessible.');

const proposalTable = await check('/rest/v1/proposals?select=id&limit=1');

if (proposalTable.response?.status === 404) {
  fail(
    'La table proposals est introuvable. Exécutez supabase/11_v3_accounts_posts.sql.',
  );
  process.exit(1);
}

ok('Table proposals accessible.');

if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  fail(
    'NEXT_PUBLIC_SUPABASE_ANON_KEY est manquante : les comptes et la connexion ne fonctionneront pas.',
  );
  process.exit(1);
}

ok('Clé anon présente (comptes et sessions).');

const conversations = await check('/rest/v1/conversations?select=id&limit=1');

if (conversations.response?.status === 404) {
  fail(
    'La table conversations est introuvable. Exécutez supabase/12_v4_chat_tracking_wallet.sql ou V4_ALL.sql.',
  );
  process.exit(1);
}

ok('Table conversations accessible.');

const messagesTable = await check('/rest/v1/messages?select=id&limit=1');

if (messagesTable.response?.status === 404) {
  fail('La table messages est introuvable. Exécutez la migration V4.');
  process.exit(1);
}

ok('Table messages accessible.');

const wallets = await check('/rest/v1/wallets?select=user_id&limit=1');

if (wallets.response?.status === 404) {
  fail('La table wallets est introuvable. Exécutez la migration V4.');
  process.exit(1);
}

ok('Table wallets accessible.');

const notifications = await check('/rest/v1/notifications?select=id&limit=1');

if (notifications.response?.status === 404) {
  fail('La table notifications est introuvable. Exécutez la migration V4.');
  process.exit(1);
}

ok('Table notifications accessible.');

const trackingRpc = await check('/rest/v1/rpc/get_request_tracking', {
  method: 'POST',
  body: JSON.stringify({
    p_token: '00000000-0000-4000-8000-000000000000',
  }),
});

if (trackingRpc.response?.status === 404) {
  fail(
    'La fonction get_request_tracking est introuvable. Exécutez la migration V4.',
  );
  process.exit(1);
}

ok('Suivi GPS accessible.');

const chatBucket = await check('/storage/v1/bucket/chat');

if (chatBucket.response?.status === 404) {
  fail('Le bucket chat est introuvable. Exécutez la migration V4.');
  process.exit(1);
}

ok('Bucket chat présent.');




const publicView = await check('/rest/v1/providers_public?select=id&limit=1');

if (publicView.response?.status === 404) {
  fail(
    'La vue providers_public est introuvable. Exécute supabase/01_schema.sql.',
  );
  process.exit(1);
}

ok('Vue publique providers_public accessible.');

const bucket = await check('/storage/v1/bucket/providers');

if (bucket.response?.status === 404) {
  fail(
    'Le bucket Storage « providers » est introuvable. Crée-le (public, 2 Mo max).',
  );
  process.exit(1);
}

if (bucket.response?.ok) {
  try {
    const data = JSON.parse(bucket.body);
    if (data.public === false) {
      fail('Le bucket « providers » n’est pas public.');
      process.exit(1);
    }
    ok('Bucket « providers » présent et public.');
  } catch {
    warn('Bucket « providers » présent, mais sa configuration n’a pas pu être lue.');
  }
} else {
  warn(`Vérification du bucket impossible (${bucket.response?.status}).`);
}

const demo = await check('/rest/v1/providers?select=id&est_demo=eq.true');

if (demo.response?.ok) {
  try {
    const rows = JSON.parse(demo.body);
    ok(`Données de démonstration : ${rows.length} prestataire(s) DÉMO.`);
  } catch {
    warn('Nombre de prestataires de démonstration illisible.');
  }
}

const requests = await check('/rest/v1/requests?select=id&limit=1');

if (requests.response?.status === 404) {
  fail('La table requests est introuvable. Exécute supabase/01_schema.sql.');
  process.exit(1);
}

ok('Table requests accessible.');

console.log('\n=== Configuration Supabase valide ===');
console.log('Tu peux lancer : npm run dev\n');
