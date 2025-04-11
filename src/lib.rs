use anchor_lang::prelude::*;
use spl_token::state::{Account as TokenAccount, Mint};

declare_id!("9G6Skb8Enu9MhTAkJyqHBDmq6AP3jPD2RVn5svRZxDiM");

// Constantes pour les seeds des PDAs 
pub const ACCESS_STORAGE_SEED: &[u8] = b"access-storage";
pub const FORMATION_STORAGE_SEED: &[u8] = b"formation-storage";
pub const SESSION_STORAGE_SEED: &[u8] = b"session-storage";
pub const REQUEST_SEED: &[u8] = b"request";
pub const FORMATION_SEED: &[u8] = b"formation";
pub const SESSION_SEED: &[u8] = b"session";
pub const ATTENDANCE_SEED: &[u8] = b"attendance";
pub const TOKEN_MINT_SEED: &[u8] = b"token-mint";
pub const TOKEN_ACCOUNT_SEED: &[u8] = b"token-account";

// Constantes pour les tailles maximales des champs
pub const MAX_ROLE_LENGTH: usize = 20;
pub const MAX_MESSAGE_LENGTH: usize = 100;
pub const MAX_TITLE_LENGTH: usize = 100;
pub const MAX_DESCRIPTION_LENGTH: usize = 500;
pub const MAX_LOCATION_LENGTH: usize = 100;
pub const MAX_NOTE_LENGTH: usize = 500;

#[program]
pub mod alyrasign {
    use super::*;

    // ... existing code ...

    // Initialize Token Mint
    pub fn initialize_token_mint(ctx: Context<InitializeTokenMint>) -> Result<()> {
        let mint = &mut ctx.accounts.mint;
        let storage = &mut ctx.accounts.storage;
        
        // Initialize mint data
        storage.mint = mint.key();
        storage.admin = ctx.accounts.admin.key();
        storage.bump = ctx.bumps.storage;
        
        msg!("Token mint initialized with bump: {}", storage.bump);
        Ok(())
    }

    // Mint role token
    pub fn mint_role_token(
        ctx: Context<MintRoleToken>,
        role: String,
        amount: u64,
    ) -> Result<()> {
        // Vérifier les tailles maximales
        require!(
            role.len() <= MAX_ROLE_LENGTH,
            AccessRequestError::FieldTooLong
        );
        
        let storage = &ctx.accounts.storage;
        let token_account = &mut ctx.accounts.token_account;
        let clock = Clock::get()?;
        
        // Initialize token account data
        token_account.owner = ctx.accounts.owner.key();
        token_account.role = role;
        token_account.amount = amount;
        token_account.created_at = clock.unix_timestamp;
        token_account.updated_at = clock.unix_timestamp;
        token_account.bump = ctx.bumps.token_account;
        
        msg!("Role token minted for user: {} with role: {}", token_account.owner, token_account.role);
        Ok(())
    }

    pub fn approve_access_request(ctx: Context<ApproveAccessRequest>, role: String) -> Result<()> {
        // Vérifier les tailles maximales
        require!(
            role.len() <= MAX_ROLE_LENGTH,
            AccessRequestError::FieldTooLong
        );

        let request = &mut ctx.accounts.request;
        let storage = &ctx.accounts.storage;
        let clock = Clock::get()?;

        // Vérifier que l'admin a le token de rôle admin
        let admin_token_account = Pubkey::find_program_address(
            &[
                TOKEN_ACCOUNT_SEED,
                ctx.accounts.admin.key().as_ref(),
                b"admin".as_ref(),
            ],
            program_id,
        ).0;

        let admin_token = ctx.accounts.admin_token;
        require!(
            admin_token.key() == admin_token_account,
            AccessRequestError::Unauthorized
        );
        require!(
            admin_token.amount > 0,
            AccessRequestError::Unauthorized
        );

        // Mettre à jour la demande
        request.status = RequestStatus::Approved;
        request.role = role;
        request.updated_at = clock.unix_timestamp;

        msg!("Access request approved with role: {}", role);
        Ok(())
    }

