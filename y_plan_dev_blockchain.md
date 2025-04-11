# Plan de Développement Blockchain - Projet AlyraSign

Ce document détaille les étapes de mise en œuvre des smart contracts Solana pour l'application AlyraSign, permettant de gérer les demandes d'accès, les formations, les sessions et les présences sur la blockchain.

## Étape 1 : Configuration du Projet Anchor

```bash
# Installation d'Anchor (si ce n'est pas déjà fait)
npm install -g @coral-xyz/anchor-cli

# Création d'un nouveau projet Anchor
anchor init alyrasign

# Vérification du projet
cd alyrasign
anchor test
```

**PAUSE** : Vérifiez que le projet Anchor est bien initialisé et que les tests de base fonctionnent.

## Étape 2 : Définition des Structures de Comptes pour les Demandes d'Accès

Dans le fichier `programs/alyrasign/src/lib.rs`, définissez les structures suivantes :

```rust
use anchor_lang::prelude::*;

declare_id!("YOUR_PROGRAM_ID_HERE");

// Structures de compte pour les demandes d'accès

#[account]
pub struct AccessRequestStorage {
    pub admin: Pubkey,
    pub request_count: u64,
    pub bump: u8,
}

#[account]
pub struct AccessRequest {
    pub id: u64,
    pub requester: Pubkey,
    pub role: String,
    pub message: String,
    pub status: RequestStatus,
    pub created_at: i64,
    pub updated_at: i64,
    pub bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum RequestStatus {
    Pending,
    Approved,
    Rejected,
}

#[error_code]
pub enum AccessRequestError {
    #[msg("Invalid request status")]
    InvalidRequestStatus,
}
```

**PAUSE** : Vérifiez que les structures sont correctement définies et que le projet compile sans erreurs.

## Étape 3 : Implémentation des Instructions pour la Gestion des Demandes d'Accès

Ajoutez les instructions suivantes dans le module `alyrasign` :

```rust
#[program]
pub mod alyrasign {
    use super::*;

    // Initialisation du stockage des demandes d'accès
    pub fn initialize_access_storage(ctx: Context<InitializeAccessStorage>) -> Result<()> {
        let storage = &mut ctx.accounts.storage;
        storage.admin = ctx.accounts.admin.key();
        storage.request_count = 0;
        msg!("Access Request Storage initialized");
        Ok(())
    }

    // Création d'une nouvelle demande d'accès
    pub fn create_access_request(
        ctx: Context<CreateAccessRequest>,
        role: String,
        message: String,
    ) -> Result<()> {
        let storage = &mut ctx.accounts.storage;
        let request = &mut ctx.accounts.request;
        
        // Initialisation des données de la demande
        request.requester = ctx.accounts.requester.key();
        request.role = role;
        request.message = message;
        request.status = RequestStatus::Pending;
        request.created_at = Clock::get()?.unix_timestamp;
        request.updated_at = Clock::get()?.unix_timestamp;
        request.id = storage.request_count;
        
        // Mise à jour du stockage
        storage.request_count += 1;
        
        msg!("Access request created with ID: {}", request.id);
        Ok(())
    }

    // Approbation d'une demande d'accès
    pub fn approve_access_request(ctx: Context<ProcessAccessRequest>) -> Result<()> {
        let request = &mut ctx.accounts.request;
        
        // Vérification que la demande est en attente
        require!(
            request.status == RequestStatus::Pending,
            AccessRequestError::InvalidRequestStatus
        );
        
        // Mise à jour du statut de la demande
        request.status = RequestStatus::Approved;
        request.updated_at = Clock::get()?.unix_timestamp;
        
        msg!("Access request approved for user: {}", request.requester);
        Ok(())
    }

    // Rejet d'une demande d'accès
    pub fn reject_access_request(ctx: Context<ProcessAccessRequest>) -> Result<()> {
        let request = &mut ctx.accounts.request;
        
        // Vérification que la demande est en attente
        require!(
            request.status == RequestStatus::Pending,
            AccessRequestError::InvalidRequestStatus
        );
        
        // Mise à jour du statut de la demande
        request.status = RequestStatus::Rejected;
        request.updated_at = Clock::get()?.unix_timestamp;
        
        msg!("Access request rejected for user: {}", request.requester);
        Ok(())
    }
}
```

