-- Enable UUID extensions
create extension if not exists "uuid-ossp";

-- 1. Languages Table
create table public.languages (
    id text primary key, -- e.g. 'en', 'es', 'fr'
    name text not null,
    flag_emoji text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Profiles Table (linked to Supabase Auth)
create table public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    email text,
    display_name text,
    avatar_url text,
    role text default 'user'::text check (role in ('user', 'admin')),
    streak integer default 0 not null,
    last_practice_date date,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Categories Table (Language Islands)
create table public.categories (
    id uuid primary key default gen_random_uuid(),
    language_id text references public.languages(id) on delete cascade not null,
    name text not null,
    description text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Phrases Table
create table public.phrases (
    id uuid primary key default gen_random_uuid(),
    language_id text references public.languages(id) on delete cascade not null,
    category_id uuid references public.categories(id) on delete cascade not null,
    text text not null, -- The phrase in the target language (e.g. English)
    translation text not null, -- The translation in native language (e.g. Portuguese)
    explanation text, -- Grammatical/cultural explanation
    difficulty text default 'medium'::text check (difficulty in ('easy', 'medium', 'hard')),
    audio_url text, -- Supabase Storage URL
    voice_name text default 'Fenrir'::text, -- Gemini prebuilt voice
    speed numeric default 1.0 not null,
    is_published boolean default true not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Collections (Curated lists)
create table public.collections (
    id uuid primary key default gen_random_uuid(),
    language_id text references public.languages(id) on delete cascade not null,
    name text not null,
    description text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. Phrase Collections (Junction table)
create table public.phrase_collections (
    phrase_id uuid references public.phrases(id) on delete cascade not null,
    collection_id uuid references public.collections(id) on delete cascade not null,
    primary key (phrase_id, collection_id)
);

-- 7. Study Sessions
create table public.study_sessions (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references public.profiles(id) on delete cascade not null,
    language_id text references public.languages(id) on delete cascade not null,
    started_at timestamp with time zone default timezone('utc'::text, now()) not null,
    completed_at timestamp with time zone,
    duration_seconds integer default 0 not null,
    phrases_count integer default 0 not null
);

-- 8. User Responses (Individual practice trials)
create table public.user_responses (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references public.profiles(id) on delete cascade not null,
    phrase_id uuid references public.phrases(id) on delete cascade not null,
    session_id uuid references public.study_sessions(id) on delete set null,
    difficulty_rating text not null check (difficulty_rating in ('easy', 'medium', 'hard')),
    is_correct boolean default true not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 9. Review Items (Spaced Repetition SM2 Parameters)
create table public.review_items (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references public.profiles(id) on delete cascade not null,
    phrase_id uuid references public.phrases(id) on delete cascade not null,
    ease_factor numeric default 2.5 not null, -- SM2 ease factor (starts at 2.5)
    interval_days integer default 0 not null, -- Interval in days before next review
    repetitions integer default 0 not null, -- Number of consecutive correct reviews
    next_review_date timestamp with time zone default timezone('utc'::text, now()) not null,
    last_reviewed_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(user_id, phrase_id)
);

-- 10. Favorites
create table public.favorites (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references public.profiles(id) on delete cascade not null,
    phrase_id uuid references public.phrases(id) on delete cascade not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(user_id, phrase_id)
);

-- 11. Daily Goals
create table public.daily_goals (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references public.profiles(id) on delete cascade not null,
    target_phrases integer default 10 not null,
    date date default current_date not null,
    completed_phrases integer default 0 not null,
    unique(user_id, date)
);

-- 12. Audio Generation Queue
create table public.audio_generation_queue (
    id uuid primary key default gen_random_uuid(),
    phrase_id uuid references public.phrases(id) on delete cascade not null,
    text text not null,
    voice_name text not null,
    speed numeric default 1.0 not null,
    status text default 'pending'::text check (status in ('pending', 'processing', 'completed', 'failed')),
    error_log text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 13. User Preferences
create table public.user_preferences (
    user_id uuid primary key references public.profiles(id) on delete cascade,
    target_language text default 'en'::text,
    daily_target integer default 10 not null,
    audio_auto_play boolean default true not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Policies Setup
alter table public.languages enable row level security;
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.phrases enable row level security;
alter table public.collections enable row level security;
alter table public.phrase_collections enable row level security;
alter table public.study_sessions enable row level security;
alter table public.user_responses enable row level security;
alter table public.review_items enable row level security;
alter table public.favorites enable row level security;
alter table public.daily_goals enable row level security;
alter table public.audio_generation_queue enable row level security;
alter table public.user_preferences enable row level security;

-- Catalog tables read-only for public/authenticated
create policy "Languages are visible to everyone" on public.languages for select using (true);
create policy "Categories are visible to everyone" on public.categories for select using (true);
create policy "Phrases are visible to everyone" on public.phrases for select using (true);
create policy "Collections are visible to everyone" on public.collections for select using (true);
create policy "Phrase Collections are visible to everyone" on public.phrase_collections for select using (true);

-- Admin modification access
create policy "Admins can modify catalog languages" on public.languages for all using (
    exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'admin')
);
create policy "Admins can modify catalog categories" on public.categories for all using (
    exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'admin')
);
create policy "Admins can modify catalog phrases" on public.phrases for all using (
    exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'admin')
);
create policy "Admins can modify collections" on public.collections for all using (
    exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'admin')
);
create policy "Admins can modify phrase collections" on public.phrase_collections for all using (
    exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'admin')
);
create policy "Admins can view and edit audio queue" on public.audio_generation_queue for all using (
    exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'admin')
);

-- User personal tables access
create policy "Users can view and edit own profiles" on public.profiles for all using (auth.uid() = id);
create policy "Users can view and edit own preferences" on public.user_preferences for all using (auth.uid() = user_id);
create policy "Users can view and edit own study_sessions" on public.study_sessions for all using (auth.uid() = user_id);
create policy "Users can view and edit own responses" on public.user_responses for all using (auth.uid() = user_id);
create policy "Users can view and edit own review items" on public.review_items for all using (auth.uid() = user_id);
create policy "Users can view and edit own favorites" on public.favorites for all using (auth.uid() = user_id);
create policy "Users can view and edit own daily goals" on public.daily_goals for all using (auth.uid() = user_id);

-- Triggers for User Profile creation on SignUp
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, display_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    case when new.email = 'admin@hyperlingua.app' then 'admin' else 'user' end
  );
  
  insert into public.user_preferences (user_id, target_language, daily_target, audio_auto_play)
  values (new.id, 'en', 10, true);

  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Trigger for Queue Update timestamp
