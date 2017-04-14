require 'spec_helper'
require 'ostruct'

module Stash
  module Merritt
    describe EzidHelper do
      attr_reader :resource_id
      attr_reader :resource
      attr_reader :identifier_str
      attr_reader :landing_page_url
      attr_reader :helper
      attr_reader :url_helpers
      attr_reader :tenant

      before(:each) do
        @resource_id = 17
        @resource = double(StashEngine::Resource)
        allow(StashEngine::Resource).to receive(:find).with(resource_id).and_return(resource)

        @identifier_str = 'doi:10.15146/R38675309'
        @url_helpers = double(Module)

        path_to_landing = "/stash/#{identifier_str}"
        @landing_page_url = URI::HTTPS.build(host: 'stash.example.edu', path: path_to_landing).to_s
        allow(url_helpers).to receive(:show_path).with(identifier_str).and_return(path_to_landing)

        @tenant = double(StashEngine::Tenant)
        id_params = {
          shoulder: 'doi:10.15146/R3',
          owner: 'stash_admin',
          account: 'stash',
          password: '3cc9d3fbd9788148c6a32a1415fa673a',
          id_scheme: 'doi'
        }
        allow(tenant).to receive(:identifier_service).and_return(OpenStruct.new(id_params))
        allow(tenant).to receive(:tenant_id).and_return('dataone')
        allow(tenant).to receive(:landing_url).with(path_to_landing).and_return(landing_page_url)
        allow(resource).to receive(:tenant).and_return(tenant)

        @helper = EzidHelper.new(resource: resource)
      end

      describe :mint_id do
        it 'mints a new identifier' do
          identifier = instance_double(::Ezid::MintIdentifierResponse)
          allow(identifier).to receive(:id).and_return(identifier_str)

          ezid_client = instance_double(::Ezid::Client)
          allow(::Ezid::Client).to receive(:new)
            .with(user: 'stash', password: '3cc9d3fbd9788148c6a32a1415fa673a')
            .and_return(ezid_client)

          expect(ezid_client).to receive(:mint_identifier)
            .with('doi:10.15146/R3', status: 'reserved', profile: 'datacite')
            .and_return(identifier)

          expect(helper.mint_id).to eq(identifier_str)
        end
      end

      describe :update_metadata do
        it 'updates the metadata and landing page' do
          dc3_xml = '<resource/>'

          ezid_client = instance_double(::Ezid::Client)
          allow(::Ezid::Client).to receive(:new)
            .with(user: 'stash', password: '3cc9d3fbd9788148c6a32a1415fa673a')
            .and_return(ezid_client)

          expect(ezid_client).to receive(:modify_identifier).with(
            identifier_str,
            datacite: dc3_xml,
            target: landing_page_url,
            status: 'public',
            owner: 'stash_admin'
          )

          expect(resource).to receive(:identifier_str).and_return(identifier_str)
          helper.update_metadata(dc3_xml: dc3_xml, landing_page_url: landing_page_url)
        end
      end
    end
  end
end