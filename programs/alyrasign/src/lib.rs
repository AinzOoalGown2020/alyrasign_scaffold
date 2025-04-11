use anchor_lang::prelude::*;

declare_id!("E8Lxhi9YBxt8AVFt9tWwmUXFAPyEWVojdeGHqnBuWHKc");

// Constantes pour les seeds des PDAs - Les valeurs sont définies dans .env.local
// NEXT_PUBLIC_ACCESS_STORAGE_SEED
pub const ACCESS_STORAGE_SEED: &[u8] = b"access-storage";
// NEXT_PUBLIC_FORMATION_STORAGE_SEED
pub const FORMATION_STORAGE_SEED: &[u8] = b"formation-storage";
// NEXT_PUBLIC_SESSION_STORAGE_SEED
pub const SESSION_STORAGE_SEED: &[u8] = b"session-storage";
// NEXT_PUBLIC_REQUEST_SEED
pub const REQUEST_SEED: &[u8] = b"request";
// NEXT_PUBLIC_FORMATION_SEED
pub const FORMATION_SEED: &[u8] = b"formation";
// NEXT_PUBLIC_SESSION_SEED
pub const SESSION_SEED: &[u8] = b"session";
// NEXT_PUBLIC_ATTENDANCE_SEED
pub const ATTENDANCE_SEED: &[u8] = b"attendance";

// Constantes pour les tailles maximales des champs - Les valeurs sont définies dans .env.local
// NEXT_PUBLIC_MAX_ROLE_LENGTH
pub const MAX_ROLE_LENGTH: usize = 20;
// NEXT_PUBLIC_MAX_MESSAGE_LENGTH
pub const MAX_MESSAGE_LENGTH: usize = 100;
// NEXT_PUBLIC_MAX_TITLE_LENGTH
pub const MAX_TITLE_LENGTH: usize = 100;
// NEXT_PUBLIC_MAX_DESCRIPTION_LENGTH
pub const MAX_DESCRIPTION_LENGTH: usize = 500;
// NEXT_PUBLIC_MAX_LOCATION_LENGTH
pub const MAX_LOCATION_LENGTH: usize = 100;

#[program]
pub mod alyrasign {
    use super::*;

    // Initialize Access Request Storage
    pub fn initialize_access_storage(ctx: Context<InitializeAccessStorage>) -> Result<()> {
        let storage = &mut ctx.accounts.storage;
        storage.admin = ctx.accounts.admin.key();
        storage.request_count = 0;
        msg!("Access Request Storage initialized");
        Ok(())
    }

    // Create a new access request
    pub fn create_access_request(
        ctx: Context<CreateAccessRequest>,
        role: String,
        message: String,
    ) -> Result<()> {
        // Vérifier les tailles maximales
        require!(
            role.len() <= MAX_ROLE_LENGTH,
            AccessRequestError::FieldTooLong
        );
        require!(
            message.len() <= MAX_MESSAGE_LENGTH,
            AccessRequestError::FieldTooLong
        );
        
        let storage = &mut ctx.accounts.storage;
        let request = &mut ctx.accounts.request;
        
        // Initialize request data
        request.requester = ctx.accounts.requester.key();
        request.role = role;
        request.message = message;
        request.status = RequestStatus::Pending;
        request.created_at = Clock::get()?.unix_timestamp;
        request.updated_at = Clock::get()?.unix_timestamp;
        request.id = storage.request_count;
        
        // Update storage
        storage.request_count += 1;
        
        msg!("Access request created with ID: {}", request.id);
        Ok(())
    }

    // Approve an access request
    pub fn approve_access_request(ctx: Context<ProcessAccessRequest>) -> Result<()> {
        let request = &mut ctx.accounts.request;
        
        // Verify request is pending
        require!(
            request.status == RequestStatus::Pending,
            AccessRequestError::InvalidRequestStatus
        );
        
        // Update request status
        request.status = RequestStatus::Approved;
        request.updated_at = Clock::get()?.unix_timestamp;
        
        msg!("Access request approved for user: {}", request.requester);
        Ok(())
    }

