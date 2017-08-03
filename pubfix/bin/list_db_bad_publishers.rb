#! /usr/bin/env ruby

require 'yaml'
require 'mysql2'

lib = File.expand_path('../../lib', __FILE__)
$LOAD_PATH.unshift(lib) unless $LOAD_PATH.include?(lib)
Dir.glob("#{lib}/*.rb").sort.each(&method(:require))

config = File.expand_path('../../config', __FILE__)
db_config = YAML.load_file("#{config}/database.yml")['production']
client = Mysql2::Client.new(db_config)

puts ['Resource ID', 'DOI', 'User Name', 'User Email', 'Tenant', 'Wrong', 'Right'].join("\t")
query = File.read("#{lib}/find_db_bad_publishers.sql")
result = client.query(query)
result.each do |row|
  bad_publisher = row['bad_publisher']
  good_publisher = Publishers.good_publisher_for(bad_publisher)
  next unless good_publisher

  doi_value = row['doi_value']

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
      bad_publisher,
      good_publisher
    ].join("\t")
  )
end
