import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { EvmWeb3Pure } from 'rubic-sdk/lib/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/evm-web3-pure';
import { AirdropService } from '@features/airdrop/services/airdrop.service';

export function checkAddressValidity(airdropService: AirdropService): ValidatorFn {
  return (control: AbstractControl<string | null>): ValidationErrors | null => {
    const address: string | null = control.value;
    if (!address) {
      return { emptyAddressError: true };
    }

    const isEthAddress = EvmWeb3Pure.isAddressCorrect(address);
    if (!isEthAddress) {
      return { incorrectAddressError: true };
    }

    const proof = airdropService.getProofByAddress(EvmWeb3Pure.toChecksumAddress(address));

    return proof ? null : { wrongAddressError: true };
  };
}
