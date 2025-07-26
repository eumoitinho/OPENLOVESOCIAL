create table public.users (
  id uuid not null default extensions.uuid_generate_v4 (),
  email character varying(255) not null,
  username character varying(50) not null,
  name character varying(100) not null,
  bio text null,
  avatar_url text null,
  cover_url text null,
  location character varying(100) null,
  age integer null,
  gender character varying(20) null,
  interests text[] null,
  relationship_status character varying(50) null,
  looking_for text[] null,
  is_premium boolean null default false,
  premium_expires_at timestamp without time zone null,
  is_verified boolean null default false,
  is_active boolean null default true,
  last_seen timestamp without time zone null default now(),
  created_at timestamp without time zone null default now(),
  updated_at timestamp without time zone null default now(),
  privacy_settings jsonb null default '{"show_age": true, "show_location": true, "allow_messages": "everyone", "profile_visibility": "public", "show_online_status": true}'::jsonb,
  stats jsonb null default '{"posts": 0, "earnings": 0, "followers": 0, "following": 0, "profile_views": 0, "likes_received": 0, "comments_received": 0}'::jsonb,
  plano character varying(20) null default 'free'::character varying,
  mp_customer_id text null,
  mp_subscription_id text null,
  status_assinatura character varying(20) null default 'inactive'::character varying,
  ultimo_pagamento timestamp without time zone null,
  proximo_pagamento timestamp without time zone null,
  birth_date date null,
  first_name character varying(100) null,
  last_name character varying(100) null,
  profile_type character varying(20) null default 'single'::character varying,
  seeking text[] null,
  other_interest text null,
  uf character varying(2) null,
  latitude numeric(10, 8) null,
  longitude numeric(11, 8) null,
  partner jsonb null,
  constraint users_pkey primary key (id),
  constraint users_email_key unique (email),
  constraint users_username_key unique (username),
  constraint check_status_assinatura check (
    (
      (status_assinatura)::text = any (
        (
          array[
            'inactive'::character varying,
            'pending'::character varying,
            'authorized'::character varying,
            'cancelled'::character varying,
            'suspended'::character varying,
            'active'::character varying
          ]
        )::text[]
      )
    )
  ),
  constraint check_plano check (
    (
      (plano)::text = any (
        (
          array[
            'free'::character varying,
            'gold'::character varying,
            'diamante'::character varying,
            'diamante_anual'::character varying
          ]
        )::text[]
      )
    )
  ),
  constraint users_plano_check check (
    (
      (plano)::text = any (
        (
          array[
            'free'::character varying,
            'gold'::character varying,
            'diamante'::character varying,
            'diamante_anual'::character varying
          ]
        )::text[]
      )
    )
  ),
  constraint users_status_assinatura_check check (
    (
      (status_assinatura)::text = any (
        (
          array[
            'inactive'::character varying,
            'pending'::character varying,
            'authorized'::character varying,
            'cancelled'::character varying,
            'suspended'::character varying
          ]
        )::text[]
      )
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_users_plano on public.users using btree (plano) TABLESPACE pg_default;

create index IF not exists idx_users_mp_customer_id on public.users using btree (mp_customer_id) TABLESPACE pg_default;

create index IF not exists idx_users_mp_subscription_id on public.users using btree (mp_subscription_id) TABLESPACE pg_default;

create index IF not exists idx_users_status_assinatura on public.users using btree (status_assinatura) TABLESPACE pg_default;

create index IF not exists idx_users_birth_date on public.users using btree (birth_date) TABLESPACE pg_default;

create index IF not exists idx_users_profile_type on public.users using btree (profile_type) TABLESPACE pg_default;

create index IF not exists idx_users_username on public.users using btree (username) TABLESPACE pg_default;

create index IF not exists idx_users_email on public.users using btree (email) TABLESPACE pg_default;

create index IF not exists idx_users_location on public.users using btree (location) TABLESPACE pg_default;

create index IF not exists idx_users_is_premium on public.users using btree (is_premium) TABLESPACE pg_default;

create index IF not exists idx_users_last_seen on public.users using btree (last_seen) TABLESPACE pg_default;

create trigger update_users_updated_at BEFORE
update on users for EACH row
execute FUNCTION update_updated_at_column ();