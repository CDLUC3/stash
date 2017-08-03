SELECT DISTINCT
  r.id         AS resource_id,
  p.publisher  AS db_publisher,
  u.first_name AS user_first_name,
  u.last_name  AS user_last_name,
  u.email      AS user_email,
  u.tenant_id  AS tenant_id
FROM
  stash_engine_resources r,
  stash_engine_identifiers i,
  stash_engine_users u,
  stash_engine_resource_states s,
  dcs_publishers p
WHERE
  i.identifier = ? AND
  r.identifier_id = i.id AND
  r.current_resource_state_id = s.id AND
  r.user_id = u.id AND
  s.resource_state = 'submitted' AND
  p.resource_id = r.id
