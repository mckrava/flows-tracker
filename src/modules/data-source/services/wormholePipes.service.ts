import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import {
  evmDecoder,
  EvmPortalData,
  evmPortalSource,
} from '@subsquid/pipes/evm';
import { portalSqliteCache } from '@subsquid/pipes/portal-cache/node';
import * as wormholeCoreBridgeAbi from '../../../abi/generated/wormhole-core-bridge';
import * as wormholeBridgeImplAbi from '../../../abi/generated/wormhole-bridge-implementation';
import { CompositePipe, createTarget } from '@subsquid/pipes';
import { AppConfig } from '../../config';
import { BatchCtx } from '@sqd-pipes/pipes';

@Injectable()
export class WormholePipesService implements OnApplicationBootstrap {
  constructor(public appConfig: AppConfig) {}

  onApplicationBootstrap() {
    // This runs after the application has fully started
    console.log('Application has bootstrapped!');
    // Add your initialization logic here

    // this.runEthereumPipes().then();
    this.runMoonbeamPipes().then();
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

  private getEvmDecoders({
    from,
    to,
    bridgeImplContractAddress,
    bridgeCoreContractAddress,
  }: {
    from: number;
    to?: number;
    bridgeCoreContractAddress: string;
    bridgeImplContractAddress: string;
  }) {
    return {
      wormholeBridgeCore: evmDecoder({
        contracts: [bridgeCoreContractAddress], // Wormhole: Wormhole Token Bridge Relayer
        events: {
          logMessagePublished: wormholeCoreBridgeAbi.events.LogMessagePublished,
        },
        range: { from, ...(to ? { to } : {}) },
      }),
      wormholeBridgeImplementation: evmDecoder({
        contracts: [bridgeImplContractAddress], // Wormhole: Wormhole Token Bridge Implementation
        events: {
          transferRedeemed: wormholeBridgeImplAbi.events.TransferRedeemed,
        },
        range: { from, ...(to ? { to } : {}) },
      }),
    };
  }

  async runEthereumPipes() {
    await evmPortalSource({
      portal: this.appConfig.PORTAL_URL_ETHEREUM,
    })
      .pipeComposite(
        this.getEvmDecoders({
          from: 23_456_243,
          to: 23_849_715,
          bridgeCoreContractAddress:
            '0x98f3c9e6E3fAce36bAAd05FE09d375Ef1464288B',
          bridgeImplContractAddress:
            '0xCafd2f0A35A4459fA40C0517e17e6fA2939441CA',
        }),
      )
      .pipe((d, ctx) => {
        // TODO pipe should return parsed events
        return {
          logMessagePublishedEvents: d.wormholeBridgeCore.logMessagePublished,
          transferRedeemedRawEvents:
            d.wormholeBridgeImplementation.transferRedeemed,
        };
      })
      .pipe((d) => {
        if (d.logMessagePublishedEvents.length > 0)
          console.dir(d.logMessagePublishedEvents, { depth: null });
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
      );
  }

  async runMoonbeamPipes() {
    await evmPortalSource({
      portal: this.appConfig.PORTAL_URL_MOONBEAM,
    })
      .pipeComposite(
        this.getEvmDecoders({
          // from: 13_444_110,
          from: 12_444_110,
          to: 13_430_860,
          bridgeCoreContractAddress:
            '0xC8e2b0cD52Cf01b0Ce87d389Daa3d414d4cE29f3',
          bridgeImplContractAddress:
            '0xB1731c586ca89a23809861c6103F0b96B3F57D92',
        }),
      )
      .pipe((d, ctx) => {
        // TODO pipe should return parsed events
        return {
          logMessagePublishedEvents: d.wormholeBridgeCore.logMessagePublished,
          transferRedeemedRawEvents:
            d.wormholeBridgeImplementation.transferRedeemed,
        };
      })
      .pipe((d) => {
        // if (d.logMessagePublishedEvents.length > 0)
        //   console.dir(d.logMessagePublishedEvents, { depth: null });
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
      );
  }
}
