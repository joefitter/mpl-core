import {
  assertAccountExists,
  generateSigner,
  sol,
} from '@metaplex-foundation/umi';
import test from 'ava';

import { burnCollectionV1, burnV1, Key, pluginAuthorityPair } from '../src';
import {
  DEFAULT_ASSET,
  DEFAULT_COLLECTION,
  assertAsset,
  assertCollection,
  createAsset,
  createAssetWithCollection,
  createCollection,
  createUmi,
} from './_setup';

test('it can burn an asset as the owner', async (t) => {
  // Given a Umi instance and a new signer.
  const umi = await createUmi();
  const asset = await createAsset(umi);
  await assertAsset(t, umi, {
    ...DEFAULT_ASSET,
    asset: asset.publicKey,
    owner: umi.identity.publicKey,
    updateAuthority: { type: 'Address', address: umi.identity.publicKey },
  });

  await burnV1(umi, {
    asset: asset.publicKey,
  }).sendAndConfirm(umi);

  // And the asset address still exists but was resized to 1.
  const afterAsset = await umi.rpc.getAccount(asset.publicKey);
  t.true(afterAsset.exists);
  assertAccountExists(afterAsset);
  t.deepEqual(afterAsset.lamports, sol(0.00089784 + 0.0015));
  t.is(afterAsset.data.length, 1);
  t.is(afterAsset.data[0], Key.Uninitialized);
});

test('it cannot burn an asset if not the owner', async (t) => {
  // Given a Umi instance and a new signer.
  const umi = await createUmi();
  const attacker = generateSigner(umi);

  const asset = await createAsset(umi);
  await assertAsset(t, umi, {
    ...DEFAULT_ASSET,
    asset: asset.publicKey,
    owner: umi.identity.publicKey,
    updateAuthority: { type: 'Address', address: umi.identity.publicKey },
  });

  const result = burnV1(umi, {
    asset: asset.publicKey,
    authority: attacker,
  }).sendAndConfirm(umi);

  await t.throwsAsync(result, { name: 'NoApprovals' });
  await assertAsset(t, umi, {
    ...DEFAULT_ASSET,
    asset: asset.publicKey,
    owner: umi.identity.publicKey,
    updateAuthority: { type: 'Address', address: umi.identity.publicKey },
  });
});

test('it cannot burn an asset if it is frozen', async (t) => {
  // Given a Umi instance and a new signer.
  const umi = await createUmi();

  const asset = await createAsset(umi, {
    plugins: [
      pluginAuthorityPair({
        type: 'FreezeDelegate',
        data: { frozen: true },
      }),
    ],
  });

  await assertAsset(t, umi, {
    ...DEFAULT_ASSET,
    asset: asset.publicKey,
    owner: umi.identity.publicKey,
    updateAuthority: { type: 'Address', address: umi.identity.publicKey },
    freezeDelegate: {
      authority: {
        type: 'Owner',
      },
      frozen: true,
    },
  });

  const result = burnV1(umi, {
    asset: asset.publicKey,
  }).sendAndConfirm(umi);

  await t.throwsAsync(result, { name: 'InvalidAuthority' });
  await assertAsset(t, umi, {
    ...DEFAULT_ASSET,
    asset: asset.publicKey,
    owner: umi.identity.publicKey,
    updateAuthority: { type: 'Address', address: umi.identity.publicKey },
    freezeDelegate: {
      authority: {
        type: 'Owner',
      },
      frozen: true,
    },
  });
});

test('it cannot burn asset in collection if no collection specified', async (t) => {
  // Given a Umi instance and a new signer.
  const umi = await createUmi();

  const { asset, collection } = await createAssetWithCollection(umi, {});

  const result = burnV1(umi, {
    asset: asset.publicKey,
  }).sendAndConfirm(umi);

  await t.throwsAsync(result, { name: 'MissingCollection' });
  await assertAsset(t, umi, {
    ...DEFAULT_ASSET,
    asset: asset.publicKey,
    owner: umi.identity.publicKey,
    updateAuthority: { type: 'Collection', address: collection.publicKey },
  });
});

test('it cannot burn an asset if collection permanently frozen', async (t) => {
  // Given a Umi instance and a new signer.
  const umi = await createUmi();

  const { asset, collection } = await createAssetWithCollection(
    umi,
    {},
    {
      plugins: [
        pluginAuthorityPair({
          type: 'PermanentFreezeDelegate',
          data: { frozen: true },
        }),
      ],
    }
  );

  await assertAsset(t, umi, {
    ...DEFAULT_ASSET,
    asset: asset.publicKey,
    owner: umi.identity.publicKey,
    updateAuthority: { type: 'Collection', address: collection.publicKey },
  });

  await assertCollection(t, umi, {
    ...DEFAULT_COLLECTION,
    collection: collection.publicKey,
    permanentFreezeDelegate: {
      authority: {
        type: 'UpdateAuthority',
      },
      frozen: true,
    },
  });

  const result = burnV1(umi, {
    asset: asset.publicKey,
    collection: collection.publicKey,
  }).sendAndConfirm(umi);

  await t.throwsAsync(result, { name: 'InvalidAuthority' });
  await assertAsset(t, umi, {
    ...DEFAULT_ASSET,
    asset: asset.publicKey,
    owner: umi.identity.publicKey,
    updateAuthority: { type: 'Collection', address: collection.publicKey },
  });
});

test('It can burn a collection', async (t) => {
  const umi = await createUmi();
  const collection = await createCollection(umi);

  await burnCollectionV1(umi, {
    collection: collection.publicKey,
    compressionProof: null,
  }).sendAndConfirm(umi);

  const afterCollection = await umi.rpc.getAccount(collection.publicKey);
  t.true(afterCollection.exists);
  assertAccountExists(afterCollection);
  t.deepEqual(afterCollection.lamports, sol(0.00089784));
  t.is(afterCollection.data.length, 1);
  t.is(afterCollection.data[0], Key.Uninitialized);
});

test('It cannot burn a collection with an asset', async (t) => {
  const umi = await createUmi();
  const { asset, collection } = await createAssetWithCollection(umi, {}, {});

  const result = burnCollectionV1(umi, {
    collection: collection.publicKey,
    compressionProof: null,
  }).sendAndConfirm(umi);

  await t.throwsAsync(result, { name: 'InvalidAuthority' });

  await burnV1(umi, {
    asset: asset.publicKey,
    collection: collection.publicKey,
  }).sendAndConfirm(umi);

  await burnCollectionV1(umi, {
    collection: collection.publicKey,
    compressionProof: null,
  }).sendAndConfirm(umi);

  const afterCollection = await umi.rpc.getAccount(collection.publicKey);
  t.true(afterCollection.exists);
  assertAccountExists(afterCollection);
  t.deepEqual(afterCollection.lamports, sol(0.00089784));
  t.is(afterCollection.data.length, 1);
  t.is(afterCollection.data[0], Key.Uninitialized);
});

test('It cannot burn a collection as non-update auth', async (t) => {
  const umi = await createUmi();
  const updateAuthority = generateSigner(umi).publicKey;
  const collection = await createCollection(umi, {
    updateAuthority,
  });

  const result = burnCollectionV1(umi, {
    collection: collection.publicKey,
    compressionProof: null,
  }).sendAndConfirm(umi);

  await t.throwsAsync(result, { name: 'InvalidAuthority' });
});
