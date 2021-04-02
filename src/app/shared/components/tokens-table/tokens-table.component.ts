import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { Sort } from '@angular/material/sort';
import * as moment from 'moment';
import { BlockchainsInfo } from 'src/app/core/services/blockchain/blockchain-info';
import { OrderBookTradeData } from 'src/app/features/order-book-trade-page/models/trade-data';
import { BLOCKCHAIN_NAME } from '../../models/blockchain/BLOCKCHAIN_NAME';
import { TokenValueType } from '../../models/order-book/tokens';
import { SortingResult } from './models/sorting-result';
import { TokensTableData } from './models/tokens-table-data';

@Component({
  selector: 'app-tokens-table',
  templateUrl: './tokens-table.component.html',
  styleUrls: ['./tokens-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TokensTableComponent {
  private tokensTableData: TokensTableData[];

  @Input() set tableData(data: OrderBookTradeData[]) {
    const newData = this.dataToModel(data);
    this.tokensTableData = newData;
    this.sotredTableData = newData;
  }

  @Input() public displayedColumns: string[];

  @Input() public columnsSizes: string[];

  @Input() public tableLoading: boolean;

  @Input() public title: string;

  @Output() public refreshTableEvent: EventEmitter<void>;

  @Output() public selectTokenEvent: EventEmitter<TokenValueType>;

  public sotredTableData: TokensTableData[];

  constructor() {
    this.refreshTableEvent = new EventEmitter<void>();
    this.selectTokenEvent = new EventEmitter<TokenValueType>();
  }

  /**
   * @description Get class name for cell with status.
   * @param status Swap status.
   * @returns Status classname(e.g. 'tokens-table__status_active')
   */
  public getClassName(status: string): any {
    const key = `tokens-table__status_${status.toLowerCase()}`;
    const obj = {};
    obj[key] = true;
    return obj;
  }

  /**
   * @description Get chain icon by name.
   * @param name Blockhain name.
   * @returns Icon path.
   */
  public getChainIcon(name: BLOCKCHAIN_NAME): string {
    return BlockchainsInfo.getBlockchainByName(name).imagePath;
  }

  /**
   * @description Token dropdown selection event. Uses for table filtering.
   * @param data Selected token.
   */
  public selectToken(data: TokenValueType): void {
    this.selectTokenEvent.emit(data);
  }

  /**
   * @description Update table data event.
   */
  public refreshTable(): void {
    this.refreshTableEvent.emit();
  }

  /**
   * @description Sorting function for table.
   * @param sort Current sort state.
   */
  public sortData(sort: Sort): void {
    const data = this.tokensTableData.slice();
    if (!sort.active || sort.direction === '') {
      this.sotredTableData = data;
      return;
    }

    this.sotredTableData = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'expires':
          return this.compareNumbers(
            a.expirationDate.toDate().getTime(),
            b.expirationDate.toDate().getTime(),
            isAsc
          );
        case 'network':
          return this.compareStrings(a.blockchain, b.blockchain, isAsc);
        case 'status':
          return this.compareStrings(a.status, b.status, isAsc);
        default:
          return 0;
      }
    });
  }

  /**
   * Compare to numbers for sorting.
   * @param a First element to compare.
   * @param b Second element to compare.
   * @param isAsc Does current sorting state has ascending order.
   * @returns Comparing result.
   */
  private compareNumbers(a: number, b: number, isAsc: boolean): SortingResult {
    return ((a < b ? -1 : 1) * (isAsc ? 1 : -1)) as SortingResult;
  }

  /**
   * Compare to strings for sorting.
   * @param a First element to compare.
   * @param b Second element to compare.
   * @param isAsc Does current sorting state has ascending order.
   * @returns Comparing result.
   */
  private compareStrings(a: string, b: string, isAsc: boolean): SortingResult {
    return (a.localeCompare(b) * (isAsc ? 1 : -1)) as SortingResult;
  }

  /**
   * @description Convert OB trade date to tokens table data (E.G. convert expire date to duration object).
   * @param data Order book trade data.
   * @returns Converted table data.
   */
  private dataToModel(data: OrderBookTradeData[]): TokensTableData[] {
    return data.map((trade: OrderBookTradeData) => ({
      ...trade,
      expiresIn: moment.duration(trade.expirationDate.diff(moment().utc()))
    }));
  }
}