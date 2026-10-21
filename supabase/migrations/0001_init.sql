-- @spec DATA-14, AU-01, AU-02
-- Bảng lưu cài đặt và tiến độ theo tài khoản (QD-06). Chạy một lần trong Supabase: SQL Editor > New query > dán file này > Run.
-- Mỗi người chỉ đọc, ghi được dòng của mình (Row Level Security theo auth.uid()).
-- Tài khoản do Supabase Auth quản lý (bảng auth.users); app không lưu mật khẩu.

create table if not exists public.user_settings (
  user_id uuid primary key references auth.users (id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.user_progress (
  user_id uuid not null references auth.users (id) on delete cascade,
  pack text not null check (pack in ('global', 'fluency')),
  lang text not null check (lang ~ '^[a-z]{2,3}$'),
  data jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, pack, lang)
);

alter table public.user_settings enable row level security;
alter table public.user_progress enable row level security;

drop policy if exists "user_settings: chỉ chủ tài khoản" on public.user_settings;
create policy "user_settings: chỉ chủ tài khoản" on public.user_settings
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "user_progress: chỉ chủ tài khoản" on public.user_progress;
create policy "user_progress: chỉ chủ tài khoản" on public.user_progress
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- Khách chưa đăng nhập (vai anon) không có quyền gì trên hai bảng.
revoke all on public.user_settings from anon;
revoke all on public.user_progress from anon;
grant select, insert, update, delete on public.user_settings to authenticated;
grant select, insert, update, delete on public.user_progress to authenticated;