Définissez également les structures de contexte :

```rust
// Structures de contexte

#[derive(Accounts)]
pub struct InitializeAccessStorage<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,
    
    #[account(
        init,
        payer = admin,
        space = 8 + 32 + 8 + 1, // discriminator + pubkey + counter + bump
        seeds = [b"access-storage"],
        bump
    )]
    pub storage: Account<'info, AccessRequestStorage>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(role: String, message: String)]
pub struct CreateAccessRequest<'info> {
    #[account(mut)]
    pub requester: Signer<'info>,
    
    #[account(
        seeds = [b"access-storage"],
        bump
    )]
    pub storage: Account<'info, AccessRequestStorage>,
    
    #[account(
        init,
        payer = requester,
        space = 8 + 8 + 32 + (4 + 20) + (4 + 100) + 1 + 8 + 8 + 1, // discriminator + id + pubkey + role + message + status + timestamps + bump
        seeds = [b"request", requester.key().as_ref(), storage.request_count.to_le_bytes().as_ref()],
        bump
    )]
    pub request: Account<'info, AccessRequest>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ProcessAccessRequest<'info> {
    #[account(
        seeds = [b"access-storage"],
        bump,
        constraint = storage.admin == admin.key() @ AccessRequestError::InvalidRequestStatus
    )]
    pub storage: Account<'info, AccessRequestStorage>,
    
    #[account(mut)]
    pub admin: Signer<'info>,
    
    #[account(
        mut,
        seeds = [b"request", request.requester.key().as_ref(), request.id.to_le_bytes().as_ref()],
        bump
    )]
    pub request: Account<'info, AccessRequest>,
    
    pub system_program: Program<'info, System>,
}
```

**PAUSE** : Compilez le code et assurez-vous qu'il n'y a pas d'erreurs.

## Note Importante : Gestion des Bumps avec Anchor

Pour assurer une meilleure compatibilité avec les futures versions d'Anchor et éviter les problèmes, il est recommandé de laisser Anchor gérer automatiquement les bumps plutôt que de les stocker explicitement. Cette approche est plus robuste à travers les différentes versions d'Anchor.

### Modifications à apporter au code

1. **Supprimer l'initialisation explicite des bumps** dans les instructions:
   ```rust
   // À supprimer ou remplacer:
   storage.bump = *ctx.bumps.get("storage").unwrap();
   request.bump = *ctx.bumps.get("request").unwrap();
   ```

2. **Pour les contraintes de validation PDA**, utilisez simplement `bump` sans référence explicite:
   ```rust
   #[account(
       seeds = [b"access-storage"],
       bump,  // Anchor vérifiera automatiquement avec le bump correct
   )]
   ```

Cette approche rend le code plus simple, plus facile à maintenir, et plus robuste aux changements de version d'Anchor.

## Étape 4 : Écriture des Tests pour les Demandes d'Accès

Créez un fichier `tests/alyrasign.ts` :

