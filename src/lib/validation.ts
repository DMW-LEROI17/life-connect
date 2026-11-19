import { z } from 'zod';

import { CATEGORY_SLUGS } from '@/lib/constants';
import { normalizeCmPhone } from '@/lib/phone';

const categorieSchema = z.enum(CATEGORY_SLUGS, {
  errorMap: () => ({ message: 'Catégorie invalide.' }),
});

export const createRequestSchema = z.object({
  categorie: categorieSchema,
  probleme: z
    .string({ required_error: 'Choisissez un problème.' })
    .trim()
    .min(3, 'Choisissez un problème.')
    .max(120, 'Le problème est trop long.'),
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
  quartier: z
    .string({ required_error: 'Indiquez votre quartier.' })
    .trim()
    .min(2, 'Indiquez votre quartier.')
    .max(60, 'Le quartier est trop long.'),
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
  metier: categorieSchema,
  specialite: z
    .string()
    .trim()
    .max(60, 'La spécialité est trop longue.')
    .optional()
    .default(''),
  quartier: z
    .string({ required_error: 'Indiquez votre quartier.' })
    .trim()
    .min(2, 'Indiquez votre quartier.')
    .max(60, 'Le quartier est trop long.'),
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
