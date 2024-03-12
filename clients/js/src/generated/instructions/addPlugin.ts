/**
 * This code was AUTOGENERATED using the kinobi library.
 * Please DO NOT EDIT THIS FILE, instead use visitors
 * to add features, then rerun kinobi to update it.
 *
 * @see https://github.com/metaplex-foundation/kinobi
 */

import {
  Context,
  Option,
  OptionOrNullable,
  Pda,
  PublicKey,
  Signer,
  TransactionBuilder,
  none,
  transactionBuilder,
} from '@metaplex-foundation/umi';
import {
  Serializer,
  mapSerializer,
  option,
  struct,
  u8,
} from '@metaplex-foundation/umi/serializers';
import {
  ResolvedAccount,
  ResolvedAccountsWithIndices,
  getAccountMetasAndSigners,
} from '../shared';
import {
  Authority,
  AuthorityArgs,
  Plugin,
  PluginArgs,
  getAuthoritySerializer,
  getPluginSerializer,
} from '../types';

// Accounts.
export type AddPluginInstructionAccounts = {
  /** The address of the asset */
  asset: PublicKey | Pda;
  /** The collection to which the asset belongs */
  collection?: PublicKey | Pda;
  /** The owner or delegate of the asset */
  authority?: Signer;
  /** The account paying for the storage fees */
  payer?: Signer;
  /** The system program */
  systemProgram?: PublicKey | Pda;
  /** The SPL Noop Program */
  logWrapper?: PublicKey | Pda;
};

// Data.
export type AddPluginInstructionData = {
  discriminator: number;
  plugin: Plugin;
  initAuthority: Option<Authority>;
};

export type AddPluginInstructionDataArgs = {
  plugin: PluginArgs;
  initAuthority?: OptionOrNullable<AuthorityArgs>;
};

export function getAddPluginInstructionDataSerializer(): Serializer<
  AddPluginInstructionDataArgs,
  AddPluginInstructionData
> {
  return mapSerializer<
    AddPluginInstructionDataArgs,
    any,
    AddPluginInstructionData
  >(
    struct<AddPluginInstructionData>(
      [
        ['discriminator', u8()],
        ['plugin', getPluginSerializer()],
        ['initAuthority', option(getAuthoritySerializer())],
      ],
      { description: 'AddPluginInstructionData' }
    ),
    (value) => ({
      ...value,
      discriminator: 2,
      initAuthority: value.initAuthority ?? none(),
    })
  ) as Serializer<AddPluginInstructionDataArgs, AddPluginInstructionData>;
}

// Args.
export type AddPluginInstructionArgs = AddPluginInstructionDataArgs;

// Instruction.
export function addPlugin(
  context: Pick<Context, 'identity' | 'programs'>,
  input: AddPluginInstructionAccounts & AddPluginInstructionArgs
): TransactionBuilder {
  // Program ID.
  const programId = context.programs.getPublicKey(
    'mplCore',
    'CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d'
  );

  // Accounts.
  const resolvedAccounts = {
    asset: {
      index: 0,
      isWritable: true as boolean,
      value: input.asset ?? null,
    },
    collection: {
      index: 1,
      isWritable: true as boolean,
      value: input.collection ?? null,
    },
    authority: {
      index: 2,
      isWritable: false as boolean,
      value: input.authority ?? null,
    },
    payer: {
      index: 3,
      isWritable: true as boolean,
      value: input.payer ?? null,
    },
    systemProgram: {
      index: 4,
      isWritable: false as boolean,
      value: input.systemProgram ?? null,
    },
    logWrapper: {
      index: 5,
      isWritable: false as boolean,
      value: input.logWrapper ?? null,
    },
  } satisfies ResolvedAccountsWithIndices;

  // Arguments.
  const resolvedArgs: AddPluginInstructionArgs = { ...input };

  // Default values.
  if (!resolvedAccounts.authority.value) {
    resolvedAccounts.authority.value = context.identity;
  }
  if (!resolvedAccounts.systemProgram.value) {
    resolvedAccounts.systemProgram.value = context.programs.getPublicKey(
      'splSystem',
      '11111111111111111111111111111111'
    );
    resolvedAccounts.systemProgram.isWritable = false;
  }

  // Accounts in order.
  const orderedAccounts: ResolvedAccount[] = Object.values(
    resolvedAccounts
  ).sort((a, b) => a.index - b.index);

  // Keys and Signers.
  const [keys, signers] = getAccountMetasAndSigners(
    orderedAccounts,
    'programId',
    programId
  );

  // Data.
  const data = getAddPluginInstructionDataSerializer().serialize(
    resolvedArgs as AddPluginInstructionDataArgs
  );

  // Bytes Created On Chain.
  const bytesCreatedOnChain = 0;

  return transactionBuilder([
    { instruction: { keys, programId, data }, signers, bytesCreatedOnChain },
  ]);
}
