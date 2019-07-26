module StashEngine
  class AuthorSerializer
    include SerializerMixin

    REJECT_COLUMNS = %w[id resource_id].freeze
    COLUMNS = (StashEngine::Author.column_names - REJECT_COLUMNS).freeze

    def hash
      super.merge(affiliations: @my_model.affiliations.map{|i| AffiliationSerializer.new(i).hash})
    end

  end
end