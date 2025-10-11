-- Fix Schema Migration
-- Add missing columns to tasks table and enable security
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/ozltdxdpehsmtjkiknzu

-- Step 1: Add missing time columns to tasks table
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS start_time TIME;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS end_time TIME;

-- Step 2: Enable Row Level Security
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE focus_sessions ENABLE ROW LEVEL SECURITY;

-- Step 3: Create RLS policies for tasks table
DROP POLICY IF EXISTS "Users can view their own tasks" ON tasks;
CREATE POLICY "Users can view their own tasks"
    ON tasks FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own tasks" ON tasks;
CREATE POLICY "Users can insert their own tasks"
    ON tasks FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own tasks" ON tasks;
CREATE POLICY "Users can update their own tasks"
    ON tasks FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own tasks" ON tasks;
CREATE POLICY "Users can delete their own tasks"
    ON tasks FOR DELETE
    USING (auth.uid() = user_id);

-- Step 4: Create RLS policies for focus_sessions table
DROP POLICY IF EXISTS "Users can view their own focus sessions" ON focus_sessions;
CREATE POLICY "Users can view their own focus sessions"
    ON focus_sessions FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own focus sessions" ON focus_sessions;
CREATE POLICY "Users can insert their own focus sessions"
    ON focus_sessions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own focus sessions" ON focus_sessions;
CREATE POLICY "Users can update their own focus sessions"
    ON focus_sessions FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own focus sessions" ON focus_sessions;
CREATE POLICY "Users can delete their own focus sessions"
    ON focus_sessions FOR DELETE
    USING (auth.uid() = user_id);

-- Step 5: Verify the update_actual_time function exists
CREATE OR REPLACE FUNCTION update_actual_time(
    task_id_param UUID,
    duration_param INT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE tasks
    SET actual_time = actual_time + duration_param
    WHERE id = task_id_param;
END;
$$;

-- Step 6: Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS tasks_user_id_idx ON tasks(user_id);
CREATE INDEX IF NOT EXISTS tasks_task_date_idx ON tasks(task_date);
CREATE INDEX IF NOT EXISTS focus_sessions_user_id_idx ON focus_sessions(user_id);
CREATE INDEX IF NOT EXISTS focus_sessions_task_id_idx ON focus_sessions(task_id);
CREATE INDEX IF NOT EXISTS focus_sessions_start_time_idx ON focus_sessions(start_time);
