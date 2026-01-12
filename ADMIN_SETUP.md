# Admin Feature Setup Guide

## Step 1: Add `is_admin` Column to Users Table

Run this SQL in your Supabase SQL Editor:

```sql
-- Add is_admin column to users table
ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;

-- Set your own email as admin (replace 'your-email@example.com' with your actual email)
UPDATE users SET is_admin = TRUE WHERE email = 'your-email@example.com';
```

## Step 2: Verify the Changes

After running the SQL, refresh the database and verify:
- The `is_admin` column exists in the `users` table
- Your user account has `is_admin = TRUE`

## Step 3: Test Admin Login

1. Login with your admin account (the one you set `is_admin = TRUE`)
2. You should be redirected to `/admin` page instead of `/dashboard`
3. You'll see the admin panel with:
   - List of all users
   - Edit/Delete user functionality
   - View all tasks for each user
   - Edit/Delete task functionality

## Admin Panel Features

### Users Management
- ✅ View all users
- ✅ Edit user full name
- ✅ Delete users (this also deletes their tasks and sessions)

### Tasks Management
- ✅ View all tasks from all users
- ✅ Filter tasks by user
- ✅ Edit task title, description, priority, and due date
- ✅ Delete tasks

## Protected Routes

The admin panel is automatically protected:
- Only users with `is_admin = TRUE` can access `/admin`
- Attempting to access `/admin` without admin privileges will redirect to `/dashboard`

## Security Notes

- All admin API endpoints require a valid token and `is_admin = TRUE`
- When deleting a user, all related data (tasks, sessions) is also deleted
- Consider adding additional validation for sensitive operations in production

## Making Other Users Admin

To promote a user to admin status:

```sql
UPDATE users SET is_admin = TRUE WHERE email = 'user-email@example.com';
```

To remove admin privileges:

```sql
UPDATE users SET is_admin = FALSE WHERE email = 'user-email@example.com';
```
