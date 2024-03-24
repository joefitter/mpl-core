//! This code was AUTOGENERATED using the kinobi library.
//! Please DO NOT EDIT THIS FILE, instead use visitors
//! to add features, then rerun kinobi to update it.
//!
//! [https://github.com/metaplex-foundation/kinobi]
//!

use crate::generated::types::Attributes;
use crate::generated::types::BurnDelegate;
use crate::generated::types::FreezeDelegate;
use crate::generated::types::PermanentBurnDelegate;
use crate::generated::types::PermanentFreezeDelegate;
use crate::generated::types::PermanentTransferDelegate;
use crate::generated::types::Royalties;
use crate::generated::types::TransferDelegate;
use crate::generated::types::UpdateDelegate;
use borsh::BorshDeserialize;
use borsh::BorshSerialize;

#[derive(BorshSerialize, BorshDeserialize, Clone, Debug, Eq, PartialEq)]
#[cfg_attr(feature = "serde", derive(serde::Serialize, serde::Deserialize))]
pub enum Plugin {
    Royalties(Royalties),
    FreezeDelegate(FreezeDelegate),
    BurnDelegate(BurnDelegate),
    TransferDelegate(TransferDelegate),
    UpdateDelegate(UpdateDelegate),
    PermanentFreezeDelegate(PermanentFreezeDelegate),
    Attributes(Attributes),
    PermanentTransferDelegate(PermanentTransferDelegate),
    PermanentBurnDelegate(PermanentBurnDelegate),
}
