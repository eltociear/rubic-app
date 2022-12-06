import { Injectable } from '@angular/core';
import AirdropMerkleTree from '../constants/airdrop-merkle-tree.json';
import BalanceTree from '@features/airdrop/utils/balance-tree';
import BigNumber from 'bignumber.js';
import { BLOCKCHAIN_NAME, CHAIN_TYPE, Injector, Web3Pure } from 'rubic-sdk';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { checkAddressValidity } from '@features/airdrop/utils/merkle-tree-address-validation';
import { filter, map } from 'rxjs/operators';
import { tuiPure } from '@taiga-ui/cdk';
import { BehaviorSubject } from 'rxjs';
import { airdropContractAbi } from '@features/airdrop/constants/airdrop-contract-abi';
import { AirdropNode } from '@features/airdrop/models/airdrop-node';
import { BigNumber as EthersBigNumber } from 'ethers';
import { NotificationsService } from '@core/services/notifications/notifications.service';
import { TuiNotification } from '@taiga-ui/core';
import { RubicError } from '@core/errors/models/rubic-error';

interface SourceNode {
  index: number;
  balance: string;
}

@Injectable({
  providedIn: 'root'
})
export class AirdropService {
  private readonly merkleTreeSource: { [Key: string]: SourceNode } = AirdropMerkleTree;

  private readonly merkleTree = new BalanceTree(
    Object.entries(this.merkleTreeSource).map(([address, { balance }]) => ({
      account: address,
      amount: EthersBigNumber.from(balance)
    }))
  );

  private readonly airDropContractAddress = '0x057E171E6Bd2Ea1e474790f49AC369Cfe925A535';

  private readonly _claimLoading$ = new BehaviorSubject(false);

  public readonly claimLoading$ = this._claimLoading$.asObservable();

  public readonly airdropForm = new FormGroup({
    address: new FormControl<string>(null, [Validators.required, checkAddressValidity(this)])
  });

  public readonly claimedTokens$ = this.airdropForm.controls.address.valueChanges.pipe(
    filter(() => this.airdropForm.controls.address.valid),
    map(address => {
      const amount = this.getAmountByAddress(address);
      return Web3Pure.fromWei(amount.toString());
    })
  );

  public readonly isValid$ = this.airdropForm.controls.address.valueChanges.pipe(
    map(() => this.airdropForm.controls.address.valid)
  );

  constructor(private readonly notificationsService: NotificationsService) {}

  @tuiPure
  public getProofByAddress(address: string): string[] | null {
    if (!address) {
      return null;
    }

    const desiredNode = this.getNodeByAddress(address);
    if (!desiredNode) {
      return null;
    }

    return this.merkleTree.getProof(desiredNode.index, address, desiredNode.amount);
  }

  @tuiPure
  private getNodeByAddress(address: string | null): AirdropNode | null {
    if (!address) {
      return null;
    }

    const node = this.merkleTreeSource?.[address];
    if (!node) {
      return null;
    }

    return {
      index: node.index,
      account: address,
      amount: EthersBigNumber.from(node.balance)
    };
  }

  @tuiPure
  private getAmountByAddress(address: string | null): BigNumber {
    const node = this.getNodeByAddress(address);
    return node ? new BigNumber(node.amount.toString()) : new BigNumber(0);
  }

  public async claimTokens(): Promise<void> {
    this._claimLoading$.next(true);

    try {
      const isPaused = this.checkIsPaused();
      if (isPaused) {
        this.handlePause();
      }

      const web3 = Injector.web3PrivateService.getWeb3Private(CHAIN_TYPE.EVM);
      const address = this.airdropForm.controls.address.value;
      const node = this.getNodeByAddress(address);
      const proof = this.getProofByAddress(address);

      await web3.tryExecuteContractMethod(
        this.airDropContractAddress,
        airdropContractAbi,
        'claim',
        [node.index, node.account, node.amount, proof]
      );
    } catch (err) {
      console.debug(err);
    } finally {
      this._claimLoading$.next(false);
    }
  }

  private async checkIsPaused(): Promise<boolean> {
    return Injector.web3PublicService
      .getWeb3Public(BLOCKCHAIN_NAME.ETHEREUM)
      .callContractMethod(this.airDropContractAddress, airdropContractAbi, 'paused', []);
  }

  private handlePause(): void {
    this.notificationsService.show('Contract is paused.', {
      autoClose: 10000,
      status: TuiNotification.Warning
    });
    throw new RubicError('Contract is Paused');
  }
}
