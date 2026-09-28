-- Reviews go through this function so "verified" reflects a real (non-cancelled) order.
drop policy if exists "own reviews write" on public.reviews;
drop policy if exists "own reviews update" on public.reviews;

create or replace function public.submit_review(p_product int, p_rating int, p_title text, p_body text)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid();
  v_name text;
  v_verified boolean;
  v_id uuid;
begin
  if v_uid is null then raise exception 'not signed in'; end if;
  select coalesce(nullif(full_name, ''), 'Amazon.clone Customer') into v_name from profiles where id = v_uid;
  select exists (
    select 1 from order_items i join orders o on o.id = i.order_id
    where o.user_id = v_uid and o.status <> 'cancelled' and i.product_id = p_product
  ) into v_verified;
  insert into reviews (product_id, user_id, author_name, rating, title, body, verified)
  values (p_product, v_uid, coalesce(v_name, 'Amazon.clone Customer'), p_rating, trim(p_title), trim(p_body), v_verified)
  on conflict (product_id, user_id) do update
    set rating = excluded.rating, title = excluded.title, body = excluded.body,
        verified = excluded.verified, created_at = now()
  returning id into v_id;
  return v_id;
end $$;
revoke all on function public.submit_review(int, int, text, text) from public, anon;
grant execute on function public.submit_review(int, int, text, text) to authenticated;
