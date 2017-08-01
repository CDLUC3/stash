#! /usr/bin/env ruby

Dir.glob(File.expand_path('../../lib/*.rb', __FILE__)).sort.each(&method(:require))

# short_names = Publishers::TENANTS.values.map { |properties| properties[:short_name] }
# short_names_sql = short_names.map { |short_name| "'#{short_name}'" }.join(",\n")
# puts short_names_sql

puts Publishers::TENANTS.keys.join("\n")
