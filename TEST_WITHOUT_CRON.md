# Testing Notification System (WITHOUT Cron)

## ⚡ Quick Answer
**You can test 50% of notifications RIGHT NOW without cron!**

---

## Phase 1: Setup (5 minutes)

### Step 1: Apply Database Migration
```bash
supabase db push
```

Wait for completion. You should see: `005_notification_system` migration applied.

### Step 2: Start Dev Server
```bash
npm run dev
```

Wait for: "compiled successfully"

---

## Phase 2: Test the UI (10 minutes)

### Test 1: Settings Toggles ✅

1. Go to: `http://localhost:3000/member/settings`
2. Scroll down to "Notifications" section
3. See two toggles:
   - "Workout Reminders" (inactivity nudges)
   - "Streak Celebrations" (streak milestones)
4. Click toggle → should see toast notification
5. Refresh page → setting should persist

**What to verify:**
- [ ] Toggles exist
- [ ] Click works (toast appears)
- [ ] Preference saves to database
- [ ] Refresh persists preference

**Check in database:**
```sql
SELECT * FROM member_notification_preferences WHERE member_id = 'YOUR_MEMBER_ID';
```

---

### Test 2: Notification Bell Icon ✅

1. Go to: `http://localhost:3000/member` (or any member page)
2. Look at top right of header
3. Should see bell icon 🔔
4. Click bell → dropdown appears
5. Dropdown shows "No unread notifications" (this is correct, none created yet)

**What to verify:**
- [ ] Bell icon visible
- [ ] Bell clickable
- [ ] Dropdown appears
- [ ] Shows empty state gracefully

---

## Phase 3: Test Streak Milestones (Real-Time) ✅

**This is the BIG ONE - this works WITHOUT cron!**

### How It Works
When a member checks in and reaches 7, 14, 30, 50, or 100 days, a notification is created IMMEDIATELY.

### Test It Manually

**Option A: Simulate Check-In (Recommended)**

1. Open Supabase SQL Editor
2. Find a member's ID:
```sql
SELECT id, member_name FROM members LIMIT 1;
```

3. Create a test check-in:
```sql
INSERT INTO attendance (member_id, gym_id, check_in_time)
VALUES ('MEMBER_ID_HERE', 'GYM_ID_HERE', NOW());
```

4. Update their streak to 7 (to test milestone):
```sql
UPDATE streaks 
SET current_streak = 7, 
    last_checkin_date = NOW()::date
WHERE member_id = 'MEMBER_ID_HERE';
```

5. Check if notification was created:
```sql
SELECT * FROM notifications 
WHERE for_member = true
ORDER BY created_at DESC 
LIMIT 5;
```

**Expected result:** New notification with `notification_type = 'streak_milestone'` and message like "7 day milestone!"

**What to verify:**
- [ ] Notification created in database
- [ ] Correct member_id
- [ ] Correct notification_type
- [ ] Message is not empty
- [ ] created_at is recent

---

### Test 3: See Notification in UI

1. Still on `http://localhost:3000/member`
2. Click bell icon again
3. Should now show unread notification!
4. Message should be visible in dropdown
5. Click notification → "Mark as read" option
6. Click "Mark as read" → notification disappears

**What to verify:**
- [ ] Notification appears in dropdown
- [ ] Unread count shows (e.g., "1")
- [ ] Can mark as read
- [ ] Disappears after marking read

**Check in database:**
```sql
SELECT is_read FROM notifications WHERE member_id = 'MEMBER_ID_HERE' LIMIT 1;
-- Should be true after clicking "mark as read"
```

---

## Phase 4: Test Announcements (Admin-Created) ✅

### Create an Announcement

1. Open Supabase SQL Editor
2. Insert announcement:
```sql
INSERT INTO notifications (member_id, gym_id, notification_type, title, message, for_member)
VALUES 
  ('MEMBER_ID_HERE', 'GYM_ID_HERE', 'announcement', 'Test Announcement', 'This is a test announcement!', true);
```

3. Go to member page: `http://localhost:3000/member`
4. Click bell icon
5. Should see new announcement!

**What to verify:**
- [ ] Announcement appears in dropdown
- [ ] Title and message visible
- [ ] Can mark as read
- [ ] Matches what you inserted

---

## Phase 5: Test Scheduled Notifications (Manual) ✅

**These need cron eventually, but you can test the logic TODAY**

### Test Expiry Notifications

Find a member with membership expiring in 7 days:
```sql
SELECT id, member_name, membership_end_date FROM members 
WHERE gym_id = 'GYM_ID_HERE'
  AND membership_end_date = CURRENT_DATE + INTERVAL '7 days'
LIMIT 1;
```

Manually run the expiry processor:
```sql
SELECT process_expiry_notifications();
```

Check if notifications were created:
```sql
SELECT * FROM notifications 
WHERE notification_type = 'membership_expiry'
ORDER BY created_at DESC;
```

