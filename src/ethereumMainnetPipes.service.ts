import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
// import {
//   commonAbis,
//   createEvmDecoder,
//   createEvmPortalSource,
// } from '@sqd-pipes/pipes/evm';
// import { clickhouseTarget } from '@subsquid/pipes/targets/clickhouse'
// import { clickhouseTarget } from '@subsquid/pipes/targets/drizzle/node-postgres'
import { evmDecoder, evmPortalSource } from '@subsquid/pipes/evm';
import { portalSqliteCache } from '@subsquid/pipes/portal-cache/node';
import * as wormholeAbi from './abi/generated/wormholeAbi';
import { createTarget } from '@subsquid/pipes';
import {
  bool,
  _void,
  str,
  u8,
  u32,
  u128,
  Struct,
  Vector,
  compact,
  Tuple,
  Codec,
  u256,
} from 'scale-ts';

// const logMessagePublishedPayload = Struct({
//   sourceChain: 6,
//   orderSender: Vector(u32),
//   redeemer: Vector(u32),
//   redeemerMessage: new Uint8Array([0x01, 0x02, 0x03]),
// });

@Injectable()
export class EthereumMainnetPipesService implements OnApplicationBootstrap {
  onApplicationBootstrap() {
    // This runs after the application has fully started
    console.log('Application has bootstrapped!');
    // Add your initialization logic here

    this.runPipes().then();
  }

  private decodeWormholePayload(payloadHex: string) {
    // Remove '0x' prefix if present
    const payload = payloadHex.startsWith('0x')
      ? payloadHex.slice(2)
      : payloadHex;
    const buffer = Buffer.from(payload, 'hex');

    console.log(`Payload length: ${buffer.length} bytes`);

    let offset = 0;

    // Read payload type (1 byte)
    if (buffer.length < offset + 1) {
      return { error: 'Payload too short to read type', buffer: payloadHex };
    }
    const payloadType = buffer.readUInt8(offset);
    offset += 1;

    // Different payload types have different structures
    // Type 1: Token transfer
    // Type 3: Token transfer with payload

    if (payloadType === 1) {
      // Standard token transfer (101 bytes total)
      if (buffer.length < 101) {
        return { error: 'Payload too short for type 1', payloadType, buffer: payloadHex };
      }

      // Read amount (32 bytes)
      const amount = BigInt(
        '0x' + buffer.subarray(offset, offset + 32).toString('hex'),
      );
      offset += 32;

      // Read token address (32 bytes)
      const tokenAddress =
        '0x' + buffer.subarray(offset + 12, offset + 32).toString('hex');
      offset += 32;

      // Read token chain (2 bytes)
      const tokenChain = buffer.readUInt16BE(offset);
      offset += 2;

      // Read recipient (32 bytes)
      const recipient =
        '0x' + buffer.subarray(offset + 12, offset + 32).toString('hex');
      offset += 32;

      // Read recipient chain (2 bytes)
      const recipientChain = buffer.readUInt16BE(offset);
      offset += 2;

      // Read fee (32 bytes)
      const fee = BigInt(
        '0x' + buffer.subarray(offset, offset + 32).toString('hex'),
      );
      offset += 32;

      return {
        payloadType,
        amount,
        tokenAddress,
        tokenChain,
        recipient,
        recipientChain,
        fee,
      };
    } else if (payloadType === 3) {
      // Token transfer with payload (133+ bytes)
      if (buffer.length < 133) {
        return { error: 'Payload too short for type 3', payloadType, buffer: payloadHex };
      }

      // Read amount (32 bytes)
      const amount = BigInt(
        '0x' + buffer.subarray(offset, offset + 32).toString('hex'),
      );
      offset += 32;

      // Read token address (32 bytes)
      const tokenAddress =
        '0x' + buffer.subarray(offset + 12, offset + 32).toString('hex');
      offset += 32;

      // Read token chain (2 bytes)
      const tokenChain = buffer.readUInt16BE(offset);
      offset += 2;

      // Read recipient (32 bytes)
      const recipient =
        '0x' + buffer.subarray(offset + 12, offset + 32).toString('hex');
      offset += 32;

      // Read recipient chain (2 bytes)
      const recipientChain = buffer.readUInt16BE(offset);
      offset += 2;

      // Read sender address (32 bytes)
      const senderAddress =
        '0x' + buffer.subarray(offset + 12, offset + 32).toString('hex');
      offset += 32;

      // Read additional payload (remaining bytes)
      const additionalPayload = buffer.subarray(offset).toString('hex');

      return {
        payloadType,
        amount,
        tokenAddress,
        tokenChain,
        recipient,
        recipientChain,
        senderAddress,
        additionalPayload: '0x' + additionalPayload,
      };
    } else {
      // Unknown payload type - return raw data
      return {
        payloadType,
        unknown: true,
        rawPayload: payloadHex,
        bufferLength: buffer.length,
      };
    }
  }

  async runPipes() {
    await evmPortalSource({
      portal: 'https://portal.sqd.dev/datasets/ethereum-mainnet',
      // cache: portalSqliteCache({
      //   path: './evm-source.cache.sqlite',
      // }),
    })
      .pipe(
        evmDecoder({
          // profiler: { id: 'Decoding' },
          // contracts: ['0xCafd2f0A35A4459fA40C0517e17e6fA2939441CA'], // Wormhole: Wormhole Token Bridge Relayer
          contracts: ['0x98f3c9e6E3fAce36bAAd05FE09d375Ef1464288B'], // Wormhole: Wormhole Token Bridge Relayer
          events: {
            logMessagePublished: wormholeAbi.events.LogMessagePublished,
          },
          range: { from: 23_851_000 },
        }),
      )
      .pipe((d) => {
        // console.log('pipe-----');
        // console.dir(d, { depth: null });
        // console.log(d);
        return d.logMessagePublished;
      })
      .pipe((d) => {
        for (const { event } of d) {
          console.log(
            `event >>> sender ${event.sender} / ${event.sequence.toString()}`,
          );
          console.dir(this.decodeWormholePayload(event.payload), {
            depth: null,
          });
        }
        // return true;
      })
      .pipeTo(
        createTarget({
          write: async ({ logger, read }) => {
            for await (const { data } of read()) {
              // logger.info({ data }, 'data');
            }
          },
        }),
        // createTarget({
        //   write: async ({ logger, read }) => {
        //     for await (const { data } of read()) {
        //       logger.info(`Got ${data.transfer.length} transfers`);
        //     }
        //   },
        // }),
      );
  }
}
