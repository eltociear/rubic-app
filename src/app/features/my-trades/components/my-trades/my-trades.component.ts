import { Component, OnDestroy, OnInit } from '@angular/core';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { BLOCKCHAINS } from 'src/app/shared/constants/blockchain/BLOCKCHAINS';
import { BehaviorSubject, combineLatest, Observable, Subject, Subscription, zip } from 'rxjs';
import { defaultSort, TuiComparator } from '@taiga-ui/addon-table';
import { debounceTime, filter, first, map, share, startWith } from 'rxjs/operators';
import { isPresent } from '@taiga-ui/cdk';
import { InstantTradesApiService } from 'src/app/core/services/backend/instant-trades-api/instant-trades-api.service';
import { BridgeApiService } from 'src/app/core/services/backend/bridge-api/bridge-api.service';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { TokensService } from 'src/app/core/services/backend/tokens-service/tokens.service';
import { List } from 'immutable';
import { TokenAmount } from 'src/app/shared/models/tokens/TokenAmount';
import { InstantTradesTradeData } from '../../../swaps-page-old/models/trade-data';
import { BridgeTableTrade } from '../../../bridge/models/BridgeTableTrade';

interface TableToken {
  blockchain: BLOCKCHAIN_NAME;
  symbol: string;
  amount: string;
  image: string;
}

interface TableTrade {
  status: string;
  fromToken: TableToken;
  toToken: TableToken;
  date: Date;
}

type TableRowKey = 'Status' | 'From' | 'To' | 'Sent' | 'Expected' | 'Date';

interface TableRow {
  Status: string;
  From: string;
  To: string;
  Sent: number;
  Expected: number;
  Date: Date;
}

@Component({
  selector: 'app-my-trades',
  templateUrl: './my-trades.component.html',
  styleUrls: ['./my-trades.component.scss']
})
export class MyTradesComponent implements OnInit, OnDestroy {
  public BLOCKCHAINS = BLOCKCHAINS;

  private tableTrades: TableTrade[];

  private readonly tableData$ = new Subject<TableRow[]>();

  public readonly columns: TableRowKey[] = ['Status', 'From', 'To', 'Sent', 'Expected', 'Date'];

  public readonly sorters: Record<TableRowKey, TuiComparator<TableRow>> = {
    Status: () => 0,
    From: () => 0,
    To: () => 0,
    Sent: () => 0,
    Expected: () => 0,
    Date: () => 0
  };

  public readonly sorter$ = new BehaviorSubject<TuiComparator<TableRow>>(this.sorters.Date);

  public readonly direction$ = new BehaviorSubject<-1 | 1>(-1);

  public readonly page$ = new Subject<number>();

  public readonly size$ = new Subject<number>();

  private readonly request$ = combineLatest([
    this.sorter$.pipe(map(sorter => this.getTableRowKey(sorter, this.sorters))),
    this.direction$,
    this.page$.pipe(startWith(0)),
    this.size$.pipe(startWith(10)),
    this.tableData$
  ]).pipe(
    // zero time debounce for a case when both key and direction change
    debounceTime(0),
    map(query => query && this.getData(...query)),
    share()
  );

  public readonly loading$ = new BehaviorSubject<boolean>(true);

  public readonly visibleData$ = this.request$.pipe(
    filter(isPresent),
    map(tableRow => {
      this.loading$.next(false);
      return tableRow.filter(isPresent);
    }),
    startWith([])
  );

  public readonly total$ = this.request$.pipe(
    filter(isPresent),
    map(({ length }) => length),
    startWith(1)
  );

  private tokens: List<TokenAmount>;

  private walletAddress: string;

  private userSubscription$: Subscription;

  constructor(
    private readonly instantTradesApiService: InstantTradesApiService,
    private readonly bridgeApiService: BridgeApiService,
    private readonly tokensService: TokensService,
    private readonly authService: AuthService
  ) {}

