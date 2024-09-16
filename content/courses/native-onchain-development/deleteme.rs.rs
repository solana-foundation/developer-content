{
    let (pda, bump_seed) = Pubkey::find_program_address(&[
    initializer.key.as_ref(),
    title.as_bytes().as_ref()
    ],
    program_id);
}