import { TestBed } from '@angular/core/testing';

import { AirdropService } from './airdrop.service';
import { EvmWeb3Pure } from 'rubic-sdk';

describe('AirdropService', () => {
  let service: AirdropService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AirdropService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should not return get proof by address', () => {
    const proofFromEmpty = service.getProofByAddress(EvmWeb3Pure.EMPTY_ADDRESS);

    expect(proofFromEmpty).toBeNull();

    const proofFromWrong = service.getProofByAddress('Wrong');

    expect(proofFromWrong).toBeNull();
  });

  it('should return get proof by address', () => {
    const address = '0x0Cf498aCeC941562C694BD98A5Ab4Bbf3Ce98169';
    const proof = service.getProofByAddress(address);

    expect(proof).toBeDefined();
    // @TODO add to equal hardcoded proof
  });
});
