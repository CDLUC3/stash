#! /usr/bin/env ruby

lib = File.expand_path('../../lib', __FILE__)
$LOAD_PATH.unshift(lib) unless $LOAD_PATH.include?(lib)
Dir.glob("#{lib}/*.rb").sort.each(&method(:require))

include Publishers

# TODO: configure database (hard-code? symlink to dash2-config?)
# TODO: execute this
query = File.read("#{lib}/find_db_bad_publishers.sql")
