/**
 * This code was AUTOGENERATED using the kinobi library.
 * Please DO NOT EDIT THIS FILE, instead use visitors
 * to add features, then rerun kinobi to update it.
 *
 * @see https://github.com/metaplex-foundation/kinobi
 */

import { PublicKey } from '@metaplex-foundation/umi';
import {
  Serializer,
  publicKey as publicKeySerializer,
  string,
  struct,
  u32,
} from '@metaplex-foundation/umi/serializers';
import { Key, KeyArgs, getKeySerializer } from '.';

export type CollectionAccountData = {
  key: Key;
  updateAuthority: PublicKey;
  name: string;
  uri: string;
  numMinted: number;
  currentSize: number;
};

export type CollectionAccountDataArgs = {
  key: KeyArgs;
  updateAuthority: PublicKey;
  name: string;
  uri: string;
  numMinted: number;
  currentSize: number;
};

export function getCollectionAccountDataSerializer(): Serializer<
  CollectionAccountDataArgs,
  CollectionAccountData
> {
  return struct<CollectionAccountData>(
    [
      ['key', getKeySerializer()],
      ['updateAuthority', publicKeySerializer()],
      ['name', string()],
      ['uri', string()],
      ['numMinted', u32()],
      ['currentSize', u32()],
    ],
    { description: 'CollectionAccountData' }
  ) as Serializer<CollectionAccountDataArgs, CollectionAccountData>;
}