**What to verify:**
- [ ] Function runs without error
- [ ] Notifications created for eligible members
- [ ] No duplicates (run twice - should create same number)

---

### Test Inactivity Notifications

Find inactive members:
```sql
SELECT member_id, 
       ROUND(avg_visit_interval_days::numeric, 1) as avg_interval,
       ROUND((avg_visit_interval_days * 1.5)::numeric, 1) as threshold,
       DAYS_SINCE_LAST_VISIT as days_since_visit
FROM streaks
WHERE member_id IN (SELECT id FROM members WHERE gym_id = 'GYM_ID_HERE')
ORDER BY days_since_last_visit DESC
LIMIT 5;
```

Manually run the inactivity processor:
```sql
SELECT process_inactivity_notifications();
```

Check if notifications were created:
```sql
SELECT * FROM notifications 
WHERE notification_type = 'inactivity_nudge'
ORDER BY created_at DESC;
```

**What to verify:**
- [ ] Function runs without error
- [ ] Notifications created only for eligible members
- [ ] Message personalized with member name
- [ ] Respects anti-spam (no duplicates in 7 days)

---

## Phase 6: Verify Anti-Spam Rules ✅

### Test Daily Cap (Max 2/day per user)

```sql
-- Count how many notifications created for member in last 24 hours
SELECT COUNT(*) as notification_count
FROM notifications
WHERE member_id = 'MEMBER_ID_HERE'
  AND created_at > NOW() - INTERVAL '24 hours'
  AND for_member = true;
-- Should be ≤ 2
```

### Test Weekly Cap (Max 5/week per user)

```sql
SELECT COUNT(*) as notification_count
FROM notifications
WHERE member_id = 'MEMBER_ID_HERE'
  AND created_at > NOW() - INTERVAL '7 days'
  AND for_member = true;
-- Should be ≤ 5
```

### Test Type-Specific Cooldowns

```sql
-- Check inactivity nudge cooldown (7 days between nudges)
SELECT 
  created_at,
  LAG(created_at) OVER (ORDER BY created_at) as prev_nudge_time,
  EXTRACT(DAY FROM (created_at - LAG(created_at) OVER (ORDER BY created_at))) as days_between
FROM notifications
WHERE member_id = 'MEMBER_ID_HERE'
  AND notification_type = 'inactivity_nudge'
ORDER BY created_at DESC;
-- Should show ≥ 7 days between nudges
```

---

## 🎯 Success Criteria

After testing, you should have:

- [x] Database migration applied successfully
- [x] Settings toggles save/load
- [x] Bell icon visible and clickable
- [x] Can create and view notifications
- [x] Can mark notifications as read
- [x] Streak milestones work (real-time)
- [x] Announcements work (manual creation)
- [x] Expiry processor works (manual run)
- [x] Inactivity processor works (manual run)
- [x] Anti-spam rules enforced

---

## ⏭️ When to Add Cron

Once you've verified above, cron just AUTOMATES the manual testing:

**Without cron:**
- You manually run `SELECT process_expiry_notifications()`
- You manually run `SELECT process_inactivity_notifications()`

**With cron:**
- GitHub Actions runs those functions automatically every day at 9am UTC

Same logic, just automated! 

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| "Migration failed" | Check Supabase dashboard, look at migration logs |
| "Bell icon missing" | Restart `npm run dev` after migration |
| "Toggles don't save" | Check `member_notification_preferences` table exists |
| "No notifications appear" | Check database query - verify member_id is correct |
| "Can't run SQL functions" | Verify migration completed, check function syntax |

---

## 💡 What NOT to Test Yet

❌ GitHub Actions scheduling  
❌ Cron job execution  
❌ Automatic daily processing  
❌ Push notifications (Phase 2)  
❌ Email notifications (Phase 3)  

These come later!

---

## 📝 Testing Checklist

Print this or copy to a note:

```
SETUP
[ ] Migration applied
[ ] Dev server running

UI TESTS
[ ] Settings page toggles work
[ ] Bell icon visible
[ ] Bell opens dropdown
[ ] Can mark as read

STREAK MILESTONES (REAL-TIME)
[ ] Manually create test check-in
[ ] Update streak to 7
[ ] Notification created
[ ] Shows in bell
[ ] Can mark as read

ANNOUNCEMENTS
[ ] Manually create announcement
[ ] Shows in bell
[ ] Can mark as read

SCHEDULED (MANUAL ONLY)
[ ] Expiry processor runs
[ ] Inactivity processor runs
[ ] Anti-spam rules verified

READY FOR CRON
[ ] All above tests pass
[ ] Ready to automate with cron
```

---

## 🎉 Next Steps

1. **Apply migration**: `supabase db push`
2. **Start server**: `npm run dev`
3. **Run tests**: Follow phases above
4. **Celebrate**: Everything works!
5. **Later**: Add cron when ready (it's just automation of what you've tested)

---

**All of this works TODAY without cron. Test it and feel confident!**
