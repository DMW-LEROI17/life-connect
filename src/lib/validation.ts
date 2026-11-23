import { z } from 'zod';

import { normalizeCmPhone } from '@/lib/phone';

export const createRequestSchema = z.object({
  categorie: z
    .string({ required_error: 'Choisissez une catégorie.' })
    .trim()
    .min(2, 'Choisissez une catégorie.')
    .max(80),
  sous_categorie_id: z.number().int().positive().nullable().optional(),
  probleme: z
    .string({ required_error: 'Choisissez un problème.' })
    .trim()
    .min(2, 'Choisissez un problème.')
    .max(160, 'Le problème est trop long.'),
  description: z
    .string()
    .trim()
    .max(600, 'La description ne doit pas dépasser 600 caractères.')
    .optional()
    .default(''),
  tel_client: z
    .string({ required_error: 'Entrez votre numéro.' })
    .trim()
    .min(1, 'Entrez votre numéro.')
    .refine(
      (value) => normalizeCmPhone(value) !== null,
      'Numéro camerounais invalide (ex. 6 72 11 55 70).',
    ),
  region_id: z.number().int().positive().nullable().optional(),
  departement_id: z.number().int().positive().nullable().optional(),
  arrondissement_id: z.number().int().positive().nullable().optional(),
  quartier_id: z.number().int().positive().nullable().optional(),
  quartier: z
    .string()
    .trim()
    .max(80, 'Le quartier est trop long.')
    .optional()
    .default(''),
  latitude: z.number().min(-90).max(90).nullable().optional(),
  longitude: z.number().min(-180).max(180).nullable().optional(),
  site_web: z.string().max(0, 'Requête invalide.').optional().default(''),
});

export const providerSchema = z.object({
  nom: z
    .string({ required_error: 'Entrez votre nom.' })
    .trim()
    .min(2, 'Entrez votre nom.')
    .max(80, 'Le nom est trop long.'),
  specialite: z
    .string()
    .trim()
    .max(80, 'La spécialité est trop longue.')
    .optional()
    .default(''),
  whatsapp: z
    .string({ required_error: 'Entrez votre numéro WhatsApp.' })
    .trim()
    .min(1, 'Entrez votre numéro WhatsApp.')
    .refine(
      (value) => normalizeCmPhone(value) !== null,
      'Numéro camerounais invalide (ex. 6 72 11 55 70).',
    ),
  site_web: z.string().max(0, 'Requête invalide.').optional().default(''),
});

export const ratingSchema = z.object({
  etoiles: z.coerce
    .number()
    .int()
    .min(1, 'Choisissez une note de 1 à 5 étoiles.')
    .max(5),
  resolu: z.enum(['oui', 'non'], {
    errorMap: () => ({ message: 'Indiquez si le problème est résolu.' }),
  }),
  commentaire: z
    .string()
    .trim()
    .max(500, 'Le commentaire ne doit pas dépasser 500 caractères.')
    .optional()
    .default(''),
});

export function firstZodError(error: z.ZodError): string {
  return error.issues[0]?.message ?? 'Données invalides.';
}