  ngOnInit(): void {
    this.userSubscription$ = combineLatest([
      this.tokensService.tokens.pipe(
        filter(tokens => !!tokens.size),
        first()
      ),
      this.authService.getCurrentUser().pipe(filter(user => user !== undefined))
    ]).subscribe(([tokens, user]) => {
      this.tokens = tokens;
      this.walletAddress = user?.address || null;

      if (!this.walletAddress) {
        this.tableData$.next([]);
        return;
      }

      this.loading$.next(true);
      zip(this.getBridgeTransactions(), this.getInstantTradesTransactions()).subscribe(data => {
        this.tableTrades = data.flat();
        const tableData = [];
        this.tableTrades.forEach(trade => {
          tableData.push({
            Status: trade.status,
            From: trade.fromToken.blockchain,
            To: trade.toToken.blockchain,
            Sent: trade.fromToken.amount,
            Expected: trade.toToken.amount,
            Date: trade.date
          });
        });
        this.tableData$.next(tableData);
      });
    });
  }

  ngOnDestroy(): void {
    this.userSubscription$.unsubscribe();
  }

  private getInstantTradesTransactions(): Observable<TableTrade[]> {
    return this.instantTradesApiService
      .fetchSwaps(this.walletAddress)
      .pipe(map(transactions => transactions.map(trade => this.prepareInstantTradesData(trade))));
  }

  private getBridgeTransactions(): Observable<TableTrade[]> {
    return this.bridgeApiService
      .getTransactions(this.walletAddress)
      .pipe(
        map(transactions => transactions.map(transaction => this.prepareBridgeData(transaction)))
      );
  }

  private prepareInstantTradesData(trade: InstantTradesTradeData): TableTrade {
    return {
      status: trade.status.toLowerCase(),
      fromToken: this.transformToTableToken(
        trade.token.from.image,
        trade.fromAmount.toFixed(),
        trade.blockchain,
        trade.token.from.symbol
      ),
      toToken: this.transformToTableToken(
        trade.token.to.image,
        trade.fromAmount.toFixed(),
        trade.blockchain,
        trade.token.to.symbol
      ),
      date: trade.date
    };
  }

  private prepareBridgeData(trade: BridgeTableTrade): TableTrade {
    let { fromSymbol, toSymbol } = trade;
    if (
      trade.fromBlockchain === BLOCKCHAIN_NAME.POLYGON ||
      trade.toBlockchain === BLOCKCHAIN_NAME.POLYGON
    ) {
      fromSymbol = this.tokens.find(
        token =>
          token.blockchain === trade.fromBlockchain &&
          token.address.toLowerCase() === fromSymbol.toLowerCase()
      ).symbol;
      toSymbol = this.tokens.find(
        token =>
          token.blockchain === trade.toBlockchain &&
          token.address.toLowerCase() === toSymbol.toLowerCase()
      ).symbol;
    }

    return {
      status: trade.status.toLowerCase(),
      fromToken: this.transformToTableToken(
        trade.tokenImage,
        trade.fromAmount,
        trade.fromBlockchain,
        fromSymbol
      ),
      toToken: this.transformToTableToken(
        trade.tokenImage,
        trade.toAmount,
        trade.toBlockchain,
        toSymbol
      ),
      date: new Date(trade.updateTime)
    };
  }

  private transformToTableToken(image, amount, blockchain, symbol): TableToken {
    return {
      image,
      amount,
      blockchain,
      symbol
    };
  }

  private getTableRowKey(
    sorter: TuiComparator<TableRow>,
    dictionary: Record<TableRowKey, TuiComparator<TableRow>>
  ): TableRowKey {
    const pair = Object.entries(dictionary).find(
      (item): item is [TableRowKey, TuiComparator<TableRow>] => item[1] === sorter
    );
    return pair ? pair[0] : 'Date';
  }

  private getData(
    key: TableRowKey,
    direction: -1 | 1,
    page: number,
    size: number,
    tableData: TableRow[]
  ): ReadonlyArray<TableRow | null> {
    const start = page * size;
    const end = start + size;
    return [...tableData]
      .sort(this.sortBy(key, direction))
      .map((user, index) => (index >= start && index < end ? user : null));
  }

  private sortBy(key: TableRowKey, direction: -1 | 1): TuiComparator<TableRow> {
    return (a, b) => direction * defaultSort(a[key], b[key]);
  }

  public getTableTrade(tableRow: TableRow): TableTrade {
    return this.tableTrades.find(trade => trade.date === tableRow.Date);
  }
}
