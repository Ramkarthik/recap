import zod from 'zod';

export const articleMetadataSchema = zod.object({
    title: zod.string(),
    description: zod.string(),
    content: zod.string(),
    html: zod.string(),
});

export type ArticleMetadata = zod.infer<typeof articleMetadataSchema>;
