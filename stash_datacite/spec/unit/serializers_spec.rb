require 'spec_helper'
require 'pp'

# I have to do a bunch of shenanigans to get the stuff to load in order ot test
# require_relative '../../../stash_engine/app/serializers/stash_engine/serializer_mixin'

SERIAL_PATH = StashEngine::Engine.root.join('app/serializers/stash_engine')
$LOAD_PATH.unshift(SERIAL_PATH)
require 'serializer_mixin'

# define this class so I can mock it if it's not defined
unless defined?(Doorkeeper)
  module Doorkeeper
    class Application
    end
  end
end

# Sorry, I put the serializers for doing a DB serialization for migration into StashEngine, but the test is here.
# I didn't think through that the tests here have both engines, but StashEngine doesn't have Datacite metadata.
# I don't really want to move the serializer "models" around now and it's for a one time export on a codebase that will likely
# be thrown away in a couple months, so I don't have a lot of motivation to spend my time reorganizing for purity.
#
# I think this will do for now, even though it crosses engines and the scope isn't really quite right.
describe StashDatacite do
  describe 'Serialization' do
    before(:each) do
      allow(Doorkeeper::Application).to receive(:column_names).and_return(%w[id name uid secret redirect_uri scopes
                                                                             created_at updated_at owner_id owner_type confidential])
      allow(Doorkeeper::Application).to receive(:where).with(owner_id: 299).and_return([])
      Dir.glob("#{SERIAL_PATH}/*.rb").each(&method(:require))

      # load a sample file for fixure data for a rough test,
      # This is based on a real data record which was easier to export from our database intact that generate full factories
      # for a large number of models
      my_queries = File.read(StashDatacite::Engine.root.join('spec', 'fixtures', 'full_record_for_export.sql')).split("\n\n")
      my_queries.each do |q|
        next if q.start_with?('--')
        ActiveRecord::Base.connection.execute(q)
      end

      tenant = instance_double(Tenant)
      allow(Tenant).to receive(:find).with('ucop').and_return(tenant)
    end

    it 'serializes a full record' do
      my_id = StashEngine::Identifier.find(327)

      hash = StashEngine::StashIdentifierSerializer.new(my_id).hash
      expect_hash = JSON.parse(File.read(StashDatacite::Engine.root.join('spec', 'data', 'migration_output.json')))

      # everything but resources since it's a mega hash and easier to see errors when only small bits are compared instead of mega hash
      expect_hash.keys.reject! { |i| i == 'resources' }.each do |key|
        expect(hash[key].to_json).to eq(expect_hash[key].to_json)
      end

      expect_hash['resources'].each_with_index do |expect_resource, idx|
        expect_resource.keys.each do |key|
          expect(hash['resources'][idx][key].to_json).to eq(expect_resource[key].to_json)
        end
      end
    end
  end
end