    // Reject an access request
    pub fn reject_access_request(ctx: Context<ProcessAccessRequest>) -> Result<()> {
        let request = &mut ctx.accounts.request;
        
        // Verify request is pending
        require!(
            request.status == RequestStatus::Pending,
            AccessRequestError::InvalidRequestStatus
        );
        
        // Update request status
        request.status = RequestStatus::Rejected;
        request.updated_at = Clock::get()?.unix_timestamp;
        
        msg!("Access request rejected for user: {}", request.requester);
        Ok(())
    }

    // Initialize Formation Storage
    pub fn initialize_formation_storage(ctx: Context<InitializeFormationStorage>) -> Result<()> {
        let storage = &mut ctx.accounts.storage;
        storage.admin = ctx.accounts.admin.key();
        storage.formation_count = 0;
        msg!("Formation Storage initialized");
        Ok(())
    }

    // Create or update a formation
    pub fn upsert_formation(
        ctx: Context<UpsertFormation>,
        id_str: Option<String>,
        title: String,
        description: String,
        start_date: i64,
        end_date: i64,
        is_active: bool,
    ) -> Result<()> {
        // Vérifier les tailles maximales
        require!(
            title.len() <= MAX_TITLE_LENGTH,
            AccessRequestError::FieldTooLong
        );
        require!(
            description.len() <= MAX_DESCRIPTION_LENGTH,
            AccessRequestError::FieldTooLong
        );
        
        let storage = &mut ctx.accounts.storage;
        let formation = &mut ctx.accounts.formation;
        let clock = Clock::get()?;
        
        // Convertir id_str en u64 si présent
        let id = if let Some(ref id) = id_str {
            Some(id.parse::<u64>().unwrap())
        } else {
            None
        };
        
        // If it's a new formation
        if id.is_none() {
            formation.id = storage.formation_count.to_string();
            formation.created_at = clock.unix_timestamp;
            storage.formation_count += 1;
        }
        
        // Update formation fields
        formation.title = title;
        formation.description = description;
        formation.creator = ctx.accounts.admin.key();
        formation.start_date = start_date;
        formation.end_date = end_date;
        formation.is_active = is_active;
        formation.updated_at = clock.unix_timestamp;
        
        msg!("Formation {} {}", 
            if id.is_none() { "created" } else { "updated" }, 
            formation.id);
        Ok(())
    }

    // Initialize Session Storage
    pub fn initialize_session_storage(ctx: Context<InitializeSessionStorage>) -> Result<()> {
        let storage = &mut ctx.accounts.storage;
        storage.admin = ctx.accounts.admin.key();
        storage.session_count = 0;
        msg!("Session Storage initialized");
        Ok(())
    }

    // Create a new session
    pub fn create_session(
        ctx: Context<CreateSession>,
        formation_id: String,
        title: String,
        description: String,
        date: i64,
        duration: u64,
        location: String,
    ) -> Result<()> {
        // Vérifier les tailles maximales
        require!(
            title.len() <= MAX_TITLE_LENGTH,
            AccessRequestError::FieldTooLong
        );
        require!(
            description.len() <= MAX_DESCRIPTION_LENGTH,
            AccessRequestError::FieldTooLong
        );
        require!(
            location.len() <= MAX_LOCATION_LENGTH,
            AccessRequestError::FieldTooLong
        );
        
        let storage = &mut ctx.accounts.storage;
        let session = &mut ctx.accounts.session;
        let clock = Clock::get()?;
        
        // Generate session ID
        let session_id = storage.session_count.to_string();
        
        // Initialize session data
        session.id = session_id;
        session.formation_id = formation_id;
        session.title = title;
        session.description = description;
        session.trainer = ctx.accounts.trainer.key();
        session.date = date;
        session.duration = duration;
        session.location = location;
        session.is_active = true;
        session.created_at = clock.unix_timestamp;
        session.updated_at = clock.unix_timestamp;
        
        // Update storage
        storage.session_count += 1;
        
        msg!("Session created with ID: {}", session.id);
        Ok(())
    }

    // Initialize Attendance Storage
    pub fn initialize_attendance_storage(ctx: Context<InitializeAttendanceStorage>) -> Result<()> {
        let storage = &mut ctx.accounts.storage;
        storage.admin = ctx.accounts.admin.key();
        storage.attendance_count = 0;
        msg!("Attendance Storage initialized");
        Ok(())
    }

