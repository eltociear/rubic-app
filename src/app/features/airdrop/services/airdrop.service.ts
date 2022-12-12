import { Injectable } from '@angular/core';
import sourceAirdropMerkle from '../constants/airdrop-merkle-tree.json';
import BalanceTree from '@features/airdrop/utils/balance-tree';
import BigNumber from 'bignumber.js';
import { BLOCKCHAIN_NAME, CHAIN_TYPE, Injector, UserRejectError, Web3Pure } from 'rubic-sdk';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { checkAddressValidity } from '@features/airdrop/utils/merkle-tree-address-validation';
import { filter, first, map } from 'rxjs/operators';
import { tuiPure } from '@taiga-ui/cdk';
import { BehaviorSubject, firstValueFrom, lastValueFrom, Subscription } from 'rxjs';
import { airdropContractAbi } from '@features/airdrop/constants/airdrop-contract-abi';
import { AirdropNode } from '@features/airdrop/models/airdrop-node';
import { BigNumber as EthersBigNumber } from 'ethers';
import { NotificationsService } from '@core/services/notifications/notifications.service';
import { TuiDialogService, TuiNotification } from '@taiga-ui/core';
import { WalletConnectorService } from '@core/services/wallets/wallet-connector-service/wallet-connector.service';
import { RubicSdkService } from '@core/services/rubic-sdk-service/rubic-sdk.service';
import { TranslateService } from '@ngx-translate/core';
import { EvmWeb3Pure } from 'rubic-sdk/lib/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/evm-web3-pure';
import { airdropContractAddress } from '@features/airdrop/constants/airdrop-contract-address';
import { PolymorpheusComponent } from '@tinkoff/ng-polymorpheus';
import { SuccessClaimModalComponent } from '@features/airdrop/components/success-claim-modal/success-claim-modal.component';
import { DifferentAddressesModalComponent } from '@features/airdrop/components/different-addresses-modal/different-addresses-modal.component';
import { compareAddresses } from '@shared/utils/utils';

interface SourceNode {
  index: number;
  balance: string;
}

@Injectable({
  providedIn: 'root'
})
export class AirdropService {
  private readonly merkleTreeSource: { [Key: string]: SourceNode } = sourceAirdropMerkle;

  private readonly merkleTree = new BalanceTree(
    Object.entries(this.merkleTreeSource).map(([address, { balance }]) => ({
      account: address,
      amount: EthersBigNumber.from(balance)
    }))
  );

  private readonly airDropContractAddress = airdropContractAddress;

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

  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly walletConnectorService: WalletConnectorService,
    private readonly sdkService: RubicSdkService,
    private readonly translateService: TranslateService,
    private readonly dialogService: TuiDialogService
  ) {}

  @tuiPure
  public getProofByAddress(address: string): string[] | null {
    if (!address) {
      return null;
    }

    const desiredNode = this.getNodeByAddress(address);
    if (!desiredNode) {
      return null;
    }

    const proof = this.merkleTree.getProof(desiredNode.index, address, desiredNode.amount);
    console.log(proof);
    return proof;
  }

  @tuiPure
  private getNodeByAddress(address: string | null): AirdropNode | null {
    if (!address) {
      return null;
    }

    const node = this.merkleTreeSource?.[EvmWeb3Pure.toChecksumAddress(address)];
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
    let claimInProgressNotification: Subscription;

    try {
      await this.checkPause();
      await this.checkAddress();

      const web3 = Injector.web3PrivateService.getWeb3Private(CHAIN_TYPE.EVM);
      const address = this.airdropForm.controls.address.value;
      const node = this.getNodeByAddress(address);
      const proof = this.getProofByAddress(address);

      await this.checkClaimed(node.index);

      await web3.tryExecuteContractMethod(
        this.airDropContractAddress,
        airdropContractAbi,
        'claim',
        [node.index, node.account, node.amount, proof],
        {
          onTransactionHash: hash => {
            this.showSuccessModa(hash);
            claimInProgressNotification = this.notificationsService.show(
              this.translateService.instant('airdrop.notification.progress'),
              {
                status: TuiNotification.Info,
                autoClose: false
              }
            );
          }
        }
      );
      this.notificationsService.show(
        this.translateService.instant('airdrop.notification.success'),
        {
          status: TuiNotification.Success,
          autoClose: 10000
        }
      );
    } catch (err) {
      this.parseError(err);
    } finally {
      claimInProgressNotification?.unsubscribe();
      this._claimLoading$.next(false);
    }
  }

  private async checkPause(): Promise<void> {
    const isPaused = await Injector.web3PublicService
      .getWeb3Public(BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN)
      .callContractMethod(this.airDropContractAddress, airdropContractAbi, 'paused', []);
    if (isPaused) {
      throw new Error('paused');
    }
  }

  private async checkClaimed(index: number): Promise<void> {
    const isPaused = await Injector.web3PublicService
      .getWeb3Public(BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN)
      .callContractMethod(this.airDropContractAddress, airdropContractAbi, 'isClaimed', [index]);
    if (isPaused) {
      throw new Error('claimed');
    }
  }

  public async changeNetwork(): Promise<void> {
    this._claimLoading$.next(true);
    try {
      await this.walletConnectorService.switchChain(BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN);
      await lastValueFrom(this.sdkService.sdkLoading$.pipe(first(el => el === false)));
    } finally {
      this._claimLoading$.next(false);
    }
  }

  private parseError(err: unknown): void {
    if (err instanceof Error) {
      let label: string;
      let status: TuiNotification;
      if (err.message === 'paused') {
        label = this.translateService.instant('airdrop.notification.paused');
        status = TuiNotification.Warning;
      } else if (err.message === 'claimed') {
        label = this.translateService.instant('airdrop.notification.claimed');
        status = TuiNotification.Warning;
      } else if (err.message === 'User does not agree to claim tokens') {
        label = this.translateService.instant('airdrop.notification.reject');
        status = TuiNotification.Error;
      } else {
        label = this.translateService.instant('airdrop.notification.unknown');
        status = TuiNotification.Error;
      }

      if (err instanceof UserRejectError) {
        label = this.translateService.instant('airdrop.notification.reject');
        status = TuiNotification.Error;
      }

      this.notificationsService.show(label, { autoClose: 10000, status });
    }
  }

  private async checkAddress(): Promise<void> {
    const claimAddress = this.airdropForm.controls.address.value;
    const userAddress = this.walletConnectorService.address;
    if (!compareAddresses(claimAddress, userAddress)) {
      try {
        const isUserAgreed = await firstValueFrom(
          this.dialogService.open<boolean>(
            new PolymorpheusComponent(DifferentAddressesModalComponent),
            { size: 'm' }
          )
        );
        if (!isUserAgreed) {
          throw new Error();
        }
      } catch {
        throw new Error('User does not agree to claim tokens');
      }
    }
  }

  private showSuccessModa(hash: string): void {
    this.dialogService
      .open(new PolymorpheusComponent(SuccessClaimModalComponent), {
        size: 'm',
        data: { hash }
      })
      .subscribe();
  }
}
