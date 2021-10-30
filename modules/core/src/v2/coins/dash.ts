/**
 * @prettier
 */
import * as utxolib from '@bitgo/utxo-lib';
import * as Bluebird from 'bluebird';
const co = Bluebird.coroutine;
import * as request from 'superagent';

import { AbstractUtxoCoin, UtxoNetwork } from './abstractUtxoCoin';
import { BitGo } from '../../bitgo';
import { BaseCoin } from '../baseCoin';
import * as common from '../../common';
import { toBitgoRequest } from '../../api';

export class Dash extends AbstractUtxoCoin {
  constructor(bitgo: BitGo, network?: UtxoNetwork) {
    super(bitgo, network || utxolib.networks.dash);
  }

  static createInstance(bitgo: BitGo): BaseCoin {
    return new Dash(bitgo);
  }

  getChain(): string {
    return 'dash';
  }

  getFamily(): string {
    return 'dash';
  }

  getFullName(): string {
    return 'Dash';
  }

  supportsBlockTarget(): boolean {
    return false;
  }

  recoveryBlockchainExplorerUrl(url: string): string {
    return common.Environments[this.bitgo.env].dashExplorerBaseUrl + url;
  }

  getAddressInfoFromExplorer(addressBase58: string): Bluebird<any> {
    return co(function* getAddressInfoFromExplorer() {
      const addrInfo = yield toBitgoRequest(
        request.get(this.recoveryBlockchainExplorerUrl(`/addr/${addressBase58}`))
      ).result();

      (addrInfo as any).txCount = (addrInfo as any).txApperances;
      (addrInfo as any).totalBalance = (addrInfo as any).balanceSat;

      return addrInfo;
    }).call(this);
  }

  getUnspentInfoFromExplorer(addressBase58: string): Bluebird<any> {
    return co(function* getUnspentInfoFromExplorer() {
      const unspents = yield toBitgoRequest(
        request.get(this.recoveryBlockchainExplorerUrl(`/addr/${addressBase58}/utxo`))
      ).result();

      (unspents as any).forEach(function processUnspent(unspent) {
        unspent.amount = unspent.satoshis;
        unspent.n = unspent.vout;
      });

      return unspents;
    }).call(this);
  }
}
