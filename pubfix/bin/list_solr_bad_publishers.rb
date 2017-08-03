#! /usr/bin/env ruby

require 'mysql2'
require 'rsolr'
require 'yaml'

lib = File.expand_path('../../lib', __FILE__)
$LOAD_PATH.unshift(lib) unless $LOAD_PATH.include?(lib)
Dir.glob("#{lib}/*.rb").sort.each(&method(:require))

solr = RSolr.connect(url: 'http://uc3-dash2solr-prd.cdlib.org:8983/solr/geoblacklight')
response = solr.get('select', params: {
  q: '*:*', fl: 'uuid,dc_publisher_s', rows: 500, sort: 'dc_publisher_s asc,uuid asc'
})
response_body = response['response']
solr_docs = response_body['docs']

config = File.expand_path('../../config', __FILE__)
db_config = YAML.load_file("#{config}/database.yml")['production']
client = Mysql2::Client.new(db_config)

query = File.read("#{lib}/stmt_find_db_record_for_doi.sql")
statement = client.prepare(query)

puts ['Resource ID', 'DOI', 'User Name', 'User Email', 'Tenant', 'Wrong', 'Right'].join("\t")
solr_docs.each do |doc|
  publisher = doc['dc_publisher_s']
  next if Publishers.is_current(publisher)
  good_publisher = Publishers.good_publisher_for(publisher)

  doi_value = doc['uuid'].sub(/^doi:/, '')
  result = statement.execute(doi_value)
  result.each do |row|
    resource_id = row['resource_id']
    user_name = "#{row['user_first_name']} #{row['user_last_name']}"
    user_email = row['user_email']
    tenant_id = row['tenant_id']

    puts(
      [
        resource_id,
        doi_value,
        user_name,
        user_email,
        tenant_id,
        publisher,
        good_publisher
      ].join("\t")
    )
  end
end
