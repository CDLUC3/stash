SELECT DISTINCT
       r.id,
       i.identifier,
       p.publisher
  FROM stash_engine_resources r,
       stash_engine_identifiers i,
       stash_engine_resource_states s,
       dcs_publishers p
 WHERE r.identifier_id = i.id AND
       r.current_resource_state_id = s.id AND
       s.resource_state = 'submitted' AND
       p.resource_id = r.id AND
       p.publisher NOT IN (
         'DataONE'
         'LBNL'
         'UC Berkeley'
         'UC Davis'
         'UC Irvine'
         'UC Los Angeles'
         'UC Merced'
         'UC Office of the President'
         'UC Riverside'
         'UC Santa Barbara'
         'UC Santa Cruz'
         'UC San Francisco'
       )
ORDER BY 1
