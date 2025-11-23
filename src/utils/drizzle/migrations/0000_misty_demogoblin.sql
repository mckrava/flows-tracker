CREATE TYPE "public"."network" AS ENUM('ethereum-mainnet', 'moonbeam');--> statement-breakpoint
CREATE TYPE "public"."transactionStatus" AS ENUM('pending', 'completed', 'stale');--> statement-breakpoint
CREATE TABLE "processing_status" (
	"network" "network" NOT NULL,
	"latest_processed_block" integer NOT NULL,
	CONSTRAINT "processing_status_network_pk" PRIMARY KEY("network")
);
--> statement-breakpoint
CREATE TABLE "transfer" (
	"sequence" varchar NOT NULL,
	"from" varchar NOT NULL,
	"to" varchar NOT NULL,
	"status" varchar NOT NULL,
	"originTxHash" varchar,
	"destinationTxHash" varchar,
	"originChain" varchar,
	"destinationChain" varchar,
	"createdAt" timestamp,
	"updatedAt" timestamp,
	CONSTRAINT "transfer_sequence_from_to_pk" PRIMARY KEY("sequence","from","to")
);