create or replace function public.update_queue_timestamp()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

create trigger update_queue_timestamp_trigger
    before update on public.audio_generation_queue
    for each row execute procedure public.update_queue_timestamp();

-- SEED DATA
-- Insert Languages
insert into public.languages (id, name, flag_emoji) values
('en', 'Inglês', '🇺🇸'),
('es', 'Espanhol', '🇪🇸');

-- Insert Initial Categories (Language Islands)
insert into public.categories (id, language_id, name, description) values
('c8f13e77-9dfc-4b55-a0bc-23bbcfc7e091', 'en', 'Conversa de Família', 'Frases comuns sobre parentes, família e relações cotidianas.'),
('c8f13e77-9dfc-4b55-a0bc-23bbcfc7e092', 'en', 'Viagem & Direções', 'Frases essenciais para aeroportos, hotéis e trânsito.'),
('c8f13e77-9dfc-4b55-a0bc-23bbcfc7e093', 'en', 'Cotidiano & Ações', 'Verbos e expressões fundamentais para o dia a dia.'),
('c8f13e77-9dfc-4b55-a0bc-23bbcfc7e094', 'es', 'Familia y Hogar', 'Frases cotidianas en español sobre familia y relaciones.');

-- Insert Seed Phrases
insert into public.phrases (id, language_id, category_id, text, translation, explanation, difficulty, voice_name, speed) values
('p1f13e77-9dfc-4b55-a0bc-23bbcfc7e001', 'en', 'c8f13e77-9dfc-4b55-a0bc-23bbcfc7e091', 'My mother said nothing.', 'Minha mãe não disse nada.', 'A palavra "said" é o passado de "say" (dizer). Em inglês, a dupla negação é evitada: usamos "said nothing" ao invés de "não disse nada".', 'easy', 'Aoede', 1.0),
('p1f13e77-9dfc-4b55-a0bc-23bbcfc7e002', 'en', 'c8f13e77-9dfc-4b55-a0bc-23bbcfc7e091', 'My father told me that you might be leaving.', 'Meu pai me disse que você poderia ir embora.', 'O verbo "told" (passado de tell) é usado diretamente com o pronome ("told me"). "Might" expressa uma possibilidade ou probabilidade.', 'medium', 'Fenrir', 1.0),
('p1f13e77-9dfc-4b55-a0bc-23bbcfc7e003', 'en', 'c8f13e77-9dfc-4b55-a0bc-23bbcfc7e091', 'But we are brother and sister.', 'Mas nós somos irmão e irmã.', 'Em inglês, omitimos frequentemente o artigo ("a brother and a sister") nesta construção comum.', 'easy', 'Kore', 1.0),
('p1f13e77-9dfc-4b55-a0bc-23bbcfc7e004', 'en', 'c8f13e77-9dfc-4b55-a0bc-23bbcfc7e091', 'Got my third job with my family.', 'Consegui meu terceiro emprego com a minha família.', '"Got" é uma forma informal muito comum para expressar obter/conseguir algo. "Third" significa terceiro.', 'medium', 'Puck', 1.0),
('p1f13e77-9dfc-4b55-a0bc-23bbcfc7e005', 'en', 'c8f13e77-9dfc-4b55-a0bc-23bbcfc7e091', 'My wife and I were not so lucky.', 'Minha esposa e eu não tivemos tanta sorte.', 'Gramaticalmente correto é dizer "My wife and I" e não "Me and my wife" quando age como sujeito. "Were" é o passado de are/to be.', 'hard', 'Fenrir', 1.0),
('p1f13e77-9dfc-4b55-a0bc-23bbcfc7e006', 'en', 'c8f13e77-9dfc-4b55-a0bc-23bbcfc7e092', 'Excuse me, is this the way to the airport?', 'Com licença, este é o caminho para o aeroporto?', '"Excuse me" é a forma educada de iniciar perguntas. "Way" significa caminho ou direção.', 'easy', 'Aoede', 1.0),
('p1f13e77-9dfc-4b55-a0bc-23bbcfc7e007', 'en', 'c8f13e77-9dfc-4b55-a0bc-23bbcfc7e092', 'Where can I claim my luggage?', 'Onde posso retirar minha bagagem?', '"Luggage" significa bagagem e "claim" significa reivindicar/retirar.', 'medium', 'Kore', 1.0),
('p1f13e77-9dfc-4b55-a0bc-23bbcfc7e008', 'es', 'c8f13e77-9dfc-4b55-a0bc-23bbcfc7e094', 'Mi madre me dijo que viniera temprano.', 'Minha mãe me disse para vir cedo.', '"Dijo" es el pasado de decir en tercera persona. "Viniera" es subjuntivo de venir.', 'medium', 'Fenrir', 1.0);

