use borsh::{BorshDeserialize, BorshSerialize};
use mpl_utils::assert_signer;
use solana_program::{account_info::AccountInfo, entrypoint::ProgramResult, msg};

use crate::{
    error::MplCoreError,
    instruction::accounts::{BurnCollectionV1Accounts, BurnV1Accounts},
    plugins::{Plugin, PluginType},
    state::{AssetV1, CollectionV1, CompressionProof, Key, Wrappable},
    utils::{
        close_program_account, load_key, rebuild_account_state_from_proof_data, resolve_authority,
        validate_asset_permissions, validate_collection_permissions, verify_proof,
    },
};

#[derive(BorshSerialize, BorshDeserialize, PartialEq, Eq, Debug, Clone)]
pub(crate) struct BurnV1Args {
    compression_proof: Option<CompressionProof>,
}

pub(crate) fn burn<'a>(accounts: &'a [AccountInfo<'a>], args: BurnV1Args) -> ProgramResult {
    // Accounts.
    let ctx = BurnV1Accounts::context(accounts)?;

    // Guards.
    assert_signer(ctx.accounts.payer)?;
    let authority = resolve_authority(ctx.accounts.payer, ctx.accounts.authority)?;

    match load_key(ctx.accounts.asset, 0)? {
        Key::HashedAssetV1 => {
            let mut compression_proof = args
                .compression_proof
                .ok_or(MplCoreError::MissingCompressionProof)?;

            let system_program = ctx
                .accounts
                .system_program
                .ok_or(MplCoreError::MissingSystemProgram)?;

            // Verify the proof and rebuild Asset struct in account space.
            let (asset, plugins) = verify_proof(ctx.accounts.asset, &compression_proof)?;

            // Use the data from the compression proof to rebuild the account.  Only needed for validation.
            rebuild_account_state_from_proof_data(
                asset,
                plugins,
                ctx.accounts.asset,
                ctx.accounts.payer,
                system_program,
            )?;

            // Increment sequence number for the spl-noop event.  Note we don't care about the
            // sequence number in account state because we are closing the account later in this
            // instruction.
            compression_proof.seq = compression_proof.seq.saturating_add(1);

            // Send the spl-noop event for indexing the compressed asset.
            compression_proof.wrap()?;

            // TODO Enable compressed burn.
            msg!("Error: Burning compressed is currently not available");
            return Err(MplCoreError::NotAvailable.into());
        }
        Key::AssetV1 => (),
        _ => return Err(MplCoreError::IncorrectAccount.into()),
    }

    // Validate asset permissions.
    let _ = validate_asset_permissions(
        authority,
        ctx.accounts.asset,
        ctx.accounts.collection,
        None,
        None,
        AssetV1::check_burn,
        CollectionV1::check_burn,
        PluginType::check_burn,
        AssetV1::validate_burn,
        CollectionV1::validate_burn,
        Plugin::validate_burn,
    )?;

    process_burn(ctx.accounts.asset, authority)
}

#[derive(BorshSerialize, BorshDeserialize, PartialEq, Eq, Debug, Clone)]
pub(crate) struct BurnCollectionV1Args {
    compression_proof: Option<CompressionProof>,
}

pub(crate) fn burn_collection<'a>(
    accounts: &'a [AccountInfo<'a>],
    _args: BurnCollectionV1Args,
) -> ProgramResult {
    // Accounts.
    let ctx = BurnCollectionV1Accounts::context(accounts)?;

    // Guards.
    assert_signer(ctx.accounts.payer)?;
    let authority = resolve_authority(ctx.accounts.payer, ctx.accounts.authority)?;

    // Validate collection permissions.
    let _ = validate_collection_permissions(
        authority,
        ctx.accounts.collection,
        None,
        CollectionV1::check_burn,
        PluginType::check_burn,
        CollectionV1::validate_burn,
        Plugin::validate_burn,
    )?;

    process_burn(ctx.accounts.collection, authority)
}

fn process_burn<'a>(core_info: &AccountInfo<'a>, authority: &AccountInfo<'a>) -> ProgramResult {
    close_program_account(core_info, authority)
}
