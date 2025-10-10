-- Study Coach Database Schema
-- Run this SQL in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    est_time INT NOT NULL, -- Estimated time in minutes
    actual_time INT DEFAULT 0, -- Actual focus time in minutes
    task_date DATE NOT NULL,
    is_done BOOLEAN DEFAULT FALSE,
    start_time TIME, -- Start time for the task block
    end_time TIME, -- End time for the task block
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Focus sessions table
CREATE TABLE IF NOT EXISTS focus_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE NOT NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    duration INT NOT NULL, -- Duration in minutes
    distractions JSONB, -- Array of distraction events
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS tasks_user_id_idx ON tasks(user_id);
CREATE INDEX IF NOT EXISTS tasks_task_date_idx ON tasks(task_date);
CREATE INDEX IF NOT EXISTS focus_sessions_user_id_idx ON focus_sessions(user_id);
CREATE INDEX IF NOT EXISTS focus_sessions_task_id_idx ON focus_sessions(task_id);
CREATE INDEX IF NOT EXISTS focus_sessions_start_time_idx ON focus_sessions(start_time);

-- Function to update actual_time when a focus session is completed
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

-- Row Level Security (RLS) Policies
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE focus_sessions ENABLE ROW LEVEL SECURITY;

-- Tasks policies
CREATE POLICY "Users can view their own tasks"
    ON tasks FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tasks"
    ON tasks FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tasks"
    ON tasks FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tasks"
    ON tasks FOR DELETE
    USING (auth.uid() = user_id);

-- Focus sessions policies
CREATE POLICY "Users can view their own focus sessions"
    ON focus_sessions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own focus sessions"
    ON focus_sessions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own focus sessions"
    ON focus_sessions FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own focus sessions"
    ON focus_sessions FOR DELETE
    USING (auth.uid() = user_id);
