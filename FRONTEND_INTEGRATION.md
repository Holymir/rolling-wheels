# Frontend API Integration Status

This document tracks the integration of the frontend with the backend API endpoints.

## Completed ✅

### Authentication & Navigation
- **Login Page** (`app/page.tsx`)
  - Replaced role-based authentication with NextAuth username/password login
  - Uses `signIn()` from next-auth/react
  - Proper loading states and error handling
  - Updated demo credentials to show usernames

- **Layout** (`app/layout.tsx`)
  - Replaced custom `AuthProvider` with NextAuth `SessionProvider`
  - Created `components/providers.tsx` wrapper

- **Navigation** (`components/navigation.tsx`)
  - Uses `useSession()` for auth state
  - Uses `signOut()` for logout
  - Role-based navigation filtering via session data

### Pages
- **Members Page** (`app/members/page.tsx`)
  - ✅ Fetches members from `GET /api/members`
  - ✅ Updates members via `PUT /api/members/[id]`
  - ✅ Deletes members via `DELETE /api/members/[id]`
  - ✅ Loading states with spinner
  - ✅ Error handling and display
  - ✅ Authentication redirect
  - ✅ Role-based access control (admin can edit/delete)
  - ⚠️ Add member functionality needs backend support (POST endpoint requires username/password)

## To Be Updated ⏳

The following pages still use mock data and need to be updated to use API endpoints:

### Events Page (`app/events/page.tsx`)
**Required Changes:**
- Replace `mockEvents` with `GET /api/events`
- Update create event to `POST /api/events`
- Update edit event to `PUT /api/events/[id]`
- Update delete event to `DELETE /api/events/[id]`
- RSVP functionality: `POST /api/events/[id]/rsvp` and `DELETE /api/events/[id]/rsvp`
- Replace `useAuth()` with `useSession()`
- Add loading and error states

### Ledger Page (`app/ledger/page.tsx`)
**Required Changes:**
- Replace `mockPayments` with `GET /api/payments`
- Update payment status to `PUT /api/payments/[id]`
- Create payment: `POST /api/payments` (admin only)
- Delete payment: `DELETE /api/payments/[id]` (admin only)
- Replace `useAuth()` with `useSession()`
- Add loading and error states
- Handle role-based filtering (members see only their payments)

### Rules Page (`app/rules/page.tsx`)
**Required Changes:**
- Replace `mockRules` with `GET /api/rules`
- Create rule: `POST /api/rules` (admin only)
- Update rule: `PUT /api/rules/[id]` (admin only)
- Delete rule: `DELETE /api/rules/[id]` (admin only)
- Replace `useAuth()` with `useSession()`
- Add loading and error states

## Integration Pattern

Follow this pattern for each page:

### 1. Replace imports
```typescript
// OLD
import { useAuth } from "@/lib/auth-context"
import { mockData } from "@/lib/mock-data"

// NEW
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
```

### 2. Add state management
```typescript
const { data: session, status } = useSession()
const router = useRouter()
const [data, setData] = useState<DataType[]>([])
const [isLoading, setIsLoading] = useState(true)
const [error, setError] = useState<string | null>(null)
```

### 3. Add authentication redirect
```typescript
useEffect(() => {
  if (status === "unauthenticated") {
    router.push("/")
  }
}, [status, router])
```

### 4. Fetch data from API
```typescript
useEffect(() => {
  if (status === "authenticated") {
    fetchData()
  }
}, [status])

const fetchData = async () => {
  setIsLoading(true)
  setError(null)
  try {
    const response = await fetch("/api/endpoint")
    if (!response.ok) {
      throw new Error("Failed to fetch data")
    }
    const data = await response.json()
    setData(data)
  } catch (err) {
    setError(err instanceof Error ? err.message : "An error occurred")
    console.error("Error:", err)
  } finally {
    setIsLoading(false)
  }
}
```

### 5. Update CRUD operations
```typescript
// CREATE
const handleCreate = async (newItem: any) => {
  try {
    const response = await fetch("/api/endpoint", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newItem),
    })
    if (!response.ok) throw new Error("Failed to create")
    fetchData() // Refresh list
  } catch (err) {
    console.error("Error:", err)
    alert("Failed to create item")
  }
}

// UPDATE
const handleUpdate = async (id: string, updates: any) => {
  try {
    const response = await fetch(`/api/endpoint/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    })
    if (!response.ok) throw new Error("Failed to update")
    fetchData() // Refresh list
  } catch (err) {
    console.error("Error:", err)
    alert("Failed to update item")
  }
}

