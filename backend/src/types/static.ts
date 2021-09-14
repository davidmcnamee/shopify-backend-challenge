/** @format */

// These types are used by graphql-codegen to generate types.
// So they can't rely on any types from ./types.d.ts

import {User} from ".prisma/client";
import {Context} from "graphql-passport/lib/buildContext";

export interface CustomContextType extends Context<User> {}
