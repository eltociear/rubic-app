import { Injectable } from '@angular/core';
import AirdropMerkleTree from '../constants/airdrop-merkle-tree.json';
import BalanceTree from '@features/airdrop/utils/balance-tree';
import BigNumber from 'bignumber.js';
import { CHAIN_TYPE, Injector, Web3Pure } from 'rubic-sdk';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { checkAddressValidity } from '@features/airdrop/utils/merkle-tree-address-validation';
import { filter, map } from 'rxjs/operators';
import { tuiPure } from '@taiga-ui/cdk';
import { BehaviorSubject } from 'rxjs';
import { airdropContractAbi } from '@features/airdrop/constants/airdrop-contract-abi';
import { AirdropNode } from '@features/airdrop/models/airdrop-node';

@Injectable({
  providedIn: 'root'
})
export class AirdropService {
  private readonly merkleTreeSource = AirdropMerkleTree;

  private readonly merkleTree = new BalanceTree(
    this.merkleTreeSource.map(node => ({
      account: node.holderAddress,
      amount: Web3Pure.toWei(node.balance)
    }))
  );

  private readonly airDropContractAddress = '0x79f9EecD08Fd378A6B547B14A590CD905f310E00';

  private readonly _claimLoading$ = new BehaviorSubject(false);

  public readonly claimLoading$ = this._claimLoading$.asObservable();

  public readonly airdropForm = new FormGroup({
    address: new FormControl<string>(null, [Validators.required, checkAddressValidity(this)])
  });

  public readonly claimedTokens$ = this.airdropForm.controls.address.valueChanges.pipe(
    filter(() => this.airdropForm.controls.address.valid),
    map(address => this.getAmountByAddress(address))
  );

  public readonly isValid$ = this.airdropForm.controls.address.valueChanges.pipe(
    map(() => this.airdropForm.controls.address.valid)
  );

  constructor() {}

  @tuiPure
  public getProofByAddress(address: string): string[] | null {
    if (!address) {
      return null;
    }

    const desiredNode = this.getNodeByAddress(address);
    if (!desiredNode) {
      return null;
    }

    return this.merkleTree.getProof(desiredNode.index, address, Web3Pure.toWei(desiredNode.amount));
  }

  @tuiPure
  private getNodeByAddress(address: string | null): AirdropNode | null {
    if (!address) {
      return null;
    }

    const nodeIndex = this.merkleTreeSource.findIndex(node => node.holderAddress === address);
    if (nodeIndex === -1) {
      return null;
    }

    return {
      index: nodeIndex,
      account: address,
      amount: new BigNumber(this.merkleTreeSource[nodeIndex].balance || 0)
    };
  }

  @tuiPure
  private getAmountByAddress(address: string | null): BigNumber {
    const node = this.getNodeByAddress(address);
    return node?.amount || null;
  }

  public async claimTokens(): Promise<void> {
    this._claimLoading$.next(true);
    try {
      const web3 = Injector.web3PrivateService.getWeb3Private(CHAIN_TYPE.EVM);
      const address = this.airdropForm.controls.address.value;
      const node = this.getNodeByAddress(address);
      const proof = this.getProofByAddress(address);

      await web3.tryExecuteContractMethod(
        this.airDropContractAddress,
        airdropContractAbi,
        'claim',
        [node.index, node.account, Web3Pure.toWei(node.amount), proof]
      );
    } catch (err) {
      console.debug(err);
    } finally {
      this._claimLoading$.next(false);
    }
  }
}