// DELETE
const handleDelete = async (id: string) => {
  if (!confirm("Are you sure?")) return
  try {
    const response = await fetch(`/api/endpoint/${id}`, {
      method: "DELETE",
    })
    if (!response.ok) throw new Error("Failed to delete")
    fetchData() // Refresh list
  } catch (err) {
    console.error("Error:", err)
    alert("Failed to delete item")
  }
}
```

### 6. Add loading state
```typescript
if (status === "loading" || isLoading) {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    </div>
  )
}
```

### 7. Add error state
```typescript
if (error) {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-destructive/20 border border-destructive text-destructive-foreground px-4 py-3 rounded">
          <p className="font-bold">Error loading data</p>
          <p>{error}</p>
        </div>
      </div>
    </div>
  )
}
```

### 8. Update role checks
```typescript
// OLD
const { role } = useAuth()
const canEdit = role === "admin"

// NEW
const canEdit = session?.user?.role === "admin"
```

## API Endpoints Reference

### Authentication
- `POST /api/auth/signin` - Login (handled by NextAuth)
- `POST /api/auth/signout` - Logout (handled by NextAuth)
- `GET /api/auth/session` - Get current session

### Members
- `GET /api/members` - Get all members
- `GET /api/members/[id]` - Get member details
- `PUT /api/members/[id]` - Update member (admin only)
- `DELETE /api/members/[id]` - Delete member (admin only)
- `POST /api/members` - Create member (admin only) ⚠️ Requires username/password

### Events
- `GET /api/events` - Get all events
- `POST /api/events` - Create event (admin/member)
- `GET /api/events/[id]` - Get event details
- `PUT /api/events/[id]` - Update event (admin/member)
- `DELETE /api/events/[id]` - Delete event (admin only)
- `POST /api/events/[id]/rsvp` - RSVP to event
- `DELETE /api/events/[id]/rsvp` - Cancel RSVP

### Payments (Ledger)
- `GET /api/payments` - Get payments (filtered by role)
- `POST /api/payments` - Create payment (admin only)
- `GET /api/payments/[id]` - Get payment details
- `PUT /api/payments/[id]` - Update payment (admin only)
- `DELETE /api/payments/[id]` - Delete payment (admin only)

### Rules
- `GET /api/rules` - Get all rules
- `POST /api/rules` - Create rule (admin only)
- `GET /api/rules/[id]` - Get rule details
- `PUT /api/rules/[id]` - Update rule (admin only)
- `DELETE /api/rules/[id]` - Delete rule (admin only)

## Testing Checklist

After updating each page, test:
- [ ] Loading state displays correctly
- [ ] Error handling works (try with invalid data)
- [ ] Data fetches and displays
- [ ] Create functionality works (if applicable)
- [ ] Update functionality works (if applicable)
- [ ] Delete functionality works (if applicable)
- [ ] Role-based access control enforced
- [ ] Unauthenticated users redirected to login
- [ ] No console errors
- [ ] No TypeScript errors

## Notes

### Mock Data Files (Can be removed after migration)
- `lib/auth-context.tsx` - Old custom auth context
- `lib/mock-data.ts` - Mock data (if it exists)

### Type Definitions
The API returns slightly different data structures than the mock data:
- Member now includes `user` object with username and role
- Event includes RSVPs with member details
- Payment includes member details

Update type interfaces as needed to match API responses.

## Next Steps

1. Update remaining pages (events, ledger, rules) following the pattern above
2. Test all functionality with the backend API
3. Remove old mock data files
4. Remove old auth-context file
5. Update any remaining components that use mock data or auth-context
6. Add loading skeletons for better UX (optional enhancement)
7. Add optimistic updates for better perceived performance (optional enhancement)

## Need Help?

- Check the Members page implementation for a complete example
- Review the API route handlers in `app/api/**` for request/response formats
- See `BACKEND_SETUP.md` for backend documentation
