import MerkleTree from 'src/app/features/airdrop/utils/merkle-tree';
import { BigNumber, utils } from 'ethers';

export default class BalanceTree {
  private readonly tree: MerkleTree;

  constructor(balances: { account: string; amount: string }[]) {
    this.tree = new MerkleTree(
      balances.map(({ account, amount }, index) => {
        return BalanceTree.toNode(index, account, amount);
      })
    );
  }

  public static verifyProof(
    index: number | BigNumber,
    account: string,
    amount: string,
    proof: Buffer[],
    root: Buffer
  ): boolean {
    let pair = BalanceTree.toNode(index, account, amount);
    for (const item of proof) {
      pair = MerkleTree.combinedHash(pair, item);
    }

    return pair.equals(root);
  }

  public static toNode(index: number | BigNumber, account: string, amount: string): Buffer {
    return Buffer.from(
      utils
        .solidityKeccak256(['uint256', 'address', 'uint256'], [index, account, amount])
        .substr(2),
      'hex'
    );
  }

  public getProof(index: number | BigNumber, account: string, amount: string): string[] {
    const node = BalanceTree.toNode(index, account, amount);
    return this.tree.getHexProof(node);
  }
}