    // Record student attendance
    pub fn record_attendance(
        ctx: Context<RecordAttendance>,
        session_id: String,
        is_present: bool,
        note: String,
    ) -> Result<()> {
        // Vérifier les tailles maximales
        require!(
            note.len() <= MAX_MESSAGE_LENGTH,
            AccessRequestError::FieldTooLong
        );
        
        let storage = &mut ctx.accounts.storage;
        let attendance = &mut ctx.accounts.attendance;
        let clock = Clock::get()?;
        let timestamp = clock.unix_timestamp;
        
        // Initialize attendance data
        attendance.id = storage.attendance_count.to_string();
        attendance.session_id = session_id;
        attendance.student = ctx.accounts.student.key();
        attendance.is_present = is_present;
        attendance.check_in_time = timestamp;
        attendance.check_out_time = None;
        attendance.note = note;
        attendance.created_at = timestamp;
        attendance.updated_at = timestamp;
        
        // Update storage
        storage.attendance_count += 1;
        
        msg!("Attendance recorded for student: {} at session: {}", attendance.student, attendance.session_id);
        Ok(())
    }

    // Update attendance (check-out)
    pub fn update_attendance(
        ctx: Context<UpdateAttendance>,
        is_present: bool,
        note: String,
    ) -> Result<()> {
        // Vérifier les tailles maximales
        require!(
            note.len() <= MAX_MESSAGE_LENGTH,
            AccessRequestError::FieldTooLong
        );
        
        let attendance = &mut ctx.accounts.attendance;
        let clock = Clock::get()?;
        let timestamp = clock.unix_timestamp;
        
        // Update attendance data
        attendance.is_present = is_present;
        attendance.check_out_time = Some(timestamp);
        
        // Update note if provided
        if !note.is_empty() {
            attendance.note = note;
        }
        
        attendance.updated_at = timestamp;
        
        msg!("Attendance updated for student: {} - session: {}", attendance.student, attendance.session_id);
        Ok(())
    }
}

// Enums and Errors

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
    #[msg("Field length exceeds maximum allowed")]
    FieldTooLong,
    #[msg("Unauthorized access")]
    Unauthorized,
}

// Account Structures

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

#[account]
pub struct FormationStorage {
    pub admin: Pubkey,
    pub formation_count: u64,
    pub bump: u8,
}

#[account]
pub struct Formation {
    pub id: String,
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

#[account]
pub struct SessionStorage {
    pub admin: Pubkey,
    pub session_count: u64,
    pub bump: u8,
}

#[account]
pub struct Session {
    pub id: String,
    pub formation_id: String,
    pub title: String,
    pub description: String,
    pub trainer: Pubkey,
    pub date: i64,
    pub duration: u64, // in minutes
    pub location: String,
    pub is_active: bool,
    pub created_at: i64,
    pub updated_at: i64,
    pub bump: u8,
}

#[account]
pub struct AttendanceStorage {
    pub admin: Pubkey,
    pub attendance_count: u64,
    pub bump: u8,
}

#[account]
pub struct Attendance {
    pub id: String,
    pub session_id: String,
    pub student: Pubkey,
    pub is_present: bool,
    pub check_in_time: i64,
    pub check_out_time: Option<i64>,
    pub note: String,
    pub created_at: i64,
    pub updated_at: i64,
    pub bump: u8,
}

// Context Structures

#[derive(Accounts)]
pub struct InitializeAccessStorage<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,
    
