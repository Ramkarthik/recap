import { generateId } from "@recap/shared";

/*
This function is called by the cron job to process an article.
*/
export async function processArticle(articleId: String) {
    {
        const backgroundEndpointUrl = process.env.BACKGROUND_ENDPOINT_URL!;
        var requestId = generateId("req");
        var idempotencyKey = generateId("idm");
        await fetch(backgroundEndpointUrl + "/parse-article", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.BACKGROUND_API_KEY}`,
                "X-Request-Id": requestId,
                "X-Idempotency-Key": idempotencyKey,
            },
            body: JSON.stringify({
                articleId,
            }),
        });
    }

}