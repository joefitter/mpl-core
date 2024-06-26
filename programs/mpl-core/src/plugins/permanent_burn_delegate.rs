use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{account_info::AccountInfo, program_error::ProgramError};

use crate::state::{Authority, DataBlob};

use super::{Plugin, PluginType, PluginValidation, ValidationResult};

/// The permanent burn plugin allows any authority to burn the asset.
/// The default authority for this plugin is the update authority.
#[repr(C)]
#[derive(Clone, Copy, BorshSerialize, BorshDeserialize, Debug, Default, PartialEq, Eq)]
pub struct PermanentBurnDelegate {}

impl DataBlob for PermanentBurnDelegate {
    fn get_initial_size() -> usize {
        0
    }

    fn get_size(&self) -> usize {
        0
    }
}

impl PluginValidation for PermanentBurnDelegate {
    fn validate_add_plugin(
        &self,
        _authority_info: &AccountInfo,
        _authority: &Authority,
        new_plugin: Option<&Plugin>,
    ) -> Result<ValidationResult, ProgramError> {
        // This plugin can only be added at creation time, so we
        // always reject it.
        if new_plugin.is_some()
            && PluginType::from(new_plugin.unwrap()) == PluginType::PermanentBurnDelegate
        {
            Ok(ValidationResult::Rejected)
        } else {
            Ok(ValidationResult::Pass)
        }
    }

    fn validate_revoke_plugin_authority(
        &self,
        _authority_info: &AccountInfo,
        _authority: &Authority,
        _plugin_to_revoke: Option<&Plugin>,
    ) -> Result<ValidationResult, ProgramError> {
        Ok(ValidationResult::Approved)
    }

    fn validate_burn(
        &self,
        _authority_info: &AccountInfo,
        authority: &Authority,
        resolved_authorities: Option<&[Authority]>,
    ) -> Result<ValidationResult, ProgramError> {
        if let Some(resolved_authorities) = resolved_authorities {
            if resolved_authorities.contains(authority) {
                return Ok(ValidationResult::ForceApproved);
            }
        }

        Ok(ValidationResult::Pass)
    }
}
