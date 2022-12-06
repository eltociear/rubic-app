import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { EvmWeb3Pure } from 'rubic-sdk/lib/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/evm-web3-pure';
import { AirdropService } from '@features/airdrop/services/airdrop.service';

export function checkAddressValidity(airdropService: AirdropService): ValidatorFn {
  return (control: AbstractControl<string | null>): ValidationErrors | null => {
    const address: string | null = control.value;
    if (!address) {
      return { wrongAddress: address };
    }

    const isEthAddress = EvmWeb3Pure.isAddressCorrect(address);
    if (!isEthAddress) {
      return { wrongAddress: address };
    }

    const proof = airdropService.getProofByAddress(address);

    return proof ? null : { wrongAddress: address };
  };
}