```typescript
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Alyrasign } from "../target/types/alyrasign";
import { assert } from "chai";

describe("alyrasign", () => {
  // Configuration du client pour utiliser le cluster local
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Alyrasign as Program<Alyrasign>;
  
  // Portefeuilles pour les tests
  const admin = anchor.web3.Keypair.generate();
  const student = anchor.web3.Keypair.generate();
  
  // PDAs
  let accessStoragePDA: anchor.web3.PublicKey;
  let requestPDA: anchor.web3.PublicKey;
  
  // Configuration : Airdrop SOL pour les comptes de test
  before(async () => {
    // Airdrop SOL to admin and student
    const adminAirdrop = await provider.connection.requestAirdrop(
      admin.publicKey,
      2 * anchor.web3.LAMPORTS_PER_SOL
    );
    
    const studentAirdrop = await provider.connection.requestAirdrop(
      student.publicKey,
      2 * anchor.web3.LAMPORTS_PER_SOL
    );
    
    // Attente des confirmations
    await provider.connection.confirmTransaction(adminAirdrop);
    await provider.connection.confirmTransaction(studentAirdrop);
    
    console.log("Admin address:", admin.publicKey.toString());
    console.log("Student address:", student.publicKey.toString());
    
    // Recherche des PDAs
    const [storagePDA] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("access-storage")],
      program.programId
    );
    accessStoragePDA = storagePDA;
    
    console.log("Access Storage PDA:", accessStoragePDA.toString());
  });

  it("Initialize Access Request Storage", async () => {
    try {
      // Appel de l'instruction initialize_access_storage
      const tx = await program.methods
        .initializeAccessStorage()
        .accounts({
          admin: admin.publicKey,
          storage: accessStoragePDA,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([admin])
        .rpc();
      
      console.log("Initialize storage transaction signature:", tx);
      
      // Récupération du compte de stockage
      const storageAccount = await program.account.accessRequestStorage.fetch(accessStoragePDA);
      
      // Vérification que le compte de stockage a été correctement initialisé
      assert.equal(storageAccount.admin.toString(), admin.publicKey.toString());
      assert.equal(storageAccount.requestCount.toString(), "0");
      
      console.log("Storage initialized successfully");
    } catch (error) {
      console.error("Error initializing storage:", error);
      throw error;
    }
  });
  
  it("Create Access Request", async () => {
    try {
      // Récupération du compteur de demandes actuel
      const storageAccount = await program.account.accessRequestStorage.fetch(accessStoragePDA);
      const requestCount = storageAccount.requestCount;
      
      // Recherche du PDA de la demande
      const [requestPDA_] = await anchor.web3.PublicKey.findProgramAddress(
        [
          Buffer.from("request"),
          student.publicKey.toBuffer(),
          Buffer.from(new Uint8Array(requestCount.toArray("le", 8)))
        ],
        program.programId
      );
      requestPDA = requestPDA_;
      
      console.log("Request PDA:", requestPDA.toString());
      
      // Appel de l'instruction create_access_request
      const role = "STUDENT";
      const message = "Je souhaite accéder à la plateforme en tant qu'étudiant.";
      
      const tx = await program.methods
        .createAccessRequest(role, message)
        .accounts({
          requester: student.publicKey,
          storage: accessStoragePDA,
          request: requestPDA,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([student])
        .rpc();
      
      console.log("Create access request transaction signature:", tx);
      
      // Récupération du compte de demande
      const requestAccount = await program.account.accessRequest.fetch(requestPDA);
      
      // Vérification que le compte de demande a été correctement initialisé
      assert.equal(requestAccount.requester.toString(), student.publicKey.toString());
      assert.equal(requestAccount.role, role);
      assert.equal(requestAccount.message, message);
      assert.equal(requestAccount.status.pending, {});  // Vérification de la variante enum
      
      console.log("Access request created successfully");
    } catch (error) {
      console.error("Error creating access request:", error);
      throw error;
    }
  });
  
  it("Approve Access Request", async () => {
    try {
      // Appel de l'instruction approve_access_request
      const tx = await program.methods
        .approveAccessRequest()
        .accounts({
          admin: admin.publicKey,
          storage: accessStoragePDA,
          request: requestPDA,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([admin])
        .rpc();
      
      console.log("Approve access request transaction signature:", tx);
      
      // Récupération du compte de demande
      const requestAccount = await program.account.accessRequest.fetch(requestPDA);
      
      // Vérification que le statut de la demande a été correctement mis à jour
      assert.equal(requestAccount.status.approved, {});  // Vérification de la variante enum
      
      console.log("Access request approved successfully");
    } catch (error) {
      console.error("Error approving access request:", error);
      throw error;
    }
  });
});
```

**PAUSE** : Exécutez les tests et vérifiez qu'ils passent correctement.

## Étape 5 : Définition des Structures pour les Formations et les Sessions

Ajoutez les structures suivantes à votre fichier `lib.rs` :

