import { keccak256 } from 'ethers/lib/utils';

export default class MerkleTree {
  private readonly elements: Buffer[];

  private readonly bufferElementPositionIndex: { [hexElement: string]: number };

  private readonly layers: Buffer[][];

  constructor(elements: Buffer[]) {
    this.elements = [...elements];
    this.elements.sort(Buffer.compare);
    this.elements = MerkleTree.bufDedup(this.elements);

    this.bufferElementPositionIndex = this.elements.reduce<{ [hexElement: string]: number }>(
      (memo, el, index) => {
        memo[el.toString('hex')] = index;
        return memo;
      },
      {}
    );

    this.layers = this.getLayers(this.elements);
  }

  public getLayers(elements: Buffer[]): Buffer[][] {
    if (elements.length === 0) {
      throw new Error('empty tree');
    }

    const layers = [];
    layers.push(elements);

    while (layers[layers.length - 1].length > 1) {
      layers.push(this.getNextLayer(layers[layers.length - 1]));
    }

    return layers;
  }

  public getNextLayer(elements: Buffer[]): Buffer[] {
    return elements.reduce<Buffer[]>((layer, el, idx, arr) => {
      if (idx % 2 === 0) {
        layer.push(MerkleTree.combinedHash(el, arr[idx + 1]));
      }

      return layer;
    }, []);
  }

  static combinedHash(first: Buffer, second: Buffer): Buffer {
    if (!first) {
      return second;
    }
    if (!second) {
      return first;
    }

    return Buffer.from(keccak256(MerkleTree.sortAndConcat(first, second)), 'hex');
  }

  public getRoot(): Buffer {
    return this.layers[this.layers.length - 1][0];
  }

  public getProof(el: Buffer): Buffer[] {
    let idx = this.bufferElementPositionIndex[el.toString('hex')];

    if (typeof idx !== 'number') {
      throw new Error('Element does not exist in Merkle tree');
    }

    return this.layers.reduce((proof, layer) => {
      const pairElement = MerkleTree.getPairElement(idx, layer);

      if (pairElement) {
        proof.push(pairElement);
      }

      idx = Math.floor(idx / 2);

      return proof;
    }, []);
  }

  public getHexProof(el: Buffer): string[] {
    const proof = this.getProof(el);

    return MerkleTree.bufArrToHexArr(proof);
  }

  private static getPairElement(idx: number, layer: Buffer[]): Buffer | null {
    const pairIdx = idx % 2 === 0 ? idx + 1 : idx - 1;

    if (pairIdx < layer.length) {
      return layer[pairIdx];
    } else {
      return null;
    }
  }

  private static bufDedup(elements: Buffer[]): Buffer[] {
    return elements.filter((el, idx) => {
      return idx === 0 || !elements[idx - 1].equals(el);
    });
  }

  private static bufArrToHexArr(arr: Buffer[]): string[] {
    if (arr.some(el => !Buffer.isBuffer(el))) {
      throw new Error('Array is not an array of buffers');
    }

    const proofs = arr.map(el => '0x' + el.toString('hex'));
    return proofs;
  }

  private static sortAndConcat(...args: Buffer[]): Buffer {
    return Buffer.concat([...args].sort(Buffer.compare));
  }
}
