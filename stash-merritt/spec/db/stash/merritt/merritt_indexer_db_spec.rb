require 'db_spec_helper'
require 'ostruct'

module Stash
  module Merritt
    describe MerrittIndexer do
      attr_reader :resource
      attr_reader :indexer
      attr_reader :record

      before(:each) do
        user = StashEngine::User.create(
          uid: 'lmuckenhaupt-example@example.edu',
          first_name: 'Lisa',
          last_name: 'Muckenhaupt',
          email: 'lmuckenhaupt@example.edu',
          provider: 'developer',
          tenant_id: 'dataone'
        )

        repo_config = OpenStruct.new(
          domain: 'merritt.cdlib.org',
          endpoint: 'http://uc3-mrtsword-prd.cdlib.org:39001/mrtsword/collection/dataone_dash'
        )

        tenant = double(StashEngine::Tenant)
        allow(tenant).to receive(:tenant_id).and_return('dataone')
        allow(tenant).to receive(:short_name).and_return('DataONE')
        allow(tenant).to receive(:repository).and_return(repo_config)
        allow(StashEngine::Tenant).to receive(:find).with('dataone').and_return(tenant)

        stash_wrapper_xml = File.read('spec/data/archive/stash-wrapper.xml')
        stash_wrapper = Stash::Wrapper::StashWrapper.parse_xml(stash_wrapper_xml)

        datacite_xml = File.read('spec/data/archive/mrt-datacite.xml')
        dcs_resource = Datacite::Mapping::Resource.parse_xml(datacite_xml)

        @resource = StashDatacite::ResourceBuilder.new(
          user_id: user.id,
          dcs_resource: dcs_resource,
          stash_files: stash_wrapper.inventory.files,
          upload_date: stash_wrapper.version_date
        ).build
        resource.current_state = 'processing'

        expect(resource.download_uri).to be_nil
        expect(resource.update_uri).to be_nil

        env = ::Config::Factory::Environments.load_file('spec/data/stash-harvester.yml')[:test]
        config = Stash::Config.from_env(env)
        index_config = config.index_config
        metadata_mapper = instance_double(Stash::Indexer::MetadataMapper)
        allow(metadata_mapper).to receive(:to_index_document).and_return(nil)
        # allow(metadata_mapper).to receive(:respond_to?).with(:to_index_document).and_return(true)
        @indexer = index_config.create_indexer(metadata_mapper)

        @solr = instance_double(RSolr::Client)
        allow(@solr).to receive(:add)
        allow(@solr).to receive(:commit)

        allow(RSolr::Client).to receive(:new) do |_connection, options|
          @rsolr_options = options
          @solr
        end

        @record = instance_double(Stash::Harvester::HarvestedRecord)
        allow(record).to receive(:deleted?).and_return(false)
        allow(record).to receive(:as_wrapper).and_return(stash_wrapper)
        allow(record).to receive(:identifier).and_return('http://n2t.net/ark:/99999/fk43f5119b')
      end

      describe :index do
        describe 'success' do
          before(:each) do
            indexer.index([record])
          end

          it "sets the state to 'submitted'"
          it 'sets the update URI' do
            expected_uri = 'http://merritt.cdlib.org/d/ark%3A%2F99999%2Ffk43f5119b'
            expect(resource.download_uri).to eq(expected_uri)
          end
          it 'sets the download URI' do
            expected_uri = 'http://uc3-mrtsword-prd.cdlib.org:39001/mrtsword/collection/dataone_dash/doi%3A10.15146%2FR3RG6G'
            expect(resource.update_uri).to eq(expected_uri)
          end
          it 'writes a submission log entry'
        end
        describe 'failure' do
          it "sets the state to 'error'"
          it 'leaves the update URI null'
          it 'leaves the download URI null'
          it 'writes a submission log entry'
        end
      end

    end
  end
end
