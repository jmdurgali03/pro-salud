/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as consultas from "../consultas.js";
import type * as diagnosticos from "../diagnosticos.js";
import type * as especialidades from "../especialidades.js";
import type * as helpers_checkSolapamiento from "../helpers/checkSolapamiento.js";
import type * as obrasSociales from "../obrasSociales.js";
import type * as observaciones from "../observaciones.js";
import type * as pacientes from "../pacientes.js";
import type * as profesionales from "../profesionales.js";
import type * as seed from "../seed.js";
import type * as turnos from "../turnos.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  consultas: typeof consultas;
  diagnosticos: typeof diagnosticos;
  especialidades: typeof especialidades;
  "helpers/checkSolapamiento": typeof helpers_checkSolapamiento;
  obrasSociales: typeof obrasSociales;
  observaciones: typeof observaciones;
  pacientes: typeof pacientes;
  profesionales: typeof profesionales;
  seed: typeof seed;
  turnos: typeof turnos;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
