require 'rest-client'
require 'json'
require 'cgi'

module Stash
  module EventData
    class Citations
      include Stash::EventData

      attr_reader :doi
      # This first domain worked earlier this week though with intermittant 500 errors
      # DOMAIN = 'https://query.eventdata.crossref.org'.freeze

      # This domain they say is what I should use, but it returns blank strings and no json
      BASE_URL = 'https://api.eventdata.crossref.org/v1/events'.freeze
      EMAIL = 'scott.fisher@ucop.edu'.freeze
      # only keep these relations from these sources, based on https://support.datacite.org/v1.1/docs/eventdata-query-api-guide
      # DATACITE_INCLUDE = %w[is_cited_by is_supplement_to is_referenced_by is_compiled_by is_source_of is_required_by].freeze
      # CROSSREF_INCLUDE = %w[cites is_supplemented_by compiles requires references].freeze
      EXCLUDE_LIST = %w[has_version is_version_of is_new_version_of is_previous_version_of is_identical_to].freeze

      def initialize(doi:)
        @doi = doi
        @doi = doi[4..-1] if doi.downcase.start_with?('doi:')
        @base_url = BASE_URL
        @email = EMAIL
      end

      def results
        # put the results into hash by keys, values so we can merge them and eliminate duplicate keys
        datacite_results = datacite_query.map { |x| [x['obj_id'], x] }.to_h
        crossref_results = crossref_query.map { |x| [x['subj_id'], x] }.to_h
        # this merge should overwrite duplicate DOI keys, preferring datacite over crossref and convert back to array
        crossref_results.merge(datacite_results).values
      end

      # response.code == 200
      # response.headers -- includes :content_type=>"application/json;charset=UTF-8"

      # can test with '10.5061/dryad.n81g1'
      # to get the actual citation link you'd use obj_id
      def datacite_query
        generic_query(params: { source: 'datacite', 'subj-id': @doi })['message']['events']
          .reject { |item| EXCLUDE_LIST.include?(item['relation_type_id']) }
      rescue RestClient::ExceptionWithResponse => err
        logger.error("#{Time.new} Could not get response from CrossRef for DataCite event data source:datacite,subj-id:#{@doi}")
        logger.error("#{Time.new} #{err}")
        []
      end

      # can test with '10.13140/RG.2.1.1350.3122'
      # to get the actual citation link for this DOI you'd use subj_id doi
      def crossref_query
        generic_query(params: { source: 'crossref', 'obj-id': @doi })['message']['events']
          .reject { |item| EXCLUDE_LIST.include?(item['relation_type_id']) }
      rescue RestClient::ExceptionWithResponse => err
        logger.error("#{Time.new} Could not get response from CrossRef for CrossRef event data source:crossref,obj-id:#{@doi}")
        logger.error("#{Time.new} #{err}")
        []
      end
    end
  end
end