    pub fn create_session(
        ctx: Context<CreateSession>,
        title: String,
        description: String,
        location: String,
        start_time: i64,
        end_time: i64,
    ) -> Result<()> {
        // Vérifier les tailles maximales
        require!(
            title.len() <= MAX_TITLE_LENGTH &&
            description.len() <= MAX_DESCRIPTION_LENGTH &&
            location.len() <= MAX_LOCATION_LENGTH,
            AccessRequestError::FieldTooLong
        );

        let session = &mut ctx.accounts.session;
        let storage = &mut ctx.accounts.storage;
        let clock = Clock::get()?;

        // Vérifier que l'admin a le token de rôle admin
        let admin_token_account = Pubkey::find_program_address(
            &[
                TOKEN_ACCOUNT_SEED,
                ctx.accounts.admin.key().as_ref(),
                b"admin".as_ref(),
            ],
            program_id,
        ).0;

        let admin_token = ctx.accounts.admin_token;
        require!(
            admin_token.key() == admin_token_account,
            AccessRequestError::Unauthorized
        );
        require!(
            admin_token.amount > 0,
            AccessRequestError::Unauthorized
        );

        // Mettre à jour le compteur de sessions
        storage.session_count = storage.session_count.checked_add(1).unwrap();
        
        // Initialiser la session
        session.id = storage.session_count;
        session.title = title;
        session.description = description;
        session.location = location;
        session.start_time = start_time;
        session.end_time = end_time;
        session.created_at = clock.unix_timestamp;
        session.updated_at = clock.unix_timestamp;
        session.bump = ctx.bumps.session;

        msg!("Session created with ID: {}", session.id);
        Ok(())
    }

    pub fn record_attendance(
        ctx: Context<RecordAttendance>,
        session_id: u64,
        student: Pubkey,
        is_present: bool,
        note: String,
    ) -> Result<()> {
        // Vérifier les tailles maximales
        require!(
            note.len() <= MAX_NOTE_LENGTH,
            AccessRequestError::FieldTooLong
        );

        let attendance = &mut ctx.accounts.attendance;
        let storage = &mut ctx.accounts.storage;
        let clock = Clock::get()?;

        // Vérifier que l'étudiant a le token de rôle étudiant
        let student_token_account = Pubkey::find_program_address(
            &[
                TOKEN_ACCOUNT_SEED,
                student.as_ref(),
                b"student".as_ref(),
            ],
            program_id,
        ).0;

        let student_token = ctx.accounts.student_token;
        require!(
            student_token.key() == student_token_account,
            AccessRequestError::Unauthorized
        );
        require!(
            student_token.amount > 0,
            AccessRequestError::Unauthorized
        );

        // Mettre à jour le compteur de présences
        storage.attendance_count = storage.attendance_count.checked_add(1).unwrap();
        
        // Initialiser la présence
        attendance.id = storage.attendance_count;
        attendance.session_id = session_id;
        attendance.student = student;
        attendance.is_present = is_present;
        attendance.check_in_time = clock.unix_timestamp;
        attendance.note = note;
        attendance.created_at = clock.unix_timestamp;
        attendance.updated_at = clock.unix_timestamp;
        attendance.bump = ctx.bumps.attendance;

        msg!("Attendance recorded for student: {}", student);
        Ok(())
    }

    pub fn update_attendance(
        ctx: Context<UpdateAttendance>,
        is_present: bool,
        note: String,
    ) -> Result<()> {
        // Vérifier les tailles maximales
        require!(
            note.len() <= MAX_NOTE_LENGTH,
            AccessRequestError::FieldTooLong
        );

        let attendance = &mut ctx.accounts.attendance;
        let clock = Clock::get()?;

        // Vérifier que l'étudiant a le token de rôle étudiant
        let student_token_account = Pubkey::find_program_address(
            &[
                TOKEN_ACCOUNT_SEED,
                attendance.student.as_ref(),
                b"student".as_ref(),
            ],
            program_id,
        ).0;

        let student_token = ctx.accounts.student_token;
        require!(
            student_token.key() == student_token_account,
            AccessRequestError::Unauthorized
        );
        require!(
            student_token.amount > 0,
            AccessRequestError::Unauthorized
        );

        // Mettre à jour la présence
        attendance.is_present = is_present;
        attendance.check_out_time = Some(clock.unix_timestamp);
        attendance.note = note;
        attendance.updated_at = clock.unix_timestamp;

        msg!("Attendance updated for student: {}", attendance.student);
        Ok(())
    }

    // ... existing code ...
}

// ... existing code ...

#[account]
pub struct TokenMintStorage {
    pub mint: Pubkey,
    pub admin: Pubkey,
    pub bump: u8,
}

#[account]
pub struct RoleTokenAccount {
    pub owner: Pubkey,
    pub role: String,
    pub amount: u64,
    pub created_at: i64,
    pub updated_at: i64,
    pub bump: u8,
}

