require 'pp'
require 'byebug'
namespace :dash2_migration do

  # some good stash_engine_identifiers to look at
  # 63, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 97, 98,
  # 99, 100, 101, 102, 103, 115, 116, 275, 299, 275, 327, 326, 326, 327, 359, 399

  # some good resource ids to test out in production
  # 111, 501, 503, 70, 107, 110, 123, 80, 106, 105, 108, 109, 79, 95, 92, 93, 81, 97, 98, 86, 88, 758,
  # 94, 102, 89, 99, 494, 85, 101, 91, 96, 87, 90, 100, 124, 82, 83, 84, 590, 445, 519, 444, 448

  desc 'Test output do'
  task test: :environment do
    # see https://stackoverflow.com/questions/27913457/ruby-on-rails-specify-environment-in-rake-task
    ActiveRecord::Base.establish_connection('production')  # we only need to migrate from production env

    options = {}
    options[:include] = [:resources]

    my_id = StashEngine::Identifier.find(327)
    hash = StashEngine::StashIdentifierSerializer.new(my_id, options).serializable_hash
    pp(hash)
  end
end

