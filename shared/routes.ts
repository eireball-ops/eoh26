import { z } from 'zod';
import { insertContestantSchema, insertDisciplineSchema, insertResultSchema, contestants, disciplines, results, coffees } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
  conflict: z.object({
    message: z.string(),
  }),
};

export const api = {
  disciplines: {
    list: {
      method: 'GET' as const,
      path: '/api/disciplines' as const,
      responses: {
        200: z.array(z.custom<typeof disciplines.$inferSelect>()),
      },
    },
  },
  contestants: {
    list: {
      method: 'GET' as const,
      path: '/api/contestants' as const,
      responses: {
        200: z.array(z.custom<typeof contestants.$inferSelect>()),
      },
    },
  },
  results: {
    create: {
      method: 'POST' as const,
      path: '/api/results' as const,
      input: z.object({
        contestantId: z.number(),
        disciplineId: z.number(),
        roll: z.number().min(1).max(20),
      }),
      responses: {
        201: z.custom<typeof results.$inferSelect>(),
        400: errorSchemas.validation,
        409: errorSchemas.conflict, // "nuh uh ya cant roll twice"
      },
    },
    list: {
      method: 'GET' as const,
      path: '/api/results' as const,
      input: z.object({
        disciplineId: z.string().optional(), // Query param is string
      }).optional(),
      responses: {
        200: z.array(z.object({
          id: z.number(),
          score: z.number(),
          contestantName: z.string(),
          country: z.string(),
          disciplineId: z.number(),
        })),
      },
    },
  },
  coffees: {
    get: {
      method: 'GET' as const,
      path: '/api/coffees' as const,
      responses: {
        200: z.custom<typeof coffees.$inferSelect>(),
      },
    },
    increment: {
      method: 'POST' as const,
      path: '/api/coffees/increment' as const,
      responses: {
        200: z.custom<typeof coffees.$inferSelect>(),
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