-- Insert those initial phrases into the audio generation queue so the worker can generate them if a key is supplied!
insert into public.audio_generation_queue (phrase_id, text, voice_name, speed, status) values
('p1f13e77-9dfc-4b55-a0bc-23bbcfc7e001', 'My mother said nothing.', 'Aoede', 1.0, 'pending'),
('p1f13e77-9dfc-4b55-a0bc-23bbcfc7e002', 'My father told me that you might be leaving.', 'Fenrir', 1.0, 'pending'),
('p1f13e77-9dfc-4b55-a0bc-23bbcfc7e003', 'But we are brother and sister.', 'Kore', 1.0, 'pending'),
('p1f13e77-9dfc-4b55-a0bc-23bbcfc7e004', 'Got my third job with my family.', 'Puck', 1.0, 'pending'),
('p1f13e77-9dfc-4b55-a0bc-23bbcfc7e005', 'My wife and I were not so lucky.', 'Fenrir', 1.0, 'pending'),
('p1f13e77-9dfc-4b55-a0bc-23bbcfc7e006', 'Excuse me, is this the way to the airport?', 'Aoede', 1.0, 'pending'),
('p1f13e77-9dfc-4b55-a0bc-23bbcfc7e007', 'Where can I claim my luggage?', 'Kore', 1.0, 'pending'),
('p1f13e77-9dfc-4b55-a0bc-23bbcfc7e008', 'Mi madre me dijo que viniera temprano.', 'Fenrir', 1.0, 'pending');
