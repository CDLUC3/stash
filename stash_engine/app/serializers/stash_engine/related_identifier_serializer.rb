module StashEngine
  class RelatedIdentifierSerializer
    include SerializerMixin

    REJECT_COLUMNS = %w[id resource_id].freeze
    COLUMNS = (StashDatacite::RelatedIdentifier.column_names - REJECT_COLUMNS).freeze

  end
end