    #[account(
        init,
        payer = admin,
        space = 8 + 32 + 8, // discriminator + pubkey + counter (sans bump)
        seeds = [ACCESS_STORAGE_SEED],
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
        seeds = [ACCESS_STORAGE_SEED],
        bump
    )]
    pub storage: Account<'info, AccessRequestStorage>,
    
    #[account(
        init,
        payer = requester,
        space = 8 + 8 + 32 + (4 + MAX_ROLE_LENGTH) + (4 + MAX_MESSAGE_LENGTH) + 1 + 8 + 8, // discriminator + id + pubkey + role + message + status + timestamps (sans bump)
        seeds = [REQUEST_SEED, requester.key().as_ref()],
        bump
    )]
    pub request: Account<'info, AccessRequest>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ProcessAccessRequest<'info> {
    #[account(
        seeds = [ACCESS_STORAGE_SEED],
        bump,
        constraint = storage.admin == admin.key() @ AccessRequestError::Unauthorized
    )]
    pub storage: Account<'info, AccessRequestStorage>,
    
    #[account(mut)]
    pub admin: Signer<'info>,
    
    #[account(
        mut,
        seeds = [REQUEST_SEED, request.requester.as_ref()],
        bump
    )]
    pub request: Account<'info, AccessRequest>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct InitializeFormationStorage<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,
    
    #[account(
        init,
        payer = admin,
        space = 8 + 32 + 8, // discriminator + pubkey + counter (sans bump)
        seeds = [FORMATION_STORAGE_SEED],
        bump
    )]
    pub storage: Account<'info, FormationStorage>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(id_str: Option<String>, title: String, description: String, start_date: i64, end_date: i64, is_active: bool)]
pub struct UpsertFormation<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,
    
    #[account(
        seeds = [FORMATION_STORAGE_SEED],
        bump
    )]
    pub storage: Account<'info, FormationStorage>,
    
    #[account(
        init_if_needed,
        payer = admin,
        space = 8 + 8 + (4 + MAX_TITLE_LENGTH) + (4 + MAX_DESCRIPTION_LENGTH) + 32 + 8 + 8 + 1 + 8 + 8, // discriminator + id + title + description + creator + dates + is_active + timestamps (sans bump)
        seeds = [FORMATION_SEED, id_str.as_ref().map_or_else(
            || FORMATION_SEED, // Utiliser une seed constante en fallback
            |id| id.as_bytes()
        )],
        bump
    )]
    pub formation: Account<'info, Formation>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct InitializeSessionStorage<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,
    
    #[account(
        init,
        payer = admin,
        space = 8 + 32 + 8, // discriminator + pubkey + counter (sans bump)
        seeds = [SESSION_STORAGE_SEED],
        bump
    )]
    pub storage: Account<'info, SessionStorage>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(formation_id: String, title: String, description: String, date: i64, duration: u64, location: String)]
pub struct CreateSession<'info> {
    #[account(mut)]
    pub trainer: Signer<'info>,
    
    #[account(
        seeds = [SESSION_STORAGE_SEED],
        bump
    )]
    pub storage: Account<'info, SessionStorage>,
    
    #[account(
        init,
        payer = trainer,
        space = 8 + (4 + 20) + (4 + 20) + (4 + MAX_TITLE_LENGTH) + (4 + MAX_DESCRIPTION_LENGTH) + 32 + 8 + 8 + (4 + MAX_LOCATION_LENGTH) + 1 + 8 + 8, // discriminator + id + formation_id + title + description + trainer + date + duration + location + is_active + timestamps (sans bump)
        seeds = [SESSION_SEED, storage.session_count.to_string().as_bytes()],
        bump
    )]
    pub session: Account<'info, Session>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct InitializeAttendanceStorage<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,
    
    #[account(
        init,
        payer = admin,
        space = 8 + 32 + 8, // discriminator + pubkey + counter (sans bump)
        seeds = [b"attendance-storage"],
        bump
    )]
    pub storage: Account<'info, AttendanceStorage>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(session_id: String, is_present: bool, note: String)]
pub struct RecordAttendance<'info> {
    #[account(mut)]
    pub student: Signer<'info>,
    
    #[account(
        seeds = [b"attendance-storage"],
        bump
    )]
    pub storage: Account<'info, AttendanceStorage>,
    
    #[account(
        init,
        payer = student,
        space = 8 + (4 + 20) + (4 + 20) + 32 + 1 + 8 + 9 + (4 + MAX_MESSAGE_LENGTH) + 8 + 8, // discriminator + id + session_id + student + is_present + check_in + check_out option + note + timestamps (sans bump)
        seeds = [ATTENDANCE_SEED, student.key().as_ref(), session_id.as_bytes()],
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
        mut,
        seeds = [ATTENDANCE_SEED, student.key().as_ref(), attendance.session_id.as_bytes()],
        bump,
        constraint = attendance.student == student.key() @ AccessRequestError::Unauthorized
    )]
    pub attendance: Account<'info, Attendance>,
    
    pub system_program: Program<'info, System>,
} 