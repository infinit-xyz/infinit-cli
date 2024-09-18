/* eslint-disable */
/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run json-schema-to-typescript to regenerate this file.
 */

/**
 * URL
 */
export type Url = string

/**
 * Infinit Config Schema
 */
export interface InfinitConfigSchema {
  $schema?: string
  project_name: string
  protocol_module: string
  chain_info: {
    name: string
    network_id: number
    rpc_url: Url
  }
}
