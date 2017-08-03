SELECT DISTINCT p.publisher
FROM
  dcs_publishers p
WHERE
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
ORDER BY
  p.publisher
