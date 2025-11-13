# 🚨 SETUP REQUIRED - READ THIS FIRST!

If you're seeing errors like:
- `CLIENT_FETCH_ERROR`
- `400 Bad Request on /api/auth/session`
- "Unexpected token 'E', \"Error: Thi\"... is not valid JSON"

**You need to set up the database first!** The app cannot run without it.

## Quick Setup (5 minutes)

### 1. Generate NEXTAUTH_SECRET

**Windows (PowerShell):**
```powershell
# Generate a random secret
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

**Mac/Linux:**
```bash
openssl rand -base64 32
```

Copy the output and update your `.env` file:
```env
NEXTAUTH_SECRET="paste-your-generated-secret-here"
```

### 2. Set Up the Database

Run these commands **in order**:

```bash
# Install dependencies (if you haven't)
npm install

# Generate Prisma Client
npm run db:generate

# Create the database with tables
npm run db:push

# Populate with demo data
npm run db:seed
```

### 3. Restart Your Dev Server

```bash
# Stop the current server (Ctrl+C)
# Then restart it
npm run dev
```

## ✅ Success Indicators

After setup, you should see:
- ✅ File created: `prisma/dev.db` (your database)
- ✅ No more 400 errors in browser console
- ✅ Login page works with demo credentials

## 🧪 Test the Login

Try logging in with:
- **Username:** `admin`
- **Password:** `admin123`

## ❌ Still Having Issues?

### Error: "Prisma Client not found"
```bash
npm run db:generate
```

### Error: "Table does not exist"
```bash
npm run db:push
```

### Error: "No users found" after login
```bash
npm run db:seed
```

### Database is corrupted
```bash
# Reset everything
npm run db:reset
npm run db:seed
```

## 📖 Need More Help?

See the detailed guides:
- `BACKEND_SETUP.md` - Complete backend documentation
- `FRONTEND_INTEGRATION.md` - Frontend integration status
- `.env.example` - Environment variables reference

## 🎯 What These Commands Do

- **`db:generate`** - Downloads Prisma engines and generates the client code
- **`db:push`** - Creates the SQLite database file and all tables
- **`db:seed`** - Creates demo users, members, events, payments, and rules
- **`db:reset`** - Deletes everything and starts fresh (use with caution!)

---

**Quick tip:** If you're on Windows and the commands don't work, make sure you're using PowerShell or Git Bash, not CMD.
