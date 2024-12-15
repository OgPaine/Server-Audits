
# Server Audits

A web application for managing server submissions, ratings, and user authentication.

## Features
- Server submissions and rating system.
- Admin panel for managing server data.
- User authentication with Supabase.
- Responsive design built with Tailwind CSS.

---

## Getting Started

### Prerequisites

1. [Node.js](https://nodejs.org/) (v16 or higher)
2. [Git](https://git-scm.com/)
3. [Supabase Account](https://supabase.com/)
4. [Vercel Account](https://vercel.com/)

### 1. Fork the Repository

1. Click the **Fork** button on the top-right of this repository.
2. Clone your fork:
   ```bash
   git clone https://github.com/your-username/Server-Audits.git
   cd Server-Audits
   ```

### 2. Set Up Supabase

1. Log in to [Supabase](https://supabase.com/) and create a new project.
2. Go to the **Project Settings** > **API** section.
3. Copy your **Supabase URL** and **Anon Key**.

### 3. Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
2. Open the `.env` file and replace the placeholders with your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

### 4. Install Dependencies

Run the following command to install project dependencies:
```bash
npm install
```

### 5. Run the Development Server

Start the development server:
```bash
npm run dev
```

The app should now be running at `http://localhost:3000`.

---

## Deploy to Vercel

### 1. Import Project on Vercel

1. Go to [Vercel](https://vercel.com/) and click **New Project**.
2. Import your forked repository.

### 2. Set Environment Variables on Vercel

1. After the project is imported, go to the **Settings** > **Environment Variables**.
2. Add the following environment variables:
   - `VITE_SUPABASE_URL` with your Supabase URL.
   - `VITE_SUPABASE_ANON_KEY` with your Supabase Anon Key.

### 3. Deploy

Click **Deploy**. Once deployed, your app will be live on your Vercel domain.

---

## Contributing

Feel free to submit issues or pull requests for improvements. Contributions are welcome!

---

## Database Schema and Policies

### Table: public.server_submissions
Copy and paste the script below into the SQL Editor to create the table.

```sql
CREATE TABLE public.server_submissions (
    created_at timestamp with time zone NULL DEFAULT timezone('cst'::text, now()),
    server_type text NOT NULL,
    description text NOT NULL,
    name text NOT NULL,
    server_ip text NOT NULL,
    website text NULL,
    discord text NULL,
    content_warning text NOT NULL,
    rating text NULL,
    notes text NULL DEFAULT ''::text,
    reviewed_at timestamp with time zone NULL,
    rank text NULL DEFAULT 'Unranked'::text,
    id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
    uid uuid NULL,
    CONSTRAINT server_submissions_pkey PRIMARY KEY (id),
    CONSTRAINT server_submissions_id_key UNIQUE (id),
    CONSTRAINT server_submissions_contentwarning_check CHECK (
        content_warning = ANY (ARRAY['Yes'::text, 'No'::text])
    ),
    CONSTRAINT server_submissions_server_type_check CHECK (
        server_type = ANY (ARRAY['Vanilla'::text, 'Modded'::text])
    )
) TABLESPACE pg_default;
```

# Supabase Setup for Server Submissions

This guide explains how to set up your Supabase environment for the `server_submissions` table, including creating the necessary policies.

## SQL Script for Policies

### Step 1: Open SQL Editor
1. Log in to your Supabase project.
2. Navigate to the **SQL Editor** in the left-hand menu.

### Step 2: Run the Following Script

Copy and paste the script below into the SQL Editor to create the policies if they don't already exist.

```sql
-- Check and create "Select all submissions" policy
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_policies
        WHERE polname = 'Select all submissions' AND tablename = 'server_submissions'
    ) THEN
        CREATE POLICY "Select all submissions"
        ON "public"."server_submissions"
        TO public
        USING (auth.uid() IS NOT NULL);
    END IF;
END $$;

-- Check and create "Enable read access for all users" policy
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_policies
        WHERE polname = 'Enable read access for all users' AND tablename = 'server_submissions'
    ) THEN
        CREATE POLICY "Enable read access for all users"
        ON "public"."server_submissions"
        TO public
        USING (true);
    END IF;
END $$;

-- Check and create "Delete submissions" policy
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_policies
        WHERE polname = 'Delete submissions' AND tablename = 'server_submissions'
    ) THEN
        CREATE POLICY "Delete submissions"
        ON "public"."server_submissions"
        TO public
        USING (auth.uid() IS NOT NULL);
    END IF;
END $$;

-- Check and create "Allow public inserts" policy
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_policies
        WHERE polname = 'Allow public inserts' AND tablename = 'server_submissions'
    ) THEN
        CREATE POLICY "Allow public inserts"
        ON "public"."server_submissions"
        TO public
        WITH CHECK (true);
    END IF;
END $$;

-- Check and create "Allow authenticated users to update ratings and notes" policy
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_policies
        WHERE polname = 'Allow authenticated users to update ratings and notes' AND tablename = 'server_submissions'
    ) THEN
        CREATE POLICY "Allow authenticated users to update ratings and notes"
        ON "public"."server_submissions"
        TO public
        USING (auth.role() = 'authenticated')
        WITH CHECK (
            auth.role() = 'authenticated'
            AND EXISTS (
                SELECT 1
                FROM jsonb_object_keys(current_setting('request.jwt.claims')::jsonb) AS k(k)
                WHERE k.k = 'role'
            )
        );
    END IF;
END $$;
```

### Step 3: Execute the Script
Click **Run** to execute the script and set up the necessary policies.
