import { KeyringPair } from '@polkadot/keyring/types';
import { EXTRINSIC_VERSION } from '@polkadot/types/extrinsic/v4/Extrinsic';
import { createMetadata, OptionsWithMeta } from '@substrate/txwrapper-polkadot';
import fetch from 'node-fetch';
import 'dotenv/config';

/**
 * Send a JSONRPC request to the node .
 *
 * @param method - The JSONRPC request method.
 * @param params - The JSONRPC request params.
 */
export function rpcToDefaultNode(
  method: string,
  params: any[] = [],
): Promise<any> {
  return fetch(process.env.POLKADOT_RPC_API, {
    body: JSON.stringify({
      id: 1,
      jsonrpc: '2.0',
      method,
      params,
    }),
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
  })
    .then((response) => response.json())
    .then(({ error, result }) => {
      if (error) {
        throw new Error(
          `${error.code} ${error.message}: ${JSON.stringify(error.data)}`,
        );
      }

      return result;
    });
}

/**
 * Signing function. Implement this on the OFFLINE signing device.
 *
 * @param pair - The signing pair.
 * @param signingPayload - Payload to sign.
 * @returns A signed ExtrinsicPayload returns a signature with the type `0x${string}` via polkadot-js.
 */
export function signWith(
  pair: KeyringPair,
  signingPayload: string,
  options: OptionsWithMeta,
): `0x${string}` {
  const { registry, metadataRpc } = options;
  // Important! The registry needs to be updated with latest metadata, so make
  // sure to run `registry.setMetadata(metadata)` before signing.
  registry.setMetadata(createMetadata(registry, metadataRpc));

  const { signature } = registry
    .createType('ExtrinsicPayload', signingPayload, {
      version: EXTRINSIC_VERSION,
    })
    .sign(pair);

  return signature as unknown as `0x${string}`;
}

/**
 * function as the name and also implement like :
 * const hex = Uint8Array.from(Buffer.from(hexString, 'hex'));
 *
 * const backToHexString = Buffer.from(hex).toString('hex');
 *
 *
 * @param hexString - the hex string
 */
export function uint8ArrayfromHexString(hexString: string): Uint8Array {
  return Uint8Array.from(
    hexString.match(/.{1,2}/g).map((byte) => parseInt(byte, 16)),
  );
}

export function uint8ArrayToHexString(bytes: Uint8Array): string {
  return bytes.reduce(
    (str, byte) => str + byte.toString(16).padStart(2, '0'),
    '',
  );
}
