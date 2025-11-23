import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { evmDecoder, evmPortalSource } from '@subsquid/pipes/evm';
import * as wormholeCoreBridgeAbi from '../../../abi/generated/wormhole-core-bridge';
import * as wormholeBridgeImplAbi from '../../../abi/generated/wormhole-bridge-implementation';
import * as genericErc20Abi from '../../../abi/generated/generic-erc-20';
import { createTarget } from '@subsquid/pipes';
import { AppConfig } from '../../config';
import { transferTable } from '../../../utils/drizzle/schemas';
import { DrizzleService } from '../../drizzle/drizzle.service';
import {
  Chain,
  DecoratedEvents,
  DecoratedEventWithMetadata,
  LogMessagePublishedEventDecorated,
  TransferRedeemedEventDecorated,
} from './types';
import { eq, inArray, and } from 'drizzle-orm';

@Injectable()
export class WormholePipesService implements OnApplicationBootstrap {
  constructor(
    public appConfig: AppConfig,
    private drizzleService: DrizzleService,
  ) {}

  onApplicationBootstrap() {
    console.log('Application has bootstrapped!');

    this.runEthereumPipes().then();
    this.runMoonbeamPipes().then();
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
      erc20: evmDecoder({
        events: {
          transfer: genericErc20Abi.events.Transfer,
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
          // TODO from value should be dynamic
          from: 23_456_243,
          // from: 23_847_481,
          // to: 23_847_481,
          bridgeCoreContractAddress:
            '0x98f3c9e6E3fAce36bAAd05FE09d375Ef1464288B',
          bridgeImplContractAddress:
            '0xCafd2f0A35A4459fA40C0517e17e6fA2939441CA',
        }),
      )
      .pipe((d) => {
        const msgPubEventsList: DecoratedEventWithMetadata<LogMessagePublishedEventDecorated>[] =
          [];
        const transferRedeamedEventsList: DecoratedEventWithMetadata<TransferRedeemedEventDecorated>[] =
          [];

        for (const msgPubEventData of d.wormholeBridgeCore
          .logMessagePublished) {
          try {
            const eventPayload = this.parseAdditionalPayloadEthereumEvent(
              msgPubEventData.event.payload,
            );

            if (
              !eventPayload.destChainId ||
              eventPayload.destChainId !== '16'
            ) {
              continue;
            }

            msgPubEventsList.push({
              metadata: {
                block: {
                  number: msgPubEventData.block.number,
                  hash: msgPubEventData.block.hash,
                  timestamp: msgPubEventData.timestamp.getTime(),
                  chain: Chain.ETHEREUM,
                },
                logIndex: msgPubEventData.rawEvent.logIndex,
                transactionIndex: msgPubEventData.rawEvent.transactionIndex,
                transactionHash:
                  msgPubEventData.rawEvent.transactionHash.toString(),
              },
              event: {
                sequence: msgPubEventData.event.sequence.toString(),
                destinationChain: eventPayload.destChainId!,
                senderAccountAddress: msgPubEventData.event.sender,
                destinationAccountAddress:
                  eventPayload.destinationAccountAddress!,
              },
            });
          } catch (e) {}
        }

        for (const msgPubEventData of d.wormholeBridgeImplementation
          .transferRedeemed) {
          if (
            !msgPubEventData.event.emitterChainId ||
            msgPubEventData.event.emitterChainId !== 16
          ) {
            continue;
          }

          transferRedeamedEventsList.push({
            metadata: {
              block: {
                number: msgPubEventData.block.number,
                hash: msgPubEventData.block.hash,
                timestamp: msgPubEventData.timestamp.getTime(),
                chain: Chain.ETHEREUM,
              },
              logIndex: msgPubEventData.rawEvent.logIndex,
              transactionIndex: msgPubEventData.rawEvent.transactionIndex,
              transactionHash:
                msgPubEventData.rawEvent.transactionHash.toString(),
            },
            event: {
              sequence: msgPubEventData.event.sequence.toString(),
              emitterChainId: msgPubEventData.event.emitterChainId,
              senderAccountAddress: msgPubEventData.event.emitterAddress,
            },
          });
        }

        return {
          logMessagePublishedEvents: msgPubEventsList,
          transferRedeemedRawEvents: transferRedeamedEventsList,
        };
      })
      .pipeTo(
        createTarget({
          write: async ({ logger, read }) => {
            for await (const { data } of read()) {
              await this.persistDecoratedData(data);
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
          // TODO from value should be dynamic
          from: 12_754_110,
          // from: 13_427_114,
          // to: 13_427_114,
          bridgeCoreContractAddress:
            '0xC8e2b0cD52Cf01b0Ce87d389Daa3d414d4cE29f3',
          bridgeImplContractAddress:
            '0xB1731c586ca89a23809861c6103F0b96B3F57D92',
        }),
      )
      .pipe((d, ctx): DecoratedEvents => {
        const msgPubEventsList: DecoratedEventWithMetadata<LogMessagePublishedEventDecorated>[] =
          [];
        const transferRedeamedEventsList: DecoratedEventWithMetadata<TransferRedeemedEventDecorated>[] =
          [];

        const transfersIndexed: Map<string, Map<number, any>> = new Map();

        for (const transfer of d.erc20.transfer) {
          if (!transfersIndexed.has(transfer.rawEvent.transactionHash)) {
            transfersIndexed.set(transfer.rawEvent.transactionHash, new Map());
          }
          transfersIndexed
            .get(transfer.rawEvent.transactionHash)!
            .set(transfer.rawEvent.logIndex, transfer);
        }

        for (const msgPubEventData of d.wormholeBridgeCore
          .logMessagePublished) {
          const relatedTransfer = transfersIndexed
            .get(msgPubEventData.rawEvent.transactionHash)
            ?.get(msgPubEventData.rawEvent.logIndex - 3);

          // Double-check if payload contains sender address
          if (
            !relatedTransfer ||
            !msgPubEventData.event.payload
              .toLowerCase()
              .includes(relatedTransfer.event.from.toLowerCase().slice(2))
          )
            continue;

          msgPubEventsList.push({
            metadata: {
              block: {
                number: msgPubEventData.block.number,
                hash: msgPubEventData.block.hash,
                timestamp: msgPubEventData.timestamp.getTime(),
                chain: Chain.MOONBEAM,
              },
              logIndex: msgPubEventData.rawEvent.logIndex,
              transactionIndex: msgPubEventData.rawEvent.transactionIndex,
              transactionHash:
                msgPubEventData.rawEvent.transactionHash.toString(),
            },
            event: {
              sequence: msgPubEventData.event.sequence.toString(),
              destinationChain: '2',
              senderAccountAddress: msgPubEventData.event.sender,
              destinationAccountAddress: relatedTransfer.event.from,
            },
          });
        }

        for (const msgPubEventData of d.wormholeBridgeImplementation
          .transferRedeemed) {
          if (
            !msgPubEventData.event.emitterChainId ||
            msgPubEventData.event.emitterChainId !== 2
          ) {
            continue;
          }

          transferRedeamedEventsList.push({
            metadata: {
              block: {
                number: msgPubEventData.block.number,
                hash: msgPubEventData.block.hash,
                timestamp: msgPubEventData.timestamp.getTime(),
                chain: Chain.ETHEREUM,
              },
              logIndex: msgPubEventData.rawEvent.logIndex,
              transactionIndex: msgPubEventData.rawEvent.transactionIndex,
              transactionHash:
                msgPubEventData.rawEvent.transactionHash.toString(),
            },
            event: {
              sequence: msgPubEventData.event.sequence.toString(),
              emitterChainId: msgPubEventData.event.emitterChainId,
              senderAccountAddress: msgPubEventData.event.emitterAddress,
            },
          });
        }

        return {
          logMessagePublishedEvents: msgPubEventsList,
          transferRedeemedRawEvents: transferRedeamedEventsList,
        };
      })
      .pipeTo(
        createTarget({
          write: async ({ logger, read }) => {
            for await (const { data } of read()) {
              await this.persistDecoratedData(data);
            }
          },
        }),
      );
  }

  private async persistDecoratedData(data: DecoratedEvents) {
    await this.persistTransfersOnMessagePublishedEvent(
      data.logMessagePublishedEvents,
    );
    await this.persistTransfersOnTransferRedeemedEvent(
      data.transferRedeemedRawEvents,
    );
  }

  private async persistTransfersOnMessagePublishedEvent(
    data: DecoratedEventWithMetadata<LogMessagePublishedEventDecorated>[],
  ) {
    const transfersOnPendingResp = await this.getTransfersOnPending(
      data.map((t) => t.event.sequence),
    );

    const transferOnPendingToUpdate = new Map(
      transfersOnPendingResp.map((t) => [t.sequence, t]),
    );

    for (const value of data) {
      if (transferOnPendingToUpdate.has(value.event.sequence)) {
        await this.drizzleService.db
          .update(transferTable)
          .set({
            status: 'completed',
            updatedAt: new Date(value.metadata.block.timestamp),
            originTxHash: value.metadata.transactionHash,
            destinationChain: value.event.destinationChain,
          })
          .where(eq(transferTable.sequence, value.event.sequence));
        continue;
      }

      await this.drizzleService.db
        .insert(transferTable)
        .values({
          sequence: value.event.sequence,
          from: value.event.senderAccountAddress,
          to: value.event.destinationAccountAddress ?? '',
          status: 'pending',
          originTxHash: value.metadata.transactionHash,
          destinationChain: value.event.destinationChain,
          createdAt: new Date(value.metadata.block.timestamp),
        })
        .returning();
    }
  }

  private async persistTransfersOnTransferRedeemedEvent(
    data: DecoratedEventWithMetadata<TransferRedeemedEventDecorated>[],
  ) {
    const transferOnPendingResp = await this.getTransfersOnPending(
      data.map((t) => t.event.sequence),
    );

    const transferOnPendingToUpdate = new Map(
      transferOnPendingResp.map((t) => [t.sequence, t]),
    );

    for (const value of data) {
      if (transferOnPendingToUpdate.has(value.event.sequence)) {
        await this.drizzleService.db
          .update(transferTable)
          .set({
            status: 'completed',
            updatedAt: new Date(value.metadata.block.timestamp),
            destinationTxHash: value.metadata.transactionHash,
            originChain: (value.event.emitterChainId ?? 0).toString(),
          })
          .where(eq(transferTable.sequence, value.event.sequence));
        continue;
      }

      await this.drizzleService.db
        .insert(transferTable)
        .values({
          sequence: value.event.sequence,
          from: value.event.senderAccountAddress,
          to: '',
          status: 'pending',
          originChain: (value.event.emitterChainId ?? 0).toString(),
          destinationTxHash: value.metadata.transactionHash,
          createdAt: new Date(value.metadata.block.timestamp),
        })
        .returning();
    }
  }

  private async getTransfersOnPending(sequences: string[]) {
    return this.drizzleService.db
      .select()
      .from(transferTable)
      .where(
        and(
          eq(transferTable.status, 'pending'),
          inArray(transferTable.sequence, sequences),
        ),
      );
  }

  private parseAdditionalPayloadEthereumEvent(payload: string) {
    if (!payload || typeof payload !== 'string') {
      throw new Error('Invalid payload: payload must be a non-empty string');
    }

    // Remove 0x prefix if present
    const cleanPayload = payload.startsWith('0x') ? payload.slice(2) : payload;

    // Validate hex string
    if (!/^[0-9a-fA-F]*$/.test(cleanPayload)) {
      throw new Error('Invalid payload: payload must be a valid hex string');
    }

    // Validate minimum length
    // We need at least 202 characters for chain ID + 64 for account address
    const MIN_LENGTH = 266;
    if (cleanPayload.length < MIN_LENGTH) {
      throw new Error(
        `Invalid payload: payload is too short (expected at least ${MIN_LENGTH} characters, got ${cleanPayload.length})`,
      );
    }

    try {
      // Parse destination chain ID
      // Located at position 200-202 (2 hex characters = 1 byte)
      // Represents the chain ID in hexadecimal, converted to decimal string
      const destChainIdHex = cleanPayload.slice(200, 202);
      const destChainId = parseInt(destChainIdHex, 16).toString();

      if (isNaN(parseInt(destChainId))) {
        throw new Error(
          'Failed to parse destination chain ID: not a valid number',
        );
      }

      // Parse destination contract address
      // Located at position 158-198 (40 hex characters = 20 bytes)
      // This is the Ethereum address of the destination contract
      const destContractAddress = cleanPayload.slice(158, 198);

      if (destContractAddress.length !== 40) {
        throw new Error(
          'Failed to parse destination contract address: invalid length',
        );
      }

      if (!/^[0-9a-fA-F]{40}$/.test(destContractAddress)) {
        throw new Error(
          'Failed to parse destination contract address: invalid hex format',
        );
      }

      // Parse destination account address on Hydration
      // Located at the end of payload (last 64 hex characters = 32 bytes)
      // This is the account address on the Hydration chain
      const destinationAccountAddress = cleanPayload.slice(-64);

      if (destinationAccountAddress.length !== 64) {
        throw new Error(
          'Failed to parse destination account address: invalid length',
        );
      }

      if (!/^[0-9a-fA-F]{64}$/.test(destinationAccountAddress)) {
        throw new Error(
          'Failed to parse destination account address: invalid hex format',
        );
      }

      return {
        destChainId,
        destContractAddress,
        destinationAccountAddress,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(
          `Failed to parse contract event payload: ${error.message}`,
        );
      }
      throw new Error('Failed to parse contract event payload: unknown error');
    }
  }
}
