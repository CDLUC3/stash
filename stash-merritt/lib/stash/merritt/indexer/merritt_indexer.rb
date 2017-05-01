require 'stash/indexer'
require 'stash/harvester'

require 'mysql2/client'

module Stash
  module Merritt
    class MerrittIndexer < Stash::Indexer::Solr::SolrIndexer
      ARK_PATTERN = %r{ark:/[a-z0-9]+/[a-z0-9]+}

      IDENTIFIER_ID_SQL = <<-SQL
        SELECT id
          FROM stash_engine_identifiers
         WHERE identifier = ?
      SQL

      # RESOURCE_UPDATE_SQL = <<-SQL
      #   UPDATE stash_engine_resources
      #      SET download_uri = ?,
      #          update_uri = ?
      #    WHERE
      # SQL

      def index(_harvested_records)
        db_client = create_db_client
        begin
          # TODO handle errors in this step
          identifier_id_query = db_client.prepare("SELECT id FROM stash_engine_identifiers WHERE identifier = ?")
          resource_id_query = db_client.prepare("")
          super do |result|
            # TODO handle errors in this step
            record = result.record
            doi = doi_for(record)
            ark = ark_for(record)

            identifier_id_query.execute(doi).each do |row| # should only be one, but let's be thorough
              identifier_id = row['id']

              # TODO: identify 'processing' resource state
              # TODO: identify tenant
              # TODO: use tenant to construct URIs
              # TODO: get resource from resource state
              # TODO: update resource with URIs
              # TODO: update resource state
            end


            yield result if block_given?
          end
        ensure
          db_client.close
        end
      end

      def db_config_path
        config.db_config_path
      end

      private

      def db_config
        @db_config ||= begin
          env = ENV['RAILS_ENV']
          raise 'RAILS_ENV not set' unless env
          YAML.load_file(db_config_path)[env]
        end
      end

      def create_db_client
        Mysql2::Client.new(db_config)
      end

      def doi_for(record)
        wrapper = record.as_wrapper
        ident = wrapper.identifier
        raise "Identifier #{ident ? ident.write_xml : 'nil'} is not a DOI" unless ident && ident.type == Stash::Wrapper::IdentifierType::DOI
        raise "No value for identifier #{ident.write_xml}" unless ident.value
        ident.value
      end

      def ark_for(record)
        identifier = record.identifier
        ark_match_data = identifier && identifier.match(ARK_PATTERN)
        raise "no ARK found in record with identifier #{identifier || 'nil'}" unless ark_match_data
        ark_match_data[0].strip
      end
    end
  end
end
