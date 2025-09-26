def create_user_from_form(
    first_name, last_name, email, password, mobile_number,
    profile_file=None, role="user", verified=False
):
    """Helper function to create a user with optional profile picture."""
    if User.query.filter_by(email=email).first():
        return None, "Email already registered"

    profile_filename = None
    if profile_file:
        profile_filename = f"profile_{email}_{profile_file.filename}"
        profile_file.save(f"uploads/{profile_filename}")  # ensure uploads/ exists

    user = User(
        profile_picture=profile_filename,
        first_name=first_name,
        last_name=last_name,
        email=email,
        mobile_number=mobile_number,
        role=role,
        is_verified=verified
    )
    user.set_password(password)

    db.session.add(user)
    db.session.commit()
    return user, None
