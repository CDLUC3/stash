#! /usr/bin/env ruby

Dir.glob(File.expand_path('../../lib/*.rb', __FILE__)).sort.each(&method(:require))

include Publishers

require 'rsolr'

solr = RSolr.connect(url: 'http://uc3-dash2solr-prd.cdlib.org:8983/solr/geoblacklight')
response = solr.get('select', params: { q: '*:*', fl:'uuid,dc_publisher_s', rows: 500 })
response_body = response['response']
docs = response_body['docs']
publishers_by_doi = docs.map { |doc| [doc['uuid'], doc['dc_publisher_s']] }.to_h
to_fix = publishers_by_doi.select { |_, pub| !CURRENT.include?(pub) }

# to_fix.each { |k, v| puts "#{k}\t#{v}" }

puts to_fix.keys.map { |doi| "           '#{doi.sub(/^doi:/, '')}'" }.join(",\n")
