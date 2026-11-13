import { db } from "../../../prisma/db";

export default defineEventHandler(async (event) => {
    const user = await getAuthenticatedUser(event);
    if (!user) {
        throw createError({
            status: 401,
            statusText: "Unauthorized",
            message: "You must be authenticated to create a new contractor.",
        });
    }

    const body: unknown = await readBody(event);
    if (typeof body !== "object" || body === null || Array.isArray(body)) {
        throw createError({
            status: 400,
            statusText: "Bad Request",
            message: "Request body must be an object.",
        });
    }

    const input = body as Record<string, unknown>;
    const legalName =
        typeof input.legalName === "string" ? input.legalName.trim() : "";
    const document =
        typeof input.document === "string" ? input.document.trim() : "";
    const email = input.email;
    const phone = input.phone;

    if (
        !legalName ||
        !document ||
        (email !== undefined && email !== null && typeof email !== "string") ||
        (phone !== undefined && phone !== null && typeof phone !== "string")
    ) {
        throw createError({
            status: 400,
            statusText: "Bad Request",
            message:
                "legalName and document are required; email and phone must be strings or null.",
        });
    }

    if (await db.orm.public.Contractor.first({ document })) {
        throw createError({
            status: 409,
            statusText: "Conflict",
            message: "A contractor with this document already exists.",
        });
    }

    const contractor = await db.orm.public.Contractor.create({
        legalName,
        document,
        email: typeof email === "string" ? email.trim() || null : null,
        phone: typeof phone === "string" ? phone.trim() || null : null,
    });

    setResponseStatus(event, 201);
    return contractor;
})