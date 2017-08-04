#! /usr/bin/env ruby

Dir.glob(File.expand_path('../../lib/*.rb', __FILE__)).sort.each(&method(:require))

bad_to_good = Publishers::BAD_PUBLISHER_TENANT_IDS.keys.map do |bad|
  good = Publishers.good_publisher_for(bad)
  "'#{bad}' => '#{good}'"
end

puts bad_to_good.join(",\n")
