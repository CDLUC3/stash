require 'pp'
require 'byebug'
require 'json'
# rubocop:disable Metrics/BlockLength
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
    ActiveRecord::Base.establish_connection('production') # we only need to migrate from production env
    # test = [63, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 97, 98,
    #        99, 100, 101, 102, 103, 115, 116, 275, 299, 275, 327, 326, 326, 327, 359, 399]
    test = [327]

    test.each do |t|
      my_id = StashEngine::Identifier.find(t)
      hash = StashEngine::StashIdentifierSerializer.new(my_id).hash
      pp(hash)
    end
    # puts(hash.to_json)
  end

  desc 'Output file for identifiers'
  task output_ids: :environment do
    SKIP_IDENTIFIERS = [119, 123, 124, 137, 586, 601].freeze
    TEST_TENANTS = %w[dataone ucop ucpress]
    ActiveRecord::Base.establish_connection('production') # we only need to migrate from production env
    out_array = []
    StashEngine::Identifier.joins(:resources).distinct.each_with_index do |my_ident, counter|
      puts "#{counter}  #{my_ident}"
      next if SKIP_IDENTIFIERS.include?(my_ident.id)

      # the following is for testing in development, comment out for all
      # next unless TEST_TENANTS.include?(my_ident.resources.last.tenant_id)

      out_array.push(StashEngine::StashIdentifierSerializer.new(my_ident).hash)
    end
    File.open('identifiers.json', 'w') do |f|
      f.write(out_array.to_json)
    end
  end

  desc 'Output file for resources without identifiers'
  task output_resources: :environment do
    TEST_TENANTS = %w[dataone ucop ucpress]

    ActiveRecord::Base.establish_connection('production') # we only need to migrate from production env
    out_array = []
    StashEngine::Resource.where(identifier_id: nil).each_with_index do |my_res, counter|
      # the following is for testing in development, comment out for all
      # next unless TEST_TENANTS.include?(my_res.tenant_id)

      puts "#{counter + 1}  resource_id: #{my_res.id}"
      out_array.push(StashEngine::ResourceSerializer.new(my_res).hash)
    end
    File.open('resources.json', 'w') do |f|
      f.write(out_array.to_json)
    end
  end
end
# rubocop:enable Metrics/BlockLength
