# Admin Panel Credentials

## Default Admin Account

**Email:** `idearigs@gmail.com`
**Password:** `Admin@2024`

## Admin Panel URL

- **Development:** `http://localhost:8080/admin/login`
- **Production:** `https://lankaaid.idearigs.co.uk/admin/login`

## Features

The admin panel allows you to:
- View dashboard statistics (posts, users, donations, flags)
- Manage need posts (verify, change status, delete)
- Review and resolve flagged content
- Manage users (verify/ban users)

## Recreating Admin User

If you need to recreate the admin user, run:

```bash
cd backend
node src/scripts/recreateAdmin.js
```

## Security Notes

⚠️ **IMPORTANT:** Change the default password after first login in production!

The password is stored using bcrypt hashing for security.
