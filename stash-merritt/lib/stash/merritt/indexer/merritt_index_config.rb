require 'stash/indexer'

module Stash
  module Merritt
    class MerrittIndexConfig < Stash::Indexer::Solr::SolrIndexConfig
      def create_indexer(metadata_mapper)
        MerrittIndexer.new(config: self, metadata_mapper: metadata_mapper)
      end
    end
  end
end
