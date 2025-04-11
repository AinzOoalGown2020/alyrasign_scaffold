import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Alyrasign } from "../target/types/alyrasign";
import { assert } from "chai";

describe("alyrasign", () => {
  // Configuration du client pour utiliser le cluster local
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Alyrasign as unknown as Program<Alyrasign>;

  // Portefeuilles pour les tests
  const admin = anchor.web3.Keypair.generate();
  const student = anchor.web3.Keypair.generate();
  
  // PDAs
  let accessStoragePDA: anchor.web3.PublicKey;
  let requestPDA: anchor.web3.PublicKey;
  
  // Setup : Airdrop SOL pour les comptes de test
  before(async () => {
    // Airdrop SOL à l'admin et à l'étudiant
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
      
      console.log("Storage initialized successfully with bump:", storageAccount.bump);
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
          new anchor.BN(requestCount).toArrayLike(Buffer, "le", 8)
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
      assert.deepEqual(requestAccount.status, { pending: {} });  // Vérification de la variante enum
      
      console.log("Access request created successfully with bump:", requestAccount.bump);
    } catch (error) {
      console.error("Error creating access request:", error);
      throw error;
    }
  });
});