```rust
// Structure pour le stockage des formations
#[account]
pub struct FormationStorage {
    pub admin: Pubkey,
    pub formation_count: u64,
    pub bump: u8,
}

// Structure pour une formation
#[account]
pub struct Formation {
    pub id: u64,
    pub title: String,
    pub description: String,
    pub creator: Pubkey,
    pub start_date: i64,
    pub end_date: i64,
    pub is_active: bool,
    pub created_at: i64,
    pub updated_at: i64,
    pub bump: u8,
}

// Structure pour le stockage des sessions
#[account]
pub struct SessionStorage {
    pub admin: Pubkey,
    pub session_count: u64,
    pub bump: u8,
}

// Structure pour une session
#[account]
pub struct Session {
    pub id: u64,
    pub formation_id: u64,
    pub title: String,
    pub description: String,
    pub trainer: Pubkey,
    pub date: i64,
    pub duration: u64, // en minutes
    pub location: String,
    pub is_active: bool,
    pub created_at: i64,
    pub updated_at: i64,
    pub bump: u8,
}

// Structure pour le stockage des présences
#[account]
pub struct AttendanceStorage {
    pub admin: Pubkey,
    pub attendance_count: u64,
    pub bump: u8,
}

// Structure pour une présence
#[account]
pub struct Attendance {
    pub id: u64,
    pub session_id: u64,
    pub student: Pubkey,
    pub is_present: bool,
    pub check_in_time: i64,
    pub check_out_time: Option<i64>,
    pub note: String,
    pub created_at: i64,
    pub updated_at: i64,
    pub bump: u8,
}
```

**PAUSE** : Vérifiez que les nouvelles structures sont correctement définies et que le projet compile.

## Étape 6 : Implémentation des Instructions pour la Gestion des Formations

Ajoutez les instructions suivantes au module `alyrasign` :

```rust
// Initialisation du stockage des formations
pub fn initialize_formation_storage(ctx: Context<InitializeFormationStorage>) -> Result<()> {
    let storage = &mut ctx.accounts.storage;
    storage.admin = ctx.accounts.admin.key();
    storage.formation_count = 0;
    msg!("Formation Storage initialized");
    Ok(())
}

// Création ou mise à jour d'une formation
pub fn upsert_formation(
    ctx: Context<UpsertFormation>,
    id: Option<u64>,
    title: String,
    description: String,
    start_date: i64,
    end_date: i64,
    is_active: bool,
) -> Result<()> {
    let storage = &mut ctx.accounts.storage;
    let formation = &mut ctx.accounts.formation;
    let clock = Clock::get()?;
    
    // S'il s'agit d'une nouvelle formation
    if id.is_none() {
        formation.id = storage.formation_count;
        formation.created_at = clock.unix_timestamp;
        storage.formation_count += 1;
    }
    
    // Mise à jour des champs de la formation
    formation.title = title;
    formation.description = description;
    formation.creator = ctx.accounts.admin.key();
    formation.start_date = start_date;
    formation.end_date = end_date;
    formation.is_active = is_active;
    formation.updated_at = clock.unix_timestamp;
    formation.bump = *ctx.bumps.get("formation").unwrap();
    
    msg!("Formation {} {}", 
        if id.is_none() { "created" } else { "updated" }, 
        formation.id);
    Ok(())
}
```

Définissez également les structures de contexte correspondantes :

```rust
#[derive(Accounts)]
pub struct InitializeFormationStorage<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,
    
    #[account(
        init,
        payer = admin,
        space = 8 + 32 + 8 + 1, // discriminator + pubkey + counter + bump
        seeds = [b"formation-storage"],
        bump
    )]
    pub storage: Account<'info, FormationStorage>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(id: Option<u64>, title: String, description: String, start_date: i64, end_date: i64, is_active: bool)]
pub struct UpsertFormation<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,
    
    #[account(
        seeds = [b"formation-storage"],
        bump = storage.bump
    )]
    pub storage: Account<'info, FormationStorage>,
    
    #[account(
        init_if_needed,
        payer = admin,
        space = 8 + 8 + (4 + 100) + (4 + 500) + 32 + 8 + 8 + 1 + 8 + 8 + 1, // discriminator + id + title + description + creator + dates + is_active + timestamps + bump
        seeds = [b"formation", if let Some(existing_id) = id { existing_id.to_le_bytes().as_ref() } else { storage.formation_count.to_le_bytes().as_ref() }],
        bump
    )]
    pub formation: Account<'info, Formation>,
    
    pub system_program: Program<'info, System>,
}
```

**PAUSE** : Compilez le code et assurez-vous qu'il n'y a pas d'erreurs.

## Étape 7 : Déploiement sur Devnet

Une fois que le programme est complètement développé et testé, vous pouvez le déployer sur Devnet :

