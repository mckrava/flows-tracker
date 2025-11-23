import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { evmDecoder, evmPortalSource } from '@subsquid/pipes/evm';
import { portalSqliteCache } from '@subsquid/pipes/portal-cache/node';
import * as wormholeCoreBridgeAbi from './abi/generated/wormhole-core-bridge';
import * as wormholeBridgeImplAbi from './abi/generated/wormhole-bridge-implementation';
import { createTarget } from '@subsquid/pipes';

@Injectable()
export class WormholeEthereumPipesService implements OnApplicationBootstrap {
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
        return {
          error: 'Payload too short for type 1',
          payloadType,
          buffer: payloadHex,
        };
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
        return {
          error: 'Payload too short for type 3',
          payloadType,
          buffer: payloadHex,
        };
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
    })
      .pipeComposite({
        wormholeBridgeCore: evmDecoder({
          // profiler: { id: 'Decoding' },
          // contracts: ['0xCafd2f0A35A4459fA40C0517e17e6fA2939441CA'], // Wormhole: Wormhole Token Bridge Relayer
          contracts: ['0x98f3c9e6E3fAce36bAAd05FE09d375Ef1464288B'], // Wormhole: Wormhole Token Bridge Relayer
          events: {
            logMessagePublished:
              wormholeCoreBridgeAbi.events.LogMessagePublished,
          },
          range: { from: 23_851_000 },
        }),
        wormholeBridgeImplementation: evmDecoder({
          contracts: ['0xCafd2f0A35A4459fA40C0517e17e6fA2939441CA'], // Wormhole: Wormhole Token Bridge Implementation
          // contracts: ['0x3ee18B2214AFF97000D974cf647E7C347E8fa585'], // Wormhole: Wormhole Token Bridge Implementation
          events: {
            transferRedeemed: wormholeBridgeImplAbi.events.TransferRedeemed,
          },
          range: { from: 23_851_000 },
        }),
      })
      .pipe((d) => {
        // TODO pipe should return parsed events
        return {
          logMessagePublishedEvents: d.wormholeBridgeCore.logMessagePublished,
          transferRedeemedRawEvents:
            d.wormholeBridgeImplementation.transferRedeemed,
        };
      })
      .pipe((d) => {
        // if (d.logMessagePublishedEvents.length > 0)
        // console.dir(d.logMessagePublishedEvents, { depth: null });
        if (d.transferRedeemedRawEvents.length > 0)
          console.dir(d.transferRedeemedRawEvents, { depth: null });
        return d;
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
