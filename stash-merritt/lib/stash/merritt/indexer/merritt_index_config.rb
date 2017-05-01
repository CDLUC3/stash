require 'stash/indexer'

module Stash
  module Merritt
    class MerrittIndexConfig < Stash::Indexer::Solr::SolrIndexConfig

      adapter 'Merritt'

      attr_reader :db_config_path

      def initialize(db_config_path:, **opts)
        raise ArgumentError, 'No db_config_path specified' unless db_config_path
        @db_config_path = db_config_path
        super(opts)
      end

      def create_indexer(metadata_mapper)
        MerrittIndexer.new(config: self, metadata_mapper: metadata_mapper)
      end
    end
  end
end
