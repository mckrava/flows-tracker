export type LogMessagePublishedEventDecorated = {
  sequence: string;
  destinationChain: string;
  destinationContractAddress?: string;
  senderAccountAddress: string;
  destinationAccountAddress: string;
};

export type TransferRedeemedEventDecorated = {
  sequence: string;
  emitterChainId: number;
  senderAccountAddress: string;
};

export enum Chain {
  ETHEREUM = 'ethereum',
  MOONBEAM = 'moonbeam',
}

export type LogEventMetadata = {
  block: {
    chain: Chain;
    number: number;
    hash: string;
    timestamp: number;
  };
  logIndex: number;
  transactionIndex: number;
  transactionHash: string;
};

export type DecoratedEventWithMetadata<E extends { sequence: string }> = {
  metadata: LogEventMetadata;
  event: E;
};

export type DecoratedEvents = {
  logMessagePublishedEvents: DecoratedEventWithMetadata<LogMessagePublishedEventDecorated>[];
  transferRedeemedRawEvents: DecoratedEventWithMetadata<TransferRedeemedEventDecorated>[];
};
export interface ParsedEventPayload {
  destChainId: string;
  destContractAddress: string;
  destinationAccountAddress: string;
}
