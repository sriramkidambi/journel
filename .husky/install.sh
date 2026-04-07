#!/usr/bin/env sh
# Prepare script to install husky

# Initialize husky
npx husky

# Make hooks executable
chmod +x .husky/pre-commit
chmod +x .husky/pre-push

echo "Husky hooks installed successfully!"
