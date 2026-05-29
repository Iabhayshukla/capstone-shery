def build_website_prompt(user_prompt: str):

    return f"""
    Generate a complete website.

    User Request:
    {user_prompt}

    Output HTML only.
    """