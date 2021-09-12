// These types are used by graphql-codegen to generate types.
// So they can't rely on any types from ./types.d.ts

import { User } from "@prisma/client";

export type CustomContextType = {
    user?: User;
}
