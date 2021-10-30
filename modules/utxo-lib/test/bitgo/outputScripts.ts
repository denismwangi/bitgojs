import * as assert from 'assert';

import { createOutputScript2of3, createOutputScriptP2shP2pk, scriptTypes2Of3 } from '../../src/bitgo/outputScripts';
import { getKeyTriple } from '../integration_local_rpc/generate/outputScripts.util';
import { ECPair, networks } from 'bitcoinjs-lib';

describe('createOutputScript2of3()', function () {
  const keys = getKeyTriple('utxo');
  const pubkeys = keys.map((k) => k.publicKey) as [Buffer, Buffer, Buffer];
  const p2ms =
    '522103f1667be6e8b8eb0c980155dfcda742affeeb0b0ca10969c54152713185' +
    '6d65c9210305902cf20a0bbc9274e62414aa4afea8c96e3e83abb5233d72355c' +
    '27d7de660a2103c79183d6641585179d25bbc091b2a7fce86c9f15d311e5aca0' +
    'a020478d8f208753ae';
  const p2wsh = '002095ecaacb606b9ece3821c0111c0a1208dd1d35192809bf8cf6cbad4bbeaca67f';
  const p2tr = '51203f29b88ff391432ffaa2475497ec0eebe28e19b0dca62a620526dbc21ffae307';

  scriptTypes2Of3.forEach((scriptType) => {
    it(`creates output script (type=${scriptType})`, function () {
      const { scriptPubKey, redeemScript, witnessScript } = createOutputScript2of3(pubkeys, scriptType);

      switch (scriptType) {
        case 'p2sh':
          assert.strictEqual(scriptPubKey.toString('hex'), 'a91491590bed8198ea7ca57ba68ab7cbfabc656cbbaf87');
          assert.strictEqual(redeemScript && redeemScript.toString('hex'), p2ms);
          assert.strictEqual(witnessScript, undefined);
          break;
        case 'p2shP2wsh':
          assert.strictEqual(scriptPubKey.toString('hex'), 'a9140312dd6f801ab11d53c35f6a2bdac9c602a55d9d87');
          assert.strictEqual(redeemScript && redeemScript.toString('hex'), p2wsh);
          assert.strictEqual(witnessScript && witnessScript.toString('hex'), p2ms);
          break;
        case 'p2wsh':
          assert.strictEqual(scriptPubKey.toString('hex'), p2wsh);
          assert.strictEqual(redeemScript, undefined);
          assert.strictEqual(witnessScript && witnessScript.toString('hex'), p2ms);
          break;
        case 'p2tr':
          assert.strictEqual(scriptPubKey.toString('hex'), p2tr);
          // TODO: validate script control blocks once they are returned by payments.p2tr()
          break;
        default:
          throw new Error(`unexpected type ${scriptType}`);
      }
    });
  });
});

describe('createOutputScriptP2shP2pk', function () {
  it('create output script p2shP2pk', function () {
    const keypair = ECPair.fromWIF('cTLxw4KC55LQfFj3eZz51NpWX1j2ja4WkbQFbHaTuaRkSFGeJ4yS', networks.testnet);
    const { scriptPubKey, redeemScript, witnessScript } = createOutputScriptP2shP2pk(keypair.publicKey);
    assert.strictEqual(scriptPubKey.toString('hex'), 'a914172dcc4e025361d951a9511c670973a4e3720c9887');
    assert.strictEqual(
      redeemScript?.toString('hex'),
      '210219da48412c2268865fe8c126327d1b12eee350a3b69eb09e3323cc9a11828945ac'
    );
    assert.strictEqual(witnessScript, undefined);
  });
});
