import { Prisma } from "@/generated/prisma/client";
import { decrypt, encrypt, isEncrypted } from "./encryption";

const ENCRYPTED_FIELDS: Record<string, string[]> = {
  BeneficialOwner: ["ssn_itin", "date_of_birth", "id_number"],
  EntityDetail: ["ein"],
  TrustDetail: ["ein"],
};

function encryptFields(
  model: string,
  data: Record<string, unknown>,
): Record<string, unknown> {
  const fields = ENCRYPTED_FIELDS[model];
  if (!fields) return data;

  const result = { ...data };
  for (const field of fields) {
    const value = result[field];
    if (typeof value === "string" && value.length > 0 && !isEncrypted(value)) {
      result[field] = encrypt(value);
    }
  }
  return result;
}

function decryptFields(
  model: string,
  data: Record<string, unknown>,
): Record<string, unknown> {
  const fields = ENCRYPTED_FIELDS[model];
  if (!fields) return data;

  const result = { ...data };
  for (const field of fields) {
    const value = result[field];
    if (typeof value === "string" && isEncrypted(value)) {
      try {
        result[field] = decrypt(value);
      } catch {
        // Keep encrypted value when key mismatch or malformed payload occurs.
      }
    }
  }
  return result;
}

export const encryptionExtension = Prisma.defineExtension({
  name: "field-encryption",
  query: {
    beneficialOwner: {
      async create({ args, query }) {
        if (args.data) {
          args.data = encryptFields(
            "BeneficialOwner",
            args.data as Record<string, unknown>,
          ) as typeof args.data;
        }
        const result = await query(args);
        return decryptFields("BeneficialOwner", result as Record<string, unknown>) as typeof result;
      },
      async update({ args, query }) {
        if (args.data) {
          args.data = encryptFields(
            "BeneficialOwner",
            args.data as Record<string, unknown>,
          ) as typeof args.data;
        }
        const result = await query(args);
        return decryptFields("BeneficialOwner", result as Record<string, unknown>) as typeof result;
      },
      async upsert({ args, query }) {
        if (args.create) {
          args.create = encryptFields(
            "BeneficialOwner",
            args.create as Record<string, unknown>,
          ) as typeof args.create;
        }
        if (args.update) {
          args.update = encryptFields(
            "BeneficialOwner",
            args.update as Record<string, unknown>,
          ) as typeof args.update;
        }
        const result = await query(args);
        return decryptFields("BeneficialOwner", result as Record<string, unknown>) as typeof result;
      },
      async findUnique({ args, query }) {
        const result = await query(args);
        if (!result) return result;
        return decryptFields("BeneficialOwner", result as Record<string, unknown>) as typeof result;
      },
      async findFirst({ args, query }) {
        const result = await query(args);
        if (!result) return result;
        return decryptFields("BeneficialOwner", result as Record<string, unknown>) as typeof result;
      },
      async findMany({ args, query }) {
        const results = await query(args);
        return (results as Record<string, unknown>[]).map((row) =>
          decryptFields("BeneficialOwner", row),
        ) as typeof results;
      },
    },
    entityDetail: {
      async create({ args, query }) {
        if (args.data) {
          args.data = encryptFields(
            "EntityDetail",
            args.data as Record<string, unknown>,
          ) as typeof args.data;
        }
        const result = await query(args);
        return decryptFields("EntityDetail", result as Record<string, unknown>) as typeof result;
      },
      async update({ args, query }) {
        if (args.data) {
          args.data = encryptFields(
            "EntityDetail",
            args.data as Record<string, unknown>,
          ) as typeof args.data;
        }
        const result = await query(args);
        return decryptFields("EntityDetail", result as Record<string, unknown>) as typeof result;
      },
      async upsert({ args, query }) {
        if (args.create) {
          args.create = encryptFields(
            "EntityDetail",
            args.create as Record<string, unknown>,
          ) as typeof args.create;
        }
        if (args.update) {
          args.update = encryptFields(
            "EntityDetail",
            args.update as Record<string, unknown>,
          ) as typeof args.update;
        }
        const result = await query(args);
        return decryptFields("EntityDetail", result as Record<string, unknown>) as typeof result;
      },
      async findUnique({ args, query }) {
        const result = await query(args);
        if (!result) return result;
        return decryptFields("EntityDetail", result as Record<string, unknown>) as typeof result;
      },
      async findFirst({ args, query }) {
        const result = await query(args);
        if (!result) return result;
        return decryptFields("EntityDetail", result as Record<string, unknown>) as typeof result;
      },
      async findMany({ args, query }) {
        const results = await query(args);
        return (results as Record<string, unknown>[]).map((row) =>
          decryptFields("EntityDetail", row),
        ) as typeof results;
      },
    },
    trustDetail: {
      async create({ args, query }) {
        if (args.data) {
          args.data = encryptFields(
            "TrustDetail",
            args.data as Record<string, unknown>,
          ) as typeof args.data;
        }
        const result = await query(args);
        return decryptFields("TrustDetail", result as Record<string, unknown>) as typeof result;
      },
      async update({ args, query }) {
        if (args.data) {
          args.data = encryptFields(
            "TrustDetail",
            args.data as Record<string, unknown>,
          ) as typeof args.data;
        }
        const result = await query(args);
        return decryptFields("TrustDetail", result as Record<string, unknown>) as typeof result;
      },
      async upsert({ args, query }) {
        if (args.create) {
          args.create = encryptFields(
            "TrustDetail",
            args.create as Record<string, unknown>,
          ) as typeof args.create;
        }
        if (args.update) {
          args.update = encryptFields(
            "TrustDetail",
            args.update as Record<string, unknown>,
          ) as typeof args.update;
        }
        const result = await query(args);
        return decryptFields("TrustDetail", result as Record<string, unknown>) as typeof result;
      },
      async findUnique({ args, query }) {
        const result = await query(args);
        if (!result) return result;
        return decryptFields("TrustDetail", result as Record<string, unknown>) as typeof result;
      },
      async findFirst({ args, query }) {
        const result = await query(args);
        if (!result) return result;
        return decryptFields("TrustDetail", result as Record<string, unknown>) as typeof result;
      },
      async findMany({ args, query }) {
        const results = await query(args);
        return (results as Record<string, unknown>[]).map((row) =>
          decryptFields("TrustDetail", row),
        ) as typeof results;
      },
    },
  },
});