```bash
# Construction du programme
anchor build

# Déploiement sur Devnet
anchor deploy --provider.cluster devnet
```

Notez l'ID du programme après le déploiement, car vous en aurez besoin pour mettre à jour les fichiers de configuration.

**PAUSE** : Vérifiez que le déploiement a réussi.

## Étape 8 : Intégration avec le Frontend

Pour intégrer les smart contracts avec l'interface utilisateur, vous devez modifier les fichiers frontaux existants pour utiliser les contrats au lieu du localStorage. Voici un exemple de modification pour la gestion des demandes d'accès :

### 1. Création d'une instance du programme client

Créez un fichier `src/lib/solana.ts` :

```typescript
import * as anchor from "@coral-xyz/anchor";
import { AnchorProvider, Program } from "@coral-xyz/anchor";
import { AlyraSign, IDL } from "./idl/alyrasign";
import { PublicKey } from "@solana/web3.js";

export const PROGRAM_ID = new PublicKey("VOTRE_PROGRAM_ID_ICI");

export function getProvider(): AnchorProvider {
  const connection = new anchor.web3.Connection(process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.devnet.solana.com");
  const provider = new AnchorProvider(
    connection,
    window.solana,
    { commitment: "confirmed" }
  );
  return provider;
}

export function getProgram(): Program<AlyraSign> {
  const provider = getProvider();
  const program = new Program<AlyraSign>(IDL, PROGRAM_ID, provider);
  return program;
}

// Helper pour trouver le PDA du stockage des demandes d'accès
export async function findAccessStoragePDA(): Promise<[PublicKey, number]> {
  return await PublicKey.findProgramAddress(
    [Buffer.from("access-storage")],
    PROGRAM_ID
  );
}

// Helper pour trouver le PDA d'une demande d'accès
export async function findAccessRequestPDA(requester: PublicKey, requestId: number): Promise<[PublicKey, number]> {
  return await PublicKey.findProgramAddress(
    [
      Buffer.from("request"),
      requester.toBuffer(),
      Buffer.from(new Uint8Array(new anchor.BN(requestId).toArray("le", 8)))
    ],
    PROGRAM_ID
  );
}
```

### 2. Mise à jour de la soumission des demandes d'accès

Modifiez `src/pages/access/index.tsx` :

```tsx
// Importez les fonctions nécessaires
import { getProgram, findAccessStoragePDA, findAccessRequestPDA } from "../../lib/solana";
import { PublicKey } from "@solana/web3.js";

// Dans la fonction handleSubmit
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  
  try {
    const wallet = window.solana;
    if (!wallet || !wallet.publicKey) {
      toast.error("Veuillez vous connecter avec votre portefeuille Solana");
      return;
    }
    
    const program = getProgram();
    const [storagePDA] = await findAccessStoragePDA();
    
    // Récupérer le compteur actuel
    const storageAccount = await program.account.accessRequestStorage.fetch(storagePDA);
    const requestCount = storageAccount.requestCount;
    
    // Trouver le PDA de la demande
    const [requestPDA] = await findAccessRequestPDA(wallet.publicKey, requestCount.toNumber());
    
    // Soumettre la demande
    const tx = await program.methods
      .createAccessRequest(role, message || "")
      .accounts({
        requester: wallet.publicKey,
        storage: storagePDA,
        request: requestPDA,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();
    
    console.log("Transaction signature:", tx);
    
    toast.success("Votre demande a été soumise avec succès. Elle sera examinée par un administrateur.");
    router.push("/");
  } catch (error) {
    console.error("Erreur lors de la soumission de la demande:", error);
    toast.error("Une erreur s'est produite lors de la soumission de votre demande.");
  } finally {
    setLoading(false);
  }
};
```

**PAUSE** : Testez l'intégration de la fonctionnalité de demande d'accès dans l'interface utilisateur.

## Points de Contrôle et Validation

Après avoir terminé ces étapes, vous devriez avoir un programme Solana fonctionnel qui peut :

1. Gérer les demandes d'accès (création, approbation, rejet)
2. Gérer les formations (création, mise à jour)
3. S'intégrer à l'interface utilisateur existante

Vérifiez que chaque fonctionnalité fonctionne comme prévu avant de passer à la suivante, et assurez-vous que toutes les transactions blockchain sont correctement traitées.
