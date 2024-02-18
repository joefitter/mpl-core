/**
 * This code was AUTOGENERATED using the kinobi library.
 * Please DO NOT EDIT THIS FILE, instead use visitors
 * to add features, then rerun kinobi to update it.
 *
 * @see https://github.com/metaplex-foundation/kinobi
 */

import { Serializer, scalarEnum } from '@metaplex-foundation/umi/serializers';

export enum Key {
  Uninitialized,
  Asset,
  HashedAsset,
  Collection,
  HashedCollection,
  PluginHeader,
  PluginRegistry,
}

export type KeyArgs = Key;

export function getKeySerializer(): Serializer<KeyArgs, Key> {
  return scalarEnum<Key>(Key, { description: 'Key' }) as Serializer<
    KeyArgs,
    Key
  >;
}