#[derive(Accounts)]
pub struct InitializeTokenMint<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,
    
    #[account(
        init,
        payer = admin,
        space = 8 + 32 + 32 + 1, // discriminator + mint + admin + bump
        seeds = [TOKEN_MINT_SEED],
        bump
    )]
    pub storage: Account<'info, TokenMintStorage>,
    
    /// CHECK: This is the token mint account
    #[account(mut)]
    pub mint: Account<'info, Mint>,
    
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, spl_token::program::Token>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
#[instruction(role: String, amount: u64)]
pub struct MintRoleToken<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,
    
    #[account(
        seeds = [TOKEN_MINT_SEED],
        bump = storage.bump,
        constraint = storage.admin == admin.key() @ AccessRequestError::Unauthorized
    )]
    pub storage: Account<'info, TokenMintStorage>,
    
    #[account(
        init,
        payer = admin,
        space = 8 + 32 + (4 + MAX_ROLE_LENGTH) + 8 + 8 + 8 + 1, // discriminator + owner + role + amount + timestamps + bump
        seeds = [TOKEN_ACCOUNT_SEED, owner.key().as_ref(), role.as_bytes()],
        bump
    )]
    pub token_account: Account<'info, RoleTokenAccount>,
    
    /// CHECK: This is the token account owner
    #[account(mut)]
    pub owner: AccountInfo<'info>,
    
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, spl_token::program::Token>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct ApproveAccessRequest<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,
    
    #[account(
        seeds = [TOKEN_ACCOUNT_SEED, admin.key().as_ref(), b"admin".as_ref()],
        bump
    )]
    pub admin_token: Account<'info, RoleTokenAccount>,
    
    #[account(
        mut,
        seeds = [ACCESS_STORAGE_SEED],
        bump = storage.bump
    )]
    pub storage: Account<'info, AccessRequestStorage>,
    
    #[account(
        mut,
        seeds = [REQUEST_SEED, storage.key().as_ref(), request.requester.as_ref()],
        bump = request.bump,
        constraint = request.status == RequestStatus::Pending @ AccessRequestError::InvalidRequestStatus
    )]
    pub request: Account<'info, AccessRequest>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CreateSession<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,
    
    #[account(
        seeds = [TOKEN_ACCOUNT_SEED, admin.key().as_ref(), b"admin".as_ref()],
        bump
    )]
    pub admin_token: Account<'info, RoleTokenAccount>,
    
    #[account(
        mut,
        seeds = [SESSION_STORAGE_SEED],
        bump = storage.bump
    )]
    pub storage: Account<'info, SessionStorage>,
    
    #[account(
        init,
        payer = admin,
        space = 8 + 8 + (4 + MAX_TITLE_LENGTH) + (4 + MAX_DESCRIPTION_LENGTH) + (4 + MAX_LOCATION_LENGTH) + 8 + 8 + 8 + 8 + 1,
        seeds = [SESSION_SEED, storage.key().as_ref(), &[storage.session_count + 1]],
        bump
    )]
    pub session: Account<'info, Session>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RecordAttendance<'info> {
    #[account(mut)]
    pub student: Signer<'info>,
    
    #[account(
        seeds = [TOKEN_ACCOUNT_SEED, student.key().as_ref(), b"student".as_ref()],
        bump
    )]
    pub student_token: Account<'info, RoleTokenAccount>,
    
    #[account(
        mut,
        seeds = [ATTENDANCE_STORAGE_SEED],
        bump = storage.bump
    )]
    pub storage: Account<'info, AttendanceStorage>,
    
    #[account(
        init,
        payer = student,
        space = 8 + 8 + 32 + 1 + 8 + 8 + (4 + MAX_NOTE_LENGTH) + 8 + 8 + 1,
        seeds = [ATTENDANCE_SEED, storage.key().as_ref(), &[storage.attendance_count + 1]],
        bump
    )]
    pub attendance: Account<'info, Attendance>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateAttendance<'info> {
    #[account(mut)]
    pub student: Signer<'info>,
    
    #[account(
        seeds = [TOKEN_ACCOUNT_SEED, student.key().as_ref(), b"student".as_ref()],
        bump
    )]
    pub student_token: Account<'info, RoleTokenAccount>,
    
    #[account(
        mut,
        seeds = [ATTENDANCE_SEED, storage.key().as_ref(), &[attendance.id]],
        bump = attendance.bump,
        constraint = attendance.student == student.key()
    )]
    pub attendance: Account<'info, Attendance>,
    
    #[account(
        seeds = [ATTENDANCE_STORAGE_SEED],
        bump = storage.bump
    )]
    pub storage: Account<'info, AttendanceStorage>,
    
    pub system_program: Program<'info, System>,
}

// ... existing code ... 