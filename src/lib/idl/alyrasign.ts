import { PublicKey } from '@solana/web3.js';

// Types pour le programme
export interface AlyraSignAccountData {
  requester: PublicKey;
  role: string;
  message: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  createdAt: number;
}

export interface AlyraSignAccounts {
  AccessRequest: AlyraSignAccountData;
}

// Programme ID - Utiliser la variable d'environnement
export const PROGRAM_ID = new PublicKey(
  process.env.NEXT_PUBLIC_SOLANA_PROGRAM_ID || "11111111111111111111111111111111"
);

// IDL du programme
export const IDL = {
  version: "0.1.0",
  name: "alyrasign",
  instructions: [
    {
      name: "createAccessRequest",
      accounts: [
        {
          name: "requester",
          isMut: false,
          isSigner: true
        },
        {
          name: "accessRequest",
          isMut: true,
          isSigner: false
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false
        }
      ],
      args: [
        {
          name: "role",
          type: "string"
        },
        {
          name: "message",
          type: "string"
        }
      ]
    }
  ],
  accounts: [
    {
      name: "AccessRequest",
      type: {
        kind: "struct",
        fields: [
          {
            name: "requester",
            type: "publicKey"
          },
          {
            name: "role",
            type: "string"
          },
          {
            name: "message",
            type: "string"
          },
          {
            name: "status",
            type: {
              defined: "RequestStatus"
            }
          },
          {
            name: "createdAt",
            type: "i64"
          }
        ]
      }
    }
  ],
  types: [
    {
      name: "RequestStatus",
      type: {
        kind: "enum",
        variants: [
          {
            name: "Pending"
          },
          {
            name: "Approved"
          },
          {
            name: "Rejected"
          }
        ]
      }
    }
  ],
  errors: [
    {
      code: 6000,
      name: "InvalidRequestStatus",
      msg: "Invalid request status"
    }
  ],
  metadata: {
    address: process.env.NEXT_PUBLIC_SOLANA_PROGRAM_ID || "11111111111111111111111111111111"
  }
} as const; 