module StashEngine
  class AlternateIdentifierSerializer
    include SerializerMixin

    REJECT_COLUMNS = %w[id resource_id].freeze
    COLUMNS = (StashDatacite::AlternateIdentifier.column_names - REJECT_COLUMNS).freeze

  end
end
